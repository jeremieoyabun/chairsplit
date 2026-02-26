"use client"

import { useEffect, useState } from "react"
import { Bell, ChevronDown, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
}

export function Header({
  onSettingsPress,
  onNotificationsPress,
}: {
  onSettingsPress?: () => void
  onNotificationsPress?: () => void
}) {
  const [shopName, setShopName] = useState("")
  const [shopAddress, setShopAddress] = useState("")
  const [bellCount, setBellCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      const shop = await getShop()
      if (!shop) return

      const supabase = createClient()
      const { data: shopData, error } = await supabase
        .from("shops")
        .select("name, address")
        .eq("id", shop.shopId)
        .single()

      if (error) { console.error("[Header] shop:", error.message); return }
      if (shopData) {
        setShopName(shopData.name ?? "")
        setShopAddress(shopData.address ?? "")
      }

      // Unread bell badge: visits since last time user opened notifications
      try {
        const lastSeen = localStorage.getItem("cs_notifs_seen") ?? new Date(0).toISOString()
        const { count } = await supabase
          .from("visits")
          .select("id", { count: "exact", head: true })
          .eq("shop_id", shop.shopId)
          .gt("visited_at", lastSeen)
        setBellCount(count ?? 0)
      } catch { /* ignore */ }
    }
    load()
  }, [])

  const initials = shopName ? getInitials(shopName) : "—"

  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-2">
      {/* Left: avatar with gear overlay + text */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSettingsPress}
          className="relative w-12 h-12 shrink-0 active:scale-95 transition-transform"
          aria-label="Settings"
        >
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-[#111113] flex items-center justify-center">
            <span className="text-[16px] font-bold text-[#FFFFFF]">{initials}</span>
          </div>
          {/* Gear overlay */}
          <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-[#FFFFFF] shadow-[0_1px_4px_rgba(0,0,0,0.15)] flex items-center justify-center">
            <Settings className="w-[10px] h-[10px] text-[#6B7280]" strokeWidth={2.2} />
          </div>
        </button>
        <div>
          <button type="button" className="flex items-center gap-1">
            <span className="text-[20px] font-bold text-[#111113] leading-tight" translate="no">
              {shopName || "—"}
            </span>
            <ChevronDown className="w-3 h-3 text-[#111113] mt-0.5" />
          </button>
          <span className="text-[13px] text-[#9CA3AF] leading-tight block" translate="no">
            {shopAddress || "—"}
          </span>
        </div>
      </div>

      {/* Right: notification bell */}
      <button
        type="button"
        onClick={onNotificationsPress}
        className="relative w-11 h-11 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] active:scale-95 transition-transform"
        aria-label="Notifications"
      >
        <Bell className="w-[22px] h-[22px] text-[#111113]" />
        {bellCount > 0 && (
          <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#EF4444] flex items-center justify-center px-1 shadow-sm">
            <span className="text-[10px] font-bold text-white leading-none">
              {bellCount > 9 ? "9+" : bellCount}
            </span>
          </div>
        )}
      </button>
    </div>
  )
}
