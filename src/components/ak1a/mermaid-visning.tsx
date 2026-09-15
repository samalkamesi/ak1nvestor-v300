"use client";

import * as React from "react";

/**
 * MERMAID-VISNING — GAP-REGISTER POST 10 (syskon till post 23 LaTeX).
 *
 * Förenklad, lättviktig rendering av ```mermaid-kodblock i assistant-text.
 * INTE npm-mermaid (för tungt för chatt-vyn) — egna småtolkare för de tre
 * vanligaste diagramtyperna + källkods-fallback för övriga:
 *
 *   · graph/flowchart   → noder som rutor med →-pilar (CSS-grid-rader)
 *   · sequenceDiagram   → deltagare som kolumner + meddelanden som rader
 *   · pie               → etiketter + procent med CSS-cirkel (conic-gradient)
 *   · övriga (gantt …)  → källkoden i kodblock med "[Mermaid-diagram]"-etikett
 *
 * Headern är expanderbar/kollapsbar: "Visa källkod" ⇄ "Visa diagram" växlar
 * mellan renderad vy och rå mermaid-källkod. Tema: Z Code-mörkt (#0D1117,
 * #161B22, #30363D, #E6EDF3, #8B949E) — samma palett som StudioMarkdown.
 */

// ── Typer ───────────────────────────────────────────────────────────────────

type NodForm = "rut" | "diamant" | "rund" | "cirkel";

interface Nod {
  id: string;
  label: string;
  form: NodForm;
}

interface Kant {
  fran: Nod;
  till: Nod;
  etikett: string;
}

interface Deltagare {
  id: string;
  namn: string;
}

interface SekoRad {
  slag: "medd" | "not" | "grupp";
  fran?: string;
  till?: string;
  text: string;
  streckad?: boolean;
}

interface Slice {
  label: string;
  procent: number;
  start: number;
  stop: number;
}

type Diagram =
  | { typ: "flode"; riktning: string; kanter: Kant[]; losaNoder: Nod[] }
  | { typ: "seko"; deltagare: Deltagare[]; rader: SekoRad[] }
  | { typ: "pie"; rubrik: string; slices: Slice[] }
  | { typ: "annat"; namn: string };

type FlodeDiagram = Extract<Diagram, { typ: "flode" }>;
type SekoDiagram = Extract<Diagram, { typ: "seko" }>;
type PieDiagram = Extract<Diagram, { typ: "pie" }>;

// ── Hjälpare ────────────────────────────────────────────────────────────────

/** Strippa ev. ```mermaid-stängsel — tål både rå blocktext och bara kroppen. */
function rentUrStaket(text: string): string {
  return text
    .replace(/^\s*```(?:mermaid)?[^\n]*\n?/i, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}

/** Rensa nod-/etikettext: plockar bort citation- och snedstreck-inramning. */
function rensaEtikett(s: string): string {
  return s
    .replace(/^["']+/, "")
    .replace(/["']+$/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .trim();
}

const ID_RE = "[A-Za-z0-9_\\u00C0-\\u024F.-]+";

/** En mermaid-nod-token → nod; t.ex. "B{Beslut}" → diamant, "A[Start]" → ruta. */
function lasNod(token: string): Nod {
  const t = token.trim().replace(/;$/, "");
  let m: RegExpMatchArray | null;
  if ((m = t.match(new RegExp(`^(${ID_RE})\\(\\((.+)\\)\\)$`)))) {
    return { id: m[1], label: rensaEtikett(m[2]), form: "cirkel" };
  }
  if ((m = t.match(new RegExp(`^(${ID_RE})\\{(.+)\\}$`)))) {
    return { id: m[1], label: rensaEtikett(m[2]), form: "diamant" };
  }
  if ((m = t.match(new RegExp(`^(${ID_RE})\\[(.+)\\]$`)))) {
    return { id: m[1], label: rensaEtikett(m[2]), form: "rut" };
  }
  if ((m = t.match(new RegExp(`^(${ID_RE})\\((.+)\\)$`)))) {
    return { id: m[1], label: rensaEtikett(m[2]), form: "rund" };
  }
  return { id: t, label: rensaEtikett(t) || t, form: "rut" };
}

/** Pilar i flödesdiagram — längsta alternativ först (viktigt för split). */
const PIL_RE = /(-\.->|-->>|-->|->>|==>|--x|--o|---|=>|->|-x)/;

/** Pilar i sekvensdiagram (A->>B: text) — längsta alternativ först. */
const SEKO_PIL_RE = "(-\\.->|-->>|->>|-->|--x|--o|-x|->|=>|==>)";

/** Flödesrader som inte är noder eller kanter hoppas över tyst. */
const FLODE_NYCKELORD = new Set([
  "subgraph",
  "end",
  "class",
  "classdef",
  "style",
  "linkstyle",
  "click",
  "direction",
  "init",
  "start",
  "stop",
]);

// ── Tolkare ─────────────────────────────────────────────────────────────────

function lasFlode(rader: string[], riktning: string): FlodeDiagram {
  const kanter: Kant[] = [];
  const losaNoder: Nod[] = [];
  for (const rad of rader.slice(1)) {
    const stycken = rad.split(PIL_RE);
    if (stycken.length >= 3) {
      // Länkade kanter ("A --> B --> C") ger flera pil-segment på en rad.
      for (let k = 1; k + 1 < stycken.length; k += 2) {
        const franTok = stycken[k - 1].trim();
        let rest = stycken[k + 1].trim();
        let etikett = "";
        const lm = rest.match(/^\|([^|]+)\|\s*(.*)$/);
        if (lm) {
          etikett = rensaEtikett(lm[1]);
          rest = lm[2];
        }
        const tillTok = rest.trim();
        if (franTok !== "" && tillTok !== "") {
          kanter.push({ fran: lasNod(franTok), till: lasNod(tillTok), etikett });
        }
      }
    } else if (
      new RegExp(`^${ID_RE}\\s*[[{(]`).test(rad) &&
      !FLODE_NYCKELORD.has(rad.split(/\s+/)[0].toLowerCase())
    ) {
      // Fristående noddeklaration utan utgående/ingående kant.
      losaNoder.push(lasNod(rad));
    }
  }
  return { typ: "flode", riktning, kanter, losaNoder };
}

function lasSeko(rader: string[]): SekoDiagram {
  const deltagare: Deltagare[] = [];
  const ix = new Map<string, number>();
  const sakraDeltagare = (id: string, namn?: string): void => {
    const befintlig = ix.get(id);
    if (befintlig === undefined) {
      ix.set(id, deltagare.length);
      deltagare.push({ id, namn: namn && namn !== "" ? namn : id });
    } else if (namn && namn !== "") {
      deltagare[befintlig] = { id, namn };
    }
  };
  const ut: SekoRad[] = [];
  for (const rad of rader.slice(1)) {
    if (/^(autonumber|activate|deactivate)\b/i.test(rad)) continue;
    const pm = rad.match(/^(?:participant|actor)\s+(\S+)(?:\s+as\s+(.+))?$/i);
    if (pm) {
      sakraDeltagare(pm[1], pm[2]?.trim());
      continue;
    }
    const nm = rad.match(/^note\s+(?:over|left\s+of|right\s+of)\s+([^:]+?)\s*:\s*(.*)$/i);
    if (nm) {
      ut.push({ slag: "not", fran: nm[1].trim(), text: nm[2] });
      continue;
    }
    const mm = rad.match(new RegExp(`^(\\S+)\\s*${SEKO_PIL_RE}\\s*(\\S+)\\s*:\\s*(.*)$`));
    if (mm) {
      sakraDeltagare(mm[1]);
      sakraDeltagare(mm[3]);
      ut.push({
        slag: "medd",
        fran: mm[1],
        till: mm[3],
        text: mm[4].trim(),
        streckad: mm[2].startsWith("--") || mm[2].includes("."),
      });
      continue;
    }
    const gm = rad.match(/^(loop|alt|else|opt|par|and|critical|break|rect|end)\b\s*(.*)$/i);
    if (gm) {
      ut.push({ slag: "grupp", text: `${gm[1]}${gm[2] ? ` ${gm[2]}` : ""}`.trim() });
    }
  }
  return { typ: "seko", deltagare, rader: ut };
}

function lasPie(rader: string[]): PieDiagram {
  let rubrik = "";
  const raa: { label: string; varde: number }[] = [];
  for (const rad of rader.slice(1)) {
    const tm = rad.match(/^title\s+(.+)$/i);
    if (tm) {
      rubrik = tm[1].trim();
      continue;
    }
    const sm = rad.match(/^"([^"]+)"\s*:\s*([\d.,]+)\s*%?$/);
    if (sm) {
      raa.push({ label: sm[1], varde: Number(sm[2].replace(",", ".")) });
    }
  }
  // Värdena kan vara procent ELLER råa tal — normalisera mot summan.
  const summa = raa.reduce((s, x) => s + x.varde, 0);
  const slices: Slice[] = [];
  let ack = 0;
  for (const x of raa) {
    const procent = summa > 0 ? (x.varde / summa) * 100 : 0;
    slices.push({ label: x.label, procent, start: ack, stop: ack + procent });
    ack += procent;
  }
  return { typ: "pie", rubrik, slices };
}

/** Topp-tolkare: första icke-tomma raden avgör diagramtyp. */
function lasMermaid(kalla: string): Diagram {
  const rader = kalla
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r !== "" && !r.startsWith("%%"));
  const forsta = (rader[0] ?? "").toLowerCase();
  const typNamn = forsta.split(/\s+/)[0];
  if (forsta.startsWith("flowchart") || forsta.startsWith("graph")) {
    const delar = forsta.split(/\s+/);
    const riktning = /^(td|tb|bt|lr|rl)$/.test(delar[1] ?? "") ? (delar[1] ?? "TD").toUpperCase() : "TD";
    return lasFlode(rader, riktning);
  }
  if (forsta.startsWith("sequencediagram")) return lasSeko(rader);
  if (forsta.startsWith("pie")) return lasPie(rader);
  return { typ: "annat", namn: typNamn !== "" ? typNamn : "okänd" };
}

// ── Delvyer ─────────────────────────────────────────────────────────────────

function NodRuta({ nod }: { nod: Nod }): React.JSX.Element {
  const bas = "min-w-0 max-w-[16rem] rounded-md border px-2.5 py-1.5 text-center text-xs leading-snug break-words";
  const form =
    nod.form === "diamant"
      ? "border-dashed border-[#D29922]/60 bg-[#D29922]/10 text-[#E3B341]"
      : nod.form === "cirkel"
        ? "rounded-full border-[#58A6FF]/50 bg-[#58A6FF]/10 text-[#79C0FF]"
        : nod.form === "rund"
          ? "rounded-full border-[#30363D] bg-[#161B22] text-[#E6EDF3]"
          : "border-[#30363D] bg-[#161B22] text-[#E6EDF3]";
  return <div className={`${bas} ${form}`}>{nod.label}</div>;
}

function FlodeVy({ d }: { d: FlodeDiagram }): React.JSX.Element {
  if (d.kanter.length === 0 && d.losaNoder.length === 0) {
    return <p className="p-3 text-center text-xs text-[#8B949E]">(inga noder eller pilar hittades i flödet)</p>;
  }
  return (
    <div className="flex flex-col gap-2.5 p-3">
      {d.kanter.map((k, i) => (
        <div key={`k${i}`} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <div className="justify-self-end">
            <NodRuta nod={k.fran} />
          </div>
          <div className="flex max-w-[9rem] flex-col items-center gap-0.5 px-1">
            {k.etikett !== "" && (
              <span className="break-words text-center text-[10px] leading-tight text-[#8B949E]">{k.etikett}</span>
            )}
            <span aria-hidden className="text-base leading-none text-[#8B949E]">
              →
            </span>
          </div>
          <div className="justify-self-start">
            <NodRuta nod={k.till} />
          </div>
        </div>
      ))}
      {d.losaNoder.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 border-t border-[#21262D] pt-2.5">
          {d.losaNoder.map((n, i) => (
            <NodRuta key={`n${i}`} nod={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function SekoVy({ d }: { d: SekoDiagram }): React.JSX.Element {
  if (d.deltagare.length === 0) {
    return <p className="p-3 text-center text-xs text-[#8B949E]">(inga deltagare hittades)</p>;
  }
  const ix = new Map(d.deltagare.map((p, i) => [p.id, i] as const));
  const namn = (id: string | undefined): string => d.deltagare.find((p) => p.id === id)?.namn ?? id ?? "";
  const kolFler = `repeat(${d.deltagare.length}, minmax(0, 1fr))`;
  return (
    <div className="p-3">
      {/* Deltagare som kolumner … */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: kolFler }}>
        {d.deltagare.map((p) => (
          <div
            key={p.id}
            className="truncate rounded-md border border-[#30363D] bg-[#161B22] px-2 py-1.5 text-center text-xs font-medium text-[#E6EDF3]"
            title={p.namn}
          >
            {p.namn}
          </div>
        ))}
      </div>
      {/* … och meddelanden som rader mellan rätt kolumner. */}
      <div className="mt-1.5 flex flex-col gap-1">
        {d.rader.length === 0 && <p className="py-2 text-center text-xs text-[#8B949E]">(inga meddelanden)</p>}
        {d.rader.map((r, i) => {
          if (r.slag === "not") {
            return (
              <p
                key={i}
                className="mx-auto max-w-[85%] rounded border border-[#D29922]/30 bg-[#D29922]/5 px-2 py-1 text-center text-[11px] italic text-[#E3B341]"
              >
                Not {r.fran}: {r.text}
              </p>
            );
          }
          if (r.slag === "grupp") {
            return (
              <p key={i} className="text-center text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
                ── {r.text} ──
              </p>
            );
          }
          const franIx = r.fran !== undefined ? ix.get(r.fran) ?? 0 : 0;
          const tillIx = r.till !== undefined ? ix.get(r.till) ?? 0 : 0;
          const sjalv = franIx === tillIx;
          const hoger = tillIx >= franIx;
          const linje = (
            <span className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1">
              <span className="w-full break-words text-center text-[11px] leading-snug text-[#E6EDF3]">{r.text}</span>
              <span
                aria-hidden
                className={`w-full border-t ${r.streckad ? "border-dashed" : ""} border-[#8B949E]/60`}
              />
            </span>
          );
          const chip = (id: string | undefined, nyckel: string) => (
            <span
              key={nyckel}
              className="max-w-[7rem] shrink-0 truncate rounded border border-[#30363D] bg-[#161B22] px-1.5 py-0.5 font-mono text-[10px] text-[#8B949E]"
            >
              {namn(id)}
            </span>
          );
          return (
            <div key={i} className="grid items-center" style={{ gridTemplateColumns: kolFler }}>
              <div
                className="flex items-center gap-1.5 py-0.5"
                style={{ gridColumn: `${Math.min(franIx, tillIx) + 1} / ${Math.max(franIx, tillIx) + 2}` }}
              >
                {sjalv ? (
                  <>
                    {chip(r.fran, "f")}
                    <span aria-hidden className="shrink-0 text-sm leading-none text-[#8B949E]">
                      ↩
                    </span>
                    {linje}
                  </>
                ) : hoger ? (
                  <>
                    {chip(r.fran, "f")}
                    {linje}
                    <span aria-hidden className="shrink-0 text-sm leading-none text-[#8B949E]">
                      →
                    </span>
                    {chip(r.till, "t")}
                  </>
                ) : (
                  <>
                    {chip(r.till, "t")}
                    <span aria-hidden className="shrink-0 text-sm leading-none text-[#8B949E]">
                      ←
                    </span>
                    {linje}
                    {chip(r.fran, "f")}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PIE_FARGER = ["#238636", "#58A6FF", "#D29922", "#A371F7", "#F778BA", "#39C5CF", "#DB6D28", "#DA3633"];

function procentText(p: number): string {
  const av = Math.round(p * 10) / 10;
  return av % 1 === 0 ? av.toFixed(0) : av.toFixed(1);
}

function PieVy({ d }: { d: PieDiagram }): React.JSX.Element {
  if (d.slices.length === 0) {
    return <p className="p-3 text-center text-xs text-[#8B949E]">(inga tårtbitar hittades)</p>;
  }
  const gradient = d.slices
    .map((s, i) => `${PIE_FARGER[i % PIE_FARGER.length]} ${procentText(s.start)}% ${procentText(s.stop)}%`)
    .join(", ");
  return (
    <div className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:gap-6">
      <div
        className="h-28 w-28 shrink-0 rounded-full border border-[#30363D]"
        role="img"
        aria-label={`Cirkeldiagram${d.rubrik !== "" ? `: ${d.rubrik}` : ""}`}
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="w-full min-w-0">
        {d.rubrik !== "" && (
          <p className="mb-2 text-center text-xs font-medium text-[#E6EDF3] sm:text-left">{d.rubrik}</p>
        )}
        <ul className="space-y-1.5">
          {d.slices.map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: PIE_FARGER[i % PIE_FARGER.length] }}
              />
              <span className="min-w-0 flex-1 break-words text-[#E6EDF3]">{s.label}</span>
              <span className="shrink-0 font-mono text-[#8B949E]">{procentText(s.procent)} %</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AnnatVy({ namn, kalla }: { namn: string; kalla: string }): React.JSX.Element {
  return (
    <div className="p-3">
      <p className="mb-2 text-center text-[11px] leading-relaxed text-[#8B949E]">
        Förenklad visning stöder graph/flowchart, sequenceDiagram och pie —{" "}
        <span className="font-mono text-[#D29922]">{namn}</span> visas som källkod.
      </p>
      <pre className="overflow-x-auto rounded-md border border-[#21262D] bg-[#010409] p-2.5 font-mono text-xs leading-relaxed text-[#E6EDF3]">
        <code>{kalla}</code>
      </pre>
    </div>
  );
}

// ── Huvudkomponent ──────────────────────────────────────────────────────────

export function MermaidVisning({ kalla }: { kalla: string }): React.JSX.Element {
  const [visaKalla, setVisaKalla] = React.useState(false);
  const ren = React.useMemo(() => rentUrStaket(kalla), [kalla]);
  const d = React.useMemo(() => lasMermaid(ren), [ren]);
  const typEtikett =
    d.typ === "flode" ? `flowchart ${d.riktning}` : d.typ === "seko" ? "sequenceDiagram" : d.typ === "pie" ? "pie" : d.namn;
  return (
    <section className="mt-3 overflow-hidden rounded-md border border-[#30363D] bg-[#0D1117] [-webkit-overflow-scrolling:touch]">
      <header className="flex items-center justify-between gap-2 border-b border-[#21262D] bg-[#161B22] px-3 py-1.5">
        <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-[#8B949E]">
          [Mermaid-diagram] · {typEtikett}
        </span>
        <button
          type="button"
          onClick={() => setVisaKalla((v) => !v)}
          aria-expanded={visaKalla}
          className="shrink-0 rounded border border-[#30363D] bg-[#0D1117] px-2 py-0.5 text-[10px] font-medium text-[#8B949E] transition-colors hover:border-[#58A6FF]/60 hover:text-[#58A6FF]"
        >
          {visaKalla ? "Visa diagram" : "Visa källkod"}
        </button>
      </header>
      {visaKalla ? (
        <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-[#E6EDF3]">
          <code>{ren}</code>
        </pre>
      ) : (
        <div className="overflow-x-auto">
          {d.typ === "flode" ? (
            <FlodeVy d={d} />
          ) : d.typ === "seko" ? (
            <SekoVy d={d} />
          ) : d.typ === "pie" ? (
            <PieVy d={d} />
          ) : (
            <AnnatVy namn={d.namn} kalla={ren} />
          )}
        </div>
      )}
    </section>
  );
}
