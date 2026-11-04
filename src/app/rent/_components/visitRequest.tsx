"use client";

import { apiErrorMessage } from "@/api/config";
import { cancelVisitRequest, getMyVisitRequests, requestVisit } from "@/api/rental";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCalendarCheck } from "react-icons/fa";
import { Field, formatVisit, inputClass, StatusBadge } from "./formBits";

// Local date as "YYYY-MM-DD" (toISOString would give the UTC day)
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const isOpen = (v: any) => v.status === "PENDING" || v.status === "CONFIRMED";

// Room page: the logged-in user asks GIGFINE to arrange a field visit, then sees its status here.
export default function VisitRequest({ postId, user }: { postId: number; user: any }) {
  const [visits, setVisits] = useState<any[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    visitDate: "",
    visitTime: "",
    contactPhone: user?.mobile ?? "",
    people: "1",
    message: "",
  });

  useEffect(() => {
    getMyVisitRequests(postId)
      .then(setVisits)
      .catch(() => setVisits([]));
  }, [postId]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.visitDate || !form.visitTime || !form.contactPhone.trim()) {
      toast.error("Pick a date and time, and give a phone number.");
      return;
    }
    if (new Date(`${form.visitDate}T${form.visitTime}`) < new Date()) {
      toast.error("Pick a visit time in the future.");
      return;
    }
    setSaving(true);
    try {
      const visit = await requestVisit(postId, {
        ...form,
        people: form.people ? Number(form.people) : null,
      });
      setVisits((prev) => [visit, ...(prev ?? [])]);
      setShowForm(false);
      toast.success("Visit requested. GIGFINE will call you to confirm.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to request a visit"));
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id: number) => {
    if (!confirm("Cancel this visit request?")) return;
    try {
      const updated = await cancelVisitRequest(id);
      setVisits((prev) => (prev ?? []).map((v) => (v.id === id ? updated : v)));
      toast.success("Visit request cancelled.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to cancel"));
    }
  };

  if (visits === null) {
    return <div className="flex justify-center py-2"><LoadingSvg /></div>;
  }

  const open = visits.find(isOpen);

  if (open) {
    return (
      <div id="visit" className="rounded-lg border border-secondary/15 bg-secondary/5 p-3 text-sm flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-secondary">Your visit</span>
          <StatusBadge status={open.status} kind="visit" />
        </div>
        <span>{formatVisit(open.visitDate, open.visitTime)}</span>
        {open.adminNote && <span className="text-gray-600">GIGFINE: {open.adminNote}</span>}
        {open.status === "PENDING" && (
          <span className="text-xs text-gray-500">GIGFINE will call {open.contactPhone} to confirm.</span>
        )}
        <button type="button" onClick={() => cancel(open.id)}
          className="self-start text-xs underline text-red-600 cursor-pointer mt-1">
          Cancel visit
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button id="visit" type="button" onClick={() => setShowForm(true)}
        className="btn btn-blue flex items-center justify-center gap-2">
        <FaCalendarCheck /> Request a visit
      </button>
    );
  }

  return (
    <form id="visit" onSubmit={submit} className="rounded-lg border border-secondary/15 p-3 flex flex-col gap-3">
      <span className="font-semibold text-secondary">Request a field visit</span>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Date">
          <input type="date" className={inputClass} min={today()} value={form.visitDate} onChange={set("visitDate")} required />
        </Field>
        <Field label="Time">
          <input type="time" className={inputClass} value={form.visitTime} onChange={set("visitTime")} required />
        </Field>
      </div>
      <div className="grid grid-cols-[1fr_90px] gap-2">
        <Field label="Your phone">
          <input type="tel" className={inputClass} value={form.contactPhone} onChange={set("contactPhone")} required />
        </Field>
        <Field label="People">
          <input type="number" min={1} max={20} className={inputClass} value={form.people} onChange={set("people")} />
        </Field>
      </div>
      <Field label="Message (optional)">
        <textarea className="form-control" rows={2} maxLength={1000} value={form.message} onChange={set("message")}
          placeholder="e.g. I can come in the evening after 5" />
      </Field>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
          {saving ? <>Sending <LoadingSvg /></> : "Send request"}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="btn">Cancel</button>
      </div>
    </form>
  );
}
