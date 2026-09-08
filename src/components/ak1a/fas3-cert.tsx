"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lasKlaraKurser, lasMedlem, lasXP, niva } from "@/lib/member-local";
import { arKomplett, lasSparade, type SuperanalysData } from "@/lib/superanalys";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * FAS 3-CERT — elevens progress mot praktikexamen (certifierad AK1A-analytiker).
 *
 * Läser LOKALT (SSR-säkert i useEffect — samma mönster som fas2-ansok):
 * nivå/XP/klara kurser via member-local samt sparade superanalyser via
 * lasSparade — elevens superanalyser är praktikportföljens råvara och
 * spåras automatiskt när de sparas i verktyget.
 *
 * Fyra steg: Grund (nivå 25) → Praktik (10 kompletta analyser) →
 * Etik (3 löften) → Certifiering. Ton enligt pedagogik.ts:
 * vi hjälper — vi dömer ALDRIG. Formuleringar av typ
 * "nästa stapel på din resa", aldrig "du missade" / "du ligger efter".
 */

const NIVA_KRAV = 25;
const ANALYSER_KRAV = 10;
const ETIK_LOFTEN = 3;

/** Talformat per språk (XP-gruppering) — sv-SE oförändrat på originalet. */
function xpLocale(sprak: string): string {
  if (sprak === "en") return "en-US";
  if (sprak === "ar") return "ar-EG";
  return "sv-SE";
}

/** Guld-progressring (SVG-mätare) — marin bakgrund, guldstråk. */
function Ring({
  procent,
  storlek = 76,
  centrum,
  sub,
}: {
  procent: number;
  storlek?: number;
  centrum: string;
  sub?: string;
}) {
  const { t } = useSprak();
  const p = Math.max(0, Math.min(1, procent));
  const r = (storlek - 12) / 2;
  const omkrets = 2 * Math.PI * r;
  const offset = omkrets * (1 - p);
  return (
    <div className="relative shrink-0" style={{ width: storlek, height: storlek }}>
      <svg
        width={storlek}
        height={storlek}
        viewBox={`0 0 ${storlek} ${storlek}`}
        role="img"
        aria-label={t("fas3cert.ringAria", { procent: Math.round(p * 100) })}
      >
        <circle
          cx={storlek / 2}
          cy={storlek / 2}
          r={r}
          fill="none"
          stroke="#E8C766"
          strokeOpacity="0.18"
          strokeWidth="7"
        />
        <circle
          cx={storlek / 2}
          cy={storlek / 2}
          r={r}
          fill="none"
          stroke="#E8C766"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={omkrets}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${storlek / 2} ${storlek / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-sm font-bold leading-none text-[#E8C766]">{centrum}</span>
        {sub && (
          <span className="mt-0.5 text-[8px] uppercase tracking-wider text-[#EDE6D6]/70">{sub}</span>
        )}
      </div>
    </div>
  );
}

type StegStatus = "klar" | "pagar" | "vantar" | "last";

type Steg = {
  id: string;
  nr: string;
  namn: string;
  ikon: string;
  status: StegStatus;
  andel: number; // 0–1
  centrum: string;
  sub?: string;
  text: string;
  lank?: { href: string; text: string };
};

/** Status-chipens färgklasser (texten kommer ur ordlistan i render). */
const STATUS_KLASS: Record<StegStatus, string> = {
  klar: "border-[#E8C766] bg-[#E8C766]/15 text-[#E8C766]",
  pagar: "border-[#E8C766]/50 bg-[#E8C766]/10 text-[#E8C766]",
  vantar: "border-[#EDE6D6]/25 bg-transparent text-[#EDE6D6]/60",
  last: "border-[#EDE6D6]/25 bg-transparent text-[#EDE6D6]/60",
};

export function Fas3Cert() {
  // SSR-säkra guards: allt localStorage-läsande sker i useEffect efter montering.
  const { t, sprak } = useSprak();
  const [hydrerad, setHydrerad] = useState(false);
  const [elevNiva, setElevNiva] = useState(1);
  const [elevXp, setElevXp] = useState(0);
  const [klara, setKlara] = useState<string[]>([]);
  const [sparade, setSparade] = useState<SuperanalysData[]>([]);
  const [namn, setNamn] = useState("");

  useEffect(() => {
    const m = lasMedlem();
    if (m?.namn) setNamn(m.namn);
    setElevNiva(niva());
    setElevXp(lasXP());
    setKlara(lasKlaraKurser());
    setSparade(lasSparade());
    setHydrerad(true);
  }, []);

  // Praktikportföljens råvara: kompletta (= alla 20 variabler poängsatta)
  // superanalyser. Pågående utkast nämns som just utkast — aldrig som brist.
  const kompletta = sparade.filter(arKomplett).length;
  const utkast = sparade.length - kompletta;

  const grundAndel = Math.min(1, elevNiva / NIVA_KRAV);
  const praktikAndel = Math.min(1, kompletta / ANALYSER_KRAV);
  const etikAndel = 0; // Etik-modulen öppnas med Fas 3 — löftena är läsbara redan nu.
  const klarForCert = grundAndel >= 1 && praktikAndel >= 1 && etikAndel >= 1;
  const certAndel = klarForCert ? 1 : 0;
  const total = (grundAndel + praktikAndel + etikAndel + certAndel) / 4;

  const steg: Steg[] = [
    {
      id: "grund",
      nr: "1",
      namn: t("fas3cert.stegGrund"),
      ikon: "📚",
      status: grundAndel >= 1 ? "klar" : "pagar",
      andel: grundAndel,
      centrum: `${hydrerad ? elevNiva : 1}`,
      sub: t("fas3cert.av", { n: NIVA_KRAV }),
      text:
        grundAndel >= 1
          ? t("fas3cert.grundKlar", { krav: NIVA_KRAV })
          : t("fas3cert.grundPagar", { niva: hydrerad ? elevNiva : 1, krav: NIVA_KRAV }),
      lank:
        grundAndel >= 1
          ? undefined
          : {
              href: sprak === "en" || sprak === "ar" ? `/${sprak}/kurser` : "/kurser",
              text: t("fas3cert.fortsattGrund"),
            },
    },
    {
      id: "praktik",
      nr: "2",
      namn: t("fas3cert.stegPraktik"),
      ikon: "🏅",
      status: praktikAndel >= 1 ? "klar" : "pagar",
      andel: praktikAndel,
      centrum: `${hydrerad ? kompletta : 0}`,
      sub: t("fas3cert.av", { n: ANALYSER_KRAV }),
      text:
        praktikAndel >= 1
          ? t("fas3cert.praktikKlar")
          : t("fas3cert.praktikPagarA", { n: hydrerad ? kompletta : 0, krav: ANALYSER_KRAV }) +
            (hydrerad && utkast > 0
              ? " " +
                (utkast === 1
                  ? t("fas3cert.praktikUtkast1", { n: utkast })
                  : t("fas3cert.praktikUtkastFlera", { n: utkast }))
              : "") +
            " " +
            t("fas3cert.praktikPagarB"),
      lank: { href: "/superanalys", text: t("fas3cert.oppnaSuper") },
    },
    {
      id: "etik",
      nr: "3",
      namn: t("fas3cert.stegEtik"),
      ikon: "⚖️",
      status: "vantar",
      andel: etikAndel,
      centrum: "0",
      sub: t("fas3cert.av", { n: ETIK_LOFTEN }),
      text: t("fas3cert.etikText"),
    },
    {
      id: "cert",
      nr: "4",
      namn: t("fas3cert.stegCert"),
      ikon: "🎓",
      status: klarForCert ? "pagar" : "last",
      andel: certAndel,
      centrum: klarForCert ? "◎" : "🔒",
      text: t("fas3cert.certText"),
    },
  ];

  // Nästa steg = första steg som inte är klart (aldrig brist — alltid nästa stapel).
  const nasta = steg.find((s) => s.status !== "klar");

  return (
    <section
      aria-label={t("fas3cert.aria")}
      className="marin-panel relative overflow-hidden rounded-3xl border-2 border-gold/60 p-6 shadow-xl sm:p-9"
    >
      <div className="pointer-events-none absolute inset-2 rounded-2xl border border-[#E8C766]/25" aria-hidden />

      <div className="relative">
        {/* Rubrik + personlig hälsning — alltid välkommen, aldrig skyldig */}
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#E8C766]">
          🎓 {t("fas3cert.eyebrow")}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-[#EDE6D6]">
          {hydrerad
            ? t("fas3cert.velkommenNu", { namn: namn ? `, ${namn}` : "" })
            : t("fas3cert.velkommenResa")}
        </h2>

        {/* Statusrad — samma neutrala ton som fas2-ansök */}
        <p className="mt-2 text-xs text-[#EDE6D6]/75">
          {hydrerad ? (
            <>
              {t("fas3cert.elevstatus")}
              <strong className="text-[#EDE6D6]">
                {t("kurs.niva")} {elevNiva} · {elevXp.toLocaleString(xpLocale(sprak))} XP ·{" "}
                {klara.length === 1
                  ? t("fas3cert.statKursSing", { n: klara.length })
                  : t("fas3cert.statKursFler", { n: klara.length })}{" "}
                ·{" "}
                {sparade.length === 1
                  ? t("fas3cert.statAnalysSing", { n: sparade.length })
                  : t("fas3cert.statAnalysFler", { n: sparade.length })}
              </strong>
            </>
          ) : (
            <span className="text-[#EDE6D6]/50">{t("fas3cert.laserStatus")}</span>
          )}
        </p>

        <div className="mt-7 flex flex-col gap-7 sm:flex-row sm:items-start">
          {/* Total-ring — hela vägen till certifiering */}
          <div className="flex items-center gap-5 sm:flex-col sm:items-center">
            <Ring
              procent={total}
              storlek={124}
              centrum={`${Math.round(total * 100)}%`}
              sub={t("fas3cert.avVagen")}
            />
            <p className="max-w-[15rem] text-xs leading-relaxed text-[#EDE6D6]/80 sm:text-center">
              {t("fas3cert.ringText")}
            </p>
          </div>

          {/* Fyra steg */}
          <ol className="flex-1 space-y-3">
            {steg.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-4 rounded-2xl border border-[#E8C766]/20 bg-[#EDE6D6]/[0.03] p-4"
              >
                <Ring
                  procent={s.andel}
                  centrum={s.centrum}
                  sub={s.sub}
                  storlek={68}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif text-base font-bold text-[#EDE6D6]">
                      {s.ikon} {t("fas3cert.steg", { nr: s.nr })} · {s.namn}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_KLASS[s.status]}`}
                    >
                      {s.status === "klar"
                        ? t("ui.klar")
                        : s.status === "pagar"
                          ? t("fas3cert.pagar")
                          : s.status === "vantar"
                            ? t("fas3cert.vantar")
                            : t("fas3cert.last")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#EDE6D6]/85">{s.text}</p>
                  {s.lank && (
                    <Link
                      href={s.lank.href}
                      className="mt-2 inline-block text-xs font-semibold text-[#E8C766] underline decoration-[#E8C766]/40 underline-offset-2 hover:decoration-[#E8C766]"
                    >
                      {s.lank.text} →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Nästa steg — pedagogisk tonsatt, aldrig dömande */}
        <div className="mt-6 rounded-xl border border-[#E8C766]/40 bg-[#E8C766]/10 p-4">
          <p className="text-xs leading-relaxed text-[#EDE6D6]">
            <strong className="text-[#E8C766]">{t("fas3cert.nastaStegRubrik")}</strong>{" "}
            {hydrerad && nasta
              ? `${nasta.namn} — ${nasta.text.split(".")[0]}.`
              : t("fas3cert.nastaFallback")}
          </p>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-[#EDE6D6]/60">
          {t("fas3cert.fot")}
        </p>
      </div>
    </section>
  );
}
