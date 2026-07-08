// lib/htmlSafeguard.ts
// Ensures AI-generated or mockup HTML websites adhere to responsive mobile header standards,
// embed uploaded Supabase logos, replace placeholder images with uploaded business photos,
// and implement auto-closing mobile navigation menus on small screens.

export function enhanceGeneratedHtml(
  html: string,
  logoUrl?: string | null,
  businessName?: string | null,
  photoUrls?: string[] | null,
  location?: string | null
): string {
  if (!html) return html;
  let modified = html;
  const bName = businessName || 'Business';
  const mapLoc = location || bName || 'United States';

  // 1. Guarantee Logo Embedding
  if (logoUrl) {
    // Replace existing logo img src or any placeholder img with class/alt containing logo
    let replaced = modified.replace(/(<img[^>]*(?:class|alt)=["'][^"']*logo[^"']*["'][^>]*src=["'])([^"']*)(["'])/gi, `$1${logoUrl}$3`);
    if (!replaced.includes(logoUrl)) {
      replaced = replaced.replace(/(<img[^>]*src=["'])([^"']*)(["'][^>]*(?:class|alt)=["'][^"']*logo[^"']*["'])/gi, `$1${logoUrl}$3`);
    }
    // If header or nav exists but still doesn't have the logo URL, inject it
    if (!replaced.includes(logoUrl)) {
      const imgTag = `<img src="${logoUrl}" alt="${bName} Logo" class="logo" style="max-height: 48px; width: auto; object-fit: contain; margin-right: 12px;" />`;
      replaced = replaced.replace(/(<header[^>]*>|<nav[^>]*>)/i, `$1\n  ${imgTag}`);
    }
    // Also check if footer exists and inject logo if not present in footer
    if (replaced.includes('<footer') && !replaced.split('<footer')[1].includes(logoUrl)) {
      const footerImg = `<img src="${logoUrl}" alt="${bName} Logo" style="max-height: 36px; width: auto; object-fit: contain; margin-bottom: 12px;" />`;
      replaced = replaced.replace(/(<footer[^>]*>)/i, `$1\n  <div style="margin-bottom: 1rem;">${footerImg}</div>`);
    }
    modified = replaced;
  }

  // 2. Replace placeholder images with uploaded business photos if provided
  if (photoUrls && photoUrls.length > 0) {
    let photoIdx = 0;
    // Replace any image URL (placeholder, relative, external, or mock) that is NOT the logo and NOT already an uploaded photo
    modified = modified.replace(/(<img[^>]*src=["'])([^"']*)(["'])/gi, (match, prefix, oldUrl, suffix) => {
      if (logoUrl && oldUrl === logoUrl) return match;
      if (photoUrls.includes(oldUrl)) return match;
      if (oldUrl.startsWith('data:image') && !oldUrl.includes('placeholder')) return match;
      
      const newUrl = photoUrls[photoIdx % photoUrls.length];
      photoIdx++;
      return `${prefix}${newUrl}${suffix}`;
    });

    // If none of the uploaded photos ended up in the document (or if there were no img tags), inject a gallery section
    const hasUploadedPhoto = photoUrls.some(url => modified.includes(url));
    if (!hasUploadedPhoto) {
      const galleryHtml = `
<!-- AI Safeguard: Uploaded Business Photos Gallery -->
<section class="ai-safeguard-gallery" style="padding: 4rem 1.5rem; background: #ffffff; text-align: center;">
  <div style="max-width: 1100px; margin: 0 auto;">
    <h2 style="font-size: 2.2rem; font-weight: 700; margin-bottom: 0.5rem; color: #1f2937;">Our Work &amp; Business Gallery</h2>
    <p style="color: #4b5563; margin-bottom: 2.5rem; font-size: 1.1rem;">Take a look at our recent projects and professional standards.</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
      ${photoUrls.map((url, i) => `
        <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); height: 240px; background: #f3f4f6;">
          <img src="${url}" alt="${bName} photo ${i + 1}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" />
        </div>
      `).join('')}
    </div>
  </div>
</section>`;
      if (modified.includes('<footer')) {
        modified = modified.replace(/<footer/i, `${galleryHtml}\n<footer`);
      } else if (modified.includes('</body>')) {
        modified = modified.replace('</body>', `${galleryHtml}\n</body>`);
      } else {
        modified += galleryHtml;
      }
    }
  }

  // 3. Guarantee Interactive Google Map Iframe (No API Key Required)
  if (!/maps\.google\.com|google\.com\/maps|output=embed/i.test(modified)) {
    const mapIframe = `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(mapLoc)}&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="380" frameborder="0" style="border:0; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); width: 100%;" allowfullscreen="" loading="lazy"></iframe>`;
    
    // Check if there is an existing map placeholder div or section to populate
    let mapInjected = false;
    if (/(<div[^>]*(?:id|class)=["'][^"']*(?:map|location|service-area)[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/i.test(modified)) {
      modified = modified.replace(/(<div[^>]*(?:id|class)=["'][^"']*(?:map|location|service-area)[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/i, (m, open, content, close) => {
        if (!content.includes('<iframe') && !content.includes('<img')) {
          mapInjected = true;
          return `${open}\n  <div style="padding: 10px; background: #fff; border-radius: 12px;">${mapIframe}</div>\n${close}`;
        }
        return m;
      });
    }

    if (!mapInjected) {
      const mapSectionHtml = `
<!-- AI Safeguard: Service Area Interactive Google Map -->
<section class="ai-safeguard-map" style="padding: 4rem 1.5rem; background: #f8f9fa; text-align: center;">
  <div style="max-width: 1000px; margin: 0 auto;">
    <h2 style="font-size: 2.2rem; font-weight: 700; margin-bottom: 0.5rem; color: #1f2937;">Our Service Area &amp; Location</h2>
    <p style="color: #4b5563; margin-bottom: 2rem; font-size: 1.1rem;">Proudly serving customers across ${mapLoc} and surrounding areas.</p>
    <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); background: #fff; padding: 8px;">
      ${mapIframe}
    </div>
  </div>
</section>`;
      if (modified.includes('<footer')) {
        modified = modified.replace(/<footer/i, `${mapSectionHtml}\n<footer`);
      } else if (modified.includes('</body>')) {
        modified = modified.replace('</body>', `${mapSectionHtml}\n</body>`);
      } else {
        modified += mapSectionHtml;
      }
    }
  }

  // 4. Inject Responsive Compact Header & Mobile Menu Auto-Close Script & Style
  const safeguardStyleAndScript = `
<!-- AI Safeguard: Responsive Compact Header & Auto-Close Mobile Menu -->
<style>
  @media (max-width: 768px) {
    header, .header, .navbar, [class*="header"] {
      display: flex !important;
      flex-wrap: nowrap !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 0.6rem 1rem !important;
      max-height: 68px !important;
      height: auto !important;
      position: sticky !important;
      top: 0 !important;
      z-index: 9999 !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08) !important;
      background: #ffffff !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    header img, .header img, [class*="header"] img {
      max-height: 36px !important;
      width: auto !important;
      object-fit: contain !important;
    }
    header nav, .header nav, [class*="header"] nav, nav, ul.menu, .nav-links {
      display: none !important;
      position: absolute !important;
      top: 100% !important;
      left: 0 !important;
      right: 0 !important;
      background: #ffffff !important;
      flex-direction: column !important;
      padding: 1.25rem !important;
      box-shadow: 0 15px 30px rgba(0,0,0,0.15) !important;
      border-bottom: 2px solid #3b82f6 !important;
      z-index: 9998 !important;
      gap: 1rem !important;
    }
    header nav.mobile-open, .header nav.mobile-open, nav.mobile-open, ul.menu.mobile-open, .nav-links.mobile-open {
      display: flex !important;
    }
    .ai-hamburger-toggle {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1.4rem;
      color: #1f2937;
      cursor: pointer;
      z-index: 10000;
      flex-shrink: 0;
    }
  }
  @media (min-width: 769px) {
    .ai-hamburger-toggle { display: none !important; }
  }
  html { scroll-behavior: smooth !important; }
</style>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    // 1. Mobile Menu Toggle
    var header = document.querySelector('header') || document.querySelector('.header') || document.querySelector('[class*="header"]');
    var nav = document.querySelector('header nav') || document.querySelector('nav') || document.querySelector('.nav-links') || document.querySelector('ul');
    if (header && nav) {
      if (!document.querySelector('.ai-hamburger-toggle')) {
        var btn = document.createElement('button');
        btn.className = 'ai-hamburger-toggle';
        btn.innerHTML = '☰';
        btn.setAttribute('aria-label', 'Toggle Navigation');
        btn.onclick = function(e) {
          e.stopPropagation();
          var isOpen = nav.classList.toggle('mobile-open');
          btn.innerHTML = isOpen ? '✕' : '☰';
        };
        header.appendChild(btn);
      }
      var links = nav.querySelectorAll('a, span, button');
      links.forEach(function(link) {
        link.addEventListener('click', function() {
          nav.classList.remove('mobile-open');
          var btn = document.querySelector('.ai-hamburger-toggle');
          if (btn) btn.innerHTML = '☰';
        });
      });
    }

    // 2. Automatically assign IDs to sections if missing for interactivity
    var sections = document.querySelectorAll('section, div[class*="section"], div[id*="section"], main > div, article, .ai-safeguard-map, .ai-safeguard-gallery');
    sections.forEach(function(sec) {
      var text = (sec.textContent || '').toLowerCase();
      var id = sec.getAttribute('id') || '';
      if (!id) {
        if (text.includes('about us') || text.includes('who we are') || text.includes('our story')) sec.id = 'about';
        else if (text.includes('our services') || text.includes('what we do') || text.includes('services')) sec.id = 'services';
        else if (text.includes('pricing') || text.includes('packages') || text.includes('our plans')) sec.id = 'pricing';
        else if (text.includes('frequently asked') || text.includes('faq') || text.includes('questions')) sec.id = 'faq';
        else if (text.includes('contact us') || text.includes('get in touch') || text.includes('request a quote') || text.includes('free quote')) sec.id = 'contact';
        else if (text.includes('service area') || text.includes('where we operate') || text.includes('location') || sec.classList.contains('ai-safeguard-map')) sec.id = 'location';
        else if (text.includes('why choose') || text.includes('guarantee') || text.includes('trust')) sec.id = 'why-us';
        else if (text.includes('work') || text.includes('gallery') || text.includes('projects') || sec.classList.contains('ai-safeguard-gallery')) sec.id = 'gallery';
      }
    });

    // 3. Make all navbar links interactive and smoothly scroll to sections
    var navLinks = document.querySelectorAll('header a, nav a, .navbar a, [class*="nav"] a, header span, nav span, ul.menu a, ul.menu span');
    navLinks.forEach(function(link) {
      var linkText = (link.textContent || '').trim().toLowerCase();
      var targetId = '';
      if (linkText.includes('about')) targetId = 'about';
      else if (linkText.includes('service')) targetId = 'services';
      else if (linkText.includes('price') || linkText.includes('pricing') || linkText.includes('plan')) targetId = 'pricing';
      else if (linkText.includes('faq') || linkText.includes('question')) targetId = 'faq';
      else if (linkText.includes('contact') || linkText.includes('quote') || linkText.includes('touch')) targetId = 'contact';
      else if (linkText.includes('area') || linkText.includes('location') || linkText.includes('map')) targetId = 'location';
      else if (linkText.includes('work') || linkText.includes('gallery') || linkText.includes('project')) targetId = 'gallery';
      else if (linkText.includes('why') || linkText.includes('trust')) targetId = 'why-us';
      else if (link.getAttribute('href') && link.getAttribute('href').startsWith('#') && link.getAttribute('href').length > 1) {
        targetId = link.getAttribute('href').substring(1);
      }

      if (targetId) {
        link.style.cursor = 'pointer';
        link.addEventListener('click', function(e) {
          var targetEl = document.getElementById(targetId) || document.querySelector('[id*="' + targetId + '"]') || document.querySelector('[class*="' + targetId + '"]');
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    });

    // 4. Make Hero and Header CTA buttons smoothly scroll to Contact or Services
    var ctaBtns = document.querySelectorAll('header button, .hero button, [class*="hero"] button, [class*="hero"] a, main button, section button');
    ctaBtns.forEach(function(btn) {
      var btnText = (btn.textContent || '').trim().toLowerCase();
      if (btnText.includes('quote') || btnText.includes('contact') || btnText.includes('book') || btnText.includes('get started') || btnText.includes('message')) {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', function(e) {
          var contactEl = document.getElementById('contact') || document.querySelector('[id*="contact"]') || document.querySelector('form') || document.querySelector('footer');
          if (contactEl) {
            e.preventDefault();
            contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      } else if (btnText.includes('service') || btnText.includes('what we do')) {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', function(e) {
          var servEl = document.getElementById('services') || document.querySelector('[id*="service"]');
          if (servEl) {
            e.preventDefault();
            servEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }
    });
  });
</script>
`;

  if (!modified.includes('ai-hamburger-toggle')) {
    if (modified.includes('</body>')) {
      modified = modified.replace('</body>', `${safeguardStyleAndScript}\n</body>`);
    } else {
      modified = modified + safeguardStyleAndScript;
    }
  }

  return modified;
}
