"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";

export default function AuthGuard({ children }: any) {
  const { user } = useSelector((state: any) => state.auth);

  const router = useRouter();
  // useEffect(() => {
  //   if (!user) {
  //     router.push("/");
  //   }
  // }, [user, router]);

  return children;
}
