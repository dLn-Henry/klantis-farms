import type { Metadata } from "next";
import { PasswordForm } from "@/components/account/PasswordForm";

export const metadata: Metadata = { title: "Password & security" };

export default function SecurityPage() {
  return (
    <section className="bg-white border border-border rounded-md p-6">
      <h2 className="text-lg font-extrabold mb-1">Password &amp; security</h2>
      <p className="text-sm text-ink-soft mb-6">Choose a strong password you don&apos;t use anywhere else.</p>
      <PasswordForm />
    </section>
  );
}
