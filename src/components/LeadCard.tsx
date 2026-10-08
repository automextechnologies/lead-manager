"use client";

import React from "react";
import { Lead } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/statuses";
import { formatPhoneDisplay, getTelUrl, getWhatsAppUrl } from "@/lib/phone";
import { format, parseISO, isValid } from "date-fns";

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onStatusClick: (lead: Lead) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const trimmed = dateStr.trim();
    if (!trimmed) return "-";
    const parsed = parseISO(trimmed);
    if (isValid(parsed)) {
      return format(parsed, "MMM d, yyyy");
    }
    return trimmed;
  } catch {
    return dateStr;
  }
}

function isOverdue(dateStr?: string, todayStr?: string): boolean {
  if (!dateStr || !todayStr) return false;
  return dateStr < todayStr;
}

function isToday(dateStr?: string, todayStr?: string): boolean {
  if (!dateStr || !todayStr) return false;
  return dateStr === todayStr;
}

export function LeadCard({ lead, onEdit, onStatusClick }: LeadCardProps) {
  const [todayStr, setTodayStr] = React.useState("");

  React.useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  const statusMeta = STATUS_CONFIG[lead.status] || STATUS_CONFIG["new lead"];
  const formattedPhone = formatPhoneDisplay(lead.phone);
  const telUrl = getTelUrl(lead.phone);
  const waUrl = getWhatsAppUrl(lead.phone);

  const hasName = Boolean(lead.name && lead.name.trim().length > 0);
  const displayName = hasName ? lead.name : formattedPhone;

  const overdue = isOverdue(lead.nextFollowUp, todayStr);
  const dueToday = isToday(lead.nextFollowUp, todayStr);

  return (
    <article className="mb-[11px] p-[14px] bg-white border border-[#e5e7ec] rounded-[17px] shadow-[0_3px_12px_rgba(20,30,50,0.045)] transition hover:shadow-[0_5px_16px_rgba(20,30,50,0.08)]">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-[10px]">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-[7px] flex-wrap">
            <h2 className="text-[16px] font-[750] text-[#172033] tracking-tight leading-snug">
              {displayName}
            </h2>
            {!hasName && (
              <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded-sm">
                No Name
              </span>
            )}
            <button
              onClick={() => onEdit(lead)}
              className="py-[2px] px-[4px] bg-transparent border-0 text-[#3168d5] text-[10px] font-[650] hover:underline cursor-pointer transition active:scale-95"
            >
              ✎ Edit
            </button>
          </div>

          <div className="mt-[3px] text-[#7d8593] text-[11px]">
            {lead.age ? `${lead.age} years · ` : ""}
            {lead.assigned ? (
              <>
                Assigned to <b className="text-[#3b4352]">{lead.assigned}</b>
              </>
            ) : (
              <span className="text-[#8c94a2] font-medium">Unassigned</span>
            )}
          </div>
        </div>

        {/* CLICKABLE STATUS BADGE */}
        <button
          onClick={() => onStatusClick(lead)}
          title="Click to update status"
          className={`shrink-0 py-[6px] px-[9px] rounded-full text-[10px] font-[700] border cursor-pointer transition active:scale-95 flex items-center gap-1 ${statusMeta.badgeBg} ${statusMeta.badgeText} ${statusMeta.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.indicator}`} />
          {statusMeta.label}
        </button>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-2 gap-x-[10px] gap-y-[11px] mt-[13px] pt-[12px] border-t border-[#edf0f3]">
        <div className="detail">
          <label className="block mb-[3px] text-[#9299a5] text-[9px] font-[500] uppercase tracking-[0.45px]">
            Phone
          </label>
          <a
            href={telUrl}
            className="text-[11.5px] font-[600] text-[#3168d5] hover:underline block truncate"
          >
            {formattedPhone}
          </a>
        </div>

        <div className="detail">
          <label className="block mb-[3px] text-[#9299a5] text-[9px] font-[500] uppercase tracking-[0.45px]">
            Lead Date
          </label>
          <div className="text-[11.5px] font-[600] text-[#303847] truncate">
            {formatDate(lead.leadDate)}
          </div>
        </div>

        <div className="detail">
          <label className="block mb-[3px] text-[#9299a5] text-[9px] font-[500] uppercase tracking-[0.45px] flex items-center justify-between">
            <span>Next Follow-up</span>
            {overdue && (
              <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1 rounded-xs">
                Overdue
              </span>
            )}
            {dueToday && (
              <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1 rounded-xs">
                Today
              </span>
            )}
          </label>
          <div
            className={`text-[11.5px] font-[600] truncate ${
              overdue
                ? "text-red-600 font-bold"
                : dueToday
                ? "text-amber-700 font-bold"
                : lead.nextFollowUp
                ? "text-[#c66a13]"
                : "text-[#8a929e]"
            }`}
          >
            {formatDate(lead.nextFollowUp)}
          </div>
        </div>

        <div className="detail">
          <label className="block mb-[3px] text-[#9299a5] text-[9px] font-[500] uppercase tracking-[0.45px]">
            Assigned
          </label>
          <div className="text-[11.5px] font-[600] text-[#303847] truncate">
            {lead.assigned || "-"}
          </div>
        </div>
      </div>

      {/* NOTES BLOCK */}
      {lead.notes && lead.notes.trim().length > 0 && (
        <div className="mt-[12px] p-[9px_10px] bg-[#f7f8fa] rounded-[10px] text-[#606978] text-[11px] leading-relaxed break-words whitespace-pre-line border border-[#edf0f4]">
          <strong className="text-[#353d4a]">Note:</strong> {lead.notes}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-[7px] mt-[11px]">
        <a
          href={telUrl}
          className="flex-1 h-[34px] flex items-center justify-center bg-white hover:bg-[#fafbfc] border border-[#e0e4ea] hover:border-[#ccd2dc] rounded-[9px] text-[#4c5564] text-[10px] font-[650] transition active:scale-95 shadow-2xs no-underline"
        >
          ☎ Call
        </a>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-[34px] flex items-center justify-center bg-[#172033] hover:bg-[#252f44] border border-[#172033] rounded-[9px] text-white text-[10px] font-[650] transition active:scale-95 shadow-2xs no-underline"
        >
          WhatsApp
        </a>
      </div>
    </article>
  );
}
