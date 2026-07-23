import { getUserById } from "@/api/auth";
import RegisterForm from "@/app/components/forms/registerForm";
import React from "react";

const UpdateProduct = async ({ params }: any) => {
  const id = (await params).id;
  const user = await getUserById(id);
  console.log(user)
  return (
    <>
      <section className="max-w-3xl mx-auto h-full flex justify-center items-center">
        <div className="container">
          <RegisterForm />
        </div>
      </section>
    </>
  );
};

export default UpdateProduct;
