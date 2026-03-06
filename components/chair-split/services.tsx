"use client"

import { ArrowLeft, Bell, BellOff, ChevronRight, Scissors, Percent, Users, User, Star, Store, LogOut, Package } from "lucide-react"
import { usePushNotifications } from "@/hooks/usePushNotifications"

type SettingsRow = {
  icon: typeof Scissors
  label: string
  key: string
}

const shopSection: SettingsRow[] = [
  { icon: Scissors, label: "Services", key: "services" },
  { icon: Package, label: "Products", key: "products" },
  { icon: Percent, label: "Commissions", key: "commissions" },
  { icon: Users, label: "Clients", key: "clients" },
]

const accountSection: SettingsRow[] = [
  { icon: User, label: "My profile", key: "profile" },
  { icon: Star, label: "Subscription", key: "subscription" },
  { icon: Store, label: "Shop profile", key: "shop-profile" },
]

export function Services({
  onBack,
  onServiceCatalogPress,
  onProductCatalogPress,
  onCommissionsPress,
  onClientsPress,
  onSubscriptionPress,
  onShopProfilePress,
  onProfilePress,
  onSignOut,
}: {
  onBack: () => void
  onServiceCatalogPress?: () => void
  onProductCatalogPress?: () => void
  onCommissionsPress?: () => void
  onClientsPress?: () => void
  onSubscriptionPress?: () => void
  onShopProfilePress?: () => void
  onProfilePress?: () => void
  onSignOut?: () => void
}) {
  const { supported, subscribed, loading: pushLoading, register, unregister } = usePushNotifications()

  const handlers: Record<string, (() => void) | undefined> = {
    services: onServiceCatalogPress,
    products: onProductCatalogPress,
    commissions: onCommissionsPress,
    clients: onClientsPress,
    subscription: onSubscriptionPress,
    "shop-profile": onShopProfilePress,
    profile: onProfilePress,
  }

  const renderRow = (row: SettingsRow, isLast: boolean) => (
    <button
      key={row.key}
      type="button"
      onClick={handlers[row.key]}
      className={`flex items-center gap-3.5 w-full py-[18px] px-[18px] text-left active:bg-[#F9FAFB] transition-colors ${
        !isLast ? "border-b border-[#F8F8FA]" : ""
      }`}
    >
      <row.icon className="w-5 h-5 text-[#6B7280] shrink-0" strokeWidth={1.8} />
      <span className="text-[15px] font-medium text-[#111113] flex-1">
        {row.label}
      </span>
      <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
    </button>
  )

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0F0F3] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-[#111113] pointer-events-none" />
        </button>
        <h1 className="text-[22px] font-bold text-[#111113] leading-tight">
          Settings
        </h1>
      </div>

      {/* SHOP section */}
      <div className="px-5 mt-5">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2.5 block px-1">
          SHOP
        </span>
        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {shopSection.map((row, i) => renderRow(row, i === shopSection.length - 1))}
        </div>
      </div>

      {/* ACCOUNT section */}
      <div className="px-5 mt-6 pb-8">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2.5 block px-1">
          ACCOUNT
        </span>
        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {accountSection.map((row, i) => renderRow(row, i === accountSection.length - 1))}
          {supported && (
            <button
              type="button"
              onClick={() => subscribed ? unregister() : register()}
              disabled={pushLoading}
              className="flex items-center gap-3.5 w-full py-[18px] px-[18px] text-left border-t border-[#F8F8FA] active:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            >
              {subscribed
                ? <BellOff className="w-5 h-5 text-[#6B7280] shrink-0" strokeWidth={1.8} />
                : <Bell className="w-5 h-5 text-[#6B7280] shrink-0" strokeWidth={1.8} />
              }
              <span className="text-[15px] font-medium text-[#111113] flex-1">
                {pushLoading ? "…" : subscribed ? "Disable notifications" : "Enable notifications"}
              </span>
              <div
                className="w-10 h-6 rounded-full transition-colors flex items-center px-1 shrink-0"
                style={{ backgroundColor: subscribed ? "#1A1A1A" : "#E5E7EB" }}
              >
                <div
                  className="w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: subscribed ? "translateX(16px)" : "translateX(0)" }}
                />
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-3.5 w-full py-[18px] px-[18px] text-left border-t border-[#F8F8FA] active:bg-[#FEF2F2] transition-colors"
          >
            <LogOut className="w-5 h-5 text-[#EF4444] shrink-0" strokeWidth={1.8} />
            <span className="text-[15px] font-medium text-[#EF4444]">
              Sign out
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
