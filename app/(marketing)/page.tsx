import Link from "next/link";
import {
  ShieldCheck, Leaf, Truck, Lock, ArrowRight, ShoppingCart, Star,
  PlayCircle, AlertTriangle, Beef, Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { categories } from "@/lib/data/mock/categories";
import { products } from "@/lib/data/mock/products";
import { formatCurrency } from "@/lib/utils";

const TRUST_ITEMS = [
  { icon: Leaf, label: "100% Natural" },
  { icon: ShieldCheck, label: "Sustainably Grown" },
  { icon: Truck, label: "Fast & Reliable Delivery" },
  { icon: Lock, label: "Secure Payments" },
];

const WHY_ITEMS = [
  { title: "Premium Quality", body: "Carefully raised and graded produce." },
  { title: "Sustainable Farming", body: "Practices that protect our soil and herd." },
  { title: "Farm to Doorstep", body: "Delivered fresh, quickly and safely." },
  { title: "Full Traceability", body: "Every batch traced back to its source." },
  { title: "100% Satisfaction", body: "We stand behind everything we produce." },
];

const LEDGER = [
  { time: "07:40", title: "Morning grazing rotation completed", detail: "Herd moved to the East Pasture" },
  { time: "09:15", title: "Mango orchard irrigation completed", detail: "Block 3" },
  { time: "10:50", title: "Cashew harvest recorded", detail: "180kg collected and logged to inventory" },
  { time: "13:20", title: "Herd health check completed", detail: "No issues reported" },
  { time: "15:05", title: "Yam field weeding completed", detail: "Field B" },
];

const STEPS = [
  { n: 1, title: "Seed", body: "Selected & planted" },
  { n: 2, title: "Grow", body: "Tended & monitored" },
  { n: 3, title: "Harvest", body: "Collected & logged" },
  { n: 4, title: "Quality Check", body: "Sorted & graded" },
  { n: 5, title: "Pack", body: "Prepared for delivery" },
  { n: 6, title: "Deliver", body: "Straight to your door" },
];

export default function HomePage() {
  const featured = products.slice(0, 5);

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-b from-mist to-mist-light">
        <div className="max-w-[1280px] mx-auto px-10 grid lg:grid-cols-2 gap-14 items-center py-16">
          <div>
            <span className="inline-flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-full text-xs font-bold text-green mb-5">
              <ShieldCheck size={14} /> 100% Natural &amp; Chemical Free
            </span>
            <h1 className="text-[52px] leading-[1.08] font-extrabold tracking-tight">
              Fresh. Natural.
              <span className="block text-green">Sustainably Grown.</span>
            </h1>
            <p className="mt-5 text-[16.5px] leading-relaxed text-ink-soft max-w-md">
              Klantis Farms raises cattle and grows mangoes, cashew, yam and maize on one working
              farm in Ghana&apos;s Eastern Region — delivered fresh, straight from where it&apos;s produced.
            </p>
            <div className="flex flex-wrap gap-3.5 mt-8">
              <Button href="/shop">Shop Now <ArrowRight size={15} /></Button>
              <Button href="/farm" variant="outline">Explore Our Farm</Button>
            </div>
            <div className="flex flex-wrap gap-5 mt-11 pt-7 border-t border-border">
              {TRUST_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span className="w-[34px] h-[34px] rounded-full bg-white border border-border flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="stroke-green" />
                  </span>
                  <span className="text-[12.5px] font-semibold max-w-[90px] leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden h-[420px] lg:h-[520px]">
              <PhotoSlot label="Farm photography — Eastern Region, Ghana" className="!rounded-3xl bg-gradient-to-br from-[#2C7A50] to-forest" />
            </div>
            <div className="absolute top-6 right-6 w-[104px] h-[104px] rounded-full bg-white shadow-xl flex flex-col items-center justify-center text-center p-2.5">
              <b className="text-[19px] text-green font-extrabold leading-none">100%</b>
              <span className="text-[8.5px] font-bold text-ink-soft uppercase tracking-wide mt-1.5 leading-tight">
                Farm Fresh Guaranteed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FARM AT A GLANCE */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1280px] mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-y-5 py-7">
          {[
            ["10+", "Years Farming"],
            ["50+", "Acres of Farmland"],
            ["5", "Core Produce Lines"],
            ["100%", "Farm Direct"],
          ].map(([num, label], i) => (
            <div key={label} className={`text-center ${i > 0 ? "md:border-l md:border-border" : ""}`}>
              <b className="block text-2xl font-extrabold text-green">{num}</b>
              <span className="text-xs font-semibold text-ink-soft">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT WE PRODUCE */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <SectionHeading eyebrow="What We Produce" title="Shop by Category" linkHref="/produce" linkLabel="View All Categories" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/produce/${cat.slug}`} className="cat-card block">
                <span className="cat-icon"><Beef size={26} /></span>
                <h3 className="text-[14.5px] font-bold">{cat.name}</h3>
                <p className="text-xs text-ink-soft mt-1">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE FARM */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid lg:grid-cols-[0.85fr_1.15fr] gap-14 items-center">
          <PhotoSlot label="Farm photography — grazing & orchard" className="h-[300px] lg:h-[380px]" />
          <div>
            <span className="eyebrow">How We Farm</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Practices Behind Every Harvest</h2>
            <p className="mt-3.5 text-ink-soft text-[15px] leading-relaxed max-w-lg">
              Farming on Klantis Farms means the same standards apply whether it&apos;s the herd, the
              orchard or the fields — recorded, deliberate, and built to hold up season after season.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 mt-7">
              {[
                ["Animal Welfare & Grazing", "Rotational grazing and regular herd health checks."],
                ["Soil & Water Management", "Crop rotation and irrigation planned around the land."],
                ["Careful Harvest Handling", "Produce sorted and graded before it ever leaves the farm."],
                ["Responsible Inputs", "Every input used is logged against the field or herd it served."],
              ].map(([title, body]) => (
                <div key={title} className="flex gap-3.5">
                  <span className="w-10 h-10 rounded-[10px] bg-mist flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={20} className="stroke-green" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold">{title}</h4>
                    <p className="text-xs text-ink-soft mt-1 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/how-we-farm" className="link-arrow mt-6 inline-flex">
              Read About Our Practices <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* FARM MANAGEMENT PREVIEW */}
      <section className="bg-forest py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="eyebrow !text-gold">More Than a Storefront</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Built on a Real Farm Management System
            </h2>
            <p className="mt-4 text-[#B9CBC0] text-[15px] leading-relaxed max-w-md">
              Klantis Farms isn&apos;t just a place to buy produce. Behind every listing is a working
              farm-operations system tracking the herd, the fields and the harvest — which is what
              makes our traceability real instead of a marketing claim.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Every animal, field and batch is logged",
                "Inventory reflects real harvests, not estimates",
                "Built to grow into a platform other farms can join",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[#DCEBE0] text-[13.5px] font-semibold">
                  <ShieldCheck size={16} className="stroke-gold flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Button href="/trust" className="mt-7">See Our Approach <ArrowRight size={15} /></Button>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-surface px-4 py-3 flex items-center gap-1.5 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <small className="ml-2.5 text-[11px] text-ink-soft font-semibold">Klantis Farms — Farm Dashboard</small>
            </div>
            <div className="p-6">
              <h5 className="text-[15px] font-extrabold">Good morning, Farm Manager.</h5>
              <p className="text-xs text-ink-soft mt-0.5 mb-5">Here&apos;s what&apos;s happening across Klantis Farms today.</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[["1,248", "Cattle"], ["4", "Active Fields"], ["12", "Tasks Today"], ["3", "Awaiting Review"]].map(([n, l]) => (
                  <div key={l} className="bg-mist rounded-lg p-3.5">
                    <b className="block text-xl font-extrabold text-green">{n}</b>
                    <span className="text-[10.5px] text-ink-soft font-semibold">{l}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-[#FDF3E3] border border-[#F0DBAF] rounded-lg px-3.5 py-3 flex gap-2.5 items-start">
                <AlertTriangle size={16} className="stroke-gold flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">2 veterinary reports awaiting review · Feed stock in Warehouse A is running low</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FROM THE FARM, TODAY */}
      <section className="bg-surface py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-green relative">
              <span className="absolute inset-[-4px] rounded-full border border-green opacity-50 animate-ping" />
            </span>
            <span className="eyebrow !mb-0">From the Farm</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-7">A Day on Klantis Farms</h2>
          <div className="border border-border rounded-md overflow-hidden">
            {LEDGER.map((row, i) => (
              <div key={row.time} className={`flex items-center gap-4.5 px-5 py-4.5 border-b border-border last:border-b-0 ${i % 2 ? "bg-white" : "bg-mist-light"}`}>
                <span className="text-[12.5px] font-extrabold text-green w-14 flex-shrink-0">{row.time}</span>
                <span className="w-8.5 h-8.5 w-[34px] h-[34px] rounded-lg bg-mist flex items-center justify-center flex-shrink-0">
                  <Wheat size={17} className="stroke-green" />
                </span>
                <span>
                  <b className="block text-sm font-bold">{row.title}</b>
                  <span className="text-xs text-ink-soft">{row.detail}</span>
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-soft italic mt-3.5">
            A representative look at a typical day on the farm — every record shown here mirrors
            what&apos;s actually tracked in our farm management system.
          </p>
        </div>
      </section>

      {/* TRANSPARENCY STEPS */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <SectionHeading eyebrow="Know Your Food" title="From Seed to Your Door" description="Every product sold on Klantis Farms follows the same traceable path." center />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-8 mt-5 relative">
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

      {/* FEATURED PRODUCTS */}
      <section className="bg-surface py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <SectionHeading eyebrow="Fresh This Week" title="Featured Products" linkHref="/shop" linkLabel="View All Products" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
            {featured.map((p) => (
              <div key={p.slug} className="prod-card">
                <div className="relative h-[150px]">
                  {p.badge && <span className="prod-badge">{p.badge}</span>}
                  <PhotoSlot label={`Photo — ${p.name}`} />
                </div>
                <div className="p-4">
                  <h3 className="text-[14.5px] font-bold">{p.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Star size={12} className="fill-gold stroke-gold" />
                    <span className="text-[11.5px] text-ink-soft">{p.rating} ({p.reviewCount})</span>
                  </div>
                  <div className="text-base font-extrabold text-green mt-2.5">
                    {p.price > 0 ? formatCurrency(p.price) : "Market price"}{" "}
                    <small className="text-[11px] font-medium text-ink-soft">/ {p.unit}</small>
                  </div>
                  <button className="prod-cart"><ShoppingCart size={14} /> Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="bg-surface py-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <SectionHeading eyebrow="Why Klantis Farms" title="Why Choose Klantis Farms?" description="We're committed to responsible production and a direct line between our farm and your table." center />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mt-4">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-green flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={24} className="stroke-green" />
                </div>
                <h3 className="text-[14.5px] font-bold">{item.title}</h3>
                <p className="text-xs text-ink-soft mt-2 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FARM STORY */}
      <section className="py-16">
        <div className="max-w-[1280px] mx-auto px-10 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative rounded-2xl overflow-hidden h-[400px] bg-gradient-to-br from-[#2C7A50] to-forest flex items-center justify-center">
            <div className="w-[74px] h-[74px] rounded-full bg-white/95 flex items-center justify-center shadow-xl">
              <PlayCircle size={30} className="fill-green stroke-green ml-0.5" />
            </div>
            <span className="absolute bottom-5 left-5 text-white font-bold text-sm">Take a tour of our farm</span>
          </div>
          <div>
            <span className="eyebrow">Our Story</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Our Farm. Our Passion.</h2>
            <p className="mt-4 text-ink-soft text-[15px] leading-relaxed max-w-md">
              Klantis Farms is dedicated to responsible agriculture — raising healthy cattle and
              cultivating mangoes, cashew, yam and maize with practices that respect the land we
              depend on.
            </p>
            <div className="grid grid-cols-2 gap-4.5 mt-8">
              {[
                ["1", "Working Farm, Fully Traceable"],
                ["6", "Steps, Seed to Door"],
                ["4.8/5", "Customer Rating"],
                ["24–48h", "Typical Delivery Window"],
              ].map(([n, l]) => (
                <div key={l}><b className="block text-2xl font-extrabold text-green">{n}</b><span className="text-[11.5px] text-ink-soft font-semibold">{l}</span></div>
              ))}
            </div>
            <Button href="/about" className="mt-8">Learn More About Us <ArrowRight size={15} /></Button>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="pb-16">
        <div className="max-w-[1280px] mx-auto px-10">
          <div className="bg-forest rounded-2xl px-10 py-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-[19px] font-extrabold">Join Our Farm Community</h3>
              <p className="text-[#B9CBC0] text-[13px] mt-1">Get updates on new produce, farming tips and exclusive offers.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
