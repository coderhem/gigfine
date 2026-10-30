"use client";

import { getMyProfile } from "@/api/user";
import { logout, setUser } from "@/redux/auth/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Landlord pages need a login. Refreshes the profile so a just-approved landlord gets
// ROLE_LANDLORD without logging in again.
// optional: room browsing is public — visitors stay on the page (user is null) instead
// of being sent to login.
export function useRentalSession({ optional = false }: { optional?: boolean } = {}) {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || !localStorage.getItem("token")) {
      dispatch(logout());
      if (optional) {
        setChecking(false);
      } else {
        router.replace(`/rent/login?next=${encodeURIComponent(pathname)}`);
      }
      return;
    }
    getMyProfile()
      .then((profile) => dispatch(setUser(profile)))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  return { user, ready: (optional || !!user) && !checking };
}
