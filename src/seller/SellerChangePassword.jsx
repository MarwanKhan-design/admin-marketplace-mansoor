import React, { useState } from 'react';
import './SellerChangePassword.css';
import { sellerSupabase } from '../shared/supabase';

export default function SellerChangePassword({ onBack }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.next.length < 6) return setError('New password must contain at least 6 characters.');
    if (form.next !== form.confirm) return setError('The new passwords do not match.');
    const { data: auth } = await sellerSupabase.auth.getUser();
    const { error: verifyError } = await sellerSupabase.auth.signInWithPassword({email:auth.user.email,password:form.current});
    if (verifyError) return setError('Current password is incorrect.');
    const { error: updateError } = await sellerSupabase.auth.updateUser({password:form.next});
    if (updateError) return setError(updateError.message);
    setError('');
    setNotice('Password changed successfully. Use it the next time you sign in.');
    setForm({ current: '', next: '', confirm: '' });
    window.setTimeout(() => setNotice(''), 2600);
  };

  return <main className="seller-change-password-page"><div className="seller-change-password-shell">
    <header><button type="button" onClick={onBack}>‹</button><h1>Change Password</h1><span /></header>
    {notice && <div className="seller-change-password-notice">{notice}</div>}
    <form onSubmit={submit}>
      <label>Current Password<input required type="password" placeholder="Enter current password" value={form.current} onChange={(event) => update('current', event.target.value)} /></label>
      <label>New Password<input required minLength="6" type="password" placeholder="Enter new password (min 6 chars)" value={form.next} onChange={(event) => update('next', event.target.value)} /></label>
      <label>Confirm Password<input required type="password" placeholder="Enter new password again" value={form.confirm} onChange={(event) => update('confirm', event.target.value)} /></label>
      {error && <p className="seller-change-password-error">{error}</p>}
      <button type="submit">Confirm</button>
    </form>
  </div></main>;
}
