import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const priceIds = {
    STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID,
    STRIPE_STARTER_YEARLY_PRICE_ID: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    STRIPE_PRO_YEARLY_PRICE_ID: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  }

  const results: Record<string, any> = {}
  for (const [key, id] of Object.entries(priceIds)) {
    if (!id) { results[key] = "NOT SET"; continue }
    try {
      const price = await stripe.prices.retrieve(id)
      results[key] = {
        id,
        currency: price.currency,
        amount: price.unit_amount,
        interval: (price.recurring as any)?.interval,
        active: price.active,
        ok: true,
      }
    } catch (err: any) {
      results[key] = { id, error: err.message, ok: false }
    }
  }

  // Also list what actually exists in this Stripe account (test mode)
  let existingPrices: any[] = []
  try {
    const list = await stripe.prices.list({ limit: 10, active: true })
    existingPrices = list.data.map(p => ({
      id: p.id,
      amount: p.unit_amount,
      currency: p.currency,
      interval: (p.recurring as any)?.interval,
      product: p.product,
    }))
  } catch (err: any) {
    existingPrices = [{ error: err.message }]
  }

  return NextResponse.json({ configured: results, existingInStripe: existingPrices })
}
