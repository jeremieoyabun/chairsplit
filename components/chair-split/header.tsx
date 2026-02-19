"use client"

import { Bell, ChevronDown, Settings } from "lucide-react"

export function Header({
  onSettingsPress,
  onNotificationsPress,
}: {
  onSettingsPress?: () => void
  onNotificationsPress?: () => void
}) {
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
            <span className="text-[16px] font-bold text-[#FFFFFF]">MB</span>
          </div>
          {/* Gear overlay */}
          <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-[#FFFFFF] shadow-[0_1px_4px_rgba(0,0,0,0.15)] flex items-center justify-center">
            <Settings className="w-[10px] h-[10px] text-[#6B7280]" strokeWidth={2.2} />
          </div>
        </button>
        <div>
          <button type="button" className="flex items-center gap-1">
            <span className="text-[20px] font-bold text-[#111113] leading-tight">
              Monkey Barber
            </span>
            <ChevronDown className="w-3 h-3 text-[#111113] mt-0.5" />
          </button>
          <span className="text-[13px] text-[#9CA3AF] leading-tight block">
            Patong, Thailand
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
        {/* Red badge with count */}
        <div className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-[#EF4444] flex items-center justify-center border-2 border-[#FFFFFF]">
          <span className="text-[9px] font-bold text-[#FFFFFF] leading-none">3</span>
        </div>
      </button>
    </div>
  )
}
