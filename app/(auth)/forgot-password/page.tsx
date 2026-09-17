import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset Password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Reset your password</h1>
      <ForgotPasswordForm />
    </>
  );
}
