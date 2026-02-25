import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { plan, billing = "monthly" } = await req.json()
  if (!plan) return NextResponse.json({ error: "Missing plan" }, { status: 400 })

  let priceId: string | undefined
  if (plan === "starter") {
    priceId = billing === "yearly"
      ? process.env.STRIPE_STARTER_YEARLY_PRICE_ID
      : process.env.STRIPE_STARTER_PRICE_ID
  } else if (plan === "pro") {
    priceId = billing === "yearly"
      ? process.env.STRIPE_PRO_YEARLY_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID
  }

  if (!priceId || priceId.startsWith("price_REPLACE")) {
    return NextResponse.json({ error: "Stripe price IDs not configured yet" }, { status: 500 })
  }

  // Get the user's shop
  const { data: profile } = await supabase
    .from("profiles")
    .select("shop_id")
    .eq("id", user.id)
    .single()

  if (!profile?.shop_id) return NextResponse.json({ error: "No shop found" }, { status: 400 })

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, stripe_customer_id")
    .eq("id", profile.shop_id)
    .single()

  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 400 })

  const origin = req.headers.get("origin") || "http://localhost:3000"

  // Reuse or create a Stripe customer for this shop
  let customerId: string = shop.stripe_customer_id ?? ""
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: shop.name,
      metadata: { shop_id: shop.id },
    })
    customerId = customer.id
    await supabase
      .from("shops")
      .update({ stripe_customer_id: customerId })
      .eq("id", shop.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/?stripe=success`,
    cancel_url: `${origin}/?stripe=canceled`,
    metadata: { shop_id: shop.id },
    subscription_data: {
      metadata: { shop_id: shop.id },
    },
  })

  return NextResponse.json({ url: session.url })
}
