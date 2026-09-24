import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Free Account – Passenger or Rider",
  description:
    "Sign up free as a passenger or rider to report ride-sharing problems in Nepal — Pathao, inDrive, Yango, Sajilo, Firiri and more — and track every report until it is resolved.",
  alternates: { canonical: "/register" },
  openGraph: { url: "/register" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
