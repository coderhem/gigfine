"use client";

import { deleteUser, getAllUser } from "@/api/auth";
import { getAllProblem } from "@/api/problem";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { MdOutlineReportProblem } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import LoadingSvg from "../../components/loader/loadingSvg";
import UpdateBtn from "../../components/crudOperationBtns/updateBtn";
import DeleteBtn from "../../components/crudOperationBtns/deleteBtn";
import toast from "react-hot-toast";
import { logout } from "@/redux/auth/authSlice";
import { HiShieldCheck } from "react-icons/hi2";
import Pagination from "@/app/components/paginationUI/pagination";

type MenuType = "users" | "problems" | "riders";

export default function Dashboard() {
  const { loading, error, user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [problems, setProblems] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [problemLoading, setProblemLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const usersPerPage = 10;

  // const totalPages = Math.ceil(users.length / usersPerPage);
  // const startIndex = (page - 1) * usersPerPage;
  // const endIndex = startIndex + usersPerPage;

  // const currentUsers = users.slice(startIndex, endIndex);
  const filteredUsers = users.filter((user) => {
    const searchTerm = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.phone?.toLowerCase().includes(searchTerm) ||
      user.vehicleNumber?.toLowerCase().includes(searchTerm)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const startIndex = (page - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;

  const currentUsers = filteredUsers.slice(startIndex, endIndex);
  useEffect(() => {
    getAllUser()
      .then((data) => {
        setUsers(data.users || data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setUserLoading(false);
      });
  }, []);

  useEffect(() => {
    getAllProblem()
      .then((data) => {
        setProblems(data.problems || data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setProblemLoading(false);
      });
  }, []);

  const handleDelete = async (id: any) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));

      toast.success("User deleted successfully.");
      router.refresh();
    } catch (error: any) {
      toast.error(error);
    }
  };

  const handleUpdate = async (id: any) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));

      toast.success("User deleted successfully.");
      router.refresh();
    } catch (error: any) {
      toast.error(error);
    }
  };

  const [activeMenu, setActiveMenu] = useState<MenuType>("users");

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setAuthorized(true);
  }, []);

  if (!authorized) {
    return (
      <LoadingSvg
        className={"absolute left-1/2 top-1/2 -translate-1/2 size-20"}
      />
    ); // वा Loading...
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed z-100 left-0 top-0 h-screen w-72 bg-secondary text-white shadow-lg">
        <div className="border-b border-white/20 p-6">
          <div className="flex items-center gap-2 mb-2">
            <HiShieldCheck className="text-3xl text-white" />
            <h2 className="text-2xl font-bold mb-0">Admin Dashboard</h2>
          </div>
          <p className="mt-1 text-sm text-gray-200 pl-9">
            Welcome back! Manage users, reports, and system operations.
          </p>
        </div>

        <nav className="p-4 space-y-3">
          <button
            onClick={() => setActiveMenu("users")}
            className={`w-full rounded-lg p-3 text-left transition cursor-pointer bg-gray-200/20 text-white flex gap-2 items-center ${
              activeMenu === "users" ? "bg-primary" : "hover:bg-white/10"
            }`}
          >
            <FaUser />
            <span>User Details</span>
          </button>

          <button
            onClick={() => setActiveMenu("problems")}
            className={`w-full rounded-lg p-3 text-left transition cursor-pointer bg-gray-200/20 text-white flex gap-2 items-center ${
              activeMenu === "problems" ? "bg-primary" : "hover:bg-white/10"
            }`}
          >
            <MdOutlineReportProblem />
            <span> User Problems</span>
          </button>
        </nav>

        <div className="absolute bottom-5 left-0 w-full px-4">
          <button className="w-full btn btn-primary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="ml-72 flex-1 p-4 overflow-hidden">
        <div className="mb-5 fixed z-20 left-72 p-5 bg-white shadow right-0 top-0 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-secondary">
            Total Users <span className="text-primary">({filteredUsers.length})</span>
          </h2>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 outline-none transition focus:border-secondary"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
        {activeMenu === "users" && (
          <>
            <h1 className="h2 pt-24 mb-6 text-3xl font-bold text-secondary">
              User Details
            </h1>

            <div className="relative rounded-xl bg-white px-6 pt-6 pb-14 shadow counter-wrapper">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-start">S.No.</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="px-4 py-3 text-start">Email</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Created Date</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {userLoading ? (
                      <tr>
                        <LoadingSvg
                          className={
                            "absolute bottom-5 left-1/2 -translate-x-1/2"
                          }
                        />
                      </tr>
                    ) : currentUsers?.length > 0 ? (
                      currentUsers.map((item: any) => (
                        <tr key={item._id}>
                          <td className="counter p-3"></td>
                          <td className="p-3">{item.name}</td>
                          <td className="p-3">{item.email}</td>
                          <td className="p-3">{item.phone}</td>
                          <td
                            className={`${item.isActive ? "text-green-600" : "text-red"} p-3 `}
                          >
                            {user?.isActive ? "Active" : "Inactive"}
                          </td>
                          <td className="p-3">
                            {" "}
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <DeleteBtn
                                deleteIcon
                                onConfirm={() => handleDelete(item._id)}
                              />
                              <UpdateBtn
                                updateIcon
                                btnLink={`/admin/user-management/${item.id}`}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="pt-6 text-center text-gray-500"
                        >
                          There are no users at this time.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </>
        )}
        {activeMenu === "users" && (
          <div className="pt-8 counter-wrapper">
            <h1 className="mb-6 text-3xl font-bold text-[#0C589C]">
              User Details Rider
            </h1>

            <div className="rounded-xl bg-white p-6 shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full">
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

                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user._id}>
                        <td className="p-3 counter"></td>
                        <td className="p-3">{user.name}</td>
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
                              <DeleteBtn
                                deleteIcon
                                onConfirm={() => handleDelete(user._id)}
                              />
                            </td>
                            <td>
                              <UpdateBtn updateIcon customClass="min-w-full" />
                            </td>
                          </tr>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeMenu === "problems" && (
          <div>
            <h1 className="mb-6 text-3xl font-bold text-secondary">
              User Problems
            </h1>

            <div className="overflow-x-auto">
              <table className="min-w-full w-full border-collapse bg-white shadow-md overflow-hidden counter-wrapper">
                <thead className="bg-secondary/20 text-secondary">
                  <tr>
                    <th className="px-4 py-3 text-start">S.No.</th>
                    <th className="px-4 py-3 text-start">Name</th>
                    <th className="px-4 py-3 text-start">Phone</th>
                    <th className="px-4 py-3 text-start">Company</th>
                    <th className="px-4 py-3 text-start">Vechile No</th>
                    <th className="px-4 py-3 text-start">Problem</th>
                    <th className="px-4 py-3 text-start">Date</th>
                    <th className="px-4 py-3 text-start">Actions</th>
                  </tr>
                </thead>

                <tbody className="text-gray-700 text-sm">
                  {problemLoading ? (
                    <td>
                      <LoadingSvg
                        className={
                          "absolute bottom-5 left-1/2 -translate-x-1/2"
                        }
                      />
                    </td>
                  ) : (
                    problems.map((problem: any, index: number) => {
                      return (
                        <tr
                          className="border-b border-secondary/20  transition-all duration-300 hover:bg-gray-300/20"
                          key={problem._id}
                        >
                          <td className="px-4 py-3 counter"></td>
                          <td className="px-4 py-3">{problem.user?.name}</td>
                          <td className="px-4 py-3">{problem.user?.phone}</td>
                          <td className="px-4 py-3">{problem.company}</td>
                          <td className="px-4 py-3">
                            {problem.user?.vehicleNumber}
                          </td>
                          <td className="px-4 py-3 max-w-xs wrap-break-words text-start">
                            <div className="flex gap-1">
                              <p>
                                {problem.problem.length > 20
                                  ? problem.problem.slice(0, 20) + "..."
                                  : problem.problem}
                              </p>

                              {problem.problem.length > 20 && (
                                <a
                                  href={`#problemPopup-${index}`}
                                  data-fancybox
                                >
                                  show
                                </a>
                              )}
                            </div>
                            <div
                              id={`problemPopup-${index}`}
                              className="hidden max-w-2xl"
                            >
                              {problem.problem}
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-xs wrap-break-words text-start">
                            {new Date(problem.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {/* <Link
                              href={`/admin/user-management/edit/${user._id}`}
                            > */}
                              <button onClick={handleDelete}>
                                <DeleteBtn
                                  deleteIcon
                                  onConfirm={() => handleDelete(problem._id)}
                                />
                              </button>
                              {/* </Link> */}
                              <button>
                                <UpdateBtn updateIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
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
      </div>
    </div>
  );
}
