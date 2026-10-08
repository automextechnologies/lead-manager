"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lead, LeadStatus } from "@/lib/types";
import { STATUS_LIST, STATUS_CONFIG } from "@/lib/statuses";
import {
  X,
  Layers,
  Clock,
  CheckCircle2,
  Settings,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  leads?: Lead[];
  selectedStatus?: LeadStatus | "all";
  onSelectStatus?: (status: LeadStatus | "all") => void;
}

export function Sidebar({
  isOpen,
  onClose,
  leads = [],
  selectedStatus = "all",
  onSelectStatus,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Compute status counts
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

  // Follow-up count
  const [todayStr, setTodayStr] = React.useState("");
  React.useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  const followUpCount = leads.filter(
    (l) =>
      ["call later", "deciding", "not responded"].includes(l.status) ||
      (todayStr && l.nextFollowUp && l.status !== "Interested" && l.status !== "Not interested")
  ).length;

  const handleStatusClick = (status: LeadStatus | "all") => {
    if (onSelectStatus) {
      onSelectStatus(status);
    }
    if (pathname !== "/") {
      router.push("/");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-[300px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-right select-none">
        {/* SIDEBAR HEADER */}
        <div className="p-5 pt-8 bg-[#172033] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-lg shadow-sm">
              E
            </div>
            <div>
              <h2 className="text-[16px] font-[750] leading-tight">Eldroplus</h2>
              <p className="text-[11px] text-white/70">Lead Management PWA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIDEBAR BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 smooth-scroll">
          {/* 1. STATUS OPTIONS SECTION */}
          <div>
            <div className="px-2 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#8a92a0] uppercase tracking-wider">
                Filter By Status
              </span>
              <span className="text-[10px] text-[#9aa2af] font-semibold">
                {leads.length} Total
              </span>
            </div>

            <div className="space-y-1">
              {/* "All Leads" status option */}
              <button
                onClick={() => handleStatusClick("all")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-left transition cursor-pointer active:scale-[0.98] ${
                  pathname === "/" && selectedStatus === "all"
                    ? "bg-[#172033] text-white font-[700] shadow-xs"
                    : "text-[#343d4d] hover:bg-[#f3f5f8] font-[600]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      pathname === "/" && selectedStatus === "all"
                        ? "bg-white"
                        : "bg-[#172033]"
                    }`}
                  />
                  <span className="text-[13px]">All Leads</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    pathname === "/" && selectedStatus === "all"
                      ? "bg-white/20 text-white"
                      : "bg-[#edf0f4] text-[#636c7c]"
                  }`}
                >
                  {counts.all}
                </span>
              </button>

              {/* 6 Individual Status Options */}
              {STATUS_LIST.map((status) => {
                const meta = STATUS_CONFIG[status];
                const isSelected = pathname === "/" && selectedStatus === status;
                const count = counts[status] || 0;

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusClick(status)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-left transition cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? "bg-[#172033] text-white font-[700] shadow-xs"
                        : "text-[#343d4d] hover:bg-[#f3f5f8] font-[600]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          isSelected ? "bg-white" : meta.indicator
                        }`}
                      />
                      <span className="text-[13px]">{meta.label}</span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : `${meta.badgeBg} ${meta.badgeText}`
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. VIEWS NAVIGATION SECTION */}
          <div className="pt-2 border-t border-[#edf0f4]">
            <div className="px-2 mb-2">
              <span className="text-[10px] font-bold text-[#8a92a0] uppercase tracking-wider">
                App Sections
              </span>
            </div>

            <div className="space-y-1">
              <Link
                href="/"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition ${
                  pathname === "/" && selectedStatus === "all"
                    ? "bg-[#f0f3f8] text-[#172033] font-bold"
                    : "text-[#4c5564] hover:bg-[#f6f7f9] font-[600]"
                }`}
              >
                <div className="flex items-center gap-2.5 text-[13px]">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Leads Directory</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#a0a8b5]" />
              </Link>

              <Link
                href="/follow-ups"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition ${
                  pathname === "/follow-ups"
                    ? "bg-[#f0f3f8] text-[#172033] font-bold"
                    : "text-[#4c5564] hover:bg-[#f6f7f9] font-[600]"
                }`}
              >
                <div className="flex items-center gap-2.5 text-[13px]">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Follow-ups Hub</span>
                </div>
                {followUpCount > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {followUpCount}
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#a0a8b5]" />
                )}
              </Link>

              <Link
                href="/closed"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition ${
                  pathname === "/closed"
                    ? "bg-[#f0f3f8] text-[#172033] font-bold"
                    : "text-[#4c5564] hover:bg-[#f6f7f9] font-[600]"
                }`}
              >
                <div className="flex items-center gap-2.5 text-[13px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Closed Leads</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#a0a8b5]" />
              </Link>

              <Link
                href="/settings"
                onClick={onClose}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] transition ${
                  pathname === "/settings"
                    ? "bg-[#f0f3f8] text-[#172033] font-bold"
                    : "text-[#4c5564] hover:bg-[#f6f7f9] font-[600]"
                }`}
              >
                <div className="flex items-center gap-2.5 text-[13px]">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span>Settings &amp; PWA</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#a0a8b5]" />
              </Link>
            </div>
          </div>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#edf0f4] shrink-0">
          <div className="flex items-center justify-between text-[11px] text-[#7d8593]">
            <span>Google Sheet Sync</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
