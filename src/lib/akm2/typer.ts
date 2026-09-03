/**
 * AKM2 — "AK-Model 2" — TYPKONTRAKT (lager 0–5).
 *
 * Ärver src/lib/portfolj-forskning/typer.ts (BolagsNyckeltal, AKM1Bedomning,
 * Horisont, VagKlass, Dynamik, Bransch). JSON-nycklar utan åäö — samma
 * konvention som typkontraktet.
 *
 * PROJEKTIONSINVARIANTEN (BESLUT §0 / R4 §0):
 *   projiceraAKM1(raknaAKM2(k, { moduler: [], viktprofil: "akm1-klassisk" }))
 *   === raknaAKM1(k)   för ALLA BolagsNyckeltal k.
 *
 * Denna fil innehåller ENBART typer (inga runtime-konstanter, inga funktioner)
 * så att övriga AKM2-domäner (dynamik.ts, moduler/) säkert kan `import type`
 * från den enligt byggreglerna i data/forskning/AKM2-BESLUT.md.
 *
 * Dokumenterade TILLÄGG mot R4 §5:s signaturer (märkta "[TILLÄGG]"):
 *   1. ModulAktivering.poang        — modulpoäng injiceras av modulregistret
 *                                     (lager 2), så kärnan slippa importera moduler.
 *   2. ViktProfil.kategorivikter    — kategori-baserad profil (superanalys-2026):
 *                                     variabler ärver lika andel av kategorins vikt.
 *   3. ViktProfil.omfordelaVidOsatt — osatta variabler omfördelar sin vikt
 *                                     (BESLUT §2) i stället för att straffa.
 *   4. AKM2Resultat.lager4.omfordelning — omfördelningen dokumenteras i resultatet.
 *   5. PartialtResultat / RaknaAKM2Opts — dynamiklagret körs via injicerad
 *                                     funktion, inte via import av dynamik.ts.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import type {
  AKM1Bedomning,
  BolagsNyckeltal,
  Bransch,
  Dynamik,
  Horisont,
  VagKlass,
} from "../portfolj-forskning/typer";

// ── Lager 2: utökningsmoduler ("AKM2-plus", V21+) ───────────────────────────

export type AKM2ModulId = string; // t.ex. "saas" | "bank" | "gruvor" | "kvalitet"

export type ModulVariabel = {
  id: string;            // "V21"… globalt unika över alla moduler (registret validerar)
  namn: string;
  kategori: string;      // följer AKM1:s kategorier (eller ny, deklarerad av modulen)
  formel: string;
  /** Pedagogiska trösklar som V01–V20 (krav från R4 §9.1). */
  trosklar: { t1: string; t3: string; t5: string };
  kursSlug?: string;     // mikro-lektion (migrationssteg 4), t.ex. "v21-roic"
  kalla: string;         // var i årsredovisningen/börsdatan siffran finns
};

export type AKM2Modul = {
  id: AKM2ModulId;
  namn: string;
  beskrivning: string;
  branscher: Bransch[];   // var modulen är relevant (aktiveringsgrund)
  variabler: ModulVariabel[];
  forskningsKalla: string; // länk till R1-rapporten (reproducerbarhet)
  version: string;
};

export type ModulAktivering = {
  modulId: AKM2ModulId;
  aktiv: boolean;
  automatisk?: boolean;   // true om branschmatchning triggade, false om användarval
  orsak?: string;         // varför — pedagogisk spårbarhet
  /**
   * [TILLÄGG] Modulens variabelpoäng (V21+, 0–5), levererade av modulregistret
   * (lager 2). Kärnan (karna.ts) importerar ALDRIG moduler — poängen injiceras
   * här. Variabler utanför V21–V30 avvisas (lager 2 får aldrig röra V01–V20).
   */
  poang?: Record<string, number>;
};

// ── Lager 3: dynamik (ägs av dynamik.ts — kärnan konsumerar bara typen) ─────

export type KonfluensPort = "oppen" | "sluten" | "osatt"; // ≥3 av 5 teorier => "oppen"

export type DynamikJustering = {
  variabel: string;      // "V01"…"V30"
  riktning: Dynamik;     // forbattras | stabilt | forsvamras | osatt
  justering: number;     // −1 … +1  (0 när port ≠ "oppen")
  port: KonfluensPort;
  motivering: string;    // varför — källa till slutsatsen
};

export type DynamikLagerSvar = {
  ticker: string;
  perVariabel: Record<string, DynamikJustering>;
  perHorisont: Record<Horisont, VagKlass>;          // fundamental våg (ur FVagAnalys)
  tekniskPerHorisont?: Record<Horisont, VagKlass>;  // AK1TS (ur TVagStatus)
  konfluens: {
    raknadeTeorier: number;   // av 5
    sammaRiktning: number;    // t.ex. 4 => port "oppen"
    port: KonfluensPort;
    text: string;             // "4 av 5 teorier pekar uppåt"
  };
  horisontVikter: Record<Horisont, number>; // vilka vikter som faktiskt användes
  datum: string;
};

// ── Lager 4: vikter ──────────────────────────────────────────────────────────

export type ViktProfilId = "akm1-klassisk" | (string & {}); // "akm1-klassisk" är reserverad + låst

export type ViktProfil = {
  id: ViktProfilId;
  namn: string;
  beskrivning: string;
  forskningsKalla: string; // länk till R2-rapporten/BESLUT + litteratur
  /**
   * Vxx → råvikt i procentenheter. Normaliseras internt till summa 1 över de
   * variabler som är aktiva för analysen (se karna.ts losaVikter).
   */
  viktPerVariabel: Record<string, number>;
  /**
   * [TILLÄGG] Kategori-baserad profil (t.ex. "superanalys-2026"): nyckel =
   * kategorinamn, värde = kategorins andel i procentenheter. Aktiva variabler
   * i kategorin delar lika på kategorins vikt (R2 §7.5: "inom kategori: likavikt").
   * Nya modulvariabler (V21+) med känd kategori inkluderas automatiskt.
   * Om både kategorivikter och viktPerVariabel finns används kategorivikterna —
   * viktPerVariabel är då den dokumenterade kanoniska utlösningen för V01–V20.
   */
  kategorivikter?: Record<string, number>;
  /**
   * [TILLÄGG] true = variabler utan data (osatta) eller inaktiva modulers
   * variabler omfördelar sin vikt proportionellt till aktiva variabler
   * (BESLUT §2: "aldrig straffa saknad data"). false = rak klassisk summa
   * där osatta bidrar med 0 poäng men behåller sin vikt ("akm1-klassisk").
   */
  omfordelaVidOsatt?: boolean;
  /** Bransch-adaptiv variant: per bransch en egen viktsamling. [SLOT R2] */
  branschAdaptiv?: Partial<Record<Bransch, Record<string, number>>>;
  las?: boolean;           // true för "akm1-klassisk" — ALDRIG redigerbar
  serverSide?: boolean;    // true = hemlig know-how, exponeras ej till klienten
};

/** Overrid av HORIZONTER_VIKT för en analys (t.ex. RiskProfilens egna vikter). */
export type Horisontprofiler = Partial<Record<Horisont, number>>; // normaliseras till summa 1

// ── Lager 5: syntes & rapport ────────────────────────────────────────────────

export type AKM2Band = "aktor" | "studera" | "skjut" | "osatt";
// Etiketter/texter: se BAND_TEXT i karna.ts (ärver superanalysens pedagogiska band).

export type DaNuSpar = {
  datum: string;        // ISO
  komposit: number;
  akm1: number;         // AKM1-skuggan samma datum — alltid jämförbar
  notis?: string;       // när något väsentligt förändrats
};

/** [TILLÄGG] Dokumentation av viktomfördelningen i resultatet (BESLUT §2). */
export type OmfordelningInfo = {
  /** Variabler vars vikt omfördelats (osatta kärnvariabler + inaktiva modulvariabler). */
  exkluderade: string[];
  /** Kort pedagogisk text: vad omfördelades, vart, och varför. */
  text: string;
};

export type AKM2Resultat = {
  ticker: string;
  namn: string;
  bransch: Bransch;
  datum: string;                // ISO — här k.hamtat (determinism: aldrig klocka)
  modellVersion: string;        // t.ex. "AKM2.2026.09" — följer med i prediktionsloggen

  lager1: AKM1Bedomning;        // OFÖRÄNRAD AKM1 — projektionsgarantin (ALDRIG påverkad av 2–4)
  lager2: {
    aktiveradeModuler: ModulAktivering[];
    poang: Record<string, number>;   // V21+ → 0–5 (tomt om inga moduler)
    notering?: string;
  };
  lager3: DynamikLagerSvar;     // neutralt svar om ingen dynamikfunktion injicerats
  lager4: {
    viktprofil: ViktProfilId;
    viktPerVariabel: Record<string, number>; // de NORMALIZERADE vikter som användes (summa 1)
    bransch?: Bransch;                       // om bransch-adaptiv profil lösts ut
    /** [TILLÄGG] Dokumenterad omfördelning av osatt/inaktiv vikt (BESLUT §2). */
    omfordelning?: OmfordelningInfo;
  };

  komposit: number;                   // 0–100 (formeln i R4 §3 lager 5 + hård port BESLUT §5)
  perKategori: Record<string, number>; // viktat kategorisnitt × 20 (0–100)
  band: AKM2Band;                     // pedagogiskt band — aldrig köp/sälj
  projiceradAKM1: AKM1Bedomning;      // SKA vara === lager1 (golden test vaktar)

  spar: DaNuSpar[];                   // då-vs-nu (senaste först; här: aktuella beräkningen)
  osakerhet: { andelOsatta: number; andelarKallor: number; note: string };
};

// ── Förklaringen (förstaklassmedborgare) ─────────────────────────────────────

export type ForklaringsRad = {
  variabel: string;          // "V07"
  namn: string;              // "Bruttomarginal"
  poang: number;             // rå poäng 0–5
  effektivPoang: number;     // efter dynamik (p̂)
  vikt: number;              // normaliserad (summa 1 över alla rader)
  bidrag: number;            // vikt × p̂ × 20 = poäng i kompositen
  text: string;              // varför — i kurs-termer, med siffror från nyckeltalen
  kursSlug?: string;         // t.ex. "v07-bruttomarginal" (V21+: provisorisk, steg 4)
  kalla?: string;            // årsredovisningsplats (V:s "var hittar jag siffrorna?")
};

export type Forklaring = {
  rubrik: string;            // t.ex. "Varför 72/100 — de fem tyngsta skälen"
  sammanfattning: string;    // 2–3 meningar, pedagogiska, dömer aldrig
  rader: ForklaringsRad[];   // sorterade efter |bidrag| (ties: variabel-id stigande)
  dynamikText: string;       // vad vågorna/gaten gjorde, i klartext
  modulText: string;         // vilka moduler som var aktiva och varför
  varningar: string[];       // osatta andelar, hård port, takad modulering osv.
  kallor: string[];          // BESLUT/R1/R2/R4-rapporter + bolagskällor
};

// ── Det publika API:ets hjälptyper (funktionerna lives i karna.ts) ──────────

/**
 * [TILLÄGG] Läget efter lager 1+2 — indata till den injicerade dynamikfunktionen
 * (lager 3). Kärnan hålls fri från import av dynamik.ts/moduler/: anroparen
 * stänger över FVagAnalys/TVagStatus/horisontprofiler i sin egen funktion.
 */
export type PartialtResultat = {
  ticker: string;
  namn: string;
  bransch: Bransch;
  datum: string;
  /** Råa nyckeltal — dynamikfunktionen kan behöva serier med mera. */
  nyckeltal: BolagsNyckeltal;
  /** Klassisk AKM1-bedömning (lager 1 — påverkas ALDRIG av lager 2–4). */
  lager1: AKM1Bedomning;
  /** Modulpoäng hittills (V21+; tomt om inga aktiva moduler levererat poäng). */
  lager2: { aktiveradeModuler: ModulAktivering[]; poang: Record<string, number> };
};

/**
 * [TILLÄGG] Parametrar till raknaAKM2 (R4 §5:s opts, omarbetade):
 * horisontprofiler/fvag/tvag har flyttats in i den injicerade dynamikfunktionen
 * — de tillhör lager 3 och kärnan ska inte behöva känna till dem.
 */
export type RaknaAKM2Opts = {
  /** Aktiva moduler med injicerade poäng (V21+). Default: [] (inga moduler). */
  moduler?: ModulAktivering[];
  /** Viktprofil (id ur VIKTPROFILER eller ett ViktProfil-objekt). Default: "akm1-klassisk". */
  viktprofil?: ViktProfilId | ViktProfil;
  /**
   * Injicerad dynamikfunktion (lager 3). Uteblir den svarar kärnan neutralt:
   * alla justeringar 0 och konfluensport "osatt" — degradering downward-mot-AKM1,
   * aldrig mot gissning (R4 §4).
   */
  dynamik?: (r: PartialtResultat) => DynamikLagerSvar;
  /** Kalkylator-läge: människans poäng respekteras som lager 1 (R4 §5). */
  akm1Manuell?: AKM1Bedomning;
  /** Semantisk modellversion som följer med resultat + prediktionsloggen. */
  modellVersion?: string;
};
