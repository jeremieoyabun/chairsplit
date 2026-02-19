"use client"

import { useState } from "react"

type Visit = {
  initials: string
  name: string
  services: string
  amount: string
  time: string
  color: string
  status: "validated" | "draft" | "cancelled"
}

type DayGroup = {
  label: string
  visits: Visit[]
}

const days: DayGroup[] = [
  {
    label: "MON FEB 9",
    visits: [
      { initials: "KB", name: "Karim B.", services: "Haircut/Fade, Beard Trim, Hot Towel", amount: "900", time: "14:32", color: "#3B82F6", status: "validated" },
      { initials: "AM", name: "Alex M.", services: "Haircut/Fade", amount: "400", time: "15:10", color: "#16A34A", status: "validated" },
      { initials: "KB", name: "Karim B.", services: "Haircut/Fade, Beard Trim", amount: "700", time: "11:20", color: "#3B82F6", status: "draft" },
      { initials: "YR", name: "Youssef R.", services: "Bald Head Shave, Shampoo", amount: "650", time: "10:05", color: "#F59E0B", status: "validated" },
      { initials: "AM", name: "Alex M.", services: "Haircut/Fade, Beard Coloring", amount: "1 400", time: "09:30", color: "#16A34A", status: "validated" },
    ],
  },
  {
    label: "SUN FEB 8",
    visits: [
      { initials: "KB", name: "Karim B.", services: "Haircut/Fade, Beard Trim, Facial Steamer", amount: "900", time: "16:00", color: "#3B82F6", status: "validated" },
      { initials: "AM", name: "Alex M.", services: "Bald Head Shave, Nose Wax", amount: "500", time: "14:00", color: "#16A34A", status: "cancelled" },
      { initials: "YR", name: "Youssef R.", services: "Haircut/Fade, Shampoo, Face Mask", amount: "1 000", time: "11:00", color: "#F59E0B", status: "validated" },
      { initials: "KB", name: "Karim B.", services: "Hair Coloring, Beard Coloring", amount: "2 500", time: "09:00", color: "#3B82F6", status: "validated" },
    ],
  },
]

const segments = ["Day", "Week", "Month"]

const kpis = [
  { value: "9", label: "visits" },
  { value: "8 200", label: "revenue", hasBaht: true },
  { value: "2 625", label: "comm.", hasBaht: true },
]

const statusConfig = {
  validated: { label: "Validated", bg: "#ECFDF5", text: "#16A34A" },
  draft: { label: "Draft", bg: "#FFFBEB", text: "#D97706" },
  cancelled: { label: "Cancelled", bg: "#FEF2F2", text: "#DC2626" },
}

export function History({ onVisitPress }: { onVisitPress?: () => void }) {
  const [activeSegment, setActiveSegment] = useState(1)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113] leading-tight">
          History
        </h1>
        <button type="button" className="text-[14px] font-semibold text-[#2563EB]">
          Export
        </button>
      </div>

      {/* Segment control */}
      <div className="mx-5 mt-2">
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

      {/* Dark KPI banner — centered content */}
      <div className="mx-5 mt-4">
        <div className="rounded-[20px] bg-[#1A1A1A] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex gap-2">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.06)] py-3.5 text-center"
              >
                <div className="flex items-baseline justify-center whitespace-nowrap">
                  <span className="text-[22px] font-bold text-[#FFFFFF] leading-none">
                    {kpi.value}
                  </span>
                  {kpi.hasBaht && (
                    <span className="text-[14px] text-[#6B7280] ml-0.5">
                      {"\u0E3F"}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#6B7280] block mt-1.5">
                  {kpi.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped visits */}
      {days.map((day) => (
        <div key={day.label}>
          <div className="px-5 mt-7 mb-3">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">
              {day.label}
            </span>
          </div>

          <div className="px-5 flex flex-col gap-2.5">
            {day.visits.map((visit, i) => {
              const badge = statusConfig[visit.status]
              return (
                <div
                  key={`${visit.initials}-${visit.time}-${i}`}
                  onClick={onVisitPress}
                  className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] w-full text-left active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: visit.color }}
                  >
                    <span className="text-[14px] font-semibold text-[#FFFFFF]">
                      {visit.initials}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[15px] font-semibold text-[#111113] block leading-tight">
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
                      <span className="text-[13px] text-[#9CA3AF] ml-0.5">
                        {"\u0E3F"}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#D1D5DB] block mt-0.5">
                      {visit.time}
                    </span>
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
        </div>
      ))}
    </div>
  )
}
