"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  KorstabbellRad,
  PortfoljForslag,
  PortfoljUppfoljning,
  RiskProfil,
} from "@/lib/portfolj-forskning/typer";
import { hamtaRiskProfil, type PoangBas } from "@/lib/portfolj-forskning/riskportfolj";
import { harPrenumerationsNiva } from "@/lib/prenumeration";
import { lasMedlem, type Medlem } from "@/lib/member-local";
import { RiskvalPanel } from "./riskval-panel";
import { PortfoljDjupvy } from "./portfolj-djupvy";
import { lasKorstabellRader } from "./korstabell-leverantor";
import { RISKNIVA_TEXT, TAKT_TEXT, datumText, talText } from "./vag-stil";

// ═══════════════════════════════════════════════════════════
// BYGG PORTFÖLJ-KORT — P7:s byggflöde: Riskval-panel (P4) →
// POST /api/portfolj-forskning {riskniva, takt, poangbas} →
// PortfoljForslag redovisat via PortfoljDjupvy (P4: innehav,
// vikter, motiv, kravchips, ersättningar, AK1A-not).
//
// GATING: sidan är öppen för alla (försäljningssyfte) men själva
// bygget kräver inloggad medlem — samma lokala medlemsmätare som
// övriga verktyg (lasMedlem i member-local.ts). Medlemskapet mäts
// i effekt (för statusraden) och om vid varje klick — aldrig under
// render → hydrationssäkert. Ej medlem → inbjudande inloggnings-
// panel, aldrig ett nej.
//
// POÄNGBAS (våg 57 D2): "AKM1 | AKM2"-väljaren ovanför bygg-knappen.
// AKM2-läget (kompositen med moduler V21+ och viktprofil akm2-2026)
// kräver Portföljforskning PLUS eller högre — samma lokala nivåmodell
// som Fas-gatingen (harPrenumerationsNiva, src/lib/prenumeration.ts).
// Utan nivån: låst chip + inbjudan till /prenumeration, ALDRIG ett nej.
// Med nivån: poängbasen skickas med i POST-kroppen och motorn bygger
// deterministiskt på AKM2-kompositen istället för AKM1-totalen.
//
// ÄRLIGHET: API svarar 503 när P6:s underlag saknas → vänlig
// "datainsamlingen pågår"-panel. Motorn gissar aldrig — och detta
// kort hittar aldrig på siffror den inte fick. ALDRIG råd.
// ═══════════════════════════════════════════════════════════

type Lage = "vilar" | "bygger" | "klart" | "pagaar" | "fel";

/**
 * VÅG 63 bygg-2 (optimering #1): `rader` är VALFRI — sidan levererar
 * kedjan via KorstabellLeverantorns kontext (en serialization i flighten
 * i stället för en per komponent); en direkt prop (demo, framtida ytor)
 * vinner fortfarande över kontexten.
 */
export function ByggPortfoljKort({ rader: raderProp }: { rader?: KorstabbellRad[] }) {
  const rader = raderProp ?? lasKorstabellRader() ?? [];
  const [medlem, setMedlem] = useState<Medlem | null>(null);
  const [lage, setLage] = useState<Lage>("vilar");
  const [forslag, setForslag] = useState<PortfoljForslag | null>(null);
  const [felText, setFelText] = useState("");
  const [valdProfil, setValdProfil] = useState<RiskProfil | undefined>(undefined);
  const [poangbas, setPoangbas] = useState<PoangBas>("akm1");
  const [akm2Last, setAkm2Last] = useState(false);
  const [plusAccess, setPlusAccess] = useState<boolean | null>(null);

  // Medlemsmätaren + prenumerationsnivån — localStorage läses ENDAST i effekt
  // (samma mönster som min-portfolj-kort.tsx). Riskval-panelen renderas dock
  // alltid: första passt på servern är detsamma som klientens (hydrationssäkert),
  // och medlemskapet mäts om vid varje klick på "Forska fram portfölj".
  useEffect(() => {
    setMedlem(lasMedlem());
    setPlusAccess(harPrenumerationsNiva("forskning-plus"));
  }, []);

  /** Byt poängbas — AKM2 utan Plus-nivå låses direkt (chippet visar varför). */
  function valjPoangbas(bas: PoangBas) {
    setPoangbas(bas);
    if (bas === "akm2") {
      // Mät om vid valet — nivån kan ha hunnit registreras sedan monteringen.
      const ok = harPrenumerationsNiva("forskning-plus");
      setPlusAccess(ok);
      setAkm2Last(!ok);
      return;
    }
    setAkm2Last(false);
  }

  /** Riskval-panelens "Forska fram portfölj →" — gaten slår till här. */
  async function horskaFram(profil: RiskProfil) {
    setValdProfil(profil);
    setFelText("");
    setForslag(null);
    if (poangbas === "akm2") {
      // Gating mäts OM vid klicket — aldrig under render (hydrationssäkert).
      const ok = harPrenumerationsNiva("forskning-plus");
      setPlusAccess(ok);
      if (!ok) {
        setAkm2Last(true);
        setLage("vilar"); // låspanelen visas underifrån
        return;
      }
    }
    setAkm2Last(false);
    const m = lasMedlem();
    setMedlem(m); // synka state — medlemskapet kan ha ändrats sedan monteringen
    if (!m) {
      setLage("vilar"); // inloggningspanelen visas underifrån (vald profil finns)
      return;
    }
    setLage("bygger");
    try {
      const res = await fetch("/api/portfolj-forskning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskniva: profil.niva, takt: profil.takt, poangbas }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        forslag?: PortfoljForslag;
        error?: string;
      };
      if (res.ok && data.forslag) {
        setForslag(data.forslag);
        setLage("klart");
        return;
      }
      if (res.status === 503) {
        setLage("pagaar");
        return;
      }
      setFelText(data.error ?? `Tjänsten svarade ${res.status}`);
      setLage("fel");
    } catch {
      setFelText("Nätverket svarade inte — kontrollera anslutningen och försök igen.");
      setLage("fel");
    }
  }

  /** Tom uppföljning till djupvyn — ett färskt förslag har ännu inga snapshots;
   *  djupvyn redovisar då ärligt "ingen snapshot ännu". */
  const tomUppfoljning = (f: PortfoljForslag): PortfoljUppfoljning => ({
    portfoljId: f.id,
    riskProfil: f.riskProfil,
    snapshots: [],
    historik: [],
  });

  return (
    <section className="space-y-6">
      {/* Steg 1+2: risknivå + takt (P4-panelen, med motorns exakta RISKNIVAER) */}
      <RiskvalPanel
        vald={valdProfil}
        onVald={horskaFram}
        profilByggare={hamtaRiskProfil}
      />

      {/* Poängbas-väljare (våg 57 D2): AKM1 (öppet) | AKM2 (kräver Plus) */}
      <div className="rounded-2xl border border-gold/25 bg-paper p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Poängbas</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Motorns poängformel väger poängbasen 50 %, vågstatus 35 % och golv 15 %.
          Basen kan vara AKM1-totalen — eller AKM2-kompositen, där kärnans
          V01–V20 kombineras med automatiskt aktiverade branschmoduler (V21+)
          och viktprofilen akm2-2026. Samma val + samma underlag ger alltid
          samma portfölj.
        </p>
        <div className="mt-3 inline-flex overflow-hidden rounded-lg border border-gold/40" role="group" aria-label="Välj poängbas">
          {(["akm1", "akm2"] as PoangBas[]).map((bas) => {
            const vald = poangbas === bas;
            const lastad = bas === "akm2" && plusAccess === false;
            return (
              <button
                key={bas}
                type="button"
                onClick={() => valjPoangbas(bas)}
                aria-pressed={vald}
                className={`min-h-[44px] px-5 py-2 text-sm font-semibold transition-colors ${
                  vald
                    ? "bg-gold text-primary-foreground"
                    : "bg-transparent text-foreground hover:bg-gold/10"
                }`}
                title={
                  bas === "akm1"
                    ? "Poängbas AKM1 — korstabellens publicerade AKM1-total (öppet för alla)"
                    : "Poängbas AKM2 — kompositen med moduler V21+ och viktprofilen akm2-2026 (kräver Portföljforskning Plus)"
                }
              >
                {bas === "akm1" ? "AKM1" : "AKM2"}
                {lastad && <span aria-hidden className="ml-1.5">🔒</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] italic text-muted-foreground">
          {poangbas === "akm2"
            ? plusAccess
              ? "AKM2-läget är upplåst — bygget poängsätter på AKM2-kompositen."
              : "AKM2-läget kräver Portföljforskning Plus — låst tills nivån är din."
            : "AKM1-läget — poängbasen är korstabellens publicerade AKM1-total."}
        </p>
      </div>

      {/* AKM2-låset — vald AKM2 utan Plus-nivå: låst chip + inbjudan, aldrig ett nej */}
      {akm2Last && (
        <div className="rounded-2xl border border-gold/40 bg-card p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            <span aria-hidden className="mr-1.5">🔒</span>Låst läge
          </p>
          <h3 className="mt-2 flex flex-wrap items-center gap-2 font-serif text-xl font-bold">
            AKM2-poängbasen ingår i Portföljforskning Plus
            <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold">
              Kräver Plus
            </span>
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            AKM1-läget ovan är helt öppet — medan Plus-nivån öppnar AKM2-kompositen
            som poängbas: kärnans 20 fundamentalvariabler med automatiskt aktiverade
            branschmoduler (V21–V28), viktomfördelning vid osatt data och
            löpande ersättnings- och uppföljningsanalys. Se nivåerna och vad de
            innehåller på prenumerationssidan — du fattar alltid egna beslut.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/prenumeration"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-gold px-6 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
            >
              Se Portföljforskning Plus
            </Link>
            <button
              type="button"
              onClick={() => valjPoangbas("akm1")}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gold/50 px-5 text-sm font-semibold hover:bg-gold/10"
            >
              Bygg på AKM1 i stället
            </button>
          </div>
        </div>
      )}

      {/* Medlemsstatus — diskret rad, uppdateras efter montering */}
      <p className="text-[11px] italic text-muted-foreground">
        {medlem
          ? `Inloggad som medlem — bygget är öppet. Underlag: ${rader.length} bolag i korstabellen.`
          : "Bygg-flödet kräver inloggat medlemskap (gratis konto räcker) — självvalet ovan är öppet för alla."}
      </p>

      {/* Medlemsgaten — vald profil men ej inloggad: inbjudan, aldrig ett nej */}
      {valdProfil && !medlem && (
        <div className="rounded-2xl border border-gold/40 bg-card p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Ett steg kvar
          </p>
          <h3 className="mt-2 font-serif text-xl font-bold">
            Logga in gratis för att forska fram din portfölj
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Du har valt profilen{" "}
            <strong className="text-foreground">
              {RISKNIVA_TEXT[valdProfil.niva]} · {TAKT_TEXT[valdProfil.takt]}
            </strong>{" "}
            — och det valet sparas inte någonstans förrän du är medlem. Inloggningen
            är gratis och integritetsvänlig (allt sparas lokalt hos dig). Bygg-flödet
            är medlemsexklusivt; självvalet ovan är ditt att göra om hur många gånger
            som helst.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/logga-in"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-gold px-6 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] max-md:min-h-[52px]"
            >
              Logga in gratis
            </Link>
            <Link
              href="/medlemskap"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gold/50 px-5 text-sm font-semibold hover:bg-gold/10 max-md:min-h-[52px]"
            >
              Se medlemskap
            </Link>
          </div>
        </div>
      )}

      {/* Bygger … */}
      {lage === "bygger" && (
        <div className="rounded-2xl border border-gold/30 bg-card p-5" aria-busy="true" aria-live="polite">
          <p className="text-sm text-muted-foreground">
            Motorn poängsätter korstabellens {rader.length} bolag — AKM1, vågstatus
            och golvmarginal enligt din profil …
          </p>
          <div className="mt-3 space-y-2">
            <div className="h-9 animate-pulse rounded-lg border border-gold/20 bg-muted" />
            <div className="h-9 animate-pulse rounded-lg border border-gold/20 bg-muted" />
            <div className="h-9 animate-pulse rounded-lg border border-gold/20 bg-muted" />
          </div>
        </div>
      )}

      {/* Datainsamlingen pågår — motorn gissar aldrig */}
      {lage === "pagaar" && (
        <div className="rounded-2xl border border-dashed border-gold/40 bg-paper p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Datainsamlingen pågår
          </p>
          <h3 className="mt-2 font-serif text-xl font-bold">
            Underlaget håller på att samlas in
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Korstabellens grunddata har ännu inte levererats i sin helhet. Motorn
            gissar aldrig — utan mätt underlag finns inga portföljer att redovisa,
            och då säger vi hellre det än att hitta på siffror. Nedanför kan du se
            hur det färdiga flödet ser ut med tydligt märkta demodata.
          </p>
          <button
            type="button"
            onClick={() => setLage("vilar")}
            className="btn-marin mt-4 min-h-[44px] px-5 py-2.5 text-xs"
          >
            Försök igen
          </button>
        </div>
      )}

      {/* Övriga fel — vänligt, med retry */}
      {lage === "fel" && (
        <div className="rounded-2xl border border-gold/30 bg-card p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Rapporten dröjer
          </p>
          <h3 className="mt-2 font-serif text-xl font-bold">
            Portföljen kunde inte byggas just nu
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {felText ||
              "Något gick snett på vägen — det beror inte på ditt val. Prova igen om en stund."}
          </p>
          <button
            type="button"
            onClick={() => valdProfil && horskaFram(valdProfil)}
            className="btn-marin mt-4 min-h-[44px] px-5 py-2.5 text-xs"
          >
            Försök igen
          </button>
        </div>
      )}

      {/* Klart — sammanfattning + djupvyn (P4) med alla delar */}
      {lage === "klart" && forslag && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gold/40 bg-card p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
              Färskt forskningsförslag
            </p>
            <h3 className="mt-2 font-serif text-xl font-bold">
              Din forskningsportfölj — {RISKNIVA_TEXT[forslag.riskProfil.niva]} ·{" "}
              {TAKT_TEXT[forslag.riskProfil.takt]}
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-gold">
                {forslag.innehav.length} innehav
              </span>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-gold">
                Total vikt {talText(
                  forslag.innehav.reduce((summa, i) => summa + (Number.isFinite(i.vikt) ? i.vikt : 0), 0) * 100,
                  1,
                )} %
              </span>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-gold">
                Max {talText(forslag.riskProfil.maxPerAktie * 100, 0)} % per aktie
              </span>
              <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-gold">
                Underlag {datumText(forslag.skapad)}
              </span>
              {forslag.poangbas === "akm2" && (
                <span className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-1 text-gold">
                  Poängbas AKM2 (moduler V21+ · akm2-2026)
                </span>
              )}
              {forslag.ersattningar.length > 0 && (
                <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-gold">
                  {forslag.ersattningar.length} ersättningsförslag
                </span>
              )}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Förslaget är deterministiskt — samma val och samma underlag ger samma
              portfölj. Uppföljningen (&quot;då vs nu&quot;) börjar vid portföljens första
              snapshot; tills dess redovisas varje innehav utan jämförelsemått. Allt
              är pedagogisk forskning — inte investeringsrådgivning.
            </p>
          </div>

          <PortfoljDjupvy
            forslag={forslag}
            uppfoljning={tomUppfoljning(forslag)}
            rader={rader}
          />
        </div>
      )}
    </section>
  );
}
