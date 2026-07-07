// app/api/admin/config/route.ts
// Admin config API — returns current (non-sensitive) configuration.

import { NextRequest, NextResponse } from 'next/server';

function isAuthorized(req: NextRequest): boolean {
  const adminSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET;
  if (!adminSecret) return true;
  const authHeader = req.headers.get('x-admin-secret') || req.headers.get('x-admin-password');
  return authHeader === adminSecret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    config: {
      generationProvider: process.env.GENERATION_API_KEY ? 'Connected' : 'Mock (no key set)',
      providerUrl: process.env.GENERATION_PROVIDER_URL || 'Not set',
      rateLimitPerEmail: process.env.RATE_LIMIT_PER_EMAIL || '1',
      rateLimitPerIP: process.env.RATE_LIMIT_PER_IP || '3',
      rateLimitWindowHours: process.env.RATE_LIMIT_WINDOW_HOURS || '24',
      adminSecretSet: !!process.env.ADMIN_SECRET,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
