import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = String(body.code || '').trim();
    if (!code) return Response.json({ error: 'Verification code is required' }, { status: 400 });

    const storedCode = user.sms_verification_code;
    const expires = user.sms_verification_expires;

    if (!storedCode || !expires) {
      return Response.json({ error: 'No verification code on file. Please request a new code.' }, { status: 400 });
    }

    if (new Date(expires) < new Date()) {
      return Response.json({ error: 'Verification code expired. Please request a new code.' }, { status: 400 });
    }

    if (code !== storedCode) {
      return Response.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Clear the code and mark first login as completed
    await base44.entities.User.update(user.id, {
      sms_verification_code: null,
      sms_verification_expires: null,
      first_login_completed: true,
    });

    return Response.json({ verified: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to verify code' },
      { status: 500 },
    );
  }
}