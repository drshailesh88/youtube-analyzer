import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Verify Slack request signature
function verifySlackRequest(req: NextRequest, body: string): boolean {
  const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
  if (!slackSigningSecret) {
    console.error('SLACK_SIGNING_SECRET not configured');
    return false;
  }

  const slackSignature = req.headers.get('x-slack-signature');
  const slackTimestamp = req.headers.get('x-slack-request-timestamp');

  if (!slackSignature || !slackTimestamp) {
    return false;
  }

  // Prevent replay attacks
  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - parseInt(slackTimestamp)) > 300) {
    return false;
  }

  const sigBasestring = `v0:${slackTimestamp}:${body}`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', slackSigningSecret)
    .update(sigBasestring)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(slackSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // Verify request is from Slack
    if (!verifySlackRequest(req, body)) {
      return NextResponse.json(
        { error: 'Invalid request signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      return NextResponse.json({
        challenge: payload.challenge,
      });
    }

    // Handle interactive messages (button clicks)
    if (payload.type === 'block_actions') {
      // Handle button actions here if needed
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Slack events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
