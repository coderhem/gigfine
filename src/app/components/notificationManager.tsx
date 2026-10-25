"use client";

import { apiErrorMessage } from "@/api/config";
import { AUDIENCE_LABEL, NOTIFICATION_SORTS } from "@/api/notification";
import DeleteBtn from "@/app/components/crudOperationBtns/deleteBtn";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { MdEdit } from "react-icons/md";

// Same component for the admin dashboard (admin token, sees everything) and the
// business panel (user token, sees only its own) — the caller passes the API calls.
export type NotificationApi = {
  list: (filters: Filters) => Promise<any[]>;
  create: (data: FormState) => Promise<any>;
  update: (id: number, data: FormState) => Promise<any>;
  remove: (id: number) => Promise<void>;
};

type Filters = { audience: string; q: string; from: string; to: string; sort: string };
type FormState = { title: string; message: string; audience: string; expiresAt: string };

const AUDIENCES = AUDIENCE_LABEL as Record<string, string>;
const SORTS = NOTIFICATION_SORTS as Record<string, string>;

export const AUDIENCE_BADGE: Record<string, string> = {
  ALL: "bg-green-100 text-green-800",
  PASSENGER: "bg-primary/15 text-primary",
  RIDER: "bg-secondary/15 text-secondary",
};

const TITLE_MAX = 150;
const MESSAGE_MAX = 2000;

const EMPTY_FORM: FormState = { title: "", message: "", audience: "ALL", expiresAt: "" };
const EMPTY_FILTERS: Filters = { audience: "", q: "", from: "", to: "", sort: "createdAt:desc" };

// "YYYY-MM-DDTHH:mm" in local time, the format <input type="datetime-local"> uses
const toInputDateTime = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-";

type Props = {
  api: NotificationApi;
  // Admin view: show who wrote each notification
  showCreator?: boolean;
  className?: string;
};

export default function NotificationManager({ api, showCreator, className = "" }: Props) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      setNotifications(await api.list(filters));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  // Search runs a moment after typing stops
  useEffect(() => {
    const timer = setTimeout(() => setFilters((f) => ({ ...f, q: query })), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const setFilter = (key: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const setField = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (n: any) => {
    setEditingId(n.id);
    setForm({
      title: n.title,
      message: n.message,
      audience: n.audience,
      // An expired time can't be saved again, so leave it for the user to pick
      expiresAt: n.expiresAt && !n.expired ? n.expiresAt.slice(0, 16) : "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, title: form.title.trim(), message: form.message.trim() };
    if (!data.title || !data.message) {
      toast.error("Title and message are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.update(editingId, data);
        toast.success("Notification updated.");
      } else {
        await api.create(data);
        toast.success(`Notification sent to ${AUDIENCES[data.audience].toLowerCase()}.`);
      }
      resetForm();
      await fetchNotifications();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to save notification"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.remove(id);
      if (editingId === id) resetForm();
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to delete notification"));
    }
  };

  const hasFilters =
    filters.audience || filters.q || filters.from || filters.to || filters.sort !== EMPTY_FILTERS.sort;

  return (
    <div className={`grid lg:grid-cols-5 gap-5 items-start ${className}`}>
      {/* Create / edit */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="lg:col-span-2 lg:sticky lg:top-28 bg-white p-4 md:p-5 rounded-xl shadow flex flex-col gap-4 scroll-mt-28"
      >
        <div>
          <h3 className="h5 mb-1">{editingId ? "Edit notification" : "New notification"}</h3>
          <p className="text-sm text-gray-500 mb-0">
            Shows in the notification bell of everyone in the chosen group.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            type="text"
            className="form-control py-2!"
            placeholder="e.g. Service update"
            maxLength={TITLE_MAX}
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Message
          <textarea
            className="form-control min-h-32"
            placeholder="Write the notification here"
            maxLength={MESSAGE_MAX}
            value={form.message}
            onChange={(e) => setField("message", e.target.value)}
          />
          <span className="text-xs text-gray-400 text-end">
            {form.message.length}/{MESSAGE_MAX}
          </span>
        </label>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1">Send to</legend>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(AUDIENCES).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setField("audience", value)}
                className={`rounded-lg px-2 py-2 border cursor-pointer transition ${
                  form.audience === value
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-secondary border-gray-300 hover:border-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          Expires (optional)
          <input
            type="datetime-local"
            className="form-control py-2!"
            min={toInputDateTime(new Date())}
            value={form.expiresAt}
            onChange={(e) => setField("expiresAt", e.target.value)}
          />
          <span className="text-xs text-gray-400">Hidden from users after this time. Empty = never.</span>
        </label>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary py-2 flex-1" disabled={saving}>
            {saving ? <LoadingSvg /> : editingId ? "Save changes" : "Send notification"}
          </button>
          {editingId && (
            <button type="button" className="btn py-2" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="lg:col-span-3 flex flex-col gap-3">
        <div className="bg-white p-3 rounded-xl shadow grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <input
            type="text"
            placeholder="Search title or message..."
            className="form-control py-2! sm:col-span-2 md:col-span-3"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="form-control py-2!"
            value={filters.audience}
            onChange={(e) => setFilter("audience", e.target.value)}
          >
            <option value="">All audiences</option>
            {Object.entries(AUDIENCES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="form-control py-2!"
            value={filters.sort}
            onChange={(e) => setFilter("sort", e.target.value)}
          >
            {Object.entries(SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="flex gap-2 sm:col-span-2 md:col-span-1">
            <input
              type="date"
              aria-label="Created from"
              className="form-control py-2! min-w-0"
              value={filters.from}
              onChange={(e) => setFilter("from", e.target.value)}
            />
            <input
              type="date"
              aria-label="Created to"
              className="form-control py-2! min-w-0"
              value={filters.to}
              onChange={(e) => setFilter("to", e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center sm:col-span-2 md:col-span-3 text-gray-500">
            <span>{loading ? "Loading..." : `${notifications.length} notification(s)`}</span>
            {hasFilters && (
              <button
                type="button"
                className="underline cursor-pointer"
                onClick={() => {
                  setQuery("");
                  setFilters(EMPTY_FILTERS);
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <LoadingSvg />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            {hasFilters ? "No notifications match these filters." : "No notifications yet."}
          </div>
        ) : (
          notifications.map((n) => (
            <article
              key={n.id}
              className={`bg-white rounded-xl shadow p-4 border-l-4 ${
                editingId === n.id ? "border-primary" : n.expired ? "border-gray-300" : "border-secondary"
              } ${n.expired ? "opacity-70" : ""}`}
            >
              <div className="flex gap-3 items-start justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    <h4 className="font-semibold text-secondary mb-0 break-words">{n.title}</h4>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        AUDIENCE_BADGE[n.audience] ?? "bg-secondary/10"
                      }`}
                    >
                      {AUDIENCES[n.audience] ?? n.audience}
                    </span>
                    {n.expired && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                        Expired
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-line break-words mb-2">{n.message}</p>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Sent {formatDate(n.createdAt)}</span>
                    {n.updatedAt && n.updatedAt !== n.createdAt && <span>Edited {formatDate(n.updatedAt)}</span>}
                    {n.expiresAt && <span>Expires {formatDate(n.expiresAt)}</span>}
                    {showCreator && (
                      <span>
                        By {n.createdByName}
                        {n.senderName !== "GIGFINE" && " (business)"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title="Edit"
                    className="text-secondary hover:text-primary cursor-pointer p-1"
                    onClick={() => startEdit(n)}
                  >
                    <MdEdit size={22} />
                  </button>
                  <DeleteBtn
                    deleteIcon
                    className="text-2xl!"
                    confirmTitle="Delete notification?"
                    onConfirm={() => handleDelete(n.id)}
                  />
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
