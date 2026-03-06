"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Search, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type DbService = {
  id: string
  name: string
  price: number
  icon: string | null
  is_addon: boolean
}

type Service = DbService & { selected: boolean }

type ClientResult = {
  id: string
  name: string
  phone: string | null
}

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
  const [paymentMethod, setPaymentMethod] = useState<"line" | "cash" | "card" | "promptpay">("line")
  const [linePayQrUrl, setLinePayQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const [noShop, setNoShop] = useState(false)

  // Client lookup
  const [clientQuery, setClientQuery] = useState("")
  const [clientResults, setClientResults] = useState<ClientResult[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientResult | null>(null)
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [clientCreating, setClientCreating] = useState(false)

  useEffect(() => {
    const load = async () => {
      const shop = await getShop()
      if (!shop) { setLoading(false); return }
      setBarberId(shop.userId)
      setShopId(shop.shopId)

      const supabase = createClient()
      // Parallel: profile name + services + shop QR
      const [profileRes, svcResult, shopResult] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", shop.userId).single(),
        supabase
          .from("services")
          .select("id, name, price, icon, is_addon")
          .eq("shop_id", shop.shopId)
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("shops")
          .select("line_pay_qr_url")
          .eq("id", shop.shopId)
          .single(),
      ])
      if (profileRes.data?.full_name) setBarberName(profileRes.data.full_name)

      if (svcResult.error) { console.error("[BarberNewVisit] services:", svcResult.error.message); setLoading(false); return }
      if (shopResult.data?.line_pay_qr_url) setLinePayQrUrl(shopResult.data.line_pay_qr_url)

      setServices((svcResult.data ?? []).map((s: DbService) => ({ ...s, selected: false })))
      setLoading(false)
    }
    load()
  }, [])

  // Debounced client search
  useEffect(() => {
    if (!shopId || selectedClient) return
    const q = clientQuery.trim()
    if (q.length < 1) { setClientResults([]); setClientDropdownOpen(false); return }

    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("clients")
        .select("id, name, phone")
        .eq("shop_id", shopId)
        .ilike("name", `%${q}%`)
        .limit(6)
      setClientResults(data ?? [])
      setClientDropdownOpen(true)
    }, 280)

    return () => clearTimeout(timer)
  }, [clientQuery, shopId, selectedClient])

  const handleSelectClient = (c: ClientResult) => {
    setSelectedClient(c)
    setClientQuery("")
    setClientResults([])
    setClientDropdownOpen(false)
  }

  const handleCreateClient = async () => {
    if (!shopId || !clientQuery.trim()) return
    setClientCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("clients")
      .insert({ shop_id: shopId, name: clientQuery.trim() })
      .select("id, name, phone")
      .single()
    setClientCreating(false)
    if (error || !data) { console.error("[BarberNewVisit] create client:", error?.message); return }
    setSelectedClient(data)
    setClientQuery("")
    setClientResults([])
    setClientDropdownOpen(false)
  }

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
        total_amount: total,
        status: "draft",
        payment_method: paymentMethod,
        visited_at: new Date().toISOString(),
        ...(selectedClient ? { client_id: selectedClient.id } : {}),
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

    // Notify shop owner via push (fire and forget)
    fetch("/api/push/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "visit_created_draft", visitId: visit.id }),
    }).catch(() => {})

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
            <ArrowLeft className="w-[18px] h-[18px] text-[#111113] pointer-events-none" />
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
          <ArrowLeft className="w-[18px] h-[18px] text-[#111113] pointer-events-none" />
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

      {/* Client lookup */}
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2">
          CLIENT (OPTIONAL)
        </span>

        {selectedClient ? (
          /* Selected client pill */
          <div className="flex items-center gap-3 rounded-[14px] bg-[#ECFDF5] border border-[#BBF7D0] px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
              <span className="text-[10px] font-semibold text-white">{getInitials(selectedClient.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#15803D] truncate">{selectedClient.name}</p>
              {selectedClient.phone && (
                <p className="text-[12px] text-[#16A34A]/70 truncate">{selectedClient.phone}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="w-6 h-6 rounded-full bg-[#BBF7D0] flex items-center justify-center shrink-0"
              aria-label="Remove client"
            >
              <X className="w-3 h-3 text-[#15803D]" />
            </button>
          </div>
        ) : (
          /* Search input + dropdown */
          <div className="relative">
            <div className="flex items-center gap-3 rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5">
              <Search className="w-[18px] h-[18px] text-[#D1D5DB] shrink-0" />
              <input
                type="text"
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                placeholder="Search or type name…"
                className="flex-1 text-[14px] text-[#111113] placeholder:text-[#D1D5DB] bg-transparent outline-none"
              />
              {clientQuery.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setClientQuery(""); setClientResults([]); setClientDropdownOpen(false) }}
                  className="shrink-0"
                  aria-label="Clear"
                >
                  <X className="w-4 h-4 text-[#9CA3AF]" />
                </button>
              )}
            </div>

            {clientDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#FFFFFF] rounded-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.10)] border border-[#E5E7EB] overflow-hidden z-20">
                {clientResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectClient(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-[#6B7280]">{getInitials(c.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#111113] truncate">{c.name}</p>
                      {c.phone && <p className="text-[12px] text-[#9CA3AF] truncate">{c.phone}</p>}
                    </div>
                  </button>
                ))}

                {clientQuery.trim().length > 0 && !clientResults.some(
                  (c) => c.name.toLowerCase() === clientQuery.trim().toLowerCase()
                ) && (
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    disabled={clientCreating}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F9FAFB] active:bg-[#F3F4F6] border-t border-[#F3F4F6] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
                      <span className="text-[14px] text-white font-bold leading-none">+</span>
                    </div>
                    <p className="text-[14px] font-medium text-[#1A1A1A]">
                      {clientCreating ? "Creating…" : `Create "${clientQuery.trim()}"`}
                    </p>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment method */}
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
          PAYMENT
        </span>
        <div className="flex gap-2">
          {([
            { key: "line", label: "LINE Pay", emoji: "💚" },
            { key: "cash", label: "Cash", emoji: "💵" },
            { key: "card", label: "Card", emoji: "💳" },
            { key: "promptpay", label: "PromptPay", emoji: "📱" },
          ] as const).map((pm) => (
            <button
              key={pm.key}
              type="button"
              onClick={() => setPaymentMethod(pm.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[14px] transition-all active:scale-[0.97] ${
                paymentMethod === pm.key
                  ? pm.key === "line"
                    ? "bg-[#06C755] shadow-[0_2px_8px_rgba(6,199,85,0.3)]"
                    : "bg-[#1A1A1A] shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                  : "bg-[#FFFFFF] shadow-[0_1px_6px_rgba(0,0,0,0.04)]"
              }`}
            >
              <span className="text-[18px] leading-none">{pm.emoji}</span>
              <span className={`text-[10px] font-semibold leading-none ${paymentMethod === pm.key ? "text-[#FFFFFF]" : "text-[#6B7280]"}`}>
                {pm.label}
              </span>
            </button>
          ))}
        </div>

        {paymentMethod === "line" && linePayQrUrl && (
          <div className="mt-3 flex flex-col items-center gap-1.5 rounded-[16px] bg-[#F0FFF4] border border-[#BBF7D0] p-4">
            <img
              src={linePayQrUrl}
              alt="LINE Pay QR Code"
              className="w-40 h-40 object-contain rounded-[10px]"
            />
            <span className="text-[11px] text-[#16A34A] font-medium">Scan with LINE to pay</span>
          </div>
        )}
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
