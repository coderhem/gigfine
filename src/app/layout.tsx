import type { Metadata } from "next";
import { Outfit, Montserrat } from "next/font/google";
import "./globals.css";
import Footer from "@/app/components/footer/footer";
import Fancybox from "@/app/components/fancybox/popup";
import HeaderSwitcher from "@/app/components/header/headerSwitcher";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChiyaCut",
  description: "Nepals First Query Company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative before:absolute before:inset-0 before:bg-[url('/assets/images/bg-img.png')] before:object-center before:object-cover before:-z-1 before:bg-bottom">
        <Fancybox>
          <HeaderSwitcher />
          <main className="grow">{children}</main>
          <Footer />
        </Fancybox>
      </body>
    </html>
  );
}
