/**
 * SÖKINDEX — kommandopalettens datakälla.
 * Statiska poster läses UR meny-registret (src/lib/meny-register.ts —
 * EN källa för all navigation, 2026-09-03) + kurser som lazy-laddas från
 * /sok-index.json vid första sökningen (VÅG 63 bygg-2: slimmat index,
 * ~72 kB — fallback /deep-courses.json om filen saknas). Publik-filtret
 * i registret styr även paletten: medlem/fas/admin-ytor syns bara med
 * behörighet.
 *
 * VÅG 61 (B2B-BESLUT steg 1): STATISKA respekterar nu registrets `yttor` —
 * en punkt utan "sok" bland sina yttor kommer ALDRIG med i paletten.
 * (Läckan b2 §2.1.5: tidigare plattades hela registret ut utan yta-filter,
 * så t.ex. en footer-exklusiv länk läckte in i ⌘K.) "AK1A PRO" har
 * yttor ["footer","sok"] ⇒ sökbar här, ur menypanelerna.
 */

import { SIFFROR } from "@/lib/siffror";
import {
  MENY_REGISTER,
  punktSynlig,
  type MenyKontext,
  type MenySektionId,
  type MenyTyp,
} from "@/lib/meny-register";

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

/** ⌘K-kategori härledd ur registrets sektion + destinationstyp. */
function kategoriFran(id: MenySektionId, typ: MenyTyp): SokKategori {
  if (id === "praktik") return "Träning";
  if (id === "lara") return typ === "kursyta" ? "Kurs" : "Sida";
  if (id === "analysera") return typ === "verktyg" ? "Verktyg" : "Sida";
  return "Sida";
}

const STATISKA: SokPost[] = MENY_REGISTER.flatMap((s) =>
  s.punkter
    // VÅG 61: yta-filter — bara punkter som FÅR synas i sök ("sok" bland
    // yttor, eller ingen yttor-begränsning alls). Samma kontrakt som
    // sektionPunkter(…, "sok") i registret.
    .filter((p) => !p.yttor || p.yttor.includes("sok"))
    .map((p) => ({
      titel: p.text,
      lank: p.lank,
      beskrivning: p.beskrivning,
      kategori: kategoriFran(s.id, p.typ),
      ikon: p.ikon,
      nycklar: p.lank === "/kurser" ? `${p.nycklar ?? ""} ${SIFFROR.kurser} kurser`.trim() : p.nycklar,
    }))
);

/** Registeruppslag per länk — används för publik-filtrering i sök. */
const REGISTER_PUNKTER = new Map(
  MENY_REGISTER.flatMap((s) => s.punkter.map((p) => [p.lank, p] as const))
);

// — kurscache —
let kursPoster: SokPost[] | null = null;

/**
 * VÅG 63 bygg-2 (optimering #2): kurserna läses från det slimmade
 * /sok-index.json (~72 kB — slug+title+category+level+weight+summary,
 * genererat av verktyg/kor-sokindex.mjs) i stället för hela
 * /deep-courses.json (16,6 MB över wire — chapters-historyn behövs
 * aldrig för sökning). Extraktionen nedan tar båda formatena: indexets
 * { kurser: [...] } och, som fallback när indexet saknas (äldre deploy
 * utan genererad fil), den gamla { slug: kurs }-mappningen — sökningen
 * fungerar alltid, bara långsammare på fallback-vägen.
 */
async function lasKurser(): Promise<SokPost[]> {
  if (kursPoster) return kursPoster;
  for (const kalla of ["/sok-index.json", "/deep-courses.json"]) {
    try {
      const res = await fetch(kalla);
      if (!res.ok) continue;
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.kurser || Object.values(data);
      const poster = (arr as Array<Record<string, unknown>>).map((k) => ({
        titel: String(k.title || k.titel || k.slug || ""),
        lank: `/kurser/${k.slug}`,
        beskrivning: String(k.summary || "").slice(0, 110),
        kategori: "Kurs" as const,
        ikon: "📖",
        nycklar: [k.category, k.level, k.slug].filter(Boolean).join(" "),
      }));
      if (poster.length > 0) {
        kursPoster = poster;
        break;
      }
    } catch {
      // Nästa källa; tar alla källor slut lämnas listan tom nedan —
      // paletten visar då fortfarande sina statiska poster.
    }
  }
  kursPoster ??= [];
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

/** Sök — statiska poster direkt, kurser async vid behov. Max `limit` träffar.
 *  `kontext` (valfri) aktiverar registrets publik-filter: utan den visas allt
 *  (bakåtkompatibelt), med den bara det användaren har behörighet till. */
export async function sokIIndex(
  fraga: string,
  limit = 12,
  kontext?: MenyKontext
): Promise<SokPost[]> {
  const f = norm(fraga);
  const synlig = (p: SokPost) => {
    if (!kontext) return true;
    const rp = REGISTER_PUNKTER.get(p.lank);
    return !rp || punktSynlig(rp, kontext);
  };
  if (!f) return STATISKA.filter(synlig).slice(0, 8);
  const statiska = STATISKA.filter(synlig)
    .map((p) => ({ p, po: poang(p, f) }))
    .filter((x) => x.po > 0)
    .sort((a, b) => b.po - a.po);
  const kurser = (await lasKurser()).map((p) => ({ p, po: poang(p, f) }))
    .filter((x) => x.po > 0)
    .sort((a, b) => b.po - a.po);
  return [...statiska, ...kurser].slice(0, limit).map((x) => x.p);
}

/** Snabblistor utan sökterm. */
export function popularaVerktyg(kontext?: MenyKontext): SokPost[] {
  const synlig = (p: SokPost) => {
    if (!kontext) return true;
    const rp = REGISTER_PUNKTER.get(p.lank);
    return !rp || punktSynlig(rp, kontext);
  };
  return STATISKA.filter((p) => p.kategori === "Verktyg" && synlig(p));
}
