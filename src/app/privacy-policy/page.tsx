"use client";

import React from "react";
import LegalPageLayout from "@/components/layout/LegalPageLayout";
import { ShieldCheck, Lock, Database, EyeOff, Server, FileCheck, AlertCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      badge="Data Protection & Privacy"
      badgeIcon={ShieldCheck}
      title="Privacy Policy"
      subtitle="How YS CAPITAL safeguards your financial records, portfolio holdings, and personal information across our digital wealth intelligence suite."
      lastUpdated="September 2026"
      activePath="/privacy-policy"
    >
      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        
        {/* Intro */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3 text-blue-950">
          <Lock className="h-5 w-5 text-[#0047AB] mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-1">
            <span className="font-bold block text-sm text-[#0047AB]">Our Core Privacy Promise</span>
            YS CAPITAL operates on a <strong>strictly host-isolated architecture</strong>. Your uploaded CAS statements, stock quantities, buy prices, cash ledgers, and transaction history are stored securely and are never sold, rented, or shared with commercial advertising networks.
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">1. Introduction & Regulatory Scope</h2>
          <p>
            Welcome to <strong>YS CAPITAL</strong> (operating through ARN 145084, AMFI Registered Mutual Fund Distributor and APMI Registered PMS Distributor). This Privacy Policy explains our practices regarding the collection, storage, processing, and protection of financial records and personal data when you access <strong>YS Digital Portfolio</strong>.
          </p>
          <p>
            We adhere strictly to the <em>Information Technology Act, 2000</em>, the <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</em>, and guidelines set forth by the Securities and Exchange Board of India (SEBI) and the Association of Mutual Funds in India (AMFI).
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">2. Information We Collect</h2>
          <p>To provide unified multi-asset portfolio analytics, we collect and process the following categories of information:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>
              <strong>Account & Identification Data:</strong> Your name, registered email address, contact number, and authorized client login identifier.
            </li>
            <li>
              <strong>Portfolio & Statement Records:</strong> Data derived from Consolidated Account Statements (CAS PDFs issued by CAMS or KFintech) or broker spreadsheets (holding quantity, average purchase price, purchase date, scheme name, folio number, ISIN).
            </li>
            <li>
              <strong>Cash Book & Ledger Entries:</strong> Manually recorded banking inflows, outflows, loans, interest schedules, and asset notes.
            </li>
            <li>
              <strong>Technical & Session Data:</strong> Browser user-agent, session cookies, and login timestamps used strictly for security monitoring and session validation.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">3. Purpose of Processing & Use of Data</h2>
          <p>Your financial information is utilized solely for legitimate investment intelligence operations:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">Portfolio Consolidation</span>
              <p className="text-[11px] text-slate-500">Aggregating Mutual Funds, equities, bonds, and cash ledgers across multiple brokers into a single unified view.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">Performance & XIRR Tracking</span>
              <p className="text-[11px] text-slate-500">Computing extended internal rate of return (XIRR), unrealized gains, capital appreciation, and CAGR metrics.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">Real-Time NAV Synchronization</span>
              <p className="text-[11px] text-slate-500">Querying official daily NAV feeds published by AMFI India and live Indian equity scrapers for daily valuations.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-bold text-xs text-slate-900 block">AI Rebalancing Insights</span>
              <p className="text-[11px] text-slate-500">Assisting family offices and investors in monitoring asset weight drift against designated risk profiles.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">4. Zero Third-Party Monetization Policy</h2>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <div className="font-bold flex items-center gap-2 text-xs text-emerald-800">
              <EyeOff className="h-4 w-4" />
              Strict No-Sale Commitment
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              YS CAPITAL does not sell, trade, license, or lease your personal financial records or portfolio balances to third-party telemarketers, credit card issuers, loan aggregators, or external advertisers under any circumstances.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">5. Data Security & Storage Standards</h2>
          <p>
            We implement institutional-grade physical and electronic safeguards to ensure maximum data privacy:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>256-Bit SSL/TLS Encryption:</strong> All data transmitted between your browser and YS Portfolio servers is encrypted end-to-end.</li>
            <li><strong>Host-Isolated Data Storage:</strong> Portfolio records are maintained on secured, isolated database partitions with strict password verification gates.</li>
            <li><strong>Salted Cryptographic Hashing:</strong> Master security passwords are never stored in plain text.</li>
            <li><strong>Automated Backup Redundancy:</strong> Secure point-in-time backups to prevent accidental data loss.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">6. Your Rights & Data Ownership</h2>
          <p>You retain 100% ownership over your financial records. At any time, authorized users may:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li><strong>Inspect & Audit:</strong> Review all imported folios, transactions, and cash ledgers in the dashboard.</li>
            <li><strong>Export:</strong> Download your consolidated reports in Excel and PDF formats for accounting or tax filing.</li>
            <li><strong>Correct & Modify:</strong> Edit buy prices, notes, and quantities directly via the interface.</li>
            <li><strong>Purge & Delete:</strong> Request permanent removal of specific portfolios or complete account wipe by contacting our support desk.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">7. Cookies & Session Management</h2>
          <p>
            YS Portfolio utilizes essential HTTP cookies strictly to verify master session keys and remember user preferences (such as light/dark UI themes and chart intervals). We do not employ third-party advertising tracking cookies or behavioral tracking beacons.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-serif text-[#0a2540]">8. Grievance Officer & Contact Information</h2>
          <p>
            In accordance with the Information Technology Act, 2000 and rules made thereunder, any queries or grievances regarding data processing may be addressed to our designated Compliance and Grievance Officer:
          </p>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs text-slate-700">
            <p><strong>Grievance Officer:</strong> Client Services & Compliance Desk</p>
            <p><strong>Entity:</strong> Y S CAPITAL (ARN 145084)</p>
            <p><strong>Address:</strong> Sewree, Mumbai, Maharashtra 400015, India</p>
            <p><strong>Email:</strong> <a href="mailto:clientservices@yscapital.com" className="text-[#0047AB] underline">clientservices@yscapital.com</a></p>
            <p><strong>Phone:</strong> +91 22 4152 3000</p>
            <p><strong>Response Turnaround:</strong> Within 48 business hours</p>
          </div>
        </section>

      </div>
    </LegalPageLayout>
  );
}
