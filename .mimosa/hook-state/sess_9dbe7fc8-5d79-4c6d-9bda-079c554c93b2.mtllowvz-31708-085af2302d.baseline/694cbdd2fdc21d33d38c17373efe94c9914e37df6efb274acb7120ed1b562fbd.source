/**
 * E-POST-MALLAR — AK1A Research Labs mejl-DNA (MEGA_PLAN_V3 våg #9:
 * kommunikations- & marknadsföringsvågen — "morgon-briefingen via mejl!").
 *
 * Teknik: TABELLBASERAD HTML med enbart inline-attribut (width/cellpadding/
 * bgcolor/style) — e-postklienter (Outlook, Gmail-appen) hanterar inte moderna
 * CSS:varianter, flexbox eller externa stilmallar. Därför: nästlade
 * <table role="presentation">, inga klasser, all stil på raden.
 *
 * AK1A-DNA i varje brev (samma palett som globals.css, verifierad kontrast):
 *   • papper #f5f1e8 som yttre bakgrund, kort #fffdf7 som brevkropp
 *   • marin #0E1B2E i masthead + BOTTENRAD med guldtext #E8C766
 *     "AK1A Research Lab"
 *   • serif-rubriker (font-family: Georgia, 'Times New Roman', serif)
 *   • guld på papper används som #785c13 (AA-kontrast — se globals.css)
 *   • disclaimer ALLTID: "Pedagogisk analys — inte investeringsråd."
 *
 * Ton (src/lib/pedagogik.ts): vi hjälper — vi dömer aldrig. Morgonposten
 * från en privatbank: saklig, varm, personlig. Inga "du borde".
 */

import { uppmuntran } from "./pedagogik";

// ── Palett (spegling av globals.css — markdown-vänliga konstanter) ──────────
const MARIN = "#0E1B2E"; // bläck-marin — institutionellt ankare
const MARIN_MORKARE = "#081120"; // inre låda på marin
const GULD = "#E8C766"; // guld — endast mot marin (13.9:1-bakgrund enligt DNA)
const GULD_PAPPER = "#785c13"; // guld som löptext/etiketter på papper (AA)
const PAPPER = "#f5f1e8"; // cream paper background
const KORT = "#fffdf7"; // brevkort — aning ljusare än pappret
const BLACK = "#0a0b0d"; // --ink: nästan svart bläck
const GRADDE = "#EDE6D6"; // cream-text mot marin
const STROK = "#d9d2c2"; // avvisande kant på papper
const MUTAD = "#6b6353"; // sekundär löptext på papper

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";

/** Disclaimern — ALWAYS ON, samma formulering som resten av ekosystemet. */
export const MEJL_DISCLAIMER =
  "Pedagogisk analys — inte investeringsråd. AK1A Research Lab bygger framtida fundamentalanalytiker, kostnadsfritt — kunskapen är din, resan är din.";

// ── Små hjälpare ────────────────────────────────────────────────────────────

/** HTML-escape av allt elev-/datastyrt innehåll innan det mossas in i mallen. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Svensk långdag med stor begynnelsebokstav — "Måndag 1 september 2026". */
function mejlDatum(d = new Date()): string {
  const s = d.toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s.replace(/^./, (c) => c.toUpperCase());
}

/** Platsens bas-URL (NEXT_PUBLIC_SITE_URL, utan snedstreck i slutet) — eller "". */
function basUrl(): string {
  const r = process.env.NEXT_PUBLIC_SITE_URL;
  return typeof r === "string" && r ? r.replace(/\/+$/, "") : "";
}

/**
 * Guld-knapp (marin ruta, guldkant, guldtext). Utan NEXT_PUBLIC_SITE_URL
 * degraderar hon mjukt till en text-rad med sökvägen — aldrig en död länk.
 */
function ctaKnapp(text: string, sokvag: string): string {
  const bas = basUrl();
  if (bas) {
    return (
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:22px auto 4px;">` +
      `<tr><td bgcolor="${MARIN}" style="background-color:${MARIN};border:1px solid ${GULD};border-radius:6px;">` +
      `<a href="${esc(bas + sokvag)}" style="display:inline-block;padding:12px 30px;font-family:${SERIF};font-size:14px;letter-spacing:1px;color:${GULD};text-decoration:none;">` +
      `${esc(text)}</a></td></tr></table>`
    );
  }
  return (
    `<p style="margin:22px 0 4px;text-align:center;font-family:${SERIF};font-size:14px;color:${GULD_PAPPER};">` +
    `→ ${esc(text.replace(/\s*→\s*$/, ""))} — öppna <strong>${esc(sokvag)}</strong> i Kommandocentralen</p>`
  );
}

/** Rad i "fyra leads"-listan: guldetikett + värde (samma form som kortet). */
function leadRad(etikett: string, varde: string): string {
  return (
    `<tr>` +
    `<td width="132" valign="top" style="padding:12px 0;border-top:1px solid ${STROK};font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${GULD_PAPPER};">${esc(etikett)}</td>` +
    `<td valign="top" style="padding:12px 0;border-top:1px solid ${STROK};font-family:${SERIF};font-size:15px;line-height:1.55;color:${BLACK};">${varde}</td>` +
    `</tr>`
  );
}

// ── Brevstommen — gemensam för ALLA utskick ─────────────────────────────────

/**
 * Fullständigt XHTML-brev: pappersbakgrund, marin masthead med serif-rubrik,
 * innehållskort, disclaimer-rad och marin bottenrad med guldtext
 * "AK1A Research Lab". `innehall` mossas in rakt (internt betrott HTML).
 */
function brevDokument(rubrik: string, innehall: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AK1A Research Lab — ${esc(rubrik)}</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPPER};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${PAPPER}" style="width:100%;background-color:${PAPPER};">
<tr>
<td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${KORT}" style="width:600px;max-width:600px;background-color:${KORT};border:1px solid ${STROK};">
<tr>
<td bgcolor="${MARIN}" style="background-color:${MARIN};padding:30px 32px 26px;text-align:center;">
<p style="margin:0;font-family:${SERIF};font-size:10px;letter-spacing:5px;text-transform:uppercase;color:${GULD};">AK1A Research Lab</p>
<h1 style="margin:10px 0 6px;font-family:${SERIF};font-size:27px;line-height:1.25;font-weight:normal;color:${GULD};">${esc(rubrik)}</h1>
<p style="margin:0;font-family:${SANS};font-size:11px;letter-spacing:1px;color:${GRADDE};">${esc(mejlDatum())} · personlig utgåva</p>
</td>
</tr>
<tr>
<td bgcolor="${KORT}" style="background-color:${KORT};padding:32px 34px 8px;">
${innehall}
</td>
</tr>
<tr>
<td bgcolor="${KORT}" style="background-color:${KORT};padding:6px 34px 26px;">
<p style="margin:0;border-top:1px solid ${STROK};padding-top:14px;font-family:${SANS};font-size:11px;line-height:1.6;color:${MUTAD};">${MEJL_DISCLAIMER}</p>
</td>
</tr>
<tr>
<td bgcolor="${MARIN}" style="background-color:${MARIN};padding:20px 24px;text-align:center;">
<p style="margin:0;font-family:${SERIF};font-size:13px;letter-spacing:3px;color:${GULD};">AK1A Research Lab</p>
<p style="margin:6px 0 0;font-family:${SANS};font-size:10px;letter-spacing:1px;color:${GRADDE};">Fri kunskap för alltid · välfärd först · pedagogisk analys — inte investeringsråd</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;
}

// ── Mall 1 · Morgon-briefingen (daglig) ─────────────────────────────────────

/**
 * morgonMejl — dagens morgon-briefing som brev: hälsning, vågkartans läge
 * (`vagText`, t.ex. "206 impulsvågor · 84 korrigeringar · 40 basbyggen"),
 * dagens aktie (`dagensAktie`, t.ex. "VOLV-B.ST") och streak-elden.
 * Ton: morgonposten från en privatbank — aldrig dömande, även vid streak 0.
 */
export function morgonMejl(namn: string, vagText: string, dagensAktie: string, streak: number): string {
  const n = esc(namn.trim());
  const halsning = n ? `God morgon, ${n}!` : "God morgon!";

  // Streak-svansen enligt briefing.ts:s morgonMening — uppmuntran, aldrig brist.
  const streakSvans =
    streak >= 7 ? "Vanan sitter — kedjan bär dig idag." : streak >= 1 ? "En dag i taget — kedjan växer med dig." : "";

  const innehall =
    `<p style="margin:0 0 4px;font-family:${SERIF};font-size:19px;color:${BLACK};">${halsning}</p>` +
    `<p style="margin:0 0 22px;font-family:${SERIF};font-size:14px;font-style:italic;line-height:1.6;color:${MUTAD};">Morgonposten från ditt researchlabb — brevtunn, saklig, varm. Fem minuter räcker.</p>` +
    // Vågkartan — marin låda med guldkant, som kortets gravör-känsla
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${MARIN_MORKARE}" style="width:100%;background-color:${MARIN_MORKARE};border:1px solid ${GULD};border-radius:6px;">` +
    `<tr><td bgcolor="${MARIN_MORKARE}" style="padding:18px 20px;background-color:${MARIN_MORKARE};">` +
    `<p style="margin:0 0 6px;font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:${GULD};">Vågkartan andas</p>` +
    `<p style="margin:0;font-family:${SERIF};font-size:16px;line-height:1.5;color:${GRADDE};">${esc(vagText)}</p>` +
    `</td></tr></table>` +
    // Fyra leads (samma radform som dashboard-kortet)
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:18px;">` +
    leadRad("Dagens aktie", `${esc(dagensAktie)} — gissa vågklassen på riktig data. Ett pass, fem minuter.`) +
    leadRad(
      "Dagens pass",
      streak >= 1
        ? `Fem minuter som håller kedjan levande — dagens repetition väntar. ${streakSvans}`
        : `Ett pass räcker för att tända elden — dagens repetition väntar.`,
    ) +
    leadRad(
      "Streak-elden",
      streak >= 1
        ? `${streak} ${streak === 1 ? "dag" : "dagar"} i rad — vanan ${streak >= 7 ? "sitter" : "växer"}.`
        : `Starta streaken idag — varje forskare börjar noll.`,
    ) +
    `</table>` +
    ctaKnapp("Öppna dagens pass →", "/dagens-pass") +
    `<p style="margin:14px 0 0;text-align:center;font-family:${SANS};font-size:11px;color:${MUTAD};">Tack för att du investerar i dig själv — kunskapen är din, ingen kan ta den ifrån dig.</p>`;

  return brevDokument("Morgon-briefingen", innehall);
}

// ── Mall 2 · Veckorapporten (vecko-sammanfattning) ──────────────────────────

/**
 * veckoRapport — veckans räkenskap: klara kurser, samlat XP och vågkartans
 * topprörelse. Formen är privatbankens veckobrev: siffrorna först, värmen
 * alltid. Tipsar om nästa steg — tvingar aldrig.
 */
export function veckoRapport(namn: string, klaraKurser: number, xp: number, topRorelse: string): string {
  const n = esc(namn.trim());
  const halsning = n ? `God vecka, ${n}.` : "God vecka.";

  const innehall =
    `<p style="margin:0 0 4px;font-family:${SERIF};font-size:19px;color:${BLACK};">${halsning}</p>` +
    `<p style="margin:0 0 22px;font-family:${SERIF};font-size:14px;font-style:italic;line-height:1.6;color:${MUTAD};">${uppmuntran("framsteg")}</p>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">` +
    leadRad("Klara kurser", `${klaraKurser} ${klaraKurser === 1 ? "kurs" : "kurser"} — varje avslutad kurs är en stapel på resan.`) +
    leadRad("Samlat XP", `${xp} XP — nivån växer med dig, hundra XP i taget.`) +
    leadRad("Vågkartans topp", esc(topRorelse)) +
    `</table>` +
    ctaKnapp("Till Kommandocentralen →", "/") +
    `<p style="margin:14px 0 0;text-align:center;font-family:${SANS};font-size:11px;color:${MUTAD};">Fas 1 förblir gratis — alltid. Hela biblioteket förblir öppet, och det förblir så.</p>`;

  return brevDokument("Veckorapporten", innehall);
}

// ── Mall 3 · Fas 2-nudge (när nivå 25 nås) ─────────────────────────────────

/**
 * fas2Nudge — inbjudan till Fas 2 när eleven nått nivå 25. Vi Bjuder in,
 * vi tvingar aldrig (pedagogik.ts): skuldfria formuleringar, tydligt att
 * Fas 1 förblir gratis för alltid.
 */
export function fas2Nudge(namn: string, niva: number): string {
  const n = esc(namn.trim());
  const halsning = n ? `Hej ${n}.` : "Hej.";

  const innehall =
    `<p style="margin:0 0 4px;font-family:${SERIF};font-size:19px;color:${BLACK};">${halsning}</p>` +
    `<p style="margin:0 0 22px;font-family:${SERIF};font-size:14px;font-style:italic;line-height:1.6;color:${MUTAD};">${uppmuntran("framsteg")}</p>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${MARIN_MORKARE}" style="width:100%;background-color:${MARIN_MORKARE};border:1px solid ${GULD};border-radius:6px;">` +
    `<tr><td bgcolor="${MARIN_MORKARE}" style="padding:18px 20px;background-color:${MARIN_MORKARE};">` +
    `<p style="margin:0 0 6px;font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:${GULD};">Nivå ${niva} — nästa kapitel</p>` +
    `<p style="margin:0;font-family:${SERIF};font-size:16px;line-height:1.5;color:${GRADDE};">Fas 2 — den avancerade analysresan — står öppet för dig. Välkommen vidare när du är redo: vi bjuder in till det, vi stänger aldrig in något.</p>` +
    `</td></tr></table>` +
    ctaKnapp("Ansök till Fas 2 →", "/fas2-ansok") +
    `<p style="margin:14px 0 0;text-align:center;font-family:${SANS};font-size:11px;line-height:1.6;color:${MUTAD};">Fas 1 förblir gratis — alltid. Vill du stanna där är det ett bra hem, inte ett baksteg.</p>`;

  return brevDokument(`Nivå ${niva} — Fas 2 väntar`, innehall);
}

// ── Mall 4 · Allmän nyhetsbrev-wrapper ──────────────────────────────────────

/**
 * NYHETSBREV_MALL — wrapper som klär VALFritt innehåll i AK1A-brevets
 * stomme (masthead, papper, disclaimer, marin bottenrad). `innehall` är
 * betrott HTML från avsändaren (internt) — mallen esc:ar bara rubriken.
 */
export function NYHETSBREV_MALL(rubrik: string, innehall: string): string {
  return brevDokument(rubrik, innehall);
}
