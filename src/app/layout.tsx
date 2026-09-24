import type { Metadata, Viewport } from "next";
import {
  KEYWORDS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "./seo";
import { Outfit, Montserrat } from "next/font/google";
import "./globals.css";
import Footer from "@/app/components/footer/footer";
import Fancybox from "@/app/components/fancybox/popup";
import HeaderSwitcher from "@/app/components/header/headerSwitcher";
import { Toaster } from "react-hot-toast";
import Providers from "@/providers/reduxProvider";
import AuthGuard from "@/redux/auth/authGuard";
import Script from "next/script";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  category: "transportation",
  // canonical is set per page — a root canonical would be inherited by every route
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0c589c",
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
      <body className="min-h-full flex flex-col relative before:absolute before:inset-0 before:bg-[url('./assets/images/bg-img.png')] before:object-center before:object-cover before:-z-1 before:bg-bottom before:bg-cover before:bg-no-repeat">
        <Providers>
          <Fancybox>
            <AuthGuard>
              <HeaderSwitcher />
              <main className="grow max-md:pt-20 md:mt-24">{children}</main>
              <Footer />
              <Toaster
                position="top-center"
                toastOptions={{
                  className: "!min-w-max !max-w-max",
                }}
              />
            </AuthGuard>
          </Fancybox>
        </Providers>
      </body>
      {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JV0R865JM4"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-JV0R865JM4');
          `}
        </Script>
    </html>
  );
}
