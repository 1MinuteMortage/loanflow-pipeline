import React from "react";
import { X } from "lucide-react";

export default function DocPreview({ doc, onClose }) {
  if (!doc) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-foreground text-background shrink-0">
        <span className="text-sm font-medium truncate pr-4">{doc.name || "Document"}</span>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background/15 hover:bg-background/25 text-background text-sm font-medium transition-colors"
        >
          <X className="w-4 h-4" />
          Exit
        </button>
      </div>
      <iframe
        src={doc.url}
        title={doc.name || "Document preview"}
        className="flex-1 w-full bg-white"
      />
    </div>
  );
}