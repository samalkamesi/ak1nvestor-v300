/**
 * STUDIO HTML-EXPORT (VÅG 86 G7, STYRELSE-ADMIN-MEGA "TILLÄGG VÅG 86"):
 * bygger en FRISTÅENDE AK1A-stilad HTML-fil av chatten — marin header med
 * logotyp-ordmärke, användare marin / agent paper med guldkant, kodblock
 * monospace, diff-sektioner grönt/rött, rundstatistik i bubblans fot. All
 * CSS är INLINE i filen (ingen nätverksberoende resurs) och @media print
 * gör den utskriftsklar (brytningar + färgbevarande).
 *
 * Ren modul — INGEN React, INGEN fs: exakt som kommandon.ts går logiken
 * att hårdtesta och importeras av studio-chat.tsx.
 *
 * SKYDD: all meddelandetext escapas (htmlEsc) INNAN markdown-tolkningen —
 * agenttext är ALDRIG betrodd markup; länkar blir <a> endast för http(s)
 * (javascript: m.m. renderas som ofarlig text).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Minimal vy av ett verktygskort —räcker för exportens verktygsrad. */
interface VerktygKortExport {
  namn: string;
  steg?: string;
  fel?: string;
}

/** Minimal vy av en filändring — ±N + raderna räcker för diff-sektionen. */
interface FilandringExport {
  sokvag: string;
  plus: number;
  minus: number;
  rader: { typ: "+" | "-"; text: string }[];
}

/** Minimal vy av rundstatistiken (bubblans fot). */
interface RundStatistikExport {
  varaktighetMs?: number;
  resultatTyp?: string;
  verktygAntal?: number;
}

/** Minimal vy av ett chattmeddelande (strukturtypad — studio-chat.tsx
 *  passerar sina rika Meddelanden, extra fält ignoreras). */
export interface MeddelandeExport {
  roll: "user" | "assistant";
  text: string;
  fel?: boolean;
  verktygKort?: VerktygKortExport[];
  ändringar?: FilandringExport[];
  rundStatistik?: RundStatistikExport;
  malIteration?: number;
}

/** Escapa text för säker HTML (agenttext är ALDRIG betrodd markup). */
function htmlEsc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Inline-markdown → HTML (på REDAN ESCAPAD text): **fet**, `kod`, *kursiv*
 * och [länk](https://…) — URL-vakt: endast http(s)-länkar blir <a>, allt
 * annat (t.ex. javascript:) renderas som ofarlig text.
 */
function htmlInline(esc: string): string {
  return esc
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
}

/**
 * Agentens markdown → HTML-block (samma tolkning som StudioMarkdown i
 * studio-chat.tsx: ```-kodblock först, sedan ##/###-rubriker, [-*]-listor,
 * stycken). Rundade kanter + guldkant på kodblocken — som chatten.
 */
function markdownTillHtml(text: string): string {
  const ut: string[] = [];
  const segment = text.split(/```/);
  segment.forEach((seg, i) => {
    if (i % 2 === 1) {
      const rader = seg.replace(/^\n/, "").split("\n");
      const första = rader[0]?.trim() ?? "";
      const sprak = /^[a-zA-Z0-9+-]{0,20}$/.test(första) && första !== "" ? första : "";
      const kropp = htmlEsc((sprak ? rader.slice(1) : rader).join("\n").replace(/\n$/, ""));
      ut.push(
        `<pre class="kodblock">${sprak ? `<span class="sprak">${htmlEsc(sprak)}</span>` : ""}<code>${kropp}</code></pre>`,
      );
      return;
    }
    const rader = seg.split("\n");
    let lista: string[] = [];
    const spolaLista = () => {
      if (lista.length === 0) return;
      ut.push(`<ul>${lista.map((l) => `<li>${htmlInline(htmlEsc(l))}</li>`).join("")}</ul>`);
      lista = [];
    };
    rader.forEach((rad) => {
      const ren = rad.trimEnd();
      if (ren.startsWith("## ")) {
        spolaLista();
        ut.push(`<h3>${htmlInline(htmlEsc(ren.slice(3)))}</h3>`);
      } else if (ren.startsWith("### ")) {
        spolaLista();
        ut.push(`<h4>${htmlInline(htmlEsc(ren.slice(4)))}</h4>`);
      } else if (/^[-*] /.test(ren)) {
        lista.push(ren.slice(2));
      } else if (ren === "") {
        spolaLista();
      } else {
        spolaLista();
        ut.push(`<p>${htmlInline(htmlEsc(ren))}</p>`);
      }
    });
    spolaLista();
  });
  return ut.join("\n");
}

/** Formattera millisekunder läsbart (1234 → "1,2 s"; 456 → "456 ms"). */
function msText(ms: number): string {
  if (ms >= 1000) return (ms / 1000).toFixed(1).replace(".", ",") + " s";
  return Math.round(ms) + " ms";
}

/** Verktygsraden under agenttexten: "Verktyg: Bash ×2 · Read ×1". */
function verktygRad(kort: VerktygKortExport[]): string {
  const antal = new Map<string, number>();
  for (const k of kort) antal.set(k.namn, (antal.get(k.namn) ?? 0) + 1);
  const fel = kort.some((k) => k.steg === "fel" || k.fel);
  const delar = [...antal.entries()].map(([namn, n]) => `${htmlEsc(namn)}${n > 1 ? ` &times;${n}` : ""}`);
  return `<p class="verktyg">Verktyg: ${delar.join(" · ")}${fel ? ' <span class="fel-mark">&#9888; fel</span>' : ""}</p>`;
}

/** Diff-sektionen: filrader med ±N (grönt/rött) + rad-diff i monospace. */
function diffSektion(filer: FilandringExport[]): string {
  const rader = filer
    .map((f) => {
      const diffRader = f.rader
        .slice(0, 200)
        .map(
          (r) =>
            `<span class="${r.typ === "+" ? "r-plus" : "r-minus"}">${r.typ === "+" ? "+" : "&minus;"} ${htmlEsc(r.text || " ")}</span>`,
        )
        .join("");
      return (
        `<div class="diff-fil"><span class="namn">${htmlEsc(f.sokvag.split("/").slice(-2).join("/"))}</span>` +
        `<span class="plus">+${f.plus}</span><span class="minus">&minus;${f.minus}</span></div>` +
        (diffRader ? `<pre class="diff-rader">${diffRader}</pre>` : "")
      );
    })
    .join("");
  return (
    `<div class="diff"><div class="diff-huvud">&Auml;ndringar (${filer.length} ${filer.length === 1 ? "fil" : "filer"})</div>${rader}</div>`
  );
}

/** Bubblans fot: varaktighet · resultat · verktygsantal (+ mål-iteration). */
function fotRad(m: MeddelandeExport): string {
  const delar: string[] = [];
  if (typeof m.rundStatistik?.varaktighetMs === "number") delar.push(`&#9201; ${msText(m.rundStatistik.varaktighetMs)}`);
  if (m.rundStatistik?.resultatTyp) delar.push(htmlEsc(m.rundStatistik.resultatTyp));
  if (typeof m.rundStatistik?.verktygAntal === "number") {
    delar.push(`${m.rundStatistik.verktygAntal} ${m.rundStatistik.verktygAntal === 1 ? "verktyg" : "verktyg"}`);
  }
  if (typeof m.malIteration === "number") delar.push(`&#127919; m&aring;l iteration ${m.malIteration}`);
  if (delar.length === 0) return "";
  return `<p class="fot">${delar.join(" &middot; ")}</p>`;
}

/** AK1A-paletten + layout för den fristående filen (sajtens egna värden). */
const HTML_EXPORT_STIL = `
  :root { --marin: #0E1B2E; --marin2: #10233F; --guld: #C9A84C; --papper: #FDFBF7; --blaek: #1C2B3A; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0; background: var(--papper); color: var(--blaek);
    font-family: Georgia, "Times New Roman", serif; line-height: 1.65;
    background-image: radial-gradient(circle at 1px 1px, rgba(14,27,46,0.028) 1px, transparent 0);
    background-size: 22px 22px;
  }
  .hdr { background: linear-gradient(135deg, var(--marin) 0%, var(--marin2) 100%); color: #EDE6D6; padding: 26px 20px 22px; border-bottom: 3px solid var(--guld); }
  .hdr-inre { max-width: 860px; margin: 0 auto; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .logo-ruta { width: 46px; height: 46px; border-radius: 10px; background: var(--papper); color: var(--marin); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; border: 1px solid rgba(201,168,76,0.55); flex: none; }
  .brand { font-size: 21px; font-weight: 700; letter-spacing: 0.3px; }
  .brand .guld { color: var(--guld); }
  .brand .chip { font-size: 10px; letter-spacing: 2.5px; color: var(--guld); border: 1px solid rgba(201,168,76,0.5); border-radius: 999px; padding: 3px 10px; vertical-align: 3px; margin-left: 10px; }
  .hdr-meta { width: 100%; margin-top: 8px; font-size: 12px; color: rgba(237,230,214,0.72); font-family: "Courier New", monospace; }
  main { max-width: 860px; margin: 26px auto 40px; padding: 0 16px; }
  .msg { margin: 20px 0; border-radius: 12px; padding: 14px 18px; break-inside: avoid; page-break-inside: avoid; }
  .msg.user { background: var(--marin2); color: #EDE6D6; border-left: 4px solid rgba(201,168,76,0.35); }
  .msg.agent { background: #FFFFFF; border: 1px solid rgba(14,27,46,0.12); border-left: 4px solid var(--guld); box-shadow: 0 1px 3px rgba(14,27,46,0.07); }
  .msg.fel { background: #FDECEA; border-left: 4px solid #B3261E; }
  .who { font-size: 10px; letter-spacing: 2px; font-weight: 700; margin-bottom: 8px; }
  .msg.user .who { color: var(--guld); }
  .msg.agent .who { color: rgba(14,27,46,0.45); }
  .msg.user .body { white-space: pre-wrap; font-size: 14.5px; }
  .msg.agent .body { font-size: 14.5px; }
  .body p { margin: 10px 0; } .body p:first-child { margin-top: 0; } .body p:last-child { margin-bottom: 0; }
  .body h3, .body h4 { margin: 16px 0 8px; } .body ul { margin: 8px 0; padding-left: 22px; }
  .body code { font-family: "Courier New", monospace; font-size: 0.88em; background: rgba(14,27,46,0.06); border-radius: 4px; padding: 1px 5px; }
  .msg.user .body code { background: rgba(237,230,214,0.15); }
  .kodblock { background: #F4F0E6; border: 1px solid rgba(201,168,76,0.4); border-radius: 8px; padding: 12px 14px; margin: 12px 0; overflow-x: auto; break-inside: avoid; page-break-inside: avoid; }
  .kodblock code { display: block; font-family: "Courier New", monospace; font-size: 12px; line-height: 1.55; background: none; padding: 0; color: #24313F; white-space: pre-wrap; word-break: break-word; }
  .kodblock .sprak { display: block; font-size: 9px; letter-spacing: 2px; font-weight: 700; color: #A0812F; text-transform: uppercase; margin-bottom: 6px; }
  .verktyg { margin-top: 10px; font-size: 11px; color: rgba(14,27,46,0.55); font-family: "Courier New", monospace; }
  .verktyg .fel-mark { color: #B3261E; font-weight: 700; }
  .diff { margin-top: 12px; border: 1px solid rgba(14,27,46,0.15); border-radius: 8px; overflow: hidden; }
  .diff-huvud { background: rgba(14,27,46,0.05); padding: 7px 12px; font-size: 10px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; color: rgba(14,27,46,0.6); }
  .diff-fil { display: flex; gap: 10px; align-items: baseline; padding: 6px 12px; border-top: 1px solid rgba(14,27,46,0.08); font-family: "Courier New", monospace; font-size: 12px; flex-wrap: wrap; }
  .diff-fil .namn { flex: 1 1 auto; min-width: 180px; word-break: break-all; }
  .diff-fil .plus { color: #1B7A43; font-weight: 700; } .diff-fil .minus { color: #B3261E; font-weight: 700; }
  .diff-rader { margin: 0; padding: 8px 12px; border-top: 1px solid rgba(14,27,46,0.08); font-family: "Courier New", monospace; font-size: 11px; line-height: 1.6; background: #FBF9F4; }
  .diff-rader .r-plus { display: block; color: #1B7A43; background: rgba(27,122,67,0.07); white-space: pre-wrap; word-break: break-word; }
  .diff-rader .r-minus { display: block; color: #B3261E; background: rgba(179,38,30,0.07); white-space: pre-wrap; word-break: break-word; }
  .fot { margin-top: 16px; font-size: 11px; color: rgba(14,27,46,0.5); border-top: 1px solid rgba(201,168,76,0.4); padding-top: 8px; display: flex; gap: 8px; flex-wrap: wrap; font-family: "Courier New", monospace; }
  .sidfot { max-width: 860px; margin: 0 auto 30px; padding: 10px 16px 0; font-size: 11px; color: rgba(14,27,46,0.5); border-top: 2px solid var(--guld); font-style: italic; }
  a { color: #8A6D1F; }
  @media print {
    body { background: #FFFFFF; background-image: none; }
    main { margin-top: 12px; }
    .msg { box-shadow: none; }
    .msg, .kodblock, .diff { break-inside: avoid; page-break-inside: avoid; }
  }
`;

/**
 * Bygg den FRIA stående HTML-filen av chatten. `meddelanden` är chattens
 * rika objekt (strukturtypade mot MeddelandeExport), `modell` pryder
 * headerns metarad, `datum` blir dokumenttiteln.
 */
export function byggChatHtml(meddelanden: MeddelandeExport[], modell?: string): string {
  const nu = new Date();
  const meta: string[] = [`Exporterad ${nu.toLocaleString("sv-SE")}`];
  if (modell) meta.push(`Modell: ${htmlEsc(modell)}`);
  meta.push(`${meddelanden.length} ${meddelanden.length === 1 ? "meddelande" : "meddelanden"}`);
  const kropp = meddelanden
    .map((m) => {
      if (m.roll === "user") {
        return `<div class="msg user"><p class="who">DU</p><div class="body">${htmlEsc(m.text)}</div></div>`;
      }
      const klass = m.fel ? "msg agent fel" : "msg agent";
      const bitar = [`<div class="${klass}"><p class="who">AGENT${m.fel ? " — FEL" : ""}</p>`];
      bitar.push(`<div class="body">${markdownTillHtml(m.text || "_(tomt svar)_")}</div>`);
      if (m.verktygKort && m.verktygKort.length > 0) bitar.push(verktygRad(m.verktygKort));
      if (m.ändringar && m.ändringar.length > 0) bitar.push(diffSektion(m.ändringar));
      const fot = fotRad(m);
      if (fot) bitar.push(fot);
      bitar.push("</div>");
      return bitar.join("");
    })
    .join("\n");
  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AK1A Studio — chatt ${nu.toLocaleDateString("sv-SE")}</title>
<style>${HTML_EXPORT_STIL}</style>
</head>
<body>
<header class="hdr">
  <div class="hdr-inre">
    <div class="logo-ruta">AK1</div>
    <div class="brand"><span class="guld">AK1</span>A Research Lab<span class="chip">STUDIO</span></div>
    <div class="hdr-meta">${meta.join(" &middot; ")}</div>
  </div>
</header>
<main>
${kropp}
</main>
<p class="sidfot">AK1A Research Lab — pedagogisk plattform, inte investeringsråd. Exporterad ur studion (${nu.toLocaleDateString("sv-SE")}).</p>
</body>
</html>
`;
}
