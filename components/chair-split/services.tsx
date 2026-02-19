"use client"

import { useState } from "react"
import { ArrowLeft, ChevronRight, Scissors, Percent, Users, User, Star, Store, Globe, LogOut, Check } from "lucide-react"

type SettingsRow = {
  icon: typeof Scissors
  label: string
  key: string
  detail?: string
}

const shopSection: SettingsRow[] = [
  { icon: Scissors, label: "Services", key: "services" },
  { icon: Percent, label: "Commissions", key: "commissions" },
  { icon: Users, label: "Clients", key: "clients" },
]

const accountSection: SettingsRow[] = [
  { icon: User, label: "My profile", key: "profile" },
  { icon: Star, label: "Subscription", key: "subscription" },
  { icon: Store, label: "Shop profile", key: "shop-profile" },
]

const languages = [
  { flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "English", code: "en" },
  { flag: "\uD83C\uDDEB\uD83C\uDDF7", name: "Fran\u00E7ais", code: "fr" },
  { flag: "\uD83C\uDDEA\uD83C\uDDF8", name: "Espa\u00F1ol", code: "es" },
]

export function Services({
  onBack,
  onServiceCatalogPress,
  onCommissionsPress,
  onClientsPress,
  onSubscriptionPress,
  onShopProfilePress,
  onProfilePress,
  onSignOut,
}: {
  onBack: () => void
  onServiceCatalogPress?: () => void
  onCommissionsPress?: () => void
  onClientsPress?: () => void
  onSubscriptionPress?: () => void
  onShopProfilePress?: () => void
  onProfilePress?: () => void
  onSignOut?: () => void
}) {
  const [showLangSheet, setShowLangSheet] = useState(false)
  const [selectedLang, setSelectedLang] = useState("en")

  const langLabel = languages.find((l) => l.code === selectedLang)?.name || "English"

  const handlers: Record<string, (() => void) | undefined> = {
    services: onServiceCatalogPress,
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
      {row.detail && (
        <span className="text-[13px] text-[#9CA3AF] mr-1">{row.detail}</span>
      )}
      <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
    </button>
  )

  return (
    <div className="flex flex-col min-h-full relative">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0F0F3] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-[#111113]" />
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
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2.5 block px-1">
          ACCOUNT
        </span>
        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          {accountSection.map((row, i) => renderRow(row, i === accountSection.length - 1))}
        </div>
      </div>

      {/* PREFERENCES section */}
      <div className="px-5 mt-6">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2.5 block px-1">
          PREFERENCES
        </span>
        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowLangSheet(true)}
            className="flex items-center gap-3.5 w-full py-[18px] px-[18px] text-left active:bg-[#F9FAFB] transition-colors"
          >
            <Globe className="w-5 h-5 text-[#6B7280] shrink-0" strokeWidth={1.8} />
            <span className="text-[15px] font-medium text-[#111113] flex-1">
              Language
            </span>
            <span className="text-[13px] text-[#9CA3AF] mr-1">{langLabel}</span>
            <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
          </button>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-5 mt-6 pb-8">
        <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <button
            type="button"
            onClick={onSignOut}
            className="flex items-center gap-3.5 w-full py-[18px] px-[18px] text-left active:bg-[#FEF2F2] transition-colors"
          >
            <LogOut className="w-5 h-5 text-[#EF4444] shrink-0" strokeWidth={1.8} />
            <span className="text-[15px] font-medium text-[#EF4444]">
              Sign out
            </span>
          </button>
        </div>
      </div>

      {/* Language Bottom Sheet */}
      {showLangSheet && (
        <>
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40"
            onClick={() => setShowLangSheet(false)}
            onKeyDown={() => {}}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">
              Language
            </h2>

            <div className="flex flex-col">
              {languages.map((lang, i) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`flex items-center py-4 ${
                    i < languages.length - 1 ? "border-b border-[#F8F8FA]" : ""
                  }`}
                >
                  <span className="text-[24px] mr-3">{lang.flag}</span>
                  <span className="text-[15px] font-medium text-[#111113] flex-1 text-left">
                    {lang.name}
                  </span>
                  {selectedLang === lang.code ? (
                    <div className="w-6 h-6 rounded-full bg-[#111113] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-[#FFFFFF]" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-[#E5E7EB]" />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowLangSheet(false)}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              Done
            </button>
          </div>
        </>
      )}
    </div>
  )
}
