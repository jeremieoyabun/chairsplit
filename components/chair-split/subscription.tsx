"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PLANS, PLAN_LIMITS } from "@/lib/plans"

type ShopSub = {
  plan: string
  plan_status: string
  stripe_customer_id: string | null
  barber_count: number
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR")
}

const PLAN_STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Payment issue",
  canceled: "Canceled",
  inactive: "Inactive",
}

type Billing = "monthly" | "yearly"

export function Subscription({ onBack }: { onBack: () => void }) {
  const [sub, setSub] = useState<ShopSub | null>(null)
  const [loading, setLoading] = useState(true)
  const [billing, setBilling] = useState<Billing>("monthly")
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [managingPortal, setManagingPortal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single()

      if (!profile?.shop_id) { setLoading(false); return }

      const { data: shop, error: shopErr } = await supabase
        .from("shops")
        .select("plan, plan_status, stripe_customer_id")
        .eq("id", profile.shop_id)
        .single()

      if (shopErr) { console.error("[Subscription] shop:", shopErr.message); setLoading(false); return }

      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", profile.shop_id)
        .eq("role", "barber")

      setSub({
        plan: shop.plan ?? "free",
        plan_status: shop.plan_status ?? "inactive",
        stripe_customer_id: shop.stripe_customer_id ?? null,
        barber_count: count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const handleSubscribe = async (planKey: "starter" | "pro") => {
    setError(null)
    setSubscribing(planKey)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billing }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        setError(json.error ?? "Checkout failed")
        setSubscribing(null)
        return
      }
      window.location.href = json.url
    } catch {
      setError("Network error. Please try again.")
      setSubscribing(null)
    }
  }

  const handleManage = async () => {
    setError(null)
    setManagingPortal(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const json = await res.json()
      if (!res.ok || !json.url) {
        setError(json.error ?? "Portal error")
        setManagingPortal(false)
        return
      }
      window.location.href = json.url
    } catch {
      setError("Network error. Please try again.")
      setManagingPortal(false)
    }
  }

  const currentPlan = sub?.plan ?? "free"
  const isActive = sub?.plan_status === "active" || sub?.plan_status === "trialing"
  const planLimit = PLAN_LIMITS[currentPlan] ?? 0

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-[#111113]" />
        </button>
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">
          Subscription
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">

        {/* Current plan banner */}
        {!loading && (
          <div className="mx-5 mt-4">
            <div className="relative rounded-[24px] bg-[#111113] p-6 overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]"
                style={{ backgroundColor: isActive ? "#16A34A" : "#6B7280" }}
              />
              <div className="flex items-start justify-between">
                <span className="text-[24px] font-bold text-[#FFFFFF] capitalize">
                  {currentPlan === "free" ? "No plan" : currentPlan}
                </span>
                <span
                  className="text-[11px] font-semibold px-3 py-1 rounded-full"
                  style={{
                    color: isActive ? "#16A34A" : "#9CA3AF",
                    backgroundColor: isActive
                      ? "rgba(22,163,74,0.15)"
                      : "rgba(156,163,175,0.15)",
                  }}
                >
                  {PLAN_STATUS_LABEL[sub?.plan_status ?? "inactive"] ?? "—"}
                </span>
              </div>

              {currentPlan !== "free" && (
                <p className="text-[14px] text-[#9CA3AF] mt-2">
                  {`${fmt(PLANS[currentPlan as keyof typeof PLANS]?.monthlyPrice ?? 0)} ฿/month`}
                </p>
              )}

              <p className="text-[13px] text-[#6B7280] mt-1">
                {"Barbers: "}
                <span className="text-[#FFFFFF] font-bold">{sub?.barber_count ?? 0}</span>
                {" / "}
                {currentPlan === "free" ? "0" : planLimit}
              </p>

              {sub?.stripe_customer_id && isActive && (
                <button
                  type="button"
                  onClick={handleManage}
                  disabled={managingPortal}
                  className="w-full mt-4 rounded-[12px] bg-[#FFFFFF] py-3.5 text-center text-[14px] font-semibold text-[#111113] active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {managingPortal ? "Opening…" : "Manage subscription →"}
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="text-[12px] text-red-500 text-center mt-3 px-5">{error}</p>
        )}

        {/* Monthly / Yearly toggle */}
        <div className="mx-5 mt-6">
          <div className="flex rounded-[12px] bg-[#F3F4F6] p-1">
            {(["monthly", "yearly"] as Billing[]).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBilling(b)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all ${
                  billing === b
                    ? "bg-[#FFFFFF] text-[#111113] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "text-[#9CA3AF]"
                }`}
              >
                {b === "monthly" ? "Monthly" : "Yearly"}
                {b === "yearly" && (
                  <span className="text-[10px] font-bold text-[#16A34A] bg-[#ECFDF5] px-1.5 py-0.5 rounded-full leading-none">
                    -15%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="px-5 mt-4">
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-4">
            Plans
          </p>

          <div className="flex gap-3">
            {(Object.values(PLANS) as typeof PLANS[keyof typeof PLANS][]).map((plan) => {
              const isCurrent = currentPlan === plan.key && isActive
              const displayPrice =
                billing === "yearly"
                  ? Math.round(plan.yearlyPrice / 12)
                  : plan.monthlyPrice

              return (
                <div
                  key={plan.key}
                  className="flex-1 rounded-[20px] overflow-hidden relative"
                  style={{
                    backgroundColor: "popular" in plan && plan.popular ? "#F3F4F6" : "#FFFFFF",
                    border: isCurrent ? "2px solid #1A1A1A" : "2px solid transparent",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  {"popular" in plan && plan.popular && (
                    <div className="absolute top-0 right-0 bg-[#1A1A1A] px-3 py-1.5 rounded-bl-[12px] rounded-tr-[18px]">
                      <span className="text-[9px] font-bold text-[#FFFFFF] tracking-[0.08em] uppercase">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-4 pt-5 flex flex-col h-full">
                    <span className="text-[15px] font-bold text-[#111113]">{plan.name}</span>

                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-[26px] font-bold text-[#111113] leading-none">
                        {fmt(displayPrice)}
                      </span>
                      <span className="text-[13px] text-[#9CA3AF]">฿/mo</span>
                    </div>

                    {billing === "yearly" && (
                      <p className="text-[10px] text-[#16A34A] font-medium mt-0.5">
                        {fmt(plan.yearlyPrice)} ฿/yr billed annually
                      </p>
                    )}

                    <p className="text-[12px] text-[#6B7280] mt-2 leading-relaxed">
                      {plan.description}
                    </p>

                    <div className="flex flex-col gap-1.5 mt-4 flex-1">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#111113] mt-0.5 shrink-0" strokeWidth={2.5} />
                          <span className="text-[11px] text-[#374151] leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => !isCurrent && handleSubscribe(plan.key)}
                      disabled={isCurrent || subscribing === plan.key}
                      className="w-full mt-4 rounded-[12px] py-3 flex items-center justify-center gap-2 text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                      style={{ backgroundColor: "#1A1A1A", color: "#FFFFFF" }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                      {subscribing === plan.key
                        ? "Opening…"
                        : isCurrent
                        ? "Current"
                        : billing === "yearly"
                        ? "Start & Save 15%"
                        : "Start Free"}
                    </button>

                    <p className="text-[10px] text-[#9CA3AF] text-center mt-2 italic">
                      *No commitment – cancel anytime*
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-5 mt-6">
          <p className="text-[12px] text-[#9CA3AF] text-center leading-relaxed">
            Payments processed securely by Stripe. Prices in Thai Baht (THB).
          </p>
        </div>
      </div>
    </div>
  )
}
