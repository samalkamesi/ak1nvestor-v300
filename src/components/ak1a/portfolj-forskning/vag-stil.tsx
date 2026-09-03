"use client";

import type { CSSProperties } from "react";
import type {
  Bransch,
  Dynamik,
  Horisont,
  KorstabbellRad,
  RiskNiva,
  TillvaxtTakt,
  VagKlass,
} from "@/lib/portfolj-forskning/typer";
import { BRANSCHER } from "@/lib/portfolj-forskning/typer";

// ═══════════════════════════════════════════════════════════
// PORTFÖLJFORSKNING — delat visuellt språk för vågklasser,
// dynamik, status och talformat. Gemensam källa för korstabellen,
// djupvyn och riskvalet så att färgkoden ALDRIG glider isär.
//
// Färgsystem enligt kunddirektiv:
//   impulsvåg  ↗  grönmörk  (--bull)
//   korrigering ↘  koppar   (--koppar-lys, följer ljus/mörkt tema)
//   basbygge   →  gråblå    (--neutral-signal)
//   osatt      ·  grå       (--muted)
// Dynamik: förbättras ↑ bull · stabilt → guld · försvagas ↓ bear.
// ═══════════════════════════════════════════════════════════

// ── Horisontetiketter (visningsordning = typkontraktets) ────────────────────

export const HZ_VISNING: Array<{ id: Horisont; namn: string; hjalp: string }> = [
  { id: "mikro", namn: "Mikro", hjalp: "senaste dagarnas rytm" },
  { id: "kort", namn: "Kort", hjalp: "kvartalets rytm" },
  { id: "medellang", namn: "Medellång", hjalp: "tolvmånadersrytmen" },
  { id: "lang", namn: "Lång", hjalp: "konjunkturvågan" },
  { id: "mega", namn: "Mega", hjalp: "sekulärvågan" },
];

// ── Vågklass: text, ikon, färg ───────────────────────────────────────────────

export const VAG_TEXT: Record<VagKlass, string> = {
  impulsvag: "Impulsvåg",
  korrigering: "Korrigering",
  basbygge: "Basbygge",
  osatt: "Osatt",
};

export const VAG_IKON: Record<VagKlass, string> = {
  impulsvag: "↗",
  korrigering: "↘",
  basbygge: "→",
  osatt: "·",
};

/** Koppar-läge via CSS-variabel — följer automatiskt ljus/mörkt tema. */
const KOPPAR_STIL: CSSProperties = {
  color: "var(--koppar-lys, #8C5A2B)",
  borderColor: "color-mix(in srgb, var(--koppar-lys, #8C5A2B) 35%, transparent)",
  background: "color-mix(in srgb, var(--koppar-lys, #8C5A2B) 12%, transparent)",
};

/** Ytstil per vågklass — antingen Tailwind-klasser eller inline-koppar. */
export function vagYtStil(klass: VagKlass): { klass: string; style?: CSSProperties } {
  switch (klass) {
    case "impulsvag":
      return { klass: "border-bull/30 bg-bull/10 text-bull" };
    case "korrigering":
      return { klass: "", style: KOPPAR_STIL };
    case "basbygge":
      return { klass: "border-neutral-signal/30 bg-neutral-signal/10 text-neutral-signal" };
    default:
      return { klass: "border-border bg-muted/40 text-muted-foreground" };
  }
}

/** Kompakt vågklass-cell — ikonen bär färgen, tooltip bär förklaringen. */
export function VagCell({
  klass,
  titel,
  storlek = "sm",
}: {
  klass: VagKlass;
  titel?: string;
  storlek?: "xs" | "sm" | "lg";
}) {
  const stor =
    storlek === "lg"
      ? "h-9 w-9 text-sm"
      : storlek === "xs"
        ? "h-6 w-6 text-[11px]"
        : "h-7 w-7 text-xs";
  const yt = vagYtStil(klass);
  return (
    <span
      title={titel ?? VAG_TEXT[klass]}
      className={`inline-flex shrink-0 items-center justify-center rounded border font-bold leading-none ${stor} ${yt.klass}`}
      style={yt.style}
    >
      {VAG_IKON[klass]}
    </span>
  );
}

// ── Dynamik: "var vi är på väg" ──────────────────────────────────────────────

export const DYNAMIK_TEXT: Record<Dynamik, string> = {
  forbattras: "Förbättras",
  stabilt: "Stabilt",
  forsvamras: "Försvagas",
  osatt: "Osatt",
};

export const DYNAMIK_IKON: Record<Dynamik, string> = {
  forbattras: "↑",
  stabilt: "→",
  forsvamras: "↓",
  osatt: "·",
};

const DYNAMIK_FARG: Record<Dynamik, string> = {
  forbattras: "text-bull",
  stabilt: "text-gold",
  forsvamras: "text-bear",
  osatt: "text-muted-foreground",
};

/** Dynamik-pil — förbättras ↑ / stabilt → / försvagas ↓. */
export function DynamikPil({ dynamik, visaText = false }: { dynamik: Dynamik; visaText?: boolean }) {
  return (
    <span
      title={`Dynamik: ${DYNAMIK_TEXT[dynamik]}`}
      className={`inline-flex items-center gap-1 text-xs font-bold leading-none ${DYNAMIK_FARG[dynamik]}`}
    >
      <span aria-hidden>{DYNAMIK_IKON[dynamik]}</span>
      {visaText && <span className="text-[10px] font-semibold uppercase tracking-wider">{DYNAMIK_TEXT[dynamik]}</span>}
      <span className="sr-only">{DYNAMIK_TEXT[dynamik]}</span>
    </span>
  );
}

// ── AKM1-poäng: bandmönster från konfluensradarn (grå → guld → marin) ────────

const AKM1_BAND = {
  grå: { bg: "rgba(90,80,69,0.12)", text: "#5a5045" },
  guld: { bg: "rgba(168,134,42,0.16)", text: "#a8862a" },
  marin: { bg: "linear-gradient(160deg, #0E1B2E, #081120)", text: "#E8C766" },
} as const;

/**
 * AKM1-poäng som tabular chip med färgband (≥70 marin, ≥40 guld, annars grå).
 * Med maxMojligt (D1): visar "poäng/max" — poängen mot det teoretiska taket med
 * nuvarande datatäckning. Taket döljs ALDRIG när det är känt (dataärlighet:
 * en poäng utan sitt tak är en dold ursäkt).
 */
export function Akm1Chip({
  varde,
  max,
  stor = false,
}: {
  varde: number | null;
  max?: number | null;
  stor?: boolean;
}) {
  if (varde === null || !Number.isFinite(varde)) {
    return <span className="font-mono text-lg font-bold text-muted-foreground">—</span>;
  }
  const v = Math.round(varde);
  const band = v >= 70 ? AKM1_BAND.marin : v >= 40 ? AKM1_BAND.guld : AKM1_BAND.grå;
  const maxTal = typeof max === "number" && Number.isFinite(max) ? Math.round(max) : null;
  const titel =
    maxTal !== null
      ? `AKM1-total: ${v} av teoretiskt max ${maxTal} med nuvarande datatäckning — saknad data ger alltid 0 poäng, modellen straffar aldrig saknad data`
      : `AKM1-total: ${v} av 100`;
  return (
    <span
      className={`tabular inline-block rounded-lg px-2.5 py-1 font-mono font-bold leading-none ${stor ? "text-2xl" : "text-lg"}`}
      style={{ background: band.bg, color: band.text }}
      title={titel}
    >
      {v}
      {maxTal !== null && (
        <span className={`ml-0.5 font-semibold opacity-80 ${stor ? "text-base" : "text-xs"}`}>
          /{maxTal}
        </span>
      )}
    </span>
  );
}

// ── Datatäckning (D1 — andel av modellens vikt med dataunderlag) ────────────

/** Täckning i hela procent utan tecken: 0.711 → "71 %". Null/ogiltigt → "—". */
export function tatText(t: number | null | undefined): string {
  if (t === null || t === undefined || !Number.isFinite(t)) return "—";
  return `${Math.round(t * 100)} %`;
}

/** Täckningsband enligt D1: ≥80 % grön, 50–79 % gul, <50 % grå ("låg"). */
export function tatKlass(t: number | null | undefined): string {
  if (t === null || t === undefined || !Number.isFinite(t)) {
    return "border-border bg-muted/40 text-muted-foreground";
  }
  if (t >= 0.8) return "border-bull/30 bg-bull/10 text-bull";
  if (t >= 0.5) return "border-gold/40 bg-gold/15 text-gold";
  return "border-border bg-muted/40 text-muted-foreground";
}

/**
 * Täcknings-chip — andel av modellens vikt med dataunderlag.
 * Tooltip förklarar måttet; <50 % märks "låg" (svagt underlag ska synas).
 */
export function TackningChip({ tat }: { tat: number | null | undefined }) {
  const mangd = typeof tat === "number" && Number.isFinite(tat) ? tat : null;
  const lag = mangd !== null && mangd < 0.5;
  return (
    <span
      title={`Datatäckning — andel av modellens vikt med dataunderlag${mangd !== null ? `: ${tatText(mangd)} av totalvikten (97 viktenheter); saknad data ger alltid 0 poäng` : ""}`}
      className={`tabular inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold leading-none ${tatKlass(tat)}`}
    >
      {tatText(mangd)}
      {lag && <span className="text-[9px] font-semibold uppercase tracking-wider">låg</span>}
    </span>
  );
}

// ── Kategoripoäng (AKM1:s 7 kategorier) ─────────────────────────────────────

/** Nycklar utan å/ä/ö (JSON-konventionen) + svenska visningsnamn. */
export const KATEGORIER: Array<{ nyckel: string; namn: string }> = [
  { nyckel: "tillvaxt", namn: "Tillväxt" },
  { nyckel: "vardering", namn: "Värdering" },
  { nyckel: "lonsamhet", namn: "Lönsamhet" },
  { nyckel: "stabilitet", namn: "Stabilitet" },
  { nyckel: "moat", namn: "Moat" },
  { nyckel: "katalysator", namn: "Katalysator" },
  { nyckel: "risk", namn: "Risk" },
];

/** Läs kategoripoäng — accepterar både ASCII-nyckel och svenskt namn. */
export function kategoriPoang(rad: KorstabbellRad, kat: { nyckel: string; namn: string }): number | null {
  const a = rad.akm1PerKategori?.[kat.nyckel];
  if (typeof a === "number" && Number.isFinite(a)) return a;
  const b = rad.akm1PerKategori?.[kat.namn];
  if (typeof b === "number" && Number.isFinite(b)) return b;
  return null;
}

// ── Status (strikta krav-sammanfattning) ────────────────────────────────────

export type StatusMarkering = KorstabbellRad["status"];

export const STATUS_TEXT: Record<StatusMarkering, { kort: string; lang: string }> = {
  gron: { kort: "Grön", lang: "Grön — strikta krav uppfyllda" },
  gul: { kort: "Gul", lang: "Gul — varningar i kravkontrollen" },
  rod: { kort: "Röd", lang: "Röd — strikta krav brutna" },
  osatt: { kort: "Osatt", lang: "Osatt — underlaget räcker inte" },
};

const STATUS_STIL: Record<StatusMarkering, string> = {
  gron: "border-bull/30 bg-bull/10 text-bull",
  gul: "border-gold/40 bg-gold/15 text-gold",
  rod: "border-bear/30 bg-bear/10 text-bear",
  osatt: "border-border bg-muted/40 text-muted-foreground",
};

export function StatusChip({ status }: { status: StatusMarkering }) {
  return (
    <span
      title={STATUS_TEXT[status].lang}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${STATUS_STIL[status]}`}
    >
      {STATUS_TEXT[status].kort}
    </span>
  );
}

// ── Bransch ─────────────────────────────────────────────────────────────────

export const BRANSCH_NAMN: Record<Bransch, string> = {
  teknik: "Teknik",
  industri: "Industri",
  halso: "Hälsa",
  konsument: "Konsument",
  fastighet: "Fastighet",
  finans: "Finans",
  material: "Material",
  energi: "Energi",
  kommunikation: "Kommunikation",
  tillvaxt: "Tillväxt",
};

/** Gruppera rader per bransch i typkontraktets canonicala ordning. */
export function grupperaBranscher(
  rader: KorstabbellRad[],
  sortDir: "asc" | "desc" | null = null,
): Array<{ bransch: Bransch; rader: KorstabbellRad[] }> {
  const ut: Array<{ bransch: Bransch; rader: KorstabbellRad[] }> = [];
  for (const b of BRANSCHER) {
    const grupp = rader.filter((r) => r.bransch === b);
    if (grupp.length === 0) continue;
    if (sortDir === "desc") grupp.sort((x, y) => y.akm1Totalt - x.akm1Totalt);
    else if (sortDir === "asc") grupp.sort((x, y) => x.akm1Totalt - y.akm1Totalt);
    ut.push({ bransch: b, rader: grupp });
  }
  return ut;
}

// ── Riskprofil-etiketter ────────────────────────────────────────────────────

export const RISKNIVA_TEXT: Record<RiskNiva, string> = {
  konservativ: "Konservativ",
  balanserad: "Balanserad",
  tillvaxt: "Tillväxt",
};

export const TAKT_TEXT: Record<TillvaxtTakt, string> = {
  lugn: "Lugn",
  stadig: "Stadig",
  aggressiv: "Aggressiv",
};

// ── Svenska tal- och datumformat (deterministiska — hydrationssäkra) ────────

const MANADER = [
  "januari", "februari", "mars", "april", "maj", "juni",
  "juli", "augusti", "september", "oktober", "november", "december",
] as const;

const MANADER_KORT = [
  "jan", "feb", "mar", "apr", "maj", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
] as const;

/** Decimal till svensk kommaform: 2.5 → "2,5" (inga trailing-nollor). */
function komma(x: number, decimaler: number): string {
  return x.toFixed(decimaler).replace(".", ",").replace(/,?0+$/, (m) => (m.startsWith(",") ? "" : m));
}

/** "245,50" — fast antal decimaler. */
export function talText(varde: number | null, decimaler = 2): string {
  if (varde === null || !Number.isFinite(varde)) return "—";
  return varde.toFixed(decimaler).replace(".", ",");
}

/** Poäng: heltal → "78", annars en decimal → "78,5". Null → "—". */
export function poangText(varde: number | null): string {
  if (varde === null || !Number.isFinite(varde)) return "—";
  if (Number.isInteger(varde)) return String(varde);
  return komma(varde, 1);
}

/** Decimalandel → "+28 %" / "−8,4 %" (äkta minustecken, U+2212). Null → "—". */
export function procentText(varde: number | null | undefined): string {
  if (varde === null || varde === undefined || !Number.isFinite(varde)) return "—";
  const pct = varde * 100;
  const t = komma(Math.abs(pct), 1);
  if (pct > 0) return `+${t} %`;
  if (pct < 0) return `−${t} %`;
  return "0 %";
}

/** "2026-08-31" → "31 augusti 2026". Ogiltig indata returneras rå. */
export function datumText(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return iso ?? "—";
  return `${Number(m[3])} ${MANADER[Number(m[2]) - 1] ?? ""} ${m[1]}`.trim();
}

/** "2026-08-31" → "aug 2026". */
export function manadText(iso: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(iso ?? "");
  if (!m) return iso ?? "—";
  return `${MANADER_KORT[Number(m[2]) - 1] ?? ""} ${m[1]}`.trim();
}

/** "2026-08-31" → "Q3" (kvartal som tillfället tillhör). Ogiltigt → null. */
export function kvartalEtikett(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})/.exec(iso ?? "");
  if (!m) return null;
  return `Q${Math.floor((Number(m[2]) - 1) / 3) + 1}`;
}
