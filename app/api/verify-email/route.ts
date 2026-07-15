// app/api/verify-email/route.ts
// SECURE endpoint to verify user email address in the User table
export const maxDuration = 60; // Allow up to 60s for Vercel Hobby

import { NextRequest, NextResponse, after } from 'next/server';
import { prisma, withPrismaRetry } from '@/lib/prisma';
import { sendWelcomePreviewEmail } from '@/lib/email';
import { buildWebsiteBrief } from '@/lib/promptBuilder';
import { generateWebsiteWithGemini } from '@/lib/geminiGenerator';
import { enhanceGeneratedHtml } from '@/lib/htmlSafeguard';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const previewId = searchParams.get('previewId') || '';

  if (!token) {
    return NextResponse.json({ success: false, error: 'Verification token is required' }, { status: 400 });
  }

  try {
    const user: any = await withPrismaRetry(() =>
      (prisma as any).user.findFirst({
        where: { verificationToken: token },
      })
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired verification token' }, { status: 404 });
    }

    const updatedUser: any = await withPrismaRetry(() =>
      (prisma as any).user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          verificationToken: null, // clear token once verified
        },
      })
    );

    let targetPreviewId = previewId;
    let sub: any = null;

    if (!targetPreviewId) {
      sub = await withPrismaRetry(() =>
        (prisma as any).websiteSubmission.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        })
      );
      if (sub) targetPreviewId = sub.previewId;
    } else {
      sub = await withPrismaRetry(() =>
        (prisma as any).websiteSubmission.findFirst({
          where: { previewId: targetPreviewId },
        })
      );
    }

    // RUN GENERATION AND EMAIL SENDING IN THE BACKGROUND
    after(async () => {
      // GENERATE WEBSITE UPON VERIFICATION
      if (sub && (!sub.generatedHtml || sub.generatedHtml.trim() === '')) {
         try {
           let finalLogoUrl = sub.logo_data_url;

           // Generate Logo if a prompt was provided and no existing logo was uploaded
           if (sub.logo_prompt && !finalLogoUrl) {
              try {
                 const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
                 const apiKey = process.env.GEMINI_API_KEY;
                 if (apiKey) {
                   const logoResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({
                       system_instruction: { parts: [{ text: "You are an expert, award-winning logo designer. Your ONLY job is to output a beautifully aesthetic, modern, and highly premium raw SVG code. Do not output anything other than the exact SVG code starting with <svg> and ending with </svg>." }] },
                       contents: [{ role: 'user', parts: [{ text: `Generate a stunning, modern vector logo for Business: "${sub.business_name || 'My Business'}", Industry: "${sub.occupation || 'Services'}". Prompt: "${sub.logo_prompt}". Ensure it has a transparent background, cohesive brand colors, perfectly scaled proportions (use viewBox), and crisp, professional vector shapes.` }] }],
                       generationConfig: { temperature: 0.8, maxOutputTokens: 8192, responseMimeType: 'text/plain' },
                     }),
                   });
                   if (logoResponse.ok) {
                     const result = await logoResponse.json();
                     const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                     const svgMatch = rawText.match(/(<svg[^>]*>[\s\S]*<\/svg>)/i);
                     if (svgMatch) {
                       const cleanedSvg = svgMatch[1].trim();
                       const base64Svg = Buffer.from(cleanedSvg).toString('base64');
                       finalLogoUrl = `data:image/svg+xml;base64,${base64Svg}`;
                     }
                   }
                 }
              } catch (err) {
                 console.error('[PROSERVICE] Background logo generation failed:', err);
              }
           }

           const { naturalLanguage } = buildWebsiteBrief(sub);
           let generatedHtml = await generateWebsiteWithGemini(naturalLanguage);
           
           if (generatedHtml) {
             generatedHtml = enhanceGeneratedHtml(
               generatedHtml,
               finalLogoUrl,
               sub.business_name,
               Array.isArray(sub.uploaded_photos_urls) ? sub.uploaded_photos_urls : [],
               sub.business_address || sub.main_city || sub.service_area || 'USA'
             );

             await withPrismaRetry(() =>
               (prisma as any).websiteSubmission.update({
                 where: { id: sub.id },
                 data: { generatedHtml },
               })
             );
           }
         } catch (genErr) {
           console.error('[PROSERVICE] AI generation failed during verification:', genErr);
         }
      }

      try {
        await sendWelcomePreviewEmail(
          updatedUser.email,
          updatedUser.name,
          updatedUser.businessName || updatedUser.name || 'Your Business',
          targetPreviewId
        );
      } catch (emailErr) {
        console.error('[PROSERVICE] Failed to send welcome preview email:', emailErr);
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isEmailVerified: updatedUser.isEmailVerified,
      },
    });
  } catch (err: any) {
    console.error('[PROSERVICE] Email verification error:', err);
    return NextResponse.json({ success: false, error: 'Database verification check failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();

    if (!token && !email) {
      return NextResponse.json({ success: false, error: 'Token or email is required' }, { status: 400 });
    }

    const user: any = await withPrismaRetry(() =>
      (prisma as any).user.findFirst({
        where: token ? { verificationToken: token } : { email: email.toLowerCase().trim() },
      })
    );

    if (!user) {
      return NextResponse.json({ success: false, error: 'User account not found or token invalid' }, { status: 404 });
    }

    // If verifying via token
    if (token) {
      const updatedUser: any = await withPrismaRetry(() =>
        (prisma as any).user.update({
          where: { id: user.id },
          data: {
            isEmailVerified: true,
            verificationToken: null,
          },
        })
      );

      let targetPreviewId = '';
      const sub: any = await withPrismaRetry(() =>
        (prisma as any).websiteSubmission.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        })
      );
      if (sub) targetPreviewId = sub.id;

      try {
        await sendWelcomePreviewEmail(
          updatedUser.email,
          updatedUser.name,
          updatedUser.businessName || updatedUser.name || 'Your Business',
          targetPreviewId
        );
      } catch (emailErr) {
        console.error('[PROSERVICE] Failed to send welcome preview email via POST:', emailErr);
      }

      return NextResponse.json({
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          isEmailVerified: updatedUser.isEmailVerified,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err: any) {
    console.error('[PROSERVICE] Verification check error:', err);
    return NextResponse.json({ success: false, error: 'Failed to verify account status' }, { status: 500 });
  }
}
