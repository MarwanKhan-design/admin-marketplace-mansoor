import React, { useState } from 'react';
import './SellerInvite.css';

const todayKey = () => new Date().toISOString().slice(0, 10);
const loadData = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('seller_assist_records')) || [];
    return saved.filter((record) => record.day === todayKey());
  } catch { return []; }
};

export default function SellerInvite({ onBack }) {
  const [tab, setTab] = useState('Rules');
  const [records, setRecords] = useState(loadData);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const remaining = Math.max(0, 2 - records.length);

  const assist = (event) => {
    event.preventDefault();
    if (!remaining) return setError('You have already used both assists today.');
    const record = { id: Date.now(), email, clicks: 0, time: new Date().toLocaleString(), day: todayKey() };
    const next = [record, ...records];
    setRecords(next);
    localStorage.setItem('seller_assist_records', JSON.stringify(next));
    setEmail(''); setError(''); setModalOpen(false); setTab('Details');
  };

  return <main className="seller-invite-page"><div className="seller-invite-shell">
    <header><button type="button" onClick={onBack}>‹</button><h1>Invite Assistance</h1><span /></header>
    <section className="invite-hero"><div className="invite-friends-art"><span>♙</span><span>♙</span><i>★</i></div><h2>Help your friend's store<br />Get product sponsorship</h2><p>{remaining} times remaining today</p><button type="button" disabled={!remaining} onClick={() => setModalOpen(true)}>Assist Friend</button></section>
    <nav className="invite-tabs"><button className={tab === 'Rules' ? 'active' : ''} type="button" onClick={() => setTab('Rules')}>Rules</button><button className={tab === 'Details' ? 'active' : ''} type="button" onClick={() => setTab('Details')}>Details</button></nav>
    {tab === 'Rules' ? <ol className="invite-rules"><li>You can help a friend up to 2 times per day for free</li><li>Enter your friend's email. They must have products in their showcase</li><li>Getting assisted increases your product exposure</li><li>Traffic duration and exposure are automatically analyzed by the algorithm</li><li>All rights reserved by the platform</li></ol> : <section className="invite-details"><header><strong>Friend</strong><strong>Clicks</strong><strong>Time</strong></header>{records.length ? records.map((record) => <article key={record.id}><span>{record.email}</span><span>{record.clicks}</span><time>{record.time}</time></article>) : <p>No assist records</p>}</section>}
    {modalOpen && <div className="invite-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}><form className="invite-modal" onSubmit={assist}><label>Enter friend's email<input autoFocus required type="email" placeholder="Friend's email address" value={email} onChange={(event) => setEmail(event.target.value)} /></label>{error && <p>{error}</p>}<button type="submit">Confirm</button></form></div>}
  </div></main>;
}
