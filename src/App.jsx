import React, { useEffect, useState } from 'react';
import AdminLogin from './src/AdminLogin';
import AdminLayout from './src/AdminLayout';
import SellerLogin from './src/SellerLogin';
import SellerPortal from './src/SellerPortal';
import { adminSupabase, sellerSupabase } from './src/supabase';

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isSellerLoggedIn, setIsSellerLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const currentPath = window.location.pathname.toLowerCase();
  const isSellerPortal = currentPath === '/seller' || currentPath.startsWith('/seller/');

  useEffect(() => {
    const client = isSellerPortal ? sellerSupabase : adminSupabase;
    client.auth.getSession().then(({ data }) => {
      if (isSellerPortal) setIsSellerLoggedIn(Boolean(data.session));
      else setIsAdminLoggedIn(Boolean(data.session));
      setAuthLoading(false);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (isSellerPortal) setIsSellerLoggedIn(Boolean(session));
      else setIsAdminLoggedIn(Boolean(session));
    });
    return () => listener.subscription.unsubscribe();
  }, [isSellerPortal]);

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
  };

  const handleLogout = async () => {
    await adminSupabase.auth.signOut();
    setIsAdminLoggedIn(false);
  };

  const demoBadge = <div className="global-demo-badge">DEMO ENVIRONMENT</div>;

  if (authLoading) return <><div style={{minHeight:'100vh',display:'grid',placeItems:'center',fontFamily:'Segoe UI'}}>Loading…</div>{demoBadge}</>;

  if (isSellerPortal) {
    return <>{isSellerLoggedIn
      ? <SellerPortal onLogout={async () => { await sellerSupabase.auth.signOut(); setIsSellerLoggedIn(false); }} />
      : <SellerLogin onLoginSuccess={() => setIsSellerLoggedIn(true)} />}{demoBadge}</>;
  }

  return (
    <>
      {!isAdminLoggedIn ? (
        <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
      ) : (
        <AdminLayout onLogout={handleLogout} />
      )}
      {demoBadge}
    </>
  );
}
