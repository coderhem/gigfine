"use client";

import { apiErrorMessage } from "@/api/config";
import { BATHROOM_LABEL, BILL_LABEL, FLAT_TYPE_LABEL, KITCHEN_LABEL, PROPERTY_TYPE_LABEL, quickSearchPosts } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";
import { formatRent, inputClass } from "./_components/formBits";
import { MediaCover } from "./_components/rentalMedia";
import { useRentalSession } from "./_components/useRentalSession";

const TYPES = PROPERTY_TYPE_LABEL as Record<string, string>;
const BATHROOMS = BATHROOM_LABEL as Record<string, string>;
const KITCHENS = KITCHEN_LABEL as Record<string, string>;
const BILLS = BILL_LABEL as Record<string, string>;
const FLAT_TYPES = FLAT_TYPE_LABEL as Record<string, string>;

// GET /api/v1/posts/search — how the text was read + the ranked posts
type SearchResult = {
  type?: string; flatType?: string; minRent?: number; maxRent?: number; targetRent?: number; cheap?: boolean;
  bedrooms?: number; wardNo?: number; floorNo?: number; keywords?: string[]; ignored?: string[];
  posts: any[];
};

// How the backend read the search text, as short chips: "Room", "Up to Rs. 15,000", "baneshwor"
function understoodChips(r: SearchResult | null): string[] {
  if (!r) return [];
  const rent =
    r.minRent != null && r.maxRent != null ? `${formatRent(r.minRent)} – ${formatRent(r.maxRent)}`
    : r.maxRent != null ? `Up to ${formatRent(r.maxRent)}`
    : r.minRent != null ? `From ${formatRent(r.minRent)}`
    : r.targetRent != null ? `Around ${formatRent(r.targetRent)}`
    : null;
  return [
    r.flatType ? FLAT_TYPES[r.flatType] : r.type && TYPES[r.type],
    rent,
    r.cheap && "Cheapest first",
    r.bedrooms != null && `${r.bedrooms} room(s)`,
    r.wardNo != null && `Ward ${r.wardNo}`,
    r.floorNo != null && (r.floorNo === 0 ? "Ground floor" : `Floor ${r.floorNo}`),
    ...(r.keywords ?? []),
  ].filter((c): c is string => typeof c === "string");
}

// Rooms / flats from approved houses only. Public — no login needed to browse.
export default function FindRooms() {
  const { ready } = useRentalSession({ optional: true });
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Searches a moment after typing stops
  useEffect(() => {
    const timer = setTimeout(() => setQuery(draft.trim()), 400);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    if (!ready) return;
    let stale = false; // an older, slower response must not overwrite a newer one
    setLoading(true);
    quickSearchPosts(query)
      .then((r) => !stale && setResult(r))
      .catch((err) => !stale && toast.error(apiErrorMessage(err, "Failed to load rooms")))
      .finally(() => !stale && setLoading(false));
    return () => { stale = true; };
  }, [ready, query]);

  if (!ready) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  const posts = result?.posts ?? [];
  const chips = query ? understoodChips(result) : [];

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        <h1 className="h3 mb-1">Find a <span className="text-primary">room or flat</span></h1>
        <p className="text-sm text-gray-500 mb-5">Every house here is verified by GIGFINE. Contact GIGFINE to visit a room.</p>

        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" enterKeyHint="search" autoFocus
              className={`${inputClass} pl-9! pr-9! py-3! text-base`}
              placeholder="City, area, rent… e.g. Baneshwor room 12000"
              value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setQuery(draft.trim())} />
            {draft && (
              <button type="button" aria-label="Clear search" onClick={() => setDraft("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                <FaTimes />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-gray-500 mr-1">{loading ? "Searching…" : `${posts.length} result(s)`}</span>
            {chips.map((c) => (
              <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{c}</span>
            ))}
            {query && !!result?.ignored?.length && (
              <span className="text-xs text-gray-400">No match for “{result.ignored.join(", ")}”, skipped</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><LoadingSvg /></div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            No rooms match. Try a nearby area, a higher rent or fewer words.
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
