"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lasXP, lasStjarnor, lasKlaraKurser, nivaFranXP, markeraKursKlar, addXP, addStjarna } from "@/lib/member-local";
import { harLokalProgress, lasMedlemProgressKlient, synkaKursklar } from "@/lib/medlem-progress-klient";
import { SIFFROR } from "@/lib/siffror";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * Kursportall — VÅG 87 (FAS L2, STYRELSE-V86-L2-GATING.md §A + §E kandidat 1):
 * SERVERSTYRT KURSLÅS med ISR-låst bas + klient-hydrering-egis.
 *
 * KONTRAKT (generaliserar våg 78:s Fas2Gate-mönster till gratis-kurser):
 *  1. SSR/first paint visar ALLTID gäst-vyn: smakprov (kapitel 1–2, prop) +
 *     låst kort. Barnen (kapitel 3+) renderas ALDRIG i first paint — dagens
 *     läcka (`medlem===null → children`) är sluten. Sidan förblir ISR-cachad
 *     (den läser ALDRIG sessionen i SSR-passet — §E).
 *  2. Klient-egis efter hydrering: EN tunn GET /api/medlem/progress (session +
 *     progress i en rondtur, §C.4) → medlem: children renderas ur DET REDAN
 *     LADDADE paketet (ingen hämtning — innehållet finns i flight-payloaden;
 *     gating = pedagogik + betalmoral, ej DRM — §B GRÄNS 2, dokumenterat);
 *     gäst: låsta vyn ÄR slutläget (inga fler nätverksanrop).
 *  3. Knappen "Lås upp (medlem)" verifierar sessionen på begäran → renderar
 *     fulltexten vid giltig session, lotsar annars till inloggningen
 *     (return-URL-mönstret ?next=/kurser/<slug>, våg 63 O2 #1).
 *
 * Lokal medlem utan konto = gäst tills registrering (L1-beslutet) — men
 * designens §A.2-banner ("Du har framsteg sparat på denna enhet…") visas i
 * låskortet när enheten bär lokal progress.
 *
 * NivaBar: local-cache kvar (L2-linjen) + skugg-POST (fire-and-forget) vid
 * varje belöning — gästens POST avvisas tyst av servern (§C.5).
 */
export function KursGate({
  slug,
  titel,
  smakprov = null,
  children,
}: {
  slug: string;
  titel: string;
  /** Kapitel 1–2 — det enda kapitelinnehåll gäst-vyn renderar (SEO/lockbete). */
  smakprov?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t, sprak } = useSprak();
  // "okand" = SSR/first paint (LÅST är default — children renderas ej);
  // "gast" = server-verifierad gäst (slutläget); "medlem" = upplåst;
  // "fel" = sessionen kunde INTE kontrolleras (nätverksfel — LOGIN-2.0:
  // aldrig mer låst gästvy av en flackande förbindelse).
  const [status, setStatus] = useState<"okand" | "gast" | "medlem" | "fel">("okand");
  const [verifierar, setVerifierar] = useState(false);
  const [inteInloggad, setInteInloggad] = useState(false);
  const [lokalProgress, setLokalProgress] = useState(false);

  useEffect(() => {
    setLokalProgress(harLokalProgress());
    let aktiv = true;
    lasMedlemProgressKlient()
      .then((svar) => {
        if (aktiv) setStatus(svar.inloggad ? "medlem" : "gast");
      })
      .catch(() => {
        if (aktiv) setStatus("fel"); // nätverksfel ⇒ återförsöksbart, ej gästvy
      });
    return () => {
      aktiv = false;
    };
  }, []);

  /** Knappens verify: en ny session-fråga på begäran (§A.3-kontraktet). */
  const lasUpp = async () => {
    if (verifierar || status === "medlem") return;
    setVerifierar(true);
    try {
      const svar = await lasMedlemProgressKlient();
      if (svar.inloggad) {
        setStatus("medlem");
        setInteInloggad(false);
      } else {
        setStatus("gast");
        setInteInloggad(true);
      }
    } catch {
      setStatus("fel"); // nätverksfel ⇒ ALDRIG "inte inloggad"-ursäkt
    } finally {
      setVerifierar(false);
    }
  };

  // ── Medlem: fulltexten ur det redan-laddade paketet (kap 1–2 ingår) ──────
  if (status === "medlem") return <>{children}</>;

  // Speglarna: inloggning + retur-kurs på spegelns egna sökvägar.
  const inloggning =
    sprak === "en" || sprak === "ar"
      ? `/${sprak}/logga-in?next=${encodeURIComponent(`/${sprak}/kurser/${slug}`)}`
      : `/logga-in?next=${encodeURIComponent(`/kurser/${slug}`)}`;

  // ── LÅST VY — SSR-default: smakprov + inbjudan vidare ─────────────────────
  return (
    <div className="relative">
      {smakprov}

      <div className="relative mt-10">
        <div className="flex items-center justify-center">
          <div className="max-w-md rounded-2xl border-2 border-gold bg-paper p-8 text-center shadow-xl">
            <p className="text-3xl" aria-hidden="true">🔒</p>
            <h3 className="mt-3 font-serif text-2xl font-bold">
              {t("gate.fortsattGratis")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("gate.skapaA")}
              <strong>{t("gate.helaTitel", { titel })}</strong>
              {t("gate.skapaB", { kurser: SIFFROR.kurser })}
            </p>
            {/* Return-URL (VÅG 63 O2 #1): eleven landar tillbaka i DENNA kurs
                efter inloggningen. */}
            <button
              type="button"
              onClick={lasUpp}
              disabled={verifierar}
              className="mt-5 inline-block rounded-lg bg-gold px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {verifierar ? t("gate.laserUpp") : t("gate.lasUppMedlem")}
            </button>
            <div className="mt-3">
              <Link href={inloggning} className="text-xs font-semibold text-gold underline hover:opacity-80">
                {t("gate.lasUppGratis")}
              </Link>
            </div>
            {inteInloggad && status !== "fel" && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground" role="status">
                {t("gate.inteInloggad")}
              </p>
            )}
            {status === "fel" && (
              <p className="mt-3 text-xs leading-relaxed text-red-600 dark:text-red-400" role="alert">
                {t("gate.kundeInteKolla")}{" "}
                <button type="button" onClick={lasUpp} disabled={verifierar} className="font-semibold underline disabled:opacity-60">
                  {t("gate.forsokIgen")}
                </button>
              </p>
            )}
            {/* §A.2: lokal progress finns — mjuk migreringsinbjudan */}
            {lokalProgress && status === "gast" && (
              <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-xs leading-relaxed text-gold">
                {t("gate.lokalProgress")}
              </p>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              {t("gate.sekunder")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Nivåbar + stjärnor + "markera klar" — visas för inloggade på kurssidor. */
export function NivaBar({ slug }: { slug: string }) {
  const { t, sprak } = useSprak();
  const [xp, setXP] = useState<number | null>(null);
  const [stjarnor, setStjarnor] = useState(0);
  const [klar, setKlar] = useState(false);

  useEffect(() => {
    setXP(lasXP());
    setStjarnor(lasStjarnor());
    // VÅG 78 B4b: redan klarad kurs (t.ex. via quiz-fullpoäng, som numera
    // utdelar samma belöning) visar status direkt — knappen dubbelbelönar
    // aldrig (markeraKursKlar är idempotent per kurs).
    setKlar(lasKlaraKurser().includes(slug));
  }, [slug]);

  if (xp === null) return null;

  const niv = nivaFranXP(xp);
  const iNivan = xp % 100;
  const procent = Math.min(100, iNivan);
  const medlemskapLank = sprak === "en" || sprak === "ar" ? `/${sprak}/medlemskap#fas2` : "/medlemskap#fas2";

  return (
    <div className="rounded-xl border border-gold/30 bg-card p-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-gold">
          ⭐ {t("kurs.niva")} {niv}/100 · {"★".repeat(Math.min(5, Math.floor(stjarnor / 3) + (stjarnor > 0 ? 1 : 0)))} ({stjarnor} {t("nivabar.stjarnor")})
        </span>
        <span className="text-muted-foreground">{xp} XP</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gold/15">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${procent}%` }} />
      </div>
      {niv >= 25 && (
        <p className="mt-2 text-xs font-semibold text-gold">
          🚀 {t("nivabar.redoFas2", { niv })}{" "}
          <Link href={medlemskapLank} className="underline">
            {t("nivabar.ansok")}
          </Link>
        </p>
      )}
      <button
        onClick={() => {
          if (markeraKursKlar(slug)) {
            const niv = addXP(50);
            addStjarna();
            // VÅG 87 (L2): skugg-POST — servern fastställer kursklar:<slug>=50
            // + stjarna:<slug>=1 (fire-and-forget; gästens 401 sväljs tyst).
            synkaKursklar(slug);
            setXP(lasXP());
            setStjarnor(lasStjarnor());
            setKlar(true);
            if (niv % 10 === 0) alert(t("nivabar.grattisNiva", { niv }));
          } else {
            setKlar(true);
          }
        }}
        disabled={klar}
        className="mt-3 w-full rounded-lg border border-gold/40 px-4 py-2 text-xs font-bold text-gold hover:bg-gold/10 disabled:opacity-50"
      >
        {klar ? t("nivabar.klarRedan") : t("nivabar.markeraKlar")}
      </button>
    </div>
  );
}
