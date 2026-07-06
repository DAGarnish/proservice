// app/admin/page.tsx
// Simple admin placeholder to view request logs and config.

'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [logs, setLogs] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would pass an admin token here if required.
    Promise.all([
      fetch('/api/admin/logs').then(res => res.json()),
      fetch('/api/admin/config').then(res => res.json())
    ]).then(([logsData, configData]) => {
      setLogs(logsData);
      setConfig(configData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container" style={{ padding: '4rem 0' }}>Loading Admin...</div>;

  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard (Placeholder)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
         <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
               <h3 style={{ marginBottom: '1rem' }}>System Config</h3>
               {config?.config ? (
                  <pre style={{ background: 'var(--color-gray-100)', padding: '1rem', borderRadius: '8px', fontSize: '12px', overflowX: 'auto' }}>
                     {JSON.stringify(config.config, null, 2)}
                  </pre>
               ) : (
                  <p>Could not load config.</p>
               )}
            </div>

            <div className="card">
               <h3 style={{ marginBottom: '1rem' }}>Stats (Last 24h)</h3>
               {logs?.stats ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <li><strong>Total Requests:</strong> {logs.stats.total}</li>
                     <li><strong>Last 24h:</strong> {logs.stats.last24h}</li>
                     <li><strong>Successes:</strong> {logs.stats.successes}</li>
                     <li><strong>Errors:</strong> {logs.stats.errors}</li>
                     <li><strong>Rate Limited:</strong> {logs.stats.rateLimited}</li>
                  </ul>
               ) : (
                  <p>Could not load stats.</p>
               )}
            </div>
         </div>

         <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Recent Requests</h3>
            {logs?.logs?.length > 0 ? (
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                     <tr style={{ borderBottom: '2px solid var(--color-gray-200)', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }}>Time</th>
                        <th style={{ padding: '0.5rem' }}>Business</th>
                        <th style={{ padding: '0.5rem' }}>Email</th>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {logs.logs.map((log: any) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                           <td style={{ padding: '0.5rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                           <td style={{ padding: '0.5rem' }}>{log.businessName}</td>
                           <td style={{ padding: '0.5rem' }}>{log.email}</td>
                           <td style={{ padding: '0.5rem' }}>
                              <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-primary'}`}>
                                 {log.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            ) : (
               <p style={{ color: 'var(--color-gray-500)' }}>No requests logged yet.</p>
            )}
         </div>
      </div>
    </div>
  );
}
