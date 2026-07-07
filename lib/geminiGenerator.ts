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
Build a multi-section website with the following sections where relevant:

1. TOP HEADER / NAVIGATION BAR
- Clean, professional header with Business Logo / Name on the left and Navigation Links (Services, About, Service Area, Contact) + Primary Call-to-Action button on the right.
- CRITICAL RESPONSIVENESS RULE FOR HEADER: The header MUST be fully responsive inside any viewport or iframe. Use CSS flexbox with 'flex-wrap: wrap' and media queries ('@media (max-width: 768px)') so that on mobile/tablet viewports (under 768px), the navigation links either wrap cleanly, adjust spacing/font-size, or stack neatly without overflowing horizontally or clipping text. Never use fixed widths that break on 390px or 768px iframe screens.

2. HERO SECTION
- Business name prominently displayed
- Strong headline based on occupation, location, and top service
- Supporting copy focused on trust and outcome
- Primary CTA button based on main_cta
- Secondary CTA where useful
- Show trust indicators such as years in business, insured, qualified, emergency service, etc.

2. ABOUT SECTION
- Short, human, specific company intro
- Mention service area, experience, and differentiators
- Keep tone aligned to selected style_preference and selected_website_look

3. SERVICES SECTION
- Clearly present main_services
- Give extra prominence to top_services_to_promote
- If price_list exists, show pricing in a clean readable format
- Use cards or sections that are easy to scan
- Add short benefit-oriented copy, not just labels

4. WHY CHOOSE US / TRUST SECTION
- Use differentiator
- Qualifications / licences / registrations / certifications
- Insurance status
- Memberships / trade bodies
- Specialist tools or equipment
- Guarantees or promises
- Notable work if available

5. SERVICE AREA SECTION
- Show the main town/city and full service area list
- Explain where the business operates in clear language
- Add a visual map component
- If business_address is available and google_maps is true, include an embedded Google Map or a placeholder/embed-ready map section linked to the business location
- If the business is a service-area business covering multiple towns, include a "Areas We Serve" map section and a textual list of target towns/cities
- If exact map embed code is not available, build a map-ready placeholder component with clear comments showing where the Google Maps embed iframe or map URL should go
- Make the service area section useful for both users and local SEO
- If seo_locations are provided, use them naturally in headings or body copy
- Include a short local-trust paragraph such as "Proudly serving homeowners and businesses across [service areas]"

6. TESTIMONIALS / SOCIAL PROOF
- If testimonials are available, display them in a strong testimonial section
- If none are available, create a placeholder section only if appropriate and label it clearly in code comments for later replacement
- Avoid inventing fake named reviews if real testimonials are not supplied

7. CONTACT / CTA SECTION
- Show best phone number and email to display
- Include strong CTA based on main_cta
- If contact_form is true, include a quote/contact form
- If booking_or_whatsapp is true, include those actions prominently
- If google_maps is true, repeat the map or location details near the contact section where appropriate

DESIGN AND STYLE RULES
- Use selected_website_look and preferred_colours as the main design direction
- If a website look is selected, reflect that style in layout, colours, accents, button style, and section tone
- Design must feel premium but practical
- Avoid generic AI-looking SaaS templates
- Prioritize trust, clarity, readability, and conversion

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

MAP REQUIREMENTS
- Include a service area map section on the page
- If a physical address is provided, include a business location map or map embed placeholder
- Structure the map block so it can accept a Google Maps embed iframe
- If a real embed is not available at build time, include a clearly labeled map placeholder card with comments
- The map section should be visually clean, responsive, and useful

FUNCTIONAL REQUIREMENTS
- Responsive design (mobile-first)
- Click-to-call phone links on mobile: <a href="tel:PHONENUMBER">
- Email links: <a href="mailto:EMAIL">
- Contact form if requested
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
