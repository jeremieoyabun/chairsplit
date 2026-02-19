"use client"

import { ArrowLeft, User } from "lucide-react"

const services = [
  { emoji: "\u2702\uFE0F", name: "Haircut / Fade", amount: "400" },
  { emoji: "\uD83E\uDE92", name: "Beard Trim / Shave", amount: "300" },
  { emoji: "\u2668\uFE0F", name: "Hot Towel Shave", amount: "200" },
]

export function VisitDetail({
  onBack,
  status = "validated",
}: {
  onBack: () => void
  status?: "validated" | "draft"
}) {
  const isDraft = status === "draft"
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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113] -ml-10">
          {"D\u00E9tail visite"}
        </h1>
      </div>

      {/* Hero amount card */}
      <div className="mx-5 mt-6">
        <div className="rounded-[24px] bg-[#1A1A1A] px-7 py-7 flex flex-col items-center">
          {/* Amount */}
          <div className="flex items-baseline">
            <span className="text-[44px] font-bold text-[#FFFFFF] leading-none tracking-tight">
              900
            </span>
            <span className="text-[24px] text-[#6B7280] ml-1.5 font-normal">
              {"\u0E3F"}
            </span>
          </div>

          {/* Status badge */}
          <div
            className={`mt-4 px-4 py-1.5 rounded-full ${
              isDraft
                ? "bg-[rgba(217,119,6,0.15)]"
                : "bg-[rgba(22,163,74,0.15)]"
            }`}
          >
            <span
              className={`text-[12px] font-semibold ${
                isDraft ? "text-[#D97706]" : "text-[#16A34A]"
              }`}
            >
              {isDraft ? "Brouillon" : "Valid\u00E9"}
            </span>
          </div>

          {/* Date */}
          <span className="mt-3 text-[13px] text-[#6B7280]">
            {"10 f\u00E9v. 2026 \u00B7 14:32"}
          </span>
        </div>
      </div>

      {/* Barber & Client cards */}
      <div className="flex gap-2.5 mx-5 mt-5">
        {/* Barber card */}
        <div className="flex-1 rounded-[16px] bg-[#FFFFFF] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-[#FFFFFF]">KB</span>
            </div>
            <div className="min-w-0">
              <span className="text-[14px] font-semibold text-[#111113] block leading-tight truncate">
                Karim B.
              </span>
              <span className="text-[11px] text-[#9CA3AF] block leading-tight">
                Barbier
              </span>
            </div>
          </div>
        </div>

        {/* Client card */}
        <div className="flex-1 rounded-[16px] bg-[#FFFFFF] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <div className="min-w-0">
              <span className="text-[14px] font-semibold text-[#111113] block leading-tight truncate">
                Jean-Pierre D.
              </span>
              <span className="text-[11px] text-[#9CA3AF] block leading-tight">
                Client
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Services list */}
      <div className="mx-5 mt-5">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block">
          Services
        </span>
        <div className="mt-2.5 rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {services.map((service, idx) => (
            <div
              key={service.name}
              className={`flex items-center justify-between px-[18px] py-4 ${
                idx < services.length - 1 ? "border-b border-[#F8F8FA]" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[18px] leading-none">{service.emoji}</span>
                <span className="text-[14px] font-medium text-[#111113]">
                  {service.name}
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="text-[15px] font-semibold text-[#111113]">
                  {service.amount}
                </span>
                <span className="text-[12px] text-[#9CA3AF] ml-0.5">
                  {"\u0E3F"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission card — only for validated */}
      {!isDraft && (
        <div className="mx-5 mt-5">
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-[18px] border-l-[3px] border-l-[#16A34A]">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#6B7280]">
                Commission (30%)
              </span>
              <div className="flex items-baseline">
                <span className="text-[20px] font-bold text-[#16A34A]">
                  270
                </span>
                <span className="text-[14px] text-[#16A34A] ml-0.5">
                  {"\u0E3F"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="mx-5 mt-5 flex flex-col gap-1.5 px-1">
        <span className="text-[12px] text-[#D1D5DB]">
          {"Cr\u00E9\u00E9e \u00E0 14:32"}
        </span>
        {!isDraft && (
          <span className="text-[12px] text-[#D1D5DB]">
            {"Valid\u00E9e \u00E0 17:45"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mx-5 mt-6 pb-10 flex flex-col gap-2">
        {isDraft ? (
          <>
            <button
              type="button"
              className="w-full h-[56px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[15px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.18)] active:scale-[0.98] transition-transform"
            >
              Valider cette visite
            </button>
            <button
              type="button"
              className="w-full text-center text-[14px] font-medium text-[#DC2626] mt-2 active:opacity-60 transition-opacity"
            >
              Supprimer le brouillon
            </button>
          </>
        ) : (
          <button
            type="button"
            className="w-full text-center text-[14px] font-medium text-[#DC2626] active:opacity-60 transition-opacity"
          >
            Annuler cette visite
          </button>
        )}
      </div>
    </div>
  )
}
