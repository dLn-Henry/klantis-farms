import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PageIntro } from "@/components/marketing/PageIntro";
import { ContactForm } from "@/components/marketing/ContactForm";
import { SITE_CONTENT } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Klantis Farms — general enquiries, orders, or bulk pricing.",
};

const CONTACT_INFO = [
  { icon: Phone, label: "Phone", value: SITE_CONTENT.phone },
  { icon: Mail, label: "Email", value: SITE_CONTENT.email },
  { icon: MapPin, label: "Farm Location", value: SITE_CONTENT.address },
  { icon: Clock, label: "Hours", value: SITE_CONTENT.hours },
];

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Get in Touch"
        description="Questions about an order, bulk pricing, or the farm itself — reach us directly."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <span className="eyebrow">Send a Message</span>
            <h2 className="text-[26px] font-extrabold tracking-tight mb-5">We&apos;ll Get Back to You Shortly</h2>
            <ContactForm />
          </div>

          <div>
            <span className="eyebrow">Contact Information</span>
            <h2 className="text-[26px] font-extrabold tracking-tight mb-5">Reach Us Directly</h2>
            <div className="flex flex-col gap-4 mb-8">
              {CONTACT_INFO.map((c) => (
                <div key={c.label} className="flex gap-3.5 items-start border border-border rounded-md p-4.5">
                  <span className="w-10 h-10 rounded-[10px] bg-mist flex items-center justify-center flex-shrink-0">
                    <c.icon size={19} className="stroke-green" />
                  </span>
                  <div>
                    <b className="text-[13.5px] block">{c.label}</b>
                    <span className="text-[13px] text-ink-soft">{c.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[280px] rounded-md bg-gradient-to-br from-mist to-[#C3DFCB] flex flex-col items-center justify-center gap-2.5">
              <MapPin size={34} className="stroke-ink-soft opacity-60" />
              <span className="text-xs font-semibold text-ink-soft opacity-80">Map — Klantis Farms, Eastern Region</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
