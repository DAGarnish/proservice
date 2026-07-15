// lib/geminiGenerator.ts
// Calls Google Gemini to generate a complete small-business website
// from the structured website brief built by promptBuilder.ts.
// API key is read server-side only from process.env.GEMINI_API_KEY.

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `Design and build a complete small-business website based on the user's submitted form data.

The website is for a local service business or sole trader in the USA. It must look professional, trustworthy, modern, mobile-friendly, and conversion-focused. The site should feel like a real business website that could go live with minor edits.

IMPORTANT
Use the form data as the source of truth for the content, tone, branding, service areas, trust signals, and calls to action. Do not generate generic filler if specific user data is available. If some fields are missing, infer carefully from the business type without making unrealistic claims.

GOAL
Generate a complete website design and implementation based on the form data. The output should be a polished business website with strong local SEO structure, clear contact paths, and a visible service area section with map support.

WEBSITE REQUIREMENTS
20. Build a multi-section website with the following sections where relevant:

1. TOP ANNOUNCEMENT / PROMO BANNER (If Seasonal Offers exist)
- If seasonal_offers or promotions are provided in the brief, include a top announcement bar above the header with eye-catching contrast and a CTA button.

2. TOP HEADER / NAVIGATION BAR
- Clean, professional header with Business Logo / Name on the left and Navigation Links (Services, About, Pricing, FAQ, Contact) + Primary Call-to-Action button on the right.
- CRITICAL RESPONSIVENESS RULE FOR HEADER: The header MUST be fully responsive inside any viewport or iframe. Use CSS flexbox with 'flex-wrap: wrap' and media queries ('@media (max-width: 768px)') so that on mobile/tablet viewports (under 768px), the navigation links either wrap cleanly, adjust spacing/font-size, or stack neatly without overflowing horizontally or clipping text. Never use fixed widths that break on 390px or 768px iframe screens.

3. HERO SECTION
- Business name prominently displayed
- Strong headline based on occupation, location, and top service
- Supporting copy focused on trust and outcome
- Primary CTA button based on main_cta
- Secondary CTA where useful
- Show trust indicators such as years in business, insured, qualified, emergency service, etc.

4. ABOUT SECTION
- Short, human, specific company intro
- Mention service area, experience, and differentiators
- Keep tone aligned to selected style_preference and selected_website_look

5. SERVICES & PRICING SECTION
- Clearly present main_services
- Give extra prominence to top_services_to_promote
- If price_list exists, render clean, structured pricing tiers, package cards, or a transparent pricing table (do not just list plain text bullet points).
- Use cards or sections that are easy to scan with benefit-oriented copy and icons.

6. WHY CHOOSE US / TRUST SECTION
- Use differentiator
- Qualifications / licences / registrations / certifications
- Insurance status (show a prominent "Fully Insured" badge if true)
- Memberships / trade bodies
- Specialist tools or equipment
- Guarantees or promises
- Notable work if available

7. SERVICE AREA & INTERACTIVE GOOGLE MAP SECTION — CRITICAL
- Show the main town/city and full service area list.
- Explain where the business operates in clear language.
- CRITICAL MAP RULE: To display a live, interactive Google Map without needing a paid API key, you MUST use the following free embed iframe format:
  <iframe src="https://maps.google.com/maps?q=ENCODED_LOCATION&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="380" frameborder="0" style="border:0; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); width: 100%;" allowfullscreen="" loading="lazy"></iframe>
  Replace ENCODED_LOCATION with the URL-encoded business address, main city, or service area (for example: "New+York,+NY" or "Chicago,+IL" or "London,+UK").
- NEVER generate an empty placeholder div, mock comment, or "Map coming soon" text. You MUST ALWAYS generate a real, working iframe with the URL structure above!

8. TESTIMONIALS / SOCIAL PROOF & GALLERY
- If testimonials are available, display them in a strong testimonial card section with star ratings.
- If uploaded photo URLs are provided in the brief, create an "Our Work & Projects" image gallery section displaying those exact image URLs. If no uploaded photos are provided, use high-resolution Unsplash images relevant to the occupation.

9. FAQ (FREQUENTLY ASKED QUESTIONS) SECTION — CRITICAL
- Include a dedicated FAQ section answering common customer questions for this business type (e.g., "Do you offer emergency or same-day service?", "Are you fully licensed and insured?", "How does pricing and estimating work?", "What areas do you cover?").
- Structure questions using clean toggle cards or details/summary tags so customers can find answers quickly.

10. LEAD CAPTURE / QUOTE REQUEST FORM SECTION
- Include a high-converting contact/quote form section with styled HTML input fields: Full Name, Phone Number, Email Address, Service Needed (dropdown or text), and Message/Project Details.
- Include a prominent submit button styled with the primary accent color.
- Show best phone number (<a href="tel:...">) and email (<a href="mailto:...">) alongside the form.

11. FLOATING MOBILE ACTION BAR (FOR MOBILE VIEWPORTS)
- For mobile devices (under 768px), include a fixed bottom contact bar with quick action buttons (e.g., "Call Now" and "Get a Quote" or "WhatsApp") so visitors on smartphones can contact the business immediately from any scroll position.

COPYWRITING & GRAMMAR RULES — CRITICAL
- Ensure flawless grammar, correct spelling, and persuasive, professional sentences throughout the entire site.
- Use fluid, native-sounding English copywriting that builds trust and avoids repetitive or robotic phrasing.
- Ensure perfect punctuation, capitalization, and formatting for all headings, paragraphs, and lists.

DESIGN AND STYLE RULES — CRITICAL AESTHETICS
- The website MUST be visually stunning and WOW the user at first glance.
- Implement rich, modern aesthetics: cohesive color palettes, smooth gradients, subtle box-shadows, and elegant spacing.
- Use high-quality modern typography (e.g., import Google Fonts like Inter, Outfit, or Plus Jakarta Sans) with excellent contrast and clear hierarchy.
- Include CSS micro-animations (e.g., smooth button hover effects, subtle card lifts, or fade-in transitions) to make the site feel dynamic and alive.
- Avoid generic, flat, blocky, or outdated "template" looks. The design must feel strictly premium and state-of-the-art.
- Use selected_website_look and preferred_colours as the main design direction.
- IMAGE SIZING: Do NOT distort or aggressively crop uploaded or placeholder images. Use CSS 'object-fit: contain' or carefully proportioned 'cover' so that important parts of the image (especially logos and project photos) are fully visible and not cut off.

SUPPORTED WEBSITE LOOK DIRECTIONS
1. Professional Blue - trustworthy, professional, established (trades, consultants, repair)
2. Local Green - reliable, practical, eco-friendly, local (landscapers, cleaners, handymen)
3. Warm Premium - grounded, traditional, premium, personal (boutique trades, family-run)
4. Dark Regal - high-end, serious, premium (luxury services, specialists)
5. Clean Minimal - modern, understated, clean (almost any service business)
6. Bold Strong - strong, confident, urgent (emergency trades, roofers, plumbing)

SEO AND CONTENT RULES
- Use seo_keywords and seo_locations naturally in headings, intro copy, and service area content
- Do not keyword stuff
- Make page copy locally relevant
- Use strong title, H1, H2, meta-description-ready copy patterns
- Keep local intent visible in the hero, services, and service area sections

MAP REQUIREMENTS — MANDATORY
- You MUST include the live interactive Google Map iframe using: https://maps.google.com/maps?q=ENCODED_LOCATION&t=&z=13&ie=UTF8&iwloc=&output=embed
- NEVER output empty placeholders, TODO comments, or broken map tags.

FUNCTIONAL REQUIREMENTS
- Responsive design (mobile-first)
- HEADER & NAVBAR ALIGNMENT RULE: The website header (<header> or <nav>) MUST be responsive and flexbox-aligned. On desktop and tablet viewports, the logo/brand name, the navigation anchor links, and the call-to-action button MUST ALL BE IN THE SAME HORIZONTAL ROW (display: flex; justify-content: space-between; align-items: center; flex-wrap: nowrap; gap: 1.5rem;). On mobile viewports (< 768px), use a clean hamburger toggle or vertical collapse.
- INTERACTIVITY & NAVIGATION RULE: To ensure smooth scrolling and interactivity when clicking navbar links:
  1. Every major section MUST have an ID: <section id="services">, <section id="about">, <section id="pricing">, <section id="why-us">, <section id="location">, <section id="gallery">, <section id="faq">, <section id="contact">.
  2. Navbar links MUST be valid anchor links pointing to those IDs: <a href="#services">Services</a>, <a href="#about">About</a>, <a href="#pricing">Pricing</a>, <a href="#faq">FAQ</a>, <a href="#contact">Contact</a>.
  3. Include CSS in <style>: html { scroll-behavior: smooth !important; }
- Click-to-call phone links on mobile: <a href="tel:PHONENUMBER">
- Email links: <a href="mailto:EMAIL">
- Styled HTML contact/quote form
- WhatsApp or booking CTA if requested
- Structured sections easy to edit later
- Clean, self-contained HTML

OUTPUT FORMAT — CRITICAL
Return ONLY raw HTML. No markdown. No code fences. No explanation text before or after.
The output must be a complete, self-contained HTML document starting with <!DOCTYPE html> and ending with </html>.
You MUST include <meta name="viewport" content="width=device-width, initial-scale=1.0"> in the <head> tag so responsive media queries work properly inside iframes and mobile viewports.
Embed all CSS inside a <style> tag in the <head>. Do not reference external CSS files.
You may use Google Fonts via a <link> tag.
All JavaScript must be embedded in <script> tags at the bottom of the body.
Do not use any external JS libraries unless they are loaded via CDN <script> tags.
The page must work standalone when the HTML is opened in a browser or rendered in an iframe.`;

export async function generateWebsiteWithGemini(naturalLanguageBrief: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Here is the form data for the business website you need to build:\n\n${naturalLanguageBrief}\n\nNow generate the complete HTML website. Return ONLY the raw HTML starting with <!DOCTYPE html>.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 65536,
      responseMimeType: 'text/plain',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  // Extract the generated text from Gemini's response structure
  const rawText: string =
    result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!rawText) {
    throw new Error('Gemini returned an empty response');
  }

  // Strip any accidental markdown code fences if Gemini wraps the HTML
  const cleaned = rawText
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  return cleaned;
}
