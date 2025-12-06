-- Create the service_requests table if it doesn't exist
create table if not exists public.service_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  service_type text not null check (service_type in ('cleaning', 'waste_pickup')),
  location jsonb not null,
  service_date date not null,
  service_time text not null,
  urgency text not null check (urgency in ('standard', 'urgent')),
  description text not null,
  images text[] default array[]::text[],
  contact_phone text not null,
  contact_email text not null,
  notes text,
  space_size text,
  waste_size text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'resolved', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.service_requests enable row level security;

-- Create policies
-- 1. Users can view their own requests
create policy "Users can view their own service requests"
  on public.service_requests for select
  using (auth.uid() = user_id);

-- 2. Users can insert their own requests
create policy "Users can insert their own service requests"
  on public.service_requests for insert
  with check (auth.uid() = user_id);

-- 3. Users can update their own requests (optional, e.g. to cancel)
create policy "Users can update their own service requests"
  on public.service_requests for update
  using (auth.uid() = user_id);

-- 4. Admins/Agents can view all requests (assuming you have a way to identify them, e.g. via a profile table or claim)
-- For now, we'll keep it simple. If you have an admin role, you might add:
-- create policy "Admins can view all requests" on public.service_requests for select using ( exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin') );
