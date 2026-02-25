import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

async function refreshAccessToken(
  refreshToken: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof createServerSupabase>>
): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })
  const data = await res.json()
  if (!data.access_token) return null

  const expiry = new Date(
    Date.now() + (data.expires_in ?? 3600) * 1000
  ).toISOString()
  await supabase
    .from("profiles")
    .update({ google_access_token: data.access_token, google_token_expiry: expiry })
    .eq("id", userId)

  return data.access_token
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles")
    .select("google_access_token, google_refresh_token, google_token_expiry")
    .eq("id", user.id)
    .single()

  if (!profile?.google_access_token) {
    return NextResponse.json({ connected: false, events: [] })
  }

  // Refresh token if expiring within 60 seconds
  let accessToken = profile.google_access_token
  const expiry = profile.google_token_expiry
    ? new Date(profile.google_token_expiry)
    : new Date(0)

  if (Date.now() > expiry.getTime() - 60_000 && profile.google_refresh_token) {
    const newToken = await refreshAccessToken(
      profile.google_refresh_token,
      user.id,
      supabase
    )
    if (newToken) accessToken = newToken
  }

  const date =
    req.nextUrl.searchParams.get("date") ??
    new Date().toISOString().split("T")[0]

  // Fetch a week when view=week is passed, otherwise just the single day
  const view = req.nextUrl.searchParams.get("view") ?? "day"
  let timeMin: string
  let timeMax: string

  if (view === "week") {
    const d = new Date(date)
    const dow = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((dow + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 7)
    timeMin = monday.toISOString()
    timeMax = sunday.toISOString()
  } else {
    timeMin = `${date}T00:00:00Z`
    timeMax = `${date}T23:59:59Z`
  }

  const calRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
      }),
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!calRes.ok) {
    if (calRes.status === 401) {
      // Token is invalid — clear it
      await supabase
        .from("profiles")
        .update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expiry: null,
        })
        .eq("id", user.id)
      return NextResponse.json({ connected: false, events: [] })
    }
    console.error("[google/events] calendar API error:", calRes.status)
    return NextResponse.json({ connected: true, events: [] })
  }

  const calData = await calRes.json()
  const events = (calData.items ?? []).map((e: Record<string, unknown>) => {
    const start = e.start as Record<string, string> | undefined
    const end = e.end as Record<string, string> | undefined
    return {
      id: e.id as string,
      title: (e.summary as string) ?? "Busy",
      start: start?.dateTime ?? start?.date ?? "",
      end: end?.dateTime ?? end?.date ?? "",
      allDay: !start?.dateTime,
    }
  })

  return NextResponse.json({ connected: true, events })
}
