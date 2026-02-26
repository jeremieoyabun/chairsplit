import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { sendPushToUser, sendPushToShop } from "@/lib/push"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { type, visitId } = await req.json()
  if (!type || !visitId) return NextResponse.json({ error: "Missing params" }, { status: 400 })

  const { data: visit } = await supabaseAdmin
    .from("visits")
    .select("id, shop_id, barber_id, total_amount, barber:profiles!visits_barber_id_fkey(full_name)")
    .eq("id", visitId)
    .single()

  if (!visit) return NextResponse.json({ error: "Visit not found" }, { status: 404 })

  try {
    if (type === "visit_validated") {
      // Owner validated a visit → notify the barber
      const barberName = (visit.barber as any)?.full_name ?? "A barber"
      await sendPushToUser(visit.barber_id, {
        title: "Visit validated ✓",
        body: `Your visit of ${Math.round(visit.total_amount ?? 0).toLocaleString()} ฿ has been validated.`,
        url: "/",
      })
    } else if (type === "visit_created_draft") {
      // Barber created a draft → notify shop owners
      const barberName = (visit.barber as any)?.full_name ?? "A barber"
      await sendPushToShop(visit.shop_id, {
        title: "New visit pending",
        body: `${barberName} added a visit waiting for validation.`,
        url: "/",
      }, user.id) // exclude sender
    }
  } catch (err: any) {
    console.error("[push/notify]", err?.message)
  }

  return NextResponse.json({ ok: true })
}
