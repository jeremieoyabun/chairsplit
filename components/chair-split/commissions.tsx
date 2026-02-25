"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Rule = {
  id: string
  barber_id: string | null
  service_id: string | null
  rate: number
}

type Barber = { id: string; full_name: string }

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

const ChevronDown = () => (
  <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
    <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export function Commissions({ onBack }: { onBack: () => void }) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [globalRate, setGlobalRate] = useState(30)
  const [globalRuleId, setGlobalRuleId] = useState<string | null>(null)
  const [specificRules, setSpecificRules] = useState<Rule[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [barberMap, setBarberMap] = useState<Record<string, string>>({})
  const [serviceMap, setServiceMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const [showAddSheet, setShowAddSheet] = useState(false)
  const [ruleBarber, setRuleBarber] = useState("")
  const [ruleRate, setRuleRate] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [showEditGlobal, setShowEditGlobal] = useState(false)
  const [editGlobalRate, setEditGlobalRate] = useState("")

  const load = async () => {
    setLoading(true)
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

    const [rulesRes, barbersRes, servicesRes] = await Promise.all([
      supabase.from("commission_rules").select("id, barber_id, service_id, rate").eq("shop_id", profile.shop_id),
      supabase.from("profiles").select("id, full_name").eq("shop_id", profile.shop_id).eq("role", "barber"),
      supabase.from("services").select("id, name").eq("shop_id", profile.shop_id),
    ])

    const rules = rulesRes.data ?? []
    const allBarbers: Barber[] = (barbersRes.data ?? []) as Barber[]
    const allServices = servicesRes.data ?? []

    const bMap: Record<string, string> = {}
    for (const b of allBarbers) bMap[b.id] = b.full_name ?? "—"

    const sMap: Record<string, string> = {}
    for (const s of allServices) sMap[s.id] = s.name

    const globalRule = rules.find((r) => !r.barber_id && !r.service_id)
    setGlobalRate(globalRule?.rate ?? 30)
    setGlobalRuleId(globalRule?.id ?? null)
    setSpecificRules(rules.filter((r) => r.barber_id))
    setBarbers(allBarbers)
    setBarberMap(bMap)
    setServiceMap(sMap)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSaveGlobalRate = async () => {
    const newRate = Number(editGlobalRate)
    if (!newRate || newRate < 0 || newRate > 100 || !shopId) return
    const supabase = createClient()
    if (globalRuleId) {
      await supabase.from("commission_rules").update({ rate: newRate }).eq("id", globalRuleId)
    } else {
      await supabase.from("commission_rules").insert({ shop_id: shopId, barber_id: null, service_id: null, rate: newRate })
    }
    setShowEditGlobal(false)
    await load()
  }

  const handleAddRule = async () => {
    const rate = Number(ruleRate)
    if (!rate || rate < 0 || rate > 100) { setSaveError("Enter a valid rate (1–100)"); return }
    if (!ruleBarber) { setSaveError("Select a barber"); return }
    if (!shopId) return
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()
    const { error } = await supabase.from("commission_rules").insert({
      shop_id: shopId,
      barber_id: ruleBarber,
      service_id: null,
      rate,
    })
    if (error) { setSaveError(error.message); setSaving(false); return }
    setShowAddSheet(false)
    setRuleBarber("")
    setRuleRate("")
    setSaving(false)
    await load()
  }

  const handleDeleteRule = async (ruleId: string) => {
    const supabase = createClient()
    await supabase.from("commission_rules").delete().eq("id", ruleId)
    await load()
  }

  return (
    <div className="flex flex-col min-h-full pb-10 relative">
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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">Commission Rules</h1>
        <button
          type="button"
          onClick={() => { setShowAddSheet(true); setSaveError(null) }}
          className="text-[14px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity"
        >
          + Add
        </button>
      </div>

      {/* Default rule hero */}
      <div className="mx-5 mt-5">
        <div className="rounded-[24px] bg-[#1A1A1A] px-7 py-7 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative">
          <span className="text-[52px] font-bold text-[#FFFFFF] leading-none block">
            {loading ? "—" : `${globalRate}%`}
          </span>
          <span className="text-[14px] text-[#6B7280] block mt-2">Default rule</span>
          <span className="text-[12px] text-[#9CA3AF] block mt-1">{"All barbers \u00B7 All services"}</span>
          <div className="inline-flex mt-3 px-3.5 py-1 rounded-full bg-[rgba(22,163,74,0.2)]">
            <span className="text-[11px] font-semibold text-[#16A34A]">Active</span>
          </div>
          <button
            type="button"
            onClick={() => { setEditGlobalRate(String(globalRate)); setShowEditGlobal(true) }}
            className="absolute top-4 right-5 text-[12px] font-semibold text-[#6B7280] active:opacity-60"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Specific rules section */}
      <div className="px-5 mt-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">SPECIFIC RULES</span>
          <span className="w-5 h-5 rounded-full bg-[#EEEFF2] text-[11px] font-semibold text-[#6B7280] flex items-center justify-center">
            {specificRules.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-6">
            <span className="text-[13px] text-[#9CA3AF]">Loading…</span>
          </div>
        ) : specificRules.length === 0 ? (
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 text-center">
            <span className="text-[13px] text-[#9CA3AF]">No specific rules yet</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {specificRules.map((rule) => {
              const barberName = barberMap[rule.barber_id ?? ""] ?? "Unknown"
              const scope = rule.service_id ? (serviceMap[rule.service_id] ?? "Service") : "All services"
              const hasServiceOverride = !!rule.service_id
              return (
                <div
                  key={rule.id}
                  className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-[18px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: colorFor(rule.barber_id ?? "") }}
                      >
                        <span className="text-[11px] font-semibold text-[#FFFFFF]">
                          {getInitials(barberName)}
                        </span>
                      </div>
                      <span className="text-[15px] font-semibold text-[#111113]">{barberName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] font-bold text-[#111113]">{rule.rate}%</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="w-6 h-6 rounded-full bg-[#FEF2F2] flex items-center justify-center"
                        aria-label="Delete rule"
                      >
                        <span className="text-[14px] font-bold text-[#DC2626] leading-none">×</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 ml-11">
                    <span className="text-[13px] text-[#9CA3AF]">{scope}</span>
                    {hasServiceOverride && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none bg-[#FEF9EE] text-[#D97706]">
                        override
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="mx-5 mt-5">
        <div className="rounded-[14px] bg-[#F0F7FF] px-4 py-4 flex items-start gap-3">
          <Info className="w-[18px] h-[18px] text-[#2563EB] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#2563EB] leading-relaxed">
            Specific rules always take priority over the default rule.
          </span>
        </div>
      </div>

      {/* Edit Global Rate Sheet */}
      {showEditGlobal && (
        <>
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40" onClick={() => setShowEditGlobal(false)} onKeyDown={() => {}} />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">Edit default rate</h2>
            <div className="relative">
              <input
                type="number"
                value={editGlobalRate}
                onChange={(e) => setEditGlobalRate(e.target.value)}
                placeholder="30"
                className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 pr-10 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">%</span>
            </div>
            <button
              type="button"
              onClick={handleSaveGlobalRate}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform"
            >
              Save
            </button>
          </div>
        </>
      )}

      {/* Add Commission Rule Bottom Sheet */}
      {showAddSheet && (
        <>
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40" onClick={() => setShowAddSheet(false)} onKeyDown={() => {}} />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">New commission rule</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  BARBER
                </label>
                <div className="relative">
                  <select
                    value={ruleBarber}
                    onChange={(e) => setRuleBarber(e.target.value)}
                    className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select barber…</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>{b.full_name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  COMMISSION RATE
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={ruleRate}
                    onChange={(e) => setRuleRate(e.target.value)}
                    placeholder="30"
                    className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 pr-10 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">%</span>
                </div>
              </div>
            </div>

            {saveError && (
              <p className="text-[12px] text-red-500 mt-3 text-center">{saveError}</p>
            )}

            <div className="rounded-[12px] bg-[#F0F7FF] px-4 py-3.5 flex items-start gap-3 mt-4">
              <Info className="w-[16px] h-[16px] text-[#2563EB] shrink-0 mt-0.5" />
              <span className="text-[12px] text-[#2563EB] leading-relaxed">
                This rule will override the default rate for the selected barber.
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddRule}
              disabled={saving}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add rule"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
