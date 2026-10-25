"use client";

import { getMyProfile } from "@/api/user";
import { logout, setUser } from "@/redux/auth/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Every rental page needs a login (the backend wants a token for all of /api/v1 except auth).
// Refreshes the profile so a just-approved landlord gets ROLE_LANDLORD without logging in again.
export function useRentalSession() {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || !localStorage.getItem("token")) {
      dispatch(logout());
      router.replace(`/rent/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    getMyProfile()
      .then((profile) => dispatch(setUser(profile)))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  return { user, ready: !!user && !checking };
}
