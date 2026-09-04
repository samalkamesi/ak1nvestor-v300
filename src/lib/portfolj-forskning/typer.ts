/**
 * AK1A PORTFÖLJFORSKNING — gemensamt typkontrakt för Mega-projektet.
 *
 * ALLA agenter och motorer i portföljsystemet ÄRVER dessa typer.
 * Konventioner (samma som existerande ekosystem):
 *  - JSON-nycklar UTAN å/ä/ö (mikro|kort|medellang|lang|mega)
 *  - vågklasser: impulsvag|korrigering|basbygge|osatt
 *  - AKM1: V01–V20, 0–5 poäng per variabel, max 100
 *  - AK1TS: 5 teorier × 5 horisonter × 4 dimensioner
 *  - ALDRIG investeringsråd — allt är pedagogisk forskning (se /finansiell-policy)
 *
 * Horisontviktning enligt kunddiretiv: MIKRO är minst viktig — Mega-projektet
 * fokuserar på kort/medellång/lång/Mega där fundamental tillväxt driver.
 */

// Peer-profilen (VÅG 59, AKM3 steg 4) definieras i peer.ts — ren, fs-fri
// modul. Importen är type-only: typcirkeln raderas vid kompilering och
// skapar ingen runtime-koppling tillbaka till detta kontrakt.
import type { PeerInfo } from "./peer";

// ── Bas ─────────────────────────────────────────────────────────────────────

export type Horisont = "mikro" | "kort" | "medellang" | "lang" | "mega";
export const HORIZONTER: Horisont[] = ["mikro", "kort", "medellang", "lang", "mega"];

export const HORIZONTER_VIKT: Record<Horisont, number> = {
  mikro: 0.05,       // minst viktigt enligt direktiv
  kort: 0.2,
  medellang: 0.25,
  lang: 0.3,
  mega: 0.2,
};

export type VagKlass = "impulsvag" | "korrigering" | "basbygge" | "osatt";
export const VAGKLASSER: VagKlass[] = ["impulsvag", "korrigering", "basbygge", "osatt"];

/** "Var vi är på väg" — dynamikriktning per variabel/våg. */
export type Dynamik = "forbattras" | "stabilt" | "forsvamras" | "osatt";

export type AKM1Variabel = `V${string}`; // V01..V20
export type AKM1Poang = Record<string, number>; // nyckel V01..V20, värde 0–5

export type Bransch =
  | "teknik"
  | "industri"
  | "halso"
  | "konsument"
  | "fastighet"
  | "finans"
  | "material"
  | "energi"
  | "kommunikation"
  | "tillvaxt";

export const BRANSCHER: Bransch[] = [
  "teknik", "industri", "halso", "konsument", "fastighet",
  "finans", "material", "energi", "kommunikation", "tillvaxt",
];

/** Datakälla med spårbarhet — "varje slutsats har en källa". */
export type Kalla = {
  namn: string;        // t.ex. "Yahoo Finance", "MarketStack"
  hamtat: string;      // ISO-datum
  url?: string;
  paranoid?: string;   //dera vilken endpoint/serien
};

// ── 1. Bolagsnyckeltal (insamlat, rådata) ────────────────────────────────────

export type BolagsNyckeltal = {
  ticker: string;            // t.ex. "ABB.ST", "MSFT"
  namn: string;
  bransch: Bransch;
  land: string;
  valuta: string;
  kallor: Kalla[];           // MINST 2 oberoende per nyckeltalsgrupp (dubbelkoll)
  hamtat: string;            // ISO-datum för hela posten
  pris: number | null;
  marknadsKapitalMdr: number | null;
  tillvaxt: {
    omsattningCAGR5ar: number | null;   // decimal, 0.12 = 12 %
    resultatCAGR5ar: number | null;
    omsattningTillvaxtTTM: number | null;
    prognosTillvaxt: number | null;     // konsensus om finnes
  };
  lonksamhet: {
    roe: number | null;
    roic: number | null;
    bruttoMarginal: number | null;
    ebitMarginal: number | null;
    nettoMarginal: number | null;
    fcfMarginal: number | null;
  };
  stabilitet: {
    skuldEgenkapital: number | null;
    rantaTackning: number | null;
    fcfPositivaSenaste5: number | null; // antal av 5
    /** V19 — Kassatäckning (nyemissionsrisk): kassan räcker så nyemission undviks. */
    kassaManaderBurnRate?: number | null;  // antal månader kassan räcker vid förbränning
    nyemissionerSenaste5ar?: number | null; // antal nyemissioner (utspädning) senaste 5 åren
  };
  /** V20 — Återköp av egna aktier (kapitalåterföring). */
  aterkop: {
    senasteArMdr?: number | null;          // återköpt belopp, miljarder
    andelUtestande?: number | null;        // % minskning av aktieantalet
    insiderkopSenaste6man?: number | null; // kompletterande observation (antal köp VD/styrelse)
  };
  moat: {
    bruttoMarginalMedel5ar: number | null;
    bruttoMarginalSpread5ar: number | null; // volatilitet — låg = moat
    roeMedel5ar: number | null;
  };
  vardering: {
    pe: number | null;
    pb: number | null;
    evEbit: number | null;
    peg: number | null;
    fcfYield: number | null;
    egenKapitalMultipl: number | null;  // P/B — Grahams >=1.5-varning
  };
  /** Golvet: värdeskydd enligt metodik — NCAV, reimvärde eller tillgångstung grund. */
  golv: {
    typ: "ncav" | "reim" | "tillgangstung" | "ingen" | "osatt";
    vardePerAktie: number | null;
    marginal: number | null;            // (värde − pris) / värde, kan vara negativ
  };
  /** 5-åriga serier för vågdetektion (fundamentalvågor behöver tidsserier). */
  serier?: {
    ar: string[];                       // ["2021", ...]
    omsattning: number[];
    resultat: number[];
    egetKapital: number[];
    fcf: number[];
  };
  notering?: string;                    // flaggor, t.ex. "B-kvitto-avvikelse mellan källor"
};

// ── 2. AKM1-bedömning ────────────────────────────────────────────────────────

export type AKM1Bedomning = {
  ticker: string;
  poang: AKM1Poang;                     // V01..V20 → 0–5
  totalt: number;                       // 0–100
  perKategori: Record<string, number>;  // Tillväxt/Värdering/Lönsamhet/Stabilitet/Moat/Katalysator/Risk
  motivering: Record<string, string>;   // Vxx → kort motivering (reproducerbarhet)
  datum: string;
};

// ── 3. Fundamental våganalys (AKM1 × tidsserier × horisonter) ────────────────

export type VariabelVagstatus = {
  klass: VagKlass;
  dynamik: Dynamik;
  anteckning: string;                   // varför — källa till slutsatsen
};

export type FVagAnalys = {
  ticker: string;
  /** Per AKM1-variabel: vågklass + dynamik ("var vi är på väg"). */
  perVariabel: Record<string, VariabelVagstatus>;
  /** Dominerande vågklass per horisont (fundamental utvecklingstakt). */
  perHorisont: Record<Horisont, VagKlass>;
  /** Sammanvägd dynamiktext — pedagogisk, dömer aldrig. */
  totalText: string;
  datum: string;
};

// ── 4. Teknisk vågstatus (från existerande analys-motor) ─────────────────────

export type TVagStatus = {
  ticker: string;
  perHorisont: Record<Horisont, VagKlass>;  // körAnalysMotor-vager
  konfluens: string;                         // "3 av 5 teorier pekar uppåt" etc.
  datum: string;
};

// ── 5. Korstabellrad (10 branscher × 10 bolag) ───────────────────────────────

export type KorstabbellRad = {
  ticker: string;
  namn: string;
  bransch: Bransch;
  akm1Totalt: number;
  akm1PerKategori: Record<string, number>;
  fvagPerHorisont: Record<Horisont, VagKlass>;
  fvagDynamik: Dynamik;                 // sammanvägd fundamental riktning
  tvagPerHorisont: Record<Horisont, VagKlass>;
  golvMarginal: number | null;
  senastKontrollerad: string;
  status: "gron" | "gul" | "rod" | "osatt"; // strikta krav-sammanfattning
  /** D1 (2026-09-03): andel av modellens totalvikt (97 viktenheter) med
   *  dataunderlag, 0–1 = Σ vikt över beräkningsbara (icke-osatta) variabler / 97.
   *  Optionell för bakåtkompatibilitet med äldre underlag. */
  datatackning?: number;
  /** D1 (2026-09-03): teoretiskt poängtak = Σ vikt över beräkningsbara × 5 ×
   *  (20/97) = datatackning × 100. Osatt variabel ger alltid 0 poäng — maxMöjligt
   *  visas aldrig dolt i UI:t ("poäng/max"). */
  akm1MaxMojligt?: number;
  /** Våg 57 D2: AKM2-kompositen 0–100 ur raknaAKM2(kursdata, { moduler:
   *  automatiska ur modulregistret per bransch, viktprofil: "akm2-2026" }) —
   *  se src/lib/portfolj-forskning/akm2-koppling.ts. null = nyckeltal saknas
   *  (motorn gissar aldrig). Optionell för bakåtkompatibilitet. */
  akm2?: number | null;
  /** Våg 57 D2: akm2 − akm1Totalt (1 decimal) — differensen mellan AKM2:s
   *  komposit och korstabellens publicerade AKM1-total. null när någon av
   *  delarna saknas. */
  akm2Skillnad?: number | null;
  /** Våg 57 D2: namnen på branschmodulerna som aktiverades vid AKM2-
   *  beräkningen (modulregistret, src/lib/akm2/moduler). */
  akm2Moduler?: string[];
  /** VÅG 59 (AKM3 steg 3): hård port (V19 < 12 mån) aktiv — true gör att
   *  osäkerhetsintervallets övre gräns takas till 45 (AKM3-BESLUT §5).
   *  Optionell för bakåtkompatibilitet med äldre underlag. */
  portV19?: boolean;
  /** VÅG 59 (AKM3 steg 4): peer-läslager — branschjämförelse på rank/median-
   *  basis (r3-peer). PRESENTATIONSLAGER: ingår ALDRIG i poängen eller
   *  portföljbygget. Optionell — gamla filer/fixturer saknar fältet. */
  peer?: PeerInfo;
};

// ── 6. Riskprofil & portföljförslag ──────────────────────────────────────────

export type RiskNiva = "konservativ" | "balanserad" | "tillvaxt";
export type TillvaxtTakt = "lugn" | "stadig" | "aggressiv";

export type RiskProfil = {
  niva: RiskNiva;
  takt: TillvaxtTakt;
  /** Horisontviktning summerar till 1 (mikro låg enligt direktiv). */
  horisontVikter: Record<Horisont, number>;
  /** Max andel per aktie / per bransch (spridningsregler). */
  maxPerAktie: number;
  maxPerBransch: number;
  /** Minsta AKM1-total och minsta golvmarginal för poolen. */
  minAKM1: number;
  minGolvMarginal: number | null;      // konservativ kräver golv; tillväxt tillåter null
};

export type KravKontroll = {
  namn: string;                        // t.ex. "Golv finnes", "AKM1 >= 70"
  status: "OK" | "VARNING" | "BROTT";
  detalj: string;
};

export type InnehavForslag = {
  ticker: string;
  vikt: number;                        // 0–1
  motiv: string;                       // AKM1+våg-motivering, pedagogisk
  krav: KravKontroll[];
};

export type ErsattningsForslag = {
  ersattTicker: string;                // aktie som brutit strikta krav
  orsak: string;
  kandidater: Array<{ ticker: string; motiv: string; skillnadMotErsatt: string }>;
};

export type PortfoljForslag = {
  id: string;
  skapad: string;
  riskProfil: RiskProfil;
  innehav: InnehavForslag[];
  ersattningar: ErsattningsForslag[];
  /** Pedagogisk sammanfattning — ALDRIG köp/sälj-rekommendation. */
  ak1aNot: string;
  vagprofilSammanfattning?: Record<Horisont, VagKlass>;
  /** Våg 57 D2: poängbasen motorn använde — "akm1" (default) eller "akm2"
   *  (AKM2-kompositen ur korstabellens berikade rader; kräver Portföljforskning
   *  Plus i UI:t — motorn själv validerar aldrig prenumerationer). */
  poangbas?: "akm1" | "akm2";
};

// ── 7. Uppföljning ("då vs nu") ──────────────────────────────────────────────

export type UppfoljningSnapshot = {
  ticker: string;
  datum: string;                       // ISO — månads- eller kvartalsvis
  akm1Totalt: number;
  fvagPerHorisont: Record<Horisont, VagKlass>;
  tvagPerHorisont: Record<Horisont, VagKlass>;
  pris: number | null;
  forandringPris: number | null;       // vs föregående snapshot
  forandringAkm1: number | null;
  notisText?: string;                  // när värd signifikant förändring
};

export type PortfoljUppfoljning = {
  portfoljId: string;
  riskProfil: RiskProfil;
  snapshots: UppfoljningSnapshot[];
  historik: Array<{ datum: string; text: string }>;
};

// ── 8. Manifest ──────────────────────────────────────────────────────────────

export type UniversStatus = {
  ticker: string;
  bransch: Bransch;
  steg: Array<"nyckeltal" | "akm1" | "fvag" | "tvag" | "korstabbell">; // klara steg
  senastUppdaterad?: string;
};
