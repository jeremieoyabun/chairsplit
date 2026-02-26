import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabase } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { getPlanFromPriceId } from "@/lib/stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("shop_id")
    .eq("id", user.id)
    .single()

  if (!profile?.shop_id) return NextResponse.json({ error: "No shop" }, { status: 400 })

  const { data: shop } = await supabase
    .from("shops")
    .select("id, stripe_customer_id")
    .eq("id", profile.shop_id)
    .single()

  if (!shop?.stripe_customer_id) return NextResponse.json({ synced: false, reason: "no_customer" })

  try {
    const subs = await stripe.subscriptions.list({
      customer: shop.stripe_customer_id,
      status: "all",
      limit: 5,
    })

    const active = subs.data.find(s =>
      s.status === "active" || s.status === "trialing"
    )

    if (!active) return NextResponse.json({ synced: false, reason: "no_active_subscription" })

    const priceId = active.items.data[0]?.price.id ?? ""
    const plan = getPlanFromPriceId(priceId) ?? "starter"

    await supabaseAdmin
      .from("shops")
      .update({
        plan,
        plan_status: active.status,
        stripe_subscription_id: active.id,
      })
      .eq("id", shop.id)

    return NextResponse.json({ synced: true, plan, status: active.status })
  } catch (err: any) {
    console.error("[sync] Stripe error:", err?.message)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}
