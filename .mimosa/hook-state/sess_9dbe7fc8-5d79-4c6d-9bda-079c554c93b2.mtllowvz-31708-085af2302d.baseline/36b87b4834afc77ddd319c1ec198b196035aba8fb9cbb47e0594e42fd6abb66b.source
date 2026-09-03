"use client";

import { useState } from "react";

/**
 * RikText — omvandlar text till visuellt engagerande innehåll automatiskt.
 * Detekterar: numrerade listor → steg-kort, procenttal → data-chips,
 * fallstudier → visuella kort, "Ex:" → exempel-boxar, långa stycken → brytare.
 */

// Detektera och rendera numrerade listor som visuella steg
function renderSteg(rader: string[], key: string) {
  return (
    <div key={key} className="mt-4 grid gap-3 sm:grid-cols-2">
      {rader.map((rad, i) => {
        const match = rad.match(/^\d+\)\s*(.+)/) || rad.match(/^\d+\.\s*(.+)/);
        if (!match) return null;
        const text = match[1];
        // Detektera fetstil i början (t.ex. "Marknadstillväxt — när...")
        const delar = text.split("—");
        const rubrik = delar[0]?.trim() || text.slice(0, 30);
        const beskrivning = delar.slice(1).join("—").trim() || text.slice(30);
        const ikoner = ["📊", "🎯", "💰", "📦", "_MIX_", "⚖️", "🔍", "📈", "🛡️", "⚡"];
        return (
          <div key={i} className="flex gap-3 rounded-xl border border-gold/20 bg-paper p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-sm">
              {ikoner[i % ikoner.length] === "_MIX_" ? "🎨" : ikoner[i % ikoner.length]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gold">{rubrik}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{beskrivning}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Detektera procenttal och siffror → highlighta
function renderMedData(text: string, key: string) {
  const delar = text.split(/(\d+(?:[.,]\d+)?\s*(?:%|MSEK|mdr|kr|msek|SEK))/g);
  return (
    <p key={key} className="text-sm leading-[1.8] text-foreground/90">
      {delar.map((d, i) => {
        if (/^\d+(?:[.,]\d+)?\s*(?:%|MSEK|mdr|kr|msek|SEK)$/.test(d)) {
          const negativ = d.trim().startsWith("-");
          return (
            <span key={i} className={`mx-0.5 inline-block rounded-md px-1.5 py-0.5 font-mono text-xs font-bold ${
              negativ ? "bg-red-100 text-red-700" : "bg-gold/15 text-gold"
            }`}>{d}</span>
          );
        }
        return d;
      })}
    </p>
  );
}

// Detektera "Ex:" → exempel-box
function renderExempel(text: string, key: string) {
  return (
    <div key={key} className="mt-3 rounded-lg border border-dashed border-gold/40 bg-gold/5 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gold">💡 Exempel</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground/90">{text.replace(/^Ex:\s*/, "")}</p>
    </div>
  );
}

// Detektera poängskalor → visuell mätare
function renderPoangSkala(rader: string[], key: string) {
  const farger = ["#b91c1c", "#d97706", "#5a5045", "#a8862a", "#047857"];
  return (
    <div key={key} className="mt-4 space-y-1.5">
      {rader.map((rad, i) => {
        const match = rad.match(/^(\d)\s*(?:KRITISK|SVAG|MEDEL|STARK|EXCEPTIONELL)?\s*(.*)/i);
        if (!match) return null;
        const poang = Number(match[1]);
        const niva = match[2] || "";
        const beskrivning = match[3] || rad;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: fargar[poang - 1] || "#5a5045" }}>{poang}</div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full" style={{ width: `${poang * 20}%`, background: fargar[poang - 1] }} />
            </div>
            <span className="w-24 shrink-0 text-right text-[10px] font-semibold" style={{ color: fargar[poang - 1] }}>
              {niva.trim()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Detektera fallstudier → visuella kort
function renderFallstudie(text: string, key: string) {
  const tickerMatch = text.match(/\(([A-Z]+[-A-Z]*)\)/);
  const ticker = tickerMatch ? tickerMatch[1] : "";
  const namn = text.split(",")[0].trim();
  return (
    <div key={key} className="mt-4 rounded-xl border-2 border-gold/30 bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="font-serif text-sm font-bold">{namn}</p>
        {ticker && <span className="rounded-full bg-gold/10 px-2 py-0.5 font-mono text-xs font-bold text-gold">{ticker}</span>}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</div>
    </div>
  );
}

/** Huvudrenderare: tar text-block och returnerar visuellt berikad JSX */
export function RikText({ text }: { text: string }) {
  const stycken = text.split(/\n\n+/);

  return (
    <div className="space-y-3">
      {stycken.map((stycke, i) => {
        const rader = stycke.split("\n").filter((r) => r.trim());

        // Numrerad lista → steg-kort
        const numrerade = rader.filter((r) => /^\d+[).]\s/.test(r.trim()));
        if (numrerade.length >= 2) {
          return renderSteg(numrerade, `steg-${i}`);
        }

        // Poängskala
        const poangRader = rader.filter((r) => /^[1-5]\s*(?:KRITISK|SVAG|MEDEL|STONG|STARK|EXCEPTIONELL)/i.test(r.trim()));
        if (poangRader.length >= 3) {
          return renderPoangSkala(poangRader, `poang-${i}`);
        }

        // "Ex:" → exempel-box
        if (stycke.trim().startsWith("Ex:")) {
          return renderExempel(stycke, `ex-${i}`);
        }

        // Enskild rad med procent → highlighta siffror
        if (/\d+(?:[.,]\d+)?\s*%/.test(stycke) || /MSEK|mdr/.test(stycke)) {
          return renderMedData(stycke, `data-${i}`);
        }

        // Fallstudie-indikatorer
        if (/Atlas Copco|Sinch|H&M|Volvo|Ericsson|HM-B|ATCO|SINCH/.test(stycke) && stycke.length > 100) {
          return renderFallstudie(stycke, `fall-${i}`);
        }

        // Långt stycke (>300 tecken) → dela med visuell brytare
        if (stycke.length > 300) {
          const mitten = Math.floor(stycke.length / 2);
          const brott = stycke.indexOf(". ", mitten);
          if (brott > 0) {
            const first = stycke.slice(0, brott + 1);
            const second = stycke.slice(brott + 2);
            return (
              <div key={i}>
                {renderMedData(first, `l-${i}`)}
                <div className="my-3 flex items-center gap-2">
                  <span className="h-px flex-1 bg-gold/20" />
                  <span className="text-gold/40">◆</span>
                  <span className="h-px flex-1 bg-gold/20" />
                </div>
                {renderMedData(second, `r-${i}`)}
              </div>
            );
          }
        }

        // Normalt stycke
        return renderMedData(stycke, `p-${i}`);
      })}
    </div>
  );
}

/** Visuell sektionseparator med ikon */
export function SektionBryt({ ikon, rubrik }: { ikon: string; rubrik: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-lg">{ikon}</div>
      <div>
        <p className="font-serif text-lg font-bold">{rubrik}</p>
        <div className="mt-1 h-0.5 w-16 rounded-full bg-gold/40" />
      </div>
      <div className="h-px flex-1 bg-gold/15" />
    </div>
  );
}
