import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Access } from "@/lib/auth/access";

// Landing page for roles that don't get the farm-wide overview (Farm Worker,
// Accountant, Agronomist, ...): only their own tasks and the sections their
// roles include. No farm-wide statistics.
const SECTIONS = [
  { perm: "livestock.view", label: "Livestock", href: "/dashboard/livestock" },
  { perm: "crops.view", label: "Crops", href: "/dashboard/crops" },
  { perm: "fields.view", label: "Fields", href: "/dashboard/fields" },
  { perm: "harvests.view", label: "Harvests", href: "/dashboard/harvests" },
  { perm: "inventory.view", label: "Inventory", href: "/dashboard/inventory" },
  { perm: "equipment.view", label: "Equipment", href: "/dashboard/equipment" },
  { perm: "suppliers.view", label: "Suppliers", href: "/dashboard/suppliers" },
  { perm: "products.view", label: "Products", href: "/dashboard/products" },
  { perm: "orders.view", label: "Orders", href: "/dashboard/orders" },
  { perm: "customers.view", label: "Customers", href: "/dashboard/customers" },
  { perm: "finance.view", label: "Finance", href: "/dashboard/finance" },
];

export async function RoleHome({ name, access }: { name: string; access: Access }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: tasks } = user
    ? await supabase.from("tasks").select("id, title, status, due_date, priority")
        .eq("assigned_to", user.id).neq("status", "Completed").neq("status", "Cancelled")
        .order("due_date", { ascending: true, nullsFirst: false }).limit(8)
    : { data: [] };
  const links = SECTIONS.filter((s) => access.permissions.includes(s.perm));

  return (
    <>
      <DashboardTopbar title="Dashboard" />
      <div className="p-6 lg:p-8 max-w-[900px]">
        <h2 className="text-xl font-extrabold tracking-tight">Hello, {name}.</h2>
        <p className="text-sm text-ink-soft mt-1 mb-7">{access.roles.join(" · ") || "No role assigned"}</p>

        <section className="mb-8">
          <h3 className="text-sm font-extrabold uppercase tracking-wide mb-3">Your tasks</h3>
          {(tasks ?? []).length === 0 ? (
            <p className="text-sm text-ink-soft bg-white border border-border rounded-md p-5">You&apos;re all caught up. Nothing is assigned to you.</p>
          ) : (
            <ul className="bg-white border border-border rounded-md divide-y divide-border">
              {tasks!.map((t) => (
                <li key={t.id}>
                  <Link href={`/dashboard/tasks/${t.id}`} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-surface">
                    <span><b className="text-sm">{t.title}</b>{t.due_date && <span className="text-xs text-ink-soft"> · due {new Date(t.due_date).toLocaleDateString("en-GB")}</span>}</span>
                    <StatusBadge status={t.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {links.length > 0 && (
          <section>
            <h3 className="text-sm font-extrabold uppercase tracking-wide mb-3">Your sections</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="bg-white border border-border rounded-md px-4 py-3.5 flex items-center justify-between text-sm font-bold hover:border-green">
                  {l.label} <ArrowRight size={15} className="stroke-ink-soft" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
