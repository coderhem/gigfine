"use client";
import { registerUser } from "@/api/auth";
import { registerAgent, registerLandlord } from "@/api/rental";
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

// tenant: an account to contact GIGFINE about rooms. landlord: account + PENDING landlord profile.
// agent: account + PENDING agent profile — lists other people's houses through the same pages.
type Mode = "tenant" | "landlord" | "agent";

const MODES: [Mode, string][] = [
  ["tenant", "I need a room"],
  ["landlord", "I own a house"],
  ["agent", "I'm an agent"],
];

// listers: landlord + agent. agentOnly: agent.
const FIELDS = [
  { name: "name", placeholder: "Full name" },
  { name: "phone", placeholder: "Phone number" },
  { name: "email", placeholder: "Email address" },
  { name: "panNo", placeholder: "PAN number (optional)", listers: true },
  { name: "agencyName", placeholder: "Agency / company name (optional)", agentOnly: true },
  { name: "workingAreas", placeholder: "Areas you cover, e.g. Baneshwor, Koteshwor (optional)", agentOnly: true },
] as const;

const STEPS: Record<"landlord" | "agent", string[]> = {
  landlord: ["Your details", "Citizenship photos", "Add your house", "Admin approves"],
  agent: ["Your details", "Citizenship photos", "Admin approves you", "Add houses with the owner's contact"],
};

const fromQuery = (as: string | null): Mode => (as === "landlord" || as === "agent" ? as : "tenant");

// Tenant sign-up (default), or step 1 of listing as a landlord (?as=landlord) or agent (?as=agent).
// Already have a GIGFINE account? Log in — the same details are filled on /rent/landlord.
const RentalRegister = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("tenant");
  const isListerMode = mode !== "tenant";

  // Already logged in when the page opens: nothing to register
  useEffect(() => {
    const as = fromQuery(new URLSearchParams(window.location.search).get("as"));
    if (user) {
      router.replace(as === "tenant" ? "/rent" : `/rent/landlord?as=${as}`);
      return;
    }
    setMode(as);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(rentalRegisterValidation) });

  async function submitForm(data: any) {
    setLoading(true);
    try {
      if (mode === "landlord") {
        const { phone, ...rest } = data;
        const result = await registerLandlord({ ...rest, mobile: phone });
        dispatch(setUser(result.user));
        toast.success("Registered! Now upload your citizenship photos and add your house.");
        router.push("/rent/landlord");
        return;
      }
      if (mode === "agent") {
        const { phone, ...rest } = data;
        const result = await registerAgent({ ...rest, mobile: phone });
        dispatch(setUser(result.user));
        toast.success("Registered as agent! Now upload your citizenship photos.");
        router.push("/rent/landlord");
        return;
      }
      const result = await registerUser(data);
      localStorage.setItem("token", result.token);
      dispatch(setUser(result.user));
      toast.success("Registered! You can now contact GIGFINE about any room.");
      // Back to the room that sent them here
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next?.startsWith("/rent") ? next : "/rent");
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
          <div className="flex flex-wrap gap-2 mb-4 text-sm">
            {MODES.map(([m, label]) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-full cursor-pointer ${mode === m ? "bg-secondary text-white" : "bg-secondary/10 text-secondary"}`}>
                {label}
              </button>
            ))}
          </div>
          {isListerMode ? (
            <>
          {mode === "agent" ? (
            <>
              <h3 className="normal-case mb-1">
                Become a GIGFINE <span className="text-primary">agent</span>
              </h3>
              <p className="text-sm text-gray-500">
                List rooms and flats from the houses you represent. An admin checks your citizenship first, then
                each house — add the owner&apos;s name and phone with every house.
              </p>
            </>
          ) : (
            <>
              <h3 className="normal-case mb-1">
                List your <span className="text-primary">house</span>
              </h3>
              <p className="text-sm text-gray-500">
                An admin checks your citizenship and house details before your rooms go live.
              </p>
            </>
          )}
          <ol className="flex flex-wrap gap-2 text-xs mb-6">
            {STEPS[mode].map((step, i) => (
              <li
                key={step}
                className={`px-2 py-1 rounded-full ${i === 0 ? "bg-secondary text-white" : "bg-secondary/10 text-secondary"}`}
              >
                {i + 1}. {step}
              </li>
            ))}
          </ol>
            </>
          ) : (
            <>
              <h3 className="normal-case mb-1">
                Create your <span className="text-primary">account</span>
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Browse rooms freely. With an account you can contact GIGFINE to visit one.
              </p>
            </>
          )}

          <form className="register-form" onSubmit={handleSubmit(submitForm)}>
            {FIELDS.filter((f) => ("agentOnly" in f ? mode === "agent" : "listers" in f ? isListerMode : true))
              .map(({ name, placeholder }) => (
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
                mode === "agent" ? "Register as agent" : mode === "landlord" ? "Register as landlord" : "Create account"
              )}
            </button>
          </form>
          <div className="pt-5 pb-1 max-sm:text-sm text-center">
            <p className="mb-0">
              Already have a GIGFINE account? <Link href="/rent/login">Login</Link>
              {isListerMode && ` and register as ${mode === "agent" ? "an agent" : "a landlord"} from there`}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RentalRegister;
