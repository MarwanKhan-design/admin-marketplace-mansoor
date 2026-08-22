import React, { useState } from 'react';
import './SellerLogin.css';
import './SellerPortal.css';
import SellerMessages from './SellerMessages';
import SellerWallet from './SellerWallet';
import SellerShowcase from './SellerShowcase';
import SellerOrders from './SellerOrders';
import SellerInvite from './SellerInvite';
import SellerFeedback from './SellerFeedback';
import SellerService from './SellerService';

const periods = ['Today', 'This Week', 'This Month', 'Total'];
const faqs = [
  ['What is the MarketHub online store?', 'It is a demo marketplace where sellers can showcase products and manage orders.'],
  ["Why can't I stop selling?", 'Please complete or cancel any pending orders before stopping store activity.'],
  ["Why can't I recharge?", 'Confirm your payment method and contact support if the issue continues.'],
  ['Can I become a supplier?', 'Supplier applications can be submitted through the Service section.'],
  ['How long does shipping take?', 'Shipping time depends on the product and destination, but is normally shown on each order.'],
];

export default function SellerPortal({ onLogout }) {
  const [period, setPeriod] = useState('Today');
  const [openFaq, setOpenFaq] = useState(null);
  const [shopName, setShopName] = useState('Khan321');
  const [shopNameDraft, setShopNameDraft] = useState('Khan321');
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameChanged, setNameChanged] = useState(false);
  const [sellerView, setSellerView] = useState('home');

  const saveShopName = (event) => {
    event.preventDefault();
    const nextName = shopNameDraft.trim();
    if (!nextName || nameChanged) return;
    setShopName(nextName);
    setNameChanged(true);
    setShowNameModal(false);
  };

  if (sellerView === 'messages') return <SellerMessages onBack={() => setSellerView('home')} />;
  if (sellerView === 'wallet') return <SellerWallet onBack={() => setSellerView('home')} />;
  if (sellerView === 'showcase') return <SellerShowcase onBack={() => setSellerView('home')} />;
  if (sellerView === 'orders') return <SellerOrders onBack={() => setSellerView('home')} />;
  if (sellerView === 'invite') return <SellerInvite onBack={() => setSellerView('home')} />;
  if (sellerView === 'feedback') return <SellerFeedback onBack={() => setSellerView('home')} />;
  if (sellerView === 'service') return <SellerService onBack={() => setSellerView('home')} />;

  return (
    <main className="seller-center-page">
      <div className="seller-center-shell">
        <header className="seller-center-topbar"><button type="button" onClick={onLogout} aria-label="Sign out">↪</button><h1>MarketHub Seller Center</h1><div><button type="button" onClick={() => setSellerView('messages')} aria-label="Messages">◌</button><button type="button" aria-label="Language">◎</button></div></header>
        <section className="seller-profile-row"><div className="seller-avatar">{shopName.charAt(0).toUpperCase()}</div><div className="seller-profile-copy"><div><h2>{shopName}</h2><button type="button" disabled={nameChanged} onClick={() => { setShopNameDraft(shopName); setShowNameModal(true); }} aria-label="Edit shop name">✎</button></div><span>Credit Score 95</span></div><button className="seller-wallet-btn" type="button" onClick={() => setSellerView('wallet')}>Wallet</button></section>
        <nav className="seller-primary-links"><button type="button" onClick={() => setSellerView('showcase')}>▣ <strong>Showcase</strong></button><button type="button" onClick={() => setSellerView('orders')}>▤ <strong>Orders</strong></button></nav>
        <section className="seller-traffic-banner"><strong>Market<span>·</span><br />Hub</strong><div>Grow with <b>Marketplace Traffic</b><br /><em>Demo</em> product exposure</div><i /></section>
        <div className="seller-period-tabs">{periods.map((item) => <button type="button" key={item} className={period === item ? 'active' : ''} onClick={() => setPeriod(item)}>{item}</button>)}</div>
        <section className="seller-metrics"><h2>Key Metrics</h2><div className="seller-metric-grid"><article className="sales-card"><span>Total Sales</span><strong>$0.00</strong></article><article><span>Expected Profit</span><strong>$0.00</strong></article><article><span>Order Quantity</span><strong>0</strong></article><article><span>Product Clicks</span><strong>10,025</strong></article></div></section>
        <section className="seller-sales-chart"><h2>Total Sales</h2><div className="chart-area"><div className="chart-y"><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span></div><div className="chart-plot"><div className="chart-line">{Array.from({ length: 12 }).map((_, index) => <i key={index} />)}</div><div className="chart-times">{['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'].map((time) => <span key={time}>{time}</span>)}</div></div></div><div className="chart-legend"><i /> Total Sales</div></section>
        <nav className="seller-help-links"><button type="button" onClick={() => setSellerView('invite')}><b>♙＋</b><span>Invite</span></button><button type="button" onClick={() => setSellerView('feedback')}><b>⌕</b><span>Feedback</span></button><button type="button" onClick={() => setSellerView('service')}><b>♧</b><span>Service</span></button></nav>
        <section className="seller-faq"><h2>FAQ</h2>{faqs.map(([question, answer], index) => <article key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><b>{openFaq === index ? '⌄' : '›'}</b></button>{openFaq === index && <p>{answer}</p>}</article>)}</section>
      </div>
      {showNameModal && <div className="shop-name-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setShowNameModal(false)}><form className="shop-name-modal" onSubmit={saveShopName}><div className="shop-name-modal-header"><button type="button" onClick={() => setShowNameModal(false)}>×</button><h2>Edit Shop Name</h2><span /></div><div className="shop-name-modal-body"><p>Shop name can only be changed once</p><input autoFocus maxLength="40" value={shopNameDraft} onChange={(event) => setShopNameDraft(event.target.value)} aria-label="Shop name" /><button type="submit" disabled={!shopNameDraft.trim()}>Confirm</button></div></form></div>}
    </main>
  );
}
