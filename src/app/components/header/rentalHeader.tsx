"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { MdLogout } from "react-icons/md";
import headerLogo from "@/public/images/gigfine-logo-img.png";
import { logout } from "@/redux/auth/authSlice";

const NAV = [
  { href: "/rent", label: "Find rooms" },
  { href: "/rent/landlord", label: "My houses" },
];

// Header for rent.gigfine.com (/rent/*)
const RentalHeader = () => {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/rent/login");
  };

  const isActive = (href: string) =>
    href === "/rent"
      ? pathname === "/rent" || pathname.startsWith("/rent/posts")
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="fixed left-0 right-0 z-30 bg-white shadow-md">
      <div className="container">
        <div className="py-4 flex flex-wrap justify-between -mx-1 items-center gap-y-2">
          <Link href="/rent" className="px-1 flex items-center gap-2">
            <Image
              src={headerLogo}
              width={600}
              height={200}
              alt="GIGFINE Rent"
              loading="eager"
              className="w-28 md:w-44 h-auto"
            />
            <span className="text-xs md:text-sm font-semibold px-2 py-1 rounded bg-primary text-white">Rent</span>
          </Link>
          <div className="px-1 flex items-center gap-3 md:gap-5">
            {user ? (
              <>
                <nav className="flex gap-3 md:gap-5 text-sm md:text-base">
                  {NAV.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`hover:text-primary ${isActive(href) ? "text-primary font-semibold" : "text-secondary"}`}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
                <span className="max-lg:hidden text-secondary font-medium">{user.name}</span>
                <button
                  className="flex gap-2 items-center hover:text-primary transition-all duration-300 cursor-pointer"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <span className="max-md:hidden">Logout</span>
                  <MdLogout />
                </button>
              </>
            ) : (
              <>
                <Link href="/rent/login" className="btn btn-primary">
                  Login
                </Link>
                <Link href="/rent/register?as=landlord" className="btn btn-blue max-sm:hidden">
                  List your house
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default RentalHeader;
