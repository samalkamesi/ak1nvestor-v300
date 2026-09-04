"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { lasKlaraKurser, lasMedlem, lasStreak, niva } from "@/lib/member-local";
import { qrMatris, qrPath } from "@/lib/qr";
import { useToast } from "@/hooks/use-toast";

/**
 * DELA-KORT — elevens frivilliga sociala marknadsföring, i två lägen (VÅG 3).
 *
 * 1. ELEV-LÄGET (standard, bakåtkompatibelt): visas efter klarad kurs, på Min
 *    Sida och vid certifikatet. Genererar ett delbart kort (SVG → canvas →
 *    PNG) med elevens nivå, kurser, streak och en QR-kod till
 *    lab.ak1nvestor.com. Props: kursTitel, className — oförändrat beteende.
 * 2. ANALYS-LÄGET (optionella props titel + rubrikrader + qrUrl): delbart
 *    forskningskort för forskningsbibliotekets detaljsidor — bolag, ticker,
 *    status och AKM1-poäng + QR till analys-URL:en (ALDRIG startsidan, AC3).
 *    Ingen inloggningsvägg, ingen localStorage-läsning — öppen delning (P1:
 *    aldrig väggar på analyser). Share-texten bär disclaimer-token (AC1).
 *
 * QR-kodaren importeras från src/lib/qr.ts — sajtens enda, ren TS (VÅG 1a).
 *
 * INTEGRITET: QR-koden genereras med en INNEBOENDE encoder (byte-läge,
 * EC-nivå M) och kortet ritas i webbläsaren — ingen data skickas någonstans,
 * ingen extern tjänst anropas. Delandet är helt frivilligt (pedagogik.ts:
 * "tipsa, tvinga aldrig").
 *
 * HYDRATION-SÄKERT (elev-läget): all localStorage-läsning sker i useEffect;
 * komponenten visar en deterministisk skeleton tills hydration är klar.
 * Analys-läget är rent prop-driverat och renderas direkt (SSR-säkert).
 */

const LAB_URL = "https://lab.ak1nvestor.com";
const KORT_BREDD = 1200;
const KORT_HOJD = 630;

/* ══ Kortet — SVG (serif/marin/guld-DNA), ritas sedan till PNG i canvas ══ */

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[ch] ?? ch
  );
}

function korta(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

/** Bygger kort-SVG:n i båda lägena — samma visuella DNA (marin/guld/serif). */
function byggKortSvg(
  info:
    | {
        typ: "elev";
        namn: string;
        niva: number;
        kurser: number;
        streak: number;
        kursTitel?: string;
        datum: string;
        qr: string;
      }
    | {
        typ: "analys";
        titel: string;
        rubrikrader: string[];
        qr: string;
      }
): string {
  if (info.typ === "analys") {
    const { titel, rubrikrader, qr } = info;
    const undertitel = korta(rubrikrader[0] ?? "Automatisk forskningsöversikt", 64);
    const rader = rubrikrader.slice(1, 4);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${KORT_BREDD}" height="${KORT_HOJD}" viewBox="0 0 ${KORT_BREDD} ${KORT_HOJD}">
<defs>
<linearGradient id="marin" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#0E1B2E"/>
<stop offset="1" stop-color="#081120"/>
</linearGradient>
</defs>
<rect width="${KORT_BREDD}" height="${KORT_HOJD}" fill="url(#marin)"/>
<rect x="16" y="16" width="${KORT_BREDD - 32}" height="${KORT_HOJD - 32}" rx="20" fill="none" stroke="#E8C766" stroke-opacity="0.45" stroke-width="1.5"/>
<text x="600" y="450" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="340" font-weight="bold" fill="#EDE6D6" fill-opacity="0.04">AK1A</text>
<text x="64" y="80" font-family="Georgia, 'Times New Roman', serif" font-size="19" font-weight="bold" letter-spacing="7" fill="#E8C766">AK1A RESEARCH LAB</text>
<rect x="64" y="94" width="110" height="3" rx="1.5" fill="#E8C766" fill-opacity="0.85"/>
<text x="1136" y="80" text-anchor="end" font-family="Georgia, 'Times New Roman', serif" font-size="15" letter-spacing="4" fill="#EDE6D6" fill-opacity="0.6">FORSKNINGSBIBLIOTEKET</text>
<text x="64" y="188" font-family="Georgia, 'Times New Roman', serif" font-size="58" font-weight="bold" fill="#F2EDE0">${escapeXml(korta(titel, 26))}</text>
<text x="64" y="234" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-style="italic" fill="#E8C766">${escapeXml(undertitel)}</text>
${rader
  .map(
    (rad, i) =>
      `<text x="64" y="${370 + i * 32}" font-family="Verdana, Geneva, sans-serif" font-size="19" fill="#EDE6D6" fill-opacity="0.85">${escapeXml(korta(rad, 62))}</text>`
  )
  .join("\n")}
<rect x="64" y="462" width="560" height="1.5" fill="#E8C766" fill-opacity="0.3"/>
<text x="64" y="510" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-style="italic" fill="#EDE6D6" fill-opacity="0.85">Fri kunskap bygger frihet — tack för att du investerar i dig själv.</text>
<text x="64" y="580" font-family="Verdana, Geneva, sans-serif" font-size="14" fill="#EDE6D6" fill-opacity="0.55">Forskningsunderlag — pedagogisk analys, inte investeringsråd.</text>
<rect x="928" y="120" width="208" height="208" rx="14" fill="#FFFFFF"/>
<path d="${qr}" fill="#0E1B2E"/>
<text x="1032" y="360" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" fill="#E8C766">Skanna — läs forskningen</text>
<text x="1032" y="386" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-size="13" fill="#EDE6D6" fill-opacity="0.7">lab.ak1nvestor.com</text>
</svg>`;
  }

  const { namn, niva, kurser, streak, kursTitel, datum, qr } = info;
  const undertitel = kursTitel
    ? `Klarade just: ${korta(kursTitel, 44)}`
    : "Bygger framtida fundamentalanalytiker — ett kapitel i taget";

  const statist = [
    { varde: String(niva), etikett: "NIVÅ (AV 100)", x: 64 },
    { varde: String(kurser), etikett: "KURSER KLARADE", x: 350 },
    { varde: String(streak), etikett: "DAGAR I RAD", x: 636 },
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${KORT_BREDD}" height="${KORT_HOJD}" viewBox="0 0 ${KORT_BREDD} ${KORT_HOJD}">
<defs>
<linearGradient id="marin" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#0E1B2E"/>
<stop offset="1" stop-color="#081120"/>
</linearGradient>
</defs>
<rect width="${KORT_BREDD}" height="${KORT_HOJD}" fill="url(#marin)"/>
<rect x="16" y="16" width="${KORT_BREDD - 32}" height="${KORT_HOJD - 32}" rx="20" fill="none" stroke="#E8C766" stroke-opacity="0.45" stroke-width="1.5"/>
<text x="600" y="450" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="340" font-weight="bold" fill="#EDE6D6" fill-opacity="0.04">AK1A</text>
<text x="64" y="80" font-family="Georgia, 'Times New Roman', serif" font-size="19" font-weight="bold" letter-spacing="7" fill="#E8C766">AK1A RESEARCH LAB</text>
<rect x="64" y="94" width="110" height="3" rx="1.5" fill="#E8C766" fill-opacity="0.85"/>
<text x="1136" y="80" text-anchor="end" font-family="Georgia, 'Times New Roman', serif" font-size="15" letter-spacing="4" fill="#EDE6D6" fill-opacity="0.6">MIN UTVECKLING</text>
<text x="64" y="188" font-family="Georgia, 'Times New Roman', serif" font-size="58" font-weight="bold" fill="#F2EDE0">${escapeXml(korta(namn, 24))}</text>
<text x="64" y="234" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-style="italic" fill="#E8C766">${escapeXml(undertitel)}</text>
${statist
  .map(
    (s) => `<text x="${s.x}" y="392" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="bold" fill="#E8C766">${s.varde}</text>
<text x="${s.x}" y="424" font-family="Verdana, Geneva, sans-serif" font-size="14" letter-spacing="2.5" fill="#EDE6D6" fill-opacity="0.75">${s.etikett}</text>`
  )
  .join("\n")}
<rect x="64" y="462" width="560" height="1.5" fill="#E8C766" fill-opacity="0.3"/>
<text x="64" y="510" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-style="italic" fill="#EDE6D6" fill-opacity="0.85">Fri kunskap bygger frihet — tack för att du investerar i dig själv.</text>
<text x="64" y="580" font-family="Verdana, Geneva, sans-serif" font-size="14" fill="#EDE6D6" fill-opacity="0.55">${escapeXml(datum)} · Fas 1 — hela biblioteket gratis, för alltid</text>
<rect x="928" y="120" width="208" height="208" rx="14" fill="#FFFFFF"/>
<path d="${qr}" fill="#0E1B2E"/>
<text x="1032" y="360" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" fill="#E8C766">Skanna — gå med gratis</text>
<text x="1032" y="386" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-size="13" fill="#EDE6D6" fill-opacity="0.7">lab.ak1nvestor.com</text>
</svg>`;
}

/** SVG-sträng → PNG-blob via canvas (allt lokalt — blob-URL, ingen nättrafik). */
async function svgTillPng(svg: string): Promise<Blob> {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((los, avvis) => {
      img.onload = () => los();
      img.onerror = () => avvis(new Error("SVG kunde inte ritas"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = KORT_BREDD;
    canvas.height = KORT_HOJD;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas saknas");
    ctx.drawImage(img, 0, 0, KORT_BREDD, KORT_HOJD);
    return await new Promise<Blob>((los, avvis) =>
      canvas.toBlob((b) => (b ? los(b) : avvis(new Error("PNG kunde inte skapas"))), "image/png")
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** navigator.canShare saknas i äldre TS-dom-typer — typa försiktigt. */
type DelbarNavigator = Navigator & {
  canShare?: (data: { files?: File[] }) => boolean;
};

export function DelaKort({
  kursTitel,
  className = "",
  titel,
  rubrikrader,
  qrUrl,
}: {
  kursTitel?: string;
  className?: string;
  /** Analys-läget: kortets huvudrubrik (t.ex. bolagsnamnet). */
  titel?: string;
  /** Analys-läget: underrader — första raden blir undertitel, resten rader. */
  rubrikrader?: string[];
  /** Analys-läget: QR-målet (analys-URL:en) — annars pekar QR på startsidan. */
  qrUrl?: string;
}) {
  // Analys-läget aktiveras av titel-propen; elev-läget är precis som före.
  const arAnalys = Boolean(titel);
  const [hydrerad, setHydrerad] = useState(false);
  const [medlem, setMedlem] = useState<{ email: string; namn?: string } | null>(null);
  const [nivaVarde, setNivaVarde] = useState(1);
  const [kurser, setKurser] = useState(0);
  const [streak, setStreak] = useState(0);
  const [laddar, setLaddar] = useState(false);
  const [delar, setDelar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHydrerad(true);
    if (arAnalys) return; // analys-läget läser ALDRIG localStorage (öppet innehåll)
    setMedlem(lasMedlem());
    setNivaVarde(niva());
    setKurser(lasKlaraKurser().length);
    setStreak(lasStreak().antal);
  }, [arAnalys]);

  // QR-koden är deterministisk för fast URL — räkna en gång per session.
  // Skalan garanterar ≥4 modulers tystnadszon på var sida om modulerna
  // (den vita rutans marginal) — krav för robust skanning.
  const qr = useMemo(() => {
    // Analys-läget: QR till ANALYS-URL:en, aldrig startsidan (AC3).
    const mal = arAnalys && qrUrl ? qrUrl : LAB_URL;
    const matris = qrMatris(mal);
    if (!matris) return "";
    const n = matris.length;
    const ruta = 208; // vit kvadratens sida (placeras i byggKortSvg)
    const skala = Math.floor(ruta / (n + 8));
    const marginal = (ruta - n * skala) / 2;
    return qrPath(matris, skala, 928 + marginal, 120 + marginal);
  }, [arAnalys, qrUrl]);

  const namn = medlem?.namn || (medlem ? medlem.email.split("@")[0] : "AK1A-elev");
  const datum = new Date().toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const svg = useMemo(
    () =>
      arAnalys && titel
        ? byggKortSvg({ typ: "analys", titel, rubrikrader: rubrikrader ?? [], qr })
        : hydrerad
          ? byggKortSvg({ typ: "elev", namn, niva: nivaVarde, kurser, streak, kursTitel, datum, qr })
          : "",
    [arAnalys, titel, rubrikrader, qr, hydrerad, namn, nivaVarde, kurser, streak, kursTitel, datum]
  );

  async function laddaNer() {
    if (laddar || !svg) return;
    setLaddar(true);
    try {
      const png = await svgTillPng(svg);
      const url = URL.createObjectURL(png);
      const a = document.createElement("a");
      a.href = url;
      a.download = arAnalys
        ? "ak1a-forskningskort.png"
        : `ak1a-niva${nivaVarde}-${kurser}-kurser.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast({ title: "Kortet sparat", description: "Dela det där du vill — du bestämmer." });
    } catch {
      toast({
        title: "Kunde inte skapa bilden",
        description: "Testa igen — allt sker lokalt i din webbläsare.",
      });
    } finally {
      setLaddar(false);
    }
  }

  async function dela() {
    if (delar || !svg) return;
    setDelar(true);
    try {
      // Analys-läge: disclaimer-token i texten (AC1) + analys-URL:en.
      const text = arAnalys
        ? `🔬 ${titel} — AK1A Research Lab\n${(rubrikrader ?? []).join("\n")}\nPedagogisk analys — inte investeringsråd.\n${qrUrl || LAB_URL}`
        : `🔬 ${namn} — AK1A Research Lab\nNivå ${nivaVarde}/100 · ${kurser} kurser klarade · ${streak} dagar i rad\nGå med gratis: ${LAB_URL}`;
      const png = await svgTillPng(svg);
      const fil = new File([png], "ak1a-delkort.png", { type: "image/png" });
      const nav = navigator as DelbarNavigator;
      if (navigator.share && nav.canShare?.({ files: [fil] })) {
        await navigator.share({ title: arAnalys ? "AK1A-forskning" : "Min utveckling på AK1A", text, files: [fil] });
      } else if (navigator.share) {
        await navigator.share({ title: arAnalys ? "AK1A-forskning" : "Min utveckling på AK1A", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Kopierat till urklipp",
          description: "Klistra in där du vill — bilden laddar du ner bredvid.",
        });
      }
    } catch {
      // Användaren avbröt delningen — inget att rapportera.
    } finally {
      setDelar(false);
    }
  }

  // ── Skeleton under hydrering (deterministisk på server + klient) ──
  if (!arAnalys && !hydrerad) {
    return (
      <div
        className={`rounded-3xl border border-gold/20 bg-card p-6 ${className}`}
        aria-hidden="true"
      >
        <div className="h-6 w-48 animate-pulse rounded bg-gold/10" />
        <div className="mt-4 aspect-[1200/630] w-full animate-pulse rounded-2xl bg-gold/10" />
      </div>
    );
  }

  // ── Ej inloggad (elev-läget) — samma inbjudande ton, aldrig en vägg ──
  if (!arAnalys && !medlem) {
    return (
      <section
        aria-labelledby="dela-kort-rubrik"
        className={`rounded-3xl border-2 border-gold/30 bg-card p-8 text-center ${className}`}
      >
        <p className="text-4xl" aria-hidden="true">
          🔬
        </p>
        <h3 id="dela-kort-rubrik" className="mt-3 font-serif text-2xl font-bold">
          Dela din utveckling
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Gå med gratis och klara din första kurs — sedan väntar ett delbart kort
          på din resa. Helt frivilligt, självklart.
        </p>
        <Link
          href="/logga-in"
          className="btn-marin mt-6 inline-flex min-h-[44px] items-center px-6 py-3 text-sm"
        >
          Gå med gratis — det tar 30 sekunder
        </Link>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="dela-kort-rubrik"
      className={`rounded-3xl border-2 border-gold/30 bg-card p-6 sm:p-8 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
            {arAnalys ? "Forskningen — öppen att dela" : "Ditt ögonblick — ditt val"}
          </p>
          <h3 id="dela-kort-rubrik" className="mt-2 font-serif text-2xl font-bold">
            {arAnalys ? "Dela forskningen" : "Dela din utveckling"}
          </h3>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            {arAnalys
              ? "Ett kort av forskningsöversikten — med en QR-kod direkt till analysen. Helt frivilligt."
              : "Ett kort av din resa: nivå, kurser och streak — med en QR-kod till labbet. Helt frivilligt."}
          </p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold/50 text-xl"
          aria-hidden="true"
        >
          🔬
        </div>
      </div>

      {/* Kortet — SVG:n är exakt den som exporteras till PNG */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-gold/30 shadow-xl [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <button
          onClick={laddaNer}
          disabled={laddar}
          className="btn-guld-signatur inline-flex min-h-[44px] items-center gap-2 px-6 py-3 text-sm disabled:opacity-60"
        >
          {laddar ? "Ritar kortet…" : "Ladda ner bild"}
        </button>
        <button
          onClick={dela}
          disabled={delar}
          className="btn-marin inline-flex min-h-[44px] items-center gap-2 px-6 py-3 text-sm disabled:opacity-60"
        >
          {delar ? "Förbereder…" : "Dela"}
        </button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        🔒 Kortet ritas i din webbläsare — ingen data skickas någonstans. Du
        delar det endast om du själv vill.
      </p>
    </section>
  );
}
