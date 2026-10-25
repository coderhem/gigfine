"use client";

import { apiErrorMessage } from "@/api/config";
import {
  AMENITY_LABEL,
  BATHROOM_LABEL,
  FURNISHING_LABEL,
  getPublicPost,
  KITCHEN_LABEL,
  PROPERTY_TYPE_LABEL,
} from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { formatRent, StatusBadge } from "../../_components/formBits";
import { mapsLink } from "../../_components/locationMap";
import { MediaGallery } from "../../_components/rentalMedia";
import { useRentalSession } from "../../_components/useRentalSession";

const LocationMap = dynamic(() => import("../../_components/locationMap"), { ssr: false });

const L = (map: Record<string, string>, key?: string | null) => (key ? map[key] ?? key : null);

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const { user, ready } = useRentalSession();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!ready) return;
    getPublicPost(postId)
      .then(setPost)
      .catch((err) => {
        toast.error(apiErrorMessage(err, "This room is no longer available"));
        router.replace("/rent");
      });
  }, [ready, postId]);

  if (!post) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  const isOwner = post.landlordUserId === user.userId;
  const phone = String(post.landlordMobile ?? "").replace(/\D/g, "");
  const whatsapp = `https://wa.me/977${phone.replace(/^977/, "")}?text=${encodeURIComponent(
    `Namaste, I saw your ${post.title} (Rs. ${post.rent}) on GIGFINE Rent. Is it still available?`,
  )}`;

  const facts = [
    ["Type", L(PROPERTY_TYPE_LABEL, post.type)],
    ["Rooms", post.bedrooms],
    ["Floor", post.floorNo != null ? (post.floorNo === 0 ? "Ground" : post.floorNo) : null],
    ["Bathroom", L(BATHROOM_LABEL, post.bathroom)],
    ["Kitchen", L(KITCHEN_LABEL, post.kitchen)],
    ["Furnishing", L(FURNISHING_LABEL, post.furnishing)],
    ["Deposit", post.deposit != null ? formatRent(post.deposit) : null],
    ["Available from", post.availableFrom ? new Date(post.availableFrom).toLocaleDateString() : "Now"],
  ].filter(([, v]) => v != null && v !== "");

  // Room photos first, then the house's
  const media = [...(post.media ?? []), ...(post.houseMedia ?? [])];

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        <Link href="/rent" className="text-sm underline">← All rooms</Link>

        {isOwner && post.status !== "ACTIVE" && (
          <p className="text-sm rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 mt-3 mb-0 flex gap-2 items-center">
            Only you can see this — it is <StatusBadge status={post.status} kind="post" />.
          </p>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mt-4 items-start">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <MediaGallery media={media} hero emptyText="No photos for this room yet." />

            <div className="bg-white rounded-xl shadow p-5">
              <h1 className="h3 mb-1">{post.title}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaMapMarkerAlt />
                {[post.houseName, post.tole, post.municipality, post.wardNo && `Ward ${post.wardNo}`, post.district]
                  .filter(Boolean).join(", ")}
              </p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-0">
                {facts.map(([label, value]) => (
                  <div key={label as string} className="rounded-lg bg-secondary/5 p-3">
                    <dt className="text-xs text-gray-500">{label}</dt>
                    <dd className="font-medium text-secondary mb-0">{value}</dd>
                  </div>
                ))}
              </dl>
              {post.amenities?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.amenities.map((a: string) => (
                    <span key={a} className="px-2 py-1 rounded bg-green-50 text-green-800 text-xs">
                      ✓ {L(AMENITY_LABEL, a)}
                    </span>
                  ))}
                </div>
              )}
              {post.description && <p className="whitespace-pre-line mt-4 mb-0">{post.description}</p>}
            </div>

            <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="h5 mb-0">Location</h2>
                <a href={mapsLink(post.latitude, post.longitude)} target="_blank" rel="noopener noreferrer"
                  className="text-sm underline">Open in Google Maps</a>
              </div>
              <LocationMap latitude={post.latitude} longitude={post.longitude} className="h-72" />
            </div>
          </div>

          {/* Contact */}
          <aside className="bg-white rounded-xl shadow p-5 flex flex-col gap-3 lg:sticky lg:top-28">
            <span className="text-2xl font-bold text-primary">
              {formatRent(post.rent)}<span className="text-sm font-normal text-gray-500">/month</span>
            </span>
            {post.negotiable && <span className="text-sm text-gray-500 -mt-2">Negotiable</span>}
            <hr className="border-secondary/10" />
            <div>
              <span className="text-xs text-gray-500">Owner</span>
              <p className="font-semibold text-secondary mb-0">{post.landlordName}</p>
            </div>
            {phone && (
              <>
                <a href={`tel:${phone}`} className="btn btn-primary flex items-center justify-center gap-2">
                  <FaPhoneAlt /> Call {post.landlordMobile}
                </a>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer"
                  className="btn btn-green flex items-center justify-center gap-2">
                  <FaWhatsapp /> WhatsApp
                </a>
              </>
            )}
            <p className="text-xs text-gray-400 mb-0">
              Never pay a deposit before seeing the room. Report problems to GIGFINE.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
