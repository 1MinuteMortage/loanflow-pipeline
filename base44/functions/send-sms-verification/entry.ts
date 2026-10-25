import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const phone = user.phone_number;
    if (!phone) {
      return Response.json({ error: 'No phone number on file' }, { status: 400 });
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store code on user record
    await base44.entities.User.update(user.id, {
      sms_verification_code: code,
      sms_verification_expires: expires,
    });

    // Send SMS via Twilio
    const accountSid = secrets.get('TWILIO_ACCOUNT_SID');
    const authToken = secrets.get('TWILIO_AUTH_TOKEN');
    const fromNumber = secrets.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Twilio secrets not configured');
      return Response.json({ error: 'SMS service not configured. Add Twilio secrets in the dashboard.' }, { status: 503 });
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams();
    body.append('To', phone);
    body.append('From', fromNumber);
    body.append('Body', `Your LoanFlow Pipeline verification code is: ${code}`);

    const authHeader = btoa(`${accountSid}:${authToken}`);
    const smsResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(10000),
    });

    if (!smsResponse.ok) {
      const errText = await smsResponse.text().catch(() => '');
      console.error('Twilio SMS failed', smsResponse.status, errText);
      return Response.json({ error: 'Failed to send SMS' }, { status: 502 });
    }

    return Response.json({ sent: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to send verification code' },
      { status: 500 },
    );
  }
}