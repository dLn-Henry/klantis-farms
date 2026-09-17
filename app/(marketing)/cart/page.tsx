import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";
import { PageIntro } from "@/components/marketing/PageIntro";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Your Cart",
};

export default function CartPage() {
  return (
    <>
      <PageIntro title="Your Cart" breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <section className="py-20">
        <div className="max-w-[500px] mx-auto px-10 text-center">
          <div className="w-16 h-16 rounded-full bg-mist flex items-center justify-center mx-auto mb-5">
            <ShoppingCart size={28} className="stroke-green" />
          </div>
          <h2 className="text-xl font-extrabold mb-2">Cart &amp; checkout coming soon</h2>
          <p className="text-ink-soft text-sm mb-7">
            Full online ordering is on the way. In the meantime, reach out directly and we&apos;ll
            help you place an order.
          </p>
          <Button href="/contact">Contact Us</Button>
        </div>
      </section>
    </>
  );
}
