-- Run these statements in Supabase SQL Editor (https://app.supabase.com)

-- Brands
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Models
CREATE TABLE IF NOT EXISTS public.models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  model_number text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(brand_id, name)
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tags
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Error codes
CREATE TABLE IF NOT EXISTS public.error_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text,
  model text,
  code text,
  meaning text,
  solution text,
  raw jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(brand, model, code)
);

-- User roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Diagnostic photos
CREATE TABLE IF NOT EXISTS public.diagnostic_photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  storage_path text,
  ai_analysis text,
  created_at timestamptz DEFAULT now()
);

-- Equipment (if not exists)
CREATE TABLE IF NOT EXISTS public.equipment (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  qr_code text,
  system_name text,
  model text,
  serial_number text,
  installation_date date,
  location text,
  notes text,
  image_path text,
  created_at timestamptz DEFAULT now()
);

-- Service history
CREATE TABLE IF NOT EXISTS public.service_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  system_name text,
  error_code text,
  repair_date date,
  parts_replaced jsonb,
  labor_hours numeric,
  total_cost numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- App logs: persisted application logs
CREATE TABLE IF NOT EXISTS public.app_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL,
  message text NOT NULL,
  ts bigint NOT NULL,
  stack text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert logs"
  ON public.app_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view logs"
  ON public.app_logs FOR SELECT
  USING (true);
