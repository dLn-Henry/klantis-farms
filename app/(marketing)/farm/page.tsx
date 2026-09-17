import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing/PageIntro";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Beef, Warehouse, Droplets, ClipboardCheck } from "lucide-react";
import { productionAreas, facilities } from "@/lib/data/mock/farm";

export const metadata: Metadata = {
  title: "Our Farm",
  description: "A look at Klantis Main Farm — location, production areas, and facilities.",
};

const FACILITY_ICONS = [Warehouse, Warehouse, Droplets, ClipboardCheck];

export default function FarmPage() {
  return (
    <>
      <PageIntro
        title="Our Farm"
        description="A look at where Klantis Farms produce actually comes from — the land, the herd, and how it's organized."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Our Farm" }]}
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <span className="eyebrow">Farm Overview</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-7">The Farm, at a Glance</h2>
          <div className="border border-border rounded-md grid grid-cols-2 md:grid-cols-4 gap-y-5 px-6 py-7">
            {[
              ["50+", "Acres of Farmland"],
              ["Eastern Region", "Location, Ghana"],
              ["Mixed", "Livestock & Crop Farm"],
              ["5", "Core Production Areas"],
            ].map(([num, label], i) => (
              <div key={label} className={`text-center ${i > 0 ? "md:border-l md:border-border" : ""}`}>
                <b className="block text-2xl font-extrabold text-green">{num}</b>
                <span className="text-xs font-semibold text-ink-soft">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <span className="eyebrow">Production Areas</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-7">What Happens Where</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {productionAreas.map((area) => (
              <div key={area.name} className="cat-card">
                <span className="cat-icon"><Beef size={26} /></span>
                <h3 className="text-[14.5px] font-bold">{area.name}</h3>
                <p className="text-xs text-ink-soft mt-1">{area.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
          <PhotoSlot label="Photo — The Farm, Eastern Region" className="h-[420px] rounded-2xl" />
          <div>
            <span className="eyebrow">Our Story</span>
            <h2 className="text-3xl font-extrabold tracking-tight mb-6">From the Beginning to Now</h2>
            {[
              ["01", "Beginning", "Klantis Farms starts small, with cattle and a handful of cultivated acres."],
              ["02", "Growth", "Mango, cashew, yam and maize production added as the farm expands."],
              ["03", "Current Farm", "A working farm across 50+ acres, producing five core lines year-round."],
              ["04", "Technology", "Moving every record — animals, fields, batches — onto one digital system."],
              ["05", "Future", "Building toward a platform other farms in the region can eventually join."],
            ].map(([year, title, body], i, arr) => (
              <div key={year} className="flex gap-5 pb-8 relative">
                {i < arr.length - 1 && <span className="absolute left-[23px] top-[50px] bottom-0 w-px bg-border" />}
                <span className="w-12 h-12 rounded-full bg-white border-2 border-green text-green font-extrabold text-xs flex items-center justify-center flex-shrink-0 z-10">{year}</span>
                <div><h4 className="text-[15px] font-bold">{title}</h4><p className="text-[13px] text-ink-soft mt-1 leading-relaxed max-w-md">{body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-[1280px] mx-auto px-10 text-center">
          <span className="eyebrow">Infrastructure</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-10">Farm Facilities</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {facilities.map((f, i) => {
              const Icon = FACILITY_ICONS[i];
              return (
                <div key={f.name}>
                  <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-green flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="stroke-green" />
                  </div>
                  <h3 className="text-[14.5px] font-bold">{f.name}</h3>
                  <p className="text-xs text-ink-soft mt-2 leading-relaxed max-w-[200px] mx-auto">{f.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
