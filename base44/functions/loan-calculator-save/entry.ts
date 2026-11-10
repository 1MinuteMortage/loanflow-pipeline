import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { getProgramRules, normalizeDownPaymentPercent } from '../../shared/loan-calculator.ts';

// Public save for the client calculator page (no login, per request).
// Only the four client-editable fields plus the chosen down payment percentage
// are written; preapproval_amount, loan_type, interest_rate and the loan amount
// can never be changed through this endpoint.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const loanId = body.loanId;
    if (!loanId) return Response.json({ error: 'loanId is required' }, { status: 400 });

    const loan = await base44.asServiceRole.entities.Loan.get(loanId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!loan) return Response.json({ error: 'Loan not found' }, { status: 404 });

    const salesPrice = Number(body.sales_price);
    const taxes = Number(body.monthly_property_taxes);
    const hoa = Number(body.hoa_dues);
    const concession = Number(body.sellers_concession);
    if ([salesPrice, taxes, hoa, concession].some((v) => !Number.isFinite(v) || v < 0)) {
      return Response.json({ error: 'All values must be non-negative numbers' }, { status: 400 });
    }

    if (loan.preapproval_amount != null && salesPrice > loan.preapproval_amount) {
      return Response.json({ error: 'Sales price exceeds the pre-approved amount' }, { status: 400 });
    }

    const rules = getProgramRules(loan.loan_type);
    if (!rules) return Response.json({ error: 'Loan program not supported' }, { status: 400 });

    const cappedConcession = Math.min(concession, salesPrice * rules.maxConcessionPercent);

    const downPaymentPercent = normalizeDownPaymentPercent(loan.loan_type, body.down_payment_percent);

    await base44.asServiceRole.entities.Loan.update(loanId, {
      sales_price: salesPrice,
      monthly_property_taxes: taxes,
      hoa_dues: hoa,
      sellers_concession: cappedConcession,
      down_payment_percent: downPaymentPercent,
    });

    return Response.json({
      saved: true,
      sales_price: salesPrice,
      monthly_property_taxes: taxes,
      hoa_dues: hoa,
      sellers_concession: cappedConcession,
      down_payment_percent: downPaymentPercent,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}