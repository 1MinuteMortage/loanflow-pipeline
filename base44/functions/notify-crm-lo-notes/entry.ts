import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const loanId = body.loanId;

    if (!loanId) return Response.json({ error: 'loanId is required' }, { status: 400 });

    const loan = await base44.entities.Loan.get(loanId);
    const rawNotes = loan.notes || '';
    const notes = rawNotes
      .replace(/^1MM_CLIENT_ID:[0-9a-f-]{36}\n?/i, '')
      .replace(/^Borrower phone:.*$/gim, '')
      .replace(/^LOA profile:[\s\S]*?(?=\n\n|$)/i, '')
      .trim();

    if (!notes) {
      return Response.json({ skipped: true, reason: 'no LO remarks to sync' });
    }

    const webhookUrl = secrets.get('CRM_LOS_WEBHOOK_URL');
    const webhookSecret = secrets.get('CRM_LOS_WEBHOOK_SECRET');

    if (!webhookUrl || !webhookSecret) {
      return Response.json({ error: 'CRM webhook secrets not configured' }, { status: 500 });
    }

    const payload = {
      loanId,
      notes,
      stage: loan.stage || null,
    };

    const crmResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!crmResponse.ok) {
      const detail = await crmResponse.text().catch(() => '');
      return Response.json(
        { error: 'CRM webhook failed', status: crmResponse.status, detail },
        { status: 502 }
      );
    }

    return Response.json({ synced: true, payload });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
