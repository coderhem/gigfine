"use client";
import AdminLoginForm from "../../components/forms/adminLoginForm";
import Link from "next/link";
import Image from "next/image";
import headerLogo from "@/public/images/gigfine-logo-img.png";


const AdminLogin = () => {
  return (
    <div className="h-full flex justify-center items-center">
      <div className="container">
        <div className="max-w-40 mx-auto">
          <Link href="/" className="px-1">
            <Image
              src={headerLogo}
              width={600}
              height={200}
              alt="Gigfine Logo"
              loading="lazy"
            />
          </Link>
        </div>
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center border border-secondary/5 bg-white rounded-lg shadow-xl">
          <div className="w-full md:w-1/2 p-5 overflow-hidden relative z-1 before:absolute before:rounded-full before:size-23 before:bg-white/20 before:-bottom-5 before:-left-7 bg-secondary text-white rounded-tl-xl max-md:rounded-tr-xl md:rounded-bl-xl">
            <h2>👋 Welcome, Admin</h2>
            <p>
              Sign in to access the GIGFINE administration dashboard, manage
              users, review reports, and monitor issue resolutions securely.
            </p>
          </div>
          <div className="w-full md:w-1/2 py-6 px-4 md:px-7 md:rounded-md md:max-w-sm">
            <h3 className="normal-case h4 text-center mb-10">
              Login to
              <span className="text-primary"> Dashboard</span>
            </h3>
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
