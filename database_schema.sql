
-- Sa a se yon gid referans si ou vle itilize yon baz done SQL (MySQL, PostgreSQL)
-- olye de Firebase.

-- 1. TABLO PWODUI (Products)
-- Estoke tout atik ki nan boutik la.
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,         -- ID inik (eg: 'prod_123')
    name VARCHAR(255) NOT NULL,          -- Non pwodui a
    price DECIMAL(10, 2) NOT NULL,       -- Pri (eg: 1500.00)
    category VARCHAR(50) NOT NULL,       -- Kategori (Ebook, Electronic, Shop, Provisions)
    description TEXT,                    -- Deskripsyon detaye
    image TEXT,                          -- URL imaj la
    supplier_name VARCHAR(255),          -- Non founisè a (Dropshipping)
    supplier_contact VARCHAR(255),       -- Kontak founisè a (WhatsApp, Tel...)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLO KÒMAND (Orders)
-- Estoke enfòmasyon jeneral sou kòmand la ak kliyan an.
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,         -- ID kòmand la
    customer_name VARCHAR(255) NOT NULL, -- Non kliyan an
    address TEXT NOT NULL,               -- Adrès livrezon
    phone VARCHAR(50) NOT NULL,          -- Nimewo telefòn
    total_amount DECIMAL(10, 2) NOT NULL,-- Total kòmand la
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' -- pending, completed, cancelled
);

-- 3. TABLO DETAY KÒMAND (Order Items)
-- Sa a se yon "Join Table" ki konekte Pwodui ak Kòmand.
-- Li pèmèt yon kòmand genyen plizyè pwodui.
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL, -- Pri a nan moman acha a (si pri a chanje apre)
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 4. TABLO BANYÈ (Banner)
-- Estoke konfigirasyon banyè akèy la (nòmalman yon sèl ranje).
CREATE TABLE banners (
    id INT PRIMARY KEY DEFAULT 1,
    title TEXT,
    subtitle TEXT,
    promo_text TEXT,
    button_text TEXT,
    image TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mete yon banyè pa defo si li pa egziste
INSERT INTO banners (id, title, subtitle, promo_text, button_text, image)
VALUES (1, 'Pi bon kalite, pi bon pri!', 'Boutik Paw 2026', 'Plis pase 4,000 moun fè nou konfyans.', 'Kòmanse Achte', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- 5. TABLO KATEGORI (Categories)
-- Pou jere kategori yo yon fason dinamik.
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Done inisyal pou kategori
INSERT INTO categories (name) VALUES 
('Ebook'), 
('Electronic'), 
('Shop'), 
('Provisions')
ON CONFLICT (name) DO NOTHING;


-- EXEMPLE QUERY (Kijan pou w jwen done yo)

-- Jwenn tout pwodui nan kategori 'Electronic'
-- SELECT * FROM products WHERE category = 'Electronic';

-- Wè detay yon kòmand espesifik ak tout atik li yo
-- SELECT 
--    o.id as order_id, 
--    o.customer_name, 
--    p.name as product_name, 
--    oi.quantity, 
--    oi.price_at_purchase 
-- FROM orders o
-- JOIN order_items oi ON o.id = oi.order_id
-- JOIN products p ON oi.product_id = p.id
-- WHERE o.id = 'ID_KOMAND_LA';
