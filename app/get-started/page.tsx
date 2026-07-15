// app/get-started/page.tsx
// Multi-step intake form page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { defaultFormData, FormData, WebsiteLookId } from '@/types/form';
import { validateAllSteps, hasErrors, StepErrors } from '@/lib/validation';
import { toast } from 'react-toastify';
import Compressor from 'compressorjs';
import { Upload, Sparkles, Image as ImageIcon, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { uploadLogoToSupabase } from '@/lib/supabaseClient';
import styles from './get-started.module.css';

export default function GetStartedPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<StepErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleBuildWebsite = () => {
    const allErrors = validateAllSteps(formData);
    
    if (hasErrors(allErrors)) {
      setErrors(allErrors);
      toast.error('Please check the highlighted required fields above.');
      const firstErrorField = Object.keys(allErrors)[0];
      const el = document.querySelector(`[name="${firstErrorField}"]`) || document.querySelector('.error') || document.querySelector('.form-error');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});
    handleSubmit();
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    const toastId = toast.loading('Submitting your details and dispatching verification email...');

    try {
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate preview');
      }

      toast.update(toastId, {
        render: '🎉 Details saved! Please check your email to verify...',
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      });

      // Redirect to verification screen
      if (data.previewId) {
         const encodedEmail = encodeURIComponent(formData.email_address.trim().toLowerCase());
         const tokenParam = data.verificationToken ? `&token=${data.verificationToken}` : '';
         router.push(`/verify-email?sent=true&email=${encodedEmail}${tokenParam}&previewId=${data.previewId}`);
      } else {
         throw new Error("No preview ID returned");
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setSubmitError(errorMessage);
      toast.update(toastId, {
        render: `❌ Error: ${errorMessage}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className="container" style={{ maxWidth: '820px', margin: '0 auto' }}>
        
        {/* Page Header Banner */}
        <div className={styles.pageHeaderBanner}>
          <h1>Complete Your Business Profile &amp; Build Your Website</h1>
          <p>
            Fill out the form below from top to bottom. Our AI Studio will use your answers to design, write, and deploy your custom interactive website in seconds.
          </p>
        </div>

        {submitError && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-6)' }}>
            <strong>Error:</strong> {submitError}
          </div>
        )}

        {/* All 7 Steps Sequentially on Single Page */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <div id="step-1" className={styles.singlePageSection}>
            <div className={styles.sectionNumberBadge}>1. Business Basics</div>
            <Step1BusinessBasics data={formData} update={updateField} errors={errors} />
          </div>

          <div id="step-2" className={styles.singlePageSection}>
            <div className={styles.sectionNumberBadge}>2. Your Services</div>
            <Step2Services data={formData} update={updateField} errors={errors} />
          </div>

          <div id="step-3" className={styles.singlePageSection}>
            <div className={styles.sectionNumberBadge}>3. Trust &amp; Credibility</div>
            <Step3Trust data={formData} update={updateField} errors={errors} />
          </div>

          <div id="step-4" className={styles.singlePageSection}>
            <div className={styles.sectionNumberBadge}>4. Brand &amp; Style (Logo &amp; Colors)</div>
            <Step4Brand data={formData} update={updateField} errors={errors} />
          </div>

          <div id="step-hero-photo" className={styles.singlePageSection}>
            <div className={styles.sectionNumberBadge}>5. Hero Image &amp; Business Photos</div>
            <StepHeroPhoto data={formData} update={updateField} />
          </div>

          <div id="step-5" className={styles.singlePageSection}>
            <div className={styles.sectionNumberBadge}>6. SEO &amp; Location</div>
            <Step5SEO data={formData} update={updateField} errors={errors} />
          </div>

          <div id="step-6" className={styles.singlePageSection}>
            <div className={styles.sectionNumberBadge}>7. Website Features</div>
            <Step6Conversion data={formData} update={updateField} errors={errors} />
          </div>

          <div id="step-7" className={styles.singlePageSection}>
            <div className={styles.sectionNumberBadge}>8. Add-ons &amp; Final Details</div>
            <Step7AddOns data={formData} update={updateField} errors={errors} />
          </div>

          {/* Submit Action Card */}
          <div className={styles.submitActionCard}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>Ready to Launch Your AI Website?</h3>
              <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto' }}>
                Click below to let WEBPRO50 AI compile your brand colors, custom logo, services, interactive Google Map, and contact forms.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', fontWeight: 700, borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }}
              onClick={handleBuildWebsite}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={22} className={styles.spinnerIcon} />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles size={22} />
                  Build My Website Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Step Components ---

function FieldError({ error }: { error?: string }) {
   if (!error) return null;
   return <div className="form-error" style={{ marginTop: '4px' }}>{error}</div>;
}

function Step1BusinessBasics({ data, update, errors }: any) {
  const isEmailMatch = 
    data.email_address && 
    data.confirm_email_address && 
    data.email_address.trim().toLowerCase() === data.confirm_email_address.trim().toLowerCase();

  return (
    <div className={styles.stepContent}>
      <h2>Tell us about your business</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
         Let&apos;s start with the basics. This information will be used to generate your website copy and contact details.
      </p>

      <div className={styles.grid2}>
         <div className="form-group">
            <label className="form-label">Business Name <span className="required">*</span></label>
            <input 
               type="text" 
               className={`form-input ${errors.business_name ? 'error' : ''}`}
               value={data.business_name} 
               onChange={e => update('business_name', e.target.value)} 
               placeholder="e.g. John's Plumbing"
            />
            <FieldError error={errors.business_name} />
         </div>
         <div className="form-group">
            <label className="form-label">Your Name <span className="required">*</span></label>
            <input 
               type="text" 
               className={`form-input ${errors.contact_name ? 'error' : ''}`}
               value={data.contact_name} 
               onChange={e => update('contact_name', e.target.value)} 
               placeholder="e.g. John Smith"
            />
            <FieldError error={errors.contact_name} />
         </div>
      </div>

      <div className={styles.grid2}>
         <div className="form-group">
            <label className="form-label">Phone Number <span className="required">*</span></label>
            <input 
               type="tel" 
               className={`form-input ${errors.phone_number ? 'error' : ''}`}
               value={data.phone_number} 
               onChange={e => update('phone_number', e.target.value)} 
               placeholder="e.g. (555) 123-4567"
            />
            <FieldError error={errors.phone_number} />
         </div>
         <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input 
               type="email" 
               className={`form-input ${errors.email_address ? 'error' : ''}`}
               value={data.email_address} 
               onChange={e => update('email_address', e.target.value)} 
               placeholder="e.g. john@example.com"
            />
            <FieldError error={errors.email_address} />
            <div className="form-hint" style={{marginTop: 4}}>We&apos;ll send your preview link here.</div>
         </div>
         <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Confirm Email Address <span className="required">*</span>
              {isEmailMatch && <CheckCircle2 size={16} color="#10b981" />}
            </label>
            <input 
               type="email" 
               className={`form-input ${errors.confirm_email_address ? 'error' : ''}`}
               value={data.confirm_email_address || ''} 
               onChange={e => update('confirm_email_address', e.target.value)} 
               placeholder="Confirm your email"
               style={isEmailMatch ? { borderColor: '#10b981', backgroundColor: '#f0fdf4' } : {}}
            />
            <FieldError error={errors.confirm_email_address} />
         </div>
      </div>

      <div className="form-group">
         <label className="form-label">Business Type / Occupation <span className="required">*</span></label>
         <input 
            type="text" 
            className={`form-input ${errors.occupation ? 'error' : ''}`}
            value={data.occupation} 
            onChange={e => update('occupation', e.target.value)} 
            placeholder="e.g. Plumber, Electrician, Cleaner"
         />
         <FieldError error={errors.occupation} />
      </div>

      <div className="form-group">
         <label className="form-label">Business Address (Optional)</label>
         <input 
            type="text" 
            className="form-input"
            value={data.business_address} 
            onChange={e => update('business_address', e.target.value)} 
            placeholder="Full address or just city/state if mobile"
         />
      </div>

      <div className="form-group">
         <label className="form-label">Years in Business (Optional)</label>
         <input 
            type="text" 
            className="form-input"
            value={data.years_in_business} 
            onChange={e => update('years_in_business', e.target.value)} 
            placeholder="e.g. 10 years, since 2015"
         />
      </div>
    </div>
  );
}

function Step2Services({ data, update, errors }: any) {
  return (
    <div className={styles.stepContent}>
      <h2>Your Services</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
         Tell us what you do so we can write compelling service descriptions.
      </p>

      <div className="form-group">
         <label className="form-label">Main Services <span className="required">*</span></label>
         <div className="form-hint" style={{ marginBottom: '4px' }}>List the primary services you offer.</div>
         <textarea 
            className={`form-textarea ${errors.main_services ? 'error' : ''}`}
            value={data.main_services} 
            onChange={e => update('main_services', e.target.value)} 
            placeholder="e.g. Pipe repair, water heater installation, drain cleaning..."
         />
         <FieldError error={errors.main_services} />
      </div>

      <div className="form-group">
         <label className="form-label">Top 3 Services to Promote (Optional)</label>
         <input 
            type="text" 
            className="form-input"
            value={data.top_services_to_promote} 
            onChange={e => update('top_services_to_promote', e.target.value)} 
            placeholder="Which services make you the most money?"
         />
      </div>

      <div className="form-group">
         <label className="form-label">Specialities (Optional)</label>
         <input 
            type="text" 
            className="form-input"
            value={data.specialities} 
            onChange={e => update('specialities', e.target.value)} 
            placeholder="e.g. Eco-friendly solutions, commercial properties"
         />
      </div>
      
      <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
         <label className="form-checkbox-group">
            <input 
               type="checkbox" 
               checked={data.emergency_service}
               onChange={e => update('emergency_service', e.target.checked)}
            />
            <span className="form-checkbox-label">
               <strong>I offer emergency / same-day / 24-7 service</strong>
               <div className="form-hint">We'll highlight this prominently to get you urgent jobs.</div>
            </span>
         </label>
      </div>

      <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
         <label className="form-label">Main Call to Action <span className="required">*</span></label>
         <div className="form-hint" style={{ marginBottom: '8px' }}>What's the main thing you want visitors to do?</div>
         <select 
            className={`form-select ${errors.main_cta ? 'error' : ''}`}
            value={data.main_cta} 
            onChange={e => update('main_cta', e.target.value)}
         >
            <option value="call">Call Me</option>
            <option value="quote">Request a Quote</option>
            <option value="book">Book Online</option>
            <option value="whatsapp">Message on WhatsApp</option>
            <option value="email">Email Me</option>
         </select>
         <FieldError error={errors.main_cta} />
      </div>
    </div>
  );
}

function Step3Trust({ data, update, errors }: any) {
  return (
    <div className={styles.stepContent}>
      <h2>Trust & Credibility</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
         What makes customers choose you? This helps build trust on your website. (All optional)
      </p>

      <div className="form-group">
         <label className="form-label">What makes your business different?</label>
         <input 
            type="text" 
            className="form-input"
            value={data.differentiator} 
            onChange={e => update('differentiator', e.target.value)} 
            placeholder="e.g. Family owned, fixed pricing, always on time"
         />
      </div>

      <div className="form-group">
         <label className="form-label">Qualifications / Licenses</label>
         <input 
            type="text" 
            className="form-input"
            value={data.qualifications} 
            onChange={e => update('qualifications', e.target.value)} 
            placeholder="e.g. Master Plumber, Licensed & Bonded"
         />
      </div>

      <div className="form-group">
         <label className="form-checkbox-group">
            <input 
               type="checkbox" 
               checked={data.insurance}
               onChange={e => update('insurance', e.target.checked)}
            />
            <span className="form-checkbox-label">
               <strong>Fully Insured</strong>
               <div className="form-hint">We'll add a 'Fully Insured' badge to your site.</div>
            </span>
         </label>
      </div>

      <div className="form-group">
         <label className="form-label">Testimonials / Reviews</label>
         <div className="form-hint" style={{ marginBottom: '4px' }}>Paste a couple of nice things customers have said.</div>
         <textarea 
            className="form-textarea"
            value={data.testimonials} 
            onChange={e => update('testimonials', e.target.value)} 
            placeholder='"Great service, came out the same day!" - Jane D.'
            style={{ minHeight: '80px' }}
         />
      </div>

      <div className="form-group">
         <label className="form-label">Guarantees or Promises</label>
         <input 
            type="text" 
            className="form-input"
            value={data.guarantees} 
            onChange={e => update('guarantees', e.target.value)} 
            placeholder="e.g. 100% Satisfaction Guarantee, 1-year warranty on parts"
         />
      </div>
    </div>
  );
}

function Step4Brand({ data, update, errors }: any) {
  const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState('');
  const [genError, setGenError] = useState('');
  const [liveLogs, setLiveLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' | 'error' }>>([]);
  const [isUploadingSupabase, setIsUploadingSupabase] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');

  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLiveLogs(prev => [...prev, { time, text, type }]);
  };

  const looks: { id: WebsiteLookId; name: string; colors: string[]; desc: string }[] = [
    { id: 'professional-blue', name: 'Professional Blue', colors: ['#1D4ED8', '#DBEAFE', '#0F172A'], desc: 'Trustworthy, established (Great for trades)' },
    { id: 'local-green', name: 'Local Green', colors: ['#15803D', '#DCFCE7', '#14532D'], desc: 'Reliable, eco-friendly (Great for landscapers, cleaners)' },
    { id: 'warm-premium', name: 'Warm Premium', colors: ['#8B5E3C', '#F5E6D3', '#3F2A1D'], desc: 'Grounded, boutique (Great for premium services)' },
    { id: 'dark-regal', name: 'Dark Regal', colors: ['#312E81', '#E0E7FF', '#111827'], desc: 'High-end, serious (Great for specialists)' },
    { id: 'clean-minimal', name: 'Clean Minimal', colors: ['#374151', '#F3F4F6', '#111827'], desc: 'Modern, neutral (Works for anyone)' },
    { id: 'bold-strong', name: 'Bold Strong', colors: ['#B91C1C', '#FEE2E2', '#450A0A'], desc: 'Confident, urgent (Great for emergency services)' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setIsUploadingSupabase(false);
    setCompressionStats('');
    setGenError('');
    setLiveLogs([]);
    setSupabaseUrl('');

    addLog(`📁 Selected file: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`, 'info');
    addLog('⚡ Running Compressor.js client-side image optimization...', 'info');

    new Compressor(file, {
      quality: 0.6,
      maxWidth: 800,
      maxHeight: 800,
      mimeType: file.type.includes('png') || file.type.includes('svg') ? 'image/png' : 'image/jpeg',
      async success(compressedResult: Blob | File) {
        const origKB = (file.size / 1024).toFixed(1);
        const compKB = (compressedResult.size / 1024).toFixed(1);
        const savedPct = Math.round((1 - compressedResult.size / file.size) * 100);

        addLog(`⚡ Compressor.js finished! Reduced from ${origKB} KB to ${compKB} KB (${savedPct}% saved)`, 'success');
        setCompressionStats(`⚡ Compressed with Compressor.js: Reduced from ${origKB} KB to ${compKB} KB (${savedPct}% smaller!)`);

        const reader = new FileReader();
        reader.readAsDataURL(compressedResult);
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          update('logo_data_url', base64);
          setIsCompressing(false);

          // Upload to Supabase Storage!
          setIsUploadingSupabase(true);
          addLog('☁️ Connecting to Supabase Storage...', 'info');
          addLog('📦 Uploading compressed image to Supabase cloud bucket...', 'info');

          try {
            const publicUrl = await uploadLogoToSupabase(compressedResult, `upload_${Date.now()}_${file.name}`);
            setSupabaseUrl(publicUrl);
            update('logo_data_url', publicUrl);
            setIsUploadingSupabase(false);
            addLog(`✅ Successfully hosted on Supabase Storage: ${publicUrl}`, 'success');
            toast.success(`Logo compressed (${savedPct}%) & hosted on Supabase!`);
          } catch (err: any) {
            setIsUploadingSupabase(false);
            addLog(`⚠️ Supabase upload note: ${err.message}`, 'warn');
            addLog('🔒 Using compressed local Data URL as reliable backup!', 'info');
            toast.success(`Logo compressed by ${savedPct}% and ready!`);
          }
        };
      },
      error(err) {
        setIsCompressing(false);
        addLog(`❌ Compressor.js error: ${err.message}`, 'error');
        console.error('Compressor error:', err);
        toast.error('Failed to compress image.');
      },
    });
  };

  const handleGenerateLogo = async () => {
    if (!data.business_name || !data.occupation) {
      toast.error('Please enter your Business Name and Occupation in Step 1 first!');
      return;
    }

    setIsGenerating(true);
    setIsCompressing(false);
    setIsUploadingSupabase(false);
    setGenError('');
    setCompressionStats('');
    setLiveLogs([]);
    setSupabaseUrl('');

    addLog('🚀 Initializing WEBPRO50 AI (Google Gemini AI) design engine...', 'info');
    addLog(`🎨 Building logo brief for "${data.business_name}" (${data.occupation})...`, 'info');
    addLog(`✨ Sending prompt: "${logoPrompt || 'Clean modern emblem representing ' + data.occupation}"...`, 'info');

    const toastId = toast.loading('✨ WEBPRO50 AI is designing your logo...');

    try {
      const res = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: logoPrompt || `Clean modern emblem representing ${data.occupation}`,
          business_name: data.business_name,
          occupation: data.occupation,
          style: data.selected_website_look,
          email_address: data.email_address,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate logo');
      }

      addLog('🎉 Received raw vector SVG design from WEBPRO50 AI!', 'success');
      addLog('🖌️ Rendering vector artwork onto HTML5 Canvas for image conversion...', 'info');

      const svgText = result.svg;
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 600, 600);
          ctx.drawImage(img, 0, 0, 600, 600);
          
          canvas.toBlob((blob) => {
            if (!blob) {
              setIsGenerating(false);
              addLog('❌ Canvas conversion failed.', 'error');
              return;
            }
            const file = new File([blob], 'webpro50-ai-logo.png', { type: 'image/png' });

            setIsCompressing(true);
            addLog('⚡ Running Compressor.js optimization on AI-generated image...', 'info');

            new Compressor(file, {
              quality: 0.7,
              maxWidth: 600,
              maxHeight: 600,
              mimeType: 'image/png',
              async success(compressedResult: Blob | File) {
                const origKB = (file.size / 1024).toFixed(1);
                const compKB = (compressedResult.size / 1024).toFixed(1);
                const savedPct = Math.round((1 - compressedResult.size / file.size) * 100);

                addLog(`⚡ Compressor.js finished! Reduced from ${origKB} KB to ${compKB} KB (${savedPct}% saved)`, 'success');
                setCompressionStats(`✨ WEBPRO50 AI Generated & 📦 Compressor.js Compressed: Reduced from ${origKB} KB to ${compKB} KB (${savedPct}% saved!)`);

                const reader = new FileReader();
                reader.readAsDataURL(compressedResult);
                reader.onloadend = async () => {
                  const base64 = reader.result as string;
                  update('logo_data_url', base64);
                  setIsCompressing(false);
                  setIsGenerating(false);

                  // Upload AI logo to Supabase Storage!
                  setIsUploadingSupabase(true);
                  addLog('☁️ Connecting to Supabase Storage...', 'info');
                  addLog('📦 Uploading AI logo to Supabase cloud bucket...', 'info');

                  try {
                    const publicUrl = await uploadLogoToSupabase(compressedResult, `ai_logo_${Date.now()}.png`);
                    setSupabaseUrl(publicUrl);
                    update('logo_data_url', publicUrl);
                    setIsUploadingSupabase(false);
                    addLog(`✅ Hosted on Supabase Storage: ${publicUrl}`, 'success');
                    toast.update(toastId, {
                      render: `🎉 WEBPRO50 AI logo generated, compressed & hosted on Supabase!`,
                      type: 'success',
                      isLoading: false,
                      autoClose: 3500,
                    });
                  } catch (err: any) {
                    setIsUploadingSupabase(false);
                    addLog(`⚠️ Supabase note: ${err.message}`, 'warn');
                    addLog('🔒 Using compressed Data URL as reliable backup!', 'info');
                    toast.update(toastId, {
                      render: `🎉 WEBPRO50 AI logo generated & compressed by ${savedPct}%!`,
                      type: 'success',
                      isLoading: false,
                      autoClose: 3500,
                    });
                  }
                };
              },
              error(err) {
                setIsCompressing(false);
                setIsGenerating(false);
                addLog(`❌ Compression failed: ${err.message}`, 'error');
                toast.update(toastId, { render: '❌ Compression failed', type: 'error', isLoading: false, autoClose: 3000 });
              },
            });
          }, 'image/png');
        }
      };
      img.onerror = () => {
        const reader = new FileReader();
        reader.readAsDataURL(svgBlob);
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          update('logo_data_url', base64);
          setIsGenerating(false);
          addLog(`⚡ Using pure Vector SVG (${(svgBlob.size / 1024).toFixed(1)} KB)`, 'success');
          setCompressionStats(`✨ WEBPRO50 AI Generated Vector SVG Logo (${(svgBlob.size / 1024).toFixed(1)} KB - Ultra Lightweight!)`);

          // Try uploading SVG to Supabase
          setIsUploadingSupabase(true);
          addLog('📦 Uploading vector SVG to Supabase Storage...', 'info');
          try {
            const publicUrl = await uploadLogoToSupabase(svgBlob, `ai_logo_${Date.now()}.svg`);
            setSupabaseUrl(publicUrl);
            update('logo_data_url', publicUrl);
            setIsUploadingSupabase(false);
            addLog(`✅ Hosted on Supabase Storage: ${publicUrl}`, 'success');
          } catch (err: any) {
            setIsUploadingSupabase(false);
            addLog(`⚠️ Supabase note: ${err.message}`, 'warn');
          }
          toast.update(toastId, { render: '🎉 WEBPRO50 AI vector logo generated!', type: 'success', isLoading: false, autoClose: 3000 });
        };
      };
      img.src = url;
    } catch (err: any) {
      console.error('Logo gen error:', err);
      setGenError(err.message || 'Could not generate logo');
      setIsGenerating(false);
      addLog(`❌ Error generating logo: ${err.message}`, 'error');
      toast.update(toastId, { render: `❌ Error: ${err.message}`, type: 'error', isLoading: false, autoClose: 4000 });
    }
  };

  return (
    <div className={styles.stepContent}>
      <h2>Brand & Style</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
         Choose the look that best matches how you want your business to feel online.
      </p>

      <div className="form-group" style={{ marginBottom: 'var(--space-8)' }}>
         <label className="form-label">Select a Website Look <span className="required">*</span></label>
         <div className={styles.lookSelectorGrid}>
            {looks.map(look => (
               <div 
                  key={look.id}
                  className={`${styles.lookCard} ${data.selected_website_look === look.id ? styles.lookCardSelected : ''}`}
                  onClick={() => update('selected_website_look', look.id)}
               >
                  <div className={styles.lookColors}>
                     {look.colors.map(c => (
                        <div key={c} className={styles.lookColorSwatch} style={{ background: c }} />
                     ))}
                  </div>
                  <div className={styles.lookName}>{look.name}</div>
                  <div className={styles.lookDesc}>{look.desc}</div>
               </div>
            ))}
         </div>
         <FieldError error={errors.selected_website_look} />
      </div>

      <div className="form-group">
         <label className="form-label">Preferred Custom Colors (Optional)</label>
         <input 
            type="text" 
            className="form-input"
            value={data.preferred_colours} 
            onChange={e => update('preferred_colours', e.target.value)} 
            placeholder="e.g. Navy blue and gold, or match my logo"
         />
      </div>

      <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
         <label className="form-label">
            Upload your logo, or ask us to design one for you!
         </label>

         {/* ── Logo Upload / WEBPRO50 AI Generate Box ── */}
         <div className={styles.logoSection}>
             <div className={styles.logoTabs}>
               <button
                 type="button"
                 className={`${styles.logoTabBtn} ${activeTab === 'upload' ? styles.logoTabBtnActive : ''}`}
                 onClick={() => setActiveTab('upload')}
               >
                 <Upload size={16} />
                 📁 Upload Existing Image
               </button>
               <button
                 type="button"
                 className={`${styles.logoTabBtn} ${activeTab === 'generate' ? styles.logoTabBtnActive : ''}`}
                 onClick={() => setActiveTab('generate')}
               >
                 <Sparkles size={16} />
                 ✨ Generate Logo (WEBPRO50 AI)
               </button>
             </div>

             <div className={styles.logoTabContent}>
               {activeTab === 'upload' ? (
                 <div>
                   <label className={styles.uploadArea}>
                     <input
                       type="file"
                       accept="image/*"
                       style={{ display: 'none' }}
                       onChange={handleFileUpload}
                     />
                     <ImageIcon size={32} style={{ margin: '0 auto 8px', color: 'var(--color-primary)' }} />
                     <div style={{ fontWeight: 600, color: 'var(--color-gray-800)' }}>
                       Click to upload your logo image
                     </div>
                     <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 4 }}>
                       PNG, JPG, WEBP or SVG — Automatically compressed & uploaded to Supabase
                     </div>
                   </label>
                 </div>
               ) : (
                 <div>
                   <div style={{ marginBottom: '12px' }}>
                     <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                       <Sparkles size={14} color="var(--color-primary)" />
                       Describe your desired logo:
                     </label>
                     <input
                       type="text"
                       className="form-input"
                       value={data.logo_prompt || ''}
                       onChange={e => update('logo_prompt', e.target.value)}
                       placeholder={`e.g. Minimalist emblem for ${data.business_name || 'my business'}, professional ${data.occupation || 'services'}`}
                     />
                     <div className="form-hint" style={{ marginTop: 4 }}>
                       WEBPRO50 AI will design a vector logo, Compressor.js will compress it, and Supabase will host it.
                     </div>
                   </div>

                   {genError && (
                     <div className="form-error" style={{ marginBottom: 10 }}>
                       ❌ Error: {genError}
                     </div>
                   )}
                 </div>
               )}

               {/* ── Live Log Terminal Box ── */}
               {liveLogs.length > 0 && (
                 <div className={styles.logTerminal}>
                   <div className={styles.logTerminalHeader}>
                     <div className={styles.logTerminalDots}>
                       <span style={{ background: '#ef4444' }} />
                       <span style={{ background: '#f59e0b' }} />
                       <span style={{ background: '#10b981' }} />
                     </div>
                     <span className={styles.logTerminalTitle}>⚡ Live Generation & Upload Logs</span>
                     {isGenerating || isCompressing || isUploadingSupabase ? <Loader2 size={14} className={styles.spinnerIcon} color="#38bdf8" /> : <CheckCircle2 size={14} color="#10b981" />}
                   </div>
                   <div className={styles.logTerminalBody}>
                     {liveLogs.map((log, idx) => (
                       <div key={idx} className={`${styles.logLine} ${styles['log_' + log.type]}`}>
                         <span className={styles.logTime}>[{log.time}]</span>
                         <span className={styles.logText}>{log.text}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* ── Compression Stats Badge ── */}
               {(isCompressing || isUploadingSupabase || compressionStats) && (
                 <div style={{ textAlign: 'center', marginTop: 12 }}>
                   {isCompressing || isUploadingSupabase ? (
                     <div className={styles.compressionBadge} style={{ background: '#eff6ff', borderColor: '#3b82f6', color: '#1d4ed8' }}>
                       <Loader2 size={14} className={styles.spinnerIcon} />
                       {isCompressing ? 'Running Compressor.js image compression...' : 'Uploading to Supabase Storage...'}
                     </div>
                   ) : (
                     <div className={styles.compressionBadge}>
                       <Zap size={14} />
                       {compressionStats}
                     </div>
                   )}
                 </div>
               )}

               {/* ── Logo Preview ── */}
               {data.logo_data_url && (
                 <div className={styles.logoPreviewBox}>
                   <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-gray-600)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                     <CheckCircle2 size={14} color="#10b981" /> Active Website Logo
                     {data.logo_data_url.includes('supabase.co') && (
                       <span style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#047857', padding: '2px 8px', borderRadius: 12, fontSize: 10 }}>
                         🟢 Hosted on Supabase Storage
                       </span>
                     )}
                   </div>
                   <img
                     src={data.logo_data_url}
                     alt="Logo Preview"
                     className={styles.logoPreviewImg}
                   />
                 </div>
               )}
             </div>
           </div>
      </div>
    </div>
  );
}

function StepHeroPhoto({ data, update }: any) {
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoStats, setPhotoStats] = useState<string>('');
  const [liveLogs, setLiveLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' | 'error' }>>([]);

  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLiveLogs(prev => [...prev, { time, text, type }]);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingPhoto(true);
    setIsUploadingPhoto(false);
    setPhotoStats('');
    setLiveLogs([]);
    
    // Take only the single file selected for the hero section
    const file = files[0];
    addLog(`📁 Selected hero photo: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`, 'info');
    addLog('⚡ Running Compressor.js client-side optimization on hero photo...', 'info');

    await new Promise<void>((resolve) => {
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 1600,
        maxHeight: 1600,
        mimeType: file.type.includes('png') ? 'image/png' : 'image/jpeg',
        async success(compressedResult: Blob | File) {
          const origKB = (file.size / 1024).toFixed(1);
          const compKB = (compressedResult.size / 1024).toFixed(1);
          const savedPct = Math.round((1 - compressedResult.size / file.size) * 100);

          addLog(`⚡ Hero photo compressed! Reduced from ${origKB} KB to ${compKB} KB (${savedPct}% saved)`, 'success');
          setPhotoStats(`⚡ Hero photo compressed by ${savedPct}% (${origKB} KB ➔ ${compKB} KB)`);

          setIsUploadingPhoto(true);
          addLog('📦 Uploading compressed hero photo to Supabase cloud bucket...', 'info');

          try {
            const publicUrl = await uploadLogoToSupabase(compressedResult, `hero_photo_${Date.now()}_${file.name}`);
            // Store exactly ONE photo in the array for the Hero section
            update('uploaded_photos_urls', [publicUrl]);
            addLog(`✅ Hero photo hosted on Supabase: ${publicUrl}`, 'success');
            toast.success('Hero Section photo compressed & hosted on Supabase!');
          } catch (err: any) {
            addLog(`⚠️ Supabase photo upload fallback note: ${err.message}`, 'warn');
            const reader = new FileReader();
            reader.readAsDataURL(compressedResult);
            reader.onloadend = () => {
              const base64 = reader.result as string;
              // Store exactly ONE photo as backup data URL
              update('uploaded_photos_urls', [base64]);
              addLog('🔒 Stored hero photo as compressed Data URL backup for Hero Section!', 'info');
            };
          }
          setIsUploadingPhoto(false);
          resolve();
        },
        error(err) {
          addLog(`❌ Photo compression error: ${err.message}`, 'error');
          toast.error('Failed to compress hero photo.');
          resolve();
        },
      });
    });
    setIsCompressingPhoto(false);
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2>Hero Section Background / Banner Image</h2>
        <p>Upload the single best photo representing your business, work, or team. This photo will be prominently featured directly inside the top Hero Banner of your AI-generated website!</p>
      </div>

      <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
        <label className={styles.uploadArea}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />
          <ImageIcon size={38} style={{ margin: '0 auto 10px', color: 'var(--color-primary)' }} />
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gray-900)' }}>
            Click or drag &amp; drop to upload your Hero Section Image
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 6 }}>
            Select a high-res JPG, PNG, or WEBP photo — Automatically compressed &amp; displayed in your Hero Section (1 photo limit)
          </div>
        </label>

        {/* ── Live Log Terminal Box ── */}
        {liveLogs.length > 0 && (
          <div className={styles.logTerminal} style={{ marginTop: 16 }}>
            <div className={styles.logTerminalHeader}>
              <div className={styles.logTerminalDots}>
                <span style={{ background: '#ef4444' }} />
                <span style={{ background: '#f59e0b' }} />
                <span style={{ background: '#10b981' }} />
              </div>
              <span className={styles.logTerminalTitle}>⚡ Hero Photo Optimization &amp; Upload Logs</span>
              {isCompressingPhoto || isUploadingPhoto ? <Loader2 size={14} className={styles.spinnerIcon} color="#38bdf8" /> : <CheckCircle2 size={14} color="#10b981" />}
            </div>
            <div className={styles.logTerminalBody}>
              {liveLogs.map((log, idx) => (
                <div key={idx} className={`${styles.logLine} ${styles['log_' + log.type]}`}>
                  <span className={styles.logTime}>[{log.time}]</span>
                  <span className={styles.logText}>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(isCompressingPhoto || isUploadingPhoto || photoStats) && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            {isCompressingPhoto || isUploadingPhoto ? (
              <div className={styles.compressionBadge} style={{ background: '#eff6ff', borderColor: '#3b82f6', color: '#1d4ed8' }}>
                <Loader2 size={14} className={styles.spinnerIcon} />
                {isCompressingPhoto ? 'Compressing hero photo with Compressor.js...' : 'Uploading hero photo to Supabase Storage...'}
              </div>
            ) : (
              <div className={styles.compressionBadge}>
                <Zap size={14} />
                {photoStats}
              </div>
            )}
          </div>
        )}

        {data.uploaded_photos_urls && data.uploaded_photos_urls.length > 0 && (
          <div style={{ marginTop: 20, padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} color="#10b981" /> Active Hero Section Image (1/1):
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 460, height: 260, borderRadius: 12, overflow: 'hidden', border: '3px solid #3b82f6', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25)', background: '#fff' }}>
                <img src={data.uploaded_photos_urls[0]} alt="Hero Section Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', bottom: 10, left: 10, background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ✨ Hero Section Background
                </span>
                <button
                  type="button"
                  onClick={() => update('uploaded_photos_urls', [])}
                  style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(239, 68, 68, 0.95)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                  title="Remove hero photo"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Step5SEO({ data, update, errors }: any) {
  return (
    <div className={styles.stepContent}>
      <h2>SEO & Location</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
         Help us set up your site so local customers can find you on Google.
      </p>

      <div className="form-group">
         <label className="form-label">Main City / Town <span className="required">*</span></label>
         <input 
            type="text" 
            className={`form-input ${errors.main_city ? 'error' : ''}`}
            value={data.main_city} 
            onChange={e => update('main_city', e.target.value)} 
            placeholder="e.g. Austin, TX"
         />
         <FieldError error={errors.main_city} />
      </div>

      <div className="form-group">
         <label className="form-label">Full Service Area (Optional)</label>
         <input 
            type="text" 
            className="form-input"
            value={data.full_service_area} 
            onChange={e => update('full_service_area', e.target.value)} 
            placeholder="e.g. Travis County, Round Rock, Cedar Park"
         />
      </div>

      <div className="form-group">
         <label className="form-label">Keywords customers might search for (Optional)</label>
         <input 
            type="text" 
            className="form-input"
            value={data.seo_keywords} 
            onChange={e => update('seo_keywords', e.target.value)} 
            placeholder="e.g. emergency plumber austin, water heater repair"
         />
      </div>
    </div>
  );
}

function Step6Conversion({ data, update, errors }: any) {
  return (
    <div className={styles.stepContent}>
      <h2>Website Features</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
         How do you want customers to interact with your site?
      </p>

      <div className={styles.grid2}>
         <div className="form-group">
            <label className="form-label">Phone Number to Display <span className="required">*</span></label>
            <input 
               type="text" 
               className={`form-input ${errors.contact_number_to_show ? 'error' : ''}`}
               value={data.contact_number_to_show} 
               onChange={e => update('contact_number_to_show', e.target.value)} 
               placeholder="Leave blank to use main number"
            />
            <FieldError error={errors.contact_number_to_show} />
         </div>
         <div className="form-group">
            <label className="form-label">Email to Display</label>
            <input 
               type="text" 
               className="form-input"
               value={data.contact_email_to_show} 
               onChange={e => update('contact_email_to_show', e.target.value)} 
               placeholder="Leave blank to use main email"
            />
         </div>
      </div>

      <div className="form-group" style={{ marginTop: 'var(--space-6)' }}>
         <label className="form-label">Select features to include:</label>
         <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <label className="form-checkbox-group">
               <input 
                  type="checkbox" 
                  checked={data.contact_form}
                  onChange={e => update('contact_form', e.target.checked)}
               />
               <span className="form-checkbox-label">Standard Contact Form</span>
            </label>
            
            <label className="form-checkbox-group">
               <input 
                  type="checkbox" 
                  checked={data.quote_request_form}
                  onChange={e => update('quote_request_form', e.target.checked)}
               />
               <span className="form-checkbox-label">Detailed Quote Request Form</span>
            </label>

            <label className="form-checkbox-group">
               <input 
                  type="checkbox" 
                  checked={data.google_maps}
                  onChange={e => update('google_maps', e.target.checked)}
               />
               <span className="form-checkbox-label">Embed Google Maps for my location</span>
            </label>
         </div>
      </div>
    </div>
  );
}

function Step7AddOns({ data, update, errors }: any) {
  return (
    <div className={styles.stepContent}>
      <h2>Add-ons & Final Details</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
         Almost done! Check out these optional upgrades.
      </p>

      <div className={styles.addOnBox}>
         <label className="form-checkbox-group">
            <input 
               type="checkbox" 
               checked={data.branded_domain_option}
               onChange={e => update('branded_domain_option', e.target.checked)}
            />
            <span className="form-checkbox-label">
               <strong style={{ display: 'block', marginBottom: '4px' }}>Extended Refinement & Extra Pages</strong>
               Need more changes or extra pages? Get up to a 1-hour refinement call with our developers and/or additional pages for your website.
               <br/><span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85em', display: 'block', marginTop: '4px' }}>$50 one-time</span>
            </span>
         </label>
      </div>

      <div className={styles.addOnBox} style={{ marginTop: 'var(--space-4)' }}>
         <label className="form-checkbox-group">
            <input 
               type="checkbox" 
               checked={data.google_listing_option}
               onChange={e => update('google_listing_option', e.target.checked)}
            />
            <span className="form-checkbox-label">
               <strong style={{ display: 'block', marginBottom: '4px' }}>Google Business Setup</strong>
               We'll set up and optimize your Google Business profile so you show up on Google Maps.
               <br/><span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85em', display: 'block', marginTop: '4px' }}>$50 one-time fee</span>
            </span>
         </label>
      </div>

      <div className="form-group" style={{ marginTop: 'var(--space-8)' }}>
         <label className="form-label">Anything else we should know?</label>
         <textarea 
            className="form-textarea"
            value={data.additional_notes} 
            onChange={e => update('additional_notes', e.target.value)} 
            placeholder="Any specific requests, wording to avoid, etc."
            style={{ minHeight: '80px' }}
         />
      </div>
    </div>
  );
}
