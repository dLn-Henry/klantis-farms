import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing/PageIntro";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Target, Eye, Heart } from "lucide-react";
import { farmTimeline } from "@/lib/data/mock/farm";

export const metadata: Metadata = {
  title: "About Us",
  description: "Who Klantis Farms is, and how we got here.",
};

const VALUES = [
  { icon: Target, title: "Our Mission", body: "Run a working farm that proves responsible agriculture and reliable commerce aren't in tension with each other." },
  { icon: Eye, title: "Our Vision", body: "To be a farm other producers look to when they think about what \u201cwell-run\u201d actually looks like." },
  { icon: Heart, title: "Our Values", body: "Traceability, animal welfare, soil health, and treating every customer relationship as a long one." },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        title="About Klantis Farms"
        description="A working farm in Ghana's Eastern Region — who we are, why we farm the way we do, and where we're headed."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid lg:grid-cols-2 gap-14 items-center">
          <PhotoSlot label="Photo — Klantis Farms, Eastern Region" className="h-[380px] rounded-2xl" />
          <div>
            <span className="eyebrow">Who We Are</span>
            <h2 className="text-3xl font-extrabold tracking-tight">A Farm Built on Records, Not Guesswork</h2>
            <p className="mt-4 text-ink-soft text-[15px] leading-relaxed max-w-md">
              Klantis Farms raises cattle and cultivates mangoes, cashew, yam and maize on one
              working farm. We believe farming should be productive, transparent and run like a
              serious business — every animal, field and batch tracked from the ground up.
            </p>
            <p className="mt-3.5 text-ink-soft text-[15px] leading-relaxed max-w-md">
              We&apos;re not trying to be the biggest farm in the region. We&apos;re trying to be the most
              accountable one — to our land, our herd, and the people who buy what we produce.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="max-w-[1280px] mx-auto px-10 text-center">
          <span className="eyebrow">What Drives Us</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-10">Mission, Vision &amp; Values</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {VALUES.map((v) => (
              <div key={v.title}>
                <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-green flex items-center justify-center mx-auto mb-4">
                  <v.icon size={24} className="stroke-green" />
                </div>
                <h3 className="text-[14.5px] font-bold">{v.title}</h3>
                <p className="text-xs text-ink-soft mt-2 leading-relaxed max-w-[240px] mx-auto">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[760px] mx-auto px-10">
          <span className="eyebrow">Our Journey</span>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">How We Got Here</h2>
          <div className="mt-8">
            {farmTimeline.map((item, i) => (
              <div key={item.year} className="flex gap-5.5 pb-9 relative">
                {i < farmTimeline.length - 1 && (
                  <span className="absolute left-6 top-[52px] bottom-0 w-px bg-border" />
                )}
                <span className="w-12 h-12 rounded-full bg-white border-2 border-green text-green font-extrabold text-xs flex items-center justify-center flex-shrink-0 z-10">
                  {item.year === "Now" ? "Now" : `Y${item.year}`}
                </span>
                <div>
                  <h4 className="text-[15px] font-bold">{item.title}</h4>
                  <p className="text-[13px] text-ink-soft mt-1 leading-relaxed max-w-md">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
