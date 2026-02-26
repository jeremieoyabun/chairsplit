import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

function contactHtml(name: string, email: string, shopCount: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New Chain / Enterprise Inquiry</title>
</head>
<body style="margin:0;padding:0;background:#F4F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F6;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">

        <!-- Header -->
        <tr><td style="background:#1A1A1A;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
          <img src="https://www.chairsplit.app/images/Logo_chairsplit_white.png" alt="ChairSplit" height="32" style="display:inline-block;height:32px;width:auto;" />
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:10px 0 0;">New chain / enterprise inquiry</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#FFFFFF;padding:40px;border-radius:0 0 20px 20px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <p style="font-size:22px;font-weight:700;color:#111113;margin:0 0 8px;">New custom pricing request 💼</p>
          <p style="font-size:15px;color:#6B7280;line-height:1.6;margin:0 0 24px;">
            Someone is interested in the <strong style="color:#111113;">Chain plan</strong> and wants a custom quote.
          </p>

          <!-- Details box -->
          <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
            <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF;margin:0 0 4px;">Name</p>
            <p style="font-size:16px;font-weight:700;color:#111113;margin:0 0 16px;">${name}</p>

            <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF;margin:0 0 4px;">Email</p>
            <p style="font-size:16px;font-weight:700;color:#111113;margin:0 0 16px;">${email}</p>

            <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF;margin:0 0 4px;">Number of locations / chairs</p>
            <p style="font-size:16px;font-weight:700;color:#111113;margin:0 0 16px;">${shopCount || "Not specified"}</p>

            ${message ? `
            <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#9CA3AF;margin:0 0 4px;">Message</p>
            <p style="font-size:15px;color:#374151;margin:0;line-height:1.6;">${message}</p>` : ""}
          </div>

          <a href="mailto:${email}" style="display:inline-block;background:#1A1A1A;color:#FFFFFF;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">
            Reply to ${name} →
          </a>

          <hr style="border:none;border-top:1px solid #F3F4F6;margin:32px 0;" />

          <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.6;">
            This lead came from the Chain pricing card on chairsplit.app.<br />
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
  const { name, email, shopCount, message } = await req.json()
  if (!name || !email) return NextResponse.json({ error: "Missing params" }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true }) // silently skip if not configured

  const teamEmail = process.env.CONTACT_SALES_EMAIL ?? "hello@chairsplit.app"

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: "ChairSplit <onboarding@resend.dev>",
    to: teamEmail,
    replyTo: email,
    subject: `New chain inquiry from ${name}`,
    html: contactHtml(name, email, shopCount ?? "", message ?? ""),
  })

  if (error) {
    console.error("[email/contact-sales]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
