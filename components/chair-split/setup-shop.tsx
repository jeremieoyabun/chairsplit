"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"

const inputClass =
  "w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

export function SetupShop({ onComplete, onBack }: { onComplete: () => void; onBack?: () => void }) {
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

    try {
      const res = await fetch("/api/shop/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), address: address.trim(), phone: phone.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "Failed to create shop.")
        setLoading(false)
        return
      }
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
      return
    }

    setLoading(false)
    onComplete()
  }

  return (
    <div
      className="flex flex-col justify-center h-full px-9 relative"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)" }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-5 w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-[#111113]" />
        </button>
      )}
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
