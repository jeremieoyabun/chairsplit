import { NextRequest, NextResponse } from "next/server"
import { stripe, getPlanFromPriceId } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import type Stripe from "stripe"

// Service-role client: bypasses RLS — safe for trusted server-side code only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateShopPlan(
  shopId: string,
  plan: string,
  planStatus: string,
  subscriptionId?: string
) {
  const patch: Record<string, string> = { plan, plan_status: planStatus }
  if (subscriptionId) patch.stripe_subscription_id = subscriptionId

  const { error } = await supabaseAdmin
    .from("shops")
    .update(patch)
    .eq("id", shopId)

  if (error) console.error("[webhook] updateShopPlan:", error.message)
}

async function getShopIdByCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("shops")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single()
  return data?.id ?? null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") ?? ""

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("[webhook] invalid signature:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== "subscription") break

      const shopId =
        session.metadata?.shop_id ||
        (await getShopIdByCustomer(session.customer as string))
      if (!shopId) break

      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = sub.items.data[0]?.price.id ?? ""
      const plan = getPlanFromPriceId(priceId) ?? "starter"
      await updateShopPlan(shopId, plan, sub.status, sub.id)
      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription
      const shopId =
        sub.metadata?.shop_id ||
        (await getShopIdByCustomer(sub.customer as string))
      if (!shopId) break

      const priceId = sub.items.data[0]?.price.id ?? ""
      const plan = getPlanFromPriceId(priceId) ?? "starter"
      await updateShopPlan(shopId, plan, sub.status, sub.id)
      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription
      const shopId =
        sub.metadata?.shop_id ||
        (await getShopIdByCustomer(sub.customer as string))
      if (!shopId) break

      await updateShopPlan(shopId, "free", "inactive")
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      const shopId = await getShopIdByCustomer(invoice.customer as string)
      if (!shopId) break
      // Mark as past_due — subscription.updated will also fire with status 'past_due'
      console.warn("[webhook] payment failed for shop:", shopId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
