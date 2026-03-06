"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const inputClass =
  "w-full h-[52px] bg-[#FFFFFF] rounded-[14px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-[18px] text-[15px] text-[#111113] font-sans placeholder:text-[#9CA3AF] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

export function Signup({
  onSignup,
  onLoginPress,
  pendingPlan,
}: {
  onSignup: () => void
  onLoginPress: () => void
  pendingPlan?: string
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    // Check for pending invitation and auto-accept
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: invitation } = await supabase
        .from("invitations")
        .select("shop_id, role, commission_rate")
        .eq("email", email.trim().toLowerCase())
        .is("accepted_at", null)
        .maybeSingle()

      if (invitation?.shop_id) {
        await supabase.from("profiles").update({ shop_id: invitation.shop_id, role: invitation.role }).eq("id", user.id)
        await supabase.from("invitations").update({ accepted_at: new Date().toISOString() }).eq("shop_id", invitation.shop_id).eq("email", email.trim().toLowerCase())
        if (invitation.commission_rate) {
          try { await supabase.from("commission_rules").insert({ shop_id: invitation.shop_id, barber_id: user.id, rate: invitation.commission_rate }) } catch { /* ignore */ }
        }
      }
    }

    // Fire welcome email (best-effort, don't block on it)
    fetch("/api/emails/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    }).catch(() => {})

    // Show "check your email" banner before continuing
    setCheckEmail(true)
  }

  if (checkEmail) {
    return (
      <div
        className="flex flex-col h-full overflow-y-auto scrollbar-hide"
        style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)" }}
      >
        <div className="flex flex-col items-center justify-center flex-1 px-9 gap-6">
          <div className="w-20 h-20 rounded-full bg-[#EFF6FF] flex items-center justify-center">
            <span className="text-[38px]">📬</span>
          </div>
          <div className="text-center">
            <h2 className="text-[22px] font-bold text-[#111113]">Check your inbox</h2>
            <p className="text-[14px] text-[#6B7280] mt-2 leading-relaxed">
              {"We sent a confirmation email to "}
              <span className="font-semibold text-[#111113]">{email}</span>
              {". Click the link inside to verify your account."}
            </p>
          </div>
          <button
            type="button"
            onClick={onSignup}
            className="w-full h-[52px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[15px] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform"
          >
            Continue anyway →
          </button>
          <p className="text-[12px] text-[#9CA3AF] text-center">
            {"Didn\u2019t receive it? Check spam or "}
            <button
              type="button"
              onClick={() => setCheckEmail(false)}
              className="underline underline-offset-2 text-[#6B7280]"
            >
              go back
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-full overflow-y-auto scrollbar-hide"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center pt-12 px-9">
        <img
          src="/images/logo-chairsplit.png"
          alt="chairsplit"
          className="h-[32px] w-auto"
        />
        <div className="w-8 h-[2.5px] bg-[#1A1A1A] rounded-full mt-4" />
        <span className="text-[14px] text-[#9CA3AF] mt-4 font-sans">
          Get started in 2 minutes
        </span>
      </div>

      {/* Form */}
      <div className="w-full mt-9 px-9 flex flex-col pb-12">
        {pendingPlan && (
          <div className="w-full bg-[#EFF6FF] border border-[#BFDBFE] rounded-[14px] px-[18px] py-3.5 mb-6">
            <span className="text-[13px] font-semibold text-[#2563EB] block">
              {pendingPlan === "pro" ? "Pro plan selected" : "Starter plan selected"}
            </span>
            <span className="text-[12px] text-[#6B7280] block mt-0.5">
              {"You'll be taken to checkout right after signup."}
            </span>
          </div>
        )}
        <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">
          Your name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First Last"
          className={inputClass}
        />

        <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2 mt-7">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className={inputClass}
        />

        <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2 mt-7">
          Password
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
        <span className="text-[11px] text-[#D1D5DB] font-sans mt-2 ml-1">
          Min. 8 characters
        </span>

        {error && (
          <p className="text-[13px] text-red-500 mt-3 text-center">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSignup}
          disabled={loading}
          className="w-full h-[56px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[16px] font-semibold mt-7 shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          <span className="text-[14px] text-[#6B7280] font-sans">
            Already have an account?
          </span>
          <button
            type="button"
            onClick={onLoginPress}
            className="text-[14px] font-semibold text-[#111113] underline underline-offset-2 active:opacity-60 transition-opacity"
          >
            Sign in
          </button>
        </div>
        <p className="mt-4 text-center text-[11px] text-[#9CA3AF]">
          By creating an account you agree to our{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#6B7280]">Terms of Service</a>
          {" and "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#6B7280]">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
