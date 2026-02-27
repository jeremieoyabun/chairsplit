"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type PayslipData = {
  barberId: string
  name: string
  initials: string
  color: string
  visits: number
  revenue: number
  commission: number
  rate: number
}

const COLORS = ["#3B82F6", "#16A34A", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"]

function colorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("fr-FR")
}

function getMonthOptions() {
  const options: { label: string; value: string }[] = []
  const now = new Date()
  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    options.push({
      label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    })
  }
  return options
}

function monthRange(monthValue: string) {
  const [y, m] = monthValue.split("-").map(Number)
  const start = new Date(y, m - 1, 1)
  const end = new Date(y, m, 1)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function Payslips({ onBack }: { onBack: () => void }) {
  const months = getMonthOptions()
  const [activeMonth, setActiveMonth] = useState(0)
  const [payslips, setPayslips] = useState<PayslipData[]>([])
  const [shopId, setShopId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const shop = await getShop()
      if (!shop) { setLoading(false); return }
      setShopId(shop.shopId)

      const supabase = createClient()
      const { start, end } = monthRange(months[activeMonth].value)

      // Parallel: barbers + rules + visits
      const [barbersRes, rulesRes, visitsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("shop_id", shop.shopId)
          .eq("role", "barber"),
        supabase
          .from("commission_rules")
          .select("barber_id, rate")
          .eq("shop_id", shop.shopId),
        supabase
          .from("visits")
          .select("barber_id, total_amount")
          .eq("shop_id", shop.shopId)
          .eq("status", "validated")
          .gte("visited_at", start)
          .lt("visited_at", end),
      ])

      const barbers = barbersRes.data
      if (!barbers?.length) { setLoading(false); return }

      const rules = rulesRes.data
      const ruleMap: Record<string, number> = {}
      for (const r of rules ?? []) {
        if (r.barber_id) ruleMap[r.barber_id] = r.rate
      }
      const globalRate = rules?.find(r => !r.barber_id)?.rate ?? 30

      const visits = visitsRes.data

      // Aggregate per barber
      const statsMap: Record<string, { revenue: number; visits: number }> = {}
      for (const v of visits ?? []) {
        if (!statsMap[v.barber_id]) statsMap[v.barber_id] = { revenue: 0, visits: 0 }
        statsMap[v.barber_id].revenue += v.total_amount ?? 0
        statsMap[v.barber_id].visits += 1
      }

      const rows: PayslipData[] = barbers.map(b => {
        const stats = statsMap[b.id] ?? { revenue: 0, visits: 0 }
        const rate = ruleMap[b.id] ?? globalRate
        return {
          barberId: b.id,
          name: b.full_name ?? "—",
          initials: getInitials(b.full_name),
          color: colorFor(b.id),
          visits: stats.visits,
          revenue: stats.revenue,
          commission: Math.round(stats.revenue * rate / 100),
          rate,
        }
      })

      setPayslips(rows)
      setLoading(false)
    }
    load()
  }, [activeMonth])

  const handleExport = async () => {
    if (!shopId) return
    setExporting(true)
    const month = months[activeMonth].value
    window.open(`/api/payslips/export?month=${month}&shopId=${shopId}`, "_blank")
    setExporting(false)
  }

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
          Payslips
        </h1>
      </div>

      {/* Month Segment */}
      <div className="mx-5 mt-4">
        <div className="flex rounded-[12px] bg-[#F3F4F6] p-1 gap-1">
          {months.map((month, i) => (
            <button
              key={month.value}
              type="button"
              onClick={() => setActiveMonth(i)}
              className={`flex-1 text-center py-2.5 rounded-[10px] text-[12px] font-semibold transition-all ${
                activeMonth === i
                  ? "bg-[#FFFFFF] text-[#111113] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  : "text-[#9CA3AF]"
              }`}
            >
              {month.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payslip Cards */}
      <div className="px-5 mt-5 flex flex-col gap-3.5">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[20px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] px-[22px] py-[22px]">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#E5E7EB] shrink-0" />
                  <div className="h-[15px] bg-[#E5E7EB] rounded-full flex-1 max-w-[120px]" />
                </div>
                <div className="h-px bg-[#F5F5F7] my-4" />
                <div className="flex gap-4">
                  <div className="flex-1 h-[42px] bg-[#E5E7EB] rounded-[10px]" />
                  <div className="flex-1 h-[42px] bg-[#E5E7EB] rounded-[10px]" />
                  <div className="flex-1 h-[42px] bg-[#E5E7EB] rounded-[10px]" />
                </div>
                <div className="mt-4 rounded-[14px] bg-[#E5E7EB] h-[72px]" />
              </div>
            ))}
          </div>
        ) : payslips.length === 0 ? (
          <div className="rounded-[20px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8 flex flex-col items-center gap-2">
            <p className="text-[15px] font-semibold text-[#111113]">No data</p>
            <p className="text-[13px] text-[#9CA3AF] text-center">
              No validated visits for {months[activeMonth].label}.
            </p>
          </div>
        ) : (
          payslips.map((p) => (
            <div
              key={p.barberId}
              className="rounded-[20px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] px-[22px] py-[22px]"
            >
              {/* Header */}
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  <span className="text-[14px] font-semibold text-[#FFFFFF]">{p.initials}</span>
                </div>
                <span className="text-[17px] font-semibold text-[#111113] flex-1">{p.name}</span>
                <span className="text-[11px] font-semibold px-3.5 py-[5px] rounded-full bg-[#ECFDF5] text-[#16A34A]">
                  {months[activeMonth].label}
                </span>
              </div>

              <div className="h-px bg-[#F5F5F7] my-4" />

              <div className="flex gap-4 text-center">
                <div className="flex-1">
                  <span className="text-[11px] text-[#9CA3AF] block">Visits</span>
                  <span className="text-[18px] font-bold text-[#111113]">{p.visits}</span>
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-[#9CA3AF] block">Revenue</span>
                  <div className="flex items-baseline justify-center">
                    <span className="text-[18px] font-bold text-[#111113]">{fmt(p.revenue)}</span>
                    <span className="text-[12px] text-[#9CA3AF] ml-0.5">฿</span>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-[#9CA3AF] block">Rate</span>
                  <span className="text-[18px] font-bold text-[#111113]">{p.rate}%</span>
                </div>
              </div>

              {/* Commission highlight */}
              <div className="mt-4 rounded-[14px] bg-[#ECFDF5] py-4 px-4 text-center">
                <span className="text-[12px] font-medium text-[#16A34A] block">
                  Commission due
                </span>
                <div className="flex items-baseline justify-center mt-1">
                  <span className="text-[28px] font-bold text-[#16A34A] leading-none">
                    {fmt(p.commission)}
                  </span>
                  <span className="text-[16px] text-[#16A34A] ml-1">฿</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CTA */}
      {!loading && payslips.length > 0 && (
        <div className="px-5 mt-5">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="w-full h-[52px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[15px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.18)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-[18px] h-[18px]" strokeWidth={2} />
            {exporting ? "Opening…" : "Export all payslips (PDF)"}
          </button>
          <p className="text-[11px] text-[#9CA3AF] text-center mt-2">
            Opens a printable PDF in a new tab.
          </p>
        </div>
      )}
    </div>
  )
}
