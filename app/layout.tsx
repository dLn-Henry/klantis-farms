import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE_CONTENT } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONTENT.name} — Cattle, Mangoes, Cashew, Yam & Maize`,
    template: `%s — ${SITE_CONTENT.pageTitleSuffix}`,
  },
  description:
    "Klantis Farms raises cattle and cultivates mangoes, cashew, yam and maize on one working farm in Ghana's Eastern Region.",
};

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
