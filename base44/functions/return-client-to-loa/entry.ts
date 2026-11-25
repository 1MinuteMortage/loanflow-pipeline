import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { secrets } from 'base44:runtime';

const RETURN_URL = 'https://vdcouyronkvgsdclgsgj.supabase.co/functions/v1/return-client-to-loa';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const loanId = body.loanId;
    if (!loanId) return Response.json({ error: 'loanId is required' }, { status: 400 });

    await base44.entities.Loan.get(loanId);

    const webhookSecret = secrets.get('CRM_LOS_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return Response.json({ error: 'CRM webhook secret not configured' }, { status: 500 });
    }

    const response = await fetch(RETURN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret,
      },
      body: JSON.stringify({ loanId }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
      return Response.json({ error: data.error || 'Could not return this client' }, { status: 502 });
    }
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
