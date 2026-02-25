import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
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
    .select("stripe_customer_id")
    .eq("id", profile.shop_id)
    .single()

  if (!shop?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer — subscribe first" }, { status: 400 })
  }

  const origin = req.headers.get("origin") || "http://localhost:3000"

  const session = await stripe.billingPortal.sessions.create({
    customer: shop.stripe_customer_id,
    return_url: `${origin}/`,
  })

  return NextResponse.json({ url: session.url })
}
