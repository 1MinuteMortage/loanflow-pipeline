import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

type Remark = {
  text?: string;
  author_name?: string;
  author_id?: string;
  created_date?: string;
  sent_to_realtor_at?: string;
  sent_to_realtor_by?: string;
};

function extractCrmClientId(notes: unknown): string | null {
  if (typeof notes !== 'string') return null;
  const m = notes.match(/1MM_CLIENT_ID:([0-9a-f-]{36})/i);
  return m?.[1] || null;
}

function formatNow() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York',
  });
}

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const loanId = body.loanId;
    if (!loanId) return Response.json({ error: 'loanId is required' }, { status: 400 });

    const loan = await base44.entities.Loan.get(loanId);
    const existing: Remark[] = Array.isArray(loan.loan_officer_remarks)
      ? loan.loan_officer_remarks
      : [];

    // One-button flow: accept text from the request and append it if present.
    const incomingText = String(body.text || body.remark || '').trim();
    let remarks = existing;
    if (incomingText) {
      const newRemark: Remark = {
        text: incomingText,
        created_date: formatNow(),
        author_name: user.full_name || user.email || 'Loan Officer',
        author_id: user.id || '',
      };
      remarks = [...existing, newRemark];
      await base44.entities.Loan.update(loanId, { loan_officer_remarks: remarks });
    }

    if (remarks.length === 0) {
      return Response.json({ skipped: true, reason: 'no remarks to send' });
    }

    // Prefer unsaved/new remarks (no sent stamp); fall back to latest text.
    const toSend = remarks.filter((r) => r.text?.trim() && !r.sent_to_realtor_at);
    const payloadRemarks = (toSend.length > 0 ? toSend : [remarks[remarks.length - 1]]).filter(
      (r) => r?.text?.trim(),
    );

    const borrowerName =
      `${loan.first_name || ''} ${loan.last_name || ''}`.trim() || 'Borrower';
    const latestText = payloadRemarks
      .map((r) => (r.text || '').trim())
      .filter(Boolean)
      .join('\n\n');

    // CRM sync first — this is what populates Loan Officer Remarks in the realtor app.
    const webhookUrl = secrets.get('CRM_LOS_WEBHOOK_URL');
    const webhookSecret = secrets.get('CRM_LOS_WEBHOOK_SECRET');
    let crmSynced = false;
    let crmError: string | null = null;
    if (webhookUrl && webhookSecret) {
      try {
        const crmResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': webhookSecret,
          },
          body: JSON.stringify({
            loanId,
            clientId: extractCrmClientId(loan.notes),
            notes: latestText,
            stage: loan.stage || null,
            remarksOnly: true,
            remarks: payloadRemarks.map((r) => ({
              text: r.text,
              author_name: r.author_name,
              created_date: r.created_date,
            })),
          }),
        });
        crmSynced = crmResponse.ok;
        if (!crmResponse.ok) {
          crmError = await crmResponse.text().catch(() => '');
          console.error('CRM remarks sync failed', crmResponse.status, crmError);
        }
      } catch (e) {
        crmError = e instanceof Error ? e.message : String(e);
        console.error('CRM remarks sync exception', crmError);
      }
    } else {
      crmError = 'CRM webhook secrets not configured';
    }

    // Email is best-effort — never fail the whole request if email throws (was causing 500s).
    let emailSent = false;
    let emailError: string | null = null;
    const realtorEmail = loan.realtor_email;
    if (realtorEmail) {
      try {
        const remarksHtml = payloadRemarks
          .map(
            (r) =>
              `<p style="margin:0 0 12px 0;padding-bottom:12px;border-bottom:1px solid #eee;"><strong>${
                r.author_name || 'Unknown'
              }</strong> &mdash; <span style="color:#666;font-size:12px;">${
                r.created_date || ''
              }</span><br/>${(r.text || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/\n/g, '<br/>')}</p>`,
          )
          .join('');
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
        emailSent = true;
      } catch (e) {
        emailError = e instanceof Error ? e.message : String(e);
        console.error('SendEmail failed (continuing)', emailError);
      }
    }

    const nowIso = new Date().toISOString();
    const sender = user.full_name || user.email || 'Loan Officer';
    const stamped = remarks.map((r) => {
      const shouldStamp =
        payloadRemarks.includes(r) ||
        payloadRemarks.some((p) => p.text === r.text && p.created_date === r.created_date);
      if (!shouldStamp) return r;
      return {
        ...r,
        sent_to_realtor_at: r.sent_to_realtor_at || nowIso,
        sent_to_realtor_by: r.sent_to_realtor_by || sender,
      };
    });
    await base44.entities.Loan.update(loanId, { loan_officer_remarks: stamped });

    if (!crmSynced && !emailSent) {
      return Response.json(
        {
          error: 'Failed to send remarks',
          crmError,
          emailError: emailError || (!realtorEmail ? 'No realtor email on file' : null),
        },
        { status: 500 },
      );
    }

    return Response.json({
      sent: true,
      remarkCount: payloadRemarks.length,
      sentTo: realtorEmail || null,
      crmSynced,
      emailSent,
      crmError,
      emailError,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to send remarks' },
      { status: 500 },
    );
  }
}
