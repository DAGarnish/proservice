// app/api/preview-html/[id]/route.ts
// Serves the AI-generated HTML for a given previewId.
// Used by the preview page to load the website into an iframe via srcDoc.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Preview ID is required' }, { status: 400 });
  }

  try {
    const submission = await prisma.websiteSubmission.findFirst({
      where: { previewId: id },
      select: {
        generatedHtml: true,
        business_name: true,
        occupation: true,
        contact_number_to_show: true,
        contact_email_to_show: true,
        service_area: true,
        selected_website_look: true,
        main_cta: true,
        insurance: true,
        emergency_service: true,
        differentiator: true,
        guarantees: true,
        qualifications: true,
        testimonials_on_site: true,
        contact_form: true,
        google_maps: true,
        google_listing_option: true,
        branded_domain_option: true,
        years_in_business: true,
        main_services: true,
        seo_keywords: true,
        main_city: true,
        full_service_area: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Preview not found' }, { status: 404 });
    }

    let html = submission.generatedHtml || '';
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
      generatedHtml: html,
      brief: {
        business_name: submission.business_name,
        occupation: submission.occupation,
        contact_number_to_show: submission.contact_number_to_show,
        contact_email_to_show: submission.contact_email_to_show,
        service_area: submission.service_area,
        selected_website_look: submission.selected_website_look,
        main_cta: submission.main_cta,
        insurance: submission.insurance,
        emergency_service: submission.emergency_service,
        differentiator: submission.differentiator,
        guarantees: submission.guarantees,
        qualifications: submission.qualifications,
        testimonials_on_site: submission.testimonials_on_site,
        contact_form: submission.contact_form,
        google_maps: submission.google_maps,
        google_listing_option: submission.google_listing_option,
        branded_domain_option: submission.branded_domain_option,
        years_in_business: submission.years_in_business,
        main_services: submission.main_services,
        seo_keywords: submission.seo_keywords,
        main_city: submission.main_city,
        full_service_area: submission.full_service_area,
      },
    });
  } catch (error) {
    console.error('[PROSERVICE] Failed to fetch preview HTML:', error);
    return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 });
  }
}
