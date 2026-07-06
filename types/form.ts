// types/form.ts
// Central type definitions for the PROSERVICE intake form

export type WebsiteLookId =
  | 'professional-blue'
  | 'local-green'
  | 'warm-premium'
  | 'dark-regal'
  | 'clean-minimal'
  | 'bold-strong';

export type MainCTA = 'call' | 'quote' | 'book' | 'whatsapp' | 'email' | 'visit';

export type BookingOrWhatsapp = 'booking' | 'whatsapp' | 'none';

export interface FormData {
  // Step 1 — Business Basics
  business_name: string;
  contact_name: string;
  phone_number: string;
  email_address: string;
  business_address: string;
  service_area: string;
  occupation: string;
  years_in_business: string;

  // Step 2 — Services
  main_services: string;
  specialities: string;
  price_list: string;
  top_services_to_promote: string;
  emergency_service: boolean;
  main_cta: MainCTA;

  // Step 3 — Trust & Credibility
  differentiator: string;
  qualifications: string;
  insurance: boolean;
  memberships: string;
  specialist_tools: string;
  testimonials: string;
  notable_work: string;
  guarantees: string;

  // Step 4 — Brand & Style
  style_preference: string[];
  preferred_colours: string;
  selected_website_look: WebsiteLookId;
  match_logo_colours: boolean;
  logo_uploaded: boolean;
  photos_uploaded: boolean;
  example_websites: string;
  avoid_on_site: string;

  // Step 5 — SEO & Location
  main_city: string;
  full_service_area: string;
  priority_locations: string;
  seo_keywords: string;
  service_pages: boolean;
  location_pages: boolean;

  // Step 6 — Conversion Details
  contact_number_to_show: string;
  contact_email_to_show: string;
  contact_form: boolean;
  google_maps: boolean;
  testimonials_on_site: boolean;
  quote_request_form: boolean;
  booking_or_whatsapp: BookingOrWhatsapp;

  // Step 7 — Add-ons & Final Details
  google_listing_option: boolean;
  branded_domain_option: boolean;
  additional_notes: string;
  seasonal_offers: string;
  competitors: string;
  avoid_wording: string;
}

export const defaultFormData: FormData = {
  business_name: '',
  contact_name: '',
  phone_number: '',
  email_address: '',
  business_address: '',
  service_area: '',
  occupation: '',
  years_in_business: '',

  main_services: '',
  specialities: '',
  price_list: '',
  top_services_to_promote: '',
  emergency_service: false,
  main_cta: 'call',

  differentiator: '',
  qualifications: '',
  insurance: false,
  memberships: '',
  specialist_tools: '',
  testimonials: '',
  notable_work: '',
  guarantees: '',

  style_preference: [],
  preferred_colours: '',
  selected_website_look: 'professional-blue',
  match_logo_colours: false,
  logo_uploaded: false,
  photos_uploaded: false,
  example_websites: '',
  avoid_on_site: '',

  main_city: '',
  full_service_area: '',
  priority_locations: '',
  seo_keywords: '',
  service_pages: true,
  location_pages: true,

  contact_number_to_show: '',
  contact_email_to_show: '',
  contact_form: true,
  google_maps: true,
  testimonials_on_site: true,
  quote_request_form: true,
  booking_or_whatsapp: 'none',

  google_listing_option: false,
  branded_domain_option: false,
  additional_notes: '',
  seasonal_offers: '',
  competitors: '',
  avoid_wording: '',
};

// Structured brief sent to the generation server
export interface StructuredBrief {
  business_name: string;
  contact_name: string;
  phone_number: string;
  email_address: string;
  business_address: string;
  service_area: string;
  occupation: string;
  years_in_business: string;
  main_services: string;
  specialities: string;
  price_list: string;
  top_services_to_promote: string;
  emergency_service: boolean;
  main_cta: string;
  differentiator: string;
  qualifications: string;
  insurance: boolean;
  memberships: string;
  specialist_tools: string;
  testimonials: string;
  notable_work: string;
  guarantees: string;
  style_preference: string[];
  preferred_colours: string;
  selected_website_look: string;
  has_logo: boolean;
  has_photos: boolean;
  example_websites: string;
  avoid_on_site: string;
  seo_locations: string;
  seo_keywords: string;
  contact_number_to_show: string;
  contact_email_to_show: string;
  contact_form: boolean;
  google_maps: boolean;
  testimonials_on_site: boolean;
  quote_request_form: boolean;
  booking_or_whatsapp: string;
  google_listing_option: boolean;
  branded_domain_option: boolean;
  additional_notes: string;
  seasonal_offers: string;
  competitors: string;
  avoid_wording: string;
}

export interface WebsiteBrief {
  structured: StructuredBrief;
  naturalLanguage: string;
}

// Preview payload returned from the secure server route
export interface PreviewPayload {
  previewId: string;
  brief: StructuredBrief;
  generatedAt: string;
  planSummary: {
    monthlyTotal: number;
    addOns: string[];
  };
}

export interface GenerationRequest {
  formData: Omit<FormData, 'logo_uploaded' | 'photos_uploaded'> & {
    has_logo: boolean;
    has_photos: boolean;
  };
}

export interface GenerationResponse {
  success: boolean;
  previewId?: string;
  previewData?: PreviewPayload;
  error?: string;
  rateLimited?: boolean;
}
