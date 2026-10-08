"use client";
import { BUSINESS_URL } from "@/api/business";
import { FaBuilding } from "react-icons/fa";

// Businesses sign up and log in on business.gigfine.com
const ContactForBusiness = () => (
  <section className="h-full flex items-center justify-center text-center py-14">
    <div className="container">
      <div className="flex justify-center items-center size-30 mx-auto bg-white shadow rounded-full text-6xl text-secondary mb-7">
        <FaBuilding />
      </div>
      <h2>
        GIGFINE for <span className="text-primary">Business</span>
      </h2>
      <p className="max-w-xl mx-auto mb-6">
        Ride-sharing companies can register their business with GIGFINE. Once our team
        verifies your details, we forward the rider and passenger problems about your
        service straight to your business panel.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <a href={`${BUSINESS_URL}/business/register`} className="btn btn-primary">
          Register your business
        </a>
        <a href={`${BUSINESS_URL}/business/login`} className="btn btn-blue">
          Business login
        </a>
      </div>
    </div>
  </section>
);

export default ContactForBusiness;
