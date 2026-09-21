/**
 * DATASET-NYCKELTAL — rena räknare + payload-byggare för A2-datasetsidorna
 * (våg 87 bygg mot data/forskning/A2-DATASET-KONTRAKT.md).
 *
 * GRÄNSDRAGNING (kontraktet §1,draget vid poänglagen — inte branschnyckeln):
 *  - PUBLIKT: median P/E, EV/EBIT, P/B, ROE, EBIT-marginal PER BRANSCH med
 *    n-redovisning — aggregat av publikt källmaterial (Yahoo/MarketStack).
 *  - ALDRIG här: per-bolagsrader (ticker/namn i svaret), AKM1/AKM2-poäng,
 *    vågklasser, status, golvMarginal, portV19, ersättningsförslag — det är
 *    prenumerationsvärde (korstabellen) och får inte ens trianguleras.
 *
 * Allt är RENA FUNKTIONER (mönstret i vagvalidering.ts): inga imports av
 * fs/nätverk, inga Date/now i utdata-styrd logik — deterministiska och
 * testbara. Filen hålls dessutom erasable-TS (endast typannotationer) så att
 * verktyg/testa-dataset.mjs kan importera den direkt med Nodes typstrippning.
 */
import {
  TROSKEL_V2_BESLUTAD,
  TROSKEL_V2_ORSAK,
  VAGVALIDERING_SCHEMA,
  VAGVALIDERING_PROTOKOLL_VERSION,
  VALIDERING_HORIZONTER,
  VAGKLASSER_ALLA,
  traffProcent,
  antalDomda,
  type RullandeTillstand,
} from "./vagvalidering";

// ── Nyckeltalsmedianer (källa: data/portfolj-system/bolagsunivers.json) ──────

/** Strukturellt utsnitt av en bolagsrad — allt medianerna behöver, inget mer. */
export type UniversumRad = {
  bransch?: string | null;
  hamtat?: string | null;
  kallor?: Array<{ namn?: string | null } | null> | null;
  vardering?: {
    pe?: number | null;
    evEbit?: number | null;
    pb?: number | null;
  } | null;
  lonksamhet?: {
    roe?: number | null;
    ebitMarginal?: number | null;
  } | null;
};

/** En rad i nyckeltalsguiden — kontraktets schema §3.1 EXAKT (inga extra fält). */
export type NyckeltalsguideRad = {
  bransch: string;
  /** n = antal bolag med MÄTT P/E i branschen (ärlighetsprincipen — aldrig dolt). */
  n: number;
  medianPe: number | null;
  medianEvEbit: number | null;
  medianPb: number | null;
  /** ROE i PROCENT (rådata är andel, t.ex. 0,3262 → 32,6). */
  medianRoe: number | null;
  /** EBIT-marginal i PROCENT (rådata är andel). */
  medianEbitMarginal: number | null;
};

export type Nyckeltalsmedianer = {
  hamtat: string | null;
  kallorRadata: string[];
  totalt: { nBolag: number; nMedPe: number; medianPe: number | null };
  /** Sorterad efter högsta median P/E först (n syns alltid — tillväxt n=7 sorteras
   *  högt men redovisas med sitt ärliga n). */
  rader: NyckeltalsguideRad[];
};

/** Statistikmedian: udda antal → mittersta; jämnt → medel av de två mittersta.
 *  Null/undefined/NaN/±Infinity är SAKNAD data och exkluderas — aldrig som noll. */
export function median(varden: ReadonlyArray<number | null | undefined>): number | null {
  const rena = varden.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  if (rena.length === 0) return null;
  const s = [...rena].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Avrundning till 1 decimal (halva uppåt via Math.round — deterministisk). */
export function runda1(x: number): number {
  return Math.round(x * 10) / 10;
}

/** Andel (0–1) → procenttal med 1 decimal (ROE/marginal redovisas i procent). */
export function procent1(x: number): number {
  return runda1(x * 100);
}

/** Median per bransch ur universumsrader — P/E bär n-redovisningen. */
export function raknaNyckeltalsmedianer(rader: ReadonlyArray<UniversumRad>): Nyckeltalsmedianer {
  const perBransch = new Map<string, UniversumRad[]>();
  const kallor = new Set<string>();
  let hamtat: string | null = null;
  let nBolag = 0;

  for (const r of rader) {
    if (!r || typeof r !== "object") continue;
    const bransch = typeof r.bransch === "string" && r.bransch.trim() !== "" ? r.bransch : "osatt";
    if (!perBransch.has(bransch)) perBransch.set(bransch, []);
    perBransch.get(bransch)!.push(r);
    nBolag += 1;
    if (typeof r.hamtat === "string" && r.hamtat > (hamtat ?? "")) hamtat = r.hamtat;
    for (const k of Array.isArray(r.kallor) ? r.kallor : []) {
      if (k && typeof k.namn === "string" && k.namn.trim() !== "") kallor.add(k.namn);
    }
  }

  const ut: NyckeltalsguideRad[] = [];
  const allaPe: number[] = [];
  for (const [bransch, bolag] of perBransch) {
    const pe = bolag.map((b) => b.vardering?.pe ?? null);
    for (const v of pe) if (typeof v === "number" && Number.isFinite(v)) allaPe.push(v);
    const medianPe = median(pe);
    ut.push({
      bransch,
      n: pe.filter((v) => typeof v === "number" && Number.isFinite(v)).length,
      medianPe: medianPe !== null ? runda1(medianPe) : null,
      medianEvEbit: procentOrNull(median(bolag.map((b) => b.vardering?.evEbit ?? null))),
      medianPb: procentOrNull(median(bolag.map((b) => b.vardering?.pb ?? null))),
      medianRoe: procent1OchNull(median(bolag.map((b) => b.lonksamhet?.roe ?? null))),
      medianEbitMarginal: procent1OchNull(median(bolag.map((b) => b.lonksamhet?.ebitMarginal ?? null))),
    });
  }

  ut.sort((a, b) => {
    if (a.medianPe === null && b.medianPe === null) return a.bransch.localeCompare(b.bransch, "sv");
    if (a.medianPe === null) return 1;
    if (b.medianPe === null) return -1;
    return b.medianPe - a.medianPe || a.bransch.localeCompare(b.bransch, "sv");
  });

  const totalMedian = median(allaPe);
  return {
    hamtat,
    kallorRadata: [...kallor],
    totalt: {
      nBolag,
      nMedPe: allaPe.length,
      medianPe: totalMedian !== null ? runda1(totalMedian) : null,
    },
    rader: ut,
  };
}

/** Värden som redan är "multiplicer" (P/E, EV/EBIT, P/B) — 1 decimal, null är null. */
function procentOrNull(v: number | null): number | null {
  return v === null ? null : runda1(v);
}

/** Andel → procent (1 decimal) — null är null (osatt är information, inte fel). */
function procent1OchNull(v: number | null): number | null {
  return v === null ? null : procent1(v);
}

// ── Payload-byggare: kontraktets tre JSON-scheman (§3) ────────────────────────

/** /api/data/nyckeltalsguide-svar — schema §3.1 EXAKT. */
export function byggNyckeltalsguideSvar(m: Nyckeltalsmedianer, genereradIso: string) {
  return {
    schema: "ak1a-nyckeltalsguide/1",
    kalla: `AK1A Research Lab — ${m.totalt.nBolag}-bolagsuniversum (${m.rader.length} branscher)`,
    kallorRadata: m.kallorRadata,
    hamtat: m.hamtat,
    genererad: genereradIso,
    totalt: m.totalt,
    rader: m.rader,
    disclaimer: "Pedagogisk forskning — inte investeringsrådgivning enligt lagen (2007:528).",
    metodUrl: "/transparens",
  };
}

// ── Vågstatistik (källa: vagvalidering-spegeln / senaste rapport) ────────────

/** En cell i träfftabellen — procent + n; null = n=0 (aldrig påhittad siffra). */
export type VagCell = { horisont: string; klass: string; traffProcent: number | null; nDomda: number };

/** Normaliserad spegel av senaste vagvalideringsrond (JSON-filen cronen skriver;
 *  MD-parsern producerar samma form som last-resort-fallback). */
export type VagSpegel = {
  schema: string;
  genererad: string;
  domdatum: string | null;
  protokoll: { version: number; schema: string };
  universumAntal: number | null;
  rullandeSedan: string | null;
  totalt: { traffProcent: number | null; nDomda: number; osattAndelProcent: number | null };
  perHorisontKlass: VagCell[];
  domProtokollText: string | null;
  /** Fryst v1-snapshot när räknarna gått vidare till v2+ (annars null). */
  historikV1: {
    traffProcent: number;
    nDomda: number;
    osattAndelProcent: number | null;
    rullandeSedan: string | null;
    universumVagbolag: number | null;
  } | null;
};

export const VAG_HORIZONTER = ["mikro", "kort", "medellång", "lång", "mega"] as const;
export const VAG_KLASSER = ["impulsvåg", "korrigering", "basbygge", "osatt"] as const;

/** Motor-id → visningsnamn (medellang → medellång, lang → lång). */
const HZ_VISNING: Record<string, string> = {
  mikro: "mikro",
  kort: "kort",
  medellang: "medellång",
  lang: "lång",
  mega: "mega",
};

/**
 * Bygger JSON-spegeln (data/rapporter/vagvalidering-SENASTE.json) ur cronens
 * rullande tillstånd — kontrakt §3.2 källval (a). Ren funktion: samma
 * sammanställning → byte-identisk spegel. historikV1 lämnas null här; när
 * protokoll v2+ räknare växt fylls frysta v1-tal i stället av senaste v1-
 * rapport (dokumenterat i byggVagstatistikSvar).
 */
export function byggVagSpegelFranRullande(s: {
  genererad: string;
  datum: string;
  universum: readonly string[];
  rullande: RullandeTillstand;
  rullandeSedan: string | null;
}): VagSpegel {
  const celler: VagCell[] = [];
  let tTraff = 0;
  let tMiss = 0;
  let tOsatt = 0;
  for (const hz of VALIDERING_HORIZONTER) {
    for (const klass of VAGKLASSER_ALLA) {
      const r = s.rullande?.[hz]?.[klass];
      const traff = r && typeof r.traff === "number" ? Math.max(0, Math.floor(r.traff)) : 0;
      const miss = r && typeof r.miss === "number" ? Math.max(0, Math.floor(r.miss)) : 0;
      const osatt = r && typeof r.osatt === "number" ? Math.max(0, Math.floor(r.osatt)) : 0;
      tTraff += traff;
      tMiss += miss;
      tOsatt += osatt;
      celler.push({
        horisont: HZ_VISNING[hz] ?? hz,
        klass,
        traffProcent: traffProcent(r),
        nDomda: antalDomda(r),
      });
    }
  }
  return {
    schema: "ak1a-vagvalidering-spegel/1",
    genererad: s.genererad,
    domdatum: s.datum,
    protokoll: { version: VAGVALIDERING_PROTOKOLL_VERSION, schema: VAGVALIDERING_SCHEMA },
    universumAntal: Array.isArray(s.universum) ? s.universum.length : null,
    rullandeSedan: s.rullandeSedan ?? null,
    totalt: {
      traffProcent: tTraff + tMiss > 0 ? Math.round((100 * tTraff) / (tTraff + tMiss)) : null,
      nDomda: tTraff + tMiss,
      osattAndelProcent:
        tTraff + tMiss + tOsatt > 0 ? Math.round((100 * tOsatt) / (tTraff + tMiss + tOsatt)) : null,
    },
    perHorisontKlass: celler,
    domProtokollText: null,
    historikV1: null,
  };
}

/**
 * /api/data/vagstatistik-svar — schema §3.2 EXAKT, med VERSIONSVAKTEN:
 * senaste protokollets räknare + historiskt v1-tal märkt som historik.
 * Citatet "52 %" är giltigt endast med (n=48, v1)-stämpeln — när v2-räknare
 * växt visas protokollAktiv + rullandeV2 och v1 kvarstår som historikV1.
 */
export function byggVagstatistikSvar(s: VagSpegel, genereradIso: string) {
  const version = typeof s.protokoll?.version === "number" ? s.protokoll.version : 1;
  const senaste = {
    traffProcent: s.totalt.traffProcent,
    nDomda: s.totalt.nDomda,
    osattAndelProcent: s.totalt.osattAndelProcent,
    rullandeSedan: s.rullandeSedan,
    universumVagbolag: s.universumAntal,
  };
  const historikV1 = version === 1 ? senaste : (s.historikV1 ?? null);
  return {
    schema: "ak1a-vagstatistik/1",
    protokoll: {
      version,
      schema: s.protokoll?.schema ?? "vagvalidering/1",
      beslutad: version >= 2 ? TROSKEL_V2_BESLUTAD : null,
      nollstalldOrsak: version >= 2 ? TROSKEL_V2_ORSAK : null,
    },
    ...(version === 1 ? {} : { protokollAktiv: version, rullandeV2: senaste }),
    historikV1,
    perHorisontKlass: s.perHorisontKlass,
    genererad: genereradIso,
    disclaimer:
      "Öppet kvitto om det förflutnet — aldrig garanti om framtiden. Inte investeringsrådgivning (lagen 2007:528).",
    metodUrl: "/transparens",
  };
}

/**
 * Strikt parser av data/rapporter/vagvalidering-SENASTE.md (kontrakt §3.2
 * källval b — fallback när JSON-spegeln saknas). Rapporten har en
 * deterministisk generator (byggVagvalideringRapport) vilket gör parsern
 * möjlig; den täcker header, träfftabellen och totalraden. Misslyckas något
 * steg → null (ärligt tomt — aldrig påhittade tal).
 */
export function parseVagvalideringRapport(md: string): VagSpegel | null {
  try {
    const huvud = md.match(
      /\*\*Genererad:\*\*\s*([^·]+?)\s*·\s*\*\*Protokoll:\*\*\s*(\S+)\s+v(\d+)\s*·\s*\*\*Domdatum:\*\*\s*(\S+)/,
    );
    if (!huvud) return null;
    const universum = md.match(/\*\*Universum:\*\*\s*(\d+)\s*tickers/);
    const sedan = md.match(/\*\*Rullande räknare sedan:\*\*\s*(\S+)/);
    const protokollText = md.match(/^>\s\*\*Dom-protokoll[^:]*:\*\*\s*(.+)$/m);
    const total = md.match(
      /\*\*Totalt:\*\*\s*(?:(\d+)%\s*träff|—)\s*\(n=(\d+)\s*dömda(?:,\s*osatta\s*(\d+)%\s*av\s*alla\s*mätningar)?\)/,
    );

    const celler: VagCell[] = [];
    const cellRe = /\|\s*(mikro|kort|medellång|lång|mega)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g;
    let mm: RegExpExecArray | null;
    while ((mm = cellRe.exec(md)) !== null) {
      const [, horisont, ...cellTexter] = mm;
      VAG_KLASSER.forEach((klass, i) => {
        const c = cellTexter[i]?.match(/(?:^|\s)(?:(\d+)\s*%|—)\s*\(n=(\d+)\)/);
        if (!c) return;
        const n = Number(c[2]);
        celler.push({ horisont, klass, traffProcent: c[1] !== undefined ? Number(c[1]) : null, nDomda: n });
      });
    }
    if (celler.length === 0 || !total) return null;

    const nDomda = Number(total[2]);
    const osattPct = total[3] !== undefined ? Number(total[3]) : null;
    return {
      schema: "ak1a-vagvalidering-spegel/1",
      genererad: huvud[1].trim(),
      domdatum: huvud[4],
      protokoll: { version: Number(huvud[3]), schema: huvud[2] },
      universumAntal: universum ? Number(universum[1]) : null,
      rullandeSedan: sedan ? sedan[1] : null,
      totalt: {
        traffProcent: total[1] !== undefined ? Number(total[1]) : null,
        nDomda,
        osattAndelProcent: osattPct,
      },
      perHorisontKlass: celler,
      domProtokollText: protokollText ? protokollText[1].trim() : null,
      historikV1: null,
    };
  } catch {
    return null;
  }
}

// ── Utbildningsstatistik (källa: data/siffror.json — sajtens guldkälla) ──────

/** /api/data/utbildningsstatistik-svar — schema §3.3: passthrough + omslag. */
export function byggUtbildningsstatistikSvar(
  siffror: {
    kurser: number;
    bokmaster: number;
    quiz: number;
    quizXp: number;
    kanonBocker: number;
    kanonSomKurs: number;
    fas2Kurser: number;
    fas3Kurser: number;
    uppdaterad?: string;
    _kalla?: string;
  },
  genereradIso: string,
) {
  return {
    schema: "ak1a-utbildningsstatistik/1",
    kurser: siffror.kurser,
    quiz: siffror.quiz,
    quizXp: siffror.quizXp,
    bokmaster: siffror.bokmaster,
    kanonBocker: siffror.kanonBocker,
    kanonSomKurs: siffror.kanonSomKurs,
    fas2Kurser: siffror.fas2Kurser,
    fas3Kurser: siffror.fas3Kurser,
    uppdaterad: siffror.uppdaterad ?? null,
    genererad: genereradIso,
    kalla:
      siffror._kalla ??
      "public/deep-courses.json + data/bokkanon.json + src/lib/kurs-access.ts — genererad av verktyg/rakna-siffror.mjs",
    disclaimer: "Pedagogisk utbildningsstatistik — inte investeringsrådgivning (lagen 2007:528).",
    metodUrl: "/transparens",
  };
}
