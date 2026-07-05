import React from "react";

type Props = {};

const Footer = (props: Props) => {
const today = new Date().getFullYear();  return (
    <>
      <div className="bg-secondary text-center [&_p]:mb-0 py-4 text-white font-medium">
        <p>GIGFine {today}. All rights reserved.</p>
      </div>
    </>
  );
};

export default Footer;
