"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ChevronDown, Search, Check, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Barber = {
  id: string
  full_name: string
  initials: string
  color: string
}

type Service = {
  id: string
  emoji: string
  name: string
  price: number
  is_addon: boolean
  selected: boolean
}

type ClientResult = { id: string; name: string; phone: string | null }

const COLORS = ["#3B82F6", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899", "#0D9488"]

function colorFor(id: string) {
  let h = 0
  for (const c of id) h = c.charCodeAt(0) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatPrice(n: number) {
  return n.toLocaleString("fr-FR")
}

export function NewVisit({ onBack, onConfirm }: { onBack: () => void; onConfirm?: () => void }) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedBarberIdx, setSelectedBarberIdx] = useState(0)
  const [showBarberPicker, setShowBarberPicker] = useState(false)

  // Client lookup
  const [clientQuery, setClientQuery] = useState("")
  const [clientResults, setClientResults] = useState<ClientResult[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientResult | null>(null)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [clientCreating, setClientCreating] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
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

      const [barberRes, svcRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("shop_id", profile.shop_id)
          .eq("role", "barber")
          .order("full_name", { ascending: true }),
        supabase
          .from("services")
          .select("id, name, price, icon, is_addon")
          .eq("shop_id", profile.shop_id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ])

      setBarbers(
        (barberRes.data ?? []).map((b) => ({
          id: b.id,
          full_name: b.full_name ?? "Unknown",
          initials: getInitials(b.full_name ?? "?"),
          color: colorFor(b.id),
        }))
      )
      setServices(
        (svcRes.data ?? []).map((s) => ({
          id: s.id,
          emoji: s.icon ?? "\u2702\uFE0F",
          name: s.name,
          price: s.price ?? 0,
          is_addon: s.is_addon ?? false,
          selected: false,
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  // Debounced client search
  useEffect(() => {
    if (!shopId || !clientQuery.trim() || selectedClient) {
      setClientResults([])
      setClientDropdownOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("clients")
        .select("id, name, phone")
        .eq("shop_id", shopId)
        .ilike("name", `%${clientQuery.trim()}%`)
        .limit(6)
      setClientResults(data ?? [])
      setClientDropdownOpen(true)
    }, 280)
    return () => clearTimeout(timer)
  }, [clientQuery, shopId, selectedClient])

  const handleSelectClient = (c: ClientResult) => {
    setSelectedClient(c)
    setClientQuery("")
    setClientDropdownOpen(false)
    setClientResults([])
  }

  const handleCreateClient = async () => {
    if (!shopId || !clientQuery.trim()) return
    setClientCreating(true)
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from("clients")
      .insert({ shop_id: shopId, name: clientQuery.trim() })
      .select("id, name, phone")
      .single()
    setClientCreating(false)
    if (data) {
      setSelectedClient(data)
      setClientQuery("")
      setClientDropdownOpen(false)
      setClientResults([])
    } else if (err) {
      setError(err.message)
    }
  }

  const toggleService = (id: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)))
  }

  const selected = services.filter((s) => s.selected)
  const total = selected.reduce((sum, s) => sum + s.price, 0)
  const hasSelection = total > 0
  const barber = barbers[selectedBarberIdx]

  const handleConfirm = async () => {
    if (!barber || !hasSelection || !shopId) return
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const { data: visitData, error: visitErr } = await supabase
      .from("visits")
      .insert({
        shop_id: shopId,
        barber_id: barber.id,
        status: "validated",
        total_amount: total,
        visited_at: new Date().toISOString(),
        ...(selectedClient ? { client_id: selectedClient.id } : {}),
      })
      .select("id")
      .single()

    if (visitErr || !visitData) {
      setError(visitErr?.message ?? "Failed to create visit")
      setSaving(false)
      return
    }

    const { error: vsErr } = await supabase.from("visit_services").insert(
      selected.map((s) => ({
        visit_id: visitData.id,
        service_id: s.id,
        service_name: s.name,
        price: s.price,
        icon: s.emoji,
      }))
    )

    if (vsErr) {
      await supabase.from("visits").delete().eq("id", visitData.id)
      setError("Failed to save services. Please try again.")
      setSaving(false)
      return
    }

    setSaving(false)
    if (onConfirm) onConfirm()
    else onBack()
  }

  const mainServices = services.filter((s) => !s.is_addon)
  const addons = services.filter((s) => s.is_addon)

  const renderChip = (service: Service) => (
    <button
      key={service.id}
      type="button"
      onClick={() => toggleService(service.id)}
      className={`flex flex-col items-start gap-0.5 rounded-[14px] px-3.5 py-3 transition-all active:scale-[0.97] ${
        service.selected
          ? "bg-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          : "bg-[#FFFFFF] shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {service.selected && <Check className="w-3 h-3 text-[#FFFFFF] shrink-0" strokeWidth={3} />}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
      </div>
    )
  }

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
      {barbers.length > 0 && (
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
              style={{ backgroundColor: barber?.color ?? "#3B82F6" }}
            >
              <span className="text-[13px] font-semibold text-[#FFFFFF]">{barber?.initials ?? "?"}</span>
            </div>
            <span className="text-[16px] font-semibold text-[#111113] flex-1 text-left">
              {barber?.full_name ?? "Select barber"}
            </span>
            <ChevronDown className="w-5 h-5 text-[#D1D5DB]" />
          </button>

          {showBarberPicker && (
            <div className="mt-2 rounded-[14px] bg-[#FFFFFF] shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden">
              {barbers.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => { setSelectedBarberIdx(i); setShowBarberPicker(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-[#F9FAFB] transition-colors ${
                    i < barbers.length - 1 ? "border-b border-[#F8F8FA]" : ""
                  } ${i === selectedBarberIdx ? "bg-[#F9FAFB]" : ""}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: b.color }}
                  >
                    <span className="text-[11px] font-semibold text-[#FFFFFF]">{b.initials}</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#111113]">{b.full_name}</span>
                  {i === selectedBarberIdx && (
                    <Check className="w-4 h-4 text-[#16A34A] ml-auto" strokeWidth={2.5} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main services */}
      {mainServices.length > 0 && (
        <div className="px-5 mt-6">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
            Services
          </span>
          <div className="grid grid-cols-2 gap-2.5">{mainServices.map(renderChip)}</div>
        </div>
      )}

      {/* Add-ons */}
      {addons.length > 0 && (
        <div className="px-5 mt-6">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
            Add-ons
          </span>
          <div className="grid grid-cols-2 gap-2.5">{addons.map(renderChip)}</div>
        </div>
      )}

      {services.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-5">
          <span className="text-[14px] text-[#9CA3AF] text-center">
            No services configured yet. Add services in Settings → Service Catalog.
          </span>
        </div>
      )}

      {/* Client input */}
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2">
          CLIENT (OPTIONAL)
        </span>

        {selectedClient ? (
          <div className="flex items-center gap-3 rounded-[14px] bg-[#ECFDF5] border border-[#BBF7D0] px-4 py-3.5">
            <div className="w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
              <span className="text-[10px] font-semibold text-[#FFFFFF]">
                {getInitials(selectedClient.name)}
              </span>
            </div>
            <span className="flex-1 text-[14px] font-semibold text-[#111113]">{selectedClient.name}</span>
            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="text-[#9CA3AF] active:text-[#111113] transition-colors"
              aria-label="Remove client"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-3 rounded-[14px] bg-[#FFFFFF] shadow-[0_1px_6px_rgba(0,0,0,0.04)] px-4 py-3.5">
              <Search className="w-[18px] h-[18px] text-[#D1D5DB] shrink-0" />
              <input
                type="text"
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                placeholder="Search or create client…"
                className="flex-1 text-[14px] text-[#111113] placeholder:text-[#D1D5DB] bg-transparent outline-none"
              />
              {clientQuery.trim() && (
                <button
                  type="button"
                  onClick={() => { setClientQuery(""); setClientDropdownOpen(false) }}
                  className="text-[#D1D5DB] active:text-[#9CA3AF]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {clientDropdownOpen && (clientResults.length > 0 || clientQuery.trim()) && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 rounded-[14px] bg-[#FFFFFF] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
                {clientResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectClient(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors border-b border-[#F8F8FA] last:border-0"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-[#6B7280]">
                        {getInitials(c.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-medium text-[#111113] block">{c.name}</span>
                      {c.phone && <span className="text-[12px] text-[#9CA3AF]">{c.phone}</span>}
                    </div>
                  </button>
                ))}

                {!clientResults.some(c => c.name.toLowerCase() === clientQuery.trim().toLowerCase()) && clientQuery.trim() && (
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    disabled={clientCreating}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                      <span className="text-[14px] text-[#2563EB] font-semibold">+</span>
                    </div>
                    <span className="text-[14px] font-medium text-[#2563EB]">
                      {clientCreating ? "Creating…" : `Create "${clientQuery.trim()}"`}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-[13px] text-red-500 mt-3 px-5 text-center">{error}</p>}

      {/* Total zone */}
      <div className="px-5 mt-7">
        <div className="rounded-[20px] bg-[#1A1A1A] px-6 py-5 flex items-center justify-between">
          <span className="text-[14px] text-[#9CA3AF]">Total</span>
          <div className="flex items-baseline">
            <span className="text-[36px] font-bold text-[#FFFFFF] leading-none tracking-tight">
              {formatPrice(total)}
            </span>
            <span className="text-[20px] text-[#6B7280] ml-1 font-normal">{"\u0E3F"}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-4 pb-8">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!hasSelection || saving || barbers.length === 0}
          className={`w-full h-14 rounded-[14px] bg-[#1A1A1A] text-[16px] font-semibold text-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-all ${
            !hasSelection || saving || barbers.length === 0 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "Saving\u2026" : "Confirm visit"}
        </button>
      </div>
    </div>
  )
}
