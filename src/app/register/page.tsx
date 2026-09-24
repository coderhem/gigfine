"use client";
import RegisterForm from "@/app/components/forms/registerForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ROLES = [
  { value: "rider", label: "Rider" },
  { value: "passenger", label: "Passenger" },
] as const;

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
            <div className="flex gap-5 mt-5">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`btn rounded-full text-sm focus:ring-0 ${
                    selectedRole === role.value ? "btn-primary" : "btn-outline"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
          <RegisterForm selectedRole={selectedRole} />
        </div>
      </div>
    </div>
  );
};

export default Register;
