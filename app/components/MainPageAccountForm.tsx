'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export default function MainPageAccountForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email_address: '',
    phone_number: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      toast.success('Message sent successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        email_address: '',
        phone_number: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
        
        {/* Row 1: First Name & Last Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-responsive">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              First Name
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={e => updateField('first_name', e.target.value)}
              placeholder="John"
              required
              style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', color: '#1f2937', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fafafa', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Last Name
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={e => updateField('last_name', e.target.value)}
              placeholder="Doe"
              required
              style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', color: '#1f2937', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fafafa', boxSizing: 'border-box' }}
              onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>

        {/* Row 2: Email Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Email Address
          </label>
          <input
            type="email"
            value={formData.email_address}
            onChange={e => updateField('email_address', e.target.value)}
            placeholder="john@example.com"
            required
            style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', color: '#1f2937', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fafafa', boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Row 3: Phone Number */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={e => updateField('phone_number', e.target.value)}
            placeholder="+1 (555) 000-0000"
            style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', color: '#1f2937', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fafafa', boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Row 4: Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={e => updateField('message', e.target.value)}
            placeholder="How can we help you prepare for your visit?"
            required
            rows={5}
            style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', color: '#1f2937', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fafafa', resize: 'vertical', boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            width: '100%',
            padding: '1.25rem',
            background: '#2563eb', // Blue background
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderRadius: '8px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)'
          }}
          onMouseOver={e => !loading && (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={e => !loading && (e.currentTarget.style.background = '#2563eb')}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <style jsx global>{`
        @media (max-width: 640px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
