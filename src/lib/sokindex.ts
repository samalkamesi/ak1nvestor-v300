/**
 * SÖKINDEX — kommandopalettens datakälla.
 * Statiska poster (sidor + verktyg + träning) + kurser som
 * lazy-laddas från /deep-courses.json vid första sökningen.
 */

export type SokKategori = "Sida" | "Verktyg" | "Kurs" | "Träning";

export type SokPost = {
  titel: string;
  lank: string;
  beskrivning?: string;
  kategori: SokKategori;
  ikon: string;
  /** extra sökbara ord (t.ex. "V01 omsättning tillväxt") */
  nycklar?: string;
};

const STATISKA: SokPost[] = [
  // — LÄR —
  { titel: "Manifestet", lank: "/manifest", kategori: "Sida", ikon: "🏛️", beskrivning: "Vår vision: världens bästa finansutbildning", nycklar: "vision filosofi varför kontroversiell" },
  { titel: "Läroplanen", lank: "/laroplan", kategori: "Sida", ikon: "🗺️", beskrivning: "5 nivåer → oberoende analytiker", nycklar: "nivåer struktur gang studiemedel" },
  { titel: "Alla kurser", lank: "/kurser", kategori: "Sida", ikon: "📚", beskrivning: "Hela biblioteket med quiz", nycklar: "bibliotek 285 kurser" },
  { titel: "Biblioteket — bokkanon", lank: "/bibliotek", kategori: "Sida", ikon: "📖", beskrivning: "100 böcker mappade mot AKM1/AK1TS", nycklar: "bokkanon bocker lasning" },
  { titel: "Certifikat", lank: "/certifikat", kategori: "Sida", ikon: "🏅", beskrivning: "Ditt intyg på kompetens", nycklar: "intyg betyg diplom" },
  // — ANALYSERA —
  { titel: "AKM1-kalkylatorn", lank: "/kalkylator", kategori: "Verktyg", ikon: "🧮", beskrivning: "20 fundamentalvariabler · V01–V20", nycklar: "V01 V02 V03 fundamental variabler kalkylera" },
  { titel: "Vågfundamentet", lank: "/vagfundament", kategori: "Verktyg", ikon: "🌊", beskrivning: "Fundamentalvågor — 20×5-matris per aktie & portfölj", nycklar: "vagfundament fundamentalvagor vagklass indikatorer tidsserie matris impulsvag korrigering basbygge" },
  { titel: "Portföljbyggaren", lank: "/portfoljbyggare", kategori: "Verktyg", ikon: "🧩", beskrivning: "Bygg visuellt — se risk & spridning live", nycklar: "portfolj bygg allokering sektor spridning koncentration risk donut" },
  { titel: "Net-net-skannern", lank: "/netnet", kategori: "Verktyg", ikon: "🔍", beskrivning: "Grahams cigar-butts — NCAV-screening live", nycklar: "netnet ncav cigar butt screening graham billigt under bokvardt" },
  { titel: "Superanalysen", lank: "/superanalys", kategori: "Verktyg", ikon: "🏅", beskrivning: "Guidad analys i 24 steg · AKM1 + AK1TS", nycklar: "wizard guide 24 steg analysflode" },
  { titel: "Min portfölj", lank: "/min-portfolj", kategori: "Verktyg", ikon: "💼", beskrivning: "Innehav + djupanalys (5×5×4)", nycklar: "portfolj innehav djupanalys matris" },
  { titel: "Analyser", lank: "/analyser", kategori: "Sida", ikon: "📊", beskrivning: "Fullständiga bolagsanalyser", nycklar: "bolag aktie rapport" },
  { titel: "AI-Diagnos", lank: "/diagnos", kategori: "Verktyg", ikon: "🧠", beskrivning: "Kognitiv profil — 3 minuter", nycklar: "kognitiv profil bias riskaptit" },
  { titel: "Kognitiv profil", lank: "/profil", kategori: "Verktyg", ikon: "🧠", beskrivning: "5 marknadsscenarier → din profil", nycklar: "profil scenarier beteende" },
  { titel: "Labbar", lank: "/labb", kategori: "Sida", ikon: "🧪", beskrivning: "Forskningsärenden", nycklar: "forskning labb case" },
  // — TRÄNA —
  { titel: "Min Sida", lank: "/min-sida", kategori: "Träning", ikon: "🏠", beskrivning: "Din dashboard — allt på ett ställe", nycklar: "dashboard xp niva streak" },
  { titel: "Dagens Pass", lank: "/dagens-pass", kategori: "Träning", ikon: "⚡", beskrivning: "5 minuters daglig marknadsträning", nycklar: "daglig rutin streak aktie" },
  { titel: "Topplistan", lank: "/topplista", kategori: "Träning", ikon: "🏆", beskrivning: "Eleverna rankade på XP", nycklar: "ranking tavalning xp" },
  { titel: "Badges & meriter", lank: "/badges", kategori: "Träning", ikon: "🎖️", beskrivning: "29 troféer att förtjäna", nycklar: "badge trofe meriten" },
  { titel: "Fas 2-ansökan", lank: "/fas2-ansok", kategori: "Sida", ikon: "✉️", beskrivning: "Utbildning med grundaren", nycklar: "ansok fas 2 kostnadsfritt" },
  { titel: "Medlemskap", lank: "/medlemskap", kategori: "Sida", ikon: "💛", beskrivning: "Fas 1 gratis · Fas 2 · Fas 3", nycklar: "pris gratis fas" },
  { titel: "Bloggen", lank: "/blogg", kategori: "Sida", ikon: "✍️", beskrivning: "Guider + marknadskommentarer", nycklar: "guider inlagg kommentarer" },
  { titel: "Logga in", lank: "/logga-in", kategori: "Sida", ikon: "🔑", beskrivning: "Medlemsinloggning", nycklar: "login konto" },
  { titel: "Om oss", lank: "/om-oss", kategori: "Sida", ikon: "🏛️", beskrivning: "AK1A Research Lab", nycklar: "om foretaget" },
];

// — kurscache —
let kursPoster: SokPost[] | null = null;

async function lasKurser(): Promise<SokPost[]> {
  if (kursPoster) return kursPoster;
  try {
    const res = await fetch("/deep-courses.json");
    const data = await res.json();
    const arr = Array.isArray(data) ? data : data.kurser || Object.values(data);
    kursPoster = (arr as Array<Record<string, unknown>>).map((k) => ({
      titel: String(k.title || k.titel || k.slug || ""),
      lank: `/kurser/${k.slug}`,
      beskrivning: String(k.summary || "").slice(0, 110),
      kategori: "Kurs" as const,
      ikon: "📖",
      nycklar: [k.category, k.level, k.slug].filter(Boolean).join(" "),
    }));
  } catch {
    kursPoster = [];
  }
  return kursPoster;
}

/** Normalisera: åäö→aao, gemener, klipp icke-ord. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/é/g, "e")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Poängsätt en post mot en normaliserad fråga. Högre = bättre. */
function poang(post: SokPost, fraga: string): number {
  const t = norm(post.titel);
  const b = norm(post.beskrivning || "");
  const n = norm(post.nycklar || "");
  if (!fraga) return 0;
  if (t === fraga) return 100;
  if (t.startsWith(fraga)) return 80;
  if (t.includes(fraga)) return 60;
  if (n.includes(fraga) || b.includes(fraga)) return 30;
  // alla orden träffar någonstans
  const ord = fraga.split(" ").filter(Boolean);
  if (ord.length > 1 && ord.every((o) => t.includes(o) || n.includes(o) || b.includes(o))) return 20;
  return 0;
}

/** Sök — statiska poster direkt, kurser async vid behov. Max `limit` träffar. */
export async function sokIIndex(fraga: string, limit = 12): Promise<SokPost[]> {
  const f = norm(fraga);
  if (!f) return STATISKA.slice(0, 8);
  const statiska = STATISKA.map((p) => ({ p, po: poang(p, f) }))
    .filter((x) => x.po > 0)
    .sort((a, b) => b.po - a.po);
  const kurser = (await lasKurser()).map((p) => ({ p, po: poang(p, f) }))
    .filter((x) => x.po > 0)
    .sort((a, b) => b.po - a.po);
  return [...statiska, ...kurser].slice(0, limit).map((x) => x.p);
}

/** Snabblistor utan sökterm. */
export function popularaVerktyg(): SokPost[] {
  return STATISKA.filter((p) => p.kategori === "Verktyg");
}
