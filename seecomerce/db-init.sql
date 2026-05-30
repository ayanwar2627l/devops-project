-- ==========================================
-- Database schema for SeeCommerce database
-- ==========================================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- ==========================================
-- Seed Initial Sample Catalog
-- ==========================================

INSERT INTO categories (name) VALUES 
('Electronics'), 
('Apparel'), 
('Books'), 
('Smart Home')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (category_id, name, description, price, stock_quantity) VALUES
(1, 'QuantumX Pro Smartphone', 'Next-gen silicon, crystal micro-OLED panel, 256GB storage.', 899.99, 45),
(1, 'HyperGlow ANC Headphones', 'Hi-Res certified audio, hybrid active noise canceling, 40h battery.', 199.99, 120),
(2, 'CloudWeave Breathable Hoodie', 'Engineered organic-bamboo fabric with anti-static threads.', 79.50, 80),
(3, 'The DevOps Handbook (Second Edition)', 'How to Create World-Class Agility, Reliability, and Security.', 34.99, 200),
(4, 'Lumina ambient Smart Light', 'Thread/Matter compatible organic HSL glowing orb lamp.', 59.99, 65)
ON CONFLICT DO NOTHING;
