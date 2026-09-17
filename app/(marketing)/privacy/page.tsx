import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing/PageIntro";
import { SITE_CONTENT } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        title="Privacy Policy"
        description="Last updated: September 2026"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <section className="py-16">
        <div className="max-w-[760px] mx-auto px-10 legal-prose">
          <div className="legal-note">
            <strong>Placeholder text.</strong> This page is a structural draft for design purposes
            only. Before this goes live, it needs to be reviewed and finalized by a qualified
            lawyer familiar with Ghanaian data protection law (including the Data Protection Act, 2012).
          </div>

          <h2>1. Information We Collect</h2>
          <p>When you use this website or place an order, we may collect your name, phone number, email address, delivery address, and order history.</p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To process and fulfil orders</li>
            <li>To communicate about order status, delivery, or account activity</li>
            <li>To respond to enquiries submitted through the Contact page</li>
            <li>To improve the farm&apos;s products and services</li>
          </ul>

          <h2>3. How We Store Your Information</h2>
          <p>Customer data is stored in a secured database. We do not sell customer information to third parties.</p>

          <h2>4. Your Rights</h2>
          <p>You may request to see, correct, or delete the personal information we hold about you by contacting us directly.</p>

          <h2>5. Contact</h2>
          <p>Questions about this policy can be sent to {SITE_CONTENT.email}.</p>
        </div>
      </section>
    </>
  );
}
