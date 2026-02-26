"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type DbExpense = {
  id: string
  name: string
  amount: number
  category: string
  frequency: "monthly" | "one-time"
  date: string
}

type CategoryGroup = {
  emoji: string
  label: string
  total: number
  barColor: string
  barPercent: number
  items: DbExpense[]
}

const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  Rent: { emoji: "\uD83C\uDFE0", color: "#6B7280" },
  Supplies: { emoji: "\uD83D\uDCE6", color: "#9CA3AF" },
  Utilities: { emoji: "\u26A1", color: "#D1D5DB" },
  Equipment: { emoji: "\uD83D\uDD27", color: "#E5E7EB" },
  Taxes: { emoji: "\uD83D\uDCCA", color: "#374151" },
  Other: { emoji: "\uD83D\uDCB0", color: "#6B7280" },
}

const inputClass =
  "w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

export function Expenses({ onBack }: { onBack: () => void }) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editingExpense, setEditingExpense] = useState<DbExpense | null>(null)
  const [showAddSheet, setShowAddSheet] = useState(false)

  // Edit form state
  const [editLabel, setEditLabel] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editCategory, setEditCategory] = useState("Rent")
  const [editFreq, setEditFreq] = useState<"monthly" | "one-time">("monthly")
  const [editDate, setEditDate] = useState(new Date().toISOString().split("T")[0])
  const [saving, setSaving] = useState(false)

  const loadExpenses = async (sid: string) => {
    const supabase = createClient()
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("expenses")
      .select("id, name, amount, category, frequency, date")
      .eq("shop_id", sid)
      .or(`frequency.eq.monthly,and(frequency.eq.one-time,date.gte.${monthStart},date.lt.${monthEnd})`)
      .order("date", { ascending: false })

    if (error) { console.error("[Expenses] load:", error.message); return }

    const rows = (data ?? []) as DbExpense[]
    const totalAmt = rows.reduce((s, e) => s + (e.amount ?? 0), 0)
    setTotal(totalAmt)

    // Group by category
    const grouped: Record<string, DbExpense[]> = {}
    for (const e of rows) {
      if (!grouped[e.category]) grouped[e.category] = []
      grouped[e.category].push(e)
    }

    const groups: CategoryGroup[] = Object.entries(grouped).map(([cat, items]) => {
      const catTotal = items.reduce((s, e) => s + (e.amount ?? 0), 0)
      const meta = CATEGORY_META[cat] ?? { emoji: "\uD83D\uDCB0", color: "#9CA3AF" }
      return {
        emoji: meta.emoji,
        label: cat.toUpperCase(),
        total: catTotal,
        barColor: meta.color,
        barPercent: totalAmt > 0 ? Math.round((catTotal / totalAmt) * 100) : 0,
        items,
      }
    }).sort((a, b) => b.total - a.total)

    setCategories(groups)
  }

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single()

      if (!profile?.shop_id) { setLoading(false); return }
      setShopId(profile.shop_id)
      await loadExpenses(profile.shop_id)
      setLoading(false)
    }
    init()
  }, [])

  const openEdit = (item: DbExpense) => {
    setEditLabel(item.name)
    setEditAmount(String(item.amount))
    setEditCategory(item.category)
    setEditFreq(item.frequency)
    setEditDate(item.date)
    setEditingExpense(item)
    setShowAddSheet(false)
  }

  const openAdd = () => {
    setEditLabel("")
    setEditAmount("")
    setEditCategory("Rent")
    setEditFreq("monthly")
    setEditDate(new Date().toISOString().split("T")[0])
    setEditingExpense(null)
    setShowAddSheet(true)
  }

  const handleSave = async () => {
    if (!shopId || !editLabel.trim()) return
    const amtNum = parseFloat(editAmount.replace(/\s/g, "").replace(",", ".")) || 0
    setSaving(true)
    const supabase = createClient()

    const date = editFreq === "one-time" ? editDate : new Date().toISOString().split("T")[0]
    if (editingExpense) {
      await supabase
        .from("expenses")
        .update({ name: editLabel.trim(), amount: amtNum, category: editCategory, frequency: editFreq, date })
        .eq("id", editingExpense.id)
    } else {
      await supabase.from("expenses").insert({
        shop_id: shopId,
        name: editLabel.trim(),
        amount: amtNum,
        category: editCategory,
        frequency: editFreq,
        date,
      })
    }

    setSaving(false)
    setEditingExpense(null)
    setShowAddSheet(false)
    await loadExpenses(shopId)
  }

  const handleDelete = async () => {
    if (!editingExpense || !shopId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from("expenses").delete().eq("id", editingExpense.id)
    setSaving(false)
    setEditingExpense(null)
    await loadExpenses(shopId)
  }

  const sheetOpen = !!editingExpense || showAddSheet

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
          onClick={openAdd}
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
              {loading ? "—" : fmt(total)}
            </span>
            <span className="text-[20px] text-[#6B7280] ml-1">{"\u0E3F"}</span>
          </div>
          <span className="text-[13px] text-[#6B7280] mt-1.5 block">expenses this month</span>
          {categories.length > 0 && (
            <div className="mt-4 flex h-[6px] rounded-full overflow-hidden">
              {categories.map((cat) => (
                <div key={cat.label} style={{ width: `${cat.barPercent}%`, backgroundColor: cat.barColor }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 px-5 flex flex-col gap-5 pb-8 flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-[14px] text-[#9CA3AF]">No expenses this month</span>
            <button
              type="button"
              onClick={openAdd}
              className="mt-4 text-[14px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity"
            >
              + Add your first expense
            </button>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.label}>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] leading-none">{cat.emoji}</span>
                  <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-[0.05em]">{cat.label}</span>
                </div>
                <span className="text-[13px] font-semibold text-[#9CA3AF]">{fmt(cat.total)} {"\u0E3F"}</span>
              </div>
              <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                {cat.items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openEdit(item)}
                    className={`flex items-center px-[18px] py-4 w-full text-left active:bg-[#F9FAFB] transition-colors ${
                      i < cat.items.length - 1 ? "border-b border-[#F8F8FA]" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-medium text-[#111113] block leading-tight">{item.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] text-[#D1D5DB]">{item.date}</span>
                        <span className="text-[10px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded-full leading-none">
                          {item.frequency === "monthly" ? "Monthly" : "One-time"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-baseline">
                        <span className="text-[15px] font-semibold text-[#111113]">{fmt(item.amount)}</span>
                        <span className="text-[12px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D1D5DB]" strokeWidth={2} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom sheet */}
      {sheetOpen && (
        <>
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40"
            onClick={() => { setEditingExpense(null); setShowAddSheet(false) }}
            onKeyDown={() => {}}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">
              {editingExpense ? "Edit expense" : "Add expense"}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">LABEL</label>
                <input autoFocus type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className={inputClass} placeholder="e.g. Monthly rent" />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">AMOUNT</label>
                <div className="relative">
                  <input type="text" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className={inputClass + " pr-10"} placeholder="0" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">{"\u0E3F"}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">CATEGORY</label>
                <div className="relative">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 transition-all appearance-none cursor-pointer"
                  >
                    {Object.keys(CATEGORY_META).map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">FREQUENCY</label>
                <div className="flex gap-2">
                  {(["monthly", "one-time"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setEditFreq(f)}
                      className={`flex-1 py-3 rounded-[12px] text-[14px] font-semibold transition-all ${
                        editFreq === f
                          ? "bg-[#1A1A1A] text-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                          : "bg-[#FFFFFF] text-[#111113] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#F0F0F3]"
                      }`}
                    >
                      {f === "monthly" ? "Monthly" : "One-time"}
                    </button>
                  ))}
                </div>
              </div>
              {editFreq === "one-time" && (
                <div>
                  <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">DATE</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:opacity-50"
            >
              {saving ? "Saving…" : editingExpense ? "Save changes" : "Add expense"}
            </button>
            {editingExpense && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="w-full text-center mt-3 text-[14px] font-medium text-[#DC2626] active:opacity-60 transition-opacity"
              >
                Delete expense
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
