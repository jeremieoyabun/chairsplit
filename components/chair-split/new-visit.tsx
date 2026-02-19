"use client"

import { useState } from "react"
import { ArrowLeft, ChevronDown, Search, Check } from "lucide-react"

type Service = {
  emoji: string
  name: string
  price: number
  selected: boolean
}

const barbers = [
  { initials: "KB", name: "Karim B.", color: "#3B82F6" },
  { initials: "AM", name: "Alex M.", color: "#16A34A" },
  { initials: "YR", name: "Youssef R.", color: "#F59E0B" },
]

const defaultHaircut: Service[] = [
  { emoji: "\u2702\uFE0F", name: "Haircut/Fade", price: 400, selected: true },
  { emoji: "\uD83E\uDE92", name: "Beard Trim", price: 300, selected: true },
  { emoji: "\u2668\uFE0F", name: "Hot Towel", price: 200, selected: true },
  { emoji: "\uD83C\uDFA8", name: "Hair Coloring", price: 1500, selected: false },
  { emoji: "\uD83D\uDC88", name: "Bald Shave", price: 350, selected: false },
  { emoji: "\uD83D\uDD8C\uFE0F", name: "Beard Color", price: 1000, selected: false },
  { emoji: "\uD83D\uDC87", name: "Line Up", price: 100, selected: false },
  { emoji: "\uD83E\uDDF4", name: "Shampoo", price: 300, selected: false },
]

const defaultFacial: Service[] = [
  { emoji: "\uD83D\uDC86", name: "Facial Steamer", price: 200, selected: false },
  { emoji: "\uD83E\uDDD6", name: "Face Mask", price: 300, selected: false },
  { emoji: "\uD83D\uDC43", name: "Nose Wax", price: 150, selected: false },
  { emoji: "\uD83D\uDC42", name: "Ear Wax", price: 100, selected: false },
]

function formatPrice(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

export function NewVisit({ onBack }: { onBack: () => void }) {
  const [selectedBarber, setSelectedBarber] = useState(0)
  const [showBarberPicker, setShowBarberPicker] = useState(false)
  const [haircuts, setHaircuts] = useState(defaultHaircut)
  const [facials, setFacials] = useState(defaultFacial)

  const toggleHaircut = (idx: number) => {
    setHaircuts((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, selected: !s.selected } : s))
    )
  }
  const toggleFacial = (idx: number) => {
    setFacials((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, selected: !s.selected } : s))
    )
  }

  const total =
    haircuts.filter((s) => s.selected).reduce((sum, s) => sum + s.price, 0) +
    facials.filter((s) => s.selected).reduce((sum, s) => sum + s.price, 0)

  const hasSelection = total > 0
  const barber = barbers[selectedBarber]

  const renderChip = (service: Service, onClick: () => void) => (
    <button
      key={service.name}
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 rounded-[14px] px-3.5 py-3 transition-all active:scale-[0.97] ${
        service.selected
          ? "bg-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          : "bg-[#FFFFFF] shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {service.selected && (
          <Check className="w-3 h-3 text-[#FFFFFF] shrink-0" strokeWidth={3} />
        )}
        <span className="text-[15px] leading-none">{service.emoji}</span>
        <span
          className={`text-[13px] font-medium leading-tight ${
            service.selected ? "text-[#FFFFFF] font-semibold" : "text-[#111113]"
          }`}
        >
          {service.name}
        </span>
      </div>
      <span
        className={`text-[11px] leading-none mt-0.5 ${
          service.selected ? "text-[rgba(255,255,255,0.5)]" : "text-[#9CA3AF]"
        }`}
      >
        {formatPrice(service.price)}
        {"\u0E3F"}
      </span>
    </button>
  )

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
          New Visit
        </h1>
      </div>

      {/* Barber selector */}
      <div className="px-5 mt-3">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2">
          BARBER
        </span>
        <button
          type="button"
          onClick={() => setShowBarberPicker(!showBarberPicker)}
          className="w-full flex items-center gap-3 rounded-[16px] bg-[#FFFFFF] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-transform"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: barber.color }}
          >
            <span className="text-[13px] font-semibold text-[#FFFFFF]">
              {barber.initials}
            </span>
          </div>
          <span className="text-[16px] font-semibold text-[#111113] flex-1 text-left">
            {barber.name}
          </span>
          <ChevronDown className="w-5 h-5 text-[#D1D5DB]" />
        </button>

        {/* Barber dropdown */}
        {showBarberPicker && (
          <div className="mt-2 rounded-[14px] bg-[#FFFFFF] shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden">
            {barbers.map((b, i) => (
              <button
                key={b.initials}
                type="button"
                onClick={() => { setSelectedBarber(i); setShowBarberPicker(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-[#F9FAFB] transition-colors ${
                  i < barbers.length - 1 ? "border-b border-[#F8F8FA]" : ""
                } ${i === selectedBarber ? "bg-[#F9FAFB]" : ""}`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: b.color }}
                >
                  <span className="text-[11px] font-semibold text-[#FFFFFF]">
                    {b.initials}
                  </span>
                </div>
                <span className="text-[14px] font-medium text-[#111113]">
                  {b.name}
                </span>
                {i === selectedBarber && (
                  <Check className="w-4 h-4 text-[#16A34A] ml-auto" strokeWidth={2.5} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Services: Haircut & Styling — 2 column grid */}
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
          Haircut & Styling
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          {haircuts.map((service, idx) => renderChip(service, () => toggleHaircut(idx)))}
        </div>
      </div>

      {/* Services: Facial Care — 2 column grid */}
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
          Facial Care
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          {facials.map((service, idx) => renderChip(service, () => toggleFacial(idx)))}
        </div>
      </div>

      {/* Client input */}
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2">
          CLIENT (OPTIONAL)
        </span>
        <div className="flex items-center gap-3 rounded-[14px] bg-[#FFFFFF] shadow-[0_1px_6px_rgba(0,0,0,0.04)] px-4 py-3.5">
          <Search className="w-[18px] h-[18px] text-[#D1D5DB] shrink-0" />
          <input
            type="text"
            placeholder="Search or create..."
            className="flex-1 text-[14px] text-[#111113] placeholder:text-[#D1D5DB] bg-transparent outline-none"
          />
        </div>
        <button
          type="button"
          className="text-[13px] font-semibold text-[#2563EB] mt-2 ml-1 active:opacity-60 transition-opacity"
        >
          + Add new client
        </button>
      </div>

      {/* Total zone */}
      <div className="px-5 mt-7">
        <div className="rounded-[20px] bg-[#1A1A1A] px-6 py-5 flex items-center justify-between">
          <span className="text-[14px] text-[#9CA3AF]">Total</span>
          <div className="flex items-baseline">
            <span className="text-[36px] font-bold text-[#FFFFFF] leading-none tracking-tight">
              {formatPrice(total)}
            </span>
            <span className="text-[20px] text-[#6B7280] ml-1 font-normal">
              {"\u0E3F"}
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-4 pb-8">
        <button
          type="button"
          disabled={!hasSelection}
          className={`w-full h-14 rounded-[14px] bg-[#1A1A1A] text-[16px] font-semibold text-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all ${
            !hasSelection ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          Confirm visit
        </button>
      </div>
    </div>
  )
}
