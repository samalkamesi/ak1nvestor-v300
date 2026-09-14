/**
 * STYRELSEMOTORN — "AI-styrelsen som lag" (VÅG 91 BLOCK A2,
 * STYRELSE-ADMIN-MEGA.md "TILLÄGG VÅG 91").
 *
 * Kunddirektivet: "jag vill att AI styrelse organen träffas som lag varje
 * gång jag frågar och diskutera och alltid tar allt på störst allvar ...
 * max parallella agenter ... beslut som ska tillämpas omedelbart förutom
 * saker som kan stöda hela sidans karriär och framgång totalt."
 *
 * ARKITEKTUR (stående regler R1–R4 från våg 91):
 *   R1  Varje kundfråga i studion kan konkallas här (multibot-session).
 *   R2  Beslut tillämpas OMEDELBART — utom EXISTENTIELLA åtgärder som
 *       VÄNTAR KUND. Klassningen är HÅRKODAD här (klassaExistential +
 *       EXISTENTIELLA_NYCKELORD); ordförandens egna bedömning får bara
 *       FÖRSTÄRKA (true), aldrig försvaga en nyckelordsträff.
 *   R3  Mega-projekt/vågor beslutas av styrelsen enligt R2.
 *   R4  VÅGOR inom MAX_AKTIVA_BARN=3: analysorganen körs 3 parallellt,
 *       därefter resten, därefter ordföranden ensam — ALDRIG fler än 3
 *       styrelsebarn samtidigt (transportens vaktaMaxBarn är sista försvaret).
 *
 * MÖTESFLÖDE (sammanstyrelsen/startaStyrelsemote):
 *   1. Fyra ANALYSORGAN (Teknik/CTO, Säkerhet, Juridik&Compliance,
 *      Tillväxt/SEO) får kundfrågan + AK1A-kontext och besvarar med kort
 *      analys (max ~300 ord) med "Åtgärd:"-rader — i vågor om högst 3.
 *   2. ORDFÖRANDE (CEO) får de fyra analyserna och producerar BESLUT som
 *      JSON: { beslut, motivering, atgarder[], existential,
 *      rollSammanfattning[] } — tolkas defensivt (kodstaket bort, första
 *      {…}-blocket); ogiltig JSON ⇒ automatisk syntes ur organens egna
 *      Åtgärd:-rader (ALDRIG ett påhittat beslut).
 *   3. R2-klassning → KÖRS DIREKT: åtgärderna appendas som rader i
 *      data/forskning/PIPELINE-KO.md med [STYRELSEN]-prefix (huvudagentens
 *      dispatchlista) — eller VÄNTAR KUND: pipelinen rörs ej.
 *   4. Protokoll: data/forskning/STYRELSE-BESLUT.md (append, daterat) +
 *      system_events type=styrelse_beslut (blogg-utkast-mönstret via
 *      getSupabaseRest; saknad konfig/misslyckande ⇒ fil-fallback
 *      data/forskning/styrelse-event-fallback.jsonl — inget beslut förloras).
 *   5. Mötes-state i minnet (Map id → möte) med NUMRERAD händelselogg så
 *      klienten kan polla inkrementellt (GET ?id=&senast=N ⇒ i>N).
 *
 * TIDSGRÄNSER: möte max ~4 min (MOTE_MAX_MS), enskild roll max 90 s
 * (ROLL_MAX_MS) — timeout ⇒ rollen redovisas som "ute" och mötet fortsätter
 * med de organ som hann. NOLL analyser + ingen tolkningsbar ordförande ⇒
 * status "fel" (ärligt misslyckande, ALDRIG fingerat beslut).
 *
 * ROLLSESSIONERNAS DIALOGPOLICY: rollerna är ANALYTIKER — en permission-
 * dialog besvaras allow_once för låg/medel risk (Read/Grep för kontext är
 * ofarligt) och DENY för hög/kritisk risk (mötesprompter kräver aldrig
 * skrivverktyg); frågekort avbryts (ingen människa i loopen under ett möte).
 * Mötet ska ALDRIG blocka på en obesvarad dialog (KVD-spegling).
 *
 * Säkerhet: endast server-side (Node runtime); inga hemligheter i event-
 * detaljer eller filer; styrelsetexten passerar kontrolleraText-grinden och
 * FEL-klassade fraser byts mot varumärkets ersättningar INNAN beslutet
 * verkställs (ALDRIG investeringsråd-formuleringar — lag 2007:528).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getSupabaseRest } from "../supabase-rest";
import { kontrolleraText } from "../varumarke";
import { skrivAudit } from "./audit-logg";
import { hamtaSessionTransport, studioArbetsyta, type StudioInteraktion, type StudioTransport } from "./studio-transport";

// ── Konstanter ───────────────────────────────────────────────────────────────

/** Event-typen i system_events (blogg-utkast-mönstret: EN typ, details bär allt). */
export const STYRELSE_EVENT_TYP = "styrelse_beslut";
/** source-fältet i event-raden + log-prefix i filerna. */
const STYRELSE_KALLA = "styrelsen";

/** R4: max BREDD per våg — speglar transportens MAX_AKTIVA_BARN=3. */
const MAX_VAG_BREDD = 3;
/** Enskild rolls tidsgräns (ms) — därefter redovisas rollen som "ute". */
export const ROLL_MAX_MS = 90_000;
/** Hela mötets tidsgräns (ms) — därefter syntetiseras beslut ur det som finns. */
export const MOTE_MAX_MS = 240_000;
/** Reserv innan mötets slut som ordföranden ska hinna (ms). */
const RESERV_ORDFORANDE_MS = 30_000;
/** Minsta rollbudget (ms) — under denna hoppas rollen över (mötestidsgräns). */
const MIN_ROLL_BUDGET_MS = 10_000;
/** Max antal möten i minneskartan (äldsta AVSLUTADE städas först). */
const MAX_MOTEN_I_MINNET = 50;

/** Frågans maxlängd (tecken) — API-rutten avvisar längre. */
export const FRAGA_MAX_TECKEN = 2_000;

/**
 * R2 — KLASNINGSREGLNS NYCKELORDSLISTA (hårdkodad + utökningsbar).
 *
 * existential=true om beslutets texter rör: domänflytt, prissättning,
 * betalningsflöden, extern publicering, juridik/GDPR-ändringar, radering av
 * data, API-nycklar. Matchningen är skiftlägesokänslig delsträng — svenska
 * sammansättningar ("betalningsflödet", "prisförändringen") träffas automatiskt.
 *
 * UTÖKNING: pusha nya nyckelord direkt på exporten — en träff betyder VÄNTAR
 * KUND, och överklassning är den säkra riktningen enligt R2. Medvetet INTE
 * enskorda korta ord som "pris"/"nyckel" ("nyckeltal" är finansspråk, inte
 * hemligheter) — håll nya ord minst lika specifika.
 */
export const EXISTENTIELLA_NYCKELORD: string[] = [
  // Domänflytt / DNS
  "domänflytt",
  "domän",
  "dns",
  "registrar",
  "namnserver",
  // Prissättning
  "prissätt",
  "prisförändring",
  "prisändring",
  "prisstrategi",
  "prisplan",
  "prismodell",
  "höja priset",
  "höjer priset",
  "sänka priset",
  "sänker priset",
  "nytt pris",
  // Betalningsflöden
  "betalning",
  "stripe",
  "kortbetalning",
  "swish",
  "klarna",
  "paypal",
  "fakturering",
  "checkout",
  "prenumeration",
  "abonnemang",
  "monetarisering",
  "intäktsmodell",
  // Extern publicering / utåtriktat
  "extern publicering",
  "publicera externt",
  "pressmeddelande",
  "pressrelease",
  "nyhetsutskick",
  "nyhetsbrev",
  "utskick",
  "sociala medier",
  "annonsering",
  "annonskampanj",
  // Juridik / GDPR
  "juridik",
  "juridisk",
  "gdpr",
  "dataskydd",
  "integritetspolicy",
  "dataskyddspolicy",
  "cookie",
  "kakpolicy",
  "villkorsändring",
  "ändra villkor",
  "användarvillkor",
  "avtal",
  "licens",
  // Radering av data
  "radera",
  "radering",
  "gallra",
  "rensa databas",
  "ta bort data",
  "drop table",
  // API-nycklar / hemligheter
  "api-nyckel",
  "api-nycklar",
  "api nyckel",
  "api key",
  "hemlighet",
  "secret",
  "service role",
  "inloggningsnyckel",
  "nyckelrotation",
  "rotera nycklar",
];

// ── Typer ────────────────────────────────────────────────────────────────────

/** Styrelsens fem organ (sessionsrollerna). */
export type StyrelseRoll = "ORDFORANDE" | "TEKNIK" | "SAKERHET" | "JURIDIK" | "TILLVAXT";

/** Mötesstatus: pågår | klart (beslut finns) | fel (inget beslut kunde fattas). */
export type StyrelseStatus = "paga" | "klart" | "fel";

/** Åtgärdsstatus enligt R2: körs direkt i pipelinen | väntar kund. */
export type AtgardsStatus = "KORS_DIREKT" | "VANTAR_KUND";

/** En rads organsammanfattning (ordförandens vy per organ). */
export interface RollSammanfattning {
  roll: StyrelseRoll;
  enRad: string;
}

/** Slutbeslutet — ordförandens syntes, normaliserad + R2-klassad av motorn. */
export interface StyrelseBeslut {
  beslut: string;
  motivering: string;
  atgarder: string[];
  existential: boolean;
  rollSammanfattning: RollSammanfattning[];
}

/** Numrerad händelserad i mötesloggen (i = löpnummer för inkrementell poll). */
export interface StyrelseHandelse {
  /** 0-baserat löpnummer — GET ?senast=N returnerar händelser med i>N. */
  i: number;
  /** ISO-tidsstämpel. */
  tid: string;
  typ:
    | "mote_startad"
    | "vag_start"
    | "roll_start"
    | "roll_klar"
    | "roll_ute"
    | "vag_slut"
    | "ordforande_start"
    | "beslut_klart"
    | "mote_slut"
    | "fel";
  /** Rollen händelsen gäller (roll-händelser + ordforande_start). */
  roll?: StyrelseRoll;
  /** Vågnummer (vag_start/vag_slut). */
  vag?: number;
  /** Kort människoläsbar text (sammanfattning/skäl). */
  text?: string;
}

/** Mötes-state — lever i modulens karta så klienten kan polla progress. */
export interface StyrelseMote {
  id: string;
  fraga: string;
  status: StyrelseStatus;
  /** Date.now() vid mötesstart (tidsgränsens bas). */
  startad: number;
  handelser: StyrelseHandelse[];
  beslut?: StyrelseBeslut;
  atgardsStatus?: AtgardsStatus;
  /** Antal rader som skrevs till PIPELINE-KO.md (0 = inga/VÄNTAR KUND). */
  pipelineRader?: number;
  fel?: string;
}

/** Sanerad mötesvy för API:t (aldrig den interna objektpointern). */
export type StyrelseMoteVy = Pick<StyrelseMote, "id" | "status" | "atgardsStatus" | "pipelineRader" | "fel"> & {
  fraga: string;
  handelser: StyrelseHandelse[];
  beslut?: StyrelseBeslut;
};

/** Ett rolls utfall i en våg. */
interface RollResultat {
  roll: StyrelseRoll;
  ok: boolean;
  /** Hela analysen (ok=true) — annars frånvarande. */
  svar?: string;
  /** Skäl när rollen är "ute" (timeout/max-barn/fel). */
  skal?: string;
}

// ── Rolldefinitioner + prompts ───────────────────────────────────────────────

/** Kort AK1A-kontext som varje rollsession får (sajtens syfte + juridik). */
const AK1A_KONTEXT =
  "KONTEXT — AK1A: svensk plattform för finansiell utbildning (kurser, aktieanalyser, blogg). " +
  "Språk: svenska. Juridisk ram: lagen (2007:528) om värdepappersmarknaden — plattformen ger " +
  "ALDRIG investeringsråd; allt innehåll är pedagogisk utbildning och analys. Formulera dig " +
  "därför aldrig som råd att köpa eller sälja värdepapper.";

interface RollDef {
  roll: StyrelseRoll;
  namn: string;
  fokus: string;
}

/** De fem organen — ordföranden körs sist (beroende: de fyra analyserna). */
const ROLLER: Record<StyrelseRoll, RollDef> = {
  ORDFORANDE: { roll: "ORDFORANDE", namn: "Ordförande (CEO)", fokus: "syntes av organens analyser och mötets slutbeslut" },
  TEKNIK: { roll: "TEKNIK", namn: "Teknik (CTO)", fokus: "arkitektur, prestanda, teknisk skuld, genomförbarhet och driftsäkerhet" },
  SAKERHET: { roll: "SAKERHET", namn: "Säkerhet (CISO)", fokus: "hotytor, behörigheter, dataintrång, härdning och incidentrisker" },
  JURIDIK: { roll: "JURIDIK", namn: "Juridik & Compliance", fokus: "lag 2007:528 (aldrig investeringsråd), GDPR, villkor och varumärkesrisker" },
  TILLVAXT: { roll: "TILLVAXT", namn: "Tillväxt/SEO", fokus: "organisk trafik, sökord, konvertering och nästa tillväxtklyfta" },
};

/** R4-vågordning för analysorganen: 3 parallellt (vänta klart + stäng), sedan resten. */
const ANALYSVAGOR: StyrelseRoll[][] = [["TEKNIK", "SAKERHET", "JURIDIK"], ["TILLVAXT"]];
const ALLA_ROLLER: readonly StyrelseRoll[] = ["ORDFORANDE", "TEKNIK", "SAKERHET", "JURIDIK", "TILLVAXT"];

/** Prompt för ett analysorgan (max ~300 ord + Åtgärd:-rader). */
function byggRollPrompt(def: RollDef, fraga: string): string {
  return [
    AK1A_KONTEXT,
    "",
    `DU ÄR ${def.namn} i AK1A:s AI-styrelse — ditt perspektiv: ${def.fokus}.`,
    "",
    "KUNDENS FRÅGA TILL STYRELSEN:",
    `"""${fraga}"""`,
    "",
    "UPPGIFT: Ge en KORT analys (max ~300 ord) av frågan ur ditt perspektiv, med konkreta åtgärdsförslag.",
    'Avsluta med varje åtgärd på EGEN rad som börjar med "Åtgärd: " (en rad per åtgärd, max 5 åtgärder).',
    "Svara i vanlig text — ingen JSON. Formulera dig aldrig som investeringsråd.",
  ].join("\n");
}

/** Prompt till ordföranden: de fyra analyserna → ETT JSON-beslut. */
function byggOrdforandePrompt(fraga: string, analyser: Map<StyrelseRoll, string>, ute: Map<StyrelseRoll, string>): string {
  const rader: string[] = [
    AK1A_KONTEXT,
    "",
    "DU ÄR ORDFÖRANDE (CEO) i AK1A:s AI-styrelse — syntes och beslut.",
    "",
    "KUNDENS FRÅGA:",
    `"""${fraga}"""`,
    "",
    "ORGANENS ANALYSER:",
  ];
  for (const roll of ["TEKNIK", "SAKERHET", "JURIDIK", "TILLVAXT"] as StyrelseRoll[]) {
    const uteSkal = ute.get(roll);
    rader.push("", `[${ROLLER[roll].namn}]`, uteSkal ? `(Rollen kunde ej redovisa: ${uteSkal})` : analyser.get(roll) ?? "(Ingen analys inkommen.)");
  }
  rader.push(
    "",
    "UPPGIFT: Fatta ETT samlingsbeslut åt hela styrelsen. Svara ENDAST med ett JSON-objekt — ingen omgivande text, inga kodstaket:",
    '{"beslut": "…en–två meningar…", "motivering": "…kort…", "atgarder": ["…konkret steg…"], "existential": false, "rollSammanfattning": [{"roll": "TEKNIK", "enRad": "…"}, …]}',
    'Regler: "atgarder" = omedelbart tillämpbara steg (max 10). "existential" = true ENDAST om åtgärderna rör domänflytt, prissättning, betalningsflöden, extern publicering, juridik/GDPR-ändringar, radering av data eller API-nycklar (motorn klassar om). "rollSammanfattning" = en rad per organ. ALDRIG investeringsråd-formuleringar.',
  );
  return rader.join("\n");
}

// ── Mötes-state (minne, global guard mot dev-hot-reload) ─────────────────────

const globalVakt = globalThis as { __ak1aStyrelseMoter?: Map<string, StyrelseMote> };
const moten: Map<string, StyrelseMote> = globalVakt.__ak1aStyrelseMoter ?? new Map<string, StyrelseMote>();
globalVakt.__ak1aStyrelseMoter = moten;

/** Logga en numrerad händelse på mötet (klientens progress-källa). */
function logga(mote: StyrelseMote, typ: StyrelseHandelse["typ"], falt: Partial<StyrelseHandelse> = {}): void {
  mote.handelser.push({ i: mote.handelser.length, tid: new Date().toISOString(), typ, ...falt });
}

/** Håll minneskartan bundrad — äldsta AVSLUTADE möten städas först. */
function stadaMoten(): void {
  if (moten.size <= MAX_MOTEN_I_MINNET) return;
  const fardiga = [...moten.entries()].filter(([, m]) => m.status !== "paga").sort((a, b) => a[1].startad - b[1].startad);
  for (const [id] of fardiga) {
    if (moten.size <= MAX_MOTEN_I_MINNET) break;
    moten.delete(id);
  }
}

// ── Hjälpfunktioner ──────────────────────────────────────────────────────────

/** Trunkera text med ärlig ellips. */
function trunk(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/** Första icke-tomma raden som enradssammanfattning (max ~160 tecken). */
function enRad(text: string): string {
  const forsta = text.trim().split(/\r?\n/).find((r) => r.trim().length > 0) ?? "";
  return trunk(forsta.replace(/^[#>*\-\s]+/, ""), 160);
}

/** Sov i millisekunder (start-stagger mellan rollsessioner i en våg). */
function sov(ms: number): Promise<void> {
  return new Promise((los) => setTimeout(los, ms));
}

/**
 * Varumärkesgrinden: kontrolleraText (varumarke.ts) på styrelsetexten —
 * FEL-klassade fraser byts DETERMINISTISKT mot varumärkets ersättningar
 * innan beslutet verkställs. Returnerar [renad text, antal träffar].
 */
export function rensaForbudnaFras(text: string): [string, number] {
  const { fel } = kontrolleraText(text);
  let ut = text;
  for (const t of fel) ut = ut.split(t.fras).join(t.ersattning);
  return [ut, fel.length];
}

/**
 * R2 — HÅRDKODAD klassning: true när någon nyckelordsträff finns i någon
 * text (beslut, motivering, åtgärder). Överklassning = säker riktning.
 */
export function klassaExistential(texter: readonly string[]): { existential: boolean; traffadeNyckelord: string[] } {
  const samman = texter.join("\n").toLowerCase();
  const traffade = EXISTENTIELLA_NYCKELORD.filter((nyckel) => samman.includes(nyckel.toLowerCase()));
  return { existential: traffade.length > 0, traffadeNyckelord: traffade };
}

// ── Filprotokoll (data/forskning) ────────────────────────────────────────────

/** data/forskning i agentens arbetsyta (dev: cwd; prod: /home/ak1a/agent/ak1). */
function forskningKatalog(): string {
  return path.join(studioArbetsyta(), "data", "forskning");
}

/** Befintlig filtext ("" när filen saknas/läsfel) — append-sidans sond. */
function befintligText(sokvag: string): string {
  try {
    return readFileSync(sokvag, "utf8");
  } catch {
    return "";
  }
}

/** Append med recursive-mkdir; ny/tom fil föds med rubrik först.
 * filNamn är en intern NAKEN filnamnskonstant (t.ex. "PIPELINE-KO.md") —
 * sökvägsdelar ("..", "/", "\\") avvisas hårt: ingen anropare får kunna
 * skriva utanför data/forskning. */
function appendera(filNamn: string, text: string, rubrikOmNy?: string): void {
  if (!/^[A-Za-z0-9._-]+$/.test(filNamn) || filNamn.includes("..")) {
    throw new Error(`Ogiltigt filnamn i styrelsens protokoll: ${filNamn}`);
  }
  // Strängkonkat (ALDRIG path.join med variabeln): filNamn är verifierad
  // naket ovan — normalisera roten till "/"-form och försäkra att resultat
  // är EXAKT rot + "/" + filNamn (V95-fix: den gamla kontrollen kollar
  // segmentet EFTER roten utan att räkna med själva separeraren "/" och
  // kastade därmed vid VARJE protokoll-append).
  const rot = forskningKatalog().replace(/\\/g, "/").replace(/\/+$/, "");
  const sokvag = rot + "/" + filNamn;
  if (!sokvag.startsWith(rot + "/") || sokvag.slice(rot.length + 1) !== filNamn) {
    throw new Error("Protokollsökvägen lämnade data/forskning");
  }
  mkdirSync(forskningKatalog(), { recursive: true });
  const prefix = befintligText(sokvag).trim().length === 0 && rubrikOmNy ? `${rubrikOmNy}\n\n` : "";
  appendFileSync(sokvag, `${prefix}${text}`, "utf8");
}

/** Nära-ISO tidsstämpel för markdown-rubriker (2026-09-09 12:34). */
function tidsstampel(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 16);
}

/**
 * PIPELINE-KO — huvudagentens dispatchlista. KÖRS DIREKT-lovet (R2): minst
 * EN rad skrivs ALLTID — tom åtgärdslista (t.ex. fallback-syntes i dev-mock)
 * ⇒ beslutsraden skrivs i stället, så dispatchlistan aldrig tappar ett möte.
 * Varje rad: [STYRELSEN]-prefix + ISO-datum + mötes-id. Returnerar antal rader.
 */
function skrivPipelineRader(mote: StyrelseMote, beslut: StyrelseBeslut): number {
  const innehall =
    beslut.atgarder.length > 0
      ? beslut.atgarder.map((a) => trunk(a.replace(/\r?\n/g, " "), 300))
      : [trunk(`(inga konkreta åtgärder — beslutet) ${beslut.beslut.replace(/\r?\n/g, " ")}`, 300)];
  const rader = innehall.map((a) => `- [STYRELSEN] ${new Date().toISOString()} | ${mote.id} | ${a}`);
  appendera(
    "PIPELINE-KO.md",
    `${rader.join("\n")}\n`,
    "# PIPELINE-KO — huvudagentens dispatchlista\n\nRader med [STYRELSEN]-prefix är styrelsens KÖRS DIREKT-beslut (våg 91 A2, STYRELSE-ADMIN-MEGA.md).",
  );
  return rader.length;
}

/**
 * STYRELSE-BESLUT.md — mötesprotokollet (append, daterat): fråga, roller,
 * beslut, status. Skrivs för VARJE avslutat möte oavsett åtgärdsstatus.
 */
function skrivProtokoll(mote: StyrelseMote, beslut: StyrelseBeslut, status: AtgardsStatus): void {
  const rader: string[] = [
    "",
    `## ${tidsstampel()} — ${trunk(mote.fraga, 200)}`,
    "",
    `- **Status:** ${status === "KORS_DIREKT" ? "KÖRS DIREKT" : "VÄNTAR KUND"} (existential=${String(beslut.existential)})`,
    `- **Beslut:** ${trunk(beslut.beslut.replace(/\r?\n/g, " "), 1000)}`,
    `- **Motivering:** ${trunk(beslut.motivering.replace(/\r?\n/g, " "), 2000)}`,
    "- **Roller:**",
  ];
  for (const r of beslut.rollSammanfattning) rader.push(`  - ${r.roll}: ${r.enRad.replace(/\r?\n/g, " ")}`);
  if (beslut.atgarder.length > 0) {
    rader.push("- **Åtgärder:**");
    beslut.atgarder.forEach((a, idx) => rader.push(`  ${idx + 1}. ${a.replace(/\r?\n/g, " ")}`));
  } else {
    rader.push("- **Åtgärder:** (inga)");
  }
  rader.push(`- **Mötes-id:** ${mote.id}`, "");
  appendera("STYRELSE-BESLUT.md", rader.join("\n"), "# STYRELSE-BESLUT — AI-styrelsens mötesprotokoll\n\nVarje möte protokollförs här (våg 91 A2): datum + fråga, rollsummeringar, beslut, status.");
}

// ── system_events (blogg-utkast-mönstret) + fil-fallback ────────────────────

/**
 * Skriv styrelse_beslut-raden till system_events (getSupabaseRest — endast
 * https *.supabase.co). Saknad konfig/misslyckande ⇒ raden appendas till
 * data/forskning/styrelse-event-fallback.jsonl — inget beslut förloras tyst.
 * Details bär INGA hemligheter (endast mötets egen text, trunkerat).
 * Returnerar true vid Supabase-skrivning, false vid fil-fallback.
 */
async function skrivStyrelseEvent(mote: StyrelseMote, beslut: StyrelseBeslut, status: AtgardsStatus): Promise<boolean> {
  const detaljer = {
    schema: "ak1a-styrelse-beslut/1",
    id: mote.id,
    fraga: trunk(mote.fraga, 500),
    beslut: trunk(beslut.beslut, 1000),
    motivering: trunk(beslut.motivering, 1500),
    atgarder: beslut.atgarder.map((a) => trunk(a, 300)),
    existential: beslut.existential,
    atgardsStatus: status,
    rollSammanfattning: beslut.rollSammanfattning.map((r) => ({ roll: r.roll, enRad: trunk(r.enRad, 200) })),
  };
  const rest = getSupabaseRest();
  if (rest) {
    try {
      const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
        method: "POST",
        headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          type: STYRELSE_EVENT_TYP,
          severity: "info",
          message: `[${STYRELSE_KALLA}] ${mote.id} ${status}`,
          details: detaljer,
          source: STYRELSE_KALLA,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) return true;
    } catch {
      // nedan: fil-fallback
    }
  }
  try {
    mkdirSync(forskningKatalog(), { recursive: true });
    appendFileSync(path.join(forskningKatalog(), "styrelse-event-fallback.jsonl"), `${JSON.stringify(detaljer)}\n`, "utf8");
  } catch {
    // filen är sista försvaret — ett totalt diskfel äts här (protokollet i
    // STYRELSE-BESLUT.md är redan skrivet; mötet äger ändå sitt beslut)
  }
  return false;
}

// ── Dialogpolicy för rollsessioner ───────────────────────────────────────────

/**
 * En rollsession fick en interaktionsrequest: permission med låg/medel risk
 * besvaras allow_once (läsa kontext är ofarligt), hög/kritisk risk DENY
 * (analytiker skriver ALDRIG under ett möte), frågekort avbryts. Mötet får
 * ALDRIG blocka på en obesvarad dialog (transportens 30 s-default är
 * nödventilen — detta är snabbventilen).
 */
function besvaraRollDialog(transport: StudioTransport, interaktion: StudioInteraktion): void {
  if (interaktion.typ === "permission") {
    const risk = (interaktion.risk ?? "").toLowerCase();
    const val = risk === "low" || risk === "medium" ? "allow_once" : "deny";
    void transport.svarPermission(interaktion.requestId, val).catch(() => undefined);
  } else {
    void transport.svarFraga(interaktion.requestId, { avbruten: true }).catch(() => undefined);
  }
}

// ── Kör en session (analysorgan ELLER ordföranden — prompten skiljer) ───────

/**
 * Kör EN rollsession: frisk per-session-transport via hamtaSessionTransport
 * (transportens vaktaMaxBarn är R4:s sista försvar), skicka prompten, samla
 * svaret, STÄNG sessionen (historiken lever kvar i session/list). Timeout ⇒
 * rollen "ute" med ärligt skäl i händelseloggen.
 */
async function korSession(mote: StyrelseMote, def: RollDef, prompt: string, staggerMs: number, budgetMs: number): Promise<RollResultat> {
  await sov(staggerMs); // undvik sid-kollisioner i mock + mild startförskjutning
  logga(mote, def.roll === "ORDFORANDE" ? "ordforande_start" : "roll_start", { roll: def.roll, text: def.namn });

  let transport: StudioTransport;
  try {
    ({ transport } = await hamtaSessionTransport(null, `${mote.id}-${def.roll.toLowerCase()}`));
  } catch (fel) {
    const skal = `kunde ej starta session (${trunk(fel instanceof Error ? fel.message : "okänt fel", 160)})`;
    logga(mote, "roll_ute", { roll: def.roll, text: skal });
    return { roll: def.roll, ok: false, skal };
  }

  const abort = new AbortController();
  let tidsgransUppnaedd = false;
  const timer = setTimeout(() => {
    tidsgransUppnaedd = true;
    abort.abort();
  }, budgetMs);
  let ackumulerat = "";
  let klartSvar: string | null = null;
  let felText: string | null = null;
  try {
    await transport.skicka(
      prompt,
      (event) => {
        if (event.typ === "delta" && event.kanal === "text") ackumulerat += event.text;
        else if (event.typ === "klart" && typeof event.svar === "string") klartSvar = event.svar;
        else if (event.typ === "fel") felText = event.meddelande;
        else if (event.typ === "interaktion") besvaraRollDialog(transport, event.interaktion);
      },
      abort.signal,
    );
  } catch (fel) {
    felText = fel instanceof Error ? fel.message : "okänt fel";
  } finally {
    clearTimeout(timer);
    await transport.stangSession().catch(() => undefined);
  }

  if (tidsgransUppnaedd) {
    const skal = `tidsgräns (${String(Math.round(budgetMs / 1000))} s) — rollen redovisas som ute`;
    logga(mote, "roll_ute", { roll: def.roll, text: skal });
    return { roll: def.roll, ok: false, skal };
  }
  const svar = (klartSvar ?? ackumulerat).trim();
  if (!svar) {
    const skal = `inget svar (${trunk(felText ?? "sessionen svarade tom", 160)})`;
    logga(mote, "roll_ute", { roll: def.roll, text: skal });
    return { roll: def.roll, ok: false, skal };
  }
  logga(mote, "roll_klar", { roll: def.roll, text: enRad(svar) });
  return { roll: def.roll, ok: true, svar };
}

/** Rollbudget = min(ROLL_MAX_MS, mötets återstående tid − ordförandereserv). */
function rollBudget(mote: StyrelseMote): number {
  const aterstunde = mote.startad + MOTE_MAX_MS - RESERV_ORDFORANDE_MS - Date.now();
  return Math.max(0, Math.min(ROLL_MAX_MS, aterstunde));
}

// ── Ordföranden: JSON-tolkning + normalisering + fallback-syntes ─────────────

/** Tolka ordförandens svar som JSON (kodstaket bort, första {…}-blocket). */
function tolkaBeslutJson(
  svar: string,
): { beslut?: unknown; motivering?: unknown; atgarder?: unknown; existential?: unknown; rollSammanfattning?: unknown } | null {
  const ren = svar.replace(/```(?:json)?/gi, "").trim();
  const start = ren.indexOf("{");
  const slut = ren.lastIndexOf("}");
  if (start < 0 || slut <= start) return null;
  try {
    const tolkat = JSON.parse(ren.slice(start, slut + 1)) as Record<string, unknown>;
    return typeof tolkat === "object" && tolkat !== null ? tolkat : null;
  } catch {
    return null;
  }
}

/** Normalisera ordförandens JSON till ett HELT StyrelseBeslut. */
function normaliseraBeslut(
  fraga: string,
  tolkat: { beslut?: unknown; motivering?: unknown; atgarder?: unknown; existential?: unknown; rollSammanfattning?: unknown } | null,
  analyser: Map<StyrelseRoll, string>,
  ute: Map<StyrelseRoll, string>,
): StyrelseBeslut {
  const str = (v: unknown, reserv: string, max: number): string => (typeof v === "string" && v.trim() ? trunk(v, max) : reserv);
  const lista = Array.isArray(tolkat?.atgarder)
    ? (tolkat.atgarder as unknown[]).filter((a): a is string => typeof a === "string" && a.trim().length > 0).map((a) => trunk(a, 300)).slice(0, 10)
    : [];

  // Rollsummeringar: ordförandens rader är grund, men ALLA fem roller ska
  // finnas — saknad rad fylls ur analysen (eller ute-skälet).
  const grund = new Map<StyrelseRoll, string>();
  if (Array.isArray(tolkat?.rollSammanfattning)) {
    for (const rad of tolkat.rollSammanfattning as unknown[]) {
      if (typeof rad !== "object" || rad === null) continue;
      const roll = (rad as { roll?: unknown }).roll;
      const radText = (rad as { enRad?: unknown }).enRad;
      if (typeof roll === "string" && (ALLA_ROLLER as readonly string[]).includes(roll) && typeof radText === "string" && radText.trim()) {
        grund.set(roll as StyrelseRoll, trunk(radText, 200));
      }
    }
  }
  const rollSammanfattning: RollSammanfattning[] = ALLA_ROLLER.map((roll) => ({
    roll,
    enRad:
      grund.get(roll) ??
      (ute.has(roll) ? `Rollen kunde ej redovisa: ${ute.get(roll)}` : analyser.has(roll) ? enRad(analyser.get(roll) as string) : "Rollen lämnade ingen summering."),
  }));

  const ordforandeExistential = tolkat?.existential === true;
  const beslutText = str(tolkat?.beslut, `Styrelsen har behandlat frågan: ${trunk(fraga, 200)}`, 1000);
  const motiveringText = str(tolkat?.motivering, "Ordförandens motivering saknades i svaret — beslutet bär organens samlade analys.", 2000);

  // R2 HÅRDKODAD: motorn klassar OM — ordförandens flagga får bara förstärka.
  const { existential } = klassaExistential([beslutText, motiveringText, ...lista]);

  return { beslut: beslutText, motivering: motiveringText, atgarder: lista, existential: existential || ordforandeExistential, rollSammanfattning };
}

/**
 * FALLBACK-SYNTES (ogiltig JSON eller ute ordförande): beslutet byggs av
 * organens egna "Åtgärd:"-rader — ALDRIG påhittat innehåll. Noll analyser
 * och ingen ordförande hanteras av anroparen (status "fel").
 */
function syntetiseraBeslut(fraga: string, analyser: Map<StyrelseRoll, string>, ute: Map<StyrelseRoll, string>): StyrelseBeslut {
  const atgarder: string[] = [];
  for (const svar of analyser.values()) {
    for (const rad of svar.split(/\r?\n/)) {
      const m = rad.match(/^\s*(?:[-*]?\s*)?Åtgärd:\s*(.+)$/i);
      if (m && m[1].trim() && atgarder.length < 10) atgarder.push(trunk(m[1], 300));
    }
  }
  const rollSammanfattning: RollSammanfattning[] = ALLA_ROLLER.map((roll) => ({
    roll,
    enRad: ute.has(roll) ? `Rollen kunde ej redovisa: ${ute.get(roll)}` : analyser.has(roll) ? enRad(analyser.get(roll) as string) : "Rollen lämnade ingen analys.",
  }));
  const beslutText = `Automatisk syntes (ordförandens svar kunde ej tolkas som JSON): frågan behandlas enligt de ${String(analyser.size)} inkomna organanalyserna.`;
  const { existential } = klassaExistential([beslutText, ...atgarder]);
  return {
    beslut: beslutText,
    motivering: `${String(analyser.size)} av 5 organ redovisade analys; ${String(ute.size)} var inte tillgängliga inom tidsgränsen. Fråga: ${trunk(fraga, 300)}`,
    atgarder,
    existential,
    rollSammanfattning,
  };
}

// ── Möteskärnan ──────────────────────────────────────────────────────────────

/**
 * Verkställ ett färdigt beslut: varumärkesgrind → protokoll → R2-status →
 * (KÖRS DIREKT: PIPELINE-KO-rader) → system_events/fil-fallback.
 */
async function verkstallBeslut(mote: StyrelseMote, beslut: StyrelseBeslut): Promise<AtgardsStatus> {
  // Varumärkesgrinden — FEL-fraser byts ut FÖR allt skrivs (lag 2007:528).
  const renBeslut = rensaForbudnaFras(beslut.beslut)[0];
  const renMotivering = rensaForbudnaFras(beslut.motivering)[0];
  const renAtgarder = beslut.atgarder.map((a) => rensaForbudnaFras(a)[0]);
  const renRoller = beslut.rollSammanfattning.map((r) => ({ roll: r.roll, enRad: rensaForbudnaFras(r.enRad)[0] }));
  const rentBeslut: StyrelseBeslut = { ...beslut, beslut: renBeslut, motivering: renMotivering, atgarder: renAtgarder, rollSammanfattning: renRoller };

  const status: AtgardsStatus = rentBeslut.existential ? "VANTAR_KUND" : "KORS_DIREKT";
  skrivProtokoll(mote, rentBeslut, status);
  mote.pipelineRader = status === "KORS_DIREKT" ? skrivPipelineRader(mote, rentBeslut) : 0;
  await skrivStyrelseEvent(mote, rentBeslut, status);
  // MEGA G3 — audit: styrelsens beslut är en autonom skrivning (protokoll +
  // pipeline + event); kvittot bär status och beslutskärnan, aldrig hemligheter.
  skrivAudit(
    "styrelsen",
    "beslut",
    "data/forskning/STYRELSE-BESLUT.md",
    `${mote.id} | ${status} | existential=${String(rentBeslut.existential)} | ${trunk(rentBeslut.beslut.replace(/\r?\n/g, " "), 300)}`,
  );
  mote.beslut = rentBeslut;
  mote.atgardsStatus = status;
  return status;
}

/** Skapa + registrera mötet (startaStyrelsemote/sammanstyrelsen gemensamma grund). */
function skapaMote(fraga: string): StyrelseMote {
  const id = `styrelse-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const mote: StyrelseMote = { id, fraga: fraga.trim(), status: "paga", startad: Date.now(), handelser: [] };
  moten.set(id, mote);
  stadaMoten();
  logga(mote, "mote_startad", { text: trunk(fraga, 200) });
  return mote;
}

/** Motorfel ska ALDRIG lämna mötet hängande i "paga". */
function misslyckatMote(mote: StyrelseMote, fel: unknown): void {
  mote.status = "fel";
  mote.fel = trunk(fel instanceof Error ? fel.message : "okänt motorfel", 300);
  logga(mote, "fel", { text: mote.fel });
  logga(mote, "mote_slut", { text: "fel" });
}

/** Möteskärnan — kör till slutstatus (paga → klart | fel). */
async function korMote(mote: StyrelseMote): Promise<void> {
  const analyser = new Map<StyrelseRoll, string>();
  const ute = new Map<StyrelseRoll, string>();

  // VÅGOR (R4): analysorganen 3 parallellt (vänta klart + stäng), sedan resten.
  for (let vag = 0; vag < ANALYSVAGOR.length; vag++) {
    const roller = ANALYSVAGOR[vag].filter((r) => !analyser.has(r) && !ute.has(r));
    if (roller.length === 0) continue;
    logga(mote, "vag_start", { vag: vag + 1, text: roller.map((r) => ROLLER[r].namn).join(", ") });
    const resultat = await Promise.all(
      roller.slice(0, MAX_VAG_BREDD).map(async (roll, idx): Promise<RollResultat> => {
        const budget = rollBudget(mote);
        if (budget < MIN_ROLL_BUDGET_MS) {
          const skal = "mötestidsgränsen nära — rollen hoppas över";
          logga(mote, "roll_ute", { roll, text: skal });
          return { roll, ok: false, skal };
        }
        return korSession(mote, ROLLER[roll], byggRollPrompt(ROLLER[roll], mote.fraga), idx * 25, budget);
      }),
    );
    for (const r of resultat) {
      if (r.ok && r.svar) analyser.set(r.roll, r.svar);
      else ute.set(r.roll, r.skal ?? "okänt skäl");
    }
    logga(mote, "vag_slut", { vag: vag + 1 });
  }

  // ORDFÖRANDEN — behöver de fyra analyserna; körs ENSAM efter att organen
  // stängts (vågbredd 1, R4-taket kan aldrig överskridas).
  let tolkat: ReturnType<typeof tolkaBeslutJson> = null;
  const budget = rollBudget(mote);
  if (budget >= MIN_ROLL_BUDGET_MS) {
    const ord = await korSession(mote, ROLLER.ORDFORANDE, byggOrdforandePrompt(mote.fraga, analyser, ute), 0, budget);
    if (ord.ok && ord.svar) {
      analyser.set("ORDFORANDE", ord.svar);
      tolkat = tolkaBeslutJson(ord.svar);
    } else {
      ute.set("ORDFORANDE", ord.skal ?? "okänt skäl");
    }
  } else {
    const skal = "mötestidsgränsen nådd — ordföranden hann ej";
    logga(mote, "roll_ute", { roll: "ORDFORANDE", text: skal });
    ute.set("ORDFORANDE", skal);
  }

  // Beslut: ordförande-JSON om tolkningsbar, annars fallback-syntes — och
  // noll underlag alls ⇒ ärligt fel (ALDRIG fingerat beslut).
  let beslut: StyrelseBeslut;
  if (tolkat) {
    beslut = normaliseraBeslut(mote.fraga, tolkat, analyser, ute);
  } else if (analyser.size > 0) {
    beslut = syntetiseraBeslut(mote.fraga, analyser, ute);
  } else {
    mote.status = "fel";
    mote.fel = "Inget organ kunde redovisa inom tidsgränsen — mötet avslutades utan beslut.";
    logga(mote, "fel", { text: mote.fel });
    logga(mote, "mote_slut", { text: "fel" });
    return;
  }

  const status = await verkstallBeslut(mote, beslut);
  mote.status = "klart";
  logga(mote, "beslut_klart", {
    text: `${status === "KORS_DIREKT" ? "KÖRS DIREKT" : "VÄNTAR KUND"} · ${String(beslut.atgarder.length)} åtgärder`,
  });
  logga(mote, "mote_slut", { text: "klart" });
}

// ── Publika ytor ─────────────────────────────────────────────────────────────

/**
 * startaStyrelsemote — startar mötet ASYNKRONT och returnerar mötes-id:t
 * direkt (API:t svarar {id}; klienten pollar lasStyrelsemote). Mötet
 * överlever requesten (VÅG 91: arbetet lever i server-processen).
 */
export function startaStyrelsemote(fraga: string): string {
  const mote = skapaMote(fraga);
  void korMote(mote).catch((fel: unknown) => misslyckatMote(mote, fel));
  return mote.id;
}

/**
 * sammanstyrelsen — HELA mötet, awaited (verktyg/test + server-side-anrop):
 * skapar mötet, kör det till slutstatus och returnerar den sanerade vyn.
 */
export async function sammanstyrelsen(fraga: string): Promise<StyrelseMoteVy> {
  const mote = skapaMote(fraga);
  try {
    await korMote(mote);
  } catch (fel) {
    misslyckatMote(mote, fel);
  }
  const vy = lasStyrelsemote(mote.id);
  return vy ?? { id: mote.id, fraga: mote.fraga, status: mote.status, handelser: [...mote.handelser] };
}

/**
 * lasStyrelsemote — sanerad mötesvy för polling. senast = senaste sedda
 * händelsenumret (default -1 = allt); svaret bär endast händelser med i>senast.
 * beslut följer med först när status=klart. Null = okänt mötes-id.
 */
export function lasStyrelsemote(id: string, senast = -1): StyrelseMoteVy | null {
  const mote = moten.get(id);
  if (!mote) return null;
  return {
    id: mote.id,
    fraga: mote.fraga,
    status: mote.status,
    handelser: mote.handelser.filter((h) => h.i > senast),
    ...(mote.beslut ? { beslut: mote.beslut } : {}),
    ...(mote.atgardsStatus ? { atgardsStatus: mote.atgardsStatus } : {}),
    ...(typeof mote.pipelineRader === "number" ? { pipelineRader: mote.pipelineRader } : {}),
    ...(mote.fel ? { fel: mote.fel } : {}),
  };
}
