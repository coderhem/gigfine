"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  registerPassengerApi,
  updatePassengerApi,
} from "@/redux/auth/authActions.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerValidation } from "@/validation/register.schema.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import LoadingSvg from "../loader/loadingSvg";
import Confetti from "react-confetti";

const PassengerRegisterForm = ({ passenger }: any) => {
  const [selectedRole] = useState<"rider" | "passenger">("rider");
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
      name: passenger?.name || "",
      phone: passenger?.phone || "",
      email: passenger?.email || "",
      password: passenger?.password || "",
    },
    shouldUnregister: true,
  });

  useEffect(() => {
    setValue("role", selectedRole, { shouldValidate: true });
  }, [selectedRole, setValue]);

  const [loading, setLoading] = useState(false);
  // const { loading, error, user } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch<any>();

  const [animateMessage, setAnimateMessage] = useState(false);

  async function submitForm(data: any) {
    setLoading(true);
    try {
      if (passenger?._id) {
        await dispatch(
          updatePassengerApi({
            id: passenger._id,
            ...data,
          }),
        ).unwrap();
        toast.success("Passenger updated successfully!");
        router.push("/admin/dashboard");
      } else {
        await dispatch(registerPassengerApi(data)).unwrap();

        toast.success("Registered successfully!");

        setAnimateMessage(true);

        setTimeout(() => {
          router.push("/");
        }, 4000);
      }
    } catch (err: any) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="register-form" onSubmit={handleSubmit(submitForm)}>
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
          {/* Email */}
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

          {/* Password */}
          <div className="form-group mb-4">
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
            <p className="text-xs px-1 text-secondary/70 mb-0">
              Minimun 8 character is required.
            </p>
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
              {passenger?._id ? "Updating" : "Submitting"}
              <LoadingSvg />
            </>
          ) : passenger?._id ? (
            "Update Passenger"
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
      {animateMessage && (
        <div className="">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={600}
          />
          {/* <h1 className="text-3xl font-bold text-center mt-20">
            🎉 Congratulations!
          </h1> */}
        </div>
      )}
    </>
  );
};

export default PassengerRegisterForm;
