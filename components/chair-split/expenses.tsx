"use client"

import { useState } from "react"
import { ArrowLeft, ChevronRight } from "lucide-react"

type Expense = {
  name: string
  date: string
  type: "Monthly" | "One-time"
  amount: string
  category: string
}

type Category = {
  emoji: string
  label: string
  total: string
  barColor: string
  barPercent: number
  items: Expense[]
}

const categories: Category[] = [
  {
    emoji: "\uD83C\uDFE0",
    label: "RENT",
    total: "35 000",
    barColor: "#6B7280",
    barPercent: 66,
    items: [
      { name: "Monthly rent", date: "01/02", type: "Monthly", amount: "35,000", category: "Rent" },
    ],
  },
  {
    emoji: "\uD83D\uDCE6",
    label: "SUPPLIES",
    total: "9 700",
    barColor: "#9CA3AF",
    barPercent: 18,
    items: [
      { name: "Hair products", date: "03/02", type: "Monthly", amount: "8,500", category: "Supplies" },
      { name: "Towels", date: "08/02", type: "One-time", amount: "1,200", category: "Supplies" },
    ],
  },
  {
    emoji: "\u26A1",
    label: "UTILITIES",
    total: "4 200",
    barColor: "#D1D5DB",
    barPercent: 8,
    items: [
      { name: "Electricity + water", date: "05/02", type: "Monthly", amount: "4,200", category: "Utilities" },
    ],
  },
  {
    emoji: "\uD83D\uDD27",
    label: "EQUIPMENT",
    total: "3 800",
    barColor: "#E5E7EB",
    barPercent: 7,
    items: [
      { name: "Wahl Clipper", date: "07/02", type: "One-time", amount: "3,800", category: "Equipment" },
    ],
  },
]

export function Expenses({ onBack }: { onBack: () => void }) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editCategory, setEditCategory] = useState("Rent")
  const [editFreq, setEditFreq] = useState<"Monthly" | "One-time">("Monthly")

  const openEdit = (item: Expense) => {
    setEditLabel(item.name)
    setEditAmount(item.amount)
    setEditCategory(item.category)
    setEditFreq(item.type)
    setEditingExpense(item)
  }

  return (
    <div className="flex flex-col min-h-full relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-[#111113]" strokeWidth={2} />
        </button>
        <h1 className="text-[17px] font-semibold text-[#111113]">Expenses</h1>
        <button
          type="button"
          className="text-[14px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity"
        >
          + Add
        </button>
      </div>

      {/* Total Hero Card */}
      <div className="mx-5 mt-2">
        <div className="rounded-[24px] bg-[#1A1A1A] px-7 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)] text-center">
          <div className="flex items-baseline justify-center">
            <span className="text-[38px] font-bold text-[#FFFFFF] leading-none">
              52 700
            </span>
            <span className="text-[20px] text-[#6B7280] ml-1">{"\u0E3F"}</span>
          </div>
          <span className="text-[13px] text-[#6B7280] mt-1.5 block">
            expenses this month
          </span>
          <div className="mt-4 flex h-[6px] rounded-full overflow-hidden">
            {categories.map((cat) => (
              <div
                key={cat.label}
                style={{ width: `${cat.barPercent}%`, backgroundColor: cat.barColor }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 px-5 flex flex-col gap-5 pb-8 flex-1 overflow-y-auto scrollbar-hide">
        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] leading-none">{cat.emoji}</span>
                <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-[0.05em]">
                  {cat.label}
                </span>
              </div>
              <span className="text-[13px] font-semibold text-[#9CA3AF]">
                {cat.total} {"\u0E3F"}
              </span>
            </div>

            <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {cat.items.map((item, i) => (
                <button
                  key={`${item.name}-${item.date}`}
                  type="button"
                  onClick={() => openEdit(item)}
                  className={`flex items-center px-[18px] py-4 w-full text-left active:bg-[#F9FAFB] transition-colors ${
                    i < cat.items.length - 1 ? "border-b border-[#F8F8FA]" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[14px] font-medium text-[#111113] block leading-tight">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12px] text-[#D1D5DB]">{item.date}</span>
                      <span className="text-[10px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full leading-none">
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-baseline">
                      <span className="text-[15px] font-semibold text-[#111113]">
                        {item.amount}
                      </span>
                      <span className="text-[12px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#D1D5DB]" strokeWidth={2} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="text-[12px] text-[#D1D5DB] text-center mt-2">
          Tap any expense to edit
        </p>
      </div>

      {/* Edit Expense Bottom Sheet */}
      {editingExpense && (
        <>
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40"
            onClick={() => setEditingExpense(null)}
            onKeyDown={() => {}}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">
              Edit expense
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  LABEL
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  AMOUNT
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
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
                    <option>Rent</option>
                    <option>Supplies</option>
                    <option>Utilities</option>
                    <option>Equipment</option>
                    <option>Taxes</option>
                    <option>Other</option>
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
                  FREQUENCY
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditFreq("Monthly")}
                    className={`flex-1 py-3 rounded-[12px] text-[14px] font-semibold transition-all ${
                      editFreq === "Monthly"
                        ? "bg-[#1A1A1A] text-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                        : "bg-[#FFFFFF] text-[#111113] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#F0F0F3]"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditFreq("One-time")}
                    className={`flex-1 py-3 rounded-[12px] text-[14px] font-semibold transition-all ${
                      editFreq === "One-time"
                        ? "bg-[#1A1A1A] text-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                        : "bg-[#FFFFFF] text-[#111113] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#F0F0F3]"
                    }`}
                  >
                    One-time
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditingExpense(null)}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditingExpense(null)}
              className="w-full text-center mt-3 text-[14px] font-medium text-[#DC2626] active:opacity-60 transition-opacity"
            >
              Delete expense
            </button>
          </div>
        </>
      )}
    </div>
  )
}
