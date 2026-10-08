"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { imageFileError, registerBusiness } from "@/api/business";
import { apiErrorMessage } from "@/api/config";
import { uploadProfileImage } from "@/api/user";
import { setUser } from "@/redux/auth/authSlice";
import { businessRegisterValidation } from "@/validation/register.schema.js";
import LoadingSvg from "../loader/loadingSvg";

const FIELDS = [
  { name: "name", placeholder: "Business Name" },
  { name: "phone", placeholder: "Business Phone Number" },
  { name: "email", placeholder: "Business Email Address" },
  { name: "registrationNo", placeholder: "Registration Number" },
  { name: "panNo", placeholder: "PAN/VAT Number" },
  { name: "businessLocation", placeholder: "Business Location" },
  { name: "ownerName", placeholder: "Owner Full Name" },
  { name: "ownerPhone", placeholder: "Owner Phone Number" },
] as const;

// Creates the account + a PENDING business, then sends the user to upload documents
const BusinessRegisterForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  // Optional; uploaded as the account's profile image after sign-up
  const [logo, setLogo] = useState<File | null>(null);

  const pickLogo = (file: File | undefined) => {
    if (!file) return setLogo(null);
    const error = imageFileError(file);
    if (error) {
      toast.error(error);
      return;
    }
    setLogo(file);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(businessRegisterValidation) });

  async function submitForm(data: any) {
    setLoading(true);
    try {
      const { phone, ...rest } = data;
      const result = await registerBusiness({ ...rest, mobile: phone });
      let user = result.user;
      if (logo) {
        // The account exists already, so a failed logo upload only warns; it can be added later
        try {
          user = await uploadProfileImage(user.userId, logo);
        } catch (err) {
          toast.error(apiErrorMessage(err, "Logo upload failed — you can add it later"));
        }
      }
      dispatch(setUser(user));
      toast.success("Registered! Now upload your documents.");
      router.push("/business/apply");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="register-form" onSubmit={handleSubmit(submitForm)}>
        <div className="field-wrapper">
          {FIELDS.map(({ name, placeholder }) => (
            <div key={name} className="form-group mb-4">
              <input
                type="text"
                placeholder={placeholder}
                className="form-control"
                {...register(name)}
              />
              {errors[name] && (
                <p className="text-red text-sm px-1 mt-1">{String(errors[name]?.message)}</p>
              )}
            </div>
          ))}

          {/* Password */}
          <div className="form-group mb-4">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="Password"
                className="form-control"
                {...register("password")}
              />
              {show ? (
                <FaEye
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer"
                  onClick={() => setShow(false)}
                />
              ) : (
                <FaEyeSlash
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/60 text-xl cursor-pointer"
                  onClick={() => setShow(true)}
                />
              )}
            </div>
            <p className="text-xs px-1 text-secondary/70 mb-0">
              Minimum 8 characters required.
            </p>
            {errors.password && (
              <p className="text-red text-sm mt-1">{String(errors.password.message)}</p>
            )}
          </div>

          {/* Logo (optional) */}
          <div className="form-group mb-4">
            <label className="form-control flex items-center gap-2 cursor-pointer text-secondary/70">
              <span className="truncate">{logo ? logo.name : "Business Logo (optional)"}</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => pickLogo(e.target.files?.[0])}
              />
            </label>
            <p className="text-xs px-1 text-secondary/70 mb-0">jpg / png, max 5MB.</p>
          </div>
        </div>

        <button
          className="btn btn-primary w-full flex items-center justify-center gap-2"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              Submitting
              <LoadingSvg />
            </>
          ) : (
            "Register Business"
          )}
        </button>
      </form>
      <div className="pt-5 pb-1 max-sm:text-sm text-center">
        <p className="mb-0">
          Already registered? <Link href="/business/login">Login</Link>
        </p>
      </div>
    </>
  );
};

export default BusinessRegisterForm;
