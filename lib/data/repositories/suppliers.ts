import { createClient } from "@/lib/supabase/server";
import type { Supplier, SupplierCategory, SupplierStatus } from "@/lib/data/mock/suppliers";

const COLUMNS = "id, code, name, contact_person, phone, email, category, payment_terms, status";

function mapRow(r: {
  id: string; code: string; name: string; contact_person: string | null; phone: string | null;
  email: string | null; category: string | null; payment_terms: string | null; status: string;
}, recentPurchases: Supplier["recentPurchases"] = []): Supplier {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    contactPerson: r.contact_person ?? "",
    phone: r.phone ?? "",
    email: r.email ?? "",
    category: (r.category ?? "Feed") as SupplierCategory,
    paymentTerms: r.payment_terms ?? "",
    status: r.status as SupplierStatus,
    recentPurchases,
  };
}

export async function getAllSuppliers(): Promise<Supplier[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("suppliers").select(COLUMNS).order("name");
  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r));
}

export async function getSupplierById(id: string): Promise<Supplier | undefined> {
  const supabase = createClient();
  const [{ data, error }, { data: purchases }] = await Promise.all([
    supabase.from("suppliers").select(COLUMNS).eq("id", id).single(),
    supabase
      .from("supplier_purchases")
      .select("purchase_date, item, amount")
      .eq("supplier_id", id)
      .order("purchase_date", { ascending: false })
      .limit(10),
  ]);
  if (error || !data) return undefined;
  return mapRow(
    data,
    (purchases ?? []).map((p) => ({ date: p.purchase_date, item: p.item, amount: p.amount }))
  );
}
