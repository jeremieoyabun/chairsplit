"use client"

import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getLast6Months(): { year: number; month: number; label: string }[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_LABELS[d.getMonth()] }
  })
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
  const [monthlyRevenue, setMonthlyRevenue] = useState<number[]>([])

  useEffect(() => {
    const load = async () => {
      const shop = await getShop()
      if (!shop) return

      const supabase = createClient()
      const { start, end } = monthRange()

      // Revenue from validated visits this month
      const { data: visits } = await supabase
        .from("visits")
        .select("total_amount")
        .eq("shop_id", shop.shopId)
        .eq("status", "validated")
        .gte("visited_at", start)
        .lt("visited_at", end)

      const totalRevenue = (visits ?? []).reduce((s, v) => s + (v.total_amount ?? 0), 0)
      setRevenue(totalRevenue)

      // Expenses this month (monthly + one-time in range)
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0]
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("shop_id", shop.shopId)
        .or(`frequency.eq.monthly,and(frequency.eq.one-time,date.gte.${monthStart},date.lt.${monthEnd})`)

      const totalCharges = (expenses ?? []).reduce((s, e) => s + (e.amount ?? 0), 0)
      setCharges(totalCharges)
      setExpenseCount((expenses ?? []).length)

      // Last 6 months revenue for chart
      const months = getLast6Months()
      const chartStart = new Date(months[0].year, months[0].month, 1).toISOString()
      const { data: allVisits } = await supabase
        .from("visits")
        .select("total_amount, visited_at")
        .eq("shop_id", shop.shopId)
        .eq("status", "validated")
        .gte("visited_at", chartStart)

      const buckets = months.map(({ year, month }) => {
        const total = (allVisits ?? [])
          .filter(v => {
            const d = new Date(v.visited_at)
            return d.getFullYear() === year && d.getMonth() === month
          })
          .reduce((s, v) => s + (v.total_amount ?? 0), 0)
        return total
      })
      setMonthlyRevenue(buckets)
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

      {/* Revenue Chart */}
      {monthlyRevenue.length === 6 && (
        <div className="mx-5 mt-4">
          <div className="rounded-[20px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-[#111113]">Revenue — last 6 months</span>
              <span className="text-[11px] text-[#9CA3AF]">฿</span>
            </div>
            {(() => {
              const maxVal = Math.max(...monthlyRevenue, 1)
              const months = getLast6Months()
              const currentIdx = 5
              return (
                <div className="flex items-end gap-1.5 h-[80px]">
                  {monthlyRevenue.map((val, i) => {
                    const pct = (val / maxVal) * 100
                    const isCurrent = i === currentIdx
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[9px] text-[#9CA3AF] font-medium leading-none">
                          {val > 0 ? fmtK(val) : ""}
                        </span>
                        <div className="w-full flex items-end" style={{ height: 52 }}>
                          <div
                            className="w-full rounded-t-[5px] transition-all"
                            style={{
                              height: `${Math.max(pct, val > 0 ? 6 : 2)}%`,
                              backgroundColor: isCurrent ? "#1A1A1A" : val > 0 ? "#D1D5DB" : "#F3F4F6",
                            }}
                          />
                        </div>
                        <span
                          className="text-[9px] font-semibold leading-none"
                          style={{ color: isCurrent ? "#111113" : "#9CA3AF" }}
                        >
                          {months[i].label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      )}

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
