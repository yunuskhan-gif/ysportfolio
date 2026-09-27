"use client";

import React from "react";
import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { Scale, AlertTriangle, ShieldCheck, FileCheck, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  return (
    <LegalPageLayout
      badge="Client Agreement & Terms"
      badgeIcon={Scale}
      title="Terms & Conditions"
      subtitle="Governing rules, regulatory disclosures, and terms of service for utilizing YS CAPITAL wealth management platforms and distributor services."
      lastUpdated="September 2026"
      activePath="/terms"
    >
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        
        {/* Risk Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-1">
            <span className="font-bold block text-sm text-amber-900">Mandatory Statutory Warning</span>
            Mutual Fund investments and equity securities are subject to market risks. Please read all scheme-related documents, offer documents, and key information memorandums (KIM) carefully before investing. Past performance is not indicative of future returns.
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">1. Regulatory Status & Acceptance of Terms</h2>
          <p>
            These Terms & Conditions constitute a legally binding agreement between you (&quot;Client&quot;, &quot;Investor&quot;, or &quot;User&quot;) and <strong>Y S CAPITAL</strong> (&quot;YS CAPITAL&quot;, &quot;we&quot;, or &quot;us&quot;), an <strong>AMFI Registered Mutual Fund Distributor (ARN-145084)</strong> and <strong>APMI Registered Portfolio Management Services (PMS) Distributor</strong>.
          </p>
          <p>
            By accessing or using the <strong>YS Digital Portfolio</strong> application, importing statements, viewing wealth dashboards, or engaging our distribution services, you unconditionally agree to be bound by these Terms. If you disagree with any provision, you must immediately discontinue use of the platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">2. Scope of Services</h2>
          <p>YS CAPITAL provides integrated multi-asset distribution and digital tracking utilities, including:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Mutual Fund Distribution:</strong> Facilitating investments in schemes of Asset Management Companies (AMCs) registered with SEBI.</li>
            <li><strong>PMS & AIF Distribution:</strong> Providing access to accredited Portfolio Management Services and Alternative Investment Funds in compliance with APMI and SEBI regulations.</li>
            <li><strong>Digital Wealth Dashboard:</strong> Aggregating direct equity holdings, mutual fund folios, fixed deposits, gold bonds, loans, and double-entry cash ledgers.</li>
            <li><strong>Automated Statement Parsing:</strong> Importing CAS PDFs (CAMS / KFintech) and broker spreadsheets without manual data entry.</li>
            <li><strong>Analytical Computations:</strong> Providing XIRR, CAGR, asset allocation splits, and goal planning simulations.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">3. Informational & Execution Role (No Guaranteed Returns)</h2>
          <p>
            YS Digital Portfolio is an analytical intelligence suite designed to monitor historical transactions and compute mathematical returns. Nothing contained within this platform constitutes a guarantee, warranty, or promise of positive investment returns.
          </p>
          <p>
            Investors retain sole discretion over investment execution. YS CAPITAL acts strictly in its statutory capacity as an AMFI/APMI registered distributor and does not operate as an unregistered discretionary portfolio manager.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">4. Distributor Commission Disclosure</h2>
          <p>
            In strict compliance with <em>SEBI Circular SEBI/IMD/CIR No. 4/168230/09</em> and subsequent amendments, YS CAPITAL discloses that it receives trail commissions from respective Asset Management Companies (AMCs) for distributing mutual fund schemes.
          </p>
          <p>
            The commission structure varies across scheme categories (Equity, Hybrid, Debt, Liquid, Index) and is paid directly by the AMC out of the scheme&apos;s Total Expense Ratio (TER) without any additional direct out-of-pocket fee charged to the investor for regular mutual fund transactions. Full category-wise commission rates are available upon client request.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">5. Account Credentials & Security</h2>
          <p>
            Access to client portfolios is protected via master password verification gates. You are exclusively responsible for maintaining the confidentiality of your session keys and passwords.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>You agree to notify YS CAPITAL immediately if you suspect unauthorized access or compromised credentials.</li>
            <li>YS CAPITAL shall not be liable for any losses arising from negligence or sharing of passwords with unauthorized individuals.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">6. Accuracy of Third-Party Feeds & Statements</h2>
          <p>
            Mutual Fund Net Asset Values (NAVs) are fetched directly from the official AMFI database API. Stock market quotations are obtained via live market scrapers.
          </p>
          <p>
            While YS CAPITAL exercises due care to ensure high precision, we shall not be held liable for temporary server downtime, upstream AMFI API delays, or inaccuracies resulting from corrupt or altered third-party statement uploads.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">7. Intellectual Property</h2>
          <p>
            All brand assets, software architecture, UI design, analytics algorithms, and proprietary parsing engines comprising YS Digital Portfolio are the exclusive intellectual property of YS CAPITAL. Unauthorized copying, reverse engineering, scraping, or commercial sub-licensing is strictly prohibited under Indian and international copyright laws.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by Indian law, YS CAPITAL, its directors, employees, and authorized affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from investment decisions made by the client, market losses, or third-party banking failures.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">9. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms shall be governed by, construed, and enforced in accordance with the laws of India. Any legal dispute, controversy, or claim arising out of or relating to these terms shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Mumbai, Maharashtra, India</strong>.
          </p>
        </section>

      </div>
    </LegalPageLayout>
  );
}
