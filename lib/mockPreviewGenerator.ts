// lib/mockPreviewGenerator.ts
// Generates a realistic mock preview payload from the structured brief.
// Used when no real generation provider is connected (GENERATION_API_KEY is not set).
// Replace the generation logic in the API route to call a real AI provider.

import { StructuredBrief, PreviewPayload } from '@/types/form';

const LOOK_PALETTES: Record<string, { primary: string; secondary: string; accent: string }> = {
  'professional-blue': { primary: '#1D4ED8', secondary: '#DBEAFE', accent: '#0F172A' },
  'local-green': { primary: '#15803D', secondary: '#DCFCE7', accent: '#14532D' },
  'warm-premium': { primary: '#8B5E3C', secondary: '#F5E6D3', accent: '#3F2A1D' },
  'dark-regal': { primary: '#312E81', secondary: '#E0E7FF', accent: '#111827' },
  'clean-minimal': { primary: '#374151', secondary: '#F3F4F6', accent: '#111827' },
  'bold-strong': { primary: '#B91C1C', secondary: '#FEE2E2', accent: '#450A0A' },
};

function generateId(): string {
  return `prev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function calculateMonthly(brief: StructuredBrief): { monthlyTotal: number; addOns: string[] } {
  let monthlyTotal = 50; // base
  const addOns: string[] = ['Website hosting included'];

  if (brief.google_listing_option) {
    addOns.push('Google listing setup/optimisation — $50 one-time');
  }
  if (brief.branded_domain_option) {
    addOns.push('Extended refinement & extra pages — $50 one-time');
  }

  return { monthlyTotal, addOns };
}

function getServicesList(brief: StructuredBrief): string[] {
  const raw = brief.main_services || brief.occupation;
  if (!raw) return ['Professional services', 'Expert consultations', 'Quality workmanship'];

  return raw
    .split(/[,\n;]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function getTestimonials(brief: StructuredBrief): Array<{ name: string; text: string; rating: number }> {
  if (brief.testimonials) {
    // Try to parse user-provided testimonials
    const parts = brief.testimonials.split(/\n{2,}|\|/).map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts.slice(0, 3).map((t, i) => ({
        name: `Happy Customer ${i + 1}`,
        text: t,
        rating: 5,
      }));
    }
  }

  // Fallback mock testimonials based on occupation
  const occ = brief.occupation?.toLowerCase() || 'service';
  return [
    {
      name: 'Sarah M.',
      text: `Absolutely fantastic service! ${brief.business_name} were professional, prompt, and the quality of work was outstanding. Would highly recommend to anyone in ${brief.service_area || brief.seo_locations.split(';')[0] || 'the area'}.`,
      rating: 5,
    },
    {
      name: 'James T.',
      text: `I've used a few ${occ} businesses before but ${brief.business_name} are by far the best. Transparent pricing, great communication, and top-quality work.`,
      rating: 5,
    },
    {
      name: 'Linda K.',
      text: `Called them for an urgent job and they came out the same day. Excellent work at a fair price. Will definitely be using them again.`,
      rating: 5,
    },
  ];
}

export function generateMockPreview(brief: StructuredBrief): PreviewPayload {
  const palette = LOOK_PALETTES[brief.selected_website_look] || LOOK_PALETTES['professional-blue'];
  const plan = calculateMonthly(brief);

  return {
    previewId: generateId(),
    brief: {
      ...brief,
      // Inject resolved palette so the preview can use colors
      preferred_colours: brief.preferred_colours || palette.primary,
    },
    generatedAt: new Date().toISOString(),
    planSummary: plan,
  };
}

export function getPreviewPalette(lookId: string) {
  return LOOK_PALETTES[lookId] || LOOK_PALETTES['professional-blue'];
}

export function getPreviewServices(brief: StructuredBrief): string[] {
  return getServicesList(brief);
}

export function getPreviewTestimonials(brief: StructuredBrief) {
  return getTestimonials(brief);
}
