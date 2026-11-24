// Run: npx tsx tests/images.test.mts
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://abc.supabase.co";
const { markdownImageUrls, foreignImages, isAllowedImageUrl, publicMediaUrl } = await import("../lib/content/images");
const B = "https://abc.supabase.co/storage/v1/object/public/site-media/";
const F = "f0000000-0000-0000-0000-000000000001";
let fails = 0;
const t = (n: string, ok: boolean, extra = "") => { console.log(ok ? "PASS" : "FAIL", n, ok ? "" : extra); if (!ok) fails++; };
t("finds images", JSON.stringify(markdownImageUrls(`a ![x](${B}${F}/a.png) b ![y](${B}${F}/b.png "t")`)) === JSON.stringify([`${B}${F}/a.png`, `${B}${F}/b.png`]));
t("own-farm image is fine", foreignImages(`![x](${B}${F}/a.png)`, F).length === 0);
t("other farm's image is foreign", foreignImages(`![x](${B}f0000000-0000-0000-0000-000000000002/a.png)`, F).length === 1);
t("external image is foreign", foreignImages(`![x](https://evil.com/a.png)`, F).length === 1);
t("traversal is foreign", foreignImages(`![x](${B}${F}/../x/a.png)`, F).length === 1);
t("no images, no problem", foreignImages("just text [link](https://x.com)", F).length === 0);
t("publicMediaUrl encodes", publicMediaUrl(`${F}/my file.png`) === `${B}${F}/my%20file.png`);
t("isAllowedImageUrl", isAllowedImageUrl(`${B}${F}/a.png`) && !isAllowedImageUrl("https://evil.com/x.png"));
process.exitCode = fails ? 1 : 0;
