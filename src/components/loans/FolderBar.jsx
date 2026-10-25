import React from "react";
import { STAGES } from "@/lib/loan-utils";
import { AlertTriangle } from "lucide-react";

export default function FolderBar({ active, counts, onChange, unassignedCount = 0, unassignedProcessorCount = 0 }) {
  const tabs = [
    { key: "all", label: "All" },
    { key: "urgent", label: "8 days or less", color: "#ef4444" },
    { key: "unaccepted", label: "Unaccepted", color: "#ef4444" },
    ...STAGES.map((s) => ({ key: s.key, label: s.label, color: s.color })),
  ];

  return (
    <div className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border">
      <div className="flex items-center gap-1.5 px-4 sm:px-6 py-3 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          const count = tab.key === "all"
            ? counts.all
            : tab.key === "unaccepted"
            ? counts.unassigned || 0
            : counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {tab.color && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tab.color, opacity: isActive ? 1 : 0.7 }}
                />
              )}
              <span>{tab.label}</span>
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded-md tabular-nums ${
                  isActive ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
              {tab.key === "under_contract" && unassignedProcessorCount > 0 && (
                <span className="absolute -top-3.5 -left-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-sm ring-2 ring-card">
                  NEW {unassignedProcessorCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}