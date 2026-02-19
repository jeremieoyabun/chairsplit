"use client"

import { useState } from "react"
import { ArrowLeft, Download } from "lucide-react"

type Payslip = {
  initials: string
  name: string
  color: string
  status: "approved" | "pending"
  visits: number
  ca: string
  commission: string
}

const months = ["Jan 2026", "F\u00E9v 2026"]

const payslips: Payslip[] = [
  {
    initials: "KB",
    name: "Karim B.",
    color: "#3B82F6",
    status: "approved",
    visits: 42,
    ca: "63 000",
    commission: "18 900",
  },
  {
    initials: "AM",
    name: "Ali M.",
    color: "#16A34A",
    status: "approved",
    visits: 35,
    ca: "49 200",
    commission: "12 300",
  },
  {
    initials: "YR",
    name: "Youssef R.",
    color: "#F59E0B",
    status: "pending",
    visits: 28,
    ca: "35 000",
    commission: "10 500",
  },
]

export function Payslips({ onBack }: { onBack: () => void }) {
  const [activeMonth, setActiveMonth] = useState(0)

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
          Fiches de paie
        </h1>
      </div>

      {/* Month Segment */}
      <div className="mx-5 mt-4">
        <div className="flex rounded-[12px] bg-[#F3F4F6] p-1">
          {months.map((month, i) => (
            <button
              key={month}
              type="button"
              onClick={() => setActiveMonth(i)}
              className={`flex-1 text-center py-2.5 rounded-[10px] text-[13px] font-semibold transition-all ${
                activeMonth === i
                  ? "bg-[#FFFFFF] text-[#111113] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  : "text-[#9CA3AF]"
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Payslip Cards */}
      <div className="px-5 mt-5 flex flex-col gap-3.5">
        {payslips.map((p) => (
          <div
            key={p.initials}
            className="rounded-[20px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] px-[22px] py-[22px]"
          >
            {/* Header: avatar + name + badge */}
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: p.color }}
              >
                <span className="text-[14px] font-semibold text-[#FFFFFF]">
                  {p.initials}
                </span>
              </div>
              <span className="text-[17px] font-semibold text-[#111113] flex-1">
                {p.name}
              </span>
              <span
                className={`text-[11px] font-semibold px-3.5 py-[5px] rounded-full ${
                  p.status === "approved"
                    ? "bg-[#ECFDF5] text-[#16A34A]"
                    : "bg-[#FFFBEB] text-[#D97706]"
                }`}
              >
                {p.status === "approved" ? "Approuv\u00E9" : "En attente"}
              </span>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#F5F5F7] my-4" />

            {/* Stats */}
            <span className="text-[13px] text-[#9CA3AF]">
              {p.visits} visites {"\u00B7"} CA {p.ca} {"\u0E3F"}
            </span>

            {/* Commission highlight */}
            <div className="mt-3.5 rounded-[14px] bg-[#ECFDF5] py-4 px-4 text-center">
              <span className="text-[12px] font-medium text-[#16A34A] block">
                Commission due
              </span>
              <div className="flex items-baseline justify-center mt-1">
                <span className="text-[28px] font-bold text-[#16A34A] leading-none">
                  {p.commission}
                </span>
                <span className="text-[16px] text-[#16A34A] ml-1">
                  {"\u0E3F"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-5 mt-5">
        <button
          type="button"
          className="w-full h-[52px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[15px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.18)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <Download className="w-[18px] h-[18px]" strokeWidth={2} />
          Exporter toutes les fiches (ZIP)
        </button>
      </div>
    </div>
  )
}
