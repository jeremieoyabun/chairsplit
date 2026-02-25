"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Pencil, Check, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type ClientData = {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
}

type VisitRow = {
  id: string
  visited_at: string
  total_amount: number
  status: "draft" | "validated" | "cancelled"
  barber_name: string | null
  service_names: string[]
}

const COLORS = ["#7C3AED", "#0D9488", "#4F46E5", "#EC4899", "#64748B", "#06B6D4", "#3B82F6", "#F59E0B"]

function colorFor(name: string) {
  let h = 0
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2)
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

function statusBadge(status: VisitRow["status"]) {
  if (status === "validated")
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#16A34A]">Validated</span>
  if (status === "cancelled")
    return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626]">Cancelled</span>
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#D97706]">Draft</span>
}

const inputClass =
  "w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"

export function ClientDetail({ clientId, onBack }: { clientId: string | null; onBack: () => void }) {
  const [client, setClient] = useState<ClientData | null>(null)
  const [visits, setVisits] = useState<VisitRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Edit state
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editNotes, setEditNotes] = useState("")

  useEffect(() => {
    if (!clientId) { setLoading(false); return }
    const load = async () => {
      const supabase = createClient()

      // Load client info
      const { data: c } = await supabase
        .from("clients")
        .select("id, name, phone, email, notes")
        .eq("id", clientId)
        .single()

      if (c) {
        setClient(c)
        setEditName(c.name)
        setEditPhone(c.phone ?? "")
        setEditEmail(c.email ?? "")
        setEditNotes(c.notes ?? "")
      }

      // Load visit history
      const { data: raw } = await supabase
        .from("visits")
        .select(`
          id,
          visited_at,
          total_amount,
          status,
          barber:profiles!barber_id(full_name),
          visit_services(service_name)
        `)
        .eq("client_id", clientId)
        .order("visited_at", { ascending: false })
        .limit(20)

      const rows: VisitRow[] = (raw ?? []).map((v: any) => ({
        id: v.id,
        visited_at: v.visited_at,
        total_amount: v.total_amount ?? 0,
        status: v.status,
        barber_name: v.barber?.full_name ?? null,
        service_names: (v.visit_services ?? []).map((s: any) => s.service_name).filter(Boolean),
      }))

      setVisits(rows)
      setLoading(false)
    }
    load()
  }, [clientId])

  const handleSave = async () => {
    if (!editName.trim()) { setSaveError("Name is required."); return }
    if (!client) return
    setSaving(true)
    setSaveError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from("clients")
      .update({
        name: editName.trim(),
        phone: editPhone.trim() || null,
        email: editEmail.trim() || null,
        notes: editNotes.trim() || null,
      })
      .eq("id", client.id)

    setSaving(false)
    if (error) { setSaveError(error.message); return }

    setClient((prev) => prev ? {
      ...prev,
      name: editName.trim(),
      phone: editPhone.trim() || null,
      email: editEmail.trim() || null,
      notes: editNotes.trim() || null,
    } : prev)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!client) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from("clients").delete().eq("id", client.id)
    setDeleting(false)
    onBack()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="flex items-center px-5 pt-4 pb-3">
          <button type="button" onClick={onBack} className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 transition-transform">
            <ArrowLeft className="w-[18px] h-[18px] text-[#111113]" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[14px] text-[#9CA3AF]">Client not found.</span>
        </div>
      </div>
    )
  }

  const avatarColor = colorFor(client.name)
  const initials = getInitials(client.name)

  return (
    <div className="flex flex-col min-h-full pb-10">
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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113] -ml-10">
          Client
        </h1>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] active:scale-95 transition-transform"
            aria-label="Edit client"
          >
            <Pencil className="w-[16px] h-[16px] text-[#6B7280]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.12)] active:scale-95 transition-transform disabled:opacity-50"
            aria-label="Save"
          >
            <Check className="w-[16px] h-[16px] text-[#FFFFFF]" strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center mt-4 px-5">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          style={{ backgroundColor: avatarColor }}
        >
          <span className="text-[28px] font-bold text-[#FFFFFF]">{initials}</span>
        </div>

        {editing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="mt-3 text-center text-[22px] font-bold text-[#111113] bg-transparent border-b-2 border-[#1A1A1A] outline-none pb-1 w-full max-w-[260px]"
          />
        ) : (
          <h2 className="mt-3 text-[22px] font-bold text-[#111113]">{client.name}</h2>
        )}

        {!editing && (
          <span className="mt-1 text-[13px] text-[#9CA3AF]">
            {visits.length} visit{visits.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Info card */}
      <div className="mx-5 mt-6 rounded-[20px] bg-[#FFFFFF] shadow-[0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden">
        {editing ? (
          <div className="p-5 flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">PHONE</label>
              <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+66..." className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">EMAIL</label>
              <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="email@example.com" className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">NOTES</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Preferences, allergies..."
                rows={3}
                className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150 resize-none"
                style={{ height: 80 }}
              />
            </div>
            {saveError && <p className="text-[13px] text-red-500 text-center">{saveError}</p>}
          </div>
        ) : (
          <>
            {[
              { label: "Phone", value: client.phone },
              { label: "Email", value: client.email },
              { label: "Notes", value: client.notes },
            ].map(({ label, value }) => value ? (
              <div key={label} className="flex items-start gap-3 px-5 py-4 border-b border-[#F8F8FA] last:border-b-0">
                <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide w-14 shrink-0 pt-0.5">{label}</span>
                <span className="text-[14px] text-[#111113] flex-1">{value}</span>
              </div>
            ) : null)}
            {!client.phone && !client.email && !client.notes && (
              <div className="px-5 py-5 text-center">
                <span className="text-[13px] text-[#D1D5DB]">No contact info — tap ✏️ to add</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Visit history */}
      <div className="px-5 mt-7">
        <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] block mb-3">
          Visit history
        </span>

        {visits.length === 0 ? (
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-8 text-center">
            <span className="text-[13px] text-[#9CA3AF]">No visits yet</span>
          </div>
        ) : (
          <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            {visits.map((v) => (
              <div key={v.id} className="px-4 py-3.5 border-b border-[#F8F8FA] last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-[#111113]">
                        {new Date(v.visited_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                      {statusBadge(v.status)}
                    </div>
                    {v.service_names.length > 0 && (
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5 truncate">
                        {v.service_names.join(", ")}
                      </p>
                    )}
                    {v.barber_name && (
                      <p className="text-[11px] text-[#C4C4C4] mt-0.5">by {v.barber_name}</p>
                    )}
                  </div>
                  <div className="flex items-baseline gap-0.5 shrink-0">
                    <span className="text-[16px] font-bold text-[#111113]">{fmt(v.total_amount)}</span>
                    <span className="text-[11px] text-[#9CA3AF]">{"\u0E3F"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="px-5 mt-8">
        {confirmDelete ? (
          <div className="rounded-[16px] bg-[#FEF2F2] border border-[#FECACA] px-5 py-4">
            <p className="text-[14px] font-semibold text-[#DC2626] text-center mb-4">
              Delete {client.name}? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 h-11 rounded-[12px] bg-[#FFFFFF] text-[14px] font-medium text-[#6B7280] border border-[#E5E7EB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-11 rounded-[12px] bg-[#DC2626] text-[14px] font-semibold text-[#FFFFFF] disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] text-[14px] font-medium text-[#DC2626] active:opacity-70 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
            Delete client
          </button>
        )}
      </div>
    </div>
  )
}
