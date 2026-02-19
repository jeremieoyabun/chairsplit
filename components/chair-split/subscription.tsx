"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"

const plans = [
  { name: "Starter", range: "1-5 barbiers", price: 590, annual: 472 },
  { name: "Pro", range: "6-15 barbiers", price: 990, annual: 792, current: true },
  { name: "Business", range: "16+ barbiers", price: 1690, annual: 1352 },
]

export function Subscription({ onBack }: { onBack: () => void }) {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="flex flex-col min-h-full">
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
          Abonnement
        </h1>
        <div className="w-10" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        {/* Current plan card */}
        <div className="mx-5 mt-5">
          <div className="relative rounded-[24px] bg-[#111113] p-6 overflow-hidden">
            {/* Green left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#16A34A] rounded-l-[24px]" />

            <div className="flex items-start justify-between">
              <span
                className="text-[24px] font-bold text-[#FFFFFF]"
                style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
              >
                Pro
              </span>
              <span className="text-[11px] font-semibold text-[#16A34A] bg-[rgba(22,163,74,0.15)] px-3 py-1 rounded-full">
                Actif
              </span>
            </div>

            <p className="text-[14px] text-[#9CA3AF] mt-2">
              {"6\u201315 barbiers \u00B7 990 \u0E3F/mois"}
            </p>

            <p className="text-[13px] text-[#6B7280] mt-1">
              {"Barbiers : "}
              <span className="text-[#FFFFFF] font-bold">3</span>
              {" / 15"}
            </p>

            <button
              type="button"
              className="w-full mt-4 rounded-[12px] bg-[#FFFFFF] py-3.5 text-center text-[14px] font-semibold text-[#111113] active:scale-[0.98] transition-transform"
            >
              {"G\u00E9rer l\u2019abonnement"}
            </button>
          </div>
        </div>

        {/* Plans section */}
        <div className="px-5 mt-7">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">
              Plans
            </span>

            {/* Toggle */}
            <div className="flex items-center gap-2">
              <span
                className={`text-[12px] font-medium ${!annual ? "text-[#111113]" : "text-[#9CA3AF]"}`}
              >
                Mensuel
              </span>
              <button
                type="button"
                onClick={() => setAnnual(!annual)}
                className={`relative w-[42px] h-[24px] rounded-full transition-colors ${
                  annual ? "bg-[#1A1A1A]" : "bg-[#E5E7EB]"
                }`}
                aria-label="Toggle annual pricing"
              >
                <div
                  className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-[#FFFFFF] shadow-sm transition-transform ${
                    annual ? "translate-x-[20px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
              <span
                className={`text-[12px] font-medium ${annual ? "text-[#111113]" : "text-[#9CA3AF]"}`}
              >
                Annuel
                <span className="text-[#16A34A] font-semibold ml-0.5">(-20%)</span>
              </span>
            </div>
          </div>

          {/* Plan cards */}
          <div className="flex flex-col gap-2.5">
            {plans.map((plan) => {
              const displayPrice = annual ? plan.annual : plan.price
              const formatted = displayPrice.toLocaleString("fr-FR").replace(/\s/g, " ")

              return (
                <div
                  key={plan.name}
                  className={`rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-[18px] py-[18px] relative ${
                    plan.current ? "border-2 border-[#1A1A1A]" : ""
                  }`}
                >
                  {plan.current && (
                    <span className="absolute top-3 right-4 text-[10px] font-semibold text-[#111113] bg-[#F4F4F5] px-2.5 py-1 rounded-full">
                      Actuel
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-[16px] font-semibold text-[#111113]"
                          style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
                        >
                          {plan.name}
                        </span>
                        <span className="text-[13px] text-[#9CA3AF]">
                          {plan.range}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline shrink-0">
                      <span
                        className="text-[20px] font-bold text-[#111113]"
                        style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
                      >
                        {formatted}
                      </span>
                      <span className="text-[13px] text-[#9CA3AF] ml-1">
                        {"\u0E3F/mo"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
