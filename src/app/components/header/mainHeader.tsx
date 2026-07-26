"use client";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";
import headerLogo from "@/public/images/gigfine-logo-img.png"
import Image from "next/image";


const MainHeader = () => {
  return (
    <>
      <div className="container">
        <div className="py-4 flex flex-wrap gap-2 justify-between items-center">
            <Link href="/" className="max-w-54">
              <Image
                src={headerLogo}
                width={600}
                height={200}
                alt="Gigfine Logo"
                loading="lazy"
              />
            </Link>
          <ul className="flex gap-3 items-center">
            <li>
              <Link href="/" className="btn btn-primary">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="btn btn-blue">
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default MainHeader;
