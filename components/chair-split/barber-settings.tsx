"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
}

type CommissionRow = { label: string; value: string }

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

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      setEmail(user.email ?? "")

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, shop_id")
        .eq("id", user.id)
        .single()

      if (!profile) { setLoading(false); return }
      setFullName(profile.full_name ?? "")
      setPhone(profile.phone ?? "")

      if (profile.shop_id) {
        // Load shop name
        const { data: shop } = await supabase
          .from("shops")
          .select("name, address")
          .eq("id", profile.shop_id)
          .single()

        if (shop) setShopLabel(`${shop.name}${shop.address ? ` · ${shop.address.split(",")[0]}` : ""}`)

        // Load commission rules for this barber (barber-specific or shop-wide defaults)
        const { data: rules } = await supabase
          .from("commission_rules")
          .select("rate, service_id, services(name)")
          .eq("shop_id", profile.shop_id)
          .or(`barber_id.eq.${user.id},barber_id.is.null`)
          .order("service_id", { ascending: true })

        if (rules && rules.length > 0) {
          const rows: CommissionRow[] = rules.map((r: { rate: number; service_id: string | null; services: { name: string } | null }) => ({
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

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    onSignOut?.()
  }

  const initials = fullName ? getInitials(fullName) : "—"
  const displayName = fullName || "—"

  const infoRows = [
    { label: "Name", value: loading ? "—" : displayName },
    { label: "Email", value: loading ? "—" : email || "—" },
    { label: "Phone", value: loading ? "—" : phone || "—" },
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
            <div className="w-[72px] h-[72px] rounded-full bg-[#3B82F6] flex items-center justify-center">
              <span className="text-[24px] font-bold text-[#FFFFFF]">{initials}</span>
            </div>
            <span className="text-[20px] font-bold text-[#111113] mt-3">{displayName}</span>
            <span className="text-[13px] text-[#9CA3AF] mt-1">{email || "—"}</span>
            {shopLabel ? (
              <span className="text-[12px] text-[#D1D5DB] mt-1">{shopLabel}</span>
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
                className={`flex items-center justify-between px-[18px] py-4 ${
                  i < infoRows.length - 1 ? "border-b border-[#F8F8FA]" : ""
                }`}
              >
                <span className="text-[15px] text-[#111113]">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-[#9CA3AF]">{row.value}</span>
                  <ChevronRight className="w-4 h-4 text-[#D1D5DB]" />
                </div>
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
            <div className="flex items-center justify-between px-[18px] py-4 border-b border-[#F8F8FA]">
              <span className="text-[15px] text-[#111113]">Language</span>
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-[#9CA3AF]">English</span>
                <ChevronRight className="w-4 h-4 text-[#D1D5DB]" />
              </div>
            </div>
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
