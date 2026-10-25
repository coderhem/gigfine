"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MdArrowDropDown, MdBikeScooter, MdLogout } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/redux/auth/authSlice.js";
import Link from "next/link";
import Image from "next/image";
import headerLogo from "@/public/images/gigfine-logo-img.png";
import { FaBell, FaBiking, FaUser } from "react-icons/fa";
import { countUnseen, getMyNotifications } from "@/api/notification";
import { getUserMode } from "@/api/user";
import { RENT_URL } from "@/api/rental";

const LoggedHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const mode = getUserMode(user);
  const isPassenger = mode === "PESSENGER";

  const [active, setActive] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const dropdown = useRef<HTMLDivElement>(null);


  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  // Dropdown
  useEffect(() => {
    if (!dropdown.current) return;

    if (active) {
      dropdown.current.classList.add("active");
    } else {
      dropdown.current.classList.remove("active");
    }
  }, [active]);

  // Unread = newer than the last visit to /notifications (re-checked on every page change)
  useEffect(() => {
    if (!user) return;
    if (pathname === "/notifications") {
      setNotificationCount(0);
      return;
    }
    getMyNotifications()
      .then((data) => setNotificationCount(countUnseen(Array.isArray(data) ? data : [])))
      .catch(() => setNotificationCount(0));
  }, [user, mode, pathname]);

  return (
    <div className="bg-white shadow shadow-secondary/10 fixed left-0 right-0 z-10">
      <div className="container">
        <div className="py-4 flex flex-wrap -mx-1 justify-between items-center">
          {/* Logo */}
          {/* Logged-in users go straight home; "/" is the login page */}
          <Link href="/home" className="px-1 w-5/12 max-w-30 md:max-w-54">
            <Image
              src={headerLogo}
              width={600}
              height={200}
              alt="Gigfine Logo"
              loading="lazy"
            />
          </Link>

          <div className="w-7/12 px-1 flex flex-1 gap-2 sm:gap-7 items-center justify-end max-sm:text-sm">
            {/* Notification */}
            <Link
              href="/notifications"
              className="text-xl relative text-secondary group"
            >
              <FaBell />

              {notificationCount > 0 && (
                <span className="absolute animate-pulse group-hover:animate-none -top-2.5 -right-1 min-w-4 h-4 px-1 flex justify-center items-center rounded-full bg-primary text-white text-xs">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div
              className="group relative cursor-pointer"
              onClick={() => setActive(!active)}
              ref={dropdown}
            >
              <div className="flex gap-2 items-center">
                <span className="bg-secondary flex justify-center items-center size-10 sm:size-13 rounded-full font-bold text-white">
                  {/* {user?.name?.trim().split(" ").at(0)?.[0]}
                  {user?.name?.trim().split(" ").at(-1)?.[0]} */}
                  {isPassenger ? <FaUser/> : <FaBiking className="text-2xl"/>}
                </span>

                <span className="font-bold text-secondary flex-1">
                  👋 {user?.name?.split(" ")[0]}
                </span>

                <MdArrowDropDown
                  className={`transition-all duration-300 text-2xl ${
                    active ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>

              <div
                className={`bg-white mt-2 p-3 rounded shadow flex-col gap-3 ${
                  active ? "flex" : "hidden"
                } absolute left-1/2 -translate-x-1/2 right-0 top-full z-20 min-w-55 w-full`}
              >
                <Link
                  href="/client/profile"
                  className="text-secondary hover:text-primary"
                >
                  Profile
                </Link>

                <Link
                  href="/contact-for-business"
                  className="text-secondary hover:text-primary"
                >
                  Contact for Business
                </Link>

                {/* rent.gigfine.com — hand the session over like the business site */}
                <button
                  type="button"
                  className="text-start text-secondary hover:text-primary cursor-pointer"
                  onClick={() => {
                    const token = localStorage.getItem("token") ?? "";
                    window.location.href = `${RENT_URL}/rent/login#token=${encodeURIComponent(token)}`;
                  }}
                >
                  Rooms for Rent
                </button>
                {/* Logout */}
                <button
                  className="flex gap-2 items-center hover:text-primary transition-all duration-300"
                  onClick={handleLogout}
                >
                  <span className="max-sm:hidden">Logout</span>
                  <MdLogout />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggedHeader;
