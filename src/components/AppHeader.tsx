"use client";

import React from "react";
import { Plus, RotateCw, Menu } from "lucide-react";
import { Lead } from "@/lib/types";
import { isFollowUpStatus } from "@/lib/statuses";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  leads?: Lead[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onOpenAdd: () => void;
  onOpenSidebar: () => void;
  showSummary?: boolean;
}

export function AppHeader({
  title = "Leads",
  subtitle = "Manage and follow up with your leads",
  leads = [],
  isLoading = false,
  onRefresh,
  onOpenAdd,
  onOpenSidebar,
  showSummary = true,
}: AppHeaderProps) {
  // Counts
  const totalCount = leads.length;

  const followUpCount = leads.filter(
    (l) =>
      isFollowUpStatus(l.status) ||
      (l.nextFollowUp && l.status !== "Interested" && l.status !== "Not interested")
  ).length;

  const interestedCount = leads.filter((l) => l.status === "Interested").length;

  return (
    <header className="bg-white px-[16px] pt-[36px] sm:pt-[42px] pb-[15px] border-b border-[#e7e9ee] shrink-0 select-none">
      <div className="flex items-center justify-between gap-3">
        {/* LEFT: Menu button & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onOpenSidebar}
            aria-label="Open menu drawer"
            className="w-[38px] h-[38px] grid place-items-center bg-[#f7f8fa] hover:bg-[#edf0f4] active:scale-90 border border-[#e1e4ea] rounded-[12px] text-[#172033] shadow-2xs transition cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] sm:text-[22px] font-[750] tracking-[-0.5px] text-[#172033] leading-tight truncate">
                {title}
              </h1>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  title="Refresh leads from Google Sheet"
                  className="text-[#9aa2af] hover:text-[#172033] p-1 rounded-full transition active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${
                      isLoading ? "animate-spin text-blue-600" : ""
                    }`}
                  />
                </button>
              )}
            </div>
            <div className="text-[11.5px] text-[#7a8291] mt-[2px] font-normal truncate">
              {subtitle}
            </div>
          </div>
        </div>

        {/* RIGHT: Add Button */}
        <button
          onClick={onOpenAdd}
          aria-label="Add new lead"
          className="w-[38px] h-[38px] grid place-items-center bg-white hover:bg-[#f7f8fa] active:scale-90 border border-[#e1e4ea] rounded-[12px] text-[20px] text-[#172033] shadow-2xs transition cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* SUMMARY STATS BAR */}
      {showSummary && (
        <div className="flex gap-[9px] mt-[15px]">
          <div className="flex-1 py-[9px] px-[10px] bg-[#f5f6f8] rounded-[12px] border border-[#eef0f4]/80">
            <strong className="block text-[16px] font-[750] text-[#172033] leading-none">
              {isLoading && totalCount === 0 ? "..." : totalCount}
            </strong>
            <span className="block mt-[3px] text-[10px] text-[#7b8391] font-medium leading-none">
              Total Leads
            </span>
          </div>

          <div className="flex-1 py-[9px] px-[10px] bg-[#f5f6f8] rounded-[12px] border border-[#eef0f4]/80">
            <strong className="block text-[16px] font-[750] text-[#b76b00] leading-none">
              {isLoading && totalCount === 0 ? "..." : followUpCount}
            </strong>
            <span className="block mt-[3px] text-[10px] text-[#7b8391] font-medium leading-none">
              Follow-ups
            </span>
          </div>

          <div className="flex-1 py-[9px] px-[10px] bg-[#f5f6f8] rounded-[12px] border border-[#eef0f4]/80">
            <strong className="block text-[16px] font-[750] text-[#168148] leading-none">
              {isLoading && totalCount === 0 ? "..." : interestedCount}
            </strong>
            <span className="block mt-[3px] text-[10px] text-[#7b8391] font-medium leading-none">
              Interested
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
