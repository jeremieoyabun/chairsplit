"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Camera, ChevronRight, Pencil, Check, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
}

type CommissionRow = { label: string; value: string }
type EditField = "name" | "phone" | null

const inputClass =
  "flex-1 bg-[#F4F4F6] rounded-[10px] px-3 py-2 text-[14px] text-[#111113] outline-none focus:ring-2 focus:ring-[#1A1A1A]/10"

export function BarberSettings({
  onBack,
  onSignOut,
}: {
  onBack: () => void
  onSignOut?: () => void
}) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [shopLabel, setShopLabel] = useState("")
  const [commissionRows, setCommissionRows] = useState<CommissionRow[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editField, setEditField] = useState<EditField>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const shopInfo = await getShop()
      if (!shopInfo) { setLoading(false); return }

      const supabase = createClient()
      // Parallel: session (for email) + profile + shop
      const [sessionRes, profileRes, shopRes] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("profiles").select("full_name, phone, shop_id, avatar_url").eq("id", shopInfo.userId).single(),
        supabase.from("shops").select("name, address").eq("id", shopInfo.shopId).single(),
      ])

      setEmail(sessionRes.data.session?.user?.email ?? "")

      const profile = profileRes.data
      if (!profile) { setLoading(false); return }
      setFullName(profile.full_name ?? "")
      setPhone(profile.phone ?? "")
      setAvatarUrl(profile.avatar_url ?? null)

      const shop = shopRes.data
      if (shop) {
        setShopLabel(`${shop.name}${shop.address ? ` · ${shop.address.split(",")[0]}` : ""}`)

        const { data: rules } = await supabase
          .from("commission_rules")
          .select("rate, service_id, barber_id, services(name)")
          .eq("shop_id", shopInfo.shopId)
          .or(`barber_id.eq.${shopInfo.userId},barber_id.is.null`)
          .order("service_id", { ascending: true })

        if (rules && rules.length > 0) {
          const typed = rules as unknown as { rate: number; service_id: string | null; barber_id: string | null; services: { name: string } | null }[]
          // If a barber-specific default exists, hide the shop-wide default
          const hasPersonalDefault = typed.some((r) => !r.service_id && r.barber_id)
          const filtered = typed.filter((r) => !(hasPersonalDefault && !r.service_id && !r.barber_id))
          const rows: CommissionRow[] = filtered.map((r) => ({
            label: r.service_id && r.services ? r.services.name : "Default rate",
            value: `${r.rate}%`,
          }))
          setCommissionRows(rows)
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  const startEdit = (field: EditField) => {
    setEditField(field)
    setEditValue(field === "name" ? fullName : phone)
  }

  const cancelEdit = () => {
    setEditField(null)
    setEditValue("")
  }

  const saveEdit = async () => {
    if (!editField) return
    setSaving(true)
    const shop = await getShop()
    if (!shop) { setSaving(false); return }

    const supabase = createClient()
    const update = editField === "name"
      ? { full_name: editValue.trim() }
      : { phone: editValue.trim() }

    const { error } = await supabase.from("profiles").update(update).eq("id", shop.userId)
    if (!error) {
      if (editField === "name") setFullName(editValue.trim())
      else setPhone(editValue.trim())
    }
    setSaving(false)
    setEditField(null)
    setEditValue("")
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const shopInfo = await getShop()
    if (!shopInfo) { setUploading(false); return }
    const supabase = createClient()
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${shopInfo.userId}.${ext}`
    const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (uploadErr) { console.error("[BarberSettings] upload:", uploadErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
    const url = `${publicUrl}?t=${Date.now()}`
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", shopInfo.userId)
    setAvatarUrl(url)
    setUploading(false)
  }

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    onSignOut?.()
  }

  const initials = fullName ? getInitials(fullName) : "—"
  const displayName = fullName || "—"

  const infoRows: { label: string; value: string; field: EditField }[] = [
    { label: "Name", value: loading ? "—" : displayName, field: "name" },
    { label: "Email", value: loading ? "—" : email || "—", field: null },
    { label: "Phone", value: loading ? "—" : phone || "—", field: "phone" },
  ]

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
          Settings
        </h1>
        <div className="w-10" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Profile Card */}
        <div className="mx-5 mt-5">
          <div className="rounded-[24px] bg-[#FFFFFF] shadow-[0_2px_16px_rgba(0,0,0,0.06)] px-6 py-6 flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-[72px] h-[72px] rounded-full active:scale-95 transition-transform"
              disabled={uploading}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-[#3B82F6] flex items-center justify-center">
                  <span className="text-[24px] font-bold text-[#FFFFFF]">{initials}</span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center">
                <Camera className="w-3 h-3 text-[#6B7280]" />
              </div>
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-white">...</span>
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
            <span className="text-[20px] font-bold text-[#111113] mt-3">{displayName}</span>
            <span className="text-[13px] text-[#9CA3AF] mt-1">{email || "—"}</span>
            {shopLabel ? (
              <span className="text-[12px] text-[#D1D5DB] mt-1" translate="no">{shopLabel}</span>
            ) : null}
          </div>
        </div>

        {/* My Info */}
        <div className="px-5 mt-7">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3 px-1">
            MY INFO
          </span>
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            {infoRows.map((row, i) => (
              <div
                key={row.label}
                className={`px-[18px] py-4 ${i < infoRows.length - 1 ? "border-b border-[#F8F8FA]" : ""}`}
              >
                {editField === row.field && row.field !== null ? (
                  /* Edit mode */
                  <div className="flex flex-col gap-2">
                    <span className="text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type={row.field === "phone" ? "tel" : "text"}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className={inputClass}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={saving}
                        className="w-9 h-9 rounded-full bg-[#111113] flex items-center justify-center shrink-0 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="w-9 h-9 rounded-full bg-[#F4F4F6] flex items-center justify-center shrink-0"
                      >
                        <X className="w-4 h-4 text-[#6B7280]" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] text-[#111113]">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-[#9CA3AF]">{row.value}</span>
                      {row.field ? (
                        <button
                          type="button"
                          onClick={() => startEdit(row.field)}
                          className="w-7 h-7 rounded-full bg-[#F4F4F6] flex items-center justify-center active:scale-95 transition-transform"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                        </button>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#D1D5DB]" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* My Commission */}
        {commissionRows.length > 0 && (
          <div className="px-5 mt-6">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3 px-1">
              MY COMMISSION
            </span>
            <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {commissionRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-[18px] py-4 ${
                    i < commissionRows.length - 1 ? "border-b border-[#F8F8FA]" : ""
                  }`}
                >
                  <span className="text-[15px] text-[#111113]">{row.label}</span>
                  <span className="text-[14px] font-semibold text-[#111113]">{row.value}</span>
                </div>
              ))}
            </div>
            <span className="text-[12px] text-[#9CA3AF] block mt-2 px-1">
              Commission rules are set by the shop owner.
            </span>
          </div>
        )}

        {/* Preferences */}
        <div className="px-5 mt-6">
          <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3 px-1">
            PREFERENCES
          </span>
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-[18px] py-4">
              <span className="text-[15px] text-[#111113]">Notifications</span>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-[50px] h-[28px] rounded-full transition-colors ${
                  notificationsEnabled ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
                }`}
              >
                <div
                  className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform ${
                    notificationsEnabled ? "left-[25px]" : "left-[3px]"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="px-5 mt-8 pb-10">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-[16px] bg-[#FEF2F2] py-4 text-center active:scale-[0.98] transition-transform"
          >
            <span className="text-[15px] font-semibold text-[#DC2626]">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
