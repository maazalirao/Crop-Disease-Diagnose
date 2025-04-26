-- Create diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID,
  image_path TEXT NOT NULL,
  is_healthy BOOLEAN NOT NULL,
  disease_name TEXT,
  confidence_score NUMERIC NOT NULL,
  plant_type TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Create diagnosis_details table
CREATE TABLE IF NOT EXISTS diagnosis_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagnosis_id UUID NOT NULL REFERENCES diagnoses(id) ON DELETE CASCADE,
  symptoms TEXT[] DEFAULT '{}',
  treatment_options JSONB DEFAULT '[]',
  product_recommendations JSONB DEFAULT '[]',
  feedback_helpful BOOLEAN,
  feedback_comments TEXT
);

-- Enable realtime
alter publication supabase_realtime add table diagnoses;
alter publication supabase_realtime add table diagnosis_details;
