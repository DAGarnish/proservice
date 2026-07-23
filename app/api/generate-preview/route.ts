// app/api/generate-preview/route.ts
// SECURE server-side endpoint for preview generation.
// The frontend NEVER calls the AI provider directly.
// API keys and credentials ONLY exist in server-side env vars.

import { NextRequest, NextResponse } from 'next/server';
import { buildWebsiteBrief } from '@/lib/promptBuilder';
import { checkRateLimit, recordRequest } from '@/lib/rateLimiter';
import { logRequest } from '@/lib/requestLogger';
import { FormData, GenerationResponse } from '@/types/form';

function getBackendUrl(): string {
  return (process.env.BACKEND_API_URL || 'http://localhost:5000').replace(/\/$/, '');
}

// Helper: get client IP from request headers
function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

// Helper: validate required fields
function validatePayload(body: Partial<FormData>): string | null {
  if (!body.email_address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email_address)) {
    return 'A valid email address is required';
  }
  if (!body.business_name?.trim()) {
    return 'Business name is required';
  }
  if (!body.occupation?.trim()) {
    return 'Business type is required';
  }
  return null;
}

export async function POST(req: NextRequest): Promise<NextResponse<GenerationResponse>> {
  const startTime = Date.now();
  const ip = getClientIP(req);

  let email = '';
  let businessName = '';

  try {
    const body: Partial<FormData> = await req.json();

    email = body.email_address?.toLowerCase().trim() || '';
    businessName = body.business_name?.trim() || '';

    // 1. Validate payload
    const validationError = validatePayload(body);
    if (validationError) {
      logRequest({ ip, email, businessName, occupation: body.occupation || '', status: 'invalid', errorMessage: validationError });
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    // 2. Rate limit check
    const rateLimitResult = checkRateLimit(ip, email, businessName);
    if (!rateLimitResult.allowed) {
      logRequest({ ip, email, businessName, occupation: body.occupation || '', status: 'rate_limited', errorMessage: rateLimitResult.reason });
      return NextResponse.json(
        { success: false, error: rateLimitResult.reason, rateLimited: true },
        { status: 429 }
      );
    }

    // 3. Build structured brief (used only for logging below)
    const { structured } = buildWebsiteBrief(body as FormData);

    // 4. Delegate the actual API handling — User + WebsiteSubmission DB writes,
    // verification token generation, and email dispatch — to the backend.
    // This is a real server-to-server call, not a browser request, so a failed
    // or unreachable backend surfaces as a real error instead of a silent no-op.
    const backendRes = await fetch(`${getBackendUrl()}/api/v1/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const backendResult = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok || !backendResult.success) {
      const message = backendResult.error || `Backend responded with status ${backendRes.status}`;
      logRequest({
        ip, email, businessName,
        occupation: structured.occupation,
        status: 'error',
        errorMessage: message,
        durationMs: Date.now() - startTime,
      });
      console.error('[PROSERVICE] Backend rejected submission:', message);
      return NextResponse.json({ success: false, error: message }, { status: backendRes.status || 502 });
    }

    // 5. Record successful request (for rate limiting and logging)
    recordRequest(ip, email, businessName);

    logRequest({
      ip,
      email,
      businessName,
      occupation: structured.occupation,
      status: 'success',
      previewId: backendResult.previewId,
      durationMs: Date.now() - startTime,
    });

    // 6. Return the preview payload along with user account & verification token details
    return NextResponse.json({
      success: true,
      previewId: backendResult.previewId,
      userId: backendResult.userId,
      verificationToken: backendResult.verificationToken,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';

    logRequest({
      ip,
      email,
      businessName,
      occupation: '',
      status: 'error',
      errorMessage: message,
      durationMs: Date.now() - startTime,
    });

    console.error('[PROSERVICE] Preview generation error:', error);

    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Block all non-POST methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
