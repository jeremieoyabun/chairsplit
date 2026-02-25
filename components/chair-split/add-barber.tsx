"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PLAN_LIMITS } from "@/lib/plans"

export function AddBarber({
  onBack,
  onUpgradePress,
}: {
  onBack: () => void
  onUpgradePress?: () => void
}) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [plan, setPlan] = useState("free")
  const [barberCount, setBarberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [rate, setRate] = useState("30")
  const [role, setRole] = useState<"barber" | "manager">("barber")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
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

      const { data: shop } = await supabase
        .from("shops")
        .select("plan, plan_status")
        .eq("id", profile.shop_id)
        .single()

      setPlan(shop?.plan ?? "free")

      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", profile.shop_id)
        .eq("role", "barber")

      setBarberCount(count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const limit = PLAN_LIMITS[plan] ?? 0
  const isAtLimit = barberCount >= limit

  const handleSend = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.")
      return
    }
    const rateNum = parseInt(rate, 10)
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setError("Commission rate must be between 0 and 100.")
      return
    }
    if (!shopId) return
    setError(null)
    setSending(true)

    const supabase = createClient()
    const { error: invErr } = await supabase
      .from("invitations")
      .insert({
        shop_id: shopId,
        email: email.trim().toLowerCase(),
        role,
        commission_rate: parseInt(rate, 10) || 30,
      })

    setSending(false)
    if (invErr) {
      console.error("[AddBarber] invitation:", invErr.message)
      setError(invErr.message)
      return
    }
    setSent(true)
    setTimeout(() => { setSent(false); onBack() }, 1500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
      </div>
    )
  }

  // Limit reached — show upgrade prompt
  if (isAtLimit) {
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
          <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">Add barber</h1>
          <div className="w-10" />
        </div>

        <div className="flex flex-col items-center justify-center flex-1 px-8 gap-5">
          <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center">
            <span className="text-[28px]">🔒</span>
          </div>
          <div className="text-center">
            <p className="text-[17px] font-bold text-[#111113]">Barber limit reached</p>
            <p className="text-[14px] text-[#9CA3AF] mt-2 leading-relaxed">
              {`Your ${plan === "free" ? "free" : plan} plan allows up to ${limit} barber${limit !== 1 ? "s" : ""}. You currently have ${barberCount}.`}
            </p>
            <p className="text-[14px] text-[#9CA3AF] mt-1">Upgrade to add more.</p>
          </div>
          <button
            type="button"
            onClick={onUpgradePress ?? onBack}
            className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          >
            Upgrade plan →
          </button>
        </div>
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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">
          Add barber
        </h1>
        <div className="w-10" />
      </div>

      {/* Barber count pill */}
      <div className="px-5 mb-1">
        <span className="text-[12px] text-[#9CA3AF]">
          {`${barberCount} / ${limit} barbers on ${plan} plan`}
        </span>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-5 mt-4 flex flex-col gap-5">
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="barber@example.com"
              className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              PHONE (OPTIONAL)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+66..."
              className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              COMMISSION RATE
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="30"
                className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 pr-10 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">%</span>
            </div>
            <span className="text-[12px] text-[#9CA3AF] block mt-1.5 ml-1">
              Default: 30%. Adjustable per service later.
            </span>
          </div>

          {/* Role selector */}
          <div className="mt-1">
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2.5 ml-1">
              ROLE
            </label>
            <div className="flex gap-2.5">
              {(["barber", "manager"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-[16px] p-4 text-left transition-all ${
                    role === r
                      ? "bg-[#1A1A1A] shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                      : "bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[15px] font-semibold capitalize ${role === r ? "text-[#FFFFFF]" : "text-[#111113]"}`}>
                      {r}
                    </span>
                    {role === r && (
                      <div className="w-5 h-5 rounded-full bg-[#FFFFFF] flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#111113]" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] block mt-1.5 leading-relaxed text-[#9CA3AF]">
                    {r === "barber"
                      ? "Can log visits and view own stats"
                      : "Can manage all barbers and visits"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-[13px] text-red-500 mt-4 text-center px-5">{error}</p>
        )}

        {/* CTA */}
        <div className="px-5 mt-8 pb-10">
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || sent}
            className="w-full h-[56px] rounded-[16px] bg-[#1A1A1A] text-[16px] font-semibold text-[#FFFFFF] active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:opacity-50"
          >
            {sent ? "Invitation saved ✓" : sending ? "Saving…" : "Send invitation"}
          </button>
          <p className="text-[12px] text-[#9CA3AF] text-center mt-3">
            They will be linked automatically when they sign in with this email.
          </p>
        </div>
      </div>
    </div>
  )
}
