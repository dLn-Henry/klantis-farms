import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Welcome back</h1>
      <p className="text-sm text-ink-soft mb-7">Log in to manage your farm or your orders.</p>
      <LoginForm />
    </>
  );
}
