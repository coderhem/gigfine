"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { registerUserApi } from "@/redux/auth/authActions.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerValidation } from "@/validation/register.schema.js";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import LoadingSvg from "../loader/loadingSvg";

const RegisterForm = () => {
  const [selectedRole, setSelectedRole] = useState<"rider" | "passenger">(
    "rider",
  );
  const [show, setShow] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerValidation),
    defaultValues: {
      role: "rider",
    },
    shouldUnregister: true,
  });
  
  useEffect(() => {
    setValue("role", selectedRole, { shouldValidate: true });
  }, [selectedRole, setValue]);
  const [loading, setLoading] = useState(false);
  // const { loading, error, user } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch<any>();

  async function submitForm(data: any) {
    
    setLoading(true);
    try {
      const result = await dispatch(registerUserApi(data)).unwrap();
      console.log(result);
      toast.success("Registered successfully!");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      toast.error(err);
    } finally {
      setLoading(false);
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
              name="roles"
              className="hidden"
              checked={selectedRole === "rider"}
              onChange={() => setSelectedRole("rider")}
            />
            Rider
          </label>

          {/* Passenger */}
          {/* <label
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
          </label> */}
        </div>
        <div className="field-wrapper">
          {/* Full Name */}
          <div className="form-group mb-4">
            <input
              type="text"
              placeholder="Enter Full Name"
              className="form-control"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red text-sm px-1 mt-1">
                {String(errors.name?.message)}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="form-group mb-4">
            <input
              type="text"
              placeholder="Enter Phone Number"
              className="form-control"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-red text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>
          <div className="form-group mb-4">
            <input
              type="text"
              placeholder="Enter Email Address"
              className="form-control"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red text-sm mt-1">{errors.email.message}</p>
            )}
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
              <p className="text-xs px-1 text-secondary/70 mb-0">
                e.g. su-pa-pra-001-001-2155 or ba-2-pa-1234
              </p>
              {errors.vehicleNumber && (
                <p className="text-red text-sm mt-1">
                  {errors.vehicleNumber.message}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div className="form-group mb-4 w-full!">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
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
            {errors.password && (
              <p className="text-red text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary w-full flex items-center justify-center gap-2"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              {"Submitting"}
              <LoadingSvg />{" "}
            </>
          ) : (
            "Register"
          )}
        </button>
      </form>
      <div className="pt-5 pb-1 max-sm:text-sm text-center">
        <p className="mb-0 max-sm:text-sm">
          Already have an account? <Link href="/">Login</Link>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
