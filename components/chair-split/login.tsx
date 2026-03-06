"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/types"

import { Eye, EyeOff } from "lucide-react"

const inputClass =
  "w-full h-[52px] bg-[#FFFFFF] rounded-[14px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-[18px] text-[15px] text-[#111113] font-sans placeholder:text-[#9CA3AF] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

type Step = "login" | "forgot" | "sent"

export function Login({
  onLogin,
  onSignupPress,
}: {
  onLogin: (role: UserRole, shopId: string | null) => void
  onSignupPress?: () => void
}) {
  const [step, setStep] = useState<Step>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const user = authData.user

    // Check for a pending invitation for this email and auto-accept it
    const { data: invitation } = await supabase
      .from("invitations")
      .select("shop_id, role, commission_rate")
      .eq("email", user.email!.toLowerCase())
      .is("accepted_at", null)
      .maybeSingle()

    if (invitation?.shop_id) {
      await supabase
        .from("profiles")
        .update({ shop_id: invitation.shop_id, role: invitation.role })
        .eq("id", user.id)
      await supabase
        .from("invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("shop_id", invitation.shop_id)
        .eq("email", user.email!.toLowerCase())
      if (invitation.commission_rate) {
        await supabase.from("commission_rules").insert({
          shop_id: invitation.shop_id,
          barber_id: user.id,
          rate: invitation.commission_rate,
        })
      }
      setLoading(false)
      onLogin(invitation.role as UserRole, invitation.shop_id)
      return
    }

    // Normal flow: fetch profile to get role and shop_id
    // Retry once if the first attempt returns null (RLS timing)
    let profile = (await supabase.from("profiles").select("role, shop_id").eq("id", user.id).single()).data
    if (!profile) {
      await new Promise(r => setTimeout(r, 500))
      profile = (await supabase.from("profiles").select("role, shop_id").eq("id", user.id).single()).data
    }

    setLoading(false)
    onLogin((profile?.role as UserRole) ?? "barber", profile?.shop_id ?? null)
  }

  const handleForgotPassword = async () => {
    if (!resetEmail) { setError("Enter your email address"); return }
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/?reset=true` : undefined,
    })
    setLoading(false)
    if (resetErr) { setError(resetErr.message); return }
    setStep("sent")
  }

  const Logo = () => (
    <div className="flex flex-col items-center">
      <img src="/images/logo-chairsplit.png" alt="chairsplit" className="h-[32px] w-auto" />
      <div className="w-8 h-[2.5px] bg-[#1A1A1A] rounded-full mt-4" />
      <span className="text-[13px] text-[#9CA3AF] mt-4 font-sans">
        The operational system for barbershops
      </span>
    </div>
  )

  // Forgot password — sent confirmation
  if (step === "sent") {
    return (
      <div className="flex flex-col items-center justify-center h-full px-9" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)" }}>
        <Logo />
        <div className="w-full mt-[52px] flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold text-[#111113]">Check your email</h2>
          <p className="text-[14px] text-[#6B7280] mt-3 leading-relaxed">
            {"We\u2019ve sent a password reset link to "}
            <span className="font-semibold text-[#111113]">{resetEmail}</span>
          </p>
          <button
            type="button"
            onClick={() => { setStep("login"); setError(null) }}
            className="mt-8 text-[14px] font-semibold text-[#2563EB] active:opacity-60 transition-opacity"
          >
            {"Back to sign in"}
          </button>
        </div>
      </div>
    )
  }

  // Forgot password form
  if (step === "forgot") {
    return (
      <div className="flex flex-col items-center justify-center h-full px-9" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)" }}>
        <Logo />
        <div className="w-full mt-[52px] flex flex-col">
          <h2 className="text-[20px] font-bold text-[#111113] mb-1">Reset password</h2>
          <p className="text-[13px] text-[#9CA3AF] mb-6">{"Enter your email and we\u2019ll send you a reset link."}</p>
          <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Email</label>
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="email@example.com"
            className={inputClass}
            onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
          />
          {error && <p className="text-[13px] text-red-500 mt-3 text-center">{error}</p>}
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="w-full h-[56px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[16px] font-semibold mt-7 shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("login"); setError(null) }}
            className="text-[13px] text-[#6B7280] font-sans mt-5 mx-auto active:opacity-60 transition-opacity"
          >
            {"Back to sign in"}
          </button>
        </div>
      </div>
    )
  }

  // Normal login
  return (
    <div
      className="flex flex-col items-center justify-center h-full px-9"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F4F4F6 100%)",
      }}
    >
      <Logo />

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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={"••••••••"}
            className={inputClass + " pr-12"}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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

        {error && (
          <p className="text-[13px] text-red-500 mt-3 text-center">{error}</p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-[56px] rounded-[14px] bg-[#1A1A1A] text-[#FFFFFF] text-[16px] font-semibold mt-7 shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <button
          type="button"
          onClick={() => { setStep("forgot"); setResetEmail(email); setError(null) }}
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
        <p className="mt-4 text-center text-[11px] text-[#9CA3AF]">
          By continuing you agree to our{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#6B7280]">Terms</a>
          {" & "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#6B7280]">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
