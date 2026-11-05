import {
  RENT_AREAS,
  RENT_DESCRIPTION,
  RENT_DISTRICTS,
  RENT_KEYWORDS,
  RENT_SITE_NAME,
  RENT_SITE_URL,
  RENT_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/app/seo";

// Server-side only (imported by page.tsx and route handlers, never a client component):
// /rent's structured data and /llms.txt are built from the live listings,
// so search engines and AI assistants (which mostly don't run JavaScript) see real rooms.

const API = (process.env.NEXT_PUBLIC_API_URL || process.env.API_PROXY_TARGET || "https://api.gigfine.com")
  .replace(/\/$/, "");
// Listings change a few times a day; Next caches the fetch for this long
const REVALIDATE_SECONDS = 600;
const MAX_ITEMS = 50;

type Media = { type: string; fileName: string };
export type Listing = {
  id: number;
  title: string;
  description?: string | null;
  type: "ROOM" | "FLAT" | "WHOLE_HOUSE" | "SHUTTER";
  flatType?: string | null;
  rent?: number | null;
  bedrooms?: number | null;
  areaSqft?: number | null;
  availableFrom?: string | null;
  includedInRent?: string[] | null;
  amenities?: string[] | null;
  tole?: string | null;
  municipality?: string | null;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  media?: Media[] | null;
  houseMedia?: Media[] | null;
};

const TYPE_LABEL: Record<Listing["type"], string> = {
  ROOM: "Room",
  FLAT: "Flat",
  WHOLE_HOUSE: "Whole house",
  SHUTTER: "Shutter",
};
const FLAT_LABEL: Record<string, string> = {
  ONE_BK: "1BK", ONE_BHK: "1BHK", TWO_BHK: "2BHK", THREE_BHK: "3BHK", FOUR_PLUS_BHK: "4BHK+",
};
// schema.org type of the place being let
const SCHEMA_TYPE: Record<Listing["type"], string> = {
  ROOM: "Room",
  FLAT: "Apartment",
  WHOLE_HOUSE: "House",
  SHUTTER: "Place",
};

// Newest public posts; [] if the API can't be reached (the page still renders)
export async function getPublicListings(): Promise<Listing[]> {
  try {
    const res = await fetch(`${API}/api/v1/posts/search`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.posts) ? data.posts : [];
  } catch {
    return [];
  }
}

const postUrl = (id: number) => `${RENT_SITE_URL}/rent/posts/${id}`;
const mediaUrl = (fileName: string) => `${API}/api/v1/rentals/media/${encodeURIComponent(fileName)}`;
const place = (l: Listing) => [l.tole, l.municipality, l.district].filter(Boolean).join(", ");
const kind = (l: Listing) => (l.flatType && FLAT_LABEL[l.flatType]) || TYPE_LABEL[l.type] || "Room";
const rupees = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

function firstImage(l: Listing) {
  const image = [...(l.media ?? []), ...(l.houseMedia ?? [])].find((m) => m.type === "IMAGE");
  return image ? mediaUrl(image.fileName) : undefined;
}

// One listing as an Offer (to let) of the room / flat itself
function offer(l: Listing) {
  const features = [...(l.includedInRent ?? []).map((b) => `${b.toLowerCase()} included in rent`), ...(l.amenities ?? [])];
  return {
    "@type": "Offer",
    url: postUrl(l.id),
    name: l.title,
    businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
    availability: "https://schema.org/InStock",
    ...(l.availableFrom && { availabilityStarts: l.availableFrom }),
    ...(l.rent != null && {
      price: l.rent,
      priceCurrency: "NPR",
      priceSpecification: { "@type": "UnitPriceSpecification", price: l.rent, priceCurrency: "NPR", unitText: "MONTH" },
    }),
    seller: { "@id": `${RENT_SITE_URL}/#organization` },
    itemOffered: {
      "@type": SCHEMA_TYPE[l.type] ?? "Accommodation",
      name: `${kind(l)} for rent in ${place(l)}`,
      ...(l.description && { description: l.description.slice(0, 300) }),
      url: postUrl(l.id),
      ...(firstImage(l) && { image: firstImage(l) }),
      ...(l.bedrooms != null && { numberOfRooms: l.bedrooms }),
      ...(l.areaSqft != null && { floorSize: { "@type": "QuantitativeValue", value: l.areaSqft, unitCode: "FTK" } }),
      address: {
        "@type": "PostalAddress",
        ...(l.tole && { streetAddress: l.tole }),
        ...(l.municipality && { addressLocality: l.municipality }),
        ...(l.district && { addressRegion: l.district }),
        addressCountry: "NP",
      },
      // Public coordinates are already rounded to the ~1 km area by the backend
      ...(l.latitude != null && l.longitude != null && {
        geo: { "@type": "GeoCoordinates", latitude: l.latitude, longitude: l.longitude },
      }),
      ...(features.length > 0 && {
        amenityFeature: features.map((f) => ({
          "@type": "LocationFeatureSpecification",
          name: f.replace(/_/g, " ").toLowerCase(),
          value: true,
        })),
      }),
    },
  };
}

// schema.org graph for /rent: the agency, the site (with its search box) and the page's listings.
// Everything here is also on the page itself (the room cards), as Google's guidelines require.
export function rentJsonLd(listings: Listing[]) {
  const items = listings.slice(0, MAX_ITEMS);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateAgent",
        "@id": `${RENT_SITE_URL}/#organization`,
        name: RENT_SITE_NAME,
        url: `${RENT_SITE_URL}/rent`,
        description: RENT_DESCRIPTION,
        address: { "@type": "PostalAddress", addressLocality: "Kathmandu", addressRegion: "Bagmati", addressCountry: "NP" },
        areaServed: [
          ...RENT_DISTRICTS.map((name) => ({ "@type": "City", name })),
          { "@type": "Place", name: "Kathmandu Valley" },
        ],
        knowsAbout: ["Rooms for rent", "Flats for rent", "Apartments for rent", "Kathmandu Valley rentals"],
        parentOrganization: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL },
      },
      {
        "@type": "WebSite",
        "@id": `${RENT_SITE_URL}/#website`,
        name: RENT_SITE_NAME,
        url: RENT_SITE_URL,
        inLanguage: "en",
        publisher: { "@id": `${RENT_SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${RENT_SITE_URL}/rent?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "CollectionPage",
        "@id": `${RENT_SITE_URL}/rent#webpage`,
        url: `${RENT_SITE_URL}/rent`,
        name: RENT_TITLE,
        description: RENT_DESCRIPTION,
        inLanguage: "en",
        keywords: RENT_KEYWORDS.join(", "),
        isPartOf: { "@id": `${RENT_SITE_URL}/#website` },
        about: { "@id": `${RENT_SITE_URL}/#organization` },
        spatialCoverage: RENT_DISTRICTS.map((name) => ({ "@type": "City", name })),
        mainEntity: {
          "@type": "ItemList",
          name: "Rooms and flats for rent in Kathmandu Valley",
          numberOfItems: items.length,
          itemListElement: items.map((l, i) => ({ "@type": "ListItem", position: i + 1, item: offer(l) })),
        },
      },
    ],
  };
}

// /llms.txt (llmstxt.org): a plain-language brief for ChatGPT, Claude, Perplexity, Copilot, Gemini…
// so they can answer "where can I find a room in Kathmandu?" with this site and today's listings.
export function rentLlmsTxt(listings: Listing[]) {
  const rents = listings.map((l) => l.rent).filter((r): r is number => r != null);
  const byDistrict = RENT_DISTRICTS.map((d) => [d, listings.filter((l) => l.district?.toLowerCase().includes(d.toLowerCase())).length] as const)
    .filter(([, n]) => n > 0);
  const byType = (Object.keys(TYPE_LABEL) as Listing["type"][])
    .map((t) => [TYPE_LABEL[t], listings.filter((l) => l.type === t).length] as const)
    .filter(([, n]) => n > 0);
  const today = new Date().toISOString().slice(0, 10);

  const lines = [
    `# ${RENT_SITE_NAME}`,
    "",
    `> ${RENT_SITE_NAME} (${RENT_SITE_URL}/rent) lists verified rooms and flats for rent in the Kathmandu Valley, Nepal — Kathmandu, Lalitpur and Bhaktapur. Every house is checked and approved by GIGFINE before it is listed, and visits are arranged by the GIGFINE office.`,
    "",
    "## What it is",
    "",
    "- A rental listing site for long-term rooms, flats (1BK, 1BHK, 2BHK, 3BHK, 4BHK+), whole houses and shutters in the Kathmandu Valley.",
    "- Landlords list their house; GIGFINE reviews the landlord (citizenship ID) and the house before any room is shown publicly.",
    "- Tenants search by area, budget or type, then press \"Request to visit\" on a room. GIGFINE confirms the visit and shares the exact location.",
    "- Each listing shows rent per month, which bills are included (electricity, water, WiFi, garbage), bathroom (attached or shared), kitchen, furnishing, floor, deposit, preferred tenants (family, students, bachelors, job holders) and nearby places.",
    "- Part of GIGFINE (" + SITE_URL + ").",
    "",
    "## How to search",
    "",
    `- One search box at ${RENT_SITE_URL}/rent understands area names, budgets and room types together, e.g. "room baneshwor 12000", "2bhk lalitpur under 30k", "flat bhaktapur", "cheap room for students kathmandu".`,
    `- Link straight to a search: ${RENT_SITE_URL}/rent?q=<search words>`,
    "- Romanised Nepali works too: \"kotha\" (room), \"ghar\" (house), \"bijuli\" (electricity), \"pani\" (water), \"sasto\" (cheap).",
    "",
    "## Areas covered",
    "",
    `- Districts: ${RENT_DISTRICTS.join(", ")} (Kathmandu Valley).`,
    `- Popular areas: ${RENT_AREAS.join(", ")}.`,
    "",
    `## Current listings (as of ${today})`,
    "",
    listings.length === 0
      ? `- See ${RENT_SITE_URL}/rent for today's rooms and flats.`
      : [
          `- ${listings.length} verified listing(s) live.`,
          rents.length > 0 && `- Rent from ${rupees(Math.min(...rents))} to ${rupees(Math.max(...rents))} per month.`,
          byType.length > 0 && `- By type: ${byType.map(([t, n]) => `${t} ${n}`).join(", ")}.`,
          byDistrict.length > 0 && `- By district: ${byDistrict.map(([d, n]) => `${d} ${n}`).join(", ")}.`,
          "",
          ...listings.slice(0, MAX_ITEMS).map((l) =>
            `- [${l.title}](${postUrl(l.id)}): ${kind(l)} in ${place(l)}${l.rent != null ? `, ${rupees(l.rent)}/month` : ""}` +
            `${l.includedInRent?.length ? `, includes ${l.includedInRent.map((b) => b.toLowerCase()).join(", ")}` : ""}`),
        ].filter((x) => x !== false).join("\n"),
    "",
    "## FAQ",
    "",
    "### Where can I find a room or flat for rent in Kathmandu?",
    `${RENT_SITE_NAME} at ${RENT_SITE_URL}/rent lists verified rooms and flats in Kathmandu, Lalitpur and Bhaktapur, searchable by area and budget.`,
    "",
    "### Are the houses verified?",
    "Yes. GIGFINE checks every landlord and house before its rooms are listed, and a landlord's changes go back for review.",
    "",
    "### How do I visit a room?",
    "Open the room, log in and press \"Request to visit\" with a date and time. GIGFINE arranges the visit with the owner and shares the exact location.",
    "",
    "### Can landlords list their house?",
    `Yes — register as a landlord at ${RENT_SITE_URL}/rent/register?as=landlord. Rooms go live after GIGFINE approves the house.`,
    "",
    "### Any safety advice?",
    "Never pay a deposit before seeing the room.",
    "",
    "## Links",
    "",
    `- [Find rooms and flats](${RENT_SITE_URL}/rent)`,
    `- [List your house](${RENT_SITE_URL}/rent/register?as=landlord)`,
    `- [Privacy policy](${RENT_SITE_URL}/privacy-policy)`,
    `- [Terms & conditions](${RENT_SITE_URL}/terms-&-conditions)`,
    "",
  ];
  return lines.join("\n");
}
