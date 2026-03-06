"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Camera } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

const inputClass =
  "w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-4 text-[15px] text-[#111113] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function Profile({ onBack }: { onBack: () => void }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const shop = await getShop()
      let uid = shop?.userId
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser()
        uid = user?.id ?? undefined
      }
      if (!uid) { setLoading(false); return }
      setUserId(uid)

      const [sessionRes, profileRes] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("profiles").select("full_name, avatar_url").eq("id", uid).single(),
      ])
      setEmail(sessionRes.data.session?.user?.email ?? "")
      if (profileRes.data) {
        setFullName(profileRes.data.full_name ?? "")
        setAvatarUrl(profileRes.data.avatar_url ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: saveErr } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", userId)
    setSaving(false)
    if (saveErr) {
      setError(saveErr.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${userId}.${ext}`

    console.log("[Profile] uploading avatar:", path, file.type, file.size)
    const { error: uploadErr, data: uploadData } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true })

    console.log("[Profile] upload result:", uploadErr?.message ?? "ok", uploadData)
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
    const url = `${publicUrl}?t=${Date.now()}`

    await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId)
    setAvatarUrl(url)
    setUploading(false)
  }

  const initials = fullName ? getInitials(fullName) : "\u2014"

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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">Profile</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="text-[14px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity disabled:opacity-40"
        >
          {saving ? "\u2026" : saved ? "Saved \u2713" : "Save"}
        </button>
      </div>

      {error && <p className="text-[12px] text-red-500 text-center px-5 pb-1">{error}</p>}

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Avatar */}
        <div className="flex flex-col items-center mt-7">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-[88px] h-[88px] rounded-full active:scale-95 transition-transform"
            disabled={uploading}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#111113] flex items-center justify-center">
                <span className="text-[30px] font-bold text-[#FFFFFF]">{initials}</span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <span className="text-[11px] font-semibold text-white">...</span>
              </div>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <span className="text-[11px] text-[#9CA3AF] mt-2">Tap to change photo</span>
        </div>

        {/* Form */}
        <div className="mt-7 px-5 flex flex-col gap-5">
          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              YOUR NAME
            </label>
            <input
              type="text"
              value={loading ? "" : fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={loading ? "Loading\u2026" : "Full name"}
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
              EMAIL
            </label>
            <input
              type="email"
              value={loading ? "" : email}
              readOnly
              placeholder={loading ? "Loading\u2026" : ""}
              className={inputClass + " opacity-60 cursor-not-allowed"}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  )
}
