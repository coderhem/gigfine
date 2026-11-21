import type { Metadata } from "next";

// Google Play "Delete account URL" for GigFine and GigFine Rentals
export const metadata: Metadata = {
  title: "Delete Your Account",
  description:
    "Ask GIGFINE to delete your GigFine or GigFine Rentals account and the personal data linked to it.",
  alternates: { canonical: "/delete-account" },
  openGraph: { url: "/delete-account" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
