// app/preview/[id]/page.tsx
// Result screen showing the generated website preview

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, AlertTriangle, Phone, MapPin, Mail, 
  Clock, Shield, Star, ChevronRight, Menu
} from 'lucide-react';
import { PreviewPayload } from '@/types/form';
import { getPreviewPalette, getPreviewServices, getPreviewTestimonials } from '@/lib/mockPreviewGenerator';
import styles from './preview.module.css';

export default function PreviewPage() {
  const params = useParams();
  const previewId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PreviewPayload | null>(null);

  // In a real app, this would fetch from a database using the previewId.
  // For this MVP, we simulate loading and then read from local storage if we had to,
  // but since we returned it in the API response, we actually need to fetch it 
  // or pass it via context/storage. 
  // Since we didn't set up context, we'll mock the fetch for the demo:
  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
       // We'll create a dummy payload for the visual demo since we don't have DB persistence yet
       setData({
         previewId,
         brief: {
           business_name: 'Example Services',
           contact_name: 'John Doe',
           phone_number: '(555) 123-4567',
           email_address: 'john@example.com',
           business_address: '123 Main St',
           service_area: 'Austin, TX',
           occupation: 'Home Services',
           years_in_business: '10',
           main_services: 'Repairs, Installations, Maintenance',
           specialities: '',
           price_list: '',
           top_services_to_promote: '',
           emergency_service: true,
           main_cta: 'call',
           differentiator: 'Family owned',
           qualifications: 'Licensed & Insured',
           insurance: true,
           memberships: '',
           specialist_tools: '',
           testimonials: '',
           notable_work: '',
           guarantees: '100% Satisfaction',
           style_preference: [],
           preferred_colours: '#1D4ED8',
           selected_website_look: 'professional-blue',
           has_logo: false,
           has_photos: false,
           example_websites: '',
           avoid_on_site: '',
           seo_locations: 'Austin, TX',
           seo_keywords: '',
           contact_number_to_show: '(555) 123-4567',
           contact_email_to_show: 'john@example.com',
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
         },
         generatedAt: new Date().toISOString(),
         planSummary: {
           monthlyTotal: 50,
           addOns: ['Website hosting included']
         }
       });
       setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [previewId]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
         <div className={styles.spinner} />
         <h2 style={{ marginTop: 'var(--space-6)' }}>Generating your website...</h2>
         <p style={{ color: 'var(--color-gray-500)', marginTop: 'var(--space-2)' }}>
            Our AI is writing copy, selecting layouts, and applying your brand styles.
         </p>
      </div>
    );
  }

  if (!data) return <div>Error loading preview.</div>;

  const { brief, planSummary } = data;
  const palette = getPreviewPalette(brief.selected_website_look);
  const servicesList = getPreviewServices(brief);
  const testimonialsList = getPreviewTestimonials(brief);

  return (
    <div className={styles.pageContainer}>
      
      {/* Top Action Bar */}
      <div className={styles.actionBar}>
         <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Your Website Preview</div>
               <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>Desktop View</div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
               <button className="btn btn-outline">Request Changes</button>
               <button className="btn btn-primary">I Like This — Get Online</button>
            </div>
         </div>
      </div>

      {/* Main Layout */}
      <div className="container" style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
         
         {/* Preview Frame */}
         <div className={styles.previewFrameWrapper}>
            <div className={styles.browserHeader}>
               <div className={styles.browserDots}>
                  <div className={styles.browserDot} style={{ background: '#ef4444' }} />
                  <div className={styles.browserDot} style={{ background: '#f59e0b' }} />
                  <div className={styles.browserDot} style={{ background: '#22c55e' }} />
               </div>
               <div className={styles.browserUrl}>
                  {brief.business_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.proservice.website
               </div>
            </div>
            
            <div className={styles.previewCanvas}>
               {/* --- GENERATED WEBSITE MOCKUP --- */}
               <div style={{ '--theme-primary': palette.primary, '--theme-secondary': palette.secondary, '--theme-accent': palette.accent } as any}>
                  
                  {/* Header */}
                  <header className={styles.mockHeader}>
                     <div className={styles.mockLogo}>{brief.business_name}</div>
                     <div className={styles.mockNav}>
                        <span>Services</span>
                        <span>About</span>
                        <span>Reviews</span>
                        <span>Contact</span>
                     </div>
                     <button className={styles.mockBtnPrimary} style={{ background: 'var(--theme-primary)' }}>
                        {brief.main_cta === 'quote' ? 'Get a Quote' : brief.contact_number_to_show}
                     </button>
                  </header>

                  {/* Hero */}
                  <section className={styles.mockHero} style={{ background: 'var(--theme-primary)' }}>
                     <div className={styles.mockHeroContent}>
                        {brief.emergency_service && (
                           <div className={styles.mockEmergencyBadge}>
                              <AlertTriangle size={14} /> 24/7 Emergency Service Available
                           </div>
                        )}
                        <h1 className={styles.mockHeroTitle}>
                           Expert {brief.occupation} in {brief.service_area || brief.seo_locations.split(';')[0]}
                        </h1>
                        <p className={styles.mockHeroSub}>
                           Professional, reliable, and affordable {brief.occupation.toLowerCase()} services. 
                           {brief.years_in_business ? ` Over ${brief.years_in_business} of experience.` : ''}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                           <button className={styles.mockBtnAccent} style={{ background: 'var(--theme-accent)' }}>
                              {brief.main_cta === 'quote' ? 'Request Free Quote' : 'Call Now'}
                           </button>
                           <button className={styles.mockBtnOutline}>Our Services</button>
                        </div>
                     </div>
                  </section>

                  {/* Trust Strip */}
                  <div className={styles.mockTrustStrip} style={{ background: 'var(--theme-secondary)' }}>
                     <div className={styles.mockTrustItem}><Shield size={20} color="var(--theme-primary)" /> {brief.insurance ? 'Fully Insured' : 'Professional Service'}</div>
                     <div className={styles.mockTrustItem}><Star size={20} color="var(--theme-primary)" /> Top Rated</div>
                     <div className={styles.mockTrustItem}><Clock size={20} color="var(--theme-primary)" /> {brief.emergency_service ? 'Fast Response' : 'On Time Guarantee'}</div>
                  </div>

                  {/* Services */}
                  <section className={styles.mockSection}>
                     <div className={styles.mockSectionHeader}>
                        <h2 className={styles.mockSectionTitle}>Our Services</h2>
                        <div className={styles.mockSectionDivider} style={{ background: 'var(--theme-primary)' }} />
                     </div>
                     <div className={styles.mockServicesGrid}>
                        {servicesList.map((service, idx) => (
                           <div key={idx} className={styles.mockServiceCard}>
                              <div className={styles.mockServiceIcon} style={{ color: 'var(--theme-primary)', background: 'var(--theme-secondary)' }}>
                                 <CheckCircle2 size={24} />
                              </div>
                              <h3>{service}</h3>
                              <p>Professional {service.toLowerCase()} for residential and commercial properties.</p>
                           </div>
                        ))}
                     </div>
                  </section>

                  {/* Why Choose Us */}
                  <section className={styles.mockSection} style={{ background: 'var(--color-gray-50)' }}>
                     <div className={styles.mockSplitSection}>
                        <div>
                           <h2 className={styles.mockSectionTitle}>Why Choose {brief.business_name}?</h2>
                           <div className={styles.mockSectionDivider} style={{ background: 'var(--theme-primary)', margin: '1rem 0 2rem 0' }} />
                           <ul className={styles.mockBulletList}>
                              <li><CheckCircle2 size={20} color="var(--theme-primary)" /> {brief.differentiator || 'Local, family-owned business'}</li>
                              <li><CheckCircle2 size={20} color="var(--theme-primary)" /> {brief.guarantees || '100% Satisfaction Guarantee'}</li>
                              <li><CheckCircle2 size={20} color="var(--theme-primary)" /> {brief.qualifications || 'Experienced Professionals'}</li>
                              <li><CheckCircle2 size={20} color="var(--theme-primary)" /> Clear, upfront pricing</li>
                           </ul>
                        </div>
                        <div className={styles.mockImagePlaceholder} style={{ background: 'var(--theme-secondary)' }}>
                           <span style={{ color: 'var(--theme-primary)' }}>[ Relevant Business Image ]</span>
                        </div>
                     </div>
                  </section>

                  {/* Testimonials */}
                  {brief.testimonials_on_site && (
                     <section className={styles.mockSection}>
                        <div className={styles.mockSectionHeader}>
                           <h2 className={styles.mockSectionTitle}>What Our Customers Say</h2>
                           <div className={styles.mockSectionDivider} style={{ background: 'var(--theme-primary)' }} />
                        </div>
                        <div className={styles.mockTestimonialsGrid}>
                           {testimonialsList.map((t, idx) => (
                              <div key={idx} className={styles.mockTestimonialCard}>
                                 <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '1rem' }}>
                                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                 </div>
                                 <p>"{t.text}"</p>
                                 <div style={{ fontWeight: 600, marginTop: '1rem' }}>- {t.name}</div>
                              </div>
                           ))}
                        </div>
                     </section>
                  )}

                  {/* Contact Footer */}
                  <footer className={styles.mockFooter} style={{ background: 'var(--color-gray-900)', color: 'white' }}>
                     <div className={styles.mockFooterGrid}>
                        <div>
                           <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{brief.business_name}</h3>
                           <p style={{ color: 'var(--color-gray-400)', fontSize: '0.875rem' }}>Your trusted local {brief.occupation.toLowerCase()} experts in {brief.service_area}.</p>
                        </div>
                        <div>
                           <h4 style={{ marginBottom: '1rem' }}>Contact Us</h4>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-gray-300)', fontSize: '0.875rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} /> {brief.contact_number_to_show}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> {brief.contact_email_to_show}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {brief.service_area}</div>
                           </div>
                        </div>
                     </div>
                  </footer>

               </div>
               {/* --- END GENERATED WEBSITE MOCKUP --- */}
            </div>
         </div>

         {/* Sidebar / Plan Summary */}
         <div className={styles.sidebar}>
            <div className={styles.summaryCard}>
               <h3 style={{ marginBottom: 'var(--space-4)' }}>Your Plan Summary</h3>
               
               <div className={styles.summaryRow}>
                  <span>Website & Hosting</span>
                  <strong>$50/mo</strong>
               </div>
               
               {planSummary.addOns.map((addon, idx) => (
                  <div key={idx} className={styles.summaryRow} style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)' }}>
                     <span><CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom', color: 'var(--color-primary)' }}/> {addon}</span>
                  </div>
               ))}

               <div className={styles.summaryTotal}>
                  <span>Estimated Total</span>
                  <strong>${planSummary.monthlyTotal}/mo</strong>
               </div>

               <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 'var(--space-4)' }}>
                  Plus any one-time setup fees for add-ons. No commitment until you approve.
               </p>

               <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-6)' }}>
                  Approve & Continue
               </button>
            </div>
            
            <div className={styles.infoCard}>
               <h4 style={{ marginBottom: 'var(--space-2)' }}>What happens next?</h4>
               <ol style={{ paddingLeft: '1.2rem', fontSize: 'var(--text-sm)', color: 'var(--color-gray-700)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>Approve this preview design</li>
                  <li>We connect your domain</li>
                  <li>Your site goes live!</li>
               </ol>
            </div>
         </div>
      </div>
    </div>
  );
}
