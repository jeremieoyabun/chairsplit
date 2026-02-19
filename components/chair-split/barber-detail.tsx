"use client"

import { useState } from "react"
import { ArrowLeft, Download } from "lucide-react"

const segments = ["Jour", "Semaine", "Mois"]

const kpis = [
  { value: "5", label: "visites" },
  { value: "4 100", label: "CA", hasBaht: true },
  { value: "1 230", label: "commission", hasBaht: true },
]

const recentVisits = [
  {
    services: "Haircut/Fade, Beard Trim, Hot Towel",
    amount: "900",
    time: "14:32",
  },
  {
    services: "Haircut/Fade, Beard Trim",
    amount: "700",
    time: "11:20",
  },
  {
    services: "Hair Coloring, Beard Coloring",
    amount: "2 500",
    time: "09:00",
  },
]

const commissionRules = [
  {
    service: "Tous les services",
    pillLabel: "d\u00E9faut",
    pillBg: "#F3F4F6",
    pillText: "#6B7280",
    rate: "30%",
  },
  {
    service: "Hair Coloring",
    pillLabel: "sp\u00E9cifique",
    pillBg: "#FEF9EE",
    pillText: "#D97706",
    rate: "40%",
  },
]

export function BarberDetail({ onBack }: { onBack: () => void }) {
  const [activeSegment, setActiveSegment] = useState(0)

  return (
    <div className="flex flex-col min-h-full pb-10">
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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113] -ml-10">
          Profil
        </h1>
        <button
          type="button"
          className="text-[14px] font-semibold text-[#2563EB] -ml-10"
        >
          Modifier
        </button>
      </div>

      {/* Hero section */}
      <div className="flex flex-col items-center px-5 pt-6 pb-2">
        {/* Large avatar */}
        <div className="w-20 h-20 rounded-full bg-[#3B82F6] flex items-center justify-center">
          <span className="text-[28px] font-bold text-[#FFFFFF]">KB</span>
        </div>
        <span className="text-[24px] font-bold text-[#111113] mt-3.5 leading-tight">
          Karim B.
        </span>
        <span className="text-[13px] text-[#9CA3AF] mt-1">
          Actif depuis janvier 2026
        </span>
      </div>

      {/* Segment control */}
      <div className="mx-5 mt-5">
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

      {/* Dark KPI card */}
      <div className="mx-5 mt-4">
        <div className="rounded-[20px] bg-[#1A1A1A] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex gap-2.5">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.06)] px-3 py-3.5"
              >
                <div className="flex items-baseline whitespace-nowrap">
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

      {/* Recent visits section */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">
            {"Visites r\u00E9centes"}
          </span>
          <button
            type="button"
            className="text-[13px] font-semibold text-[#2563EB]"
          >
            {"Tout voir \u2192"}
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {recentVisits.map((visit, i) => (
            <div
              key={`${visit.time}-${i}`}
              className="flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] px-4 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            >
              {/* Blue KB avatar */}
              <div className="w-11 h-11 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                <span className="text-[14px] font-semibold text-[#FFFFFF]">
                  KB
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-semibold text-[#111113] block leading-tight">
                  Karim B.
                </span>
                <span className="text-[13px] text-[#9CA3AF] block truncate mt-0.5">
                  {visit.services}
                </span>
              </div>

              {/* Right side */}
              <div className="text-right shrink-0">
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commissions section */}
      <div className="px-5 mt-7">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
          {"R\u00C8GLES APPLIQU\u00C9ES"}
        </span>

        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {commissionRules.map((rule, idx) => (
            <div
              key={rule.service}
              className={`flex items-center justify-between px-[18px] py-4 ${
                idx < commissionRules.length - 1
                  ? "border-b border-[#F5F5F7]"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#111113]">
                  {rule.service}
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none"
                  style={{
                    backgroundColor: rule.pillBg,
                    color: rule.pillText,
                  }}
                >
                  {rule.pillLabel}
                </span>
              </div>
              <span className="text-[18px] font-bold text-[#111113]">
                {rule.rate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Export button */}
      <div className="mx-5 mt-6">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2.5 rounded-[14px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-4 py-4 active:scale-[0.98] transition-transform"
        >
          <Download className="w-[18px] h-[18px] text-[#111113]" />
          <span className="text-[14px] font-semibold text-[#111113]">
            {"Exporter les donn\u00E9es"}
          </span>
        </button>
      </div>
    </div>
  )
}
