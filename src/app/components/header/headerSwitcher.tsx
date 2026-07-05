"use client";
import { usePathname } from "next/navigation";
import MainHeader from "./mainHeader";
import LoggedHeader from "./loggedHeader";

export default function HeaderSwitcher() {
  const pathname = usePathname();

  const dashboardRoutes = ["/dashboard", "/home"];

  return dashboardRoutes.includes(pathname) ? <LoggedHeader /> : <MainHeader />;
}
