/**
 * QR — sajtens enda QR-kodare, ren TS utan beroenden (VÅG 1a).
 *
 * Extraherad ordagrant ur src/components/ak1a/dela-kort.tsx (där den bodde
 * som lokal kopia): GF(256), Reed-Solomon, EC-nivå M, version 1–6, byte-läge
 * — räcker för URL:er upp till ~100 tecken.
 *
 * INTEGRITET: kodningen sker helt lokalt — ingen extern tjänst anropas.
 *
 * Används av: scripts/og-generate.mjs (analys-OG får QR till analys-URL)
 * och från VÅG 3 av dela-kort.tsx (qr-importer) + del-raden.
 */

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

/** Hela pipelinen: text → färdig modulmatris (mörk = true), eller null
 *  om texten är för lång för version 1–6 (EC M). */
export function qrMatris(text: string): boolean[][] | null {
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

/** Modulmatris → kompakt SVG-path (en "M…h…v…h…z" per mörk modul).
 *  x0/y0 = övre vänstra hörnet av modulområdet (den vita rutans offset
 *  ingår — tystnadszonen finns redan i marginalen runt modulerna). */
export function qrPath(matris: boolean[][], skala: number, x0: number, y0: number): string {
  const delar: string[] = [];
  for (let r = 0; r < matris.length; r++)
    for (let c = 0; c < matris.length; c++)
      if (matris[r][c])
        delar.push(
          `M${(x0 + c * skala).toFixed(1)},${(y0 + r * skala).toFixed(1)}h${skala}v${skala}h-${skala}z`
        );
  return delar.join("");
}

/** Bekvämlighets-API: text → SVG-path (mörka moduler) redo för <path d>.
 *  Returnerar null om texten är för lång (version 1–6, EC M). */
export function qrSvgPath(text: string, skala: number, x0: number, y0: number): string | null {
  const m = qrMatris(text);
  return m ? qrPath(m, skala, x0, y0) : null;
}
