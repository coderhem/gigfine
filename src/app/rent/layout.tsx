import type { Metadata } from "next";

// Every rental page needs a login, so keep them out of search results for now
export const metadata: Metadata = {
  title: {
    default: "Rooms & Flats for Rent",
    template: "%s | GIGFINE Rent",
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
