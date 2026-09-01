import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { selectRole } from "@/api/auth";
import toast from "react-hot-toast";

const RolePopup = ({ open, onSelect, onClose }: any) => {
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [loginData, setLoginData] = useState({
    phone: "",
    password: "",
  });

  const router = useRouter();

  const handleRoleSelect = async (role: "rider" | "passenger") => {
    try {
      const result = await selectRole({
        phone: loginData.phone,
        password: loginData.password,
        role,
      });

      localStorage.setItem("authToken", result.token);

      setShowRolePopup(false);

      if (role === "rider") {
        router.push("/rider");
      }

      if (role === "passenger") {
        router.push("/passenger");
      }
    } catch (error: any) {
      toast.error(error?.response?.data || "Unable to select role");
    }
  };
  return (
    <>
      {showRolePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-100 rounded-xl bg-white p-6">
            <h2 className="mb-2 text-xl font-semibold">Continue As</h2>

            <p className="mb-6 text-gray-500">
              You have both Rider and Passenger accounts.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("rider")}
                className="w-full rounded-lg border p-4"
              >
                🚗 Continue as Rider
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("passenger")}
                className="w-full rounded-lg border p-4"
              >
                👤 Continue as Passenger
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RolePopup;
