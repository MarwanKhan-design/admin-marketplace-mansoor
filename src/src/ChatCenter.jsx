import React, { useEffect, useState } from 'react';
import './ChatCenter.css';
import { adminSupabase } from './supabase';

const defaultSellers = [
  { id: 1, name: 'agent1111', message: 'hey dear', meta: '3 replies', unread: 1, date: 'Aug 16, 08:38 PM' },
  { id: 2, name: 'Khan321', message: 'Hello you there?', meta: '1 reply', unread: 1, date: 'Aug 16, 01:48 PM' },
  { id: 3, name: 'chaudhary', message: 'hello how are you?', meta: '3 replies', unread: 3, date: 'Aug 13, 01:05 AM' },
  { id: 4, name: 'Khan321', message: 'Hey', meta: '3 replies', unread: 0, date: 'Aug 10, 01:51 AM' },
  { id: 5, name: 'newseller1', message: 'hello all', meta: 'No replies yet', unread: 0, date: 'Jul 16, 03:01 PM' },
  { id: 6, name: 'Demo Store', message: 'hello all', meta: 'No replies yet', unread: 0, date: 'Jul 16, 03:01 PM' },
];

const agents = [
  { id: 'AGT000004', name: 'khan', email: 'agent1000@gmail.com', unread: 1, date: 'Aug 2, 11:04 AM' },
  { id: 'AGT000005', name: 'Test Agent', email: 'agent@gmail.com', unread: 0, date: '—' },
];

const templates = { Welcome: 'Welcome! We are happy to have you on the platform.', 'Payout Processing': 'Your payout is currently being processed.', 'Account Warning': 'Please review your account activity and resolve the highlighted issue.', Maintenance: 'Scheduled maintenance will begin shortly.' };
const tabs = ['Send Message', 'Seller Conversations', 'Agent Chats', 'Announcements'];

export default function ChatCenter() {
  const [activeTab, setActiveTab] = useState('Send Message');
  const [sendMode, setSendMode] = useState('Individual');
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('Platform Support');
  const [message, setMessage] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [published, setPublished] = useState([{ id: 1, title: 'orders', content: 'hey', date: 'Aug 8, 2026' }]);
  const [sellers, setSellers] = useState(defaultSellers);
  const [threadReply, setThreadReply] = useState('');

  const loadSellerMessages = async () => {
    const { data } = await adminSupabase.from('messages').select('*,sender:profiles!messages_sender_id_fkey(display_name,email)').eq('channel','service').order('created_at',{ascending:false});
    if(data?.length) setSellers(data.map((item)=>({id:item.id,userId:item.sender_id,name:item.sender?.display_name||item.sender?.email||'Seller',message:item.body||'Image attachment',meta:'Customer service',unread:item.read_at?0:1,date:new Date(item.created_at).toLocaleString()})));
  };
  useEffect(()=>{loadSellerMessages();},[]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const { data: auth } = await adminSupabase.auth.getUser();
    let query=adminSupabase.from('profiles').select('id').in('role',['seller','agent']);
    if(sendMode==='Individual') query=query.or(`email.ilike.%${recipient}%,display_name.ilike.%${recipient}%`);
    const { data: recipients }=await query;
    if(recipients?.length) await adminSupabase.from('messages').insert(recipients.map((item)=>({sender_id:auth.user.id,recipient_id:item.id,channel:'platform',body:message})));
    setMessage('');
    if (sendMode === 'Individual') setRecipient('');
  };

  const sendThreadReply=async()=>{
    if(!threadReply.trim()) return;
    const {data:auth}=await adminSupabase.auth.getUser();
    await adminSupabase.from('messages').insert({sender_id:auth.user.id,recipient_id:activeThread.userId,channel:'service',body:threadReply.trim()});
    setThreadReply('');setActiveThread(null);loadSellerMessages();
  };

  const publishAnnouncement = (event) => {
    event.preventDefault();
    setPublished((current) => [{ id: Date.now(), ...announcementForm, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }, ...current]);
    setAnnouncementForm({ title: '', content: '' });
  };

  return <section className="chat-center-page">
    <header className="chat-center-heading"><h2>Message Center</h2><p>Send messages, view conversations, and chat with agents.</p></header>
    <nav className="message-tabs">
      {tabs.map((tab) => <button type="button" key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab === 'Send Message' ? '➤' : tab === 'Seller Conversations' ? '▱' : tab === 'Agent Chats' ? '◯' : '⚑'} {tab}{tab === 'Seller Conversations' && <b>5</b>}{tab === 'Agent Chats' && <b>1</b>}</button>)}
    </nav>

    {activeTab === 'Send Message' && <div className="send-message-view">
      <div className="send-mode-tabs"><button type="button" className={sendMode === 'Individual' ? 'active' : ''} onClick={() => setSendMode('Individual')}>Individual</button><button type="button" className={sendMode === 'Broadcast to All' ? 'active' : ''} onClick={() => setSendMode('Broadcast to All')}>♙ Broadcast to All</button></div>
      <form className="send-message-card" onSubmit={sendMessage}>
        {sendMode === 'Individual' && <label>Recipient<input required placeholder="Search sellers..." value={recipient} onChange={(event) => setRecipient(event.target.value)} /></label>}
        <label>Sender Name<input required value={sender} onChange={(event) => setSender(event.target.value)} /></label>
        <div className="quick-templates"><span>Quick Templates</span><div>{Object.keys(templates).map((name) => <button type="button" key={name} onClick={() => setMessage(templates[name])}>{name}</button>)}</div></div>
        <label>Message<textarea required maxLength="1000" placeholder="Write your message here..." value={message} onChange={(event) => setMessage(event.target.value)} /><small>{message.length} chars</small></label>
        <button className="send-message-submit" type="submit" disabled={!message.trim() || (sendMode === 'Individual' && !recipient.trim())}>➤ Send Message</button>
      </form>
    </div>}

    {activeTab === 'Seller Conversations' && <div className="conversations-view">
      <div className="message-section-header"><div><h3>All Seller Conversations</h3><p>All messages sent to sellers. Click “Reply” to open the thread.</p></div><button type="button" onClick={loadSellerMessages}>↻ Refresh</button></div>
      <div className="conversation-list">{sellers.map((seller) => <article key={seller.id}><div className="chat-avatar">♙</div><div className="conversation-copy"><strong>{seller.name}</strong><span>{seller.message}</span><small>{seller.meta} {seller.unread > 0 && <b>{seller.unread} new</b>}</small></div><time>{seller.date}</time><button type="button" className="reply-btn" onClick={() => setActiveThread({ type: 'seller', ...seller })}>↶ Reply</button></article>)}</div>
    </div>}

    {activeTab === 'Agent Chats' && <div className="agent-chats-view">
      <div className="message-section-header"><div><h3>Agent Chat Channels</h3><p>Private conversations between Super Admin and each agent.</p></div><button type="button">↻ Refresh</button></div>
      <div className="agent-channel-list">{agents.map((agent) => <article key={agent.id}><div className="agent-chat-avatar">{agent.name[0].toUpperCase()}</div><div><strong>{agent.name}</strong><span>{agent.email}</span><small>{agent.id}</small></div><time>{agent.date}</time>{agent.unread > 0 && <b className="channel-unread">{agent.unread}</b>}<button type="button" onClick={() => setActiveThread({ type: 'agent', ...agent })}>◯ Open Chat</button></article>)}</div>
      <p className="agent-chat-note">Each agent has a dedicated private chat channel. Agents can also message you from their portal.</p>
    </div>}

    {activeTab === 'Announcements' && <div className="chat-announcements-view">
      <form className="publish-card" onSubmit={publishAnnouncement}><h3>Publish New Announcement</h3><label>Title<input required placeholder="Announcement title..." value={announcementForm.title} onChange={(e) => setAnnouncementForm((current) => ({ ...current, title: e.target.value }))} /></label><label>Content<textarea required placeholder="Write the announcement content..." value={announcementForm.content} onChange={(e) => setAnnouncementForm((current) => ({ ...current, content: e.target.value }))} /></label><button type="submit" disabled={!announcementForm.title.trim() || !announcementForm.content.trim()}>⚑ Publish Announcement</button></form>
      <h3 className="published-heading">Published Announcements</h3><div className="published-list">{published.map((item) => <article key={item.id}><strong>{item.title}</strong><span>{item.content}</span><small>{item.date}</small><button type="button" onClick={() => setPublished((current) => current.filter((entry) => entry.id !== item.id))}>♲</button></article>)}</div>
    </div>}

    {activeThread && <div className="chat-thread-overlay" onMouseDown={(event) => event.target === event.currentTarget && setActiveThread(null)}><div className="chat-thread-modal"><div><h3>{activeThread.type === 'agent' ? 'Chat with' : 'Reply to'} {activeThread.name}</h3><button type="button" onClick={() => setActiveThread(null)}>×</button></div><p>{activeThread.message || `Private agent channel for ${activeThread.email}`}</p><textarea placeholder="Write a reply..." value={threadReply} onChange={(event)=>setThreadReply(event.target.value)} /><button type="button" onClick={sendThreadReply}>Send Reply</button></div></div>}
  </section>;
}
