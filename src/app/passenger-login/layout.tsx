import type { Metadata } from "next";

// Logged-in area — keep it out of search results
export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
