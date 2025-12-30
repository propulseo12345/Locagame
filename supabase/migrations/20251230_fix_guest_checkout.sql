/*
  # Fix Guest Checkout + Pickup Mode Support

  ## Problem
  - RLS policies only allow authenticated users
  - Foreign key constraint requires customers.id to exist in auth.users
  - Guest checkout cannot create customers or reservations
  - No support for customer pickup at warehouse

  ## Solution
  1. Drop the foreign key constraint on customers.id
  2. Add 'is_guest' column to identify guest customers
  3. Add RLS policies for anonymous users
  4. Add pickup_time and return_time columns to reservations
  5. Add client_pickup and client_return task types
*/

-- ============================================
-- 1. CUSTOMERS TABLE - Support Guest Customers
-- ============================================

-- Drop the foreign key constraint to auth.users
ALTER TABLE customers
  DROP CONSTRAINT IF EXISTS customers_id_fkey;

-- Add is_guest column to distinguish guest vs authenticated customers
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS is_guest boolean DEFAULT false;

-- Allow anonymous users to check if email exists (for guest checkout flow)
CREATE POLICY "Allow anon to check customer email"
  ON customers FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to create guest customers
CREATE POLICY "Allow anon to create guest customers"
  ON customers FOR INSERT
  TO anon
  WITH CHECK (is_guest = true);

-- ============================================
-- 2. ADDRESSES TABLE - Support Guest Addresses
-- ============================================

-- Allow anonymous users to create addresses (for guest checkout)
CREATE POLICY "Allow anon to create addresses"
  ON addresses FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read their addresses (needed for reservation creation)
CREATE POLICY "Allow anon to read addresses"
  ON addresses FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- 3. RESERVATIONS TABLE - Support Guest Reservations
-- ============================================

-- Allow anonymous users to create reservations
CREATE POLICY "Allow anon to create reservations"
  ON reservations FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read their reservations (for confirmation page)
CREATE POLICY "Allow anon to read reservations"
  ON reservations FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- 4. RESERVATION_ITEMS TABLE - Support Guest Items
-- ============================================

-- Allow anonymous users to create reservation items
CREATE POLICY "Allow anon to create reservation items"
  ON reservation_items FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read reservation items
CREATE POLICY "Allow anon to read reservation items"
  ON reservation_items FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- 5. PRODUCT_AVAILABILITY TABLE - Support Blocking Stock
-- ============================================

-- Allow anonymous users to create availability blocks (when reserving)
CREATE POLICY "Allow anon to create availability blocks"
  ON product_availability FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================
-- 6. ADMIN ACCESS - Allow admins to manage all customers
-- ============================================

-- Allow admins to view all customers (including guests)
CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Allow admins to update all customers
CREATE POLICY "Admins can update all customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Allow admins to delete customers
CREATE POLICY "Admins can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- ============================================
-- 7. ADMIN ACCESS - Allow admins to manage reservations
-- ============================================

-- Allow admins to view all reservations
CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Allow admins to update reservations
CREATE POLICY "Admins can update all reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Allow admins to delete reservations
CREATE POLICY "Admins can delete reservations"
  ON reservations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- ============================================
-- 8. ADMIN ACCESS - Allow admins to manage addresses
-- ============================================

-- Allow admins to view all addresses
CREATE POLICY "Admins can view all addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Allow admins to manage all addresses
CREATE POLICY "Admins can manage all addresses"
  ON addresses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- ============================================
-- 9. ADMIN ACCESS - Allow admins to manage product availability
-- ============================================

-- Allow admins to manage product availability
CREATE POLICY "Admins can manage product availability"
  ON product_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- ============================================
-- 10. ADMIN ACCESS - Allow admins to manage reservation items
-- ============================================

-- Allow admins to view all reservation items
CREATE POLICY "Admins can view all reservation items"
  ON reservation_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- Allow admins to manage all reservation items
CREATE POLICY "Admins can manage all reservation items"
  ON reservation_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- ============================================
-- 11. RESERVATIONS TABLE - Add Pickup Columns
-- ============================================

-- Add columns for pickup mode
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_time TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS return_time TEXT;

-- ============================================
-- 12. DELIVERY_TASKS TABLE - Add Client Task Types
-- ============================================

-- Update constraint to allow client_pickup and client_return types
ALTER TABLE delivery_tasks DROP CONSTRAINT IF EXISTS delivery_tasks_type_check;
ALTER TABLE delivery_tasks ADD CONSTRAINT delivery_tasks_type_check
  CHECK (type IN ('delivery', 'pickup', 'client_pickup', 'client_return'));
