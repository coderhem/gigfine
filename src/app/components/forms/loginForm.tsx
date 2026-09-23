"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { loginValidation } from "@/validation/register.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { loggedUser } from "@/redux/auth/authActions";
import { logout } from "@/redux/auth/authSlice";
import { ADMIN_URL, isAdmin } from "@/api/admin";
import LoadingSvg from "../loader/loadingSvg";

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch<any>();

  const [show, setShow] = useState(false);

  const { loading } = useSelector((state: any) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginValidation),
  });

  const submitForm = async (data: any) => {
    try {
      const user = await dispatch(loggedUser(data)).unwrap();

      // Admins don't use the user site — hand the session over to the admin panel
      if (isAdmin(user)) {
        const token = localStorage.getItem("token") ?? "";
        dispatch(logout());
        toast.success("Redirecting to admin panel...");
        window.location.href = `${ADMIN_URL}/admin/login#token=${encodeURIComponent(token)}`;
        return;
      }

      toast.success("Login successful!");
      router.push("/home");
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Login failed");
    }
  };

  return (
    <>
      <form className="login-form" onSubmit={handleSubmit(submitForm)}>
        {/* Phone */}
        <div className="form-group mb-4">
          <input
            type="text"
            placeholder="Enter phone number or email"
            className="form-control"
            {...register("phone")}
          />

          {errors.phone && (
            <p className="text-red text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="form-group mb-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Enter password"
              className="form-control"
              {...register("password")}
            />

            {show ? (
              <FaEye
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer"
                onClick={() => setShow(false)}
              />
            ) : (
              <FaEyeSlash
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer"
                onClick={() => setShow(true)}
              />
            )}
          </div>

          {errors.password && (
            <p className="text-red text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full flex gap-2 items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              Submitting
              <LoadingSvg />
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      {/* Bottom links */}
      <div className="pt-5 pb-1 text-center">
        <div className="text-end mb-3">
          <Link
            className="text-sm underline hover:no-underline"
            href="/client/forgot-password"
          >
            Forgot Password
          </Link>
        </div>

        <p className="mb-0 max-sm:text-sm">
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </div>

      {/* ROLE POPUP */}
      {/* {showRolePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-center mb-2">
              Continue As
            </h2>

            <p className="text-sm text-gray-500 text-center mb-6">
              This phone number has both Rider and Passenger accounts.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("rider")}
                className="w-full rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 transition"
              >
                <div className="font-semibold">🚗 Continue as Rider</div>

                <div className="text-sm text-gray-500 mt-1">
                  Go to Rider dashboard
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("passenger")}
                className="w-full rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 transition"
              >
                <div className="font-semibold">👤 Continue as Passenger</div>

                <div className="text-sm text-gray-500 mt-1">
                  Go to Passenger dashboard
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowRolePopup(false)}
                className="w-full rounded-xl bg-gray-100 p-3 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
};

export default LoginForm;
