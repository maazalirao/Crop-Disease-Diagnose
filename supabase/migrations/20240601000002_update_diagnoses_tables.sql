-- Ensure diagnoses table exists with proper structure
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID,
  image_path TEXT NOT NULL,
  is_healthy BOOLEAN NOT NULL,
  disease_name TEXT,
  confidence_score INTEGER NOT NULL,
  plant_type TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Ensure diagnosis_details table exists with proper structure
CREATE TABLE IF NOT EXISTS public.diagnosis_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_id UUID NOT NULL REFERENCES public.diagnoses(id) ON DELETE CASCADE,
  symptoms TEXT[] DEFAULT '{}',
  treatment_options JSONB DEFAULT '[]',
  product_recommendations JSONB DEFAULT '[]',
  feedback_helpful BOOLEAN,
  feedback_comments TEXT
);

-- Enable row level security
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_details ENABLE ROW LEVEL SECURITY;

-- Create policies for diagnoses table
DROP POLICY IF EXISTS "Public access to diagnoses" ON public.diagnoses;
CREATE POLICY "Public access to diagnoses" ON public.diagnoses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert access to diagnoses" ON public.diagnoses;
CREATE POLICY "Insert access to diagnoses" ON public.diagnoses
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update access to diagnoses" ON public.diagnoses;
CREATE POLICY "Update access to diagnoses" ON public.diagnoses
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Delete access to diagnoses" ON public.diagnoses;
CREATE POLICY "Delete access to diagnoses" ON public.diagnoses
  FOR DELETE USING (true);

-- Create policies for diagnosis_details table
DROP POLICY IF EXISTS "Public access to diagnosis_details" ON public.diagnosis_details;
CREATE POLICY "Public access to diagnosis_details" ON public.diagnosis_details
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert access to diagnosis_details" ON public.diagnosis_details;
CREATE POLICY "Insert access to diagnosis_details" ON public.diagnosis_details
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update access to diagnosis_details" ON public.diagnosis_details;
CREATE POLICY "Update access to diagnosis_details" ON public.diagnosis_details
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Delete access to diagnosis_details" ON public.diagnosis_details;
CREATE POLICY "Delete access to diagnosis_details" ON public.diagnosis_details
  FOR DELETE USING (true);

-- Enable realtime for these tables
alter publication supabase_realtime add table public.diagnoses;
alter publication supabase_realtime add table public.diagnosis_details;
