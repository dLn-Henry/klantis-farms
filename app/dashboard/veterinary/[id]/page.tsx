import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { VetReportReview } from "@/components/dashboard/VetReportReview";
import { getAllVetReports, getVetReportById } from "@/lib/data/repositories/vet-reports";

type Props = { params: { id: string } };

export async function generateStaticParams() {
  const reports = await getAllVetReports();
  return reports.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = await getVetReportById(params.id);
  return { title: report?.code ?? "Veterinary Report" };
}

export default async function VetReportDetailPage({ params }: Props) {
  const report = await getVetReportById(params.id);
  if (!report) return notFound();

  return (
    <>
      <DashboardTopbar title="Veterinary" />

      <div className="p-6 lg:p-8 max-w-[760px]">
        <Link href="/dashboard/veterinary" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Veterinary Reports
        </Link>

        <VetReportReview report={report} />
      </div>
    </>
  );
}
