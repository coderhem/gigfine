"use client";

import { useEffect, useState } from "react";


type MenuType = "users" | "problems";

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState<MenuType>("users");

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0C589C] text-white shadow-lg">
        <div className="border-b border-white/20 p-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-sm text-gray-200">Welcome Back 👋</p>
        </div>

        <nav className="p-4 space-y-3">
          <button
            onClick={() => setActiveMenu("users")}
            className={`w-full rounded-lg p-3 text-left transition cursor-pointer ${
              activeMenu === "users" ? "bg-primary" : "hover:bg-white/10"
            }`}
          >
            👤 User Details
          </button>

          <button
            onClick={() => setActiveMenu("problems")}
            className={`w-full rounded-lg p-3 text-left transition cursor-pointer ${
              activeMenu === "problems" ? "bg-[#FD5340]" : "hover:bg-white/10"
            }`}
          >
            ⚠️ User Problems
          </button>
        </nav>

        <div className="absolute bottom-5 left-0 w-full px-4">
          <button className="w-full btn btn-primary">
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-72 flex-1 p-8">
        {activeMenu === "users" && (
          <div>
            <h1 className="mb-6 text-3xl font-bold text-[#0C589C]">
              User Details
            </h1>

            <div className="rounded-xl bg-white p-6 shadow">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>

                {/* <tbody>
                  {users.map((user: any) => (
                    <tr key={user._id}>
                      <td className="p-3">{user.fullName}</td>
                      <td className="p-3">{user.phone}</td>
                      <td className="p-3 text-green-600">Active</td>
                    </tr>
                  ))}
                </tbody> */}
              </table>
            </div>
          </div>
        )}
        {activeMenu === "users" && (
          <div className="pt-8 counter-wrapper">
            <h1 className="mb-6 text-3xl font-bold text-[#0C589C]">
              User Details Rider
            </h1>

            <div className="rounded-xl bg-white p-6 shadow">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-start">S.No.</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Vechile Number</th>
                    <th className="p-3 text-left">Created Date</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>

                {/* <tbody>
                  {users.map((user: any) => (
                    <tr key={user._id}>
                      <td className="p-3 counter"></td>
                      <td className="p-3">{user.fullName}</td>
                      <td className="p-3">{user.phone}</td>
                      <td className="p-3 text-green-600">
                        {user.vehicleNumber}
                      </td>
                      <td className="p-3">
                        {" "}
                        {new Date(user.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <tr>
                          <td className="pr-5">
                            <RemoveBtn deleteIcon />
                          </td>
                          <td>
                            <UpdateBtn updateIcon customClass="min-w-full" />
                          </td>
                        </tr>
                      </td>
                    </tr>
                  ))}
                </tbody> */}
              </table>
            </div>
          </div>
        )}

        {activeMenu === "problems" && (
          <div>
            <h1 className="mb-6 text-3xl font-bold text-secondary">
              User Problems
            </h1>

            {/* <table className="w-full border-collapse bg-white shadow-md overflow-hidden">
              <thead className="bg-secondary/20 text-secondary">
                <tr>
                  <th className="px-4 py-3 text-start">S.No.</th>
                  <th className="px-4 py-3 text-start">Name</th>
                  <th className="px-4 py-3 text-start">Company</th>
                  <th className="px-4 py-3 text-start">Vechile No</th>
                  <th className="px-4 py-3 text-start">Problem</th>
                  <th className="px-4 py-3 text-start">Actions</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                <tr className="border-b border-secondary/20  transition-all duration-300 hover:bg-gray-300/20">
                  <td className="px-4 py-3">1.</td>
                  <td className="px-4 py-3">Hem</td>
                  <td className="px-4 py-3">Yango</td>
                  <td className="px-4 py-3">2323</td>
                  <td className="px-4 py-3 max-w-xs wrap-break-words text-start">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Totam facere est quos... Lorem ipsum dolor sit amet
                    consectetur adipisicing elit. Magni dolorem officiis,
                    similique excepturi consectetur iste aliquam quia, nobis
                    itaque accusamus quo! Numquam maiores debitis perferendis.
                    Nemo nobis sint ea aut?
                  </td>
                  <td>
                    <tr>
                      <td className="pr-5">
                        <RemoveBtn />
                      </td>
                      <td>
                        <UpdateBtn />
                      </td>
                    </tr>
                  </td>
                </tr>
              </tbody>
            </table> */}

            <div className="rounded-xl bg-white p-6 shadow">
              <div className="mb-4 rounded-lg border-l-4 border-[#FD5340] bg-gray-50 p-4">
                <h3 className="font-semibold">Login Issue</h3>
                <p className="text-gray-600">
                  User unable to login into account.
                </p>
              </div>

              <div className="rounded-lg border-l-4 border-[#FD5340] bg-gray-50 p-4">
                <h3 className="font-semibold">Payment Failed</h3>
                <p className="text-gray-600">
                  Payment processing error reported.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
