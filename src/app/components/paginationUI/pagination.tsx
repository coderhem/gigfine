"use client";

import { MdArrowCircleRight, MdArrowRightAlt, MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, startPage + 2);

  // If we are near the last page
  if (endPage - startPage < 2) {
    startPage = Math.max(1, endPage - 2);
  }

  const pages = [];

  for (let page = startPage; page <= endPage; page++) {
    pages.push(page);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border btn disabled:opacity-50 focus:ring-0"
      >
         <MdOutlineKeyboardArrowLeft/>
      </button>

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn px-3 py-2 ${
            currentPage === page
              ? "bg-secondary text-white"
              : "bg-white"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border btn disabled:opacity-50 focus:ring-0"
      >
        <MdOutlineKeyboardArrowRight/>
      </button>
    </div>
  );
}