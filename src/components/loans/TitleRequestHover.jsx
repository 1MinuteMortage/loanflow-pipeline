import React, { useState } from "react";
import { Copy, Check, FileText } from "lucide-react";
import { fullName } from "@/lib/loan-utils";

function buildTemplate(loan) {
  const loanAmount = loan.sales_price || loan.preapproval_amount;
  return `Title Request

Hi,

Please see the title request below.

Borrower: ${fullName(loan)}
Email: ${loan.email || ""}
Cell: 
Property: ${loan.property_address || ""}
Loan Amount: ${loanAmount ? `$${loanAmount}` : ""}
Lender: 
Lender Address: 
Loan Number: ${loan.loan_number || ""}

Please provide the following documents:
☐ Title (24 months Chain of title)
☐ CPL
☐ E&O
☐ Wiring Instructions
☐ Tax Search
☐ Preliminary Closing Disclosure
☐ Earnest Money Deposit Receipt`;
}

export default function TitleRequestHover({ loan }) {
  const [copied, setCopied] = useState(false);
  const template = buildTemplate(loan);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="relative inline-block group/title" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="text-muted-foreground hover:text-primary transition"
        title="Title request template"
      >
        <FileText className="w-3.5 h-3.5" />
      </button>
      <div className="hidden group-hover/title:block absolute left-0 top-full mt-1 z-50 w-80 rounded-lg border border-border bg-popover shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Title Request Template</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="text-xs whitespace-pre-wrap font-body text-foreground max-h-72 overflow-y-auto">
{template}
        </pre>
      </div>
    </div>
  );
}