"use client";
import LoginForm from "@/app/components/forms/loginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const Login = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  return (
    <div className="h-full flex justify-center items-center">
      <div className="container">
        <div className="max-w-3xl mx-auto flex justify-center border border-secondary/5 bg-white rounded-lg shadow-xl">
          <div className="w-1/2 p-5 overflow-hidden relative z-1 before:absolute before:rounded-full before:size-23 before:bg-white/20 before:-bottom-5 before:-left-7 bg-secondary text-white rounded-tl-xl rounded-bl-xl">
            <h2 className="h3">Join Us</h2>
            <p>
              {" "}
              Become a part of our growing community. Connect with like-minded
              people, share your challenges, exchange ideas, and find solutions
              together.
            </p>
          </div>
          <div className="py-6 px-7 rounded-md max-w-sm">
            <h3>
              <span className="text-primary">Welcome</span> Back
            </h3>
            <p>
              Sign in to continue exploring beautiful frames and elegant
              interior designs.
            </p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
