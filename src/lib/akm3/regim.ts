/**
 * AKM3 — REGIMINDIKATOR (steg 5, AKM3-BESLUT §8 + r2-regimer §2).
 *
 * Deterministisk, DESKRIPTIV regimebeskrivning ur daterade snapshots —
 * i AKM3.2026.09 ENBART deskriptiv + loggad (BESLUT §2: "BYGG NU",
 * viktprofil-kopplingen är AVSLAGEN till vidare, §9.1). Regimen väljer
 * ALDRIG profil, ändrar ALDRIG poäng och ger ALDRIG handelssignaler
 * (FORBUD §10.8): den beskriver UNDERLAGET per `senastKontrollerad`,
 * aldrig "marknaden just nu" (lagen 2007:528).
 *
 * INDIKATORER (r2 §2.1 — allt ur existerande motorer, ingen ny datakälla):
 *   G  grönandel      ur raknaForskningslage (andelGrona, 100 rader)
 *   R  rödandel       ur raknaForskningslage (andelRoda)
 *   N  netto-vågbredd (impulsvåg − korrigering)/(impulsvåg + korrigering +
 *                     basbygge) ur senaste vagscan-event — OSATT tills ≥ 30
 *                     mätta vågbolag (idag 12; BESLUT §8/§9.1 ⇒ expansiv/
 *                     korrigering är onåbara 2026.09 — regimen är G/R-only)
 *   Σu universumets årsvolatilitet (vagkon) — gate: > 25 % ⇒ regimebyte
 *                     kräver 3 snapshots i stället för 2
 *
 * TRÖSKLAR (r2 §2.2): G/R ÅTERANVÄNDER forskningslaget.ts:s kanoniska tal
 * (0,10/0,08/0,35 + 0,30) — EN källa till sanning, inga nya magiska tal;
 * N/Σu får nya, dokumenterade tal. Hysteres: in-/utträdeströsklar är
 * ÅTSKILDA (magert-bandet 0,08–0,10 / 0,30–0,35) OCH varje byte kräver
 * 2 konsekutiva snapshots (3 vid års-Σu > 25 %) — dagens G=0,07 sitter
 * en bolagspoäng från 0,08-tröskeln, utan hysteres vippar regimen (r2
 * §4.2 risk 1). KADENS: kvartal — snapshot-identiteten är korstabellens
 * `senastKontrollerad`; dagar räknas ALDRIG som observationer (FORBUD
 * §10.7:s princip), samma datum = fryst tillstånd.
 *
 * ETIKETTER (koordinatorns typkontrakt för 2026.09, fem värden):
 * balanserad | expansiv | magert | korrigering | osatt. r2 §2.2:s
 * sammansatta fall "magert-korrigering" är onåbart medan N=osatt och
 * ingår INTE i 2026.09:s union — vid N mätt + båda villkoren beskrivs
 * läget som "korrigering" med G/R-värdena redovisade öppet i
 * indikatorerna (dokumenterad tolkning; ev. utökning kräver nytt beslut).
 *
 * LOGGEN: data/portfolj-system/regime-logg.json — append-only +
 * hash-kedjad exakt som prediktionsloggen (sha256(prev + "\n" +
 * kanonisk rad-utan-hash), injicerad sha256 — klientsäkert lib).
 * Cronen (vagvalidering) appendar vid REGLERAD förändring: genesis,
 * bekräftat byte eller kandidatrörelse (hysteresminnet bärs av loggen).
 *
 * DETERMINISM (P1): ren funktion — inga klockor, inget slump, inget nät,
 * inget fs. Samma indikatorer + samma förra rad ⇒ bitidentiskt resultat
 * (test vaktar). Pedagogisk forskning — ALDRIG investeringsråd.
 */

import {
  TROSKEL_RIKT_ANDEL_GRONA,
  TROSKEL_RIKT_ANDEL_RODA,
  TROSKEL_MAGERT_ANDEL_GRONA,
  TROSKEL_MAGERT_ANDEL_RODA,
} from "../forskningslaget";

// ── Typer (JSON-nycklar utan åäö) ────────────────────────────────────────────

/** Regimetiketterna — fem värden i AKM3.2026.09 (se filhuvudets etikettnot). */
export type RegimeTyp = "balanserad" | "expansiv" | "magert" | "korrigering" | "osatt";

/** r2:s fyra indikatorer — null = osatt (P3: modellen gissar aldrig). */
export type RegimeIndikatorer = {
  /** G — andel gröna av korstabellens rader, 0–1. */
  gronAndel: number | null;
  /** R — andel röda (port-brott/underperformers), 0–1. */
  rodAndel: number | null;
  /** N — netto fundamental vågbredd, −1…+1; null = osatt (n-vakt/oläsbar scan). */
  nettoVagbredd: number | null;
  /** Σu — universumets års-volatilitet (0–1); null = osatt ⇒ standard 2 snapshots. */
  sigmaArs: number | null;
  /** Antal MÄTTA vågbolag bakom N (vagscans fel-fria tickers). */
  antalVagbolag: number | null;
};

/**
 * Indata till raknaRegime — koordinatorns signatur: gronAndel + rodAndel
 * obligatoriska, nettoVagbredd valfri (osatt-degradering); övriga fält
 * additiva för n-vakten, Σu-gaten och dateringen.
 */
export type RegimeIndata = {
  gronAndel: number | null;
  rodAndel: number | null;
  nettoVagbredd?: number | null;
  antalVagbolag?: number | null;
  sigmaArs?: number | null;
  /** Datering — korstabellens senastKontrollerad ("YYYY-MM-DD"); "" = okänd. */
  senastKontrollerad?: string;
};

/** Öppna trösklar — redovisas på /transparens och i API-svaret (r2 §3.3.5). */
export type RegimeTrosklar = {
  /** G ≥ 0,10 — expansiv inträde OCH magert utträde (G-sidan). */
  gronIntrade: number;
  /** G < 0,08 — magert inträde (strikt under). */
  gronUttrade: number;
  /** R > 0,35 — magert inträde (strikt över). */
  rodIntrade: number;
  /** R ≤ 0,30 — magert utträde. */
  rodUttrade: number;
  /** N ≥ +0,20 — expansiv inträde (kräver N mätt). */
  expansivNIntrade: number;
  /** N < +0,10 — expansiv utträde. */
  expansivNUttrade: number;
  /** N ≤ −0,20 — korrigering inträde (kräver N mätt). */
  korrigeringIntrade: number;
  /** N ≥ −0,10 — korrigering utträde. */
  korrigeringUttrade: number;
  /** N gäller först vid ≥ 30 mätta vågbolag — annars N = osatt (BESLUT §8). */
  minVagbolagForN: number;
  /** Års-Σu > 0,25 ⇒ 3 bekräftelse-snapshots i stället för 2 (r2 §2.2). */
  sigmaArsGate: number;
  snapshotsNormal: number;
  snapshotsHogVol: number;
};

/** Hysteresminnet — en påbörjad (ännu obekräftad) regimen med antal snapshots. */
export type RegimeKandidat = {
  regime: RegimeTyp;
  /** Antal på varandra följande snapshots där målet stått still (≥ 1). */
  snapshots: number;
};

/** raknaRegime:s svar — allt kortet/API:t/transparensen behöver. */
export type RegimeResult = {
  regime: RegimeTyp;
  indikatorer: RegimeIndikatorer;
  /** De öppna trösklarna (r2 §3.3.5 — alltid synliga, aldrig dolda tal). */
  trosklar: RegimeTrosklar;
  /** "Läget i underlaget per X" — aldrig "marknaden just nu". */
  senastKontrollerad: string;
  /** Kännetecknande, beskrivande text (r2 §2.2) — inga signalverb. */
  beskrivning: string;
  /** true när regimen byttes I DENNA beräkning (reglerad förändring). */
  byte: boolean;
  /** Pågående hysteres-kandidat (minnet efter denna beräkning). */
  kandidat: RegimeKandidat | null;
  /** Antal bekräftelse-snapshots som gällde: 2, alt 3 vid års-Σu > 25 %. */
  kravdaSnapshots: number;
  /** true när indatat är en NY snapshot (nytt senastKontrollerad-datum). */
  nySnapshot: boolean;
  /** Varför N är osatt ("" när N är mätt) — ärlighetsfältet. */
  nOsattOrsak: string;
};

/** En rad i regime-loggen (append-only, hash-kedjad — prediktionsmönstret). */
export type RegimeLoggRad = {
  /** Snapshotens datering — korstabellens senastKontrollerad. */
  datum: string;
  /** "akm3-regim" — loggens spårnamn. */
  spar: "akm3-regim";
  modellVersion: string;
  indikatorer: RegimeIndikatorer;
  regime: RegimeTyp;
  /** Bekräftat byte i denna rad? (genesis-raden har byte: true) */
  byte: boolean;
  /** Hysteresminnet efter denna rad. */
  kandidat: RegimeKandidat | null;
  kravdaSnapshots: number;
  beskrivning: string;
  nOsattOrsak: string;
  /** sha-256 över prev-hash + kanonisk rad — tamper-vakten. */
  hash?: string;
};

/** Loggfilens form (append-only; senasteHash = sista radens hash). */
export type RegimeLogg = {
  modellVersion: string;
  skapad?: string;
  rader: RegimeLoggRad[];
  senasteHash?: string;
};

// ── Konstanter ────────────────────────────────────────────────────────────────

/** Semantisk modellversion — låst för hela 2026.09 (BESLUT §0/§4). */
export const REGIM_MODELL_VERSION = "AKM3.2026.09";

/**
 * De öppna trösklarna (r2 §2.2). G/R-talen ÅTERANVÄNDER forskningslaget.ts:s
 * kanoniska konstanter — en källa till sanning; N/Σu är nya dokumenterade tal.
 */
export const REGIME_TROSKLAR: RegimeTrosklar = {
  gronIntrade: TROSKEL_RIKT_ANDEL_GRONA,      // 0,10
  gronUttrade: TROSKEL_MAGERT_ANDEL_GRONA,    // 0,08
  rodIntrade: TROSKEL_MAGERT_ANDEL_RODA,      // 0,35
  rodUttrade: TROSKEL_RIKT_ANDEL_RODA,        // 0,30
  expansivNIntrade: 0.2,
  expansivNUttrade: 0.1,
  korrigeringIntrade: -0.2,
  korrigeringUttrade: -0.1,
  minVagbolagForN: 30,
  sigmaArsGate: 0.25,
  snapshotsNormal: 2,
  snapshotsHogVol: 3,
};

/** Genesis-värdet för loggens hash-kedja (dokumenterat — rad 1 hashas mot detta). */
export const REGIMELOGG_GENESIS = "akm3-regime-logg-genesis-v1";

// ── Sanering (ren — null är standardutdata, aldrig gissning) ─────────────────

function lasTal(x: unknown, min: number, max: number): number | null {
  if (typeof x !== "number" || !Number.isFinite(x)) return null;
  return x >= min && x <= max ? x : null;
}

function lasHeltal(x: unknown, min: number): number | null {
  if (typeof x !== "number" || !Number.isFinite(x)) return null;
  return Number.isInteger(x) && x >= min ? x : null;
}

function arDag(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

// ── Kärnlogik (rena funktioner) ───────────────────────────────────────────────

/**
 * Inträdesbedömning "med friska ögon" — vad regimen vore UTAN minne.
 * N-baserade etiketter (expansiv/korrigering) kräver MÄTT N (≥ 30 vågbolag):
 * N=osatt ⇒ de är onåbara och regimen degraderar ärligt till G/R-only
 * (BESLUT §9.1 — så ser 2026.09 ut: 12 mätta bolag).
 */
function intradesBedomning(ind: RegimeIndikatorer): RegimeTyp {
  if (ind.gronAndel === null || ind.rodAndel === null) return "osatt";
  const T = REGIME_TROSKLAR;
  if (ind.nettoVagbredd !== null) {
    if (ind.nettoVagbredd <= T.korrigeringIntrade) return "korrigering";
    if (ind.gronAndel >= T.gronIntrade && ind.nettoVagbredd >= T.expansivNIntrade) {
      return "expansiv";
    }
  }
  if (ind.gronAndel < T.gronUttrade || ind.rodAndel > T.rodIntrade) return "magert";
  return "balanserad";
}

/**
 * Hysteretiskt mål: vad SNAPSHOTEN pekar mot givet den sittande regimen.
 * Utträdeströsklarna ligger LÅNGT från inträdes — bandet mellan dem är
 * regimens hemvist (G 0,09 varken inträder magert eller lämnar det).
 * N-baserade regimer lämnas också när N degraderar till osatt: utan mätt
 * vågbredd kan "expansiv"/"korrigering" inte beskrivas (P2-arvet).
 */
function malRegime(ind: RegimeIndikatorer, sittande: RegimeTyp): RegimeTyp {
  const T = REGIME_TROSKLAR;
  if (sittande === "magert") {
    if (ind.gronAndel === null || ind.rodAndel === null) return intradesBedomning(ind);
    if (ind.gronAndel >= T.gronIntrade && ind.rodAndel <= T.rodUttrade) {
      return intradesBedomning(ind);
    }
    return "magert"; // inom bandet (t.ex. G 0,07↔0,09) — stå kvar
  }
  if (sittande === "expansiv") {
    const ut =
      ind.gronAndel === null ||
      ind.gronAndel < T.gronIntrade ||
      ind.nettoVagbredd === null ||
      ind.nettoVagbredd < T.expansivNUttrade;
    return ut ? intradesBedomning(ind) : "expansiv";
  }
  if (sittande === "korrigering") {
    const ut = ind.nettoVagbredd === null || ind.nettoVagbredd >= T.korrigeringUttrade;
    return ut ? intradesBedomning(ind) : "korrigering";
  }
  return intradesBedomning(ind); // balanserad/osatt: ingen hysteres att respektera
}

/** Kännetecknande text per regim (r2 §2.2) — beskriver, dömer aldrig. */
function beskrivRegime(regime: RegimeTyp, nOsattOrsak: string): string {
  const grund: Record<RegimeTyp, string> = {
    balanserad: "Forskningstätheten är mittemellan — underlaget beskrivs som balanserat.",
    expansiv: "Många bolag klarar de strikta kraven och fundamentala impulsvågor dominerar.",
    magert: "Få bolag klarar de strikta kraven — selektionen bär helheten.",
    korrigering: "Korrigeringar dominerar de fundamentala vågorna — multiplerna rör sig nedåt.",
    osatt: "Underlaget räcker inte till en regimbeskrivning — modellen tiger hellre än gissar.",
  };
  const not = nOsattOrsak
    ? ` Netto-vågbredden är osatt (${nOsattOrsak}) — beskrivningen vilar enbart på forskningslägets grön-/rödandel.`
    : "";
  return grund[regime] + not;
}

/**
 * RÄKNA REGIMEN (ren funktion — testbar, P1).
 *
 * raknaRegime({ gronAndel, rodAndel, nettoVagbredd? }) räknar dagens
 * regimläge; `tidigare` är senaste loggade rad (hysteresens minne) —
 * utelämnas den klassas snapshoten som genesis (första mätningen sätter
 * regimen direkt; BESLUT §8: 2026-09-03 G=0,07 R=0,17 ⇒ "magert").
 *
 * Tillståndsregler:
 *   - samma/äldre senastKontrollerad än förra raden ⇒ FRYST tillstånd
 *     (dagar räknas aldrig som observationer — kvartalskadens);
 *   - ny snapshot ⇒ hysteretiskt mål; målet ≠ sittande regime startar/
 *     avancerar kandidaten; först efter `kravdaSnapshots` (2, alt 3 vid
 *     års-Σu > 25 %) på varandra följande snapshots sker det reglerade
 *     bytet; målet tillbaka på sittande ⇒ kandidaten nollställs.
 */
export function raknaRegime(nu: RegimeIndata, tidigare?: RegimeLoggRad | null): RegimeResult {
  const T = REGIME_TROSKLAR;

  // Sanera indikatorerna — null är standardutdata (P3), aldrig gissning.
  const gronAndel = lasTal(nu?.gronAndel, 0, 1);
  const rodAndel = lasTal(nu?.rodAndel, 0, 1);
  const antalVagbolag = lasHeltal(nu?.antalVagbolag, 0);
  const nettoRå = lasTal(nu?.nettoVagbredd, -1, 1);
  const sigmaArs = lasTal(nu?.sigmaArs, 0, 10);

  // N-vakten (BESLUT §8): N gäller först vid ≥ 30 mätta vågbolag.
  let nettoVagbredd: number | null = null;
  let nOsattOrsak = "";
  if (nettoRå === null) {
    nOsattOrsak = "senaste vagscan-event ej läsbart";
  } else if (antalVagbolag === null) {
    nOsattOrsak = "antal mätta vågbolag okänt";
  } else if (antalVagbolag < T.minVagbolagForN) {
    nOsattOrsak = String(antalVagbolag) + " mätta vågbolag < " + String(T.minVagbolagForN) + " (n-vakten)";
  } else {
    nettoVagbredd = nettoRå;
  }

  const indikatorer: RegimeIndikatorer = {
    gronAndel,
    rodAndel,
    nettoVagbredd,
    sigmaArs,
    antalVagbolag,
  };
  const kravdaSnapshots =
    sigmaArs !== null && sigmaArs > T.sigmaArsGate ? T.snapshotsHogVol : T.snapshotsNormal;
  const senastKontrollerad = arDag(nu?.senastKontrollerad) ? (nu?.senastKontrollerad as string) : "";

  // Σu-gaten redovisas alltid med sina öppna tal i trosklar-fältet.

  // Genesis: ingen historia — första snapshoten sätter regimen direkt.
  if (!tidigare || !arDag(tidigare?.datum)) {
    const regime = intradesBedomning(indikatorer);
    return {
      regime,
      indikatorer,
      trosklar: { ...T },
      senastKontrollerad,
      beskrivning: beskrivRegime(regime, nOsattOrsak),
      byte: true,
      kandidat: null,
      kravdaSnapshots,
      nySnapshot: true,
      nOsattOrsak,
    };
  }

  // Samma eller äldre snapshot ⇒ fryst tillstånd (idempotent per snapshot).
  if (!(senastKontrollerad > tidigare.datum)) {
    return {
      regime: tidigare.regime,
      indikatorer,
      trosklar: { ...T },
      senastKontrollerad,
      beskrivning: beskrivRegime(tidigare.regime, nOsattOrsak),
      byte: false,
      kandidat: tidigare.kandidat ?? null,
      kravdaSnapshots,
      nySnapshot: false,
      nOsattOrsak,
    };
  }

  // Ny snapshot: hysteretiskt mål + kandidatlogik (2/3-snapshots-bekräftelse).
  const sittande = tidigare.regime;
  const mal = malRegime(indikatorer, sittande);
  let regime = sittande;
  let byte = false;
  let kandidat: RegimeKandidat | null = null;
  if (mal === sittande) {
    kandidat = null; // målet bekräfter sittande — eventuell kandidat dör
  } else {
    const fk = tidigare.kandidat ?? null;
    if (fk && fk.regime === mal) {
      const antal = fk.snapshots + 1;
      if (antal >= kravdaSnapshots) {
        regime = mal; // REGLERAT BYTE — bekräftat efter kravda snapshots
        byte = true;
        kandidat = null;
      } else {
        kandidat = { regime: mal, snapshots: antal };
      }
    } else {
      kandidat = { regime: mal, snapshots: 1 };
    }
  }

  return {
    regime,
    indikatorer,
    trosklar: { ...T },
    senastKontrollerad,
    beskrivning: beskrivRegime(regime, nOsattOrsak),
    byte,
    kandidat,
    kravdaSnapshots,
    nySnapshot: true,
    nOsattOrsak,
  };
}

// ── Loggrad + hash-kedja (append-only — prediktionsloggens mönster) ──────────

/** sha-256 som injiceras av anroparen (hex-sträng, lowercase). */
export type Sha256Funktion = (text: string) => string;

/** Kanonisk JSON för en loggrad: exakt fältparamgång, utan hash-fältet. */
export function kanoniskRegimeJSON(rad: RegimeLoggRad): string {
  const { hash: _hash, ...utan } = rad ?? ({} as RegimeLoggRad);
  return JSON.stringify(utan);
}

/**
 * Bygg EN loggrad ur ett resultat (ren funktion — inga klockor). Null när
 * underlaget saknas (ogiltig datering eller G/R osatt): loggen gissar
 * aldrig, den tiger tills en mätning finns att döma.
 */
export function byggRegimeLoggrad(resultat: RegimeResult): RegimeLoggRad | null {
  if (!arDag(resultat?.senastKontrollerad)) return null;
  if (resultat.indikatorer.gronAndel === null || resultat.indikatorer.rodAndel === null) return null;
  return {
    datum: resultat.senastKontrollerad,
    spar: "akm3-regim",
    modellVersion: REGIM_MODELL_VERSION,
    indikatorer: resultat.indikatorer,
    regime: resultat.regime,
    byte: resultat.byte,
    kandidat: resultat.kandidat,
    kravdaSnapshots: resultat.kravdaSnapshots,
    beskrivning: resultat.beskrivning,
    nOsattOrsak: resultat.nOsattOrsak,
  };
}

/** Kedjeregel: sha256(prevHash + "\n" + kanoniskJSON(rad-utan-hash)). */
export function raknaRegimehash(rad: RegimeLoggRad, prevHash: string, sha256: Sha256Funktion): string {
  return sha256(`${prevHash}\n${kanoniskRegimeJSON(rad)}`);
}

/** Stämpla en rad med sin hash (ren — returnerar NY rad, lämnar indata orörd). */
export function stemplaRegimeRad(
  rad: RegimeLoggRad,
  prevHash: string,
  sha256: Sha256Funktion,
): RegimeLoggRad {
  return { ...rad, hash: raknaRegimehash(rad, prevHash, sha256) };
}

/**
 * Verifiera hela kedjan (ren funktion): true om och endast om varje rads
 * hash stämmer mot sin prev-hash OCH kedjan hänger ihop i ordning. Tom
 * kedja är giltig; null/ickerad är ogiltig. Cronen verifierar Före varje
 * append — en bruten kedja lämnas ORÖRD och rapporteras öppet (FORBUD
 * §10.10: aldrig tyst överskrivning av en manipulerad evidens).
 */
export function verifieraRegimekedja(
  rader: readonly RegimeLoggRad[] | null | undefined,
  sha256: Sha256Funktion,
): boolean {
  if (!Array.isArray(rader)) return false;
  let prev = REGIMELOGG_GENESIS;
  for (const r of rader) {
    if (!r || typeof r !== "object" || typeof r.hash !== "string") return false;
    if (raknaRegimehash(r, prev, sha256) !== r.hash) return false;
    prev = r.hash;
  }
  return true;
}
