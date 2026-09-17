import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing/PageIntro";
import { SITE_CONTENT } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <>
      <PageIntro
        title="Terms & Conditions"
        description="Last updated: September 2026"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]}
      />

      <section className="py-16">
        <div className="max-w-[760px] mx-auto px-10 legal-prose">
          <div className="legal-note">
            <strong>Placeholder text.</strong> This page is a structural draft for design purposes
            only. Before this goes live, it needs to be reviewed and finalized by a qualified
            lawyer familiar with Ghanaian commercial and consumer protection law.
          </div>

          <h2>1. About Klantis Farms</h2>
          <p>Klantis Farms is a working farm based in Ghana&apos;s Eastern Region, producing cattle, mangoes, cashew nuts, yams and maize.</p>

          <h2>2. Orders & Availability</h2>
          <p>All products are subject to availability. Prices are shown in Ghanaian Cedis (GHS) and may change without prior notice.</p>

          <h2>3. Delivery & Pickup</h2>
          <p>Delivery windows and pickup arrangements will be confirmed at the time of order. Klantis Farms is not responsible for delays caused by circumstances outside our control.</p>

          <h2>4. Returns & Refunds</h2>
          <p>Given the perishable nature of much of what we produce, returns are handled on a case-by-case basis. Contact us within 24 hours of delivery if there&apos;s an issue with your order.</p>

          <h2>5. Limitation of Liability</h2>
          <p>Klantis Farms is not liable for indirect or consequential loss arising from use of this website or its products, to the extent permitted by law.</p>

          <h2>6. Contact</h2>
          <p>Questions about these terms can be sent to {SITE_CONTENT.email}.</p>
        </div>
      </section>
    </>
  );
}
