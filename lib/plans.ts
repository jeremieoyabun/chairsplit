// Shared plan configuration (no secrets — safe to import in client components)

export const PLAN_LIMITS: Record<string, number> = {
  free: 0,
  starter: 5,
  pro: 15,
}

const YEARLY_DISCOUNT = 0.15 // 15% off

function yearlyPrice(monthly: number) {
  return Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT))
}

export const PLANS = {
  starter: {
    key: "starter" as const,
    name: "Starter Plan",
    monthlyPrice: 990,
    yearlyPrice: yearlyPrice(990), // 10 098 ฿/yr ≈ 841 ฿/mo
    limit: 5,
    description: "Essential operations for small barbershops.",
    features: [
      "For 1–5 barbers",
      "Visit logging",
      "Automatic commissions",
      "Basic dashboard",
      "Standard exports",
    ],
  },
  pro: {
    key: "pro" as const,
    name: "Pro Plan",
    monthlyPrice: 1990,
    yearlyPrice: yearlyPrice(1990), // 20 298 ฿/yr ≈ 1 691 ฿/mo
    limit: 15,
    popular: true,
    description: "Full operational control for busy barbershops.",
    features: [
      "For 6–15 barbers",
      "Everything in Starter",
      "Advanced dashboard",
      "Full data exports",
      "Priority support",
    ],
  },
}

// Keep backwards compat — components that read .price get monthly price
export type PlanKey = keyof typeof PLANS
