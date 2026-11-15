import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";

// Shown instead of a module the person's roles don't include. Clearer than an
// empty table (which is what the database would otherwise return).
export function NoAccess({ section, roles }: { section: string; roles: string[] }) {
  return (
    <>
      <DashboardTopbar title={section} />
      <div className="p-6 lg:p-8">
        <div className="max-w-[520px] bg-white border border-border rounded-md p-8 text-center mx-auto mt-6">
          <span className="w-12 h-12 rounded-full bg-mist flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={22} className="stroke-green" />
          </span>
          <h2 className="text-lg font-extrabold mb-1.5">You don&apos;t have access to {section}</h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            {roles.length > 0
              ? <>Your role{roles.length > 1 ? "s" : ""} (<b>{roles.join(", ")}</b>) {roles.length > 1 ? "don't" : "doesn't"} include this part of the farm. A Farm Owner can change your roles if you need it.</>
              : <>You aren&apos;t assigned to a farm yet, or your access is suspended. Ask a Farm Owner to add you.</>}
          </p>
          <Link href="/dashboard" className="btn-outline inline-flex mt-5">Back to dashboard</Link>
        </div>
      </div>
    </>
  );
}
