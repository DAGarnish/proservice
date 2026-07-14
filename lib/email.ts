import nodemailer from 'nodemailer';
import { FormData } from '@/types/form';

// Create Nodemailer transporter using environment variables
export async function sendSubmissionEmail(data: FormData, previewId?: string): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const receiverEmail = process.env.RECEIVER_EMAIL || gmailUser;

  if (!gmailUser || !gmailPass || !receiverEmail) {
    console.warn('[PROSERVICE] Email credentials not fully configured in .env. Skipping email notification.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const previewUrl = previewId ? `${appUrl}/preview/${previewId}` : appUrl;

  const subject = `🚀 New Website Preview & Intake: ${data.business_name || 'New Client'}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Website Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #111827; padding: 32px 40px; text-align: center; border-bottom: 4px solid #1a56db;">
              <div style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                WEB<span style="color: #1a56db;">PRO50</span>
              </div>
              <div style="color: #9ca3af; font-size: 14px; font-weight: 500; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px;">
                New Intake & Preview Generated
              </div>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 40px 40px 24px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #111827;">
                Hello Admin, 🎉
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                A new small business website intake form has just been submitted by <strong style="color: #1a56db;">${data.contact_name || 'a potential client'}</strong> for <strong style="color: #111827;">${data.business_name || 'their business'}</strong>.
              </p>
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 32px 0;">
                <tr>
                  <td align="center" style="background-color: #1a56db; border-radius: 8px; box-shadow: 0 4px 6px rgba(26, 86, 219, 0.25);">
                    <a href="${previewUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      View Live Website Preview &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
            </td>
          </tr>

          <!-- Submission Details Section -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Submission Summary
              </h2>

              <!-- Section 1: Business Basics -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #e8f0fe; padding: 12px 16px; font-weight: 700; font-size: 14px; color: #1340af; border-bottom: 1px solid #bfdbfe;">
                    1. Business Basics
                  </td>
                </tr>
                <tr>
                  <td width="40%" style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Business Name:</td>
                  <td width="60%" style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.business_name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Contact Name:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.contact_name || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Phone Number:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">
                    <a href="tel:${data.phone_number}" style="color: #1a56db; text-decoration: none;">${data.phone_number || 'N/A'}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Email Address:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">
                    <a href="mailto:${data.email_address}" style="color: #1a56db; text-decoration: none;">${data.email_address || 'N/A'}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Occupation / Type:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.occupation || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Address / Area:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.business_address || 'Mobile Service'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280;">Years in Business:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827;">${data.years_in_business || 'Not specified'}</td>
                </tr>
              </table>

              <!-- Section 2: Services & Strategy -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #e8f0fe; padding: 12px 16px; font-weight: 700; font-size: 14px; color: #1340af; border-bottom: 1px solid #bfdbfe;">
                    2. Services & Strategy
                  </td>
                </tr>
                <tr>
                  <td width="40%" style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Main Services:</td>
                  <td width="60%" style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.main_services || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Top Services to Promote:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.top_services_to_promote || 'All services'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Specialities:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.specialities || 'None listed'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Emergency Service:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: ${data.emergency_service ? '#dc2626' : '#111827'}; border-bottom: 1px solid #f1f5f9;">
                    ${data.emergency_service ? '⚡ Yes (24/7 / Same-Day)' : 'No'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280;">Primary CTA:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #1a56db; text-transform: capitalize;">${data.main_cta || 'Call'}</td>
                </tr>
              </table>

              <!-- Section 3: Trust & Credibility -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #e8f0fe; padding: 12px 16px; font-weight: 700; font-size: 14px; color: #1340af; border-bottom: 1px solid #bfdbfe;">
                    3. Trust & Credibility
                  </td>
                </tr>
                <tr>
                  <td width="40%" style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Differentiator:</td>
                  <td width="60%" style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.differentiator || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Qualifications / Licenses:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.qualifications || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Fully Insured:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: ${data.insurance ? '#16a34a' : '#6b7280'}; border-bottom: 1px solid #f1f5f9;">
                    ${data.insurance ? '✅ Yes — Insured & Protected' : 'No / Not specified'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Testimonials:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.testimonials ? `"${data.testimonials}"` : 'None provided'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280;">Guarantees:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827;">${data.guarantees || 'None specified'}</td>
                </tr>
              </table>

              <!-- Section 4: Brand & Style -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #e8f0fe; padding: 12px 16px; font-weight: 700; font-size: 14px; color: #1340af; border-bottom: 1px solid #bfdbfe;">
                    4. Brand & Style
                  </td>
                </tr>
                <tr>
                  <td width="40%" style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Selected Look:</td>
                  <td width="60%" style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #1a56db; border-bottom: 1px solid #f1f5f9; text-transform: capitalize;">
                    ${data.selected_website_look?.replace('-', ' ') || 'Professional Blue'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Custom Colors:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.preferred_colours || 'Use theme default'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280;">Has Logo:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827;">${data.logo_uploaded ? 'Yes (to be uploaded)' : 'No'}</td>
                </tr>
              </table>

              <!-- Section 5: SEO & Location -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #e8f0fe; padding: 12px 16px; font-weight: 700; font-size: 14px; color: #1340af; border-bottom: 1px solid #bfdbfe;">
                    5. SEO & Location
                  </td>
                </tr>
                <tr>
                  <td width="40%" style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Main City / Town:</td>
                  <td width="60%" style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.main_city || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Full Service Area:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">${data.full_service_area || 'Local city'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280;">Target Keywords:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827;">${data.seo_keywords || 'Standard industry keywords'}</td>
                </tr>
              </table>

              <!-- Section 6: Features & Add-ons -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #e8f0fe; padding: 12px 16px; font-weight: 700; font-size: 14px; color: #1340af; border-bottom: 1px solid #bfdbfe;">
                    6. Features & Add-ons
                  </td>
                </tr>
                <tr>
                  <td width="40%" style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Contact Form & Maps:</td>
                  <td width="60%" style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827; border-bottom: 1px solid #f1f5f9;">
                    ${data.contact_form ? 'Contact Form ✅' : ''} ${data.google_maps ? '| Google Maps ✅' : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Google Listing Setup:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: ${data.google_listing_option ? '#f97316' : '#6b7280'}; border-bottom: 1px solid #f1f5f9;">
                    ${data.google_listing_option ? '🌟 Yes — $50 One-Time Add-on Requested' : 'No'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280; border-bottom: 1px solid #f1f5f9;">Extended Refinement & Pages:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: ${data.branded_domain_option ? '#f97316' : '#6b7280'}; border-bottom: 1px solid #f1f5f9;">
                    ${data.branded_domain_option ? '🌟 Yes — $50 One-Time Add-on Requested' : 'No'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 14px; color: #6b7280;">Additional Notes:</td>
                  <td style="padding: 10px 16px; font-size: 14px; font-weight: 600; color: #111827;">${data.additional_notes || 'None'}</td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 24px 40px; text-align: center; color: #9ca3af; font-size: 13px; line-height: 1.6;">
              <div style="color: #ffffff; font-weight: 700; font-size: 15px; margin-bottom: 6px;">
                WEBPRO50 Automated Notifications
              </div>
              <div>
                This alert was automatically generated when <strong style="color: #e8f0fe;">${data.contact_name || 'a client'}</strong> submitted their website intake form on your platform.
              </div>
              <div style="margin-top: 12px; font-size: 11px; color: #6b7280;">
                &copy; ${new Date().getFullYear()} WEBPRO50. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"WEBPRO50 Notifications" <${gmailUser}>`,
    to: receiverEmail,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  console.log(`[PROSERVICE] Notification email successfully sent to ${receiverEmail}`);
}

// Send verification & preview email to the USER upon form submission
export async function sendUserVerificationEmail(
  data: FormData,
  previewId: string,
  verificationToken: string
): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const userEmail = data.email_address;

  if (!gmailUser || !gmailPass || !userEmail) {
    console.warn('[PROSERVICE] Email credentials not configured or no user email provided. Skipping verification email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const previewUrl = `${appUrl}/preview/${previewId}`;
  const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}&previewId=${previewId}`;

  const subject = `✨ Verify Your Email & Access Your Website Preview — ${data.business_name}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - WEBPRO50</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #111827; padding: 36px 40px; text-align: center; border-bottom: 4px solid #1a56db;">
              <div style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                WEB<span style="color: #1a56db;">PRO50</span>
              </div>
              <div style="color: #bfdbfe; font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 1.5px;">
                Account Verification &amp; Website Ready
              </div>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 40px 40px 28px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #111827;">
                Welcome, ${data.contact_name || 'Valued Client'}! 🎉
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                We have generated your custom AI website for <strong style="color: #1a56db;">${data.business_name}</strong>! Before you can connect custom domains or launch live to the public, please verify your email address below.
              </p>
              
              <!-- Primary Verify CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 32px 0 20px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; font-weight: 700; color: #ffffff; background-color: #1a56db; text-decoration: none; border-radius: 10px; box-shadow: 0 6px 12px rgba(26, 86, 219, 0.3);">
                      ✅ Verify My Email Address &rarr;
                    </a>
                  </td>
                </tr>
              </table>


              <div style="background-color: #f8fafc; border-left: 4px solid #1a56db; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">
                  <strong>Why verify?</strong> Verifying your email confirms ownership of your account and enables secure management functions like custom domain binding, SEO optimization, and live publishing.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 24px 40px; text-align: center; color: #9ca3af; font-size: 13px; line-height: 1.6;">
              <div style="color: #ffffff; font-weight: 700; font-size: 15px; margin-bottom: 6px;">
                WEBPRO50 AI Studio
              </div>
              <div>
                You received this verification email because you submitted an intake form for <strong>${data.business_name}</strong>.
              </div>
              <div style="margin-top: 12px; font-size: 11px; color: #6b7280;">
                &copy; ${new Date().getFullYear()} WEBPRO50. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"WEBPRO50 Account Verification" <${gmailUser}>`,
    to: userEmail,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  console.log(`[PROSERVICE] User verification email successfully sent to ${userEmail}`);
}

export async function sendWelcomePreviewEmail(
  userEmail: string,
  userName: string,
  businessName: string,
  previewId?: string
): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass || !userEmail) {
    console.warn('[PROSERVICE] Email credentials not configured. Skipping welcome preview email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const previewUrl = previewId ? `${appUrl}/preview/${previewId}` : appUrl;

  const subject = `🎉 Email Verified! View Your AI Website Preview — ${businessName}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Verified - WEBPRO50</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #111827; padding: 36px 40px; text-align: center; border-bottom: 4px solid #10b981;">
              <div style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                WEB<span style="color: #10b981;">PRO50</span>
              </div>
              <div style="color: #d1fae5; font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 1.5px;">
                Email Verified &amp; Website Ready
              </div>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 40px 40px 28px 40px;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #111827;">
                Congratulations, ${userName || 'Valued Partner'}! 🎉
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                Your email address <strong style="color: #10b981;">${userEmail}</strong> has been successfully verified! Your custom AI website for <strong style="color: #1a56db;">${businessName}</strong> is ready for your review and customization right now.
              </p>
              
              <!-- Primary Preview CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 32px 0 28px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${previewUrl}" target="_blank" style="display: inline-block; padding: 18px 40px; font-size: 17px; font-weight: 700; color: #ffffff; background-color: #1a56db; text-decoration: none; border-radius: 12px; box-shadow: 0 8px 16px rgba(26, 86, 219, 0.35);">
                      👀 View Your Website Preview Directly &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1e293b;">Unlocked Capabilities:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                  <li><strong>Live Site Review:</strong> Inspect every page, service card, and interactive element.</li>
                  <li><strong>AI Customization:</strong> Adjust colors, fonts, or update text seamlessly.</li>
                  <li><strong>Custom Domain &amp; Publishing:</strong> Connect your domain name and publish to the world.</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 24px 40px; text-align: center; color: #9ca3af; font-size: 13px; line-height: 1.6;">
              <div style="color: #ffffff; font-weight: 700; font-size: 15px; margin-bottom: 6px;">
                WEBPRO50 AI Studio
              </div>
              <div>
                You received this email because you verified your account for <strong>${businessName}</strong>.
              </div>
              <div style="margin-top: 12px; font-size: 11px; color: #6b7280;">
                &copy; ${new Date().getFullYear()} WEBPRO50. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"WEBPRO50 AI Studio" <${gmailUser}>`,
    to: userEmail,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('[PROSERVICE] Welcome preview email sent successfully to:', userEmail);
  } catch (error) {
    console.error('[PROSERVICE] Error sending welcome preview email:', error);
    // Don't throw to prevent interrupting the verification response
  }
}

