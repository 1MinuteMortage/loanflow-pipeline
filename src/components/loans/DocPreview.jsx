import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, Maximize } from "lucide-react";

export default function DocPreview({ doc, onClose }) {
  const [zoom, setZoom] = useState(1);
  if (!doc) return null;

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-foreground text-background shrink-0">
        <span className="text-sm font-medium truncate pr-4">
          {doc.name || "Document"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-background/15 hover:bg-background/25 disabled:opacity-40 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs tabular-nums w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={zoom >= 3}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-background/15 hover:bg-background/25 disabled:opacity-40 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-background/15 hover:bg-background/25 transition-colors"
            title="Reset zoom"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-background/15 hover:bg-background/25 text-background text-sm font-medium transition-colors ml-2"
          >
            <X className="w-4 h-4" />
            Exit
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <iframe
          src={doc.url}
          title={doc.name || "Document preview"}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            zoom: zoom,
          }}
        />
      </div>
    </div>
  );
}