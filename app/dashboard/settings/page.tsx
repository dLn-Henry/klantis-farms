import type { Metadata } from "next";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <DashboardTopbar title="Settings" />

      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold">Farm Settings</h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Everything here feeds the public website directly — the same content shown in the top bar, footer and contact page.
          </p>
        </div>

        <SettingsForm />
      </div>
    </>
  );
}
