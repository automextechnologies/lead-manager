"use client";

import React from "react";
import { Lead, LeadStatus } from "@/lib/types";
import { STATUS_LIST, STATUS_CONFIG } from "@/lib/statuses";

interface StatusChipsProps {
  selectedStatus: LeadStatus | "all";
  onSelectStatus: (status: LeadStatus | "all") => void;
  leads?: Lead[];
}

export function StatusChips({
  selectedStatus,
  onSelectStatus,
  leads = [],
}: StatusChipsProps) {
  // Count leads per status
  const counts: Record<string, number> = {
    all: leads.length,
  };

  for (const status of STATUS_LIST) {
    counts[status] = 0;
  }

  for (const lead of leads) {
    if (counts[lead.status] !== undefined) {
      counts[lead.status]++;
    }
  }

  return (
    <div className="px-[15px] pb-[8px] bg-[#f7f8fa] overflow-x-auto no-scrollbar shrink-0">
      <div className="flex gap-[6px] items-center min-w-max py-0.5">
        <button
          onClick={() => onSelectStatus("all")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-[650] transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedStatus === "all"
              ? "bg-[#172033] text-white shadow-xs"
              : "bg-white text-[#636c7c] hover:bg-[#eceef2] border border-[#e1e4e9]"
          }`}
        >
          <span>All</span>
          <span
            className={`text-[9.5px] px-1.5 py-0.2 rounded-full ${
              selectedStatus === "all"
                ? "bg-white/20 text-white font-bold"
                : "bg-[#edf0f4] text-[#717a8a]"
            }`}
          >
            {counts.all}
          </span>
        </button>

        {STATUS_LIST.map((status) => {
          const meta = STATUS_CONFIG[status];
          const isSelected = selectedStatus === status;
          const count = counts[status] || 0;

          return (
            <button
              key={status}
              onClick={() => onSelectStatus(status)}
              className={`px-2.5 py-1.5 rounded-full text-[11px] font-[650] transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-[#172033] text-white shadow-xs"
                  : `${meta.badgeBg} ${meta.badgeText} border ${meta.border} hover:opacity-90`
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : meta.indicator}`} />
              <span>{meta.label}</span>
              <span
                className={`text-[9.5px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? "bg-white/20 text-white font-bold"
                    : "bg-black/5 text-current font-bold"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
