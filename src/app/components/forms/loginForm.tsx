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
import LoadingSvg from "../loader/loadingSvg";

const LoginForm = () => {
  const router = useRouter();
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginValidation),
  });

  const { loading } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch<any>();

  async function submitForm(data: any) {
    try {
      await dispatch(loggedUser(data)).unwrap();
      toast.success("Login successful!");
      setTimeout(() => {
        router.push("/home");
      }, 3000);
    } catch (err: any) {
      toast.error(err);
    }
  }

  return (
    <>
      <form className="login-form" onSubmit={handleSubmit(submitForm)}>
        {/* Username */}
        <div className="form-group mb-4">
          <input
            type="text"
            placeholder="Enter phone number"
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
      <div className="pt-5 pb-1 text-center">
        <div className="text-end mb-3">
          <Link
            className="text-sm underline hover:no-underline"
            href={"/client/forgot-password"}
          >
            Forgot Password
          </Link>
        </div>{" "}
        <p>
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </>
  );
};

export default LoginForm;
