"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type DbVisit = {
  id: string
  total_amount: number
  status: string
  visited_at: string
  clients: { name: string } | null
  visit_services: { service_name: string }[]
  barber: { full_name: string } | null
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

export function RecentVisits({
  onVisitPress,
  onDraftPress,
  onViewAllPress,
}: {
  onVisitPress?: () => void
  onDraftPress?: () => void
  onViewAllPress?: () => void
}) {
  const [visits, setVisits] = useState<DisplayVisit[]>([])
  const [loading, setLoading] = useState(true)

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

      const { start, end } = todayRange()
      const { data: raw, error } = await supabase
        .from("visits")
        .select("id, total_amount, status, visited_at, clients(name), visit_services(service_name), barber:profiles!barber_id(full_name)")
        .eq("shop_id", profile.shop_id)
        .gte("visited_at", start)
        .lt("visited_at", end)
        .order("visited_at", { ascending: true })

      if (error) { console.error("[RecentVisits] visits:", error.message); setLoading(false); return }

      const rows = (raw ?? []) as DbVisit[]
      const display: DisplayVisit[] = rows.map((v) => {
        const barberName = v.barber?.full_name ?? "Unknown"
        return {
          id: v.id,
          initials: getInitials(barberName),
          name: v.clients?.name ?? "Walk-in",
          services: v.visit_services.map((s) => s.service_name).join(", ") || "—",
          amount: fmt(v.total_amount),
          time: new Date(v.visited_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          color: colorFor(barberName),
          status: v.status as "validated" | "draft" | "cancelled",
        }
      })

      setVisits(display)
      setLoading(false)
    }
    load()
  }, [])

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
          {visits.map((visit, i) => {
            const badge = statusConfig[visit.status]
            return (
              <div
                key={`${visit.id}-${i}`}
                onClick={visit.status === "draft" ? onDraftPress : onVisitPress}
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
