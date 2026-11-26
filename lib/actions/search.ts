"use server";

import { createClient } from "@/lib/supabase/server";
import { getAccess, canAny } from "@/lib/auth/access";

export type SearchHit = { group: string; title: string; subtitle: string; href: string };

type Spec = {
  group: string;
  perm: string[];
  table: string;
  select: string;
  /** Columns matched with ILIKE (each is its own query: no filter-string building). */
  fields: string[];
  title: (r: Record<string, string | null>) => string;
  subtitle: (r: Record<string, string | null>) => string;
  href: (r: Record<string, string | null>) => string;
};

const s = (v: string | null | undefined) => v ?? "";

// What can be searched, and who may. The permission list only decides whether
// to bother asking; WHAT comes back is decided by row-level security, so a vet
// finds only their assigned animals and a worker only their own tasks.
const SPECS: Spec[] = [
  { group: "Animals", perm: ["livestock.view", "livestock.view_assigned"], table: "animals", select: "id, tag, status", fields: ["tag"],
    title: (r) => s(r.tag), subtitle: (r) => s(r.status), href: (r) => `/dashboard/livestock/${r.id}` },
  { group: "Crop cycles", perm: ["crops.view"], table: "crop_cycles", select: "id, code, variety, status", fields: ["code", "variety"],
    title: (r) => s(r.code), subtitle: (r) => [r.variety, r.status].filter(Boolean).join(" · "), href: (r) => `/dashboard/crops/${r.id}` },
  { group: "Fields", perm: ["fields.view"], table: "fields", select: "id, code, name", fields: ["name", "code"],
    title: (r) => s(r.name), subtitle: (r) => s(r.code), href: (r) => `/dashboard/fields/${r.id}` },
  { group: "Harvests", perm: ["harvests.view"], table: "harvests", select: "id, code, status", fields: ["code"],
    title: (r) => s(r.code), subtitle: (r) => s(r.status), href: (r) => `/dashboard/harvests/${r.id}` },
  { group: "Inventory", perm: ["inventory.view"], table: "inventory_items", select: "id, name, sku", fields: ["name", "sku"],
    title: (r) => s(r.name), subtitle: (r) => s(r.sku), href: (r) => `/dashboard/inventory/${r.id}` },
  { group: "Equipment", perm: ["equipment.view"], table: "equipment", select: "id, name, code", fields: ["name", "code"],
    title: (r) => s(r.name), subtitle: (r) => s(r.code), href: (r) => `/dashboard/equipment/${r.id}` },
  { group: "Suppliers", perm: ["suppliers.view"], table: "suppliers", select: "id, name, code", fields: ["name", "code"],
    title: (r) => s(r.name), subtitle: (r) => s(r.code), href: (r) => `/dashboard/suppliers/${r.id}` },
  { group: "Customers", perm: ["customers.view"], table: "customers", select: "id, name, email", fields: ["name", "email"],
    title: (r) => s(r.name), subtitle: (r) => s(r.email), href: (r) => `/dashboard/customers/${r.id}` },
  { group: "Orders", perm: ["orders.view"], table: "orders", select: "id, order_number, status", fields: ["order_number"],
    title: (r) => s(r.order_number), subtitle: (r) => s(r.status), href: (r) => `/dashboard/orders/${r.id}` },
  { group: "Products", perm: ["products.view"], table: "products", select: "id, name, sku", fields: ["name", "sku"],
    title: (r) => s(r.name), subtitle: (r) => s(r.sku), href: (r) => `/dashboard/products/${r.id}` },
  { group: "Tasks", perm: ["tasks.view", "tasks.view_own"], table: "tasks", select: "id, title, status", fields: ["title"],
    title: (r) => s(r.title), subtitle: (r) => s(r.status), href: (r) => `/dashboard/tasks/${r.id}` },
  { group: "Vet reports", perm: ["veterinary.view", "veterinary.create"], table: "veterinary_reports", select: "id, code, status", fields: ["code"],
    title: (r) => s(r.code), subtitle: (r) => s(r.status), href: (r) => `/dashboard/veterinary/${r.id}` },
  { group: "Blog posts", perm: ["content.view"], table: "blog_posts", select: "slug, title, status", fields: ["title"],
    title: (r) => s(r.title), subtitle: (r) => s(r.status), href: (r) => `/dashboard/blog/${r.slug}` },
];

const PER_TABLE = 4;
const MAX_TOTAL = 24;

// ILIKE treats % and _ as wildcards and \ as the escape character: neutralise
// them so a person searching "50%" finds "50%", not everything.
function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
}

export async function searchRecords(raw: string): Promise<SearchHit[]> {
  const q = raw.trim().slice(0, 60);
  if (q.length < 2) return [];

  const access = await getAccess();
  if (!access.farmId) return [];

  // Vets don't have the Livestock module: send animal hits to their own
  // animal-health page instead of one they can't open.
  const vetOnly = !access.permissions.includes("livestock.view");
  const pattern = likePattern(q);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as unknown as { from: (t: string) => any };

  const queries = SPECS.filter((sp) => canAny(access, sp.perm)).flatMap((sp) =>
    sp.fields.map(async (field) => {
      try {
        const { data } = await supabase.from(sp.table).select(sp.select).ilike(field, pattern).limit(PER_TABLE);
        return ((data ?? []) as Record<string, string | null>[]).map<SearchHit & { key: string }>((r) => ({
          key: `${sp.table}:${r.id ?? r.slug}`,
          group: sp.group,
          title: sp.title(r),
          subtitle: sp.subtitle(r),
          href: sp.table === "animals" && vetOnly ? `/dashboard/veterinary/animals/${r.id}` : sp.href(r),
        }));
      } catch {
        return [];
      }
    }),
  );

  const seen = new Set<string>();
  const hits: SearchHit[] = [];
  for (const batch of await Promise.all(queries)) {
    for (const { key, ...hit } of batch) {
      if (seen.has(key) || !hit.title) continue;
      seen.add(key);
      hits.push(hit);
      if (hits.length >= MAX_TOTAL) return hits;
    }
  }
  return hits;
}
