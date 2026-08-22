import React, { useState } from 'react';
import './SellerLogin.css';
import './SellerPortal.css';
import { sellerSupabase } from './supabase';

export default function SellerLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true); setError('');
    const { data, error: authError } = await sellerSupabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setSubmitting(false); return; }
    const { data: profile } = await sellerSupabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (!['seller','agent'].includes(profile?.role)) { await sellerSupabase.auth.signOut(); setError('This account does not have seller access.'); setSubmitting(false); return; }
    onLoginSuccess();
  };

  return (
    <main className="seller-login-page">
      <section className="seller-login-brand">
        <div className="seller-brand-mark">S</div>
        <h1>MarketHub Seller Center</h1>
        <p>Manage your store, products, orders, and earnings from one place.</p>
        <div className="seller-brand-points">
          <span>✓ Track store performance</span>
          <span>✓ Manage products and orders</span>
          <span>✓ Access your wallet securely</span>
        </div>
      </section>

      <section className="seller-login-area">
        <div className="seller-login-card">
          <div className="seller-login-heading">
            <span className="seller-mobile-mark">S</span>
            <h2>Welcome back</h2>
            <p>Sign in to the MarketHub demo seller portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="seller-demo-login"><strong>Seller account</strong><span>seller@demo.com</span><span>Use the password created in Supabase</span></div>
            {error && <p className="seller-login-error">{error}</p>}
            <label htmlFor="seller-email">EMAIL ADDRESS</label>
            <input id="seller-email" type="email" placeholder="seller@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />

            <label htmlFor="seller-password">PASSWORD</label>
            <div className="seller-password-field">
              <input id="seller-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>◉</button>
            </div>

            <div className="seller-login-options">
              <label><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>
              <button type="button">Forgot password?</button>
            </div>

            <button className="seller-sign-in-btn" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in to MarketHub'}</button>
          </form>

          <div className="seller-login-footer">
            <span>Not a seller?</span>
            <a href="/admin">Admin login</a>
            <span>·</span>
            <a href="/agent">Agent login</a>
          </div>
        </div>
      </section>
    </main>
  );
}
