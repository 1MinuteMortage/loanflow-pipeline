import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";

export default function LoanOfficerRemarks({ loan, onUpdate, currentUser }) {
  const [text, setText] = useState("");
  const remarks = Array.isArray(loan.loan_officer_remarks) ? loan.loan_officer_remarks : [];

  function addRemark() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    });
    const newRemark = {
      text: trimmed,
      created_date: now,
      author_name: currentUser?.full_name || currentUser?.email || "Unknown",
      author_id: currentUser?.id || "",
    };
    onUpdate(loan.id, {
      loan_officer_remarks: [...remarks, newRemark],
    });
    setText("");
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="font-heading text-sm font-semibold text-primary">Loan Officer Remarks</h3>
      </div>

      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a remark..."
          rows={3}
          className="bg-white text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              addRemark();
            }
          }}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={addRemark}
            disabled={!text.trim()}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Add Remark
          </Button>
        </div>
      </div>

      {remarks.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {remarks.map((remark, idx) => (
            <div
              key={idx}
              className="rounded-md border border-border bg-white p-3 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {remark.author_name || "Unknown"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {remark.created_date}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{remark.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}