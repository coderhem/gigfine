"use client";
import Link from "next/link";
import React from "react";
import headerLogo from "@/public/images/gigfine-logo-img.png";
import Image from "next/image";
import { FaHome } from "react-icons/fa";
import { RENT_URL } from "@/api/rental";

const MainHeader = () => {
  return (
    <>
      <header className="fixed left-0 right-0 z-30 bg-white shadow-md">
        <div className="container">
          <div className="py-4 flex flex-wrap justify-between -mx-1 items-center">
            <Link href="/" className="px-1 w-5/12 max-w-30 md:max-w-54">
              <Image
                src={headerLogo}
                width={600}
                height={200}
                alt="GIGFINE – report ride-sharing problems in Nepal"
                // Above the fold on every page: load it first, not lazily
                loading="eager"
                fetchPriority="high"
              />
            </Link>
            <ul className="w-7/12 flex flex-wrap px-1 -mx-1.5 items-center justify-end">
              {/* Public room listing on rent.gigfine.com — no login needed */}
              <li className="px-1.5">
                <a
                  href={`${RENT_URL}/rent`}
                  className="flex items-center gap-1.5 font-semibold text-secondary hover:text-primary transition-colors"
                >
                  <FaHome className="text-primary" />
                  <span className="max-sm:hidden">Find rooms</span>
                  <span className="sm:hidden max-[380px]:hidden">Rooms</span>
                </a>
              </li>
              <li className="px-1.5">
                <Link href="/login" className="btn btn-primary">
                  Login
                </Link>
              </li>
              <li className="px-1.5">
                <Link href="/register" className="btn btn-blue">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
};

export default MainHeader;
