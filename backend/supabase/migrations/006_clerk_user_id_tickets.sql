-- Optional: associate raised tickets with Clerk user id (frontend passes clerkUserId on create)
alter table public.tickets
  add column if not exists clerk_user_id text;
