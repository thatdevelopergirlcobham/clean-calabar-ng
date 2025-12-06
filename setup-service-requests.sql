-- Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE service_type AS ENUM ('cleaning', 'waste_pickup');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM ('standard', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table for service requests
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  status request_status DEFAULT 'pending',
  
  -- Common fields
  location JSONB, -- { lat, lng, address }
  service_date DATE,
  service_time TEXT, -- 'HH:MM' or 'urgent'
  urgency urgency_level DEFAULT 'standard',
  description TEXT,
  images TEXT[], -- Array of image URLs
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  
  -- Cleaning specific
  space_size TEXT, -- 'small', 'medium', 'large'
  
  -- Waste pickup specific
  waste_size TEXT, -- 'small_bin', 'large_bin', 'truck_load'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own requests" ON service_requests;
CREATE POLICY "Users can view their own requests"
  ON service_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create requests" ON service_requests;
CREATE POLICY "Users can create requests"
  ON service_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pending requests" ON service_requests;
CREATE POLICY "Users can update their own pending requests"
  ON service_requests FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Grant permissions
GRANT ALL ON service_requests TO authenticated;
