"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

// Countdown + auto-redirect logic modal vitra
const SuccessModal = ({ onClose }: { onClose: () => void }) => {
  const [countdown, setCountdown] = useState(3);

  // useCallback — stable reference
  const stableClose = useCallback(onClose, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stableClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stableClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Problem Submitted!
        </h2>
        <p className="text-gray-500 mb-2">
          Thank you for your submission. Your problem has been received
          successfully and is currently under review. Our team will reach out to
          you shortly.{" "}
        </p>

        <p className="text-sm text-gray-400 mb-6">
          You will be automatically redirected in a few seconds. You will be
          automatically redirected in {countdown} seconds...{" "}
        </p>

        <button onClick={onClose} className="btn btn-primary w-full">
          OK
        </button>
      </div>
    </div>
  );
};

const ProblemForm = () => {
  return (
    <>
      {/* {showModal && <SuccessModal onClose={handleModalClose} />} */}

      <form className="problem-form text-start">
        <div className="form-group">
          <label htmlFor="company">Which company is this regarding?</label>
          <select id="company" className="form-control py-3!">
            <option value="">Select Company</option>
            <option value="Pathao">Pathao</option>
            <option value="inDrive">Indrive</option>
            <option value="Yango">Yango</option>
            <option value="Tootle">Tootle</option>
            <option value="Sajilo">Sajilo</option>
            <option value="JunJum">JunJum</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* {selectedCompany === "Other" && ( */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Please Enter Company Name"
            className="form-control mt-3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">What problem are you facing?</label>
          <textarea
            id="message"
            className="form-control min-h-30"
            placeholder="Describe Problem Here"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Submit
        </button>
      </form>
    </>
  );
};

export default ProblemForm;
