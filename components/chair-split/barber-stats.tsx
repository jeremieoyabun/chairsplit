"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type DbVisit = {
  total_amount: number
  visited_at: string
  visit_services: { service_name: string; price: number }[]
}

type TopService = {
  name: string
  visits: number
  revenue: number
  percent: number
}

type WeekDay = {
  day: string
  visits: number
  active: boolean
}

const segments = ["This week", "This month", "All time"]

function fmt(n: number): string {
  return Math.round(n).toLocaleString("fr-FR")
}

function getRange(segment: number): { start: string | null; end: string } {
  const now = new Date()
  if (segment === 0) {
    const day = now.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() + diff)
    const end = new Date(start); end.setDate(end.getDate() + 7)
    return { start: start.toISOString(), end: end.toISOString() }
  }
  if (segment === 1) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return { start: start.toISOString(), end: end.toISOString() }
  }
  return { start: null, end: now.toISOString() }
}

export function BarberStats() {
  const [activeSegment, setActiveSegment] = useState(1)
  const [commission, setCommission] = useState(0)
  const [kpis, setKpis] = useState({ visits: 0, avgTicket: 0, rate: 30 })
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [weekDays, setWeekDays] = useState<WeekDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const shop = await getShop()
      if (!shop) { setLoading(false); return }

      const supabase = createClient()
      const { start, end } = getRange(activeSegment)

      // Parallel: commission rules + visits
      let visitsQuery = supabase
        .from("visits")
        .select("total_amount, product_amount, visited_at, visit_services(service_name, price)")
        .eq("barber_id", shop.userId)
        .eq("status", "validated")
        .lt("visited_at", end)
      if (start) visitsQuery = visitsQuery.gte("visited_at", start)

      const [rulesRes, visitsRes] = await Promise.all([
        supabase.from("commission_rules").select("barber_id, rate, product_rate").eq("shop_id", shop.shopId),
        visitsQuery,
      ])

      let rate = 30
      let productRate = 0
      if (rulesRes.data) {
        const myRule = rulesRes.data.find((r) => r.barber_id === shop.userId)
        const globalRule = rulesRes.data.find((r) => !r.barber_id)
        rate = myRule?.rate ?? globalRule?.rate ?? 30
        productRate = myRule?.product_rate ?? globalRule?.product_rate ?? 0
      }

      if (visitsRes.error) { console.error("[BarberStats] visits:", visitsRes.error.message); setLoading(false); return }

      const rows = (visitsRes.data ?? []) as unknown as DbVisit[]

      const totalRevenue = rows.reduce((s, v) => s + (v.total_amount ?? 0), 0)
      const svcRevenue = rows.reduce((s, v) => s + (v.total_amount ?? 0) - ((v as any).product_amount ?? 0), 0)
      const prodRevenue = rows.reduce((s, v) => s + ((v as any).product_amount ?? 0), 0)
      const totalCommission = Math.round(svcRevenue * rate / 100) + Math.round(prodRevenue * productRate / 100)
      const avgTicket = rows.length > 0 ? Math.round(totalRevenue / rows.length) : 0

      setCommission(totalCommission)
      setKpis({ visits: rows.length, avgTicket, rate })

      // Top services
      const serviceMap: Record<string, { visits: number; revenue: number }> = {}
      for (const v of rows) {
        for (const vs of v.visit_services) {
          if (!serviceMap[vs.service_name]) serviceMap[vs.service_name] = { visits: 0, revenue: 0 }
          serviceMap[vs.service_name].visits += 1
          serviceMap[vs.service_name].revenue += vs.price ?? 0
        }
      }
      const maxVisits = Math.max(...Object.values(serviceMap).map((s) => s.visits), 1)
      const top: TopService[] = Object.entries(serviceMap)
        .sort(([, a], [, b]) => b.visits - a.visits)
        .slice(0, 4)
        .map(([name, stats]) => ({
          name,
          visits: stats.visits,
          revenue: stats.revenue,
          percent: Math.round((stats.visits / maxVisits) * 100),
        }))
      setTopServices(top)

      // Weekly activity (always current week)
      const today = new Date()
      const todayDay = today.getDay()
      const mondayOffset = todayDay === 0 ? -6 : 1 - todayDay
      const monday = new Date(today); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() + mondayOffset)

      const weekStart = monday.toISOString()
      const weekEnd = new Date(monday); weekEnd.setDate(weekEnd.getDate() + 7)

      const { data: weekRaw } = await supabase
        .from("visits")
        .select("visited_at")
        .eq("barber_id", shop.userId)
        .gte("visited_at", weekStart)
        .lt("visited_at", weekEnd.toISOString())

      const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday); d.setDate(d.getDate() + i)
        return {
          day: ["M", "T", "W", "T", "F", "S", "S"][i],
          visits: 0,
          active: d.toDateString() === today.toDateString(),
        }
      })

      for (const v of weekRaw ?? []) {
        const vDate = new Date(v.visited_at)
        const diffDays = Math.floor((vDate.getTime() - monday.getTime()) / 86400000)
        if (diffDays >= 0 && diffDays < 7) days[diffDays].visits++
      }

      setWeekDays(days)
      setLoading(false)
    }
    load()
  }, [activeSegment])

  const maxBarVisits = Math.max(...weekDays.map((d) => d.visits), 1)
  const periodLabel = ["this week", "this month", "all time"][activeSegment]

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113]">My Stats</h1>
      </div>

      {/* Segment */}
      <div className="px-5 mt-2">
        <div className="flex rounded-[12px] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-1">
          {segments.map((seg, i) => (
            <button
              key={seg}
              type="button"
              onClick={() => setActiveSegment(i)}
              className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all ${
                i === activeSegment
                  ? "bg-[#1A1A1A] text-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                  : "text-[#9CA3AF]"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Dark Hero Card */}
      <div className="mx-5 mt-4">
        <div className="rounded-[24px] bg-[#1A1A1A] px-6 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6B7280] block">
            MY COMMISSION EARNED
          </span>
          <div className="mt-2 flex items-baseline">
            <span className="text-[44px] font-bold text-[#FFFFFF] leading-none tracking-tight">
              {loading ? "—" : fmt(commission)}
            </span>
            <span className="text-[24px] text-[#6B7280] ml-1.5 font-normal">{"\u0E3F"}</span>
          </div>
          <span className="text-[13px] text-[#6B7280] block mt-1">{periodLabel}</span>
          {!loading && kpis.visits > 0 && (
            <div className="inline-flex mt-3 px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(22,163,74,0.15)" }}>
              <span className="text-[11px] font-semibold text-[#16A34A]">{kpis.visits} validated visits</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex gap-2.5 mx-5 mt-5">
        {[
          { value: loading ? "—" : String(kpis.visits), label: "total visits" },
          { value: loading ? "—" : fmt(kpis.avgTicket), label: "avg. ticket", hasBaht: true },
          { value: `${kpis.rate}%`, label: "commission rate" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="flex-1 rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] py-4 text-center"
          >
            <div className="flex items-baseline justify-center">
              <span className="text-[22px] font-bold text-[#111113] leading-none">{kpi.value}</span>
              {kpi.hasBaht && <span className="text-[13px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>}
            </div>
            <span className="text-[11px] text-[#9CA3AF] block mt-1">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Top Services */}
      <div className="px-5 mt-7">
        <span className="text-[18px] font-semibold text-[#111113] block mb-3">Top Services</span>
        {loading ? (
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 text-center">
            <span className="text-[13px] text-[#9CA3AF]">Loading…</span>
          </div>
        ) : topServices.length === 0 ? (
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 text-center">
            <span className="text-[13px] text-[#9CA3AF]">No data for this period</span>
          </div>
        ) : (
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            {topServices.map((svc, i) => (
              <div
                key={svc.name}
                className={`px-[18px] py-3.5 ${i < topServices.length - 1 ? "border-b border-[#F8F8FA]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#111113]">{svc.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#9CA3AF]">{svc.visits} visits</span>
                    <div className="flex items-baseline">
                      <span className="text-[14px] font-semibold text-[#111113]">{fmt(svc.revenue)}</span>
                      <span className="text-[11px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-[4px] rounded-full bg-[#F3F4F6] overflow-hidden">
                  <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${svc.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Activity */}
      <div className="px-5 mt-7">
        <span className="text-[18px] font-semibold text-[#111113] block mb-3">Weekly Activity</span>
        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-5">
          <div className="flex items-end justify-between h-[120px]">
            {weekDays.map((d, i) => (
              <div key={`${d.day}-${i}`} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex-1 w-full flex items-end justify-center">
                  <div
                    className={`w-[18px] rounded-[6px] ${d.active ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"}`}
                    style={{ height: d.visits > 0 ? `${(d.visits / maxBarVisits) * 80}px` : "4px", minHeight: "4px" }}
                  />
                </div>
                <span className={`text-[11px] font-medium ${d.active ? "text-[#3B82F6]" : "text-[#9CA3AF]"}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
