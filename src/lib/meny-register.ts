/**
 * MENY-REGISTER — HELA sajtens navigation i ETT typsäkert register.
 *
 * Alla meny-ytor (huvudmeny, mobilmeny, header-SPA, sidfooter, kommandopalett)
 * läser UR detta register — aldrig egna listor. Byggt 2026-09-03 efter
 * data/forskning/MENYFORSKNING-2026-09-03.md:
 *
 *   R1  Max 4 toppnivåer (Hick's lag + NN/g).
 *   R2  5–11 punkter per panel, uppdelade i avdelare.
 *   R3  ≤36 länkar totalt i hela registret.
 *   R4  Varje destination exakt EN gång (NN/g: "Show each choice only once").
 *   R7  Hub-and-spoke: /kurser är navet — inga djuplänkar till enskilda kurser.
 *   R9  Task-baserad struktur efter elevens flöde (Lära → Analysera → Praktik → Om).
 *   R14 Publik-nivå per punkt styr adaptiv synlighet i ALLA ytor.
 *
 * Struktur (28 länkar):
 *   LÄRA 🎓        — Läroplanen · Alla kurser (hub) · Biblioteket · Labbar · Certifikat
 *   ANALYSERA 🔬   — Grundanalys → Skannar → Fördjupning → Portfölj & profil (12 verktyg)
 *   PRAKTIK 🎯     — Min Sida (medlem) · Dagens Pass · Topplistan · Badges · Fas 3
 *   OM AK1A 🏛️    — Manifestet · Medlemskap · Prenumeration · PRO · Bloggen · Om oss
 *                    + Fas 2-ansökan (guld-CTA) · Logga in (footer/⌘K) m.fl.
 *
 * BORTTAGNA upprepningar (forskning §"Diagnos"): Bokmaster-djuplänken (→ hubben
 * /kurser), "Short-Seller"-menyposten (widget i kursytan), "Repetera" (dublett av
 * Min Sida), "AI-Diagnos" (dublett av Kognitiv profil), SPA-drawerns "Mer"- och
 * "Fler sider"-listor (Kurser ×3 i samma vy), Medlemskap/Blogg/Fas 2 ur Träna.
 */

// ── Typer ───────────────────────────────────────────────────────────────────

import { lasMedlem } from "@/lib/member-local";
import { arAdmin, harFas2Access, harFas3Access } from "@/lib/kurs-access";
import { b2bAktiv } from "@/lib/b2b-status";
import type { OrdlistaNyckel } from "@/lib/ordlista";

/** Vem som får se punkten. `fas2` inkluderar fas3/premium/pro (supermängd). */
export type MenyPublik = "gast" | "medlem" | "fas2" | "admin";

/** Slags destination — styr bl.a. ⌘K-kategori. */
export type MenyTyp = "sida" | "verktyg" | "kursyta";

/** Meny-yta där en punkt får synas (default: alla). */
export type MenyYta = "meny" | "footer" | "sok";

export type MenyPunkt = {
  /** Frontloaded, etablerad etikett — inga påhittade ord (R5). */
  text: string;
  /**
   * Ordlistenyckel (våg 51): KLIENT-komponenterna renderar
   * t(nyckel) ?? text — SSR/SSG visar svenska (radens sv-värde = text),
   * klienten byter till en/ar vid språkval. Saknas nyckel ⇒ svenskan.
   */
  nyckel?: OrdlistaNyckel;
  /** GILTIG route — valideras mot src/app (sidfot/sökindex är sanningsvittne). */
  lank: string;
  beskrivning?: string;
  /** Emoji-ikon (huvudmeny, mobilmeny, sidfooter). */
  ikon: string;
  typ: MenyTyp;
  /** Adaptiv synlighet — samma filter i alla ytor (R14). */
  publik: MenyPublik;
  /** Undergrupp inuti panelen — renderas som guld-avdelare. */
  avdelare?: string;
  /** Var punkten får synas; saknas = alla ytor. */
  yttor?: MenyYta[];
  /** B2B-grindad punkt (våg 77): syns ENDAST när b2bAktiv() — PRO är
   *  under uppbyggnad tills kunden slår på NEXT_PUBLIC_B2B_AKTIV=1. */
  b2b?: boolean;
  /** Guld-markerad konverteringsknapp (Fas 2-ansökan). */
  guldknapp?: boolean;
  /** Extra sökbara ord för kommandopaletten. */
  nycklar?: string;
};

export type MenySektionId = "lara" | "analysera" | "praktik" | "om";

export type MenySektion = {
  id: MenySektionId;
  titel: string;
  /** Ordlistenyckel för sektionstiteln (våg 51 — se MenyPunkt.nyckel). */
  nyckel?: OrdlistaNyckel;
  ikon: string;
  punkter: MenyPunkt[];
};

/** Behörighetskontext — byggs i klienten ur member-local/kurs-access. */
export type MenyKontext = {
  inloggad: boolean;
  fas2: boolean;
  fas3: boolean;
  admin: boolean;
};

/** Gast-vyn — säker default för SSR och ej inloggade. */
export const GAST_KONTEXT: MenyKontext = {
  inloggad: false,
  fas2: false,
  fas3: false,
  admin: false,
};

// ── Registret (EN källa till ALLA menyer) ───────────────────────────────────

export const MENY_REGISTER: MenySektion[] = [
  {
    id: "lara",
    titel: "Lära",
    nyckel: "nav.lara",
    ikon: "🎓",
    punkter: [
      {
        text: "Läroplanen",
        nyckel: "nav.laroplanen",
        lank: "/laroplan",
        ikon: "🗺️",
        typ: "sida",
        publik: "gast",
        beskrivning: "5 nivåer → oberoende analytiker",
        nycklar: "nivåer struktur gang studiemedel",
      },
      {
        text: "Alla kurser",
        nyckel: "nav.allaKurser",
        lank: "/kurser",
        ikon: "📚",
        typ: "kursyta",
        publik: "gast",
        beskrivning: "Hela biblioteket med quiz — även Bokmaster & Short-Seller",
        nycklar: "bibliotek kurs bokmaster short seller sokratisk",
      },
      {
        text: "Biblioteket",
        nyckel: "nav.biblioteket",
        lank: "/bibliotek",
        ikon: "📖",
        typ: "sida",
        publik: "gast",
        beskrivning: "Bokkanon — böcker mappade mot AKM1/AK1TS",
        nycklar: "bokkanon bocker lasning",
      },
      {
        text: "Labbar",
        nyckel: "nav.labbar",
        lank: "/labb",
        ikon: "🧪",
        typ: "sida",
        publik: "gast",
        beskrivning: "Forskningsärenden & case",
        nycklar: "forskning labb case faror historia",
      },
      {
        text: "Certifikat",
        nyckel: "nav.certifikat",
        lank: "/certifikat",
        ikon: "🏅",
        typ: "sida",
        publik: "gast",
        beskrivning: "Ditt intyg på kompetens",
        nycklar: "intyg betyg diplom",
      },
    ],
  },
  {
    id: "analysera",
    titel: "Analysera",
    nyckel: "nav.analysera",
    ikon: "🔬",
    // Logisk verktygskedja: GRUNDANALYS → SKANNAR → FÖRDJUPNING → PORTFÖLJ (R9).
    punkter: [
      {
        text: "AKM1-kalkylatorn",
        nyckel: "nav.akm1Kalkylatorn",
        lank: "/kalkylator",
        ikon: "🧮",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Grundanalys",
        beskrivning: "20 fundamentalvariabler · V01–V20",
        nycklar: "V01 V02 V03 fundamental variabler kalkylera",
      },
      {
        text: "Vågfundamentet",
        nyckel: "nav.vagfundamentet",
        lank: "/vagfundament",
        ikon: "🌊",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Grundanalys",
        beskrivning: "Fundamentalvågor · 20×5-matris per aktie & portfölj",
        nycklar: "vagfundament fundamentalvagor vagklass indikatorer tidsserie matris impulsvag korrigering basbygge",
      },
      {
        text: "Konfluensradarn",
        nyckel: "nav.konfluensradarn",
        lank: "/konfluens",
        ikon: "📡",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Skannar",
        beskrivning: "Där värde möter vågor — fem källor måste tala samman",
        nycklar: "konfluens radar samverkan fem kallor varde vagor skanning signal",
      },
      {
        text: "Net-net-skannern",
        nyckel: "nav.netnetskannern",
        lank: "/netnet",
        ikon: "🔍",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Skannar",
        beskrivning: "Grahams cigar-butts — NCAV-screening live",
        nycklar: "netnet ncav cigar butt screening graham billigt under bokvardt",
      },
      {
        text: "Nyhetscentralen",
        nyckel: "nav.nyhetscentralen",
        lank: "/nyheter",
        ikon: "📰",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Skannar",
        beskrivning: "Ditt nyhetsrum — nyheter rangordnade efter påverkan",
        nycklar: "nyheter nyhetsfeed rss flode senaste bevakning kanal paverkan rapport",
      },
      {
        text: "Superanalysen",
        nyckel: "nav.superanalysen",
        lank: "/superanalys",
        ikon: "🏅",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Fördjupning",
        beskrivning: "Guidad analys i 24 steg · AKM1 + AK1TS",
        nycklar: "wizard guide 24 steg analysflode",
      },
      {
        text: "Analyser",
        nyckel: "nav.analyser",
        lank: "/analyser",
        ikon: "📊",
        typ: "sida",
        publik: "gast",
        avdelare: "Fördjupning",
        beskrivning: "Rapportbanken — fullständiga bolagsanalyser",
        nycklar: "bolag aktie rapport",
      },
      {
        text: "Forskningsbiblioteket",
        nyckel: "nav.forskningsbiblioteket",
        lank: "/forskningsbiblioteket",
        ikon: "📚",
        typ: "sida",
        publik: "gast",
        avdelare: "Fördjupning",
        beskrivning: "Automatiska översikter av hela universet — 20 variabler",
        nycklar: "forskningsbibliotek automatisk analys screening kandidatregel universum overblick",
      },
      {
        text: "Portföljbyggaren",
        nyckel: "nav.portfoljbyggaren",
        lank: "/portfoljbyggare",
        ikon: "🧩",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Portfölj & profil",
        beskrivning: "Bygg visuellt — se risk & spridning live",
        nycklar: "portfolj bygg allokering sektor spridning koncentration risk donut",
      },
      {
        text: "Min portfölj",
        nyckel: "nav.minPortfolj",
        lank: "/min-portfolj",
        ikon: "💼",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Portfölj & profil",
        beskrivning: "Innehav + djupanalys (5×5×4)",
        nycklar: "portfolj innehav djupanalys matris",
      },
      {
        text: "Portföljforskning",
        nyckel: "nav.portfoljforskning",
        lank: "/portfolj-forskning",
        ikon: "📡",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Portfölj & profil",
        beskrivning: "Välj risknivå — motorn forskar fram en portfölj",
        nycklar: "portfoljforskning forskningsportfolj riskniva takt akm1 vagstatus golvmarginal ersattning prenumerationsportfolj hyr",
      },
      {
        text: "Kognitiv profil",
        nyckel: "nav.kognitivProfil",
        lank: "/profil",
        ikon: "🧠",
        typ: "verktyg",
        publik: "gast",
        avdelare: "Portfölj & profil",
        beskrivning: "AI-diagnos — din kognitiva profil i 3 minuter",
        nycklar: "ai diagnos kognitiv profil bias riskaptit scenarier beteende",
      },
    ],
  },
  {
    id: "praktik",
    titel: "Praktik",
    nyckel: "nav.praktik",
    ikon: "🎯",
    punkter: [
      {
        text: "Min Sida",
        nyckel: "nav.minSida",
        lank: "/min-sida",
        ikon: "🏠",
        typ: "sida",
        publik: "medlem",
        beskrivning: "Din dashboard — XP, streak & repetition",
        nycklar: "dashboard xp niva streak flashcards repetera sm-2",
      },
      {
        text: "Dagens Pass",
        nyckel: "nav.dagensPassMeny",
        lank: "/dagens-pass",
        ikon: "⚡",
        typ: "sida",
        publik: "gast",
        beskrivning: "5 minuters daglig marknadsträning",
        nycklar: "daglig rutin streak aktie",
      },
      {
        // Rond 149 (branding spår 11): övning på RIKTIGA årsredovisningar —
        // strategiska skiftets kärna. Gäster ser entrén i praktik-panelen +
        // ⌘K; själva passet grindas server-side mot Fas 2 (pass/route.ts).
        text: "Rapportakademin",
        nyckel: "nav.rapportakademin",
        lank: "/rapportakademin",
        ikon: "📑",
        typ: "sida",
        publik: "gast",
        beskrivning: "Öva på riktiga årsredovisningar — bedöm först, expertläsningen efteråt",
        nycklar: "arsredovisning rapportakademi lasguide pass bedom expertlasning ova riktiga",
      },
      {
        text: "Topplistan",
        nyckel: "nav.topplistan",
        lank: "/topplista",
        ikon: "🏆",
        typ: "sida",
        publik: "gast",
        beskrivning: "Eleverna rankade på XP",
        nycklar: "ranking tavalning xp",
      },
      {
        text: "Badges & meriter",
        nyckel: "nav.badgesMeriter",
        lank: "/badges",
        ikon: "🎖️",
        typ: "sida",
        publik: "gast",
        beskrivning: "29 troféer att förtjäna",
        nycklar: "badge trofe meriten",
      },
      {
        text: "Fas 3 — Certifiering",
        nyckel: "nav.fas3",
        lank: "/fas3",
        ikon: "🎓",
        typ: "sida",
        publik: "gast",
        beskrivning: "Certifierad AK1A-analytiker — praktikportfölj + etik",
        nycklar: "fas 3 certifiering certifierad analytiker praktikexamen portfolj etik examen betyg",
      },
    ],
  },
  {
    id: "om",
    titel: "Om AK1A",
    nyckel: "nav.omAk1a",
    ikon: "🏛️",
    punkter: [
      {
        text: "Manifestet",
        nyckel: "nav.manifestet",
        lank: "/manifest",
        ikon: "🏛️",
        typ: "sida",
        publik: "gast",
        beskrivning: "Vår vision: världens bästa finansutbildning",
        nycklar: "vision filosofi varför kontroversiell",
      },
      {
        text: "Medlemskap",
        nyckel: "nav.medlemskap",
        lank: "/medlemskap",
        ikon: "💛",
        typ: "sida",
        publik: "gast",
        beskrivning: "Fas 1 gratis · Fas 2 · Fas 3",
        nycklar: "pris gratis fas",
      },
      {
        text: "Prenumeration",
        nyckel: "nav.prenumeration",
        lank: "/prenumeration",
        ikon: "💳",
        typ: "sida",
        publik: "gast",
        beskrivning: "Portföljforskning i 3 nivåer — Fas 2/3-elev: rabatt för alltid",
        nycklar: "pris prenumerations portfolj forskning forskning+ hyra rabatt fas 2 fas 3",
      },
      {
        text: "AK1A PRO",
        nyckel: "nav.pro",
        lank: "/pro",
        b2b: true,
        ikon: "🏛️",
        typ: "sida",
        publik: "gast",
        // VÅG 61 (B2B-BESLUT §3.1): ur menypanelerna — toppväxeln
        // "Privatperson | Företag" äger B2B-ingången nu. Kvar i sidfotens
        // sitemap (SEO-internlänk, b2 §3d) och sökbar i ⌘K.
        yttor: ["footer", "sok"],
        beskrivning: "Analytikerplattformen — bygg institutionella rapporter",
        nycklar: "pro plattform rapporter verkstad institutionell fas d",
      },
      {
        text: "Bloggen",
        nyckel: "nav.bloggen",
        lank: "/blogg",
        ikon: "✍️",
        typ: "sida",
        publik: "gast",
        beskrivning: "Guider + marknadskommentarer",
        nycklar: "guider inlagg kommentarer",
      },
      {
        text: "Om oss",
        nyckel: "nav.omOss",
        lank: "/om-oss",
        ikon: "🏛️",
        typ: "sida",
        publik: "gast",
        beskrivning: "AK1A Research Lab",
        nycklar: "om foretaget",
      },
      {
        text: "Fas 2-ansökan",
        nyckel: "nav.fas2Ansokan",
        lank: "/fas2-ansok",
        ikon: "✉️",
        typ: "sida",
        publik: "gast",
        guldknapp: true,
        beskrivning: "Utbildning med grundaren — ansök kostnadsfritt",
        nycklar: "ansok fas 2 kostnadsfritt",
      },
      // Endast vissa ytar:
      {
        text: "Logga in",
        nyckel: "auth.loggaIn",
        lank: "/logga-in",
        ikon: "🔑",
        typ: "sida",
        publik: "gast",
        yttor: ["footer", "sok"],
        beskrivning: "Medlemsinloggning",
        nycklar: "login konto",
      },
      {
        text: "Dina rapporter",
        nyckel: "nav.rapporter",
        lank: "/rapporter",
        ikon: "📜",
        typ: "verktyg",
        publik: "fas2",
        yttor: ["meny", "sok"],
        beskrivning: "Redovisningsverkstan — dina utskriftsklara rapporter",
        nycklar: "rapporter redovisning utskrift",
      },
      {
        text: "Admin",
        nyckel: "nav.admin",
        lank: "/admin",
        ikon: "🛠️",
        typ: "sida",
        publik: "admin",
        yttor: ["meny", "sok"],
        beskrivning: "Driftpanel",
        nycklar: "admin panel",
      },
      {
        text: "Transparens & GDPR",
        nyckel: "nav.transparens",
        lank: "/transparens",
        ikon: "🛡️",
        typ: "sida",
        publik: "gast",
        yttor: ["sok"],
        beskrivning: "Din data, dina rättigheter — enligt lagen",
        nycklar: "gdpr personuppgifter data integritet rattigheter imy kakor cookie transparens angerratt aterratta lag",
      },
    ],
  },
];

// ── Adaptiva hjälpare (R14: samma filter i ALLA ytor) ───────────────────────

/** Har klienten behörighet för punkten? */
export function punktSynlig(p: MenyPunkt, k: MenyKontext): boolean {
  switch (p.publik) {
    case "gast":
      return true;
    case "medlem":
      return k.inloggad;
    case "fas2":
      return k.fas2; // harFas2Access() inkluderar fas3/premium/pro
    case "admin":
      return k.admin;
  }
}

/** Punkter i en sektion, filtrerade på behörighet + yta. Tomma sektioner tas bort. */
export function sektionPunkter(s: MenySektion, k: MenyKontext, yta: MenyYta = "meny"): MenyPunkt[] {
  return s.punkter.filter(
    (p) => (!p.yttor || p.yttor.includes(yta)) && punktSynlig(p, k) && (!p.b2b || b2bAktiv())
  );
}

/** Hela registret anpassat för en klient och en yta — sektioner utan synliga punkter sorteras bort. */
export function registerFor(k: MenyKontext, yta: MenyYta = "meny"): MenySektion[] {
  return MENY_REGISTER.map((s) => ({ ...s, punkter: sektionPunkter(s, k, yta) })).filter(
    (s) => s.punkter.length > 0
  );
}

/** Läs behörighetskontexten i klienten (localStorage — SSR-säkert: gast-vyn).
 *  Anropas ENBART i klientkomponenter (t.ex. i useEffect), aldrig under SSR. */
export function lasMenyKontext(): MenyKontext {
  if (typeof window === "undefined") return GAST_KONTEXT;
  try {
    return {
      inloggad: lasMedlem() !== null,
      fas2: harFas2Access(), // inkluderar fas3/premium/pro (supermängd)
      fas3: harFas3Access(),
      admin: arAdmin(),
    };
  } catch {
    return GAST_KONTEXT;
  }
}

/** Samtliga länkar i registret (för dödlänksvalidering). */
export function allaRegisterLankar(): string[] {
  return MENY_REGISTER.flatMap((s) => s.punkter.map((p) => p.lank));
}

/** Hitta en punkt via länk (t.ex. för aktiv-markering i drawern). */
export function punktFranLank(lank: string): MenyPunkt | undefined {
  return MENY_REGISTER.flatMap((s) => s.punkter).find((p) => p.lank === lank);
}
