"use client"

import { useState } from "react"

type Visit = {
  client: string
  services: string
  amount: string
  time: string
  status: "validated" | "draft"
}

const todayVisits: Visit[] = [
  { client: "Jean-Pierre D.", services: "Haircut/Fade, Beard Trim", amount: "700", time: "09:15", status: "validated" },
  { client: "Walk-in", services: "Hair Coloring", amount: "1 500", time: "10:00", status: "validated" },
  { client: "Tom B.", services: "Haircut/Fade", amount: "400", time: "14:15", status: "validated" },
]

const yesterdayVisits: Visit[] = [
  { client: "Oliver R.", services: "Haircut/Fade, Hot Towel", amount: "600", time: "09:30", status: "validated" },
  { client: "Marc S.", services: "Beard Trim, Shampoo", amount: "500", time: "11:00", status: "validated" },
  { client: "Walk-in", services: "Bald Shave", amount: "350", time: "13:45", status: "validated" },
  { client: "Nico P.", services: "Haircut/Fade, Beard Trim", amount: "700", time: "15:30", status: "validated" },
]

const statusConfig = {
  validated: { label: "Validated", bg: "#ECFDF5", text: "#16A34A" },
  draft: { label: "Draft", bg: "#FFFBEB", text: "#D97706" },
}

const segments = ["Day", "Week", "Month"]

const kpis = [
  { value: "12", label: "visits this week" },
  { value: "5 200", label: "revenue", hasBaht: true },
  { value: "1 560", label: "my earnings", hasBaht: true },
]

export function BarberHistory({
  onVisitPress,
}: {
  onVisitPress?: () => void
}) {
  const [activeSegment, setActiveSegment] = useState(0)

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113]">My History</h1>
      </div>

      {/* Segment */}
      <div className="px-5 mt-2">
        <div className="flex rounded-[12px] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-1">
          {segments.map((seg, i) => (
            <button
              key={seg}
              type="button"
              onClick={() => setActiveSegment(i)}
              className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all ${
                i === activeSegment
                  ? "bg-[#1A1A1A] text-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                  : "text-[#9CA3AF]"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Dark KPI banner */}
      <div className="mx-5 mt-4">
        <div className="rounded-[20px] bg-[#1A1A1A] px-4 py-5 flex gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="flex-1 text-center">
              <div className="flex items-baseline justify-center">
                <span className="text-[20px] font-bold text-[#FFFFFF] leading-none">
                  {kpi.value}
                </span>
                {kpi.hasBaht && (
                  <span className="text-[12px] text-[#6B7280] ml-0.5">{"\u0E3F"}</span>
                )}
              </div>
              <span className="text-[10px] text-[#6B7280] block mt-1">{kpi.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visits grouped by day */}
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3 px-1">
          TODAY
        </span>
        <div className="flex flex-col gap-2.5">
          {todayVisits.map((visit, i) => {
            const badge = statusConfig[visit.status]
            return (
              <button
                key={`today-${visit.client}-${visit.time}-${i}`}
                type="button"
                onClick={onVisitPress}
                className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] w-full text-left active:scale-[0.99] transition-transform"
              >
                <div className="w-11 h-11 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-semibold text-[#FFFFFF]">KB</span>
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
                  <div className="flex items-baseline">
                    <span className="text-[17px] font-bold text-[#111113]">{visit.amount}</span>
                    <span className="text-[13px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                  </div>
                  <span className="text-[11px] text-[#D1D5DB] mt-0.5">{visit.time}</span>
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 leading-none"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3 px-1">
          YESTERDAY
        </span>
        <div className="flex flex-col gap-2.5">
          {yesterdayVisits.map((visit, i) => {
            const badge = statusConfig[visit.status]
            return (
              <button
                key={`yesterday-${visit.client}-${visit.time}-${i}`}
                type="button"
                onClick={onVisitPress}
                className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] w-full text-left active:scale-[0.99] transition-transform"
              >
                <div className="w-11 h-11 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-semibold text-[#FFFFFF]">KB</span>
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
                  <div className="flex items-baseline">
                    <span className="text-[17px] font-bold text-[#111113]">{visit.amount}</span>
                    <span className="text-[13px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                  </div>
                  <span className="text-[11px] text-[#D1D5DB] mt-0.5">{visit.time}</span>
                  <span
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full mt-1 leading-none"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
