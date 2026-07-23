// lib/geminiGenerator.ts
// Calls Google Gemini to generate a complete small-business website
// from the structured website brief built by promptBuilder.ts.
// API key is read server-side only from process.env.GEMINI_API_KEY.

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are building a complete, production-ready small-business website from structured form data submitted by a local service business or sole trader in the USA. The output should look and function like a real business site a client could publish with only minor edits.

<context>
The form data provided in the user message is the single source of truth for content, tone, branding, service areas, trust signals, and calls to action. Use it directly rather than generic filler wherever a specific value is present. When a field is missing, infer a reasonable, realistic default based on the business type — never invent licences, certifications, awards, or named testimonials that were not supplied.
</context>

<form_data>
The business's submitted data is provided as a structured brief in the user message. It covers fields such as: mail_to_show, contact_form, google_maps, quote_request_form, booking_or_whatsapp, google_listing_option, branded_domain_option, additional_notes, plus business_name, occupation, location, main_services, top_services_to_promote, price_list, differentiator, qualifications, insurance_status, memberships, guarantees, testimonials, service_area, seo_keywords, seo_locations, style_preference, selected_website_look, preferred_colours, main_cta, business_address, and any logo/photo URLs submitted with the form.
</form_data>

<pre_build_plan>
Before writing any code, reason through the following internally as silent planning. Do NOT print this plan or any summary of it — your final response must contain only the HTML document, nothing else:
1. Which form fields have real data versus which are missing, and your inference for each missing field.
2. The page structure (sections, in order) based on which optional fields are true/present.
3. How seo_keywords and seo_locations will be woven into the hero, services, and service-area copy without keyword stuffing.
</pre_build_plan>

<site_sections>
Build these sections, adapting presence and depth to the form data:

1. Hero — business name, a headline built from occupation + location + top service, trust-focused supporting copy, a primary CTA matching main_cta, an optional secondary CTA, and visible trust indicators (years in business, insured, licensed, emergency service) only where supported by the data.

2. About — a short, specific company description covering service area, experience, and what makes this business different. Match tone to style_preference and selected_website_look.

3. Services — present main_services clearly, give top_services_to_promote visual priority, show price_list in a clean readable format if provided, and write short benefit-driven copy for each service rather than bare labels.

4. Why Choose Us — surface differentiator, qualifications/licences/certifications, insurance status, memberships, specialist equipment, guarantees, and notable past work, using only what's in the form data.

5. Service Area — display the main city plus the full service area list, add a map component, and write a short local-trust line (e.g., "Proudly serving homeowners and businesses across [service areas]"). If business_address and google_maps are both present, include a working embed structure using this free iframe format (no paid API key required): <iframe src="https://maps.google.com/maps?q=ENCODED_LOCATION&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="380" frameborder="0" style="border:0; border-radius: 12px;" allowfullscreen="" loading="lazy"></iframe> — replace ENCODED_LOCATION with the URL-encoded business address or main city (e.g. "New+York,+NY"). Otherwise build a clearly labeled map placeholder with a comment showing exactly where a live embed URL goes. Fold seo_locations naturally into this section's headings and body text.

6. Testimonials — display real testimonials if supplied. If none are supplied, either omit the section or include a clearly commented placeholder for later replacement — do not generate fabricated named reviews.

7. Contact/CTA — show mail_to_show and best phone number, repeat the main_cta, include a quote/contact form if contact_form is true, include WhatsApp/booking actions if booking_or_whatsapp is true, and repeat map/location details near this section if google_maps is true.
</site_sections>

<design_system>
Use selected_website_look and preferred_colours as the primary design direction, applied consistently across layout, color palette, button style, and copy tone:

- Professional Blue — trustworthy, established; accountants, consultants, trades, repair
- Local Green — reliable, practical, eco-conscious; landscaping, cleaning, handyman services
- Warm Premium — grounded, traditional, personal; boutique and family-run trades
- Dark Regal — high-end, serious; luxury services and specialists
- Clean Minimal — modern, understated; works broadly
- Bold Strong — confident, urgent; emergency trades, roofing, plumbing

Integrate any uploaded logo, team photos, van/branding photos, or finished-work images meaningfully into the hero, gallery, or trust sections. Aim for a distinctive, premium-feeling result — commit to a real color scheme and typographic choice rather than a generic SaaS-template look, and keep the layout clear, readable, and conversion-focused above all else.
</design_system>

<seo_and_content>
Weave seo_keywords and seo_locations naturally into headings, intro copy, and the service-area section — never stuff keywords. Structure the page so that individual service pages or city/location pages could be added later without restructuring the homepage. Write commercially useful, specific copy; avoid vague filler phrases like "committed to excellence" unless backed by a concrete detail from the form data.
</seo_and_content>

<technical_requirements>
- Fully responsive, accessible layout
- Click-to-call phone links and mailto links
- Contact form when contact_form is true; WhatsApp/booking CTA when booking_or_whatsapp is true
- Modular, cleanly organized components that are easy to extend later
- Code comments marking where future service pages, city pages, and live map embeds should be added
</technical_requirements>

<scope_control>
Build exactly what is specified above — the homepage, service-area/map section, contact section, and trust sections. Do not add extra pages, features, or abstractions beyond what's requested. Where data is missing, use minimal, tasteful placeholders rather than inventing specific claims (licences, awards, testimonials).
</scope_control>

<output>
Produce ONLY the complete implementation as a single, self-contained HTML document. Do not include the pre-build summary, analysis, markdown, code fences, or any explanation text before or after — the entire response must be the final HTML, nothing else.
The output must start with <!DOCTYPE html> and end with </html>.
You MUST include <meta name="viewport" content="width=device-width, initial-scale=1.0"> in the <head> so responsive layout works correctly inside iframes and mobile viewports.
Embed all CSS inside a <style> tag in the <head>. Do not reference external CSS files. You may use Google Fonts via a <link> tag.
Embed all JavaScript in <script> tags at the bottom of the body. Do not use any external JS libraries unless loaded via CDN <script> tags.
The page must work standalone when opened directly in a browser or rendered in an iframe.
</output>`;

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
            text: `Here is the form data for the business website you need to build:\n\n${naturalLanguageBrief}\n\n=== CRITICAL REMINDERS BEFORE YOU GENERATE ===\n\n1. CONCISE & HIGH-CONVERTING COPY (NO REPETITION): Do not write long, repetitive walls of text or bloated paragraphs. Small box bullet copy ('<ul>' inside styled cards) is far superior to long paragraphs of text. Make every section crisp, scannable, and distinct.\n\n2. SERVICES SECTION — PUNCHY INTRO & CARDS: Write a brief, powerful 2-3 sentence introduction selling their workmanship and customer care, followed immediately by clean, structured service cards with bulleted benefits.\n\n3. WHY CHOOSE US & ABOUT — CLEAN HIGHLIGHTS: Present trust signals, qualifications, insurance, and company roots using punchy highlight cards or icons rather than long essays.\n\n4. PHOTO FRAMING & GRID BALANCING (CRITICAL):\n- IDENTICAL BOX SIZES & 100% OCCUPANCY: Frame all photos so they occupy 100% of the space inside identical-sized boxes ('aspect-ratio: 4/3; width: 100%; border-radius: 12px; overflow: hidden; position: relative; display: block;'). The image inside ('<img>') MUST occupy 100% of the box using 'width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block;'. Do not leave large white gaps or empty space!\n- CENTER FOCUS CROPPING: 'object-fit: cover' with 'object-position: center center' crops naturally around the focus point so the subject stays right in the middle with background evenly distributed around the sides.\n- BALANCED GRID COUNTS (NO EMPTY HOLES): Do not leave large empty grid spaces on the page. If your gallery grid holds 3 items per row, display an exact number of photos that fills full rows cleanly (for example, exactly 3 or 6 photos—if 5 photos are available for a 3-column grid, use 3 photos so no hole is left).\n\n5. VISUAL DESIGN & TYPO CHECK: Make the website visually STUNNING with modern gradients, glassmorphism cards, Google Fonts, and smooth hover animations. Carefully verify every word to fix all typos and ensure flawless English.\n\nNow generate the complete HTML website. Return ONLY the raw HTML starting with <!DOCTYPE html>.`,
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
