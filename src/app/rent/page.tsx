"use client";

import { apiErrorMessage } from "@/api/config";
import { BATHROOM_LABEL, BILL_LABEL, FLAT_TYPE_LABEL, KITCHEN_LABEL, PROPERTY_TYPE_LABEL, searchPosts } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { formatRent, inputClass, Pills } from "./_components/formBits";
import { MediaCover } from "./_components/rentalMedia";
import { useRentalSession } from "./_components/useRentalSession";

const TYPES = PROPERTY_TYPE_LABEL as Record<string, string>;
const BATHROOMS = BATHROOM_LABEL as Record<string, string>;
const KITCHENS = KITCHEN_LABEL as Record<string, string>;
const BILLS = BILL_LABEL as Record<string, string>;

const SORTS: Record<string, string> = {
  "createdAt:desc": "Newest first",
  "rent:asc": "Rent: low to high",
  "rent:desc": "Rent: high to low",
  "availableFrom:asc": "Available soonest",
  "billsIncluded:desc": "Most bills included",
};

type Filters = {
  type: string;
  district: string;
  municipality: string;
  minRent: string;
  maxRent: string;
  bathroom: string;
  kitchen: string;
  included: string[];
  sort: string;
};

const EMPTY: Filters = {
  type: "", district: "", municipality: "", minRent: "", maxRent: "", bathroom: "", kitchen: "", included: [],
  sort: "createdAt:desc",
};

// Rooms / flats from approved houses only. Public — no login needed to browse.
export default function FindRooms() {
  const { ready } = useRentalSession({ optional: true });
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Text / number inputs apply a moment after typing stops
  useEffect(() => {
    const timer = setTimeout(() => setFilters(draft), 400);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    searchPosts(filters)
      .then(setPosts)
      .catch((err) => toast.error(apiErrorMessage(err, "Failed to load rooms")))
      .finally(() => setLoading(false));
  }, [ready, filters]);

  if (!ready) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  const set = (key: Exclude<keyof Filters, "included">, value: string) => setDraft((f) => ({ ...f, [key]: value }));
  const toggleBill = (b: string) =>
    setDraft((f) => ({ ...f, included: f.included.includes(b) ? f.included.filter((x) => x !== b) : [...f.included, b] }));
  const changed = JSON.stringify(draft) !== JSON.stringify(EMPTY);

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        <h1 className="h3 mb-1">Find a <span className="text-primary">room or flat</span></h1>
        <p className="text-sm text-gray-500 mb-5">Every house here is verified by GIGFINE. Contact GIGFINE to visit a room.</p>

        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col gap-3">
          <Pills options={TYPES} value={draft.type} onChange={(v) => set("type", v)} allowEmpty />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-sm">
            <div className="relative col-span-2 md:col-span-1 lg:col-span-2">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${inputClass} pl-9!`} placeholder="District" value={draft.district}
                onChange={(e) => set("district", e.target.value)} />
            </div>
            <input className={`${inputClass} col-span-2 md:col-span-1`} placeholder="Municipality / area"
              value={draft.municipality} onChange={(e) => set("municipality", e.target.value)} />
            <input type="number" min={0} className={inputClass} placeholder="Min rent" value={draft.minRent}
              onChange={(e) => set("minRent", e.target.value)} />
            <input type="number" min={0} className={inputClass} placeholder="Max rent" value={draft.maxRent}
              onChange={(e) => set("maxRent", e.target.value)} />
            <select className={inputClass} value={draft.bathroom} onChange={(e) => set("bathroom", e.target.value)}>
              <option value="">Bathroom</option>
              {Object.entries(BATHROOMS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select className={inputClass} value={draft.kitchen} onChange={(e) => set("kitchen", e.target.value)}>
              <option value="">Kitchen</option>
              {Object.entries(KITCHENS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="text-gray-500">Rent includes</span>
            <Pills options={BILLS} values={draft.included} onToggle={toggleBill} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-gray-500">{loading ? "Searching…" : `${posts.length} result(s)`}</span>
            <div className="flex items-center gap-3">
              {changed && (
                <button type="button" className="underline cursor-pointer" onClick={() => setDraft(EMPTY)}>Clear</button>
              )}
              <select className={`${inputClass} w-auto!`} value={draft.sort} onChange={(e) => set("sort", e.target.value)}>
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><LoadingSvg /></div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            No rooms match. Try a nearby district or a higher max rent.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((p) => (
              <Link key={p.id} href={`/rent/posts/${p.id}`}
                className="bg-white rounded-xl shadow overflow-hidden hover:ring-2 hover:ring-primary/40 transition flex flex-col">
                <div className="relative">
                  <MediaCover media={p.media?.length ? p.media : p.houseMedia} />
                  <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded bg-white/90 text-secondary">
                    {TYPES[p.type] ?? p.type}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1 grow">
                  <span className="text-lg font-bold text-primary">
                    {formatRent(p.rent)}<span className="text-sm font-normal text-gray-500">/month</span>
                    {p.negotiable && <span className="ml-2 text-xs font-normal text-gray-500">negotiable</span>}
                  </span>
                  <span className={`text-xs ${p.includedInRent?.length ? "text-green-700" : "text-gray-400"}`}>
                    {p.includedInRent?.length
                      ? `Includes ${p.includedInRent.map((b: string) => BILLS[b] ?? b).join(", ")}`
                      : "Bills paid separately"}
                  </span>
                  <h3 className="font-semibold text-secondary mb-0 line-clamp-1">{p.title}</h3>
                  <p className="text-sm text-gray-500 mb-0 flex items-center gap-1 line-clamp-1">
                    <FaMapMarkerAlt className="shrink-0" />
                    {[p.tole, p.municipality, p.district].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-gray-400 mb-0 mt-auto pt-2">
                    {[
                      p.flatType && (FLAT_TYPE_LABEL as Record<string, string>)[p.flatType],
                      p.areaSqft != null && `${p.areaSqft} sq ft`,
                      p.bedrooms != null && `${p.bedrooms} room(s)`,
                      p.bathroom && BATHROOMS[p.bathroom],
                      p.kitchen && KITCHENS[p.kitchen],
                      p.floorNo != null && `Floor ${p.floorNo}`,
                    ].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
