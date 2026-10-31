"use client";

import { getAllPostsAdmin, getRentalMediaUrlAdmin, updatePostStatusAdmin } from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import { BILL_LABEL, FLAT_TYPE_LABEL, POST_STATUS_LABEL, PROPERTY_TYPE_LABEL } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { formatDate, formatRent, StatusBadge } from "@/app/rent/_components/formBits";
import { MediaGallery } from "@/app/rent/_components/rentalMedia";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const STATUSES = POST_STATUS_LABEL as Record<string, string>;
const TYPES = PROPERTY_TYPE_LABEL as Record<string, string>;
const BILLS = BILL_LABEL as Record<string, string>;
const FLAT_TYPES = FLAT_TYPE_LABEL as Record<string, string>;

const SORTS: Record<string, string> = {
  "createdAt:desc": "Newest first",
  "createdAt:asc": "Oldest first",
  "rent:asc": "Rent: low to high",
  "rent:desc": "Rent: high to low",
  "availableFrom:asc": "Available soonest",
  "billsIncluded:desc": "Most bills included",
};

// What the admin can switch a post to from its current status
const ACTIONS: Record<string, [string, string][]> = {
  ACTIVE: [["INACTIVE", "Deactivate"], ["RENTED", "Mark rented"]],
  RENTED: [["ACTIVE", "Activate"], ["INACTIVE", "Deactivate"]],
  INACTIVE: [["ACTIVE", "Activate"]],
};

// Every room / flat across all houses. Deactivating hides a post from tenants; the landlord sees it as
// "Hidden" and can set it active again from their panel.
export default function RentalPosts({ onOpenHouse }: { onOpenHouse: (userId: number, houseId: number) => void }) {
  const [status, setStatus] = useState("ACTIVE");
  const [sort, setSort] = useState("createdAt:desc");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      setPosts(await getAllPostsAdmin({ status, sort }));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load rooms"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [status, sort]);

  const changeStatus = async (post: any, next: string) => {
    setBusyId(post.id);
    try {
      await updatePostStatusAdmin(post, next);
      toast.success(`"${post.title}" is now ${STATUSES[next].toLowerCase()}.`);
      await fetchPosts();
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
        <select className="form-control py-2! h-11! w-auto!" value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {!loading && <span className="text-sm text-gray-500">{posts.length} post(s)</span>}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><LoadingSvg /></div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">Nothing here.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-4 grid md:grid-cols-[1fr_220px] gap-4">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-secondary mb-0">{p.title}</h3>
                  <StatusBadge status={p.status} kind="post" />
                  <span className="text-xs text-gray-400">#{p.id} · posted {formatDate(p.createdAt)}</span>
                </div>
                <p className="text-sm mb-0">
                  <span className="font-semibold text-primary">{formatRent(p.rent)}/month</span>
                  {p.negotiable && " (negotiable)"} · {TYPES[p.type] ?? p.type}
                  {p.flatType && ` · ${FLAT_TYPES[p.flatType] ?? p.flatType}`}
                  {p.floorNo != null && ` · Floor ${p.floorNo}`}
                </p>
                <p className="text-xs text-gray-500 mb-0">
                  {p.includedInRent?.length
                    ? `Includes ${p.includedInRent.map((b: string) => BILLS[b] ?? b).join(", ")}`
                    : "Bills paid separately"}
                </p>
                <p className="text-sm text-gray-500 mb-0">
                  {p.houseName} — {[p.tole, p.municipality, p.district].filter(Boolean).join(", ")}
                  <br />
                  Landlord: {p.landlordName} ({p.landlordMobile})
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {(ACTIONS[p.status] ?? []).map(([next, label]) => (
                    <button key={next} disabled={busyId === p.id} onClick={() => changeStatus(p, next)}
                      className={`${next === "INACTIVE" ? "delete-btn" : next === "ACTIVE" ? "btn btn-green" : "btn"} py-2 px-3 text-sm cursor-pointer`}>
                      {label}
                    </button>
                  ))}
                  <button className="text-sm underline text-secondary cursor-pointer"
                    onClick={() => onOpenHouse(p.landlordUserId, p.houseId)}>
                    View house &amp; all details →
                  </button>
                </div>
              </div>
              <MediaGallery media={p.media ?? []} fetchUrl={getRentalMediaUrlAdmin} emptyText="No photos." />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
