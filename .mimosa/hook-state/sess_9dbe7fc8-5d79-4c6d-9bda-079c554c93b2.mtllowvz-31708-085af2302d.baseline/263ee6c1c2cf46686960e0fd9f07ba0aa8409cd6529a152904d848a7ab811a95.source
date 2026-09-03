"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  KorstabbellRad,
  PortfoljForslag,
  PortfoljUppfoljning,
  RiskProfil,
} from "@/lib/portfolj-forskning/typer";
import { hamtaRiskProfil } from "@/lib/portfolj-forskning/riskportfolj";
import { lasMedlem, type Medlem } from "@/lib/member-local";
import { RiskvalPanel } from "./riskval-panel";
import { PortfoljDjupvy } from "./portfolj-djupvy";
import { RISKNIVA_TEXT, TAKT_TEXT, datumText, talText } from "./vag-stil";

// ═══════════════════════════════════════════════════════════
// BYGG PORTFÖLJ-KORT — P7:s byggflöde: Riskval-panel (P4) →
// POST /api/portfolj-forskning {riskniva, takt} → PortfoljForslag
// redovisat via PortfoljDjupvy (P4: innehav, vikter, motiv,
// kravchips, ersättningar, AK1A-not).
//
// GATING: sidan är öppen för alla (försäljningssyfte) men själva
// bygget kräver inloggad medlem — samma lokala medlemsmätare som
// övriga verktyg (lasMedlem i member-local.ts). Medlemskapet mäts
// i effekt (för statusraden) och om vid varje klick — aldrig under
// render → hydrationssäkert. Ej medlem → inbjudande inloggnings-
// panel, aldrig ett nej.
//
// ÄRLIGHET: API svarar 503 när P6:s underlag saknas → vänlig
// "datainsamlingen pågår"-panel. Motorn gissar aldrig — och detta
// kort hittar aldrig på siffror den inte fick. ALDRIG råd.
// ═══════════════════════════════════════════════════════════

type Lage = "vilar" | "bygger" | "klart" | "pagaar" | "fel";

export function ByggPortfoljKort({ rader }: { rader: KorstabbellRad[] }) {
  const [medlem, setMedlem] = useState<Medlem | null>(null);
  const [lage, setLage] = useState<Lage>("vilar");
  const [forslag, setForslag] = useState<PortfoljForslag | null>(null);
  const [felText, setFelText] = useState("");
  const [valdProfil, setValdProfil] = useState<RiskProfil | undefined>(undefined);

  // Medlemsmätaren — localStorage läses ENDAST i effekt (samme mönster som
  // min-portfolj-kort.tsx). Riskval-panelen renderas dock alltid: första
  // passt på servern är detsamma som klientens (hydrationssäkert), och
  // medlemskapet mäts om vid varje klick på "Forska fram portfölj".
  useEffect(() => {
    setMedlem(lasMedlem());
  }, []);

  /** Riskval-panelens "Forska fram portfölj →" — gaten slår till här. */
  async function horskaFram(profil: RiskProfil) {
    setValdProfil(profil);
    setFelText("");
    setForslag(null);
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
        body: JSON.stringify({ riskniva: profil.niva, takt: profil.takt }),
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
              className="inline-flex min-h-[44px] items-center rounded-lg bg-gold px-6 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
            >
              Logga in gratis
            </Link>
            <Link
              href="/medlemskap"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gold/50 px-5 text-sm font-semibold hover:bg-gold/10"
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
