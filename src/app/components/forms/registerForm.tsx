"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { registerUser } from "@/api/auth.js";

const RegisterForm = () => {
  const [selectedRole, setSelectedRole] = useState("rider");
  const [show, setShow] = useState(false);
  const { register, handleSubmit } = useForm();

  async function submitForm(data: any) {
    try {
      const formData = {...data, role: selectedRole}
      await registerUser(formData);
      console.log("Created Success")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <form className="register-form" onSubmit={handleSubmit(submitForm)}>
        {/* Role */}
        <div className="form-group flex gap-6 mb-8!">
          {/* Rider */}
          <label
            className={`px-5 py-2 rounded-full border cursor-pointer transition-all
              ${
                selectedRole === "rider"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-black border-gray-300"
              }`}
          >
            <input
              type="radio"
              name="role"
              className="hidden"
              checked={selectedRole === "rider"}
              onChange={() => setSelectedRole("rider")}
            />
            Rider
          </label>

          {/* Passenger */}
          <label
            className={`px-5 py-2 rounded-full border cursor-pointer transition-all
              ${
                selectedRole === "passenger"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-black border-gray-300"
              }`}
          >
            <input
              type="radio"
              name="role"
              className="hidden"
              checked={selectedRole === "passenger"}
              onChange={() => setSelectedRole("passenger")}
            />
            Passenger
          </label>
        </div>
        <div className="field-wrapper">
          {/* Full Name */}
          <div className="form-group mb-4">
            <input
              type="text"
              placeholder="Enter Full Name"
              className="form-control"
              {...register("fullName")}
            />
          </div>

          {/* Phone */}
          <div className="form-group mb-4">
            <input
              type="text"
              placeholder="Enter Phone Number"
              className="form-control"
              {...register("phone", {
                required: true,
              })}
            />
          </div>

          {/* Vehicle Number */}
          {selectedRole === "rider" && (
            <div className="form-group mb-4">
              <input
                type="text"
                placeholder="Enter Vehicle Number Plate"
                className="form-control"
                {...register("vehicleNumber")}
              />
            </div>
          )}

          {/* Password */}
          <div className="form-group mb-4">
            <div className="relative">
              <input
                type={show ? "text " : "password"}
                placeholder="Enter Password"
                className="form-control"
                {...register("password")}
              />

              {show ? (
                <FaEye
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer`}
                  onClick={() => setShow(!show)}
                />
              ) : (
                <FaEyeSlash
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer`}
                  onClick={() => setShow(!show)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button className="btn btn-primary w-full" type="submit">
          Register
        </button>
      </form>
      <div className="pt-5 pb-1 text-center">
        <p>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
