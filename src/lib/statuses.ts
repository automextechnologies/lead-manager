import { LeadStatus } from "./types";

export interface StatusMeta {
  value: LeadStatus;
  label: string;
  tab: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  indicator: string;
  group: "open" | "followup" | "closed";
}

export const STATUS_LIST: LeadStatus[] = [
  "new lead",
  "Interested",
  "call later",
  "deciding",
  "not responded",
  "Not interested",
];

export const STATUS_CONFIG: Record<LeadStatus, StatusMeta> = {
  "new lead": {
    value: "new lead",
    label: "New Lead",
    tab: "new leads",
    badgeBg: "bg-[#f0edff]",
    badgeText: "text-[#6652b9]",
    border: "border-[#e0d8ff]",
    indicator: "bg-[#6652b9]",
    group: "open",
  },
  "Interested": {
    value: "Interested",
    label: "Interested",
    tab: "interested",
    badgeBg: "bg-[#e9f8ef]",
    badgeText: "text-[#168148]",
    border: "border-[#c8ecd6]",
    indicator: "bg-[#168148]",
    group: "closed",
  },
  "call later": {
    value: "call later",
    label: "Call Later",
    tab: "call later",
    badgeBg: "bg-[#fff4df]",
    badgeText: "text-[#b76b00]",
    border: "border-[#fde2b4]",
    indicator: "bg-[#b76b00]",
    group: "followup",
  },
  "deciding": {
    value: "deciding",
    label: "Deciding",
    tab: "deciding",
    badgeBg: "bg-[#e8f1ff]",
    badgeText: "text-[#2f62c9]",
    border: "border-[#cbe0ff]",
    indicator: "bg-[#2f62c9]",
    group: "followup",
  },
  "not responded": {
    value: "not responded",
    label: "Not Responded",
    tab: "not responded",
    badgeBg: "bg-[#f1f2f5]",
    badgeText: "text-[#5f6775]",
    border: "border-[#e2e4e8]",
    indicator: "bg-[#5f6775]",
    group: "followup",
  },
  "Not interested": {
    value: "Not interested",
    label: "Not Interested",
    tab: "not interested",
    badgeBg: "bg-[#fdecec]",
    badgeText: "text-[#c23b3b]",
    border: "border-[#f9c9c9]",
    indicator: "bg-[#c23b3b]",
    group: "closed",
  },
};

export function normalizeStatus(input?: string): LeadStatus {
  if (!input) return "new lead";
  const trimmed = input.trim().toLowerCase();
  for (const status of STATUS_LIST) {
    if (status.toLowerCase() === trimmed) return status;
  }
  // Common fallback mappings
  if (trimmed.includes("interested") && !trimmed.includes("not")) return "Interested";
  if (trimmed.includes("not") && trimmed.includes("interested")) return "Not interested";
  if (trimmed.includes("call")) return "call later";
  if (trimmed.includes("decid")) return "deciding";
  if (trimmed.includes("respond")) return "not responded";
  return "new lead";
}

export function isFollowUpStatus(status: LeadStatus): boolean {
  return STATUS_CONFIG[status]?.group === "followup";
}
