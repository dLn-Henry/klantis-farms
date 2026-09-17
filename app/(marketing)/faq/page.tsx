import type { Metadata } from "next";
import { PageIntro } from "@/components/marketing/PageIntro";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Klantis Farms, our products, and how orders work.",
};

const FAQ_GROUPS = [
  {
    category: "The Farm",
    items: [
      { q: "Where is Klantis Farms located?", a: "We're a working farm in Ghana's Eastern Region, raising cattle and growing mangoes, cashew, yam and maize." },
      { q: "Can I visit the farm?", a: "We're primarily an operating farm rather than a tourist site, but reach out through our Contact page and we'll let you know what's possible." },
    ],
  },
  {
    category: "Products",
    items: [
      { q: "Is everything you sell grown or raised on-site?", a: "Yes — every product traces back to our own herd, orchard or fields. Nothing is bought in and resold." },
      { q: "Do you sell wholesale or bulk quantities?", a: "Yes, for maize, yam and cashew especially. Use the Contact page to reach us about bulk pricing." },
    ],
  },
  {
    category: "Orders",
    items: [
      { q: "How do I place an order?", a: "Our full online ordering system is coming soon. In the meantime, reach us directly through the Contact page." },
      { q: "Can I track my order?", a: "Once online ordering launches, every order will have a status you can track from your account." },
    ],
  },
  {
    category: "Delivery & Pickup",
    items: [
      { q: "What areas do you deliver to?", a: "Currently the Eastern Region and surrounding areas. Let us know your location and we'll confirm." },
      { q: "Is farm pickup available?", a: "Yes — pickup directly from the farm is available by arrangement." },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageIntro
        title="Frequently Asked Questions"
        description="Common questions about the farm, our products, and how to reach us."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
      />

      <section className="py-16">
        <div className="max-w-[760px] mx-auto px-10">
          {FAQ_GROUPS.map((group) => (
            <div key={group.category} className="mb-11">
              <h3 className="text-lg font-extrabold mb-4">{group.category}</h3>
              {group.items.map((item) => (
                <details key={item.q} className="faq-item">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
