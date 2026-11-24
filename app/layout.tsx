import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getSiteContent } from "@/lib/site-settings";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

// Title, description, favicon and share image come from Dashboard -> Settings
// (falling back to the defaults in lib/site-config.ts until something is saved).
export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const share = site.ogImageUrl ?? site.logoUrl;
  return {
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s — ${site.pageTitleSuffix}`,
    },
    description: site.seoDescription,
    ...(site.faviconUrl ? { icons: { icon: site.faviconUrl, apple: site.faviconUrl } } : {}),
    openGraph: {
      siteName: site.name,
      title: `${site.name} — ${site.tagline}`,
      description: site.seoDescription,
      type: "website",
      ...(share ? { images: [{ url: share }] } : {}),
    },
    twitter: { card: share ? "summary_large_image" : "summary" },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
