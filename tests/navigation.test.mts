// Run: npx tsx tests/navigation.test.mts
import fs from "node:fs";
import path from "node:path";
const nav = await import("../lib/navigation");
const root = path.resolve(import.meta.dirname, "..");
let fails = 0;
const t = (n: string, ok: boolean, extra = "") => { console.log(ok ? "PASS" : "FAIL", n, ok ? "" : extra); if (!ok) fails++; };

// ---- permission keys that exist in the database catalogue (migrations) ----
const sql = ["0018_roles_permissions.sql", "0019_strict_role_boundaries.sql"]
  .map((f) => fs.readFileSync(path.join(root, "supabase/migrations", f), "utf8")).join("\n");
const catalogue = new Set(Array.from(sql.matchAll(/\('([a-z_]+\.[a-z_]+)',\s*'[a-z_]+',\s*'[a-z_]+',/g)).map((m) => m[1]));
t("catalogue parsed", catalogue.size > 70, String(catalogue.size));

const permsUsed = new Set<string>();
for (const i of nav.ALL_ITEMS) if (i.perm) (typeof i.perm === "string" ? [i.perm] : i.perm).forEach((p) => permsUsed.add(p));
nav.QUICK_ACTIONS.forEach((a) => permsUsed.add(a.perm));
const unknown = [...permsUsed].filter((p) => !catalogue.has(p));
t("every permission used in navigation exists in the database catalogue", unknown.length === 0, unknown.join(", "));

// ---- every LIVE page and quick-create page exists on disk ----
const pageExists = (href: string) => fs.existsSync(path.join(root, "app", href.replace(/^\//, ""), "page.tsx"));
const missing = nav.ALL_ITEMS.filter((i) => i.status === "live" && !pageExists(i.href)).map((i) => i.href);
t("every live nav item has a page", missing.length === 0, missing.join(", "));
const missingQ = nav.QUICK_ACTIONS.filter((a) => !pageExists(a.href)).map((a) => a.href);
t("every quick-create action has a page", missingQ.length === 0, missingQ.join(", "));
const plannedBuilt = nav.ALL_ITEMS.filter((i) => i.status === "planned" && pageExists(i.href)).map((i) => i.href);
t("no 'planned' item already has a page (mark it live)", plannedBuilt.length === 0, plannedBuilt.join(", "));

// ---- structure ----
t("exactly the nine approved groups, in order", JSON.stringify(nav.GROUP_TITLES) === JSON.stringify([
  "Overview", "Farm Operations", "Resources & Procurement", "Workforce & Planning", "Sales & Commerce",
  "Finance", "Insights & Traceability", "Website & Content", "Administration"]), nav.GROUP_TITLES.join("|"));
t("hrefs are unique", new Set(nav.ALL_ITEMS.map((i) => i.href)).size === nav.ALL_ITEMS.length);
t("group titles satisfy the database's name rule", nav.GROUP_TITLES.every((g) => /^[A-Za-z &]{1,40}$/.test(g)));
t("every href satisfies the database's favourite rule", nav.ALL_ITEMS.every((i) => /^\/dashboard(\/[a-z0-9-]+){0,3}$/.test(i.href)));

// ---- role-aware visibility, using the real role matrix from migration 0019 ----
const m19 = fs.readFileSync(path.join(root, "supabase/migrations/0019_strict_role_boundaries.sql"), "utf8");
const grants = new Map<string, Set<string>>();
for (const m of m19.matchAll(/\('([A-Za-z ]+)',\s*'([a-z_]+\.[a-z_]+)'\)/g)) {
  if (!grants.has(m[1])) grants.set(m[1], new Set());
  grants.get(m[1])!.add(m[2]);
}
const all = new Set(catalogue);
const labels = (role: string, planned = false) => {
  const perms = role === "Farm Owner" ? all : grants.get(role)!;
  return nav.visibleGroups(perms, planned).flatMap((g) => g.items.map((i) => i.label));
};
t("owner sees every live item", nav.ALL_ITEMS.filter((i) => i.status === "live").every((i) => labels("Farm Owner").includes(i.label)));
const vet = labels("Veterinarian");
t("vet sees ONLY Dashboard, Notifications, Veterinary, Tasks", JSON.stringify(vet) === JSON.stringify(["Dashboard", "Notifications", "Veterinary", "Tasks"]), vet.join(", "));
const worker = labels("Farm Worker");
t("worker: no finance, media, settings, users", !["Finance", "Media", "Settings", "Users", "Audit Log"].some((x) => worker.includes(x)), worker.join(", "));
t("worker sees Livestock, Crops, Tasks", ["Livestock", "Crops", "Tasks"].every((x) => worker.includes(x)));
const acct = labels("Accountant");
t("accountant sees Finance + Reports, not Inventory/Media/Livestock", acct.includes("Finance") && acct.includes("Reports") && !["Inventory", "Media", "Livestock"].some((x) => acct.includes(x)), acct.join(", "));
const aud = labels("Auditor");
t("auditor: no Media, no Settings, but Audit Log", !aud.includes("Media") && !aud.includes("Settings") && aud.includes("Audit Log"), aud.join(", "));
t("only Owner/Manager see Media", ["Farm Owner", "Farm Manager"].every((r) => labels(r).includes("Media")) &&
  ["Veterinarian", "Farm Worker", "Accountant", "Agronomist", "Equipment Officer", "Procurement Officer", "Inventory Officer", "Sales Manager", "Auditor"].every((r) => !labels(r).includes("Media")));
t("planned items hidden when 'show coming soon' is off", labels("Farm Owner", false).every((l) => !["Calendar", "Biosecurity", "Documents"].includes(l)));
t("planned items shown when on (owner)", ["Calendar", "Biosecurity", "Documents", "Approvals"].every((l) => labels("Farm Owner", true).includes(l)));
const vetP = labels("Veterinarian", true);
t("vet doesn't get finance-ish planned items", !vetP.includes("Planning & Forecasting") && !vetP.includes("Documents") && !vetP.includes("Procurement"), vetP.join(", "));
t("a person with no permissions sees only Dashboard + Notifications", JSON.stringify(nav.visibleGroups(new Set(), false).flatMap((g) => g.items.map((i) => i.label))) === JSON.stringify(["Dashboard", "Notifications"]));

// ---- active page matching ----
t("longest match wins", nav.itemForPath("/dashboard/veterinary/animals/abc")?.href === "/dashboard/veterinary");
t("/dashboard only matches exactly", nav.itemForPath("/dashboard")?.href === "/dashboard" && nav.itemForPath("/dashboard/nope")?.href === undefined);
t("planned routes never count as active", nav.itemForPath("/dashboard/calendar") === undefined);

// ---- quick actions by role ----
const qa = (role: string) => nav.QUICK_ACTIONS.filter((a) => (role === "Farm Owner" ? all : grants.get(role)!).has(a.perm)).map((a) => a.label);
t("vet's quick-create is only 'Submit vet report'", JSON.stringify(qa("Veterinarian")) === JSON.stringify(["Submit vet report"]), qa("Veterinarian").join(", "));
t("auditor has no quick-create actions", qa("Auditor").length === 0);
t("only the Owner can 'Add team member'", qa("Farm Owner").includes("Add team member") && !qa("Farm Manager").includes("Add team member"));
process.exitCode = fails ? 1 : 0;
