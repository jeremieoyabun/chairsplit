import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"


function inviteHtml(name: string, shopName: string, role: string, email: string): string {
  const roleLabel = role === "manager" ? "Manager" : "Barber"
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>You've been invited to ${shopName}</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F6;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">

        <!-- Header -->
        <tr><td style="background:#1A1A1A;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
          <img src="https://www.chairsplit.app/images/logo-chairsplit.png" alt="ChairSplit" height="32" style="display:inline-block;height:32px;width:auto;" />
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:10px 0 0;">Barbershop management, simplified</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#FFFFFF;padding:40px;border-radius:0 0 20px 20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <p style="font-size:22px;font-weight:700;color:#111113;margin:0 0 8px;">You've been invited! 💈</p>
          <p style="font-size:15px;color:#6B7280;line-height:1.6;margin:0 0 24px;">
            <strong style="color:#111113;">${shopName}</strong> has invited you to join their team as a <strong style="color:#111113;">${roleLabel}</strong> on ChairSplit.
          </p>

          <!-- Invitation box -->
          <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
            <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF;margin:0 0 4px;">Shop</p>
            <p style="font-size:16px;font-weight:700;color:#111113;margin:0 0 16px;">${shopName}</p>
            <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF;margin:0 0 4px;">Your role</p>
            <p style="font-size:16px;font-weight:700;color:#111113;margin:0;">${roleLabel}</p>
          </div>

          <p style="font-size:14px;color:#6B7280;line-height:1.6;margin:0 0 24px;">
            To get started, create an account at <strong>chairsplit.app</strong> using this email address: <strong style="color:#111113;">${email}</strong>
          </p>

          <a href="https://www.chairsplit.app" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">
            Join ${shopName} →
          </a>

          <hr style="border:none;border-top:1px solid #F3F4F6;margin:32px 0;" />

          <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
            Once you sign up with this email, you'll be automatically linked to ${shopName}.<br />
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
  const { name, email, shopName, role } = await req.json()
  if (!email || !shopName) return NextResponse.json({ error: "Missing params" }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true }) // silently skip if not configured

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: "ChairSplit <onboarding@resend.dev>",
    to: email,
    subject: `You've been invited to join ${shopName} on ChairSplit`,
    html: inviteHtml(name ?? email, shopName, role ?? "barber", email),
  })

  if (error) {
    console.error("[email/invite]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
