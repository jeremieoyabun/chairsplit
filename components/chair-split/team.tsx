"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PLAN_LIMITS } from "@/lib/plans"

type BarberRow = {
  id: string
  full_name: string | null
  initials: string
  color: string
  visitCount: number
  revenue: number
  commission: number
}

const COLORS = ["#3B82F6", "#16A34A", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

function getInitials(name: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function colorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}

function fmt(n: number): string {
  return n.toLocaleString("fr-FR")
}

function todayRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start.getTime() + 86_400_000)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function Team({
  onBarberPress,
  onAddBarberPress,
}: {
  onBarberPress?: (id: string) => void
  onAddBarberPress?: () => void
}) {
  const [barbers, setBarbers] = useState<BarberRow[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [plan, setPlan] = useState("free")
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
      const shopId = profile.shop_id

      // Load shop plan
      const { data: shop } = await supabase
        .from("shops")
        .select("plan")
        .eq("id", shopId)
        .single()
      setPlan(shop?.plan ?? "free")

      // Load barbers
      const { data: barberProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("shop_id", shopId)
        .eq("role", "barber")

      if (!barberProfiles?.length) { setLoading(false); return }

      // Load today's validated visits
      const { start, end } = todayRange()
      const { data: visits } = await supabase
        .from("visits")
        .select("barber_id, total_amount")
        .eq("shop_id", shopId)
        .eq("status", "validated")
        .gte("created_at", start)
        .lt("created_at", end)

      // Load commission rules
      const { data: rules } = await supabase
        .from("commission_rules")
        .select("barber_id, rate")
        .eq("shop_id", shopId)

      // Build rate map (barber-specific rules take priority)
      const ruleMap: Record<string, number> = {}
      for (const r of rules ?? []) {
        if (r.barber_id) ruleMap[r.barber_id] = r.rate
      }
      const globalRate = rules?.find(r => !r.barber_id)?.rate ?? 30

      // Aggregate visits per barber
      const statsMap: Record<string, { revenue: number; visits: number }> = {}
      for (const v of visits ?? []) {
        if (!statsMap[v.barber_id]) statsMap[v.barber_id] = { revenue: 0, visits: 0 }
        statsMap[v.barber_id].revenue += v.total_amount ?? 0
        statsMap[v.barber_id].visits += 1
      }

      let totalRev = 0
      const rows: BarberRow[] = barberProfiles.map(b => {
        const stats = statsMap[b.id] ?? { revenue: 0, visits: 0 }
        totalRev += stats.revenue
        const rate = ruleMap[b.id] ?? globalRate
        return {
          id: b.id,
          full_name: b.full_name,
          initials: getInitials(b.full_name),
          color: colorFor(b.id),
          visitCount: stats.visits,
          revenue: stats.revenue,
          commission: Math.round(stats.revenue * rate / 100),
        }
      })

      // Sort by revenue desc
      rows.sort((a, b) => b.revenue - a.revenue)
      setBarbers(rows)
      setTotalRevenue(totalRev)
      setLoading(false)
    }
    load()
  }, [])

  const limit = PLAN_LIMITS[plan] ?? 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113] leading-tight">
          Team
        </h1>
        <button
          type="button"
          onClick={onAddBarberPress}
          className="text-[14px] font-semibold text-[#2563EB]"
        >
          + Add barber
        </button>
      </div>

      {/* Dark KPI Banner */}
      <div className="mx-5 mt-2">
        <div className="rounded-[20px] bg-[#1A1A1A] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex">
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-1">
                <span className="text-[26px] font-bold text-[#FFFFFF] leading-none">
                  {barbers.length}
                </span>
                {limit > 0 && (
                  <span className="text-[16px] text-[#6B7280] font-normal">
                    {" / "}{limit}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B7280] mt-1.5 text-center">
                active barbers
              </span>
            </div>
            <div className="w-px bg-[rgba(255,255,255,0.08)] my-1" />
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-baseline whitespace-nowrap">
                <span className="text-[26px] font-bold text-[#FFFFFF] leading-none">
                  {totalRevenue > 0 ? fmt(totalRevenue) : "\u2014"}
                </span>
                {totalRevenue > 0 && (
                  <span className="text-[14px] text-[#6B7280] ml-0.5">
                    {"\u0E3F"}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B7280] mt-1.5 text-center">
                {"today\u2019s revenue"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barber Cards */}
      <div className="px-5 mt-6 flex flex-col gap-3 pb-6">
        {barbers.length === 0 ? (
          <div className="rounded-[20px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 flex flex-col items-center gap-3">
            <span className="text-[32px]">👥</span>
            <p className="text-[15px] font-semibold text-[#111113]">No barbers yet</p>
            <p className="text-[13px] text-[#9CA3AF] text-center">
              Tap &ldquo;+ Add barber&rdquo; to invite your first team member.
            </p>
          </div>
        ) : (
          barbers.map((barber) => {
            const pct = totalRevenue > 0 ? Math.round((barber.revenue / totalRevenue) * 100) : 0
            return (
              <div
                key={barber.id}
                onClick={() => onBarberPress?.(barber.id)}
                className="rounded-[20px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 cursor-pointer active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: barber.color }}
                  >
                    <span className="text-[15px] font-semibold text-[#FFFFFF]">
                      {barber.initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[17px] font-semibold text-[#111113] block leading-tight">
                      {barber.full_name ?? "\u2014"}
                    </span>
                    <span className="text-[13px] text-[#9CA3AF] block mt-0.5">
                      {barber.visitCount === 0
                        ? "No visits today"
                        : `${barber.visitCount} visit${barber.visitCount !== 1 ? "s" : ""} today`}
                    </span>
                  </div>
                </div>

                <div className="flex items-end mt-3.5">
                  <div className="flex-1">
                    <span className="text-[11px] text-[#9CA3AF] block">Revenue</span>
                    <div className="flex items-baseline mt-0.5">
                      <span className="text-[16px] font-semibold text-[#111113]">
                        {barber.revenue > 0 ? fmt(barber.revenue) : "\u2014"}
                      </span>
                      {barber.revenue > 0 && (
                        <span className="text-[12px] text-[#9CA3AF] ml-0.5">
                          {"\u0E3F"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <span className="text-[11px] text-[#9CA3AF] block">Commission</span>
                    <div className="flex items-baseline mt-0.5">
                      <span className="text-[16px] font-semibold text-[#16A34A]">
                        {barber.commission > 0 ? fmt(barber.commission) : "\u2014"}
                      </span>
                      {barber.commission > 0 && (
                        <span className="text-[12px] text-[#16A34A] ml-0.5">
                          {"\u0E3F"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[60px] h-1 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: barber.color }}
                      />
                    </div>
                    <span className="text-[11px] text-[#9CA3AF] tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
