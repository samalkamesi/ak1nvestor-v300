/**
 * FRÅGA DIN DASHBOARD — natural-language-frågor mot elevens EGEN data,
 * helt deterministiskt (ingen LLM, inga nätanrop utöver /api/vagscan/senaste).
 *
 * Intent-matchning sker med regex-nyckelord mot en diakritisk-normaliserad
 * fråga ("vågkartan" och "vagkartan" matchar likadant) i fast prioritetsordning:
 * streak → XP/nivå → nästa kurs → veckan → vågkartan → badges → kurser klara →
 * navigationsminne → hjälp → hälsning → fallback.
 *
 * Ton: pedagogik.ts — vi hjälper, vi dömer aldrig. Svar hålls till max två
 * meningar + ev. router-vänlig länk. Alla datakällor är SSR-säkra (localStorage
 * läses via window-guards i respektive lib) men funktionen är tänkt för klient.
 */

import { lasKlaraKurser, lasStreak, lasXP, nivaFranXP } from "./member-local";
import { besok } from "./navigationsminne";
import { raknaVeckoPlan } from "./veckoplan";
import { raknaKurstips } from "./kurstips";
import { badgeStatus } from "./badges";
import { uppmuntran } from "./pedagogik";

// ── Typer ───────────────────────────────────────────────────────────────────

export type DashSvar = {
  svar: string;
  ikon: string;
  lank?: string;
  lankText?: string;
};

/** Svar från /api/vagscan/senaste (se cron/vagscan + vagkarta-kort). */
type VagscanSvar = {
  saknas?: boolean;
  universumSammanfattning?: { impulsvag: number; korrigering: number; basbygge: number; osatt: number };
  topRorelse?: { variabel: string; namn: string; antalBolag: number; text: string }[];
  botRorelse?: { variabel: string; namn: string; antalBolag: number; text: string }[];
};

/** De 20 grundvariablerna (V01–V20) — progressens närmaste måttstock. */
const V_KURSER_TOTAL = 20;

// ── Hjälpfunktioner ─────────────────────────────────────────────────────────

/** Gemener + diakriter utslagna + mellanslag ihoprullade — "Vågkartan?" → "vagkartan?". */
function normalisera(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åäàá]/g, "a")
    .replace(/[öø]/g, "o")
    .replace(/[éèê]/g, "e")
    .replace(/\s+/g, " ")
    .trim();
}

/** Första meningen i en text — håller svaren på max två meningar. */
function forstaMening(text: string): string {
  const index = [".", "!", "?"]
    .map((c) => text.indexOf(c))
    .filter((n) => n >= 0)
    .sort((a, b) => a - b)[0];
  return index === undefined ? text : text.slice(0, index + 1).trim();
}

// ── Intent-reglar (i prioritetsordning, testas mot normaliserad fråga) ──────

const RE_STREAK = /streak|hur manga dagar|dag(ar)? i rad/;
const RE_XP = /\bxp\b|niva|level|poang/;
const RE_KURS = /nasta kurs|vad ska jag|vad bor jag|kurstips|tips|plugga/;
const RE_VECKA = /vecko|schema|plan\b|planen/;
const RE_VAGKARTA = /\bvag\b|vagkarta|vagarna|vagscan|konfluens|radarn|marknad/;
const RE_BADGES = /badge|troje|merit|medalj/;
const RE_PROGRESS = /klarade|avklarade|avklarat|klarat|hur manga kurser|progress|framsteg/;
const RE_SENAST = /senast|var var jag|var har jag varit|historik/;
const RE_HJALP = /hjalp|vad kan du|exempel/;
const RE_HEJ = /^(hej|hello|hallo|hei|tjena|yo|god (dag|morgon|kvall|eftermiddag))\b/;

const FALLBACK_SVAR: DashSvar = {
  svar: "Jag svarar på frågor om din utveckling — prova: 'vad är nästa kurs?' eller 'vad säger vågkartan?'",
  ikon: "🧭",
};

// ── Intent-svarare (alla i pedagogik-ton: hjälpa, aldrig döma) ──────────────

function streakSvar(): DashSvar {
  const s = lasStreak();
  if (s.antal > 0) {
    return {
      svar: `Din streak är ${s.antal} ${s.antal === 1 ? "dag" : "dagar"} i rad — närvaro som bygger välfärd. Ett pass idag gör kedjan ${s.antal + 1} dagar lång.`,
      ikon: "🔥",
      lank: "/dagens-pass",
      lankText: "Förläng streaken",
    };
  }
  return {
    svar: `Din första streak-dag kan börja idag — ett femminuterspass räcker för att tända den. ${forstaMening(uppmuntran("start"))}`,
    ikon: "🔥",
    lank: "/dagens-pass",
    lankText: "Tänd streaken",
  };
}

function xpSvar(): DashSvar {
  const xp = lasXP();
  const niva = nivaFranXP(xp);
  const grund = `Du är på nivå ${niva} med ${xp.toLocaleString("sv-SE")} XP.`;
  if (niva >= 100) {
    return {
      svar: `${grund} Toppnivån är nådd — kunskapen är din, och fördjupningen fortsätter i biblioteket.`,
      ikon: "💎",
      lank: "/kurser",
      lankText: "Fördjupa dig",
    };
  }
  const kvar = 100 - (xp % 100);
  return {
    svar: `${grund} ${kvar} XP kvar till nivå ${niva + 1} — ett quiz eller ett pass tar dig en bit dit.`,
    ikon: "💎",
    lank: "/dagens-pass",
    lankText: "Tjäna XP nu",
  };
}

function kursSvar(): DashSvar {
  const tips = raknaKurstips({ antal: 1 })[0];
  if (tips) {
    return {
      svar: `${tips.titel} är ditt nästa steg. ${forstaMening(tips.varför)}`,
      ikon: tips.ikon,
      lank: `/kurser/${tips.slug}`,
      lankText: "Öppna kursen",
    };
  }
  return {
    svar: `Hela spåret är klarat — en resa att vara stolt över! Nästa steg väljer du fritt i biblioteket.`,
    ikon: "🧭",
    lank: "/kurser",
    lankText: "Utforska biblioteket",
  };
}

function veckaSvar(): DashSvar {
  const rad = raknaVeckoPlan().find((r) => !r.klar);
  if (rad) {
    return {
      svar: `Veckans nästa steg: ${rad.dag} — ${rad.aktivitet} (${rad.minut} min). Varje avbockad rad är en stapel på din resa.`,
      ikon: "🗓️",
      lank: rad.lank,
      lankText: "Gå till steget",
    };
  }
  return {
    svar: `Veckans plan är helikryssad — det är närvaro att vara stolt över. ${forstaMening(uppmuntran("klar"))}`,
    ikon: "🗓️",
    lank: "/min-sida",
    lankText: "Se veckoplanen",
  };
}

async function vagkartaSvar(): Promise<DashSvar> {
  try {
    const res = await fetch("/api/vagscan/senaste");
    if (res.ok) {
      const json = (await res.json()) as VagscanSvar;
      const u = json.universumSammanfattning;
      if (json.saknas !== true && u) {
        const top = json.topRorelse?.[0];
        const bot = json.botRorelse?.[0];
        const delar: string[] = [];
        if (top) delar.push(`starkast stigande: ${top.variabel} ${top.namn}`);
        if (bot) delar.push(`starkast fallande: ${bot.variabel} ${bot.namn}`);
        const rorelser =
          delar.length > 0
            ? `${(delar.join(" · ") + ".").replace(/^./, (c) => c.toUpperCase())}`
            : "Inga dominerande rörelser just nu.";
        return {
          svar: `Senaste vågmätningen visar ${u.impulsvag} impulsvågor, ${u.korrigering} korrigeringar och ${u.basbygge} basbyggen i universum. ${rorelser}`,
          ikon: "🌊",
          lank: "/min-sida",
          lankText: "Se hela vågkartan",
        };
      }
    }
  } catch {
    /* nätverk borta etc. → saknas-tillstånd nedan */
  }
  return {
    svar: `Ingen vågkarta har sparats ännu — den autonoma mätningen körs enligt schema. Nästa mätning fyller kartan automatiskt.`,
    ikon: "🌊",
  };
}

function badgesSvar(): DashSvar {
  const status = badgeStatus();
  const upplasta = status.filter((b) => b.upplast).length;
  const totalt = status.length;
  const nasta = status.filter((b) => !b.upplast).sort((a, b) => b.procent - a.procent)[0];
  if (!nasta) {
    return {
      svar: `Alla ${totalt} badges är upplåsta — en meritsamling att vara stolt över. ${forstaMening(uppmuntran("klar"))}`,
      ikon: "🎖️",
      lank: "/badges",
      lankText: "Se dina meriter",
    };
  }
  return {
    svar: `Du har låst upp ${upplasta} av ${totalt} badges. Närmast väntar "${nasta.badge.namn}" — ${nasta.badge.krav.toLowerCase()} (${nasta.procent}% av vägen).`,
    ikon: "🎖️",
    lank: "/badges",
    lankText: "Se dina meriter",
  };
}

function progressSvar(): DashSvar {
  const klara = lasKlaraKurser();
  if (klara.length === 0) {
    return {
      svar: `Din räknare startar vid första klarade kursen — och varje kurs blir ett tryggare beslut i ditt liv. ${forstaMening(uppmuntran("start"))}`,
      ikon: "📚",
      lank: "/kurser",
      lankText: "Klara din första kurs",
    };
  }
  const grundlagda = Math.min(V_KURSER_TOTAL, klara.length);
  const procent = Math.round((grundlagda / V_KURSER_TOTAL) * 100);
  const andra =
    klara.length >= V_KURSER_TOTAL
      ? "Alla 20 variabler är lagda — du står på solid grund."
      : "Varje ny variabel blir ett tryggare beslut i ditt liv.";
  return {
    svar: `Du har klarat ${klara.length} ${klara.length === 1 ? "kurs" : "kurser"} — det är ${procent}% av de 20 grundvariablerna (V01–V20). ${andra}`,
    ikon: "📚",
    lank: "/kurser",
    lankText: "Välj nästa kurs",
  };
}

function senastSvar(): DashSvar {
  // Frågan ställs från Min Sida — hoppa över den, visa senaste meningsfulla besök.
  const tidigare = besok().find((b) => b.sida !== "/min-sida");
  if (tidigare) {
    return {
      svar: `Senast besökte du "${tidigare.titel}". ${forstaMening(uppmuntran("aterkomst"))}`,
      ikon: "🧭",
      lank: tidigare.sida,
      lankText: "Fortsätt där",
    };
  }
  return {
    svar: `Ditt navigationsminne är tomt än så länge — sidor du besöker samlas här och blir nästa steg. ${forstaMening(uppmuntran("start"))}`,
    ikon: "🧭",
    lank: "/kurser",
    lankText: "Börja utforska",
  };
}

function hjalpSvar(): DashSvar {
  return {
    svar: `Jag svarar utifrån din egen data — prova: "Hur går min streak?", "Vad är nästa kurs?", "Vad säger veckoplanen?", "Vad säger vågkartan?", "Hur mycket XP har jag?", "Vilken badge är närmast?", "Hur många kurser har jag klarat?" eller "Var var jag senast?".`,
    ikon: "💡",
  };
}

function hejSvar(): DashSvar {
  const streak = lasStreak();
  return {
    svar: `Hej, och tack för att du investerar i dig själv! ${forstaMening(uppmuntran(streak.antal > 0 ? "framsteg" : "start"))}`,
    ikon: "👋",
  };
}

// ── Huvudfunktion ───────────────────────────────────────────────────────────

/**
 * Svara på en natural-language-fråga om elevens egen data — deterministiskt.
 * Async endast för vågkarta-intentet (ett fetch mot /api/vagscan/senaste).
 */
export async function svaraDashFraga(fraga: string): Promise<DashSvar> {
  const t = normalisera(fraga);
  if (!t) return FALLBACK_SVAR;
  if (RE_STREAK.test(t)) return streakSvar();
  if (RE_XP.test(t)) return xpSvar();
  if (RE_KURS.test(t)) return kursSvar();
  if (RE_VECKA.test(t)) return veckaSvar();
  if (RE_VAGKARTA.test(t)) return await vagkartaSvar();
  if (RE_BADGES.test(t)) return badgesSvar();
  if (RE_PROGRESS.test(t)) return progressSvar();
  if (RE_SENAST.test(t)) return senastSvar();
  if (RE_HJALP.test(t)) return hjalpSvar();
  if (RE_HEJ.test(t)) return hejSvar();
  return FALLBACK_SVAR;
}
