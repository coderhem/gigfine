"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { resetPasswordValidation } from "@/validation/register.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { resetPassword } from "@/api/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordValidation),
  });

  // const { loading } = useSelector((state: any) => state.auth);
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  async function submitForm(data: any) {
    setLoading(true);

    resetPassword({ password: data.password, userId, token })
      .then(() => {
        toast.success("Password reset successfully.");
        router.push("/");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Reset password failed.");
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
      <div className="flex max-w-2xl mx-auto h-full items-center justify-center">
        <div className="bg-white w-full p-6">
          <div className="mb-10">
            <h2 className="h3">Reset password</h2>
            <p>Please enter the new password and update your password.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit(submitForm)}>
            {/* Username */}
            <div className="form-group mb-4">
              <div className="relative">
                <input
                  type={`${show ? "text" : "password"}`}
                  placeholder="Enter password"
                  className="form-control"
                  {...register("password")}
                />
                {show ? (
                  <FaEye
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer"
                    onClick={() => setShow(!show)}
                  />
                ) : (
                  <FaEyeSlash
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer"
                    onClick={() => setShow(!show)}
                  />
                )}
              </div>
              {errors.password && (
                <p className="text-red text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              className="btn btn-primary w-full flex gap-2 items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  Submitting <LoadingSvg />
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
