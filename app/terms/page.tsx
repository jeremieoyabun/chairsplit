import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service — ChairSplit",
  description: "Terms and conditions governing the use of ChairSplit.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F0F0F3]">
      <div className="max-w-2xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-[13px] text-[#6B7280] hover:text-[#111113] transition-colors">
            ← Back to ChairSplit
          </Link>
          <h1 className="text-[32px] font-bold text-[#111113] mt-4 leading-tight">
            Terms of Service
          </h1>
          <p className="text-[14px] text-[#9CA3AF] mt-2">Last updated: February 2025</p>
        </div>

        <div className="space-y-8 text-[15px] text-[#374151] leading-relaxed">

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">1. Acceptance of terms</h2>
            <p>
              By creating an account or using ChairSplit ("<strong>the Service</strong>"), you agree to
              be bound by these Terms of Service ("<strong>Terms</strong>"). If you do not agree to these
              Terms, do not use the Service.
            </p>
            <p className="mt-2">
              ChairSplit is operated by its publisher, reachable at{" "}
              <a href="mailto:hello@chairsplit.app" className="text-[#111113] font-medium underline">
                hello@chairsplit.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">2. Description of the Service</h2>
            <p>
              ChairSplit is a SaaS application designed for barbershop owners and their teams. It provides
              tools to log client visits, calculate barber commissions, track revenue and expenses, generate
              payslips, manage a service catalog, and view financial reports.
            </p>
            <p className="mt-2">
              The Service is provided as a web application accessible at{" "}
              <strong>chairsplit.app</strong> and as a Progressive Web App (PWA) installable on mobile devices.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">3. Account registration</h2>
            <ul className="space-y-2 list-none">
              {[
                "You must be at least 18 years old to create an account.",
                "You must provide accurate and complete information during registration.",
                "You are responsible for maintaining the confidentiality of your login credentials.",
                "You are responsible for all activity that occurs under your account.",
                "You must notify us immediately at hello@chairsplit.app if you suspect unauthorized access.",
                "One shop per owner account. Multiple barber accounts can be invited to one shop.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#111113] font-bold mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">4. Subscription plans and billing</h2>

            <h3 className="text-[15px] font-semibold text-[#111113] mb-2 mt-4">4.1 Plans</h3>
            <p className="mb-3">ChairSplit offers the following paid subscription plans:</p>
            <div className="rounded-[14px] bg-white border border-[#E5E7EB] overflow-hidden mb-4">
              {[
                { plan: "Starter", detail: "Up to 5 barbers — 490 ฿/month or 4,998 ฿/year" },
                { plan: "Pro", detail: "Up to 15 barbers — 990 ฿/month or 10,098 ฿/year" },
              ].map(({ plan, detail }) => (
                <div key={plan} className="flex gap-3 px-4 py-3 border-b border-[#F3F4F6] last:border-0">
                  <span className="font-semibold text-[#111113] w-20 shrink-0 text-[14px]">{plan}</span>
                  <span className="text-[#6B7280] text-[14px]">{detail}</span>
                </div>
              ))}
            </div>
            <p>Prices are in Thai Baht (THB) and may be updated with 30 days&apos; notice.</p>

            <h3 className="text-[15px] font-semibold text-[#111113] mb-2 mt-4">4.2 Billing</h3>
            <ul className="space-y-2 list-none">
              {[
                "Subscriptions are billed in advance (monthly or yearly) via Stripe.",
                "Your subscription renews automatically unless cancelled before the renewal date.",
                "All payments are non-refundable except where required by applicable law.",
                "In case of payment failure, access to paid features may be suspended until payment is resolved.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#111113] font-bold mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-[15px] font-semibold text-[#111113] mb-2 mt-4">4.3 Cancellation</h3>
            <p>
              You may cancel your subscription at any time via the subscription management portal accessible
              from within the app (Settings → Subscription → Manage subscription). Cancellation takes
              effect at the end of the current billing period. No partial refunds are issued for unused time.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">5. Acceptable use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="space-y-2 list-none">
              {[
                "Use the Service for any unlawful purpose or in violation of any applicable laws.",
                "Attempt to gain unauthorized access to other users' accounts or data.",
                "Reverse engineer, decompile or attempt to extract the source code of the Service.",
                "Use the Service to store or transmit malicious code.",
                "Resell, sublicense or make the Service available to third parties without our written consent.",
                "Enter false, misleading or fraudulent data into the Service.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#EF4444] font-bold mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">6. Your data</h2>
            <p>
              You retain full ownership of all data you enter into ChairSplit (client information, visit
              records, financial data, etc.). You grant us a limited license to process this data solely
              to provide the Service to you.
            </p>
            <p className="mt-2">
              We do not claim ownership of your data, and we will not use it for any purpose other than
              operating the Service. See our{" "}
              <Link href="/privacy" className="text-[#111113] font-medium underline">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">7. Service availability</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted access to the Service. We
              may perform maintenance, updates or emergency interventions that temporarily interrupt service.
              We will endeavour to notify users of planned downtime in advance.
            </p>
            <p className="mt-2">
              We are not liable for losses caused by temporary unavailability of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, ChairSplit is provided "<strong>as is</strong>"
              without warranties of any kind, express or implied, including but not limited to warranties
              of merchantability, fitness for a particular purpose, or accuracy.
            </p>
            <p className="mt-2">
              In no event shall ChairSplit be liable for indirect, incidental, special or consequential
              damages, including loss of revenue, loss of data, or loss of profits, even if advised of the
              possibility of such damages.
            </p>
            <p className="mt-2">
              Our total liability for any claim arising from use of the Service shall not exceed the amount
              you paid us in the 3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">9. Intellectual property</h2>
            <p>
              All elements of the ChairSplit application — including but not limited to the interface design,
              logo, source code, and content produced by us — are the exclusive property of ChairSplit and
              are protected by applicable intellectual property laws.
            </p>
            <p className="mt-2">
              Nothing in these Terms grants you any right to use the ChairSplit name, logo or trademarks.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time if you violate these
              Terms or engage in conduct that we determine to be harmful to other users or to the Service.
            </p>
            <p className="mt-2">
              You may delete your account at any time by contacting us at{" "}
              <a href="mailto:hello@chairsplit.app" className="text-[#111113] font-medium underline">
                hello@chairsplit.app
              </a>
              . Upon deletion, your data will be removed in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">11. Modifications to the Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes by
              email or via a notice in the app at least 15 days before the changes take effect. Your
              continued use of the Service after that date constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">12. Governing law</h2>
            <p>
              These Terms are governed by applicable law. Any dispute arising from these Terms shall be
              subject to the exclusive jurisdiction of the competent courts, unless mandatory consumer
              protection law in your country of residence provides otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-[#111113] mb-3">13. Contact</h2>
            <p>
              For any questions about these Terms, contact us at:{" "}
              <a href="mailto:hello@chairsplit.app" className="text-[#111113] font-medium underline">
                hello@chairsplit.app
              </a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-[#E5E7EB] flex gap-4 text-[13px] text-[#9CA3AF]">
          <Link href="/privacy" className="hover:text-[#111113] transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/" className="hover:text-[#111113] transition-colors">Back to app</Link>
        </div>
      </div>
    </div>
  )
}
