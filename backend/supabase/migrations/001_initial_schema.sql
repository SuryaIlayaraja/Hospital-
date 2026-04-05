-- Run this in Supabase SQL Editor (or via supabase db push) before starting the API.
-- Then set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend .env

-- Extensions
create extension if not exists "pgcrypto";

-- Departments (must exist before users FK)
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  serial_number int not null unique,
  department_name text not null unique,
  first_level jsonb not null default '{}',
  second_level jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- COO singleton row
create table if not exists public.coo (
  id uuid primary key default gen_random_uuid(),
  designation text not null default 'COO',
  name text not null default 'Chief Operating Officer',
  access text not null default 'All Departments',
  ward_access text not null default 'All Wards',
  email text default '',
  phone text default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Staff users (admin panel)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password text not null,
  role text not null check (role in ('COO', 'Supervisor')),
  department_id uuid references public.departments(id) on delete set null,
  department_name text,
  is_active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users(lower(email));

-- Floors
create table if not exists public.floors (
  id uuid primary key default gen_random_uuid(),
  floor_number text not null unique,
  floor_name text not null,
  description text default '',
  departments text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Doctors
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  studies text not null,
  image text default '',
  specialization text default '',
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Patients (OTP)
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  is_verified boolean not null default false,
  otp_hash text,
  otp_expires_at timestamptz,
  otp_last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tickets
create table if not exists public.tickets (
  id text primary key,
  title text not null,
  description text default '',
  severity text not null check (severity in ('low', 'medium', 'high')),
  department text not null,
  issue_category text not null,
  status text not null default 'open' check (status in ('open', 'in-progress', 'resolved')),
  patient_chat_token_hash text,
  patient_id uuid references public.patients(id) on delete set null,
  patient_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tickets_created on public.tickets(created_at desc);
create index if not exists idx_tickets_dept on public.tickets(department);

-- Chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null references public.tickets(id) on delete cascade,
  sender_type text not null check (sender_type in ('admin', 'patient')),
  sender_id text,
  message text default '',
  attachments jsonb default '[]',
  read_by jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_ticket on public.chat_messages(ticket_id, created_at);

-- Feedback: store full payload in jsonb + indexed columns for analytics
create table if not exists public.feedback_opd (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  overall_experience text not null,
  data jsonb not null default '{}'
);

create table if not exists public.feedback_ipd (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  overall_experience text not null,
  data jsonb not null default '{}'
);

create index if not exists idx_feedback_opd_ts on public.feedback_opd(timestamp);
create index if not exists idx_feedback_ipd_ts on public.feedback_ipd(timestamp);

-- RLS: service role bypasses; if you use anon key from browser, enable policies separately.
-- Backend uses service role only.
