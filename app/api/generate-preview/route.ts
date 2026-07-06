// app/api/generate-preview/route.ts
// SECURE server-side endpoint for preview generation.
// The frontend NEVER calls the AI provider directly.
// API keys and credentials ONLY exist in server-side env vars.

import { NextRequest, NextResponse } from 'next/server';
import { buildWebsiteBrief } from '@/lib/promptBuilder';
import { checkRateLimit, recordRequest } from '@/lib/rateLimiter';
import { logRequest } from '@/lib/requestLogger';
import { generateMockPreview } from '@/lib/mockPreviewGenerator';
import { FormData, GenerationResponse } from '@/types/form';

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

    // 3. Build structured brief
    const { structured, naturalLanguage } = buildWebsiteBrief(body as FormData);

    // 4. Generate preview
    // ─────────────────────────────────────────────────────────────────
    // PRODUCTION INTEGRATION POINT:
    // If GENERATION_API_KEY is set, call your AI provider here.
    // The naturalLanguage brief is ready to send as the generation prompt.
    //
    // Example (OpenAI):
    //   const response = await openai.chat.completions.create({
    //     model: 'gpt-4o',
    //     messages: [{ role: 'user', content: naturalLanguage }],
    //   });
    //
    // Example (Anthropic Claude):
    //   const response = await anthropic.messages.create({
    //     model: 'claude-opus-4-5',
    //     messages: [{ role: 'user', content: naturalLanguage }],
    //   });
    //
    // The API key MUST only be read from process.env here — never in client code.
    // ─────────────────────────────────────────────────────────────────

    const hasRealProvider = !!process.env.GENERATION_API_KEY;

    let previewData;

    if (hasRealProvider) {
      // TODO: Call real AI provider and parse response into PreviewPayload format
      // For now, fall through to mock
      previewData = generateMockPreview(structured);
    } else {
      // Use mock generator — realistic preview from structured data
      previewData = generateMockPreview(structured);
    }

    // 5. Record successful request (for rate limiting and logging)
    recordRequest(ip, email, businessName);

    logRequest({
      ip,
      email,
      businessName,
      occupation: structured.occupation,
      status: 'success',
      previewId: previewData.previewId,
      durationMs: Date.now() - startTime,
    });

    // 6. Return only the preview payload — no credentials, no brief internals
    return NextResponse.json({
      success: true,
      previewId: previewData.previewId,
      previewData,
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
