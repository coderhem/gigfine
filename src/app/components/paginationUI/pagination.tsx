"use client";

import { useEffect, useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "ellipsis-left" | "ellipsis-right";

// Always show first & last page, plus a window around the current page.
// e.g. 1 2 … 82  |  1 … 9 10 11 … 82  |  1 … 81 82
function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  const items: PageItem[] = [1];

  if (start > 2) items.push("ellipsis-left");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis-right");

  items.push(total);
  return items;
}

const baseBtn =
  "h-10 min-w-10 px-3 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState(String(currentPage));

  // Keep the "Go to" box in sync when the page changes elsewhere
  useEffect(() => {
    setJumpValue(String(currentPage));
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages);
    if (target !== currentPage) onPageChange(target);
  };

  const handleJump = () => {
    const num = parseInt(jumpValue, 10);
    if (Number.isNaN(num)) {
      setJumpValue(String(currentPage));
      return;
    }
    const target = Math.min(Math.max(1, num), totalPages);
    setJumpValue(String(target));
    goTo(target);
  };

  const items = getPageItems(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3"
    >
      <div className="flex items-center gap-2">
        {/* Previous */}
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${baseBtn} border-gray-300 bg-white text-gray-800 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300 disabled:hover:border-gray-200 disabled:hover:text-gray-300`}
        >
          ← Prev
        </button>

        {/* Page numbers */}
        {items.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              type="button"
              onClick={() => goTo(item)}
              aria-current={item === currentPage ? "page" : undefined}
              className={`${baseBtn} ${
                item === currentPage
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 bg-white text-gray-800 hover:border-primary hover:text-primary"
              }`}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              className="px-1 text-sm text-gray-400 select-none"
              aria-hidden="true"
            >
              …
            </span>
          )
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${baseBtn} border-gray-300 bg-white text-gray-800 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300 disabled:hover:border-gray-200 disabled:hover:text-gray-300`}
        >
          Next →
        </button>
      </div>

      {/* Divider */}
      <span className="hidden h-8 w-px bg-gray-200 sm:block" />

      {/* Jump to page */}
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleJump();
        }}
      >
        <label
          htmlFor="pagination-goto"
          className="text-sm font-medium text-gray-400"
        >
          Go to
        </label>
        <input
          id="pagination-goto"
          type="number"
          inputMode="numeric"
          min={1}
          max={totalPages}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          className="h-10 w-16 rounded-lg border border-gray-300 bg-white text-center text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Go
        </button>
        <span className="text-sm text-gray-400">of {totalPages}</span>
      </form>
    </nav>
  );
}
