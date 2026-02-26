/**
 * getShop() — cached auth + shop_id resolver
 *
 * Problems this solves:
 *  1. Every component was calling getUser() which makes a network request
 *     to validate the JWT (~200 ms). Replaced with getSession() which reads
 *     from localStorage (0 ms).
 *  2. Every component was querying the `profiles` table on mount.
 *     We cache the result in memory for 10 minutes.
 *  3. When multiple components mount simultaneously (e.g. Header +
 *     RevenueCard + RecentVisits on the home screen), they all called the
 *     same queries concurrently. We deduplicate in-flight requests so only
 *     one DB round-trip happens.
 */

import { createClient } from "@/lib/supabase/client"

type ShopInfo = { userId: string; shopId: string; role: string }

let cache: ShopInfo | null = null
let cacheExpiry = 0
let inFlight: Promise<ShopInfo | null> | null = null

export async function getShop(): Promise<ShopInfo | null> {
  // 1. Memory cache hit
  if (cache && Date.now() < cacheExpiry) return cache

  // 2. Deduplicate concurrent callers
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const supabase = createClient()

      // getSession() reads from localStorage — no network call
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return null

      const { data: profile } = await supabase
        .from("profiles")
        .select("shop_id, role")
        .eq("id", session.user.id)
        .single()

      if (!profile?.shop_id) return null

      cache = { userId: session.user.id, shopId: profile.shop_id, role: profile.role ?? "" }
      cacheExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes
      return cache
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}

/** Call on sign-out so the next login fetches fresh data */
export function clearShopCache() {
  cache = null
  cacheExpiry = 0
  inFlight = null
}
