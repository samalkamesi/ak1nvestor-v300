/**
 * NYHETSKANALER — klientside kanal-state för Nyhetscentralen.
 *
 * VIKTIGT: detta modul importeras av klientkomponenter och får DÄRFÖR INTE
 * importera src/lib/nyhets-motor.ts — motorn drar med sig datacache (fs/path,
 * "ALDRIG importeras av klientkomponenter"). Två saker speglas därför LOKALT
 * och måste hållas i synk med motorn (källan till sanningen):
 *   1. AMNESKANALER — metadata (id/namn/beskrivning) ur motorns
 *      STANDARD_AMNESKANALER; URL:erna stannar på servern.
 *   2. rssFel — samma regler som motorns valideraRssUrl (https, inga
 *      inloggningsuppgifter, inga interna/privata värdar). API-routen
 *      /api/nyheter validerar om på servern — klientkontrollen är bara
 *      omedelbar feedback.
 *
 * Ägande: lasKanaler()/sparaKanaler() läser och skriver hela kanal-objektet
 * i localStorage ("ak1a-nyhetskanaler-v1") med sanitizing + merge mot
 * default. Varje muterande funktion gör las → ändra → spara och returnerar
 * {kanaler, fel?} — sparning sker ENDAST när ändringen gått igenom
 * (auto-spara-effekten i Nyhetscentralen).
 *
 * Portfölj-tickers (fältet `tickers`) matas av komponenten från
 * /api/member/portfolio (fallback: navigationsminnet) — aldrig av eleven
 * direkt. Bevakning, ämneskanaler och egna RSS-flöden är elevens egna.
 */

export type NyhetsKanaler = {
  tickers: string[]; // portfölj-tickers (auto från portföljen)
  bevakning: string[]; // elevens bevaknings-tickers
  amnen: string[]; // valda ämneskanal-ids (måste finnas i AMNESKANALER)
  rss: Array<{ url: string; namn: string }>; // egna RSS-flöden (max 5)
};

/** Retur från muterande funktioner — kanaler (nya eller oförändrade) + ev. fel. */
export type KanalResultat = { kanaler: NyhetsKanaler; fel?: string };

const NYCKEL = "ak1a-nyhetskanaler-v1";

export const MAX_RSS = 5;
export const MAX_BEVAKNING = 15;
export const MAX_TICKERS_TOTALT = 15; // portfölj + bevakning tillsammans

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/**
 * Ämneskanaler — KLIENTKOPIA av nyhets-motor.ts STANDARD_AMNESKANALER
 * (metadata utan URL:er). Id:na skickas till /api/nyheter?amnen=… och måste
 * överensstämma exakt med motorn. Synk: 2026-09-01, 4 kanaler.
 */
export type AmneskanalKlient = { id: string; namn: string; beskrivning: string };

export const AMNESKANALER: readonly AmneskanalKlient[] = [
  {
    id: "svt-ekonomi",
    namn: "SVT Ekonomi",
    beskrivning: "Svenska ekonominyheter från SVT (cirka 100 poster, 57 KB).",
  },
  {
    id: "di",
    namn: "Dagens industri",
    beskrivning: "Börs och näringsliv (cirka 20 poster, 24 KB — vissa artiklar bakom betalvägg).",
  },
  {
    id: "privata-affarer",
    namn: "Privata Affärer",
    beskrivning: "Börs, aktier och privatekonomi (cirka 100 poster, 105 KB).",
  },
  {
    id: "yahoo-varlden",
    namn: "Yahoo Finance — världsmarknaden",
    beskrivning: "Världens börser via Yahoo Finance (engelska, cirka 20 poster, 14 KB).",
  },
];

/** Id:t på standardkanalerna — uppslag för sanitizing + toggle. */
const KANDA_AMNEN = new Set(AMNESKANALER.map((k) => k.id));

/** Default: de två första standardkanalerna, tomma övriga. */
export function standardKanaler(): NyhetsKanaler {
  return {
    tickers: [],
    bevakning: [],
    amnen: AMNESKANALER.slice(0, 2).map((k) => k.id),
    rss: [],
  };
}

// ── Läsning + skrivning ─────────────────────────────────────────────────────

/** Sanitiza ett rå-objekt till en giltig NyhetsKanaler (tål felaktig JSON). */
function rensa(rå: unknown): NyhetsKanaler | null {
  if (typeof rå !== "object" || rå === null) return null;
  const r = rå as Record<string, unknown>;

  const strLista = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((s): s is string => typeof s === "string" && s.length > 0) : [];

  const tickers = strLista(r.tickers).map((t) => t.toUpperCase()).filter((t) => TICKER_RE.test(t));
  const bevakning = strLista(r.bevakning).map((t) => t.toUpperCase()).filter((t) => TICKER_RE.test(t));
  const amnen = strLista(r.amnen).filter((id) => KANDA_AMNEN.has(id));

  const rss: Array<{ url: string; namn: string }> = [];
  if (Array.isArray(r.rss)) {
    const sett = new Set<string>();
    for (const e of r.rss) {
      if (typeof e !== "object" || e === null) continue;
      const { url, namn } = e as Record<string, unknown>;
      if (typeof url !== "string" || !/^https:\/\//.test(url) || sett.has(url)) continue;
      sett.add(url);
      rss.push({ url, namn: typeof namn === "string" && namn ? namn.slice(0, 40) : url });
      if (rss.length >= MAX_RSS) break;
    }
  }

  return {
    tickers: [...new Set(tickers)],
    bevakning: [...new Set(bevakning)].slice(0, MAX_BEVAKNING),
    amnen: [...new Set(amnen)],
    rss,
  };
}

/**
 * Las kanaler ur localStorage. Merge-med-default: saknas lagrat data (eller
 * är korrupt) returneras standard — men en medveten TOM lista respekteras
 * (eleven får gärna ha avbockat alla ämneskanaler).
 */
export function lasKanaler(): NyhetsKanaler {
  if (typeof window === "undefined") return standardKanaler();
  try {
    const rå = window.localStorage.getItem(NYCKEL);
    if (!rå) return standardKanaler();
    const rensad = rensa(JSON.parse(rå));
    return rensad ?? standardKanaler();
  } catch {
    return standardKanaler();
  }
}

export function sparaKanaler(k: NyhetsKanaler): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NYCKEL, JSON.stringify(k));
  } catch {
    /* privat läge etc. — flödet fungerar ändå denna session */
  }
}

/** Skriv portfölj-tickers (auto-matat) — returnerar uppdaterat state. */
export function sattPortfoljTickers(tickers: string[]): NyhetsKanaler {
  const k = lasKanaler();
  const rensade = [...new Set(tickers.map((t) => t.toUpperCase()).filter((t) => TICKER_RE.test(t)))].slice(
    0,
    MAX_TICKERS_TOTALT
  );
  if (rensade.join(",") === k.tickers.join(",")) return k; // oförändrat — ingen skrivning
  const ny = { ...k, tickers: rensade };
  sparaKanaler(ny);
  return ny;
}

// ── Bevaknings-tickers ──────────────────────────────────────────────────────

export function lagTillBevakning(t: string): KanalResultat {
  const k = lasKanaler();
  const ticker = t.trim().toUpperCase();
  if (!TICKER_RE.test(ticker)) return { kanaler: k, fel: "Ogiltig ticker (A–Z, 0–9, punkt, bindestreck — max 12 tecken)." };
  if (k.bevakning.includes(ticker)) return { kanaler: k, fel: `${ticker} bevakas redan.` };
  if (k.tickers.includes(ticker)) return { kanaler: k, fel: `${ticker} ligger redan i din portfölj.` };
  if (k.tickers.length + k.bevakning.length >= MAX_TICKERS_TOTALT)
    return { kanaler: k, fel: `Max ${MAX_TICKERS_TOTALT} kanaler totalt (portfölj + bevakning).` };
  const ny = { ...k, bevakning: [...k.bevakning, ticker] };
  sparaKanaler(ny);
  return { kanaler: ny };
}

export function taBortBevakning(t: string): KanalResultat {
  const k = lasKanaler();
  const ny = { ...k, bevakning: k.bevakning.filter((x) => x !== t) };
  sparaKanaler(ny);
  return { kanaler: ny };
}

// ── Ämneskanaler ────────────────────────────────────────────────────────────

export function togglAamne(id: string): KanalResultat {
  const k = lasKanaler();
  if (!KANDA_AMNEN.has(id)) return { kanaler: k, fel: "Okänd ämneskanal." };
  const ny = {
    ...k,
    amnen: k.amnen.includes(id) ? k.amnen.filter((x) => x !== id) : [...k.amnen, id],
  };
  sparaKanaler(ny);
  return { kanaler: ny };
}

// ── Egna RSS-flöden ─────────────────────────────────────────────────────────

/**
 * Validera en RSS-adress — samma regler som motorns valideraRssUrl (ren
 * kopia: motorn lever i en server-modul och kan inte importeras hit):
 * https endast, inga inloggningsuppgifter, inga interna/privata värdar.
 * Returnerar fel-text eller null (godkänt). Servern dubbelkollar.
 */
export function rssFel(url: string): string | null {
  const ren = url.trim();
  if (!ren) return "Skriv en RSS-adress först.";
  if (ren.length > 2000) return "Adressen är orimligt lång.";
  if (!/^https:\/\//i.test(ren)) return "Endast https:// tillåts.";

  let u: URL;
  try {
    u = new URL(ren);
  } catch {
    return "Ogiltig adress — kolla att den är komplett.";
  }
  if (u.username !== "" || u.password !== "") return "Adress med inloggningsuppgifter tillåts inte.";

  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal"))
    return "Intern värd är blockerad — endast publika https-flöden.";
  // Numeriska värdar (IPv4/IPv6): privata/reserverade blockeras i motorn;
  // klienten avvisar samtliga numeriska för enkelhetens skull.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.startsWith("[")) return "Numerisk värdadress är blockerad.";
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host)) return "Ogiltigt värdnamn i adressen.";

  return null;
}

export function lagTillRss(url: string, namn: string): KanalResultat {
  const k = lasKanaler();
  const ren = url.trim();
  const fel = rssFel(ren);
  if (fel) return { kanaler: k, fel };
  if (k.rss.some((e) => e.url === ren)) return { kanaler: k, fel: "Flödet finns redan i listan." };
  if (k.rss.length >= MAX_RSS) return { kanaler: k, fel: `Max ${MAX_RSS} egna flöden.` };
  const renNamn = namn.trim().slice(0, 40) || ren.replace(/^https?:\/\//, "").split("/")[0];
  const ny = { ...k, rss: [...k.rss, { url: ren, namn: renNamn }] };
  sparaKanaler(ny);
  return { kanaler: ny };
}

export function taBortRss(url: string): KanalResultat {
  const k = lasKanaler();
  const ny = { ...k, rss: k.rss.filter((e) => e.url !== url) };
  sparaKanaler(ny);
  return { kanaler: ny };
}
