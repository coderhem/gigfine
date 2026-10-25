"use client";

import {
  getHousesForReview,
  getLandlords,
  getRentalMediaUrlAdmin,
  reviewHouse,
  reviewLandlord,
} from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import { AMENITY_LABEL, APPROVAL_LABEL } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { formatDate, StatusBadge } from "@/app/rent/_components/formBits";
import { mapsLink } from "@/app/rent/_components/locationMap";
import { MediaGallery } from "@/app/rent/_components/rentalMedia";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const LocationMap = dynamic(() => import("@/app/rent/_components/locationMap"), { ssr: false });

type Tab = "landlords" | "houses";
const STATUSES = APPROVAL_LABEL as Record<string, string>;
const AMENITIES = AMENITY_LABEL as Record<string, string>;

// Approve / reject buttons; rejecting asks for a reason the landlord will see
function ReviewActions({
  status,
  approveDisabledReason,
  onReview,
}: {
  status: string;
  approveDisabledReason?: string;
  onReview: (status: string, note?: string) => Promise<void>;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (next: string, n?: string) => {
    setBusy(true);
    try {
      await onReview(next, n);
      setRejecting(false);
      setNote("");
    } finally {
      setBusy(false);
    }
  };

  if (rejecting) {
    return (
      <div className="flex flex-col gap-2 w-full sm:w-72">
        <textarea className="form-control h-auto! min-h-20 text-sm" maxLength={500} autoFocus
          placeholder="Reason (shown to the landlord), e.g. PAN photo is blurry" value={note}
          onChange={(e) => setNote(e.target.value)} />
        <div className="flex gap-2">
          <button className="delete-btn py-2 px-3 text-sm" disabled={busy} onClick={() => run("REJECTED", note)}>
            Reject
          </button>
          <button className="btn py-2 px-3 text-sm" disabled={busy} onClick={() => setRejecting(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {status !== "APPROVED" && (
        <button className="btn btn-green py-2 px-3 text-sm" disabled={busy || !!approveDisabledReason}
          title={approveDisabledReason} onClick={() => run("APPROVED")}>
          Approve
        </button>
      )}
      {status !== "REJECTED" && (
        <button className="delete-btn py-2 px-3 text-sm cursor-pointer" disabled={busy} onClick={() => setRejecting(true)}>
          Reject
        </button>
      )}
      {status === "APPROVED" && (
        <button className="btn py-2 px-3 text-sm" disabled={busy} onClick={() => run("PENDING")}>
          Move back to pending
        </button>
      )}
      {approveDisabledReason && <span className="text-xs text-gray-500">{approveDisabledReason}</span>}
    </div>
  );
}

export default function RentalReview() {
  const [tab, setTab] = useState<Tab>("landlords");
  const [status, setStatus] = useState("PENDING");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(tab === "landlords" ? await getLandlords(status) : await getHousesForReview({ status }));
    } catch (err) {
      toast.error(apiErrorMessage(err, `Failed to load ${tab}`));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [tab, status]);

  const handleLandlord = async (userId: number, next: string, note?: string) => {
    try {
      await reviewLandlord(userId, { status: next, note });
      toast.success(`Landlord ${STATUSES[next].toLowerCase()}.`);
      await fetchItems();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update landlord"));
    }
  };

  const handleHouse = async (houseId: number, next: string, note?: string) => {
    try {
      await reviewHouse(houseId, { status: next, note });
      toast.success(`House ${STATUSES[next].toLowerCase()}.`);
      await fetchItems();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update house"));
    }
  };

  const tabBtn = (t: Tab, label: string) => (
    <button onClick={() => setTab(t)}
      className={`px-4 py-2 rounded-lg cursor-pointer ${tab === t ? "bg-secondary text-white" : "bg-gray-200 text-secondary"}`}>
      {label}
    </button>
  );

  return (
    <>
      <h1 className="mb-2 pt-24 text-3xl font-bold text-secondary">Rentals</h1>
      <p className="text-sm text-gray-500 mb-6">
        Approve the landlord first (PAN check), then each of their houses. Landlords can post rooms only under
        approved houses.
      </p>

      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div className="flex gap-2">
          {tabBtn("landlords", "Landlords")}
          {tabBtn("houses", "Houses")}
        </div>
        <select className="form-control py-2! h-11! w-auto!" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><LoadingSvg /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">Nothing here.</div>
      ) : tab === "landlords" ? (
        <div className="flex flex-col gap-3">
          {items.map((l) => (
            <div key={l.id} className="bg-white rounded-xl shadow p-4 grid md:grid-cols-[1fr_180px] gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-secondary mb-0">{l.name}</h3>
                  <StatusBadge status={l.status} />
                  <span className="text-xs text-gray-400">User #{l.userId} · applied {formatDate(l.createdAt)}</span>
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-0">
                  {[["Phone", l.mobile], ["Email", l.email], ["PAN", l.panNo], ["Citizenship", l.citizenshipNo],
                    ["Address", l.permanentAddress]].map(([k, v]) => (
                    <div key={k}><dt className="text-xs text-gray-500">{k}</dt><dd className="mb-0 break-words">{v || "-"}</dd></div>
                  ))}
                </dl>
                {l.reviewNote && <p className="text-xs text-gray-500 mb-0">Note: {l.reviewNote}</p>}
                <ReviewActions status={l.status} onReview={(s, n) => handleLandlord(l.userId, s, n)} />
              </div>
              <div>
                <span className="text-xs text-gray-500">PAN photo</span>
                {l.panImage ? (
                  <MediaGallery media={[{ id: 0, type: "IMAGE", fileName: l.panImage }]} fetchUrl={getRentalMediaUrlAdmin} />
                ) : (
                  <p className="text-sm text-red-700 mb-0">Not uploaded</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((h) => (
            <div key={h.id} className="bg-white rounded-xl shadow p-4 grid lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-secondary mb-0">{h.name}</h3>
                  <StatusBadge status={h.status} />
                </div>
                <p className="text-sm mb-0">
                  {[h.tole, h.municipality, h.wardNo && `Ward ${h.wardNo}`, h.district, h.province].filter(Boolean).join(", ")}
                </p>
                <p className="text-sm text-gray-500 mb-0">
                  Landlord: {h.landlordName} ({h.landlordMobile}) — <StatusBadge status={h.landlordStatus} />
                </p>
                <p className="text-xs text-gray-400 mb-0">
                  {h.totalFloors ? `${h.totalFloors} floor(s) · ` : ""}{h.postCount} post(s) · updated {formatDate(h.updatedAt)}
                </p>
                {h.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {h.amenities.map((a: string) => (
                      <span key={a} className="text-xs px-2 py-0.5 rounded bg-secondary/10">{AMENITIES[a] ?? a}</span>
                    ))}
                  </div>
                )}
                {h.description && <p className="text-sm whitespace-pre-line mb-0">{h.description}</p>}
                {h.reviewNote && <p className="text-xs text-gray-500 mb-0">Note: {h.reviewNote}</p>}
                <ReviewActions
                  status={h.status}
                  approveDisabledReason={h.landlordStatus !== "APPROVED" ? "Approve the landlord first" : undefined}
                  onReview={(s, n) => handleHouse(h.id, s, n)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <MediaGallery media={h.media} fetchUrl={getRentalMediaUrlAdmin} emptyText="No photos uploaded." />
                <LocationMap latitude={h.latitude} longitude={h.longitude} className="h-48" />
                <a href={mapsLink(h.latitude, h.longitude)} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                  Open in Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
