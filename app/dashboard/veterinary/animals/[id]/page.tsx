import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAnimalHealth } from "@/lib/data/repositories/vet-portal";

export const metadata: Metadata = { title: "Animal health" };

// A deliberately narrow view: what a vet needs to examine the animal -- not the
// farm's full livestock record. Row-level security returns nothing for an
// animal that isn't assigned to the signed-in vet.
export default async function AnimalHealthPage({ params }: { params: { id: string } }) {
  const a = await getAnimalHealth(params.id);
  if (!a) return notFound();

  const facts: [string, string][] = [
    ["Species", a.species || "—"], ["Breed", a.breed || "—"], ["Sex", a.sex], ["Age", a.ageLabel],
    ["Weight", a.weight], ["Location", a.location],
  ];

  return (
    <>
      <DashboardTopbar title="Veterinary" />
      <div className="p-6 lg:p-8 max-w-[760px]">
        <Link href="/dashboard/veterinary" className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-green mb-5">
          <ChevronLeft size={14} /> Back to Veterinary
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-xl font-extrabold">{a.tag}</h2>
          <div className="flex items-center gap-3"><StatusBadge status={a.status} />
            <Link href={`/dashboard/veterinary/new?animal=${a.id}`} className="btn-solid">Write report</Link></div>
        </div>

        <dl className="bg-white border border-border rounded-md grid sm:grid-cols-3 gap-px bg-border overflow-hidden mb-6">
          {facts.map(([k, v]) => (
            <div key={k} className="bg-white px-4 py-3"><dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">{k}</dt><dd className="text-sm font-semibold mt-0.5">{v}</dd></div>
          ))}
        </dl>

        <h3 className="text-sm font-extrabold uppercase tracking-wide mb-3">Health history</h3>
        {a.events.length === 0 ? (
          <p className="text-sm text-ink-soft bg-white border border-border rounded-md p-5">No events recorded for this animal yet.</p>
        ) : (
          <ol className="bg-white border border-border rounded-md divide-y divide-border">
            {a.events.map((e) => (
              <li key={e.id} className="px-5 py-3 flex gap-4">
                <span className="text-xs text-ink-soft w-24 flex-shrink-0 pt-0.5">{new Date(e.date).toLocaleDateString("en-GB")}</span>
                <span className="text-sm"><b className="font-bold">{e.type}</b>{e.detail ? <span className="text-ink-soft"> — {e.detail}</span> : null}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
