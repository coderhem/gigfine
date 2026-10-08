"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { MdLogout } from "react-icons/md";
import headerLogo from "@/public/images/gigfine-logo-img.png";
import { logout } from "@/redux/auth/authSlice";

// Header for business.gigfine.com (/business/*)
const BusinessHeader = () => {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/business/login");
  };

  return (
    <header className="fixed left-0 right-0 z-30 bg-white shadow-md">
      <div className="container">
        <div className="py-4 flex flex-wrap justify-between -mx-1 items-center">
          <Link href="/business" className="px-1 flex items-center gap-2">
            <Image
              src={headerLogo}
              width={600}
              height={200}
              alt="GIGFINE Business"
              loading="eager"
              className="w-28 md:w-44 h-auto"
            />
            <span className="text-xs md:text-sm font-semibold px-2 py-1 rounded bg-secondary text-white">
              Business
            </span>
          </Link>
          <div className="px-1 flex items-center gap-3">
            {user ? (
              <>
                <span className="max-sm:hidden text-secondary font-medium">{user.name}</span>
                <button
                  className="flex gap-2 items-center hover:text-primary transition-all duration-300 cursor-pointer"
                  onClick={handleLogout}
                >
                  <span className="max-sm:hidden">Logout</span>
                  <MdLogout />
                </button>
              </>
            ) : (
              <>
                <Link href="/business/login" className="btn btn-primary">
                  Login
                </Link>
                <Link href="/business/register" className="btn btn-blue">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default BusinessHeader;
