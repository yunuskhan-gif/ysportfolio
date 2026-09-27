import React from "react";

export default function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yscapital.in";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${baseUrl}/#organization`,
    name: "YS CAPITAL",
    alternateName: ["YS Digital Portfolio", "Y S Capital Wealth Management", "YS Wealth"],
    legalName: "Y S CAPITAL",
    url: baseUrl,
    logo: `${baseUrl}/ys_logo.png`,
    image: `${baseUrl}/showcase_dashboard.png`,
    description:
      "India's leading integrated distributor of financial products — Mutual Funds, Direct Equities, Fixed Deposits, Insurance, Bonds, PMS, AIFs, and Digital Wealth Management.",
    telephone: "+91-22-4152-3000",
    email: "clientservices@yscapital.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sewree",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      postalCode: "400015",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "19.0003",
      longitude: "72.8553",
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    priceRange: "₹₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Bank Transfer, Cheque, UPI",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    knowsAbout: [
      "AMFI Registered Mutual Fund Distributor ARN 145084",
      "APMI Registered PMS Distributor",
      "Mutual Funds",
      "Direct Equity Tracking",
      "Consolidated Account Statement (CAS) Parsing",
      "Wealth Advisory",
      "Systematic Investment Plan (SIP)",
      "FII and DII Market Flows",
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}/#software`,
    name: "YS Digital Portfolio",
    operatingSystem: "Web Browser, iOS, Android, Windows, macOS",
    applicationCategory: "FinanceApplication",
    url: baseUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "520",
      bestRating: "5",
      worstRating: "1",
    },
    description:
      "Institutional wealth intelligence suite consolidating Mutual Funds, Direct Equities, Fixed Deposits, Bonds, and Cash Book Ledgers into one real-time executive dashboard.",
    featureList: [
      "Automated CAS & Excel statement parsing",
      "Daily AMFI Mutual Fund NAV synchronization",
      "Live Indian market stock prices and valuation",
      "Institutional FII & DII flow tracker",
      "AI Portfolio Rebalancing and asset allocation insights",
      "Private host-isolated double-entry Cash Book",
      "Interactive SIP, Lumpsum, and Wealth Goal calculators",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${baseUrl}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "What is YS Digital Portfolio and who is it designed for?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "YS Digital Portfolio is an institutional wealth intelligence suite built by Y S CAPITAL (ARN 145084). It is designed for high-net-worth individuals (HNIs), active retail investors, and family offices who want to consolidate multi-broker equities, all Mutual Fund schemes across AMCs, bonds, and cash ledgers into one executive real-time command center.",
        },
      },
      {
        "@type": "Question",
        name: "How does automated CAS & Excel statement parsing work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can import your Consolidated Account Statement (CAS PDF issued by CAMS or KFintech) or broker spreadsheet (.xlsx) with a single click. The backend engine automatically extracts scheme names, folio IDs, ISIN codes, transaction dates, quantity, and purchase prices without manual data entry.",
        },
      },
      {
        "@type": "Question",
        name: "Is my personal financial data secure and private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, 100%. YS Portfolio operates on a strictly host-isolated architecture with 256-bit SSL encryption. Your investment values, trade history, and ledgers remain solely on your authenticated private database. We have a strict zero-monetization policy—your data is never sold, leased, or shared with third-party advertisers.",
        },
      },
      {
        "@type": "Question",
        name: "How are Mutual Fund NAVs and stock prices updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mutual fund NAVs are refreshed daily through direct integration with the official AMFI database API. Direct equity prices and market indices are fetched via real-time market scrapers with live intraday tracking.",
        },
      },
      {
        "@type": "Question",
        name: "How does YS Portfolio calculate XIRR, CAGR, and capital gains?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The platform features institutional-grade financial computation engines that calculate Extended Internal Rate of Return (XIRR) based on exact cash-flow transaction dates (SIPs, lumpsum purchases, switches, and redemptions). It automatically splits long-term (LTCG) and short-term (STCG) capital gains to simplify tax planning.",
        },
      },
      {
        "@type": "Question",
        name: "Can I manage multiple family members' folios under one dashboard?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! YS Portfolio includes Multi-Entity & Family Office management. You can create separate client profiles for family members, track individual folios and demat accounts, or view consolidated household net worth with one click.",
        },
      },
      {
        "@type": "Question",
        name: "What are the distributor commissions or platform charges?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "As an AMFI-registered Mutual Fund Distributor (ARN 145084), YS CAPITAL receives trail commissions directly from Asset Management Companies (AMCs) out of the scheme's Total Expense Ratio (TER). Investors pay zero direct out-of-pocket transaction fees for regular mutual fund investments. Full scheme-wise commission disclosures are available upon request.",
        },
      },
      {
        "@type": "Question",
        name: "What is your Refund & Cancellation Policy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mutual fund investments are routed directly to AMCs; units can be redeemed anytime into your registered bank account at prevailing NAV without distributor penalties. For premium software reporting packages or retainers, we offer a 14-day money-back satisfaction guarantee and prorated refunds for unused billing periods.",
        },
      },
      {
        "@type": "Question",
        name: "Does YS CAPITAL hold my investment funds in its own bank account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Never. As an AMFI-registered distributor, all purchase and redemption monies are routed directly between your verified bank account and SEBI-recognized clearing corporations (BSE STAR MF, NSE NMF II, ICCL) or respective AMCs. YS CAPITAL never accepts or pools client investment funds into its own corporate accounts.",
        },
      },
      {
        "@type": "Question",
        name: "How does the AI Portfolio Rebalancing feature work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The AI Insights engine evaluates your current asset weights across equities, debt, gold, and cash against recommended risk benchmarks. If a sector or asset class deviates beyond your target risk tolerance, the engine flags rebalancing suggestions to safeguard capital and optimize returns.",
        },
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "YS CAPITAL | Institutional Wealth Intelligence",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    inLanguage: "en-IN",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
