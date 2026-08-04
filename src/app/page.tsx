"use client";
import LoginForm from "@/app/components/forms/loginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import ProtestFancyBox from "./components/fancybox/protestFancyBox";
import Fancybox from "./components/fancybox/popup";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";

const Login = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      NativeFancybox.show([
        {
          src: "#protest-popup",
          type: "inline",
        },
      ]);
    }, 1000);

    return () => {
      clearTimeout(timer);
      NativeFancybox.close();
    };
  }, []);
  return (
    <div className="h-full flex justify-center items-center">
      <div className="container">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center border border-secondary/5 bg-white rounded-lg shadow-xl">
          <div className="w-full md:w-1/2 p-5 overflow-hidden relative z-1 before:absolute before:rounded-full before:size-23 before:bg-white/20 before:-bottom-5 before:-left-7 bg-secondary text-white rounded-tl-xl max-md:rounded-tr-xl md:rounded-bl-xl">
            <h2>Report ride-sharing issues with ease.</h2>
            <p>
              A trusted platform for passengers and drivers in Nepal to report
              ride-sharing problems and track their resolutions.
            </p>
          </div>
          <div className="w-full md:w-1/2 py-6 px-4 md:px-7 md:rounded-md md:max-w-sm">
            <h3 className="normal-case text-center">
              Login to
              <span className="text-primary"> GIGFINE</span>
            </h3>
            {/* <p>
              A trusted platform for passengers and drivers in Nepal to report
              ride-sharing problems and track their resolutions.
            </p> */}
            <LoginForm />
          </div>
        </div>
      </div>
      <div id="protest-popup" className="hidden p-0! rounded-xl max-w-11/12 lg:max-w-1/2">
        <ProtestFancyBox />
      </div>
    </div>
  );
};

export default Login;
