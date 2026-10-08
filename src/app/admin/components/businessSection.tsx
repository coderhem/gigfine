"use client";

import {
  getBusinessDocUrlAdmin,
  searchBusinesses,
  updateBusinessStatus,
} from "@/api/admin";
import { BUSINESS_STATUS_LABEL } from "@/api/business";
import { apiErrorMessage } from "@/api/config";
import LoadingSvg from "@/app/components/loader/loadingSvg";
import Pagination from "@/app/components/paginationUI/pagination";
import { Fancybox as NativeFancybox } from "@fancyapps/ui";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const PER_PAGE = 10;

const STATUS_LABEL = BUSINESS_STATUS_LABEL as Record<string, string>;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
};

// Must match SORT_FIELDS in BusinessServiceImpl
const SORT_OPTIONS: Record<string, string> = {
  createdAt: "Applied date",
  approvedAt: "Approved date",
  name: "Business name",
  mobile: "Phone",
  registrationNo: "Registration No.",
  panNo: "PAN/VAT No.",
  ownerName: "Owner name",
  status: "Status",
};

const EMPTY_FILTERS = {
  status: "",
  name: "",
  mobile: "",
  registrationNo: "",
  panNo: "",
  sortBy: "createdAt",
  direction: "desc",
};

// Shows a registration certificate / PAN image in a lightbox (has a close button).
// type "image" is needed because a blob: URL has no file extension.
async function openDocument(fileName: string) {
  try {
    const url = await getBusinessDocUrlAdmin(fileName);
    NativeFancybox.show([{ src: url, type: "image" }], {
      on: { destroy: () => URL.revokeObjectURL(url) },
    });
  } catch (err) {
    toast.error(apiErrorMessage(err, "Failed to load document"));
  }
}

export default function BusinessSection() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      setBusinesses(await searchBusinesses(filters));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to load businesses"));
    } finally {
      setLoading(false);
    }
  };

  // Text filters hit the backend after a short pause in typing
  useEffect(() => {
    const timer = setTimeout(fetchBusinesses, 400);
    setPage(1);
    return () => clearTimeout(timer);
  }, [filters]);

  const setFilter = (key: keyof typeof EMPTY_FILTERS, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleStatus = async (userId: number, status: string) => {
    try {
      const updated = await updateBusinessStatus(userId, status);
      setBusinesses((prev) => prev.map((b) => (b.userId === userId ? updated : b)));
      toast.success(
        status === "APPROVED"
          ? "Business approved. The user now has the business role."
          : "Business moved back to pending.",
      );
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update status"));
    }
  };

  const textFilter = (key: keyof typeof EMPTY_FILTERS, label: string) => (
    <label className="flex flex-col text-sm">
      {label}
      <input
        type="text"
        className="form-control py-2!"
        value={filters[key]}
        onChange={(e) => setFilter(key, e.target.value)}
      />
    </label>
  );

  const docButton = (fileName: string | null, label: string) =>
    fileName ? (
      <button
        className="text-xs underline text-secondary hover:text-primary cursor-pointer"
        onClick={() => openDocument(fileName)}
      >
        {label}
      </button>
    ) : (
      <span className="text-xs text-gray-400">No {label}</span>
    );

  return (
    <>
      <h1 className="mb-6 pt-24 text-3xl font-bold text-secondary">
        Businesses <span className="text-primary">({businesses.length})</span>
      </h1>

      <div className="mb-4 flex flex-wrap gap-3 items-end bg-white p-4 rounded-xl shadow">
        <label className="flex flex-col text-sm">
          Status
          <select
            className="form-control py-2!"
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
          >
            <option value="">All</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {textFilter("name", "Business name")}
        {textFilter("mobile", "Phone")}
        {textFilter("registrationNo", "Registration No.")}
        {textFilter("panNo", "PAN/VAT No.")}
        <label className="flex flex-col text-sm">
          Sort by
          <select
            className="form-control py-2!"
            value={filters.sortBy}
            onChange={(e) => setFilter("sortBy", e.target.value)}
          >
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          Order
          <select
            className="form-control py-2!"
            value={filters.direction}
            onChange={(e) => setFilter("direction", e.target.value)}
          >
            <option value="desc">Newest / Z-A</option>
            <option value="asc">Oldest / A-Z</option>
          </select>
        </label>
        <button className="btn py-2" onClick={() => setFilters(EMPTY_FILTERS)}>
          Clear
        </button>
      </div>

      <div className="relative rounded-xl bg-white px-3 lg:px-6 pt-6 pb-14 shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full border-collapse text-sm">
            <thead className="bg-secondary/20 text-secondary">
              <tr>
                <th className="px-4 py-3 text-start">S.No.</th>
                <th className="px-4 py-3 text-start">Business</th>
                <th className="px-4 py-3 text-start">Phone</th>
                <th className="px-4 py-3 text-start">Reg. No.</th>
                <th className="px-4 py-3 text-start">PAN/VAT No.</th>
                <th className="px-4 py-3 text-start">Location</th>
                <th className="px-4 py-3 text-start">Owner</th>
                <th className="px-4 py-3 text-start">Documents</th>
                <th className="px-4 py-3 text-start">Applied</th>
                <th className="px-4 py-3 text-start">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-6">
                    <div className="flex justify-center">
                      <LoadingSvg />
                    </div>
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="pt-6 text-center text-gray-500">
                    No businesses found.
                  </td>
                </tr>
              ) : (
                businesses
                  .slice((page - 1) * PER_PAGE, page * PER_PAGE)
                  .map((b, i) => (
                    <tr
                      key={b.id}
                      className="border-b border-secondary/20 hover:bg-gray-300/20"
                    >
                      <td className="px-4 py-3">{(page - 1) * PER_PAGE + i + 1}</td>
                      <td className="px-4 py-3">
                        {b.businessName}
                        <div className="text-xs text-gray-500">{b.email}</div>
                      </td>
                      <td className="px-4 py-3">{b.businessPhone}</td>
                      <td className="px-4 py-3">{b.registrationNo}</td>
                      <td className="px-4 py-3">{b.panNo}</td>
                      <td className="px-4 py-3">{b.businessLocation}</td>
                      <td className="px-4 py-3">
                        {b.ownerName}
                        <div className="text-xs text-gray-500">{b.ownerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {docButton(b.registrationCertImage, "Reg. Certificate")}
                          {docButton(b.panImage, "PAN Card")}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded w-fit ${
                              STATUS_BADGE[b.status] ?? "bg-secondary/10"
                            }`}
                          >
                            {STATUS_LABEL[b.status] ?? b.status}
                          </span>
                          {b.status === "APPROVED" ? (
                            <button
                              className="text-xs underline text-red cursor-pointer w-fit"
                              onClick={() => handleStatus(b.userId, "PENDING")}
                            >
                              Move to pending
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary py-1! px-2! text-xs w-fit"
                              onClick={() => handleStatus(b.userId, "APPROVED")}
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(businesses.length / PER_PAGE)}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  );
}
