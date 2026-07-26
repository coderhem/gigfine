"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MdArrowDropDown, MdLogout } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/auth/authSlice.js";
import Link from "next/link";
import Image from "next/image";
import headerLogo from "@/public/images/gigfine-logo-img.png";

const LoggedHeader = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const [active, setActive] = useState(false);
  const dropdown = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdown.current) return;

    if (active) {
      dropdown.current.classList.add("active");
    } else {
      dropdown.current.classList.remove("active");
    }
  }, [active]);

  const { user } = useSelector((state: any) => state.auth);

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
          <div className="flex gap-7 items-center">
            <div
              className="group relative cursor-pointer"
              onClick={() => setActive(!active)}
              ref={dropdown}
            >
              <div className="flex gap-2 items-center">
                <span className="bg-secondary flex justify-center items-center size-13 rounded-full font-bold text-white">
                  {user?.name?.trim().split(" ").at(0)?.[0]}
                  {user?.name?.trim().split(" ").at(-1)?.[0]}
                </span>

                <span className="font-bold text-secondary">
                  👋 {user?.name?.split(" ")[0]}
                </span>
                <MdArrowDropDown
                  className={`transition-all duration-300 text-2xl ${active ? "rotate-180" : "rotate-0"}`}
                />
              </div>
              <div
                className={`bg-white mt-2 p-3 rounded shadow flex-col gap-3 ${active ? "flex" : "hidden"} absolute left-1/2 -translate-x-1/2 right-0 top-full z-20 min-w-55 w-full`}
              >
                <Link
                  href="/client/profile"
                  className="text-secondary hover:text-primary"
                >
                  Profile
                </Link>
                {/* <Link href="/client/change-password" className="text-secondary hover:text-primary">
                  Change Password
                </Link> */}
                <Link
                  href="/contact-for-business"
                  className="text-white hover:text-secondary animate-pulse transition-all duration-300 bg-secondary p-1 rounded hover:bg-transparent border border-secondary"
                >
                  Contact for Business
                </Link>
              </div>
            </div>
            <button
              className="btn btn-primary flex gap-2 items-center"
              onClick={handleLogout}
            >
              Logout
              <MdLogout />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoggedHeader;
