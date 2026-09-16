#!/usr/bin/env node
// mimosa-paritet.mjs — server-side paritet för Mimosa-skannerns dokumenterade
// fyndklasser (spår 8, s8-u3 omgång 3, 2026-09-15; domänslösning omgång 4
// 2026-09-16).
//
// BAKGRUND (bevis i .mimosa/ + worklog): kundens säkerhetsskanner Mimosa
// (semgrep-hook i arbetsstationens Z-Code) är speglad till servern via
// .mimosa/, men speglingen upphörde 2026-09-10 12:56 och de sista åtta
// körningarna (09-08 → 09-10) var samtliga "inconclusive" med
// spawnSync ETIMEDOUT = 0 skannade filer. Fabrikens och huvudagentens
// commits på servern har ALDRIG skannats av Mimosa (hooken bor i
// arbetsstationens sessioner). Detta verktyg är kompensationen: samma
// fyndklasser, deterministiskt, på serverträdet.
//
// FYNDKLASSER (källa: .mimosa/reports + worklog-lärdomar):
//   SSRF_INTERPOLERAD_FETCH  high   fetch(`${...}`) / fetch("..."+x) utan
//                                     valideringsvittne (worklog 9075: HIGH)
//   PATH_API                 high   request-data → path.join/resolve/läsning
//                                     utan vitlista/prefixkontroll (Mimosas
//                                     senaste äkta fynd: minne/route.ts
//                                     2026-09-09, klass 路径穿越)
//   SHELL_PIPE               high   curl/wget-pipe till sh/bash i skalprogram
//                                     (setup-prod.sh-fynden 2026-09-08)
//   SHELL_URL_VARIABEL       medium URL byggd ur skal-variabel
//   CHILD_PROC_INTERP        high   exec/execSync med interpolerat kommando
//                                     (worklog 9586: kompileringskonstanter;
//                                     v1.3 fångar även "${...}" i citerad
//                                     sträng — s8-u1:s permissions-fynd)
//   SSRF_EXTERN_LITERAL      info   fetch("https://...") fast literal —
//                                     rapporteras, räknas ej som fynd
//   LOSENORD_AUTOCOMPLETE    info   lösenords-placeholder + autoComplete
//                                     (worklog 9325-9329-klassen)
//
// Kontext-förmildran (mot falska positiver — Mimosa-lärdomarna är EXPLICITA
// om vad som passerar): valideringsvittnen inom ±8 rader (getSupabaseRest,
// kontrolleraHost, new URL, regex-vitlista .test(, startsWith-prefixkontroll,
// sanera/sakra-funktioner, loop över VERSALKONSTANT) klassar träffen
// "härdad-kontext" som RAPPORTERAS men aldrig blockerar. execFile/spawn med
// array-argument är per definition utan skal = härdad form.
//
// Användning:
//   node verktyg/mimosa-paritet.mjs [--katalog VÄG] [--doman REGEX]
//                                    [--hoppa-over REGEX] [--json UTFIL] [--tyst]
// --doman (v1.1): regex på relativ sökväg som ersätter standarddomänen
//   src/ + data/infra/ — t.ex. '(^|/)(verktyg|\.zcode|\.zscripts)/' för
//   väktardomänen (s8-u3 omgång 4: härdning av verktygskatalogens
//   interpoleringar kräver mekaniskt FÖRE/EFTER-bevis).
// --hoppa-over (v1.2): filnamns-regex för dokumenterade undantag —
//   ENDAST testfixturer som medvetet innehåller farliga mönster som
//   strängar (denna svits egna testa-mimosa-paritet.mjs; FYND i FÖRE-
//   körningen 2026-09-16). Levande kod undantas ALDRIG.
// Exit: 0 = grönt (ingen ohärdad high/medium), 1 = fynd, 2 = argumentfel.

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

// ── Argument ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function argVarde(flagga) {
  const i = args.indexOf(flagga);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}
const rotArg = argVarde("--katalog");
const domanArg = argVarde("--doman");
const hoppaArg = argVarde("--hoppa-over");
const jsonArg = argVarde("--json");
const tyst = args.includes("--tyst");
const rot = rotArg ?? process.cwd();
const kandaFlaggor = ["--katalog", "--doman", "--hoppa-over", "--json", "--tyst"];
for (const a of args) {
  if (a.startsWith("--") && !kandaFlaggor.includes(a)) {
    console.error(`Okänd flagga: ${a}. Tillåtna: --katalog VÄG, --doman REGEX, --hoppa-over REGEX, --json FIL, --tyst`);
    process.exit(2);
  }
}

// ── Filkarta ────────────────────────────────────────────────────────────────
// STANDARDDOMÄN = Mimosa:s bevisade fyndområden: src/ (produktkod,
// ts/tsx/mjs) och data/infra/ (skalprogram — setup-prod.sh-fynden
// 2026-09-08). Övriga kataloger nås via --doman (väktardomänen skannas
// mekaniskt sedan s8-u3 omgång 4). node_modules/.next/.git lämnas
// alltid utanför (lsRekursivts exkluderingslista).
function lsRekursivt(dir) {
  const ut = [];
  for (const namn of readdirSync(dir)) {
    // .mimosa är spegling, node_modules/.next/.git lämnas alltid utanför
    if ([".git", "node_modules", ".next", ".mimosa", "dist", ".vercel"].includes(namn)) continue;
    const hel = join(dir, namn);
    const info = statSync(hel);
    if (info.isDirectory()) ut.push(...lsRekursivt(hel));
    else ut.push(hel);
  }
  return ut;
}

// Standarddomän som regex; --doman ersätter den helt (dokumenterat i
// hjälptexten ovan). Ogiltig regexp i --doman/--hoppa-over → exit 2.
let domanRegex;
let hoppaRegex = null;
try {
  domanRegex = domanArg ? new RegExp(domanArg) : /(^|\/)(src|data\/infra)\//;
  hoppaRegex = hoppaArg ? new RegExp(hoppaArg) : null;
} catch {
  console.error(`Ogiltig regex: --doman "${domanArg}" / --hoppa-over "${hoppaArg}"`);
  process.exit(2);
}
function iDoman(relVag) {
  return domanRegex.test(relVag) && !(hoppaRegex && hoppaRegex.test(relVag));
}

const allaFiler = lsRekursivt(rot)
  .map((f) => ({ hel: f, rel: relative(rot, f).split(sep).join("/") }))
  .filter(({ rel }) => iDoman(rel))
  .filter(({ rel }) => /\.(ts|tsx|mjs|sh)$/.test(rel))
  .map(({ hel }) => hel);

// ── Kontext-vittnen ─────────────────────────────────────────────────────────
// Vittnena är KLASSSPECIFIKA: ett URL-objekt härdar en FETCH (worklog 5014)
// men aldrig en filoperation — annars immuniserar `new URL(req.url)`
// (Next.js standardparsning) hela route:en mot PATH_API.
const VITTNEN_FETCH = [
  /getSupabaseRest/i,          // worklog 2662: vitlistad helper (https + *.supabase.co)
  /valideraEndpoint|kontrolleraHost|kontrolleraUrl/i, // kontroll-före-fetch-receptet
  /new URL\(/,                 // URL-objekt-mönstret (worklog 5014)
  /\.test\(/,                  // regex-vitlista i närheten
  /sanera|sakra|vitlista/i,    // namngivna härdningshjälpare
  /DIREKTIV|KONSTANT|HOSTAR|_URL\b/, // versal-modulkonstant (kompile-tidsvärd)
];
const VITTNEN_PATH = [
  /\.test\(/,                  // namn-vitlista (minne/route.ts-mönstret)
  /startsWith\(/,              // prefixkontroll (inneslutningsvakten)
  /sanera|sakra|vitlista|inneslutning|prefixkontroll/i,
];

function hardadKontext(rader, idx, fonster = 8, vittnen = VITTNEN_FETCH) {
  const fran = Math.max(0, idx - fonster);
  const till = Math.min(rader.length - 1, idx + fonster);
  for (let i = fran; i <= till; i++) {
    if (i === idx) continue;
    const rad = rader[i];
    if (vittnen.some((v) => v.test(rad))) return true;
  }
  return false;
}

// Filnivå-helper: hela filen som importerar/anropar den vitlistade rest-helpers
// bär härdade origins (worklog 2662 — supabase-rest.ts är serverns host-vakt).
const FIL_HELPER = /getSupabaseRest|supabaseRest\(|kontrolleraHost|valideraEndpoint/;

// request-källor för PATH_API: variabelnamn som troligen bär request-data
const KALLOR = /(?:searchParams\.get|url\.searchParams|params\.|request\.json|await\s+req\.json|JSON\.parse\([^)]*\))/;

function namnFranRequest(rader, idx) {
  // sök uppåt ≤ 25 rader efter tilldelningar ur request-källor; returnera namnen
  const namn = [];
  for (let i = Math.max(0, idx - 25); i < idx; i++) {
    const m = rader[i].match(/(?:const|let)\s+([A-Za-z_ÅÄÖåäö$][\wÅÄÖåäö$]*)\s*=[^;]*;?\s*$/);
    if (m && KALLOR.test(rader[i])) namn.push(m[1]);
    // destructuring ur params: const { slug } = params / await params
    const d = rader[i].match(/(?:const|let)\s*\{([^}]+)\}\s*=\s*(?:await\s+)?params\b/);
    if (d) namn.push(...d[1].split(",").map((s) => s.trim()).filter(Boolean));
  }
  return namn;
}

// ── Regelmotor ──────────────────────────────────────────────────────────────
const fynd = [];
const rapportRader = [];

function rapportera(klass, allvar, fil, radNr, bevis, kontext) {
  const post = {
    klass,
    allvarlighetsgrad: allvar,
    fil: relative(rot, fil).split(sep).join("/"),
    rad: radNr + 1,
    bevis: bevis.trim().slice(0, 120),
    kontext,
  };
  rapportRader.push(post);
  if (kontext !== "härdad-kontext" && allvar !== "info") fynd.push(post);
  else if (allvar === "info" && kontext !== "härdad-kontext") {
    // info-rader blockerar aldrig men syns i rådata
  }
}

for (const fil of allaFiler) {
  let text;
  try {
    text = readFileSync(fil, "utf8");
  } catch {
    continue;
  }
  const rader = text.split("\n");
  const arSh = fil.endsWith(".sh");
  const arApi = fil.includes(`${sep}api${sep}`) || fil.includes("/api/");

  rader.forEach((rad, i) => {
    const trimmad = rad.trim();
    // kommentarsrader (ts //, jsdoc *, sh #) kan bära dokumentation om själva
    // reglerna ("curl | sh pipas ALDRIG") och skannas aldrig
    if (!trimmad || trimmad.startsWith("//") || trimmad.startsWith("*") || trimmad.startsWith("#")) return;

    if (arSh) {
      // SHELL_PIPE: nät-hämtning pipad till skal (setup-prod.sh-klassen)
      if (/\b(curl|wget)\b[^|]*\|\s*(ba|z|da|fi)?sh\b/.test(trimmad)) {
        rapportera("SHELL_PIPE", "high", fil, i, rad, "oskyddad");
      }
      // SHELL_URL_VARIABEL: URL med skal-variabel (loopback-sonder är info)
      if (/["']https?:\/\/[^"']*\$\{?[A-Za-z_]/.test(trimmad) && /\b(curl|wget|fetch)\b/.test(trimmad)) {
        const loopback = /127\.0\.0\.1|localhost|\[::1\]/.test(trimmad);
        if (loopback) {
          rapportera("SHELL_URL_LOOPBACK", "info", fil, i, rad, "loopback-sond");
        } else {
          const hardad = /deb\.nodesource|deb\.docker|signed-by|apt\.snapshot/i.test(rad) || hardadKontext(rader, i, 5);
          rapportera("SHELL_URL_VARIABEL", "medium", fil, i, rad, hardad ? "härdad-kontext" : "oskyddad");
        }
      }
      return;
    }

    // ── ts/tsx/mjs ──

    // SSRF: fetch med interpolation eller konkat — klassifiera URL-delen:
    //   relativt `/...`    → intern same-origin, kan aldrig vara SSRF (hoppa)
    //   loopback           → medvetet lokalt mätverktyg (info)
    //   `https://${x}`     → EXTERN interpolerad host = Mimosa:s HIGH-klass
    //   `${var}/...`       → variabel-host: härdas av versalkonstant,
    //                        same-origin-idiom, fil-helper eller radvittne
    const fetchMatch = rad.match(/fetch\(\s*(`[^`]*`|["'][^"']*["']\s*\+[^,)]+)/);
    if (fetchMatch) {
      const urlDel = fetchMatch[1];
      const arRelativ = /^["'`]\//.test(urlDel.trim());
      const arLoopback = /127\.0\.0\.1|localhost|\[::1\]/.test(urlDel);
      const harInterpolation = /\$\{/.test(urlDel);
      const externLiteralMedInterp = /["'`]https?:\/\//.test(urlDel) && harInterpolation;
      if (!arRelativ && !arLoopback && (externLiteralMedInterp || (harInterpolation && !/["'`]https?:\/\//.test(urlDel)) || /\+\s*\w/.test(urlDel))) {
        const hardad =
          hardadKontext(rader, i, 14) ||
          FIL_HELPER.test(text) ||
          /nextUrl\.origin/.test(rad) ||
          /\$\{[A-Z][A-Z0-9_]*\}/.test(urlDel) || // versalkonstant (kompile-tidsvärd)
          /^[`"'][^`"'$]*["']\s*\+\s*[A-Z][A-Z0-9_]*\b/.test(urlDel.trim());
        rapportera("SSRF_INTERPOLERAD_FETCH", "high", fil, i, rad, hardad ? "härdad-kontext" : "oskyddad");
      } else if (arLoopback) {
        rapportera("SSRF_LOOPBACK", "info", fil, i, rad, "loopback-mätverktyg");
      }
    }
    // fast extern literal utan interpolation (info — rapporteras, blockerar ej)
    else if (/fetch\(\s*["']https?:\/\//.test(rad)) {
      rapportera("SSRF_EXTERN_LITERAL", "info", fil, i, rad, "fast-literal");
    }

    // CHILD_PROC_INTERP: exec/execSync med interpolerat KOMMANDO ( första arg)
    // v1.3: även "${...}" i citerad sträng FÖRE inre citattecken (skal-
    // expansion ${}) — luckan påvisad av syskonet s8-u1 (skalfri-vakt.mjs,
    // permissions-policy-fyndet); malliteraler täcktes sedan v1.0
    if (/\b(exec|execSync)\s*\(\s*(?:`[^`]*\$\{|["'][^"']*\$\{|["'][^"']*["']\s*\+)/.test(rad)) {
      rapportera("CHILD_PROC_INTERP", "high", fil, i, rad, "oskyddad");
    }

    // PATH_API: filvägsoperationer som konsumerar request-härledda namn
    if (arApi && /(path\.(join|resolve)|readFile|writeFile|createReadStream|createWriteStream|readdir)\(/.test(rad)) {
      const misstankta = namnFranRequest(rader, i);
      const konsumerar = misstankta.filter((n) => new RegExp(`\\b${n.replace(/\$/g, "\\$")}\\b`).test(rad));
      if (konsumerar.length > 0) {
        const hardad = hardadKontext(rader, i, 12, VITTNEN_PATH);
        rapportera("PATH_API", "high", fil, i, rad, hardad ? "härdad-kontext" : "oskyddad");
      }
    }

    // LOSENORD_AUTOCOMPLETE (info-klassen)
    if (/placeholder\s*=\s*["'][^"']*[lLöO]senord|placeholder\s*=\s*["'][^"']*password/i.test(rad)) {
      const omrad = rader.slice(Math.max(0, i - 3), i + 4).join("\n");
      if (/autoComplete\s*=\s*["'](?:current-|new-)?password/i.test(omrad)) {
        rapportera("LOSENORD_AUTOCOMPLETE", "info", fil, i, rad, "autoComplete satt");
      }
    }
  });
}

// ── Sammanställning ─────────────────────────────────────────────────────────
const perKlass = {};
for (const r of rapportRader) {
  perKlass[r.klass] = perKlass[r.klass] ?? { totalt: 0, hardade: 0, fynd: 0 };
  perKlass[r.klass].totalt++;
  if (r.kontext === "härdad-kontext") perKlass[r.klass].hardade++;
  else if (r.allvarlighetsgrad !== "info") perKlass[r.klass].fynd++;
}

const resultat = {
    verktyg: "mimosa-paritet",
    version: "1.3",
    tid: new Date().toISOString(),
    katalog: rot,
    doman: domanArg ?? "standard (src/ + data/infra/)",
    hoppaOver: hoppaArg ?? null,
  skannadeFiler: allaFiler.length,
  perKlass,
  fynd: fynd.map((f) => `${f.fil}:${f.rad} ${f.klass} [${f.allvarlighetsgrad}] ${f.bevis}`),
  fyndPoster: fynd,
  rapportPoster: rapportRader,
  exit: fynd.length > 0 ? 1 : 0,
};

if (jsonArg) {
  const katalog = join(jsonArg, "..");
  try { mkdirSync(katalog, { recursive: true }); } catch { /* finns */ }
  writeFileSync(jsonArg, JSON.stringify(resultat, null, 2) + "\n", "utf8");
}

if (!tyst) {
  console.log(`Mimosa-paritet: ${allaFiler.length} filer skannade, ${fynd.length} fynd (${rapportRader.length} rapportrader varav härdade kontexter redovisas).`);
  for (const [klass, s] of Object.entries(perKlass)) {
    console.log(`  ${klass}: ${s.totalt} träffar (${s.hardade} härdade kontexter, ${s.fynd} fynd)`);
  }
  for (const f of fynd) {
    console.log(`  FYND ${f.fil}:${f.rad} [${f.allvarlighetsgrad}] ${f.klass}: ${f.bevis}`);
  }
  if (fynd.length === 0) console.log("GRÖN — inga ohärdade fynd i Mimosa:s klasser.");
}

process.exit(resultat.exit);
