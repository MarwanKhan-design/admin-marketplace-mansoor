import React, { useEffect, useRef, useState } from 'react';
import './SellerService.css';
import { sellerSupabase } from './supabase';

const loadMessages = () => {
  try { return JSON.parse(localStorage.getItem('seller_service_messages')) || []; } catch { return []; }
};

export default function SellerService({ onBack }) {
  const [messages, setMessages] = useState(loadMessages);
  const [message, setMessage] = useState('');
  const fileInput = useRef(null);
  useEffect(() => {
    const load = async () => {
      const { data: auth } = await sellerSupabase.auth.getUser();
      const { data } = await sellerSupabase.from('messages').select('*').eq('channel','service').order('created_at');
      if(data?.length) setMessages(data.map((item)=>({id:item.id,sender:item.sender_id === auth.user.id ? 'seller' : 'support',text:item.body,image:item.image_url,time:new Date(item.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})})));
    };
    load();
    const channel=sellerSupabase.channel('seller-service').on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},load).subscribe();
    return ()=>sellerSupabase.removeChannel(channel);
  },[]);

  const saveMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    const nextMessage = { id: Date.now(), sender: 'seller', text: message.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const { data: auth } = await sellerSupabase.auth.getUser();
    const { data: admins } = await sellerSupabase.from('profiles').select('id').eq('role','admin').limit(1);
    const { data } = await sellerSupabase.from('messages').insert({sender_id:auth.user.id,recipient_id:admins?.[0]?.id,channel:'service',body:message.trim()}).select().single();
    if(data) nextMessage.id=data.id;
    const next = [...messages, nextMessage];
    setMessages(next);
    localStorage.setItem('seller_service_messages', JSON.stringify(next));
    setMessage('');
  };

  const attachImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextMessage = { id: Date.now(), sender: 'seller', image: reader.result, text: file.name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      const next = [...messages, nextMessage];
      setMessages(next);
      localStorage.setItem('seller_service_messages', JSON.stringify(next));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return <main className="seller-service-page"><div className="seller-service-shell">
    <header><button type="button" onClick={onBack}>‹</button><h1>Customer Service</h1><span /></header>
    <section className="seller-service-chat">{messages.length ? messages.map((item) => <article className={item.sender} key={item.id}>{item.image && <img src={item.image} alt={item.text} />}{!item.image && <p>{item.text}</p>}<time>{item.time}</time></article>) : <p className="seller-service-empty">No messages yet, send a message to start</p>}</section>
    <form className="seller-service-composer" onSubmit={saveMessage}><button type="button" aria-label="Emoji" onClick={() => setMessage((current) => `${current}🙂`)}>☺</button><button type="button" aria-label="Attach image" onClick={() => fileInput.current?.click()}>▣</button><input ref={fileInput} hidden type="file" accept="image/*" onChange={attachImage} /><input aria-label="Message" placeholder="Type a message..." value={message} onChange={(event) => setMessage(event.target.value)} /><button type="submit" aria-label="Send message">➤</button></form>
  </div></main>;
}
