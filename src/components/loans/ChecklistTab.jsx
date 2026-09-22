import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, CheckCircle2, Paperclip, FileText, Loader2, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import DocPreview from "./DocPreview";
import InitialConditionsUpload from "./InitialConditionsUpload";
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

export default function ChecklistTab({ loan, field, title, onUpdate }) {
  const [newItem, setNewItem] = useState("");
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);
  const [confirmRemoveItemIdx, setConfirmRemoveItemIdx] = useState(null);
  const fileRefs = useRef([]);

  const items = loan[field] || [];
  const done = items.filter((i) => i.completed).length;

  const save = (next) => onUpdate(loan.id, { [field]: next });

  const toggleItem = (idx) =>
    save(items.map((it, i) => (i === idx ? { ...it, completed: !it.completed } : it)));

  const addItem = () => {
    if (!newItem.trim()) return;
    save([...items, { label: newItem.trim(), completed: false }]);
    setNewItem("");
  };

  const removeItem = (idx) => {
    save(items.filter((_, i) => i !== idx));
    setConfirmRemoveItemIdx(null);
  };

  const handleUpload = async (idx, file) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      save(items.map((it, i) => (i === idx ? { ...it, file_url: res.file_url, file_name: file.name } : it)));
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingIdx(null);
    }
  };

  const openPreview = (item) => {
    if (item.file_url) setPreviewDoc({ url: item.file_url, name: item.file_name || "Document" });
  };

  const removeFile = (idx) => {
    save(items.map((it, i) => (i === idx ? { ...it, file_url: undefined, file_name: undefined } : it)));
    setConfirmDeleteIdx(null);
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
        {items.map((item, idx) => (
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
              <button
                onClick={() => setConfirmRemoveItemIdx(idx)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                title="Delete condition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 pl-7 flex items-center gap-2">
              {uploadingIdx === idx ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </span>
              ) : item.file_url ? (
                <>
                  <button
                    onClick={() => openPreview(item)}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{item.file_name || "View document"}</span>
                    <Eye className="w-3.5 h-3.5 ml-1" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteIdx(idx)}
                    className="text-muted-foreground hover:text-destructive transition"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => fileRefs.current[idx]?.click()}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                >
                  <Paperclip className="w-3.5 h-3.5" /> Upload PDF
                </button>
              )}
              <input
                ref={(el) => (fileRefs.current[idx] = el)}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(idx, file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        ))}
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

      <DocPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} />

      <AlertDialog open={confirmDeleteIdx !== null} onOpenChange={(open) => !open && setConfirmDeleteIdx(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? The condition will remain, but the uploaded file will be removed.
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

      <AlertDialog open={confirmRemoveItemIdx !== null} onOpenChange={(open) => !open && setConfirmRemoveItemIdx(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this condition?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this condition? This will permanently remove the condition and any uploaded file.
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