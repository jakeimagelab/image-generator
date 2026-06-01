create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  hospital_name text not null,
  manager_name text not null,
  phone text not null,
  email text not null,
  website_url text,
  hospital_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.image_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  image_types text[] not null default '{}',
  mood_types text[] not null default '{}',
  space_tone text,
  target_patient text,
  concern_text text,
  reference_url text,
  generated_prompt text,
  created_at timestamptz not null default now()
);

create table if not exists public.uploaded_references (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.image_requests(id) on delete cascade,
  image_url text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.generated_images (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.image_requests(id) on delete cascade,
  image_url text not null,
  variation_no integer not null,
  image_category text,
  created_at timestamptz not null default now()
);

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.image_requests(id) on delete set null,
  desired_schedule text not null,
  budget_range text not null,
  shooting_scope text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists image_requests_lead_id_idx on public.image_requests(lead_id);
create index if not exists generated_images_request_id_idx on public.generated_images(request_id);
create index if not exists consultations_request_id_idx on public.consultations(request_id);

-- Storage bucket name expected by .env.example:
-- photoclinic-references
-- Create it as a public bucket in Supabase Storage, or keep it private and replace getPublicUrl usage with signed URLs.
