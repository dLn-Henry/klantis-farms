// Run: npx tsx tests/site-settings.test.mts
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "x";
const { buildSiteContent, defaultSiteContent } = await import("../lib/site-settings");
const B = "https://abc.supabase.co/storage/v1/object/public/site-media/";
let fails = 0;
const t = (n: string, ok: boolean, extra = "") => { console.log(ok ? "PASS" : "FAIL", n, ok ? "" : extra); if (!ok) fails++; };
const d = defaultSiteContent();

let s = buildSiteContent([]);
t("nothing saved -> defaults", s.name === d.name && s.phone === d.phone && s.logoUrl === null && s.faviconUrl === null);

s = buildSiteContent([{ key: "site.name", value: "Green Valley Farm" }]);
t("name overrides", s.name === "Green Valley Farm");
t("title suffix + copyright follow the name", s.pageTitleSuffix === "Green Valley Farm" && s.copyright.includes("Green Valley Farm"));

s = buildSiteContent([{ key: "site.name", value: "   " }, { key: "contact.phone", value: "" }]);
t("empty REQUIRED field falls back to default", s.name === d.name && s.phone === d.phone);

s = buildSiteContent([{ key: "site.announcement", value: "" }, { key: "social.facebook", value: "" }, { key: "site.delivery_note", value: "" }]);
t("empty OPTIONAL field hides it", s.announcementBar === "" && s.social.facebook === "" && s.deliveryRegionNote === "");
t("untouched optional keeps default", s.social.instagram === d.social.instagram);

s = buildSiteContent([{ key: "social.twitter", value: "https://x.com/farm" }]);
t("social link set", s.social.twitter === "https://x.com/farm");

s = buildSiteContent([{ key: "site.logo", value: "f1/2026/logo.png" }, { key: "site.favicon", value: "f1/fav.png" }, { key: "site.og_image", value: "f1/share image.png" }]);
t("logo -> public url", s.logoUrl === `${B}f1/2026/logo.png`, String(s.logoUrl));
t("favicon -> public url", s.faviconUrl === `${B}f1/fav.png`);
t("share image url is encoded", s.ogImageUrl === `${B}f1/share%20image.png`, String(s.ogImageUrl));

s = buildSiteContent([{ key: "site.logo", value: "" }]);
t("cleared logo -> null", s.logoUrl === null);

s = buildSiteContent([{ key: "internal.secret", value: "x" }, { key: "site.unknown", value: "y" }]);
t("unknown keys are ignored", s.name === d.name);
process.exitCode = fails ? 1 : 0;
