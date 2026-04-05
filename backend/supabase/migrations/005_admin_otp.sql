-- Migration 005: Add OTP columns to users for passwordless login
alter table public.users 
add column if not exists otp_code text,
add column if not exists otp_expires_at timestamptz,
add column if not exists otp_last_sent_at timestamptz;

-- We can also make password optional if we want, but it's fine to keep it for now as a fallback if needed,
-- though the UI will only use OTP.
