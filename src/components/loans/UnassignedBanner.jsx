import React from "react";
import { UserPlus } from "lucide-react";

export default function UnassignedBanner({ count, onClick }) {
  if (!count) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-2.5 gap-3 group hover:bg-amber-100/60 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900 truncate">
              {count} new {count === 1 ? "application" : "applications"} awaiting assignment
            </p>
            <p className="text-xs text-amber-700 truncate">
              These files have not been accepted by a loan officer yet.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-900 bg-amber-200 px-2.5 py-1 rounded-full shrink-0 group-hover:bg-amber-300 transition-colors">
          NEW
        </span>
      </button>
    </div>
  );
}