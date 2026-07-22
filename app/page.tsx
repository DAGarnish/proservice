// app/page.tsx — PROSERVICE Homepage
// All homepage sections: Hero, How it works, Pricing, Industries, FAQ, CTA

import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, Zap, FileText, Eye, Globe, Star,
  ShieldCheck, Phone, DollarSign, ChevronDown, Wrench, Paintbrush,
  Droplets, Leaf, Scissors, Car, BookOpen, Calculator, Hammer,
  Plug, Wind, Home, Sparkles, Truck, Key, Camera, Settings, RefreshCw,
  Mic, Scale, Waves, Compass, Building, Armchair
} from 'lucide-react';
import FAQLink from './FAQLink';
import MainPageAccountForm from './components/MainPageAccountForm';
import FAQItemClient from './components/FAQItemClient';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <PricingSection />
      <IndustriesSection />
      <CTABannerSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            No tech skills needed
          </div>
          <h1 className={styles.heroTitle}>
            Get a Professional Business Website.
            <br />
            <span className={styles.heroAccent}>Designed for Free!</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Fill out one simple form. We build your search engine optimised website. Then rent for{' '}
            <strong>$50/month</strong> if you love it. Hosting and bespoke web address included.
          </p>
          <div className={styles.heroCTAs}>
            <Link href="/get-started" className="btn btn-primary btn-lg">
              Start My Website <ArrowRight size={18} />
            </Link>
            <a href="https://www.penedeswinetours.com/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2, padding: 'var(--space-2) var(--space-6)' }}>
              <span>See Example</span>
              <span style={{ fontSize: '0.65em', fontWeight: 400, opacity: 0.8 }}>(without deluxe refinement)</span>
            </a>
          </div>
          <div className={styles.heroTrust}>
            <div className={styles.heroTrustItem}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>No contracts</span>
            </div>
            <div className={styles.heroTrustItem}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>No setup fees</span>
            </div>
            <div className={styles.heroTrustItem}>
              <CheckCircle2 size={16} color="#16a34a" />
              <span>Cancel anytime</span>
            </div>
            <div className={styles.heroTrustItem}>
              <span style={{ marginRight: '4px', fontSize: '1.5em' }}>🇺🇸 🇬🇧</span>
              <span style={{ fontSize: '1.1em', fontWeight: 600 }}>USA/UK company and team</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', backgroundColor: 'var(--color-white)', padding: 'var(--space-4) var(--space-6)', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-gray-200)', marginTop: 'calc(var(--space-6) + 30px)', width: 'fit-content' }}>
            <img src="/dave.jpg" alt="Dave" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-700)', margin: 0, lineHeight: 1.4 }}>
              <strong>Hi, I'm Dave, your account manager.</strong><br />I will be guiding you through the process, so <a href="#verify-email-form" style={{ textDecoration: 'underline', color: 'inherit' }}>send me a message!</a>
            </p>
          </div>
        </div>
        <div className={styles.heroRightColumn} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div className={styles.heroCTAbox}>
            <div style={{ textAlign: 'center', backgroundColor: 'var(--color-white)', padding: 'var(--space-10) var(--space-8)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-gray-200)' }}>
              <ShieldCheck size={40} color="var(--color-primary)" style={{ margin: '0 auto var(--space-4)' }} />
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: 'var(--space-4)', lineHeight: 1.3 }}>
                Your Customers Are Searching Online.<br />Let Them Find You.
              </h2>
              <p style={{ color: 'var(--color-gray-600)', fontSize: '1rem', marginBottom: 'var(--space-8)', lineHeight: 1.6 }}>
                Stop losing work to competitors with websites. Get yours in minutes — not weeks.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/get-started" className="btn btn-primary btn-sm">
                  Start My Website <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.mockBrowser}>
              <div className={styles.mockBrowserBar}>
                <div className={styles.mockDots}>
                  <span className={styles.mockDot} style={{ background: '#ef4444' }} />
                </div>
                <div className={styles.mockUrlBar}>
                  <span className={styles.mockUrlText}>yourbusiness.com</span>
                </div>
              </div>
              <div className={styles.mockBrowserContent}>
                <div className={styles.mockHeroBlock} />
                <div className={styles.mockTextLines}>
                  <div className={styles.mockLine} style={{ width: '80%' }} />
                  <div className={styles.mockLine} style={{ width: '60%' }} />
                  <div className={styles.mockLine} style={{ width: '90%' }} />
                </div>
                <div className={styles.mockCardRow}>
                  <div className={styles.mockCard} />
                  <div className={styles.mockCard} />
                  <div className={styles.mockCard} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorksSection() {
  const steps = [
    {
      icon: <FileText size={28} />,
      step: '1',
      title: 'Fill Out the Form',
      description: 'Tell us about your business, services, and style preferences. Takes about 10 minutes.',
    },
    {
      icon: <Zap size={28} />,
      step: '2',
      title: 'We Build Your Site',
      description: 'We build a website preview for your business — in one business day, not weeks.',
    },
    {
      icon: <Eye size={28} />,
      step: '3',
      title: 'Preview & Approve',
      description: 'Review your website\'s first draft. Love it? We get you online.',
    },
    {
      icon: <Settings size={28} />,
      step: '4',
      title: 'Sign Up and Refine',
      description: 'Refine your website with Dave, and make any changes you require.',
    },
    {
      icon: <Globe size={28} />,
      step: '5',
      title: 'Find the Perfect Domain',
      description: 'Find the perfect SEO & brand domain with Dave (e.g. jsmithhvacNYC.com).',
    },
    {
      icon: <RefreshCw size={28} />,
      step: '6',
      title: 'Review and Refine',
      description: 'Review and refine every quarter for no additional cost.',
    },
  ];

  return (
    <section id="how-it-works" className={`section ${styles.howItWorks}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className="badge badge-primary">Simple process</span>
          <h2>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            No learning WordPress. No fighting with Wix. No hiring expensive agencies.
            <br />
            Just fill out a simple form, and our UK and US-based team will take care of everything.
          </p>
        </div>
        <div className={styles.stepsGrid}>
          {steps.map((s, i) => (
            <div key={i} className={styles.stepCard}>
              <div className={styles.stepNumber}>{s.step}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function PricingSection() {
  return (
    <section id="pricing" className={`section ${styles.pricing}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className="badge badge-accent">Transparent pricing</span>
          <h2>Simple, Honest Pricing</h2>
          <p className={styles.sectionSubtitle}>
            No hidden fees. No surprise charges. Only pay if you love your website.
          </p>
        </div>

        <div className={styles.pricingGrid}>
          {/* Main Plan */}
          <div className={`${styles.pricingCard} ${styles.pricingMain}`}>
            <div className={styles.pricingPopular}>Most Popular</div>
            <h3>Your Business Website</h3>
            <div className={styles.pricingAmount}>
              <span className={styles.pricingDollar}>$</span>
              <span className={styles.pricingNumber}>50</span>
              <span className={styles.pricingPeriod}>/month</span>
            </div>
            <p className={styles.pricingNote}>Only pay if you like your website</p>
            <ul className={styles.pricingFeatures}>
              <li><CheckCircle2 size={16} color="#16a34a" /> Professional website built for you</li>
              <li><CheckCircle2 size={16} color="#16a34a" /> Hosting included</li>
              <li><CheckCircle2 size={16} color="#16a34a" /> Mobile-optimised design</li>
              <li><CheckCircle2 size={16} color="#16a34a" /> SEO-ready pages</li>
              <li><CheckCircle2 size={16} color="#16a34a" /> Contact form & click-to-call</li>
              <li><CheckCircle2 size={16} color="#16a34a" /> Ongoing support</li>
              <li><CheckCircle2 size={16} color="#16a34a" /> Cancel anytime</li>
            </ul>
            <Link href="/get-started" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Start My Website <ArrowRight size={18} />
            </Link>
          </div>

          {/* Add-ons */}
          <div className={styles.addOnsColumn}>
            <h3 className={styles.addOnsTitle}>Optional Add-Ons</h3>

            <div className={styles.addOnCard}>
              <div className={styles.addOnHeader}>
                <Globe size={20} color="var(--color-primary)" />
                <div>
                  <strong>Google Listing Setup</strong>
                  <span className={styles.addOnPrice}>$50 one-time</span>
                </div>
              </div>
              <p>Get found on Google Maps and local search. We set up and optimize your Google Business Profile.</p>
            </div>

            <div className={styles.addOnCard}>
              <div className={styles.addOnHeader}>
                <Settings size={20} color="var(--color-primary)" />
                <div>
                  <strong>Deluxe Refinement</strong>
                  <span className={styles.addOnPrice}>$50 p/h (we can do a lot in an hour)</span>
                </div>
              </div>
              <p>Deluxe refinement: super fancy stuff, additional pages, logo tweaking. See more in <FAQLink /></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Industries ─── */
function IndustriesSection() {
  const industries = [
    { icon: <Leaf size={22} />, name: 'Landscapers' },
    { icon: <Plug size={22} />, name: 'Electricians' },
    { icon: <Wind size={22} />, name: 'HVAC' },
    { icon: <Sparkles size={22} />, name: 'Cleaners' },
    { icon: <Wrench size={22} />, name: 'Plumbers' },
    { icon: <Home size={22} />, name: 'Roofers' },
    { icon: <Star size={22} />, name: 'Models' },
    { icon: <Scissors size={22} />, name: 'Salons & Barbers' },
    { icon: <Car size={22} />, name: 'Auto Repair' },
    { icon: <BookOpen size={22} />, name: 'Tutors' },
    { icon: <Calculator size={22} />, name: 'Accountants' },
    { icon: <Truck size={22} />, name: 'Movers' },
    { icon: <Key size={22} />, name: 'Locksmiths' },
    { icon: <Camera size={22} />, name: 'Photographers' },
    { icon: <Mic size={22} />, name: 'Sound Engineers' },
    { icon: <Scale size={22} />, name: 'Legal' },
    { icon: <Waves size={22} />, name: 'Pool Services' },
    { icon: <Compass size={22} />, name: 'Architects' },
    { icon: <Building size={22} />, name: 'Real Estate Agents' },
    { icon: <Armchair size={22} />, name: 'Upholsterers' },
  ];

  return (
    <section id="industries" className={`section ${styles.industries}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className="badge badge-primary">Built for local businesses</span>
          <h2>Industries We Serve</h2>
          <p className={styles.sectionSubtitle}>
            We specialise in websites for businesses and sole traders, worldwide.
          </p>
        </div>
        <div className={styles.industriesGrid}>
          {industries.map((ind, i) => (
            <div key={i} className={styles.industryCard}>
              <div className={styles.industryIcon}>{ind.icon}</div>
              <span>{ind.name}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-6)' }}>
          Don&apos;t see your industry? We work with all kinds of local service businesses.
        </p>
      </div>
    </section>
  );
}

/* ─── Mid-page CTA ─── */
function CTABannerSection() {
  return (
    <section className={styles.ctaBanner}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-white)', marginBottom: 'var(--space-4)' }}>
          Ready to Get Your Business Online?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)', maxWidth: 560, margin: '0 auto var(--space-8)' }}>
          It takes less than 10 minutes. No tech skills needed. Only pay if you love it.
        </p>
        <Link href="/get-started" className="btn btn-white btn-lg">
          Build My Preview <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQSection() {
  const faqs: { id?: string; q: string; a: React.ReactNode }[] = [
    {
      q: 'Do I need any technical skills?',
      a: 'Not at all. You just fill out a simple form about your business — like your services, location, and style preferences. We handle all the technical work.',
    },
    {
      q: 'What if I don\'t like the website?',
      a: 'You only pay if you\'re happy with the result. You can request changes, or simply walk away — no obligation, no charges.',
    },
    {
      q: 'Is the $50/month really all I pay?',
      a: 'Yes — $50/month covers your website and hosting. The only optional extras are the Google listing setup ($50 one-time) and deluxe refinement: super fancy stuff, additional pages, logo tweaking etc. $50 p/h. Most clients do not require this.',
    },
    {
      q: 'Can I cancel anytime?',
      a: 'Absolutely. There are no contracts or lock-in periods. Cancel whenever you want.',
    },
    {
      q: 'How long does it take to get my website?',
      a: 'You\'ll see a website preview within minutes of submitting your form. Once you approve it, we can typically get you live within 24-48 hours.',
    },
    {
      q: 'Do I need a domain name?',
      a: 'No — you get a free consultation with Dave to decide the best domain for you and we take care of the rest... including the cost. If you have a domain you wish to port over, we can do that if you provide us with the technical information we need.',
    },
    {
      q: 'What\'s included in the Google listing setup?',
      a: 'We create and optimize your Google Business Profile so you show up in Google Maps and local search results. This is a $50 one-time fee.',
    },
    {
      q: 'Can I make changes to my website later?',
      a: 'Yes. All clients can request a refresh and/or update every quarter.',
    },
    {
      id: 'faq-deluxe',
      q: 'Do I need Deluxe Refinement?',
      a: (
        <>
          Probably not — see <a href="https://www.penedeswinetours.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>this</a> example of no deluxe refinement and <a href="https://www.garnishrealestate.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>this</a> one with it added. The additions are the fancy Fee Transparency Calculator and the three guides just above that. It was all done in one hour ($50). Maybe one day in the future if you really get into your website :)
        </>
      ),
    },
  ];

  return (
    <section id="faq" className={`section ${styles.faq}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className="badge badge-primary">Questions?</span>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <FAQItemClient key={i} id={faq.id} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA / Account Form Section ─── */
function FinalCTASection() {
  return (
    <section id="verify-email-form" className={`section ${styles.finalCTA}`} style={{ paddingBottom: '4rem' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <ShieldCheck size={42} color="var(--color-primary)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '8px', lineHeight: 1.3 }}>
            Your Customers Are Searching Online.<br />Let Them Find You.
          </h2>
          <p style={{ color: 'var(--color-gray-600)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 24px' }}>
            Stop losing work to competitors with websites. Get yours in minutes — not weeks.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/get-started" className="btn btn-primary btn-lg">
              Start My Website <ArrowRight size={18} />
            </Link>
            <a
              href="https://www.penedeswinetours.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-lg"
              style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2, padding: 'var(--space-2) var(--space-6)' }}
            >
              <span>See Example</span>
              <span style={{ fontSize: '0.65em', fontWeight: 400, opacity: 0.8 }}>(without deluxe refinement)</span>
            </a>
          </div>
        </div>
        <MainPageAccountForm />
      </div>
    </section>
  );
}
