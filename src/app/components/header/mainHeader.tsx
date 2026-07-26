"use client";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import headerLogo from "@/public/images/gigfine-logo-img.png";
import Image from "next/image";

const MainHeader = () => {
  return (
    <>
      <header className="max-md:fixed max-md:left-0 max-md:right-0 max-md:z-30 max-md:bg-white max-md:shadow-md">
        <div className="container">
          <div className="py-4 flex flex-wrap justify-between -mx-1 items-center">
            <Link href="/" className="px-1 w-5/12 max-w-30 md:max-w-54">
              <Image
                src={headerLogo}
                width={600}
                height={200}
                alt="Gigfine Logo"
                loading="lazy"
              />
            </Link>
            <ul className="w-7/12 flex flex-wrap px-1 -mx-1.5 items-center justify-end">
              <li className="px-1.5">
                <Link href="/" className="btn btn-primary">
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
