-- Run this entire file once in Supabase Dashboard > SQL Editor > New query.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text not null default 'User',
  role text not null default 'seller' check (role in ('admin','agent','seller')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles (id,email,display_name,role)
  values (new.id,new.email,coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1)),coalesce(new.raw_user_meta_data->>'role','seller'));
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), product_code text unique not null, sku text unique not null,
  name text not null, sell_price numeric(12,2) not null default 0, cost_price numeric(12,2) not null default 0,
  category text not null default 'Other', image_url text, source_link text, description text,
  admin_on_shelf boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.showcase_products (
  seller_id uuid references public.profiles(id) on delete cascade, product_id uuid references public.products(id) on delete cascade,
  on_shelf boolean not null default true, created_at timestamptz not null default now(), primary key(seller_id,product_id)
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), order_no text unique not null, seller_id uuid references public.profiles(id),
  product_id uuid references public.products(id), product_name text not null, customer_name text, shipping_address text,
  quantity int not null default 1, sell_price numeric(12,2) not null default 0, cost_price numeric(12,2) not null default 0,
  status text not null default 'Pending Payment', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(), title text not null, message text not null,
  target_type text not null default 'all', target_user_id uuid references public.profiles(id), created_by uuid references public.profiles(id), created_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), sender_id uuid references public.profiles(id), recipient_id uuid references public.profiles(id),
  channel text not null check(channel in ('buyer','platform','service','agent')), body text, image_url text, read_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.feedback_tickets (
  id uuid primary key default gen_random_uuid(), seller_id uuid references public.profiles(id), title text not null,
  type text not null, message text not null, status text not null default 'Open', admin_response text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(), seller_id uuid references public.profiles(id), amount numeric(12,2) not null,
  method text not null, account_details text not null, status text not null default 'Pending', rejection_reason text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(), seller_id uuid references public.profiles(id), type text not null,
  amount numeric(12,2) not null, note text, created_at timestamptz not null default now()
);
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(), seller_id uuid references public.profiles(id), method_type text not null,
  details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(seller_id,method_type)
);

alter table public.profiles enable row level security; alter table public.products enable row level security;
alter table public.showcase_products enable row level security; alter table public.orders enable row level security;
alter table public.announcements enable row level security; alter table public.messages enable row level security;
alter table public.feedback_tickets enable row level security; alter table public.withdrawals enable row level security;
alter table public.wallet_transactions enable row level security; alter table public.payment_methods enable row level security;

create policy "profiles read authenticated" on public.profiles for select to authenticated using (true);
create policy "profile update self or admin" on public.profiles for update to authenticated using (id=auth.uid() or public.is_admin()) with check (id=auth.uid() or public.is_admin());
create policy "products read authenticated" on public.products for select to authenticated using (true);
create policy "products admin insert" on public.products for insert to authenticated with check (public.is_admin());
create policy "products admin update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products admin delete" on public.products for delete to authenticated using (public.is_admin());
create policy "showcase read own or admin" on public.showcase_products for select to authenticated using (seller_id=auth.uid() or public.is_admin());
create policy "showcase insert own or admin" on public.showcase_products for insert to authenticated with check (seller_id=auth.uid() or public.is_admin());
create policy "showcase update own or admin" on public.showcase_products for update to authenticated using (seller_id=auth.uid() or public.is_admin()) with check (seller_id=auth.uid() or public.is_admin());
create policy "showcase delete own or admin" on public.showcase_products for delete to authenticated using (seller_id=auth.uid() or public.is_admin());
create policy "orders read own or admin" on public.orders for select to authenticated using (seller_id=auth.uid() or public.is_admin());
create policy "orders admin write" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "announcements read targeted" on public.announcements for select to authenticated using (target_type='all' or target_user_id=auth.uid() or public.is_admin());
create policy "announcements admin write" on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "messages read participants" on public.messages for select to authenticated using (sender_id=auth.uid() or recipient_id=auth.uid() or public.is_admin());
create policy "messages send self" on public.messages for insert to authenticated with check (sender_id=auth.uid());
create policy "messages update recipient" on public.messages for update to authenticated using (recipient_id=auth.uid() or public.is_admin());
create policy "feedback read own or admin" on public.feedback_tickets for select to authenticated using (seller_id=auth.uid() or public.is_admin());
create policy "feedback seller insert" on public.feedback_tickets for insert to authenticated with check (seller_id=auth.uid());
create policy "feedback admin update" on public.feedback_tickets for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "withdrawals read own or admin" on public.withdrawals for select to authenticated using (seller_id=auth.uid() or public.is_admin());
create policy "withdrawals seller insert" on public.withdrawals for insert to authenticated with check (seller_id=auth.uid());
create policy "withdrawals admin update" on public.withdrawals for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "transactions read own or admin" on public.wallet_transactions for select to authenticated using (seller_id=auth.uid() or public.is_admin());
create policy "transactions admin write" on public.wallet_transactions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "payments read own or admin" on public.payment_methods for select to authenticated using (seller_id=auth.uid() or public.is_admin());
create policy "payments insert own" on public.payment_methods for insert to authenticated with check (seller_id=auth.uid());
create policy "payments update own" on public.payment_methods for update to authenticated using (seller_id=auth.uid()) with check (seller_id=auth.uid());

alter publication supabase_realtime add table public.products, public.showcase_products, public.orders, public.announcements, public.messages, public.feedback_tickets, public.withdrawals;
