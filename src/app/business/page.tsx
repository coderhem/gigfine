"use client";

import { getBusinessReports, isBusiness } from "@/api/business";
import { apiErrorMessage } from "@/api/config";
import { getMyProfile } from "@/api/user";
import BusinessLogo from "@/app/components/businessLogo";
import { logout, setUser } from "@/redux/auth/authSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaImage, FaMicrophone } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import LoadingSvg from "../components/loader/loadingSvg";
import { formatDate, MODE_LABEL, STATUS_BADGE, STATUS_LABEL } from "./_components/reportMeta";

// Business panel: the reports an admin forwarded to this business.
// One short row per report; clicking it opens /business/reports/{id} with everything.
const BusinessPanel = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [checking, setChecking] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Refresh the profile so a just-approved business doesn't need to log in again
  useEffect(() => {
    if (!user || !localStorage.getItem("token")) {
      dispatch(logout());
      router.replace("/business/login");
      return;
    }
    getMyProfile()
      .then((profile) => dispatch(setUser(profile)))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const approved = isBusiness(user);

  // Not approved yet: the profile page shows the status and document upload
  useEffect(() => {
    if (!checking && !approved) router.replace("/business/apply");
  }, [checking, approved, router]);

  useEffect(() => {
    if (checking || !approved) return;
    setLoading(true);
    getBusinessReports(statusFilter)
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(apiErrorMessage(err, "Failed to load reports")))
      .finally(() => setLoading(false));
  }, [checking, approved, statusFilter]);

  if (!user || checking || !approved) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        <div className="flex flex-wrap gap-3 items-end justify-between mb-6">
          <div className="flex items-center gap-4">
            <BusinessLogo size="size-16" />
            <div>
              <h2 className="h3 mb-1">
                <span className="text-primary">{user.name}</span> — Reports
              </h2>
              <p className="text-sm text-gray-500 mb-0">
                Problems reported by riders and passengers that GIGFINE forwarded to you.
                Click a report to see everything.{" "}
                <Link href="/business/apply" className="underline">
                  Business profile
                </Link>
              </p>
            </div>
          </div>
          <label className="flex flex-col text-sm">
            Status
            <select
              className="form-control py-2!"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-xl bg-white shadow overflow-x-auto">
          <table className="min-w-full w-full border-collapse text-sm">
            <thead className="bg-secondary/20 text-secondary">
              <tr>
                <th className="px-4 py-3 text-start">#</th>
                <th className="px-4 py-3 text-start">Reported by</th>
                <th className="px-4 py-3 text-start">Type</th>
                <th className="px-4 py-3 text-start">Service</th>
                <th className="px-4 py-3 text-start">Problem</th>
                <th className="px-4 py-3 text-start">Forwarded</th>
                <th className="px-4 py-3 text-start">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6">
                    <div className="flex justify-center">
                      <LoadingSvg />
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    No reports forwarded to you yet.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.reportId}
                    onClick={() => router.push(`/business/reports/${report.reportId}`)}
                    className="border-b border-secondary/20 cursor-pointer hover:bg-primary/5"
                  >
                    <td className="px-4 py-3">{report.reportId}</td>
                    <td className="px-4 py-3">
                      {report.reporter?.name}
                      <div className="text-xs text-gray-500">{report.reporter?.mobile}</div>
                    </td>
                    <td className="px-4 py-3">
                      {MODE_LABEL[report.reporterMode] ?? report.reporterMode ?? "-"}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {report.company} · {report.service}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-1">{report.problem || "-"}</span>
                      <span className="flex gap-2 text-gray-400 mt-1">
                        {report.voice && <FaMicrophone title="Voice note" />}
                        {report.image && <FaImage title="Image" />}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(report.forwardedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                          STATUS_BADGE[report.status] ?? "bg-secondary/10"
                        }`}
                      >
                        {STATUS_LABEL[report.status] ?? report.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default BusinessPanel;
