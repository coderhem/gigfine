"use client";

import { AMENITY_LABEL, PROVINCES } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import dynamic from "next/dynamic";
import { useState } from "react";
import toast from "react-hot-toast";
import { Field, inputClass, Pills } from "./formBits";

const LocationMap = dynamic(() => import("./locationMap"), { ssr: false });

export type HouseFormData = {
  name: string;
  description: string;
  province: string;
  district: string;
  municipality: string;
  wardNo: string;
  tole: string;
  totalFloors: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
};

const fromHouse = (h: any): HouseFormData => ({
  name: h?.name ?? "",
  description: h?.description ?? "",
  province: h?.province ?? "Bagmati",
  district: h?.district ?? "",
  municipality: h?.municipality ?? "",
  wardNo: h?.wardNo?.toString() ?? "",
  tole: h?.tole ?? "",
  totalFloors: h?.totalFloors?.toString() ?? "",
  latitude: h?.latitude ?? null,
  longitude: h?.longitude ?? null,
  amenities: h?.amenities ?? [],
});

// Body for POST/PUT /users/{userId}/houses
const toRequest = (f: HouseFormData) => ({
  ...f,
  wardNo: f.wardNo ? Number(f.wardNo) : null,
  totalFloors: f.totalFloors ? Number(f.totalFloors) : null,
});

export default function HouseForm({
  house,
  onSubmit,
  submitLabel,
}: {
  house?: any;
  onSubmit: (data: ReturnType<typeof toRequest>) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<HouseFormData>(() => fromHouse(house));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof HouseFormData>(key: K, value: HouseFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (a: string) =>
    set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.district.trim() || !form.municipality.trim()) {
      toast.error("House name, district and municipality are required.");
      return;
    }
    if (form.latitude == null || form.longitude == null) {
      toast.error("Pin the house on the map.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(toRequest(form));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {house?.status === "APPROVED" && (
        <p className="text-sm rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 mb-0">
          This house is approved. Saving changes sends it back for admin review, and its rooms are hidden until
          it is approved again.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="House name *" className="sm:col-span-2">
          <input className={inputClass} maxLength={150} placeholder="e.g. Sharma Niwas" value={form.name}
            onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Province">
          <select className={inputClass} value={form.province} onChange={(e) => set("province", e.target.value)}>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="District *">
          <input className={inputClass} placeholder="e.g. Kathmandu" value={form.district}
            onChange={(e) => set("district", e.target.value)} />
        </Field>
        <Field label="Municipality *">
          <input className={inputClass} placeholder="e.g. Kathmandu Metropolitan City" value={form.municipality}
            onChange={(e) => set("municipality", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ward no.">
            <input type="number" min={1} className={inputClass} value={form.wardNo}
              onChange={(e) => set("wardNo", e.target.value)} />
          </Field>
          <Field label="Total floors">
            <input type="number" min={1} className={inputClass} value={form.totalFloors}
              onChange={(e) => set("totalFloors", e.target.value)} />
          </Field>
        </div>
        <Field label="Tole / street" className="sm:col-span-2">
          <input className={inputClass} placeholder="e.g. Baneshwor, near Shankhamul chowk" value={form.tole}
            onChange={(e) => set("tole", e.target.value)} />
        </Field>
      </div>

      <Field label="Location on map *" hint="Tap the map or drag the pin to the house's gate.">
        <LocationMap latitude={form.latitude} longitude={form.longitude}
          onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))} />
      </Field>
      <div className="grid grid-cols-2 gap-4 -mt-2">
        <Field label="Latitude">
          <input type="number" step="any" className={inputClass} value={form.latitude ?? ""}
            onChange={(e) => set("latitude", e.target.value === "" ? null : Number(e.target.value))} />
        </Field>
        <Field label="Longitude">
          <input type="number" step="any" className={inputClass} value={form.longitude ?? ""}
            onChange={(e) => set("longitude", e.target.value === "" ? null : Number(e.target.value))} />
        </Field>
      </div>

      <Field label="Facilities">
        <Pills options={AMENITY_LABEL} values={form.amenities} onToggle={toggleAmenity} />
      </Field>

      <Field label="About the house">
        <textarea className="form-control h-auto! min-h-28" maxLength={3000}
          placeholder="Road access, nearby places, house rules…" value={form.description}
          onChange={(e) => set("description", e.target.value)} />
      </Field>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? <LoadingSvg /> : submitLabel}
      </button>
    </form>
  );
}
