"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/auth/authSlice";

// Landing page is for visitors. Logged-in users are sent to their dashboard.
// The content is still server-rendered, so search engines see the full page.
const GuestOnly = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(logout());
      return;
    }
    if (user && token) {
      // replace so the back button doesn't bounce through the landing page
      router.replace("/home");
    }
  }, [user, router, dispatch]);

  // Logged in: render nothing while redirecting, so the login form doesn't flash
  if (user) {
    return null;
  }
  return <>{children}</>;
};

export default GuestOnly;
