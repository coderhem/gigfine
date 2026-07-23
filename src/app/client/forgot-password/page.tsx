"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { forgotPasswordValidation } from "@/validation/register.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { forgotPassword } from "@/api/auth";

const ForgotPassword = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordValidation),
  });

  // const { loading } = useSelector((state: any) => state.auth);

  async function submitForm(data: any) {
    setLoading(true);

    forgotPassword(data)
      .then(() => {
        toast.success("Reset password link has been sent successfully.");
        router.push("/");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Reset password link sending failed.");
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
      <div className="flex max-w-2xl mx-auto h-full items-center justify-center">
        <div className="bg-white w-full p-6">
          <div className="mb-10">
            <h2 className="h3">Forgot password</h2>
            <p>Please enter email to receive the reset password link.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit(submitForm)}>
            {/* Username */}
            <div className="form-group mb-4">
              <input
                type="email"
                placeholder="Enter email address"
                className="form-control"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red text-sm mt-1">{errors.email.message}</p>
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
                "Sent Link"
              )}
            </button>
          </form>
          <div className="pt-5 pb-1 text-center">
            <p>
              Remember your password?{" "}
              <Link href="/">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
