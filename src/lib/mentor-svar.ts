/**
 * AI-MENTORN 2.1 — MODELLAGER (mentor 2.1, styrelsens beslut våg 159/m7).
 *
 * Ren (fs-fri, import-fri) modul som binder ihop rutterna med widgeten:
 *   · KOSTNADSTAK — prompt ≤ 500 tkn, svar ≤ 2 000 tkn (konservativ skattning,
 *     se beraknaToken) + 10 frågor/dag per medlem (vakt i rutten, fs-delen
 *     lever i src/app/api/mentor/fraga/route.ts — denna fil hålls ren så att
 *     Node-testet (verktyg/testa-mentor-modell.mjs) och klientbunten kan
 *     importera den utan server-beroenden).
 *   · JURIDIKGRINDEN (lagen 2007:528) — systemprompten FÖRBUDER investerings-
 *     råd; varje modellsvar märks och avslutas med pedagogisk disclaimer.
 *   · KÄLLMÄRKE — modellsvar visas som "AI-Mentorn modell" (kalla-fältet),
 *     regel-motorns svar förblir källmärkta ur kursregistret som förr.
 *
 * Gäster når ALDRIG denna väg: ruttens medlemsvakt nekar före modellen, och
 * widgeten anropar bara rutten när eleven är inloggad. Fel i modellvägen ⇒
 * widgeten faller tillbaka på regel-motorn (ai-mentor-svar + /api/chatbot).
 *
 * Dependency-injection (mönstret ur ai-mentor-svar.ts våg 106 H2): registret
 * och transporten skickas IN som parametrar — endast `import type` behövs för
 * typerna, så verktyg/testa-mentor-modell.mjs kör filen direkt i Node.
 */

import type { RegisterRad } from "./ai-mentor-register";
import type { LokalHandling, LokalKalla, LokalMotfraga } from "./ai-mentor-svar";

// ── Kostnadskonstanter (ruttens HÅRDA tak — styrelsens kostnads-säker design) ─

/** Max frågor/dag per medlem mot modellen (räknas i data/vakten/mentor-bruk/). */
export const MENTOR_MAX_FRAGOR_PER_DAG = 10;
/** Elevens fråga: max 500 tkn (konservativt skattat — se beraknaToken). */
export const MENTOR_PROMPT_TAK_TKN = 500;
/** Modellsvar: max 2 000 tkn (kapas i rutten FÖRE leverans till klienten). */
export const MENTOR_SVAR_TAK_TKN = 2_000;

/** Källmärket som widgeten renderar som etikett på modellsvar. */
export const MENTOR_MODELL_KALLA = "AI-Mentorn modell";

/** Pedagogisk disclaimer — lagen (2007:528): utbildning, aldrig rådgivning. */
export const MENTOR_DISCLAIMER =
  "Detta är pedagogisk utbildning från AI-Mentorn — inte investeringsråd. AK1A lämnar aldrig personliga köp- eller säljrekommendationer (lagen 2007:528 om värdepappersrörelser).";

/**
 * Konservativ tokenskattning: svenska ord ger ca 3–4 tecken/token; vi räknar
 * 3 tecken/token så skattningen ÖVERSKATTAR (tak slår till tidigare) — det är
 * den kostnads-säkra riktningen. Aldrig understigande 1 för icke-tom text.
 */
export function beraknaToken(text: string): number {
  return text.length === 0 ? 0 : Math.ceil(text.length / 3);
}

// ── Systemprompt (fast pedagogisk ram + juridikgrind) ────────────────────────

/**
 * Systemprompten till generateText — EKOSYSTEMKUNSKAP + HÅRD JURIDIK.
 * Texten är fast (inga miljöberoenden) och hålls kompakt: modell-kostnaden
 * per fråga ska vara förutsägbar, och ramen är identisk varje gång.
 */
export function mentorSystemPrompt(): string {
  return [
    "Du är AI-Mentorn på AK1A Research Lab — en svensk utbildningsplattform för aktieanalys.",
    "Ekosystemet du undervisar om: AKM1 (fundamental modell med 20 variabler, V01–V20: tillväxt, värdering, lönsamhet, stabilitet, moat, katalysator, risk, kapitalstruktur), AK1TS (våglära: 25 tekniker × 5 tidshorisonter, impulsvåg/korrektion/basbygge), konfluens (värde möter vågor — en dimension räcker aldrig), portföljhantering (position sizing, diversifiering), läroplanen i fem nivåer samt bokmaster-biblioteket (Graham, Kahneman, Housel m.fl.). Fas 1 är gratis för alltid.",
    "JURIDIK — HÅRT FÖRBUD: Du är en utbildare, inte en rådgivare. Du lämnar ALDRIG investeringsråd (lagen 2007:528): säg aldrig att en specifik aktie bör köpas, säljas eller ägas, och lämna aldrig personliga placeringsbeslut. Formulera ALLTID som utbildning: \"så fungerar metoden\", \"så räknar man\", \"det här är frågetecknet\". Frågar eleven om råd: förklara ärligt att AK1A utbildar och inte rådgiver, och visa hur eleven analyserar själv.",
    "FORMAT: Svara på svenska, nybörjarvänligt, max 180 ord. Börja med en direkt förklaring (inga inledningsfraser), ge gärna ett konkret räkne-exempel, och avsluta med ett pedagogiskt nästa steg — aldrig med en rekommendation. Skriv ren text utan markdown-rubriker.",
  ].join("\n\n");
}

/**
 * Hela prompten till generateText: systemramen + elevens fråga (redan
 * kvalitetskontrollerad av rutten: icke-tom, ≤ 500 tkn). Kontext är den
 * senaste ämnestiketten ur widgeten (t.ex. \"variabel-V09\") — valfri.
 */
export function byggMentorPrompt(fraga: string, kontext?: string): string {
  const kontextRad =
    kontext && kontext.trim().length > 0
      ? `\n\nSammanhang (eleven pratade nyss om: ${kontext.trim().slice(0, 60)}):`
      : "";
  return `${mentorSystemPrompt()}${kontextRad}\n\nELEVENS FRÅGA:\n${fraga.trim()}`;
}

// ── Svarskapning (källmärke + disclaimer + handingslänkar ur registret) ──────

/** Svarsform som speglar LokaltSvar — widgeten renderar den identiskt. */
export type MentorModellSvar = {
  text: string;
  amne: string;
  kalla: LokalKalla;
  handlings: LokalHandling[];
  motfraga: LokalMotfraga;
  fordjupa: { text: string; lank: string };
};

/**
 * Kapa modelltexten vid svarstaketet (2 000 tkn ≈ 6 000 tecken) — mjukt:
 * föredra sista styckebrott/mening före gränsen så svaret aldrig klipps
 * mitt i en mening. Tom modelltext ⇒ null (rutten svarar 503 ⇒ fallback).
 */
export function kapaMentorSvar(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  const takTecken = MENTOR_SVAR_TAK_TKN * 3;
  if (t.length <= takTecken) return t;
  const kapad = t.slice(0, takTecken);
  const stycke = kapad.lastIndexOf("\n\n");
  const mening = Math.max(kapad.lastIndexOf(". "), kapad.lastIndexOf("."));
  const klipp = Math.max(stycke, mening);
  return klipp > takTecken * 0.5 ? kapad.slice(0, klipp + 1).trim() : kapad.trim() + "…";
}

/**
 * Slå in modelltexten i mentorns svarsform: disclaimer läggs ALWAYS sist,
 * handingsknappar är de närmaste kurserna (anroparen räknar fram dem ur
 * registret med narmasteKurser — DI, se rubrikkommentaren), källmärket
 * blir "AI-Mentorn modell". naraKurser ska vara 2 st (fallback: 1+ räcker).
 */
export function byggModellSvar(modellText: string, naraKurser: RegisterRad[]): MentorModellSvar | null {
  const text = kapaMentorSvar(modellText);
  if (text === null) return null;
  const nara = naraKurser.slice(0, 2);
  const forsta = nara[0];
  const kalla: LokalKalla = {
    titel: MENTOR_MODELL_KALLA,
    lagrow: "Modellsvar — pedagogiskt ramverk ur AKM1/AK1TS, kollar alltid mot kursregistret",
  };
  return {
    text: `${text}\n\n—\n${MENTOR_DISCLAIMER}`,
    amne: "modell",
    kalla,
    handlings: nara.map((r) => ({
      text: `Fördjupa i kursen: ${r.titel}`,
      lank: `/kurser/${r.slug}`,
      ikon: "📚",
      beskrivning: `${r.kategori.toLowerCase()} · ${r.minuter} min`,
    })),
    motfraga: { text: forsta ? `Vad är ${forsta.titel}?` : "Vad är AKM1?", kategori: "utbildning" },
    fordjupa: forsta ? { text: forsta.titel, lank: `/kurser/${forsta.slug}` } : { text: "Läroplanen", lank: "/laroplan" },
  };
}

// ── Rate-limit-grinden (ren logik — fs-delen lever i rutten) ─────────────────

/** Räknarfilens innehåll: { antal } — en fil per medlem och dag. */
export type MentorBruk = { antal: number };

/** Dagens nyckel i UTC (ISO-datum) — dagens tak återställs vid UTC-midnatt. */
export function mentorDag(datum: Date): string {
  return datum.toISOString().slice(0, 10);
}

/** Filsökväg för medlemmens dagsräknare: <bas>/<dag>/<epostHash>.json. */
export function mentorBrukSokvag(basKatalog: string, dag: string, medlemsNyckel: string): string {
  // medlemsNyckel är redan en hash (rutten använder epostHash — GDPR: e-post
  // lagras aldrig i klartext i filnamn).
  return `${basKatalog.replace(/\/+$/, "")}/${dag}/${medlemsNyckel}.json`;
}

/** Ren bedömning: får denna räknare göra ett till modellanrop? */
export function visaMentorBruk(bruk: MentorBruk | null, max: number = MENTOR_MAX_FRAGOR_PER_DAG): boolean {
  return (bruk?.antal ?? 0) < max;
}

/** Sekunder till nästa UTC-midnatt (429-svarets återställningstid). */
export function aterstallSekTillMidnatt(datum: Date): number {
  const nasta = Date.UTC(datum.getUTCFullYear(), datum.getUTCMonth(), datum.getUTCDate() + 1, 0, 0, 0);
  return Math.max(1, Math.ceil((nasta - datum.getTime()) / 1000));
}

// ── Kärnan: modellsvar via injicerad transport ───────────────────────────────

/** Minimal transportliknande typ — rutten skickar hamtaStudioTransport(). */
export type MentorTransport = { genereraText(prompt: string): Promise<{ text: string; råSvar: unknown }> };

/** Kvalitetskontroll av elevens fråga FÖRE modellen: icke-tom, ≤ 500 tkn. */
export function kontrolleraFraga(fraga: string): { ok: true } | { ok: false; fel: "tom" | "for_lang" } {
  const t = fraga.trim();
  if (t.length === 0) return { ok: false, fel: "tom" };
  if (beraknaToken(t) > MENTOR_PROMPT_TAK_TKN) return { ok: false, fel: "for_lang" };
  return { ok: true };
}

/**
 * Hämta ett modellsvar: bygg prompt (juridikgrind inbakad) → genereraText →
 * kapa vid svarstaket → slå in med källmärke + disclaimer + registerlänkar.
 * naraKurser = narmasteKurser(fraga, KURSREGISTER, 2) — anroparen räknar
 * fram dem (DI: denna modul hålls import-fri för Node-testbarhet).
 * Kastar vid transportfel (rutten rullar tillbaka räknaren och svarar 503 —
 * klienten faller då tillbaka på regel-motorn). Returnerar null när modellen
 * levererade tom text (samma 503-väg).
 */
export async function hamtaMentorModellSvar(
  fraga: string,
  transport: MentorTransport,
  naraKurser: RegisterRad[],
  kontext?: string,
): Promise<MentorModellSvar | null> {
  const resultat = await transport.genereraText(byggMentorPrompt(fraga, kontext));
  const text = typeof resultat?.text === "string" ? resultat.text : "";
  return byggModellSvar(text, naraKurser);
}
