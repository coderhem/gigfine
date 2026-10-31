"use client";

import { getHousePostsAdmin, getHousesForReview, getRentalMediaUrlAdmin } from "@/api/admin";
import { apiErrorMessage } from "@/api/config";
import {
  AMENITY_LABEL,
  BATHROOM_LABEL,
  BILL_LABEL,
  flatFacts,
  FURNISHING_LABEL,
  houseFacts,
  KITCHEN_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { formatDate, formatRent, StatusBadge } from "@/app/rent/_components/formBits";
import { mapsLink } from "@/app/rent/_components/locationMap";
import { MediaGallery, type Media } from "@/app/rent/_components/rentalMedia";
import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

const LocationMap = dynamic(() => import("@/app/rent/_components/locationMap"), { ssr: false });

const AMENITIES = AMENITY_LABEL as Record<string, string>;
const TYPES = PROPERTY_TYPE_LABEL as Record<string, string>;
const BATHROOMS = BATHROOM_LABEL as Record<string, string>;
const KITCHENS = KITCHEN_LABEL as Record<string, string>;
const FURNISHING = FURNISHING_LABEL as Record<string, string>;

// Label / value grid; empty values show as "-"
function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm mb-0">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs text-gray-500">{k}</dt>
          <dd className="mb-0 break-words">{v === null || v === undefined || v === "" ? "-" : v}</dd>
        </div>
      ))}
    </dl>
  );
}

const countLabel = (media: Media[] = []) => {
  const videos = media.filter((m) => m.type === "VIDEO").length;
  return `${media.length - videos} photo(s), ${videos} video(s)`;
};

function PostCard({ p }: { p: any }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h5 className="font-semibold text-secondary mb-0">{p.title}</h5>
        <StatusBadge status={p.status} kind="post" />
        <span className="text-xs text-gray-400">#{p.id} · posted {formatDate(p.createdAt)}</span>
      </div>
      <Facts
        rows={[
          ["Type", TYPES[p.type] ?? p.type],
          ["Rent", `${formatRent(p.rent)}${p.negotiable ? " (negotiable)" : ""}`],
          ["Included in rent", p.includedInRent?.length
            ? p.includedInRent.map((b: string) => (BILL_LABEL as Record<string, string>)[b] ?? b).join(", ") : "None"],
          ["Deposit", p.deposit != null ? formatRent(p.deposit) : null],
          ["Floor", p.floorNo],
          // Not asked any more; shown for old posts only
          ...(p.bedrooms != null ? [["Bedrooms", p.bedrooms] as [string, ReactNode]] : []),
          ["Bathroom", BATHROOMS[p.bathroom] ?? p.bathroom],
          ["Kitchen", KITCHENS[p.kitchen] ?? p.kitchen],
          ["Furnishing", FURNISHING[p.furnishing] ?? p.furnishing],
          ["Available from", p.availableFrom],
          ...flatFacts(p),
          ["Updated", formatDate(p.updatedAt)],
        ]}
      />
      {p.description && <p className="text-sm whitespace-pre-line mb-0">{p.description}</p>}
      <span className="text-xs text-gray-500">Media — {countLabel(p.media)}</span>
      <MediaGallery media={p.media ?? []} fetchUrl={getRentalMediaUrlAdmin} emptyText="No photos / videos." />
    </div>
  );
}

// Everything about one house: address, exact coordinates, map, all media (videos play inline) and its posts
export function HouseDetail({ house: h, reviewSlot }: { house: any; reviewSlot?: ReactNode }) {
  const [posts, setPosts] = useState<any[] | null>(null);
  const hasLocation = h.latitude != null && h.longitude != null;

  useEffect(() => {
    getHousePostsAdmin(h.landlordUserId, h.id)
      .then(setPosts)
      .catch((err) => {
        toast.error(apiErrorMessage(err, "Failed to load rooms"));
        setPosts([]);
      });
  }, [h.id, h.landlordUserId]);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-semibold text-secondary text-xl mb-0">{h.name}</h4>
        <StatusBadge status={h.status} />
        <span className="text-xs text-gray-400">House #{h.id}</span>
      </div>

      <Facts
        rows={[
          ["Province", h.province],
          ["District", h.district],
          ["Municipality", h.municipality],
          ["Ward", h.wardNo],
          ["City", h.city],
          ["Tole", h.tole],
          ["Total floors", h.totalFloors],
          ...houseFacts(h),
          ["Latitude", h.latitude],
          ["Longitude", h.longitude],
          ["Posts", h.postCount],
          ["Landlord", <>{h.landlordName} ({h.landlordMobile}) <StatusBadge status={h.landlordStatus} /></>],
          ["Created", formatDate(h.createdAt)],
          ["Updated", formatDate(h.updatedAt)],
          ["Reviewed", formatDate(h.reviewedAt)],
        ]}
      />

      {h.amenities?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Facilities:</span>
          {h.amenities.map((a: string) => (
            <span key={a} className="text-xs px-2 py-0.5 rounded bg-secondary/10">{AMENITIES[a] ?? a}</span>
          ))}
        </div>
      )}
      {h.houseRules && (
        <div className="text-sm">
          <span className="text-xs text-gray-500">House rules</span>
          <p className="whitespace-pre-line mb-0">{h.houseRules}</p>
        </div>
      )}
      {h.description && <p className="text-sm whitespace-pre-line mb-0">{h.description}</p>}
      {h.reviewNote && <p className="text-xs text-gray-500 mb-0">Note: {h.reviewNote}</p>}
      {reviewSlot}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-secondary">House media — {countLabel(h.media)}</span>
        <MediaGallery media={h.media ?? []} fetchUrl={getRentalMediaUrlAdmin} hero emptyText="No photos / videos uploaded." />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-secondary">Location</span>
        {hasLocation ? (
          <>
            <LocationMap latitude={h.latitude} longitude={h.longitude} className="h-72" />
            <a href={mapsLink(h.latitude, h.longitude)} target="_blank" rel="noopener noreferrer" className="text-sm underline">
              Open {h.latitude}, {h.longitude} in Google Maps
            </a>
          </>
        ) : (
          <p className="text-sm text-red-700 mb-0">No coordinates set.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-secondary">Rooms / flats posted</span>
        {posts === null ? (
          <div className="flex justify-center py-4"><LoadingSvg /></div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-500 mb-0">No posts under this house yet.</p>
        ) : (
          posts.map((p) => <PostCard key={p.id} p={p} />)
        )}
      </div>
    </section>
  );
}

// Full-screen panel opened by clicking a landlord or house card.
// With `landlord` it lists all their houses; with `houseId` only that one. Bump `version` to reload after a review.
export default function RentalDetail({
  userId,
  landlord,
  houseId,
  version,
  reviewSlot,
  houseReviewSlot,
  onClose,
}: {
  userId: number;
  landlord?: any;
  houseId?: number;
  version: number;
  reviewSlot?: ReactNode;
  houseReviewSlot: (h: any) => ReactNode;
  onClose: () => void;
}) {
  const [houses, setHouses] = useState<any[] | null>(null);

  useEffect(() => {
    getHousesForReview({ userId })
      .then((list: any[]) => setHouses(houseId ? list.filter((h) => h.id === houseId) : list))
      .catch((err) => {
        toast.error(apiErrorMessage(err, "Failed to load houses"));
        setHouses([]);
      });
  }, [userId, houseId, version]);

  const title = landlord ? `Landlord: ${landlord.name}` : `House: ${houses?.[0]?.name ?? ""}`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex justify-center items-start overflow-y-auto p-2 sm:p-6" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl p-4 sm:p-6 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-secondary mb-0">
            {title}
          </h2>
          <button className="p-2 rounded-full hover:bg-gray-100 cursor-pointer" title="Close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {landlord && (
          <section className="grid md:grid-cols-[1fr_260px] gap-4 rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={landlord.status} />
                <span className="text-xs text-gray-400">User #{landlord.userId}</span>
              </div>
              <Facts
                rows={[
                  ["Phone", landlord.mobile],
                  ["Email", landlord.email],
                  ["PAN", landlord.panNo],
                  ["Citizenship", landlord.citizenshipNo],
                  ["Address", landlord.permanentAddress],
                  ["Applied", formatDate(landlord.createdAt)],
                  ["Reviewed", formatDate(landlord.reviewedAt)],
                ]}
              />
              {landlord.reviewNote && <p className="text-xs text-gray-500 mb-0">Note: {landlord.reviewNote}</p>}
              {reviewSlot}
            </div>
            <div>
{[
                ["Citizenship — front", landlord.citizenshipFrontImage],
                ["Citizenship — back", landlord.citizenshipBackImage],
                // Older landlords may have a PAN photo
                ...(landlord.panImage ? [["PAN photo", landlord.panImage]] : []),
              ].map(([label, fileName]) => (
                <div key={label} className="mb-2">
                  <span className="text-xs text-gray-500">{label}</span>
                  {fileName ? (
                    <MediaGallery media={[{ id: 0, type: "IMAGE", fileName }]} fetchUrl={getRentalMediaUrlAdmin} hero />
                  ) : (
                    <p className="text-sm text-red-700 mb-0">Not uploaded</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {landlord && <h3 className="text-lg font-semibold text-secondary mb-0">Houses ({houses?.length ?? "…"})</h3>}
        {houses === null ? (
          <div className="flex justify-center py-6"><LoadingSvg /></div>
        ) : houses.length === 0 ? (
          <p className="text-sm text-gray-500 mb-0">No house found.</p>
        ) : (
          houses.map((h) => <HouseDetail key={h.id} house={h} reviewSlot={houseReviewSlot(h)} />)
        )}
      </div>
    </div>
  );
}
