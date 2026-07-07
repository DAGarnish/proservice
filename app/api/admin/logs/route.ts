// app/api/admin/logs/route.ts
// Admin-only log viewer API endpoint.
// TODO: Add authentication middleware before production deployment.

import { NextRequest, NextResponse } from 'next/server';
import { getLogs, getLogStats } from '@/lib/requestLogger';
import { getRateLimitStats } from '@/lib/rateLimiter';

function isAuthorized(req: NextRequest): boolean {
  // Placeholder auth check — replace with proper NextAuth or API key check
  const adminSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET;
  if (!adminSecret) return true; // Allow if no secret is set (dev mode)

  const authHeader = req.headers.get('x-admin-secret') || req.headers.get('x-admin-password');
  return authHeader === adminSecret;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  return NextResponse.json({
    logs: getLogs(limit, offset),
    stats: getLogStats(),
    rateLimitStats: getRateLimitStats(),
  });
}
