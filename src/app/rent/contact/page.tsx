import { RENT_CONTACT_PHONE, rentWhatsAppUrl } from "@/api/rental";
import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeft, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";

export const metadata: Metadata = { title: "Contact Us" };

// rent.gigfine.com's own contact page — the rental office has its own number,
// separate from the main site's /contact-us
export default function RentContact() {
  const phone = RENT_CONTACT_PHONE.replace(/\D/g, "");

  return (
    <section className="py-8 md:py-11">
      <div className="container max-w-3xl">
        <Link href="/rent" className="text-sm underline flex items-center gap-1">
          <FaArrowLeft /> All rooms
        </Link>

        <div className="bg-white rounded-xl shadow p-6 sm:p-8 mt-4 flex flex-col gap-5">
          <div>
            <h1 className="h3 mb-1">
              Contact <span className="text-primary">GIGFINE Rent</span>
            </h1>
            <p className="text-gray-600 mb-0">
              Looking for a room or flat, want to book a visit, or list your house? Call or WhatsApp the GIGFINE
              rental office — we arrange every visit with the owner for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <a href={`tel:${phone}`} className="btn btn-primary flex items-center justify-center gap-2">
              <FaPhoneAlt /> Call {RENT_CONTACT_PHONE}
            </a>
            <a
              href={rentWhatsAppUrl("Namaste GIGFINE, I'm looking for a room / flat.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-green flex items-center justify-center gap-2"
            >
              <FaWhatsapp /> WhatsApp {RENT_CONTACT_PHONE}
            </a>
          </div>

          <ul className="flex flex-col gap-3 text-secondary mb-0">
            <li className="flex items-center gap-3">
              <MdEmail className="text-xl shrink-0" />
              <a href="mailto:support.gigfine@gmail.com" className="hover:text-primary break-all">
                support.gigfine@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MdLocationOn className="text-xl shrink-0" />
              Banasthali, Kathmandu, Nepal
            </li>
          </ul>

          <p className="text-xs text-gray-400 mb-0">
            Never pay a deposit before seeing the room. When asking about a room, mention its number (e.g. room #10).
          </p>
        </div>
      </div>
    </section>
  );
}
