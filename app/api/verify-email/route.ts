// app/api/verify-email/route.ts
// SECURE endpoint to verify user email address in the User table and delegate website generation + email dispatch to the Express backend
export const maxDuration = 60;

import { NextRequest, NextResponse, after } from 'next/server';
import { prisma, withPrismaRetry } from '@/lib/prisma';

/**
 * Triggers the persistent Express backend to generate the website cleanly in background queue without Vercel serverless timeouts.
 * If backend is temporarily offline, the 10-minute recovery cron job will automatically catch and queue the site later.
 */
async function triggerBackendGeneration(submissionId?: string, userId?: string, previewId?: string) {
  try {
    const backendUrl = (process.env.BACKEND_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    console.log(`[PROSERVICE] Delegating AI website generation & welcome email dispatch to backend: ${backendUrl}/api/v1/submissions/generate`);
    await fetch(`${backendUrl}/api/v1/submissions/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, userId, previewId }),
      signal: AbortSignal.timeout(5000), // 5s timeout so frontend never blocks
    });
  } catch (err: any) {
    console.warn(`[PROSERVICE] Could not immediately reach backend generation endpoint (${err?.message}). The 10-minute automated recovery cron job on proservice-be will automatically build and notify the client.`);
  }
}

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

    // Delegate generation & welcome email dispatch cleanly to the persistent Express backend!
    after(async () => {
      await triggerBackendGeneration(sub?.id, updatedUser?.id, targetPreviewId);
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

      // Delegate to backend queue
      after(async () => {
        await triggerBackendGeneration(sub?.id, updatedUser?.id, targetPreviewId);
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
