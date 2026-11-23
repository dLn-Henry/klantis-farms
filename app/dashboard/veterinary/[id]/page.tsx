import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { VetReportReview } from "@/components/dashboard/VetReportReview";
import { getVetReportById } from "@/lib/data/repositories/vet-reports";
import { getVetReportFiles } from "@/lib/data/repositories/vet-portal";
import { VetAttachmentsPanel } from "@/components/dashboard/VetAttachmentsPanel";
import { getAccess, can } from "@/lib/auth/access";
import { createClient } from "@/lib/supabase/server";

type Props = { params: { id: string }; searchParams?: { files?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = await getVetReportById(params.id);
  return { title: report?.code ?? "Veterinary Report" };
}

export default async function VetReportDetailPage({ params, searchParams }: Props) {
  const [report, files, access] = await Promise.all([getVetReportById(params.id), getVetReportFiles(params.id), getAccess()]);
  if (!report) return notFound();
  const { data: { user } } = await createClient().auth.getUser();
  const currentUserId = user?.id;

  return (
    <>
      <DashboardTopbar title="Veterinary" />

      <div className="p-6 lg:p-8 max-w-[760px]">
        <Link href="/dashboard/veterinary" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Veterinary Reports
        </Link>

        <VetReportReview report={report} canReview={can(access, "veterinary.review") && report.submittedById !== currentUserId} />
        {files && (
          <VetAttachmentsPanel
            items={files.items}
            farmId={files.farmId}
            reportId={report.id}
            canAdd={files.canAdd}
            canRemove={files.canAdd || can(access, "veterinary.review")}
            partialUpload={searchParams?.files === "partial"}
          />
        )}
      </div>
    </>
  );
}
