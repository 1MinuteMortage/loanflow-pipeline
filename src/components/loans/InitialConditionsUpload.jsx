import React, { useState, useRef } from "react";
import { FileText, Upload, Loader2, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DocPreview from "./DocPreview";

export default function InitialConditionsUpload({ loan, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const fileRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      onUpdate(loan.id, {
        initial_conditions_url: res.file_url,
        initial_conditions_name: file.name,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const url = loan.initial_conditions_url;

  return (
    <>
      <div className="mb-4 rounded-md border border-border p-3 bg-muted/30">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Initial Conditions
        </div>
        {uploading ? (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
          </span>
        ) : url ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPreviewDoc({
                  url,
                  name: loan.initial_conditions_name || "Initial Conditions",
                })
              }
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <FileText className="w-4 h-4" />
              <span className="truncate max-w-[240px]">
                {loan.initial_conditions_name || "View Initial Conditions"}
              </span>
              <Eye className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Replace
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <Upload className="w-4 h-4" /> Upload Initial Conditions
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>
      <DocPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </>
  );
}