import React, { useEffect, useMemo, useState } from 'react';
import { initialOrders } from './AllOrders';
import './SellerOrders.css';
import { sellerSupabase } from './supabase';

const tabs = ['All', 'Pending Pay', 'Pending Ship', 'Pending Receive', 'Completed', 'Rejected', 'Cancelled', 'Refund'];
const details = {
  TT6133610796740: { customer: '69684646 khan', address: 'kjafja fka fakdf af, los, United state', image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=300&q=80', cost: 160.08 },
  TT5768241121650: { customer: '+92 309893827 aaaa', address: 'G 9/4 , ISLAMABAD, Tarnol, Pakistan', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80', cost: 0 },
  TT5441436862422: { customer: 'Buyer 102', address: 'Lahore, Punjab, Pakistan', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80', cost: 8 },
  TT5270613903704: { customer: 'Buyer 104', address: 'Karachi, Sindh, Pakistan', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80', cost: 25 },
  TT5259077425931: { customer: 'Buyer 105', address: 'Islamabad, Pakistan', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80', cost: 0 },
};
const loadOrders = () => {
  try { return JSON.parse(localStorage.getItem('marketplace_orders')) || initialOrders; } catch { return initialOrders; }
};

export default function SellerOrders({ onBack }) {
  const [orders, setOrders] = useState(loadOrders);
  const [activeTab, setActiveTab] = useState('All');
  const refreshOrders = async () => {
    const { data } = await sellerSupabase.from('orders').select('*').order('created_at',{ascending:false});
    if (data?.length) setOrders(data.map((item) => ({dbId:item.id,id:item.order_no,seller:'Khan321',product:item.product_name,price:`$${Number(item.sell_price).toFixed(2)}`,profit:`$${(Number(item.sell_price)-Number(item.cost_price)).toFixed(2)}`,status:item.status,date:new Date(item.created_at).toLocaleDateString()})));
  };
  useEffect(() => {
    refreshOrders();
    const channel=sellerSupabase.channel('seller-orders').on('postgres_changes',{event:'*',schema:'public',table:'orders'},refreshOrders).subscribe();
    return () => sellerSupabase.removeChannel(channel);
  }, []);
  const visibleOrders = useMemo(() => orders.filter((order) => activeTab === 'All' || order.status === (activeTab === 'Pending Pay' ? 'Pending Payment' : activeTab)), [orders, activeTab]);

  return <main className="seller-orders-page"><div className="seller-orders-shell">
    <header><button type="button" onClick={onBack}>‹</button><h1>Orders</h1><button className="seller-orders-refresh" type="button" onClick={refreshOrders}>↻</button></header>
    <nav>{tabs.map((tab) => <button className={activeTab === tab ? 'active' : ''} type="button" key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}</nav>
    <section className="seller-order-list">{visibleOrders.map((order) => {
      const extra = details[order.id] || { customer: 'Customer', address: 'Shipping address', image: '', cost: Math.max(0, Number(order.price.replace('$','')) - Number(order.profit.replace('$',''))) };
      const sellPrice = Number(order.price.replace('$', ''));
      const profit = Number(order.profit.replace('$', ''));
      return <article key={order.id}><div className="seller-order-heading"><div><span>Order No:</span><strong>{order.id}</strong></div><b className={`order-${order.status.toLowerCase().replaceAll(' ','-')}`}>{order.status}</b></div><div className="seller-order-address"><span>⌾</span><div><strong>{extra.customer}</strong><p>{extra.address}</p></div></div><div className="seller-order-product"><img src={extra.image} alt={order.product} /><div><strong>{order.product}</strong><span>x1</span></div></div><div className="seller-order-prices"><div><strong>${sellPrice.toFixed(2)}</strong><span>Sell Price</span></div><div><strong>${extra.cost.toFixed(2)}</strong><span>Cost Price</span></div><div><strong>${profit.toFixed(2)}</strong><span>Profit</span></div></div></article>;
    })}{!visibleOrders.length && <div className="seller-orders-empty">No {activeTab.toLowerCase()} orders found.</div>}</section>
  </div></main>;
}
