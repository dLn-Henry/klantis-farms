import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing/PageIntro";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "How We Farm",
  description: "The practices behind the herd, the orchard, and every field.",
};

const SECTIONS = [
  {
    num: "01 — LIVESTOCK",
    title: "Animal Welfare & Grazing",
    body: "Our cattle move through a rotational grazing plan rather than staying on one pasture — it keeps the herd healthier and the land from wearing out.",
    points: [
      "Rotational grazing across pasture blocks",
      "Routine veterinary checks and vaccination schedules",
      "Every health event logged against the individual animal",
    ],
    photo: "Photo — Herd on Pasture",
    reverse: false,
  },
  {
    num: "02 — ORCHARD & FIELDS",
    title: "Crop Cultivation",
    body: "Mango, cashew, yam and maize are grown on a planned rotation, with irrigation and fertilization scheduled around the specific needs of each field rather than a single blanket routine.",
    points: [
      "Crop rotation to protect soil health",
      "Irrigation planned per field, not per farm",
      "Inputs logged against the crop cycle they served",
    ],
    photo: "Photo — Mango & Cashew Orchard",
    reverse: true,
  },
  {
    num: "03 — HARVEST",
    title: "Harvest & Handling",
    body: "Everything is sorted and graded on-site before it's logged into inventory — nothing leaves the farm without a batch record behind it.",
    points: [
      "Sorted and graded before storage",
      "Batch numbers assigned at harvest, not at sale",
      "Cold and dry storage matched to each product",
    ],
    photo: "Photo — Sorting & Grading",
    reverse: false,
  },
  {
    num: "04 — QUALITY",
    title: "Quality Control",
    body: "A final check happens before packaging — this is the step that decides whether something ships as-is, gets held back, or gets marked down for a different use.",
    points: [
      "Visual and weight checks before packaging",
      "Rejected produce is logged, not just discarded",
      "Results tied back to the originating batch",
    ],
    photo: "Photo — Quality Check",
    reverse: true,
  },
];

export default function HowWeFarmPage() {
  return (
    <>
      <PageIntro
        title="How We Farm"
        description="The practices behind the herd, the orchard, and every field — explained plainly, not marketed."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Our Farm", href: "/farm" }, { label: "How We Farm" }]}
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          {SECTIONS.map((s) => (
            <div key={s.title} className={`grid lg:grid-cols-2 gap-14 items-center py-10 ${s.reverse ? "[&>*:first-child]:lg:order-2" : ""}`}>
              <PhotoSlot label={s.photo} className="h-[300px] lg:h-[340px] rounded-2xl" />
              <div>
                <span className="text-xs font-extrabold text-gold tracking-wide">{s.num}</span>
                <h3 className="text-2xl font-extrabold tracking-tight mt-2">{s.title}</h3>
                <p className="mt-3.5 text-ink-soft text-[14.5px] leading-relaxed max-w-md">{s.body}</p>
                <ul className="mt-4 space-y-2.5">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-[13.5px]">
                      <ShieldCheck size={16} className="stroke-green flex-shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
