import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner With Us",
  description:
    "Ride-sharing companies, organisations and media can partner with GIGFINE to understand and resolve the problems passengers and riders face in Nepal.",
  alternates: { canonical: "/contact-for-business" },
  openGraph: { url: "/contact-for-business" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
