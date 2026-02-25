"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check, Clock, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type NotifItem = {
  id: string
  icon: typeof Check
  iconBg: string
  title: string
  body: string
  time: string
  unread: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days !== 1 ? "s" : ""} ago`
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

export function Notifications({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<NotifItem[]>([])
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

      const { data: raw } = await supabase
        .from("visits")
        .select("id, total_amount, status, visited_at, clients(name), barber:profiles!barber_id(full_name)")
        .eq("shop_id", profile.shop_id)
        .order("visited_at", { ascending: false })
        .limit(20)

      const rows = (raw ?? []) as any[]
      const notifs: NotifItem[] = rows.map((v, i) => {
        const barberName = (v.barber as { full_name: string } | null)?.full_name ?? "A barber"
        const clientName = (v.clients as { name: string } | null)?.name ?? "Walk-in"
        const amtStr = fmt(v.total_amount ?? 0)
        const isValidated = v.status === "validated"
        const isCancelled = v.status === "cancelled"
        return {
          id: v.id,
          icon: isValidated ? Check : isCancelled ? X : Clock,
          iconBg: isValidated ? "#16A34A" : isCancelled ? "#EF4444" : "#F59E0B",
          title: isValidated ? "Visit validated" : isCancelled ? "Visit cancelled" : "Draft pending",
          body: `${barberName} \u2014 ${clientName} \u2014 ${amtStr} \u0E3F`,
          time: timeAgo(v.visited_at),
          unread: i < 3,
        }
      })

      setItems(notifs)
      setLoading(false)
    }
    load()
  }, [])

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))

  return (
    <div className="flex flex-col min-h-full">
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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">Notifications</h1>
        <button
          type="button"
          onClick={markAllRead}
          className="text-[13px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity whitespace-nowrap"
        >
          Mark all read
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 mt-4 flex flex-col gap-2.5 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] text-[#9CA3AF]">No activity yet</span>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={`relative rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 ${!n.unread ? "opacity-60" : ""}`}
            >
              {n.unread && (
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#3B82F6]" />
              )}
              <div className="flex items-start gap-3 ml-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: n.iconBg }}
                >
                  <n.icon className="w-[16px] h-[16px] text-[#FFFFFF]" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[15px] font-semibold text-[#111113] leading-tight">{n.title}</span>
                    <span className="text-[11px] text-[#D1D5DB] whitespace-nowrap shrink-0">{n.time}</span>
                  </div>
                  <span className="text-[13px] text-[#6B7280] leading-relaxed block mt-1">{n.body}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
