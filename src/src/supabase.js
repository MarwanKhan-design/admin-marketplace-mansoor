import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
const makeClient = (storageKey) => supabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey },
    })
  : null;

export const adminSupabase = makeClient('marketplace-admin-auth');
export const sellerSupabase = makeClient('marketplace-seller-auth');
export const supabase = window.location.pathname.toLowerCase().startsWith('/seller') ? sellerSupabase : adminSupabase;
