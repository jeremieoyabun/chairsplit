import webpush from "web-push"
import { createClient } from "@supabase/supabase-js"

webpush.setVapidDetails(
  "mailto:contact@chairsplit.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("subscription, endpoint")
    .eq("user_id", userId)

  if (!subs?.length) return

  const results = await Promise.allSettled(
    subs.map(async (row) => {
      const sub = JSON.parse(row.subscription)
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload))
      } catch (err: any) {
        // 410 Gone = subscription expired, clean it up
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", row.endpoint)
        }
      }
    })
  )
  return results
}

export async function sendPushToShop(
  shopId: string,
  payload: { title: string; body: string; url?: string },
  excludeUserId?: string
) {
  let query = supabaseAdmin
    .from("push_subscriptions")
    .select("subscription, endpoint, user_id")
    .eq("shop_id", shopId)

  const { data: subs } = await query
  if (!subs?.length) return

  await Promise.allSettled(
    subs
      .filter((row) => row.user_id !== excludeUserId)
      .map(async (row) => {
        const sub = JSON.parse(row.subscription)
        try {
          await webpush.sendNotification(sub, JSON.stringify(payload))
        } catch (err: any) {
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await supabaseAdmin
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", row.endpoint)
          }
        }
      })
  )
}
