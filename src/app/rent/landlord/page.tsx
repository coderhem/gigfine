"use client";

import { apiErrorMessage } from "@/api/config";
import { createLandlord, getMyHouses, getMyLandlord, updateLandlord, uploadPanImage } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaHome, FaMapMarkerAlt, FaPlus, FaRegCircle } from "react-icons/fa";
import { Field, inputClass, StatusBadge } from "../_components/formBits";
import { MediaGallery, MediaUploader } from "../_components/rentalMedia";
import { useRentalSession } from "../_components/useRentalSession";

type ProfileForm = { panNo: string; citizenshipNo: string; permanentAddress: string };

const toForm = (l: any): ProfileForm => ({
  panNo: l?.panNo ?? "",
  citizenshipNo: l?.citizenshipNo ?? "",
  permanentAddress: l?.permanentAddress ?? "",
});

// Landlord panel: profile (step 1-2), houses (step 3), approval status (step 4)
export default function LandlordPanel() {
  const { user, ready } = useRentalSession();
  const [landlord, setLandlord] = useState<any>(undefined);
  const [houses, setHouses] = useState<any[]>([]);
  const [form, setForm] = useState<ProfileForm>(toForm(null));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    Promise.all([getMyLandlord(user.userId), getMyHouses(user.userId).catch(() => [])])
      .then(([l, h]) => {
        setLandlord(l);
        setForm(toForm(l));
        setHouses(Array.isArray(h) ? h : []);
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Failed to load your landlord profile")));
  }, [ready]);

  if (!ready || landlord === undefined) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.panNo.trim()) {
      toast.error("PAN number is required.");
      return;
    }
    setSaving(true);
    try {
      const saved = landlord ? await updateLandlord(user.userId, form) : await createLandlord(user.userId, form);
      setLandlord(saved);
      setEditing(false);
      toast.success(landlord ? "Details saved." : "Landlord profile created. Now upload your PAN photo.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const profileForm = (
    <form onSubmit={saveProfile} className="grid sm:grid-cols-3 gap-4 items-end">
      <Field label="PAN number *">
        <input className={inputClass} value={form.panNo} onChange={(e) => setForm({ ...form, panNo: e.target.value })} />
      </Field>
      <Field label="Citizenship number">
        <input className={inputClass} value={form.citizenshipNo}
          onChange={(e) => setForm({ ...form, citizenshipNo: e.target.value })} />
      </Field>
      <Field label="Permanent address">
        <input className={inputClass} value={form.permanentAddress}
          onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} />
      </Field>
      <div className="sm:col-span-3 flex gap-2">
        <button type="submit" className="btn btn-primary py-2" disabled={saving}>
          {saving ? <LoadingSvg /> : landlord ? "Save details" : "Register as landlord"}
        </button>
        {editing && (
          <button type="button" className="btn py-2" onClick={() => { setEditing(false); setForm(toForm(landlord)); }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  // Not a landlord yet (account made on the main site)
  if (!landlord) {
    return (
      <section className="py-8 md:py-11">
        <div className="container max-w-3xl">
          <h2 className="h3 mb-1">List your <span className="text-primary">house</span></h2>
          <p className="text-sm text-gray-500 mb-6">
            Add your PAN details to become a landlord. Your name and phone come from your GIGFINE account
            ({user.name}, {user.mobile}).
          </p>
          <div className="bg-white rounded-xl shadow p-5">{profileForm}</div>
        </div>
      </section>
    );
  }

  const approved = landlord.status === "APPROVED";
  const steps = [
    { done: true, label: "Details + PAN number" },
    { done: !!landlord.panImage, label: "PAN photo uploaded" },
    { done: houses.length > 0, label: "House added" },
    { done: approved, label: "Approved by admin" },
  ];

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="h3 mb-1">
              <span className="text-primary">{user.name}</span> — My houses
            </h2>
            <p className="text-sm text-gray-500 mb-0">
              Each house is checked by an admin. You can post rooms / flats once a house is approved.
            </p>
          </div>
          <Link href="/rent/landlord/houses/new" className="btn btn-primary flex items-center gap-2">
            <FaPlus /> Add house
          </Link>
        </div>

        {/* Progress */}
        {!approved && (
          <ol className="grid sm:grid-cols-4 gap-2 mb-6">
            {steps.map((s, i) => (
              <li key={s.label}
                className={`flex items-center gap-2 rounded-lg p-3 text-sm ${s.done ? "bg-green-50 text-green-800" : "bg-white text-gray-500 shadow"}`}>
                {s.done ? <FaCheckCircle /> : <FaRegCircle />} {i + 1}. {s.label}
              </li>
            ))}
          </ol>
        )}

        <div className="grid lg:grid-cols-3 gap-5 items-start">
          {/* Profile */}
          <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="h5 mb-0">Landlord profile</h3>
              <StatusBadge status={landlord.status} />
            </div>
            {landlord.status === "REJECTED" && (
              <p className="text-sm rounded bg-red-50 text-red-800 p-3 mb-0">
                Rejected{landlord.reviewNote ? `: ${landlord.reviewNote}` : "."} Fix your details below to send
                them for review again.
              </p>
            )}
            {landlord.status === "PENDING" && (
              <p className="text-sm rounded bg-yellow-50 text-yellow-800 p-3 mb-0">
                An admin is checking your details. This usually takes a day.
              </p>
            )}

            {editing ? (
              profileForm
            ) : (
              <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 mb-0">
                <dt className="text-gray-500">Name</dt><dd className="mb-0">{landlord.name}</dd>
                <dt className="text-gray-500">Phone</dt><dd className="mb-0">{landlord.mobile}</dd>
                <dt className="text-gray-500">PAN</dt><dd className="mb-0">{landlord.panNo}</dd>
                <dt className="text-gray-500">Citizenship</dt><dd className="mb-0">{landlord.citizenshipNo || "-"}</dd>
                <dt className="text-gray-500">Address</dt><dd className="mb-0">{landlord.permanentAddress || "-"}</dd>
              </dl>
            )}
            {!approved && !editing && (
              <button type="button" className="text-sm underline self-start cursor-pointer" onClick={() => setEditing(true)}>
                Edit details
              </button>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-secondary">PAN card photo</span>
              {landlord.panImage && (
                <MediaGallery media={[{ id: 0, type: "IMAGE", fileName: landlord.panImage }]} />
              )}
              {!approved && (
                <MediaUploader
                  imagesOnly
                  label={landlord.panImage ? "Replace PAN photo" : "Upload PAN photo"}
                  upload={async (file) => {
                    const saved = await uploadPanImage(user.userId, file);
                    setLandlord(saved);
                    return { id: 0, type: "IMAGE", fileName: saved.panImage };
                  }}
                  onUploaded={() => toast.success("PAN photo uploaded.")}
                />
              )}
            </div>
          </div>

          {/* Houses */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {houses.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                <FaHome className="mx-auto mb-3 text-4xl text-secondary/30" />
                <p>No houses yet. Add your house with photos and its location on the map.</p>
                <Link href="/rent/landlord/houses/new" className="btn btn-primary inline-flex items-center gap-2">
                  <FaPlus /> Add house
                </Link>
              </div>
            ) : (
              houses.map((h) => (
                <Link key={h.id} href={`/rent/landlord/houses/${h.id}`}
                  className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 items-center justify-between hover:ring-2 hover:ring-primary/40 transition">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-secondary mb-1">{h.name}</h4>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <FaMapMarkerAlt />
                      {[h.tole, h.municipality, h.wardNo && `Ward ${h.wardNo}`, h.district].filter(Boolean).join(", ")}
                    </p>
                    <p className="text-xs text-gray-400 mb-0">
                      {h.media?.length ?? 0} photo/video · {h.postCount} room/flat post(s)
                    </p>
                    {h.status === "REJECTED" && h.reviewNote && (
                      <p className="text-xs text-red-700 mt-1 mb-0">Rejected: {h.reviewNote}</p>
                    )}
                  </div>
                  <StatusBadge status={h.status} />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
