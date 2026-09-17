import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { SITE_CONTENT } from "@/lib/site-config";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "What We Produce", href: "/produce" },
  { label: "Farming Practices", href: "/how-we-farm" },
  { label: "Farm Journal", href: "/journal" },
];

const CUSTOMER_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Trust & Transparency", href: "/trust" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="bg-forest text-[#B9CBC0] pt-16">
      <div className="max-w-[1280px] mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-[10px] bg-green flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" className="w-[22px] h-[22px]">
                  <path d="M12 3c-3 3-3 7 0 10 3-3 3-7 0-10Z" />
                  <path d="M12 13v8" />
                  <path d="M8 21h8" />
                </svg>
              </span>
              <span>
                <span className="block text-white text-[19px] font-extrabold">{SITE_CONTENT.name}</span>
                <span className="block text-[10.5px] text-[#9DB3A6] font-medium">{SITE_CONTENT.tagline}</span>
              </span>
            </Link>
            <p className="text-[13px] leading-relaxed mt-4 max-w-[280px]">{SITE_CONTENT.footerBlurb}</p>
            <div className="flex gap-2.5 mt-5">
              <a href={SITE_CONTENT.social.facebook} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Facebook size={15} /></a>
              <a href={SITE_CONTENT.social.instagram} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Instagram size={15} /></a>
              <a href={SITE_CONTENT.social.twitter} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Twitter size={15} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white text-[13.5px] font-bold uppercase tracking-wide mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.href} className="text-sm"><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[13.5px] font-bold uppercase tracking-wide mb-4">Customer Service</h4>
            <ul className="space-y-2.5">
              {CUSTOMER_LINKS.map((l) => (
                <li key={l.href} className="text-sm"><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[13.5px] font-bold uppercase tracking-wide mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex gap-2.5 items-start text-sm"><Phone size={15} className="stroke-gold flex-shrink-0 mt-0.5" /><span>{SITE_CONTENT.phone}</span></li>
              <li className="flex gap-2.5 items-start text-sm"><Mail size={15} className="stroke-gold flex-shrink-0 mt-0.5" /><span>{SITE_CONTENT.email}</span></li>
              <li className="flex gap-2.5 items-start text-sm"><MapPin size={15} className="stroke-gold flex-shrink-0 mt-0.5" /><span>{SITE_CONTENT.address}</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between text-xs">
          <span>{SITE_CONTENT.copyright}</span>
          <span>Mobile Money · Card · Bank Transfer</span>
        </div>
      </div>
    </footer>
  );
}
