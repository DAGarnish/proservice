// app/preview/[id]/page.tsx
// Result screen — fetches the AI-generated HTML from the server
// and renders it in a full-height iframe so the user sees their real website.

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, AlertTriangle, Phone, MapPin, Mail,
  Clock, Shield, Star, Loader2, RefreshCw, ExternalLink,
  Monitor, Smartphone, Tablet, Save, Bookmark, Sparkles, X, Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getPreviewPalette, getPreviewServices, getPreviewTestimonials } from '@/lib/mockPreviewGenerator';
import styles from './preview.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BriefSnippet {
  business_name: string;
  occupation: string;
  contact_number_to_show: string | null;
  contact_email_to_show: string | null;
  service_area: string | null;
  selected_website_look: string;
  main_cta: string;
  insurance: boolean;
  emergency_service: boolean;
  differentiator: string | null;
  guarantees: string | null;
  qualifications: string | null;
  testimonials_on_site: boolean;
  contact_form: boolean;
  google_maps: boolean;
  google_listing_option: boolean;
  branded_domain_option: boolean;
  years_in_business: string | null;
  main_services: string;
  seo_keywords: string | null;
  main_city: string;
  full_service_area: string | null;
}

interface PreviewResponse {
  generatedHtml: string;
  brief: BriefSnippet;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PreviewPage() {
  const params = useParams();
  const previewId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedSites, setSavedSites] = useState<Array<{ previewId: string; business_name: string; occupation: string; savedAt: string }>>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('proservice_saved_sites');
      if (stored) {
        setSavedSites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse saved sites:', e);
    }
  }, []);

  const handleSaveProject = () => {
    if (!data) return;
    try {
      const newSite = {
        previewId: previewId,
        business_name: data.brief.business_name || 'My Business',
        occupation: data.brief.occupation || 'Service Business',
        savedAt: new Date().toISOString(),
      };
      
      const stored = localStorage.getItem('proservice_saved_sites');
      let currentList = stored ? JSON.parse(stored) : [];
      currentList = currentList.filter((s: any) => s.previewId !== previewId);
      const updatedList = [newSite, ...currentList];
      
      localStorage.setItem('proservice_saved_sites', JSON.stringify(updatedList));
      setSavedSites(updatedList);

      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }

      toast.success('🎉 Site Saved! Link copied to clipboard. You can regenerate this site in Next.js anytime.', {
        autoClose: 4000,
      });
    } catch (e) {
      console.error('Failed to save project:', e);
      toast.error('Could not save project locally.');
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    const toastId = toast.loading('⚡ Regenerating website with AI in Next.js...');

    try {
      const res = await fetch(`/api/regenerate-preview/${previewId}`, {
        method: 'POST',
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to regenerate website');
      }

      const htmlRes = await fetch(`/api/preview-html/${previewId}`);
      if (!htmlRes.ok) throw new Error('Failed to reload updated preview');
      const updatedData: PreviewResponse = await htmlRes.json();
      
      setData(updatedData);

      toast.update(toastId, {
        render: '✨ Website successfully regenerated with AI!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err: any) {
      console.error('Regeneration error:', err);
      toast.update(toastId, {
        render: `❌ Error: ${err.message || 'Could not regenerate website'}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRemoveSavedSite = (idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = savedSites.filter(s => s.previewId !== idToRemove);
      localStorage.setItem('proservice_saved_sites', JSON.stringify(updated));
      setSavedSites(updated);
      toast.info('Removed from saved sites');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!previewId) return;

    const fetchPreview = async () => {
      try {
        const res = await fetch(`/api/preview-html/${previewId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: PreviewResponse = await res.json();
        setData(json);
      } catch (err: any) {
        console.error('Failed to fetch preview:', err);
        setError(err.message || 'Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [previewId]);

  // ─── Loading State ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingInner}>
          <div className={styles.spinnerWrap}>
            <Loader2 size={48} className={styles.spinnerIcon} />
          </div>
          <h2 className={styles.loadingTitle}>Building your website…</h2>
          <p className={styles.loadingSubtitle}>
            Our AI is writing copy, selecting layouts, and applying your brand styles.
            <br />This usually takes 15–30 seconds.
          </p>
          <div className={styles.loadingSteps}>
            <div className={styles.loadingStep}>✦ Analysing your business data</div>
            <div className={styles.loadingStep}>✦ Writing localised copy</div>
            <div className={styles.loadingStep}>✦ Applying your brand style</div>
            <div className={styles.loadingStep}>✦ Building responsive layout</div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingInner}>
          <AlertTriangle size={48} color="#ef4444" />
          <h2 className={styles.loadingTitle} style={{ marginTop: '1rem' }}>Preview unavailable</h2>
          <p className={styles.loadingSubtitle}>{error || 'This preview could not be loaded.'}</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { generatedHtml, brief } = data;
  const hasAiHtml = generatedHtml && generatedHtml.trim().startsWith('<!');
  const palette = getPreviewPalette(brief.selected_website_look);

  // Iframe widths for each view mode
  const viewWidths: Record<ViewMode, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px',
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.pageContainer}>

      {/* ── Top Action Bar ── */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarInner}>
          <div className={styles.actionBarLeft}>
            <div className={styles.actionBarTitle}>Your Website Preview</div>
            <div className={styles.actionBarSub}>
              {hasAiHtml ? '✦ AI-generated from your form' : '✦ Design mockup'}
            </div>
          </div>

          {/* View mode toggle */}
          <div className={styles.viewToggle}>
            {(['desktop', 'tablet', 'mobile'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                className={`${styles.viewToggleBtn} ${viewMode === mode ? styles.viewToggleBtnActive : ''}`}
                onClick={() => setViewMode(mode)}
                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              >
                {mode === 'desktop' && <Monitor size={16} />}
                {mode === 'tablet' && <Tablet size={16} />}
                {mode === 'mobile' && <Smartphone size={16} />}
              </button>
            ))}
          </div>

          <div className={styles.actionBarRight}>
            <button
              className="btn btn-outline"
              onClick={() => setShowSavedModal(true)}
              title="View your saved websites"
            >
              <Bookmark size={14} style={{ marginRight: 6 }} />
              Saved ({savedSites.length})
            </button>
            <button
              className="btn btn-outline"
              onClick={handleSaveProject}
              title="Save project for future regeneration in Next.js"
            >
              <Save size={14} style={{ marginRight: 6 }} />
              Save Site
            </button>
            <button
              className="btn btn-outline"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              title="Regenerate this site with Gemini AI in Next.js"
              style={{ borderColor: '#3b82f6', color: '#1d4ed8', background: '#eff6ff' }}
            >
              {isRegenerating ? <Loader2 size={14} className={styles.spinnerIcon} style={{ marginRight: 6 }} /> : <Sparkles size={14} style={{ marginRight: 6, color: '#3b82f6' }} />}
              {isRegenerating ? 'Regenerating...' : 'Regenerate in Next.js'}
            </button>
            <button className="btn btn-outline" onClick={() => window.location.href = '/get-started'}>
              <RefreshCw size={14} style={{ marginRight: 6 }} />
              Start Over
            </button>
            <button className="btn btn-primary">
              <CheckCircle2 size={14} style={{ marginRight: 6 }} />
              I Like This — Get Online
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className={styles.mainLayout}>

        {/* ── Preview Frame ── */}
        <div className={styles.previewFrameWrapper}>
          {/* Browser chrome */}
          <div className={styles.browserHeader}>
            <div className={styles.browserDots}>
              <div className={styles.browserDot} style={{ background: '#ef4444' }} />
              <div className={styles.browserDot} style={{ background: '#f59e0b' }} />
              <div className={styles.browserDot} style={{ background: '#22c55e' }} />
            </div>
            <div className={styles.browserUrl}>
              {brief.business_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.webpro50.com
            </div>
            <div style={{ width: 64 }} />
          </div>

          {/* Responsive iframe shell */}
          <div className={styles.previewShell}>
            <div
              className={styles.previewViewport}
              style={{
                width: viewWidths[viewMode],
                maxWidth: '100%',
                transition: 'width 0.3s ease',
              }}
            >
              {hasAiHtml ? (
                /* ── AI-generated HTML in a full iframe ── */
                <iframe
                  ref={iframeRef}
                  srcDoc={generatedHtml}
                  className={styles.previewIframe}
                  title={`${brief.business_name} website preview`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                /* ── Fallback mock mockup (used if Gemini failed) ── */
                <FallbackMockup brief={brief} palette={palette} />
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className={styles.sidebar}>

          {/* Plan card */}
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryCardTitle}>Your Plan</h3>

            <div className={styles.summaryRow}>
              <span>Website &amp; Hosting</span>
              <strong>$50/mo</strong>
            </div>

            {brief.google_listing_option && (
              <div className={styles.summaryRowAddon}>
                <CheckCircle2 size={14} className={styles.summaryAddonIcon} />
                <span>Google listing setup — $50 one-time</span>
              </div>
            )}
            {brief.branded_domain_option && (
              <div className={styles.summaryRowAddon}>
                <CheckCircle2 size={14} className={styles.summaryAddonIcon} />
                <span>Extended refinement &amp; extra pages — $50 one-time</span>
              </div>
            )}

            <div className={styles.summaryTotal}>
              <span>Base total</span>
              <strong>$50/mo</strong>
            </div>

            <p className={styles.summaryNote}>
              Plus any one-time fees. No commitment until you approve.
            </p>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }}>
              Approve &amp; Continue
            </button>
          </div>

          {/* Site features summary */}
          <div className={styles.infoCard}>
            <h4 className={styles.infoCardTitle}>Included in your site</h4>
            <ul className={styles.featureList}>
              {brief.contact_form && <li><CheckCircle2 size={14} /> Contact form</li>}
              {brief.google_maps && <li><CheckCircle2 size={14} /> Google Maps embed</li>}
              {brief.testimonials_on_site && <li><CheckCircle2 size={14} /> Testimonials section</li>}
              {brief.insurance && <li><Shield size={14} /> Fully Insured badge</li>}
              {brief.emergency_service && <li><AlertTriangle size={14} /> Emergency service callout</li>}
              <li><CheckCircle2 size={14} /> Mobile-responsive design</li>
              <li><CheckCircle2 size={14} /> Local SEO structure</li>
              <li><CheckCircle2 size={14} /> Click-to-call button</li>
            </ul>
          </div>

          {/* What's next */}
          <div className={styles.infoCard}>
            <h4 className={styles.infoCardTitle}>What happens next?</h4>
            <ol className={styles.nextStepsList}>
              <li>Approve this preview design</li>
              <li>We connect your domain</li>
              <li>Final review with your team</li>
              <li>Your site goes live!</li>
            </ol>
          </div>

        </div>
      </div>

      {/* ── Saved Sites Modal ── */}
      {showSavedModal && (
        <div className={styles.savedSitesModalOverlay} onClick={() => setShowSavedModal(false)}>
          <div className={styles.savedSitesModal} onClick={e => e.stopPropagation()}>
            <div className={styles.savedSitesHeader}>
              <h3>📑 Your Saved Websites</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowSavedModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.savedSitesBody}>
              {savedSites.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6b7280' }}>
                  <Bookmark size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No saved sites yet.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Click &quot;Save Site&quot; in the action bar to save your website for future regeneration in Next.js.
                  </p>
                </div>
              ) : (
                savedSites.map(site => (
                  <div
                    key={site.previewId}
                    className={styles.savedSiteCard}
                    onClick={() => {
                      setShowSavedModal(false);
                      if (site.previewId !== previewId) {
                        window.location.href = `/preview/${site.previewId}`;
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.savedSiteInfo}>
                      <h4>{site.business_name}</h4>
                      <p>{site.occupation} • Saved {new Date(site.savedAt).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.savedSiteActions}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        onClick={() => {
                          setShowSavedModal(false);
                          if (site.previewId !== previewId) {
                            window.location.href = `/preview/${site.previewId}`;
                          }
                        }}
                      >
                        Open
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '6px', color: '#ef4444' }}
                        onClick={e => handleRemoveSavedSite(site.previewId, e)}
                        title="Delete saved site"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Fallback Mockup (if Gemini didn't generate HTML) ────────────────────────

function FallbackMockup({ brief, palette }: { brief: BriefSnippet; palette: { primary: string; secondary: string; accent: string } }) {
  // Build service list from brief
  const servicesList = brief.main_services
    ? brief.main_services.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean).slice(0, 6)
    : [brief.occupation || 'Professional Services'];

  return (
    <div
      className={styles.mockRoot}
      style={{ '--theme-primary': palette.primary, '--theme-secondary': palette.secondary, '--theme-accent': palette.accent } as any}
    >
      {/* Mock Header */}
      <header className={styles.mockHeader}>
        <div className={styles.mockLogo}>{brief.business_name}</div>
        <nav className={styles.mockNav}>
          <span>Services</span>
          <span>About</span>
          <span>Contact</span>
        </nav>
        <button className={styles.mockBtnPrimary} style={{ background: palette.primary }}>
          {brief.main_cta === 'quote' ? 'Get a Quote' : brief.contact_number_to_show || 'Call Now'}
        </button>
      </header>

      {/* Mock Hero */}
      <section className={styles.mockHero} style={{ background: palette.primary }}>
        <div className={styles.mockHeroContent}>
          {brief.emergency_service && (
            <div className={styles.mockEmergencyBadge}>
              <AlertTriangle size={14} /> 24/7 Emergency Service Available
            </div>
          )}
          <h1 className={styles.mockHeroTitle}>
            Expert {brief.occupation} in {brief.main_city || brief.service_area || 'Your Area'}
          </h1>
          <p className={styles.mockHeroSub}>
            Professional, reliable {brief.occupation?.toLowerCase()} services.
            {brief.years_in_business ? ` Over ${brief.years_in_business} of experience.` : ''}
          </p>
          <div className={styles.mockHeroCta}>
            <button className={styles.mockBtnAccent} style={{ background: palette.accent }}>
              {brief.main_cta === 'quote' ? 'Request Free Quote' : 'Call Now'}
            </button>
            <button className={styles.mockBtnOutline}>Our Services</button>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div className={styles.mockTrustStrip} style={{ background: palette.secondary }}>
        <div className={styles.mockTrustItem}><Shield size={18} color={palette.primary} /> {brief.insurance ? 'Fully Insured' : 'Professional'}</div>
        <div className={styles.mockTrustItem}><Star size={18} color={palette.primary} /> Top Rated</div>
        <div className={styles.mockTrustItem}><Clock size={18} color={palette.primary} /> {brief.emergency_service ? 'Fast Response' : 'On Time'}</div>
      </div>

      {/* Services */}
      <section className={styles.mockSection}>
        <h2 className={styles.mockSectionTitle}>Our Services</h2>
        <div className={styles.mockSectionDivider} style={{ background: palette.primary }} />
        <div className={styles.mockServicesGrid}>
          {servicesList.map((service, idx) => (
            <div key={idx} className={styles.mockServiceCard}>
              <div className={styles.mockServiceIcon} style={{ color: palette.primary, background: palette.secondary }}>
                <CheckCircle2 size={22} />
              </div>
              <h3>{service}</h3>
              <p>Professional {service.toLowerCase()} for residential and commercial customers.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={styles.mockSection} style={{ background: '#f8f9fa' }}>
        <h2 className={styles.mockSectionTitle}>Why Choose {brief.business_name}?</h2>
        <div className={styles.mockSectionDivider} style={{ background: palette.primary, margin: '1rem 0 2rem' }} />
        <ul className={styles.mockBulletList}>
          {brief.differentiator && <li><CheckCircle2 size={18} color={palette.primary} /> {brief.differentiator}</li>}
          {brief.guarantees && <li><CheckCircle2 size={18} color={palette.primary} /> {brief.guarantees}</li>}
          {brief.qualifications && <li><CheckCircle2 size={18} color={palette.primary} /> {brief.qualifications}</li>}
          {brief.insurance && <li><Shield size={18} color={palette.primary} /> Fully insured for your peace of mind</li>}
          <li><CheckCircle2 size={18} color={palette.primary} /> Clear, upfront pricing — no hidden fees</li>
        </ul>
      </section>

      {/* Mock Footer */}
      <footer className={styles.mockFooter}>
        <div className={styles.mockFooterGrid}>
          <div>
            <h3>{brief.business_name}</h3>
            <p>Your trusted local {brief.occupation?.toLowerCase()} in {brief.service_area || brief.main_city}.</p>
          </div>
          <div>
            <h4>Contact Us</h4>
            <div className={styles.mockContactList}>
              {brief.contact_number_to_show && <div><Phone size={14} /> {brief.contact_number_to_show}</div>}
              {brief.contact_email_to_show && <div><Mail size={14} /> {brief.contact_email_to_show}</div>}
              {(brief.service_area || brief.main_city) && <div><MapPin size={14} /> {brief.service_area || brief.main_city}</div>}
            </div>
          </div>
        </div>
        <div className={styles.mockFooterNote}>
          {/* Placeholder — this preview will be replaced by the live AI-generated website */}
        </div>
      </footer>
    </div>
  );
}
