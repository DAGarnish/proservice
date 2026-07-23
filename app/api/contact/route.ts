import { NextResponse } from 'next/server';

function getBackendUrl(): string {
  return (process.env.BACKEND_API_URL || 'http://localhost:5000').replace(/\/$/, '');
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { first_name, last_name, email_address, phone_number, message } = data;

    if (!first_name || !last_name || !email_address || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Delegate the DB write + notification email to the backend, which owns
    // the ContactSubmission table. A failed/unreachable backend now surfaces
    // as a real error instead of silently dropping the message.
    const backendRes = await fetch(`${getBackendUrl()}/api/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name, last_name, email_address, phone_number, message }),
    });

    const backendResult = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok || !backendResult.success) {
      const errorMessage = backendResult.error || `Backend responded with status ${backendRes.status}`;
      console.error('[PROSERVICE] Backend rejected contact submission:', errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: backendRes.status || 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
