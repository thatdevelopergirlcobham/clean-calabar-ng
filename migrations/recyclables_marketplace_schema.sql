-- ============================================
-- RECYCLABLES MARKETPLACE SCHEMA
-- ============================================
-- This schema creates tables for selling recyclable items (plastics, bottles, etc.)

-- 1. Create recyclables table
CREATE TABLE IF NOT EXISTS public.recyclables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- e.g., 'plastic', 'glass', 'metal', 'paper'
    bottle_size VARCHAR(50), -- e.g., '50cl', '60cl', '1 liter', '1.5 liter', '2 liter'
    quantity INTEGER NOT NULL DEFAULT 1,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
    image_url TEXT,
    location JSONB, -- {lat: number, lng: number}
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'sold', 'reserved', 'removed'
    is_negotiable BOOLEAN DEFAULT true,
    contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create recyclable_orders table (for tracking purchases)
CREATE TABLE IF NOT EXISTS public.recyclable_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recyclable_id UUID NOT NULL REFERENCES public.recyclables(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity_ordered INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    buyer_notes TEXT,
    seller_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recyclables_user_id ON public.recyclables(user_id);
CREATE INDEX IF NOT EXISTS idx_recyclables_status ON public.recyclables(status);
CREATE INDEX IF NOT EXISTS idx_recyclables_category ON public.recyclables(category);
CREATE INDEX IF NOT EXISTS idx_recyclables_created_at ON public.recyclables(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recyclable_orders_buyer_id ON public.recyclable_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_recyclable_orders_seller_id ON public.recyclable_orders(seller_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.recyclables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recyclable_orders ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for recyclables table

-- Anyone can view available recyclables
DROP POLICY IF EXISTS "Anyone can view available recyclables" ON public.recyclables;
CREATE POLICY "Anyone can view available recyclables"
ON public.recyclables FOR SELECT
USING (true);

-- Authenticated users can insert their own recyclables
DROP POLICY IF EXISTS "Users can insert own recyclables" ON public.recyclables;
CREATE POLICY "Users can insert own recyclables"
ON public.recyclables FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own recyclables
DROP POLICY IF EXISTS "Users can update own recyclables" ON public.recyclables;
CREATE POLICY "Users can update own recyclables"
ON public.recyclables FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own recyclables
DROP POLICY IF EXISTS "Users can delete own recyclables" ON public.recyclables;
CREATE POLICY "Users can delete own recyclables"
ON public.recyclables FOR DELETE
USING (auth.uid() = user_id);

-- 6. Create RLS Policies for recyclable_orders table

-- Users can view orders where they are buyer or seller
DROP POLICY IF EXISTS "Users can view their orders" ON public.recyclable_orders;
CREATE POLICY "Users can view their orders"
ON public.recyclable_orders FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Authenticated users can create orders
DROP POLICY IF EXISTS "Users can create orders" ON public.recyclable_orders;
CREATE POLICY "Users can create orders"
ON public.recyclable_orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Buyers and sellers can update their orders
DROP POLICY IF EXISTS "Users can update their orders" ON public.recyclable_orders;
CREATE POLICY "Users can update their orders"
ON public.recyclable_orders FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_recyclables_updated_at ON public.recyclables;
CREATE TRIGGER update_recyclables_updated_at
    BEFORE UPDATE ON public.recyclables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recyclable_orders_updated_at ON public.recyclable_orders;
CREATE TRIGGER update_recyclable_orders_updated_at
    BEFORE UPDATE ON public.recyclable_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Add comments for documentation
COMMENT ON TABLE public.recyclables IS 'Stores recyclable items listed for sale by users';
COMMENT ON TABLE public.recyclable_orders IS 'Tracks orders/purchases of recyclable items';
COMMENT ON COLUMN public.recyclables.bottle_size IS 'Size of plastic bottles: 50cl, 60cl, 1 liter, 1.5 liter, 2 liter, etc.';
COMMENT ON COLUMN public.recyclables.total_price IS 'Auto-calculated: quantity * price_per_unit';

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to insert sample data

/*
INSERT INTO public.recyclables (user_id, title, description, category, bottle_size, quantity, price_per_unit, image_url, status)
VALUES 
    (auth.uid(), 'Clean Plastic Bottles - 1 Liter', 'Clean and sorted 1 liter plastic bottles, perfect for recycling', 'plastic', '1 liter', 50, 5.00, 'https://example.com/bottles.jpg', 'available'),
    (auth.uid(), 'Coca-Cola Bottles - 60cl', 'Empty 60cl Coca-Cola bottles in good condition', 'plastic', '60cl', 100, 3.50, 'https://example.com/coke.jpg', 'available');
*/
