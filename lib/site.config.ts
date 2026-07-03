// Single source of truth for all client-specific business data.
// Swapping this file (+ palette + photos) is what turns the template into a new client site.
// Facts verified from a full crawl of the live site (thurmonsheatandair.com).

export const siteConfig = {
  name: "Thurmon's Heat & Air",
  legalName: "Thurmon's Heat & Air",
  tagline: "Heating & Air Conditioning in El Dorado, AR",
  description:
    "Trusted heating and air conditioning service in El Dorado, Arkansas. AC and heating repair, new system installation, ductwork, ventilation, and mini-splits. Free estimates, financing available, and 24/7 on-call service.",
  url: "https://thurmonsheatandair.com",

  // TODO: move off Yahoo to a domain email (see onboarding intake)
  email: "thurmonshvac@yahoo.com",
  phone: "(870) 866-5101",
  phoneRaw: "+18708665101",

  license: "HVAC1625250",
  yearEstablished: 2013,
  // Home/Heating pages say "over 70 years combined"; A/C page says "over 24". Using 70 (dominant). TODO: confirm with Keith.
  combinedExperience: "over 70 years of combined experience",

  address: {
    street: "1839 Champagnolle Rd",
    city: "El Dorado",
    state: "AR",
    zip: "71730",
    full: "1839 Champagnolle Rd, El Dorado, AR 71730",
  },

  // Approximate El Dorado, AR coordinates - refine to the exact pin before launch
  geo: { lat: 33.2076, lng: -92.6663 },

  hours: {
    display: "Mon\u2013Sun 8:00 AM \u2013 5:00 PM \u00b7 24/7 On-Call",
  },

  // Real differentiators pulled from the live site
  highlights: {
    freeEstimates: true,
    laborWarranty: "1-Year Labor Warranty on new equipment installs",
    seasonalVisits: "Yearly Service Efficiency Agreements Available",
    afterHours: "24/7 on-call service",
    financing: "Financing available through Synchrony",
    languages: ["English", "Spanish"],
    brands: ["York", "Luxaire"],
    payments: ["Cash", "Check", "Visa", "MasterCard", "Discover", "American Express", "Financing"],
  },

  social: {
    facebook: "https://facebook.com/610603242366492",
    googleProfileUrl:
      "https://search.google.com/local/reviews?placeid=ChIJVR3T254aMoYRtuI7TH0EZl8",
  },

  reviews: {
    // Aggregate shown on their site: 4.5 across 37 Google + Facebook reviews
    aggregate: { rating: 4.5, count: 37, source: "Google & Facebook" },
  },

  seo: {
    keywords: [
      "HVAC El Dorado AR",
      "air conditioning repair El Dorado",
      "heating repair El Dorado Arkansas",
      "AC installation El Dorado",
      "furnace repair El Dorado",
      "ductwork installation El Dorado",
      "mini split installation El Dorado",
      "HVAC contractor El Dorado AR",
    ],
  },

  ogImage: "/api/assets/company-image.png",
} as const;

export type SiteConfig = typeof siteConfig;
