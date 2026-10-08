"use client";

import React from "react";
import { FilterOptions, SortOption } from "@/lib/types";
import { STATUS_LIST, STATUS_CONFIG } from "@/lib/statuses";
import { X, RotateCcw } from "lucide-react";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (newFilters: FilterOptions) => void;
  assignees: string[];
}

export function FilterSheet({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  assignees,
}: FilterSheetProps) {
  if (!isOpen) return null;

  const handleReset = () => {
    onFiltersChange({
      search: filters.search,
      status: "all",
      assigned: "all",
      hasFollowUpOnly: false,
      sortBy: "date-desc",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-t-[26px] sm:rounded-[26px] p-5 shadow-2xl z-10 animate-slide-up space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-[#edf0f4]">
          <h3 className="text-[16px] font-[750] text-[#172033]">Filter & Sort</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 p-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#9aa2af] hover:text-[#172033] rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SORT BY */}
        <div>
          <label className="block text-[11px] font-[650] text-[#7d8593] uppercase tracking-wider mb-2">
            Sort Leads By
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "date-desc", label: "Date: Newest first" },
              { id: "date-asc", label: "Date: Oldest first" },
              { id: "followup-asc", label: "Follow-up: Soonest" },
              { id: "name-asc", label: "Name: A → Z" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onFiltersChange({ ...filters, sortBy: opt.id as SortOption })
                }
                className={`py-2 px-2.5 rounded-[10px] text-[11.5px] font-[650] border text-center transition cursor-pointer ${
                  filters.sortBy === opt.id
                    ? "bg-[#172033] text-white border-[#172033]"
                    : "bg-[#f8fafc] text-[#4b5565] border-[#e2e8f0] hover:bg-[#edf2f7]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ASSIGNED FILTER */}
        <div>
          <label className="block text-[11px] font-[650] text-[#7d8593] uppercase tracking-wider mb-2">
            Assigned User
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, assigned: "all" })}
              className={`px-3 py-1.5 rounded-full text-[11px] font-[650] border cursor-pointer transition ${
                filters.assigned === "all"
                  ? "bg-[#172033] text-white border-[#172033]"
                  : "bg-[#f8fafc] text-[#4b5565] border-[#e2e8f0]"
              }`}
            >
              All Users
            </button>
            {assignees.map((user) => (
              <button
                key={user}
                type="button"
                onClick={() => onFiltersChange({ ...filters, assigned: user })}
                className={`px-3 py-1.5 rounded-full text-[11px] font-[650] border cursor-pointer transition ${
                  filters.assigned === user
                    ? "bg-[#172033] text-white border-[#172033]"
                    : "bg-[#f8fafc] text-[#4b5565] border-[#e2e8f0]"
                }`}
              >
                {user || "Unassigned"}
              </button>
            ))}
          </div>
        </div>

        {/* HAS FOLLOW UP ONLY TOGGLE */}
        <div className="pt-2">
          <label className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-[12px] border border-[#e2e8f0] cursor-pointer">
            <span className="text-[12px] font-[650] text-[#172033]">
              Only leads with Next Follow-up
            </span>
            <input
              type="checkbox"
              checked={filters.hasFollowUpOnly}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  hasFollowUpOnly: e.target.checked,
                })
              }
              className="w-4 h-4 text-blue-600 rounded-sm focus:ring-blue-500"
            />
          </label>
        </div>

        {/* APPLY BUTTON */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#172033] text-white text-[13px] font-[700] rounded-[12px] shadow-sm transition active:scale-95 cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
