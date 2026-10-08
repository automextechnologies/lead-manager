"use client";

import React, { useState, useMemo } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { AppHeader } from "@/components/AppHeader";
import { Toolbar } from "@/components/Toolbar";
import { LeadCard } from "@/components/LeadCard";
import { STATUS_CONFIG } from "@/lib/statuses";
import { LeadFormSheet } from "@/components/LeadFormSheet";
import { QuickStatusMenu } from "@/components/QuickStatusMenu";
import { FilterSheet } from "@/components/FilterSheet";
import { Sidebar } from "@/components/Sidebar";
import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useQuickUpdateStatus,
  useDeleteLead,
} from "@/hooks/useLeads";
import { Lead, LeadStatus, FilterOptions } from "@/lib/types";
import { extractDigits } from "@/lib/phone";
import { AlertCircle, Inbox } from "lucide-react";

export default function LeadsPage() {
  const { data: leads = [], isLoading, isError, error, refetch, isFetching } = useLeads();

  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const quickStatusMutation = useQuickUpdateStatus();
  const deleteMutation = useDeleteLead();

  // Sidebar Drawer State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "all">("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    status: "all",
    assigned: "all",
    hasFollowUpOnly: false,
    sortBy: "date-desc",
  });

  // Modal Sheet State
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  // Quick Status Menu State
  const [quickStatusLead, setQuickStatusLead] = useState<Lead | null>(null);

  // Get unique assignees for filter
  const uniqueAssignees = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.assigned) set.add(l.assigned);
    });
    return Array.from(set);
  }, [leads]);

  // Filter and Sort leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Status pill / sidebar selection filter
        if (selectedStatus !== "all" && lead.status !== selectedStatus) {
          return false;
        }

        // Filter sheet: Assignee
        if (filters.assigned !== "all" && lead.assigned !== filters.assigned) {
          return false;
        }

        // Filter sheet: Has follow up only
        if (filters.hasFollowUpOnly && !lead.nextFollowUp) {
          return false;
        }

        // Search query (matches name or phone digits or notes)
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          const queryDigits = extractDigits(query);
          const nameMatch = lead.name.toLowerCase().includes(query);
          const phoneMatch =
            lead.phone.toLowerCase().includes(query) ||
            (queryDigits.length > 0 && extractDigits(lead.phone).includes(queryDigits));
          const notesMatch = (lead.notes || "").toLowerCase().includes(query);

          if (!nameMatch && !phoneMatch && !notesMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "date-desc") {
          return (b.leadDate || "").localeCompare(a.leadDate || "");
        }
        if (filters.sortBy === "date-asc") {
          return (a.leadDate || "").localeCompare(b.leadDate || "");
        }
        if (filters.sortBy === "followup-asc") {
          if (!a.nextFollowUp) return 1;
          if (!b.nextFollowUp) return -1;
          return a.nextFollowUp.localeCompare(b.nextFollowUp);
        }
        if (filters.sortBy === "name-asc") {
          return (a.name || a.phone).localeCompare(b.name || b.phone);
        }
        return 0;
      });
  }, [leads, selectedStatus, filters, searchQuery]);

  const hasActiveFilters =
    filters.assigned !== "all" ||
    filters.hasFollowUpOnly ||
    filters.sortBy !== "date-desc";

  const handleOpenAdd = () => {
    setLeadToEdit(null);
    setFormSheetOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setLeadToEdit(lead);
    setFormSheetOpen(true);
  };

  const handleStatusClick = (lead: Lead) => {
    setQuickStatusLead(lead);
  };

  const handleFormSubmit = async (leadData: Partial<Lead>, originalPhone?: string) => {
    if (originalPhone) {
      await updateMutation.mutateAsync({
        phone: originalPhone,
        updatedFields: leadData,
      });
    } else {
      await createMutation.mutateAsync(leadData);
    }
  };

  const handleDelete = async (phone: string) => {
    await deleteMutation.mutateAsync(phone);
  };

  const handleQuickStatusChange = (lead: Lead, newStatus: LeadStatus) => {
    quickStatusMutation.mutate({
      phone: lead.phone,
      newStatus,
    });
  };

  return (
    <PhoneFrame>
      {/* 1. HEADER WITH HAMBURGER MENU */}
      <AppHeader
        title="Leads"
        subtitle="Manage and follow up with your leads"
        leads={leads}
        isLoading={isFetching}
        onRefresh={() => refetch()}
        onOpenAdd={handleOpenAdd}
        onOpenSidebar={() => setSidebarOpen(true)}
        showSummary={true}
      />

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenFilter={() => setFilterSheetOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 3. CURRENT STATUS LABEL */}
      <div className="flex items-center justify-between px-[15px] py-2 bg-[#f7f8fa] border-b border-[#eceef2] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#7a8291] font-medium">Status:</span>
          {selectedStatus === "all" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-[700] bg-[#172033] text-white shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              All Leads
              <span className="text-[9.5px] font-bold opacity-80">({leads.length})</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-[700] border ${STATUS_CONFIG[selectedStatus].badgeBg} ${STATUS_CONFIG[selectedStatus].badgeText} ${STATUS_CONFIG[selectedStatus].border} shadow-2xs`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selectedStatus].indicator}`}
              />
              {STATUS_CONFIG[selectedStatus].label}
              <span className="text-[9.5px] font-bold opacity-80">
                ({filteredLeads.length})
              </span>
            </span>
          )}
        </div>

        {selectedStatus !== "all" ? (
          <button
            onClick={() => setSelectedStatus("all")}
            className="text-[11px] text-[#5e6675] hover:text-[#172033] font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Show All</span>
            <span className="text-[12px]">✕</span>
          </button>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
          >
            Filter in Menu
          </button>
        )}
      </div>

      {/* 4. MAIN LEADS LIST (Full height without bottom bar) */}
      <main className="flex-1 overflow-y-auto px-[12px] pt-[7px] pb-6 pb-safe smooth-scroll">
        {isLoading && leads.length === 0 ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 bg-white border border-[#e5e7ec] rounded-[17px] animate-pulse space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded-sm w-1/3" />
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                </div>
                <div className="h-3 bg-gray-100 rounded-sm w-1/2" />
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div className="h-3 bg-gray-100 rounded-sm w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-sm w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-center my-8 bg-red-50/70 border border-red-200 rounded-[20px] mx-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-[14px] font-bold text-red-800">Unable to load leads</h3>
            <p className="text-[12px] text-red-600 mt-1 max-w-xs mx-auto">
              {(error as any)?.message || "Check your internet connection or API deployment"}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-full text-[12px] font-bold shadow-xs transition active:scale-95"
            >
              Retry
            </button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Inbox className="w-10 h-10 text-[#9aa2af] mx-auto mb-2 stroke-[1.5]" />
            <p className="text-[14px] font-[650] text-[#4b5565]">No leads found</p>
            <p className="text-[11px] text-[#828c9b] mt-1">
              {searchQuery || selectedStatus !== "all" || hasActiveFilters
                ? "Try clearing filters or search query"
                : "Tap + in the header to add your first lead"}
            </p>
            {(searchQuery || selectedStatus !== "all" || hasActiveFilters) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                  setFilters({
                    search: "",
                    status: "all",
                    assigned: "all",
                    hasFollowUpOnly: false,
                    sortBy: "date-desc",
                  });
                }}
                className="mt-3 text-[12px] text-blue-600 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.phone}
                lead={lead}
                onEdit={handleEdit}
                onStatusClick={handleStatusClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. EXPANDABLE SIDEBAR DRAWER */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        leads={leads}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      {/* 6. MODALS / DRAWERS */}
      <LeadFormSheet
        isOpen={formSheetOpen}
        onClose={() => setFormSheetOpen(false)}
        leadToEdit={leadToEdit}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
      />

      <QuickStatusMenu
        isOpen={Boolean(quickStatusLead)}
        lead={quickStatusLead}
        onClose={() => setQuickStatusLead(null)}
        onSelectStatus={handleQuickStatusChange}
      />

      <FilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        assignees={uniqueAssignees}
      />
    </PhoneFrame>
  );
}
