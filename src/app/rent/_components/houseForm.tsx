"use client";

import { AMENITY_LABEL, FACILITY_LABEL, NEARBY_LABEL, PARKING_AMENITIES, PROVINCES, WATER_LABEL } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import dynamic from "next/dynamic";
import { useState } from "react";
import toast from "react-hot-toast";
import { Field, inputClass, Pills } from "./formBits";

const LocationMap = dynamic(() => import("./locationMap"), { ssr: false });

const NO_PARKING = "NO_SPACE";
const PARKING_LABEL = {
  ...Object.fromEntries(PARKING_AMENITIES.map((a) => [a, (AMENITY_LABEL as Record<string, string>)[a]])),
  [NO_PARKING]: "No space",
};
const OWNER_LIVES_LABEL = { YES: "Yes", NO: "No" };

const RULES_PLACEHOLDER = "1. No smoking inside the house\n2. Visitors allowed until 8 PM\n3. Keep the stairs clean";

export type HouseFormData = {
  name: string;
  description: string;
  province: string;
  district: string;
  municipality: string;
  wardNo: string;
  city: string;
  tole: string;
  totalFloors: string;
  totalRooms: string;
  totalBathrooms: string;
  ownerLivesHere: boolean | null;
  water: string;
  gateClosingTime: string;
  houseRules: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  nearby: string[];
  noParking: boolean;
};

const fromHouse = (h: any): HouseFormData => ({
  name: h?.name ?? "",
  description: h?.description ?? "",
  province: h?.province ?? "Bagmati",
  district: h?.district ?? "",
  municipality: h?.municipality ?? "",
  wardNo: h?.wardNo?.toString() ?? "",
  city: h?.city ?? "",
  tole: h?.tole ?? "",
  totalFloors: h?.totalFloors?.toString() ?? "",
  totalRooms: h?.totalRooms?.toString() ?? "",
  totalBathrooms: h?.totalBathrooms?.toString() ?? "",
  ownerLivesHere: h?.ownerLivesHere ?? null,
  water: h?.water ?? "",
  gateClosingTime: h?.gateClosingTime ?? "",
  houseRules: h?.houseRules ?? "",
  latitude: h?.latitude ?? null,
  longitude: h?.longitude ?? null,
  amenities: h?.amenities ?? [],
  nearby: h?.nearby ?? [],
  // Saved with this form (water is set) and no parking picked
  noParking: !!h?.water && !h?.amenities?.some((a: string) => PARKING_AMENITIES.includes(a)),
});

const toNumber = (v: string) => (v ? Number(v) : null);

// Body for POST/PUT /users/{userId}/houses
const toRequest = ({ noParking, ...f }: HouseFormData) => ({
  ...f,
  wardNo: toNumber(f.wardNo),
  totalFloors: toNumber(f.totalFloors),
  totalRooms: toNumber(f.totalRooms),
  totalBathrooms: toNumber(f.totalBathrooms),
  water: f.water || null,
});

// Everything the client asked for except house rules and the description
const REQUIRED: [keyof HouseFormData, string][] = [
  ["name", "house name"],
  ["totalFloors", "house floors"],
  ["totalRooms", "total rooms"],
  ["district", "district"],
  ["municipality", "municipality"],
  ["wardNo", "ward number"],
  ["city", "city"],
  ["tole", "tole / street"],
  ["totalBathrooms", "total bathrooms"],
  ["water", "water"],
  ["gateClosingTime", "gate closing time"],
];

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

  const toggle = (key: "amenities" | "nearby", v: string) =>
    set(key, form[key].includes(v) ? form[key].filter((x) => x !== v) : [...form[key], v]);

  // "No space" clears bike / car parking, and picking one of them clears "No space"
  const toggleParking = (v: string) => {
    if (v === NO_PARKING) {
      setForm((f) => ({ ...f, noParking: !f.noParking, amenities: f.amenities.filter((a) => !PARKING_AMENITIES.includes(a)) }));
    } else {
      set("noParking", false);
      toggle("amenities", v);
    }
  };
  const parkingValues = form.noParking ? [NO_PARKING] : form.amenities.filter((a) => PARKING_AMENITIES.includes(a));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = REQUIRED.filter(([key]) => !String(form[key] ?? "").trim()).map(([, label]) => label);
    if (form.ownerLivesHere == null) missing.push("owner lives here");
    if (!parkingValues.length) missing.push("parking");
    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}.`);
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

  const numberInput = (key: "totalFloors" | "totalRooms" | "totalBathrooms" | "wardNo", min = 1) => (
    <input type="number" min={min} className={inputClass} value={form[key]} onChange={(e) => set(key, e.target.value)} />
  );

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
        <Field label="House floors *">{numberInput("totalFloors")}</Field>
        <Field label="Total rooms *">{numberInput("totalRooms")}</Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <h4 className="h6 mb-0 sm:col-span-2">Location</h4>
        <Field label="Province *">
          <select className={inputClass} value={form.province} onChange={(e) => set("province", e.target.value)}>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="District *">
          <input className={inputClass} placeholder="e.g. Kathmandu" value={form.district}
            onChange={(e) => set("district", e.target.value)} />
        </Field>
        <Field label="Metro / Sub-metro / Municipality *">
          <input className={inputClass} placeholder="e.g. Kathmandu Metropolitan City" value={form.municipality}
            onChange={(e) => set("municipality", e.target.value)} />
        </Field>
        <Field label="Ward no. *">{numberInput("wardNo")}</Field>
        <Field label="City *">
          <input className={inputClass} maxLength={100} placeholder="e.g. Kathmandu" value={form.city}
            onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Tole / street *">
          <input className={inputClass} placeholder="e.g. Baneshwor, near Shankhamul chowk" value={form.tole}
            onChange={(e) => set("tole", e.target.value)} />
        </Field>
      </div>

      <Field label="Pin on map *" hint="Tap the map or drag the pin to the house's gate.">
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
        <Pills options={FACILITY_LABEL} values={form.amenities} onToggle={(v) => toggle("amenities", v)} />
      </Field>

      <Field label="Near the house">
        <Pills options={NEARBY_LABEL} values={form.nearby} onToggle={(v) => toggle("nearby", v)} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Owner lives in the house *">
          <Pills options={OWNER_LIVES_LABEL}
            value={form.ownerLivesHere == null ? "" : form.ownerLivesHere ? "YES" : "NO"}
            onChange={(v) => set("ownerLivesHere", v === "YES")} />
        </Field>
        <Field label="Parking *">
          <Pills options={PARKING_LABEL} values={parkingValues} onToggle={toggleParking} />
        </Field>
      </div>

      <Field label="Water *">
        <Pills options={WATER_LABEL} value={form.water} onChange={(v) => set("water", v)} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Total bathrooms *">{numberInput("totalBathrooms", 0)}</Field>
        <Field label="Gate closing time *" hint="Write “No fixed time” if the gate is always open.">
          <input className={inputClass} maxLength={20} placeholder="e.g. 9:00 PM" value={form.gateClosingTime}
            onChange={(e) => set("gateClosingTime", e.target.value)} />
        </Field>
      </div>

      <Field label="House rules and regulations (optional)"
        hint="One rule per line. Rules written on paper? Add a photo of the paper with the house photos after saving.">
        <textarea className="form-control h-auto! min-h-28" maxLength={3000} placeholder={RULES_PLACEHOLDER}
          value={form.houseRules} onChange={(e) => set("houseRules", e.target.value)} />
      </Field>

      <Field label="About the house (optional)">
        <textarea className="form-control h-auto! min-h-24" maxLength={3000}
          placeholder="Anything else tenants should know" value={form.description}
          onChange={(e) => set("description", e.target.value)} />
      </Field>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? <LoadingSvg /> : submitLabel}
      </button>
    </form>
  );
}
