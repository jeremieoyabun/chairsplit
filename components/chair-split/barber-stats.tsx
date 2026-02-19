"use client"

import { useState } from "react"

const segments = ["This week", "This month", "All time"]

const topServices = [
  { emoji: "\u2702\uFE0F", name: "Haircut/Fade", visits: 24, revenue: "9,600", percent: 75 },
  { emoji: "\uD83E\uDE92", name: "Beard Trim", visits: 18, revenue: "5,400", percent: 56 },
  { emoji: "\uD83C\uDFA8", name: "Hair Coloring", visits: 8, revenue: "12,000", percent: 25 },
  { emoji: "\u2668\uFE0F", name: "Hot Towel", visits: 6, revenue: "1,200", percent: 19 },
]

const weeklyData = [
  { day: "M", visits: 6, active: false },
  { day: "T", visits: 8, active: false },
  { day: "W", visits: 5, active: false },
  { day: "T", visits: 7, active: false },
  { day: "F", visits: 4, active: false },
  { day: "S", visits: 3, active: false },
  { day: "S", visits: 0, active: false },
]

// Monday is today
weeklyData[0].active = true

const maxVisits = Math.max(...weeklyData.map((d) => d.visits), 1)

export function BarberStats() {
  const [activeSegment, setActiveSegment] = useState(0)

  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113]">My Stats</h1>
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

      {/* Dark Hero Card */}
      <div className="mx-5 mt-4">
        <div className="rounded-[24px] bg-[#1A1A1A] px-6 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6B7280] block">
            MY COMMISSION EARNED
          </span>
          <div className="mt-2 flex items-baseline">
            <span className="text-[44px] font-bold text-[#FFFFFF] leading-none tracking-tight">
              8 430
            </span>
            <span className="text-[24px] text-[#6B7280] ml-1.5 font-normal">
              {"\u0E3F"}
            </span>
          </div>
          <span className="text-[13px] text-[#6B7280] block mt-1">this month</span>
          <div className="inline-flex mt-3 px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(22,163,74,0.15)" }}>
            <span className="text-[11px] font-semibold text-[#16A34A]">+12% vs last month</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex gap-2.5 mx-5 mt-5">
        {[
          { value: "32", label: "total visits" },
          { value: "410", label: "avg. ticket", hasBaht: true },
          { value: "30%", label: "commission rate" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="flex-1 rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] py-4 text-center"
          >
            <div className="flex items-baseline justify-center">
              <span className="text-[22px] font-bold text-[#111113] leading-none">
                {kpi.value}
              </span>
              {kpi.hasBaht && (
                <span className="text-[13px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
              )}
            </div>
            <span className="text-[11px] text-[#9CA3AF] block mt-1">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Top Services */}
      <div className="px-5 mt-7">
        <span className="text-[18px] font-semibold text-[#111113] block mb-3">
          Top Services
        </span>
        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {topServices.map((svc, i) => (
            <div
              key={svc.name}
              className={`px-[18px] py-3.5 ${
                i < topServices.length - 1 ? "border-b border-[#F8F8FA]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] leading-none">{svc.emoji}</span>
                  <span className="text-[14px] font-medium text-[#111113]">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#9CA3AF]">{svc.visits} visits</span>
                  <div className="flex items-baseline">
                    <span className="text-[14px] font-semibold text-[#111113]">{svc.revenue}</span>
                    <span className="text-[11px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 h-[4px] rounded-full bg-[#F3F4F6] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#3B82F6]"
                  style={{ width: `${svc.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="px-5 mt-7">
        <span className="text-[18px] font-semibold text-[#111113] block mb-3">
          Weekly Activity
        </span>
        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-5">
          <div className="flex items-end justify-between h-[120px]">
            {weeklyData.map((d, i) => (
              <div key={`${d.day}-${i}`} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex-1 w-full flex items-end justify-center">
                  <div
                    className={`w-[18px] rounded-[6px] ${d.active ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"}`}
                    style={{ height: d.visits > 0 ? `${(d.visits / maxVisits) * 80}px` : "4px", minHeight: "4px" }}
                  />
                </div>
                <span className={`text-[11px] font-medium ${d.active ? "text-[#3B82F6]" : "text-[#9CA3AF]"}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
