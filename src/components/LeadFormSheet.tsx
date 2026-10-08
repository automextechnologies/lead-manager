"use client";

import React, { useState, useEffect } from "react";
import { Lead, LeadStatus } from "@/lib/types";
import { STATUS_LIST, STATUS_CONFIG } from "@/lib/statuses";
import { isValidPhone, extractDigits } from "@/lib/phone";
import { X, Trash2, Calendar, Phone, User, Tag, Clock } from "lucide-react";
import { toast } from "sonner";

interface LeadFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit: Lead | null;
  onSubmit: (leadData: Partial<Lead>, originalPhone?: string) => Promise<void>;
  onDelete?: (phone: string) => Promise<void>;
}

const DEFAULT_ASSIGNEES = ["abdu", "shajir", "shabbeba"];

export function LeadFormSheet({
  isOpen,
  onClose,
  leadToEdit,
  onSubmit,
  onDelete,
}: LeadFormSheetProps) {
  const isEditing = Boolean(leadToEdit);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new lead");
  const [assigned, setAssigned] = useState("abdu");
  const [customAssigned, setCustomAssigned] = useState("");
  const [leadDate, setLeadDate] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setName(leadToEdit.name || "");
      setPhone(leadToEdit.phone || "");
      setAge(leadToEdit.age || "");
      setStatus(leadToEdit.status || "new lead");
      if (DEFAULT_ASSIGNEES.includes(leadToEdit.assigned)) {
        setAssigned(leadToEdit.assigned);
        setCustomAssigned("");
      } else {
        setAssigned("other");
        setCustomAssigned(leadToEdit.assigned || "");
      }
      setLeadDate(leadToEdit.leadDate || new Date().toISOString().split("T")[0]);
      setNextFollowUp(leadToEdit.nextFollowUp || "");
      setNotes(leadToEdit.notes || "");
    } else {
      // Defaults for new lead
      setName("");
      setPhone("");
      setAge("");
      setStatus("new lead");
      setAssigned("abdu");
      setCustomAssigned("");
      setLeadDate(new Date().toISOString().split("T")[0]);
      setNextFollowUp("");
      setNotes("");
    }
    setShowDeleteConfirm(false);
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    const finalAssigned = assigned === "other" ? customAssigned.trim() : assigned;

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          name: name.trim(),
          phone: phone.trim(),
          phoneNum: phone.trim(),
          age: age.trim() || undefined,
          status,
          assigned: finalAssigned || "abdu",
          leadDate: leadDate || new Date().toISOString().split("T")[0],
          nextFollowUp: nextFollowUp || undefined,
          notes: notes.trim() || undefined,
        },
        leadToEdit?.phone
      );
      onClose();
    } catch {
      // Errors handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!leadToEdit || !onDelete) return;
    setIsSubmitting(true);
    try {
      await onDelete(leadToEdit.phone);
      onClose();
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[92vh] sm:max-h-[85vh] bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-up">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#edf0f4] bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-[18px] font-[750] text-[#172033] tracking-tight">
              {isEditing ? "Edit Lead" : "Add New Lead"}
            </h2>
            <p className="text-[11px] text-[#7d8593] mt-0.5">
              {isEditing ? `Editing lead ${leadToEdit?.phone}` : "Enter lead details for Eldroplus"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9aa2af] hover:text-[#172033] rounded-full hover:bg-[#f5f6f8] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Phone Field */}
          <div>
            <label className="block text-[11px] font-[650] text-[#3b4352] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 96453 52961"
              required
              className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[13px] text-[#172033] font-semibold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
            {isEditing && leadToEdit?.phone !== phone && (
              <p className="text-[10px] text-amber-600 mt-1">
                Notice: Changing phone will update the lead&apos;s primary identifier.
              </p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-[11px] font-[650] text-[#3b4352] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Lead Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raji (optional)"
              className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[13px] text-[#172033] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          {/* Age & Status (2 columns) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-[650] text-[#3b4352] uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 49, 40+"
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[13px] text-[#172033] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-[650] text-[#3b4352] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[12.5px] font-semibold text-[#172033] focus:bg-white focus:border-blue-500 outline-none transition cursor-pointer"
              >
                {STATUS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned Field */}
          <div>
            <label className="block text-[11px] font-[650] text-[#3b4352] uppercase tracking-wider mb-1.5">
              Assigned To
            </label>
            <div className="flex gap-2">
              <select
                value={assigned}
                onChange={(e) => setAssigned(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[13px] font-medium text-[#172033] focus:bg-white focus:border-blue-500 outline-none transition cursor-pointer"
              >
                {DEFAULT_ASSIGNEES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
                <option value="other">Other / Custom</option>
              </select>
              {assigned === "other" && (
                <input
                  type="text"
                  value={customAssigned}
                  onChange={(e) => setCustomAssigned(e.target.value)}
                  placeholder="Enter name"
                  required
                  className="flex-1 px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[13px] text-[#172033] focus:bg-white focus:border-blue-500 outline-none transition"
                />
              )}
            </div>
          </div>

          {/* Dates: Lead Date & Next Follow-up */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-[650] text-[#3b4352] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Lead Date
              </label>
              <input
                type="date"
                value={leadDate}
                onChange={(e) => setLeadDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[12px] text-[#172033] focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-[650] text-[#3b4352] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Next Follow-up
              </label>
              <input
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[12px] text-[#172033] focus:bg-white focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-[650] text-[#3b4352] uppercase tracking-wider mb-1.5">
              Comments / Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. WhatsApp shared, call in evening..."
              className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px] text-[13px] text-[#172033] focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none leading-relaxed"
            />
          </div>

          {/* Delete Button (Edit mode only) */}
          {isEditing && (
            <div className="pt-2 border-t border-[#edf0f4]">
              {showDeleteConfirm ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-[12px] space-y-2">
                  <p className="text-[12px] text-red-800 font-semibold text-center">
                    Delete lead {leadToEdit?.phone}? This removes it from Google Sheets.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[12px] font-bold rounded-[8px] transition cursor-pointer"
                    >
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 text-[12px] font-semibold rounded-[8px] transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 flex items-center justify-center gap-1.5 text-red-600 hover:bg-red-50/60 rounded-[11px] text-[12px] font-[650] transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Lead
                </button>
              )}
            </div>
          )}

          {/* ACTIONS FOOTER */}
          <div className="pt-2 pb-2 sticky bottom-0 bg-white">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#172033] hover:bg-[#252f44] text-white text-[13px] font-[750] rounded-[13px] shadow-md transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
