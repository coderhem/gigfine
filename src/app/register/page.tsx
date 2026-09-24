"use client";
import RegisterForm from "@/app/components/forms/registerForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaBiking, FaUser } from "react-icons/fa";

const ROLES = [
  { value: "rider", label: "Rider / Driver", icon: FaBiking },
  { value: "passenger", label: "Passenger", icon: FaUser },
] as const;

// Own styles instead of .btn-primary/.btn-outline: those swap colours on :focus,
// so the button you just clicked looked unselected until focus moved away.
const TOGGLE_BASE =
  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm sm:text-base font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1";
const TOGGLE_SELECTED =
  "bg-primary border-primary text-white hover:text-white shadow-md";
const TOGGLE_IDLE =
  "bg-white border-primary/40 text-primary hover:bg-primary/10 hover:text-primary";

const Register = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<"rider" | "passenger">(
    "rider",
  );

  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  return (
    <div className="flex justify-center items-center h-full">
      <div className="container">
        <div className="bg-white p-4 sm:px-7 sm:py-6 max-w-2xl mx-auto shadow-2xl rounded-md">
          <div className="mb-8">
            <h3 className="normal-case">
              Register to <span className="text-primary">GIGFINE</span>
            </h3>
            <p className="mb-0">
              Join GIGFINE to report issues and get support.
            </p>
            <div
              className="flex flex-wrap gap-3 mt-5"
              role="radiogroup"
              aria-label="Register as"
            >
              {ROLES.map(({ value, label, icon: Icon }) => {
                const selected = selectedRole === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedRole(value)}
                    className={`${TOGGLE_BASE} ${
                      selected ? TOGGLE_SELECTED : TOGGLE_IDLE
                    }`}
                  >
                    <Icon aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <RegisterForm selectedRole={selectedRole} />
        </div>
      </div>
    </div>
  );
};

export default Register;
