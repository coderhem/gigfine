"use client";

import { assignRole, getUsersByRole, removeRoles } from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import DeleteBtn from "@/app/components/crudOperationBtns/deleteBtn";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type ListRole = "admin" | "business";

// Roles an admin can hand out by phone number. Business is normally given by approving
// the business in the Businesses tab; assigning it here approves the business too.
const ASSIGNABLE_ROLES: Record<string, string> = {
  ADMIN: "Admin",
  RIDER: "Rider",
  BUSINESS: "Business",
};

const ROLE_LABEL: Record<string, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_RIDER: "Rider",
  ROLE_PASSENGER: "Passenger",
  ROLE_BUSINESS: "Business",
};

export default function RoleManagement() {
  const [listRole, setListRole] = useState<ListRole>("admin");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [assignMobile, setAssignMobile] = useState("");
  const [assignTo, setAssignTo] = useState("ADMIN");
  const [removeBy, setRemoveBy] = useState<"mobile" | "userId">("mobile");
  const [removeValue, setRemoveValue] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      setUsers(await getUsersByRole(listRole));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [listRole]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignMobile.trim()) return;
    setBusy(true);
    try {
      const user = await assignRole(assignMobile.trim(), assignTo);
      toast.success(`${ASSIGNABLE_ROLES[assignTo]} role given to ${user.name}.`);
      setAssignMobile("");
      await fetchUsers();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to assign role"));
    } finally {
      setBusy(false);
    }
  };

  const doRemove = async (target: { userId?: number; mobile?: string }) => {
    setBusy(true);
    try {
      const user = await removeRoles(target);
      toast.success(`All roles removed from ${user.name}. They are a passenger now.`);
      setRemoveValue("");
      await fetchUsers();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to remove roles"));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = (e: React.FormEvent) => {
    e.preventDefault();
    const value = removeValue.trim();
    if (!value) return;
    doRemove(removeBy === "userId" ? { userId: Number(value) } : { mobile: value });
  };

  const tabBtn = (role: ListRole, label: string) => (
    <button
      onClick={() => setListRole(role)}
      className={`px-4 py-2 rounded-lg cursor-pointer ${
        listRole === role ? "bg-secondary text-white" : "bg-gray-200 text-secondary"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <h1 className="mb-6 pt-24 text-3xl font-bold text-secondary">Role Management</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Assign */}
        <form onSubmit={handleAssign} className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <h3 className="h5 mb-0">Give a role</h3>
          <p className="text-sm text-gray-500 mb-0">
            Adds the role to the user with this phone number. Their other roles stay.
          </p>
          <input
            type="text"
            placeholder="Phone number"
            className="form-control py-2!"
            value={assignMobile}
            onChange={(e) => setAssignMobile(e.target.value)}
          />
          <select
            className="form-control py-2!"
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
          >
            {Object.entries(ASSIGNABLE_ROLES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary py-2" disabled={busy}>
            Assign role
          </button>
        </form>

        {/* Remove */}
        <form onSubmit={handleRemove} className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <h3 className="h5 mb-0">Remove roles</h3>
          <p className="text-sm text-gray-500 mb-0">
            Removes every role. The user keeps only the default passenger role.
          </p>
          <select
            className="form-control py-2!"
            value={removeBy}
            onChange={(e) => setRemoveBy(e.target.value as "mobile" | "userId")}
          >
            <option value="mobile">By phone number</option>
            <option value="userId">By user ID</option>
          </select>
          <input
            type={removeBy === "userId" ? "number" : "text"}
            placeholder={removeBy === "userId" ? "User ID" : "Phone number"}
            className="form-control py-2!"
            value={removeValue}
            onChange={(e) => setRemoveValue(e.target.value)}
          />
          <button type="submit" className="btn py-2" disabled={busy}>
            Remove all roles
          </button>
        </form>
      </div>

      <div className="flex gap-2 mb-4">
        {tabBtn("admin", "Admins")}
        {tabBtn("business", "Businesses")}
      </div>

      <div className="relative rounded-xl bg-white px-3 lg:px-6 pt-6 pb-6 shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full border-collapse text-sm">
            <thead className="bg-secondary/20 text-secondary">
              <tr>
                <th className="px-4 py-3 text-start">User ID</th>
                <th className="px-4 py-3 text-start">Name</th>
                <th className="px-4 py-3 text-start">Phone</th>
                <th className="px-4 py-3 text-start">Email</th>
                <th className="px-4 py-3 text-start">Roles</th>
                <th className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6">
                    <div className="flex justify-center">
                      <LoadingSvg />
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="pt-6 text-center text-gray-500">
                    No users with this role.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId} className="border-b border-secondary/20">
                    <td className="px-4 py-3">{u.userId}</td>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.mobile}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles ?? []).map((r: string) => (
                          <span key={r} className="text-xs px-2 py-1 rounded bg-secondary/10">
                            {ROLE_LABEL[r] ?? r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DeleteBtn
                        deleteText="Remove roles"
                        onConfirm={() => doRemove({ userId: u.userId })}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
