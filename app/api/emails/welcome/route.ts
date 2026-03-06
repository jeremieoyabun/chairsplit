import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

function welcomeHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to ChairSplit</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F6;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">

        <!-- Header -->
        <tr><td style="background:#1A1A1A;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
          <img src="https://www.chairsplit.app/images/Logo_chairsplit_white.png" alt="ChairSplit" height="32" style="display:inline-block;height:32px;width:auto;" />
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:10px 0 0;">Barbershop management, simplified</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#FFFFFF;padding:40px;border-radius:0 0 20px 20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <p style="font-size:22px;font-weight:700;color:#111113;margin:0 0 8px;">Welcome, ${name}! 👋</p>
          <p style="font-size:15px;color:#6B7280;line-height:1.6;margin:0 0 24px;">
            Your ChairSplit account is ready. Start by setting up your shop — add your services, invite your team, and track every visit from day one.
          </p>

          <a href="https://www.chairsplit.app" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">
            Open ChairSplit →
          </a>

          <hr style="border:none;border-top:1px solid #F3F4F6;margin:32px 0;" />

          <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
            Need help? Just reply to this email — we read every message.<br />
            The ChairSplit team
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:20px 0;">
          <p style="font-size:12px;color:#9CA3AF;margin:0;">ChairSplit · ${new Date().getFullYear()}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const { name, email } = await req.json()
  if (!name || !email) return NextResponse.json({ error: "Missing params" }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true }) // silently skip if not configured

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: "ChairSplit <noreply@chairsplit.app>",
    to: email,
    subject: "Welcome to ChairSplit ✂",
    html: welcomeHtml(name),
  })

  if (error) {
    console.error("[email/welcome]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
