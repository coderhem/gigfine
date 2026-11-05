import type { Metadata } from "next";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { RENT_DESCRIPTION, RENT_KEYWORDS, RENT_SITE_NAME, RENT_TITLE } from "@/app/seo";
import { RehydratedOnly } from "@/providers/reduxProvider";
import FindRooms from "./_components/findRooms";
import { getPublicListings, rentJsonLd } from "./_seo/rentSeo";

// The rent site's landing page, built for search and AI answers. Nothing here is visible:
// metadata in <head> and schema.org JSON-LD of the same rooms the cards show.
export const metadata: Metadata = {
  title: { absolute: RENT_TITLE },
  description: RENT_DESCRIPTION,
  keywords: RENT_KEYWORDS,
  alternates: { canonical: "/rent" },
  category: "real estate",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    siteName: RENT_SITE_NAME,
    title: RENT_TITLE,
    description: RENT_DESCRIPTION,
    url: "/rent",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: RENT_TITLE, description: RENT_DESCRIPTION },
  // Local search: Kathmandu Valley (Bagmati Province, NP-P3)
  other: {
    "geo.region": "NP-P3",
    "geo.placename": "Kathmandu",
    "geo.position": "27.7172;85.3240",
    ICBM: "27.7172, 85.3240",
  },
};

export default async function RentHome() {
  const listings = await getPublicListings();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(rentJsonLd(listings)).replace(/</g, "\\u003c") }}
      />
      {/* Waits for the saved login, exactly as before — useRentalSession must not run without it */}
      <RehydratedOnly fallback={<LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />}>
        <FindRooms />
      </RehydratedOnly>
    </>
  );
}
