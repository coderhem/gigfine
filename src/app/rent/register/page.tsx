"use client";
import { registerLandlord } from "@/api/rental";
import { apiErrorMessage } from "@/api/config";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { setUser } from "@/redux/auth/authSlice";
import { rentalRegisterValidation } from "@/validation/register.schema.js";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const FIELDS = [
  { name: "name", placeholder: "Full name (as on PAN)" },
  { name: "phone", placeholder: "Phone number" },
  { name: "email", placeholder: "Email address" },
  { name: "panNo", placeholder: "PAN number" },
  { name: "citizenshipNo", placeholder: "Citizenship number (optional)" },
  { name: "permanentAddress", placeholder: "Permanent address (optional)" },
] as const;

const STEPS = ["Your details + PAN", "PAN photo", "Add your house", "Admin approves"];

// Step 1 of listing a house: the account + a PENDING landlord profile.
// Already have a GIGFINE account? Log in and fill the same details on /rent/landlord.
const RentalRegister = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/rent/landlord");
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(rentalRegisterValidation) });

  async function submitForm(data: any) {
    setLoading(true);
    try {
      const { phone, ...rest } = data;
      const result = await registerLandlord({ ...rest, mobile: phone });
      dispatch(setUser(result.user));
      toast.success("Registered! Now upload your PAN photo and add your house.");
      router.push("/rent/landlord");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-10 relative before:absolute before:inset-0 before:bg-[url('./assets/images/bg-img.png')] before:object-center before:object-cover before:-z-1 before:bg-bottom before:bg-cover before:bg-no-repeat">
      <div className="container">
        <div className="bg-white p-4 sm:px-7 sm:py-6 max-w-2xl mx-auto shadow-2xl rounded-md">
          <h3 className="normal-case mb-1">
            List your <span className="text-primary">house</span>
          </h3>
          <p className="text-sm text-gray-500">
            An admin checks your PAN and house details before your rooms go live.
          </p>
          <ol className="flex flex-wrap gap-2 text-xs mb-6">
            {STEPS.map((step, i) => (
              <li
                key={step}
                className={`px-2 py-1 rounded-full ${i === 0 ? "bg-secondary text-white" : "bg-secondary/10 text-secondary"}`}
              >
                {i + 1}. {step}
              </li>
            ))}
          </ol>

          <form className="register-form" onSubmit={handleSubmit(submitForm)}>
            {FIELDS.map(({ name, placeholder }) => (
              <div key={name} className="form-group mb-4">
                <input type="text" placeholder={placeholder} className="form-control" {...register(name)} />
                {errors[name] && <p className="text-red text-sm px-1 mt-1">{String(errors[name]?.message)}</p>}
              </div>
            ))}

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
              <p className="text-xs px-1 text-secondary/70 mb-0">Minimum 8 characters required.</p>
              {errors.password && <p className="text-red text-sm mt-1">{String(errors.password.message)}</p>}
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
                "Register as landlord"
              )}
            </button>
          </form>
          <div className="pt-5 pb-1 max-sm:text-sm text-center">
            <p className="mb-0">
              Already have a GIGFINE account? <Link href="/rent/login">Login</Link> and register as a landlord
              from there.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentalRegister;
