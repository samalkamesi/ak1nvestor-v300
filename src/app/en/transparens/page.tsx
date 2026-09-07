import type { Metadata } from "next";
import Link from "next/link";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { spegelMetadata } from "@/lib/spegel-metadata";
import { ORG_NR } from "@/lib/variabler";

export const dynamic = "force-static";

/**
 * /en/transparens — full mirror of the Swedish /transparens flow page
 * (wave 51, agent S3). Every text translated to English. Swedish statute
 * titles are cited in their original wording (laws are cited in the
 * original) with a short English explanation; GDPR article numbers keep
 * their standard notation. Swedish page untouched.
 */

export const metadata: Metadata = spegelMetadata({
  lang: "en",
  sida: "transparens",
  title: "Transparency — your data and your rights, as the law requires | AK1A",
  description:
    "AK1A's complete account of the personal data processing under Article 13 of the data protection regulation (GDPR): which data we collect, why we use it for analysis, the legal basis, retention periods, your eight rights and how to complain to the IMY.",
  keywords: [
    "transparency",
    "GDPR",
    "personal data",
    "data protection",
    "article 13",
    "your rights",
    "IMY",
    "cookies",
    "right of withdrawal",
    "AK1A Research Lab",
  ],
});

type Rad = {
  vad: string;
  varfor: string;
  grund: string;
  lagring: string;
  ratt: string;
};

const REGISTER: Rad[] = [
  {
    vad: "Account details (name, email, password hash)",
    varfor:
      "Create and administer your account, authenticate you, deliver what you have purchased and communicate about your education.",
    grund:
      "Contract — art. 6.1 b (necessary to fulfil our contract with you)",
    lagring:
      "For as long as the account is active + 12 months (the right to complain/invoice), then deleted.",
    ratt:
      "Access, rectification, erasure, data portability, restriction.",
  },
  {
    vad: "Course progress, quiz answers and XP",
    varfor:
      "Show your progression, unlock the next step, calculate certificate grades (A–D) and give you relevant follow-up questions.",
    grund: "Contract — art. 6.1 b (delivery of the education service)",
    lagring: "For as long as the account is active; deleted together with the account.",
    ratt: "Access, rectification, erasure, data portability.",
  },
  {
    vad: "Behaviour traces (which pages and courses you visit, in which order)",
    varfor:
      "Analyse how our pedagogy is used, improve course order and discover where the student gets stuck. This is the core of 'using information to analyse' — the analysis concerns the platform's pedagogy, not your private life.",
    grund:
      "Legitimate interest — art. 6.1 f (product development and quality assurance of the education)",
    lagring: "Rolling 90 days, thereafter only anonymised statistics.",
    ratt:
      "Objection (art. 21) — we then stop processing your data.",
  },
  {
    vad: "Cognitive profile (answers in the AI Diagnosis: risk appetite, bias tendencies)",
    varfor:
      "Adapt examples and warnings in the education to your profile (e.g. extra attention to confirmation bias).",
    grund:
      "Consent — art. 6.1 a (you answer voluntarily; you can skip the diagnosis entirely)",
    lagring:
      "Until you withdraw consent or delete the profile — the feature is always voluntary.",
    ratt:
      "Withdraw consent at any time + erasure + objection to profiling.",
  },
  {
    vad: "Questions you ask the AI Mentor",
    varfor:
      "Answer your questions, remember the conversation context during the session and improve the mentor's answer quality in aggregated form.",
    grund: "Legitimate interest — art. 6.1 f (support and feature improvement)",
    lagring:
      "The conversation memory is stored locally in your browser (not on our servers) and can be deleted by you with one click in the chat.",
    ratt: "Erasure (you control the memory yourself) + objection.",
  },
  {
    vad: "Chosen news channels and watchlists",
    varfor:
      "Fetch and filter news feeds you have chosen yourself, and prioritise topics in your profile.",
    grund: "Consent — art. 6.1 a (settings you actively chose)",
    lagring: "Until you change the settings or the account is deleted.",
    ratt: "Withdraw consent, change, erase.",
  },
  {
    vad: "Cookies (cookies and local storage)",
    varfor:
      "Necessary: login and security. Functionality: your choices (theme, channels). Analytics: anonymous usage statistics.",
    grund:
      "The Swedish Electronic Communications Act (lagen (2022:482) om elektronisk kommunikation) — necessary cookies require no consent; the others require your active choice in the cookie wall.",
    lagring: "According to the cookie list in the cookie wall (max 12 months).",
    ratt:
      "Change your choice at any time via 'Cookie settings' in the footer — as easy as making it.",
  },
  {
    vad: "Traffic statistics (anonymous visitor measurement — no cookie, no personal data)",
    varfor:
      "Count visitors, most-read pages and sources so the education can prioritise what is actually used. Page + device class + source + language + a randomised, hashed session code — never IP, never query strings, never content. If you have chosen 'necessary only', only page path + device class are measured.",
    grund:
      "Legitimate interest — art. 6.1 f (anonymous web statistics without personal data; who you are cannot be deduced)",
    lagring:
      "Rolling 35 days, then deleted by the retention organ (hard deletion cap).",
    ratt:
      "Objection (art. 21) — choose 'necessary only' in the cookie wall and nothing about you is measured beyond the fully anonymous.",
  },
  {
    vad: "Security log (blocked attacks with hashed IP)",
    varfor:
      "The traffic guard stops scanners and floods (e.g. searches for .env or wp-admin) and logs the event to protect the service. The IP address is hashed with salt before storage — the raw address never leaves memory, and the hash cannot be traced back to a person.",
    grund:
      "Legitimate interest — art. 6.1 f (IT security and prevention of unauthorised access)",
    lagring:
      "Rolling 35 days or until the row cap (3,000) is reached — then deletion.",
    ratt:
      "Objection (art. 21) and the right to information — the log contains no personal data, only technical fingerprints.",
  },
];

export default function TransparensPageEn() {
  const lank = (href: string, text: string) => (
    <Link href={href} className="underline hover:text-foreground">
      {text}
    </Link>
  );

  return (
    <SeoPageShell breadcrumb={[{ name: "Transparency" }]}>
      <h1 className="font-serif text-4xl font-bold">
        Transparency — told the way the law requires
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Established 2026-09-01 · lab.ak1nvestor.com · AK1A Research Lab
      </p>

      <p className="mt-6 leading-relaxed text-muted-foreground">
        This page exists because Article 13 of the data protection regulation
        (GDPR) gives you the right to know exactly what we do with your
        personal data — not because we chose the most convenient way of
        telling you. We therefore account for the entire register: what we
        collect, why, on what legal basis, how long we keep it and which
        rights you have. Deeper legal details are found in{" "}
        {lank("/privacy-policy", "the privacy policy")} and{" "}
        {lank("/villkor", "the terms of use")}.
      </p>

      {/* ── 1. Who is responsible ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          1. Who is responsible for your data
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          The data controller is AK1A Research Lab
          {ORG_NR ? `, organisation number ${ORG_NR}` : ""}, contact
          info@ak1nvestor.com (art. 13.1 a). We
          currently have no formal data protection officer — it is not
          mandatory for the size of our operation — and handle privacy
          matters directly via the contact above. Our most important data
          processors (suppliers who process data on our behalf, art. 28) are
          our European database provider and our web hosting provider. They
          may only process data according to our instructions and have data
          processing agreements with us.
        </p>
      </section>

      {/* ── 2. The data register ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          2. The entire data register — what, why, basis, retention, right
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Art. 13.1 requires us to state the purpose and legal basis for every
          category of personal data when it is collected. This is the
          register, in its entirety:
        </p>
        <div className="mt-4 space-y-4">
          {REGISTER.map((r, i) => (
            <div key={i} className="rounded-lg border border-gold/30 bg-card p-4">
              <h3 className="font-serif text-lg font-bold text-foreground">
                {r.vad}
              </h3>
              <dl className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-foreground">
                    Why:
                  </dt>
                  <dd>{r.varfor}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-foreground">
                    Legal basis:
                  </dt>
                  <dd>{r.grund}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-foreground">
                    Retention period:
                  </dt>
                  <dd>{r.lagring}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-foreground">
                    Your right:
                  </dt>
                  <dd>{r.ratt}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. The analysis purpose ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          3. How we use information to analyse — and where the line goes
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          We say it plainly: we analyse how the service is used. Your quiz and
          course data make your education better (the right difficulty, the
          right next step, the right certificate grade). The behaviour trace
          shows where our pedagogy falls short — for example if many get
          stuck on the same chapter. The cognitive profile makes the warnings
          in the texts relevant to your own tendencies. This is called
          purpose limitation (art. 5.1 b): data collected for one purpose may
          not be used for an incompatible one.
        </p>
        <div className="mt-4 rounded-lg border border-gold/30 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">The line, according to the law:</strong>{" "}
          we never sell your personal data, we do not share it with
          advertisers, and we do not use it to profile you against third
          parties. The analysis concerns the education — not your private
          life. Personal data is only disclosed if it follows from the law
          (e.g. the accounting and tax legislation's requirements on
          transaction data) or if you have explicitly requested it (art. 6.1
          c–e).
        </div>
      </section>

      {/* ── 4. Your rights ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          4. Your eight rights — and how to use them
        </h2>
        <ul className="mt-3 space-y-2 leading-relaxed text-muted-foreground">
          {[
            ["Access (art. 15)", " get a copy of everything we store about you."],
            ["Rectification (art. 16)", " correct incorrect data."],
            ["Erasure (art. 17)", " 'forget me' — delete everything, if no law obliges us to keep it (e.g. accounting records)."],
            ["Restriction (art. 18)", " pause processing while a matter is investigated."],
            ["Portability (art. 20)", " receive your data in a machine-readable format."],
            ["Objection (art. 21)", " say no to processing based on legitimate interest — applies to the trace."],
            ["Withdraw consent (art. 7.3)", " at any time, as easily as you gave it."],
            ["Complaint (art. 77)", " to the Swedish Authority for Privacy Protection (IMY — Integritetsskyddsmyndigheten), Box 8114, 104 20 Stockholm — you do not need to go through us."],
          ].map(([rubrik, text], i) => (
            <li key={i} className="flex gap-2">
              <span className="text-gold" aria-hidden="true">
                ·
              </span>
              <span>
                <strong className="text-foreground">{rubrik}</strong>
                {text}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Exercise the rights by emailing info@ak1nvestor.com. We respond
          without undue delay and at the latest within one month (art. 12.3)
          — if we extend (e.g. for extensive extracts) we notify you within
          the month and explain why. It costs nothing (art. 12.5).
        </p>
      </section>

      {/* ── 5. Cookies ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          5. Cookies under the Electronic Communications Act (lagen (2022:482))
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          When you first visit us, you meet a cookie wall with three
          categories: necessary (login and security — requires no choice),
          functionality (your preferences) and analytics (anonymous
          statistics). The cookie wall stores your choice for 12 months and
          you can change it at any time via &quot;Cookie settings&quot; in the
          footer — the law requires that withdrawing consent be as easy as
          giving it. See the complete cookie list with names and validity
          periods in{" "}
          {lank("/cookiepolicy", "the cookie policy")}.
        </p>
      </section>

      {/* ── 6. Right of withdrawal ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          6. Right of withdrawal on purchases — 14 days, with one exception
          you must know about
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          If you buy Phase 2 or Phase 3, the Swedish Distance Contracts Act
          (lagen (2005:59) om distansavtal och avtal utanför affärslokaler)
          applies: a 14-day right of withdrawal from the conclusion of the
          agreement. But for digital content delivered immediately, the
          right of withdrawal ends when delivery has begun — provided you
          have first expressly consented to immediate access and accepted
          that the right of withdrawal thereby ends (Chapter 2, Section 11,
          first paragraph, point 11). That is why there is a special
          checkbox before payment and an order confirmation by email. Phase
          1 costs nothing — there is nothing to withdraw there.{" "}
          {lank("/villkor", "Read the entire withdrawal section in the terms.")}
        </p>
      </section>

      {/* ── 7. Education, not advice ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          7. Education — not securities advice
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          AK1A is an education service. We never give personal investment
          advice or recommendations to buy or sell — such activity requires a
          licence under the Swedish Securities Market Act (lagen (2007:528)
          om värdepappersmarknaden), and we do not conduct it. All content,
          including the AI Mentor's answers, is general teaching not adapted
          to your financial situation. That protects you (you make your own
          decisions with full information) and it is exactly what the law
          requires of us.{" "}
          {lank("/finansiell-policy", "Read the financial policy.")}
        </p>
      </section>

      {/* ── 8. Automated decisions ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          8. Profiling and automated decisions
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          The cognitive profile and the XP system are profiling within the
          meaning of the GDPR (art. 4.4) — but no part of the service makes
          automated decisions with legal effect or otherwise affecting you
          similarly (art. 22). Certificate grades are calculated mechanically
          from your quiz results, but you can always request human review by
          contacting us.
        </p>
      </section>

      {/* ── 9. Sources of the law ── */}
      <section className="mt-8">
        <h2 className="font-serif text-2xl font-bold">
          9. The laws behind this page
        </h2>
        <ul className="mt-3 space-y-2 leading-relaxed text-muted-foreground">
          {[
            "Dataskyddsförordningen (EU) 2016/679 — the data protection regulation (GDPR), in particular articles 5, 6, 7, 12–22 (transparency, information duties, rights).",
            "Lagen (2022:482) om elektronisk kommunikation — the Swedish Electronic Communications Act: cookies and consent (Ch. 6).",
            "Lagen (2005:59) om distansavtal och avtal utanför affärslokaler — the Swedish Distance Contracts Act: information before purchase and the 14-day right of withdrawal (Ch. 2, Sections 10–11).",
            "Lagen (2022:261) om avtal om digitalt innehåll och digitala tjänster — the Swedish Digital Content Act: the consumer's rights on digital delivery.",
            "Lagen (2007:528) om värdepappersmarknaden — the Swedish Securities Market Act: the boundary between education and licensable advice.",
            "Lagen (1960:729) om upphovsrätt till litterära och konstnärliga verk — the Swedish Copyright Act: our courses build on our own adaptations with source references (see /upphovsratt).",
          ].map((t, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-gold" aria-hidden="true">
                ·
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 rounded-lg border border-gold/30 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">If we change.</strong> If our
        data processing changes fundamentally, we update this page and notify
        you in the platform — under art. 13.3 you are entitled to know when
        the purpose changes, not just read it in the fine print. Questions?
        info@ak1nvestor.com.
      </div>
    </SeoPageShell>
  );
}
