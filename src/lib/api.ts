import { Lead, ApiResponse } from "./types";
import { rowToLead, leadToRowRecord } from "./mappers";

const API_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SHEET_API_URL ||
  "https://script.google.com/macros/s/AKfycbwin5fxTsS4UxYSCmj7w9e9Q3dBRmYFDUdoUXbq-FPINVnDtQtaq9rUwEP_xALQEWmz/exec";

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 25000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// READ ALL LEADS
export async function getLeads(): Promise<Lead[]> {
  try {
    const res = await fetchWithTimeout(`${API_URL}?action=list`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }

    const json: ApiResponse<any[]> = await res.json();
    if (json.status !== "success" || !Array.isArray(json.data)) {
      throw new Error(json.message || "Failed to load leads");
    }

    return json.data.map(rowToLead);
  } catch (err: any) {
    console.error("getLeads error:", err);
    throw err;
  }
}

// READ SINGLE LEAD BY PHONE
export async function getLead(phone: string): Promise<Lead | null> {
  const res = await fetchWithTimeout(
    `${API_URL}?action=read&phone=${encodeURIComponent(phone.trim())}`,
    { method: "GET" }
  );

  const json: ApiResponse = await res.json();
  if (json.status === "success" && json.data) {
    return rowToLead(json.data);
  }
  return null;
}

// CREATE LEAD
export async function createLead(lead: Partial<Lead>): Promise<ApiResponse> {
  const record = leadToRowRecord(lead);
  const res = await fetchWithTimeout(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    redirect: "follow",
    body: JSON.stringify({ action: "create", record }),
  });

  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(json.message || "Could not create lead");
  }
  return json;
}

// UPDATE LEAD (migrates lead tab in Google Sheet if status changes)
export async function updateLead(
  phone: string,
  updatedLead: Partial<Lead>
): Promise<ApiResponse> {
  const updatedRecord = leadToRowRecord(updatedLead);
  const res = await fetchWithTimeout(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    redirect: "follow",
    body: JSON.stringify({
      action: "update",
      phone: phone.trim(),
      updatedRecord,
    }),
  });

  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(json.message || "Could not update lead");
  }
  return json;
}

// DELETE LEAD
export async function deleteLead(phone: string): Promise<ApiResponse> {
  const res = await fetchWithTimeout(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    redirect: "follow",
    body: JSON.stringify({ action: "delete", phone: phone.trim() }),
  });

  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(json.message || "Could not delete lead");
  }
  return json;
}
