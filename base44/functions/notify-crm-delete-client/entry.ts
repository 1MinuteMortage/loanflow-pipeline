import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const role = String(user.role || user.app_role || '').toLowerCase();
    if (role !== 'admin') {
      return Response.json({ error: 'Only an administrator can delete a client' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const loanId = body.loanId;
    if (!loanId) return Response.json({ error: 'loanId is required' }, { status: 400 });

    const loan = await base44.entities.Loan.get(loanId);
    const webhookUrl = secrets.get('CRM_LOS_WEBHOOK_URL');
    const webhookSecret = secrets.get('CRM_LOS_WEBHOOK_SECRET');

    if (!webhookUrl || !webhookSecret) {
      return Response.json({ error: 'CRM webhook secrets not configured' }, { status: 500 });
    }

    const crmResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret,
      },
      body: JSON.stringify({
        action: 'delete_client',
        loanId,
        notes: loan?.notes || null,
      }),
    });

    if (!crmResponse.ok) {
      const detail = await crmResponse.text().catch(() => '');
      return Response.json(
        { error: 'The realtor app was not updated. This file was kept.', status: crmResponse.status, detail },
        { status: 502 }
      );
    }

    return Response.json({ synced: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
