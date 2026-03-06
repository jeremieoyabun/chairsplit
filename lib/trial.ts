/** Trial status helper — works on both client and server */

export function trialStatus(trialEndsAt: string | null, planStatus: string) {
  if (planStatus !== "trialing" || !trialEndsAt) return null
  const end = new Date(trialEndsAt).getTime()
  const now = Date.now()
  const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000))
  return { expired: daysLeft === 0, daysLeft }
}
