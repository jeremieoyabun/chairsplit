import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function fmt(n: number) {
  return Math.round(n).toLocaleString("fr-FR")
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get("month") // YYYY-MM
  const shopId = req.nextUrl.searchParams.get("shopId")

  if (!month || !shopId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 })
  }

  const [y, m] = month.split("-").map(Number)
  const start = new Date(y, m - 1, 1).toISOString()
  const end = new Date(y, m, 1).toISOString()
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  // Load shop info
  const { data: shop } = await supabaseAdmin
    .from("shops")
    .select("name")
    .eq("id", shopId)
    .single()

  // Load barbers
  const { data: barbers } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name")
    .eq("shop_id", shopId)
    .eq("role", "barber")

  if (!barbers?.length) {
    return new NextResponse("No barbers found.", { status: 200 })
  }

  // Load commission rules
  const { data: rules } = await supabaseAdmin
    .from("commission_rules")
    .select("barber_id, rate")
    .eq("shop_id", shopId)

  const ruleMap: Record<string, number> = {}
  for (const r of rules ?? []) {
    if (r.barber_id) ruleMap[r.barber_id] = r.rate
  }
  const globalRate = rules?.find((r) => !r.barber_id)?.rate ?? 30

  // Load visits
  const { data: visits } = await supabaseAdmin
    .from("visits")
    .select("barber_id, total_amount")
    .eq("shop_id", shopId)
    .eq("status", "validated")
    .gte("created_at", start)
    .lt("created_at", end)

  const statsMap: Record<string, { revenue: number; visits: number }> = {}
  for (const v of visits ?? []) {
    if (!statsMap[v.barber_id]) statsMap[v.barber_id] = { revenue: 0, visits: 0 }
    statsMap[v.barber_id].revenue += v.total_amount ?? 0
    statsMap[v.barber_id].visits += 1
  }

  const rows = barbers.map((b) => {
    const stats = statsMap[b.id] ?? { revenue: 0, visits: 0 }
    const rate = ruleMap[b.id] ?? globalRate
    return {
      name: b.full_name ?? "—",
      initials: getInitials(b.full_name),
      visits: stats.visits,
      revenue: stats.revenue,
      commission: Math.round(stats.revenue * rate / 100),
      rate,
    }
  })

  const shopName = shop?.name ?? "Barbershop"

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Payslips – ${monthLabel} – ${shopName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F4F4F6; color: #111113; }
  .page { max-width: 680px; margin: 0 auto; padding: 40px 24px; }
  .header { margin-bottom: 32px; }
  .header h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
  .header p { font-size: 14px; color: #6B7280; margin-top: 4px; }
  .payslip { background: #FFFFFF; border-radius: 20px; padding: 28px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); page-break-inside: avoid; }
  .payslip-header { display: flex; align-items: center; gap: 14px; }
  .avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #fff; flex-shrink: 0; background: #3B82F6; }
  .payslip-name { font-size: 20px; font-weight: 700; }
  .payslip-period { font-size: 13px; color: #9CA3AF; margin-top: 2px; }
  .divider { height: 1px; background: #F3F4F6; margin: 20px 0; }
  .stats { display: flex; gap: 0; }
  .stat { flex: 1; text-align: center; }
  .stat-label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em; }
  .stat-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
  .stat-unit { font-size: 13px; color: #9CA3AF; }
  .commission-box { margin-top: 20px; background: #ECFDF5; border-radius: 14px; padding: 20px; text-align: center; }
  .commission-label { font-size: 12px; font-weight: 600; color: #16A34A; }
  .commission-amount { font-size: 36px; font-weight: 800; color: #16A34A; margin-top: 4px; }
  .commission-unit { font-size: 18px; color: #16A34A; margin-left: 4px; }
  .footer { text-align: center; font-size: 12px; color: #9CA3AF; margin-top: 32px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
  @media print {
    body { background: white; }
    .page { padding: 20px; }
    .payslip { box-shadow: none; border: 1px solid #E5E7EB; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>${shopName}</h1>
    <p>Payslips for ${monthLabel} &nbsp;·&nbsp; Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
  </div>

  ${rows.map((r) => `
  <div class="payslip">
    <div class="payslip-header">
      <div class="avatar">${r.initials}</div>
      <div>
        <div class="payslip-name">${r.name}</div>
        <div class="payslip-period">${monthLabel} &nbsp;·&nbsp; Commission rate: ${r.rate}%</div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Visits</div>
        <div class="stat-value">${r.visits}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Revenue</div>
        <div class="stat-value">${fmt(r.revenue)}<span class="stat-unit"> ฿</span></div>
      </div>
      <div class="stat">
        <div class="stat-label">Rate</div>
        <div class="stat-value">${r.rate}<span class="stat-unit">%</span></div>
      </div>
    </div>
    <div class="commission-box">
      <div class="commission-label">Commission due</div>
      <div>
        <span class="commission-amount">${fmt(r.commission)}</span>
        <span class="commission-unit">฿</span>
      </div>
    </div>
  </div>
  `).join("")}

  <div class="footer">
    ChairSplit · ${shopName} · ${monthLabel}
  </div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
