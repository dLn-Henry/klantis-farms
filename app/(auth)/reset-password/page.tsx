import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Set New Password" };

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Set a New Password</h1>
      <ResetPasswordForm />
    </>
  );
}
