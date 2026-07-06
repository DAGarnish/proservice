// lib/requestLogger.ts
// Server-side request logger for monitoring preview generation requests.
// Logs to in-memory array for now — replace with DB (Postgres/Supabase) in production.

export interface LogEntry {
  id: string;
  timestamp: string;
  ip: string;
  email: string;
  businessName: string;
  occupation: string;
  status: 'success' | 'error' | 'rate_limited' | 'invalid';
  previewId?: string;
  errorMessage?: string;
  durationMs?: number;
}

// In-memory log store (survives hot-reload but not process restart)
// Replace with a database write in production
const logs: LogEntry[] = [];
const MAX_LOGS = 1000;

function generateId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function logRequest(entry: Omit<LogEntry, 'id' | 'timestamp'>): LogEntry {
  const full: LogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    ...entry,
  };

  logs.unshift(full); // newest first

  // Trim log if too large
  if (logs.length > MAX_LOGS) {
    logs.splice(MAX_LOGS);
  }

  // In production: also write to database here
  // await db.insert('generation_logs', full);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[PROSERVICE LOG] ${full.timestamp} | ${full.status} | ${full.email} | ${full.businessName}`);
  }

  return full;
}

export function getLogs(limit = 100, offset = 0): LogEntry[] {
  return logs.slice(offset, offset + limit);
}

export function getLogStats() {
  const now = Date.now();
  const last24h = logs.filter(l => now - new Date(l.timestamp).getTime() < 86400000);

  return {
    total: logs.length,
    last24h: last24h.length,
    successes: logs.filter(l => l.status === 'success').length,
    errors: logs.filter(l => l.status === 'error').length,
    rateLimited: logs.filter(l => l.status === 'rate_limited').length,
  };
}
