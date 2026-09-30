"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

/**
 * ZCODE-MARKDOWN — markdown-rendering av AGENT-svar i /zcode-chatten
 * (fabriksuppdrag 2026-09-30: "Markdown-rendering + kodblock med syntax
 * highlighting"). Dessförinnan visade en-trycks-ytan agentens markdown som
 * råtext — ZCode Desktop renderar, och nu gör chatten det också. Ingen nytt
 * paket: en egen parser på ~200 rader, samma brodda som studio-chattens
 * StudioMarkdown men med syntaxfärgade kodblock + kopiera-knapp.
 *
 * STÖD (medvetet avgränsat):
 *   BLOCK  — kodblock ``` med språketikett + kopiera-knapp + syntaxfärger
 *            (js/ts/python/bash, regex-tokeniserare), rubriker #–######
 *            (nivå 1 → h1, 2 → h2, 3+ → h3), punkt-/numrerade listor
 *            (nästling plattas till en nivå), horisontell skiljelinje,
 *            stycken (konsekutiva rader binds med <br>, chat-konvention).
 *   INLINE — ***fet kursiv***, **fet**, *kursiv*, _kursiv_, `kod`
 *            (accent-bakgrund), [länk](url): ZCode-blå #58A6FF, ny flik +
 *            rel=noopener noreferrer, href-filter (endast http(s)/mailto/
 *            snedlänk/ankare — javascript: m.m. rendras som ren etikett).
 *
 * MOBIL FÖRST: kodblocket scrollar HORISONTELLT (pre overflow-x-auto +
 * touch-momentum, koden lindas ALDRIG) och spränger ALDRIG layouten;
 * långa länkar bryts (break-all). Paletten = klientens egen: yta #0D1117,
 * djupkod #010409, ramar #30363D, text #E6EDF3, sekundär #8B949E,
 * accent #58A6FF — syntaxfärgerna är GitHub-dark-familjen som hör hemma
 * på den bakgrunden (sträng #A5D6FF, nyckelord #FF7B72, tal #79C0FF,
 * funktion #D2A8FF, variabel #FFA657, kommentar #8B949E).
 *
 * KVD-ANKARE: de reguljära uttrycken nedan (SPRAK_JS/SPRAK_TS/SPRAK_PY/
 * SPRAK_BASH, INLINE_MARKDOWN) är ENRADIGA literaler med ALLA snedstreck
 * escalade — verktyg/_zcode-markdown-kvd.mjs extraherar dem UR DENNA KÄLLA
 * (inte en kopia) och verifierar tokeniseringen mot före/efter-fall.
 * Ändra här ⇒ kör KVD-skriptet.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Syntax-tokeniseraren (regex per språk — KVD-ankaren, se filhuvudet) ──────

/** Token-typer med GitHub-mörka syntaxfärger (samma familj som #0D1117). */
type TokenTyp = "kommentar" | "strang" | "nyckelord" | "tal" | "funktion" | "variabel";

/** Språk med egna tokeniseringsregler. */
type SyntaxSprak = "js" | "ts" | "py" | "bash";

/** Färgklass per token-typ. */
const TOKEN_KLASS: Record<TokenTyp | "ren", string> = {
  kommentar: "text-[#8B949E] italic",
  strang: "text-[#A5D6FF]",
  nyckelord: "text-[#FF7B72]",
  tal: "text-[#79C0FF]",
  funktion: "text-[#D2A8FF]",
  variabel: "text-[#FFA657]",
  ren: "text-[#E6EDF3]",
};

/** Språketikett (små bokstäver) → regelverk; okänd etikett ⇒ ofärgad kod. */
const SPRAK_KARTA: Record<string, SyntaxSprak> = {
  js: "js",
  javascript: "js",
  jsx: "js",
  mjs: "js",
  cjs: "js",
  node: "js",
  json: "js",
  ts: "ts",
  typescript: "ts",
  tsx: "ts",
  mts: "ts",
  cts: "ts",
  py: "py",
  python: "py",
  python3: "py",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  "shell-script": "bash",
  console: "bash",
};

// Fångstgrupper: 1 kommentar · 2 sträng · 3 nyckelord · 4 tal · 5 funktionsanrop
const SPRAK_JS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|from|function|get|if|import|in|instanceof|let|new|of|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield|true|false|null|undefined)\b|\b(0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()/g;

// TS = JS-reglerna + typsystemets ord (interface/type/private/…) — samma grupper.
const SPRAK_TS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(abstract|any|as|asserts|async|await|bigint|boolean|break|case|catch|class|const|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|namespace|never|new|number|object|of|override|private|protected|public|readonly|return|satisfies|set|static|string|super|switch|symbol|this|throw|try|type|typeof|undefined|unknown|using|var|void|while|with|yield|true|false|null)\b|\b(0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\s*\()/g;

// Python: # kommentar · f/r/b/u-strängar (även trippel) · nyckelord · tal · def/anrop
const SPRAK_PY = /(#[^\n]*)|([fFrRbBuU]{0,2}(?:'''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"))|\b(and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|match|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield|self)\b|\b(\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b([A-Za-z_]\w*)(?=\s*\()/g;

// Bash: 1 kommentar · 2 sträng · 3 variabel ($…) · 4 nyckelord/builtins · 5 kommandon · 6 tal
const SPRAK_BASH = /(#[^\n]*)|('[^'\n]*'|"(?:\\.|[^"\\])*")|(\$\{[^}\n]*\}|\$[A-Za-z_]\w*|\$[$?!*]|\$\d+)|\b(alias|bg|case|cd|coproc|declare|do|done|echo|elif|else|esac|eval|exec|exit|export|false|fi|fg|for|function|if|in|jobs|kill|local|popd|printf|pushd|readonly|return|select|set|shift|shopt|sleep|source|test|then|time|trap|true|typeset|unset|until|wait|while)\b|\b(apt|apt-get|awk|bash|cat|chmod|chown|cp|curl|cut|diff|docker|find|flock|git|grep|gunzip|gzip|head|jq|ln|mkdir|mv|nginx|node|npm|npx|pip|pip3|pm2|python|python3|rm|rmdir|rsync|scp|sed|sh|sort|ssh|sudo|systemctl|tail|tar|touch|tr|uniq|unzip|wc|wget|xargs|zip|zsh)\b|\b(\d+)\b/g;

// Fångstgrupper per språk — index 1..n i monster ovan (KVD extraherar ock detta).
const JS_GRUPPER: TokenTyp[] = ["kommentar", "strang", "nyckelord", "tal", "funktion"];
const BASH_GRUPPER: TokenTyp[] = ["kommentar", "strang", "variabel", "nyckelord", "funktion", "tal"];

interface SprakRegler {
  monster: RegExp;
  grupper: TokenTyp[];
}

const SPRAK_REGLER: Record<SyntaxSprak, SprakRegler> = {
  js: { monster: SPRAK_JS, grupper: JS_GRUPPER },
  ts: { monster: SPRAK_TS, grupper: JS_GRUPPER },
  py: { monster: SPRAK_PY, grupper: JS_GRUPPER },
  bash: { monster: SPRAK_BASH, grupper: BASH_GRUPPER },
};

/** Etikett → regler; okänd ⇒ null ⇒ koden visas OFÄRGAD, aldrig dold. */
function reglerForSprak(tagg: string): SprakRegler | null {
  const sprak = SPRAK_KARTA[tagg];
  return sprak ? SPRAK_REGLER[sprak] : null;
}

/** Kod → färgade noder: vänster-till-höger-skanning av monstret; den grupp
 *  som fångade avgör färgen. Strängar/kommentarer konsumeras HELA (ett """
 *  före ett # vinner på position), så nyckelord inom dem färgas aldrig.
 *  Ofångat mellantext lämnas rent (#E6EDF3). */
function markeraKod(kod: string, regler: SprakRegler | null, nyckel: string): React.ReactNode {
  if (!regler) return kod;
  regler.monster.lastIndex = 0;
  const noder: React.ReactNode[] = [];
  let sist = 0;
  let n = 0;
  let m: RegExpExecArray | null;
  while ((m = regler.monster.exec(kod)) !== null) {
    if (m[0] === "") {
      regler.monster.lastIndex += 1; // nollmatchning skulle annars loopa evigt
      continue;
    }
    if (m.index > sist) noder.push(kod.slice(sist, m.index));
    let typ: TokenTyp | null = null;
    for (let g = 1; g <= regler.grupper.length; g += 1) {
      if (m[g] !== undefined) {
        typ = regler.grupper[g - 1] ?? null;
        break;
      }
    }
    noder.push(
      <span key={`${nyckel}-t${n}`} className={TOKEN_KLASS[typ ?? "ren"]}>
        {m[0]}
      </span>,
    );
    n += 1;
    sist = m.index + m[0].length;
  }
  if (sist < kod.length) noder.push(kod.slice(sist));
  return noder;
}

// ── Inline-markdown ──────────────────────────────────────────────────────────

/** Delar raden vid markdown-konstruktioner (fångstgruppen ⇒ udda index).
 *  Understreck-kursiv kräver mellanslag i innehållet (lookahead, ES5-säkert):
 *  snake_case_namn målas ALDRIG om — CommonMarks intraword-regel för _,
 *  kraven på * behålls (intraword är tillåtet där enligt CommonMark).
 *  Stängande _ måste dessutom följas av icke-ordtecken ((?!\w)) — annars
 *  kan "_x och _" i blandade rader svälja över ett helt ordpar. */
const INLINE_MARKDOWN = /(\[[^\]\n]+\]\([^)\s]+\)|\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|`[^`\n]+`|_(?=[^_\n]* )[^_\n]+_(?!\w)|\*[^*\n]+\*)/g;

/** Helradsmönster — endast ett FULLT matchande segment är en konstruktion;
 *  ren text som råkar börja på "*" eller "[" målas aldrig om. */
const AR_LANK = /^\[[^\]\n]+\]\([^)\s]+\)$/;
const AR_FET_KURSIV = /^\*\*\*[^*\n]+\*\*\*$/;
const AR_FET = /^\*\*[^*\n]+\*\*$/;
const AR_KOD = /^`[^`\n]+`$/;
const AR_KURSIV = /^(_[^_\n]+_|\*[^*\n]+\*)$/;

/** Tillåtna href-prefix — javascript:/data: m.m. avvisas (rendras som etikett). */
const SAKER_HREF = /^(https?:\/\/|mailto:|\/|#)/i;

/** Radens inline-markdown → noder (ingen nästling — etiketter rendras rena). */
function renderaInline(text: string, nyckel: string): React.ReactNode[] {
  const ut: React.ReactNode[] = [];
  text.split(INLINE_MARKDOWN).forEach((del, i) => {
    if (!del) return;
    const nk = `${nyckel}-${i}`;
    if (AR_LANK.test(del)) {
      const etikett = del.slice(1, del.indexOf("]"));
      const href = del.slice(del.indexOf("](") + 2, -1);
      ut.push(
        SAKER_HREF.test(href) ? (
          <a
            key={nk}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-[#58A6FF] underline decoration-[#58A6FF]/40 underline-offset-2 hover:decoration-[#58A6FF]"
          >
            {etikett}
          </a>
        ) : (
          <span key={nk}>{etikett}</span>
        ),
      );
    } else if (AR_FET_KURSIV.test(del)) {
      ut.push(
        <strong key={nk} className="font-semibold text-[#E6EDF3]">
          <em>{del.slice(3, -3)}</em>
        </strong>,
      );
    } else if (AR_FET.test(del)) {
      ut.push(
        <strong key={nk} className="font-semibold text-[#E6EDF3]">
          {del.slice(2, -2)}
        </strong>,
      );
    } else if (AR_KOD.test(del)) {
      ut.push(
        <code
          key={nk}
          className="rounded border border-[#58A6FF]/25 bg-[#58A6FF]/10 px-1 py-0.5 font-mono text-[0.85em] text-[#79C0FF]"
        >
          {del.slice(1, -1)}
        </code>,
      );
    } else if (AR_KURSIV.test(del)) {
      ut.push(<em key={nk}>{del.slice(1, -1)}</em>);
    } else {
      ut.push(del);
    }
  });
  return ut;
}

// ── Kodblock (mörk yta, etikett, kopiera-knapp, horisontell scroll) ─────────

/** Kopiera-knapp — urklipp via Clipboard API med textarea-fallback (äldre
 *  webbvyer/inloggat http); återställs efter 2 s. */
function KopieraKnapp({ text }: { text: string }): React.JSX.Element {
  const [kopierat, setKopierat] = React.useState(false);
  const tidRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    const tid = tidRef;
    return () => {
      if (tid.current !== null) window.clearTimeout(tid.current);
    };
  }, []);
  const kopiera = async () => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setKopierat(true);
      if (tidRef.current !== null) window.clearTimeout(tidRef.current);
      tidRef.current = window.setTimeout(() => setKopierat(false), 2000);
    } catch {
      /* urklipp otillgängligt — knappen är en bekvämlighet, inte ett krav */
    }
  };
  return (
    <button
      type="button"
      onClick={() => void kopiera()}
      aria-label="Kopiera koden"
      className="flex shrink-0 items-center gap-1 rounded border border-[#30363D] bg-[#21262D] px-2 py-1 text-[10px] font-medium text-[#8B949E] transition-colors hover:bg-[#30363D] hover:text-[#E6EDF3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A6FF]/50"
    >
      {kopierat ? <Check className="h-3 w-3 text-[#3FB950]" /> : <Copy className="h-3 w-3" />}
      {kopierat ? "Kopierat" : "Kopiera"}
    </button>
  );
}

/** Ett ```-block: rubrikrad (etikett + kopiera) och kropp som scrollar
 *  HORISONTELLT (inline-block-kod ⇒ pre:ens scroll-yta, ingen radbrytning). */
function KodBlock({ sprak, kod }: { sprak: string; kod: string }): React.JSX.Element {
  const regler = React.useMemo(() => reglerForSprak(sprak), [sprak]);
  const markning = React.useMemo(() => markeraKod(kod, regler, "k"), [kod, regler]);
  return (
    <div className="mt-3 overflow-hidden rounded-md border border-[#30363D] bg-[#010409] first:mt-0">
      <div className="flex items-center justify-between gap-2 border-b border-[#21262D] bg-[#161B22]/60 py-1 pl-3 pr-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
          {sprak || "kod"}
        </span>
        <KopieraKnapp text={kod} />
      </div>
      <pre className="overflow-x-auto p-3 [-webkit-overflow-scrolling:touch]">
        <code className="inline-block font-mono text-xs leading-relaxed text-[#E6EDF3]">
          {markning}
        </code>
      </pre>
    </div>
  );
}

// ── Block-parser + komponent ─────────────────────────────────────────────────

/** Hel text → blocknoder. ```-stängsel delar först (udda index = kodblock —
 *  fungerar även under strömning när stängslet ännu inte kommit), sedan
 *  tolkas rader: rubriker, hr, listor (buffras per typ), stycken (buffras,
 *  radbryt ⇒ <br>). Första raden i ett block ÄR språketiketten (CommonMark
 *  info-sträng; okänd etikett visas som etikett men färgas ej). */
function byggBlock(text: string): React.ReactNode[] {
  const delar: React.ReactNode[] = [];
  const segment = text.split(/```/);
  for (let i = 0; i < segment.length; i += 1) {
    const seg = segment[i];
    if (i % 2 === 1) {
      const rader = seg.replace(/^\n/, "").split("\n");
      const forsta = (rader[0] ?? "").trim();
      const tagg = /^[a-zA-Z0-9+#._-]{1,20}$/.test(forsta) ? forsta.toLowerCase() : "";
      const kropp = (tagg ? rader.slice(1) : rader).join("\n").replace(/\n$/, "");
      delar.push(<KodBlock key={`kod-${i}`} sprak={tagg} kod={kropp} />);
      continue;
    }
    let stycke: string[] = [];
    let lista: { typ: "ul" | "ol"; rader: string[] } | null = null;
    const spolaStycke = (nk: string) => {
      if (stycke.length === 0) return;
      delar.push(
        <p key={nk} className="mt-2 leading-relaxed first:mt-0">
          {stycke.map((rad, j) => (
            <React.Fragment key={`${nk}-r${j}`}>
              {j > 0 ? <br /> : null}
              {renderaInline(rad, `${nk}-r${j}`)}
            </React.Fragment>
          ))}
        </p>,
      );
      stycke = [];
    };
    const spolaLista = (nk: string) => {
      if (!lista) return;
      const inre = lista;
      delar.push(
        inre.typ === "ol" ? (
          <ol key={nk} className="mt-2 list-decimal space-y-0.5 pl-5 marker:text-[#8B949E]">
            {inre.rader.map((rad, j) => (
              <li key={`${nk}-${j}`} className="leading-relaxed">
                {renderaInline(rad, `${nk}-${j}`)}
              </li>
            ))}
          </ol>
        ) : (
          <ul key={nk} className="mt-2 list-disc space-y-0.5 pl-5 marker:text-[#8B949E]">
            {inre.rader.map((rad, j) => (
              <li key={`${nk}-${j}`} className="leading-relaxed">
                {renderaInline(rad, `${nk}-${j}`)}
              </li>
            ))}
          </ul>
        ),
      );
      lista = null;
    };
    const rader = seg.split("\n");
    for (let j = 0; j < rader.length; j += 1) {
      const rad = rader[j].trim();
      const nk = `s${i}-r${j}`;
      if (rad === "") {
        spolaLista(`${nk}-l`);
        spolaStycke(`${nk}-p`);
        continue;
      }
      const rubrik = rad.match(/^(#{1,6})\s+(.+)$/);
      if (rubrik) {
        spolaLista(`${nk}-l`);
        spolaStycke(`${nk}-p`);
        const niva = rubrik[1].length;
        const inre = renderaInline(rubrik[2], `${nk}-h`);
        if (niva === 1) {
          delar.push(
            <h1 key={nk} className="mt-4 text-lg font-bold leading-snug text-[#E6EDF3] first:mt-0">
              {inre}
            </h1>,
          );
        } else if (niva === 2) {
          delar.push(
            <h2 key={nk} className="mt-4 text-base font-semibold leading-snug text-[#E6EDF3] first:mt-0">
              {inre}
            </h2>,
          );
        } else {
          delar.push(
            <h3 key={nk} className="mt-3 text-[15px] font-semibold leading-snug text-[#E6EDF3] first:mt-0">
              {inre}
            </h3>,
          );
        }
        continue;
      }
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(rad)) {
        spolaLista(`${nk}-l`);
        spolaStycke(`${nk}-p`);
        delar.push(<hr key={nk} className="my-3 border-[#30363D]" />);
        continue;
      }
      const punkt = rad.match(/^[-*+]\s+(.*)$/);
      const nummer = rad.match(/^\d{1,9}[.)]\s+(.*)$/);
      const listaMatch = punkt ?? nummer;
      if (listaMatch) {
        spolaStycke(`${nk}-p`);
        const typ: "ul" | "ol" = punkt ? "ul" : "ol";
        if (lista && lista.typ !== typ) spolaLista(`${nk}-l`);
        if (!lista) lista = { typ, rader: [] };
        lista.rader.push(listaMatch[1]);
        continue;
      }
      spolaLista(`${nk}-l`);
      stycke.push(rad);
    }
    spolaLista(`s${i}-sista-l`);
    spolaStycke(`s${i}-sista-p`);
  }
  return delar;
}

/** Agent-svar som renderad markdown. text="" ⇒ tom rot (ingen spökbubb[). */
export function ZcodeMarkdown({ text }: { text: string }): React.JSX.Element {
  const block = React.useMemo(() => byggBlock(text), [text]);
  return <div className="break-words text-[#E6EDF3]">{block}</div>;
}
