import React, { useMemo, useState } from 'react';
import './AuditLogs.css';

const actionTypes = ['All actions', 'add order', 'adjust wallet', 'admin create showcase product', 'admin edit showcase product', 'admin migrate seller products', 'approveMerchant', 'approve merchant', 'approve withdrawal', 'assign shipping', 'create agent', 'credit agent commission', 'delete agent', 'faq add', 'faq delete', 'faq update', 'impersonate merchant', 'kick user', 'lock account', 'lock balance', 'lock shop', 'reject withdrawal', 'reset agent password', 'reset password', 'send announcement', 'send broadcast', 'send message', 'set agent status', 'set payment info', 'suspend account', 'toggle showcase', 'toggle traffic', 'unlock balance', 'unlock shop', 'unsuspend account', 'update agent', 'update merchant edit'];

const logs = [
  { id: 1, time: '2026-08-16 15:33:26', admin: 'ad56b3c3', action: 'admin edit showcase product', target: '—', details: { product_name: 'CR149325', sell_price: 196, category: 'Bags' } },
  { id: 2, time: '2026-08-12 15:52:18', admin: 'ad56b3c3', action: 'admin edit showcase product', target: '—', details: { product_name: 'CR149325', status: 'updated' } },
  { id: 3, time: '2026-08-08 19:19:02', admin: 'ad56b3c3', action: 'admin migrate seller products', target: '—', details: { products_migrated: 0, already_in_catalog: 345, selections_created: 0 } },
  { id: 4, time: '2026-08-08 16:21:06', admin: 'ad56b3c3', action: 'admin create showcase product', target: '—', details: { product_no: 'P1786188066270', product_name: 'CR149325' } },
  { id: 5, time: '2026-08-08 16:05:32', admin: 'ad56b3c3', action: 'send announcement', target: '—', details: { agent_count: 2, target_type: 'all_agents', announcement_id: 1 } },
  { id: 6, time: '2026-08-08 16:04:39', admin: 'ad56b3c3', action: 'admin migrate seller products', target: '—', details: { products_migrated: 345, already_in_catalog: 0 } },
  { id: 7, time: '2026-08-06 20:27:19', admin: 'ad56b3c3', action: 'reset password', target: '—', details: null },
  { id: 8, time: '2026-08-06 20:25:10', admin: 'ad56b3c3', action: 'update merchant edit', target: '—', details: { agent_id: 'bef82dc4-436d-46a1-b343-242d99c1da72' } },
  { id: 9, time: '2026-08-06 20:24:17', admin: 'ad56b3c3', action: 'create agent', target: '—', details: { email: 'agent@gmail.com', status: 'active' } },
  { id: 10, time: '2026-08-06 20:23:18', admin: 'ad56b3c3', action: 'reset agent password', target: '—', details: null },
  { id: 11, time: '2026-08-06 20:22:40', admin: 'ad56b3c3', action: 'reset agent password', target: '—', details: null },
];

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All actions');
  const [selectedLog, setSelectedLog] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const visibleLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesAction = actionFilter === 'All actions' || log.action === actionFilter;
      const matchesSearch = !term || [log.admin, log.action, log.target, JSON.stringify(log.details || {})].some((value) => value.toLowerCase().includes(term));
      return matchesAction && matchesSearch;
    });
  }, [search, actionFilter]);

  const refresh = () => { setRefreshing(true); window.setTimeout(() => setRefreshing(false), 500); };

  return <section className="audit-page">
    <header className="audit-heading"><div><h2>Audit Logs</h2><p>Complete trail of all admin actions on the platform.</p></div><button type="button" className={refreshing ? 'refreshing' : ''} onClick={refresh}>↻</button></header>
    <div className="audit-stats"><div><span>Total Actions</span><strong>79</strong></div><div><span>Unique Admins</span><strong>1</strong></div><div><span>Action Types</span><strong>36</strong></div><div><span>Last 24h</span><strong>0</strong></div></div>
    <div className="audit-toolbar"><label><span>⌕</span><input type="search" placeholder="Search by admin, target, or action..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>{actionTypes.map((action) => <option key={action}>{action}</option>)}</select></div>
    <div className="audit-table-wrap"><table className="audit-table"><thead><tr><th>TIME</th><th>ADMIN</th><th>ACTION</th><th>TARGET</th><th>DETAILS</th><th /></tr></thead><tbody>
      {visibleLogs.map((log) => <tr key={log.id}><td>{log.time}</td><td><span className="admin-dot">◉</span>{log.admin}</td><td><span className={`audit-action ${log.action === 'reset password' ? 'danger' : ''}`}>{log.action}</span></td><td>{log.target}</td><td className="audit-details-preview">{log.details ? `${JSON.stringify(log.details).slice(0, 58)}...` : '—'}</td><td>{log.details && <button type="button" onClick={() => setSelectedLog(log)}>Details</button>}</td></tr>)}
      {visibleLogs.length === 0 && <tr><td className="audit-empty" colSpan="6">No audit logs found.</td></tr>}
    </tbody></table></div>
    {selectedLog && <div className="audit-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setSelectedLog(null)}><div className="audit-modal"><div><h3>Audit Log Details</h3><button type="button" onClick={() => setSelectedLog(null)}>×</button></div><dl><div><dt>Time</dt><dd>{selectedLog.time}</dd></div><div><dt>Admin</dt><dd>{selectedLog.admin}</dd></div><div><dt>Action</dt><dd>{selectedLog.action}</dd></div><div><dt>Target</dt><dd>{selectedLog.target}</dd></div></dl><pre>{JSON.stringify(selectedLog.details, null, 2)}</pre></div></div>}
  </section>;
}
