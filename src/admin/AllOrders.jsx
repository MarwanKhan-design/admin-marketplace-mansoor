import React, { useEffect, useMemo, useState } from 'react';
import './AllOrders.css';
import { adminSupabase } from '../shared/supabase';

const statusOptions = [
  'Pending Payment',
  'Paid',
  'Pending Ship',
  'Pending Receive',
  'Completed',
  'Rejected',
  'Cancelled',
  'Refund',
];

export const initialOrders = [
  { id: 'TT6133610796740', seller: 'Khan321', product: 'CR179298', price: '$200.10', profit: '$40.02', status: 'Pending Receive', date: 'Aug 8, 2026' },
  { id: 'TT5768241121650', seller: 'Khan321', product: 'HEADPHONES', price: '$20.00', profit: '$20.00', status: 'Completed', date: 'Aug 3, 2026' },
  { id: 'TT5441436862422', seller: 'Khan321', product: 'DATA CABLE LEAD', price: '$10.00', profit: '$2.00', status: 'Completed', date: 'Jul 31, 2026' },
  { id: 'TT5270613903704', seller: 'Khan321', product: 'DUMMY PHONE', price: '$30.00', profit: '$5.00', status: 'Pending Receive', date: 'Jul 29, 2026' },
  { id: 'TT5259077425931', seller: 'Khan321', product: 'HEADPHONES', price: '$20.00', profit: '$40.00', status: 'Completed', date: 'Jul 28, 2026' },
];

const filterTabs = ['All', 'Pending Pay', 'Paid', 'Pending Ship', 'Pending Receive', 'Completed', 'Rejected', 'Cancelled', 'Refund'];

const statusForFilter = (filter) => filter === 'Pending Pay' ? 'Pending Payment' : filter;

export default function AllOrders() {
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('marketplace_orders')) || initialOrders; } catch { return initialOrders; }
  });
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem('marketplace_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const load = async () => {
      let { data } = await adminSupabase.from('orders').select('*').order('created_at',{ascending:false});
      if (!data?.length) {
        const { data: seller } = await adminSupabase.from('profiles').select('id').eq('email','seller@demo.com').single();
        if (seller) {
          const { data: seeded } = await adminSupabase.from('orders').insert(initialOrders.map((item) => ({order_no:item.id,seller_id:seller.id,product_name:item.product,sell_price:Number(item.price.slice(1)),cost_price:Number(item.price.slice(1))-Number(item.profit.slice(1)),status:item.status}))).select();
          data=seeded;
        }
      }
      if (data?.length) setOrders(data.map((item) => ({dbId:item.id,id:item.order_no,seller:'Khan321',product:item.product_name,price:`$${Number(item.sell_price).toFixed(2)}`,profit:`$${(Number(item.sell_price)-Number(item.cost_price)).toFixed(2)}`,status:item.status,date:new Date(item.created_at).toLocaleDateString()})));
    };
    load();
  }, []);

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = activeFilter === 'All' || order.status === statusForFilter(activeFilter);
      const matchesSearch = !term || [order.id, order.seller, order.product].some((value) => value.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [orders, search, activeFilter]);

  const updateStatus = async (id, status) => {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
    const order = orders.find((item) => item.id === id);
    if (order?.dbId) await adminSupabase.from('orders').update({status,updated_at:new Date().toISOString()}).eq('id',order.dbId);
    if (order) {
      const notice = { id: Date.now(), title: `Order ${status}`, message: `Order ${id} (${order.product}) status changed to ${status}.`, order: id, date: new Date().toLocaleString() };
      try { const current = JSON.parse(localStorage.getItem('seller_order_notices')) || []; localStorage.setItem('seller_order_notices', JSON.stringify([notice, ...current])); } catch { /* local storage unavailable */ }
    }
  };

  return (
    <section className="all-orders-page">
      <header className="orders-heading">
        <h2>Order Management</h2>
        <p>View and manage all orders. Changing status auto-sends an order notice to the seller.</p>
      </header>

      <label className="orders-search">
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Search order no. or seller..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search orders"
        />
      </label>

      <div className="order-filter-tabs" aria-label="Filter orders by status">
        {filterTabs.map((filter) => (
          <button
            type="button"
            key={filter}
            className={activeFilter === filter ? 'active' : ''}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>ORDER NO.</th>
              <th>SELLER</th>
              <th>PRODUCT</th>
              <th>SELL PRICE</th>
              <th>PROFIT</th>
              <th>STATUS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => (
              <tr key={order.id}>
                <td className="order-number">{order.id}</td>
                <td className="order-seller">{order.seller}</td>
                <td>{order.product}</td>
                <td className="order-price">{order.price}</td>
                <td className="order-profit">{order.profit}</td>
                <td>
                  <select
                    className={`order-status status-${order.status.toLowerCase().replaceAll(' ', '-')}`}
                    value={order.status}
                    onChange={(event) => updateStatus(order.id, event.target.value)}
                    aria-label={`Status for order ${order.id}`}
                  >
                    {statusOptions.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
                <td className="order-date">{order.date}</td>
              </tr>
            ))}
            {visibleOrders.length === 0 && (
              <tr><td className="orders-empty" colSpan="7">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
