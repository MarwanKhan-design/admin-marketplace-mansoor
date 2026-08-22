import React, { useState } from 'react';
import './MyAccount.css';

export default function MyAccount() {
  const [displayName, setDisplayName] = useState('Administrator');
  const [email, setEmail] = useState('admin@admin.com');
  const [newEmail, setNewEmail] = useState('agent1000@gmail.com');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [notice, setNotice] = useState('');
  const inviteCode = '88888888';
  const inviteLink = `${window.location.origin}/seller?invite=${inviteCode}`;

  const flash = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 1800); };
  const updatePassword = (event) => {
    event.preventDefault();
    if (passwords.next.length < 6) return flash('New password must be at least 6 characters.');
    if (passwords.next !== passwords.confirm) return flash('New passwords do not match.');
    setPasswords({ current: '', next: '', confirm: '' });
    flash('Password updated.');
  };
  const copy = async (value) => {
    try { await navigator.clipboard.writeText(value); flash('Copied to clipboard.'); }
    catch { flash('Copy was unavailable.'); }
  };

  return <section className="my-account-page">
    <h2>My Account</h2>
    {notice && <div className="account-notice">{notice}</div>}

    <div className="account-panel"><h3>♙ <span>Account Info</span></h3><div className="account-panel-body account-info-fields">
      <label>USER ID<input disabled value="ad56b3c3-945c-49eb-a758-064ea9981c54" /></label>
      <label>EMAIL ADDRESS<input disabled value={email} /></label>
      <label>ADMIN SINCE<input disabled value="July 16, 2026" /></label>
    </div></div>

    <form className="account-panel" onSubmit={(event) => { event.preventDefault(); flash('Display name saved.'); }}><h3>♢ <span>Display Name</span></h3><div className="account-panel-body">
      <label>DISPLAY NAME<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label><button className="account-primary-btn" type="submit">▣ Save Name</button>
    </div></form>

    <form className="account-panel" onSubmit={(event) => { event.preventDefault(); setEmail(newEmail); flash('Email updated.'); }}><h3>✉ <span>Change Email</span></h3><div className="account-panel-body">
      <label>CURRENT EMAIL<input disabled value={email} /></label><label>NEW EMAIL ADDRESS<input required type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} /></label><button className="account-primary-btn" type="submit">▣ Update Email</button><p className="account-help">A confirmation link will be sent to your new address.</p>
    </div></form>

    <form className="account-panel" onSubmit={updatePassword}><h3>♧ <span>Change Password</span></h3><div className="account-panel-body password-fields">
      {[['current', 'CURRENT PASSWORD', 'Enter current password'], ['next', 'NEW PASSWORD', 'Enter new password (min 6 chars)'], ['confirm', 'CONFIRM NEW PASSWORD', 'Re-enter new password']].map(([field, label, placeholder]) => <label key={field}>{label}<div className="account-password-input"><input required type={showPasswords[field] ? 'text' : 'password'} placeholder={placeholder} value={passwords[field]} onChange={(event) => setPasswords((current) => ({ ...current, [field]: event.target.value }))} /><button type="button" onClick={() => setShowPasswords((current) => ({ ...current, [field]: !current[field] }))}>◉</button></div></label>)}
      <button className="account-primary-btn" type="submit" disabled={!passwords.current || !passwords.next || !passwords.confirm}>♧ Change Password</button>
    </div></form>

    <div className="account-panel invite-panel"><h3>♢ <span>My Invite Code</span></h3><div className="account-panel-body">
      <div className="invite-row"><div><span>Invite Code</span><strong>{inviteCode}</strong></div><button type="button" onClick={() => copy(inviteCode)}>▣ Copy</button></div>
      <div className="invite-row"><div><span>Invite Link</span><code>{inviteLink}</code></div><button type="button" onClick={() => copy(inviteLink)}>▣ Copy</button></div>
    </div></div>
  </section>;
}
