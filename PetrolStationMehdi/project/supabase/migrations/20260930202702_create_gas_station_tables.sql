/*
# Create gas station tables (single-tenant, no auth)

1. New Tables
- `fuel_prices` — current fuel types and prices per gallon
  - id (uuid, pk), name (text), grade (text), price_per_gallon (numeric), updated_at (timestamptz), color (text for UI accent)
- `reviews` — customer reviews/ratings
  - id (uuid, pk), author_name (text), rating (int 1-5), comment (text), created_at (timestamptz)
- `contact_messages` — messages from the contact form
  - id (uuid, pk), name (text), email (text), subject (text), message (text), created_at (timestamptz)
2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in screen).
3. Notes
- Single-tenant app with no login. Policies use TO anon, authenticated.
*/

CREATE TABLE IF NOT EXISTS fuel_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade text NOT NULL,
  price_per_gallon numeric(10,2) NOT NULL,
  color text NOT NULL DEFAULT '#10b981',
  updated_at timestamptz DEFAULT now()
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

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contact_messages" ON contact_messages;
CREATE POLICY "anon_select_contact_messages" ON contact_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contact_messages" ON contact_messages;
CREATE POLICY "anon_delete_contact_messages" ON contact_messages FOR DELETE
  TO anon, authenticated USING (true);
