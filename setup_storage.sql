-- Konfigirasyon Supabase Storage pou Foto Pwodui yo
-- Kouri script sa a nan Supabase SQL Editor ou a

-- 1. Kreye yon bucket (dosye) pou foto pwodui yo
-- ATANSYON: Sa a se yon operasyon SQL. Pou kreye bucket la, ou dwe ale nan:
-- Supabase Dashboard → Storage → "Create a new bucket"
-- Non bucket la: "product-images"
-- Public bucket: Wi (aktive)

-- Apre w kreye bucket la manyèlman, kouri kòd sa a pou konfigire policy yo:

-- 2. Pèmèt tout moun wè foto yo (public read)
CREATE POLICY "Allow public read access on product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 3. Pèmèt tout moun upload foto (public insert)
-- ATANSYON: Sa a se pou devlopman sèlman! Nan produksyon, limite aksè sa a.
CREATE POLICY "Allow public upload on product images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

-- 4. Pèmèt tout moun efase foto (public delete)
CREATE POLICY "Allow public delete on product images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'product-images');

-- 5. Pèmèt tout moun modifye foto (public update)
CREATE POLICY "Allow public update on product images"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- ENSTRIKSYON POU KREYE BUCKET LA:
-- 1. Ale nan Supabase Dashboard
-- 2. Klike sou "Storage" nan meni a gòch
-- 3. Klike sou bouton "New bucket"
-- 4. Antre non: "product-images"
-- 5. Aktive "Public bucket" (pou tout moun ka wè foto yo)
-- 6. Klike "Create bucket"
-- 7. Apre sa, retounen isit la epi kouri script sa a pou ajoute policy yo
