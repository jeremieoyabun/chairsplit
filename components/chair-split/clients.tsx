"use client"

import { useState } from "react"
import { ArrowLeft, Search, ChevronRight } from "lucide-react"

type Client = {
  initials: string
  name: string
  visits: number
  lastVisit: string
  color: string
}

const clients: Client[] = [
  { initials: "JP", name: "Jean-Pierre D.", visits: 14, lastVisit: "Feb 9", color: "#7C3AED" },
  { initials: "LM", name: "Lucas M.", visits: 9, lastVisit: "Feb 8", color: "#0D9488" },
  { initials: "TB", name: "Tom B.", visits: 7, lastVisit: "Feb 7", color: "#4F46E5" },
  { initials: "OR", name: "Oliver R.", visits: 5, lastVisit: "Feb 6", color: "#EC4899" },
  { initials: "MS", name: "Marc S.", visits: 3, lastVisit: "Feb 5", color: "#64748B" },
  { initials: "NP", name: "Nico P.", visits: 2, lastVisit: "Feb 4", color: "#06B6D4" },
]

export function Clients({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newNotes, setNewNotes] = useState("")

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
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
          {filtered.length} client{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Client list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        {filtered.length > 0 ? (
          <div className="mx-5 mt-2.5 rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
            {filtered.map((client) => (
              <div
                key={client.initials + client.name}
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
                  <span className="text-[12px] text-[#9CA3AF] block mt-0.5">
                    {client.visits} visits {"\u00B7"} Last: {client.lastVisit}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-20">
            <Search className="w-12 h-12 text-[#D1D5DB]" />
            <span className="text-[14px] text-[#9CA3AF] mt-3">
              No clients found
            </span>
          </div>
        )}
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
                  NAME
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
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
                  className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
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
                  className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 focus:ring-4 focus:ring-[#1A1A1A]/[0.06] transition-all duration-150"
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

            <button
              type="button"
              onClick={() => setShowAddSheet(false)}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              Add client
            </button>
          </div>
        </>
      )}
    </div>
  )
}
