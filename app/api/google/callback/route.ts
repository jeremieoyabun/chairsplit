import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/?google=error`)
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${appUrl}/?google=error`)

  const redirectUri = `${appUrl}/api/google/callback`

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  const tokens = await tokenRes.json()
  if (!tokenRes.ok || !tokens.access_token) {
    console.error("[google/callback] token exchange failed:", tokens)
    return NextResponse.redirect(`${appUrl}/?google=error`)
  }

  const expiry = new Date(
    Date.now() + (tokens.expires_in ?? 3600) * 1000
  ).toISOString()

  await supabase
    .from("profiles")
    .update({
      google_access_token: tokens.access_token,
      google_refresh_token: tokens.refresh_token ?? null,
      google_token_expiry: expiry,
    })
    .eq("id", user.id)

  return NextResponse.redirect(`${appUrl}/?google=connected`)
}
