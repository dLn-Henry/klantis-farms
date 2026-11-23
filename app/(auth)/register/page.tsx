import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Create your account</h1>
      <p className="text-sm text-ink-soft mb-7">Shop from the farm, track your orders and manage your details. Farm staff are added by their farm's owner, so you don't need to register for that.</p>
      <RegisterForm />
    </>
  );
}
