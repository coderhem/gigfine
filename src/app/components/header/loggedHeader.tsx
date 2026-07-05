"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowDropDown, MdLogout } from "react-icons/md";

const LoggedHeader = () => {
  const router = useRouter();
  
  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });
    router.push("/");
  };
  const [active, setActive] = useState(false);
  const dropdown = useRef<HTMLDivElement>(null);
  const [user, setUsers] = useState<any>({});

  useEffect(() => {
    if (!dropdown.current) return;

    if (active) {
      dropdown.current.classList.add("active");
    } else {
      dropdown.current.classList.remove("active");
    }
  }, [active]);

  const getUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();

    console.log("API data:", data);

    if (data.success) {
      setUsers(data.users[0]);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);
  return (
    <>
      <div className="container">
        <div className="py-4 flex flex-wrap gap-2 justify-between items-center">
          <h2 className="mb-0">
            <a href="/" className="text-secondary font-bold lowercase">
              {/* GIG<span className="text-primary">Fine</span> */}
              gigfine
            </a>
          </h2>
          <div className="flex gap-7 items-center">
            <div
              className="group relative cursor-pointer"
              onClick={() => setActive(!active)}
              ref={dropdown}
            >
              <div className="flex gap-2 items-center">
                <span className="bg-secondary flex justify-center items-center size-13 rounded-full font-bold text-white">
                  {user?.fullName?.trim().split(" ").filter(Boolean).at(0)?.[0]}
                  {
                    user?.fullName
                      ?.trim()
                      .split(" ")
                      .filter(Boolean)
                      .at(-1)?.[0]
                  }
                </span>

                <span className="font-bold text-secondary">
                  👋 {user?.fullName?.split(" ")[0]}
                </span>
                <MdArrowDropDown
                  className={`transition-all duration-300 text-2xl ${active ? "rotate-180" : "rotate-0"}`}
                />
              </div>
              <div
                className={`bg-white mt-2 p-3 rounded shadow flex-col gap-3 ${active ? "flex" : "hidden"} absolute left-1/2 -translate-x-1/2 right-0 top-full z-20 min-w-55 w-full`}
              >
                <a href="#" className="text-secondary hover:text-primary">
                  Profile
                </a>
                <a href="#" className="text-secondary hover:text-primary">
                  Change Password
                </a>
                <a
                  href="#"
                  className="text-white hover:text-secondary animate-pulse transition-all duration-300 bg-secondary p-1 rounded hover:bg-transparent border border-secondary"
                >
                  Contact for Business
                </a>
              </div>
            </div>
            <Link
              href="/"
              className="btn btn-primary flex gap-2 items-center"
              onClick={logout}
            >
              Logout
              <MdLogout />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoggedHeader;
