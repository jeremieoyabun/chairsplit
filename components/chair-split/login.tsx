"use client"

import { useState } from "react"

const inputClass =
  "w-full h-[52px] bg-[#FFFFFF] rounded-[14px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-[18px] text-[15px] text-[#111113] font-sans placeholder:text-[#9CA3AF] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

export function Login({
  onLogin,
  onSignupPress,
}: {
  onLogin: () => void
  onSignupPress?: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-9"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center">
        <img
          src="/images/logo-chairsplit.png"
          alt="chairsplit"
          className="h-[32px] w-auto"
        />
        <div className="w-8 h-[2.5px] bg-[#1A1A1A] rounded-full mt-4" />
        <span className="text-[13px] text-[#9CA3AF] mt-4 font-sans">
          The operational system for barbershops
        </span>
      </div>

      {/* Form */}
      <div className="w-full mt-[52px] flex flex-col">
        <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className={inputClass}
        />

        <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2 mt-[18px]">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={"••••••••"}
          className={inputClass}
        />

        <button
          type="button"
          onClick={onLogin}
          className="w-full h-[56px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[16px] font-semibold mt-7 shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform"
        >
          Sign in
        </button>

        <button
          type="button"
          className="text-[13px] text-[#2563EB] font-sans mt-5 mx-auto active:opacity-60 transition-opacity"
        >
          Forgot password?
        </button>
      </div>

      {/* Bottom divider + signup */}
      <div className="w-full mt-[52px] flex flex-col items-center">
        <div className="flex items-center w-full gap-3">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-[12px] text-[#D1D5DB] font-sans">or</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        <div className="mt-5 flex items-center gap-1.5">
          <span className="text-[14px] text-[#6B7280] font-sans">
            {"Don\u2019t have an account?"}
          </span>
          <button
            type="button"
            onClick={onSignupPress}
            className="text-[14px] font-semibold text-[#111113] underline underline-offset-2 active:opacity-60 transition-opacity"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  )
}
