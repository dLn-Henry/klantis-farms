"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentFarmId } from "@/lib/data/current-farm";
import { friendlyDbError } from "@/lib/actions/errors";

export type CreateSupplierResult = { success: false; error: string };

export async function createSupplier(formData: FormData): Promise<CreateSupplierResult> {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const contactPerson = String(formData.get("contactPerson") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const paymentTerms = String(formData.get("paymentTerms") ?? "").trim();

  if (!name) return { success: false, error: "Enter the supplier's name." };

  const supabase = createClient();
  const farmId = await getCurrentFarmId();
  if (!farmId) return { success: false, error: "You're not a member of a farm yet." };

  const { data: code, error: codeError } = await supabase.rpc("next_farm_code", {
    p_farm_id: farmId,
    p_prefix: "SUP",
  });
  if (codeError || !code) return { success: false, error: codeError?.message ?? "Could not generate a supplier number." };

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      farm_id: farmId,
      code,
      name,
      category: category || null,
      contact_person: contactPerson || null,
      phone: phone || null,
      email: email || null,
      payment_terms: paymentTerms || null,
      status: "Active",
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error ? friendlyDbError(error) : "Could not add the supplier." };

  revalidatePath("/dashboard/suppliers");
  redirect(`/dashboard/suppliers/${data.id}`);
}
