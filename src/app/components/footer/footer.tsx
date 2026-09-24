import Link from "next/link";
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

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-secondary text-white [&_p]:mb-0 pt-8 pb-5">
      <div className="container">
        <div className="flex flex-wrap justify-between gap-6 pb-6 border-b border-white/15">
          <div className="max-w-md">
            <p className="text-xl font-bold">
              GIG<span className="text-primary">FINE</span>
            </p>
            <p className="text-white/75 text-sm mt-2">
              Report ride-sharing problems in Nepal — for passengers and riders
              of {RIDE_SHARING_APPS.join(", ")} and more.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {LINKS.map((l) => (
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
