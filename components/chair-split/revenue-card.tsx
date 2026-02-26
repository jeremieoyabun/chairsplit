"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function RevenueCard() {
  const [revenue, setRevenue] = useState(0)
  const [visitCount, setVisitCount] = useState(0)
  const [commissions, setCommissions] = useState(0)
  const [avgTicket, setAvgTicket] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const shop = await getShop()
      if (!shop) { setLoading(false); return }

      const supabase = createClient()
      const { start, end } = todayRange()
      const { data: raw, error } = await supabase
        .from("visits")
        .select("total_amount, commission_amount, status")
        .eq("shop_id", shop.shopId)
        .gte("visited_at", start)
        .lt("visited_at", end)

      if (error) { console.error("[RevenueCard] visits:", error.message); setLoading(false); return }

      const all = raw ?? []
      const validated = all.filter((v) => v.status === "validated")
      const totalRevenue = validated.reduce((s, v) => s + v.total_amount, 0)
      const totalCommissions = validated.reduce((s, v) => s + v.commission_amount, 0)
      const avgTkt = validated.length > 0 ? totalRevenue / validated.length : 0

      setRevenue(totalRevenue)
      setVisitCount(validated.length)
      setCommissions(totalCommissions)
      setAvgTicket(Math.round(avgTkt))
      setLoading(false)
    }
    load()
  }, [])

  const today = new Date()
  const dateLabel = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  const miniKpis = [
    { label: "VISITS", value: loading ? "—" : String(visitCount) },
    { label: "COMMISSIONS", value: loading ? "—" : fmt(commissions), hasBaht: !loading },
    { label: "AVG.TICKET", value: loading ? "—" : fmt(avgTicket), hasBaht: !loading && avgTicket > 0 },
  ]

  return (
    <div className="mx-5 mt-4">
      <div className="rounded-[24px] bg-[#1A1A1A] px-4 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        {/* Top row */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">
            {"TODAY\u2019S REVENUE"}
          </span>
          <span className="text-[12px] text-[#6B7280]">{dateLabel}</span>
        </div>

        {/* Main amount */}
        <div className="mt-2 flex items-baseline px-1">
          <span className="text-[48px] font-bold text-[#FFFFFF] leading-none tracking-tight">
            {loading ? "—" : fmt(revenue)}
          </span>
          <span className="text-[28px] text-[#6B7280] ml-1.5 font-normal">{"\u0E3F"}</span>
        </div>

        {/* Mini KPI row */}
        <div className="mt-5 flex gap-2">
          {miniKpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.06)] py-3.5 text-center"
            >
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#6B7280] block">
                {kpi.label}
              </span>
              <div className="mt-1.5 flex items-baseline justify-center whitespace-nowrap">
                <span className="text-[22px] font-bold text-[#FFFFFF] leading-none">
                  {kpi.value}
                </span>
                {kpi.hasBaht && (
                  <span className="text-[14px] text-[#6B7280] ml-0.5">{"\u0E3F"}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
