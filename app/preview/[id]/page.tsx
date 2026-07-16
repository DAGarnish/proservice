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

export interface BriefSnippet {
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
  logo_data_url?: string | null;
  branded_domain_option: boolean;
  years_in_business: string | null;
  main_services: string;
  seo_keywords: string | null;
  main_city: string;
  full_service_area: string | null;
  uploaded_photos_urls?: string[] | null;
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
  const [isVerified, setIsVerified] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isAutoRetrying, setIsAutoRetrying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const autoRetryRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('proservice_saved_sites');
      if (stored) {
        setSavedSites(JSON.parse(stored));
      }
      const verifiedEmail = localStorage.getItem('proservice_verified_email');
      if (verifiedEmail) {
        setIsVerified(true);
      }
    } catch (e) {
      console.error('Failed to parse storage:', e);
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

  const handlePublishSite = async () => {
    if (isPublishing) return;
    setIsPublishing(true);
    const toastId = toast.loading('Publishing your site online...');

    try {
      const res = await fetch('/api/publish-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previewId }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to publish site');
      }

      toast.update(toastId, {
        render: '✨ Site published! Redirecting to live site...',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });

      // Redirect to the live dynamic route
      setTimeout(() => {
        window.location.href = `/site/${result.slug}`;
      }, 1000);

    } catch (err: any) {
      console.error('Publish error:', err);
      toast.update(toastId, {
        render: `❌ Error: ${err.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (!previewId) return;

    const fetchPreview = async () => {
      let loadedFromStorage = false;
      try {
        const cached = sessionStorage.getItem('proservice_preview_' + previewId);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.generatedHtml || parsed.brief)) {
            setData(parsed);
            setLoading(false);
            loadedFromStorage = true;
          }
        }
      } catch (e) {}

      try {
        const res = await fetch(`/api/preview-html/${previewId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: PreviewResponse = await res.json();
        setData(json);
      } catch (err: any) {
        console.error('Failed to fetch preview from API:', err);
        if (!loadedFromStorage) {
          setError(err.message || 'Failed to load preview');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [previewId]);

  // Automatic retry trigger and polling when AI HTML is missing (not built yet or initial attempt failed)
  useEffect(() => {
    if (!loading && data && (!data.generatedHtml || !data.generatedHtml.trim().startsWith('<')) && !showFallback && !autoRetryRef.current) {
      autoRetryRef.current = true;
      setIsAutoRetrying(true);
      console.log('AI HTML missing or not built yet. Automatically triggering AI regeneration & recovery...');

      const triggerAutoRecovery = async () => {
        try {
          // Trigger server-side generation
          const res = await fetch(`/api/regenerate-preview/${previewId}`, { method: 'POST' });
          const result = await res.json();
          if (res.ok && result.success && result.generatedHtml && result.generatedHtml.trim().startsWith('<')) {
            setData(prev => prev ? { ...prev, generatedHtml: result.generatedHtml } : null);
            toast.success('✨ Custom AI website successfully generated!');
            setIsAutoRetrying(false);
            return;
          }
        } catch (err) {
          console.error('Initial auto-recovery request failed:', err);
        }

        // If direct post didn't finish immediately, poll up to 6 times (every 4 seconds)
        let attempts = 0;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const checkRes = await fetch(`/api/preview-html/${previewId}`);
            if (checkRes.ok) {
              const checkJson: PreviewResponse = await checkRes.json();
              if (checkJson.generatedHtml && checkJson.generatedHtml.trim().startsWith('<')) {
                setData(checkJson);
                toast.success('✨ Custom AI website ready!');
                clearInterval(pollInterval);
                setIsAutoRetrying(false);
                return;
              }
            }
          } catch (e) {
            console.error('Polling error:', e);
          }

          if (attempts >= 6) {
            clearInterval(pollInterval);
            setIsAutoRetrying(false);
            autoRetryRef.current = false; // allow manual retry
          }
        }, 4000);
      };

      triggerAutoRecovery();
    }
  }, [loading, data, showFallback, previewId]);

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

      {/* ── Email Verification Status Banner ── */}
      <div style={{ background: isVerified ? '#14532d' : '#1e3a8a', color: '#ffffff', padding: '10px 20px', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.15)', flexWrap: 'wrap', textAlign: 'center' }}>
        {isVerified ? (
          <>
            <CheckCircle2 size={16} style={{ color: '#4ade80' }} />
            <span>🎉 Account &amp; Email Verified! You have full access to connect custom domains, optimize SEO, and deploy this website.</span>
          </>
        ) : (
          <>
            <Sparkles size={16} style={{ color: '#60a5fa' }} />
            <span>📧 Verification Email Dispatched: Check your inbox to verify your email address. Verification is required to unlock custom domain registration and publish your live website!</span>
          </>
        )}
      </div>

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
            <button 
              className="btn btn-primary"
              onClick={handlePublishSite}
              disabled={isPublishing}
            >
              {isPublishing ? <Loader2 size={14} className={styles.spinnerIcon} style={{ marginRight: 6 }} /> : <CheckCircle2 size={14} style={{ marginRight: 6 }} />}
              {isPublishing ? 'Publishing...' : 'I Like This — Get Online'}
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
              ) : !showFallback ? (
                /* ── AI Generation in Progress / Retrying State (instead of immediate template fallback) ── */
                <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)' }}>
                    <Loader2 size={36} className={styles.spinnerIcon} style={{ color: '#3b82f6' }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
                    ⚡ AI is Building Your Custom Website...
                  </h3>
                  <p style={{ maxWidth: 480, margin: '0 0 1.75rem', color: '#64748b', lineHeight: 1.6 }}>
                    {isAutoRetrying
                      ? 'Our AI engine is currently writing localized copy and building high-converting card layouts. We are automatically polling and retrying your design right now!'
                      : 'If your site was interrupted by a temporary AI network rate limit, we will retry generating your custom HTML structure automatically.'}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleRegenerate}
                      disabled={isRegenerating || isAutoRetrying}
                    >
                      <RefreshCw size={16} style={{ marginRight: 8 }} />
                      {isRegenerating || isAutoRetrying ? 'Retrying & Building Now...' : 'Retry AI Generation Now'}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setShowFallback(true)}
                    >
                      Show Temporary Mockup Design
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Fallback mock mockup (shown only if user explicitly clicks to view temporary mockup) ── */
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

export function FallbackMockup({ brief, palette }: { brief: BriefSnippet; palette: { primary: string; secondary: string; accent: string } }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className={styles.mockLogoWrap}>
          {brief.logo_data_url ? (
            <img src={brief.logo_data_url} alt={brief.business_name} style={{ maxHeight: '42px', maxWidth: '180px', objectFit: 'contain' }} />
          ) : (
            <div className={styles.mockLogo}>{brief.business_name}</div>
          )}
          <button
            className={styles.mockHamburgerBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        <nav className={`${styles.mockNav} ${mobileMenuOpen ? styles.mockNavOpen : ''}`}>
          <a href="#services" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}>Services</a>
          <a href="#about" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a>
          <a href="#location" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' }); }}>Service Area</a>
          <a href="#faq" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}>FAQ</a>
          <a href="#contact" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); (document.getElementById('contact') || document.getElementById('footer'))?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
          <button className={`${styles.mockBtnPrimary} ${styles.mobileOnlyBtn}`} style={{ background: palette.primary }} onClick={() => { setMobileMenuOpen(false); (document.getElementById('contact') || document.getElementById('footer'))?.scrollIntoView({ behavior: 'smooth' }); }}>
            {brief.main_cta === 'quote' ? 'Get a Quote' : brief.contact_number_to_show || 'Call Now'}
          </button>
        </nav>
        <button className={`${styles.mockBtnPrimary} ${styles.desktopOnlyBtn}`} style={{ background: palette.primary }} onClick={() => (document.getElementById('contact') || document.getElementById('footer'))?.scrollIntoView({ behavior: 'smooth' })}>
          {brief.main_cta === 'quote' ? 'Get a Quote' : brief.contact_number_to_show || 'Call Now'}
        </button>
      </header>

      {/* Mock Hero */}
      <section
        id="hero"
        className={styles.mockHero}
        style={{
          background: brief.uploaded_photos_urls && brief.uploaded_photos_urls.length > 0
            ? `linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.75) 100%), url("${brief.uploaded_photos_urls[0]}") center/cover no-repeat`
            : palette.primary,
          padding: '4.5rem 2rem',
          color: '#ffffff',
        }}
      >
        <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'grid', gridTemplateColumns: brief.uploaded_photos_urls && brief.uploaded_photos_urls.length > 0 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: '3rem', alignItems: 'center' }}>
          <div className={styles.mockHeroContent} style={{ textAlign: 'left' }}>
            {brief.emergency_service && (
              <div className={styles.mockEmergencyBadge}>
                <AlertTriangle size={14} /> 24/7 Emergency Service Available
              </div>
            )}
            <h1 className={styles.mockHeroTitle} style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
              Expert {brief.occupation} in {brief.main_city || brief.service_area || 'Your Area'}
            </h1>
            <p className={styles.mockHeroSub} style={{ fontSize: '1.15rem', opacity: 0.9, marginBottom: '2rem' }}>
              Professional, reliable {brief.occupation?.toLowerCase()} services.
              {brief.years_in_business ? ` Over ${brief.years_in_business} of experience.` : ''}
            </p>
            <div className={styles.mockHeroCta} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className={styles.mockBtnAccent} style={{ background: palette.accent, padding: '0.9rem 1.8rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', color: '#fff' }} onClick={() => (document.getElementById('contact') || document.getElementById('footer'))?.scrollIntoView({ behavior: 'smooth' })}>
                {brief.main_cta === 'quote' ? 'Request Free Quote' : 'Call Now'}
              </button>
              <button className={styles.mockBtnOutline} style={{ padding: '0.9rem 1.8rem', borderRadius: '8px', fontWeight: 700, border: '2px solid rgba(255,255,255,0.7)', background: 'transparent', color: '#fff', cursor: 'pointer' }} onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Our Services</button>
            </div>
          </div>

          {brief.uploaded_photos_urls && brief.uploaded_photos_urls.length > 0 && (
            <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', border: '4px solid rgba(255, 255, 255, 0.15)', maxHeight: '420px', background: '#000' }}>
              <img
                src={brief.uploaded_photos_urls[0]}
                alt={`${brief.business_name || brief.occupation} Hero Banner`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Trust Strip */}
      <div className={styles.mockTrustStrip} style={{ background: palette.secondary }}>
        <div className={styles.mockTrustItem}><Shield size={18} color={palette.primary} /> {brief.insurance ? 'Fully Insured' : 'Professional'}</div>
        <div className={styles.mockTrustItem}><Star size={18} color={palette.primary} /> Top Rated</div>
        <div className={styles.mockTrustItem}><Clock size={18} color={palette.primary} /> {brief.emergency_service ? 'Fast Response' : 'On Time'}</div>
      </div>

      {/* Services */}
      <section id="services" className={styles.mockSection}>
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

      {/* Uploaded Business Photos Gallery */}
      {brief.uploaded_photos_urls && brief.uploaded_photos_urls.length > 0 && (
        <section id="gallery" className={styles.mockSection} style={{ background: '#ffffff' }}>
          <h2 className={styles.mockSectionTitle}>Our Work &amp; Business</h2>
          <div className={styles.mockSectionDivider} style={{ background: palette.primary }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            {brief.uploaded_photos_urls.map((url, idx) => (
              <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', height: '220px' }}>
                <img src={url} alt={`${brief.business_name} photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section id="about" className={styles.mockSection} style={{ background: '#f8f9fa' }}>
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

      {/* Service Area & Interactive Google Map */}
      <section id="location" className={styles.mockSection}>
        <h2 className={styles.mockSectionTitle}>Our Service Area &amp; Location</h2>
        <div className={styles.mockSectionDivider} style={{ background: palette.primary }} />
        <p style={{ textAlign: 'center', color: '#4b5563', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Proudly serving customers across {brief.service_area || brief.main_city || 'your area'} and surrounding communities.
        </p>
        <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: '#fff', padding: '8px', maxWidth: '1000px', margin: '0 auto' }}>
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(brief.service_area || brief.main_city || 'USA')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="380"
            frameBorder="0"
            style={{ border: 0, borderRadius: '8px', width: '100%' }}
            allowFullScreen={false}
            loading="lazy"
            title="Service Area Map"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={styles.mockSection} style={{ background: '#f8f9fa' }}>
        <h2 className={styles.mockSectionTitle}>Frequently Asked Questions</h2>
        <div className={styles.mockSectionDivider} style={{ background: palette.primary }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <details style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1f2937' }}>Do you offer emergency or same-day service?</summary>
            <p style={{ marginTop: '0.75rem', color: '#4b5563', lineHeight: 1.6 }}>{brief.emergency_service ? 'Yes! We offer 24/7 emergency response. Call our number immediately if you need urgent assistance.' : 'We strive to accommodate urgent requests and can often schedule same-day or next-day visits depending on availability.'}</p>
          </details>
          <details style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1f2937' }}>Are you fully licensed and insured?</summary>
            <p style={{ marginTop: '0.75rem', color: '#4b5563', lineHeight: 1.6 }}>{brief.insurance ? 'Yes, we are fully insured and carry comprehensive liability coverage for your total peace of mind.' : 'Yes, we adhere to all professional industry standards and qualifications.'}</p>
          </details>
          <details style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1f2937' }}>How does pricing and estimating work?</summary>
            <p style={{ marginTop: '0.75rem', color: '#4b5563', lineHeight: 1.6 }}>We believe in clear, upfront pricing with zero hidden fees. Contact us for a fast, free, transparent quote before any work begins.</p>
          </details>
          <details style={{ background: '#fff', padding: '1.25rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <summary style={{ fontWeight: 600, fontSize: '1.05rem', color: '#1f2937' }}>What areas do you cover?</summary>
            <p style={{ marginTop: '0.75rem', color: '#4b5563', lineHeight: 1.6 }}>We proudly cover {brief.full_service_area || brief.service_area || brief.main_city} and surrounding communities.</p>
          </details>
        </div>
      </section>

      {/* Lead Capture Form Section */}
      {brief.contact_form && (
        <section id="contact" className={styles.mockSection} style={{ background: '#ffffff' }}>
          <h2 className={styles.mockSectionTitle}>Request a Free Quote</h2>
          <div className={styles.mockSectionDivider} style={{ background: palette.primary }} />
          <p style={{ textAlign: 'center', color: '#4b5563', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
            Fill out the form below and we will get back to you promptly.
          </p>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f8f9fa', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Your Name</label>
                <input type="text" placeholder="John Doe" readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Phone Number</label>
                <input type="tel" placeholder="(555) 000-0000" readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Service Needed</label>
                <input type="text" placeholder={`General ${brief.occupation || 'Service'} Inquiry`} readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Message / Project Details</label>
                <textarea rows={3} placeholder="Tell us about your project..." readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff' }} />
              </div>
              <button className={styles.mockBtnPrimary} style={{ background: palette.primary, width: '100%', padding: '1rem', fontSize: '1.05rem' }}>
                Submit Quote Request
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Mock Footer */}
      <footer id="footer" className={styles.mockFooter}>
        <div className={styles.mockFooterGrid}>
          <div>
            {brief.logo_data_url ? (
              <img src={brief.logo_data_url} alt={brief.business_name} style={{ maxHeight: '36px', maxWidth: '150px', objectFit: 'contain', marginBottom: '8px' }} />
            ) : null}
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
