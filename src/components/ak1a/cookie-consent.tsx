"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSprak } from "./sprak-leverantor";
import type { SprakId } from "@/lib/sprak";

/**
 * Cookie-samtycke enligt lag (2022:482) om elektronisk kommunikation,
 * 6 kap. 19–20 §§: samtycke INNAN icke-nödvändiga cookies/localStorage.
 * Valet sparas i localStorage "ak1a-cookie-samtycke" och kan ändras
 * via ?cookies=1 (länkat från footern och cookiepolicyn).
 *
 * SALJ-U7-S4 (2026-09-29): texterna är sv/en/ar via useSprak() — på
 * speglarna (/en, /ar) vinner spegelns språk, precis som footern. Bannern
 * renderar null tills den monterats (synlig först i useEffect), så
 * SSR-passet och hydreringen berörs inte av språkvalet. Kryssrutorna i
 * Inställningar är OBOCKADE som förval: aktivt val per kategori krävs
 * för giltigt samtycke (aktivt-val-principen; förbockat = ogiltigt).
 */

const NYCKEL = "ak1a-cookie-samtycke";

type TextId =
  | "aria"
  | "rubrik"
  | "broddIntro"
  | "lankPolicy"
  | "och"
  | "lankIntegritet"
  | "rest"
  | "lankTransparens"
  | "katNodRubrik"
  | "katNodText"
  | "katAnalysRubrik"
  | "katAnalysText"
  | "katPrefRubrik"
  | "katPrefText"
  | "godkann"
  | "sparaVal"
  | "installningar"
  | "avvisa";

// Lokal ordbok i ordlistans {sv,en,ar}-form — bannerns texter ägs här,
// inte i den delade ordlistan (S4-ägandeskap; termer följer footerns).
const TEXTER: Record<TextId, Record<SprakId, string>> = {
  aria: {
    sv: "Cookie-inställningar",
    en: "Cookie settings",
    ar: "إعدادات الكوكيز",
  },
  rubrik: {
    sv: "Vi använder cookies — du bestämmer",
    en: "We use cookies — you decide",
    ar: "نستخدم الكوكيز — والقرار لك",
  },
  broddIntro: {
    sv: "Nödvändiga gör att tjänsten fungerar (inloggning, kursprogress). Analys hjälper Förståelse-Först-assistenten anpassa din utbildning. Läs mer i ",
    en: "Necessary cookies make the service work (login, course progress). Analytics helps the Understanding-First assistant adapt your education. Read more in ",
    ar: "الكوكيز الضرورية تجعل الخدمة تعمل (تسجيل الدخول، تقدّم الدورة). يساعد التحليل مساعد «الفهم أولًا» على تكييف تعلّمك. اقرأ المزيد في ",
  },
  lankPolicy: {
    sv: "cookiepolicyn",
    en: "the cookie policy",
    ar: "سياسة الكوكيز",
  },
  och: { sv: " och ", en: " and ", ar: " و" },
  lankIntegritet: {
    sv: "integritetspolicyn",
    en: "the privacy policy",
    ar: "سياسة الخصوصية",
  },
  rest: {
    sv: ". Hela dataregistret — vad, varför, rättslig grund och dina rättigheter, enligt GDPR artikel 13 — finns på ",
    en: ". The full data register — what, why, legal basis and your rights under GDPR Article 13 — is on ",
    ar: ". السجل الكامل للبيانات — ماذا، ولماذا، والأساس القانوني وحقوقك وفق اللائحة العامة لحماية البيانات (GDPR) المادة 13 — متاح في ",
  },
  lankTransparens: {
    sv: "Transparens & GDPR",
    en: "Transparency & GDPR",
    ar: "الشفافية وGDPR",
  },
  katNodRubrik: { sv: "Nödvändiga", en: "Necessary", ar: "ضرورية" },
  katNodText: {
    sv: "Inloggning, säkerhet, kursprogress. Alltid aktiva.",
    en: "Login, security, course progress. Always active.",
    ar: "تسجيل الدخول، الأمان، تقدّم الدورة. نشطة دائمًا.",
  },
  katAnalysRubrik: {
    sv: "Analys & anpassning",
    en: "Analytics & adaptation",
    ar: "التحليل والتخصيص",
  },
  katAnalysText: {
    sv: "Beteendetracer (scroll, tid, intresseprofil) — endast för din utbildning.",
    en: "Behavioural tracer (scroll, time, interest profile) — for your education only.",
    ar: "تتبّع السلوك (التمرير، الوقت، ملف الاهتمامات) — من أجل تعلّمك فقط.",
  },
  katPrefRubrik: { sv: "Preferenser", en: "Preferences", ar: "التفضيلات" },
  katPrefText: {
    sv: "UI-val och senast besökta sidor.",
    en: "UI choices and recently visited pages.",
    ar: "خيارات الواجهة وآخر الصفحات التي زرتها.",
  },
  godkann: { sv: "Godkänn alla", en: "Accept all", ar: "قبول الكل" },
  sparaVal: { sv: "Spara mitt val", en: "Save my choice", ar: "حفظ اختياري" },
  installningar: { sv: "Inställningar", en: "Settings", ar: "الإعدادات" },
  avvisa: { sv: "Endast nödvändiga", en: "Necessary only", ar: "الضرورية فقط" },
};

export type CookieSamtycke = {
  version: 1;
  nodvandiga: true;
  analys: boolean;
  preferenser: boolean;
  datum: string;
};

export function lasCookieSamtycke(): CookieSamtycke | null {
  if (typeof window === "undefined") return null;
  try {
    const rå = window.localStorage.getItem(NYCKEL);
    return rå ? (JSON.parse(rå) as CookieSamtycke) : null;
  } catch {
    return null;
  }
}

/** För framtida gating av tracern: har användaren samtyckt till analys? */
export function harCookieSamtycke(kategori: "analys" | "preferenser"): boolean {
  const s = lasCookieSamtycke();
  if (!s) return false;
  return kategori === "analys" ? s.analys : s.preferenser;
}

function spara(analys: boolean, preferenser: boolean) {
  const val: CookieSamtycke = {
    version: 1,
    nodvandiga: true,
    analys,
    preferenser,
    datum: new Date().toISOString(),
  };
  window.localStorage.setItem(NYCKEL, JSON.stringify(val));
}

export function CookieConsent() {
  const [synlig, setSynlig] = useState(false);
  const [oppnaInstallningar, setOppnaInstallningar] = useState(false);
  // Förval false (S4): samtycke kräver aktiv handling — förbockade rutor
  // ger inget giltigt samtycke (aktivt-val-principen). "Godkänn alla"
  // förblir det snabba aktivvalet.
  const [analys, setAnalys] = useState(false);
  const [preferenser, setPreferenser] = useState(false);
  const { sprak } = useSprak();
  const t = (id: TextId): string => TEXTER[id][sprak];

  useEffect(() => {
    // hydrate-safe: rendera först efter mount; visa om inget val sparat
    // eller om ?cookies=1 efterfrågar ändring
    const param = new URLSearchParams(window.location.search).get("cookies");
    if (!lasCookieSamtycke() || param === "1") setSynlig(true);
  }, []);

  if (!synlig) return null;

  const valdOchStang = (a: boolean, p: boolean) => {
    spara(a, p);
    setSynlig(false);
    setOppnaInstallningar(false);
    // rensa ?cookies=1 ur URL:n utan omladdning
    if (window.location.search.includes("cookies=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  return (
    <div
      role="dialog"
      aria-label={t("aria")}
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2"
    >
      <div className="marin-panel mx-auto max-w-3xl rounded-2xl border border-gold/40 p-4 shadow-2xl sm:p-5">
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-xl">🍪</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-base font-bold text-[#E8C766]">
              {t("rubrik")}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#EDE6D6]/85">
              {t("broddIntro")}
              <Link href="/cookiepolicy" prefetch={false} className="underline hover:text-[#E8C766]">
                {t("lankPolicy")}
              </Link>
              {t("och")}
              <Link href="/privacy-policy" prefetch={false} className="underline hover:text-[#E8C766]">
                {t("lankIntegritet")}
              </Link>
              {t("rest")}
              <Link href="/transparens" prefetch={false} className="underline hover:text-[#E8C766]">
                {t("lankTransparens")}
              </Link>
              .
            </p>

            {oppnaInstallningar && (
              <div className="mt-3 space-y-2 rounded-xl border border-gold/25 bg-[#0B1626]/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <label htmlFor="ck-nod" className="text-xs text-[#EDE6D6]">
                    <strong className="block">{t("katNodRubrik")}</strong>
                    {t("katNodText")}
                  </label>
                  <input id="ck-nod" type="checkbox" checked disabled className="mt-1 accent-[#785c13]" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <label htmlFor="ck-analys" className="text-xs text-[#EDE6D6]">
                    <strong className="block">{t("katAnalysRubrik")}</strong>
                    {t("katAnalysText")}
                  </label>
                  <input
                    id="ck-analys"
                    type="checkbox"
                    checked={analys}
                    onChange={(e) => setAnalys(e.target.checked)}
                    className="mt-1 accent-[#785c13]"
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <label htmlFor="ck-pref" className="text-xs text-[#EDE6D6]">
                    <strong className="block">{t("katPrefRubrik")}</strong>
                    {t("katPrefText")}
                  </label>
                  <input
                    id="ck-pref"
                    type="checkbox"
                    checked={preferenser}
                    onChange={(e) => setPreferenser(e.target.checked)}
                    className="mt-1 accent-[#785c13]"
                  />
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={() => valdOchStang(true, true)}
                className="btn-marin px-3 py-2 text-xs max-md:min-h-[52px]!"
              >
                {t("godkann")}
              </button>
              {oppnaInstallningar ? (
                <button
                  onClick={() => valdOchStang(analys, preferenser)}
                  className="rounded-lg border border-gold/50 px-3 py-2 text-xs font-semibold text-[#E8C766] hover:bg-gold/10 max-md:min-h-[52px]!"
                >
                  {t("sparaVal")}
                </button>
              ) : (
                <button
                  onClick={() => setOppnaInstallningar(true)}
                  className="rounded-lg border border-gold/50 px-3 py-2 text-xs font-semibold text-[#E8C766] hover:bg-gold/10 max-md:min-h-[52px]!"
                >
                  {t("installningar")}
                </button>
              )}
              <button
                onClick={() => valdOchStang(false, false)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#EDE6D6]/75 underline hover:text-[#EDE6D6] max-md:min-h-[52px]!"
              >
                {t("avvisa")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
