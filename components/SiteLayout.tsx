'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith('/site/') || pathname?.startsWith('/preview/')) return null;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--color-gray-200)',
      height: 'var(--nav-height)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'var(--text-xl)',
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
          }}>
            WEB<span style={{ color: 'var(--color-gray-900)' }}>PRO50</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          <nav className="hide-on-mobile" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
            <a href="/#how-it-works" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-gray-600)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}>How it works</a>
            <a href="/#pricing" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-gray-600)',
              textDecoration: 'none',
            }}>Pricing</a>
            <a href="/#faq" style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-gray-600)',
              textDecoration: 'none',
            }}>FAQ</a>
          </nav>
          <Link href="/get-started" className="btn btn-primary" style={{ fontSize: 'var(--text-sm)', padding: '0.5rem 1.25rem' }}>
            Start My Website
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/site/') || pathname?.startsWith('/preview/')) return null;

  return (
    <footer style={{
      background: 'var(--color-gray-900)',
      color: 'var(--color-gray-400)',
      padding: 'var(--space-16) 0 var(--space-8)',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-12)',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'var(--text-xl)',
              color: 'var(--color-white)',
              marginBottom: 'var(--space-3)',
            }}>
              WEB<span style={{ color: 'var(--color-primary)' }}>PRO50</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 260 }}>
              Professional websites for local service businesses. No tech skills needed.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-white)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              Product
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {['How it works', 'Pricing', 'Industries', 'FAQ'].map(item => (
                <a key={item} href={`/#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-white)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              Get Started
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Link href="/get-started" style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
                Build My Website
              </Link>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-white)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              Pricing
            </div>
            <div style={{ fontSize: 'var(--text-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span>$50/month — Website + hosting</span>
              <span style={{ marginTop: 'var(--space-2)', color: 'var(--color-gray-500)', fontWeight: 500 }}>Optional:</span>
              <span>$50 one-time — Google listing setup</span>
              <span>$50 p/h— Deluxe refinement</span>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--color-gray-800)',
          paddingTop: 'var(--space-8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          fontSize: 'var(--text-xs)',
        }}>
          <span>© {new Date().getFullYear()} WEBPRO50. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
            <a href="#" style={{ color: 'var(--color-gray-500)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--color-gray-500)', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
