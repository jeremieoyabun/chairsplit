"use client"

import { useState } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { AgendaView } from "./agenda-view"

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

function labelDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function Agenda({ onBack }: { onBack: () => void }) {
  const [date, setDate] = useState(new Date())

  const go = (days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    setDate(d)
  }

  const isToday =
    formatDate(date) === formatDate(new Date())

  return (
    <div className="flex flex-col min-h-full pb-10">
      {/* Top bar */}
      <div className="flex items-center px-5 pt-5 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-[#111113]" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-[#111113] mr-10">
          Agenda
        </h1>
      </div>

      {/* Date navigator */}
      <div className="mx-5 mt-2">
        <div className="flex items-center justify-between rounded-[16px] bg-[#F3F4F6] px-3 py-3">
          <button
            type="button"
            onClick={() => go(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-[#E5E7EB] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[15px] font-semibold text-[#111113]">
              {labelDate(date)}
            </span>
            {isToday && (
              <span className="text-[11px] text-[#2563EB] font-medium mt-0.5">Today</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-[#E5E7EB] transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
      </div>

      {/* Today shortcut */}
      {!isToday && (
        <button
          type="button"
          onClick={() => setDate(new Date())}
          className="text-[12px] font-medium text-[#2563EB] text-center mt-2 active:opacity-70 transition-opacity"
        >
          Back to today
        </button>
      )}

      {/* Agenda */}
      <div className="px-5 mt-4">
        <AgendaView date={formatDate(date)} />
      </div>
    </div>
  )
}
