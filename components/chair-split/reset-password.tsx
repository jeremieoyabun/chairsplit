"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const inputClass =
  "w-full h-[52px] bg-[#FFFFFF] rounded-[14px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-[18px] text-[15px] text-[#111113] font-sans placeholder:text-[#9CA3AF] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

export function ResetPassword({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async () => {
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (password !== confirm) { setError("Passwords don't match."); return }
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: updateErr } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateErr) { setError(updateErr.message); return }
    onComplete()
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-9"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center">
        <img src="/images/logo-chairsplit.png" alt="chairsplit" className="h-[32px] w-auto" />
        <div className="w-8 h-[2.5px] bg-[#1A1A1A] rounded-full mt-4" />
      </div>

      <div className="w-full mt-[52px] flex flex-col">
        <h2 className="text-[20px] font-bold text-[#111113] mb-1">Set new password</h2>
        <p className="text-[13px] text-[#9CA3AF] mb-6">{"Choose a new password for your account."}</p>

        <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">
          New password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={"••••••••"}
            className={inputClass + " pr-12"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] active:opacity-60"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2 mt-[18px]">
          Confirm password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={"••••••••"}
            className={inputClass + " pr-12"}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] active:opacity-60"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {error && <p className="text-[13px] text-red-500 mt-3 text-center">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-[56px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[16px] font-semibold mt-7 shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? "Updating\u2026" : "Update password"}
        </button>
      </div>
    </div>
  )
}
