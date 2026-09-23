import React, { useState, useRef } from "react";
import { FileText, Loader2, Eye, UploadCloud, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DocPreview from "./DocPreview";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function DocumentUploadTab({ loan, field, title, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const files = loan[field] || [];

  const save = (next) => onUpdate(loan.id, { [field]: next });

  const handleUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadPublicFile({ file });
        uploaded.push({ file_url: res.file_url, file_name: file.name });
      }
      save([...(loan[field] || []), ...uploaded]);
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const openPreview = (file) => {
    if (file.file_url) setPreviewDoc({ url: file.file_url, name: file.file_name || "Document" });
  };

  const removeFile = (idx) => {
    save(files.filter((_, i) => i !== idx));
    setConfirmDeleteIdx(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">{title}</div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {files.length} document{files.length !== 1 ? "s" : ""}
        </span>
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="group flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
            >
              <button
                onClick={() => openPreview(file)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[280px]">{file.file_name || "View document"}</span>
                <Eye className="w-3.5 h-3.5 ml-1" />
              </button>
              <button
                onClick={() => setConfirmDeleteIdx(idx)}
                className="ml-auto text-muted-foreground hover:text-destructive transition opacity-0 group-hover:opacity-100"
                title="Delete file"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-8 cursor-pointer transition ${
          dragOver
            ? "border-primary bg-primary/5 text-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
        }`}
      >
        {uploading ? (
          <span className="flex items-center gap-1.5 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-sm">
            <UploadCloud className="w-4 h-4" /> Drag & drop PDF or click to upload
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handleUpload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <DocPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      <AlertDialog open={confirmDeleteIdx !== null} onOpenChange={(open) => !open && setConfirmDeleteIdx(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteIdx !== null && removeFile(confirmDeleteIdx)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}