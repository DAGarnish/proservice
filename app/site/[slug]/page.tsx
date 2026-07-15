import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { FallbackMockup, BriefSnippet } from '@/app/preview/[id]/page';
import { getPreviewPalette } from '@/lib/mockPreviewGenerator';

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const site = await prisma.websiteSubmission.findUnique({
    where: { slug },
  });

  if (!site) return { title: 'Site Not Found' };

  return {
    title: `${site.business_name} | ${site.occupation}`,
    description: `Professional ${site.occupation} services in ${site.main_city}.`,
    openGraph: {
      title: site.business_name,
      description: site.differentiator || `Welcome to ${site.business_name}`,
    },
  };
}

export default async function LiveSitePage({ params }: Props) {
  const { slug } = await params;

  // Fetch the site using the slug
  const site = await prisma.websiteSubmission.findUnique({
    where: { slug }
  });

  if (!site) {
    notFound();
  }

  // If the AI generated HTML exists, render it directly
  if (site.generatedHtml) {
    return (
      <div 
        className="live-site-container"
        dangerouslySetInnerHTML={{ __html: site.generatedHtml }} 
      />
    );
  }

  // If HTML is not yet generated, render the fallback mockup
  const palette = getPreviewPalette(site.selected_website_look || 'professional-blue');
  
  return (
    <FallbackMockup 
      brief={site as unknown as BriefSnippet} 
      palette={palette} 
    />
  );
}
