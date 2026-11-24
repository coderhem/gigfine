"use client";

import {
  createAdminNotification,
  deleteAdminNotification,
  deleteUser,
  forwardReport,
  getAdminNotifications,
  getAllRiders,
  getAllUsers,
  getReportFileUrlAdmin,
  getReports,
  markAllReportsSeenAdmin,
  markReportSeenAdmin,
  NEXT_STATUSES,
  searchBusinesses,
  updateAdminNotification,
  updateReportStatus,
} from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import { REPORT_STATUS_LABEL } from "@/api/problem";
import ReportAttachments from "@/app/components/reportAttachments";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { FaBell, FaBiking, FaBuilding, FaHome, FaTools, FaTrashAlt, FaUser, FaUserShield } from "react-icons/fa";
import { MdLogout, MdMenu, MdMenuOpen, MdOutlineReportProblem } from "react-icons/md";
import LoadingSvg from "../../components/loader/loadingSvg";
import DeleteBtn from "../../components/crudOperationBtns/deleteBtn";
import toast from "react-hot-toast";
import { HiShieldCheck } from "react-icons/hi2";
import Pagination from "@/app/components/paginationUI/pagination";
import AdminFooter from "@/app/components/footer/adminFooter";
import BusinessSection from "../components/businessSection";
import RoleManagement from "../components/roleManagement";
import GarageHelp from "../components/garageHelp";
import AccountDeletion from "../components/accountDeletion";
import NotificationManager, { type NotificationApi } from "@/app/components/notificationManager";
import RentalReview from "../components/rentalReview";

// Sidebar: "collapsed" (icons only) / "expanded", saved in localStorage. null = automatic:
// icons only below lg, full width from lg. Read with useSyncExternalStore (no setState in an effect).
type SidebarPref = "collapsed" | "expanded" | null;
const SIDEBAR_KEY = "adminSidebar";
const SIDEBAR_EVENT = "admin-sidebar";
const subscribeSidebar = (cb: () => void) => {
  window.addEventListener(SIDEBAR_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(SIDEBAR_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};
const readSidebar = (): SidebarPref => {
  const v = localStorage.getItem(SIDEBAR_KEY);
  return v === "collapsed" || v === "expanded" ? v : null;
};
const saveSidebar = (v: SidebarPref) => {
  if (v) localStorage.setItem(SIDEBAR_KEY, v);
  else localStorage.removeItem(SIDEBAR_KEY);
  window.dispatchEvent(new Event(SIDEBAR_EVENT));
};

type MenuType = "riders" | "passengers" | "reports" | "businesses" | "roles" | "notifications" | "rentals" | "garage" | "deletion";

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
  businesses: "Businesses",
  roles: "Role Management",
  notifications: "Notifications",
  rentals: "Rentals",
  garage: "Garage help",
  deletion: "Account deletion",
};

// These sections have their own filters and counts
const SELF_CONTAINED: MenuType[] = ["businesses", "roles", "notifications", "rentals", "garage", "deletion"];

const NOTIFICATION_API: NotificationApi = {
  list: getAdminNotifications,
  create: createAdminNotification,
  update: updateAdminNotification,
  remove: deleteAdminNotification,
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
  const sidebarPref = useSyncExternalStore(subscribeSidebar, readSidebar, () => null);
  const [page, setPage] = useState(1);

  const [users, setUsers] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  // Approved businesses a report can be forwarded to
  const [approvedBusinesses, setApprovedBusinesses] = useState<any[]>([]);

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

  const fetchApprovedBusinesses = async () => {
    try {
      setApprovedBusinesses(
        await searchBusinesses({ status: "APPROVED", sortBy: "name", direction: "asc" }),
      );
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load businesses"));
    }
  };

  useEffect(() => {
    if (authorized) fetchUsers();
  }, [authorized]);

  // Refresh when opening reports so newly approved businesses show up
  useEffect(() => {
    if (authorized && activeMenu === "reports") fetchApprovedBusinesses();
  }, [authorized, activeMenu]);

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
      ridersByUserId.get(r.reporter?.userId)?.licenseNumber,
    ),
  );

  const unseenCount = reports.filter((r) => r.unseen).length;

  const activeCount: Partial<Record<MenuType, number>> = {
    riders: riderRows.length,
    passengers: passengerRows.length,
    reports: reportRows.length,
  };
  const showSearch = !SELF_CONTAINED.includes(activeMenu);

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

  const handleForward = async (reportId: number, businessUserId: string) => {
    try {
      const updated = await forwardReport(
        reportId,
        businessUserId ? Number(businessUserId) : null,
      );
      setReports((prev) =>
        prev.map((r) => (r.reportId === reportId ? updated : r)),
      );
      toast.success(
        updated.forwardedBusinessName
          ? `Report forwarded to ${updated.forwardedBusinessName}.`
          : "Report taken back from the business.",
      );
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to forward report"));
    }
  };

  // Clear the "new" highlight right away; the backend call just keeps other admins in sync
  const handleSeen = async (reportId: number) => {
    setReports((prev) =>
      prev.map((r) => (r.reportId === reportId ? { ...r, unseen: false } : r)),
    );
    try {
      await markReportSeenAdmin(reportId);
    } catch {
      /* only the highlight; it comes back on the next load */
    }
  };

  const handleAllSeen = async () => {
    try {
      await markAllReportsSeenAdmin();
      setReports((prev) => prev.map((r) => ({ ...r, unseen: false })));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to mark reports as seen"));
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

  // Classes for each sidebar state (see SidebarPref)
  const collapsed = sidebarPref === "collapsed";
  const expanded = sidebarPref === "expanded";
  const sb = {
    width: collapsed ? "w-16" : expanded ? "w-64 lg:w-72" : "w-16 lg:w-72",
    offset: collapsed ? "ml-16" : "ml-16 lg:ml-72",
    left: collapsed ? "left-16" : "left-16 lg:left-72",
    label: collapsed ? "hidden" : expanded ? "inline" : "hidden lg:inline",
    center: collapsed ? "justify-center" : expanded ? "" : "max-lg:justify-center",
  };
  // Opened on a small screen it lies over the page; a narrow screen can't fit it beside the content
  const overlayOpen = expanded;
  const isWide = () => window.matchMedia("(min-width: 1024px)").matches;
  const toggleSidebar = () => {
    const showing = expanded || (sidebarPref === null && isWide());
    saveSidebar(showing ? "collapsed" : "expanded");
  };

  const menuBtn = (menu: MenuType, icon: ReactNode, label: string, badge = 0) => (
    <button
      title={label}
      onClick={() => {
        setActiveMenu(menu);
        // Picking a page on a small screen closes the menu again
        if (expanded && !isWide()) saveSidebar(null);
      }}
      className={`relative w-full rounded-lg p-3 text-left transition cursor-pointer bg-gray-200/20 text-white flex gap-3 items-center ${sb.center} ${
        activeMenu === menu ? "bg-primary" : "hover:bg-white/10"
      }`}
    >
      <span className="shrink-0 text-lg">{icon}</span>
      <span className={`${sb.label} truncate`}>{label}</span>
      {badge > 0 && (
        <>
          <span className={`${collapsed ? "hidden" : expanded ? "inline-flex" : "hidden lg:inline-flex"} ml-auto min-w-6 h-6 px-1.5 rounded-full bg-white text-primary text-xs font-bold items-center justify-center`}>
            {badge > 99 ? "99+" : badge}
          </span>
          {/* Icons only: a dot on the icon instead of the count */}
          <span className={`${collapsed ? "" : expanded ? "hidden" : "lg:hidden"} absolute top-1.5 right-1.5 size-2.5 rounded-full bg-white ring-2 ring-primary`} />
        </>
      )}
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
      {/* Sidebar: brand, scrollable menu, logout pinned at the bottom (h-dvh = mobile-safe height) */}
      {overlayOpen && (
        <div className="lg:hidden fixed inset-0 z-90 bg-black/40" onClick={() => saveSidebar(null)} />
      )}
      <aside className={`fixed z-100 left-0 top-0 h-dvh ${sb.width} bg-secondary text-white shadow-lg flex flex-col transition-[width] duration-200`}>
        <div className={`shrink-0 h-[73px] border-b border-white/20 px-4 flex items-center gap-2 ${sb.center}`}>
          <HiShieldCheck className="text-2xl shrink-0" />
          <span className={`${sb.label} text-lg font-bold whitespace-nowrap`}>
            GIGFINE <span className="font-normal text-white/70">Admin</span>
          </span>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 lg:p-3 space-y-2">
          {menuBtn("riders", <FaBiking />, "Rider Details")}
          {menuBtn("passengers", <FaUser />, "Passenger Details")}
          {menuBtn("reports", <MdOutlineReportProblem />, "User Reports", unseenCount)}
          {menuBtn("businesses", <FaBuilding />, "Businesses")}
          {menuBtn("roles", <FaUserShield />, "Role Management")}
          {menuBtn("notifications", <FaBell />, "Notifications")}
          {menuBtn("rentals", <FaHome />, "Rentals")}
          {menuBtn("garage", <FaTools />, "Garage help")}
          {menuBtn("deletion", <FaTrashAlt />, "Account deletion")}
        </nav>

        <div className="shrink-0 border-t border-white/20 p-2 lg:p-3">
          <button title="Logout" onClick={handleLogout}
            className={`w-full btn btn-primary flex items-center gap-2 justify-center px-2`}>
            <MdLogout className="shrink-0 text-lg" />
            <span className={sb.label}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className={`${sb.offset} flex-1 min-w-0 p-4 overflow-hidden flex flex-col transition-[margin] duration-200`}>
        <div className={`mb-5 fixed z-20 ${sb.left} right-0 top-0 h-[73px] px-3 lg:px-5 bg-white shadow flex items-center justify-between gap-3 transition-[left] duration-200`}>
          <div className="flex min-w-0 items-center gap-2 lg:gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              title="Show / hide menu"
              aria-label="Show / hide menu"
              className="shrink-0 rounded-lg p-2 text-2xl text-secondary hover:bg-gray-100 cursor-pointer"
            >
              {collapsed ? <MdMenu /> : expanded ? <MdMenuOpen /> : (
                // Automatic: closed below lg, open from lg
                <>
                  <MdMenu className="lg:hidden" />
                  <MdMenuOpen className="max-lg:hidden" />
                </>
              )}
            </button>
            <h2 className="truncate text-lg md:text-xl font-semibold text-secondary mb-0">
              {MENU_TITLE[activeMenu]}{" "}
              {showSearch && (
                <span className="text-primary">({activeCount[activeMenu]})</span>
              )}
            </h2>
          </div>

          <div className={`relative w-36 shrink-0 sm:w-56 md:w-80 ${showSearch ? "" : "hidden"}`}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-9 outline-none transition focus:border-secondary"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        <div className="flex-1">
        {/* Riders */}
        {activeMenu === "riders" && (
          <>
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
              {unseenCount > 0 && (
                <button className="btn btn-primary py-2 ml-auto" onClick={handleAllSeen}>
                  Mark all {unseenCount} new as seen
                </button>
              )}
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
                      <th className="px-4 py-3 text-start">Vehicle / License</th>
                      <th className="px-4 py-3 text-start">Problem</th>
                      <th className="px-4 py-3 text-start">Attachments</th>
                      <th className="px-4 py-3 text-start">Date</th>
                      <th className="px-4 py-3 text-start">Status</th>
                      <th className="px-4 py-3 text-start">Forwarded to</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {reportsLoading
                      ? loadingRow(12)
                      : reportRows.length === 0
                        ? emptyRow(12, "No reports found.")
                        : paginate(reportRows, page).map((report, i) => {
                            const next = NEXT_STATUSES[
                              report.status as keyof typeof NEXT_STATUSES
                            ] ?? [];
                            const reporter = report.reporter ?? {};
                            const isPassenger =
                              report.reporterMode === "PESSENGER";
                            const rider = ridersByUserId.get(reporter.userId);
                            return (
                              <tr
                                className={`border-b border-secondary/20 transition-all duration-300 ${
                                  report.unseen
                                    ? "bg-primary/10 hover:bg-primary/15 cursor-pointer"
                                    : "hover:bg-gray-300/20"
                                }`}
                                key={report.reportId}
                                onClick={() => report.unseen && handleSeen(report.reportId)}
                                title={report.unseen ? "New — click to mark as seen" : undefined}
                              >
                                <td
                                  className={`px-4 py-3 border-l-4 ${
                                    report.unseen ? "border-primary" : "border-transparent"
                                  }`}
                                >
                                  {(page - 1) * PER_PAGE + i + 1}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={report.unseen ? "font-semibold text-secondary" : ""}>
                                    {reporter.name}
                                  </span>
                                  {report.unseen && (
                                    <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary text-white align-middle">
                                      New
                                    </span>
                                  )}
                                </td>
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
                                {/* Passenger: the rider/vehicle they reported. Rider: their own vehicle + license */}
                                <td className="px-4 py-3 whitespace-nowrap">
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
                                  ) : rider ? (
                                    <>
                                      <span className="uppercase">
                                        {rider.vehicleNumber || "-"}
                                      </span>
                                      <div className="text-xs text-gray-500">
                                        License:{" "}
                                        <span className="uppercase">
                                          {rider.licenseNumber || "-"}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    "-"
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
                                <td className="px-4 py-3">
                                  {report.voice || report.image ? (
                                    <ReportAttachments
                                      report={report}
                                      fetchUrl={getReportFileUrlAdmin}
                                      autoLoad
                                      compact
                                    />
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
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
                                <td className="px-4 py-3">
                                  <select
                                    className="border rounded px-1 py-1 text-xs max-w-40"
                                    value={report.forwardedBusinessUserId ?? ""}
                                    onChange={(e) =>
                                      handleForward(report.reportId, e.target.value)
                                    }
                                  >
                                    <option value="">Not forwarded</option>
                                    {/* Keep the current business listed even if it is no longer approved */}
                                    {report.forwardedBusinessUserId &&
                                      !approvedBusinesses.some(
                                        (b) => b.userId === report.forwardedBusinessUserId,
                                      ) && (
                                        <option value={report.forwardedBusinessUserId}>
                                          {report.forwardedBusinessName}
                                        </option>
                                      )}
                                    {approvedBusinesses.map((b) => (
                                      <option key={b.userId} value={b.userId}>
                                        {b.businessName}
                                      </option>
                                    ))}
                                  </select>
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

        {activeMenu === "businesses" && <BusinessSection />}

        {activeMenu === "roles" && <RoleManagement />}

        {activeMenu === "notifications" && (
          <>
            <NotificationManager api={NOTIFICATION_API} showCreator />
          </>
        )}

        {activeMenu === "rentals" && <RentalReview />}

        {activeMenu === "garage" && <GarageHelp />}

        {activeMenu === "deletion" && <AccountDeletion />}
        </div>

        <AdminFooter className="mt-10 border-t border-gray-200" />
      </div>
    </div>
  );
}
