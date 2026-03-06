"use client"

import { useEffect, useState } from "react"
import { Check, Users, Scissors, ClipboardList, ChevronRight, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"
import { trialStatus } from "@/lib/trial"

type StepStatus = { barbers: boolean; visits: boolean }

const STEPS = [
  {
    key: "shop" as const,
    label: "Create your shop",
    desc: "Your shop is set up and ready to go.",
    icon: Sparkles,
    always: true,
  },
  {
    key: "barber" as const,
    label: "Add your first barber",
    desc: "Invite a barber to start tracking commissions.",
    icon: Users,
    always: false,
  },
  {
    key: "services" as const,
    label: "Customize your services",
    desc: "Edit prices and add services your shop offers.",
    icon: Scissors,
    always: false,
  },
  {
    key: "visit" as const,
    label: "Log your first visit",
    desc: "Record a client visit to see the dashboard in action.",
    icon: ClipboardList,
    always: false,
  },
]

export function Onboarding({
  onComplete,
  onAddBarber,
  onCustomizeServices,
  onLogVisit,
}: {
  onComplete: () => void
  onAddBarber: () => void
  onCustomizeServices: () => void
  onLogVisit: () => void
}) {
  const [status, setStatus] = useState<StepStatus>({ barbers: false, visits: false })
  const [trialDays, setTrialDays] = useState(14)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const shop = await getShop()
      if (!shop) { setLoading(false); return }

      const supabase = createClient()

      const [barberRes, visitRes, shopRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("shop_id", shop.shopId)
          .eq("role", "barber"),
        supabase
          .from("visits")
          .select("id", { count: "exact", head: true })
          .eq("shop_id", shop.shopId),
        supabase
          .from("shops")
          .select("plan_status, trial_ends_at")
          .eq("id", shop.shopId)
          .single(),
      ])

      setStatus({
        barbers: (barberRes.count ?? 0) > 0,
        visits: (visitRes.count ?? 0) > 0,
      })

      if (shopRes.data) {
        const trial = trialStatus(shopRes.data.trial_ends_at, shopRes.data.plan_status)
        if (trial) setTrialDays(trial.daysLeft)
      }

      setLoading(false)
    }
    load()
  }, [])

  const isStepDone = (key: string) => {
    if (key === "shop") return true
    if (key === "barber") return status.barbers
    if (key === "services") return false // always available to customize
    if (key === "visit") return status.visits
    return false
  }

  const completedCount = 1 + (status.barbers ? 1 : 0) + (status.visits ? 1 : 0)
  const totalSteps = 4

  const handleStepPress = (key: string) => {
    if (key === "barber") onAddBarber()
    else if (key === "services") onCustomizeServices()
    else if (key === "visit") onLogVisit()
  }

  const handleSkip = () => {
    localStorage.setItem("cs_onboarding_done", "true")
    onComplete()
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-full px-5 pt-8 animate-pulse">
        <div className="h-8 w-48 bg-[#E5E7EB] rounded-full" />
        <div className="h-4 w-64 bg-[#E5E7EB] rounded-full mt-3" />
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[76px] bg-[#E5E7EB] rounded-[16px]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-10">
      {/* Header */}
      <div className="px-5 pt-8 pb-2">
        <h1 className="text-[24px] font-bold text-[#111113] leading-tight">
          Welcome! Let&apos;s set up<br />your shop
        </h1>
        <p className="text-[14px] text-[#9CA3AF] mt-2">
          Complete these steps to get the most out of ChairSplit.
        </p>
      </div>

      {/* Trial pill */}
      <div className="px-5 mt-3">
        <div className="inline-flex items-center gap-1.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full px-3.5 py-1.5">
          <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
          <span className="text-[12px] font-semibold text-[#2563EB]">
            {trialDays} day{trialDays !== 1 ? "s" : ""} free trial — Starter plan active
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-semibold text-[#6B7280]">
            {completedCount} of {totalSteps} completed
          </span>
        </div>
        <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#16A34A] rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 mt-5 flex flex-col gap-2.5">
        {STEPS.map((step) => {
          const done = isStepDone(step.key)
          const Icon = step.icon
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => !done && !step.always && handleStepPress(step.key)}
              disabled={done || step.always}
              className={`w-full rounded-[16px] px-4 py-4 flex items-center gap-3.5 text-left transition-all active:scale-[0.98] ${
                done
                  ? "bg-[#F9FAFB] opacity-70"
                  : "bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              }`}
            >
              {/* Check or icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-[#ECFDF5]" : "bg-[#F3F4F6]"
                }`}
              >
                {done ? (
                  <Check className="w-5 h-5 text-[#16A34A]" strokeWidth={2.5} />
                ) : (
                  <Icon className="w-5 h-5 text-[#6B7280]" strokeWidth={1.8} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className={`text-[14px] font-semibold block ${done ? "text-[#9CA3AF] line-through" : "text-[#111113]"}`}>
                  {step.label}
                </span>
                <span className="text-[12px] text-[#9CA3AF] block mt-0.5 leading-snug">
                  {step.desc}
                </span>
              </div>

              {!done && !step.always && (
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <div className="px-5 mt-6">
        <button
          type="button"
          onClick={handleSkip}
          className="w-full h-[52px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[15px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.18)] active:scale-[0.98] transition-transform"
        >
          {completedCount >= totalSteps ? "Go to dashboard" : "Skip for now"}
        </button>
        {completedCount < totalSteps && (
          <p className="text-[11px] text-[#9CA3AF] text-center mt-2">
            You can always come back to finish setup later.
          </p>
        )}
      </div>
    </div>
  )
}
