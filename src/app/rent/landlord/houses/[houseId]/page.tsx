"use client";

import { apiErrorMessage } from "@/api/config";
import {
  AMENITY_LABEL,
  deleteHouse,
  deleteHouseMedia,
  getHouse,
  getHousePosts,
  PROPERTY_TYPE_LABEL,
  updateHouse,
  uploadHouseMedia,
} from "@/api/rental";
import DeleteBtn from "@/app/components/crudOperationBtns/deleteBtn";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { formatRent, StatusBadge } from "../../../_components/formBits";
import HouseForm from "../../../_components/houseForm";
import { MediaGallery, MediaUploader } from "../../../_components/rentalMedia";
import { useRentalSession } from "../../../_components/useRentalSession";

const LocationMap = dynamic(() => import("../../../_components/locationMap"), { ssr: false });
const AMENITIES = AMENITY_LABEL as Record<string, string>;
const TYPES = PROPERTY_TYPE_LABEL as Record<string, string>;

export default function HouseDetail() {
  const { houseId } = useParams<{ houseId: string }>();
  const { user, ready } = useRentalSession();
  const router = useRouter();
  const [house, setHouse] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);

  const reload = async () => {
    try {
      const [h, p] = await Promise.all([getHouse(user.userId, houseId), getHousePosts(user.userId, houseId)]);
      setHouse(h);
      setPosts(p);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load house"));
      router.replace("/rent/landlord");
    }
  };

  useEffect(() => {
    if (ready) reload();
  }, [ready, houseId]);

  if (!house) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  const canPost = house.status === "APPROVED" && house.landlordStatus === "APPROVED";

  const handleDelete = async () => {
    try {
      await deleteHouse(user.userId, house.id);
      toast.success("House deleted.");
      router.replace("/rent/landlord");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete house"));
    }
  };

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        <Link href="/rent/landlord" className="text-sm underline">← My houses</Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-3 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="h3 mb-0">{house.name}</h2>
              <StatusBadge status={house.status} />
            </div>
            <p className="text-sm text-gray-500 mb-0">
              {[house.tole, house.municipality, house.wardNo && `Ward ${house.wardNo}`, house.district, house.province]
                .filter(Boolean).join(", ")}
            </p>
          </div>
          <DeleteBtn deleteText="Delete house" confirmTitle="Delete this house?" onConfirm={handleDelete} />
        </div>

        {house.status === "PENDING" && (
          <p className="text-sm rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 p-3">
            Waiting for admin review. Add clear photos of the house (outside, rooms, bathroom, kitchen) to get
            approved faster.
            {house.landlordStatus !== "APPROVED" && " Your landlord profile is also still under review."}
          </p>
        )}
        {house.status === "REJECTED" && (
          <p className="text-sm rounded-lg bg-red-50 border border-red-200 text-red-800 p-3">
            Rejected{house.reviewNote ? `: ${house.reviewNote}` : "."} Edit the details or photos to send it for
            review again.
          </p>
        )}

        <div className="grid lg:grid-cols-5 gap-5 items-start">
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Media */}
            <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-3">
              <h3 className="h5 mb-0">House photos & videos</h3>
              {house.status === "APPROVED" && (
                <p className="text-xs text-gray-500 mb-0">New photos send the house back for a quick admin check.</p>
              )}
              <MediaGallery
                media={house.media}
                onDelete={async (m) => {
                  try {
                    await deleteHouseMedia(user.userId, house.id, m.id);
                    setHouse((h: any) => ({ ...h, media: h.media.filter((x: any) => x.id !== m.id) }));
                  } catch (err) {
                    toast.error(apiErrorMessage(err, "Failed to delete"));
                  }
                }}
              />
              <MediaUploader
                upload={(file) => uploadHouseMedia(user.userId, house.id, file)}
                onUploaded={() => reload()}
              />
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="h5 mb-0">Details</h3>
                <button type="button" className="text-sm underline cursor-pointer" onClick={() => setEditing(!editing)}>
                  {editing ? "Cancel" : "Edit"}
                </button>
              </div>
              {editing ? (
                <HouseForm
                  house={house}
                  submitLabel="Save changes"
                  onSubmit={async (data) => {
                    try {
                      await updateHouse(user.userId, house.id, data);
                      toast.success("Saved.");
                      setEditing(false);
                      await reload();
                    } catch (err) {
                      toast.error(apiErrorMessage(err, "Failed to save"));
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col gap-3 text-sm">
                  {house.totalFloors && <p className="mb-0">{house.totalFloors} floor(s)</p>}
                  {house.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {house.amenities.map((a: string) => (
                        <span key={a} className="px-2 py-1 rounded bg-secondary/10 text-secondary text-xs">{AMENITIES[a] ?? a}</span>
                      ))}
                    </div>
                  )}
                  {house.description && <p className="whitespace-pre-line mb-0">{house.description}</p>}
                  <LocationMap latitude={house.latitude} longitude={house.longitude} className="h-56" />
                </div>
              )}
            </div>
          </div>

          {/* Posts */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="h5 mb-0">Rooms / flats</h3>
              {canPost && (
                <Link href={`/rent/landlord/houses/${house.id}/posts/new`} className="btn btn-primary py-2 flex items-center gap-2 text-sm">
                  <FaPlus /> Post
                </Link>
              )}
            </div>
            {!canPost && (
              <p className="text-sm text-gray-500 mb-0">You can post rooms once this house is approved.</p>
            )}
            {posts.length === 0 ? (
              canPost && <p className="text-sm text-gray-500 mb-0">No posts yet.</p>
            ) : (
              posts.map((p) => (
                <Link key={p.id} href={`/rent/landlord/houses/${house.id}/posts/${p.id}`}
                  className="rounded-lg border border-secondary/15 p-3 hover:border-primary transition">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-secondary">{p.title}</span>
                    <StatusBadge status={p.status} kind="post" />
                  </div>
                  <p className="text-xs text-gray-500 mb-0 mt-1">
                    {TYPES[p.type] ?? p.type} · {formatRent(p.rent)}/month
                    {p.floorNo != null && ` · Floor ${p.floorNo}`} · {p.media.length} photo/video
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
