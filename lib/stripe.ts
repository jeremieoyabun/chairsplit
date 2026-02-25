import Stripe from "stripe"

// Server-only — do NOT import this in client components
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Map Stripe price IDs → plan keys (read at runtime so env vars are available)
export function getPlanFromPriceId(priceId: string): "starter" | "pro" | null {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "starter"
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro"
  return null
}
