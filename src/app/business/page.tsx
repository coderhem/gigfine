"use client";

import { getBusinessReports, isBusiness } from "@/api/business";
import { apiErrorMessage } from "@/api/config";
import { REPORT_STATUS_LABEL } from "@/api/problem";
import { getMyProfile } from "@/api/user";
import ReportAttachments from "@/app/components/reportAttachments";
import { logout, setUser } from "@/redux/auth/authSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import LoadingSvg from "../components/loader/loadingSvg";

const STATUS_LABEL = REPORT_STATUS_LABEL as Record<string, string>;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const MODE_LABEL: Record<string, string> = {
  RIDER: "Rider",
  PESSENGER: "Passenger",
};

// Business panel: only the reports an admin forwarded to this business
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

  // Not approved yet: the application page shows the status and document upload
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
          <div>
            <h2 className="h3 mb-1">
              <span className="text-primary">{user.name}</span> — Reports
            </h2>
            <p className="text-sm text-gray-500 mb-0">
              Problems reported by riders and passengers that GIGFINE forwarded to you.
            </p>
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

        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSvg />
          </div>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No reports forwarded to you yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <div key={report.reportId} className="bg-white rounded-xl shadow border border-secondary/10">
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 justify-between items-start mb-3">
                    <div>
                      <h3 className="h6 mb-1 capitalize">
                        {report.company} · {report.service}
                      </h3>
                      <p className="text-xs text-gray-500 mb-0 flex items-center gap-1">
                        <FaCalendarAlt />
                        {new Date(report.createdAt).toLocaleString()}
                        {report.reporterMode && (
                          <> · by {MODE_LABEL[report.reporterMode] ?? report.reporterMode}</>
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        STATUS_BADGE[report.status] ?? "bg-secondary/10"
                      }`}
                    >
                      {STATUS_LABEL[report.status] ?? report.status}
                    </span>
                  </div>

                  {(report.vehicleNumber || report.riderName) && (
                    <p className="text-sm mb-2">
                      Vehicle: <span className="uppercase">{report.vehicleNumber ?? "-"}</span>
                      {report.riderName && <> · Rider: {report.riderName}</>}
                    </p>
                  )}

                  <p className="text-sm whitespace-pre-line mb-0">
                    {report.problem || "No description — see the voice note."}
                  </p>
                </div>
                <ReportAttachments report={report} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BusinessPanel;
