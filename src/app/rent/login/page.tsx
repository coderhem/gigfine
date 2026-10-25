"use client";
import { apiErrorMessage } from "@/api/config";
import { isLandlord, rentalLoginWithToken } from "@/api/rental";
import LoginForm from "@/app/components/forms/loginForm";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { setUser } from "@/redux/auth/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

// Same GIGFINE account as the main site. Tenants and landlords both log in here.
const RentalLogin = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [handingOver, setHandingOver] = useState(false);

  // A user coming from the main site arrives as /rent/login#token=...
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) return;

    // Remove the token from the address bar and history right away
    window.history.replaceState(null, "", window.location.pathname);

    setHandingOver(true);
    rentalLoginWithToken(token)
      .then((user) => {
        dispatch(setUser(user));
        router.replace(isLandlord(user) ? "/rent/landlord" : "/rent");
      })
      .catch((err) => {
        toast.error(apiErrorMessage(err, "Login failed"));
        setHandingOver(false);
      });
  }, [dispatch, router]);

  if (handingOver) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  return (
    <section className="py-8 md:py-11 lg:py-14 relative before:absolute before:inset-0 before:bg-[url('./assets/images/bg-img.png')] before:object-center before:object-cover before:-z-1 before:bg-bottom before:bg-cover before:bg-no-repeat">
      <div className="bg-white rounded-2xl shadow-2xl border border-secondary/10 p-6 sm:p-8 w-full max-w-md mx-auto">
        <h2 className="h3 normal-case text-center mb-1">
          GIGFINE <span className="text-primary">Rent</span>
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Find a room or flat, or list your house. Use your GIGFINE account.
        </p>
        <LoginForm variant="rental" />
      </div>
    </section>
  );
};

export default RentalLogin;
