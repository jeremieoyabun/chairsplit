"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type DbVisit = {
  id: string
  barber_id: string
  total_amount: number
  status: string
  visited_at: string
  clients: { name: string } | null
  visit_services: { service_name: string }[]
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

const statusConfig = {
  validated: { label: "Validated", bg: "#ECFDF5", text: "#16A34A" },
  draft: { label: "Draft", bg: "#FFFBEB", text: "#D97706" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", text: "#DC2626" },
}

const COLORS = ["#3B82F6", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899", "#0D9488"]

function colorFor(name: string) {
  let h = 0
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
}

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

function toDisplay(rows: DbVisit[], barberNames: Record<string, string>): DisplayVisit[] {
  return rows.map((v) => {
    const barberName = barberNames[v.barber_id] ?? "Unknown"
    return {
      id: v.id,
      initials: getInitials(barberName),
      name: v.clients?.name ?? "Walk-in",
      services: v.visit_services.map((s) => s.service_name).join(", ") || "—",
      amount: fmt(v.total_amount),
      time: new Date(v.visited_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      color: colorFor(barberName),
      status: v.status as "validated" | "draft" | "cancelled",
    }
  })
}

export function RecentVisits({
  onVisitPress,
  onDraftPress,
  onViewAllPress,
}: {
  onVisitPress?: (id: string) => void
  onDraftPress?: (id: string) => void
  onViewAllPress?: () => void
}) {
  const [visits, setVisits] = useState<DisplayVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [shopId, setShopId] = useState<string | null>(null)

  const loadVisits = async (sid: string) => {
    const supabase = createClient()
    const { start, end } = todayRange()
    const { data: raw, error } = await supabase
      .from("visits")
      .select("id, barber_id, total_amount, status, visited_at, clients(name), visit_services(service_name)")
      .eq("shop_id", sid)
      .gte("visited_at", start)
      .lt("visited_at", end)
      .order("visited_at", { ascending: true })

    if (error) { console.error("[RecentVisits]", error.message); return }
    const rows = (raw ?? []) as unknown as DbVisit[]

    // Batch-fetch barber names
    const barberIds = [...new Set(rows.map((v) => v.barber_id).filter(Boolean))]
    const barberNames: Record<string, string> = {}
    if (barberIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", barberIds)
      for (const p of profiles ?? []) barberNames[p.id] = p.full_name ?? "Unknown"
    }

    setVisits(toDisplay(rows, barberNames))
    setLoading(false)
  }

  // Initial load
  useEffect(() => {
    const init = async () => {
      const shop = await getShop()
      if (!shop) { setLoading(false); return }
      setShopId(shop.shopId)
      await loadVisits(shop.shopId)
    }
    init()
  }, [])

  // Realtime — reload on any visit INSERT or UPDATE in this shop
  useEffect(() => {
    if (!shopId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`recent-visits-${shopId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "visits", filter: `shop_id=eq.${shopId}` },
        () => loadVisits(shopId))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "visits", filter: `shop_id=eq.${shopId}` },
        () => loadVisits(shopId))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [shopId])

  return (
    <div className="px-5 mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[18px] font-semibold text-[#111113]">{"Today\u2019s Visits"}</h2>
        <button
          type="button"
          onClick={onViewAllPress}
          className="text-[13px] font-semibold text-[#2563EB]"
        >
          {"View all \u2192"}
        </button>
      </div>

      {!loading && visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <span className="text-[14px] text-[#9CA3AF]">No visits today yet</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {visits.map((visit) => {
            const badge = statusConfig[visit.status]
            return (
              <div
                key={visit.id}
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
                  <span className="text-[15px] font-semibold text-[#111113] leading-tight block">
                    {visit.name}
                  </span>
                  <span className="text-[13px] text-[#9CA3AF] block truncate mt-0.5">
                    {visit.services}
                  </span>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                  <div className="flex items-baseline justify-end">
                    <span className="text-[17px] font-bold text-[#111113] leading-tight">
                      {visit.amount}
                    </span>
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
      )}
    </div>
  )
}
