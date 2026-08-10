"use client";
import RegisterForm from "@/app/components/forms/registerForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PassengerRegisterForm from "../components/forms/passengerForm";

const Register = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();

  const [showForm, setFormShow] = useState("active");

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
              <button
                // onClick={() => {
                //   setFormShow;
                // }}
                className="btn btn-primary rounded-full text-sm"
              >
                Rider
              </button>
              {/* <button
                onClick={() => {
                  setFormShow;
                }}
                className="btn btn-primary rounded-full text-sm"
              >
                Passenger
              </button> */}
            </div>
          </div>
          {showForm === "active" ? <RegisterForm /> : <PassengerRegisterForm />}
        </div>
      </div>
    </div>
  );
};

export default Register;
