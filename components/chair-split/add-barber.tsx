"use client"

import { useState } from "react"
import { ArrowLeft, Check } from "lucide-react"

export function AddBarber({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [rate, setRate] = useState("30")
  const [role, setRole] = useState<"barber" | "manager">("barber")

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
          Add barber
        </h1>
        <div className="w-10" />
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-5 mt-6 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              PHONE (OPTIONAL)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+66..."
              className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
            />
          </div>

          {/* Commission rate */}
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              COMMISSION RATE
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="30"
                className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 pr-10 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">
                %
              </span>
            </div>
            <span className="text-[12px] text-[#9CA3AF] block mt-1.5 ml-1">
              Default rate: 30%. You can add specific rules later.
            </span>
          </div>

          {/* Role selector */}
          <div className="mt-1">
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2.5 ml-1">
              ROLE
            </label>
            <div className="flex gap-2.5">
              {/* Barber card */}
              <button
                type="button"
                onClick={() => setRole("barber")}
                className={`flex-1 rounded-[16px] p-4 text-left transition-all ${
                  role === "barber"
                    ? "bg-[#1A1A1A] shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    : "bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[15px] font-semibold ${
                      role === "barber" ? "text-[#FFFFFF]" : "text-[#111113]"
                    }`}
                  >
                    Barber
                  </span>
                  {role === "barber" && (
                    <div className="w-5 h-5 rounded-full bg-[#FFFFFF] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#111113]" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span
                  className={`text-[11px] block mt-1.5 leading-relaxed ${
                    role === "barber" ? "text-[#9CA3AF]" : "text-[#9CA3AF]"
                  }`}
                >
                  Can log visits and view own stats
                </span>
              </button>

              {/* Manager card */}
              <button
                type="button"
                onClick={() => setRole("manager")}
                className={`flex-1 rounded-[16px] p-4 text-left transition-all ${
                  role === "manager"
                    ? "bg-[#1A1A1A] shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    : "bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[15px] font-semibold ${
                      role === "manager" ? "text-[#FFFFFF]" : "text-[#111113]"
                    }`}
                  >
                    Manager
                  </span>
                  {role === "manager" && (
                    <div className="w-5 h-5 rounded-full bg-[#FFFFFF] flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#111113]" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span
                  className={`text-[11px] block mt-1.5 leading-relaxed ${
                    role === "manager" ? "text-[#9CA3AF]" : "text-[#9CA3AF]"
                  }`}
                >
                  Can manage all barbers and visits
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 mt-8 pb-10">
          <button
            type="button"
            className="w-full h-[56px] rounded-[16px] bg-[#1A1A1A] text-[16px] font-semibold text-[#FFFFFF] active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          >
            Send invitation
          </button>
          <p className="text-[12px] text-[#9CA3AF] text-center mt-3">
            An email invitation will be sent
          </p>
        </div>
      </div>
    </div>
  )
}
