"use client"

import { Scissors, BarChart3 } from "lucide-react"

export function RoleSelect({ onSelect }: { onSelect: (role: "barber" | "owner") => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#F0F0F3] px-6">
      {/* Pill badge */}
      <div className="px-[18px] py-[6px] rounded-full bg-[#FFFFFF] shadow-[0_2px_10px_rgba(0,0,0,0.06)] mt-6">
        <span className="text-[11px] font-semibold text-[#111113] tracking-widest uppercase font-sans">
          ACCESS
        </span>
      </div>

      {/* Logo */}
      <img
        src="/images/logo-chairsplit.png"
        alt="chairsplit"
        className="h-[28px] w-auto mt-[18px]"
      />

      {/* Subtitle */}
      <span className="text-[14px] text-[#9CA3AF] font-sans italic mt-2">
        Choose how you want to use the app
      </span>

      {/* Two cards side by side */}
      <div className="flex gap-3.5 mt-10 w-full">
        {/* Card 1 - Track my work */}
        <button
          type="button"
          onClick={() => onSelect("barber")}
          className="flex-1 rounded-[24px] bg-[#FFFFFF] shadow-[0_4px_24px_rgba(0,0,0,0.08)] py-5 px-4 flex flex-col items-center text-center active:scale-[0.97] transition-transform"
        >
          {/* Replace src with Track.webp */}
          <div className="w-full h-[100px] rounded-[16px] bg-[#F4F4F6] flex items-center justify-center">
            <Scissors className="w-10 h-10 text-[#D1D5DB]" strokeWidth={1.2} />
          </div>
          <span className="text-[16px] font-semibold text-[#111113] mt-4 font-sans">
            Track my work
          </span>
          <span className="text-[11px] text-[#9CA3AF] font-sans mt-1">
            {"My visits \u00B7 My commissions"}
          </span>
        </button>

        {/* Card 2 - Run my shop */}
        <button
          type="button"
          onClick={() => onSelect("owner")}
          className="flex-1 rounded-[24px] bg-[#FFFFFF] shadow-[0_4px_24px_rgba(0,0,0,0.08)] py-5 px-4 flex flex-col items-center text-center active:scale-[0.97] transition-transform"
        >
          {/* Replace src with Run.webp */}
          <div className="w-full h-[100px] rounded-[16px] bg-[#F4F4F6] flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-[#D1D5DB]" strokeWidth={1.2} />
          </div>
          <span className="text-[16px] font-semibold text-[#111113] mt-4 font-sans">
            Run my shop
          </span>
          <span className="text-[11px] text-[#9CA3AF] font-sans mt-1">
            {"Team \u00B7 Finance \u00B7 Performance"}
          </span>
        </button>
      </div>
    </div>
  )
}
