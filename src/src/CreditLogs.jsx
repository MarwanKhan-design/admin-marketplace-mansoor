import React, { useMemo, useState } from 'react';
import './CreditLogs.css';

const filters = ['All', 'Credit', 'Debit', 'Lock', 'Unlock', 'Fee', 'Bonus', 'Admin'];

export default function CreditLogs() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const logs = [];

  const visibleLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesType = activeFilter === 'All' || log.type === activeFilter;
      const matchesSearch = !term || log.merchant.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  }, [search, activeFilter]);

  const refreshLogs = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <section className="credit-logs-page">
      <header className="credit-logs-heading">
        <div><h2>Credit Logs</h2><p>Full financial ledger of all balance movements.</p></div>
        <button type="button" className={refreshing ? 'credit-refresh refreshing' : 'credit-refresh'} onClick={refreshLogs} aria-label="Refresh credit logs">↻</button>
      </header>

      <div className="credit-summary">
        <div><span>Total Credited</span><strong className="credited">$0.00</strong></div>
        <div><span>Total Debited</span><strong className="debited">$0.00</strong></div>
        <div><span>Total Locked</span><strong className="locked">$0.00</strong></div>
      </div>

      <div className="credit-toolbar">
        <label className="credit-search"><span>⌕</span><input type="search" placeholder="Search by merchant..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <span className="credit-filter-icon" aria-hidden="true">▽</span>
        <div className="credit-filter-tabs">
          {filters.map((filter) => <button type="button" key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
        </div>
      </div>

      <div className="credit-table-wrap">
        <table className="credit-table">
          <thead><tr><th>TIME</th><th>MERCHANT</th><th>TYPE</th><th>AMOUNT</th><th>BEFORE</th><th>AFTER</th><th>NOTE</th></tr></thead>
          <tbody>
            {visibleLogs.map((log) => <tr key={log.id}><td>{log.time}</td><td>{log.merchant}</td><td>{log.type}</td><td>{log.amount}</td><td>{log.before}</td><td>{log.after}</td><td>{log.note}</td></tr>)}
            {visibleLogs.length === 0 && <tr><td className="credit-empty" colSpan="7">No credit logs.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
