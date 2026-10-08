/*
# Add stock tracking, special offers, and fuel prices

1. Modified Tables
- `products`: add `stock` (integer, default null = unlimited) and `on_sale` (boolean, default false)
  and `sale_price` (numeric, nullable) for discounted pricing.
2. New Tables
- `fuel_prices`: daily fuel price board
  - id (uuid, primary key)
  - fuel_type (text, not null, e.g. "Diesel", "Petrol", "GPL")
  - price (numeric, not null)
  - unit (text, default "liter")
  - updated_at (timestamptz, default now())
3. Security
- RLS enabled on `fuel_prices` with anon+authenticated CRUD (single-tenant, no sign-in).
- Existing product policies already allow anon CRUD; new columns inherit those policies.
4. Notes
- `stock` null means unlimited/untracked (default for services and fuel).
- `on_sale` + `sale_price` let the owner mark products as on special offer.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock integer,
  ADD COLUMN IF NOT EXISTS on_sale boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sale_price numeric(10,2);

CREATE TABLE IF NOT EXISTS fuel_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fuel_type text NOT NULL,
  price numeric(10,2) NOT NULL,
  unit text DEFAULT 'liter',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_fuel_prices" ON fuel_prices;
CREATE POLICY "anon_select_fuel_prices" ON fuel_prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_fuel_prices" ON fuel_prices;
CREATE POLICY "anon_insert_fuel_prices" ON fuel_prices FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_fuel_prices" ON fuel_prices;
CREATE POLICY "anon_update_fuel_prices" ON fuel_prices FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_fuel_prices" ON fuel_prices;
CREATE POLICY "anon_delete_fuel_prices" ON fuel_prices FOR DELETE
  TO anon, authenticated USING (true);

INSERT INTO fuel_prices (fuel_type, price, unit) VALUES
  ('Diesel', 29.10, 'liter'),
  ('Petrol (Sans Plomb)', 42.80, 'liter'),
  ('GPL', 18.50, 'liter')
ON CONFLICT DO NOTHING;
