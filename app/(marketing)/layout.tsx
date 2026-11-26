import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getSiteContent } from "@/lib/site-settings";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteContent();
  return (
    <>
      <SiteHeader
        site={{
          name: site.name, tagline: site.tagline, announcementBar: site.announcementBar,
          deliveryRegionNote: site.deliveryRegionNote, social: site.social, logoUrl: site.logoUrl,
        }}
      />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
