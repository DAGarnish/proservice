'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Mail, Building2, User, MapPin, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';

export default function MainPageAccountForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    email_address: '',
    confirm_email_address: '',
    business_address: '',
    occupation: '',
    phone_number: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const emailsMatch = formData.email_address && formData.confirm_email_address && 
    formData.email_address.trim().toLowerCase() === formData.confirm_email_address.trim().toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.business_name.trim()) newErrors.business_name = 'Business Name is required';
    if (!formData.contact_name.trim()) newErrors.contact_name = 'Contact / Accounting Name is required';
    if (!formData.occupation.trim()) newErrors.occupation = 'Business type / occupation is required';
    if (!formData.email_address.trim()) {
      newErrors.email_address = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_address)) {
      newErrors.email_address = 'Please enter a valid email address';
    }

    if (!formData.confirm_email_address.trim()) {
      newErrors.confirm_email_address = 'Please verify your email address twice';
    } else if (!emailsMatch) {
      newErrors.confirm_email_address = 'Email addresses do not match exactly';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors before submitting the form.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('🚀 Creating your verified account & generating AI website preview...');

    try {
      const response = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: formData.business_name.trim(),
          contact_name: formData.contact_name.trim(),
          phone_number: formData.phone_number.trim() || 'Not Provided',
          email_address: formData.email_address.trim().toLowerCase(),
          confirm_email_address: formData.confirm_email_address.trim().toLowerCase(),
          business_address: formData.business_address.trim() || 'Online / Mobile',
          occupation: formData.occupation.trim(),
          main_city: formData.business_address.trim() || 'Local Area',
          service_pages: true,
          contact_form: true,
          google_maps: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create account or generate preview');
      }

      toast.update(toastId, {
        render: '🎉 Account created & verification email dispatched! Redirecting...',
        type: 'success',
        isLoading: false,
        autoClose: 2500,
      });

      if (formData.email_address) {
        localStorage.setItem('proservice_user_email', formData.email_address.trim().toLowerCase());
      }

      // Redirect to the dedicated email verification sent screen
      const encodedEmail = encodeURIComponent(formData.email_address.trim().toLowerCase());
      const tokenParam = data.verificationToken ? `&token=${data.verificationToken}` : '';
      router.push(`/verify-email?sent=true&email=${encodedEmail}${tokenParam}`);
    } catch (err: any) {
      console.error('Account Form Error:', err);
      toast.update(toastId, {
        render: err.message || 'Something went wrong while submitting the form.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '24px',
      padding: '2.5rem 2rem',
      boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12)',
      border: '1px solid #e2e8f0',
      maxWidth: '680px',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Sleek top accent ribbon */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa)' }} />

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1d4ed8', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px', border: '1px solid #bfdbfe' }}>
          <ShieldCheck size={15} /> Verified Account Setup
        </div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.25 }}>
          Connect with us by Verifying Email .
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.96rem', margin: 0, lineHeight: 1.5 }}>
          Please enter your accounting/contact information and add your email address twice to verify match. We will send the verification in the email!
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
        
        {/* Row 1: Business Name & Accounting Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive">
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              <Building2 size={15} style={{ color: '#2563eb' }} /> Business Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.business_name}
              onChange={e => updateField('business_name', e.target.value)}
              placeholder="e.g. Apex Plumbing & Heating"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: errors.business_name ? '2px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = errors.business_name ? '#ef4444' : '#cbd5e1'}
            />
            {errors.business_name && <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.business_name}</span>}
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              <User size={15} style={{ color: '#2563eb' }} /> Contact / Accounting Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.contact_name}
              onChange={e => updateField('contact_name', e.target.value)}
              placeholder="e.g. John Smith"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: errors.contact_name ? '2px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = errors.contact_name ? '#ef4444' : '#cbd5e1'}
            />
            {errors.contact_name && <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.contact_name}</span>}
          </div>
        </div>

        {/* Row 2: Occupation & Business Address */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive">
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              <Briefcase size={15} style={{ color: '#2563eb' }} /> Business Type / Trade <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={e => updateField('occupation', e.target.value)}
              placeholder="e.g. Plumber, Electrician, Cleaner"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: errors.occupation ? '2px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = errors.occupation ? '#ef4444' : '#cbd5e1'}
            />
            {errors.occupation && <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.occupation}</span>}
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              <MapPin size={15} style={{ color: '#2563eb' }} /> Accounting / Business Address
            </label>
            <input
              type="text"
              value={formData.business_address}
              onChange={e => updateField('business_address', e.target.value)}
              placeholder="e.g. 100 Main Street, Suite 2B, Chicago"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            />
          </div>
        </div>

        {/* Row 3: Email Address & Double Entry Verification */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} style={{ color: '#2563eb' }} /> Dual Email Verification (Must Match Exactly)
            </span>
            {formData.email_address && formData.confirm_email_address && (
              emailsMatch ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
                  <CheckCircle2 size={13} /> Email Addresses Match!
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700 }}>
                  <AlertCircle size={13} /> Emails Do Not Match
                </span>
              )
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email_address}
                onChange={e => updateField('email_address', e.target.value)}
                placeholder="e.g. contact@yourbusiness.com"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: errors.email_address ? '2px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={e => e.currentTarget.style.borderColor = errors.email_address ? '#ef4444' : '#cbd5e1'}
              />
              {errors.email_address && <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.email_address}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Confirm Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.confirm_email_address}
                onChange={e => updateField('confirm_email_address', e.target.value)}
                placeholder="Repeat email address exactly"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: errors.confirm_email_address ? '2px solid #ef4444' : (emailsMatch && formData.confirm_email_address ? '2px solid #22c55e' : '1px solid #cbd5e1'), fontSize: '0.95rem', background: '#ffffff', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={e => e.currentTarget.style.borderColor = errors.confirm_email_address ? '#ef4444' : '#cbd5e1'}
              />
              {errors.confirm_email_address && <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>{errors.confirm_email_address}</span>}
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            🔒 we will send you an email in you account to verify
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            width: '100%',
            padding: '1rem 1.75rem',
            background: loading ? '#94a3b8' : '#2563eb',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.05rem',
            borderRadius: '14px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => !loading && (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={e => !loading && (e.currentTarget.style.background = '#2563eb')}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Submitting...
            </>
          ) : (
            <>
              Submit <ArrowRight size={18} />
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '0.25rem', color: '#64748b', fontSize: '0.82rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} color="#16a34a" /> No credit card required</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} color="#16a34a" /> Instant email confirmation</span>
        </div>
      </form>

      <style jsx global>{`
        @media (max-width: 640px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
