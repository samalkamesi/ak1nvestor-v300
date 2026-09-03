"use client";

/**
 * SUPERANALYSEN — guidad aktieanalys i 24 steg (AK1A Research Lab)
 *
 * Steg 1: bolagsuppgifter · steg 2–21: AKM1:s 20 variabler (V01–V20, 0–5 poäng)
 * steg 22: AK1TS vågklass-gissning per horisont · steg 23: granskning ·
 * steg 24: resultat med kategori-radial, staplar och rekommendationsband.
 *
 * POÄNGLOGIK (deklarerad före resultat — metoden styr, aldrig tvärtom):
 * - Varje variabel poängsätts 0–5 (heltal).
 * - Kategoripoäng = snittet av kategorins variabler (0–5).
 * - Totalpoäng = Σ (kategorisnitt ÷ 5 × kategorivikt × 100) → max 100.
 *
 * KATEGORIVIKTER (dokumenterade, summa = 100 %):
 *   Tillväxt V01–V03 ............ 15 %
 *   Värdering V04–V06 ........... 20 %
 *   Lönsamhet V07–V09 ........... 20 %
 *   Stabilitet V10–V12 ........... 15 %
 *   Moat V13–V15 ................ 15 %
 *   Katalysator V16–V18 .......... 5 %  (aldrig avgöra portföljvikt)
 *   Risk V19–V20 ................ 10 %
 *
 * Rekommendationsbanden är PEDAGOGISKA ("Studera vidare / Skjut inte /
 * Aktör att följa") — aldrig köp/sälj, aldrig investeringsråd.
 */

// ── Typer ────────────────────────────────────────────────────────────────────

export type KategoriId =
  | "tillvaxt"
  | "vardering"
  | "lonsamhet"
  | "stabilitet"
  | "moat"
  | "katalysator"
  | "risk";

/** AK1TS-vågklass — elevens egen gissning innan motor/-data vägs in. */
export type VagKlass = "impulsvåg" | "korrigering" | "basbygge";

/** Fem tidshorisonter enligt AK1TS (5 × 5 × 4-ramverket). */
export type HorisontId = "mikro" | "kort" | "medellang" | "lang" | "mega";

/** En fullständig (eller pågående) superanalys. */
export type SuperanalysData = {
  id: string;
  bolag: string;
  ticker: string;
  /** V01–V20 → 0–5. Saknad variabel = inte poängsatt än. */
  poang: Record<string, number>;
  /** Vågklass-gissning per horisont. "" = ej gissat. */
  vagor: Record<HorisontId, VagKlass | "">;
  /** ISO-datum (YYYY-MM-DD) för senaste ändring. */
  datum: string;
};

export type Akm1Variabel = {
  id: string; // "V01" … "V20"
  namn: string;
  kategori: KategoriId;
  /** Formel eller mått som variabeln bygger på. */
  formel: string;
  /** Kort svensk förklaring (1–2 meningar) som visas i wizarden. */
  hjalp: string;
  /** Typiska trösklar för tooltips på poängknapparna 0 / 3 / 5. */
  trosklar: { t0: string; t3: string; t5: string };
  /** Extra varning (t.ex. katalysatorer ska aldrig sätta portföljvikt). */
  obs?: string;
};

export type Kategori = {
  id: KategoriId;
  namn: string;
  /** Vikt 0–1; summan av alla vikter = 1. */
  vikt: number;
};

// ── Kategorier och vikter ────────────────────────────────────────────────────

export const KATEGORIER: Kategori[] = [
  { id: "tillvaxt", namn: "Tillväxt", vikt: 0.15 },
  { id: "vardering", namn: "Värdering", vikt: 0.2 },
  { id: "lonsamhet", namn: "Lönsamhet", vikt: 0.2 },
  { id: "stabilitet", namn: "Stabilitet", vikt: 0.15 },
  { id: "moat", namn: "Moat", vikt: 0.15 },
  { id: "katalysator", namn: "Katalysator", vikt: 0.05 },
  { id: "risk", namn: "Risk", vikt: 0.1 },
];

// ── AKM1:s 20 variabler ──────────────────────────────────────────────────────

export const AKM1_VARIABLER: Akm1Variabel[] = [
  {
    id: "V01",
    namn: "Försäljningstillväxt",
    kategori: "tillvaxt",
    formel: "(Nettoomsättning i år − förra året) ÷ förra året",
    hjalp:
      "Hur snabbt växer bolagets omsättning? Tillväxten är motorn som kan flerbelägga kapitalet — men bara om den är lönsam.",
    trosklar: { t0: "0 = negativ tillväxt (krympande omsättning)", t3: "3 = cirka 10 % årlig tillväxt", t5: "5 = 20 % tillväxt eller mer" },
  },
  {
    id: "V02",
    namn: "ARR-tillväxt",
    kategori: "tillvaxt",
    formel: "ARR i år ÷ ARR förra året − 1 (årliga återkommande intäkter)",
    hjalp:
      "Farten på prenumerationsintäkterna (ARR). Främst relevant för SaaS-bolag — stabila, återkommande intäkter är värda mer än engångsaffärer.",
    trosklar: { t0: "0 = krympande ARR", t3: "3 = cirka 15 % ARR-tillväxt", t5: "5 = 30 % ARR-tillväxt eller mer" },
  },
  {
    id: "V03",
    namn: "Intäktsdiversifiering",
    kategori: "tillvaxt",
    formel: "Andel intäkter från största kund/segment + antal intäktsben",
    hjalp:
      "Är intäkterna utspridda över många kunder och segment — eller sitter hela risken hos en enda storkund? Få ben att stå på gör tillväxten skör.",
    trosklar: { t0: "0 = starkt beroende av en kund/ett segment", t3: "3 = viss koncentration finns", t5: "5 = bred spridning, ingen kund över ~10 %" },
  },
  {
    id: "V04",
    namn: "P/S",
    kategori: "vardering",
    formel: "Börsvärde ÷ nettoomsättning",
    hjalp:
      "Priset per intäktskrona. Jämför alltid mot bolagets egen historik och sektorn — ett lågt P/S mot historik tyder på lägre förväntningar inprisade.",
    trosklar: { t0: "0 = kraftig premie mot historik och sektor", t3: "3 = i nivå med historik/sektor", t5: "5 = mycket billig mot historik och sektor" },
  },
  {
    id: "V05",
    namn: "P/B",
    kategori: "vardering",
    formel: "Börsvärde ÷ eget kapital",
    hjalp:
      "Priset per bokförd krona. Som riktvärde tyder ett lågt P/B på att marknaden prissätter lite framtida avkastning på det egna kapitalet.",
    trosklar: { t0: "0 = kraftig premie mot historik och sektor", t3: "3 = i nivå med historik/sektor", t5: "5 = mycket billig mot historik och sektor" },
  },
  {
    id: "V06",
    namn: "EV/EBITDA",
    kategori: "vardering",
    formel: "(Börsvärde + räntebärande skulder − kassa) ÷ EBITDA",
    hjalp:
      "Vad hela bolaget kostar i förhållande till dess kassflödesgenererande kärna — skuldneutral jämförelse mellan bolag med olika kapitalstruktur.",
    trosklar: { t0: "0 = kraftig premie mot historik och sektor", t3: "3 = i nivå med historik/sektor", t5: "5 = mycket billig mot historik och sektor" },
  },
  {
    id: "V07",
    namn: "Bruttomarginal",
    kategori: "lonsamhet",
    formel: "(Nettoomsättning − rörelsens kostnader) ÷ nettoomsättning",
    hjalp:
      "Vad som blir kvar av varje intäktskrona före administration och personalkostnader. Hög och stabil bruttomarginal är ett pris-makt-spår.",
    trosklar: { t0: "0 = negativ eller extremt tunn marginal", t3: "3 = cirka 25 %", t5: "5 = 40 % eller högre" },
  },
  {
    id: "V08",
    namn: "EBITDA-marginal",
    kategori: "lonsamhet",
    formel: "EBITDA ÷ nettoomsättning",
    hjalp:
      "Rörelsens lönsamhet före avskrivningar, räntor och skatt. Visar om affären tjänar pengar i botten — oavsett finansieringsstruktur.",
    trosklar: { t0: "0 = negativ EBITDA", t3: "3 = cirka 10 %", t5: "5 = 20 % eller högre" },
  },
  {
    id: "V09",
    namn: "ROE",
    kategori: "lonsamhet",
    formel: "Resultat efter skatt ÷ snitt(eget kapital början och slut)",
    hjalp:
      "Avkastningen på det egna kapitalet — ägarnas faktiska sammansatta ränta. Vägs gärna mot hur mycket skuld som hjälper till att lyfta den.",
    trosklar: { t0: "0 = negativt resultat", t3: "3 = 10 % eller högre", t5: "5 = 20 % eller högre" },
  },
  {
    id: "V10",
    namn: "Skuldsättningsgrad",
    kategori: "stabilitet",
    formel: "Skulder och övriga förpliktelser ÷ eget kapital",
    hjalp:
      "Hur ansträngd balansräkningen är. Skuld förstärker uppgångar och förvärrar nedgångar — låg skuld ger rånmån att växa i motvind.",
    trosklar: { t0: "0 = mycket hög eller ohållbar skuldsättning", t3: "3 = moderat (cirka 1–2x)", t5: "5 = låg skuld (under cirka 0,5x)" },
  },
  {
    id: "V11",
    namn: "Likviditet",
    kategori: "stabilitet",
    formel: "Omsättningstillgångar ÷ kortfristiga skulder (kvickkvot)",
    hjalp:
      "Kan bolaget betala sina närmaste åtaganden? Kvickkvot under 1 betyder att korta skulder överstiger det snabbt realiserbara — en varningsflagg.",
    trosklar: { t0: "0 = kvick under 1 (ansträngd likviditet)", t3: "3 = cirka 1–1,5", t5: "5 = kvick över 2" },
  },
  {
    id: "V12",
    namn: "Intäktsstabilitet",
    kategori: "stabilitet",
    formel: "Variation i omsättning/resultat över 5 år",
    hjalp:
      "Hur jämna intäkterna är över tiden. Återkommande intäkter och bred kundbas ger förutsägbarhet — konjunktur-/projektintäkter svänger kraftigt.",
    trosklar: { t0: "0 = kraftigt svängande intäkter", t3: "3 = konjunkturkänsligt men hanterbart", t5: "5 = stabila, förutsägbara intäkter" },
  },
  {
    id: "V13",
    namn: "Patent & IP",
    kategori: "moat",
    formel: "Patent, licenser och immateriella tillgångar som skyddar affären",
    hjalp:
      "Skyddar lagar och licenser bolagets teknik? En bevisad moat syns i att marginalerna håller över tid trots konkurrenternas försök.",
    trosklar: { t0: "0 = inget skydd, lätt att kopiera", t3: "3 = visst skydd eller delvis unikt", t5: "5 = stark, bevisad moat som håller marginalerna uppe" },
  },
  {
    id: "V14",
    namn: "Varumärke & Kundlojalitet",
    kategori: "moat",
    formel: "Marknadsandelar, kundnöjdhet, upprepade köp, prissättningsmakt",
    hjalp:
      "Betalar kunderna extra eller återkommer av vana? Ett starkt varumärke är en moat som syns i bruttomarginalen och låg kundomsättning.",
    trosklar: { t0: "0 = svagt/okänt varumärke, ingen lojalitet", t3: "3 = känt men utan prissättningsmakt", t5: "5 = stark, bevisad moat (lojala kunder, prissättningsmakt)" },
  },
  {
    id: "V15",
    namn: "Nätverkseffekter",
    kategori: "moat",
    formel: "Växer värdet per användare när antalet användare växer?",
    hjalp:
      "Blir produkten bättre ju fler som använder den (plattformar, marknadsplatser)? Nätverkseffekter är den starkaste — och svåraste — moaten att konkurrera bort.",
    trosklar: { t0: "0 = inga nätverkseffekter", t3: "3 = svaga/lokala nätverkseffekter", t5: "5 = stark, bevisad moat — värdet växer med användarbasen" },
  },
  {
    id: "V16",
    namn: "Produktlanseringar",
    kategori: "katalysator",
    formel: "Pipeline: kommande lanseringar och deras tröskel till intäkt",
    hjalp:
      "Vad kan förändra berättelsen framåt? En pipeline med tydliga trösklar (godkännanden, releaser) ger tidsatta bevis — inte bara hopp.",
    trosklar: { t0: "0 = tom pipeline", t3: "3 = möjliga lanseringar, osäker timing", t5: "5 = tydliga, tidsatta katalysatorer" },
    obs: "Katalysatorer ska ALDRIG avgöra portföljvikt — därför är kategorin viktad lågt (5 %).",
  },
  {
    id: "V17",
    namn: "Avtal & Partnerskap",
    kategori: "katalysator",
    formel: "Tecknade avtal, avsiktsförklaringar och partnerskapspipeline",
    hjalp:
      "Vilka konkreta avtal kan lägga intäkter ovanpå basen? Skilj på signerade avtal (hårt) och avsiktsförklaringar (mjukt).",
    trosklar: { t0: "0 = inga avtal i sikte", t3: "3 = diskussioner/avsiktsförklaringar", t5: "5 = tydliga, signerade katalysatorer" },
    obs: "Katalysatorer ska ALDRIG avgöra portföljvikt — därför är kategorin viktad lågt (5 %).",
  },
  {
    id: "V18",
    namn: "Regulatoriska katalysatorer",
    kategori: "katalysator",
    formel: "Myndighetsbeslut, godkännanden, lagändringar på väg",
    hjalp:
      "Väntande beslut från myndigheter kan öppna eller stänga marknader över en natt. Binära händelser kräver särskild ödmjukhet i storlek.",
    trosklar: { t0: "0 = regelverk riskerar emot bolaget", t3: "3 = oklara regulatoriska drivkrafter", t5: "5 = tydliga katalysatorer som gynnar bolaget" },
    obs: "Katalysatorer ska ALDRIG avgöra portföljvikt — därför är kategorin viktad lågt (5 %).",
  },
  {
    id: "V19",
    namn: "Kassatäckning — nyemissionsrisk",
    kategori: "risk",
    formel: "Kassaflöde från löpande verksamheten ÷ kassabehållning (runway)",
    hjalp:
      "Hur länge räcker kassan om inflödet slutar — och hur troligt är en utspädande emission? Brinnande kassaflöde är den klassiska småbolagsfällan.",
    trosklar: { t0: "0 = akut emission-risk, utspädning nära förestående", t3: "3 = förbränning men god runway", t5: "5 = positivt kassaflöde, ingen dilution i sikte" },
  },
  {
    id: "V20",
    namn: "Återköp",
    kategori: "risk",
    formel: "Återköp/insiderköp i förhållande till inre värde",
    hjalp:
      "Återköper bolaget — eller insiderna — aktier när de är billiga? Kapitalåterföring under inre värde är rationell; köp på topp är värdeförstörande signalstyrka.",
    trosklar: { t0: "0 = värdeförstörande köp/utspädande emissioner", t3: "3 = neutral aktivitet", t5: "5 = rationella återköp under inre värde" },
  },
];

// ── AK1TS: horisonter och vågklasser ─────────────────────────────────────────

export const HORIZONTER: Array<{ id: HorisontId; namn: string; spans: string; hjalp: string }> = [
  { id: "mikro", namn: "Mikro", spans: "dagar–veckor", hjalp: "Intradag- till veckonivå: brus, men ibland tidiga fotspår." },
  { id: "kort", namn: "Kort", spans: "veckor–månader", hjalp: "Svängningar som bär kvartalsresultat och nyhetsflöden." },
  { id: "medellang", namn: "Medellång", spans: "månader–kvartal", hjalp: "Rapportcykler och re-rating av multipeln brukar leva här." },
  { id: "lang", namn: "Lång", spans: "flera år", hjalp: "Primärvågor som speglar äkta tillväxt- och vinstcykler." },
  { id: "mega", namn: "Mega", spans: "decennier", hjalp: "Sekulära krafter — teknikskiften och demografi." },
];

export const VAGKLASSER: Array<{ id: VagKlass; ikon: string; etikett: string; hjalp: string }> = [
  { id: "impulsvåg", ikon: "▲", etikett: "Impulsvåg", hjalp: "Trendriktad rörelse i fem vågor — momentum driver priset." },
  { id: "korrigering", ikon: "▼", etikett: "Korrigering", hjalp: "Motriktad rörelse i tre vågor — konsolidering eller utspädning." },
  { id: "basbygge", ikon: "◼", etikett: "Basbygge", hjalp: "Sidledes ackumulation — energi byggs för nästa utbrott." },
];

// ── Poänglogik ───────────────────────────────────────────────────────────────

/** Kategorisnitt 0–5 per kategori (saknade variabler räknas som 0). */
export function raknaKategorier(poang: Record<string, number>): Record<KategoriId, number> {
  const ut = {} as Record<KategoriId, number>;
  for (const kat of KATEGORIER) {
    const vars = AKM1_VARIABLER.filter((v) => v.kategori === kat.id);
    ut[kat.id] = vars.reduce((s, v) => s + (poang[v.id] ?? 0), 0) / vars.length;
  }
  return ut;
}

/** Samlagd poäng 0–100: Σ (kategorisnitt ÷ 5 × vikt × 100). */
export function raknaTotal(poang: Record<string, number>): number {
  const kat = raknaKategorier(poang);
  const total = KATEGORIER.reduce((s, k) => s + (kat[k.id] / 5) * k.vikt * 100, 0);
  return Math.round(total * 10) / 10;
}

/** Alla 20 variabler poängsatta? */
export function arKomplett(data: SuperanalysData): boolean {
  return AKM1_VARIABLER.every((v) => typeof data.poang[v.id] === "number");
}

/** Alla fem vågklasser gissade? */
export function arAk1tsKomplett(data: SuperanalysData): boolean {
  return HORIZONTER.every((h) => data.vagor[h.id] !== "");
}

// ── Rekommendationsband (pedagogiska — aldrig köp/sälj) ─────────────────────

export type Band = {
  id: "aktor" | "studera" | "skjut";
  etikett: string;
  farg: string; // tailwind-klass för etiketten
  beskrivning: string;
};

export function bedomning(total: number): Band {
  if (total >= 75)
    return {
      id: "aktor",
      etikett: "Aktör att följa",
      farg: "text-bull",
      beskrivning:
        "Hög kvalitet i flera oberoende dimensioner. Lägg bolaget på bevakningslistan, bygg kunskap och vänta in ditt entré-kriterium — aldrig tvärtom.",
    };
  if (total >= 45)
    return {
      id: "studera",
      etikett: "Studera vidare",
      farg: "text-gold",
      beskrivning:
        "Blandad bild. Gräv djupare i de svagaste variablerna innan du ens formulerar en tes — svagheterna är din forskningsagenda.",
    };
  return {
    id: "skjut",
    etikett: "Skjut inte",
    farg: "text-bear",
    beskrivning:
      "För många svaga dimensioner just nu. Spara analysen och återkom när fundamenten, katalysatorer eller priset har förändrats — att inte agera är också ett beslut.",
  };
}

/** Korsläsning: pekar din AK1TS-vågläsning och fundamentalpoängen åt samma håll? */
export function ak1tsTolkning(total: number, vagor: Record<HorisontId, VagKlass | "">): string {
  const tagna = HORIZONTER.filter((h) => vagor[h.id] !== "");
  if (tagna.length === 0) return "";
  const impulser = tagna.filter((h) => vagor[h.id] === "impulsvåg").length;
  const korrigeringar = tagna.filter((h) => vagor[h.id] === "korrigering").length;
  if (total >= 60 && impulser >= 3)
    return "Fundamentalt stark bild + impulsvågsinriktad vågläsning: konfluens — men kom ihåg att konfluens aldrig ersätter brytpunkt och riskbudget.";
  if (total >= 60 && korrigeringar >= 3)
    return "Fundamentalt stark bild men vågläsningen säger korrigering: möjlig bättre entré senare. Definiera vilken observation som bevisar dig fel.";
  if (total < 45 && impulser >= 3)
    return "Svag fundamental bild trots impulsvåg i kursen: momentum utan fundament är en berättelse — deklarera din brytpunkt innan du agerar.";
  if (total < 45 && korrigeringar >= 3)
    return "Svag fundamental bild + korrigering i kursläsningen: två oberoende mätinstrument pekar samma håll. Skjut inte — återvänd när bilden förändras.";
  return "Fundamenta och vågläsning drar delvis åt olika håll — det är precis där metodisk disciplin krävs: skriv ned vad som skulle förändra din läsning.";
}

// ── Delningsbar text-sammanfattning ─────────────────────────────────────────

export function byggDelText(data: SuperanalysData): string {
  const total = raknaTotal(data.poang);
  const band = bedomning(total);
  const kat = raknaKategorier(data.poang);
  const katRad = KATEGORIER.map((k) => `${k.namn} ${kat[k.id].toFixed(1)}`).join(" · ");
  const vagRad = HORIZONTER.filter((h) => data.vagor[h.id] !== "")
    .map((h) => `${h.namn}: ${data.vagor[h.id]}`)
    .join(" · ");
  const namn = data.ticker ? `${data.bolag} (${data.ticker.toUpperCase()})` : data.bolag;
  return [
    `Superanalysen — ${namn}`,
    `Poäng: ${String(total).replace(".", ",")}/100 — ${band.etikett}`,
    katRad,
    vagRad ? `AK1TS: ${vagRad}` : "",
    "Pedagogisk analys från AK1A Research Lab — inte investeringsråd.",
  ]
    .filter(Boolean)
    .join("\n");
}

// ── localStorage: utkast (pågående) + sparade analyser ────────────────────────

const NYCKEL_UTKAST = "ak1a-superanalys-utkast-v1";
const NYCKEL_SPARADE = "ak1a-superanalys-sparade-v1";
const MAX_SPARADE = 12;

export function nyAnalys(): SuperanalysData {
  return {
    id: `sa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    bolag: "",
    ticker: "",
    poang: {},
    vagor: { mikro: "", kort: "", medellang: "", lang: "", mega: "" },
    datum: new Date().toISOString().slice(0, 10),
  };
}

/** Normaliserar rådata från localStorage (SSR-säkert, feltolerant). */
function normalisera(rå: unknown): SuperanalysData | null {
  if (typeof rå !== "object" || rå === null) return null;
  const r = rå as Partial<SuperanalysData>;
  if (typeof r.id !== "string" || typeof r.bolag !== "string") return null;
  const poang: Record<string, number> = {};
  if (r.poang && typeof r.poang === "object") {
    for (const v of AKM1_VARIABLER) {
      const p = (r.poang as Record<string, unknown>)[v.id];
      if (typeof p === "number" && p >= 0 && p <= 5) poang[v.id] = Math.round(p);
    }
  }
  const vagor = { mikro: "", kort: "", medellang: "", lang: "", mega: "" } as Record<HorisontId, VagKlass | "">;
  if (r.vagor && typeof r.vagor === "object") {
    for (const h of HORIZONTER) {
      const g = (r.vagor as Record<string, unknown>)[h.id];
      if (g === "impulsvåg" || g === "korrigering" || g === "basbygge") vagor[h.id] = g;
    }
  }
  return {
    id: r.id,
    bolag: r.bolag,
    ticker: typeof r.ticker === "string" ? r.ticker : "",
    poang,
    vagor,
    datum: typeof r.datum === "string" ? r.datum : new Date().toISOString().slice(0, 10),
  };
}

export function lasUtkast(): SuperanalysData | null {
  if (typeof window === "undefined") return null;
  try {
    return normalisera(JSON.parse(localStorage.getItem(NYCKEL_UTKAST) || "null"));
  } catch {
    return null;
  }
}

export function sparaUtkast(data: SuperanalysData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NYCKEL_UTKAST, JSON.stringify(data));
  } catch {
    /* fullt/minne — ignoreras */
  }
}

export function raderaUtkast() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(NYCKEL_UTKAST);
  } catch {}
}

export function lasSparade(): SuperanalysData[] {
  if (typeof window === "undefined") return [];
  try {
    const lista = JSON.parse(localStorage.getItem(NYCKEL_SPARADE) || "[]");
    if (!Array.isArray(lista)) return [];
    return lista.map(normalisera).filter((d): d is SuperanalysData => d !== null);
  } catch {
    return [];
  }
}

/**
 * Sparar analysen (skapar eller uppdaterar på id). Returnerar true om den var
 * NY (första gången) — då förtjänar eleven +100 XP. Uppdatering ger inget.
 */
export function sparaAnalys(data: SuperanalysData): boolean {
  if (typeof window === "undefined") return false;
  const befintliga = lasSparade();
  const varNy = !befintliga.some((d) => d.id === data.id);
  const nyLista = varNy
    ? [data, ...befintliga].slice(0, MAX_SPARADE)
    : befintliga.map((d) => (d.id === data.id ? data : d));
  try {
    localStorage.setItem(NYCKEL_SPARADE, JSON.stringify(nyLista));
  } catch {
    return false;
  }
  return varNy;
}

export function raderaAnalys(id: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      NYCKEL_SPARADE,
      JSON.stringify(lasSparade().filter((d) => d.id !== id))
    );
  } catch {}
}
