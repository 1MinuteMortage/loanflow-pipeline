import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
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

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(buildTemplate(loan));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy Template"}
    </button>
  );
}