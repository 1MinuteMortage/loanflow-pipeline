import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LoanOfficerRemarks({ loan, onUpdate, currentUser, disabled = false }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState(null);
  const savedRemarks = Array.isArray(loan.loan_officer_remarks) ? loan.loan_officer_remarks : [];
  const history = [...savedRemarks].slice().reverse();

  useEffect(() => {
    setSentMsg(null);
  }, [loan?.id]);

  async function sendToRealtor() {
    const trimmed = text.trim();
    if (!trimmed) {
      setSentMsg({ type: "error", text: "Type a remark before sending." });
      setTimeout(() => setSentMsg(null), 3000);
      return;
    }

    setSending(true);
    setSentMsg(null);
    try {
      const res = await base44.functions.invoke("send-realtor-remarks", {
        loanId: loan.id,
        text: trimmed,
      });
      if (res.data?.sent) {
        setText("");
        setSentMsg({
          type: "success",
          text: res.data.crmSynced
            ? "Sent to realtor app under Loan Officer Remarks."
            : res.data.emailSent
              ? "Emailed realtor (app sync pending)."
              : "Sent.",
        });
        // Refresh loan so history shows the new remark + sent stamp
        onUpdate(loan.id, {});
      } else if (res.data?.skipped) {
        setSentMsg({ type: "error", text: res.data.reason || "No remarks to send." });
      } else {
        setSentMsg({
          type: "error",
          text: res.data?.error || res.data?.crmError || "Failed to send.",
        });
      }
    } catch (e) {
      setSentMsg({ type: "error", text: e.message || "Failed to send." });
    } finally {
      setSending(false);
      setTimeout(() => setSentMsg(null), 5000);
    }
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
          placeholder="Type a remark for the realtor..."
          rows={3}
          disabled={disabled || sending}
          className="bg-white text-sm leading-normal tracking-normal resize-y whitespace-pre-wrap"
          style={{ wordSpacing: "normal", letterSpacing: "normal" }}
          spellCheck
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void sendToRealtor();
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          onClick={() => void sendToRealtor()}
          disabled={disabled || sending || !text.trim()}
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-3.5 h-3.5 mr-1" />
              Send to Realtor
            </>
          )}
        </Button>
        {sentMsg && (
          <div
            className={`flex items-center gap-1.5 text-xs ${
              sentMsg.type === "success" ? "text-emerald-600" : "text-destructive"
            }`}
          >
            {sentMsg.type === "success" && <CheckCircle2 className="w-3.5 h-3.5" />}
            {sentMsg.text}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          Sends the text above to the realtor app under Loan Officer Remarks.
          {currentUser?.full_name ? ` Signed as ${currentUser.full_name}.` : ""}
        </p>
      </div>

      {history.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Remarks history
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {history.map((remark, idx) => (
              <div
                key={`saved-${idx}`}
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
                {remark.sent_to_realtor_at && (
                  <p className="text-[11px] text-emerald-700">
                    Sent to realtor{" "}
                    {new Date(remark.sent_to_realtor_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "America/New_York",
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
