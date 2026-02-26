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
ALTER TABLE shops ADD COLUMN IF NOT EXISTS line_pay_qr_url TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'inactive';
ALTER TABLE visits ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'line';
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

  // Now link the current user's profile to their shop
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ migration: "ok", link: "skipped - not logged in" })
  }

  // Find the shop (if any)
  const { data: shops } = await supabase.from("shops").select("id, name").limit(5)

  if (!shops || shops.length === 0) {
    return NextResponse.json({
      migration: "ok",
      link: "no shops found - create a shop first via the app",
      userId: user.id,
    })
  }

  // Link the first shop to the user's profile
  const shopId = shops[0].id
  await supabase.from("profiles").update({ shop_id: shopId }).eq("id", user.id)

  return NextResponse.json({
    migration: "ok",
    link: "ok",
    userId: user.id,
    shopId,
    shopName: shops[0].name,
    message: "Done! Reload the app.",
  })
}
