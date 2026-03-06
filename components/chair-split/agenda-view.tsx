"use client"

import { useEffect, useState, useCallback } from "react"
import { CalendarDays, Loader2 } from "lucide-react"

type CalEvent = {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
}

function formatTime(iso: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AgendaView({
  date,
  compact = false,
}: {
  date: string
  compact?: boolean
}) {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [connected, setConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/google/events?date=${date}`)
      const json = await res.json()
      setConnected(json.connected ?? false)
      setEvents(json.events ?? [])
    } catch {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => { load() }, [load])

  const handleDisconnect = async () => {
    setDisconnecting(true)
    await fetch("/api/google/disconnect", { method: "POST" })
    setConnected(false)
    setEvents([])
    setDisconnecting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 text-[#D1D5DB] animate-spin" />
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="rounded-[20px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-[#9CA3AF]" />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-semibold text-[#111113]">Connect Google Calendar</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1 leading-relaxed">
            Sync your appointments to see them here.
          </p>
        </div>
        <a
          href="/api/google/connect"
          className="w-full text-center rounded-[12px] bg-[#1A1A1A] text-[#FFFFFF] py-3 text-[14px] font-semibold active:scale-[0.98] transition-transform block"
        >
          Connect Google Calendar →
        </a>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-[20px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-5 flex flex-col items-center gap-2">
        <CalendarDays className="w-6 h-6 text-[#D1D5DB]" />
        <p className="text-[13px] text-[#9CA3AF]">No appointments today</p>
        {!compact && (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-[11px] text-[#9CA3AF] underline underline-offset-2 mt-1 disabled:opacity-50"
          >
            {disconnecting ? "Disconnecting…" : "Disconnect Google Calendar"}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((ev) => (
        <div
          key={ev.id}
          className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
        >
          <div className="w-[3px] self-stretch rounded-full bg-[#4285F4] shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[14px] font-semibold text-[#111113] block truncate">
              {ev.title}
            </span>
            <span className="text-[12px] text-[#9CA3AF]">
              {ev.allDay
                ? "All day"
                : `${formatTime(ev.start)} – ${formatTime(ev.end)}`}
            </span>
          </div>
        </div>
      ))}

      {!compact && (
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="text-[11px] text-[#9CA3AF] underline underline-offset-2 text-center mt-1 disabled:opacity-50"
        >
          {disconnecting ? "Disconnecting…" : "Disconnect Google Calendar"}
        </button>
      )}
    </div>
  )
}
