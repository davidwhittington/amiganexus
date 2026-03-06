-- ═══════════════════════════════════════════════════════════════
-- Amiga Nexus — Supabase Schema
-- Run this in the Supabase SQL editor (Project > SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ─── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Users ───────────────────────────────────────────────────────
-- Extends Supabase auth.users — one row per registered user.
create table if not exists public.users (
  id               uuid primary key references auth.users(id) on delete cascade,
  cid              text unique,           -- C=ID e.g. "C=10427", assigned on first login
  display_name     text,
  assigned_amiga   text,                  -- cosmetic: "Amiga 1200 (AGA)" etc.
  sector           text,                  -- cosmetic: "Boing Sector" etc.
  clearance        text not null default 'NONE',  -- NONE / EXPLORER / PILOT / COMMANDER / ADMIRAL
  discovery_seed   integer,               -- random seed for item location assignment
  created_at       timestamptz not null default now(),
  last_seen_at     timestamptz
);

-- Sequence for C=ID — starts at 10000 (explorers range)
create sequence if not exists cid_seq start 10000 increment 1;

-- Auto-assign C=ID on user row insert if not provided
create or replace function public.assign_cid()
returns trigger language plpgsql as $$
begin
  if new.cid is null then
    new.cid := 'C=' || lpad(nextval('cid_seq')::text, 5, '0');
  end if;
  if new.discovery_seed is null then
    new.discovery_seed := floor(random() * 1000000)::integer;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_cid on public.users;
create trigger trg_assign_cid
  before insert on public.users
  for each row execute function public.assign_cid();

-- Mirror new Supabase auth user into public.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_new_auth_user on auth.users;
create trigger trg_new_auth_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── User Preferences ────────────────────────────────────────────
create table if not exists public.user_preferences (
  user_id          uuid primary key references public.users(id) on delete cascade,
  sound_enabled    boolean not null default true,
  palette_id       text not null default 'ocs',   -- ocs / ecs / aga
  text_size        text not null default 'md',    -- sm / md / lg / xl
  interaction_mode text not null default 'EXPLORERS_ONLY',
  updated_at       timestamptz not null default now()
);

-- ─── Discoverable Items ───────────────────────────────────────────
create table if not exists public.discoverable_items (
  id            serial primary key,
  name          text not null,
  description   text,
  flavour_text  text,                             -- shown at claim time
  location_pool jsonb not null default '[]',      -- array of station slugs
  rarity        text not null default 'standard', -- standard / rare / legendary
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ─── Discoveries ─────────────────────────────────────────────────
-- One row per user per item. assigned_location set at account creation.
create table if not exists public.discoveries (
  id                serial primary key,
  user_id           uuid not null references public.users(id) on delete cascade,
  item_id           integer not null references public.discoverable_items(id),
  assigned_location text not null,     -- station slug where this user finds the item
  discovered_at     timestamptz,       -- null = not yet found
  unique (user_id, item_id)
);

-- ─── Warp Logs ───────────────────────────────────────────────────
-- Anonymous — no user_id stored.
create table if not exists public.warp_logs (
  id          serial primary key,
  destination text not null,
  label       text,
  warped_at   timestamptz not null default now()
);

-- Aggregate function for top Warp destinations
create or replace function public.top_warp_destinations(limit_n integer default 20)
returns table(destination text, label text, warp_count bigint)
language sql as $$
  select
    destination,
    max(label) as label,
    count(*)   as warp_count
  from public.warp_logs
  group by destination
  order by warp_count desc
  limit limit_n;
$$;

-- ─── Signal Posts ─────────────────────────────────────────────────
create table if not exists public.signal_posts (
  id           serial primary key,
  title        text not null,
  body         text not null,
  date         text not null,   -- display date e.g. "2026.03.06"
  tags         text[] not null default '{}',
  published    boolean not null default true,
  published_at timestamptz not null default now()
);

-- ─── Admin Settings ───────────────────────────────────────────────
create table if not exists public.admin_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Seed defaults
insert into public.admin_settings (key, value) values
  ('discovery_generosity', '1.0'),    -- multiplier: 1.0 = normal, 2.0 = double frequency
  ('maintenance_mode',     'false'),
  ('phase',                '"1"')
on conflict (key) do nothing;

-- ─── Row Level Security ───────────────────────────────────────────

alter table public.users             enable row level security;
alter table public.user_preferences  enable row level security;
alter table public.discoveries       enable row level security;
alter table public.discoverable_items enable row level security;
alter table public.warp_logs         enable row level security;
alter table public.signal_posts      enable row level security;
alter table public.admin_settings    enable row level security;

-- Users: read/update own row only
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- User preferences: read/write own row only
create policy "prefs_select_own" on public.user_preferences
  for select using (auth.uid() = user_id);
create policy "prefs_insert_own" on public.user_preferences
  for insert with check (auth.uid() = user_id);
create policy "prefs_update_own" on public.user_preferences
  for update using (auth.uid() = user_id);

-- Discoveries: read/write own rows only
create policy "discoveries_select_own" on public.discoveries
  for select using (auth.uid() = user_id);
create policy "discoveries_update_own" on public.discoveries
  for update using (auth.uid() = user_id);

-- Discoverable items: public read, no user write
create policy "items_select_public" on public.discoverable_items
  for select using (active = true);

-- Warp logs: insert only (anonymous), no read via RLS (server reads via service role)
create policy "warps_insert_anon" on public.warp_logs
  for insert with check (true);

-- Signal posts: public read for published posts
create policy "signals_select_published" on public.signal_posts
  for select using (published = true);

-- Admin settings: no user access (server reads via service role only)
