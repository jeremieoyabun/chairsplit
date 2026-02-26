import React from "react"
import { Check, ArrowLeft, ChevronDown, Search, Download } from "lucide-react"

// ─── Phone frame wrapper ────────────────────────────────────────────────────

function PhoneFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-[13px] font-semibold tracking-[0.08em] uppercase text-[#6B7280]">{label}</span>
      <div
        className="relative rounded-[44px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.22)] border-[6px] border-[#1A1A1A]"
        style={{ width: 320, height: 690 }}
      >
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-[#F0F0F3] z-10 flex items-center justify-between px-6 pt-1">
          <span className="text-[12px] font-semibold text-[#111113]">9:41</span>
          <div className="w-24 h-5 bg-[#1A1A1A] rounded-full mx-auto" />
          <div className="flex items-center gap-1">
            <div className="flex gap-[2px] items-end h-3">
              <div className="w-[3px] h-[5px] bg-[#111113] rounded-[1px]" />
              <div className="w-[3px] h-[7px] bg-[#111113] rounded-[1px]" />
              <div className="w-[3px] h-[9px] bg-[#111113] rounded-[1px]" />
              <div className="w-[3px] h-[11px] bg-[#111113] rounded-[1px]" />
            </div>
          </div>
        </div>
        {/* Screen content */}
        <div className="absolute inset-0 bg-[#F0F0F3] overflow-hidden pt-10">
          <div className="h-full overflow-y-auto scrollbar-hide">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

const BAHT = "\u0E3F"

function Badge({ status }: { status: "validated" | "draft" | "cancelled" }) {
  const cfg = {
    validated: { label: "Validated", bg: "#ECFDF5", color: "#16A34A" },
    draft:     { label: "Draft",     bg: "#FFFBEB", color: "#D97706" },
    cancelled: { label: "Cancelled", bg: "#FEF2F2", color: "#DC2626" },
  }[status]
  return (
    <span
      className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

function Avatar({ initials, color, size = 44 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <span className="font-semibold text-[#FFFFFF]" style={{ fontSize: size * 0.3 }}>{initials}</span>
    </div>
  )
}

// ─── Screen 1: Home dashboard ────────────────────────────────────────────────

const homeVisits = [
  { id: "1", initials: "LK", color: "#3B82F6", name: "Thanakorn P.",   services: "Classic Cut, Fade",     amount: "550",   time: "09:15", status: "validated" as const },
  { id: "2", initials: "NG", color: "#16A34A", name: "Walk-in",        services: "Beard Trim",             amount: "250",   time: "10:30", status: "validated" as const },
  { id: "3", initials: "LK", color: "#3B82F6", name: "Somchai L.",     services: "Premium Cut, Color",     amount: "1 300", time: "11:00", status: "validated" as const },
  { id: "4", initials: "PN", color: "#F59E0B", name: "Nattapon S.",    services: "Premium Cut, Beard Trim","amount": "750",   time: "11:45", status: "draft" as const },
]

function HomeScreen() {
  return (
    <div className="flex flex-col pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div>
          <h1 className="text-[18px] font-bold text-[#111113] leading-tight">The Blade Lounge</h1>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">Silom, Bangkok</p>
        </div>
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111113" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] rounded-full text-[8px] font-bold text-white flex items-center justify-center">3</span>
        </div>
      </div>

      {/* Revenue card */}
      <div className="mx-4 mt-2">
        <div className="rounded-[20px] bg-[#1A1A1A] px-4 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">TODAY&apos;S REVENUE</span>
            <span className="text-[10px] text-[#6B7280]">Feb 26, 2026</span>
          </div>
          <div className="mt-1.5 flex items-baseline px-0.5">
            <span className="text-[40px] font-bold text-[#FFFFFF] leading-none tracking-tight">18 500</span>
            <span className="text-[22px] text-[#6B7280] ml-1 font-normal">{BAHT}</span>
          </div>
          <div className="mt-4 flex gap-2">
            {[
              { label: "VISITS",       value: "12",    hasBaht: false },
              { label: "COMMISSIONS",  value: "5 920", hasBaht: true  },
              { label: "AVG.TICKET",   value: "1 542", hasBaht: true  },
            ].map((k) => (
              <div key={k.label} className="flex-1 rounded-[12px] bg-[rgba(255,255,255,0.06)] py-3 text-center">
                <span className="text-[8px] font-semibold tracking-[0.08em] uppercase text-[#6B7280] block">{k.label}</span>
                <div className="mt-1 flex items-baseline justify-center">
                  <span className="text-[18px] font-bold text-[#FFFFFF] leading-none">{k.value}</span>
                  {k.hasBaht && <span className="text-[11px] text-[#6B7280] ml-0.5">{BAHT}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-start justify-center gap-4 px-4 mt-5">
        {[
          { label: "Reports",  bg: "#DBEAFE", emoji: "📊" },
          { label: "Payouts",  bg: "#D1FAE5", emoji: "💸" },
          { label: "Clients",  bg: "#FEF3C7", emoji: "👥" },
          { label: "Agenda",   bg: "#EDE9FE", emoji: "📅" },
        ].map((a) => (
          <div key={a.label} className="flex flex-col items-center gap-1.5">
            <div className="w-[62px] h-[62px] rounded-[18px] flex items-center justify-center" style={{ backgroundColor: a.bg }}>
              <span className="text-[26px] leading-none">{a.emoji}</span>
            </div>
            <span className="text-[10px] font-medium text-[#6B7280]">{a.label}</span>
          </div>
        ))}
      </div>

      {/* Recent visits */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold text-[#111113]">Today&apos;s Visits</h2>
          <span className="text-[12px] font-semibold text-[#2563EB]">View all →</span>
        </div>
        <div className="flex flex-col gap-2">
          {homeVisits.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-[14px] bg-[#FFFFFF] px-3.5 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <Avatar initials={v.initials} color={v.color} size={40} />
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-semibold text-[#111113] block leading-tight">{v.name}</span>
                <span className="text-[11px] text-[#9CA3AF] block truncate mt-0.5">{v.services}</span>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end">
                <div className="flex items-baseline">
                  <span className="text-[14px] font-bold text-[#111113]">{v.amount}</span>
                  <span className="text-[11px] text-[#9CA3AF] ml-0.5">{BAHT}</span>
                </div>
                <span className="text-[9px] text-[#D1D5DB] mt-0.5">{v.time}</span>
                <Badge status={v.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-3 left-3 right-3 z-20">
        <div className="absolute left-1/2 -translate-x-1/2 -top-9 z-10">
          <div className="w-[72px] h-[72px] rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.25)] ring-[3px] ring-[#F0F0F3]">
            <span className="text-[#FFFFFF] text-[28px] leading-none font-light">+</span>
          </div>
        </div>
        <div className="bg-[#1A1A1A] rounded-[24px] h-[58px] flex items-center px-3">
          <div className="flex-1 flex items-center justify-around">
            {[
              { label: "Today",   active: true  },
              { label: "History", active: false },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-5 rounded bg-[rgba(255,255,255,0.12)]" style={{ opacity: t.active ? 1 : 0.4 }} />
                {t.active && <span className="text-[8px] font-medium text-[#FFFFFF]">{t.label}</span>}
              </div>
            ))}
          </div>
          <div className="w-14" />
          <div className="flex-1 flex items-center justify-around">
            {[
              { label: "Team",    active: false },
              { label: "Finance", active: false },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-0.5">
                <div className="w-5 h-5 rounded bg-[rgba(255,255,255,0.12)]" style={{ opacity: 0.4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 2: Log a visit ───────────────────────────────────────────────────

const mainServices = [
  { id: "1", emoji: "✂️",  name: "Classic Cut",   price: 350, selected: false },
  { id: "2", emoji: "✂️",  name: "Premium Cut",   price: 500, selected: true  },
  { id: "3", emoji: "💈",  name: "Fade",           price: 200, selected: false },
  { id: "4", emoji: "🧔",  name: "Beard Trim",     price: 250, selected: true  },
]
const addons = [
  { id: "5", emoji: "🎨",  name: "Hair Color",    price: 800, selected: false },
  { id: "6", emoji: "💧",  name: "Wash & Dry",    price: 150, selected: false },
]

function LogVisitScreen() {
  return (
    <div className="flex flex-col pb-6">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-3 pb-2">
        <div className="w-9 h-9 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <ArrowLeft className="w-4 h-4 text-[#111113]" />
        </div>
        <h1 className="flex-1 text-center text-[16px] font-semibold text-[#111113] -ml-9">New Visit</h1>
      </div>

      {/* Barber selector */}
      <div className="px-4 mt-2">
        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-1.5">BARBER</span>
        <div className="flex items-center gap-3 rounded-[14px] bg-[#FFFFFF] px-3.5 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <Avatar initials="LK" color="#3B82F6" size={38} />
          <span className="text-[14px] font-semibold text-[#111113] flex-1">Khun Lek</span>
          <ChevronDown className="w-4 h-4 text-[#D1D5DB]" />
        </div>
      </div>

      {/* Main services */}
      <div className="px-4 mt-4">
        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2">SERVICES</span>
        <div className="grid grid-cols-2 gap-2">
          {mainServices.map((s) => (
            <div
              key={s.id}
              className="flex flex-col items-start gap-0.5 rounded-[12px] px-3 py-2.5"
              style={{ backgroundColor: s.selected ? "#1A1A1A" : "#FFFFFF", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center gap-1">
                {s.selected && <Check className="w-2.5 h-2.5 text-[#FFFFFF] shrink-0" strokeWidth={3} />}
                <span className="text-[13px] leading-none">{s.emoji}</span>
                <span className={`text-[12px] font-medium ${s.selected ? "text-[#FFFFFF] font-semibold" : "text-[#111113]"}`}>{s.name}</span>
              </div>
              <span className={`text-[10px] leading-none ml-4 ${s.selected ? "text-[rgba(255,255,255,0.5)]" : "text-[#9CA3AF]"}`}>
                {s.price.toLocaleString("fr-FR")}{BAHT}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add-ons */}
      <div className="px-4 mt-3">
        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-2">ADD-ONS</span>
        <div className="grid grid-cols-2 gap-2">
          {addons.map((s) => (
            <div
              key={s.id}
              className="flex flex-col items-start gap-0.5 rounded-[12px] px-3 py-2.5 bg-[#FFFFFF]"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
            >
              <div className="flex items-center gap-1">
                <span className="text-[13px] leading-none">{s.emoji}</span>
                <span className="text-[12px] font-medium text-[#111113]">{s.name}</span>
              </div>
              <span className="text-[10px] leading-none ml-4 text-[#9CA3AF]">
                {s.price.toLocaleString("fr-FR")}{BAHT}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Client */}
      <div className="px-4 mt-3">
        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-1.5">CLIENT</span>
        <div className="flex items-center gap-2.5 rounded-[12px] bg-[#ECFDF5] border border-[#BBF7D0] px-3.5 py-2.5">
          <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0">
            <span className="text-[8px] font-semibold text-[#FFFFFF]">NS</span>
          </div>
          <span className="flex-1 text-[13px] font-semibold text-[#111113]">Nattapon Srisuk</span>
          <span className="text-[#9CA3AF]"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
        </div>
      </div>

      {/* Payment */}
      <div className="px-4 mt-3">
        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-1.5">PAYMENT</span>
        <div className="flex gap-1.5">
          {[
            { key: "line",      label: "LINE Pay",   emoji: "💚", active: false },
            { key: "cash",      label: "Cash",       emoji: "💵", active: true  },
            { key: "card",      label: "Card",       emoji: "💳", active: false },
            { key: "promptpay", label: "PromptPay",  emoji: "📱", active: false },
          ].map((pm) => (
            <div
              key={pm.key}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-[12px]"
              style={{
                backgroundColor: pm.active ? "#1A1A1A" : "#FFFFFF",
                boxShadow: pm.active ? "0 2px 8px rgba(0,0,0,0.15)" : "0 1px 6px rgba(0,0,0,0.04)",
              }}
            >
              <span className="text-[14px] leading-none">{pm.emoji}</span>
              <span className={`text-[8px] font-semibold leading-none ${pm.active ? "text-[#FFFFFF]" : "text-[#6B7280]"}`}>{pm.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="px-4 mt-4">
        <div className="rounded-[16px] bg-[#1A1A1A] px-5 py-4 flex items-center justify-between">
          <span className="text-[12px] text-[#9CA3AF]">Total</span>
          <div className="flex items-baseline">
            <span className="text-[30px] font-bold text-[#FFFFFF] leading-none tracking-tight">750</span>
            <span className="text-[16px] text-[#6B7280] ml-1">{BAHT}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 mt-3">
        <div className="w-full h-12 rounded-[12px] bg-[#1A1A1A] text-[14px] font-semibold text-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center">
          Confirm visit
        </div>
      </div>
    </div>
  )
}

// ─── Screen 3: Payslips ──────────────────────────────────────────────────────

const payslips = [
  { id: "1", name: "Khun Lek",  initials: "LK", color: "#3B82F6", visits: 89, revenue: 142400, rate: 35, commission: 49840 },
  { id: "2", name: "Khun Nong", initials: "NG", color: "#16A34A", visits: 74, revenue: 118500, rate: 30, commission: 35550 },
  { id: "3", name: "Khun Pan",  initials: "PN", color: "#F59E0B", visits: 61, revenue:  97600, rate: 30, commission: 29280 },
]

function PayslipsScreen() {
  return (
    <div className="flex flex-col pb-6">
      {/* Top bar */}
      <div className="flex items-center px-4 pt-3 pb-2">
        <div className="w-9 h-9 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <ArrowLeft className="w-4 h-4 text-[#111113]" />
        </div>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-[#111113] -ml-9">Payslips</h1>
      </div>

      {/* Month tabs */}
      <div className="mx-4 mt-2">
        <div className="flex rounded-[10px] bg-[#F3F4F6] p-1 gap-1">
          {["Feb 2026", "Jan 2026", "Dec 2025", "Nov 2025"].map((m, i) => (
            <div
              key={m}
              className={`flex-1 text-center py-2 rounded-[8px] text-[9px] font-semibold transition-all ${
                i === 0 ? "bg-[#FFFFFF] text-[#111113] shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : "text-[#9CA3AF]"
              }`}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Payslip cards */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        {payslips.map((p) => (
          <div key={p.id} className="rounded-[18px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar initials={p.initials} color={p.color} size={40} />
              <span className="text-[15px] font-semibold text-[#111113] flex-1">{p.name}</span>
              <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#16A34A]">Feb 2026</span>
            </div>
            <div className="h-px bg-[#F5F5F7] my-3" />
            <div className="flex gap-3 text-center">
              <div className="flex-1">
                <span className="text-[9px] text-[#9CA3AF] block">Visits</span>
                <span className="text-[16px] font-bold text-[#111113]">{p.visits}</span>
              </div>
              <div className="flex-1">
                <span className="text-[9px] text-[#9CA3AF] block">Revenue</span>
                <div className="flex items-baseline justify-center">
                  <span className="text-[16px] font-bold text-[#111113]">{fmt(p.revenue)}</span>
                  <span className="text-[10px] text-[#9CA3AF] ml-0.5">{BAHT}</span>
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[9px] text-[#9CA3AF] block">Rate</span>
                <span className="text-[16px] font-bold text-[#111113]">{p.rate}%</span>
              </div>
            </div>
            <div className="mt-3 rounded-[12px] bg-[#ECFDF5] py-3 px-3 text-center">
              <span className="text-[10px] font-medium text-[#16A34A] block">Commission due</span>
              <div className="flex items-baseline justify-center mt-0.5">
                <span className="text-[24px] font-bold text-[#16A34A] leading-none">{fmt(p.commission)}</span>
                <span className="text-[13px] text-[#16A34A] ml-0.5">{BAHT}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export CTA */}
      <div className="px-4 mt-4">
        <div className="w-full h-12 rounded-[12px] bg-[#1A1A1A] text-[13px] font-semibold text-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.18)] flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Export all payslips (PDF)
        </div>
        <p className="text-[9px] text-[#9CA3AF] text-center mt-1.5">Opens a printable PDF in a new tab.</p>
      </div>
    </div>
  )
}

// ─── Screen 4: History ───────────────────────────────────────────────────────

const historyGroups = [
  {
    label: "WED, FEB 26",
    visits: [
      { id: "h1", initials: "LK", color: "#3B82F6", name: "Thanakorn P.",   services: "Classic Cut, Fade",       amount: "550",   time: "09:15", status: "validated" as const },
      { id: "h2", initials: "NG", color: "#16A34A", name: "Walk-in",        services: "Beard Trim",               amount: "250",   time: "10:30", status: "validated" as const },
      { id: "h3", initials: "LK", color: "#3B82F6", name: "Somchai L.",     services: "Premium Cut, Color",       amount: "1 300", time: "11:00", status: "validated" as const },
      { id: "h4", initials: "PN", color: "#F59E0B", name: "Nattapon S.",    services: "Premium Cut, Beard Trim",  amount: "750",   time: "11:45", status: "draft" as const },
    ],
  },
  {
    label: "TUE, FEB 25",
    visits: [
      { id: "h5", initials: "PN", color: "#F59E0B", name: "Somchai L.",     services: "Premium Cut",              amount: "500",   time: "14:30", status: "validated" as const },
      { id: "h6", initials: "LK", color: "#3B82F6", name: "Walk-in",        services: "Classic Cut",              amount: "350",   time: "15:00", status: "validated" as const },
      { id: "h7", initials: "NG", color: "#16A34A", name: "Wichai K.",      services: "Premium Cut, Fade, Beard", amount: "950",   time: "15:45", status: "validated" as const },
    ],
  },
]

function HistoryScreen() {
  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h1 className="text-[22px] font-bold text-[#111113]">History</h1>
      </div>

      {/* Segment */}
      <div className="mx-4 mt-2">
        <div className="flex items-center bg-[#EEEFF2] rounded-[12px] p-1">
          {["Day", "Week", "Month"].map((s, i) => (
            <div
              key={s}
              className={`flex-1 text-center py-2 rounded-[10px] text-[12px] transition-all ${
                i === 1 ? "bg-[#FFFFFF] font-semibold text-[#111113] shadow-[0_2px_6px_rgba(0,0,0,0.06)]" : "font-medium text-[#6B7280]"
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* KPI banner */}
      <div className="mx-4 mt-3">
        <div className="rounded-[18px] bg-[#1A1A1A] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="flex gap-2">
            {[
              { value: "53",      label: "visits"  },
              { value: "84 750",  label: "revenue", hasBaht: true },
              { value: "27 280",  label: "comm.",   hasBaht: true },
            ].map((k) => (
              <div key={k.label} className="flex-1 rounded-[12px] bg-[rgba(255,255,255,0.06)] py-3 text-center">
                <div className="flex items-baseline justify-center">
                  <span className="text-[18px] font-bold text-[#FFFFFF] leading-none">{k.value}</span>
                  {k.hasBaht && <span className="text-[11px] text-[#6B7280] ml-0.5">{BAHT}</span>}
                </div>
                <span className="text-[8px] font-semibold tracking-[0.08em] uppercase text-[#6B7280] block mt-1">{k.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped visits */}
      {historyGroups.map((group) => (
        <div key={group.label}>
          <div className="px-4 mt-5 mb-2">
            <span className="text-[9px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF]">{group.label}</span>
          </div>
          <div className="px-4 flex flex-col gap-2">
            {group.visits.map((v) => (
              <div key={v.id} className="flex items-center gap-2.5 rounded-[14px] bg-[#FFFFFF] px-3.5 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <Avatar initials={v.initials} color={v.color} size={38} />
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] font-semibold text-[#111113] block leading-tight">{v.name}</span>
                  <span className="text-[10px] text-[#9CA3AF] block truncate mt-0.5">{v.services}</span>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end">
                  <div className="flex items-baseline">
                    <span className="text-[14px] font-bold text-[#111113]">{v.amount}</span>
                    <span className="text-[10px] text-[#9CA3AF] ml-0.5">{BAHT}</span>
                  </div>
                  <span className="text-[8px] text-[#D1D5DB] mt-0.5">{v.time}</span>
                  <Badge status={v.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] py-16 px-6 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-[28px] font-bold text-[#111113]">ChairSplit — App Demo</h1>
          <p className="text-[15px] text-[#6B7280] mt-2">Screenshot these screens for the marketing site</p>
        </div>

        <div className="flex flex-wrap gap-12 justify-center">
          <PhoneFrame label="Home Dashboard">
            <HomeScreen />
          </PhoneFrame>

          <PhoneFrame label="Log a Visit">
            <LogVisitScreen />
          </PhoneFrame>

          <PhoneFrame label="Generate Payslips">
            <PayslipsScreen />
          </PhoneFrame>

          <PhoneFrame label="Visit History">
            <HistoryScreen />
          </PhoneFrame>
        </div>

        <p className="text-center text-[12px] text-[#D1D5DB] mt-16">
          /demo — ChairSplit marketing screens · All data is illustrative
        </p>
      </div>
    </div>
  )
}
