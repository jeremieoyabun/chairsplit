import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST() {
  const serverSupabase = await createServerSupabase()
  const { data: { user } } = await serverSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: profile } = await serverSupabase
    .from("profiles")
    .select("shop_id")
    .eq("id", user.id)
    .single()

  if (!profile?.shop_id) return NextResponse.json({ expired: false })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: shop } = await admin
    .from("shops")
    .select("plan_status, trial_ends_at")
    .eq("id", profile.shop_id)
    .single()

  if (!shop || shop.plan_status !== "trialing" || !shop.trial_ends_at) {
    return NextResponse.json({ expired: false })
  }

  if (new Date(shop.trial_ends_at).getTime() < Date.now()) {
    await admin
      .from("shops")
      .update({ plan: "free", plan_status: "inactive" })
      .eq("id", profile.shop_id)

    return NextResponse.json({ expired: true })
  }

  return NextResponse.json({ expired: false })
}
