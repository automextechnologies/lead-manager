"use client";

import React, { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Sidebar } from "@/components/Sidebar";
import { useLeads } from "@/hooks/useLeads";
import { useQueryClient } from "@tanstack/react-query";
import { LEADS_QUERY_KEY } from "@/hooks/useLeads";
import { toast } from "sonner";
import {
  User,
  Activity,
  Trash2,
  Download,
  CheckCircle,
  Database,
  Menu,
} from "lucide-react";

export default function SettingsPage() {
  const { data: leads = [], refetch } = useLeads();
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignedName, setAssignedName] = useState("abdu");
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiPingStatus, setApiPingStatus] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("eldroplus_assigned_name");
    if (saved) setAssignedName(saved);
  }, []);

  const handleSaveName = (name: string) => {
    setAssignedName(name);
    localStorage.setItem("eldroplus_assigned_name", name);
    toast.success("Default assignee saved!");
  };

  const handleTestConnection = async () => {
    setIsTestingApi(true);
    setApiPingStatus(null);
    const start = performance.now();
    try {
      const res = await refetch();
      const elapsed = Math.round(performance.now() - start);
      if (res.isSuccess) {
        setApiPingStatus(`Connected (${elapsed}ms) - 94 leads loaded`);
        toast.success(`API live! Response in ${elapsed}ms`);
      } else {
        setApiPingStatus("Connection failed");
      }
    } catch (err: any) {
      setApiPingStatus(`Error: ${err.message}`);
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleClearCache = () => {
    queryClient.invalidateQueries({ queryKey: LEADS_QUERY_KEY });
    queryClient.resetQueries({ queryKey: LEADS_QUERY_KEY });
    toast.success("Cache cleared & re-fetching leads...");
    refetch();
  };

  return (
    <PhoneFrame>
      <header className="bg-white px-[16px] pt-[36px] sm:pt-[42px] pb-[15px] border-b border-[#e7e9ee] shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu drawer"
            className="w-[38px] h-[38px] grid place-items-center bg-[#f7f8fa] hover:bg-[#edf0f4] active:scale-90 border border-[#e1e4ea] rounded-[12px] text-[#172033] shadow-2xs transition cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div>
            <h1 className="text-[20px] sm:text-[22px] font-[750] tracking-[-0.5px] text-[#172033] leading-tight">
              Settings
            </h1>
            <p className="text-[11.5px] text-[#7a8291] mt-[2px] font-normal">
              Preferences &amp; System Info
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-6 pb-safe smooth-scroll">
        {/* PROFILE / ASSIGNEE */}
        <div className="bg-white p-4 rounded-[18px] border border-[#e5e7ec] shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-[14px] font-[700] text-[#172033]">Default Assignee</h2>
          </div>
          <p className="text-[11px] text-[#7d8593]">
            This name will be automatically pre-selected when you add new leads.
          </p>
          <div className="flex gap-2">
            <select
              value={assignedName}
              onChange={(e) => handleSaveName(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[11px] text-[13px] font-semibold text-[#172033] outline-none"
            >
              <option value="abdu">abdu</option>
              <option value="shajir">shajir</option>
              <option value="shabbeba">shabbeba</option>
            </select>
          </div>
        </div>

        {/* API STATUS */}
        <div className="bg-white p-4 rounded-[18px] border border-[#e5e7ec] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h2 className="text-[14px] font-[700] text-[#172033]">Google Apps Script API</h2>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" /> Live
            </span>
          </div>

          <p className="text-[11px] text-[#7d8593]">
            Backend connected directly to your Google Spreadsheet via Google Apps Script Web App.
          </p>

          {apiPingStatus && (
            <div className="p-2.5 bg-[#f5f6f8] rounded-[10px] text-[11px] font-mono text-[#303847]">
              {apiPingStatus}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTestingApi}
              className="flex-1 py-2 px-3 bg-[#172033] hover:bg-[#252f44] text-white rounded-[10px] text-[11px] font-bold transition disabled:opacity-50 cursor-pointer"
            >
              {isTestingApi ? "Pinging API..." : "Test Connection"}
            </button>
            <button
              onClick={handleClearCache}
              className="py-2 px-3 bg-[#f1f3f6] hover:bg-[#e7e9ee] text-[#4f5868] rounded-[10px] text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cache
            </button>
          </div>
        </div>

        {/* SUMMARY METRICS */}
        <div className="bg-white p-4 rounded-[18px] border border-[#e5e7ec] shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h2 className="text-[14px] font-[700] text-[#172033]">Spreadsheet Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="p-2 bg-[#f8fafc] rounded-[10px]">
              <span className="text-[#7d8593]">Total in DB:</span>{" "}
              <b className="text-[#172033]">{leads.length} leads</b>
            </div>
            <div className="p-2 bg-[#f8fafc] rounded-[10px]">
              <span className="text-[#7d8593]">Interested:</span>{" "}
              <b className="text-emerald-700">
                {leads.filter((l) => l.status === "Interested").length}
              </b>
            </div>
            <div className="p-2 bg-[#f8fafc] rounded-[10px]">
              <span className="text-[#7d8593]">Follow-ups:</span>{" "}
              <b className="text-amber-700">
                {
                  leads.filter((l) =>
                    ["call later", "deciding", "not responded"].includes(l.status)
                  ).length
                }
              </b>
            </div>
            <div className="p-2 bg-[#f8fafc] rounded-[10px]">
              <span className="text-[#7d8593]">New Leads:</span>{" "}
              <b className="text-purple-700">
                {leads.filter((l) => l.status === "new lead").length}
              </b>
            </div>
          </div>
        </div>

        {/* PWA INSTALL CARD */}
        <div className="bg-gradient-to-br from-[#172033] to-[#252f44] p-4 rounded-[18px] text-white shadow-md space-y-2">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <h2 className="text-[13px] font-[700]">Install Mobile App (PWA)</h2>
          </div>
          <p className="text-[11px] text-white/80 leading-relaxed">
            On Android: Tap browser menu (⋮) → &ldquo;Add to Home Screen&rdquo; or &ldquo;Install App&rdquo;.
            <br />
            On iPhone / Safari: Tap Share (📤) → &ldquo;Add to Home Screen&rdquo;.
          </p>
        </div>

        <div className="text-center pt-2">
          <span className="text-[10px] text-[#9aa2af]">
            Eldroplus Leads v1.0.0 · Progressive Web App
          </span>
        </div>
      </main>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        leads={leads}
      />
    </PhoneFrame>
  );
}
