
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
);

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
