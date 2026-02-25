"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type DbService = {
  id: string
  name: string
  price: number
  icon: string | null
  is_addon: boolean
}

type Service = DbService & { selected: boolean }

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
}

function fmt(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

const inputClass =
  "w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[14px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

export function BarberNewVisit({ onBack }: { onBack: () => void }) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [barberId, setBarberId] = useState<string | null>(null)
  const [barberName, setBarberName] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [clientQuery, setClientQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [noShop, setNoShop] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      setBarberId(user.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, shop_id")
        .eq("id", user.id)
        .single()

      if (!profile?.shop_id) { setNoShop(true); setLoading(false); return }
      setShopId(profile.shop_id)
      if (profile.full_name) setBarberName(profile.full_name)

      const { data: raw, error } = await supabase
        .from("services")
        .select("id, name, price, icon, is_addon")
        .eq("shop_id", profile.shop_id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (error) { console.error("[BarberNewVisit] services:", error.message); setLoading(false); return }

      setServices((raw ?? []).map((s: DbService) => ({ ...s, selected: false })))
      setLoading(false)
    }
    load()
  }, [])

  const toggle = (id: string) => {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, selected: !s.selected } : s))
  }

  const selected = services.filter((s) => s.selected)
  const total = selected.reduce((sum, s) => sum + s.price, 0)

  const handleConfirm = async () => {
    if (!shopId || !barberId || selected.length === 0) return
    setSaving(true)

    const supabase = createClient()

    // 1. Create visit as draft
    const { data: visit, error: visitErr } = await supabase
      .from("visits")
      .insert({
        barber_id: barberId,
        shop_id: shopId,
        status: "draft",
        visited_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (visitErr || !visit) {
      console.error("[BarberNewVisit] create visit:", visitErr?.message)
      setSaving(false)
      return
    }

    // 2. Insert visit_services — trigger will recalculate totals
    const { error: vsErr } = await supabase
      .from("visit_services")
      .insert(selected.map((s) => ({
        visit_id: visit.id,
        service_id: s.id,
        service_name: s.name,
        price: s.price,
      })))

    if (vsErr) console.error("[BarberNewVisit] visit_services:", vsErr.message)

    setSaving(false)
    setSavedOk(true)
    setTimeout(() => { setSavedOk(false); onBack() }, 1200)
  }

  const initials = barberName ? getInitials(barberName) : "—"
  const firstName = barberName.split(" ")[0] || "you"

  const mainServices = services.filter((s) => !s.is_addon)
  const addons = services.filter((s) => s.is_addon)

  const renderChip = (service: Service) => (
    <button
      key={service.id}
      type="button"
      onClick={() => toggle(service.id)}
      className={`flex flex-col items-start gap-0.5 rounded-[14px] px-3.5 py-3 transition-all active:scale-[0.97] ${
        service.selected
          ? "bg-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          : "bg-[#FFFFFF] shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {service.icon && <span className="text-[15px] leading-none">{service.icon}</span>}
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
        {fmt(service.price)}{"\u0E3F"}
      </span>
    </button>
  )

  if (noShop) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex items-center px-5 pt-4 pb-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-[#111113]" />
          </button>
          <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113] -ml-10">New Visit</h1>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-8">
          <span className="text-[14px] text-[#9CA3AF] text-center">
            {"You\u2019re not linked to a shop yet. Ask your owner to invite you."}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-6">
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

      {/* Barber reminder */}
      <div className="px-5 mt-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
          <span className="text-[11px] font-semibold text-[#FFFFFF]">{initials}</span>
        </div>
        <span className="text-[13px] text-[#9CA3AF]">
          {loading ? "Loading…" : `Logging as ${firstName}`}
        </span>
      </div>

      {/* Services */}
      {!loading && mainServices.length > 0 && (
        <div className="px-5 mt-6">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
            Services
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {mainServices.map(renderChip)}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {!loading && addons.length > 0 && (
        <div className="px-5 mt-6">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
            Add-ons
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {addons.map(renderChip)}
          </div>
        </div>
      )}

      {/* Client input */}
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2">
          CLIENT (OPTIONAL)
        </span>
        <div className="flex items-center gap-3 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5">
          <Search className="w-[18px] h-[18px] text-[#D1D5DB] shrink-0" />
          <input
            type="text"
            value={clientQuery}
            onChange={(e) => setClientQuery(e.target.value)}
            placeholder="Search or type name..."
            className="flex-1 text-[14px] text-[#111113] placeholder:text-[#D1D5DB] bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Total zone */}
      <div className="px-5 mt-7">
        <div className="rounded-[20px] bg-[#1A1A1A] px-6 py-5 flex items-center justify-between">
          <span className="text-[14px] text-[#9CA3AF]">Total</span>
          <div className="flex items-baseline">
            <span className="text-[36px] font-bold text-[#FFFFFF] leading-none tracking-tight">
              {fmt(total)}
            </span>
            <span className="text-[20px] text-[#6B7280] ml-1 font-normal">{"\u0E3F"}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-4">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={selected.length === 0 || saving || savedOk}
          className={`w-full h-14 rounded-[14px] bg-[#1A1A1A] text-[16px] font-semibold text-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all ${
            selected.length === 0 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "Saving…" : savedOk ? "Visit saved ✓" : "Confirm visit"}
        </button>
      </div>

      <p className="text-[12px] text-[#9CA3AF] text-center mt-3 px-5">
        This visit will be saved as a draft until validated by the owner.
      </p>
    </div>
  )
}
