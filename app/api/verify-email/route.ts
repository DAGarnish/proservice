// app/api/verify-email/route.ts
// SECURE endpoint to verify user email address in the User table
import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrismaRetry } from '@/lib/prisma';
import { sendWelcomePreviewEmail } from '@/lib/email';

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
    if (!targetPreviewId) {
      const sub: any = await withPrismaRetry(() =>
        (prisma as any).websiteSubmission.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        })
      );
      if (sub) targetPreviewId = sub.id;
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
