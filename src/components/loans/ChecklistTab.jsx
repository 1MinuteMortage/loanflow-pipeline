import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckCircle2, FileText, Loader2, Eye, UploadCloud } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DocPreview from "./DocPreview";
import InitialConditionsUpload from "./InitialConditionsUpload";
import TitleRequestHover from "./TitleRequestHover";
import LoanOfficerSection from "./LoanOfficerSection";
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

export default function ChecklistTab({ loan, field, title, onUpdate, form, setForm, saveField, currentUser }) {
  const [newItem, setNewItem] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [confirmDeleteFile, setConfirmDeleteFile] = useState(null); // { itemIdx, fileIdx }
  const [confirmRemoveItemIdx, setConfirmRemoveItemIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const fileRefs = useRef([]);

  const items = loan[field] || [];
  const done = items.filter((i) => i.completed).length;

  const save = (next) => onUpdate(loan.id, { [field]: next });

  const toggleItem = (idx) =>
    save(items.map((it, i) => (i === idx ? { ...it, completed: !it.completed } : it)));

  const addItem = () => {
    if (!newItem.trim()) return;
    save([...items, { label: newItem.trim(), completed: false, files: [] }]);
    setNewItem("");
  };

  const removeItem = (idx) => {
    save(items.filter((_, i) => i !== idx));
    setConfirmRemoveItemIdx(null);
  };

  // Normalize: support both legacy single-file (file_url/file_name) and new multi-file (files[])
  const getFiles = (item) => {
    if (item.files && item.files.length > 0) return item.files;
    if (item.file_url) return [{ file_url: item.file_url, file_name: item.file_name || "Document" }];
    return [];
  };

  const handleUpload = async (idx, fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploadingIdx(idx);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadPublicFile({ file });
        uploaded.push({ file_url: res.file_url, file_name: file.name });
      }
      save(items.map((it, i) => {
        if (i !== idx) return it;
        const existing = getFiles(it);
        return { ...it, files: [...existing, ...uploaded], file_url: undefined, file_name: undefined };
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingIdx(null);
    }
  };

  const openPreview = (file) => {
    if (file.file_url) setPreviewDoc({ url: file.file_url, name: file.file_name || "Document" });
  };

  const removeFile = (itemIdx, fileIdx) => {
    save(items.map((it, i) => {
      if (i !== itemIdx) return it;
      const files = getFiles(it).filter((_, fi) => fi !== fileIdx);
      return { ...it, files, file_url: undefined, file_name: undefined };
    }));
    setConfirmDeleteFile(null);
  };

  return (
    <div>
      {field === "uw_conditions" && (
        <InitialConditionsUpload loan={loan} onUpdate={onUpdate} />
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">{title}</div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {done} of {items.length} complete
        </span>
      </div>

      <div className="space-y-1.5">
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
            No items yet — add one below.
          </div>
        )}
        {items.map((item, idx) => {
          const files = getFiles(item);
          return (
            <div
              key={idx}
              className="group rounded-md border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Checkbox checked={item.completed} onCheckedChange={() => toggleItem(idx)} />
                <span className={`flex-1 text-sm ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {item.label}
                </span>
                {item.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {item.label.includes("Title Commitment") && <TitleRequestHover loan={loan} />}
                <button
                  onClick={() => setConfirmRemoveItemIdx(idx)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                  title="Delete condition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 pl-7 space-y-1.5">
                {files.map((file, fileIdx) => (
                  <div key={fileIdx} className="flex items-center gap-2">
                    <button
                      onClick={() => openPreview(file)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{file.file_name || "View document"}</span>
                      <Eye className="w-3.5 h-3.5 ml-1" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteFile({ itemIdx: idx, fileIdx })}
                      className="text-muted-foreground hover:text-destructive transition"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverIdx(null);
                    handleUpload(idx, e.dataTransfer.files);
                  }}
                  onClick={() => fileRefs.current[idx]?.click()}
                  className={`flex items-center gap-1.5 text-xs rounded-md border border-dashed px-3 py-2 cursor-pointer transition ${
                    dragOverIdx === idx
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {uploadingIdx === idx ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5" /> Drag & drop PDF{files.length > 0 ? " or click to add more" : " or click to upload"}
                    </span>
                  )}
                  <input
                    ref={(el) => (fileRefs.current[idx] = el)}
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleUpload(idx, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add an item..."
          className="text-sm"
        />
        <Button type="button" size="sm" onClick={addItem}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {field === "needed_items" && form && setForm && saveField && (
        <LoanOfficerSection form={form} setForm={setForm} saveField={saveField} loan={loan} onUpdate={onUpdate} currentUser={currentUser} />
      )}

      <DocPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      <AlertDialog open={confirmDeleteFile !== null} onOpenChange={(open) => !open && setConfirmDeleteFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? The condition will remain, but the file will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteFile && removeFile(confirmDeleteFile.itemIdx, confirmDeleteFile.fileIdx)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmRemoveItemIdx !== null} onOpenChange={(open) => !open && setConfirmRemoveItemIdx(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this condition?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this condition? This will permanently remove the condition and any uploaded files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemoveItemIdx !== null && removeItem(confirmRemoveItemIdx)}
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