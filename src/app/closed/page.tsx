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
import { Lead } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

export default function ClosedLeadsPage() {
  const { data: leads = [], isLoading, refetch, isFetching } = useLeads();

  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const quickStatusMutation = useQuickUpdateStatus();
  const deleteMutation = useDeleteLead();

  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [quickStatusLead, setQuickStatusLead] = useState<Lead | null>(null);

  const [tab, setTab] = useState<"interested" | "not_interested">("interested");

  const interestedLeads = useMemo(
    () => leads.filter((l) => l.status === "Interested"),
    [leads]
  );

  const notInterestedLeads = useMemo(
    () => leads.filter((l) => l.status === "Not interested"),
    [leads]
  );

  const displayedLeads = tab === "interested" ? interestedLeads : notInterestedLeads;

  return (
    <PhoneFrame>
      <AppHeader
        title="Closed Leads"
        subtitle="Finalized deals and rejected inquiries"
        leads={leads}
        isLoading={isFetching}
        onRefresh={() => refetch()}
        onOpenAdd={() => {
          setLeadToEdit(null);
          setFormSheetOpen(true);
        }}
        showSummary={false}
      />

      {/* TWO-WAY TOGGLE */}
      <div className="p-3 bg-[#f7f8fa] shrink-0">
        <div className="grid grid-cols-2 p-1 bg-[#e7ebf0] rounded-[13px] gap-1">
          <button
            onClick={() => setTab("interested")}
            className={`py-2 px-3 rounded-[10px] text-[12px] font-[700] transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === "interested"
                ? "bg-white text-[#168148] shadow-xs"
                : "text-[#626c7d] hover:text-[#172033]"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#168148]" />
            <span>Interested</span>
            <span className="text-[10px] bg-[#e9f8ef] text-[#168148] px-1.5 py-0.2 rounded-full font-bold">
              {interestedLeads.length}
            </span>
          </button>

          <button
            onClick={() => setTab("not_interested")}
            className={`py-2 px-3 rounded-[10px] text-[12px] font-[700] transition flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === "not_interested"
                ? "bg-white text-[#c23b3b] shadow-xs"
                : "text-[#626c7d] hover:text-[#172033]"
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-[#c23b3b]" />
            <span>Not Interested</span>
            <span className="text-[10px] bg-[#fdecec] text-[#c23b3b] px-1.5 py-0.2 rounded-full font-bold">
              {notInterestedLeads.length}
            </span>
          </button>
        </div>
      </div>

      {/* LIST */}
      <main className="flex-1 overflow-y-auto px-[12px] pt-[7px] pb-[85px] smooth-scroll">
        {isLoading && leads.length === 0 ? (
          <div className="p-4 text-center text-[#7d8593] text-xs">Loading closed leads...</div>
        ) : displayedLeads.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-[14px] font-[650] text-[#4b5565]">
              No {tab === "interested" ? "interested" : "not interested"} leads yet
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
