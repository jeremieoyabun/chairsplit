import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — ChairSplit",
  description: "How ChairSplit collects, uses and protects your personal data.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F3]">
      <div className="max-w-2xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-[13px] text-[#6B7280] hover:text-[#111113] transition-colors">
            ← Back to ChairSplit
          </Link>
          <h1 className="text-[32px] font-bold text-[#111113] mt-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-[14px] text-[#9CA3AF] mt-2">Last updated: February 2025</p>
        </div>

        <div className="space-y-8 text-[15px] text-[#374151] leading-relaxed">

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">1. Who we are</h2>
            <p>
              ChairSplit ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") is a barbershop management
              application published at <strong>chairsplit.app</strong>. ChairSplit helps barbershop owners manage visits,
              commissions, finances and their team.
            </p>
            <p className="mt-2">
              For any question regarding this policy, contact us at:{" "}
              <a href="mailto:contact@chairsplit.com" className="text-[#111113] font-medium underline">
                contact@chairsplit.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">2. Data we collect</h2>
            <p className="mb-3">We collect the following categories of personal data:</p>
            <div className="rounded-[14px] bg-white border border-[#E5E7EB] overflow-hidden">
              {[
                { cat: "Account data", detail: "Email address, name, password (hashed), role (owner / barber)" },
                { cat: "Shop data", detail: "Shop name, address, phone, LINE Pay QR code, logo" },
                { cat: "Visit data", detail: "Date, services performed, amounts, payment method, barber and client assigned" },
                { cat: "Client data", detail: "Name, phone number, email, notes entered by the shop owner" },
                { cat: "Financial data", detail: "Revenue, expenses, commissions — all entered by the shop user" },
                { cat: "Payment data", detail: "Stripe customer ID, subscription ID — no card number is stored by us" },
                { cat: "Calendar data", detail: "Google Calendar access token (optional, only if you connect your calendar)" },
                { cat: "Technical data", detail: "IP address, browser, push notification subscription token" },
              ].map(({ cat, detail }) => (
                <div key={cat} className="flex gap-3 px-4 py-3 border-b border-[#F3F4F6] last:border-0">
                  <span className="font-semibold text-[#111113] w-40 shrink-0 text-[14px]">{cat}</span>
                  <span className="text-[#6B7280] text-[14px]">{detail}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">3. How we use your data</h2>
            <ul className="space-y-2 list-none">
              {[
                "Provide and operate the ChairSplit service",
                "Process subscription payments via Stripe",
                "Send transactional emails (welcome, invitations, payslips) via Resend",
                "Send push notifications you have opted into",
                "Display your Google Calendar events inside the app (if connected)",
                "Improve our service through anonymous usage analysis",
                "Respond to support requests",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#111113] font-bold mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              We never sell your personal data to third parties. We never use your data for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibent text-[#111113] mb-3">4. Third-party services</h2>
            <p className="mb-3">We use the following sub-processors to operate the service:</p>
            <div className="rounded-[14px] bg-white border border-[#E5E7EB] overflow-hidden">
              {[
                { name: "Supabase", role: "Database & authentication", privacy: "https://supabase.com/privacy" },
                { name: "Stripe", role: "Payment processing & subscriptions", privacy: "https://stripe.com/privacy" },
                { name: "Resend", role: "Transactional emails", privacy: "https://resend.com/privacy" },
                { name: "Google", role: "Calendar integration (optional)", privacy: "https://policies.google.com/privacy" },
                { name: "Vercel", role: "Application hosting", privacy: "https://vercel.com/legal/privacy-policy" },
              ].map(({ name, role, privacy }) => (
                <div key={name} className="flex gap-3 px-4 py-3 border-b border-[#F3F4F6] last:border-0 items-center">
                  <span className="font-semibold text-[#111113] w-24 shrink-0 text-[14px]">{name}</span>
                  <span className="text-[#6B7280] text-[14px] flex-1">{role}</span>
                  <a href={privacy} target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#111113] underline shrink-0">
                    Policy ↗
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">5. Data retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account, your
              personal data is deleted within <strong>30 days</strong>, except where we are required to
              retain it by law (e.g. billing records for tax purposes, kept for up to 7 years).
            </p>
            <p className="mt-2">
              Visit history and financial data belonging to your shop are deleted with your account.
              Client data you entered is also deleted.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">6. Your rights</h2>
            <p className="mb-2">
              Depending on your country of residence, you may have the following rights regarding your personal data:
            </p>
            <ul className="space-y-1.5 list-none">
              {[
                "Right of access — request a copy of all data we hold about you",
                "Right of rectification — correct inaccurate data",
                "Right of erasure — request deletion of your account and data",
                "Right to data portability — receive your data in a machine-readable format",
                "Right to object — object to specific processing activities",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#111113] font-bold mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:contact@chairsplit.com" className="text-[#111113] font-medium underline">
                contact@chairsplit.com
              </a>{" "}
              and we will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">7. Cookies & local storage</h2>
            <p>
              ChairSplit uses browser cookies solely for authentication (session management via Supabase).
              We do not use advertising, analytics or tracking cookies. Local storage is used to cache
              your app preferences on your device only.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">8. Security</h2>
            <p>
              All data is transmitted over HTTPS. Passwords are hashed and never stored in plain text.
              Database access is protected by Row Level Security (RLS) policies — each user can only
              access data belonging to their shop. Payment card data is handled entirely by Stripe and
              never passes through our servers.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">9. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of material changes by
              email or by a notice in the app. Continued use of ChairSplit after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">10. Contact</h2>
            <p>
              Questions about this Privacy Policy?{" "}
              <a href="mailto:contact@chairsplit.com" className="text-[#111113] font-medium underline">
                contact@chairsplit.com
              </a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-[#E5E7EB] flex gap-4 text-[13px] text-[#9CA3AF]">
          <Link href="/terms" className="hover:text-[#111113] transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link href="/" className="hover:text-[#111113] transition-colors">Back to app</Link>
        </div>
      </div>
    </div>
  )
}
