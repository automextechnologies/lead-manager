"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLeads } from "@/hooks/useLeads";
import { isFollowUpStatus } from "@/lib/statuses";

export function BottomNav() {
  const pathname = usePathname();
  const { data: leads } = useLeads();

  const [todayStr, setTodayStr] = React.useState("");

  React.useEffect(() => {
    setTodayStr(new Date().toISOString().split("T")[0]);
  }, []);

  // Compute follow-ups badge count (call later, deciding, not responded, or leads with due follow-up)
  const dueFollowUpsCount = (leads || []).filter((lead) => {
    if (lead.status === "Interested" || lead.status === "Not interested") return false;
    if (isFollowUpStatus(lead.status)) return true;
    if (todayStr && lead.nextFollowUp && lead.nextFollowUp <= todayStr) return true;
    return false;
  }).length;

  const navItems = [
    {
      href: "/",
      label: "Leads",
      icon: "▣",
      isActive: pathname === "/",
    },
    {
      href: "/follow-ups",
      label: "Follow-ups",
      icon: "◷",
      isActive: pathname === "/follow-ups",
      badge: dueFollowUpsCount > 0 ? dueFollowUpsCount : undefined,
    },
    {
      href: "/closed",
      label: "Closed",
      icon: "✓",
      isActive: pathname === "/closed",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: "⚙",
      isActive: pathname === "/settings",
    },
  ];

  return (
    <nav className="absolute left-0 right-0 bottom-0 h-[66px] pb-[env(safe-area-inset-bottom,0px)] flex justify-around items-center bg-white/98 backdrop-blur-md border-t border-[#e3e6eb] z-30 select-none">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            item.isActive ? "text-[#172033] font-bold scale-[1.02]" : "text-[#8b93a0] hover:text-[#525a68]"
          }`}
        >
          <div className="relative">
            <span className="block text-[18px] leading-tight mb-0.5">{item.icon}</span>
            {item.badge !== undefined && (
              <span className="absolute -top-1 -right-3.5 px-1.5 py-0.2 min-w-[17px] h-[16px] flex items-center justify-center text-[10px] font-bold text-white bg-amber-500 rounded-full border border-white shadow-xs">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </div>
          <span className="text-[9px] tracking-tight">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
