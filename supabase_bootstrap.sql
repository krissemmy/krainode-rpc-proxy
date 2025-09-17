-- KraiNode Supabase Bootstrap SQL
-- Run this in the Supabase SQL Editor to set up the database schema

-- Enable required extensions
create extension if not exists pgcrypto;

-- Create user_profiles table
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  username text unique,
  created_at timestamptz not null default now()
);

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Create api_requests table
create table if not exists public.api_requests (
  id bigserial primary key,
  request_id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null,
  chain text not null,
  network text not null,
  method text,
  status_code int,
  duration_ms integer,
  response_bytes integer,
  error_text text,
  params jsonb,
  created_at timestamptz not null default now()
);

-- Create indexes for performance
create index if not exists api_requests_user_time_idx on public.api_requests (user_id, created_at desc);
create index if not exists api_requests_chain_idx on public.api_requests (chain);
create index if not exists api_requests_network_idx on public.api_requests (network);
create index if not exists api_requests_method_idx on public.api_requests (method);
create index if not exists api_requests_params_gin on public.api_requests using gin (params);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;
alter table public.api_requests enable row level security;

-- Create RLS policies for user_profiles
create policy "profiles: owner can select" on public.user_profiles
for select using (id = auth.uid());

create policy "profiles: owner can update" on public.user_profiles
for update using (id = auth.uid());

-- Create RLS policies for api_requests
create policy "api_requests: owner can select" on public.api_requests
for select using (user_id = auth.uid());

-- Optional retention helper function
create or replace function public.delete_old_requests()
returns void language sql as $$
  delete from public.api_requests where created_at < now() - interval '90 days';
$$;
