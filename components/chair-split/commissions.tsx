"use client"

import { useState } from "react"
import { ArrowLeft, Info } from "lucide-react"

const specificRules = [
  {
    initials: "KB",
    name: "Karim B.",
    color: "#3B82F6",
    rate: "40%",
    scope: "Hair Coloring only",
    pillLabel: "override",
    pillBg: "#FEF9EE",
    pillText: "#D97706",
  },
  {
    initials: "AM",
    name: "Alex M.",
    color: "#16A34A",
    rate: "25%",
    scope: "All services",
    pillLabel: null,
    pillBg: "",
    pillText: "",
  },
]

export function Commissions({ onBack }: { onBack: () => void }) {
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [ruleBarber, setRuleBarber] = useState("")
  const [ruleService, setRuleService] = useState("All services")
  const [ruleRate, setRuleRate] = useState("")

  return (
    <div className="flex flex-col min-h-full pb-10 relative">
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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">
          Commission Rules
        </h1>
        <button
          type="button"
          onClick={() => setShowAddSheet(true)}
          className="text-[14px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity"
        >
          + Add
        </button>
      </div>

      {/* Default rule hero */}
      <div className="mx-5 mt-5">
        <div className="rounded-[24px] bg-[#1A1A1A] px-7 py-7 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <span className="text-[52px] font-bold text-[#FFFFFF] leading-none block">
            30%
          </span>
          <span className="text-[14px] text-[#6B7280] block mt-2">
            Default rule
          </span>
          <span className="text-[12px] text-[#9CA3AF] block mt-1">
            {"All barbers \u00B7 All services"}
          </span>
          <div className="inline-flex mt-3 px-3.5 py-1 rounded-full bg-[rgba(22,163,74,0.2)]">
            <span className="text-[11px] font-semibold text-[#16A34A]">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Specific rules section */}
      <div className="px-5 mt-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">
            SPECIFIC RULES
          </span>
          <span className="w-5 h-5 rounded-full bg-[#EEEFF2] text-[11px] font-semibold text-[#6B7280] flex items-center justify-center">
            2
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {specificRules.map((rule) => (
            <button
              key={`${rule.initials}-${rule.rate}`}
              type="button"
              className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-[18px] text-left active:scale-[0.99] transition-transform w-full"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: rule.color }}
                  >
                    <span className="text-[11px] font-semibold text-[#FFFFFF]">
                      {rule.initials}
                    </span>
                  </div>
                  <span className="text-[15px] font-semibold text-[#111113]">
                    {rule.name}
                  </span>
                </div>
                <span className="text-[24px] font-bold text-[#111113]">
                  {rule.rate}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 ml-11">
                <span className="text-[13px] text-[#9CA3AF]">
                  {rule.scope}
                </span>
                {rule.pillLabel && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none"
                    style={{ backgroundColor: rule.pillBg, color: rule.pillText }}
                  >
                    {rule.pillLabel}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info card */}
      <div className="mx-5 mt-5">
        <div className="rounded-[14px] bg-[#F0F7FF] px-4 py-4 flex items-start gap-3">
          <Info className="w-[18px] h-[18px] text-[#2563EB] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#2563EB] leading-relaxed">
            Specific rules always take priority over the default rule.
          </span>
        </div>
      </div>

      {/* Add Commission Rule Bottom Sheet */}
      {showAddSheet && (
        <>
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40"
            onClick={() => setShowAddSheet(false)}
            onKeyDown={() => {}}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">
              New commission rule
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  BARBER
                </label>
                <div className="relative">
                  <select
                    value={ruleBarber}
                    onChange={(e) => setRuleBarber(e.target.value)}
                    className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150 appearance-none cursor-pointer"
                  >
                    <option value="">Select barber...</option>
                    <option>All barbers</option>
                    <option>Karim B.</option>
                    <option>Alex M.</option>
                    <option>Youssef R.</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                      <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  SERVICE
                </label>
                <div className="relative">
                  <select
                    value={ruleService}
                    onChange={(e) => setRuleService(e.target.value)}
                    className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150 appearance-none cursor-pointer"
                  >
                    <option>All services</option>
                    <option>Haircut / Fade</option>
                    <option>Beard Trim</option>
                    <option>Hair Coloring</option>
                    <option>Highlights</option>
                    <option>Shampoo & Style</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                      <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  COMMISSION RATE
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={ruleRate}
                    onChange={(e) => setRuleRate(e.target.value)}
                    placeholder="30"
                    className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 pr-10 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Info note */}
            <div className="rounded-[12px] bg-[#F0F7FF] px-4 py-3.5 flex items-start gap-3 mt-4">
              <Info className="w-[16px] h-[16px] text-[#2563EB] shrink-0 mt-0.5" />
              <span className="text-[12px] text-[#2563EB] leading-relaxed">
                Specific rules override the default rate for the selected barber/service combination.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAddSheet(false)}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              Add rule
            </button>
          </div>
        </>
      )}
    </div>
  )
}
