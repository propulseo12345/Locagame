-- Add delivery/pickup people count to products and reservation_items
-- Used for weekend/holiday surcharge calculation: 47€ x nb_personnes per trip

ALTER TABLE products
ADD COLUMN IF NOT EXISTS delivery_people_count INTEGER NOT NULL DEFAULT 1 CHECK (delivery_people_count >= 1);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS pickup_people_count INTEGER NOT NULL DEFAULT 1 CHECK (pickup_people_count >= 1);

ALTER TABLE reservation_items
ADD COLUMN IF NOT EXISTS delivery_people_count INTEGER DEFAULT 1;

ALTER TABLE reservation_items
ADD COLUMN IF NOT EXISTS pickup_people_count INTEGER DEFAULT 1;
