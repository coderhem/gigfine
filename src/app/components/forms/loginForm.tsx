"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginForm = () => {
  return (
    <>
      <form className="login-form">
        {/* Username */}
        <div className="form-group mb-4">
          <input
            type="text"
            name="phone"
            placeholder="Enter phone number"
            className="form-control"
          />
        </div>

        {/* Password */}
        <div className="form-group mb-4">
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              className="form-control"
            />

            {/* {show ? (
              <FaEye
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer"
                onClick={() => setShow(!show)}
              />
            ) : (
              <FaEyeSlash
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer"
                onClick={() => setShow(!show)}
              />
            )} */}
          </div>
        </div>

        {/* Submit */}
        <button className="btn btn-primary w-full">Login</button>
      </form>
      <div className="pt-5 pb-1 text-center">
        <p>
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </>
  );
};

export default LoginForm;
