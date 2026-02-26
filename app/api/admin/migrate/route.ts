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
ALTER TABLE visits ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'line';

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
      instructions: "1. Go to https://supabase.com/dashboard/account/tokens\n2. Create a new token\n3. Add SUPABASE_MANAGEMENT_TOKEN=your_token to .env.local\n4. Restart dev server"
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
