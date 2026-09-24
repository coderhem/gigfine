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
