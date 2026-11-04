"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RENT_CONTACT_PHONE, rentWhatsAppUrl } from "@/api/rental";
import { RIDE_SHARING_APPS } from "@/app/seo";

// Absolute hrefs: relative ones broke on nested routes (/client/profile → /client/contact-us)
const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/register", label: "Register" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/contact-for-business", label: "Partner With Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-&-conditions", label: "Terms & Conditions" },
];

// rent.gigfine.com only serves /rent/* and the legal pages (see src/proxy.ts)
const RENT_LINKS = [
  { href: "/rent", label: "Find rooms" },
  { href: "/rent/register?as=landlord", label: "List your house" },
  { href: "/rent/contact", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-&-conditions", label: "Terms & Conditions" },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const isRent = usePathname()?.startsWith("/rent") ?? false;
  const links = isRent ? RENT_LINKS : LINKS;
  return (
    <footer className="bg-secondary text-white [&_p]:mb-0 pt-8 pb-5">
      <div className="container">
        <div className="flex flex-wrap justify-between gap-6 pb-6 border-b border-white/15">
          <div className="max-w-md">
            <p className="text-xl font-bold">
              GIGFINE
            </p>
            {isRent ? (
              <>
                <p className="text-white/75 text-sm mt-2">
                  Rooms and flats for rent in Nepal — every visit arranged by the GIGFINE office.
                </p>
                <p className="text-sm mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  <a href={`tel:${RENT_CONTACT_PHONE.replace(/\D/g, "")}`} className="text-white hover:text-primary">
                    Call {RENT_CONTACT_PHONE}
                  </a>
                  <a href={rentWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary">
                    WhatsApp {RENT_CONTACT_PHONE}
                  </a>
                </p>
              </>
            ) : (
              <p className="text-white/75 text-sm mt-2">
                Report ride-sharing problems in Nepal — for passengers and riders
                of {RIDE_SHARING_APPS.join(", ")} and more.
              </p>
            )}
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white hover:text-primary focus:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="text-center text-sm text-white/70 pt-4">
          © {year} GIGFINE. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
