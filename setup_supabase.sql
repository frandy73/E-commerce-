-- Kreye tablo pwodui yo nan Supabase
-- Kouri script sa a nan Supabase SQL Editor ou a

-- 1. Kreye tablo pwodui yo
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Aktive Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 3. Kreye policy pou pèmèt tout moun li pwodui yo (public read)
CREATE POLICY "Allow public read access"
ON products
FOR SELECT
TO public
USING (true);

-- 4. Kreye policy pou pèmèt tout moun ajoute pwodui (public insert)
-- ATANSYON: Sa a se pou devlopman sèlman! Nan produksyon, ou ta dwe limite sa.
CREATE POLICY "Allow public insert access"
ON products
FOR INSERT
TO public
WITH CHECK (true);

-- 5. Kreye policy pou pèmèt tout moun modifye pwodui (public update)
CREATE POLICY "Allow public update access"
ON products
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 6. Kreye policy pou pèmèt tout moun efase pwodui (public delete)
CREATE POLICY "Allow public delete access"
ON products
FOR DELETE
TO public
USING (true);

-- 7. Aktive Realtime pou tablo sa a
-- Ale nan Supabase Dashboard > Database > Replication
-- Epi aktive "products" nan lis tablo yo

-- 8. Verifye tablo a kreye kòrèkteman
SELECT * FROM products;
