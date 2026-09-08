/**
 * KORSTABELL-DATA — server-side läsning av P6:s underlag + prislistan.
 *
 * Källor (repo-roten, läses med fs vid build/request — aldrig klienten):
 *  - data/portfolj-system/korstabell-grund.json  (P6 levererar; saknas än så
 *    länge → lasKorstabellGrund returnerar finns: false — motorn gissar aldrig)
 *  - data/portfolj-system/priser.json            (prenumerationsnivåer)
 *  - data/cache/akm2-{TICKER}.json               (AKM2-resultat, våg 57 D2 —
 *    lasAkm2ResultatMedFallback läser filen först och faller ENDAST när den
 *    saknas/är ogiltig tillbaka på Supabase-snapshots, våg 86)
 *
 * Normalisering: P6:s fil kan komma med camelCase (typkontraktet) eller
 * snake_case-nycklar samt vågklasser med å/ä ("impulsvåg") — allt mappas
 * defensivt till KorstabbellRad enligt src/lib/portfolj-forskning/typer.ts.
 * Ogiltiga rader stryks; en tom fil betraktas som saknad (ärlighet principen).
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { arAkm2Resultat, akm2CacheFilnamn, lasAkm2Snapshot } from "../akm2-snapshot-lagring";
import type { AKM2Resultat } from "../akm2/typer";
import { raknaPeer, type RaknaPeerOptioner } from "./peer";
import type { Bransch, Dynamik, Horisont, KorstabbellRad, VagKlass } from "./typer";

const HORIZONTER: Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"];

const VAGKLASS_MAP: Record<string, VagKlass> = {
  impulsvag: "impulsvag",
  "impulsvåg": "impulsvag",
  korrigering: "korrigering",
  basbygge: "basbygge",
  osatt: "osatt",
};

const DYNAMIK_MAP: Record<string, Dynamik> = {
  forbattras: "forbattras",
  "förbättras": "forbattras",
  stabilt: "stabilt",
  forsvamras: "forsvamras",
  "försvagas": "forsvamras",
  osatt: "osatt",
};

const BRANSCH_MAP: Record<string, Bransch> = {
  teknik: "teknik",
  industri: "industri",
  halso: "halso",
  "hälsa": "halso",
  konsument: "konsument",
  fastighet: "fastighet",
  finans: "finans",
  material: "material",
  energi: "energi",
  kommunikation: "kommunikation",
  tillvaxt: "tillvaxt",
  "tillväxt": "tillvaxt",
};

const STATUS_MAP: Record<string, KorstabbellRad["status"]> = {
  gron: "gron",
  "grön": "gron",
  gul: "gul",
  rod: "rod",
  "röd": "rod",
  osatt: "osatt",
};

// ── Småhjälpare (null-säkra läsningar ur okänd JSON) ────────────────────────

function lasObj(rå: unknown): Record<string, unknown> {
  return rå && typeof rå === "object" && !Array.isArray(rå) ? (rå as Record<string, unknown>) : {};
}

function lasStr(rå: unknown): string | null {
  return typeof rå === "string" && rå.trim() !== "" ? rå.trim() : null;
}

/** Läs nyckel med camelCase- först, sedan snake_case-fallback. */
function falt(rad: Record<string, unknown>, camel: string, snake: string): unknown {
  return rad[camel] !== undefined ? rad[camel] : rad[snake];
}

function lasTal(rå: unknown): number | null {
  return typeof rå === "number" && Number.isFinite(rå) ? rå : null;
}

function lasVagRecord(rå: unknown): Record<Horisont, VagKlass> {
  const ut = {} as Record<Horisont, VagKlass>;
  const kalla = lasObj(rå);
  for (const hz of HORIZONTER) {
    ut[hz] = VAGKLASS_MAP[String(kalla[hz] ?? "")] ?? "osatt";
  }
  return ut;
}

function lasKategoriRecord(rå: unknown): Record<string, number> {
  const ut: Record<string, number> = {};
  for (const [nyckel, varde] of Object.entries(lasObj(rå))) {
    const tal = lasTal(varde);
    if (tal !== null) ut[nyckel] = tal;
  }
  return ut;
}

/** Normalisera ETT rått radobjekt → KorstabbellRad, eller null om ogiltigt. */
function normaliseraRad(råRad: unknown): KorstabbellRad | null {
  const rad = lasObj(råRad);
  const ticker = lasStr(falt(rad, "ticker", "ticker"));
  if (!ticker) return null;

  const bransch = BRANSCH_MAP[String(falt(rad, "bransch", "bransch") ?? "")];
  const status = STATUS_MAP[String(falt(rad, "status", "status") ?? "")] ?? "osatt";
  const akm1 = lasTal(falt(rad, "akm1Totalt", "akm1_totalt"));
  const dynamik = DYNAMIK_MAP[String(falt(rad, "fvagDynamik", "fvag_dynamik") ?? "")] ?? "osatt";

  return {
    ticker,
    namn: lasStr(falt(rad, "namn", "namn")) ?? ticker,
    bransch: bransch ?? "teknik",
    akm1Totalt: akm1 ?? 0,
    akm1PerKategori: lasKategoriRecord(falt(rad, "akm1PerKategori", "akm1_per_kategori")),
    fvagPerHorisont: lasVagRecord(falt(rad, "fvagPerHorisont", "fvag_per_horisont")),
    fvagDynamik: dynamik,
    tvagPerHorisont: lasVagRecord(falt(rad, "tvagPerHorisont", "tvag_per_horisont")),
    golvMarginal: lasTal(falt(rad, "golvMarginal", "golv_marginal")),
    senastKontrollerad: lasStr(falt(rad, "senastKontrollerad", "senast_kontrollerad")) ?? "",
    status,
    // D1 (2026-09-03): datatäckning + teoretiskt poängtak — optionella, ogiltiga
    // värden faller tillbaka på undefined (UI:t visar då "—" och döljer aldrig taket).
    datatackning: lasTal(falt(rad, "datatackning", "datatackning")) ?? undefined,
    akm1MaxMojligt: lasTal(falt(rad, "akm1MaxMojligt", "akm1_max_mojligt")) ?? undefined,
    // Våg 57 D2: AKM2-berikningen (akm2-koppling.ts) — null när nyckeltal
    // saknades; modullistan normaliseras defensivt (icke-strängar stryks).
    akm2: lasTal(falt(rad, "akm2", "akm2")) ?? null,
    akm2Skillnad: lasTal(falt(rad, "akm2Skillnad", "akm2_skillnad")) ?? null,
    akm2Moduler: Array.isArray(rad.akm2Moduler)
      ? rad.akm2Moduler.filter((m): m is string => typeof m === "string" && m.trim() !== "")
      : [],
    // VÅG 59 (AKM3 steg 3): hård port-flaggan från P6:s rad — driver
    // porttaket (övre gräns 45) i osäkerhetsintervallet. defensivt: endast
    // explicit true räknas som aktiv port (allt annat = ej triggad).
    portV19: rad.portV19 === true,
  };
}

/** Normalisera hela filen — accepterar kalt array eller { rader: [...] } / { korstabell: [...] }. */
function normaliseraAlla(rå: unknown): KorstabbellRad[] {
  let lista: unknown[] = [];
  if (Array.isArray(rå)) {
    lista = rå;
  } else {
    const rot = lasObj(rå);
    const kandidat = rot.rader ?? rot.korstabell ?? rot.raderMedVagor;
    if (Array.isArray(kandidat)) lista = kandidat;
  }
  const ut: KorstabbellRad[] = [];
  const setta = new Set<string>();
  for (const rad of lista) {
    const n = normaliseraRad(rad);
    if (!n || setta.has(n.ticker)) continue;
    setta.add(n.ticker);
    ut.push(n);
  }
  return ut;
}

// ── Offentligt API ──────────────────────────────────────────────────────────

export type KorstabellUnderlag = {
  /** true endast när filen finns OCH innehåller minst en giltig rad. */
  finns: boolean;
  rader: KorstabbellRad[];
  /** P6:s `skapad`-datum (ur filroten) — peer-referensen dateras med det. */
  skapad: string | null;
};

/**
 * Läs per-variabelpoäng (V01–V20, 0–5) ur P6:s akm1-cachefiler — osatt
 * markeras null (motiveringarnas "osatt —"-prefix är källans kontrakt för
 * skilja strukturellt saknad data från poängen 0; r3 §3.3 + D1).
 * Saknad/ogiltig fil ⇒ tickerns map saknas (peer-variablerna blir osatta).
 * Server-side (fs) — anropas endast från build/request-vägen, aldrig klienten.
 */
export function lasAkm1PoangFranCache(
  tickers: string[],
): Record<string, Record<string, number | null>> {
  const ut: Record<string, Record<string, number | null>> = {};
  for (const ticker of tickers) {
    if (typeof ticker !== "string" || ticker.trim() === "") continue;
    const fil = join(process.cwd(), "data", "cache", `akm1-${ticker.replace(/\./g, "_")}.json`);
    if (!existsSync(fil)) continue;
    try {
      const rå = lasObj(JSON.parse(readFileSync(fil, "utf8")));
      const poang = lasObj(rå.poang);
      const motivering = lasObj(rå.motivering);
      const rad: Record<string, number | null> = {};
      for (const [v, varde] of Object.entries(poang)) {
        const tal = lasTal(varde);
        const mot = typeof motivering[v] === "string" ? String(motivering[v]).trim().toLowerCase() : "";
        rad[v] = tal !== null && !mot.startsWith("osatt") ? tal : null;
      }
      ut[ticker] = rad;
    } catch {
      // Ogiltig cache-rad lämnas bort — peer visar osatt, aldrig gissning.
    }
  }
  return ut;
}

/**
 * Berika rader med peer (VÅG 59, AKM3 steg 4 — r3 §4.3): raknaPeer efter
 * normaliseringen, poäng ur akm1-cachen, referens ur filens `skapad`.
 * ADDITIVT läslager — akm1Totalt/akm2/vågfälten rörs aldrig (peer ingår
 * ALDRIG i poängen; låst av validera-motorernas svit).
 */
function berikaMedPeer(rader: KorstabbellRad[], skapad: string | null): KorstabbellRad[] {
  const optioner: RaknaPeerOptioner = {
    referensDatum: skapad ?? undefined,
    poangPerBolag: lasAkm1PoangFranCache(rader.map((r) => r.ticker)),
  };
  const peer = raknaPeer(rader, optioner);
  return rader.map((r) => {
    const p = peer.get(r.ticker);
    return p ? { ...r, peer: p } : r;
  });
}

/** Läs och normalisera korstabell-grund.json (P6). Saknas/tom → finns: false. */
export function lasKorstabellGrund(): KorstabellUnderlag {
  const sokVag = join(process.cwd(), "data", "portfolj-system", "korstabell-grund.json");
  if (!existsSync(sokVag)) return { finns: false, rader: [], skapad: null };
  try {
    const rå = JSON.parse(readFileSync(sokVag, "utf8"));
    const rader = normaliseraAlla(rå); // accepterar kalt array eller { rader: [...] }
    if (rader.length === 0) return { finns: false, rader: [], skapad: null };
    const skapad = lasStr(lasObj(rå).skapad);
    return { finns: true, rader: berikaMedPeer(rader, skapad), skapad };
  } catch {
    return { finns: false, rader: [], skapad: null };
  }
}

// ── AKM2-resultat: fil → Supabase (VÅG 86 — serverfallet) ────────────────────

/**
 * AKM2-resultat med fallback-kedja (våg 86, AKM2-snapshot-persistensen):
 *
 *   1) data/cache/akm2-{TICKER}.json (våg 57 D2) — FILEN VINNER ALLTID när den
 *      finns OCH bär ett giltigt resultat (dev är sanningen; Supabase kan
 *      ALDRIG bli bättre än filen),
 *   2) ENDAST när filen saknas/är tom/ogiltig: Supabase-snapshot (system_
 *      events type=akm2_snapshot via akm2-snapshot-lagring.ts — serverfallet:
 *      Vercel-fs är read-only och filerna delas inte mellan enheter).
 *
 * KÄRNAN src/lib/akm2/** är ORÖRD — detta är ett rent LÄSLAGER ovanpå
 * cachefilerna. Nästa-build är nätverks-hermetiskt (lasAkm2Snapshot:s våg 79-
 * vakt): bygget läser enbart filerna, ISR-revalidation läser live. Ogiltig
 * cache hos BÅDA lederna lämnar tickern utanför kartan (aldrig gissat).
 *
 * @returns karta TICKER (äkt form, t.ex. "ABB.ST") → helt AKM2Resultat.
 */
export async function lasAkm2ResultatMedFallback(
  tickers: readonly string[],
): Promise<Record<string, AKM2Resultat>> {
  const ut: Record<string, AKM2Resultat> = {};
  const saknade: string[] = [];
  for (const ticker of tickers) {
    if (typeof ticker !== "string" || ticker.trim() === "") continue;
    // (1) filen först — den vinner alltid när den finns och är giltig.
    const fil = akm2CacheFilnamn(ticker);
    const franFil = fil === null ? null : lasAkm2ResultatUrFil(fil);
    if (franFil !== null) ut[ticker] = franFil;
    else saknade.push(ticker); // fil saknas/tom/ogiltig — serverfallet
  }
  // (2) Supabase ENDAST för tickers utan giltig fil — ETT gemensamt läs (modul-
  //     cache 10 min i akm2-snapshot-lagring), aldrig ett anrop per ticker.
  if (saknade.length > 0) {
    const karta = await lasAkm2Snapshot();
    for (const ticker of saknade) {
      const snap = karta.get(ticker);
      if (snap) ut[ticker] = snap.resultat; // formguardad vid tolkningen
    }
  }
  return ut;
}

/** Läs ett AKM2Resultat ur D2:s cachefil — null när den saknas/är tom/ogiltig
 *  (formguard: arAkm2Resultat ur akm2-snapshot-lagring — EN källa, alla köpare). */
function lasAkm2ResultatUrFil(filnamn: string): AKM2Resultat | null {
  const vag = join(process.cwd(), "data", "cache", `akm2-${filnamn}.json`);
  if (!existsSync(vag)) return null;
  try {
    const c = JSON.parse(readFileSync(vag, "utf8")) as { resultat?: unknown };
    return arAkm2Resultat(c?.resultat) ? c.resultat : null;
  } catch {
    return null; // tom/ogiltig JSON — ärlighetsprincipen gäller läsning också
  }
}

// ── Priser (prenumerationsnivåer) ────────────────────────────────────────────

export type PrisNiva = {
  id: string;
  namn: string;
  prisManad: number;
  prisAr: number;
  beskrivning: string;
};

export type Priser = {
  tjanst: string;
  uppdaterad: string;
  notering: string;
  nivaer: PrisNiva[];
  rabattFas: { fas2: number; fas3: number; beskrivning: string };
  juridiskFotnot: string;
};

/** Läs priser.json — null vid saknad/ogiltig fil (sidan klarar sig utan). */
export function lasPriser(): Priser | null {
  const sokVag = join(process.cwd(), "data", "portfolj-system", "priser.json");
  if (!existsSync(sokVag)) return null;
  try {
    const rå = lasObj(JSON.parse(readFileSync(sokVag, "utf8")));
    const nivaer: PrisNiva[] = (Array.isArray(rå.nivaer) ? rå.nivaer : [])
      .map((n) => {
        const o = lasObj(n);
        const id = lasStr(o.id);
        const namn = lasStr(o.namn);
        const manad = lasTal(o.prisManad);
        const ar = lasTal(o.prisAr);
        if (id === null || namn === null || manad === null || ar === null) return null;
        return {
          id,
          namn,
          prisManad: manad,
          prisAr: ar,
          beskrivning: lasStr(o.beskrivning) ?? "",
        } satisfies PrisNiva;
      })
      .filter((n): n is PrisNiva => n !== null);
    if (nivaer.length === 0) return null;
    const rabatt = lasObj(rå.rabattFas);
    const fas2 = lasTal(rabatt.fas2) ?? 0;
    const fas3 = lasTal(rabatt.fas3) ?? 0;
    return {
      tjanst: lasStr(rå.tjanst) ?? "AK1A Portföljforskning",
      uppdaterad: lasStr(rå.uppdaterad) ?? "",
      notering: lasStr(rå.notering) ?? "",
      nivaer,
      rabattFas: {
        fas2,
        fas3,
        beskrivning: lasStr(rabatt.beskrivning) ?? "",
      },
      juridiskFotnot: lasStr(rå.juridiskFotnot) ?? "",
    };
  } catch {
    return null;
  }
}
