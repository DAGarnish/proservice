// app/api/generate-logo/route.ts
// SECURE server-side endpoint for generating logos using WEBPRO50 AI (Google Gemini AI).
// API keys ONLY exist in server-side env vars.

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, recordRequest } from '@/lib/rateLimiter';
import { logRequest } from '@/lib/requestLogger';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `You are WEBPRO50 AI, Google's advanced AI branding and graphic design engine.
Your task is to create a clean, modern, high-impact SVG vector logo for a business based on their details.

CRITICAL RULES FOR LOGO GENERATION:
1. Return ONLY raw valid SVG code starting with <svg> and ending with </svg>. No markdown code fences, no preamble, no explanations.
2. The SVG must use viewBox="0 0 400 400" with width="100%" height="100%" and xmlns="http://www.w3.org/2000/svg".
3. Include a distinct, memorable icon/mark representing the industry/occupation at the center or top.
4. Include the business name below or next to the icon using clean typography (<text> tags with modern sans-serif or serif styling).
5. Use professional, harmonious colors matching the requested style palette.
6. Ensure high visual contrast so it looks fantastic on both light and dark backgrounds.
7. Make the design polished, scalable, and ready for commercial branding.`;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  try {
    const body = await req.json();
    const { prompt, business_name, occupation, style, email_address } = body;

    if (!business_name || !occupation) {
      return NextResponse.json(
        { success: false, error: 'Business name and occupation are required' },
        { status: 400 }
      );
    }

    // Rate limit check
    const rateLimitResult = checkRateLimit(ip, email_address || 'logo-gen', business_name);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.reason },
        { status: 429 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured on server' },
        { status: 500 }
      );
    }

    const userPrompt = `Generate a modern logo for:
Business Name: "${business_name}"
Occupation / Industry: "${occupation}"
Style & Color Theme: "${style || 'Professional Blue'}"
Custom Prompt / Ideas: "${prompt || 'Clean modern emblem representing ' + occupation}"

Return ONLY the raw <svg>...</svg> code.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8192,
          responseMimeType: 'text/plain',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const rawText: string =
      result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!rawText) {
      throw new Error('WEBPRO50 AI returned empty content');
    }

    // Extract SVG from response using a regex match
    const svgMatch = rawText.match(/(<svg[^>]*>[\s\S]*<\/svg>)/i);
    if (!svgMatch) {
      console.error('[PROSERVICE] Invalid SVG Output. Raw text:', rawText);
      throw new Error('Generated output was not valid SVG');
    }
    const cleanedSvg = svgMatch[1].trim();

    recordRequest(ip, email_address || 'logo-gen', business_name);

    logRequest({
      ip,
      email: email_address || 'logo-gen',
      businessName: business_name,
      occupation: occupation,
      status: 'success',
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      svg: cleanedSvg,
    });
  } catch (err: any) {
    console.error('[PROSERVICE] Logo generation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate logo' },
      { status: 500 }
    );
  }
}
