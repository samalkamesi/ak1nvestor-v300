/**
 * TENANT-KONTRAKTET — AK1A PRO:s white-label-grund (B2B-BESLUT våg 61,
 * steg 2 / K3-dom: TypeScript-KONTRAKT + renderingslager, INTE tabell).
 *
 * Detta är kontraktet som förhindrar ombygge vid kund nr 2: varje vy i
 * cockpit-MVP:n (morgonrond, screening, klientvy, Rapportverkstan) konsumerar
 * TenantConfig — persistensen (pro_organisation, pro_seat, …) kommer i fas 2
 * bakom DPA-grinden (G3). FÖRUTOM localStorage-läsningen finns INGEN I/O här:
 * rena, deterministiska funktioner (P1/FORBUD 11 — inga klockor, inget slump).
 *
 * Mal-låsningen (K5/FORBUD 6): white-label ändrar AVSÄNDAREN (firma, logotyp,
 * färgtema) och kan LÄGGA TILL egen juridik — men kan ALDRIG sudda, mjuka
 * eller korta AK1A:s metod- + ansvarsdeklaration eller data-t.o.m.-rad.
 * Tekniskt: MAL_LAST_RADER är en frusen konstant och byggDisclaimerRader()
 * har INGEN kodväg som plockar bort den — tenant-fältet heter därför
 * disclaimerTillägg (tillägg), aldrig "ersätt".
 *
 * Källor: data/forskning/B2B/B2B-BESLUT.md (K3, K5, K8, §3:2, §6:6, §7 steg 2)
 * · pro-admin-v1-kontraktet i src/components/ak1a/pro/admin-panel.tsx.
 * Pedagogisk analys — inte investeringsråd.
 */

// ── Kontraktstyper ──────────────────────────────────────────────────────────

/** Färgtema-metadata (MVP: namngivet prefix ur pro-admin-v1; tokens i fas 2). */
export type TenantBrandFarger = {
  /** Namngivet färgtema-prefix ("kobolt", "marin" …) — aldrig beräknat. */
  temaPrefix?: string;
};

/**
 * En tenant = en B2B-organisation (verktygs- och forskningsleverantörens kund).
 * Samma kontrakt bakom demo-läget (G1) och fas 2:s pro_organisation-tabell.
 */
export type TenantConfig = {
  /** Stabil identifierare (fas 2: pro_organisation.id — här: konstant/lokal). */
  id: string;
  /** Avsändarens firma — det ENDA white-label ändrar (P1: avsändare, aldrig innehåll). */
  firmNamn: string;
  /** Logotyp-URL (https://… eller rotrelativ /…) — monogram-plats används när den saknas. */
  logotypUrl?: string;
  /** Färgtema (metadata i MVP — renderingslagret kan mappa till tokens i fas 2). */
  brandFarger?: TenantBrandFarger;
  /**
   * EGEN juridik som LÄGGS TILL efter det mal-låsta blocket. Vakten
   * (arTillaggGodkand) avvisar ansvarsskjutande/mjukande språk — tenant
   * tillför, subtraherar aldrig (K5, b4 lager 2).
   */
  disclaimerTillägg?: string;
};

// ── Demo-tenant (K-B2B:4) ───────────────────────────────────────────────────

/**
 * DEFAULT_DEMO_TENANT — demo-firman för white-label-demon (K-B2B:4: "kan vara
 * påhittad demo-firma"). "Nordisk Kapitalråd AB" är ett PÅHITTAT namn: det
 * existerar inte som kund och ska inte förväxlas med någon verklig rådgivare.
 * Logotyp-URL:n väntar på kundens demo-underlag (K-B2B:4) — tills dess
 * renderar TenantHeader monogram-platsen. Demo-markeringen bärs med i
 * disclaimerTillägget så att den SYNLS I varje rendering.
 */
export const DEFAULT_DEMO_TENANT: Readonly<TenantConfig> = Object.freeze({
  id: "demo-nordisk-kapitalrad",
  firmNamn: "Nordisk Kapitalråd AB",
  brandFarger: Object.freeze({ temaPrefix: "marin-guld" }),
  disclaimerTillägg:
    "Nordisk Kapitalråd AB är en påhittad demo-firma (K-B2B:4) — endast för " +
    "demonstration av white-label. Rapportens metodik och underlag kommer från " +
    "AK1A Research Lab.",
});

// ── Mal-låst kärna (b4:s tre lager — K5/FORBUD 6) ───────────────────────────

/**
 * MAL_LAST_RADER — rapportens mal-låsta deklarationsblock. Fruset:
 * Object.freeze + readonly, och byggDisclaimerRader() placerar ALWAYS dessa
 * rader först. Tre lager enligt b4/B2B-BESLUT K5:
 *   1. Metoddeklaration (AK1A-metodiken, generisk + deterministisk),
 *   2. Ansvarsdeklaration ("pedagogisk analys, ej rådgivning", 2007:528),
 *   3. Data-t.o.m.-rad + öppen falsifierbarhet.
 * Texterna är avsiktligt tidlösa (P1: ingen klocka, inget "idag") — datum
 * redovisas per sektion i rapporten, aldrig här.
 */
export const MAL_LAST_RADER: readonly string[] = Object.freeze([
  "Metodik: rapporten är framtagen med AK1A-metodiken — AKM1 (20 " +
    "fundamentalvariabler i 7 kategorier, max 100 poäng), AK1TS (5 teorier × " +
    "5 tidshorisonter × 4 dimensioner) och Konfluens (minst 3 av 5 teorier " +
    "måste peka samma håll). Utdata är generisk och deterministisk: samma " +
    "portfölj ger samma klasser oavsett läsare, avsändare eller tenant.",
  "Pedagogisk analys — inte investeringsråd (2007:528). AK1A levererar " +
    "forskningsunderlag; rådgivaren som bär tillståndet svarar själv för sin " +
    "rådgivning och sin lämplighetsprövning. Rekommendationsband och " +
    "vågklasser är läranderedskap och ska aldrig läsas som köp- eller " +
    "säljuppmaningar.",
  "Data-t.o.m.: varje sektion redovisar datum och datakällor för den " +
    "underliggande analysen — dokumentet tillför inget eget, senare datum. " +
    "Metod, vikter och trösklar är publicerade: varje utfall kan räknas om " +
    "(öppen falsifierbarhet).",
]);

// ── Vakt: inget ansvarsskjutande språk (b4 lager 2) ─────────────────────────

/**
 * Mönster som AVVISAS ur disclaimerTillägg. Tenant får lägga till egen
 * juridik om sin egen verksamhet — aldrig språk som (a) flyttar ansvar TILL
 * AK1A ("AK1A garanterar/svarar för…"), (b) friskriver rådgivaren, eller
 * (c) upphäver/mjukar det mal-låsta blocket ("gäller ej", "stryks", …).
 * Skiftlägesokänsliga, deterministiska, inga beroenden.
 */
const ANSVARSSKJUTANDE_MONSTER: readonly RegExp[] = Object.freeze([
  /ak1a[^.]{0,120}(garanterar|garanterad|ansvarar|svarar för)/i,
  /(garanterar|garanterad)[^.]{0,80}ak1a/i,
  /(friskriver|friskriven|friskriver sig|ansvarsbefriad|utan ansvar|befrias från ansvar)/i,
  /(metoddeklaration|ansvarsdeklaration|metod- och ansvarsdeklaration|disclaimer|deklaration)[^.]{0,80}(gäller ej|gäller inte|undantas|upphävs|ignoreras|stryks|strykas|tas bort|raderas|suddas)/i,
]);

/** Pröva ett tillägg mot vakten — rent, deterministiskt. */
export function arTillaggGodkand(
  text: string,
): { ok: boolean; anledning: string | null } {
  const t = typeof text === "string" ? text.trim() : "";
  if (t.length === 0) return { ok: true, anledning: null };
  for (const re of ANSVARSSKJUTANDE_MONSTER) {
    re.lastIndex = 0; // globala/lastIndex-säkerhet — statefulla regexar börjar om
    const m = re.exec(t);
    if (m) {
      return {
        ok: false,
        anledning:
          'ansvarsskjutande/mjukande språk ("' +
          m[0] +
          '") — b4 lager 2: tenant LÄGGER TILL, aldrig subtraherar (K5)',
      };
    }
  }
  return { ok: true, anledning: null };
}

// ── Disclaimer-bygget (rendering + test delar EXAKT denna funktion) ─────────

/**
 * Rapportens disclaimer-rader: MAL_LAST_RADER först (alltid, oavsett tenant),
 * därefter tenantens tillägg — ENDAST om vakten godkänner det. Finns ingen
 * kodväg som kortar, mjukar eller suddar kärnan; samma tenant ⇒ samma rader
 * (P1-determinism).
 */
export function byggDisclaimerRader(
  tenant: TenantConfig | null | undefined,
): readonly string[] {
  const rader = [...MAL_LAST_RADER];
  const tillagg =
    typeof tenant?.disclaimerTillägg === "string"
      ? tenant.disclaimerTillägg.trim()
      : "";
  if (tillagg.length > 0 && arTillaggGodkand(tillagg).ok) {
    rader.push(tillagg);
  }
  return rader;
}

/**
 * Mal-låst rapporttext för en tenant — testvägen till mal-låsningen: kärnblocket
 * måste vara närvarande oavsett tenant (även fientliga tillägg som FÖRSÖKER ta
 * bort det). Renderingslagret (rapportbyggare.tsx) bygger sin footer ur
 * byggDisclaimerRader — samma källa, samma garanti.
 */
export function malLåstRapportText(
  tenant: TenantConfig | null | undefined,
): string {
  return byggDisclaimerRader(tenant).join("\n");
}

// ── pro-admin-v1 → TenantConfig (localStorage-mappning) ─────────────────────

/** localStorage-nyckel — ÄRVER pro-admin-panelets kontrakt (ingen ny nyckel). */
export const TENANT_LS_NYCKEL = "pro-admin-v1";

/** Id för tenant konstruerad ur lokala pro-admin-inställningar (demo-läge G1). */
export const LOKAL_TENANT_ID = "pro-admin-v1-lokal";

function plockaStrang(v: unknown, maxLangd: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLangd);
}

/** Logotyp-URL-vakt: endast https:// eller rotrelativa /… — aldrig javascript: m.m. */
function plockaLogotypUrl(v: unknown): string | undefined {
  const s = plockaStrang(v, 300);
  if (s.length === 0) return undefined;
  if (s.startsWith("https://") || s.startsWith("/")) return s;
  return undefined; // http://- och schema-lösa URL:er avvisas — logotypen får vara en säker länk
}

/**
 * Läs tenant ur localStorage "pro-admin-v1" (pro-admin-panelets kontrakt):
 *   { mallar: {…}, whiteLabel: { foretagsnamn, logotypUrl, fargtemaPrefix,
 *               disclaimerTillagg? } }
 * Fält-mappning → TenantConfig: foretagsnamn→firmNamn, logotypUrl→logotypUrl
 * (https//rotrelativ vakt), fargtemaPrefix→brandFarger.temaPrefix,
 * disclaimerTillagg→disclaimerTillägg (vakten prövas av byggDisclaimerRader).
 * Tomt/ogiltigt/SSR ⇒ null (avsändaren är då AK1A — ingen white-label).
 * JSON-nycklarna i pro-admin-v1 förblir åäö-fria (P7); kontraktstypen får åäö.
 */
export function lasTenantFranLocalStorage(): TenantConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const rå = window.localStorage.getItem(TENANT_LS_NYCKEL);
    if (!rå) return null;
    const tolkad: unknown = JSON.parse(rå);
    if (typeof tolkad !== "object" || tolkad === null) return null;
    const rot = tolkad as Record<string, unknown>;
    const wlRå = rot.whiteLabel;
    const wl: Record<string, unknown> =
      typeof wlRå === "object" && wlRå !== null && !Array.isArray(wlRå)
        ? (wlRå as Record<string, unknown>)
        : {};

    const firmNamn = plockaStrang(wl.foretagsnamn, 120);
    if (firmNamn.length === 0) return null; // ingen firma konfigurerad ⇒ ingen tenant

    const logotypUrl = plockaLogotypUrl(wl.logotypUrl);
    const temaPrefix = plockaStrang(wl.fargtemaPrefix, 40);
    const disclaimerTillägg = plockaStrang(wl.disclaimerTillagg, 600);

    const tenant: TenantConfig = { id: LOKAL_TENANT_ID, firmNamn };
    if (logotypUrl !== undefined) tenant.logotypUrl = logotypUrl;
    if (temaPrefix.length > 0) tenant.brandFarger = { temaPrefix };
    if (disclaimerTillägg.length > 0) tenant.disclaimerTillägg = disclaimerTillägg;
    return tenant;
  } catch {
    return null; // ogiltig JSON/privat läge — tyst, avsändaren förblir AK1A
  }
}
