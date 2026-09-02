/**
 * VÅGKON — den deterministiska framtidsgrafen (forskning-visualisering §2 + № 1).
 *
 * En vågkon (fan chart) ritar, från historikens sista värde S₀, percentilband
 * som breddas ∝ √t: osäkerheten växer med roten av horisonten därför att
 * slumpvandringens varians ackumuleras linjärt i tid. Matematiken är central-
 * bankspraxis (Bank of England/Riksbank-fan charts, se forskningsrapporten)
 * i sin enklaste form — ren lognormal referens utan drift:
 *
 *   S_p(t) = S₀ · exp(z_p · σ · √t)        (μ = 0 — "ren referens")
 *
 * där σ = standardavvikelsen hos historikens LOGARITMISKA returer (ett steg
 * = historikens egen kadens: en månad för månadskurser, ett år för årsserier)
 * och z_p är normalfördelningens kvantil: z(P10) ≈ −1.28, z(P90) ≈ +1.28.
 * Medianen (P50, z = 0) blir därmed en platt bana på S₀ — inget mål, ett
 * mittpåstående (P8: band, aldrig pil).
 *
 * DETERMINISTISKT: ren matematik, ingen slump, inga globaler, inga datum.
 * Samma indata → bitidentisk utdata, i alla körningar och miljöer.
 */

/** AK1TS-horisonterna (samma nycklar som analys-motorn — oberoende deklarerade
 *  här så att vagkon.ts förblir ren och klientside-säker utan motorns imports). */
export const VAGKON_HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"] as const;
export type VagkonHorisont = (typeof VAGKON_HORIZONTER)[number];

/**
 * Antal steg framåt per horisont. Stegets enhet är historikens egen kadens:
 * för månadspriser (API: range=2y&interval=1mo) är mega = 48 steg ≈ 4 år,
 * mikro = 3 steg ≈ ett kvartal; för en årlig fundamental serie är stegen år.
 * Fast skalning — inte beroende av kalenderdatum — håller konen deterministisk.
 */
export const VAGKON_STEG: Readonly<Record<VagkonHorisont, number>> = {
  mikro: 3,
  kort: 6,
  medellang: 12,
  lang: 24,
  mega: 48,
};

/** Svenska visningsnamn i kanonisk ordning (mikro → mega). */
export const VAGKON_HORIZONNAMN: Readonly<Record<VagkonHorisont, string>> = {
  mikro: "Mikro",
  kort: "Kort",
  medellang: "Medellång",
  lang: "Lång",
  mega: "Mega",
};

/** Normalfördelningskvantiler: Φ⁻¹(0.10) ≈ −1.2816, Φ⁻¹(0.90) ≈ +1.2816. */
export const VAGKON_Z: Readonly<{ p10: number; p90: number }> = {
  p10: -1.2815515655446004,
  p90: 1.2815515655446004,
};

/** En horisonts kon-data: banor för t = 1..steg plus slutvärden för snabb läsning. */
export type VagkonHorisontData = {
  /** Svenskt visningsnamn ("Mikro", …, "Mega"). */
  namn: string;
  /** Antal steg framåt som horisonten motsvarar. */
  steg: number;
  /** Median-bana t = 1..steg. μ = 0 ⇒ samtliga värden = S₀ (platt referens). */
  median: number[];
  /** Undre bandgräns P10 per steg: S₀ · exp(z₁₀ · σ · √t). */
  p10: number[];
  /** Övre bandgräns P90 per steg: S₀ · exp(z₉₀ · σ · √t). */
  p90: number[];
  /** Sluvärden (banornas sista element) — för etiketter och tabeller. */
  medianSlut: number;
  p10Slut: number;
  p90Slut: number;
};

/** Hela vågkonens data — allt som behövs för att rita historik + kon. */
export type VagkonData = {
  /** S₀ — historikens senaste värde, konens startpunkt. */
  senaste: number;
  /** Historikens längd efter rensning av icke-tal. */
  n: number;
  /** σ per steg: standardavvikelsen (sampel, n−1) hos historikens log-returer.
   *  null när historiken är för kort för att skatta spridningen. */
  sigma: number | null;
  /** Antal log-returer som σ beräknades ur. */
  nRetur: number;
  /** true när konen ej kan beräknas (färre än 3 punkter eller 2 returer). */
  otillracklig: boolean;
  /** Per horisont — endast begärda horisonter finns som nycklar. */
  horisonter: Partial<Record<VagkonHorisont, VagkonHorisontData>>;
  /** Begärda horisonter i kanonisk ordning (mikro → mega) för deterministisk iteration. */
  ordning: VagkonHorisont[];
};

/**
 * Räkna ut vågkonen ur en värdehistorik.
 *
 * @param historik   Talserie i kronologisk ordning (äldst först), t.ex. månadsslutkurser
 *                   eller en årlig fundamental serie. Icke-tal hoppas över; log-returer
 *                   kräver positiva gränsvärden (par med ≤ 0 bidrar inte till σ).
 * @param horisonter Valbar delmängd av ["mikro","kort","medellang","lang","mega"]
 *                   (mikro/kort/… accepteras även med andra skiftlägen). Default: alla fem.
 * @returns VagkonData — deterministiskt: samma indata ger alltid samma utdata.
 */
export function raknaVagkon(historik: number[], horisonter?: string[]): VagkonData {
  // Rensa: endast äkta, ändliga tal är historik.
  const ren = Array.isArray(historik)
    ? historik.filter((x): x is number => typeof x === "number" && Number.isFinite(x))
    : [];

  const senaste = ren.length > 0 ? ren[ren.length - 1] : 0;

  // σ per steg ur logaritmiska returer (geometrisk volatilitet — teckenrobust
  // och enhetlig oavsett nivå, vilket aritmetiska returer inte är).
  const returer: number[] = [];
  for (let i = 1; i < ren.length; i++) {
    const a = ren[i - 1];
    const b = ren[i];
    if (a > 0 && b > 0) returer.push(Math.log(b / a));
  }
  const nRetur = returer.length;
  let sigma: number | null = null;
  if (nRetur >= 2) {
    const medel = returer.reduce((s, r) => s + r, 0) / nRetur;
    let kvad = 0;
    for (const r of returer) kvad += (r - medel) * (r - medel);
    sigma = Math.sqrt(kvad / (nRetur - 1)); // sampelstandardavvikelse (n−1)
  }

  // Horisontsval: kanonisk ordning behålls, okända nycklar ignoreras tyst.
  const begarda = new Set(
    Array.isArray(horisonter) ? horisonter.map((h) => String(h).toLowerCase()) : []
  );
  const valda = VAGKON_HORIZONTER.filter((hz) => begarda.size === 0 || begarda.has(hz));

  const otillracklig = ren.length < 3 || sigma === null;
  const vagHorisonter: Partial<Record<VagkonHorisont, VagkonHorisontData>> = {};

  if (!otillracklig) {
    for (const hz of valda) {
      const steg = VAGKON_STEG[hz];
      const median: number[] = new Array(steg);
      const p10: number[] = new Array(steg);
      const p90: number[] = new Array(steg);
      for (let t = 1; t <= steg; t++) {
        // √t-skalningen: bandet breddar med roten av horisonten — kärnan i konen.
        const rotT = Math.sqrt(t);
        median[t - 1] = senaste; // μ = 0 ⇒ medianen vilar på S₀
        p10[t - 1] = senaste * Math.exp(VAGKON_Z.p10 * (sigma as number) * rotT);
        p90[t - 1] = senaste * Math.exp(VAGKON_Z.p90 * (sigma as number) * rotT);
      }
      vagHorisonter[hz] = {
        namn: VAGKON_HORIZONNAMN[hz],
        steg,
        median,
        p10,
        p90,
        medianSlut: median[steg - 1],
        p10Slut: p10[steg - 1],
        p90Slut: p90[steg - 1],
      };
    }
  }

  return { senaste, n: ren.length, sigma, nRetur, otillracklig, horisonter: vagHorisonter, ordning: valda };
}
