import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Create your account</h1>
      <p className="text-sm text-ink-soft mb-7">Order from Klantis Farms, or manage the farm itself.</p>
      <RegisterForm />
    </>
  );
}
