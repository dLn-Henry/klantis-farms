import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, ScanLine, Leaf, ShieldCheck } from "lucide-react";
import { PageIntro } from "@/components/marketing/PageIntro";

export const metadata: Metadata = {
  title: "Trust & Transparency",
  description: "What we do, and don't do, to stand behind what we produce.",
};

const PILLARS = [
  {
    icon: ScanLine,
    title: "Full Traceability",
    body: (
      <>Every batch we sell can be traced back to the field, herd or harvest it came from — see our{" "}
        <Link href="/transparency" className="link-arrow inline-flex">Transparency page</Link>.</>
    ),
  },
  {
    icon: ClipboardCheck,
    title: "Quality Checks",
    body: "Every harvest is sorted and graded before it's packaged or logged into inventory.",
  },
  {
    icon: Leaf,
    title: "Animal Welfare",
    body: (
      <>Our herd is managed on rotational pasture with routine veterinary care — see{" "}
        <Link href="/how-we-farm" className="link-arrow inline-flex">How We Farm</Link>.</>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Honest About Where We Are",
    body: "We're a single working farm, not a certified multi-farm cooperative. We don't claim certifications we don't hold — what you see reflects our actual current practices.",
  },
];

export default function TrustPage() {
  return (
    <>
      <PageIntro
        title="Trust & Transparency"
        description="What we do, and don't do, to stand behind what we produce."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Trust & Transparency" }]}
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid sm:grid-cols-2 gap-8">
          {PILLARS.map((p) => (
            <div key={p.title}>
              <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-green flex items-center justify-center mb-4">
                <p.icon size={24} className="stroke-green" />
              </div>
              <h3 className="text-[14.5px] font-bold">{p.title}</h3>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed max-w-sm">{p.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
