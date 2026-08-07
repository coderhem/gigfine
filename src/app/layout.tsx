import type { Metadata } from "next";
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
  title: "Gigfine",
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
      <body className="min-h-full flex flex-col relative before:absolute before:inset-0 before:bg-[url('./assets/images/bg-img.png')] before:object-center before:object-cover before:-z-1 before:bg-bottom before:bg-cover before:bg-no-repeat">
        <Providers>
          <Fancybox>
            <AuthGuard>
              <HeaderSwitcher />
              <main className="grow max-md:pt-20">{children}</main>
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
          src="https://www.googletagmanager.com/gtag/js?id=G-MT82L4ZY95"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-MT82L4ZY95');
          `}
        </Script>
    </html>
  );
}
