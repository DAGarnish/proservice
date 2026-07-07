// app/api/regenerate-preview/[id]/route.ts
// SECURE server-side endpoint to regenerate a saved website preview in Next.js using Gemini AI.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildWebsiteBrief } from '@/lib/promptBuilder';
import { generateMockPreview } from '@/lib/mockPreviewGenerator';
import { generateWebsiteWithGemini } from '@/lib/geminiGenerator';
import { FormData } from '@/types/form';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: 'Preview ID is required' }, { status: 400 });
  }

  try {
    const submission = await prisma.websiteSubmission.findFirst({
      where: { previewId: id },
    });

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

    // 4. Update submission in database
    await prisma.websiteSubmission.update({
      where: { id: submission.id },
      data: {
        generatedHtml,
      },
    });

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
