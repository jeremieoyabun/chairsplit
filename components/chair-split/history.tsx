"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type DbVisit = {
  id: string
  total_amount: number
  status: string
  visited_at: string
  barber_id: string
  client_id: string | null
  clientName?: string
  serviceNames?: string
}

type DisplayVisit = {
  id: string
  initials: string
  name: string
  services: string
  amount: string
  time: string
  color: string
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

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
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

export function History({ onVisitPress, onDraftPress }: { onVisitPress?: (id: string) => void; onDraftPress?: (id: string) => void }) {
  const [activeSegment, setActiveSegment] = useState(1)
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([])
  const [kpis, setKpis] = useState({ visits: 0, revenue: 0, commissions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const shop = await getShop()
      if (!shop) { setLoading(false); return }

      const supabase = createClient()
      const { start, end } = getRange(activeSegment)

      // Load commission rules for commission KPI
      const { data: rules } = await supabase
        .from("commission_rules")
        .select("barber_id, rate")
        .eq("shop_id", shop.shopId)

      const ruleMap: Record<string, number> = {}
      for (const r of rules ?? []) {
        if (r.barber_id) ruleMap[r.barber_id] = r.rate
      }
      const globalRate = rules?.find((r) => !r.barber_id)?.rate ?? 30

      // Load visits (no FK joins — they fail silently with RLS)
      const { data: raw, error } = await supabase
        .from("visits")
        .select("id, total_amount, status, visited_at, barber_id, client_id")
        .eq("shop_id", shop.shopId)
        .gte("visited_at", start)
        .lt("visited_at", end)
        .order("visited_at", { ascending: false })

      if (error) { console.error("[History] visits:", error.message); setLoading(false); return }

      const rows = (raw ?? []) as unknown as DbVisit[]

      // Batch-fetch barber names, client names, visit services
      const barberIds = [...new Set(rows.map((v) => v.barber_id).filter(Boolean))]
      const clientIds = [...new Set(rows.map((v) => v.client_id).filter(Boolean))] as string[]
      const visitIds = rows.map((v) => v.id)
      const barberNames: Record<string, string> = {}
      const clientNames: Record<string, string> = {}
      const visitServicesMap: Record<string, string[]> = {}

      const batchPromises: PromiseLike<void>[] = []
      if (barberIds.length > 0) {
        batchPromises.push(
          supabase.from("profiles").select("id, full_name").in("id", barberIds)
            .then(({ data }) => { for (const p of data ?? []) barberNames[p.id] = p.full_name ?? "Unknown" })
        )
      }
      if (clientIds.length > 0) {
        batchPromises.push(
          supabase.from("clients").select("id, name").in("id", clientIds)
            .then(({ data }) => { for (const c of data ?? []) clientNames[c.id] = c.name })
        )
      }
      if (visitIds.length > 0) {
        batchPromises.push(
          supabase.from("visit_services").select("visit_id, service_name").in("visit_id", visitIds)
            .then(({ data }) => { for (const vs of data ?? []) { if (!visitServicesMap[vs.visit_id]) visitServicesMap[vs.visit_id] = []; visitServicesMap[vs.visit_id].push(vs.service_name) } })
        )
      }
      await Promise.all(batchPromises)

      // Enrich rows
      for (const v of rows) {
        v.clientName = clientNames[v.client_id ?? ""] ?? undefined
        v.serviceNames = (visitServicesMap[v.id] ?? []).join(", ") || undefined
      }

      // KPIs — revenue and commissions from validated only
      const validated = rows.filter((v) => v.status === "validated")
      const totalRevenue = validated.reduce((s, v) => s + (v.total_amount ?? 0), 0)
      const totalCommissions = validated.reduce((s, v) => {
        const rate = ruleMap[v.barber_id] ?? globalRate
        return s + (v.total_amount ?? 0) * rate / 100
      }, 0)
      setKpis({ visits: rows.length, revenue: totalRevenue, commissions: totalCommissions })

      // Group by day descending
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
          visits: visits.map((v) => {
            const barberName = barberNames[v.barber_id] ?? "Unknown"
            return {
              id: v.id,
              initials: getInitials(barberName),
              name: v.clientName ?? "Walk-in",
              services: v.serviceNames ?? "—",
              amount: fmt(v.total_amount ?? 0),
              time: new Date(v.visited_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              color: colorFor(barberName),
              status: v.status as "validated" | "draft" | "cancelled",
            }
          }),
        }))

      setDayGroups(groups)
      setLoading(false)
    }
    load()
  }, [activeSegment])

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113] leading-tight">History</h1>
      </div>

      {/* Segment control */}
      <div className="mx-5 mt-2">
        <div className="flex items-center bg-[#EEEFF2] rounded-[14px] p-1">
          {segments.map((seg, i) => (
            <button
              key={seg}
              type="button"
              onClick={() => setActiveSegment(i)}
              className={`flex-1 text-center py-2.5 rounded-[12px] text-[14px] transition-all ${
                i === activeSegment
                  ? "bg-[#FFFFFF] font-semibold text-[#111113] shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
                  : "font-medium text-[#6B7280]"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Dark KPI banner */}
      <div className="mx-5 mt-4">
        <div className="rounded-[20px] bg-[#1A1A1A] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex gap-2">
            {[
              { value: loading ? "—" : String(kpis.visits), label: "visits" },
              { value: loading ? "—" : fmt(kpis.revenue), label: "revenue", hasBaht: true },
              { value: loading ? "—" : fmt(kpis.commissions), label: "comm.", hasBaht: true },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.06)] py-3.5 text-center"
              >
                <div className="flex items-baseline justify-center whitespace-nowrap">
                  <span className="text-[22px] font-bold text-[#FFFFFF] leading-none">{kpi.value}</span>
                  {kpi.hasBaht && <span className="text-[14px] text-[#6B7280] ml-0.5">{"\u0E3F"}</span>}
                </div>
                <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B7280] block mt-1.5">
                  {kpi.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped visits */}
      {!loading && dayGroups.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-[14px] text-[#9CA3AF]">No visits for this period</span>
        </div>
      ) : (
        dayGroups.map((day) => (
          <div key={day.dateStr}>
            <div className="px-5 mt-7 mb-3">
              <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">
                {day.label}
              </span>
            </div>
            <div className="px-5 flex flex-col gap-2.5">
              {day.visits.map((visit, i) => {
                const badge = statusConfig[visit.status] ?? statusConfig.validated
                return (
                  <div
                    key={`${visit.id}-${i}`}
                    onClick={() => visit.status === "draft" ? onDraftPress?.(visit.id) : onVisitPress?.(visit.id)}
                    className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] w-full text-left active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: visit.color }}
                    >
                      <span className="text-[14px] font-semibold text-[#FFFFFF]">{visit.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[15px] font-semibold text-[#111113] block leading-tight">
                        {visit.name}
                      </span>
                      <span className="text-[13px] text-[#9CA3AF] block truncate mt-0.5">
                        {visit.services}
                      </span>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <div className="flex items-baseline justify-end">
                        <span className="text-[17px] font-bold text-[#111113] leading-tight">{visit.amount}</span>
                        <span className="text-[13px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                      </div>
                      <span className="text-[11px] text-[#D1D5DB] block mt-0.5">{visit.time}</span>
                      <span
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 leading-none"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
