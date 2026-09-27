"use client";

import React from "react";
import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { RotateCcw, Building2, CreditCard, Clock, CheckCircle2, AlertCircle, Shield } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      badge="Client Remittance & Cancellation"
      badgeIcon={RotateCcw}
      title="Refund & Cancellation Policy"
      subtitle="Comprehensive policy detailing mutual fund scheme redemptions, direct AMC fund settlements, advisory fee cancellations, and dispute resolutions."
      lastUpdated="September 2026"
      activePath="/refund-policy"
    >
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        
        {/* Core Direct Settlement Banner */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-950 flex items-start gap-3">
          <Building2 className="h-5 w-5 text-[#0047AB] mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-1">
            <span className="font-bold block text-sm text-[#0047AB]">Direct Investor-to-AMC Fund Routing</span>
            As an AMFI-registered distributor (ARN 145084), <strong>YS CAPITAL never accepts or pools investment funds into its own corporate accounts</strong>. All purchase and redemption monies are transferred directly between your bank account and SEBI-recognized clearing houses (e.g. BSE STAR MF, NSE NMF II, ICCL) or respective Mutual Fund AMCs.
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">1. Mutual Fund Investments & Scheme Redemptions</h2>
          <p>
            Investments in mutual funds are governed by the regulations of SEBI and the specific Scheme Information Document (SID) of the respective Asset Management Company (AMC):
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>
              <strong>Unit Redemption:</strong> Investors may redeem mutual fund units at any time (subject to lock-in periods for ELSS schemes or closed-ended funds) through the YS Portfolio dashboard or directly on the AMC/RTA portal (CAMS / KFintech).
            </li>
            <li>
              <strong>Applicable NAV:</strong> Redemption proceeds are calculated based on the official Net Asset Value (NAV) applicable according to SEBI cut-off timings on the business day the request is processed.
            </li>
            <li>
              <strong>Direct Payout to Bank Account:</strong> Redemption proceeds are credited directly by the AMC into the investor&apos;s registered bank account via NEFT/RTGS/NACH within standard statutory settlement cycles (typically T+1 business days for equity schemes and T+0 / T+1 for liquid/debt schemes).
            </li>
            <li>
              <strong>Exit Load & Capital Gains:</strong> Any exit load specified in the scheme document or applicable capital gains taxes (STCG/LTCG) will be deducted at source by the AMC prior to redemption payout.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">2. Systematic Investment Plans (SIP) Cancellation</h2>
          <p>
            Investors retain complete flexibility to modify, pause, or cancel their recurring Systematic Investment Plans (SIPs):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">No Cancellation Penalties</span>
              <p className="text-[11px] text-slate-500">YS CAPITAL charges zero penalty or exit fees for stopping or pausing an active SIP.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">Notice Period for Banking Mandates</span>
              <p className="text-[11px] text-slate-500">SIP stoppage requests must be submitted at least 15 calendar days before the next debit cycle to allow banking NACH processing.</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">3. Advisory Retainers & Software Platform Subscriptions</h2>
          <p>
            For specialized institutional family office advisory retainers, wealth command software licenses, or customized reporting packages:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>
              <strong>14-Day Satisfaction Guarantee:</strong> If you subscribe to any premium software reporting suite or institutional analytics tier, you may request a full refund within 14 calendar days of onboarding if not completely satisfied.
            </li>
            <li>
              <strong>Prorated Refunds:</strong> Annual or semi-annual retainer fees may be cancelled by providing a 30-day written notice. Any unconsumed advance fees for subsequent quarters will be refunded on a pro-rata basis.
            </li>
            <li>
              <strong>One-Time Setup & Audit Fees:</strong> One-time completed retrospective audits, historical accounting reconciliations, or bespoke software engineering deliverables are non-refundable once delivered.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">4. Duplicate Transactions & Payment Failures</h2>
          <p>
            In the rare event of technical glitches, bank gateway time-outs, or duplicate debits:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Auto-Reversal:</strong> If money is debited from your bank account without unit allocation, the clearing corporation or payment gateway will initiate an automatic reversal within 2 to 4 business days.</li>
            <li><strong>Manual Reconciliation:</strong> If funds are not reversed within 5 business days, notify our support desk with the bank transaction reference number (UTR) for expedited reconciliation.</li>
            <li><strong>100% Refund:</strong> Any erroneous software charges will be credited back via the original payment mode within 5-7 working days.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">5. How to Initiate a Refund or Cancellation Request</h2>
          <p>To request a cancellation, scheme redemption assistance, or subscription refund, follow these simple steps:</p>
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white">
              <span className="h-6 w-6 rounded-full bg-[#0047AB] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <div>
                <span className="font-bold text-xs text-slate-900 block">Submit Written Notice</span>
                <p className="text-[11px] text-slate-500">Send an email to <a href="mailto:clientservices@yscapital.com" className="text-[#0047AB] underline font-medium">clientservices@yscapital.com</a> with the subject line <em>&quot;Refund / Cancellation Request - [Your Client Code]&quot;</em>.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white">
              <span className="h-6 w-6 rounded-full bg-[#0047AB] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <div>
                <span className="font-bold text-xs text-slate-900 block">Include Transaction Details</span>
                <p className="text-[11px] text-slate-500">Provide scheme name, folio ID or transaction reference number, date of debit, and reason for the request.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white">
              <span className="h-6 w-6 rounded-full bg-[#0047AB] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <div>
                <span className="font-bold text-xs text-slate-900 block">Confirmation & Settlement</span>
                <p className="text-[11px] text-slate-500">Our compliance team will review and confirm processing within 24 business hours, with settlement tracking shared directly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">6. Contact Desk for Settlements</h2>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs text-slate-700">
            <p><strong>Department:</strong> Settlements & Redemptions Support Desk</p>
            <p><strong>Entity:</strong> Y S CAPITAL (ARN 145084)</p>
            <p><strong>Email:</strong> <a href="mailto:clientservices@yscapital.com" className="text-[#0047AB] underline">clientservices@yscapital.com</a></p>
            <p><strong>Direct Helpline:</strong> +91 22 4152 3000</p>
            <p><strong>Operating Hours:</strong> Monday through Friday, 9:00 AM – 6:00 PM IST</p>
          </div>
        </section>

      </div>
    </LegalPageLayout>
  );
}
