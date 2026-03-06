"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type DbVisit = {
  id: string
  total_amount: number
  status: string
  visited_at: string
  clients: { name: string } | null
  visit_services: { service_name: string }[]
}

type DisplayVisit = {
  id: string
  client: string
  services: string
  amount: string
  time: string
  status: "validated" | "draft" | "cancelled"
}

type DayGroup = {
  label: string
  dateStr: string
  visits: DisplayVisit[]
}

const COLORS = ["#3B82F6", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899", "#0D9488"]

function colorFor(id: string) {
  let h = 0
  for (const c of id) h = c.charCodeAt(0) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

const statusConfig = {
  validated: { label: "Validated", bg: "#ECFDF5", text: "#16A34A" },
  draft: { label: "Draft", bg: "#FFFBEB", text: "#D97706" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", text: "#DC2626" },
}

const segments = ["Day", "Week", "Month"]

function getRange(segment: number): { start: string; end: string } {
  const now = new Date()
  if (segment === 0) {
    const start = new Date(now); start.setHours(0, 0, 0, 0)
    const end = new Date(start); end.setDate(end.getDate() + 1)
    return { start: start.toISOString(), end: end.toISOString() }
  }
  if (segment === 1) {
    const day = now.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() + diff)
    const end = new Date(start); end.setDate(end.getDate() + 7)
    return { start: start.toISOString(), end: end.toISOString() }
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function BarberHistory({ onVisitPress }: { onVisitPress?: (id: string) => void }) {
  const [activeSegment, setActiveSegment] = useState(0)
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([])
  const [kpis, setKpis] = useState({ visits: 0, revenue: 0, earnings: 0 })
  const [loading, setLoading] = useState(true)
  const [barberColor, setBarberColor] = useState("#3B82F6")
  const [barberInitials, setBarberInitials] = useState("?")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const shop = await getShop()
      if (!shop) { setLoading(false); return }

      setBarberColor(colorFor(shop.userId))

      const supabase = createClient()
      // Parallel: profile + commission rules
      const [profileRes, rulesRes] = await Promise.all([
        supabase.from("profiles").select("full_name, shop_id").eq("id", shop.userId).single(),
        supabase.from("commission_rules").select("barber_id, rate").eq("shop_id", shop.shopId),
      ])

      const profile = profileRes.data
      if (profile?.full_name) {
        const parts = profile.full_name.trim().split(/\s+/)
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : profile.full_name.slice(0, 2).toUpperCase()
        setBarberInitials(initials)
      }

      let rate = 30
      if (rulesRes.data) {
        const myRule = rulesRes.data.find((r) => r.barber_id === shop.userId)
        const globalRule = rulesRes.data.find((r) => !r.barber_id)
        rate = myRule?.rate ?? globalRule?.rate ?? 30
      }

      const { start, end } = getRange(activeSegment)

      const { data: raw, error } = await supabase
        .from("visits")
        .select("id, total_amount, status, visited_at, clients(name), visit_services(service_name)")
        .eq("barber_id", shop.userId)
        .gte("visited_at", start)
        .lt("visited_at", end)
        .order("visited_at", { ascending: false })

      if (error) { console.error("[BarberHistory] visits:", error.message); setLoading(false); return }

      const rows = (raw ?? []) as unknown as DbVisit[]

      const validated = rows.filter((v) => v.status === "validated")
      const revenue = validated.reduce((s, v) => s + (v.total_amount ?? 0), 0)
      const earnings = Math.round(revenue * rate / 100)
      setKpis({ visits: rows.length, revenue, earnings })

      const grouped: Record<string, DbVisit[]> = {}
      for (const v of rows) {
        const day = (v.visited_at ?? "").split("T")[0]
        if (!day) continue
        if (!grouped[day]) grouped[day] = []
        grouped[day].push(v)
      }

      const groups: DayGroup[] = Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([dateStr, visits]) => ({
          dateStr,
          label: new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
          }).toUpperCase(),
          visits: visits.map((v) => ({
            id: v.id,
            client: v.clients?.name ?? "Walk-in",
            services: v.visit_services.map((s) => s.service_name).join(", ") || "—",
            amount: fmt(v.total_amount ?? 0),
            time: new Date(v.visited_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            status: v.status as "validated" | "draft" | "cancelled",
          })),
        }))

      setDayGroups(groups)
      setLoading(false)
    }
    load()
  }, [activeSegment])

  const segmentLabel = ["today", "this week", "this month"][activeSegment]

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113]">My History</h1>
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

      {/* Dark KPI banner */}
      <div className="mx-5 mt-4">
        <div className="rounded-[20px] bg-[#1A1A1A] px-4 py-5 flex gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
          {[
            { value: loading ? "—" : String(kpis.visits), label: `visits ${segmentLabel}` },
            { value: loading ? "—" : fmt(kpis.revenue), label: "revenue", hasBaht: true },
            { value: loading ? "—" : fmt(kpis.earnings), label: "my earnings", hasBaht: true },
          ].map((kpi) => (
            <div key={kpi.label} className="flex-1 text-center">
              <div className="flex items-baseline justify-center">
                <span className="text-[20px] font-bold text-[#FFFFFF] leading-none">{kpi.value}</span>
                {kpi.hasBaht && <span className="text-[12px] text-[#6B7280] ml-0.5">{"\u0E3F"}</span>}
              </div>
              <span className="text-[10px] text-[#6B7280] block mt-1">{kpi.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visits grouped by day */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
        </div>
      ) : dayGroups.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-[14px] text-[#9CA3AF]">No visits for this period</span>
        </div>
      ) : (
        dayGroups.map((day) => (
          <div key={day.dateStr} className="px-5 mt-6">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3 px-1">
              {day.label}
            </span>
            <div className="flex flex-col gap-2.5">
              {day.visits.map((visit, i) => {
                const badge = statusConfig[visit.status] ?? statusConfig.validated
                return (
                  <button
                    key={`${visit.id}-${i}`}
                    type="button"
                    onClick={() => onVisitPress?.(visit.id)}
                    className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] w-full text-left active:scale-[0.99] transition-transform"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: barberColor }}
                    >
                      <span className="text-[14px] font-semibold text-[#FFFFFF]">{barberInitials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[15px] font-semibold text-[#111113] leading-tight block">
                        {visit.client}
                      </span>
                      <span className="text-[13px] text-[#9CA3AF] block truncate mt-0.5">
                        {visit.services}
                      </span>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <div className="flex items-baseline">
                        <span className="text-[17px] font-bold text-[#111113]">{visit.amount}</span>
                        <span className="text-[13px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                      </div>
                      <span className="text-[11px] text-[#D1D5DB] mt-0.5">{visit.time}</span>
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 leading-none"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
