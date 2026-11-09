import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// Public lookup for the client calculator page (/calculator?loanId=ID, no login).
// Deliberately unauthenticated per the loan-officer's request: the loan id is the
// access key, and only the calculator fields plus the borrower's first name
// (for the page title) are returned - no other borrower data.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const loanId = body.loanId;
    if (!loanId) return Response.json({ error: 'loanId is required' }, { status: 400 });

    const loan = await base44.asServiceRole.entities.Loan.get(loanId)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!loan) return Response.json({ error: 'Loan not found' }, { status: 404 });

    return Response.json({
      id: loan.id,
      first_name: loan.first_name || null,
      loan_type: loan.loan_type || null,
      interest_rate: loan.interest_rate ?? null,
      preapproval_amount: loan.preapproval_amount ?? null,
      sales_price: loan.sales_price ?? null,
      monthly_property_taxes: loan.monthly_property_taxes ?? null,
      hoa_dues: loan.hoa_dues ?? null,
      sellers_concession: loan.sellers_concession ?? null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}