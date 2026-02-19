"use client"

import { useState } from "react"
import { ArrowLeft, Search, ChevronRight } from "lucide-react"

type Service = {
  emoji: string
  name: string
  price: string
  desc?: string
  active: boolean
  category: string
}

const allServices: Service[] = [
  { emoji: "\u2702\uFE0F", name: "Haircut / Fade", price: "400", category: "Haircut & Styling", active: true },
  { emoji: "\uD83D\uDC88", name: "Beard Trim", price: "200", category: "Haircut & Styling", active: true },
  { emoji: "\uD83C\uDFA8", name: "Hair Coloring", price: "1,500", category: "Haircut & Styling", active: true },
  { emoji: "\u2728", name: "Highlights", price: "2,000", category: "Haircut & Styling", active: true },
  { emoji: "\uD83D\uDC87", name: "Shampoo & Style", price: "300", category: "Haircut & Styling", active: true },
  { emoji: "\uD83E\uDDF4", name: "Hair Treatment", price: "800", category: "Haircut & Styling", active: true },
  { emoji: "\uD83E\uDE92", name: "Hot Towel Shave", price: "350", category: "Haircut & Styling", active: true },
  { emoji: "\uD83D\uDC86", name: "Scalp Massage", price: "250", category: "Haircut & Styling", active: true },
  { emoji: "\uD83D\uDC43", name: "Nose Wax", price: "100", category: "Facial Care", active: true },
  { emoji: "\uD83D\uDC42", name: "Ear Wax", price: "100", category: "Facial Care", active: true },
  { emoji: "\uD83E\uDDD6", name: "Face Mask", price: "400", category: "Facial Care", active: true },
  { emoji: "\u2668\uFE0F", name: "Steam Treatment", price: "300", category: "Facial Care", active: true },
]

const emojiOptions = ["\u2702\uFE0F", "\uD83C\uDFA8", "\uD83D\uDC88", "\u2668\uFE0F", "\uD83D\uDD8C\uFE0F", "\uD83E\uDE92", "\uD83D\uDC87", "\uD83E\uDDF4", "\uD83D\uDC86", "\uD83E\uDDD6", "\uD83D\uDC43", "\uD83D\uDC42"]

export function ServiceCatalog({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("")
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editCategory, setEditCategory] = useState("Haircut & Styling")
  const [editEmoji, setEditEmoji] = useState("\u2702\uFE0F")
  const [editDesc, setEditDesc] = useState("")
  const [editActive, setEditActive] = useState(true)

  const filtered = allServices.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  )

  const haircut = filtered.filter((s) => s.category === "Haircut & Styling")
  const facial = filtered.filter((s) => s.category === "Facial Care")

  const openEdit = (svc: Service) => {
    setEditName(svc.name)
    setEditPrice(svc.price)
    setEditCategory(svc.category)
    setEditEmoji(svc.emoji)
    setEditDesc(svc.desc || "")
    setEditActive(svc.active)
    setEditingService(svc)
  }

  return (
    <div className="flex flex-col min-h-full relative">
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
          Services
        </h1>
        <button
          type="button"
          className="text-[14px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity"
        >
          + Add
        </button>
      </div>

      {/* Search */}
      <div className="mx-5 mt-4">
        <div className="flex items-center gap-3 rounded-[14px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-4 py-3.5">
          <Search className="w-[18px] h-[18px] text-[#D1D5DB] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="flex-1 text-[14px] text-[#111113] placeholder:text-[#D1D5DB] bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Service lists */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        {haircut.length > 0 && (
          <div className="px-5 mt-5">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2.5 block px-1">
              {"HAIRCUT & STYLING \u00B7 "}{haircut.length}
            </span>
            <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {haircut.map((svc) => (
                <button
                  key={svc.name}
                  type="button"
                  onClick={() => openEdit(svc)}
                  className="flex items-center gap-3 px-[18px] py-4 border-b border-[#F8F8FA] last:border-b-0 w-full text-left active:bg-[#FAFAFA] transition-colors"
                >
                  <span className="text-[20px] leading-none shrink-0">{svc.emoji}</span>
                  <div className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[15px] font-medium text-[#111113] block leading-tight">
                      {svc.name}
                    </span>
                    {svc.desc && (
                      <span className="text-[12px] text-[#9CA3AF] block mt-0.5">
                        {svc.desc}
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] font-semibold text-[#111113] shrink-0">
                    {svc.price} {"\u0E3F"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {facial.length > 0 && (
          <div className="px-5 mt-6">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2.5 block px-1">
              {"FACIAL CARE \u00B7 "}{facial.length}
            </span>
            <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {facial.map((svc) => (
                <button
                  key={svc.name}
                  type="button"
                  onClick={() => openEdit(svc)}
                  className="flex items-center gap-3 px-[18px] py-4 border-b border-[#F8F8FA] last:border-b-0 w-full text-left active:bg-[#FAFAFA] transition-colors"
                >
                  <span className="text-[20px] leading-none shrink-0">{svc.emoji}</span>
                  <div className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[15px] font-medium text-[#111113] block leading-tight">
                      {svc.name}
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-[#111113] shrink-0">
                    {svc.price} {"\u0E3F"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {haircut.length === 0 && facial.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20">
            <Search className="w-12 h-12 text-[#D1D5DB]" />
            <span className="text-[14px] text-[#9CA3AF] mt-3">No services found</span>
          </div>
        )}
      </div>

      {/* Edit Service Bottom Sheet */}
      {editingService && (
        <>
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40"
            onClick={() => setEditingService(null)}
            onKeyDown={() => {}}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">
              Edit service
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  NAME
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  PRICE
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 pr-10 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">
                    {"\u0E3F"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  CATEGORY
                </label>
                <div className="relative">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150 appearance-none cursor-pointer"
                  >
                    <option>Haircut & Styling</option>
                    <option>Facial Care</option>
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
                  ICON
                </label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {emojiOptions.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEditEmoji(em)}
                      className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 transition-all ${
                        editEmoji === em
                          ? "bg-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                          : "bg-[#F7F7F9]"
                      }`}
                    >
                      <span className="text-[18px]">{em}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  DESCRIPTION (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="e.g. Black, brown..."
                  className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
                />
              </div>
              {/* Active toggle */}
              <div className="flex items-center justify-between px-1 mt-1">
                <span className="text-[15px] font-medium text-[#111113]">Active</span>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`relative w-[50px] h-[28px] rounded-full transition-colors ${
                    editActive ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
                  }`}
                >
                  <div
                    className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform ${
                      editActive ? "left-[25px]" : "left-[3px]"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="w-full text-center mt-3 text-[14px] font-medium text-[#DC2626] active:opacity-60 transition-opacity"
            >
              Delete service
            </button>
          </div>
        </>
      )}
    </div>
  )
}
