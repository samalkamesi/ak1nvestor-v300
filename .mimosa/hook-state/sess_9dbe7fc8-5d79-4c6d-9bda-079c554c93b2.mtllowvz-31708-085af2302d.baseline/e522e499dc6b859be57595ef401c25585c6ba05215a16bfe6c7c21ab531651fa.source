"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { lasKlaraKurser, lasMedlem, lasStreak, niva } from "@/lib/member-local";
import { useToast } from "@/hooks/use-toast";

/**
 * DELA-KORT — elevens frivilliga sociala marknadsföring.
 *
 * Visas efter klarad kurs, på Min Sida och vid certifikatet. Genererar ett
 * delbart kort (SVG → canvas → PNG) med elevens nivå, kurser, streak och
 * en QR-kod till lab.ak1nvestor.com.
 *
 * INTEGRITET: QR-koden genereras med en INNEBOENDE encoder (byte-läge,
 * EC-nivå M) och kortet ritas i webbläsaren — ingen data skickas någonstans,
 * ingen extern tjänst anropas. Delandet är helt frivilligt (pedagogik.ts:
 * "tipsa, tvinga aldrig").
 *
 * HYDRATION-SÄKERT: all localStorage-läsning sker i useEffect; komponenten
 * visar en deterministisk skeleton tills hydration är klar.
 */

const LAB_URL = "https://lab.ak1nvestor.com";
const KORT_BREDD = 1200;
const KORT_HOJD = 630;

/* ══ Lokal QR-kodare — GF(256), Reed-Solomon, EC-nivå M, version 1–6 ══
 * Räcker för URL:er upp till ~100 tecken. Standarden följ rakt av:
 * sökare/timing/alignering → data i sicksack → 8 masker → straffpoäng. */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGf() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d; // primpolynom för QR: x^8+x^4+x^3+x^2+1
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/** Generatorpolynom (högsta grad först) för `grad` felkorrigeringsord. */
function rsGenerator(grad: number): number[] {
  let poly = [1];
  for (let i = 0; i < grad; i++) {
    const nast = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      nast[j] ^= poly[j]; // * x
      nast[j + 1] ^= gfMul(poly[j], GF_EXP[i]); // * α^i
    }
    poly = nast;
  }
  return poly;
}

/** Reed-Solomon-resten (felkorrigeringsorden) för ett datablock. */
function rsRest(data: number[], ecLangd: number): number[] {
  const gen = rsGenerator(ecLangd);
  const rest = new Array<number>(ecLangd).fill(0);
  for (const byte of data) {
    const faktor = byte ^ rest[0];
    for (let i = 0; i < ecLangd - 1; i++) rest[i] = rest[i + 1];
    rest[ecLangd - 1] = 0;
    if (faktor !== 0) {
      for (let i = 0; i < ecLangd; i++) rest[i] ^= gfMul(gen[i + 1], faktor);
    }
  }
  return rest;
}

/** EC-nivå M per version (1–6): felord per block, dataord per block, blockantal. */
const QR_VERSION_M = [
  { ec: 10, block: 16, antal: 1 },
  { ec: 16, block: 28, antal: 1 },
  { ec: 26, block: 44, antal: 1 },
  { ec: 18, block: 32, antal: 2 },
  { ec: 24, block: 43, antal: 2 },
  { ec: 16, block: 27, antal: 4 },
];
const QR_ALIGN: number[][] = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];

/** Kodar texten till dataord (byte-läge, terminator, pad-byte) — eller null
 *  om texten inte får plats i version 1–6. */
function qrDataord(text: string, version: number): number[] | null {
  const { block, antal } = QR_VERSION_M[version - 1];
  const dataKap = block * antal;
  const bytes = Array.from(new TextEncoder().encode(text));
  const behovBits = 4 + 8 + bytes.length * 8; // läge + räknare (8 bitar, v1–9) + data
  if (behovBits > dataKap * 8) return null;

  const bits: number[] = [];
  const push = (val: number, antalBitar: number) => {
    for (let i = antalBitar - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  push(4, 4); // byte-läge
  push(bytes.length, 8);
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, dataKap * 8 - bits.length)); // terminator
  while (bits.length % 8 !== 0) bits.push(0);

  const ord: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
    ord.push(v);
  }
  let padByte = true;
  while (ord.length < dataKap) {
    ord.push(padByte ? 0xec : 0x11);
    padByte = !padByte;
  }
  return ord;
}

const MASKER: Array<(r: number, c: number) => boolean> = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

/** Straffpoäng enligt spec (N1 serier, N2 2×2, N3 sökarmönster, N4 balans). */
function qrStraff(m: boolean[][]): number {
  const n = m.length;
  let p = 0;
  for (let a = 0; a < n; a++) {
    for (let riktning = 0; riktning < 2; riktning++) {
      let run = 1;
      for (let b = 1; b < n; b++) {
        const nu = riktning === 0 ? m[a][b] : m[b][a];
        const fo = riktning === 0 ? m[a][b - 1] : m[b - 1][a];
        if (nu === fo) {
          run++;
          if (run === 5) p += 3;
          else if (run > 5) p += 1;
        } else run = 1;
      }
    }
  }
  for (let r = 0; r < n - 1; r++)
    for (let c = 0; c < n - 1; c++) {
      const v = m[r][c];
      if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) p += 3;
    }
  const monster = [true, false, true, true, true, false, true, false, false, false, false];
  const spegel = [...monster].reverse();
  for (let r = 0; r < n; r++)
    for (let c = 0; c + 10 < n; c++) {
      let a = true;
      let b = true;
      for (let k = 0; k < 11; k++) {
        if (m[r][c + k] !== monster[k]) a = false;
        if (m[r][c + k] !== spegel[k]) b = false;
      }
      if (a || b) p += 40;
    }
  for (let c = 0; c < n; c++)
    for (let r = 0; r + 10 < n; r++) {
      let a = true;
      let b = true;
      for (let k = 0; k < 11; k++) {
        if (m[r + k][c] !== monster[k]) a = false;
        if (m[r + k][c] !== spegel[k]) b = false;
      }
      if (a || b) p += 40;
    }
  let morka = 0;
  for (const rad of m) for (const v of rad) if (v) morka++;
  p += Math.floor(Math.abs((morka * 100) / (n * n) - 50) / 5) * 10;
  return p;
}

/** Skriver formatinformation (EC M + mask) runt sökarna — BCH + XOR 0x5412.
 *  Index m[rad][kolumn]; båda kopior hoppar över rad/kolumn 6 (timing). */
function qrFormat(m: boolean[][], size: number, mask: number) {
  const data = (0 << 3) | mask; // EC-nivå M = 0b00
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const bit = (i: number) => ((bits >>> i) & 1) !== 0;
  // Vertikal kopia (kol 8): bit 0–5 → rad 0–5, bit 6–7 → rad 7–8,
  // bit 8–14 → rad size-7 … size-1
  for (let i = 0; i <= 5; i++) m[i][8] = bit(i);
  m[7][8] = bit(6);
  m[8][8] = bit(7);
  for (let i = 8; i < 15; i++) m[size - 15 + i][8] = bit(i);
  // Horisontell kopia (rad 8): bit 0–7 → kol size-1 … size-8,
  // bit 8 → kol 7, bit 9–14 → kol 5 … 0
  for (let i = 0; i < 8; i++) m[8][size - 1 - i] = bit(i);
  m[8][7] = bit(8);
  for (let i = 9; i < 15; i++) m[8][14 - i] = bit(i);
  m[size - 8][8] = true; // mörka modulen — alltid ett
}

/** Hela pipelinen: text → färdig modulmatris (mörk = true), eller null. */
function qrModuler(text: string): boolean[][] | null {
  let version = 0;
  let ord: number[] | null = null;
  for (let v = 1; v <= 6; v++) {
    ord = qrDataord(text, v);
    if (ord) {
      version = v;
      break;
    }
  }
  if (!ord || !version) return null;

  const { ec, block, antal } = QR_VERSION_M[version - 1];
  // Blockindelning + interleaving av data- och felord
  const blockar: number[][] = [];
  for (let b = 0; b < antal; b++) blockar.push(ord.slice(b * block, (b + 1) * block));
  const ecBlock = blockar.map((bl) => rsRest(bl, ec));
  const kodord: number[] = [];
  for (let i = 0; i < block; i++) for (const bl of blockar) kodord.push(bl[i]);
  for (let i = 0; i < ec; i++) for (const bl of ecBlock) kodord.push(bl[i]);

  const size = 17 + 4 * version;
  const mods: (boolean | null)[][] = Array.from({ length: size }, () =>
    new Array<boolean | null>(size).fill(null)
  );
  const funk = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (r: number, c: number, v: boolean) => {
    mods[r][c] = v;
    funk[r][c] = true;
  };

  // Sökare (7×7) + separatorer i tre hörn
  const sokare = (rad: number, kol: number) => {
    for (let dr = -1; dr <= 7; dr++)
      for (let dc = -1; dc <= 7; dc++) {
        const r = rad + dr;
        const c = kol + dc;
        if (r < 0 || r >= size || c < 0 || c >= size) continue;
        const mork =
          dr >= 0 &&
          dr <= 6 &&
          dc >= 0 &&
          dc <= 6 &&
          (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
        set(r, c, mork);
      }
  };
  sokare(0, 0);
  sokare(0, size - 7);
  sokare(size - 7, 0);

  // Timing — alternerande, mörkt på jämna index
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }

  // Aligneringsmönster (5×5) där de inte krockar med sökare
  for (const r of QR_ALIGN[version - 1])
    for (const c of QR_ALIGN[version - 1]) {
      if (funk[r][c]) continue;
      for (let dr = -2; dr <= 2; dr++)
        for (let dc = -2; dc <= 2; dc++)
          set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }

  // Reservera formatytor + mörka modulen före dataplacering.
  // Rad 8 kol {0–5, 7, 8} + {size-8 … size-1}; kol 8 rad {0–5, 7, 8} +
  // {size-8 … size-1}. OBS: (8,6) är DATA — inget formatområde.
  for (let i = 0; i <= 5; i++) funk[8][i] = true;
  funk[8][7] = true;
  funk[8][8] = true;
  funk[7][8] = true;
  for (let i = 0; i <= 5; i++) funk[i][8] = true;
  for (let i = 0; i < 8; i++) funk[8][size - 1 - i] = true;
  for (let i = 0; i < 8; i++) funk[size - 1 - i][8] = true;

  // Data i sicksack — kolumnpar åt vänster, timingkolumnen (6) hoppas över
  const totalBits = kodord.length * 8;
  const bit = (i: number) =>
    i < totalBits ? ((kodord[i >> 3] >> (7 - (i & 7))) & 1) === 1 : false;
  let idx = 0;
  for (let hoger = size - 1; hoger >= 1; hoger -= 2) {
    if (hoger === 6) hoger = 5;
    const upp = ((hoger + 1) & 2) === 0;
    for (let vert = 0; vert < size; vert++) {
      const rad = upp ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j++) {
        const kol = hoger - j;
        if (funk[rad][kol]) continue;
        mods[rad][kol] = bit(idx);
        idx++;
      }
    }
  }

  // Prova alla 8 masker (endast icke-funktionsmoduler) — behåll bästa poäng
  let basta: boolean[][] | null = null;
  let bastPoang = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const kopia = mods.map((rad) => rad.map((v) => v === true));
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (!funk[r][c] && MASKER[mask](r, c)) kopia[r][c] = !kopia[r][c];
    qrFormat(kopia, size, mask);
    const poang = qrStraff(kopia);
    if (poang < bastPoang) {
      bastPoang = poang;
      basta = kopia;
    }
  }
  return basta;
}

/** Modulmatris → kompakt SVG-path (en "M…h…v…h…z" per mörk modul). */
/** Modulmatris → kompakt SVG-path (en "M…h…v…h…z" per mörk modul).
 *  x0/y0 = övre vänstra hörnet av modulområdet (den vita rutans offset
 *  ingår — tystnadszonen finns redan i marginalen runt modulerna). */
function qrPath(matris: boolean[][], skala: number, x0: number, y0: number): string {
  const delar: string[] = [];
  for (let r = 0; r < matris.length; r++)
    for (let c = 0; c < matris.length; c++)
      if (matris[r][c])
        delar.push(
          `M${(x0 + c * skala).toFixed(1)},${(y0 + r * skala).toFixed(1)}h${skala}v${skala}h-${skala}z`
        );
  return delar.join("");
}

/* ══ Kortet — SVG (serif/marin/guld-DNA), ritas sedan till PNG i canvas ══ */

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[ch] ?? ch
  );
}

function korta(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

function byggKortSvg(info: {
  namn: string;
  niva: number;
  kurser: number;
  streak: number;
  kursTitel?: string;
  datum: string;
  qr: string;
}): string {
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
}: {
  kursTitel?: string;
  className?: string;
}) {
  const [hydrerad, setHydrerad] = useState(false);
  const [medlem, setMedlem] = useState<{ email: string; namn?: string } | null>(null);
  const [nivaVarde, setNivaVarde] = useState(1);
  const [kurser, setKurser] = useState(0);
  const [streak, setStreak] = useState(0);
  const [laddar, setLaddar] = useState(false);
  const [delar, setDelar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMedlem(lasMedlem());
    setNivaVarde(niva());
    setKurser(lasKlaraKurser().length);
    setStreak(lasStreak().antal);
    setHydrerad(true);
  }, []);

  // QR-koden är deterministisk för fast URL — räkna en gång per session.
  // Skalan garanterar ≥4 modulers tystnadszon på var sida om modulerna
  // (den vita rutans marginal) — krav för robust skanning.
  const qr = useMemo(() => {
    const matris = qrModuler(LAB_URL);
    if (!matris) return "";
    const n = matris.length;
    const ruta = 208; // vit kvadratens sida (placeras i byggKortSvg)
    const skala = Math.floor(ruta / (n + 8));
    const marginal = (ruta - n * skala) / 2;
    return qrPath(matris, skala, 928 + marginal, 120 + marginal);
  }, []);

  const namn = medlem?.namn || (medlem ? medlem.email.split("@")[0] : "AK1A-elev");
  const datum = new Date().toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const svg = useMemo(
    () =>
      hydrerad
        ? byggKortSvg({ namn, niva: nivaVarde, kurser, streak, kursTitel, datum, qr })
        : "",
    [hydrerad, namn, nivaVarde, kurser, streak, kursTitel, datum, qr]
  );

  async function laddaNer() {
    if (laddar || !svg) return;
    setLaddar(true);
    try {
      const png = await svgTillPng(svg);
      const url = URL.createObjectURL(png);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ak1a-niva${nivaVarde}-${kurser}-kurser.png`;
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
      const text = `🔬 ${namn} — AK1A Research Lab\nNivå ${nivaVarde}/100 · ${kurser} kurser klarade · ${streak} dagar i rad\nGå med gratis: ${LAB_URL}`;
      const png = await svgTillPng(svg);
      const fil = new File([png], "ak1a-delkort.png", { type: "image/png" });
      const nav = navigator as DelbarNavigator;
      if (navigator.share && nav.canShare?.({ files: [fil] })) {
        await navigator.share({ title: "Min utveckling på AK1A", text, files: [fil] });
      } else if (navigator.share) {
        await navigator.share({ title: "Min utveckling på AK1A", text });
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
  if (!hydrerad) {
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

  // ── Ej inloggad — samma inbjudande ton, aldrig en vägg ──
  if (!medlem) {
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
            Ditt ögonblick — ditt val
          </p>
          <h3 id="dela-kort-rubrik" className="mt-2 font-serif text-2xl font-bold">
            Dela din utveckling
          </h3>
          <p className="mt-1 max-w-lg text-sm text-muted-foreground">
            Ett kort av din resa: nivå, kurser och streak — med en QR-kod till
            labbet. Helt frivilligt.
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
