import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing/PageIntro";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BatchLookupForm } from "@/components/marketing/BatchLookupForm";

export const metadata: Metadata = {
  title: "Farm Transparency",
  description: "Every product sold on Klantis Farms can be traced back to the field, herd, or batch it came from.",
};

const STEPS = [
  { n: 1, title: "Seed", body: "Selected & planted" },
  { n: 2, title: "Grow", body: "Tended & monitored" },
  { n: 3, title: "Harvest", body: "Collected & logged" },
  { n: 4, title: "Quality Check", body: "Sorted & graded" },
  { n: 5, title: "Pack", body: "Prepared for delivery" },
  { n: 6, title: "Deliver", body: "Straight to your door" },
];

export default function TransparencyPage() {
  return (
    <>
      <PageIntro
        title="Know Your Food"
        description="Every product sold on Klantis Farms can be traced back to the field, herd, or batch it came from."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Farm Transparency" }]}
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <SectionHeading eyebrow="The Full Journey" title="From Seed to Your Door" center />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-8">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center px-2">
                <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-green text-green font-extrabold text-base flex items-center justify-center mx-auto mb-3.5">
                  {s.n}
                </div>
                <h4 className="text-[13.5px] font-bold">{s.title}</h4>
                <p className="text-[11.5px] text-ink-soft mt-1">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <div className="bg-forest rounded-2xl px-10 py-10 text-center">
            <h3 className="text-white text-[22px] font-extrabold">Look Up a Batch</h3>
            <p className="text-[#B9CBC0] text-[13.5px] mt-2 max-w-md mx-auto">
              Every product ships with a batch number. Enter it below to see exactly where it came from.
            </p>
            <BatchLookupForm />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[720px] mx-auto px-10">
          <span className="eyebrow">Example</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-6">What a Batch Record Looks Like</h2>
          <div className="border border-border rounded-md p-7">
            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
              <div>
                <b className="text-base">Batch KLF-MNG-2026-014</b>
                <div className="text-xs text-ink-soft mt-0.5">Fresh Mangoes</div>
              </div>
              <span className="bg-green text-white text-[10px] font-extrabold px-2.5 py-1 rounded uppercase">Verified</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[["Klantis Farms", "Farm"], ["Block 3", "Orchard Section"], ["18 Aug", "Harvest Date"], ["Passed", "Quality Check"]].map(([n, l]) => (
                <div key={l} className="bg-mist rounded-lg p-3.5">
                  <b className="block text-lg font-extrabold text-green">{n}</b>
                  <span className="text-[10.5px] text-ink-soft font-semibold">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
