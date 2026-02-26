"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Upload, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
}

const inputClass =
  "w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

export function ShopProfile({ onBack }: { onBack: () => void }) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [currency, setCurrency] = useState("thb")
  const [linePayQrUrl, setLinePayQrUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [qrUploading, setQrUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      const { data: shop, error: shopErr } = await supabase
        .from("shops")
        .select("name, address, phone, currency, line_pay_qr_url")
        .eq("id", profile.shop_id)
        .single()

      if (shopErr) { console.error("[ShopProfile] load:", shopErr.message); setLoading(false); return }
      if (shop) {
        setName(shop.name ?? "")
        setAddress(shop.address ?? "")
        setPhone(shop.phone ?? "")
        setCurrency(shop.currency ?? "thb")
        setLinePayQrUrl(shop.line_pay_qr_url ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!shopId) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: saveErr } = await supabase
      .from("shops")
      .update({ name: name.trim(), address: address.trim() || null, phone: phone.trim() || null, currency })
      .eq("id", shopId)

    setSaving(false)
    if (saveErr) {
      console.error("[ShopProfile] save:", saveErr.message)
      setError(saveErr.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !shopId) return
    setQrUploading(true)
    setError(null)

    const supabase = createClient()
    const ext = file.name.split(".").pop() ?? "png"
    const path = `${shopId}/line-pay-qr.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from("shop-qr")
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadErr) {
      console.error("[ShopProfile] QR upload:", uploadErr.message)
      setError("Upload failed: " + uploadErr.message)
      setQrUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from("shop-qr").getPublicUrl(path)

    const { error: updateErr } = await supabase
      .from("shops")
      .update({ line_pay_qr_url: publicUrl })
      .eq("id", shopId)

    if (updateErr) {
      console.error("[ShopProfile] QR save:", updateErr.message)
      setError(updateErr.message)
    } else {
      setLinePayQrUrl(publicUrl + "?t=" + Date.now())
    }
    setQrUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleQrRemove = async () => {
    if (!shopId) return
    const supabase = createClient()
    await supabase.from("shops").update({ line_pay_qr_url: null }).eq("id", shopId)
    setLinePayQrUrl(null)
  }

  const initials = name ? getInitials(name) : "—"

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
          Profil du salon
        </h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="text-[14px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity disabled:opacity-40"
        >
          {saving ? "…" : saved ? "Saved ✓" : "Enregistrer"}
        </button>
      </div>

      {error && (
        <p className="text-[12px] text-red-500 text-center px-5 pb-1">{error}</p>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Avatar */}
        <div className="flex flex-col items-center mt-7">
          <div className="w-20 h-20 rounded-full bg-[#111113] flex items-center justify-center">
            <span className="text-[28px] font-bold text-[#FFFFFF]">{initials}</span>
          </div>
        </div>

        {/* Form */}
        <div className="mt-8 px-5 flex flex-col gap-5">
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              Nom du salon
            </label>
            <input
              type="text"
              value={loading ? "" : name}
              onChange={(e) => setName(e.target.value)}
              placeholder={loading ? "Loading…" : "Nom du salon"}
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              Adresse
            </label>
            <input
              type="text"
              value={loading ? "" : address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={loading ? "Loading…" : "Adresse du salon"}
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              {"T\u00E9l\u00E9phone"}
            </label>
            <input
              type="tel"
              value={loading ? "" : phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={loading ? "Loading…" : "+66..."}
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              Devise
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150 appearance-none cursor-pointer"
              >
                <option value="thb">{"\uD83C\uDDF9\uD83C\uDDED"} THB {"\u0E3F"}</option>
                <option value="eur">{"\uD83C\uDDEB\uD83C\uDDF7"} EUR {"\u20AC"}</option>
                <option value="usd">{"\uD83C\uDDFA\uD83C\uDDF8"} USD $</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* LINE Pay QR Code */}
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              QR Code LINE Pay
            </label>
            <div className="rounded-[16px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              {linePayQrUrl ? (
                <div className="flex flex-col items-center p-4 gap-3">
                  <img
                    src={linePayQrUrl}
                    alt="LINE Pay QR Code"
                    className="w-40 h-40 object-contain rounded-[12px] border border-[#F0F0F3]"
                  />
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={qrUploading}
                      className="flex-1 py-2.5 rounded-[10px] bg-[#F4F4F6] text-[13px] font-semibold text-[#374151] active:scale-[0.98] transition-transform disabled:opacity-50"
                    >
                      {qrUploading ? "Uploading…" : "Remplacer"}
                    </button>
                    <button
                      type="button"
                      onClick={handleQrRemove}
                      className="w-10 h-10 rounded-[10px] bg-[#FEF2F2] flex items-center justify-center active:scale-[0.98] transition-transform"
                    >
                      <X className="w-4 h-4 text-[#DC2626]" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={qrUploading}
                  className="w-full flex flex-col items-center gap-2 py-8 active:bg-[#F9FAFB] transition-colors disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-full bg-[#F0FFF4] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#06C755]" />
                  </div>
                  <span className="text-[13px] font-semibold text-[#111113]">
                    {qrUploading ? "Uploading…" : "Ajouter le QR Code"}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">
                    PNG ou JPG · Affiché à la caisse
                  </span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleQrUpload}
            />
          </div>
        </div>

        {/* Danger zone */}
        <div className="mt-12 px-5 pb-10">
          <div className="h-px bg-[#F0F0F3]" />
          <div className="mt-5 flex flex-col items-center gap-1">
            <button
              type="button"
              className="text-[14px] font-medium text-[#DC2626] active:opacity-60 transition-opacity"
            >
              Supprimer le salon
            </button>
            <span className="text-[12px] text-[#D1D5DB]">
              {"Action irr\u00E9versible"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
