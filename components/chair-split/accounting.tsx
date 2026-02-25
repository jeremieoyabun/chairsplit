"use client"

import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function fmtK(n: number): string {
  if (Math.abs(n) >= 1000) {
    const k = n / 1000
    return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + "K"
  }
  return Math.round(n).toLocaleString("fr-FR")
}

function monthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function Accounting({
  onExpensesPress,
  onStatementsPress,
  onPayslipsPress,
}: {
  onExpensesPress?: () => void
  onStatementsPress?: () => void
  onPayslipsPress?: () => void
}) {
  const [revenue, setRevenue] = useState<number | null>(null)
  const [charges, setCharges] = useState<number | null>(null)
  const [expenseCount, setExpenseCount] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single()

      if (!profile?.shop_id) return

      const { start, end } = monthRange()

      // Revenue from validated visits this month
      const { data: visits } = await supabase
        .from("visits")
        .select("total_amount")
        .eq("shop_id", profile.shop_id)
        .eq("status", "validated")
        .gte("visited_at", start)
        .lt("visited_at", end)

      const totalRevenue = (visits ?? []).reduce((s, v) => s + (v.total_amount ?? 0), 0)
      setRevenue(totalRevenue)

      // Expenses this month
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("shop_id", profile.shop_id)
        .gte("expense_date", start)
        .lt("expense_date", end)

      const totalCharges = (expenses ?? []).reduce((s, e) => s + (e.amount ?? 0), 0)
      setCharges(totalCharges)
      setExpenseCount((expenses ?? []).length)
    }
    load()
  }, [])

  const loading = revenue === null || charges === null
  const result = loading ? 0 : revenue! - charges!

  const kpis = [
    {
      value: loading ? "—" : fmtK(revenue!),
      label: "revenue",
      hasBaht: !loading,
      isNegative: false,
    },
    {
      value: loading ? "—" : fmtK(charges!),
      label: "expenses",
      hasBaht: !loading,
      isNegative: false,
    },
    {
      value: loading ? "—" : (result < 0 ? "-" : "") + fmtK(Math.abs(result)),
      label: "result",
      hasBaht: !loading,
      isNegative: result < 0,
    },
  ]

  const tiles = [
    {
      emoji: "💰",
      key: "expenses",
      title: "Shop expenses",
      subtitle: loading
        ? "Loading…"
        : `${expenseCount} expense${expenseCount !== 1 ? "s" : ""} · ${Math.round(charges!).toLocaleString("fr-FR")} ฿ this month`,
    },
    {
      emoji: "📊",
      key: "statements",
      title: "Monthly reports",
      subtitle: "Results by month",
    },
    {
      emoji: "📄",
      key: "payslips",
      title: "Payslips",
      subtitle: "Barber statements by month",
    },
  ]

  const handlers: Record<string, (() => void) | undefined> = {
    expenses: onExpensesPress,
    statements: onStatementsPress,
    payslips: onPayslipsPress,
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113] leading-tight">
          Finance
        </h1>
      </div>

      {/* Dark KPI Banner */}
      <div className="mx-5 mt-2">
        <div className="rounded-[20px] bg-[#1A1A1A] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex gap-2">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.06)] py-3.5 text-center"
              >
                <div className="flex items-baseline justify-center whitespace-nowrap">
                  <span
                    className={`text-[22px] font-bold leading-none ${
                      kpi.isNegative ? "text-[#EF4444]" : "text-[#FFFFFF]"
                    }`}
                  >
                    {kpi.value}
                  </span>
                  {kpi.hasBaht && (
                    <span
                      className={`text-[14px] ml-0.5 ${
                        kpi.isNegative ? "text-[#EF4444]/60" : "text-[#6B7280]"
                      }`}
                    >
                      {"\u0E3F"}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#6B7280] block mt-1.5">
                  {kpi.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav Tiles */}
      <div className="px-5 mt-7 flex flex-col gap-3.5">
        {tiles.map((tile) => (
          <button
            key={tile.key}
            type="button"
            onClick={handlers[tile.key]}
            className="relative rounded-[20px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] p-6 text-left active:scale-[0.99] transition-transform w-full"
          >
            <ChevronRight
              className="absolute top-6 right-5 w-[18px] h-[18px] text-[#D1D5DB]"
              strokeWidth={2}
            />
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center">
              <span className="text-[24px] leading-none">{tile.emoji}</span>
            </div>
            <span className="text-[17px] font-semibold text-[#111113] block mt-3.5">
              {tile.title}
            </span>
            <span className="text-[13px] text-[#9CA3AF] block mt-1">
              {tile.subtitle}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
