"use client";

import React, { useState, useMemo } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { LeadCard } from "@/components/LeadCard";
import { LeadFormSheet } from "@/components/LeadFormSheet";
import { QuickStatusMenu } from "@/components/QuickStatusMenu";
import { BottomNav } from "@/components/BottomNav";
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useQuickUpdateStatus,
  useDeleteLead,
} from "@/hooks/useLeads";
import { Lead, LeadStatus } from "@/lib/types";
import { isFollowUpStatus } from "@/lib/statuses";
import { Clock, AlertTriangle, CalendarCheck, Calendar } from "lucide-react";

export default function FollowUpsPage() {
  const { data: leads = [], isLoading, refetch, isFetching } = useLeads();

  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const quickStatusMutation = useQuickUpdateStatus();
  const deleteMutation = useDeleteLead();

  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [quickStatusLead, setQuickStatusLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<"overdue" | "today" | "upcoming" | "all">("all");
  const [todayStr, setTodayStr] = useState("");

  React.useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  // Partition follow-ups
  const categorized = useMemo(() => {
    const overdue: Lead[] = [];
    const today: Lead[] = [];
    const upcoming: Lead[] = [];
    const unscheduled: Lead[] = [];

    if (!todayStr) {
      return { overdue, today, upcoming, unscheduled };
    }

    leads.forEach((l) => {
      // Exclude closed leads
      if (l.status === "Interested" || l.status === "Not interested") return;

      const hasDate = Boolean(l.nextFollowUp && l.nextFollowUp.trim().length > 0);

      if (hasDate) {
        if (l.nextFollowUp! < todayStr) {
          overdue.push(l);
        } else if (l.nextFollowUp! === todayStr) {
          today.push(l);
        } else {
          upcoming.push(l);
        }
      } else if (isFollowUpStatus(l.status)) {
        unscheduled.push(l);
      }
    });

    // Sort by followup date
    overdue.sort((a, b) => (a.nextFollowUp || "").localeCompare(b.nextFollowUp || ""));
    upcoming.sort((a, b) => (a.nextFollowUp || "").localeCompare(b.nextFollowUp || ""));

    return { overdue, today, upcoming, unscheduled };
  }, [leads, todayStr]);

  const displayedLeads = useMemo(() => {
    if (activeTab === "overdue") return categorized.overdue;
    if (activeTab === "today") return categorized.today;
    if (activeTab === "upcoming") return categorized.upcoming;
    return [
      ...categorized.overdue,
      ...categorized.today,
      ...categorized.upcoming,
      ...categorized.unscheduled,
    ];
  }, [categorized, activeTab]);

  return (
    <PhoneFrame>
      <AppHeader
        title="Follow-ups"
        subtitle="Manage upcoming calls & inquiries"
        leads={leads}
        isLoading={isFetching}
        onRefresh={() => refetch()}
        onOpenAdd={() => {
          setLeadToEdit(null);
          setFormSheetOpen(true);
        }}
        showSummary={false}
      />

      {/* FILTER TABS */}
      <div className="px-3 pt-3 pb-2 bg-[#f7f8fa] flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-[650] transition cursor-pointer ${
            activeTab === "all"
              ? "bg-[#172033] text-white shadow-xs"
              : "bg-white text-[#636c7c] border border-[#e1e4e9]"
          }`}
        >
          All ({categorized.overdue.length + categorized.today.length + categorized.upcoming.length + categorized.unscheduled.length})
        </button>

        {categorized.overdue.length > 0 && (
          <button
            onClick={() => setActiveTab("overdue")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-[650] transition flex items-center gap-1 cursor-pointer ${
              activeTab === "overdue"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Overdue ({categorized.overdue.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab("today")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-[650] transition flex items-center gap-1 cursor-pointer ${
            activeTab === "today"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          <Clock className="w-3 h-3" />
          Today ({categorized.today.length})
        </button>

        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-[650] transition flex items-center gap-1 cursor-pointer ${
            activeTab === "upcoming"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          <Calendar className="w-3 h-3" />
          Upcoming ({categorized.upcoming.length})
        </button>
      </div>

      {/* LIST */}
      <main className="flex-1 overflow-y-auto px-[12px] pt-[7px] pb-[85px] smooth-scroll">
        {isLoading && leads.length === 0 ? (
          <div className="p-4 text-center text-[#7d8593] text-xs">Loading follow-ups...</div>
        ) : displayedLeads.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CalendarCheck className="w-12 h-12 text-[#9aa2af] mx-auto mb-2 stroke-[1.5]" />
            <p className="text-[14px] font-[650] text-[#4b5565]">No pending follow-ups</p>
            <p className="text-[11px] text-[#828c9b] mt-1">
              All leads are up to date! Great job.
            </p>
          </div>
        ) : (
          displayedLeads.map((lead) => (
            <LeadCard
              key={lead.phone}
              lead={lead}
              onEdit={(l) => {
                setLeadToEdit(l);
                setFormSheetOpen(true);
              }}
              onStatusClick={(l) => setQuickStatusLead(l)}
            />
          ))
        )}
      </main>

      <BottomNav />

      <LeadFormSheet
        isOpen={formSheetOpen}
        onClose={() => setFormSheetOpen(false)}
        leadToEdit={leadToEdit}
        onSubmit={async (data, orig) => {
          if (orig) {
            await updateMutation.mutateAsync({ phone: orig, updatedFields: data });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
        onDelete={async (phone) => {
          await deleteMutation.mutateAsync(phone);
        }}
      />

      <QuickStatusMenu
        isOpen={Boolean(quickStatusLead)}
        lead={quickStatusLead}
        onClose={() => setQuickStatusLead(null)}
        onSelectStatus={(lead, newStatus) => {
          quickStatusMutation.mutate({ phone: lead.phone, newStatus });
        }}
      />
    </PhoneFrame>
  );
}
