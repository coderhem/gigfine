"use client";

import { getVisitRequestsAdmin, updateVisitRequestAdmin } from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import { PROPERTY_TYPE_LABEL, VISIT_STATUS_LABEL } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { formatDate, formatRent, formatVisit, StatusBadge } from "@/app/rent/_components/formBits";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const STATUSES = VISIT_STATUS_LABEL as Record<string, string>;
const TYPES = PROPERTY_TYPE_LABEL as Record<string, string>;

// What the admin can move a request to from its current status
const ACTIONS: Record<string, [string, string][]> = {
  PENDING: [["CONFIRMED", "Confirm visit"], ["CANCELLED", "Cancel"]],
  CONFIRMED: [["COMPLETED", "Mark visited"], ["CANCELLED", "Cancel"]],
  COMPLETED: [],
  CANCELLED: [["PENDING", "Reopen"]],
};

// Field visits users asked for from a room page. The office calls the user, agrees a time with the
// landlord and confirms here; the note is shown to the user on the room page.
export default function VisitRequests({ onOpenHouse }: { onOpenHouse: (userId: number, houseId: number) => void }) {
  const [status, setStatus] = useState("PENDING");
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const fetchVisits = async () => {
    setLoading(true);
    try {
      setVisits(await getVisitRequestsAdmin(status));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load visit requests"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [status]);

  const changeStatus = async (v: any, next: string) => {
    setBusyId(v.id);
    try {
      await updateVisitRequestAdmin(v.id, next, notes[v.id] ?? v.adminNote ?? "");
      toast.success(`Visit #${v.id}: ${STATUSES[next].toLowerCase()}.`);
      await fetchVisits();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <select className="form-control py-2! h-11! w-auto!" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {!loading && <span className="text-sm text-gray-500">{visits.length} request(s)</span>}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><LoadingSvg /></div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">Nothing here.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {visits.map((v) => (
            <div key={v.id} className="bg-white rounded-xl shadow p-4 grid md:grid-cols-3 gap-4">
              {/* When */}
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-secondary">{formatVisit(v.visitDate, v.visitTime)}</span>
                  <StatusBadge status={v.status} kind="visit" />
                </div>
                <span className="text-xs text-gray-400">#{v.id} · requested {formatDate(v.createdAt)}</span>
                {v.people && <span>{v.people} {v.people === 1 ? "person" : "people"}</span>}
                {v.message && <p className="whitespace-pre-line text-gray-600 mb-0">“{v.message}”</p>}
              </div>

              {/* Who */}
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-gray-500">Requested by</span>
                <span className="font-semibold text-secondary">{v.userName}</span>
                <span>User #{v.userId}</span>
                <a href={`tel:${v.contactPhone}`} className="underline">{v.contactPhone}</a>
                {v.userMobile && v.userMobile !== v.contactPhone && (
                  <span className="text-gray-500">Account mobile: {v.userMobile}</span>
                )}
                {v.userEmail && <span className="text-gray-500 break-all">{v.userEmail}</span>}
              </div>

              {/* Which room */}
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-gray-500">Room / flat</span>
                <span className="font-semibold text-secondary">
                  #{v.postId} {v.postTitle} <StatusBadge status={v.postStatus} kind="post" />
                </span>
                <span>
                  {formatRent(v.rent)}/month · {TYPES[v.postType] ?? v.postType}
                </span>
                <span className="text-gray-500">
                  {v.houseName} — {[v.tole, v.municipality, v.wardNo && `Ward ${v.wardNo}`, v.district].filter(Boolean).join(", ")}
                </span>
                <span>
                  Landlord: {v.landlordName} (<a href={`tel:${v.landlordMobile}`} className="underline">{v.landlordMobile}</a>)
                </span>
                <button className="self-start text-sm underline text-secondary cursor-pointer"
                  onClick={() => onOpenHouse(v.landlordUserId, v.houseId)}>
                  View house →
                </button>
              </div>

              {/* Actions */}
              {(ACTIONS[v.status] ?? []).length > 0 && (
                <div className="md:col-span-3 flex flex-wrap items-center gap-2 border-t border-secondary/10 pt-3">
                  <input className="form-control py-2! h-10! flex-1 min-w-48 text-sm" maxLength={1000}
                    placeholder="Note for the user (optional), e.g. owner meets you at the gate"
                    value={notes[v.id] ?? v.adminNote ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [v.id]: e.target.value }))} />
                  {ACTIONS[v.status].map(([next, label]) => (
                    <button key={next} disabled={busyId === v.id} onClick={() => changeStatus(v, next)}
                      className={`${next === "CANCELLED" ? "delete-btn" : next === "PENDING" ? "btn" : "btn btn-green"} py-2 px-3 text-sm cursor-pointer`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {v.status === "COMPLETED" && v.adminNote && (
                <p className="md:col-span-3 text-sm text-gray-500 mb-0">Note: {v.adminNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
