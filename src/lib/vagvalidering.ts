/**
 * AK1A VÅGVALIDERING — dom-protokoll + enighetsscore (VÅG 56 bygg-A; v2 + Bana
 * B i VÅG 59 bygg-1 enligt data/forskning/AKM3/AKM3-BESLUT.md §7).
 *
 * Underlag: data/forskning/STYRELSE-vag-exakthet.md §3 (vägvaliderings-kitet),
 * rekommendation 1 (kitet), 2 (ärlighetsrättningen) och 3 (enighetsscore
 * 0–100 enligt rådets formel 40/30/30).
 *
 * Kundkravet "våg analys skall göras och garantera högst exakthet" uppfylls
 * ärligen enligt §4: inte en garanti om framtiden utan ett ÖPPET KVITTO om
 * det förflutna — Träff ✓/✗ per vågklass och horisont, med osatta redovisade
 * som täckningsbråk, aldrig som fel ("osatt är information, inte fel").
 *
 * VÅG 59 bygg-1 (AKM3 steg 2, BESLUT §7):
 *  - PROTKOLL v2: basbygge-bandet skalas per horisont (mikro/kort ±6 % ·
 *    medellång ±15 % · lång/mega ±25 %); teckenreglerna oförändrade från v1;
 *    räknare nollställs vid versionsbytet (cronen vaktar), orsak deklarerad.
 *  - BANA B: per-variabel-dom per (ticker, variabel, horisont) — förra rondens
 *    klass mot variabelns EGEN faktiska momentum — med episodkedja (episod
 *    avgränsas av klassbyte; osatt avgränsar också; dagar räknas ALDRIG som
 *    observationer). Tabell `vagvalidering_dom` enligt STYRELSE §3.2 exakt.
 *  - `vagklass_snapshot`-rader (r3 väg 2): kvartalsdeduplicerad klass-historik
 *    som vagscan-cronen skriver — två framtida konsumenter (sekvens-n
 *    ESKALERING + kalibrering), byggd här som ren funktion.
 *
 * RENA FUNKTIONER: inga imports, inget nätverk, inget fs, inget Date/now i
 * utdata-styrd logik — deterministiska och typsäkra. Får importeras av både
 * server-rutter (cron/vagvalidering, cron/vagscan, vagscan/senaste) och
 * klientkomponenter (vagkurva-graf, vagkarta-kort, vagfundament-matris).
 */

// ── Konstanter (fasta, dokumenterade — protokollet skrivet före första domen) ─

/** system_events-radens details.schema för type=vagvalidering. */
export const VAGVALIDERING_SCHEMA = "vagvalidering/1";

/**
 * Dom-protokollets version — höjs endast dokumenterat vid regeländring.
 *
 * v2 (beslutad 2026-09-04, AKM3-BESLUT §7): BASBYGGE-bandet skalas per
 * horisont — mikro/kort ±6 % · medellång ±15 % · lång/mega ±25 %.
 * EN ändring per protokollversion (FORBUD §10.6): impulsvåg/korrigering
 * behåller v1:s teckenregel oförändrad (mest försiktiga tolkningen av
 * §7 — evidensen gällde enbart basbygge-bandet; räknare nollställs vid
 * versionsbytet och orsaken deklareras öppet, se TROSKEL_V2_ORSAK).
 */
export const VAGVALIDERING_PROTOKOLL_VERSION = 2;

/**
 * Basbygge-tröskeln per horisont, PROCENT (v2, AKM3-BESLUT §7 normativt):
 * momentum skalar med horisonten — ett ±6 %-band är trubbigt på medellång/
 * lång sikt. Mikro/kort behåller motorns egna ±6 % (hedervändig symmetri
 * kvar på kort sikt); medellång ±15; lång/mega ±25. Inklusiva gränser.
 */
export const TROSKEL_PROCENT_PER_HORIZONT: Record<ValideringHorisont, number> = {
  mikro: 6,
  kort: 6,
  medellang: 15,
  lang: 25,
  mega: 25,
};

/** v2-beslutets datum (protokollbeslut — ingen ny data krävdes, BESLUT §7). */
export const TROSKEL_V2_BESLUTAD = "2026-09-04";

/** v2-beslutets deklarerade orsak (redovisas öppet i event + rapport). */
export const TROSKEL_V2_ORSAK =
  "Rond 1-fynd (vagvalidering-SENASTE 2026-09-04): basbygge 0 % träff på medellång/mega (n=6 var), 30 % på kort — momentum skalar med horisonten men tröskeln var horisontinvariant (±6 %). v2 skalas därför per horisont: mikro/kort ±6 %, medellång ±15 %, lång/mega ±25 % (AKM3-BESLUT §7). Endast basbygge-bandet ändras; impulsvåg/korrigering behåller v1:s teckenregel. Räknare nollställda vid versionsbytet — en ändring per protokollversion (FORBUD §10.6).";

/** De fem horisonterna — samma id:n som vagfundament-motorn. */
export const VALIDERING_HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"] as const;
export type ValideringHorisont = (typeof VALIDERING_HORIZONTER)[number];

/** Klassunionen — samma värden (med å) som motorn redovisar i vager/total. */
export const VAGKLASSER_ALLA = ["impulsvåg", "korrigering", "basbygge", "osatt"] as const;
export type VagKlass = (typeof VAGKLASSER_ALLA)[number];

/** Dom-utfall: träff / miss / osatt (osatt döms ALDRIG som fel). */
export type Dom = "traff" | "miss" | "osatt";

/**
 * Basbyggets tröskel i procent — v1:s horisontinvarianta gräns, oförändrad
 * som DEFAULT när ingen horisont anges (och som mikro/korts värde i v2).
 * Hedervändig symmetri kvar: utan horisont döms basbygge med motorns egna
 * ±6 % — gamla v1-rader i system_events förblir återskapbara ordagrant.
 */
export const TROSKEL_PROCENT = 6;

/**
 * Enighetsscorens vikter (rådets formel, STYRELSE §2 Rang 2):
 *   score = 40·(andel medel-bekräftade) + 30·(tröskelmarginal, tak 1) +
 *           30·(bedömda celler / totalt)
 * En tunn mätning ser tunn ut — direkt ärlighetsvinst i alla våg-UI.
 */
export const ENIGHET_VIKT_BEKRAFTADE = 40;
export const ENIGHET_VIKT_MARGINAL = 30;
export const ENIGHET_VIKT_TACKNING = 30;

// ── Dom-protokollet (ren funktion: klass + momentum → dom) ───────────────────

/**
 * DOM-PROTOKOLL v2 (fastställt 2026-09-04, AKM3-BESLUT §7; v1:s teckenregler
 * oförändrade — EN ändring per protokollversion, FORBUD §10.6):
 *  - impulsvåg   → träff om faktiskt momentum > 0; miss om < 0; 0 → osatt
 *                  (en exakt nollrörelse vittnar inte om riktning). [v1]
 *  - korrigering → träff om momentum < 0; miss om > 0; 0 → osatt. [v1]
 *  - basbygge    → träff om |momentum| ≤ tröskel(horisont), inklusivt:
 *                  mikro/kort ±6 % · medellång ±15 % · lång/mega ±25 %.
 *                  Utan horisont-argument gäller v1:s ±6 % (bakåtkompatibel
 *                  återskapning av v1-rader). [v2]
 *  - osatt klass, saknat/ej ändligt momentum → osatt — ALDRIG dömt.
 * Momentum anges i PROCENT (motorn redovisar t.ex. 3.2 för +3,2 %).
 */
export function domVagvalidering(
  klass: string | null | undefined,
  momentumProcent: number | null | undefined,
  horisont?: string | null,
): Dom {
  if (klass !== "impulsvåg" && klass !== "korrigering" && klass !== "basbygge") return "osatt";
  if (typeof momentumProcent !== "number" || !Number.isFinite(momentumProcent)) return "osatt";
  if (klass === "impulsvåg") {
    return momentumProcent > 0 ? "traff" : momentumProcent < 0 ? "miss" : "osatt";
  }
  if (klass === "korrigering") {
    return momentumProcent < 0 ? "traff" : momentumProcent > 0 ? "miss" : "osatt";
  }
  const troskel =
    horisont != null && horisont in TROSKEL_PROCENT_PER_HORIZONT
      ? TROSKEL_PROCENT_PER_HORIZONT[horisont as ValideringHorisont]
      : TROSKEL_PROCENT;
  return Math.abs(momentumProcent) <= troskel ? "traff" : "miss";
}

/** Klass ur helhetstal — spegling av _klassFranTal i vagfundament-motor.ts (±0,50). */
export function klassFranTal(tal: number | null | undefined): VagKlass {
  if (typeof tal !== "number" || !Number.isFinite(tal)) return "osatt";
  if (tal >= 0.5) return "impulsvåg";
  if (tal <= -0.5) return "korrigering";
  return "basbygge";
}

// ── Enighetsscore 0–100 (rådets formel, generaliserad till mängder av celler) ─

/** En cells råmaterial: medel-bekräftelse (bool|null) + momentum i procent. */
export type EnighetCell = { medelBekraftad: boolean | null; momentum: number | null };

/**
 * Enighetsscore 0–100 för en mängd celler (per horisont för en ticker, per
 * variabel över horisonter, eller ett helt universum):
 *   40 · andel medel-bekräftade (av dem där bekräftelsen är meningsfull)
 * + 30 · medel tröskelmarginal min(1, |mom| / 6 %)
 + 30 · täckning (bedömda celler / totaltAntal, tak 1)
 * Null när INGEN cell har momentum (helt osatt — aldrig en påhittad siffra).
 * Deterministisk: heltalsavrundning mot närmaste, clamp [0,100].
 */
export function raknaEnighetsscore(
  celler: readonly EnighetCell[] | null | undefined,
  totaltAntal?: number,
): number | null {
  if (!Array.isArray(celler)) return null;
  const bedomda = celler.filter(
    (c) => c && typeof c.momentum === "number" && Number.isFinite(c.momentum),
  );
  if (bedomda.length === 0) return null;

  const bekraftade = celler.filter(
    (c) => c && (c.medelBekraftad === true || c.medelBekraftad === false),
  );
  // Saknas icke-null-bekräftelser (t.ex. ren basbygge) är axeln 0 — den
  // informationen finns helt enkelt inte, och scoren visar det hederligt.
  const bekDel =
    bekraftade.length > 0
      ? bekraftade.filter((c) => c.medelBekraftad === true).length / bekraftade.length
      : 0;

  let marginalSum = 0;
  for (const c of bedomda) marginalSum += Math.min(1, Math.abs(c.momentum as number) / TROSKEL_PROCENT);
  const marginalDel = marginalDelUt(marginalSum, bedomda.length);

  const ackuratTotal =
    typeof totaltAntal === "number" && totaltAntal > 0 ? totaltAntal : celler.length;
  const tackningDel = Math.min(1, bedomda.length / ackuratTotal);

  const score =
    ENIGHET_VIKT_BEKRAFTADE * bekDel +
    ENIGHET_VIKT_MARGINAL * marginalDel +
    ENIGHET_VIKT_TACKNING * tackningDel;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function marginalDelUt(sum: number, antal: number): number {
  return antal > 0 ? sum / antal : 0;
}

// ── Indikator-snitt per horisont (deltyp av motorns Indikator — strukturellt) ─

/** Minimal utsnitt av motorns Indikator (momentum i procent + bekräftelse). */
export type MomentumIndikator = {
  momentum?: Record<string, number | null> | null;
  medelBekraftad?: Record<string, boolean | null> | null;
};

/**
 * TECKENFÖRT medel-momentum per horisont (procent, 1 decimal) över de
 * variabler som har data — "dagens faktiska fundamentrörelse" i dom-protokollet.
 * Null per horisont när ingen variabel har momentum (osatt — inte noll).
 */
export function momentumMedelPerHorisont(
  indikatorer: Record<string, MomentumIndikator> | null | undefined,
): Record<string, number | null> {
  const ut: Record<string, number | null> = {};
  for (const hz of VALIDERING_HORIZONTER) {
    let sum = 0;
    let n = 0;
    for (const nyckel of Object.keys(indikatorer ?? {})) {
      const m = indikatorer?.[nyckel]?.momentum?.[hz];
      if (typeof m === "number" && Number.isFinite(m)) {
        sum += m;
        n += 1;
      }
    }
    ut[hz] = n > 0 ? Math.round((sum / n) * 10) / 10 : null;
  }
  return ut;
}

/** Enighetsscore per horisont för ETT bolags indikatorer (totaltAntal = variabelantalet). */
export function enighetPerHorisont(
  indikatorer: Record<string, MomentumIndikator> | null | undefined,
  totaltAntal?: number,
): Record<string, number | null> {
  const variabler = Object.keys(indikatorer ?? {});
  const ackuratTotal =
    typeof totaltAntal === "number" && totaltAntal > 0 ? totaltAntal : variabler.length;
  const ut: Record<string, number | null> = {};
  for (const hz of VALIDERING_HORIZONTER) {
    const celler: EnighetCell[] = variabler.map((v) => ({
      medelBekraftad: indikatorer?.[v]?.medelBekraftad?.[hz] ?? null,
      momentum: typeof indikatorer?.[v]?.momentum?.[hz] === "number" ? (indikatorer?.[v]?.momentum?.[hz] as number) : null,
    }));
    ut[hz] = raknaEnighetsscore(celler, ackuratTotal);
  }
  return ut;
}

/** En post ur vagscan-eventets details.tickers (strukturmässigt utsnitt). */
export type EnighetTickersPost = {
  ticker?: string;
  fel?: string | null;
  indikatorer?: Record<string, MomentumIndikator> | null;
};

/**
 * Universumets enighet: medel-score per horisont över alla fel-fria tickers,
 * plus ett totalt universumssnitt över alla (ticker, horisont)-mätningar.
 * Null där inget underlag finns. Ren, deterministisk — körs server-side i
 * /api/vagscan/senaste och visas i vagkorta-kortet.
 */
export function raknaUniversumEnighet(
  tickers: readonly EnighetTickersPost[] | null | undefined,
): { total: number | null; perHorisont: Record<string, number | null> } {
  const giltiga = (Array.isArray(tickers) ? tickers : []).filter(
    (t) => !!t && typeof t === "object" && !t.fel && !!t.indikatorer && typeof t.indikatorer === "object",
  );
  const perHorisont: Record<string, number | null> = {};
  const alla: number[] = [];
  for (const hz of VALIDERING_HORIZONTER) {
    const score = giltiga.map((t) => enighetPerHorisont(t.indikatorer)[hz]).filter(
      (s): s is number => typeof s === "number",
    );
    for (const s of score) alla.push(s);
    perHorisont[hz] = score.length > 0 ? Math.round(score.reduce((a, b) => a + b, 0) / score.length) : null;
  }
  const total = alla.length > 0 ? Math.round(alla.reduce((a, b) => a + b, 0) / alla.length) : null;
  return { total, perHorisont };
}

// ── Dombygge + rullande räknare ──────────────────────────────────────────────

/** EN dom: förra rondens klass mot dagens utfall för (ticker, horisont). */
export type VagvalideringDom = {
  ticker: string;
  horisont: string;
  klassForrigeRond: VagKlass;
  utfallMomentum: number | null;
  dom: Dom;
};

/**
 * Bygger domarna i kanonisk ordning (universumordning × horisontordning).
 * klasser = förra rondens Klass per ticker och horisont (ur total-talet),
 * momenter = dagens faktiska medel-momentum per ticker och horisont.
 * Saknas en sida → dom osatt (aldrig dömt). Domad invariant: varje rads
 * dom är återskapbar ur sina egna fält via domVagvalidering.
 */
export function byggaDomar(
  universum: readonly string[],
  klasser: Record<string, Record<string, string> | undefined | null>,
  momenter: Record<string, Record<string, number | null> | undefined | null>,
): VagvalideringDom[] {
  const ut: VagvalideringDom[] = [];
  for (const t of universum) {
    for (const hz of VALIDERING_HORIZONTER) {
      const raklass = klasser?.[t]?.[hz];
      const klass: VagKlass =
        raklass === "impulsvåg" || raklass === "korrigering" || raklass === "basbygge" ? raklass : "osatt";
      const mom = momenter?.[t]?.[hz];
      const utfall = typeof mom === "number" && Number.isFinite(mom) ? mom : null;
      ut.push({ ticker: t, horisont: hz, klassForrigeRond: klass, utfallMomentum: utfall, dom: domVagvalidering(klass, utfall, hz) });
    }
  }
  return ut;
}

/** Räknare per (horisont, klass): träff/miss/osatt. */
export type KlassRaknare = { traff: number; miss: number; osatt: number };

/** Rullande tillstånd: horisont → klass → räknare (sedan driftsättningsdatum). */
export type RullandeTillstand = Record<string, Record<string, KlassRaknare>>;

/** Nollställt rullande tillstånd — alla (horisont, klass)-kombinationer närvarande. */
export function tomRullande(): RullandeTillstand {
  const ut: RullandeTillstand = {};
  for (const hz of VALIDERING_HORIZONTER) {
    ut[hz] = {};
    for (const klass of VAGKLASSER_ALLA) {
      ut[hz][klass] = { traff: 0, miss: 0, osatt: 0 };
    }
  }
  return ut;
}

function heltal(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

/**
 * Rullar fram det bärande tillståndet med nya domar (PURE: lämnar indata
 * orörd, returnerar en ny struktur). Endast kända horisonter/klasser bärs
 * fram — korrupta nycklar tappas hederligt i stället för att smitta vidare.
 */
export function rullaFram(
  barande: RullandeTillstand | null | undefined,
  domar: readonly VagvalideringDom[] | null | undefined,
): RullandeTillstand {
  const ut = tomRullande();
  if (barande && typeof barande === "object") {
    for (const hz of VALIDERING_HORIZONTER) {
      const rad = barande[hz];
      if (!rad || typeof rad !== "object") continue;
      for (const klass of VAGKLASSER_ALLA) {
        const r = rad[klass];
        if (r && typeof r === "object") {
          ut[hz][klass] = { traff: heltal(r.traff), miss: heltal(r.miss), osatt: heltal(r.osatt) };
        }
      }
    }
  }
  for (const d of Array.isArray(domar) ? domar : []) {
    if (!d) continue;
    if (!(VALIDERING_HORIZONTER as readonly string[]).includes(d.horisont)) continue;
    if (!(VAGKLASSER_ALLA as readonly string[]).includes(d.klassForrigeRond)) continue;
    const raknare = ut[d.horisont][d.klassForrigeRond];
    if (d.dom === "traff") raknare.traff += 1;
    else if (d.dom === "miss") raknare.miss += 1;
    else raknare.osatt += 1;
  }
  return ut;
}

/** Träff-% = träff/(traff+miss), heltal 0–100. Null när inget är dömt (n=0). */
export function traffProcent(r: KlassRaknare | null | undefined): number | null {
  if (!r) return null;
  const n = heltal(r.traff) + heltal(r.miss);
  return n > 0 ? Math.round((100 * heltal(r.traff)) / n) : null;
}

/** Osatt-andel i procent (0–100) av SAMTLIGA mätningar — täckningsbråket. */
export function osattAndelProcent(r: KlassRaknare | null | undefined): number | null {
  if (!r) return null;
  const n = heltal(r.traff) + heltal(r.miss) + heltal(r.osatt);
  return n > 0 ? Math.round((100 * heltal(r.osatt)) / n) : null;
}

/** Antal dömda mätningar (träff + miss — osatta räknas aldrig som fel). */
export function antalDomda(r: KlassRaknare | null | undefined): number {
  return r ? heltal(r.traff) + heltal(r.miss) : 0;
}

// ── BANA B (AKM3-BESLUT §7, steg 2): per-variabel-dom + episodkedja ──────────

/**
 * EN per-variabel-dom — tabellen `vagvalidering_dom` med STYRELSE-vag-exakthet
 * §3.2:s schema EXAKT (r1 §5 fas 2): (ticker, variabel, horisont, domat_datum,
 * traff_datum, klass, utfall_momentum, traff, episod_id, protokoll_version).
 *
 * TOLKNING (dokumenterad, beslutet ger fältnamnen men inte definitionen):
 *  - domat_datum = datumet då KLASSEN sattes (förra rondens scan — "dom" =
 *    motorns klassning av variabelns EGEN serie vid det tillfället);
 *  - traff_datum = datumet då UTFOLLET mättes och domen föll (dagens scan);
 *  - traff = true endast vid dom "traff" (miss/osatt ⇒ false — domen är
 *    återskapbar ur (klass, utfall_momentum, horisont) via domVagvalidering);
 *  - episod_id = episod-identitet: en episod avgränsas av KLASSBYTE (osatt
 *    avgränsar också) — dagar räknas ALDRIG som observationer (FORBUD §10.7).
 */
export type VagvalideringVariabelDom = {
  ticker: string;
  variabel: string;
  horisont: string;
  domat_datum: string;
  traff_datum: string;
  klass: VagKlass;
  utfall_momentum: number | null;
  traff: boolean;
  episod_id: string;
  protokoll_version: number;
};

/** Ny episod-identitet: ticker|variabel|horisont|klass|startdatum (deterministisk). */
export function raknaEpisodId(
  ticker: string,
  variabel: string,
  horisont: string,
  klass: string,
  startDatum: string,
): string {
  return `${ticker}|${variabel}|${horisont}|${klass}|${startDatum}`;
}

/** Sanera en motorklass (med eller utan å) → VagKlass-unionen; ogiltigt ⇒ osatt. */
function sakradKlass(k: unknown): VagKlass {
  return k === "impulsvåg" || k === "korrigering" || k === "basbygge" ? k : "osatt";
}

/**
 * Bygg Bana B-domarna i kanonisk ordning (universum × variabler stigande ×
 * horisontordning). Ren funktion:
 *  - klasser[ticker][variabel][hz] = FÖRRA rondens klass (ur scanns vager);
 *  - momenter[ticker][variabel][hz] = DAGENS faktiska momentum i procent
 *    (variabelns EGEN serie — inte universumets medeltal);
 *  - tidigareRader = föregående events vagvalidering_dom-rader (episodkedjan:
 *    oförändrad klass ⇒ samma episod_id ÄRVS, klassbyte/osatt ⇒ ny episod);
 *  - domat_datum/traff_datum = klassens/utfallets datum.
 * Saknas en sida ⇒ klass osatt/momentum null ⇒ dom osatt (aldrig dömt).
 */
export function byggaVariabelDomar(
  universum: readonly string[],
  klasser: Record<string, Record<string, Record<string, unknown>> | undefined | null>,
  momenter: Record<string, Record<string, Record<string, number | null>> | undefined | null>,
  tidigareRader: readonly VagvalideringVariabelDom[] | null | undefined,
  domatDatum: string,
  traffDatum: string,
): VagvalideringVariabelDom[] {
  // Episoduppslag per (ticker, variabel, horisont) ur föregående ronder.
  const episod = new Map<string, VagvalideringVariabelDom>();
  for (const r of Array.isArray(tidigareRader) ? tidigareRader : []) {
    if (r && typeof r.ticker === "string") episod.set(`${r.ticker}|${r.variabel}|${r.horisont}`, r);
  }

  const ut: VagvalideringVariabelDom[] = [];
  for (const t of universum) {
    // Variablerna: unionen av dem som finns i klasser eller momenter, stigande.
    const vis = new Set<string>([
      ...Object.keys(klasser?.[t] ?? {}),
      ...Object.keys(momenter?.[t] ?? {}),
    ]);
    for (const v of [...vis].sort()) {
      for (const hz of VALIDERING_HORIZONTER) {
        const klass = sakradKlass(klasser?.[t]?.[v]?.[hz]);
        const raa = momenter?.[t]?.[v]?.[hz];
        const utfall = typeof raa === "number" && Number.isFinite(raa) ? raa : null;
        const dom = domVagvalidering(klass, utfall, hz);
        // Episod: oförändrad klass sedan förra domade ronden ⇒ ÄrV episod-id;
        // klassbyte (inkl. till/från osatt) ⇒ ny episod startad idag.
        const prev = episod.get(`${t}|${v}|${hz}`);
        const episodId =
          prev && prev.klass === klass && typeof prev.episod_id === "string" && prev.episod_id !== ""
            ? prev.episod_id
            : raknaEpisodId(t, v, hz, klass, traffDatum);
        ut.push({
          ticker: t,
          variabel: v,
          horisont: hz,
          domat_datum: domatDatum,
          traff_datum: traffDatum,
          klass,
          utfall_momentum: utfall,
          traff: dom === "traff",
          episod_id: episodId,
          protokoll_version: VAGVALIDERING_PROTOKOLL_VERSION,
        });
      }
    }
  }
  return ut;
}

/**
 * Räknare per variabel (horisonter hopslagna): STYRELSE §3.2 fas 2:s
 * `traffPerVariabel` i råform. Ren funktion — kalibreringen (steg 6–7)
 * konsumerar episod-rader, detta är presentationens aggregat.
 */
export function raknaVariabelRaknare(
  rader: readonly VagvalideringVariabelDom[] | null | undefined,
): Record<string, KlassRaknare> {
  const ut: Record<string, KlassRaknare> = {};
  for (const r of Array.isArray(rader) ? rader : []) {
    if (!r || typeof r.variabel !== "string") continue;
    if (!ut[r.variabel]) ut[r.variabel] = { traff: 0, miss: 0, osatt: 0 };
    // Domen återskapas ur radens egna fält (granskningsbar rad för rad).
    const dom = domVagvalidering(r.klass, r.utfall_momentum, r.horisont);
    if (dom === "traff") ut[r.variabel].traff += 1;
    else if (dom === "miss") ut[r.variabel].miss += 1;
    else ut[r.variabel].osatt += 1;
  }
  return ut;
}

/**
 * Episodvalidering (acceptanskriterium §11.2.iv): antal DISTINKTA episoder
 * för en (ticker, variabel, horisont) får ALDRIG överstiga antal mättade
 * dagar — varje episod spänner minst en mätning (dagar räknas aldrig som
 * observationer, men sätter taket på episoder). Ren funktion.
 */
export function raknaEpisoder(
  rader: readonly VagvalideringVariabelDom[] | null | undefined,
  nyckel: { ticker: string; variabel: string; horisont: string },
): number {
  const setta = new Set<string>();
  for (const r of Array.isArray(rader) ? rader : []) {
    if (!r) continue;
    if (r.ticker !== nyckel.ticker || r.variabel !== nyckel.variabel || r.horisont !== nyckel.horisont) continue;
    if (typeof r.episod_id === "string" && r.episod_id !== "") setta.add(r.episod_id);
  }
  return setta.size;
}

// ── vagklass_snapshot (AKM3-BESLUT §7: r3 väg 2 — skrivs av vagscan-cronen) ──

/** En snapshotrad — schemat exakt: (ticker, variabel, horisont, snapshot_datum, klass, protokoll_version). */
export type VagklassSnapshotRad = {
  ticker: string;
  variabel: string;
  horisont: string;
  snapshot_datum: string;
  klass: VagKlass;
  protokoll_version: number;
};

/** Deterministisk kvartalsnyckel ur ett ISO-datum: "2026-09-04" → "2026Q3". */
export function kvartalsNyckel(datum: string): string {
  if (typeof datum !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return "";
  const manad = Number(datum.slice(5, 7));
  if (!Number.isFinite(manad) || manad < 1 || manad > 12) return "";
  return `${datum.slice(0, 4)}Q${Math.ceil(manad / 3)}`;
}

/**
 * Bygg kvartalssnapshot-rader ur ett motor-/scansvar (struktur-utsnitt av
 * MotorSvar.tickers: fel-fria tickers med indikatorer). Kanonisk ordning:
 * tickerordning × variabler stigande × horisontordning. Ren funktion —
 * cronen deduplicerar per kvartal innan den skriver (tabell `vagklass_snapshot`).
 */
export function byggVagklassSnapshotRader(
  tickers: readonly { ticker?: string; fel?: string | null; indikatorer?: Record<string, { vager?: Record<string, unknown> }> | null }[] | null | undefined,
  snapshotDatum: string,
): VagklassSnapshotRad[] {
  const ut: VagklassSnapshotRad[] = [];
  const rena = (Array.isArray(tickers) ? tickers : [])
    .filter((t) => !!t && !t.fel && typeof t.ticker === "string" && !!t.indikatorer)
    .sort((a, b) => (String(a.ticker) < String(b.ticker) ? -1 : String(a.ticker) > String(b.ticker) ? 1 : 0));
  for (const t of rena) {
    for (const v of Object.keys(t.indikatorer ?? {}).sort()) {
      for (const hz of VALIDERING_HORIZONTER) {
        ut.push({
          ticker: t.ticker as string,
          variabel: v,
          horisont: hz,
          snapshot_datum: snapshotDatum,
          klass: sakradKlass(t.indikatorer?.[v]?.vager?.[hz]),
          protokoll_version: VAGVALIDERING_PROTOKOLL_VERSION,
        });
      }
    }
  }
  return ut;
}

// ── Rapportbyggare (ren strängfunktion — deterministisk, testbar) ────────────

/** Allt en rapport (och en system_events-rad) behöver veta om en rond. */
export type VagvalideringSammanstallning = {
  genererad: string;
  datum: string;
  universum: readonly string[];
  kallaKlasser: string;
  kallaMomentum: string;
  domar: readonly VagvalideringDom[];
  rullande: RullandeTillstand;
  /** Startdatum för de rullande räknarna (driftsättningsdagen). */
  rullandeSedan: string | null;
};

const HZ_NAMN: Record<string, string> = {
  mikro: "mikro",
  kort: "kort",
  medellang: "medellång",
  lang: "lång",
  mega: "mega",
};

/** "67 % (n=6)" — osatta redovisas inom parentes när de finns. */
function traffText(r: KlassRaknare): string {
  const p = traffProcent(r);
  const n = antalDomda(r);
  const osatt = osattAndelProcent(r);
  if (p === null) return "— (n=0)";
  return osatt !== null && osatt > 0 ? String(p) + " % (n=" + String(n) + ", osatta " + String(osatt) + " %)" : String(p) + " % (n=" + String(n) + ")";
}

/**
 * data/rapporter/vagvalidering-SENASTE.md — träff-%-tabell per horisont och
 * klass, antal mätningar, osatt-andel, dagens domar samt protokolltexten.
 * Ren funktion: samma sammanställning → byte-identisk rapport.
 */
export function byggVagvalideringRapport(s: VagvalideringSammanstallning): string {
  const linjer: string[] = [];
  linjer.push("# Vågvalidering — vågmotorns träffhistorik");
  linjer.push("");
  linjer.push(
    "**Genererad:** " + s.genererad +
    " · **Protokoll:** " + VAGVALIDERING_SCHEMA + " v" + String(VAGVALIDERING_PROTOKOLL_VERSION) +
    " · **Domdatum:** " + s.datum,
  );
  linjer.push(
    "**Källor:** förra rondens klasser från " + s.kallaKlasser + " · dagens momentum från " + s.kallaMomentum +
    " · **Universum:** " + String(s.universum.length) + " tickers",
  );
  if (s.rullandeSedan) linjer.push("**Rullande räknare sedan:** " + s.rullandeSedan);
  linjer.push("");
  linjer.push(
    "> **Dom-protokoll v" + String(VAGVALIDERING_PROTOKOLL_VERSION) + " (fastställt innan första domen):** förra rondens vågklass per (ticker, horisont) döms mot dagens faktiska fundamentmomentum — impulsvåg → träff vid positiv momentum; korrigering → träff vid negativ; basbygge → träff vid |momentum| ≤ tröskeln per horisont (v2, AKM3-BESLUT §7: mikro/kort 6 % · medellång 15 % · lång/mega 25 %); exakt nollrörelse dömer inte riktning; osatt klass döms ALDRIG. Osatta räknas i täckningsbråket, aldrig som fel.",
  );
  linjer.push("");
  linjer.push("## Rullande träff-% per horisont och klass");
  linjer.push("");
  linjer.push("| Horisont | impulsvåg | korrigering | basbygge | osatt klass |");
  linjer.push("|---|---|---|---|---|");
  for (const hz of VALIDERING_HORIZONTER) {
    const rad = s.rullande[hz] ?? {};
    linjer.push(
      "| " + HZ_NAMN[hz] + " | " + traffText(rad["impulsvåg"]) + " | " + traffText(rad["korrigering"]) + " | " + traffText(rad["basbygge"]) + " | " + traffText(rad["osatt"]) + " |",
    );
  }
  linjer.push("");
  linjer.push("_n = antal dömda mätningar (träff + miss). Osatta andelar redovisas inom parentes och räknas aldrig som fel._");
  linjer.push("");

  // Totalrad — hela tillståndet summerat
  let tTraff = 0;
  let tMiss = 0;
  let tOsatt = 0;
  for (const hz of VALIDERING_HORIZONTER) {
    for (const klass of VAGKLASSER_ALLA) {
      const r = s.rullande[hz]?.[klass];
      if (!r) continue;
      tTraff += heltal(r.traff);
      tMiss += heltal(r.miss);
      tOsatt += heltal(r.osatt);
    }
  }
  const totalProcent = tTraff + tMiss > 0 ? Math.round((100 * tTraff) / (tTraff + tMiss)) : null;
  const totalOsatt = tTraff + tMiss + tOsatt > 0 ? Math.round((100 * tOsatt) / (tTraff + tMiss + tOsatt)) : null;
  linjer.push(
    "**Totalt:** " + (totalProcent === null ? "—" : String(totalProcent) + " % träff") +
    " (n=" + String(tTraff + tMiss) + " dömda" +
    (totalOsatt !== null ? ", osatta " + String(totalOsatt) + " % av alla mätningar" : "") + ")" +
    (s.rullandeSedan ? " — räknare sedan " + s.rullandeSedan : "") + ".",
  );
  linjer.push("");

  linjer.push("## Dagens domar (" + String(s.domar.filter((d) => d.dom !== "osatt").length) + " dömda av " + String(s.domar.length) + ")");
  linjer.push("");
  for (const t of s.universum) {
    const domar = s.domar.filter((d) => d.ticker === t);
    if (domar.length === 0) continue;
    // varje del visar klassen också — domen ska gå att härleda ur raden själv
    const delar = domar.map((d) =>
      HZ_NAMN[d.horisont] + ": " + d.klassForrigeRond + " → " +
      (d.dom === "osatt" ? "osatt" : d.dom === "traff" ? "träff ✓" : "miss ✗") +
      (d.utfallMomentum !== null ? " (" + String(d.utfallMomentum).replace(".", ",") + " %)" : ""),
    );
    linjer.push("- **" + t + "** — " + delar.join(" · "));
  }
  linjer.push("");
  linjer.push(
    "_Pedagogisk mätning — inte investeringsråd. Träff-% är ett öppet kvitto om det förflutna, aldrig en garanti om framtiden: motorn beskriver rytm och läge i fundamentalserier, och \"osatt\" är information, inte fel._",
  );
  linjer.push("");
  return linjer.join("\n");
}
