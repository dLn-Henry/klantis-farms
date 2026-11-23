import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: p } = await supabase.from("profiles").select("first_name, last_name, phone").eq("id", user!.id).maybeSingle();
  return (
    <section className="bg-white border border-border rounded-md p-6">
      <h2 className="text-lg font-extrabold mb-1">Your details</h2>
      <p className="text-sm text-ink-soft mb-6">We use these for your orders and deliveries.</p>
      <ProfileForm email={user?.email ?? ""} firstName={p?.first_name ?? ""} lastName={p?.last_name ?? ""} phone={p?.phone ?? ""} />
    </section>
  );
}
