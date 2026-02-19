"use client"

import { ArrowLeft, Download } from "lucide-react"

type StatementCard = {
  month: string
  status: "en-cours" | "cloture"
  ca: string
  commissions: string
  charges: string
  resultat: string
  isNegative: boolean
}

const statements: StatementCard[] = [
  {
    month: "F\u00E9vrier 2026",
    status: "en-cours",
    ca: "3 650",
    commissions: "1 225",
    charges: "52 700",
    resultat: "-49 050",
    isNegative: true,
  },
  {
    month: "Janvier 2026",
    status: "cloture",
    ca: "148 200",
    commissions: "44 460",
    charges: "47 700",
    resultat: "56 040",
    isNegative: false,
  },
]

export function Statements({ onBack }: { onBack: () => void }) {
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
          Bilans mensuels
        </h1>
      </div>

      {/* Cards */}
      <div className="px-5 mt-3 flex flex-col gap-4">
        {statements.map((s) => (
          <div
            key={s.month}
            className="rounded-[24px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-[20px] font-semibold text-[#111113]">
                {s.month}
              </span>
              <span
                className={`text-[11px] font-semibold px-3.5 py-[5px] rounded-full ${
                  s.status === "en-cours"
                    ? "bg-[#FFFBEB] text-[#D97706]"
                    : "bg-[#ECFDF5] text-[#16A34A]"
                }`}
              >
                {s.status === "en-cours" ? "En cours" : "Cl\u00F4tur\u00E9"}
              </span>
            </div>

            {/* 2x2 Grid */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <div className="rounded-[14px] bg-[#F8F8FA] p-4">
                <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF] block">
                  CA
                </span>
                <span className="text-[20px] font-bold text-[#111113] block mt-1.5">
                  {s.ca} {"\u0E3F"}
                </span>
              </div>
              <div className="rounded-[14px] bg-[#F8F8FA] p-4">
                <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF] block">
                  Commissions
                </span>
                <span className="text-[20px] font-bold text-[#111113] block mt-1.5">
                  {s.commissions} {"\u0E3F"}
                </span>
              </div>
              <div className="rounded-[14px] bg-[#F8F8FA] p-4">
                <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF] block">
                  Charges
                </span>
                <span className="text-[20px] font-bold text-[#111113] block mt-1.5">
                  {s.charges} {"\u0E3F"}
                </span>
              </div>
              <div
                className={`rounded-[14px] p-4 ${
                  s.isNegative ? "bg-[#FEF2F2]" : "bg-[#ECFDF5]"
                }`}
              >
                <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF] block">
                  {"R\u00E9sultat net"}
                </span>
                <span
                  className={`text-[20px] font-bold block mt-1.5 ${
                    s.isNegative ? "text-[#DC2626]" : "text-[#16A34A]"
                  }`}
                >
                  {s.resultat} {"\u0E3F"}
                </span>
              </div>
            </div>

            {/* Export row */}
            <button
              type="button"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 active:opacity-60 transition-opacity"
            >
              <Download className="w-4 h-4 text-[#6B7280]" strokeWidth={2} />
              <span className="text-[13px] font-semibold text-[#6B7280]">
                Exporter PDF
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[12px] text-[#D1D5DB] px-5 mt-4 text-center leading-relaxed">
        {"Ce relev\u00E9 est un outil de gestion. Il ne remplace pas un bilan certifi\u00E9."}
      </p>
    </div>
  )
}
