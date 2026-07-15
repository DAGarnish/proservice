import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrismaRetry } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { previewId } = await req.json();

    if (!previewId) {
      return NextResponse.json({ success: false, error: 'Preview ID is required' }, { status: 400 });
    }

    const site = await withPrismaRetry(() => 
      prisma.websiteSubmission.findFirst({ where: { previewId } })
    );

    if (!site) {
      return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
    }

    // If it already has a slug, just return it
    if (site.slug) {
      return NextResponse.json({ success: true, slug: site.slug });
    }

    // Generate a URL-friendly slug based on the business name
    let baseSlug = site.business_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    if (!baseSlug) baseSlug = 'my-site';

    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await withPrismaRetry(() => prisma.websiteSubmission.findUnique({ where: { slug } }));
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Save the slug to publish it
    await withPrismaRetry(() => prisma.websiteSubmission.update({
      where: { id: site.id },
      data: { slug }
    }));

    return NextResponse.json({ success: true, slug });

  } catch (err: any) {
    console.error('[PROSERVICE] Publish API Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to publish site' }, { status: 500 });
  }
}
