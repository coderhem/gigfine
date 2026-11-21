"use client";

import { deleteUser, getAccountDeletionRequests, updateAccountDeletionStatus } from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Requests from the public gigfine.com/delete-account form (the Google Play "Delete account URL").
// The office checks the person (call the number), deletes the matched account, then marks it Done.

type Status = "NEW" | "DONE" | "REJECTED";

type DeletionRequest = {
  id: number;
  status: Status;
  name: string;
  phone: string;
  email?: string;
  app?: string;
  reason?: string;
  adminNote?: string;
  createdAt?: string;
  closedAt?: string;
  matchedUserId?: number;
  matchedUserName?: string;
  matchedUserEmail?: string;
  matchedUserMobile?: string;
  accountExists: boolean;
};

const STATUS_LABEL: Record<Status, string> = { NEW: "New", DONE: "Deleted", REJECTED: "Rejected" };
const STATUS_BADGE: Record<Status, string> = {
  NEW: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
  REJECTED: "bg-gray-100 text-gray-700",
};
const APP_LABEL: Record<string, string> = { GIGFINE: "GigFine", RENTAL: "Rentals" };

const when = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-NP") : "");

export default function AccountDeletion() {
  const [status, setStatus] = useState<Status | "">("NEW");
  const [rows, setRows] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [reloads, setReloads] = useState(0);

  // Fetch when the filter changes or after an action (state is set only in the callbacks)
  useEffect(() => {
    let live = true;
    getAccountDeletionRequests(status || undefined)
      .then((r) => live && setRows(r))
      .catch((e) => live && toast.error(apiErrorMessage(e, "Could not load deletion requests")))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [status, reloads]);

  const load = () => {
    setLoading(true);
    setReloads((n) => n + 1);
  };

  const setRowStatus = async (r: DeletionRequest, next: Status, note?: string) => {
    setBusy(r.id);
    try {
      await updateAccountDeletionStatus(r.id, next, note);
      toast.success(`#${r.id}: ${STATUS_LABEL[next]}`);
      load();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not update"));
    } finally {
      setBusy(null);
    }
  };

  const deleteAccount = async (r: DeletionRequest) => {
    if (!r.matchedUserId) return;
    const ok = window.confirm(
      `Delete the account of ${r.matchedUserName ?? "this user"} (${r.matchedUserMobile ?? r.phone})?\n` +
        "This cannot be undone. Did you confirm it is their account?",
    );
    if (!ok) return;
    setBusy(r.id);
    try {
      await deleteUser(r.matchedUserId);
      await updateAccountDeletionStatus(r.id, "DONE", "Account deleted");
      toast.success("Account deleted");
      load();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not delete the account"));
    } finally {
      setBusy(null);
    }
  };

  const reject = (r: DeletionRequest) => {
    const note = window.prompt("Why is it rejected? (e.g. could not confirm the owner)", "");
    if (note === null) return;
    setRowStatus(r, "REJECTED", note);
  };

  return (
    <>
      <h1 className="mb-6 pt-24 text-3xl font-bold text-secondary">Account deletion</h1>
      <p className="text-sm text-gray-600 mb-4">
        From the public page <b>gigfine.com/delete-account</b>. Call the number to confirm it is the owner, then
        delete the account. Promise on the page: done within 7 days.
      </p>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select
          className="form-control py-2! w-auto!"
          value={status}
          onChange={(e) => {
            setLoading(true);
            setStatus(e.target.value as Status | "");
          }}
        >
          <option value="">All</option>
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button className="btn py-2" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="relative rounded-xl bg-white px-3 lg:px-6 pt-6 pb-6 shadow">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-6">
              <LoadingSvg />
            </div>
          ) : (
            <table className="min-w-full w-full border-collapse text-sm">
              <thead className="bg-secondary/20 text-secondary">
                <tr>
                  <th className="px-3 py-3 text-start">Asked</th>
                  <th className="px-3 py-3 text-start">From the form</th>
                  <th className="px-3 py-3 text-start">Matched account</th>
                  <th className="px-3 py-3 text-start">Reason</th>
                  <th className="px-3 py-3 text-start">Status</th>
                  <th className="px-3 py-3 text-start">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="pt-6 text-center text-gray-500">
                      No deletion requests here.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b border-secondary/20 align-top">
                      <td className="px-3 py-3 whitespace-nowrap">
                        #{r.id}
                        <div className="text-xs text-gray-500">{when(r.createdAt)}</div>
                        {r.app && <div className="text-xs">{APP_LABEL[r.app] ?? r.app}</div>}
                      </td>
                      <td className="px-3 py-3">
                        <b>{r.name}</b>
                        <div>
                          <a href={`tel:${r.phone}`} className="underline text-secondary">
                            {r.phone}
                          </a>
                        </div>
                        {r.email && <div className="text-xs">{r.email}</div>}
                      </td>
                      <td className="px-3 py-3">
                        {r.accountExists ? (
                          <>
                            <b>{r.matchedUserName}</b> <span className="text-xs text-gray-500">#{r.matchedUserId}</span>
                            <div className="text-xs">{r.matchedUserMobile}</div>
                            <div className="text-xs">{r.matchedUserEmail}</div>
                          </>
                        ) : r.matchedUserId ? (
                          <span className="text-green-700 text-xs">Account already deleted</span>
                        ) : (
                          <span className="text-red-700 text-xs">No account with this phone / email</span>
                        )}
                      </td>
                      <td className="px-3 py-3 max-w-xs">
                        {r.reason ?? <span className="text-gray-400">—</span>}
                        {r.adminNote && <div className="text-xs text-gray-500 mt-1">Note: {r.adminNote}</div>}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${STATUS_BADGE[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                        {r.closedAt && <div className="text-xs text-gray-500 mt-1">{when(r.closedAt)}</div>}
                      </td>
                      <td className="px-3 py-3">
                        {r.status === "NEW" ? (
                          <div className="flex flex-col gap-2 w-40">
                            {r.accountExists && (
                              <button
                                className="btn py-1! text-xs bg-red-600! text-white!"
                                disabled={busy === r.id}
                                onClick={() => deleteAccount(r)}
                              >
                                Delete account
                              </button>
                            )}
                            {!r.accountExists && (
                              <button
                                className="btn py-1! text-xs"
                                disabled={busy === r.id}
                                onClick={() => setRowStatus(r, "DONE", "No account left to delete")}
                              >
                                Mark done
                              </button>
                            )}
                            <button
                              className="btn py-1! text-xs"
                              disabled={busy === r.id}
                              onClick={() => reject(r)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            className="text-xs underline text-secondary"
                            disabled={busy === r.id}
                            onClick={() => setRowStatus(r, "NEW")}
                          >
                            Reopen
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
