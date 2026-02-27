"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type MonthStatement = {
  key: string
  month: string
  status: "en-cours" | "cloture"
  ca: string
  commissions: string
  charges: string
  resultat: string
  isNegative: boolean
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function Statements({ onBack }: { onBack: () => void }) {
  const [statements, setStatements] = useState<MonthStatement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const shop = await getShop()
      if (!shop) { setLoading(false); return }

      const supabase = createClient()
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
      sixMonthsAgo.setDate(1)
      sixMonthsAgo.setHours(0, 0, 0, 0)

      // Parallel: visits + rules + expenses
      const [visitsRes, rulesRes] = await Promise.all([
        supabase
          .from("visits")
          .select("total_amount, barber_id, visited_at, status")
          .eq("shop_id", shop.shopId)
          .eq("status", "validated")
          .gte("visited_at", sixMonthsAgo.toISOString())
          .order("visited_at", { ascending: false }),
        supabase
          .from("commission_rules")
          .select("barber_id, rate")
          .eq("shop_id", shop.shopId),
      ])

      const visits = visitsRes.data
      const rules = rulesRes.data

      const ruleMap: Record<string, number> = {}
      for (const r of rules ?? []) {
        if (r.barber_id) ruleMap[r.barber_id] = r.rate
      }
      const globalRate = rules?.find((r) => !r.barber_id)?.rate ?? 30

      // Load expenses per month
      let expensesByMonth: Record<string, number> = {}
      try {
        const { data: expenses } = await supabase
          .from("expenses")
          .select("amount, date")
          .eq("shop_id", shop.shopId)
          .gte("date", sixMonthsAgo.toISOString().split("T")[0])
        for (const e of expenses ?? []) {
          const key = (e.date ?? "").slice(0, 7) // "YYYY-MM"
          if (key) expensesByMonth[key] = (expensesByMonth[key] ?? 0) + (e.amount ?? 0)
        }
      } catch {
        expensesByMonth = {}
      }

      // Aggregate by month
      const monthMap: Record<string, { ca: number; commissions: number }> = {}
      for (const v of visits ?? []) {
        const key = (v.visited_at ?? "").slice(0, 7)
        if (!key) continue
        if (!monthMap[key]) monthMap[key] = { ca: 0, commissions: 0 }
        monthMap[key].ca += v.total_amount ?? 0
        const rate = ruleMap[v.barber_id] ?? globalRate
        monthMap[key].commissions += (v.total_amount ?? 0) * rate / 100
      }

      // Build sorted month list (last 6 months)
      const now = new Date()
      const result: MonthStatement[] = []
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        const data = monthMap[key] ?? { ca: 0, commissions: 0 }
        const charges = expensesByMonth[key] ?? 0
        const net = data.ca - data.commissions - charges
        const isCurrent = i === 0
        result.push({
          key,
          month: monthLabel(d.getFullYear(), d.getMonth()),
          status: isCurrent ? "en-cours" : "cloture",
          ca: fmt(data.ca),
          commissions: fmt(Math.round(data.commissions)),
          charges: fmt(charges),
          resultat: (net < 0 ? "-" : "") + fmt(Math.abs(Math.round(net))),
          isNegative: net < 0,
        })
      }

      setStatements(result.filter((s) => s.status === "en-cours" || monthMap[s.key]))
      setLoading(false)
    }
    load()
  }, [])

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
          Monthly Statements
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
        </div>
      ) : statements.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-[14px] text-[#9CA3AF]">No data yet</span>
        </div>
      ) : (
        <div className="px-5 mt-3 flex flex-col gap-4">
          {statements.map((s) => (
            <div
              key={s.key}
              className="rounded-[24px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[20px] font-semibold text-[#111113]">{s.month}</span>
                <span
                  className={`text-[11px] font-semibold px-3.5 py-[5px] rounded-full ${
                    s.status === "en-cours"
                      ? "bg-[#FFFBEB] text-[#D97706]"
                      : "bg-[#ECFDF5] text-[#16A34A]"
                  }`}
                >
                  {s.status === "en-cours" ? "In progress" : "Closed"}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <div className="rounded-[14px] bg-[#F8F8FA] p-4">
                  <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF] block">Revenue</span>
                  <span className="text-[20px] font-bold text-[#111113] block mt-1.5">{s.ca} {"\u0E3F"}</span>
                </div>
                <div className="rounded-[14px] bg-[#F8F8FA] p-4">
                  <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF] block">Commissions</span>
                  <span className="text-[20px] font-bold text-[#111113] block mt-1.5">{s.commissions} {"\u0E3F"}</span>
                </div>
                <div className="rounded-[14px] bg-[#F8F8FA] p-4">
                  <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF] block">Expenses</span>
                  <span className="text-[20px] font-bold text-[#111113] block mt-1.5">{s.charges} {"\u0E3F"}</span>
                </div>
                <div className={`rounded-[14px] p-4 ${s.isNegative ? "bg-[#FEF2F2]" : "bg-[#ECFDF5]"}`}>
                  <span className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#9CA3AF] block">
                    {"Net result"}
                  </span>
                  <span className={`text-[20px] font-bold block mt-1.5 ${s.isNegative ? "text-[#DC2626]" : "text-[#16A34A]"}`}>
                    {s.resultat} {"\u0E3F"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[12px] text-[#D1D5DB] px-5 mt-4 text-center leading-relaxed">
        {"This statement is a management tool. It does not replace a certified audit."}
      </p>
    </div>
  )
}
