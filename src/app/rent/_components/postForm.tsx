"use client";

import {
  BATHROOM_LABEL,
  FLAT_TYPE_LABEL,
  FURNISHING_LABEL,
  KITCHEN_LABEL,
  MINIMUM_STAY_LABEL,
  POSTABLE_TYPES,
  PROPERTY_TYPE_LABEL,
  RENT_INCREASE_LABEL,
  TENANT_TYPE_LABEL,
} from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { useState } from "react";
import toast from "react-hot-toast";
import { Field, inputClass, Pills } from "./formBits";

const TYPES = PROPERTY_TYPE_LABEL as Record<string, string>;
const YES_NO = { YES: "Yes", NO: "No" };

type PostFormData = {
  title: string;
  description: string;
  type: string;
  floorNo: string;
  bedrooms: string;
  bathroom: string;
  kitchen: string;
  furnishing: string;
  rent: string;
  deposit: string;
  negotiable: boolean;
  availableFrom: string;
  // Flat only
  flatType: string;
  areaSqft: string;
  bathrooms: string;
  balconies: string;
  minimumStay: string;
  rentIncrease: string;
  writtenAgreement: boolean | null;
  preferredTenants: string[];
};

const fromPost = (p: any): PostFormData => ({
  title: p?.title ?? "",
  description: p?.description ?? "",
  type: p?.type ?? "ROOM",
  floorNo: p?.floorNo?.toString() ?? "",
  // No longer asked; kept as-is for old posts
  bedrooms: p?.bedrooms?.toString() ?? "",
  bathroom: p?.bathroom ?? "",
  kitchen: p?.kitchen ?? "",
  furnishing: p?.furnishing ?? "",
  rent: p?.rent?.toString() ?? "",
  deposit: p?.deposit?.toString() ?? "",
  negotiable: p?.negotiable ?? false,
  availableFrom: p?.availableFrom ?? "",
  flatType: p?.flatType ?? "",
  areaSqft: p?.areaSqft?.toString() ?? "",
  bathrooms: p?.bathrooms?.toString() ?? "",
  balconies: p?.balconies?.toString() ?? "",
  minimumStay: p?.minimumStay ?? "",
  rentIncrease: p?.rentIncrease ?? "",
  writtenAgreement: p?.writtenAgreement ?? null,
  preferredTenants: p?.preferredTenants ?? [],
});

const num = (v: string) => (v === "" ? null : Number(v));

// Body for POST/PUT .../houses/{houseId}/posts (the backend drops flat fields for other types)
const toRequest = (f: PostFormData) => ({
  ...f,
  floorNo: num(f.floorNo),
  bedrooms: num(f.bedrooms),
  rent: num(f.rent),
  deposit: num(f.deposit),
  bathroom: f.bathroom || null,
  kitchen: f.kitchen || null,
  furnishing: f.furnishing || null,
  availableFrom: f.availableFrom || null,
  flatType: f.flatType || null,
  areaSqft: num(f.areaSqft),
  bathrooms: num(f.bathrooms),
  balconies: num(f.balconies),
  minimumStay: f.minimumStay || null,
  rentIncrease: f.rentIncrease || null,
});

const FLAT_REQUIRED: [keyof PostFormData, string][] = [
  ["flatType", "flat type"],
  ["areaSqft", "flat size"],
  ["bathrooms", "number of bathrooms"],
  ["balconies", "number of balconies"],
  ["minimumStay", "minimum stay"],
  ["rentIncrease", "rent increase"],
];

export default function PostForm({
  post,
  totalFloors,
  onSubmit,
  submitLabel,
}: {
  post?: any;
  totalFloors?: number | null;
  onSubmit: (data: ReturnType<typeof toRequest>) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<PostFormData>(() => fromPost(post));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof PostFormData>(key: K, value: PostFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const isFlat = form.type === "FLAT";

  // Room / flat, plus the old post's own type when editing a whole house / shutter post
  const typeOptions = Object.fromEntries(
    [...new Set([...POSTABLE_TYPES, ...(post?.type ? [post.type] : [])])].map((t) => [t, TYPES[t] ?? t]),
  );

  // "Anyone" is exclusive of the specific tenant types
  const toggleTenant = (t: string) =>
    setForm((f) => {
      if (f.preferredTenants.includes(t)) return { ...f, preferredTenants: f.preferredTenants.filter((x) => x !== t) };
      const rest = t === "ANYONE" ? [] : f.preferredTenants.filter((x) => x !== "ANYONE");
      return { ...f, preferredTenants: [...rest, t] };
    });

  const numberInput = (key: "areaSqft" | "bathrooms" | "balconies", min = 0) => (
    <input type="number" min={min} className={inputClass} value={form[key]} onChange={(e) => set(key, e.target.value)} />
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (form.rent === "" || Number(form.rent) < 0) {
      toast.error("Monthly rent is required.");
      return;
    }
    if (isFlat) {
      const missing = FLAT_REQUIRED.filter(([key]) => !String(form[key]).trim()).map(([, label]) => label);
      if (form.writtenAgreement == null) missing.push("written agreement");
      if (!form.preferredTenants.length) missing.push("preferred tenant");
      if (missing.length) {
        toast.error(`Please fill: ${missing.join(", ")}.`);
        return;
      }
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
      <Field label="What are you renting out? *">
        <Pills options={typeOptions} value={form.type} onChange={(v) => set("type", v)} />
      </Field>

      <Field label="Title *">
        <input className={inputClass} maxLength={150}
          placeholder={isFlat ? "e.g. 2BHK flat with balcony, sunny side" : "e.g. Sunny room with attached bathroom"}
          value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Monthly rent (Rs.) *">
          <input type="number" min={0} className={inputClass} value={form.rent}
            onChange={(e) => set("rent", e.target.value)} />
        </Field>
        <Field label="Deposit (Rs.)">
          <input type="number" min={0} className={inputClass} value={form.deposit}
            onChange={(e) => set("deposit", e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm sm:mt-7 cursor-pointer">
          <input type="checkbox" className="size-4 accent-[#0c589c]" checked={form.negotiable}
            onChange={(e) => set("negotiable", e.target.checked)} />
          Rent is negotiable
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Floor" hint={totalFloors ? `0 = ground, house has ${totalFloors}` : "0 = ground floor"}>
          <input type="number" min={0} className={inputClass} value={form.floorNo}
            onChange={(e) => set("floorNo", e.target.value)} />
        </Field>
        <Field label="Available from">
          <input type="date" className={inputClass} value={form.availableFrom}
            onChange={(e) => set("availableFrom", e.target.value)} />
        </Field>
      </div>

      <Field label="Bathroom">
        <Pills options={BATHROOM_LABEL} value={form.bathroom} onChange={(v) => set("bathroom", v)} allowEmpty />
      </Field>
      <Field label="Kitchen">
        <Pills options={KITCHEN_LABEL} value={form.kitchen} onChange={(v) => set("kitchen", v)} allowEmpty />
      </Field>
      <Field label="Furnishing">
        <Pills options={FURNISHING_LABEL} value={form.furnishing} onChange={(v) => set("furnishing", v)} allowEmpty />
      </Field>

      {isFlat && (
        <div className="flex flex-col gap-5 rounded-lg border border-secondary/15 p-4">
          <h4 className="h6 mb-0">Flat details</h4>
          <Field label="Flat type *">
            <Pills options={FLAT_TYPE_LABEL} value={form.flatType} onChange={(v) => set("flatType", v)} />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Size (sq ft) *" className="col-span-2 sm:col-span-1">{numberInput("areaSqft", 1)}</Field>
            <Field label="Bathrooms *">{numberInput("bathrooms")}</Field>
            <Field label="Balconies *">{numberInput("balconies")}</Field>
          </div>
          <Field label="Minimum stay *">
            <Pills options={MINIMUM_STAY_LABEL} value={form.minimumStay} onChange={(v) => set("minimumStay", v)} />
          </Field>
          <Field label="Rent increase *">
            <Pills options={RENT_INCREASE_LABEL} value={form.rentIncrease} onChange={(v) => set("rentIncrease", v)} />
          </Field>
          <Field label="Written agreement *">
            <Pills options={YES_NO}
              value={form.writtenAgreement == null ? "" : form.writtenAgreement ? "YES" : "NO"}
              onChange={(v) => set("writtenAgreement", v === "YES")} />
          </Field>
          <Field label="Preferred tenant *">
            <Pills options={TENANT_TYPE_LABEL} values={form.preferredTenants} onToggle={toggleTenant} />
          </Field>
        </div>
      )}

      <Field label="Details">
        <textarea className="form-control h-auto! min-h-28" maxLength={3000}
          placeholder="Water/electricity billing, anything else tenants should know…"
          value={form.description} onChange={(e) => set("description", e.target.value)} />
      </Field>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? <LoadingSvg /> : submitLabel}
      </button>
    </form>
  );
}
