"use client";

import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenFilter: () => void;
  hasActiveFilters?: boolean;
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  onOpenFilter,
  hasActiveFilters = false,
}: ToolbarProps) {
  return (
    <div className="flex gap-[8px] px-[15px] pt-[12px] pb-[8px] bg-[#f7f8fa] shrink-0">
      <div className="flex-1 h-[39px] flex items-center px-[11px] bg-white border border-[#e1e4e9] rounded-[11px] text-[12px] text-[#172033] shadow-2xs focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
        <Search className="w-3.5 h-3.5 text-[#89919f] shrink-0 mr-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search leads, phone or name"
          className="w-full bg-transparent border-none outline-none text-[#172033] placeholder-[#89919f] text-[12px]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="text-[#9aa2af] hover:text-[#172033] p-1 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <button
        onClick={onOpenFilter}
        aria-label="Filter and Sort"
        className={`w-[42px] h-[39px] grid place-items-center bg-white border rounded-[11px] text-[17px] shadow-2xs active:scale-95 transition relative cursor-pointer ${
          hasActiveFilters ? "border-blue-500 text-blue-600 bg-blue-50/30" : "border-[#e1e4e9] text-[#4b5362] hover:bg-[#fafbfc]"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        {hasActiveFilters && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        )}
      </button>
    </div>
  );
}
