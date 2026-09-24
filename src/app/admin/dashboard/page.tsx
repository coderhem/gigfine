"use client";

import {
  deleteUser,
  getAllRiders,
  getAllUsers,
  getReportFileUrlAdmin,
  getReports,
  NEXT_STATUSES,
  updateReportStatus,
} from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import { REPORT_STATUS_LABEL } from "@/api/problem";
import ReportAttachments from "@/app/components/reportAttachments";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FaBiking, FaUser } from "react-icons/fa";
import { MdOutlineReportProblem } from "react-icons/md";
import LoadingSvg from "../../components/loader/loadingSvg";
import DeleteBtn from "../../components/crudOperationBtns/deleteBtn";
import toast from "react-hot-toast";
import { HiShieldCheck } from "react-icons/hi2";
import Pagination from "@/app/components/paginationUI/pagination";
import Link from "next/link";

type MenuType = "riders" | "passengers" | "reports";

const PER_PAGE = 10;

const STATUS_LABEL = REPORT_STATUS_LABEL as Record<string, string>;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

// Report.reporterMode values (backend spells passenger "PESSENGER")
const MODE_LABEL: Record<string, string> = {
  RIDER: "Rider",
  PESSENGER: "Passenger",
};

const MODE_BADGE: Record<string, string> = {
  RIDER: "bg-secondary/15 text-secondary",
  PESSENGER: "bg-primary/15 text-primary",
};

const MENU_TITLE: Record<MenuType, string> = {
  riders: "Rider Details",
  passengers: "Passenger Details",
  reports: "User Reports",
};

function paginate<T>(items: T[], page: number) {
  return items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
}

function openWhatsApp(phone: string, message: string) {
  if (!phone) return;

  let cleanPhone = String(phone).replace(/\D/g, "");

  // Remove country code if already present
  if (cleanPhone.startsWith("977")) {
    cleanPhone = cleanPhone.slice(3);
  }

  // Remove leading zero
  cleanPhone = cleanPhone.replace(/^0+/, "");

  const url = `https://wa.me/977${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

const welcomeMessage = (name: string) =>
  `Hello, ${name} sir, gigfine.com सँग जोडिनु भएकोमा धन्यवाद। Ride Sharing सम्बन्धि समस्या/गुनासो राख्नुहोला, हामी तपाईंको कुरालाई सम्बन्धित ठाउँमा पुर्याउने कोशिस गर्छौं।`;

const reportMessage = (name: string) =>
  `धन्यवाद, ${name} तपाईंले आफ्नो समस्या/गुनासो gigfine.com सँग राख्नु भयो।
हामी तपाईंको कुरालाई सम्बन्धित ठाउँमा पुर्याउने कोशिस गर्दैछौं।`;

export default function Dashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuType>("riders");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Report filters (sent to the backend)
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      router.replace("/admin/login");
      return;
    }
    setAuthorized(true);
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const [allUsers, allRiders] = await Promise.all([
        getAllUsers(),
        getAllRiders(),
      ]);
      setUsers(allUsers);
      setRiders(allRiders);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load users"));
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const data = await getReports({
        userId: userFilter,
        status: statusFilter,
        mode: modeFilter,
        from: fromDate,
        to: toDate,
      });
      setReports(data);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load reports"));
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) fetchUsers();
  }, [authorized]);

  useEffect(() => {
    if (authorized) fetchReports();
  }, [authorized, statusFilter, modeFilter, userFilter, fromDate, toDate]);

  useEffect(() => {
    setPage(1);
  }, [activeMenu, search, statusFilter, modeFilter, userFilter, fromDate, toDate]);

  const usersById = useMemo(
    () => new Map(users.map((u) => [u.userId, u])),
    [users],
  );
  const ridersByUserId = useMemo(
    () => new Map(riders.map((r) => [r.userId, r])),
    [riders],
  );

  const term = search.trim().toLowerCase();
  const matches = (...values: any[]) =>
    !term || values.some((v) => String(v ?? "").toLowerCase().includes(term));

  const riderRows = riders
    .map((r) => ({ ...r, mobile: usersById.get(r.userId)?.mobile }))
    .filter((r) =>
      matches(r.name, r.email, r.mobile, r.vehicleNumber, r.licenseNumber),
    );

  const passengerRows = users
    .filter((u) => u.roles?.includes("ROLE_PASSENGER"))
    .filter((u) => matches(u.name, u.email, u.mobile));

  const reportRows = reports.filter((r) =>
    matches(
      r.company,
      r.service,
      r.problem,
      r.reporter?.name,
      r.reporter?.email,
      r.reporter?.mobile,
      r.riderName,
      r.vehicleNumber,
      ridersByUserId.get(r.reporter?.userId)?.vehicleNumber,
    ),
  );

  const activeCount = {
    riders: riderRows.length,
    passengers: passengerRows.length,
    reports: reportRows.length,
  }[activeMenu];

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully.");
      await fetchUsers();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete user"));
    }
  };

  const handleStatusChange = async (reportId: number, status: string) => {
    try {
      const updated = await updateReportStatus(reportId, status);
      setReports((prev) =>
        prev.map((r) => (r.reportId === reportId ? updated : r)),
      );
      toast.success(`Report marked as ${STATUS_LABEL[status]}.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update status"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.replace("/admin/login");
  };

  if (!authorized) {
    return (
      <LoadingSvg
        className={"absolute left-1/2 top-1/2 -translate-1/2 size-20"}
      />
    );
  }

  const menuBtn = (menu: MenuType, icon: ReactNode, label: string) => (
    <button
      onClick={() => setActiveMenu(menu)}
      className={`w-full rounded-lg p-3 text-left transition cursor-pointer bg-gray-200/20 text-white flex flex-wrap gap-2 items-center ${
        activeMenu === menu ? "bg-primary" : "hover:bg-white/10"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const loadingRow = (colSpan: number) => (
    <tr>
      <td colSpan={colSpan} className="py-6">
        <div className="flex justify-center">
          <LoadingSvg />
        </div>
      </td>
    </tr>
  );

  const emptyRow = (colSpan: number, text: string) => (
    <tr>
      <td colSpan={colSpan} className="pt-6 text-center text-gray-500">
        {text}
      </td>
    </tr>
  );

  const phoneCell = (phone: string, message: string) => (
    <button onClick={() => openWhatsApp(phone, message)}>{phone}</button>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed z-100 left-0 top-0 h-screen w-40 lg:w-72 bg-secondary text-white shadow-lg">
        <div className="border-b border-white/20 p-3 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <HiShieldCheck className="text-xl md:text-3xl text-white" />
            <h2 className="text-lg md:text-2xl font-bold mb-0">
              Admin Dashboard
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-200 pl-5 md:pl-9">
            Welcome back! Manage users, reports, and system operations.
          </p>
        </div>

        <nav className="p-4 space-y-3">
          {menuBtn("riders", <FaBiking />, "Rider Details")}
          {menuBtn("passengers", <FaUser />, "Passenger Details")}
          {menuBtn("reports", <MdOutlineReportProblem />, "User Reports")}
          <Link
            href={"/admin/notifications/add"}
            className="w-full rounded-lg p-3 text-left transition cursor-pointer bg-gray-200/20 text-white flex flex-wrap gap-2 items-center hover:bg-primary"
          >
            + Add Notifications
          </Link>
        </nav>

        <div className="absolute bottom-5 left-0 w-full px-4">
          <button className="w-full btn btn-primary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-40 lg:ml-72 flex-1 p-4 overflow-hidden">
        <div className="mb-5 fixed z-20 left-40 lg:left-72 p-5 bg-white shadow right-0 top-0 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-secondary">
            {MENU_TITLE[activeMenu]}{" "}
            <span className="text-primary">({activeCount})</span>
          </h2>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 outline-none transition focus:border-secondary"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* Riders */}
        {activeMenu === "riders" && (
          <>
            <h1 className="h2 pt-24 mb-6 text-3xl font-bold text-secondary">
              Rider Details
            </h1>

            <div className="relative rounded-xl bg-white px-3 lg:px-6 pt-6 pb-14 shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 lg:p-3 text-start">S.No.</th>
                      <th className="p-2 lg:p-3 text-left">Name</th>
                      <th className="p-2 lg:p-3 text-left">Vehicle No.</th>
                      <th className="p-2 lg:p-3 text-left">License No.</th>
                      <th className="p-2 lg:p-3 text-left">Email</th>
                      <th className="p-2 lg:p-3 text-left">Phone</th>
                      <th className="p-2 lg:p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading
                      ? loadingRow(7)
                      : riderRows.length === 0
                        ? emptyRow(7, "There are no riders at this time.")
                        : paginate(riderRows, page).map((item, i) => (
                            <tr key={item.id}>
                              <td className="p-2 lg:p-3">
                                {(page - 1) * PER_PAGE + i + 1}
                              </td>
                              <td className="p-2 lg:p-3">{item.name}</td>
                              <td className="p-2 lg:p-3">
                                {item.vehicleNumber}
                              </td>
                              <td className="p-2 lg:p-3">
                                {item.licenseNumber}
                              </td>
                              <td className="p-2 lg:p-3">{item.email}</td>
                              <td className="p-2 lg:p-3">
                                {phoneCell(item.mobile, welcomeMessage(item.name))}
                              </td>
                              <td className="p-2 lg:p-3">
                                <DeleteBtn
                                  deleteIcon
                                  onConfirm={() => handleDeleteUser(item.userId)}
                                />
                              </td>
                            </tr>
                          ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(riderRows.length / PER_PAGE)}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </>
        )}

        {/* Passengers */}
        {activeMenu === "passengers" && (
          <>
            <h1 className="h2 pt-24 mb-6 text-3xl font-bold text-secondary">
              Passenger Details
            </h1>

            <div className="relative rounded-xl bg-white px-3 lg:px-6 pt-6 pb-14 shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 lg:p-3 text-start">S.No.</th>
                      <th className="p-2 lg:p-3 text-left">Name</th>
                      <th className="p-2 lg:p-3 text-left">Email</th>
                      <th className="p-2 lg:p-3 text-left">Phone</th>
                      <th className="p-2 lg:p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading
                      ? loadingRow(5)
                      : passengerRows.length === 0
                        ? emptyRow(5, "There are no passengers at this time.")
                        : paginate(passengerRows, page).map((item, i) => (
                            <tr key={item.userId}>
                              <td className="p-2 lg:p-3">
                                {(page - 1) * PER_PAGE + i + 1}
                              </td>
                              <td className="p-2 lg:p-3">{item.name}</td>
                              <td className="p-2 lg:p-3">{item.email}</td>
                              <td className="p-2 lg:p-3">
                                {phoneCell(item.mobile, welcomeMessage(item.name))}
                              </td>
                              <td className="p-2 lg:p-3">
                                <DeleteBtn
                                  deleteIcon
                                  onConfirm={() => handleDeleteUser(item.userId)}
                                />
                              </td>
                            </tr>
                          ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(passengerRows.length / PER_PAGE)}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </>
        )}

        {/* Reports */}
        {activeMenu === "reports" && (
          <>
            <h1 className="mb-6 pt-24 text-3xl font-bold text-secondary">
              User Reports
            </h1>

            <div className="mb-4 flex flex-wrap gap-3 items-end bg-white p-4 rounded-xl shadow">
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
              <label className="flex flex-col text-sm">
                Reported by
                <select
                  className="form-control py-2!"
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {Object.entries(MODE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                User
                <select
                  className="form-control py-2!"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="">All users</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.name} ({u.mobile})
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                From
                <input
                  type="date"
                  className="form-control py-2!"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </label>
              <label className="flex flex-col text-sm">
                To
                <input
                  type="date"
                  className="form-control py-2!"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </label>
              <button
                className="btn py-2"
                onClick={() => {
                  setStatusFilter("");
                  setModeFilter("");
                  setUserFilter("");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear
              </button>
            </div>

            <div className="relative rounded-xl bg-white px-3 lg:px-6 pt-6 pb-14 shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full w-full border-collapse text-sm">
                  <thead className="bg-secondary/20 text-secondary">
                    <tr>
                      <th className="px-4 py-3 text-start">S.No.</th>
                      <th className="px-4 py-3 text-start">Name</th>
                      <th className="px-4 py-3 text-start">Type</th>
                      <th className="px-4 py-3 text-start">Phone</th>
                      <th className="px-4 py-3 text-start">Service</th>
                      <th className="px-4 py-3 text-start">Company</th>
                      <th className="px-4 py-3 text-start">Vehicle No</th>
                      <th className="px-4 py-3 text-start">Problem</th>
                      <th className="px-4 py-3 text-start">Attachments</th>
                      <th className="px-4 py-3 text-start">Date</th>
                      <th className="px-4 py-3 text-start">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {reportsLoading
                      ? loadingRow(11)
                      : reportRows.length === 0
                        ? emptyRow(11, "No reports found.")
                        : paginate(reportRows, page).map((report, i) => {
                            const next = NEXT_STATUSES[
                              report.status as keyof typeof NEXT_STATUSES
                            ] ?? [];
                            const reporter = report.reporter ?? {};
                            const isPassenger =
                              report.reporterMode === "PESSENGER";
                            return (
                              <tr
                                className="border-b border-secondary/20 transition-all duration-300 hover:bg-gray-300/20"
                                key={report.reportId}
                              >
                                <td className="px-4 py-3">
                                  {(page - 1) * PER_PAGE + i + 1}
                                </td>
                                <td className="px-4 py-3">{reporter.name}</td>
                                <td className="px-4 py-3">
                                  {report.reporterMode ? (
                                    <span
                                      className={`text-xs font-semibold px-2 py-1 rounded ${
                                        MODE_BADGE[report.reporterMode] ?? ""
                                      }`}
                                    >
                                      {MODE_LABEL[report.reporterMode] ??
                                        report.reporterMode}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {phoneCell(
                                    reporter.mobile,
                                    reportMessage(reporter.name),
                                  )}
                                </td>
                                <td className="px-4 py-3 capitalize">
                                  {report.service}
                                </td>
                                <td className="px-4 py-3">{report.company}</td>
                                {/* Passenger: the rider/vehicle they reported. Rider: their own vehicle */}
                                <td className="px-4 py-3">
                                  {isPassenger ? (
                                    <>
                                      <span className="uppercase">
                                        {report.vehicleNumber ?? "-"}
                                      </span>
                                      {report.riderName && (
                                        <div className="text-xs text-gray-500">
                                          Rider: {report.riderName}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    ridersByUserId.get(reporter.userId)
                                      ?.vehicleNumber ?? "-"
                                  )}
                                </td>
                                <td className="px-4 py-3 max-w-xs wrap-break-words text-start">
                                  <div className="flex gap-1">
                                    <p>
                                      {!report.problem
                                        ? "-"
                                        : report.problem.length > 20
                                          ? report.problem.slice(0, 20) + "..."
                                          : report.problem}
                                    </p>
                                    {report.problem?.length > 20 && (
                                      <a
                                        href={`#problemPopup-${report.reportId}`}
                                        data-fancybox
                                      >
                                        show
                                      </a>
                                    )}
                                  </div>
                                  <div
                                    id={`problemPopup-${report.reportId}`}
                                    className="hidden max-w-2xl"
                                  >
                                    {report.problem}
                                  </div>
                                </td>
                                <td className="px-4 py-3 min-w-56">
                                  {report.voice || report.image ? (
                                    <ReportAttachments
                                      report={report}
                                      fetchUrl={getReportFileUrlAdmin}
                                      autoLoad
                                      className="flex flex-col gap-2"
                                    />
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {new Date(report.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col gap-1">
                                    <span
                                      className={`text-xs font-semibold px-2 py-1 rounded w-fit ${
                                        STATUS_BADGE[report.status] ??
                                        "bg-secondary/10"
                                      }`}
                                    >
                                      {STATUS_LABEL[report.status] ??
                                        report.status}
                                    </span>
                                    {next.length > 0 && (
                                      <select
                                        className="border rounded px-1 py-1 text-xs"
                                        value=""
                                        onChange={(e) =>
                                          handleStatusChange(
                                            report.reportId,
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="" disabled>
                                          Change status
                                        </option>
                                        {next.map((s) => (
                                          <option key={s} value={s}>
                                            {STATUS_LABEL[s]}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                  </tbody>
                </table>
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(reportRows.length / PER_PAGE)}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
