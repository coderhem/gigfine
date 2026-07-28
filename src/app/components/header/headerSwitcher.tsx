// "use client";
// import { usePathname } from "next/navigation";
// import MainHeader from "./mainHeader";
// import LoggedHeader from "./loggedHeader";
// import { useSelector } from "react-redux";

// export default function HeaderSwitcher() {
// const user = useSelector((state) => state.auth.user);

//   const isLoggedIn = !!user;

//   const pathname = usePathname();

//   const dashboardRoutes = ["/dashboard", "/home"];

//   return dashboardRoutes.includes(pathname) ? <LoggedHeader /> : <MainHeader />;
// }

"use client";
import MainHeader from "./mainHeader";
import LoggedHeader from "./loggedHeader";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";

export default function HeaderSwitcher() {
  const pathname = usePathname();
  
  // Admin pages मा header नै नदेखाउने
  if (pathname.startsWith("/admin")) {
    return null;
  }
  const user = useSelector((state: any) => state.auth.user);

  return user ? <LoggedHeader /> : <MainHeader />;
}
