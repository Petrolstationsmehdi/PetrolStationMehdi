/*
# Add RBAC: profiles table with admin role

1. New Tables
- `profiles`: one row per auth user, stores the role (admin or customer)
  - id (uuid, PK, references auth.users)
  - role (text: 'admin' or 'customer', default 'customer')
  - created_at (timestamptz)

2. Security
- RLS enabled on profiles.
- Each authenticated user can read their own profile row.
- The `role` column is NOT user-writable — it is set only by a SECURITY DEFINER
  function callable by admins, so a user cannot escalate themselves to admin.
- A helper function `is_admin()` checks the caller's role for use in other policies.

3. Modified Tables
- `products`: RLS policies updated so that anon + authenticated can SELECT (public catalog),
  but only admins can INSERT/UPDATE/DELETE. This protects admin API routes on the backend.
- `orders`: anon + authenticated can SELECT (order tracking by phone) and INSERT (place order),
  but only admins can UPDATE (change order status) or DELETE.
- `order_items`: same pattern — public read and insert, admin-only update/delete.

4. Important Notes
- The `is_admin()` function reads from `profiles` using `auth.uid()`, which is server-side
  and cannot be forged by the client.
- Admin role is assigned by another admin via the `set_user_role` SECURITY DEFINER function.
- The first admin must be seeded manually via execute_sql (see step 5 below).
- 5. Seeding: after creating the table, we insert a profile row for any existing auth user
  who should be admin. For the default setup, we create the table and function only —
  the app's first admin signs up, then is promoted via SQL or Supabase dashboard.
*/

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Each user can read their own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Users can insert their own profile row (created on signup)
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id AND role = 'customer');

-- Users cannot update their profile (role is locked down)
-- No UPDATE policy = no updates through the API

-- 2. is_admin() helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- 3. set_user_role() — admin-only function to promote/demote users
CREATE OR REPLACE FUNCTION set_user_role(p_user_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_role NOT IN ('admin', 'customer') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;
  INSERT INTO profiles (id, role) VALUES (p_user_id, p_role)
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
END;
$$;

REVOKE EXECUTE ON FUNCTION set_user_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION set_user_role(uuid, text) TO authenticated;

-- 4. Update products RLS: public read, admin-only write
-- Drop old policies
DROP POLICY IF EXISTS "anon_select_products" ON products;
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
DROP POLICY IF EXISTS "anon_delete_products" ON products;

-- Public can read available products
CREATE POLICY "public_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- Only admins can insert
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (is_admin());

-- Only admins can update
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Only admins can delete
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (is_admin());

-- 5. Update orders RLS: public read + insert, admin-only update + delete
DROP POLICY IF EXISTS "anon_select_orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "anon_update_orders" ON orders;
DROP POLICY IF EXISTS "anon_delete_orders" ON orders;

CREATE POLICY "public_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (is_admin());

-- 6. Update order_items RLS: public read + insert, admin-only update + delete
DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
DROP POLICY IF EXISTS "anon_update_order_items" ON order_items;
DROP POLICY IF EXISTS "anon_delete_order_items" ON order_items;

CREATE POLICY "public_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE POLICY "admin_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (is_admin());

-- 7. Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, role) VALUES (NEW.id, 'customer')
    ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
