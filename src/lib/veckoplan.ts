/**
 * VECKOPLANEN — super dynamiskt studieschema som anpassar sig varje vecka.
 *
 * Deterministisk och datum-baserad: veckonumret hashas till en "vecka-signatur"
 * som varierar texter och dag-layout vecka för vecka, medan innehållet styrs av
 * elevens egna lokaldata (XP, klara kurser, navigationsminnet). Klient-logik —
 * på servern (SSR) är localStorage tom och planen fallbackar mjukt.
 *
 * Ton: alltid uppmuntrande — "Veckans resa", aldrig "du ligger efter".
 */
import { lasKlaraKurser, lasXP } from "./member-local";
import { besok } from "./navigationsminne";

export type PlanRad = {
  dag: string;
  aktivitet: string;
  minut: number;
  typ: "kurs" | "pass" | "rep" | "analys";
  lank: string;
  klar?: boolean;
};

/** localStorage-nyckel: { [veckonummer]: number[] } — kryssade rader per vecka. */
export const VECKOPLAN_NYCKEL = "ak1a-veckoplan-v1";

const DAGAR = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

/** Nivå 1-grunderna: V01–V20 ur deep-courses.json (slug + titel). */
const V_KURSER: { slug: string; titel: string }[] = [
  { slug: "v01-forsaljningstillvaxt", titel: "Försäljningstillväxt" }, // slug exakt som i deep-courses.json
  { slug: "v02-arr-tillvaxt", titel: "ARR-tillväxt (återkommande intäkter)" },
  { slug: "v03-intaktsdiversifiering", titel: "Intäktsdiversifiering" },
  { slug: "v04-ps", titel: "P/S (Price-to-Sales)" },
  { slug: "v05-pb", titel: "P/B (Price-to-Book)" },
  { slug: "v06-ev-ebitda", titel: "EV/EBITDA" },
  { slug: "v07-bruttomarginal", titel: "Bruttomarginal" },
  { slug: "v08-ebitda-marginal", titel: "EBITDA-marginal" },
  { slug: "v09-roe", titel: "ROE (Return on Equity)" },
  { slug: "v10-skuldsattningsgrad", titel: "Skuldsättningsgrad" },
  { slug: "v11-likviditet", titel: "Likviditet (Kvick)" },
  { slug: "v12-intaktsstabilitet", titel: "Intäktsstabilitet" },
  { slug: "v13-patent-ip", titel: "Patent & Immateriella rättigheter" },
  { slug: "v14-varumarke", titel: "Varumärke & Kundlojalitet" },
  { slug: "v15-natverkseffekter", titel: "Nätverkseffekter" },
  { slug: "v16-produktlanseringar", titel: "Produktlanseringar" },
  { slug: "v17-avtal-partnerskap", titel: "Avtal & Partnerskap" },
  { slug: "v18-regulatoriska", titel: "Regulatoriska katalysatorer" },
  { slug: "v19-kapitalforbranning", titel: "Kapitalförbränning & Emission-risk" },
  { slug: "v20-aterekop-egna-aktier", titel: "Återköp av egna aktier" },
];

// ── Tid och veckorum ────────────────────────────────────────────────────────

/** ISO-veckonummer (måndag = veckans start). */
export function veckoNummer(d: Date = new Date()): number {
  const datum = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dagNr = datum.getUTCDay() || 7; // måndag 1 … söndag 7
  datum.setUTCDate(datum.getUTCDate() + 4 - dagNr); // torsdag definierar veckan
  const arsStart = new Date(Date.UTC(datum.getUTCFullYear(), 0, 1));
  return Math.ceil(((datum.getTime() - arsStart.getTime()) / 86400000 + 1) / 7);
}

/** Deterministisk hash av veckonumret — veckans signatur (väljer variation). */
function veckoHash(vn: number): number {
  let h = Math.imul(vn + 0x5bd1e995, 0x27d4eb2f);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return h >>> 0;
}

// ── Klar-markering (per veckonummer) ────────────────────────────────────────

type KlarKarta = Record<string, number[]>;

function lasKarta(): KlarKarta {
  if (typeof window === "undefined") return {};
  try {
    const rå = window.localStorage.getItem(VECKOPLAN_NYCKEL);
    const karta = rå ? (JSON.parse(rå) as KlarKarta) : {};
    return karta && typeof karta === "object" ? karta : {};
  } catch {
    return {};
  }
}

function sparaKarta(karta: KlarKarta) {
  try {
    // Behåll bara aktuell + de 3 senaste veckorna — lokaldata växer aldrig okontrollerat
    const nu = veckoNummer();
    for (const nyckel of Object.keys(karta)) {
      if (!/^\d+$/.test(nyckel) || Number(nyckel) < nu - 3) delete karta[nyckel];
    }
    window.localStorage.setItem(VECKOPLAN_NYCKEL, JSON.stringify(karta));
  } catch {
    /* privat läge etc. */
  }
}

/** Kryssade radindex för aktuell (eller given) vecka. */
export function lasKlara(veckonr: number = veckoNummer()): number[] {
  const lista = lasKarta()[String(veckonr)];
  return Array.isArray(lista) ? lista : [];
}

/** Kryssa på/av rad `dagIndex` för aktuell vecka; returnerar nya klara-listan. */
export function markeraKlar(dagIndex: number): number[] {
  if (typeof window === "undefined" || dagIndex < 0) return lasKlara();
  const karta = lasKarta();
  const nyckel = String(veckoNummer());
  const nu = karta[nyckel] ?? [];
  karta[nyckel] = nu.includes(dagIndex)
    ? nu.filter((i) => i !== dagIndex)
    : [...nu, dagIndex].sort((a, b) => a - b);
  sparaKarta(karta);
  return karta[nyckel];
}

// ── Kursval ──────────────────────────────────────────────────────────────────

/** Senast besökta V-kurs i navigationsminnet (raw eller URL-kodad slug). */
function senasteVKursSlug(): string | null {
  for (const b of besok()) {
    if (!b.sida.startsWith("/kurser/")) continue;
    const rå = b.sida.slice("/kurser/".length).split(/[?#]/)[0];
    const kandidater = [rå];
    try {
      const avkodad = decodeURIComponent(rå);
      if (avkodad !== rå) kandidater.push(avkodad);
    } catch {
      /* ogiltig kodning — råslugen räcker */
    }
    const traff = V_KURSER.find((k) => kandidater.includes(k.slug));
    if (traff) return traff.slug;
  }
  return null;
}

// ── Planmotor ────────────────────────────────────────────────────────────────

const PASS_TEXTER = [
  "Dagens pass — håll vanan levande",
  "Dagens pass — fem minuter som räknas",
  "Dagens pass — streaken tackar dig",
];
const KURS_PREFIX = ["Fördjupning: ", "Nästa steg: ", "Kurs: ", "Resan fortsätter: "];
const REP_TEXTER = [
  "Repetera flashcards — veckans guldkorn sätter sig",
  "Flashcards på Min Sida — minnet belönas",
  "Upprepa veckans kort — rep är resans hemliga vapen",
];

/**
 * Räkna ut veckans plan.
 *
 * - Tidsbudget: `tidPerVecka` eller XP-adapterad (1000+/200+ XP → 75/45, annars 25 min).
 * - Dagens Pass ALLTID måndag–fredag (5 min/dag = vanan).
 * - Resterande tid → 1–3 kurstillfällen (nästa oklara V-kurs i sekvens) + söndagsrepetition.
 */
export function raknaVeckoPlan(opts?: { tidPerVecka?: number }): PlanRad[] {
  const xp = lasXP();
  const budget = opts?.tidPerVecka ?? (xp > 1000 ? 75 : xp > 200 ? 45 : 25);
  const hash = veckoHash(veckoNummer());
  const klaraIndex = new Set(lasKlara());

  // En rad per dag, flera rader per dag är okej (pass + kurs samma dag).
  const raderPerDag: PlanRad[][] = DAGAR.map(() => []);

  // 1) Vanan först — Dagens Pass måndag→fredag, alltid.
  for (let i = 0; i < 5; i++) {
    raderPerDag[i].push({
      dag: DAGAR[i],
      aktivitet: PASS_TEXTER[(hash + i) % PASS_TEXTER.length],
      minut: 5,
      typ: "pass",
      lank: "/dagens-pass",
    });
  }

  // 2) Resterande tid → kurstillfällen + söndagsrepetition.
  const rest = Math.max(0, budget - 25);
  if (rest >= 15) {
    const antalKurs = rest >= 70 ? 3 : rest >= 40 ? 2 : 1;
    const repMin = rest >= 60 ? 10 : 5;
    const kursMin = Math.max(10, Math.floor((rest - repMin) / antalKurs));

    // Dag-layout för kurstillfällena (index: tis 1, ons 2, tor 3, lör 5) — hashen varierar.
    const layouter: Record<number, number[][]> = {
      1: [[1], [2], [3], [5]],
      2: [[1, 3], [1, 5], [2, 5], [3, 5]],
      3: [[1, 3, 5]],
    };
    const kurDagar = layouter[antalKurs][hash % layouter[antalKurs].length];

    const klara = new Set(lasKlaraKurser());
    let pool = V_KURSER.filter((k) => !klara.has(k.slug));
    let varvTva = false;
    if (pool.length === 0) {
      varvTva = true; // alla 20 klara → varv två: rotation + Superanalys
      const skift = hash % V_KURSER.length;
      pool = [...V_KURSER.slice(skift), ...V_KURSER.slice(0, skift)];
    } else {
      const prio = senasteVKursSlug();
      if (prio) {
        const i = pool.findIndex((k) => k.slug === prio);
        if (i > 0) pool = [pool[i], ...pool.filter((_, j) => j !== i)];
      }
    }

    kurDagar.forEach((dagIndex, nr) => {
      // Varv två och minst två block → sista blocket blir Superanalys (analys-typ)
      if (varvTva && nr === antalKurs - 1 && antalKurs >= 2) {
        raderPerDag[dagIndex].push({
          dag: DAGAR[dagIndex],
          aktivitet: "Superanalys på ett utvalt bolag — mästar-nivå",
          minut: kursMin,
          typ: "analys",
          lank: "/superanalys",
        });
        return;
      }
      const kurs = pool[nr % pool.length];
      raderPerDag[dagIndex].push({
        dag: DAGAR[dagIndex],
        aktivitet: `${KURS_PREFIX[(hash + nr) % KURS_PREFIX.length]}${kurs.titel}`,
        minut: kursMin,
        typ: "kurs",
        lank: `/kurser/${kurs.slug}`,
      });
    });

    // Söndag: repetitionsblock — flashcards via Min Sida.
    raderPerDag[6].push({
      dag: DAGAR[6],
      aktivitet: REP_TEXTER[hash % REP_TEXTER.length],
      minut: repMin,
      typ: "rep",
      lank: "/min-sida",
    });
  }

  // 3) Platta ut måndag→söndag och stämpla klar-flaggor från lokaldata.
  return raderPerDag
    .flat()
    .map((rad, index) => (klaraIndex.has(index) ? { ...rad, klar: true } : rad));
}
