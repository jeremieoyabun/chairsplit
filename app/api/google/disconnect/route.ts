import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("google_access_token")
    .eq("id", user.id)
    .single()

  // Attempt to revoke the token at Google (best-effort)
  if (profile?.google_access_token) {
    await fetch(
      `https://oauth2.googleapis.com/revoke?token=${profile.google_access_token}`,
      { method: "POST" }
    ).catch(() => {})
  }

  await supabase
    .from("profiles")
    .update({
      google_access_token: null,
      google_refresh_token: null,
      google_token_expiry: null,
    })
    .eq("id", user.id)

  return NextResponse.json({ ok: true })
}
