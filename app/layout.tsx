import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import './globals.css';
import { ToastProvider } from './ToastProvider';
import { SiteHeader, SiteFooter } from '@/components/SiteLayout';

export const metadata: Metadata = {
  title: 'WEBPRO50 — Get Your Business Website in Minutes',
  description:
    'Fill out one simple form and get a professional website preview for your small business. Only $50/month if you like it. Hosting included. No tech skills needed.',
  keywords: 'small business website, local business website, affordable website, website builder, plumber website, electrician website',
  openGraph: {
    title: 'WEBPRO50 — Get Your Business Website in Minutes',
    description: 'Fill out one simple form. We build your website. Only $50/month if you like it.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5X0ZPG308C"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-5X0ZPG308C');
          `}
        </Script>
      </head>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <ToastProvider />
      </body>
    </html>
  );
}


