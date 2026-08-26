-- Run once in Supabase Dashboard > SQL Editor if seller@demo.com exists in
-- Authentication but is missing from the Admin Merchant List.
insert into public.profiles (id, email, display_name, role)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'display_name', 'Demo Seller'),
  'seller'
from auth.users
where lower(email) = 'seller@demo.com'
on conflict (id) do update
set email = excluded.email,
    display_name = excluded.display_name,
    role = 'seller';
