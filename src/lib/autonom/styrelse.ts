/**
 * AI-organ Styrelsen — autonom beslutsmotor för utvecklingsprioritering.
 *
 * Bounded-design (samma principer som organ-motorn):
 * - Tillståndslös: varje körning räknar från grunden
 * - Deterministisk: poängsätter kända utvecklingsobjekt mot mätbara kriterier
 * - Bounded: loggar högst ETT beslutsprotokoll per körning till system_events
 *   (retention-organet städar gamla poster — max 500 rader totalt)
 *
 * Styrelsen värderar varje kandidat mot: strategisk vikt (100x-planen),
 * kundnytta, ansträngning och nuvarande läge (datastyrda signaler som
 * "bloggfärskhet", "kursdjup", "medlemsantal").
 */

import type { OrganReport } from "./organ";
import { PRISER, kr } from "@/lib/variabler";

export type Beslut = {
  titel: string;
  score: number;
  motiv: string;
  insats: "LÅG" | "MEDEL" | "HÖG";
  kundnytta: 1 | 2 | 3 | 4 | 5;
  planRef: string;
};

export type StyrelseProtokoll = {
  timestamp: string;
  mandat: string;
  beslut: Beslut[];
  avslaget: Beslut[];
  protokoll_id: string;
};

type Signal = {
  bloggAntal: number;
  bloggDagarSedan: number;
  grundaKurser: number;
  medlemmar: number | null;
  analyser: number;
  fas2Sida: boolean;
  kalkylator: boolean;
};

const KANDIDATER: Array<{
  titel: string;
  vikt: number;
  insats: Beslut["insats"];
  kundnytta: Beslut["kundnytta"];
  planRef: string;
  villkor?: (s: Signal) => number; // 0–1 boost beroende på läget
  motiv: string;
}> = [
  {
    titel: "Fas 2-ansökningsflöde: bokningsmöte med grundaren",
    vikt: 10,
    insats: "MEDEL",
    kundnytta: 4,
    planRef: "100x-planen §3 + Fas 2-modellen",
    villkor: (s) => (s.fas2Sida ? 0.5 : 1),
    motiv: "Nya Fas 2-modellen kräver ansökan + möte — flödet saknas än (portalen länkar dit men bokning är manuell). Intäktsväg #1.",
  },
  {
    titel: `Fas 3 representeras (${kr(PRISER.fas3EnGang)} kr) — innehåll + sida`,
    vikt: 7,
    insats: "MEDEL",
    kundnytta: 3,
    planRef: "100x-planen §6.3",
    villkor: (s) => (s.fas2Sida ? 0.8 : 0.3),
    motiv: "Fas 3 är teaser idag. Kräver produktbeslut från grundaren — styrelsen flaggar, genomförande väntar manus.",
  },
  {
    titel: "Nya aktieanalyser ( mål: 10 bolag )",
    vikt: 9,
    insats: "HÖG",
    kundnytta: 5,
    planRef: "§1.2 'svensk aktieanalys' landningssida",
    villkor: (s) => Math.min(1, (10 - s.analyser) / 8 + 0.3),
    motiv: `Endast ${2} analyser publicerade — landningssidan för 'svensk aktieanalys' behöver volym (mål ≥5-7) för att ranka.`,
  },
  {
    titel: "Blogg: håll publiceringstakten (3-4/vecka)",
    vikt: 8,
    insats: "LÅG",
    kundnytta: 4,
    planRef: "§4.2 cadence",
    villkor: (s) => Math.min(1, s.bloggDagarSedan / 7),
    motiv: "SEO-motorn drivs av färskhet. Pelare 3 (V-serien) klar; marknadskommentarer + pelare 4 återstår.",
  },
  {
    titel: "Kvartalsrapports-checklista som interaktiv guide",
    vikt: 6,
    insats: "LÅG",
    kundnytta: 5,
    planRef: "§8.3 interaktiva verktyg",
    villkor: (s) => (s.kalkylator ? 0.7 : 0),
    motiv: "Kalkylator v2 finns — nästa steg i 'hjälp människor'-kedjan är steg-för-steg-q-guiden per rapport.",
  },
  {
    titel: "Admin: Bokningar-flik (kalender + bekräfta/avboka)",
    vikt: 6,
    insats: "MEDEL",
    kundnytta: 3,
    planRef: "§5.2 flik 10",
    motiv: "Medlemmar (boka möte) kräver hanteringsyta. API:t finns — fliken saknas.",
  },
  {
    titel: "Admin: E-postkampanjer (nurture-sekvens Fas 1)",
    vikt: 5,
    insats: "HÖG",
    kundnytta: 3,
    planRef: "§3.4 e-post nurture",
    villkor: (s) => (s.medlemmar != null && s.medlemmar > 10 ? 1 : 0.3),
    motiv: "Nurture-flödet (dag 0/2/4/7/10) behöver e-postinfrastruktur — vänta på SMTP-nyckel från grundaren.",
  },
  {
    titel: "CDO-organet: utöka datakällor (fundamentaldel via Yahoo quote + MarketStack)",
    vikt: 9,
    insats: "MEDEL",
    kundnytta: 5,
    planRef: "Djupanalys v2 — 'siffror via flera oberoende källor'",
    motiv: "Motorn har pris/volym från Yahoo+MarketStack. Nästa kvalitetslyft: P/E, marginaler och nyckeltal per innehav i djupanalysen (Yahoo quote-meta + MarketStack fundamentals när tillgängligt) → viktad portfölj-P/E i rapporten.",
  },
  {
    titel: "Våg-självskattning per innehav (portföljsystemet v2)",
    vikt: 8,
    insats: "LÅG",
    kundnytta: 5,
    planRef: "§8.3 + portföljsystem",
    motiv: "Portföljsystemet finns — vågprofilen behöver medlemmens skattningar per innehav (mikro/kort/medel/lång) för att bli komplett pedagogiskt.",
  },
  {
    titel: "Front-sida på ak1nvestor.com (vision + Fas 2-ansökan)",
    vikt: 7,
    insats: "MEDEL",
    kundnytta: 4,
    planRef: "DOMANSTRATEGI.md steg 2",
    motiv: "Varumärkesdomänen är tom/parkerad — front som samlar vision, Fas 2-ansökan och 'boka möte' stärker både varumärke och konvertering.",
  },
  {
    titel: "PWA + offline-läge för kurser",
    vikt: 4,
    insats: "MEDEL",
    kundnytta: 3,
    planRef: "§8.4/8.6",
    motiv: "Läs kurser på tåget/flyget. Tekniskt oberoende av externa nycklar.",
  },
];

/** Räkna fram styrelsens prioritering. io-signaler samlas in av anroparen. */
export function fattaBeslut(signal: Signal): StyrelseProtokoll {
  const poangade = KANDIDATER.map((k) => {
    const lageBoost = k.villkor ? k.villkor(signal) : 0.5;
    // score = strategisk vikt (0-10) × kundnytta (1-5) × lägesboost (0-1), minus insatsstraff
    const insatsStraff = k.insats === "HÖG" ? 0.75 : k.insats === "MEDEL" ? 0.9 : 1;
    const score = Math.round(k.vikt * k.kundnytta * (0.4 + 0.6 * lageBoost) * insatsStraff * 10) / 10;
    return {
      titel: k.titel,
      score,
      motiv: k.motiv,
      insats: k.insats,
      kundnytta: k.kundnytta,
      planRef: k.planRef,
    } as Beslut;
  });

  const sorterade = [...poangade].sort((a, b) => b.score - a.score);
  const beslut = sorterade.slice(0, 3);
  const avslaget = sorterade.slice(3);

  return {
    timestamp: new Date().toISOString(),
    mandat: "Prioritera nästa utvecklingssprint enligt 100x-planen, kundnytta och nuvarande läge",
    beslut,
    avslaget,
    protokoll_id: `styrelse-${new Date().toISOString().slice(0, 10)}`,
  };
}

/** Extrahera signaler ur en organrapport (kördes precis) + externa counters. */
export function signalerFranRapport(
  report: OrganReport,
  extra: { medlemmar: number | null }
): Signal {
  const bloggAntal = Number(
    report.findings.find((f) => f.organ === "SEO" && f.message.includes("blogginlägg"))?.metric?.split(" ")[0] || 0
  );
  const bloggDagar = Number(
    (report.findings.find((f) => f.organ === "SEO" && f.message.includes("blogginlägg"))?.message.match(/senaste (\d+) dagar/) || [])[1] || 99
  );
  const grundaKurser = Number(
    report.findings.find((f) => f.organ === "Hälsa" && f.message.includes("kurser"))?.message.match(/(\d+) grunda/)?.[1] || 0
  );
  const analyser = Number(
    report.findings.find((f) => f.organ === "SEO" && f.message.includes("analyser"))?.message.match(/^(\d+) analyser/)?.[1] || 2
  );
  return {
    bloggAntal,
    bloggDagarSedan: bloggDagar,
    grundaKurser,
    medlemmar: extra.medlemmar,
    analyser,
    fas2Sida: true,
    kalkylator: true,
  };
}
