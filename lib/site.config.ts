// Single source of truth for all client-specific business data.
// Swapping this file (+ palette + photos) is what turns the template into a new client site.

export const siteConfig = {
  name: "Thurmon's Heat & Air",
  legalName: "Thurmon's Heat & Air",
  tagline: "Heating & Air Conditioning in El Dorado, AR",
  description:
    "Trusted heating and air conditioning service in El Dorado, Arkansas. AC repair, furnace and heating service, new system installation, mini-splits, and seasonal maintenance. Licensed, local, and dependable.",
  url: "https://thurmonsheatandair.com",

  // TODO: move off Yahoo to a domain email (see onboarding intake)
  email: "thurmonshvac@yahoo.com",
  phone: "(870) 866-5101",
  phoneRaw: "+18708665101",

  license: "HVAC1625250",
  // TODO: confirm exact number with Lisa
  yearsExperience: 15,

  address: {
    street: "1839 Champagnolle Rd",
    city: "El Dorado",
    state: "AR",
    zip: "71730",
    full: "1839 Champagnolle Rd, El Dorado, AR 71730",
  },

  // Approximate El Dorado, AR coordinates — refine to the exact pin before launch
  geo: { lat: 33.2076, lng: -92.6663 },

  hours: {
    display: "Mon\u2013Sun 8:00 AM \u2013 5:00 PM \u00b7 24/7 Emergency On-Call",
  },

  social: {
    facebook: "https://facebook.com/610603242366492",
    googleProfileUrl:
      "https://search.google.com/local/reviews?placeid=ChIJVR3T254aMoYRtuI7TH0EZl8",
  },

  reviews: {
    // bump this as the Google review count grows
    aggregate: { rating: 4.6, count: 12, source: "Google" },
  },

  seo: {
    keywords: [
      "HVAC El Dorado AR",
      "air conditioning repair El Dorado",
      "heating repair El Dorado Arkansas",
      "AC installation El Dorado",
      "furnace repair El Dorado",
      "mini split installation El Dorado",
      "HVAC contractor El Dorado AR",
    ],
  },

  ogImage: "/api/assets/company-image.png",
} as const;

export type SiteConfig = typeof siteConfig;
