import React from "react";
import LoginForm from "../components/forms/loginForm";

type Props = {};

const Login = (props: Props) => {
  return (
    <>
      <section className="py-8 md:py-11 lg:py-14 relative before:absolute before:inset-0 before:bg-[url('./assets/images/bg-img.png')] before:object-center before:object-cover before:-z-1 before:bg-bottom before:bg-cover before:bg-no-repeat">
        <div className="bg-white rounded-2xl shadow-2xl border border-secondary/10 p-6 sm:p-8 w-full max-w-md mx-auto lg:ml-auto">
          <h2 className="h3 normal-case text-center mb-1">
            Login to <span className="text-primary">GIGFINE</span>
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Use your phone number or email
          </p>
          <LoginForm />
        </div>
      </section>
    </>
  );
};

export default Login;
