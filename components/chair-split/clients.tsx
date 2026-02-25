"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Search, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type DbClient = {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
}

type DisplayClient = DbClient & { initials: string; color: string }

const COLORS = ["#7C3AED", "#0D9488", "#4F46E5", "#EC4899", "#64748B", "#06B6D4", "#3B82F6", "#F59E0B"]

function colorFor(name: string) {
  let h = 0
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
}

const inputClass =
  "w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

export function Clients({ onBack, onClientPress }: { onBack: () => void; onClientPress?: (id: string) => void }) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [clients, setClients] = useState<DisplayClient[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const loadClients = async (sid: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, phone, email, notes")
      .eq("shop_id", sid)
      .order("name", { ascending: true })

    if (error) { console.error("[Clients] load:", error.message); return }
    setClients((data ?? []).map((c: DbClient) => ({
      ...c,
      initials: getInitials(c.name),
      color: colorFor(c.name),
    })))
  }

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single()

      if (!profile?.shop_id) { setLoading(false); return }
      setShopId(profile.shop_id)
      await loadClients(profile.shop_id)
      setLoading(false)
    }
    init()
  }, [])

  const handleAddClient = async () => {
    if (!newName.trim()) { setAddError("Name is required."); return }
    if (!shopId) return
    setAdding(true)
    setAddError(null)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("clients")
      .insert({
        shop_id: shopId,
        name: newName.trim(),
        phone: newPhone.trim() || null,
        email: newEmail.trim() || null,
        notes: newNotes.trim() || null,
      })
      .select("id, name, phone, email, notes")
      .single()

    setAdding(false)
    if (error) {
      console.error("[Clients] add:", error.message)
      setAddError(error.message)
      return
    }
    if (data) {
      setClients((prev) => [
        { ...data, initials: getInitials(data.name), color: colorFor(data.name) },
        ...prev,
      ].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setNewName(""); setNewPhone(""); setNewEmail(""); setNewNotes("")
    setShowAddSheet(false)
  }

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-full relative">
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
          Clients
        </h1>
        <button
          type="button"
          onClick={() => setShowAddSheet(true)}
          className="text-[14px] font-semibold text-[#3B82F6] active:opacity-60 transition-opacity"
        >
          + Add
        </button>
      </div>

      {/* Search */}
      <div className="mx-5 mt-4">
        <div className="flex items-center gap-3 rounded-[14px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-4 py-3.5">
          <Search className="w-[18px] h-[18px] text-[#D1D5DB] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients..."
            className="flex-1 text-[14px] text-[#111113] placeholder:text-[#D1D5DB] bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mt-4">
        <span className="text-[13px] text-[#9CA3AF]">
          {loading ? "Loading…" : `${filtered.length} client${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Client list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        {!loading && filtered.length > 0 ? (
          <div className="mx-5 mt-2.5 rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            {filtered.map((client) => (
              <div
                key={client.id}
                onClick={() => onClientPress?.(client.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onClientPress?.(client.id)}
                className="flex items-center gap-3 px-[18px] py-4 border-b border-[#F8F8FA] last:border-b-0 cursor-pointer active:bg-[#FAFAFA] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: client.color }}
                >
                  <span className="text-[13px] font-semibold text-[#FFFFFF]">
                    {client.initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[15px] font-semibold text-[#111113] block leading-tight">
                    {client.name}
                  </span>
                  {client.phone && (
                    <span className="text-[12px] text-[#9CA3AF] block mt-0.5">
                      {client.phone}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
              </div>
            ))}
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <Search className="w-12 h-12 text-[#D1D5DB]" />
            <span className="text-[14px] text-[#9CA3AF] mt-3">
              {clients.length === 0 ? "No clients yet" : "No clients found"}
            </span>
          </div>
        ) : null}
      </div>

      {/* Add Client Bottom Sheet */}
      {showAddSheet && (
        <>
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40"
            onClick={() => setShowAddSheet(false)}
            onKeyDown={() => {}}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>

            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">
              New client
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  NAME *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  PHONE (OPTIONAL)
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+66..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  EMAIL (OPTIONAL)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  NOTES
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Preferences, allergies..."
                  rows={3}
                  className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150 resize-none"
                  style={{ height: 80 }}
                />
              </div>
            </div>

            {addError && (
              <p className="text-[13px] text-red-500 mt-3 text-center">{addError}</p>
            )}

            <button
              type="button"
              onClick={handleAddClient}
              disabled={adding}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add client"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
