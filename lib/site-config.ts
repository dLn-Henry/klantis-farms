// ============================================================================
// SITE CONTENT CONFIG
//
// Everything here is content that should NOT be hardcoded inside components:
// page title, contact info, social handles, announcement bar copy, footer
// text, etc. Right now it's a static object. Once the backend exists (Doc 3
// `settings` table, Doc 12 `farm_content` table), this file becomes a thin
// wrapper that fetches the same shape of data from Supabase instead —
// components importing SITE_CONTENT won't need to change.
//
// Editing any value here is the equivalent of what a Farm Admin will later
// do from /dashboard/settings.
// ============================================================================

export const SITE_CONTENT = {
  name: "Klantis Farms",
  tagline: "From Our Farm To Your Table",
  pageTitleSuffix: "Klantis Farms",
  announcementBar: "Harvest notice — mango season now underway",
  deliveryRegionNote: "Delivering across the Eastern Region, Ghana",
  phone: "+233 24 123 4567",
  email: "hello@klantisfarms.com",
  address: "Eastern Region, Ghana",
  hours: "Mon – Sat, 7:00am – 6:00pm GMT",
  footerBlurb:
    "A working farm in Ghana's Eastern Region, raising cattle and growing mangoes, cashew, yam and maize — delivered fresh and fully traceable.",
  copyright: `© ${new Date().getFullYear()} Klantis Farms. All rights reserved.`,
  social: {
    facebook: "https://facebook.com/klantisfarms",
    instagram: "https://instagram.com/klantisfarms",
    twitter: "https://twitter.com/klantisfarms",
  },
} as const;
