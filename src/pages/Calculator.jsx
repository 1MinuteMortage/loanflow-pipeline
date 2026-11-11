import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { calculateQuote, getProgramRules, MAX_DOWN_PERCENT } from "@/lib/loan-calculator";
import CalculatorFields from "@/components/calculator/CalculatorFields";
import CalculatorResults from "@/components/calculator/CalculatorResults";
import LoanProgramHeader from "@/components/calculator/LoanProgramHeader";
import CalculatorHeader from "@/components/calculator/CalculatorHeader";

export default function Calculator() {
  const [loading, setLoading] = useState(true);
  const [loan, setLoan] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    salesPrice: "",
    taxes: "",
    hoa: "",
    concession: "",
    downPercent: 0,
  });
  useEffect(() => {
    const loanId = new URLSearchParams(window.location.search).get("loanId");
    if (!loanId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    base44.functions
      .invoke("loan-calculator-quote", { loanId })
      .then((res) => {
        const data = res?.data ?? res;
        if (!data || data.error || !data.id) {
          setNotFound(true);
          return;
        }
        setLoan(data);
        const programRules = getProgramRules(data.loan_type);
        const minPercent = programRules ? programRules.downPercent * 100 : 0;
        let downPercent = Number(data.down_payment_percent);
        if (!programRules || programRules.downLocked) {
          downPercent = 0;
        } else if (!Number.isFinite(downPercent) || downPercent < minPercent) {
          downPercent = minPercent;
        } else {
          downPercent = Math.min(downPercent, MAX_DOWN_PERCENT * 100);
        }
        setForm({
          salesPrice: data.sales_price != null ? String(data.sales_price) : "",
          taxes: data.monthly_property_taxes != null ? String(data.monthly_property_taxes) : "",
          hoa: data.hoa_dues != null ? String(data.hoa_dues) : "",
          concession: data.sellers_concession != null ? String(data.sellers_concession) : "",
          downPercent,
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notFound) return;
    const meta = document.createElement("meta");
    meta.name = "prerender-status-code";
    meta.content = "404";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [notFound]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleDownPercentChange = (value) =>
    setForm((prev) => ({ ...prev, downPercent: value }));

  const quote = useMemo(() => {
    if (!loan) return null;
    return calculateQuote({
      loanType: loan.loan_type,
      interestRate: loan.interest_rate,
      salesPrice: form.salesPrice,
      monthlyTaxes: form.taxes,
      hoaDues: form.hoa,
      concession: form.concession,
      downPercent: (Number(form.downPercent) || 0) / 100,
    });
  }, [loan, form]);

  const exceedsPreapproval = useMemo(() => {
    if (!loan || loan.preapproval_amount == null) return false;
    const p = parseFloat(form.salesPrice);
    return Number.isFinite(p) && p > loan.preapproval_amount;
  }, [loan, form.salesPrice]);

  const rules = loan ? getProgramRules(loan.loan_type) : null;

  return (
    <div className="min-h-screen bg-background">
      <CalculatorHeader firstName={loan?.first_name} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : notFound ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            We couldn't find this calculator link. Please contact your loan officer for an updated link.
          </div>
        ) : !rules ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            This loan's program calculator isn't available yet. Please contact your loan officer.
          </div>
        ) : (
          <>
            <LoanProgramHeader
              preapprovalAmount={loan.preapproval_amount}
              interestRate={loan.interest_rate}
              loanType={loan.loan_type}
            />
            <CalculatorFields
              form={form}
              onChange={handleChange}
              preapprovalAmount={loan.preapproval_amount}
              exceedsPreapproval={exceedsPreapproval}
              rules={rules}
              downPercent={form.downPercent}
              onDownPercentChange={handleDownPercentChange}
            />
            <CalculatorResults quote={quote} />
          </>
        )}
      </main>
    </div>
  );
}