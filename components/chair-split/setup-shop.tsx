"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

const DEFAULT_SERVICES = [
  { name: "Haircut/Fade", price: 400, icon: "✂️", is_addon: false, sort_order: 1 },
  { name: "Beard Trim", price: 300, icon: "🪒", is_addon: false, sort_order: 2 },
  { name: "Hair Coloring", price: 1500, icon: "🎨", is_addon: false, sort_order: 3 },
  { name: "Bald Head Shave", price: 350, icon: "💈", is_addon: false, sort_order: 4 },
  { name: "Hot Towel", price: 200, icon: "♨️", is_addon: true, sort_order: 5 },
  { name: "Shampoo", price: 300, icon: "🧴", is_addon: true, sort_order: 6 },
  { name: "Facial Steamer", price: 200, icon: "💆", is_addon: true, sort_order: 7 },
  { name: "Line Up", price: 100, icon: "🖌️", is_addon: true, sort_order: 8 },
]

const inputClass =
  "w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

export function SetupShop({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Shop name is required.")
      return
    }
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null
    if (!user) { setError("Not authenticated."); setLoading(false); return }

    // 1. Create the shop
    const { data: shop, error: shopErr } = await supabase
      .from("shops")
      .insert({
        name: name.trim(),
        address: address.trim() || null,
        phone: phone.trim() || null,
      })
      .select("id")
      .single()

    if (shopErr || !shop) {
      console.error("[SetupShop] create shop:", shopErr?.message)
      setError(shopErr?.message ?? "Failed to create shop.")
      setLoading(false)
      return
    }

    // 2. Link owner profile to shop
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ shop_id: shop.id })
      .eq("id", user.id)

    if (profileErr) console.error("[SetupShop] link profile:", profileErr.message)

    // 3. Insert default services
    const { error: servicesErr } = await supabase
      .from("services")
      .insert(DEFAULT_SERVICES.map((s) => ({ ...s, shop_id: shop.id, is_active: true })))

    if (servicesErr) console.error("[SetupShop] insert services:", servicesErr.message)

    // 4. Insert default commission rule (30% shop-wide)
    const { error: commErr } = await supabase
      .from("commission_rules")
      .insert({ shop_id: shop.id, rate: 30 })

    if (commErr) console.error("[SetupShop] insert commission rule:", commErr.message)

    setLoading(false)
    onComplete()
  }

  return (
    <div
      className="flex flex-col justify-center h-full px-9"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)" }}
    >
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#111113] leading-tight">
            Set up your shop
          </h1>
          <p className="text-[14px] text-[#9CA3AF] mt-2">
            {"You\u2019re almost there. Tell us about your barbershop."}
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              SHOP NAME *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monkey Barber Shop"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              ADDRESS (OPTIONAL)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Patong Beach, Phuket..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              PHONE (OPTIONAL)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+66..."
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p className="text-[13px] text-red-500 mt-4 text-center">{error}</p>
        )}

        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="w-full h-[56px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[16px] font-semibold mt-8 shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create my shop"}
        </button>

        <p className="text-[12px] text-[#9CA3AF] text-center mt-4 px-2">
          8 default services and a 30% commission rule will be added automatically.
        </p>
      </div>
    </div>
  )
}
