"use client"

import { Bell, ChevronRight } from "lucide-react"

type Visit = {
  client: string
  services: string
  amount: string
  time: string
  status: "validated" | "draft"
}

const visits: Visit[] = [
  { client: "Jean-Pierre D.", services: "Haircut/Fade, Beard Trim", amount: "700", time: "09:15", status: "validated" },
  { client: "Walk-in", services: "Haircut/Fade, Shampoo", amount: "700", time: "11:30", status: "draft" },
  { client: "Lucas M.", services: "Facial Steamer, Face Mask", amount: "500", time: "15:00", status: "validated" },
]

const statusConfig = {
  validated: { label: "Validated", bg: "#ECFDF5", text: "#16A34A" },
  draft: { label: "Draft", bg: "#FFFBEB", text: "#D97706" },
}

const miniKpis = [
  { label: "VISITS", value: "5" },
  { label: "COMMISSION", value: "30%" },
  { label: "AVG. TICKET", value: "410", hasBaht: true },
]

export function BarberHome({
  onSettingsPress,
  onNotificationsPress,
  onNewVisitPress,
  onViewAllPress,
}: {
  onSettingsPress?: () => void
  onNotificationsPress?: () => void
  onNewVisitPress?: () => void
  onViewAllPress?: () => void
}) {
  return (
    <div className="flex flex-col min-h-full pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSettingsPress}
            className="w-11 h-11 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            aria-label="Profile settings"
          >
            <span className="text-[14px] font-semibold text-[#FFFFFF]">KB</span>
          </button>
          <div>
            <span className="text-[22px] font-bold text-[#111113] leading-tight block">
              Hey, Karim
            </span>
            <span className="text-[13px] text-[#9CA3AF] leading-tight block">
              Monday, Feb 10
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNotificationsPress}
          className="w-11 h-11 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] active:scale-95 transition-transform"
          aria-label="Notifications"
        >
          <Bell className="w-[22px] h-[22px] text-[#111113]" />
        </button>
      </div>

      {/* Dark Hero Card */}
      <div className="mx-5 mt-4">
        <div className="rounded-[24px] bg-[#1A1A1A] px-6 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#6B7280]">
              MY EARNINGS TODAY
            </span>
            <span className="text-[12px] text-[#6B7280]">Feb 10, 2026</span>
          </div>

          <div className="mt-2 flex items-baseline">
            <span className="text-[44px] font-bold text-[#FFFFFF] leading-none tracking-tight">
              1 230
            </span>
            <span className="text-[24px] text-[#6B7280] ml-1.5 font-normal">
              {"\u0E3F"}
            </span>
          </div>

          <span className="text-[13px] text-[#6B7280] block mt-1">
            {"from 2 050 \u0E3F revenue"}
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
                    <span className="text-[14px] text-[#6B7280] ml-0.5">
                      {"\u0E3F"}
                    </span>
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
          <span className="text-[18px] font-semibold text-[#FFFFFF] flex-1 text-left">
            New Visit
          </span>
          <ChevronRight className="w-5 h-5 text-[#6B7280]" />
        </button>
      </div>

      {/* My Visits Today */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[18px] font-semibold text-[#111113]">
            My visits
          </h2>
          <button
            type="button"
            onClick={onViewAllPress}
            className="text-[13px] font-semibold text-[#2563EB]"
          >
            {"View all \u2192"}
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {visits.map((visit, i) => {
            const badge = statusConfig[visit.status]
            return (
              <div
                key={`${visit.client}-${visit.time}-${i}`}
                className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-transform cursor-pointer"
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
    </div>
  )
}
