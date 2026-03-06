"use client"

import { useEffect, useState } from "react"
import { Bell, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"
import { AgendaView } from "./agenda-view"

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
  status: "validated" | "draft"
}

const statusConfig = {
  validated: { label: "Validated", bg: "#ECFDF5", text: "#16A34A" },
  draft: { label: "Draft", bg: "#FFFBEB", text: "#D97706" },
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

export function BarberHome({
  onSettingsPress,
  onNotificationsPress,
  onNewVisitPress,
  onViewAllPress,
  onVisitPress,
}: {
  onSettingsPress?: () => void
  onNotificationsPress?: () => void
  onNewVisitPress?: () => void
  onViewAllPress?: () => void
  onVisitPress?: (id: string) => void
}) {
  const [userId, setUserId] = useState<string | null>(null)
  const [shopId, setShopId] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [shopName, setShopName] = useState<string | null>(null)
  const [visits, setVisits] = useState<DisplayVisit[]>([])
  const [earnings, setEarnings] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [visitCount, setVisitCount] = useState(0)
  const [commissionPct, setCommissionPct] = useState<number | null>(null)
  const [avgTicket, setAvgTicket] = useState(0)
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [validatedToast, setValidatedToast] = useState<string | null>(null)

  const commissionRateRef = { current: 30 }

  const loadVisits = async (uid: string, shopId: string) => {
    const supabase = createClient()
    const { start, end } = todayRange()
    const [visitRes, rulesRes] = await Promise.all([
      supabase
        .from("visits")
        .select("id, total_amount, status, visited_at, client_id")
        .eq("barber_id", uid)
        .gte("visited_at", start)
        .lt("visited_at", end)
        .order("visited_at", { ascending: true }),
      supabase
        .from("commission_rules")
        .select("barber_id, rate")
        .eq("shop_id", shopId),
    ])

    if (visitRes.error) { console.error("[BarberHome]", visitRes.error.message); return }

    // Calculate commission rate
    const myRule = rulesRes.data?.find((r) => r.barber_id === uid)
    const globalRule = rulesRes.data?.find((r) => !r.barber_id)
    const rate = myRule?.rate ?? globalRule?.rate ?? 30
    commissionRateRef.current = rate

    const rawVisits = visitRes.data ?? []

    // Batch-fetch client names and visit services separately (FK joins fail with RLS)
    const clientIds = [...new Set(rawVisits.map((v: any) => v.client_id).filter(Boolean))]
    const visitIds = rawVisits.map((v: any) => v.id)
    const clientNames: Record<string, string> = {}
    const visitServicesMap: Record<string, string[]> = {}

    const batchPromises: PromiseLike<void>[] = []
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

    const rows = rawVisits as unknown as DbVisit[]
    const validated = rows.filter((v) => v.status === "validated")
    const totalRevenue = validated.reduce((s, v) => s + v.total_amount, 0)
    const totalCommission = Math.round(totalRevenue * rate / 100)
    const avgTkt = validated.length > 0 ? totalRevenue / validated.length : 0

    setRevenue(totalRevenue)
    setEarnings(totalCommission)
    setVisitCount(rows.length)
    setCommissionPct(rate)
    setAvgTicket(Math.round(avgTkt))

    setVisits(
      rows
        .filter((v) => v.status !== "cancelled")
        .map((v) => ({
          id: v.id,
          client: clientNames[(v as any).client_id] ?? "Walk-in",
          services: (visitServicesMap[v.id] ?? []).join(", ") || "—",
          amount: fmt(v.total_amount),
          time: new Date(v.visited_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          status: v.status as "validated" | "draft",
        }))
    )
    setLoading(false)
  }

  // Initial load
  useEffect(() => {
    const load = async () => {
      const shop = await getShop()
      if (!shop) { setLoading(false); return }
      setUserId(shop.userId)
      setShopId(shop.shopId)

      const supabase = createClient()
      // Parallel: profile name + unread count
      const [profileRes, countRes, shopRes] = await Promise.all([
        supabase.from("profiles").select("full_name, avatar_url").eq("id", shop.userId).single(),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", shop.userId).eq("is_read", false),
        supabase.from("shops").select("name").eq("id", shop.shopId).single(),
      ])

      if (profileRes.data?.full_name) setFullName(profileRes.data.full_name)
      if (profileRes.data?.avatar_url) setAvatarUrl(profileRes.data.avatar_url)
      if (shopRes.data?.name) setShopName(shopRes.data.name)
      setUnreadCount(countRes.count ?? 0)

      await loadVisits(shop.userId, shop.shopId)
    }
    load()
  }, [])

  // Realtime — visits UPDATE (detect validation) + notifications INSERT (unread dot)
  useEffect(() => {
    if (!userId || !shopId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`barber-home-${userId}`)
      // When a visit is updated (e.g., owner validates a draft)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "visits",
        filter: `barber_id=eq.${userId}`,
      }, (payload: any) => {
        if (payload.new?.status === "validated") {
          const amount = payload.new?.total_amount
          setValidatedToast(`Visit validated ✓${amount ? ` — ${fmt(amount)}\u0E3F` : ""}`)
          setTimeout(() => setValidatedToast(null), 4000)
        }
        loadVisits(userId, shopId)
      })
      // When a new notification arrives for this barber
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, () => {
        setUnreadCount((n) => n + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, shopId])

  // Reset unread count when notifications screen is opened
  const handleNotificationsPress = () => {
    setUnreadCount(0)
    onNotificationsPress?.()
  }

  const initials = fullName ? getInitials(fullName) : "—"
  const firstName = fullName.split(" ")[0] || "—"
  const today = new Date()
  const dateLabel = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const dayLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })

  const miniKpis = [
    { label: "VISITS", value: loading ? "—" : String(visitCount) },
    { label: "COMMISSION", value: loading ? "—" : commissionPct !== null ? `${commissionPct}%` : "—" },
    { label: "AVG. TICKET", value: loading ? "—" : fmt(avgTicket), hasBaht: !loading && avgTicket > 0 },
  ]

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Validated toast */}
      {validatedToast && (
        <div className="mx-5 mt-4 rounded-[14px] bg-[#ECFDF5] border border-[#BBF7D0] px-4 py-3 flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#16A34A] flex-1">{validatedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSettingsPress}
            className="w-11 h-11 rounded-full shrink-0 active:scale-95 transition-transform overflow-hidden"
            aria-label="Profile settings"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#3B82F6] flex items-center justify-center">
                <span className="text-[14px] font-semibold text-[#FFFFFF]">{initials}</span>
              </div>
            )}
          </button>
          <div>
            <span className="text-[22px] font-bold text-[#111113] leading-tight block">
              Hey, {firstName}
            </span>
            {shopName && (
              <span className="text-[13px] font-medium text-[#3B82F6] leading-tight block">
                {shopName}
              </span>
            )}
            <span className="text-[13px] text-[#9CA3AF] leading-tight block">
              {dayLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNotificationsPress}
          className="relative w-11 h-11 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] active:scale-95 transition-transform"
          aria-label="Notifications"
        >
          <Bell className="w-[22px] h-[22px] text-[#111113]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-[9px] h-[9px] rounded-full bg-[#EF4444] border-2 border-[#F0F0F3]" />
          )}
        </button>
      </div>

      {/* Dark Hero Card */}
      <div className="mx-5 mt-4">
        <div className="rounded-[24px] bg-[#1A1A1A] px-6 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6B7280]">
              MY EARNINGS TODAY
            </span>
            <span className="text-[12px] text-[#6B7280]">{dateLabel}</span>
          </div>

          <div className="mt-2 flex items-baseline">
            <span className="text-[44px] font-bold text-[#FFFFFF] leading-none tracking-tight">
              {loading ? "—" : fmt(earnings)}
            </span>
            <span className="text-[24px] text-[#6B7280] ml-1.5 font-normal">{"\u0E3F"}</span>
          </div>

          <span className="text-[13px] text-[#6B7280] block mt-1">
            {loading ? "" : `from ${fmt(revenue)} \u0E3F revenue`}
          </span>

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

      {/* Quick Action - New Visit CTA */}
      <div className="px-5 mt-6">
        <button
          type="button"
          onClick={onNewVisitPress}
          className="w-full rounded-[20px] bg-[#1A1A1A] px-5 py-5 flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3"/>
              <path d="M8.12 8.12 12 12"/>
              <path d="M20 4 8.12 15.88"/>
              <circle cx="6" cy="18" r="3"/>
              <path d="M14.8 14.8 20 20"/>
            </svg>
          </div>
          <span className="text-[18px] font-semibold text-[#FFFFFF] flex-1 text-left">New Visit</span>
          <ChevronRight className="w-5 h-5 text-[#6B7280]" />
        </button>
      </div>

      {/* Agenda */}
      <div className="px-5 mt-6">
        <h2 className="text-[18px] font-semibold text-[#111113] mb-3.5">
          {"Today\u2019s appointments"}
        </h2>
        <AgendaView date={new Date().toISOString().split("T")[0]} compact />
      </div>

      {/* My Visits Today */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[18px] font-semibold text-[#111113]">My visits</h2>
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
                  onClick={() => onVisitPress?.(visit.id)}
                  className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                    <span className="text-[14px] font-semibold text-[#FFFFFF]">{initials}</span>
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
    </div>
  )
}
