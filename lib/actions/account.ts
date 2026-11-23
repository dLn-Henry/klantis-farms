"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AccountResult = { success: true } | { success: false; error: string };

// Customers edit only their own profile row (RLS: "Users can update their own
// profile"); nothing here can touch anyone else's.
export async function updateProfile(formData: FormData): Promise<AccountResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in." };

  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 80);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 80);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 30);
  if (!firstName) return { success: false, error: "Enter your first name." };
  if (phone && !/^[0-9+()\-\s]{7,30}$/.test(phone)) return { success: false, error: "That phone number doesn't look right." };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName || null,
      display_name: `${firstName} ${lastName}`.trim(),
      phone: phone || null,
    })
    .eq("id", user.id);
  if (error) return { success: false, error: "Could not save your details. Please try again." };

  revalidatePath("/account", "layout");
  return { success: true };
}
