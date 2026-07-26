"use client"
import RegisterForm from "@/app/components/forms/registerForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const Register = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();

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
            <h3>Register Now</h3>
            <p className="mb-0">
              Sign in to continue exploring beautiful frames and elegant
              interior designs.
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
