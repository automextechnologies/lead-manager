export type LeadStatus =
  | "new lead"
  | "Interested"
  | "call later"
  | "deciding"
  | "not responded"
  | "Not interested";

export interface Lead {
  leadDate: string;        // "Date" in sheet (yyyy-MM-dd)
  phoneNum?: string;       // "Phone num" in sheet (mirrors phone)
  phone: string;           // "Phone" in sheet (primary key, e.g. "96453 52961")
  name: string;            // "Name"
  age?: string;            // "Age" (free text, e.g. "49", "40+")
  assigned: string;        // "Assigned" (e.g. "abdu", "shajir")
  status: LeadStatus;      // "status"
  nextFollowUp?: string;   // "next followup" (yyyy-MM-dd)
  notes?: string;          // "Comments/Notes"
  _tab?: string;           // originating sheet tab
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  count?: number;
  data?: T;
  table?: string;
}

export type SortOption = "date-desc" | "date-asc" | "followup-asc" | "name-asc";

export interface FilterOptions {
  search: string;
  status: LeadStatus | "all";
  assigned: string | "all";
  hasFollowUpOnly: boolean;
  sortBy: SortOption;
}
