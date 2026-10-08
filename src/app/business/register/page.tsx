"use client";
import BusinessRegisterForm from "@/app/components/forms/businessRegisterForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const BusinessRegister = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/business");
  }, [user, router]);

  return (
    <section className="py-10 relative before:absolute before:inset-0 before:bg-[url('./assets/images/bg-img.png')] before:object-center before:object-cover before:-z-1 before:bg-bottom before:bg-cover before:bg-no-repeat">
      <div className="container">
        <div className="bg-white p-4 sm:px-7 sm:py-6 max-w-2xl mx-auto shadow-2xl rounded-md">
          <div className="mb-8">
            <h3 className="normal-case">
              Register your <span className="text-primary">Business</span>
            </h3>
            <p className="mb-0">
              Get the rider and passenger problems about your service, straight from GIGFINE.
              An admin verifies your details before you get access.
            </p>
          </div>
          <BusinessRegisterForm />
        </div>
      </div>
    </section>
  );
};

export default BusinessRegister;
