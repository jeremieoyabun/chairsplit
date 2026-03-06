import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

// Extract project ref from Supabase URL
// e.g. https://meucszkhqsylgkjbwvkz.supabase.co → meucszkhqsylgkjbwvkz
function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  return url.replace("https://", "").split(".")[0]
}

const MIGRATION_SQL = `
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS line_pay_qr_url TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'inactive';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'line';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS product_amount NUMERIC DEFAULT 0;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS product_commission_amount NUMERIC DEFAULT 0;
ALTER TABLE commission_rules ADD COLUMN IF NOT EXISTS product_rate INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL UNIQUE,
  subscription TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "push_own" ON push_subscriptions;
CREATE POLICY "push_own" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_select_own" ON shops;
CREATE POLICY "shop_select_own" ON shops
  FOR SELECT USING (id IN (SELECT shop_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "shop_update_own" ON shops;
CREATE POLICY "shop_update_own" ON shops
  FOR UPDATE USING (id IN (SELECT shop_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "shop_insert_own" ON shops;
CREATE POLICY "shop_insert_own" ON shops
  FOR INSERT WITH CHECK (true);

-- Helper function to get current user's shop_id without RLS recursion
CREATE OR REPLACE FUNCTION auth_user_shop_id() RETURNS UUID AS $$
  SELECT shop_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Visits: shop members can read, insert, update, delete visits in their shop
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "visits_shop_member" ON visits;
CREATE POLICY "visits_shop_member" ON visits
  FOR ALL USING (shop_id = auth_user_shop_id());

-- Visit services: accessible if the parent visit is in the user's shop
ALTER TABLE visit_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "visit_services_shop_member" ON visit_services;
CREATE POLICY "visit_services_shop_member" ON visit_services
  FOR ALL USING (visit_id IN (SELECT id FROM visits WHERE shop_id = auth_user_shop_id()));

-- Commission rules: shop members can manage rules in their shop
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "commission_rules_shop_member" ON commission_rules;
CREATE POLICY "commission_rules_shop_member" ON commission_rules
  FOR ALL USING (shop_id = auth_user_shop_id());

-- Services: shop members can manage services in their shop
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_shop_member" ON services;
CREATE POLICY "services_shop_member" ON services
  FOR ALL USING (shop_id = auth_user_shop_id());

-- Clients: shop members can manage clients in their shop
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_shop_member" ON clients;
CREATE POLICY "clients_shop_member" ON clients
  FOR ALL USING (shop_id = auth_user_shop_id());

-- Expenses: shop members can manage expenses in their shop
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expenses_shop_member" ON expenses;
CREATE POLICY "expenses_shop_member" ON expenses
  FOR ALL USING (shop_id = auth_user_shop_id());

-- Notifications: users can manage their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_insert_shop" ON notifications;
CREATE POLICY "notifications_insert_shop" ON notifications
  FOR INSERT WITH CHECK (true);

-- Allow users to see profiles of people in the same shop
DROP POLICY IF EXISTS "profiles_same_shop" ON profiles;
CREATE POLICY "profiles_same_shop" ON profiles
  FOR SELECT USING (shop_id = auth_user_shop_id());

-- Allow users to update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Allow insert for new signups (trigger creates profile)
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Products: physical items for sale (shampoo, wax, drinks...)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  icon TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_shop_member" ON products;
CREATE POLICY "products_shop_member" ON products
  FOR ALL USING (shop_id = auth_user_shop_id());

-- Visit products: products sold during a visit
CREATE TABLE IF NOT EXISTS visit_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1
);
ALTER TABLE visit_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "visit_products_shop_member" ON visit_products;
CREATE POLICY "visit_products_shop_member" ON visit_products
  FOR ALL USING (visit_id IN (SELECT id FROM visits WHERE shop_id = auth_user_shop_id()));

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'barber',
  commission_rate INTEGER DEFAULT 30,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invitations_shop_member" ON invitations;
CREATE POLICY "invitations_shop_member" ON invitations
  FOR ALL USING (shop_id IN (SELECT shop_id FROM profiles WHERE id = auth.uid()));
DROP POLICY IF EXISTS "invitations_by_email" ON invitations;
CREATE POLICY "invitations_by_email" ON invitations
  FOR SELECT USING (lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())));
`

export async function GET(req: NextRequest) {
  // Simple secret check to avoid public access
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized. Add ?secret=YOUR_ADMIN_SETUP_SECRET" }, { status: 401 })
  }

  const managementToken = process.env.SUPABASE_MANAGEMENT_TOKEN
  if (!managementToken) {
    return NextResponse.json({
      error: "SUPABASE_MANAGEMENT_TOKEN not set",
      instructions: "Option 1: Add SUPABASE_MANAGEMENT_TOKEN to env vars (get it from https://supabase.com/dashboard/account/tokens)\nOption 2: Copy the SQL below and run it in Supabase Dashboard → SQL Editor",
      sql: MIGRATION_SQL,
    }, { status: 500 })
  }

  const projectRef = getProjectRef()

  // Run migration via Supabase Management API
  const sqlRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${managementToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: MIGRATION_SQL }),
  })

  if (!sqlRes.ok) {
    const err = await sqlRes.text()
    return NextResponse.json({ error: "Migration failed", details: err }, { status: 500 })
  }

  // Use admin client (service role) for linking — bypasses RLS and session
  const { createClient } = await import("@supabase/supabase-js")
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create avatars storage bucket (idempotent)
  await admin.storage.createBucket("avatars", { public: true, allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"], fileSizeLimit: 2 * 1024 * 1024 }).catch(() => {})

  // userId can be passed as query param, or we try to get from session
  let userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  }

  if (!userId) {
    return NextResponse.json({
      migration: "ok",
      link: "skipped",
      hint: "Add &userId=YOUR_USER_ID to the URL",
    })
  }

  // Diagnostic: show current state
  const { data: shops } = await admin.from("shops").select("id, name").limit(10)
  const { data: profile } = await admin.from("profiles").select("id, shop_id, full_name, role").eq("id", userId).single()

  if (!shops || shops.length === 0) {
    // No shop exists — create one automatically
    const { data: newShop, error: createErr } = await admin
      .from("shops")
      .insert({ name: "Mon Salon", currency: "thb" })
      .select("id, name")
      .single()

    if (createErr || !newShop) {
      return NextResponse.json({ migration: "ok", link: "failed to create shop", error: createErr?.message, profile })
    }

    const { error: linkErr } = await admin
      .from("profiles")
      .update({ shop_id: newShop.id })
      .eq("id", userId)

    return NextResponse.json({
      migration: "ok",
      link: linkErr ? "link failed: " + linkErr.message : "ok",
      shopCreated: true,
      shopId: newShop.id,
      shopName: newShop.name,
      profile,
      message: linkErr ? "Shop created but link failed" : "Done! Reload the app.",
    })
  }

  // Shop(s) exist — link the first one
  const shopId = shops[0].id
  const { error: linkErr } = await admin
    .from("profiles")
    .update({ shop_id: shopId })
    .eq("id", userId)

  // Verify the update worked
  const { data: updatedProfile } = await admin.from("profiles").select("id, shop_id").eq("id", userId).single()

  return NextResponse.json({
    migration: "ok",
    link: linkErr ? "failed: " + linkErr.message : "ok",
    shopId,
    shopName: shops[0].name,
    allShops: shops,
    profileBefore: profile,
    profileAfter: updatedProfile,
    message: linkErr ? "Link failed" : "Done! Reload the app.",
  })
}
