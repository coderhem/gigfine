"use client";

import { APPROVAL_BADGE, APPROVAL_LABEL, POST_STATUS_BADGE, POST_STATUS_LABEL } from "@/api/rental";
import type { ReactNode } from "react";

const APPROVAL = { label: APPROVAL_LABEL as Record<string, string>, badge: APPROVAL_BADGE as Record<string, string> };
const POST = { label: POST_STATUS_LABEL as Record<string, string>, badge: POST_STATUS_BADGE as Record<string, string> };

export function StatusBadge({ status, kind = "approval" }: { status: string; kind?: "approval" | "post" }) {
  const map = kind === "post" ? POST : APPROVAL;
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${map.badge[status] ?? "bg-secondary/10"}`}>
      {map.label[status] ?? status}
    </span>
  );
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="font-medium text-secondary">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

// Single choice (value) or several (values) from an enum label map
export function Pills({
  options,
  value,
  values,
  onChange,
  onToggle,
  allowEmpty,
}: {
  options: Record<string, string>;
  value?: string;
  values?: string[];
  onChange?: (v: string) => void;
  onToggle?: (v: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(options).map(([key, label]) => {
        const active = values ? values.includes(key) : value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => (onToggle ? onToggle(key) : onChange?.(active && allowEmpty ? "" : key))}
            className={`rounded-full px-3 py-1.5 text-sm border cursor-pointer transition ${
              active ? "bg-secondary text-white border-secondary" : "bg-white text-secondary border-gray-300 hover:border-secondary"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export const inputClass = "form-control py-2! h-11!";

export const formatRent = (rent?: number | null) =>
  rent == null ? "-" : `Rs. ${rent.toLocaleString("en-IN")}`;

export const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "-");
