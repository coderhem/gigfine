"use client";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";

const MainHeader = () => {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
    router.refresh();
  };
  return (
    <>
      <div className="container">
        <div className="py-4 flex flex-wrap gap-2 justify-between items-center">
          <h2 className="mb-0">
            <a href="/" className="text-black font-bold">
              GIG<span className="text-primary">Fine</span>
            </a>
          </h2>
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
