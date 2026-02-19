"use client"

import { ChevronRight } from "lucide-react"

const kpis = [
  { value: "52.6K", label: "monthly revenue", hasBaht: true, isNegative: false },
  { value: "52.7K", label: "expenses", hasBaht: true, isNegative: false },
  { value: "-0.1K", label: "result", hasBaht: true, isNegative: true },
]

const tiles = [
  {
    emoji: "\uD83D\uDCB0",
    key: "expenses",
    title: "Shop expenses",
    subtitle: "5 expenses \u00B7 52 700 \u0E3F this month",
  },
  {
    emoji: "\uD83D\uDCCA",
    key: "statements",
    title: "Monthly reports",
    subtitle: "Results by month",
  },
  {
    emoji: "\uD83D\uDCC4",
    key: "payslips",
    title: "Payslips",
    subtitle: "Barber statements by month",
  },
]

export function Accounting({
  onExpensesPress,
  onStatementsPress,
  onPayslipsPress,
}: {
  onExpensesPress?: () => void
  onStatementsPress?: () => void
  onPayslipsPress?: () => void
}) {
  const handlers: Record<string, (() => void) | undefined> = {
    expenses: onExpensesPress,
    statements: onStatementsPress,
    payslips: onPayslipsPress,
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-[28px] font-bold text-[#111113] leading-tight">
          Finance
        </h1>
      </div>

      {/* Dark KPI Banner — centered, K format */}
      <div className="mx-5 mt-2">
        <div className="rounded-[20px] bg-[#1A1A1A] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex gap-2">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex-1 rounded-[14px] bg-[rgba(255,255,255,0.06)] py-3.5 text-center"
              >
                <div className="flex items-baseline justify-center whitespace-nowrap">
                  <span
                    className={`text-[22px] font-bold leading-none ${
                      kpi.isNegative ? "text-[#EF4444]" : "text-[#FFFFFF]"
                    }`}
                  >
                    {kpi.value}
                  </span>
                  {kpi.hasBaht && (
                    <span
                      className={`text-[14px] ml-0.5 ${
                        kpi.isNegative ? "text-[#EF4444]/60" : "text-[#6B7280]"
                      }`}
                    >
                      {"\u0E3F"}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#6B7280] block mt-1.5">
                  {kpi.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nav Tiles */}
      <div className="px-5 mt-7 flex flex-col gap-3.5">
        {tiles.map((tile) => (
          <button
            key={tile.key}
            type="button"
            onClick={handlers[tile.key]}
            className="relative rounded-[20px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] p-6 text-left active:scale-[0.99] transition-transform w-full"
          >
            <ChevronRight
              className="absolute top-6 right-5 w-[18px] h-[18px] text-[#D1D5DB]"
              strokeWidth={2}
            />
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center">
              <span className="text-[24px] leading-none">{tile.emoji}</span>
            </div>
            <span className="text-[17px] font-semibold text-[#111113] block mt-3.5">
              {tile.title}
            </span>
            <span className="text-[13px] text-[#9CA3AF] block mt-1">
              {tile.subtitle}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
