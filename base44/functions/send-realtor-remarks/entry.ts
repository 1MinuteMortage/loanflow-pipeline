import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const loanId = body.loanId;
    if (!loanId) return Response.json({ error: 'loanId is required' }, { status: 400 });

    const loan = await base44.entities.Loan.get(loanId);
    const remarks = Array.isArray(loan.loan_officer_remarks) ? loan.loan_officer_remarks : [];

    if (remarks.length === 0) {
      return Response.json({ skipped: true, reason: 'no remarks to send' });
    }

    const realtorEmail = loan.realtor_email;
    if (!realtorEmail) {
      return Response.json({ error: 'No realtor email on file for this loan' }, { status: 400 });
    }

    const borrowerName = `${loan.first_name || ''} ${loan.last_name || ''}`.trim() || 'Borrower';
    const remarksHtml = remarks.map((r) =>
      `<p style="margin:0 0 12px 0;padding-bottom:12px;border-bottom:1px solid #eee;"><strong>${r.author_name || 'Unknown'}</strong> &mdash; <span style="color:#666;font-size:12px;">${r.created_date || ''}</span><br/>${(r.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br/>')}</p>`
    ).join('');

    await base44.integrations.Core.SendEmail({
      to: realtorEmail,
      subject: `Loan Officer Remarks - ${borrowerName}`,
      html: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
<h2 style="color:#2463eb;">Loan Officer Remarks for ${borrowerName}</h2>
<p style="color:#666;font-size:13px;">Sent by ${user.full_name || user.email || 'Loan Officer'} on ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
<hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
${remarksHtml}
</div>`,
    });

    return Response.json({ sent: true, remarkCount: remarks.length, sentTo: realtorEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}