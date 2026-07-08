// app/api/generate-preview/route.ts
// SECURE server-side endpoint for preview generation.
// The frontend NEVER calls the AI provider directly.
// API keys and credentials ONLY exist in server-side env vars.

import { NextRequest, NextResponse } from 'next/server';
import { buildWebsiteBrief } from '@/lib/promptBuilder';
import { checkRateLimit, recordRequest } from '@/lib/rateLimiter';
import { logRequest } from '@/lib/requestLogger';
import { generateMockPreview } from '@/lib/mockPreviewGenerator';
import { generateWebsiteWithGemini } from '@/lib/geminiGenerator';
import { FormData, GenerationResponse } from '@/types/form';
import { prisma, withPrismaRetry } from '@/lib/prisma';
import { sendSubmissionEmail } from '@/lib/email';
import { enhanceGeneratedHtml } from '@/lib/htmlSafeguard';

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

    // 4. Generate the website HTML
    // ─────────────────────────────────────────────────────────────────
    // Uses Gemini if GEMINI_API_KEY is set; falls back to mock preview.
    // The API key MUST only be read from process.env — never in client code.
    // ─────────────────────────────────────────────────────────────────
    const previewData = generateMockPreview(structured);
    const previewId = previewData.previewId;

    let generatedHtml = '';
    const hasGemini = !!process.env.GEMINI_API_KEY;

    if (hasGemini) {
      try {
        generatedHtml = await generateWebsiteWithGemini(naturalLanguage);
      } catch (geminiError) {
        console.error('[PROSERVICE] Gemini generation failed, using mock fallback:', geminiError);
        // generatedHtml stays empty — preview page will use the mock React render
      }
    }

    // ── Guarantee Logo & Photo Embedding + Mobile Header Auto-Close Safeguard ──
    if (generatedHtml) {
      generatedHtml = enhanceGeneratedHtml(
        generatedHtml,
        body.logo_data_url,
        body.business_name,
        Array.isArray(body.uploaded_photos_urls) ? body.uploaded_photos_urls : [],
        body.business_address || body.main_city || body.service_area || 'USA'
      );
    }

    // 5. Save submission to database via Prisma
    const submissionData: any = {
      business_name: body.business_name || '',
      contact_name: body.contact_name || '',
      phone_number: body.phone_number || '',
      email_address: body.email_address || '',
      business_address: body.business_address || '',
      service_area: body.service_area || '',
      occupation: body.occupation || '',
      years_in_business: body.years_in_business || '',
      main_services: body.main_services || '',
      specialities: body.specialities || '',
      price_list: body.price_list || '',
      top_services_to_promote: body.top_services_to_promote || '',
      emergency_service: Boolean(body.emergency_service),
      main_cta: body.main_cta || 'call',
      differentiator: body.differentiator || '',
      qualifications: body.qualifications || '',
      insurance: Boolean(body.insurance),
      memberships: body.memberships || '',
      specialist_tools: body.specialist_tools || '',
      testimonials: body.testimonials || '',
      notable_work: body.notable_work || '',
      guarantees: body.guarantees || '',
      style_preference: Array.isArray(body.style_preference) ? body.style_preference : [],
      preferred_colours: body.preferred_colours || '',
      selected_website_look: body.selected_website_look || 'professional-blue',
      match_logo_colours: Boolean(body.match_logo_colours),
      logo_uploaded: Boolean(body.logo_uploaded),
      logo_data_url: body.logo_data_url || '',
      photos_uploaded: Boolean(body.photos_uploaded),
      uploaded_photos_urls: Array.isArray(body.uploaded_photos_urls) ? body.uploaded_photos_urls : [],
      example_websites: body.example_websites || '',
      avoid_on_site: body.avoid_on_site || '',
      main_city: body.main_city || '',
      full_service_area: body.full_service_area || '',
      priority_locations: body.priority_locations || '',
      seo_keywords: body.seo_keywords || '',
      service_pages: body.service_pages !== undefined ? Boolean(body.service_pages) : true,
      location_pages: body.location_pages !== undefined ? Boolean(body.location_pages) : true,
      contact_number_to_show: body.contact_number_to_show || '',
      contact_email_to_show: body.contact_email_to_show || '',
      contact_form: body.contact_form !== undefined ? Boolean(body.contact_form) : true,
      google_maps: body.google_maps !== undefined ? Boolean(body.google_maps) : true,
      testimonials_on_site: body.testimonials_on_site !== undefined ? Boolean(body.testimonials_on_site) : true,
      quote_request_form: body.quote_request_form !== undefined ? Boolean(body.quote_request_form) : true,
      booking_or_whatsapp: body.booking_or_whatsapp || 'none',
      google_listing_option: Boolean(body.google_listing_option),
      branded_domain_option: Boolean(body.branded_domain_option),
      additional_notes: body.additional_notes || '',
      seasonal_offers: body.seasonal_offers || '',
      competitors: body.competitors || '',
      avoid_wording: body.avoid_wording || '',
      previewId,
      generatedHtml,
    };

    try {
      await withPrismaRetry(() => prisma.websiteSubmission.create({
        data: submissionData,
      }));
    } catch (dbError: any) {
      if (dbError?.message?.includes('uploaded_photos_urls')) {
        console.warn('[PROSERVICE] Notice: Prisma Client cache is outdated in running server. Retrying creation without uploaded_photos_urls...');
        delete submissionData.uploaded_photos_urls;
        try {
          await withPrismaRetry(() => prisma.websiteSubmission.create({
            data: submissionData,
          }));
        } catch (retryErr: any) {
          console.error('[PROSERVICE] Could not save to Postgres after retry:', retryErr.message);
        }
      } else {
        console.error('[PROSERVICE] Database save error (Postgres connection/offline):', dbError.message);
        // Do not throw! Let the user proceed to the live preview!
      }
    }

    // 6. Send email notification via Nodemailer (non-blocking)
    try {
      await sendSubmissionEmail(body as FormData, previewId);
    } catch (emailError) {
      console.error('[PROSERVICE] Failed to send notification email:', emailError);
    }

    // 7. Record successful request (for rate limiting and logging)
    recordRequest(ip, email, businessName);

    logRequest({
      ip,
      email,
      businessName,
      occupation: structured.occupation,
      status: 'success',
      previewId,
      durationMs: Date.now() - startTime,
    });

    // 8. Return only the preview payload — no credentials, no brief internals
    return NextResponse.json({
      success: true,
      previewId,
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
