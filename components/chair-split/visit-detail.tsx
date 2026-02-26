"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const PAYMENT_LABELS: Record<string, string> = {
  line: "LINE Pay",
  cash: "Cash",
  card: "Card",
  promptpay: "PromptPay",
}

type DbVisit = {
  id: string
  barber_id: string
  total_amount: number
  status: string
  payment_method: string | null
  visited_at: string
  clients: { name: string } | null
  barber: { full_name: string } | null
  visit_services: { service_name: string; price: number; icon: string | null }[]
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function VisitDetail({
  onBack,
  visitId,
  status: initialStatus = "validated",
}: {
  onBack: () => void
  visitId?: string | null
  status?: "validated" | "draft"
}) {
  const [visit, setVisit] = useState<DbVisit | null>(null)
  const [loading, setLoading] = useState(!!visitId)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [commissionRate, setCommissionRate] = useState(30)

  useEffect(() => {
    if (!visitId) return
    const load = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: visitData, error } = await supabase
        .from("visits")
        .select("id, barber_id, total_amount, status, payment_method, visited_at, clients(name), barber:profiles!barber_id(full_name), visit_services(service_name, price, icon)")
        .eq("id", visitId)
        .single()

      if (error || !visitData) { setLoading(false); return }
      setVisit(visitData as unknown as DbVisit)

      // Commission rate lookup
      const { data: profile } = await supabase.from("profiles").select("shop_id").eq("id", user.id).single()
      if (profile?.shop_id) {
        const { data: rules } = await supabase
          .from("commission_rules")
          .select("barber_id, rate")
          .eq("shop_id", profile.shop_id)
        const vd = visitData as unknown as DbVisit
        const barberRule = rules?.find((r) => r.barber_id === vd.barber_id)
        const globalRule = rules?.find((r) => !r.barber_id)
        setCommissionRate(barberRule?.rate ?? globalRule?.rate ?? 30)
      }
      setLoading(false)
    }
    load()
  }, [visitId])

  const handleValidate = async () => {
    if (!visit) return
    setActionLoading(true)
    setActionError(null)
    const supabase = createClient()
    const { error } = await supabase.from("visits").update({ status: "validated" }).eq("id", visit.id)
    if (error) { setActionError(error.message); setActionLoading(false); return }
    setVisit((v) => v ? { ...v, status: "validated" } : v)
    // Notify the barber in-app
    await supabase.from("notifications").insert({
      user_id: visit.barber_id,
      type: "visit_validated",
      title: "Visit validated \u2713",
      body: `Your visit of ${fmt(visit.total_amount)}\u0E3F has been validated.`,
      data: { visit_id: visit.id },
      is_read: false,
    })
    // Push notification (fire and forget)
    fetch("/api/push/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "visit_validated", visitId: visit.id }),
    }).catch(() => {})
    setActionLoading(false)
  }

  const handleDelete = async () => {
    if (!visit) return
    setActionLoading(true)
    setActionError(null)
    const supabase = createClient()
    const { error } = await supabase.from("visits").delete().eq("id", visit.id)
    if (error) { setActionError(error.message); setActionLoading(false); return }
    setActionLoading(false)
    onBack()
  }

  const handleCancel = async () => {
    if (!visit) return
    setActionLoading(true)
    setActionError(null)
    const supabase = createClient()
    const { error } = await supabase.from("visits").update({ status: "cancelled" }).eq("id", visit.id)
    if (error) { setActionError(error.message); setActionLoading(false); return }
    setVisit((v) => v ? { ...v, status: "cancelled" } : v)
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
      </div>
    )
  }

  const status = (visit?.status ?? initialStatus) as "validated" | "draft" | "cancelled"
  const isDraft = status === "draft"
  const barberName = visit?.barber?.full_name ?? "Unknown"
  const clientName = visit?.clients?.name ?? "Walk-in"
  const amount = visit?.total_amount ?? 0
  const commission = Math.round(amount * commissionRate / 100)
  const visitDate = visit?.visited_at ?? new Date().toISOString()
  const dateLabel = new Date(visitDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  const timeLabel = new Date(visitDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  const services = visit?.visit_services ?? []

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
          <div className="flex items-baseline">
            <span className="text-[44px] font-bold text-[#FFFFFF] leading-none tracking-tight">
              {fmt(amount)}
            </span>
            <span className="text-[24px] text-[#6B7280] ml-1.5 font-normal">{"\u0E3F"}</span>
          </div>
          <div
            className={`mt-4 px-4 py-1.5 rounded-full ${
              isDraft
                ? "bg-[rgba(217,119,6,0.15)]"
                : status === "cancelled"
                ? "bg-[rgba(220,38,38,0.15)]"
                : "bg-[rgba(22,163,74,0.15)]"
            }`}
          >
            <span
              className={`text-[12px] font-semibold ${
                isDraft ? "text-[#D97706]" : status === "cancelled" ? "text-[#DC2626]" : "text-[#16A34A]"
              }`}
            >
              {isDraft ? "Brouillon" : status === "cancelled" ? "Annul\u00E9" : "Valid\u00E9"}
            </span>
          </div>
          <span className="mt-3 text-[13px] text-[#6B7280]">
            {dateLabel} {"\u00B7"} {timeLabel}
          </span>
          {visit?.payment_method && (
            <div className={`mt-3 px-3 py-1 rounded-full ${visit.payment_method === "line" ? "bg-[rgba(6,199,85,0.15)]" : "bg-[rgba(255,255,255,0.08)]"}`}>
              <span className={`text-[11px] font-semibold ${visit.payment_method === "line" ? "text-[#06C755]" : "text-[#9CA3AF]"}`}>
                {PAYMENT_LABELS[visit.payment_method] ?? visit.payment_method}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Barber & Client cards */}
      <div className="flex gap-2.5 mx-5 mt-5">
        <div className="flex-1 rounded-[16px] bg-[#FFFFFF] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
              <span className="text-[12px] font-semibold text-[#FFFFFF]">{getInitials(barberName)}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[14px] font-semibold text-[#111113] block leading-tight truncate">{barberName}</span>
              <span className="text-[11px] text-[#9CA3AF] block leading-tight">Barbier</span>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-[16px] bg-[#FFFFFF] p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <div className="min-w-0">
              <span className="text-[14px] font-semibold text-[#111113] block leading-tight truncate">{clientName}</span>
              <span className="text-[11px] text-[#9CA3AF] block leading-tight">Client</span>
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
          {services.length === 0 ? (
            <div className="px-[18px] py-4 text-[14px] text-[#9CA3AF]">No services</div>
          ) : (
            services.map((service, idx) => (
              <div
                key={`${service.service_name}-${idx}`}
                className={`flex items-center justify-between px-[18px] py-4 ${idx < services.length - 1 ? "border-b border-[#F8F8FA]" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[18px] leading-none">{service.icon ?? "\u2702\uFE0F"}</span>
                  <span className="text-[14px] font-medium text-[#111113]">{service.service_name}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-[15px] font-semibold text-[#111113]">{fmt(service.price ?? 0)}</span>
                  <span className="text-[12px] text-[#9CA3AF] ml-0.5">{"\u0E3F"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Commission card — validated only */}
      {status === "validated" && amount > 0 && (
        <div className="mx-5 mt-5">
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-[18px] border-l-[3px] border-l-[#16A34A]">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#6B7280]">Commission ({commissionRate}%)</span>
              <div className="flex items-baseline">
                <span className="text-[20px] font-bold text-[#16A34A]">{fmt(commission)}</span>
                <span className="text-[14px] text-[#16A34A] ml-0.5">{"\u0E3F"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <p className="mx-5 mt-4 text-[13px] text-red-500 text-center">{actionError}</p>
      )}

      {/* Actions */}
      <div className="mx-5 mt-6 pb-10 flex flex-col gap-2">
        {isDraft ? (
          <>
            <button
              type="button"
              onClick={handleValidate}
              disabled={actionLoading}
              className="w-full h-[56px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[15px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.18)] active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {actionLoading ? "Processing\u2026" : "Valider cette visite"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={actionLoading}
              className="w-full text-center text-[14px] font-medium text-[#DC2626] mt-2 active:opacity-60 transition-opacity disabled:opacity-50"
            >
              Supprimer le brouillon
            </button>
          </>
        ) : status === "validated" ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={actionLoading}
            className="w-full text-center text-[14px] font-medium text-[#DC2626] active:opacity-60 transition-opacity disabled:opacity-50"
          >
            {actionLoading ? "Processing\u2026" : "Annuler cette visite"}
          </button>
        ) : null}
      </div>
    </div>
  )
}
