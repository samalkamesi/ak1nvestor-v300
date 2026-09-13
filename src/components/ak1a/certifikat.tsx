"use client";

import { useState, useEffect } from "react";
import { lasMedlem, niva, lasXP, lasKlaraKurser, lasStjarnor } from "@/lib/member-local";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { useSprak } from "@/components/ak1a/sprak-leverantor";
import type { OrdlistaNyckel } from "@/lib/ordlista";

/** Datum-/talslocale per språk (våg 113) — samma precedens som FortsattPanel
 * (V86): en → "en-GB", ar → "ar-EG", annars "sv-SE" (originalet oförändrat). */
function formatLocale(sprak: string): string {
  if (sprak === "en") return "en-GB";
  if (sprak === "ar") return "ar-EG";
  return "sv-SE";
}

/** Betygsbeskrivningarnas ordlistenycklar (våg 113, sektion cert.* i ordlistan). */
const BETYG_TEXT: Record<"A" | "B" | "C" | "D", OrdlistaNyckel> = {
  A: "cert.betygA",
  B: "cert.betygB",
  C: "cert.betygC",
  D: "cert.betygD",
};

/** Certifikat — auto-genererad visuell proof på kompetens. Delbar.
 * Våg 113: trespråkig (sv/en/ar) via useSprak + ordlistans cert.*-nycklar.
 * lankPrefix (KursSok-mönstret) styr Fas 2-länkens språkprefix — speglarna
 * skickar "/en" resp "/ar", svenska originalsidan skickar inget (default ""). */
export function Certifikat({ lankPrefix = "" }: { lankPrefix?: string }) {
  const { t, sprak } = useSprak();
  const [medlem, setMedlem] = useState<{ email: string; namn?: string } | null>(null);
  const [kurser, setKurser] = useState<string[]>([]);
  const [xp, setXp] = useState(0);
  const [stjarnor, setStjarnor] = useState(0);
  const [betyg, setBetyg] = useState<"A" | "B" | "C" | "D" | null>(null);

  useEffect(() => {
    setMedlem(lasMedlem());
    setKurser(lasKlaraKurser());
    setXp(lasXP());
    setStjarnor(lasStjarnor());

    // Beräkna betyg
    const niv = niva();
    if (niv >= 50) setBetyg("A");
    else if (niv >= 35) setBetyg("B");
    else if (niv >= 25) setBetyg("C");
    else if (niv >= 15) setBetyg("D");
  }, []);

  const niv = niva();
  const datum = new Date().toLocaleDateString(formatLocale(sprak), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certId = `AK1A-${new Date().getFullYear()}-${String(xp).padStart(6, "0")}`;

  const betgFarg = { A: "#047857", B: "#a8862a", C: "#d97706", D: "#5a5045" };

  if (!medlem) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border-2 border-gold/40 bg-card p-8 text-center">
        <p className="text-4xl">🏆</p>
        <h2 className="mt-3 font-serif text-2xl font-bold">{t("cert.rubrikVantar")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("cert.loggaInText")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Certifikat-kort */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-gold bg-gradient-to-br from-paper via-paper to-gold/5 p-10 shadow-2xl">
        {/* Vattenmärke */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <span className="font-serif text-[180px] font-black">AK1A</span>
        </div>

        {/* Dekorativ kant */}
        <div className="absolute inset-2 rounded-2xl border-2 border-gold/30" />

        {/* Header */}
        <div className="relative text-center">
          <div className="flex justify-center">
            <VarumarkesLogo storlek="sm" />
          </div>
          {/* Etchningen är varumärke — förblir oförändrad på alla språk. */}
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-gold">AK1A RESEARCH LAB</p>
          <div className="mx-auto mt-3 h-0.5 w-24 bg-gold/40" />
          <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight">
            {t("cert.intygRubrik")}
          </h1>
          <p className="mt-2 text-sm italic text-muted-foreground">
            {t("cert.intygUnderrubrik")}
          </p>
        </div>

        {/* Namn */}
        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("cert.dettaIntygs")}
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-gold">
            {medlem.namn || medlem.email.split("@")[0]}
          </p>
        </div>

        {/* Betyg */}
        {betyg && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black text-white"
              style={{ background: betgFarg[betyg] }}
            >
              {betyg}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold" style={{ color: betgFarg[betyg] }}>
                {t(BETYG_TEXT[betyg])}
              </p>
            </div>
          </div>
        )}

        {/* Statistik — "XP" förblir latin (varumärke/termer enligt riktlinjerna). */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gold/20 bg-paper/80 p-3 text-center">
            <p className="font-serif text-2xl font-bold text-gold">{kurser.length}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t("cert.kurser")}
            </p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-paper/80 p-3 text-center">
            <p className="font-serif text-2xl font-bold text-gold">{xp}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">XP</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-paper/80 p-3 text-center">
            <p className="font-serif text-2xl font-bold text-gold">
              {`${t("cert.nivaEtikett")} ${niv}`}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t("cert.av100")}
            </p>
          </div>
        </div>

        {/* Footer — "Ak1 Apex Nexus" är grundarens namn (varumärke), översätts ej. */}
        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="font-serif text-sm font-semibold text-gold">Ak1 Apex Nexus</p>
            <p className="text-[10px] text-muted-foreground">{t("cert.grundare")}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">{t("cert.certifikatId")}</p>
            <p className="font-mono text-xs font-bold">{certId}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{datum}</p>
          </div>
        </div>

        {/* Sigill */}
        <div className="mt-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/50 text-2xl">
            🔬
          </div>
        </div>
      </div>

      {/* Dela / ladda ner */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => {
            // Dela-texten följer ordlistans cert.delaText-parametrar exakt
            // ({betyg} = betygsBOKSTAVEN, eller "Pågående" innan betyg finns).
            const text = t("cert.delaText", {
              betyg: betyg || t("cert.pagaende"),
              namn: medlem.namn || medlem.email,
              kurser: kurser.length,
              xp,
              niva: niv,
              certId,
            });
            if (navigator.share) {
              navigator.share({ title: t("cert.delaTitel"), text }).catch(() => {});
            } else {
              navigator.clipboard.writeText(text).catch(() => {});
              alert(t("cert.kopierat"));
            }
          }}
          className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {t("cert.delaKnapp")}
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-xl border-2 border-gold/40 px-6 py-3 text-sm font-semibold text-gold hover:bg-gold/10"
        >
          {t("cert.skrivUt")}
        </button>
      </div>

      {/* Nästa steg */}
      <div className="mt-6 rounded-xl border border-dashed border-gold/40 bg-card p-4 text-center">
        {niv < 25 ? (
          <>
            <p className="text-sm font-semibold text-gold">
              {t("cert.nivaMotFas2", {
                niva: niv,
                procent: Math.min(100, Math.round((xp / 2400) * 100)),
              })}
            </p>
            {/* VÅG 63 O2 #5: räknaren var "(25-niv)*2 kurser kvar" — antog 50
                XP/kurs och ignorerade quiz-XP (10 XP/svar) ≈ 4x avskräckande.
                Nu XP-baserad mot kodens verkliga tröskel: nivå 25 = 2 400 XP
                (nivaFranXP), ≈ antal rätt quiz-svar som återstår. Siffrorna
                formatteras med språkets locale (våg 113) — konsistent med
                datumraden. */}
            <p className="mt-1 text-xs text-muted-foreground">
              {t("cert.xpKvar", {
                xp: Math.max(0, 2400 - xp).toLocaleString(formatLocale(sprak)),
                antal: Math.ceil(Math.max(0, 2400 - xp) / 10).toLocaleString(formatLocale(sprak)),
              })}
            </p>
            {niv < 15 && (
              <p className="mt-1 text-xs text-muted-foreground">{t("cert.mellanmilstenare")}</p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-green-700">{t("cert.kvalificerad")}</p>
            <a
              href={`${lankPrefix}/medlemskap#fas2`}
              className="mt-2 inline-block text-xs font-bold text-gold underline"
            >
              {t("cert.ansokFas2")}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
