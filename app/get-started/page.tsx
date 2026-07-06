// app/get-started/page.tsx
// Multi-step intake form page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { defaultFormData, FormData, WebsiteLookId } from '@/types/form';
import { validateStepByIndex, hasErrors, StepErrors } from '@/lib/validation';
import styles from './get-started.module.css';

const TOTAL_STEPS = 7;

export default function GetStartedPage() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<StepErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleNext = () => {
    const stepErrors = validateStepByIndex(currentStep, formData);
    if (hasErrors(stepErrors)) {
      setErrors(stepErrors);
      // Scroll to top to see errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setErrors({});
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(curr => curr + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

      // Redirect to preview screen
      if (data.previewId) {
         router.push(`/preview/${data.previewId}`);
      } else {
         throw new Error("No preview ID returned");
      }
      
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Business Basics',
    'Services',
    'Trust & Credibility',
    'Brand & Style',
    'SEO & Location',
    'Conversion Details',
    'Add-ons & Final Details'
  ];

  return (
    <div className={styles.pageContainer}>
      <div className="container">
        
        {/* Stepper Header */}
        <div className={styles.stepperHeader}>
           <div className={styles.progressBarContainer}>
              <div 
                 className={styles.progressBarFill} 
                 style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }} 
              />
           </div>
           <div className={styles.stepIndicator}>
              Step {currentStep + 1} of {TOTAL_STEPS}: {stepTitles[currentStep]}
           </div>
        </div>

        {/* Form Container */}
        <div className={styles.formContainer}>
          {submitError && (
             <div className="alert alert-error" style={{ marginBottom: 'var(--space-6)' }}>
                <strong>Error:</strong> {submitError}
             </div>
          )}

          {/* Steps Content */}
          {currentStep === 0 && (
            <Step1BusinessBasics data={formData} update={updateField} errors={errors} />
          )}
          {currentStep === 1 && (
            <Step2Services data={formData} update={updateField} errors={errors} />
          )}
          {currentStep === 2 && (
            <Step3Trust data={formData} update={updateField} errors={errors} />
          )}
          {currentStep === 3 && (
            <Step4Brand data={formData} update={updateField} errors={errors} />
          )}
          {currentStep === 4 && (
            <Step5SEO data={formData} update={updateField} errors={errors} />
          )}
          {currentStep === 5 && (
            <Step6Conversion data={formData} update={updateField} errors={errors} />
          )}
          {currentStep === 6 && (
            <Step7AddOns data={formData} update={updateField} errors={errors} />
          )}

          {/* Navigation Buttons */}
          <div className={styles.navButtons}>
            <button 
               className="btn btn-ghost" 
               onClick={handleBack} 
               disabled={currentStep === 0 || isSubmitting}
            >
              Back
            </button>
            <button 
               className="btn btn-primary" 
               onClick={handleNext}
               disabled={isSubmitting}
            >
              {isSubmitting ? 'Generating...' : (currentStep === TOTAL_STEPS - 1 ? 'Build My Website' : 'Continue')}
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
  return (
    <div className={styles.stepContent}>
      <h2>Tell us about your business</h2>
      <p className="form-hint" style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
         Let's start with the basics. This information will be used to generate your website copy and contact details.
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
            <div className="form-hint" style={{marginTop: 4}}>We'll send your preview link here.</div>
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
  const looks: { id: WebsiteLookId; name: string; colors: string[]; desc: string }[] = [
    { id: 'professional-blue', name: 'Professional Blue', colors: ['#1D4ED8', '#DBEAFE', '#0F172A'], desc: 'Trustworthy, established (Great for trades)' },
    { id: 'local-green', name: 'Local Green', colors: ['#15803D', '#DCFCE7', '#14532D'], desc: 'Reliable, eco-friendly (Great for landscapers, cleaners)' },
    { id: 'warm-premium', name: 'Warm Premium', colors: ['#8B5E3C', '#F5E6D3', '#3F2A1D'], desc: 'Grounded, boutique (Great for premium services)' },
    { id: 'dark-regal', name: 'Dark Regal', colors: ['#312E81', '#E0E7FF', '#111827'], desc: 'High-end, serious (Great for specialists)' },
    { id: 'clean-minimal', name: 'Clean Minimal', colors: ['#374151', '#F3F4F6', '#111827'], desc: 'Modern, neutral (Works for anyone)' },
    { id: 'bold-strong', name: 'Bold Strong', colors: ['#B91C1C', '#FEE2E2', '#450A0A'], desc: 'Confident, urgent (Great for emergency services)' },
  ];

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

      <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
         <label className="form-checkbox-group">
            <input 
               type="checkbox" 
               checked={data.logo_uploaded}
               onChange={e => update('logo_uploaded', e.target.checked)}
            />
            <span className="form-checkbox-label">
               <strong>I have a logo</strong>
               <div className="form-hint">Check this if you have a logo ready to use. We'll ask for it later.</div>
            </span>
         </label>
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
               <strong style={{ display: 'block', marginBottom: '4px' }}>Branded Custom Domain</strong>
               Get a professional domain like <em>johncolemanplumbing.com</em>. Helps significantly with Google rankings. 
               <br/><span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85em', display: 'block', marginTop: '4px' }}>$50 URL consultation and setup</span>
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
