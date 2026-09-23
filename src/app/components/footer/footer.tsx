import Link from "next/link";
import React from "react";

type Props = {};

const Footer = (props: Props) => {
  const today = new Date().getFullYear();
  return (
    <>
      <div className="bg-secondary text-center [&_p]:mb-0 py-4 text-white font-medium">
      <div className="container">
          <div className="flex flex-wrap justify-center lg:justify-between gap-5">
          <div className="">
            <p>GIGFINE {today}. All rights reserved.</p>
          </div>{" "}
          <div className="flex gap-6">
            <Link href={"about-us"} className="text-white underline hover:no-underline hover:text-primary focus:text-primary focus:no-underline">About Us</Link>
             <Link href={"contact-us"} className="text-white underline hover:no-underline hover:text-primary focus:text-primary focus:no-underline">Contact Us</Link>
            <Link href={"privacy-policy"} className="text-white underline hover:no-underline hover:text-primary focus:text-primary focus:no-underline">Privacy Policy</Link>
            <Link href={"terms-&-conditions"} className="text-white underline hover:no-underline hover:text-primary focus:text-primary focus:no-underline">Terms & Conditions</Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Footer;
