import React, { useEffect, useState } from 'react';
import './SellerMessages.css';
import { sellerSupabase } from './supabase';

const tabs = ['Announcements', 'Order Notices', 'Buyer Messages', 'Platform Msgs'];
const defaultAnnouncements = [{ id: 1, title: 'orders', message: 'hey', date: '2026-08-08 16:05' }];
const defaultNotices = [
  { id: 1, title: 'Order Shipped', message: 'Order TT5270613903704 (DUMMY PHONE) has been shipped.', order: 'TT5270613903704', date: '2026-08-10 02:01' },
  { id: 2, title: 'Order Paid', message: 'Order TT5270613903704 has been paid and is awaiting shipment.', order: 'TT5270613903704', date: '2026-08-10 01:53' },
  { id: 3, title: 'Delivery Confirmed', message: 'Order TT6133610796740 delivery has been confirmed and is pending completion.', order: 'TT6133610796740', date: '2026-08-10 01:53' },
  { id: 4, title: 'Payment Successful', message: '$160.08 was deducted from your wallet for order TT6133610796740. Please ship the order now.', order: 'TT6133610796740', date: '2026-08-10 01:32' },
  { id: 5, title: 'Order Completed', message: 'Order TT5441436862422 (DATA CABLE LEAD) has been marked as completed.', order: 'TT5441436862422', date: '2026-08-08 01:16' },
];
const buyers = [
  { id: 1, product: 'CR149127', sku: 'P1786124390743', price: '$172.79', buyer: 'khan', message: 'Is this available?', date: 'Aug 8, 01:17 AM', replies: [] },
  { id: 2, product: 'locker', sku: 'P1785085881435', price: '$8.00', buyer: 'ali', message: 'Is this available?', date: 'Aug 4, 12:37 AM', replies: ['Hello'] },
];
const defaultPlatformMessages = [{ id: 1, sender: 'khan', message: 'Hey', date: 'Jul 27, 12:16 AM' }, { id: 2, sender: 'khan', message: 'Hello you there?', date: 'Aug 10, 01:58 AM' }];

const readStorage = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) && value.length ? value : fallback; }
  catch { return fallback; }
};

export default function SellerMessages({ onBack }) {
  const [activeTab, setActiveTab] = useState('Announcements');
  const [announcements, setAnnouncements] = useState(() => readStorage('marketplace_announcements', defaultAnnouncements));
  const [notices] = useState(() => [...readStorage('seller_order_notices', []), ...defaultNotices]);
  const [buyerThreads, setBuyerThreads] = useState(buyers);
  const [replyTarget, setReplyTarget] = useState(null);
  const [reply, setReply] = useState('');
  const [platformMessages, setPlatformMessages] = useState(defaultPlatformMessages);

  useEffect(() => {
    sellerSupabase.from('announcements').select('*').order('created_at',{ascending:false}).then(({data}) => {
      if (data?.length) setAnnouncements(data.map((item) => ({id:item.id,title:item.title,message:item.message,date:new Date(item.created_at).toLocaleString()})));
    });
    sellerSupabase.from('messages').select('*').eq('channel','platform').order('created_at',{ascending:false}).then(({data})=>{
      if(data?.length)setPlatformMessages(data.map((item)=>({id:item.id,sender:'Platform Support',message:item.body,date:new Date(item.created_at).toLocaleString()})));
    });
    const channel = sellerSupabase.channel('seller-announcements').on('postgres_changes',{event:'*',schema:'public',table:'announcements'},() => {
      sellerSupabase.from('announcements').select('*').order('created_at',{ascending:false}).then(({data}) => data && setAnnouncements(data.map((item) => ({id:item.id,title:item.title,message:item.message,date:new Date(item.created_at).toLocaleString()}))));
    }).subscribe();
    return () => sellerSupabase.removeChannel(channel);
  }, []);

  const sendReply = (event) => {
    event.preventDefault();
    if (replyTarget.type === 'buyer') setBuyerThreads((current) => current.map((thread) => thread.id === replyTarget.id ? { ...thread, replies: [...thread.replies, reply] } : thread));
    setReply(''); setReplyTarget(null);
  };

  return <main className="seller-messages-page"><div className="seller-messages-shell">
    <header><button type="button" onClick={onBack}>‹</button><h1>Messages</h1><span /></header>
    <nav className="seller-message-tabs">{tabs.map((tab) => <button type="button" key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
    {activeTab === 'Announcements' && <section className="seller-announcement-list">{announcements.map((item) => <article key={item.id}><div><strong>{item.title}</strong><p>{item.message || item.content}</p></div><time>{item.date}</time></article>)}</section>}
    {activeTab === 'Order Notices' && <section className="seller-notice-list">{notices.map((item, index) => <article key={`${item.id}-${index}`}><div><strong>{item.title}</strong><p>{item.message}</p><button type="button">Order No: {item.order}</button></div><time>{item.date}</time><b>›</b></article>)}</section>}
    {activeTab === 'Buyer Messages' && <section className="buyer-thread-list">{buyerThreads.map((thread) => <article key={thread.id}><div className="buyer-product"><div className="buyer-product-image">{thread.product[0]}</div><div><strong>{thread.product}</strong><small>SKU: {thread.sku}</small><b>{thread.price}</b></div></div><div className="buyer-message"><span>♙</span><div><strong>{thread.buyer}</strong><p>{thread.message}</p><time>{thread.date}</time></div></div>{thread.replies.map((text, index) => <div className="seller-reply" key={index}><strong>You replied</strong><p>{text}</p></div>)}<button className="buyer-reply-btn" type="button" onClick={() => setReplyTarget({ type: 'buyer', id: thread.id, name: thread.buyer })}>▱ {thread.replies.length ? 'View Chat' : 'Reply'}</button></article>)}</section>}
    {activeTab === 'Platform Msgs' && <section className="platform-message-list">{platformMessages.map((item) => <article key={item.id}><div className="platform-avatar">TS</div><div><strong>{item.sender}</strong><time>{item.date}</time><p>{item.message}</p><button type="button" onClick={() => setReplyTarget({ type: 'platform', id: item.id, name: item.sender })}>▱ Reply</button></div></article>)}</section>}
    {replyTarget && <div className="seller-reply-overlay" onMouseDown={(event) => event.target === event.currentTarget && setReplyTarget(null)}><form onSubmit={sendReply}><div><h2>Reply to {replyTarget.name}</h2><button type="button" onClick={() => setReplyTarget(null)}>×</button></div><textarea autoFocus required placeholder="Write your reply..." value={reply} onChange={(event) => setReply(event.target.value)} /><button type="submit">Send Reply</button></form></div>}
  </div></main>;
}
