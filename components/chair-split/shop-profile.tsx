"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"

export function ShopProfile({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("Monkey Barber Shop")
  const [address, setAddress] = useState("Patong Beach, Phuket, Thailand")
  const [phone, setPhone] = useState("+66 76 123 456")
  const [currency, setCurrency] = useState("thb")

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
          className="text-[14px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity"
        >
          Enregistrer
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Avatar */}
        <div className="flex flex-col items-center mt-7">
          <div className="w-20 h-20 rounded-full bg-[#111113] flex items-center justify-center">
            <span className="text-[28px] font-bold text-[#FFFFFF]">MB</span>
          </div>
          <button
            type="button"
            className="text-[13px] font-medium text-[#2563EB] mt-2.5 active:opacity-60 transition-opacity"
          >
            Modifier la photo
          </button>
        </div>

        {/* Form */}
        <div className="mt-8 px-5 flex flex-col gap-5">
          {/* Nom du salon */}
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              Nom du salon
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              Adresse
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
            />
          </div>

          {/* Telephone */}
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              {"T\u00E9l\u00E9phone"}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
            />
          </div>

          {/* Devise */}
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
