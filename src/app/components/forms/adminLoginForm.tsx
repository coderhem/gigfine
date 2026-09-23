"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { loginValidation } from "@/validation/register.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import LoadingSvg from "../loader/loadingSvg";
import { adminLogin, adminLoginWithToken } from "@/api/admin.js";
import { apiErrorMessage } from "@/api/config";

const AdminLoginForm = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginValidation),
  });

  // Admin logged in on the user site gets sent here as /admin/login#token=...
  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get(
      "token",
    );
    if (!token) return;

    // Remove the token from the address bar and history right away
    window.history.replaceState(null, "", window.location.pathname);

    setLoading(true);
    adminLoginWithToken(token)
      .then(() => {
        toast.success("Admin Login Successful!");
        router.replace("/admin/dashboard");
      })
      .catch((err: any) => {
        toast.error(apiErrorMessage(err, "Login Failed"));
        setLoading(false);
      });
  }, [router]);

  async function submitForm(data: any) {
    setLoading(true);
    try {
      await adminLogin(data);
      toast.success("Admin Login Successful!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(apiErrorMessage(err, "Login Failed"));
    } finally {
      setLoading(false);
    }
  }

  
  return (
    <>
      <form className="login-form" onSubmit={handleSubmit(submitForm)}>
        {/* Username */}
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
            <p className="text-red text-sm mt-1">{errors.password.message}</p>
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
            "Login"
          )}
        </button>
      </form>
      {/* <div className="pt-5 pb-1 text-center">
        <div className="text-end mb-3">
          <Link
            className="text-sm underline hover:no-underline"
            href={"/client/forgot-password"}
          >
            Forgot Password
          </Link>
        </div>{" "}
        <p className="mb-0 max-sm:text-sm">
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </div> */}
    </>
  );
};

export default AdminLoginForm;
