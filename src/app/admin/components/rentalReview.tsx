"use client";

import {
  getAgents,
  getHousesForReview,
  getLandlords,
  getRentalMediaUrlAdmin,
  reviewAgent,
  reviewHouse,
  reviewLandlord,
} from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import { AMENITY_LABEL, APPROVAL_LABEL, houseFacts } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { formatDate, StatusBadge } from "@/app/rent/_components/formBits";
import { mapsLink } from "@/app/rent/_components/locationMap";
import { LazyMount, MediaGallery } from "@/app/rent/_components/rentalMedia";
import RentalDetail from "./rentalDetail";
import RentalPosts from "./rentalPosts";
import VisitRequests from "./visitRequests";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const LocationMap = dynamic(() => import("@/app/rent/_components/locationMap"), { ssr: false });

type Tab = "landlords" | "agents" | "houses" | "posts" | "visits";
// Landlords and agents are reviewed the same way, each through its own API
const isListerTab = (t: Tab) => t === "landlords" || t === "agents";
type ListerProfile = { userId: number; type?: string };
const isAgentProfile = (l?: { type?: string } | null) => l?.type === "AGENT";
// What the detail panel shows: a landlord / agent with all their houses, or one house
type Selected = { userId: number; landlord?: any; houseId?: number };
const STATUSES = APPROVAL_LABEL as Record<string, string>;
const AMENITIES = AMENITY_LABEL as Record<string, string>;
const cardClass = "bg-white rounded-xl shadow p-4 cursor-pointer hover:ring-2 hover:ring-secondary/30 transition";
const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

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
          placeholder="Reason (shown to the landlord), e.g. citizenship photo is blurry" value={note}
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
  // The list remembers which tab + filter it belongs to. Right after a tab switch the old tab's list
  // is still here; rendering agents as house cards (no `media`) crashed the whole page.
  const [loaded, setLoaded] = useState<{ key: string; items: any[] } | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);
  const [version, setVersion] = useState(0);
  const key = `${tab}|${status}`;
  // Only the newest request may set the list (a slow agents reply must not land on the houses tab)
  const latestKey = useRef(key);
  const loading = loaded?.key !== key;
  const items = loading ? [] : loaded.items;

  const fetchItems = async () => {
    const forKey = key;
    let list: any[] = [];
    try {
      list = tab === "landlords" ? await getLandlords(status)
        : tab === "agents" ? await getAgents(status)
        : await getHousesForReview({ status });
    } catch (err) {
      toast.error(apiErrorMessage(err, `Failed to load ${tab}`));
    }
    if (latestKey.current === forKey) setLoaded({ key: forKey, items: Array.isArray(list) ? list : [] });
  };

  useEffect(() => {
    latestKey.current = key;
    if (isListerTab(tab) || tab === "houses") fetchItems();
  }, [tab, status]);

  // profile: a landlord or agent (profile.type) — APPROVED gives ROLE_LANDLORD / ROLE_AGENT
  const handleLandlord = async (profile: ListerProfile, next: string, note?: string) => {
    const agent = isAgentProfile(profile);
    const label = agent ? "Agent" : "Landlord";
    const { userId } = profile;
    try {
      const review = { status: next, note };
      const updated = agent ? await reviewAgent(userId, review) : await reviewLandlord(userId, review);
      setSelected((s) => (s && s.landlord?.userId === userId ? { ...s, landlord: { ...s.landlord, ...updated } } : s));
      setVersion((v) => v + 1);
      toast.success(`${label} ${STATUSES[next].toLowerCase()}.`);
      await fetchItems();
    } catch (err) {
      toast.error(apiErrorMessage(err, `Failed to update ${label.toLowerCase()}`));
    }
  };

  const handleHouse = async (houseId: number, next: string, note?: string) => {
    try {
      await reviewHouse(houseId, { status: next, note });
      setVersion((v) => v + 1);
      toast.success(`House ${STATUSES[next].toLowerCase()}.`);
      await fetchItems();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update house"));
    }
  };

  const houseActions = (h: any) => (
    <ReviewActions
      status={h.status}
      approveDisabledReason={h.landlordStatus !== "APPROVED"
        ? `Approve the ${h.listerType === "AGENT" ? "agent" : "landlord"} first` : undefined}
      onReview={(s, n) => handleHouse(h.id, s, n)}
    />
  );

  const tabBtn = (t: Tab, label: string) => (
    <button onClick={() => setTab(t)}
      className={`px-4 py-2 rounded-lg cursor-pointer ${tab === t ? "bg-secondary text-white" : "bg-gray-200 text-secondary"}`}>
      {label}
    </button>
  );

  return (
    <>
      <p className="text-sm text-gray-500 mb-6">
        Approve the landlord or agent first (citizenship check), then each of their houses — for an agent&apos;s house,
        call the owner listed on it. Rooms can be posted only under approved houses.
      </p>

      <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          {tabBtn("landlords", "Landlords")}
          {tabBtn("agents", "Agents")}
          {tabBtn("houses", "Houses")}
          {tabBtn("posts", "Rooms / flats")}
          {tabBtn("visits", "Visit requests")}
        </div>
        {(isListerTab(tab) || tab === "houses") && (
          <select className="form-control py-2! h-11! w-auto!" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            {Object.entries(STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
      </div>

      {tab === "posts" ? (
        <RentalPosts onOpenHouse={(userId, houseId) => setSelected({ userId, houseId })} />
      ) : tab === "visits" ? (
        <VisitRequests onOpenHouse={(userId, houseId) => setSelected({ userId, houseId })} />
      ) : loading ? (
        <div className="flex justify-center py-8"><LoadingSvg /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">Nothing here.</div>
      ) : isListerTab(tab) ? (
        <div className="flex flex-col gap-3">
          {items.map((l) => (
            <div key={l.id} onClick={() => setSelected({ userId: l.userId, landlord: l })}
              className={`${cardClass} grid md:grid-cols-[1fr_180px] gap-4`}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-secondary mb-0">{l.name}</h3>
                  <StatusBadge status={l.status} />
                  <span className="text-xs text-gray-400">User #{l.userId} · applied {formatDate(l.createdAt)}</span>
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-0">
                  {[["Phone", l.mobile], ["Email", l.email],
                    ...(isAgentProfile(l) ? [["Agency", l.agencyName], ["Office", l.officeAddress], ["Areas", l.workingAreas]] : []),
                    ["PAN", l.panNo], ["Citizenship", l.citizenshipNo], ["Address", l.permanentAddress]].map(([k, v]) => (
                    <div key={k}><dt className="text-xs text-gray-500">{k}</dt><dd className="mb-0 break-words">{v || "-"}</dd></div>
                  ))}
                </dl>
                {l.reviewNote && <p className="text-xs text-gray-500 mb-0">Note: {l.reviewNote}</p>}
                <div className="flex flex-wrap items-center gap-3" onClick={stop}>
                  <ReviewActions status={l.status} onReview={(s, n) => handleLandlord(l, s, n)} />
                  <button className="text-sm underline text-secondary cursor-pointer"
                    onClick={() => setSelected({ userId: l.userId, landlord: l })}>
                    View houses, photos, videos &amp; location →
                  </button>
                </div>
              </div>
              <div onClick={stop}>
{[
                ["Citizenship — front", l.citizenshipFrontImage],
                ["Citizenship — back", l.citizenshipBackImage],
                // Older landlords may have a PAN photo
                ...(l.panImage ? [["PAN photo", l.panImage]] : []),
              ].map(([label, fileName]) => (
                <div key={label} className="mb-2">
                  <span className="text-xs text-gray-500">{label}</span>
                  {fileName ? (
                    <MediaGallery media={[{ id: 0, type: "IMAGE", fileName }]} fetchUrl={getRentalMediaUrlAdmin} />
                  ) : (
                    <p className="text-sm text-red-700 mb-0">Not uploaded</p>
                  )}
                </div>
              ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((h) => (
            <div key={h.id} onClick={() => setSelected({ userId: h.landlordUserId, houseId: h.id })}
              className={`${cardClass} grid lg:grid-cols-2 gap-4`}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-secondary mb-0">{h.name}</h3>
                  <StatusBadge status={h.status} />
                </div>
                <p className="text-sm mb-0">
                  {[h.tole, h.city, h.municipality, h.wardNo && `Ward ${h.wardNo}`, h.district, h.province]
                    .filter(Boolean).join(", ")}
                </p>
                <p className="text-sm text-gray-500 mb-0">
                  {h.listerType === "AGENT" ? "Agent" : "Landlord"}: {h.landlordName} ({h.landlordMobile}) —{" "}
                  <StatusBadge status={h.landlordStatus} />
                </p>
                {h.ownerName && (
                  // Agent-listed house: confirm with the owner by phone instead of a field visit
                  <p className="text-sm mb-0" onClick={stop}>
                    Owner: {h.ownerName} (<a href={`tel:${h.ownerMobile}`} className="underline">{h.ownerMobile}</a>)
                  </p>
                )}
                <p className="text-xs text-gray-400 mb-0">
                  {h.totalFloors ? `${h.totalFloors} floor(s) · ` : ""}{h.postCount} post(s) · updated {formatDate(h.updatedAt)}
                </p>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-0">
                  {houseFacts(h).filter(([, v]) => v != null && v !== "").map(([k, v]) => (
                    <div key={k}><dt className="text-xs text-gray-500">{k}</dt><dd className="mb-0 break-words">{v}</dd></div>
                  ))}
                </dl>
                {h.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {h.amenities.map((a: string) => (
                      <span key={a} className="text-xs px-2 py-0.5 rounded bg-secondary/10">{AMENITIES[a] ?? a}</span>
                    ))}
                  </div>
                )}
                {h.houseRules && (
                  <p className="text-sm whitespace-pre-line mb-0 line-clamp-3">
                    <span className="text-xs text-gray-500">Rules: </span>{h.houseRules}
                  </p>
                )}
                {h.description && <p className="text-sm whitespace-pre-line mb-0">{h.description}</p>}
                {h.reviewNote && <p className="text-xs text-gray-500 mb-0">Note: {h.reviewNote}</p>}
                <div className="flex flex-wrap items-center gap-3" onClick={stop}>
                  {houseActions(h)}
                  <button className="text-sm underline text-secondary cursor-pointer"
                    onClick={() => setSelected({ userId: h.landlordUserId, houseId: h.id })}>
                    View full details &amp; rooms →
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3" onClick={stop}>
                <MediaGallery media={h.media ?? []} fetchUrl={getRentalMediaUrlAdmin} emptyText="No photos uploaded." />
                {/* One Leaflet map per card is heavy — mount it only when scrolled near */}
                <LazyMount className="h-48 rounded-lg bg-secondary/10">
                  <LocationMap latitude={h.latitude} longitude={h.longitude} className="h-48" />
                </LazyMount>
                <a href={mapsLink(h.latitude, h.longitude)} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                  Open in Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <RentalDetail
          userId={selected.userId}
          landlord={selected.landlord}
          houseId={selected.houseId}
          version={version}
          reviewSlot={selected.landlord && (
            <ReviewActions status={selected.landlord.status}
              onReview={(s, n) => handleLandlord(selected.landlord, s, n)} />
          )}
          houseReviewSlot={houseActions}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
