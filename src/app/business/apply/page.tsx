"use client";
import {
  BUSINESS_STATUS_LABEL,
  BUSINESS_TYPE_LABEL,
  createBusiness,
  getMyBusiness,
  imageFileError,
  uploadBusinessDocument,
} from "@/api/business";
import { apiErrorMessage } from "@/api/config";
import BusinessLogo from "@/app/components/businessLogo";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { mapsLink } from "@/app/rent/_components/locationMap";

// Leaflet needs `window`: client only
const LocationMap = dynamic(() => import("@/app/rent/_components/locationMap"), { ssr: false });

const STATUS_LABEL = BUSINESS_STATUS_LABEL as Record<string, string>;
const TYPE_LABEL = BUSINESS_TYPE_LABEL as Record<string, string>;

const EMPTY_FORM = {
  registrationNo: "",
  panNo: "",
  businessLocation: "",
  ownerName: "",
  ownerPhone: "",
};

const FIELDS: { key: keyof typeof EMPTY_FORM; label: string }[] = [
  { key: "registrationNo", label: "Registration No." },
  { key: "panNo", label: "PAN/VAT No." },
  { key: "businessLocation", label: "Business location" },
  { key: "ownerName", label: "Owner name" },
  { key: "ownerPhone", label: "Owner phone number" },
];

// rc = registration certificate, pc = PAN/VAT certificate
const DOCUMENTS: { type: "rc" | "pc"; label: string; field: string }[] = [
  { type: "rc", label: "Registration certificate", field: "registrationCertImage" },
  { type: "pc", label: "PAN/VAT certificate", field: "panImage" },
];

// Status + document upload after /business/register. Accounts created on the main
// site can also fill in the details here. The business name and phone come from
// the account; an admin verifies everything and approves it.
const BusinessApply = () => {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  // Optional, from the <select> only ("" = not chosen; an admin sets it later)
  const [type, setType] = useState("");
  // Map pin: "Use my location" or a tap on the map. Optional.
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !localStorage.getItem("token")) {
      router.replace("/business/login");
      return;
    }
    getMyBusiness(user.userId)
      .then(setBusiness)
      .catch((err) => toast.error(apiErrorMessage(err, "Failed to load business")))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v.trim())) {
      toast.error("Please fill in every field.");
      return;
    }
    setSaving(true);
    try {
      setBusiness(
        await createBusiness(user.userId, {
          ...form,
          type: type || null,
          latitude: pin?.lat ?? null,
          longitude: pin?.lng ?? null,
        }),
      );
      toast.success("Application submitted. Now upload your documents.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to submit application"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (type: "rc" | "pc", file: File | undefined) => {
    if (!file) return;
    const fileError = imageFileError(file);
    if (fileError) {
      toast.error(fileError);
      return;
    }
    setUploading(type);
    try {
      setBusiness(await uploadBusinessDocument(user.userId, type, file));
      toast.success("Document uploaded.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(null);
    }
  };

  if (!user || loading) {
    return <LoadingSvg className="absolute left-1/2 top-1/2 -translate-1/2 size-20" />;
  }

  return (
    <section className="py-8 md:py-11">
      <div className="container">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-secondary/10 p-6 sm:p-8">
          <h2 className="h3 normal-case mb-1">
            Business <span className="text-primary">profile</span>
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Business name: <b>{user.name}</b> · Phone: <b>{user.mobile || "-"}</b> (from your
            account)
          </p>
          <div className="mb-6">
            <BusinessLogo editable />
          </div>

          {!business ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {FIELDS.map(({ key, label }) => (
                <div key={key} className="form-group">
                  <input
                    type="text"
                    placeholder={label}
                    className="form-control"
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="form-group">
                <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">Business type (optional)</option>
                  {Object.entries(TYPE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <p className="text-sm text-secondary mb-1">Business location on the map (optional)</p>
                <LocationMap
                  latitude={pin?.lat}
                  longitude={pin?.lng}
                  onChange={(lat, lng) => setPin({ lat, lng })}
                  className="h-56"
                />
                <p className="text-xs px-1 text-secondary/70 mb-0 mt-1">
                  {pin
                    ? `Pinned: ${pin.lat}, ${pin.lng}. Drag the pin to the exact spot if needed.`
                    : 'Tap "Use my location" at your business, or tap the map. Riders use it to find you.'}
                </p>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Submitting..." : "Submit application"}
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                Status:
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    business.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {STATUS_LABEL[business.status] ?? business.status}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-sm mb-6">
                <dt className="text-gray-500">Business type</dt>
                <dd>{TYPE_LABEL[business.type] ?? "Not set yet (GIGFINE sets it)"}</dd>
                <dt className="text-gray-500">Map location</dt>
                <dd>
                  {business.latitude != null ? (
                    <a href={mapsLink(business.latitude, business.longitude)} target="_blank" rel="noreferrer">
                      View on map
                    </a>
                  ) : (
                    "Not set yet (GIGFINE sets it)"
                  )}
                </dd>
                {FIELDS.map(({ key, label }) => (
                  <div key={key} className="contents">
                    <dt className="text-gray-500">{label}</dt>
                    <dd>{business[key]}</dd>
                  </div>
                ))}
              </dl>

              {business.status === "APPROVED" ? (
                <Link href="/business" className="btn btn-primary">
                  Open business panel
                </Link>
              ) : (
                <>
                  <h3 className="h6 mb-3">Documents</h3>
                  <div className="flex flex-col gap-3 mb-4">
                    {DOCUMENTS.map(({ type, label, field }) => (
                      <label key={type} className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="w-48">
                          {label}
                          {business[field] && (
                            <FaCheckCircle className="inline ml-2 text-green-600" />
                          )}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          disabled={uploading !== null}
                          onChange={(e) => handleUpload(type, e.target.files?.[0])}
                        />
                        {uploading === type && <LoadingSvg />}
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mb-0">
                    An admin will verify your details and documents. Once approved you can
                    see the reports forwarded to your business.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default BusinessApply;
