"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Bell, Check, Clock, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type DateGroup = "Today" | "Yesterday" | "This week" | "Earlier"

type NotifItem = {
  id: string
  icon: typeof Check
  iconBg: string
  title: string
  body: string
  time: string
  group: DateGroup
  unread: boolean
}

const SEEN_KEY = "cs_notifs_seen"
const GROUP_ORDER: DateGroup[] = ["Today", "Yesterday", "This week", "Earlier"]

function getGroup(dateStr: string): DateGroup {
  const now = new Date()
  const d = new Date(dateStr)
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((nowDay.getTime() - dDay.getTime()) / 86400000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays <= 7) return "This week"
  return "Earlier"
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Now"
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d`
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

export function Notifications({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<NotifItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Capture previous seen time before updating
    const prevSeen = localStorage.getItem(SEEN_KEY) ?? new Date(0).toISOString()
    localStorage.setItem(SEEN_KEY, new Date().toISOString())

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

      const { data: raw } = await supabase
        .from("visits")
        .select("id, total_amount, status, visited_at, clients(name), barber:profiles!barber_id(full_name)")
        .eq("shop_id", profile.shop_id)
        .order("visited_at", { ascending: false })
        .limit(30)

      const rows = (raw ?? []) as any[]
      const notifs: NotifItem[] = rows.map((v) => {
        const barberName = (v.barber as { full_name: string } | null)?.full_name ?? "A barber"
        const clientName = (v.clients as { name: string } | null)?.name ?? "Walk-in"
        const amtStr = fmt(v.total_amount ?? 0)
        const isValidated = v.status === "validated"
        const isCancelled = v.status === "cancelled"
        return {
          id: v.id,
          icon: isValidated ? Check : isCancelled ? X : Clock,
          iconBg: isValidated ? "#16A34A" : isCancelled ? "#EF4444" : "#F59E0B",
          title: isValidated ? "Visit validated" : isCancelled ? "Visit cancelled" : "Visit logged",
          body: isCancelled
            ? `${barberName} cancelled ${clientName}'s visit`
            : `${barberName} · ${clientName} · ${amtStr} ฿`,
          time: timeAgo(v.visited_at),
          group: getGroup(v.visited_at),
          unread: new Date(v.visited_at) > new Date(prevSeen),
        }
      })

      setItems(notifs)
      setLoading(false)
    }
    load()
  }, [])

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))

  const unreadCount = items.filter((n) => n.unread).length
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((n) => n.group === group),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="flex flex-col min-h-full bg-[#F0F0F3]">
      {/* Top bar */}
      <div className="flex items-center px-5 pt-5 pb-3 gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 transition-transform shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-[#111113]" />
        </button>
        <h1 className="flex-1 text-[18px] font-bold text-[#111113] flex items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] rounded-full bg-[#3B82F6] px-1.5 text-[11px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-[13px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity whitespace-nowrap"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-10">
        {loading ? (
          <div className="flex flex-col gap-2.5 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[16px] bg-[#FFFFFF] p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E5E7EB] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-[13px] bg-[#E5E7EB] rounded-full w-2/5" />
                    <div className="h-[12px] bg-[#E5E7EB] rounded-full w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center justify-center">
              <Bell className="w-7 h-7 text-[#D1D5DB]" />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-semibold text-[#111113]">All caught up</p>
              <p className="text-[13px] text-[#9CA3AF] mt-1">New visits and updates will appear here</p>
            </div>
          </div>
        ) : (
          grouped.map(({ group, items: groupItems }) => (
            <div key={group} className="mt-4">
              <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2.5 px-1">
                {group}
              </p>
              <div className="flex flex-col gap-2">
                {groupItems.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={`relative w-full text-left rounded-[16px] bg-[#FFFFFF] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 active:scale-[0.98] transition-all ${
                      n.unread ? "" : "opacity-55"
                    }`}
                  >
                    {/* Left accent for unread */}
                    {n.unread && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-[#3B82F6]" />
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: n.iconBg }}
                      >
                        <n.icon className="w-[16px] h-[16px] text-[#FFFFFF]" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[14px] leading-tight ${n.unread ? "font-semibold text-[#111113]" : "font-medium text-[#374151]"}`}>
                            {n.title}
                          </span>
                          <span className="text-[11px] text-[#D1D5DB] whitespace-nowrap shrink-0 pt-0.5">
                            {n.time}
                          </span>
                        </div>
                        <span className="text-[12px] text-[#6B7280] leading-relaxed block mt-0.5">
                          {n.body}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
