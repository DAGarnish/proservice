// app/api/regenerate-preview/[id]/route.ts
// SECURE server-side endpoint to regenerate a saved website preview in Next.js using Gemini AI.

import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrismaRetry } from '@/lib/prisma';
import { buildWebsiteBrief } from '@/lib/promptBuilder';
import { generateMockPreview } from '@/lib/mockPreviewGenerator';
import { generateWebsiteWithGemini } from '@/lib/geminiGenerator';
import { FormData } from '@/types/form';
import { enhanceGeneratedHtml } from '@/lib/htmlSafeguard';
import { sendWelcomePreviewEmail } from '@/lib/email';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: 'Preview ID is required' }, { status: 400 });
  }

  try {
    const submission = await withPrismaRetry(() => prisma.websiteSubmission.findFirst({
      where: { previewId: id },
    }));

    if (!submission) {
      return NextResponse.json({ success: false, error: 'Saved website project not found' }, { status: 404 });
    }

    // 1. Build brief from stored submission fields
    const { structured, naturalLanguage } = buildWebsiteBrief(submission as unknown as FormData);

    // 2. Generate updated mock preview data
    const previewData = generateMockPreview(structured);

    // 3. Call Google Gemini server-side if API key is present
    let generatedHtml = '';
    const hasGemini = !!process.env.GEMINI_API_KEY;

    if (hasGemini) {
      try {
        generatedHtml = await generateWebsiteWithGemini(naturalLanguage);
      } catch (geminiError) {
        console.error('[PROSERVICE] Gemini regeneration failed, keeping existing or fallback:', geminiError);
      }
    }

    // If Gemini failed or key is not set, keep existing generatedHtml if available
    if (!generatedHtml && submission.generatedHtml) {
      generatedHtml = submission.generatedHtml;
    }

    // ── Guarantee Logo & Photo Embedding + Mobile Header Auto-Close Safeguard ──
    if (generatedHtml) {
      generatedHtml = enhanceGeneratedHtml(
        generatedHtml,
        submission.logo_data_url,
        submission.business_name,
        submission.uploaded_photos_urls,
        submission.business_address || submission.main_city || submission.service_area || 'USA'
      );
    }

    // 4. Update submission in database
    await withPrismaRetry(() => prisma.websiteSubmission.update({
      where: { id: submission.id },
      data: {
        generatedHtml,
      },
    }));

    // If this is a successful generation (e.g. recovering from a previous failure/deferral during email verification), dispatch welcome email if applicable
    if (generatedHtml && generatedHtml.trim().startsWith('<') && submission.userId) {
      try {
        const user = await withPrismaRetry(() => prisma.user.findUnique({ where: { id: submission.userId! } }));
        if (user && user.email) {
          await sendWelcomePreviewEmail(
            user.email,
            user.name || '',
            submission.business_name || user.businessName || 'Your Business',
            id
          );
          console.log(`[PROSERVICE] Sent welcome preview email from regeneration route to ${user.email}`);
        }
      } catch (emailErr) {
        console.error('[PROSERVICE] Could not send welcome email from regeneration route:', emailErr);
      }
    }

    // 5. Apply viewport and responsive header safeguard to returned HTML
    let html = generatedHtml || '';
    if (html && html.trim().startsWith('<')) {
      if (!html.toLowerCase().includes('name="viewport"') && !html.toLowerCase().includes("name='viewport'")) {
        html = html.replace(/<head>/i, '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
      }
      const responsiveSafeguard = `
<style>
  /* Responsive safeguard for iframe header navigation */
  @media (max-width: 768px) {
    header, nav, .header, .navbar, [class*="header"], [class*="nav"] {
      flex-wrap: wrap !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    header {
      padding: 0.75rem 1rem !important;
      height: auto !important;
      min-height: auto !important;
    }
    nav {
      gap: 0.5rem !important;
      justify-content: center !important;
      width: 100% !important;
      margin-top: 0.5rem !important;
    }
  }
</style>`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${responsiveSafeguard}\n</head>`);
      } else {
        html = `${responsiveSafeguard}\n${html}`;
      }
    }

    return NextResponse.json({
      success: true,
      previewId: submission.previewId,
      generatedHtml: html,
      previewData,
    });
  } catch (error) {
    console.error('[PROSERVICE] Regeneration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate website in Next.js. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
