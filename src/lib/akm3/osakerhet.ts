/**
 * AKM3 — OSÄKERHETSINTERVALL (steg 3, AKM3-BESLUT §5 + r4-osakerhet §2).
 *
 * Deterministiskt spann ur (poäng K, datatäckning t) — Manski-bounds utan
 * antaganden: identification region [K, K + 100·(1−t)] där den osatta vikten
 * poängsätts 0 p (värsta fallet, nedre = K) till 5 p (bästa fallet, övre).
 * Hård port aktiv ⇒ övre gräns takas till 45 (porten slår igenom — kärnans
 * V19-regel följer DATA, inte profilen).
 *
 *   nedre     = K
 *   ovre      = min(100, K + 100·(1 − t))
 *   porttak   = min(ovre, 45) när hård port är aktiv
 *   halvbredd = (ovre − nedre)/2        (visningsformatets "±")
 *   konfidens = t                        (täckningschippet står kvar — ALDRIG dolt)
 *
 * PRESENTATIONSLAGER: intervallet läser poängen och redovisas bredvid den —
 * det ingår ALDRIG i raknaAKM2/kompositen och påverkar ALDRIG någon poäng
 * (AKM3-BESLUT §3 "lager 5/pres — LÄSER, ändrar aldrig poäng"). Kärnan
 * (src/lib/akm2/karna.ts) rörs inte alls — funktionen är ren och kopplas i
 * visningslagret (korstabell/djupvy).
 *
 * DETERMINISM (P1): inga klockor, inget slump, ingen imputation — samma
 * indata ger JSON-identiskt spann (låses av validera-motorernas svit).
 * Spannet [nedre–övre] visas ALLTID i tooltip/aria-label och utskrivet på
 * detaljsidor: en symmetrisk ±-förkortning av ett asymmetriskt spann får
 * ALDRIG vara det enda kunden ser (nedre gräns är poängen själv).
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

/** Tak för övre gräns när hård port (V19 < 12 mån) är aktiv — BESLUT §5. */
export const PORT_TAK = 45;

/** Resultatet av intervallberäkningen — serialiserbart, åäö-fria nycklar. */
export type OsakerhetsIntervall = {
  /** Visad poäng (AKM1-total eller AKM2-komposit, 0–100). */
  poang: number;
  /** Nedre gräns = K (värsta fallet: osatta ger 0 p). */
  nedre: number;
  /** Övre gräns = min(100, K + 100·(1−t)); porttakad till 45 vid hård port. */
  ovre: number;
  /** (ovre − nedre)/2 — visningsformatets "±". */
  halvbredd: number;
  /** Datatäckning t (0–1) — intervallets konfidens, aldrig dold. */
  tackning: number;
  /** true när porttaket (45) kapade den naiva övre gränsen. */
  portTakad: boolean;
  /** Kort ärlighetsnot — reproducerbar i UI utan egen textmil. */
  note: string;
};

/** Äkta heltal? Nej — men 1 decimal med svenska kommatecken, utan trailingnollor. */
function sv1(x: number): string {
  const t = Math.round(x * 10) / 10;
  return (Number.isInteger(t) ? String(t) : t.toFixed(1)).replace(".", ",");
}

/** Heltalstext. */
function sv0(x: number): string {
  return String(Math.round(x));
}

/**
 * Räkna osäkerhetsintervallet ur (K, t, portAktiv).
 *
 * K = visad poäng (AKM1-total eller AKM2-komposit), t = datatäckning 0–1
 * (befintligt fält `datatackning` — AKM1: satt vikt/97; AKM2: aktiv
 * profilvikt approximeras av samma fält), portAktiv = hård port (V19).
 * Saknas K eller t ⇒ null — osatt är osatt, modellen gissar aldrig (P3).
 */
export function raknaIntervall(
  poang: number | null | undefined,
  tackning: number | null | undefined,
  portAktiv = false,
): OsakerhetsIntervall | null {
  if (
    typeof poang !== "number" || !Number.isFinite(poang) ||
    typeof tackning !== "number" || !Number.isFinite(tackning)
  ) {
    return null;
  }
  const t = Math.min(1, Math.max(0, tackning));
  const nedre = poang;
  const naivOvre = Math.min(100, poang + 100 * (1 - t));
  const portTakad = portAktiv && naivOvre > PORT_TAK;
  const ovre = portTakad ? PORT_TAK : naivOvre;
  const halvbredd = (ovre - nedre) / 2;
  return {
    poang,
    nedre,
    ovre,
    halvbredd,
    tackning: t,
    portTakad,
    note:
      `Spann [${sv0(nedre)}–${sv0(ovre)}]: osatt vikt poängsatt 0 p (värsta) till 5 p (bästa) ` +
      `vid täckning ${sv0(t * 100)} %${portTakad ? `; hård port aktiv — övre gräns takad till ${PORT_TAK}` : ""}. ` +
      "Modellen gissar aldrig.",
  };
}

/**
 * Strängare fullviktsrad för AKM2-kompositen (BESLUT §5, r4 §2-not):
 * [K·t, K·t + 100·(1−t)] — de äkta gränserna om omfördelande profil behålls
 * när osatt data anländer. Redovisas som EXTRA rad på detaljsidan ("med
 * profilen behållen vid full data"); primärredovisningen följer alltid
 * raknaIntervall ovan (profiloberoende, minst lika bred).
 */
export function raknaFullviktsIntervall(
  poang: number | null | undefined,
  tackning: number | null | undefined,
): { nedre: number; ovre: number } | null {
  if (
    typeof poang !== "number" || !Number.isFinite(poang) ||
    typeof tackning !== "number" || !Number.isFinite(tackning)
  ) {
    return null;
  }
  const t = Math.min(1, Math.max(0, tackning));
  return {
    nedre: poang * t,
    ovre: Math.min(100, poang * t + 100 * (1 - t)),
  };
}

// ── Visningsformat (deterministiska — inga lokaler, hydrationssäkra) ─────────

/** "58 [58–91] (täckning 67 %)" — detaljsidans utskrivna spann. Null → "—". */
export function intervallText(i: OsakerhetsIntervall | null | undefined): string {
  if (!i) return "—";
  return `${sv0(i.poang)} [${sv0(i.nedre)}–${sv0(i.ovre)}] (täckning ${sv0(i.tackning * 100)} %)`;
}

/** "58 ± 16,5 (täckning 67 %)" — chippens kompakta ±-form (± = halvbredd). */
export function intervallPlusText(i: OsakerhetsIntervall | null | undefined): string {
  if (!i) return "—";
  return `${sv0(i.poang)} ± ${sv1(i.halvbredd)} (täckning ${sv0(i.tackning * 100)} %)`;
}

/** "[58–91]" — spannet självt (får ALDRIG vara det enda kunden ser). */
export function spannText(i: OsakerhetsIntervall | null | undefined): string {
  if (!i) return "—";
  return `[${sv0(i.nedre)}–${sv0(i.ovre)}]`;
}
