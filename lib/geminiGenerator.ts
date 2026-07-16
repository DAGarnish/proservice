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
- Supporting copy focused on trust and outcome (expand to be persuasive and descriptive)
- Primary CTA button based on main_cta
- Secondary CTA where useful
- Show trust indicators such as years in business, insured, qualified, emergency service, etc.
- If uploaded photo URLs are provided, use the FIRST photo URL prominently as the Hero Section background banner or primary featured image.

4. ABOUT SECTION (EXPAND TO ~200 DESCRIPTIVE WORDS)
- Take the client's form details, background, years in business, and differentiators and EXPAND this section into approximately 200 words of rich, professional, engaging, and descriptive copywriting.
- Explain the company's roots, commitment to quality, team expertise, and local dedication in polished paragraphs. Do not leave this as a brief stub!
- Keep tone aligned to selected style_preference and selected_website_look.

5. SERVICES & PRICING SECTION (EXPAND TO A 200 - 500 WORD SALES PARAGRAPH)
- Clearly present main_services and specialities, giving extra prominence to top_services_to_promote.
- SALES COPY PARAGRAPH (200 - 500 WORDS): From the information on the form regarding services (main_services, specialities, top_services_to_promote), you MUST expand and write a dedicated, highly persuasive sales overview paragraph of *200 to 500 words selling the customer's services* right at the top of the Services section! This paragraph should passionately sell why their services solve customer problems, what makes their workmanship and customer care superior, and what benefits the customer experiences.
- Follow this persuasive 200-500 word sales introduction with beautifully structured individual service cards or detailed breakdown tiers (~200 words across service items).
- If price_list exists, render clean, structured pricing tiers, package cards, or a transparent pricing table (do not just list plain text bullet points).
- Use modern card grids with subtle glassmorphism or hover elevation and clear icons.

6. WHY CHOOSE US / TRUST SECTION (EXPAND TO ~200 DESCRIPTIVE WORDS)
- Expand upon the client's differentiator, qualifications, insurance, memberships, specialist tools, guarantees, and notable work into approximately 200 words of authoritative, trust-building copy.
- Insurance status (show a prominent "Fully Insured" badge if true).
- ALIGNMENT: If using a bulleted or checkbox list under a centered heading, use CSS 'margin: 0 auto; width: fit-content;' on the list container so the list block is perfectly centered on the page while keeping the text inside it cleanly left-aligned.

7. SERVICE AREA & INTERACTIVE GOOGLE MAP SECTION — CRITICAL
- Show the main town/city and full service area list.
- Explain where the business operates in clear language (~150-200 words explaining regional coverage, emergency availability, and neighborhood commitment).
- CRITICAL MAP RULE: To display a live, interactive Google Map without needing a paid API key, you MUST use the following free embed iframe format:
  <iframe src="https://maps.google.com/maps?q=ENCODED_LOCATION&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="380" frameborder="0" style="border:0; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); width: 100%;" allowfullscreen="" loading="lazy"></iframe>
  Replace ENCODED_LOCATION with the URL-encoded business address, main city, or service area (for example: "New+York,+NY" or "Chicago,+IL" or "London,+UK").
- NEVER generate an empty placeholder div, mock comment, or "Map coming soon" text. You MUST ALWAYS generate a real, working iframe with the URL structure above!

8. TESTIMONIALS / SOCIAL PROOF & MULTIPLE PHOTO GALLERY SECTION
- If testimonials are available, display them in a strong testimonial card section with star ratings.
- MULTIPLE PHOTO GALLERY: If uploaded photo URLs are provided in the brief, create a dedicated, high-impact "Our Work & Portfolio Gallery" section displaying ALL of those exact image URLs in a modern responsive grid (using CSS 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;' with 'border-radius: 12px; overflow: hidden;'). To avoid any crop issue, ensure image cards use 'aspect-ratio: 4/3; width: 100%; position: relative;' with <img style="width: 100%; height: 100%; object-fit: cover; object-position: center;"> or 'object-fit: contain'.
- If no uploaded photos are provided, use high-resolution Unsplash images relevant to the occupation.

9. FAQ (FREQUENTLY ASKED QUESTIONS) SECTION — CRITICAL
- Include a dedicated FAQ section answering common customer questions for this business type (e.g., "Do you offer emergency or same-day service?", "Are you fully licensed and insured?", "How does pricing and estimating work?", "What areas do you cover?").
- Structure questions using clean toggle cards or details/summary tags so customers can find answers quickly.

10. LEAD CAPTURE / QUOTE REQUEST FORM SECTION
- Include a high-converting contact/quote form section with styled HTML input fields: Full Name, Phone Number, Email Address, Service Needed (dropdown or text), and Message/Project Details.
- Include a prominent submit button styled with the primary accent color.
- Show best phone number (<a href="tel:...">) and email (<a href="mailto:...">) alongside the form.

11. FLOATING MOBILE ACTION BAR (FOR MOBILE VIEWPORTS)
- For mobile devices (under 768px), include a fixed bottom contact bar with quick action buttons (e.g., "Call Now" and "Get a Quote" or "WhatsApp") so visitors on smartphones can contact the business immediately from any scroll position.

COPYWRITING & GRAMMAR RULES — CRITICAL CONTENT EXPANSION
- EXPAND CONTENT FROM BRIEF: The client will submit short form answers or bullet points. Your job as an expert copywriter is to expand each major section (About Us, Services & Pricing, Why Choose Us, Service Area) to around *200 descriptive words per section! For the Services section specifically, you MUST write a **200 - 500 word sales copy paragraph selling the customer's services*. Make the copywriting descriptive, persuasive, engaging, and thorough so the website looks complete and authoritative.
- Ensure flawless grammar, correct spelling, and native-sounding English throughout the entire site.
- Ensure perfect punctuation, capitalization, and formatting for all headings, paragraphs, and lists.

DESIGN AND STYLE RULES — CRITICAL AESTHETICS (STUNNING & BEAUTIFUL)
- The website MUST be visually stunning and WOW the user at first glance. Make the layout look strictly state-of-the-art and high-converting.
- Implement rich, modern aesthetics: vibrant, harmonious color palettes, subtle glassmorphism cards, modern linear gradients for section headers and accent buttons, deep box-shadows ('box-shadow: 0 10px 30px rgba(0,0,0,0.08)'), and elegant generous spacing ('padding: 5rem 1.5rem').
- Use high-quality modern typography (import Google Fonts like Inter, Plus Jakarta Sans, or Outfit via <link>) with excellent font weight contrast and clear visual hierarchy.
- Include CSS micro-animations (smooth button hover glow and transform lifts, subtle card elevation on hover, and smooth fade transitions) to make the site feel dynamic and alive.
- Avoid generic, flat, blocky, or outdated "template" looks. The design must feel state-of-the-art, custom-built, and premium.
- Use selected_website_look and preferred_colours as the main design direction.
- NO-CROP & IMAGE SIZING RULE: Do NOT distort or crop uploaded images awkwardly. Always use CSS 'object-fit: contain; object-position: center; max-height: 480px; width: auto; max-width: 100%;' (or carefully proportioned containers with 'aspect-ratio: 4/3; overflow: hidden;' and 'object-fit: cover; object-position: center;') so no part of the picture, text, or people's heads are cut off or sliced!

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
            text: `Here is the form data for the business website you need to build:\n\n${naturalLanguageBrief}\n\n=== CRITICAL REMINDERS BEFORE YOU GENERATE ===\n\n1. SERVICES SECTION — WRITE A 200 TO 500 WORD SALES PARAGRAPH: You MUST write a long, rich, persuasive sales overview paragraph (200-500 words) at the top of the Services section. This paragraph should passionately sell the customer's services, explain their processes, highlight their expertise, and convince visitors to hire them. Do NOT just list service names in cards — write a proper sales pitch FIRST, then follow with service cards.\n\n2. ABOUT US — WRITE ~200 WORDS: Expand the About section into a full ~200 word professional company story. Do not write just 1-2 sentences.\n\n3. WHY CHOOSE US — WRITE ~200 WORDS: Expand trust signals, qualifications, insurance, and guarantees into ~200 words of authoritative copy.\n\n4. SERVICE AREA — WRITE ~150-200 WORDS: Explain their local coverage, neighborhood commitment, and emergency availability in rich detail.\n\n5. VISUAL DESIGN: Make the website visually STUNNING with modern gradients, glassmorphism cards, Google Fonts (Inter or Plus Jakarta Sans), smooth hover animations, and premium spacing. Never generate a flat or basic-looking template.\n\n6. PHOTOS: Use ALL uploaded photo URLs across the Hero, Gallery, and service sections. Do NOT crop them — use object-fit: contain or cover with object-position: center.\n\nNow generate the complete HTML website. Return ONLY the raw HTML starting with <!DOCTYPE html>.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 65536,
      responseMimeType: 'text/plain',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    cache: 'no-store',
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
