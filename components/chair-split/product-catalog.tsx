"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Search, ChevronRight, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getShop } from "@/lib/get-shop"

type DbProduct = {
  id: string
  name: string
  price: number
  icon: string | null
  stock: number
  is_active: boolean
  sort_order: number
}

const emojiOptions = ["\uD83E\uDDF4", "\uD83E\uDDF1", "\uD83C\uDF7A", "\u2615", "\uD83E\uDDFC", "\uD83D\uDC88", "\uD83C\uDFA8", "\uD83E\uDE92", "\uD83E\uDDFB", "\uD83D\uDC85", "\uD83D\uDC8E", "\uD83C\uDF78"]

function fmt(n: number): string {
  return Math.round(n).toLocaleString("fr-FR")
}

const inputClass =
  "w-full rounded-[14px] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-4 py-3.5 text-[15px] text-[#111113] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A1A] focus:border-2 transition-all"

export function ProductCatalog({ onBack }: { onBack: () => void }) {
  const [shopId, setShopId] = useState<string | null>(null)
  const [products, setProducts] = useState<DbProduct[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editEmoji, setEditEmoji] = useState("\uD83E\uDDF4")
  const [editStock, setEditStock] = useState("")
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
      .from("products")
      .select("id, name, price, icon, stock, is_active, sort_order")
      .eq("shop_id", shop.shopId)
      .order("sort_order", { ascending: true })

    if (error) { console.error("[ProductCatalog]:", error.message) }
    setProducts((data ?? []) as DbProduct[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  const openEdit = (p: DbProduct) => {
    setIsNew(false)
    setEditName(p.name)
    setEditPrice(String(p.price))
    setEditEmoji(p.icon ?? "\uD83E\uDDF4")
    setEditStock(String(p.stock))
    setEditActive(p.is_active)
    setSaveError(null)
    setEditingProduct(p)
  }

  const openNew = () => {
    setIsNew(true)
    setEditName("")
    setEditPrice("")
    setEditEmoji("\uD83E\uDDF4")
    setEditStock("0")
    setEditActive(true)
    setSaveError(null)
    setEditingProduct({ id: "", name: "", price: 0, icon: null, stock: 0, is_active: true, sort_order: 0 })
  }

  const handleSave = async () => {
    if (!editName.trim()) { setSaveError("Name is required"); return }
    const price = Number(editPrice)
    if (!price || price < 0) { setSaveError("Enter a valid price"); return }
    if (!shopId) return
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()
    const stock = parseInt(editStock) || 0

    if (isNew) {
      const maxOrder = products.length > 0 ? Math.max(...products.map((p) => p.sort_order)) : 0
      const { error } = await supabase.from("products").insert({
        shop_id: shopId,
        name: editName.trim(),
        price,
        icon: editEmoji,
        stock,
        is_active: editActive,
        sort_order: maxOrder + 1,
      })
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else if (editingProduct?.id) {
      const { error } = await supabase.from("products").update({
        name: editName.trim(),
        price,
        icon: editEmoji,
        stock,
        is_active: editActive,
      }).eq("id", editingProduct.id)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }

    setSaving(false)
    setEditingProduct(null)
    await load()
  }

  const handleDelete = async () => {
    if (!editingProduct?.id) return
    const supabase = createClient()
    await supabase.from("products").delete().eq("id", editingProduct.id)
    setEditingProduct(null)
    await load()
  }

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
        <h1 className="flex-1 text-center text-[18px] font-semibold text-[#111113]">Products</h1>
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
            placeholder="Search products..."
            className="flex-1 text-[14px] text-[#111113] placeholder:text-[#D1D5DB] bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Product list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-[14px] text-[#9CA3AF]">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <Package className="w-12 h-12 text-[#D1D5DB]" />
            <span className="text-[14px] text-[#9CA3AF] mt-3">
              {query ? "No products found" : "No products yet. Tap + Add to create one."}
            </span>
          </div>
        ) : (
          <div className="px-5 mt-5">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2.5 block px-1">
              {"PRODUCTS \u00B7 "}{filtered.length}
            </span>
            <div className="rounded-[16px] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => openEdit(p)}
                  className="flex items-center gap-3 px-[18px] py-4 border-b border-[#F8F8FA] last:border-b-0 w-full text-left active:bg-[#FAFAFA] transition-colors"
                >
                  <span className="text-[20px] leading-none shrink-0">{p.icon ?? "\uD83D\uDCE6"}</span>
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.is_active ? "#16A34A" : "#D1D5DB" }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[15px] font-medium text-[#111113] block leading-tight">{p.name}</span>
                    <span className="text-[11px] text-[#9CA3AF] mt-0.5 block">
                      Stock: {p.stock}
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-[#111113] shrink-0">
                    {fmt(p.price)} {"\u0E3F"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit / Add Bottom Sheet */}
      {editingProduct && (
        <>
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.4)] z-40"
            onClick={() => setEditingProduct(null)}
            onKeyDown={() => {}}
          />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] rounded-t-[24px] px-5 pt-5 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-5">
              {isNew ? "New product" : "Edit product"}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">NAME</label>
                <input autoFocus type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} placeholder="e.g. Pomade / Beer" />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">PRICE</label>
                <div className="relative">
                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className={inputClass + " pr-10"} placeholder="100" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF]">{"\u0E3F"}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">STOCK</label>
                <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className={inputClass} placeholder="0" />
              </div>
              <div>
                <label className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9CA3AF] block mb-2 ml-1">ICON</label>
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
              {saving ? "Saving..." : "Save"}
            </button>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full text-center mt-3 text-[14px] font-medium text-[#DC2626] active:opacity-60 transition-opacity"
              >
                Delete product
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
