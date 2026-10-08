import { Lead, LeadStatus } from "./types";
import { normalizeStatus } from "./statuses";

export const SHEET_COLUMNS = {
  Date: "leadDate",
  "Phone num": "phoneNum",
  Phone: "phone",
  Name: "name",
  Age: "age",
  Assigned: "assigned",
  status: "status",
  "next followup": "nextFollowUp",
  "Comments/Notes": "notes",
} as const;

export function rowToLead(row: Record<string, any>): Lead {
  const get = (key: string): string => {
    if (row[key] !== undefined && row[key] !== null) return String(row[key]).trim();
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(row)) {
      if (k.toLowerCase() === lowerKey && row[k] !== undefined && row[k] !== null) {
        return String(row[k]).trim();
      }
    }
    return "";
  };

  const rawPhone = get("Phone") || get("Phone num");
  const statusRaw = get("status") || get("Status");
  const ageRaw = get("Age");

  return {
    leadDate: get("Date"),
    phoneNum: get("Phone num") || rawPhone,
    phone: rawPhone,
    name: get("Name"),
    age: ageRaw || undefined,
    assigned: get("Assigned"),
    status: normalizeStatus(statusRaw),
    nextFollowUp: get("next followup") || undefined,
    notes: get("Comments/Notes") || undefined,
    _tab: row._tab ? String(row._tab) : undefined,
  };
}

export function leadToRowRecord(lead: Partial<Lead>): Record<string, any> {
  const record: Record<string, any> = {};

  if (lead.leadDate !== undefined) record["Date"] = lead.leadDate;
  if (lead.phone !== undefined) {
    record["Phone"] = lead.phone;
    record["Phone num"] = lead.phoneNum || lead.phone;
  }
  if (lead.name !== undefined) record["Name"] = lead.name;
  if (lead.age !== undefined) record["Age"] = lead.age;
  if (lead.assigned !== undefined) record["Assigned"] = lead.assigned;
  if (lead.status !== undefined) record["status"] = lead.status;
  if (lead.nextFollowUp !== undefined) record["next followup"] = lead.nextFollowUp;
  if (lead.notes !== undefined) record["Comments/Notes"] = lead.notes;

  return record;
}
