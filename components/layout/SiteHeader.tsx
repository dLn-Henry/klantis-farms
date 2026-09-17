"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, ShoppingCart, Menu, Facebook, Instagram, ChevronDown } from "lucide-react";
import { SITE_CONTENT } from "@/lib/site-config";
import { categories } from "@/lib/data/mock/categories";

const NAV_LINKS = [
  { label: "Home", href: "/", dropdown: false },
  { label: "Our Farm", href: "/farm", dropdown: false },
  { label: "Shop", href: "/shop", dropdown: true },
  { label: "Farming Practices", href: "/how-we-farm", dropdown: false },
  { label: "Articles", href: "/journal", dropdown: false },
  { label: "About Us", href: "/about", dropdown: false },
  { label: "Contact", href: "/contact", dropdown: false },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header>
      {/* Top bar */}
      <div className="bg-forest text-[#DCEBE0]">
        <div className="max-w-[1280px] mx-auto px-10 h-[38px] flex items-center justify-between text-xs">
          <div className="hidden sm:flex items-center gap-7">
            <span>
              <b className="text-gold font-semibold">Harvest notice —</b>{" "}
              mango season now underway
            </span>
            <span className="hidden md:inline">{SITE_CONTENT.deliveryRegionNote}</span>
          </div>
          <div className="flex items-center gap-5 opacity-90">
            <Link href="#" className="hover:text-gold">Track Order</Link>
            <Link href="/contact" className="hover:text-gold">Help Centre</Link>
            <div className="flex gap-3">
              <a href={SITE_CONTENT.social.facebook} aria-label="Facebook"><Facebook size={13} /></a>
              <a href={SITE_CONTENT.social.instagram} aria-label="Instagram"><Instagram size={13} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-10 h-[88px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-[10px] bg-green flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" className="w-[22px] h-[22px]">
                <path d="M12 3c-3 3-3 7 0 10 3-3 3-7 0-10Z" />
                <path d="M12 13v8" />
                <path d="M8 21h8" />
              </svg>
            </span>
            <span>
              <span className="block text-[19px] font-extrabold tracking-tight leading-tight">
                {SITE_CONTENT.name}
              </span>
              <span className="block text-[10.5px] text-ink-soft font-medium">
                {SITE_CONTENT.tagline}
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isCurrent = pathname === link.href || (link.dropdown && pathname.startsWith("/produce"));

              if (link.dropdown) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setShopOpen(true)}
                    onMouseLeave={() => setShopOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={`text-sm font-semibold relative py-1.5 flex items-center gap-1.5 ${
                        isCurrent ? "text-green" : "text-ink hover:text-green"
                      }`}
                    >
                      {link.label}
                      <ChevronDown size={13} className={`transition-transform ${shopOpen ? "rotate-180" : ""}`} />
                      {isCurrent && <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-gold rounded-full" />}
                    </Link>

                    {shopOpen && (
                      <div className="absolute top-full left-0 pt-3 w-64">
                        <div className="bg-white border border-border rounded-md shadow-lg py-2">
                          {categories.map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/produce/${cat.slug}`}
                              className="flex items-center justify-between px-4 py-2.5 text-[13.5px] font-medium hover:bg-mist hover:text-green"
                            >
                              {cat.name}
                              <span className="text-[11px] text-ink-soft">{cat.productCount}</span>
                            </Link>
                          ))}
                          <div className="border-t border-border mt-1.5 pt-1.5">
                            <Link href="/produce" className="block px-4 py-2.5 text-[13.5px] font-bold text-green hover:bg-mist">
                              View All Produce
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold relative py-1.5 ${
                    isCurrent ? "text-green" : "text-ink hover:text-green"
                  }`}
                >
                  {link.label}
                  {isCurrent && <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-gold rounded-full" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-mist" aria-label="Search">
              <Search size={19} />
            </button>
            <Link href="/login" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-mist" aria-label="Account">
              <User size={19} />
            </Link>
            <Link href="/cart" className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-mist" aria-label="Cart">
              <ShoppingCart size={19} />
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-gold text-forest text-[9.5px] font-extrabold flex items-center justify-center">2</span>
            </Link>
            <button
              className="lg:hidden w-10 h-10 rounded-lg flex items-center justify-center"
              aria-label="Open menu"
              onClick={() => setOpen((v) => !v)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden flex flex-col bg-white border-b border-border py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-3.5 text-sm font-semibold border-b border-border last:border-b-0"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
