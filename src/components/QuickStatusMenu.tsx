"use client";

import React from "react";
import { Lead, LeadStatus } from "@/lib/types";
import { STATUS_LIST, STATUS_CONFIG } from "@/lib/statuses";
import { Check, X } from "lucide-react";

interface QuickStatusMenuProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectStatus: (lead: Lead, status: LeadStatus) => void;
}

export function QuickStatusMenu({
  lead,
  isOpen,
  onClose,
  onSelectStatus,
}: QuickStatusMenuProps) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-sm bg-white rounded-t-[24px] sm:rounded-[24px] p-5 shadow-2xl z-10 animate-slide-up">
        <div className="flex items-center justify-between pb-3 border-b border-[#edf0f4]">
          <div>
            <h3 className="text-[15px] font-[750] text-[#172033]">Update Status</h3>
            <p className="text-[11px] text-[#7d8593] mt-0.5">
              {lead.name ? `${lead.name} (${lead.phone})` : lead.phone}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9aa2af] hover:text-[#172033] rounded-full hover:bg-[#f5f6f8] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-3">
          {STATUS_LIST.map((status) => {
            const meta = STATUS_CONFIG[status];
            const isCurrent = lead.status === status;

            return (
              <button
                key={status}
                onClick={() => {
                  onSelectStatus(lead, status);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-[13px] border transition text-left cursor-pointer active:scale-[0.99] ${
                  isCurrent
                    ? `${meta.badgeBg} ${meta.badgeText} border-current/30 font-bold`
                    : "bg-[#f9fafb] hover:bg-[#f0f2f5] border-transparent text-[#2d3545]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${meta.indicator}`} />
                  <span className="text-[13px] font-[650]">{meta.label}</span>
                  <span className="text-[10px] text-[#858d9b] font-normal">
                    (moves to tab &apos;{meta.tab}&apos;)
                  </span>
                </div>
                {isCurrent && <Check className="w-4 h-4 shrink-0 text-current stroke-[2.5]" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#f1f3f6] hover:bg-[#e7e9ee] text-[#4f5868] text-[12px] font-[650] rounded-[11px] transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
