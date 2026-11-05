// Shared SEO constants for metadata, sitemap, robots, manifest and JSON-LD
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gigfine.com"
).replace(/\/$/, "");

export const SITE_NAME = "GIGFINE";

export const SITE_TITLE =
  "GIGFINE – Report Ride-Sharing Problems in Nepal | Pathao, inDrive, Yango";

export const SITE_DESCRIPTION =
  "GIGFINE is Nepal's platform for passengers and riders of every ride-sharing app — Pathao, inDrive, Yango, Tufan, Uber, Sajilo, Firiri and more — to report incidents, safety concerns and payment issues with text, voice notes or photos, and track each report until it is resolved.";

// Same list as the report form's company options
export const RIDE_SHARING_APPS = ["Pathao", "inDrive", "Yango", "Tufan", "Uber", "Sajilo", "Firiri"];

export const KEYWORDS = [
  "ride sharing complaint Nepal",
  "report ride sharing problem",
  "Pathao complaint",
  "inDrive complaint Nepal",
  "Yango complaint Nepal",
  "Sajilo complaint",
  "Firiri complaint",
  "Tufan complaint",
  "Uber complaint Nepal",
  "rider problem Nepal",
  "passenger safety Nepal",
  "ride incident report",
  "gig worker Nepal",
  "Kathmandu ride sharing",
  "GIGFINE",
];

// Crawlable, public routes (used by the sitemap and the rehydration gate)
export const PUBLIC_ROUTES = [
  "/",
  "/register",
  "/contact-us",
  "/contact-for-business",
  "/privacy-policy",
  "/terms-&-conditions",
];

// ---------- rent.gigfine.com (APP_MODE=rental) ----------

export const RENT_SITE_URL = (
  process.env.NEXT_PUBLIC_RENT_URL || "https://rent.gigfine.com"
).replace(/\/$/, "");

export const RENT_SITE_NAME = "GIGFINE Rent";

// Crawlable rent pages (the rent sitemap; the rehydration gate lets them render server-side)
export const RENT_PUBLIC_ROUTES = ["/rent"];

export const RENT_TITLE = "Rooms & Flats for Rent in Kathmandu Valley | GIGFINE Rent";

export const RENT_DESCRIPTION =
  "Verified rooms and flats for rent in Kathmandu, Lalitpur and Bhaktapur. Search by area or budget — single rooms, 1BHK, 2BHK, 3BHK — and book a visit through GIGFINE.";

// Kathmandu Valley: the districts, then the areas tenants search for most
export const RENT_DISTRICTS = ["Kathmandu", "Lalitpur", "Bhaktapur"];
export const RENT_AREAS = [
  "Baneshwor", "Koteshwor", "Tinkune", "Sinamangal", "Kalanki", "Balkhu", "Kalimati", "Chabahil",
  "Boudha", "Jorpati", "Gaushala", "Maharajgunj", "Baluwatar", "Lazimpat", "Thamel", "Samakhushi",
  "Gongabu", "Tokha", "Budhanilkantha", "Kirtipur", "Sitapaila", "Swayambhu", "Putalisadak", "Bagbazar",
  "Jawalakhel", "Pulchowk", "Kupondole", "Sanepa", "Ekantakuna", "Satdobato", "Imadol", "Gwarko",
  "Balkumari", "Bhaisepati", "Dhapakhel", "Thimi", "Suryabinayak", "Kausaltar", "Sallaghari",
];

// What people type, in English, Romanised Nepali and Nepali
export const RENT_KEYWORDS = [
  "room for rent in Kathmandu",
  "flat for rent in Kathmandu",
  "room rent Kathmandu",
  "rooms for rent Kathmandu Valley",
  "flat for rent in Lalitpur",
  "room for rent in Lalitpur",
  "room for rent in Bhaktapur",
  "flat for rent in Bhaktapur",
  "1BHK flat for rent Kathmandu",
  "2BHK flat for rent Kathmandu",
  "3BHK flat for rent Kathmandu",
  "single room for rent Kathmandu",
  "cheap room in Kathmandu",
  "room for students in Kathmandu",
  "room for bachelor Kathmandu",
  "family flat for rent Kathmandu",
  "shutter for rent Kathmandu",
  "house for rent Kathmandu",
  "verified rooms Kathmandu",
  "room with attached bathroom Kathmandu",
  "kotha bhada",
  "kotha bhada Kathmandu",
  "kotha bhadama",
  "flat bhada Kathmandu",
  "कोठा भाडामा",
  "कोठा भाडामा काठमाडौं",
  "फ्ल्याट भाडामा",
  "घर भाडामा काठमाडौं",
  "GIGFINE Rent",
];

// Shown on the landing page and emitted as FAQPage structured data
export const FAQS = [
  {
    q: "Who can report a problem on GIGFINE?",
    a: "Anyone who uses ride-sharing in Nepal. Passengers can report a problem with a ride or a rider, and riders can report problems with a passenger, the app, or payments.",
  },
  {
    q: "Which ride-sharing apps are covered?",
    a: `All of them — including ${RIDE_SHARING_APPS.join(", ")}. Pick the company when you create your report.`,
  },
  {
    q: "Do I have to type my complaint?",
    a: "No. You can describe the problem in text, record a voice note right from your phone, or upload an audio file. Adding a photo is optional.",
  },
  {
    q: "How do I know what happened to my report?",
    a: "Every report has a status — Pending, Under Review, Resolved or Rejected — that you can follow from your dashboard. You can also edit a report within 2 hours of posting it.",
  },
  {
    q: "Is it free?",
    a: "Yes. Creating an account and reporting problems on GIGFINE is free for passengers and riders.",
  },
];
