import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerSupabase } from "@/lib/supabase/server"

const DEFAULT_SERVICES = [
  { name: "Haircut/Fade", price: 400, icon: "✂️", is_addon: false, sort_order: 1 },
  { name: "Beard Trim", price: 300, icon: "🪒", is_addon: false, sort_order: 2 },
  { name: "Hair Coloring", price: 1500, icon: "🎨", is_addon: false, sort_order: 3 },
  { name: "Bald Head Shave", price: 350, icon: "💈", is_addon: false, sort_order: 4 },
  { name: "Hot Towel", price: 200, icon: "♨️", is_addon: true, sort_order: 5 },
  { name: "Shampoo", price: 300, icon: "🧴", is_addon: true, sort_order: 6 },
  { name: "Facial Steamer", price: 200, icon: "💆", is_addon: true, sort_order: 7 },
  { name: "Line Up", price: 100, icon: "🖌️", is_addon: true, sort_order: 8 },
]

export async function POST(req: NextRequest) {
  const { name, address, phone } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Shop name is required." }, { status: 400 })

  // Get the authenticated user from cookies
  const serverSupabase = await createServerSupabase()
  const { data: { user }, error: authErr } = await serverSupabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  // Use service role key to bypass RLS
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. Create the shop
  const { data: shop, error: shopErr } = await admin
    .from("shops")
    .insert({
      name: name.trim(),
      address: address?.trim() || null,
      phone: phone?.trim() || null,
      plan: "starter",
      plan_status: "trialing",
      trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single()

  if (shopErr || !shop) {
    console.error("[shop/create] create shop:", shopErr?.message)
    return NextResponse.json({ error: shopErr?.message ?? "Failed to create shop." }, { status: 500 })
  }

  // 2. Link owner profile to shop
  const { error: profileErr } = await admin
    .from("profiles")
    .update({ shop_id: shop.id })
    .eq("id", user.id)
  if (profileErr) console.error("[shop/create] link profile:", profileErr.message)

  // 3. Insert default services
  const { error: servicesErr } = await admin
    .from("services")
    .insert(DEFAULT_SERVICES.map((s) => ({ ...s, shop_id: shop.id, is_active: true })))
  if (servicesErr) console.error("[shop/create] insert services:", servicesErr.message)

  // 4. Insert default commission rule (30%)
  const { error: commErr } = await admin
    .from("commission_rules")
    .insert({ shop_id: shop.id, rate: 30 })
  if (commErr) console.error("[shop/create] insert commission rule:", commErr.message)

  return NextResponse.json({ ok: true, shopId: shop.id })
}
