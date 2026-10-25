"use client";

import { BATHROOM_LABEL, FURNISHING_LABEL, KITCHEN_LABEL, PROPERTY_TYPE_LABEL } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { useState } from "react";
import toast from "react-hot-toast";
import { Field, inputClass, Pills } from "./formBits";

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
};

const fromPost = (p: any): PostFormData => ({
  title: p?.title ?? "",
  description: p?.description ?? "",
  type: p?.type ?? "ROOM",
  floorNo: p?.floorNo?.toString() ?? "",
  bedrooms: p?.bedrooms?.toString() ?? "1",
  bathroom: p?.bathroom ?? "",
  kitchen: p?.kitchen ?? "",
  furnishing: p?.furnishing ?? "",
  rent: p?.rent?.toString() ?? "",
  deposit: p?.deposit?.toString() ?? "",
  negotiable: p?.negotiable ?? false,
  availableFrom: p?.availableFrom ?? "",
});

const num = (v: string) => (v === "" ? null : Number(v));

// Body for POST/PUT .../houses/{houseId}/posts
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
});

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
    setSaving(true);
    try {
      await onSubmit(toRequest(form));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Title *">
        <input className={inputClass} maxLength={150} placeholder="e.g. 2 rooms with kitchen, sunny side"
          value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <Field label="What are you renting out? *">
        <Pills options={PROPERTY_TYPE_LABEL} value={form.type} onChange={(v) => set("type", v)} />
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Floor" hint={totalFloors ? `0 = ground, house has ${totalFloors}` : "0 = ground floor"}>
          <input type="number" min={0} className={inputClass} value={form.floorNo}
            onChange={(e) => set("floorNo", e.target.value)} />
        </Field>
        <Field label="Bedrooms / rooms">
          <input type="number" min={0} className={inputClass} value={form.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)} />
        </Field>
        <Field label="Available from" className="col-span-2 sm:col-span-1">
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

      <Field label="Details">
        <textarea className="form-control h-auto! min-h-28" maxLength={3000}
          placeholder="Who it suits (student, family…), water/electricity billing, rules…"
          value={form.description} onChange={(e) => set("description", e.target.value)} />
      </Field>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? <LoadingSvg /> : submitLabel}
      </button>
    </form>
  );
}
