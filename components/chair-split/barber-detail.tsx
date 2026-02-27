"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type RecentVisit = {
  id: string
  services: string
  amount: string
  time: string
}

type CommissionRule = {
  service: string
  pillLabel: string
  pillBg: string
  pillText: string
  rate: string
}

const COLORS = ["#3B82F6", "#16A34A", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

function colorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("fr-FR")
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

export function BarberDetail({
  onBack,
  barberId,
}: {
  onBack: () => void
  barberId?: string | null
}) {
  const [activeSegment, setActiveSegment] = useState(0)
  const [barberName, setBarberName] = useState<string | null>(null)
  const [barberColor, setBarberColor] = useState("#3B82F6")
  const [barberInitials, setBarberInitials] = useState("?")
  const [kpis, setKpis] = useState({ visits: 0, revenue: 0, commission: 0 })
  const [recentVisits, setRecentVisits] = useState<RecentVisit[]>([])
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([])
  const [loading, setLoading] = useState(true)
  const [memberSince, setMemberSince] = useState("")

  useEffect(() => {
    if (!barberId) { setLoading(false); return }
    const load = async () => {
      setLoading(true)
      const shop = await getShop()
      if (!shop) { setLoading(false); return }

      const supabase = createClient()
      // Load barber profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, shop_id, created_at")
        .eq("id", barberId)
        .single()

      const name = profile?.full_name ?? null
      setBarberName(name)
      setBarberColor(colorFor(barberId))
      setBarberInitials(getInitials(name))
      if (profile?.created_at) {
        setMemberSince(
          new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        )
      }

      const shopId = profile?.shop_id
      if (!shopId) { setLoading(false); return }

      // Load commission rules
      const { data: rules } = await supabase
        .from("commission_rules")
        .select("barber_id, rate")
        .eq("shop_id", shopId)

      const barberRule = rules?.find((r) => r.barber_id === barberId)
      const globalRule = rules?.find((r) => !r.barber_id)
      const rate = barberRule?.rate ?? globalRule?.rate ?? 30

      const cRules: CommissionRule[] = []
      if (globalRule) {
        cRules.push({
          service: "Tous les services",
          pillLabel: "d\u00E9faut",
          pillBg: "#F3F4F6",
          pillText: "#6B7280",
          rate: `${globalRule.rate}%`,
        })
      }
      if (barberRule) {
        cRules.push({
          service: "R\u00E8gle sp\u00E9cifique",
          pillLabel: "sp\u00E9cifique",
          pillBg: "#FEF9EE",
          pillText: "#D97706",
          rate: `${barberRule.rate}%`,
        })
      }
      if (cRules.length === 0) {
        cRules.push({
          service: "Tous les services",
          pillLabel: "d\u00E9faut",
          pillBg: "#F3F4F6",
          pillText: "#6B7280",
          rate: `${rate}%`,
        })
      }
      setCommissionRules(cRules)

      // Load visits for selected period
      const { start, end } = getRange(activeSegment)
      const { data: visits } = await supabase
        .from("visits")
        .select("id, total_amount, status, visited_at, visit_services(service_name)")
        .eq("barber_id", barberId)
        .gte("visited_at", start)
        .lt("visited_at", end)
        .order("visited_at", { ascending: false })

      const rows = (visits ?? []) as any[]
      const validated = rows.filter((v: any) => v.status === "validated")
      const revenue = validated.reduce((s: number, v: any) => s + (v.total_amount ?? 0), 0)
      setKpis({
        visits: rows.length,
        revenue,
        commission: Math.round(revenue * rate / 100),
      })

      setRecentVisits(
        rows.slice(0, 3).map((v: any) => ({
          id: v.id,
          services: (v.visit_services as { service_name: string }[]).map((s) => s.service_name).join(", ") || "—",
          amount: fmt(v.total_amount ?? 0),
          time: new Date(v.visited_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        }))
      )
      setLoading(false)
    }
    load()
  }, [barberId, activeSegment])

  if (!barberId) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex items-center px-5 pt-4 pb-3">
          <button type="button" onClick={onBack} className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <ArrowLeft className="w-[18px] h-[18px] text-[#111113]" />
          </button>
        </div>
        <div className="flex items-center justify-center flex-1">
          <span className="text-[14px] text-[#9CA3AF]">No barber selected</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-10">
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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113] -ml-10">Profil</h1>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center px-5 pt-6 pb-2">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: barberColor }}
        >
          <span className="text-[28px] font-bold text-[#FFFFFF]">{barberInitials}</span>
        </div>
        <span className="text-[24px] font-bold text-[#111113] mt-3.5 leading-tight">
          {barberName ?? "—"}
        </span>
        {memberSince && (
          <span className="text-[13px] text-[#9CA3AF] mt-1">Actif depuis {memberSince}</span>
        )}
      </div>

      {/* Segment control */}
      <div className="mx-5 mt-5">
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

      {/* Dark KPI card */}
      <div className="mx-5 mt-4">
        <div className="rounded-[20px] bg-[#1A1A1A] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex gap-2.5">
            {[
              { value: loading ? "—" : String(kpis.visits), label: "visites" },
              { value: loading ? "—" : fmt(kpis.revenue), label: "CA", hasBaht: true },
              { value: loading ? "—" : fmt(kpis.commission), label: "commission", hasBaht: true },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.06)] px-3 py-3.5"
              >
                <div className="flex items-baseline whitespace-nowrap">
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

      {/* Recent visits */}
      <div className="px-5 mt-7">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
          {"Visites r\u00E9centes"}
        </span>
        {loading ? (
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 text-center">
            <span className="text-[13px] text-[#9CA3AF]">Loading…</span>
          </div>
        ) : recentVisits.length === 0 ? (
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 text-center">
            <span className="text-[13px] text-[#9CA3AF]">Aucune visite sur cette p\u00E9riode</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: barberColor }}
                >
                  <span className="text-[14px] font-semibold text-[#FFFFFF]">{barberInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[15px] font-semibold text-[#111113] block leading-tight">{barberName}</span>
                  <span className="text-[13px] text-[#9CA3AF] block truncate mt-0.5">{visit.services}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end">
                    <span className="text-[17px] font-bold text-[#111113] leading-tight">{visit.amount}</span>
                    <span className="text-[13px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                  </div>
                  <span className="text-[11px] text-[#D1D5DB] block mt-0.5">{visit.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commission rules */}
      <div className="px-5 mt-7">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
          {"R\u00C8GLES APPLIQU\u00C9ES"}
        </span>
        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {commissionRules.map((rule, idx) => (
            <div
              key={rule.service}
              className={`flex items-center justify-between px-[18px] py-4 ${idx < commissionRules.length - 1 ? "border-b border-[#F5F5F7]" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#111113]">{rule.service}</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none"
                  style={{ backgroundColor: rule.pillBg, color: rule.pillText }}
                >
                  {rule.pillLabel}
                </span>
              </div>
              <span className="text-[18px] font-bold text-[#111113]">{rule.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
