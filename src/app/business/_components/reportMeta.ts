import { REPORT_STATUS_LABEL } from "@/api/problem";

// Shared by the business report list and the report detail page

export const STATUS_LABEL = REPORT_STATUS_LABEL as Record<string, string>;

export const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

// Report.reporterMode values (backend spells passenger "PESSENGER")
export const MODE_LABEL: Record<string, string> = {
  RIDER: "Rider",
  PESSENGER: "Passenger",
};

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-";
