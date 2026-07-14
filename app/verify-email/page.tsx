// app/verify-email/page.tsx
// Verification confirmation screen for WebPro50 user accounts

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const previewId = searchParams.get('previewId');
  const sent = searchParams.get('sent');
  const emailParam = searchParams.get('email');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'sent'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    if (sent === 'true' || (!token && emailParam)) {
      setStatus('sent');
      return;
    }

    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found in the URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/verify-email?token=${encodeURIComponent(token)}${previewId ? `&previewId=${encodeURIComponent(previewId)}` : ''}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Verification failed. Token may be expired.');
        }

        setStatus('success');
        setUserData(data.user);
        toast.success('🎉 Your email address has been successfully verified!');
        
        // Save verification status in localStorage so preview pages immediately know user is verified
        if (data.user?.email) {
          localStorage.setItem('proservice_verified_email', data.user.email);
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Could not verify your email address.');
      }
    };

    verifyToken();
  }, [token, previewId]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '560px', width: '100%', padding: '3.5rem 2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* WebPro50 Brand Header */}
        <div style={{ fontFamily: 'Outfit, Inter, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '2rem', letterSpacing: '-0.5px' }}>
          WEB<span style={{ color: '#2563eb' }}>PRO50</span> AI Studio
        </div>

        {status === 'sent' && (
          <div>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)' }}>
              <Sparkles size={44} />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
              Verification Link Sent! 📩
            </h1>
            <p style={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              We have dispatched a secure email verification link to <strong style={{ color: '#1d4ed8' }}>{emailParam || 'your inbox'}</strong>.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem', textAlign: 'left', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <ShieldCheck size={28} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', color: '#1e293b', fontSize: '1.02rem', marginBottom: '4px' }}>Next Step: Open Your Inbox &amp; Verify</strong>
                <span style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, display: 'block' }}>
                  Please open your email application (and check spam/junk folders just in case). Click the **"Verify My Email Address"** button inside the email to confirm your account and activate your website!
                </span>
              </div>
            </div>

          </div>
        )}

        {status === 'verifying' && (
          <div style={{ padding: '2rem 0' }}>
            <Loader2 size={56} style={{ color: '#2563eb', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.75rem' }}>Verifying Your Email Address...</h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Please wait while we confirm your account ownership and activate your management features.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.3)' }}>
              <ShieldCheck size={48} />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
              Email Address Verified! 🎉
            </h1>
            <p style={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Congratulations, {userData?.name || 'Valued Partner'}! Your email address <strong style={{ color: '#1d4ed8' }}>{userData?.email}</strong> is now officially verified. You now have full clearance to manage your website, configure custom domains, and deploy your site to the public.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', marginBottom: '2.5rem', textAlign: 'left', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Sparkles size={24} color="#2563eb" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.95rem' }}>Full Management Access Unlocked</strong>
                <span style={{ color: '#64748b', fontSize: '0.88rem' }}>Your AI website mockup is ready and awaiting your approval.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              style={{ width: '100%', padding: '1.1rem 2rem', fontSize: '1.15rem', fontWeight: 700, background: '#2563eb', color: '#ffffff', borderRadius: '14px', border: 'none', cursor: 'pointer' }}
            >
              Return to Homepage
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <AlertCircle size={48} />
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
              Verification Could Not Be Completed
            </h1>
            <p style={{ color: '#4b5563', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              {errorMessage}
            </p>
            {previewId ? (
              <button
                type="button"
                onClick={() => router.push(`/preview/${previewId}`)}
                style={{ width: '100%', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 700, background: '#1f2937', color: '#ffffff', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
              >
                Continue to Website Preview Anyway
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/get-started')}
                style={{ width: '100%', padding: '1rem 2rem', fontSize: '1.1rem', fontWeight: 700, background: '#2563eb', color: '#ffffff', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
              >
                Return to Intake Form
              </button>
            )}
          </div>
        )}

      </div>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
