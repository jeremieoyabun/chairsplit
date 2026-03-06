"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Search, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type DbService = {
  id: string
  name: string
  price: number
  icon: string | null
  is_addon: boolean
  is_active: boolean
  sort_order: number
}

const emojiOptions = ["\u2702\uFE0F", "\uD83C\uDFA8", "\uD83D\uDC88", "\u2668\uFE0F", "\uD83D\uDD8C\uFE0F", "\uD83E\uDE92", "\uD83D\uDC87", "\uD83E\uDDF4", "\uD83D\uDC86", "\uD83E\uDDD6", "\uD83D\uDC43", "\uD83D\uDC42"]

function fmt(n: number): string {
  return Math.round(n).toLocaleString("fr-FR")
}

export function ServiceCatalog({ onBack }: { onBack: () => void }) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [services, setServices] = useState<DbService[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const [editingService, setEditingService] = useState<DbService | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editEmoji, setEditEmoji] = useState("\u2702\uFE0F")
  const [editIsAddon, setEditIsAddon] = useState(false)
  const [editActive, setEditActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const shop = await getShop()
    if (!shop) { setLoading(false); return }
    setShopId(shop.shopId)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("services")
      .select("id, name, price, icon, is_addon, is_active, sort_order")
      .eq("shop_id", shop.shopId)
      .order("sort_order", { ascending: true })

    if (error) { console.error("[ServiceCatalog] services:", error.message) }
    setServices((data ?? []) as DbService[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  )

  const mainServices = filtered.filter((s) => !s.is_addon)
  const addons = filtered.filter((s) => s.is_addon)

  const openEdit = (svc: DbService) => {
    setIsNew(false)
    setEditName(svc.name)
    setEditPrice(String(svc.price))
    setEditEmoji(svc.icon ?? "\u2702\uFE0F")
    setEditIsAddon(svc.is_addon)
    setEditActive(svc.is_active)
    setSaveError(null)
    setEditingService(svc)
  }

  const openNew = () => {
    setIsNew(true)
    setEditName("")
    setEditPrice("")
    setEditEmoji("\u2702\uFE0F")
    setEditIsAddon(false)
    setEditActive(true)
    setSaveError(null)
    setEditingService({ id: "", name: "", price: 0, icon: null, is_addon: false, is_active: true, sort_order: 0 })
  }

  const handleSave = async () => {
    if (!editName.trim()) { setSaveError("Name is required"); return }
    const price = Number(editPrice)
    if (!price || price < 0) { setSaveError("Enter a valid price"); return }
    if (!shopId) return
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()

    if (isNew) {
      const maxOrder = services.length > 0 ? Math.max(...services.map((s) => s.sort_order)) : 0
      const { error } = await supabase.from("services").insert({
        shop_id: shopId,
        name: editName.trim(),
        price,
        icon: editEmoji,
        is_addon: editIsAddon,
        is_active: editActive,
        sort_order: maxOrder + 1,
      })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else if (editingService?.id) {
      const { error } = await supabase.from("services").update({
        name: editName.trim(),
        price,
        icon: editEmoji,
        is_addon: editIsAddon,
        is_active: editActive,
      }).eq("id", editingService.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }

    setSaving(false)
    setEditingService(null)
    await load()
  }

  const handleDelete = async () => {
    if (!editingService?.id) return
    const supabase = createClient()
    await supabase.from("services").delete().eq("id", editingService.id)
    setEditingService(null)
    await load()
  }

  const renderRow = (svc: DbService) => (
    <button
      key={svc.id}
      type="button"
      onClick={() => openEdit(svc)}
      className="flex items-center gap-3 px-[18px] py-4 border-b border-[#F8F8FA] last:border-b-0 w-full text-left active:bg-[#FAFAFA] transition-colors"
    >
      {svc.icon ? (
        <span className="text-[20px] leading-none shrink-0">{svc.icon}</span>
      ) : (
        <div className="w-6 h-6 rounded-full bg-[#E5E7EB] shrink-0" />
      )}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: svc.is_active ? "#16A34A" : "#D1D5DB" }}
      />
      <div className="flex-1 min-w-0">
        <span className="text-[15px] font-medium text-[#111113] block leading-tight">{svc.name}</span>
      </div>
      <span className="text-[14px] font-semibold text-[#111113] shrink-0">
        {fmt(svc.price)} {"\u0E3F"}
      </span>
      <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
    </button>
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
          <ArrowLeft className="w-[18px] h-[18px] text-[#111113] pointer-events-none" />
        </button>
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">Services</h1>
        <button
          type="button"
          onClick={openNew}
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
            placeholder="Search services..."
            className="flex-1 text-[14px] text-[#111113] placeholder:text-[#D1D5DB] bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Service lists */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] text-[#9CA3AF]">Loading…</span>
          </div>
        ) : (
          <>
            {mainServices.length > 0 && (
              <div className="px-5 mt-5">
                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2.5 block px-1">
                  {"SERVICES \u00B7 "}{mainServices.length}
                </span>
                <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                  {mainServices.map(renderRow)}
                </div>
              </div>
            )}

            {addons.length > 0 && (
              <div className="px-5 mt-6">
                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2.5 block px-1">
                  {"ADD-ONS \u00B7 "}{addons.length}
                </span>
                <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                  {addons.map(renderRow)}
                </div>
              </div>
            )}

            {mainServices.length === 0 && addons.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-20">
                <Search className="w-12 h-12 text-[#D1D5DB]" />
                <span className="text-[14px] text-[#9CA3AF] mt-3">
                  {query ? "No services found" : "No services yet. Tap + Add to create one."}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit / Add Bottom Sheet */}
      {editingService && (
        <>
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40"
            onClick={() => setEditingService(null)}
            onKeyDown={() => {}}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">
              {isNew ? "New service" : "Edit service"}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  NAME
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Haircut / Fade"
                  className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  PRICE
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="400"
                    className="w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 pr-10 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">
                    {"\u0E3F"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">
                  ICON
                </label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {emojiOptions.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEditEmoji(em)}
                      className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 transition-all ${
                        editEmoji === em ? "bg-[#1A1A1A]" : "bg-[#F7F7F9]"
                      }`}
                    >
                      <span className="text-[18px]">{em}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[15px] font-medium text-[#111113]">Add-on service</span>
                <button
                  type="button"
                  onClick={() => setEditIsAddon(!editIsAddon)}
                  className={`relative w-[50px] h-[28px] rounded-full transition-colors ${
                    editIsAddon ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"
                  }`}
                >
                  <div
                    className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform ${
                      editIsAddon ? "left-[25px]" : "left-[3px]"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between px-1 mt-1">
                <span className="text-[15px] font-medium text-[#111113]">Active</span>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`relative w-[50px] h-[28px] rounded-full transition-colors ${
                    editActive ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
                  }`}
                >
                  <div
                    className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-[#FFFFFF] shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform ${
                      editActive ? "left-[25px]" : "left-[3px]"
                    }`}
                  />
                </button>
              </div>
            </div>

            {saveError && (
              <p className="text-[12px] text-red-500 mt-3 text-center">{saveError}</p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full h-[52px] rounded-[16px] bg-[#1A1A1A] text-[15px] font-semibold text-[#FFFFFF] mt-5 active:scale-[0.98] transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.12)] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full text-center mt-3 text-[14px] font-medium text-[#DC2626] active:opacity-60 transition-opacity"
              >
                Delete service
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
