import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const OTP_URL = 'https://vdcouyronkvgsdclgsgj.supabase.co/functions/v1/login-otp';

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = secrets.get('CRM_LOS_WEBHOOK_SECRET');
    if (!secret) return Response.json({ error: 'Login verification is not configured' }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const action = body.action === 'verify' ? 'verify' : 'send';
    const response = await fetch(OTP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': secret,
      },
      body: JSON.stringify({
        action,
        email: user.email,
        code: body.code || '',
      }),
    });
    const data = await response.json().catch(() => ({}));
    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 },
    );
  }
}
