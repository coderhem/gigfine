import RegisterForm from "@/app/components/forms/registerForm";

const Register = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="container">
        <div className="bg-white px-7 py-6 max-w-2xl mx-auto shadow-2xl rounded-md">
          <div className="mb-8">
            <h3>
              Register Now
            </h3>
            <p>
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
