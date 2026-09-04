/**
 * PEER — branschjämförelse på rank/median-basis (AKM3 steg 4, r3-peer §3).
 *
 * Frågan r3 besvarar: "högt betyg i en svag bransch" vs "medel betyg i en
 * stark" — den absoluta AKM2-poängen döljer vem som slår sitt sällskap.
 * Tre deterministiska, rent presenterande mått per bolag:
 *
 *   peerPercentil = 100·(sämre + 0,5·lika)/(n − 1)   midrank — namnbrytning ALDRIG
 *   rank          = 1 + antal strikt bättre           visas "4/10"; delade = delade
 *   peerDrag      = akm2 − branschmedian              (JSON-nyckel åäö-fri: peerDrag)
 *   hållning(Vxx) = poäng − branschmedianpoäng: > +0,5 ÖVER · |·| ≤ 0,5 I NIVÅ · < −0,5 UNDER
 *
 * LÄSLAGER — ALDRIG poängkomponent: peer ingår ALDRIG i raknaAKM2/kompositen
 * och är ALDRIG indata i portföljbygget (modulerna sköter branschanpassning
 * på viktsidan; dubbelräkning avvisad, r3 rekommendation 3). Z-score/MAD är
 * FÖRBJUDDA vid n=10 (MAD kan kollapsa) — rank/median endast (BESLUT §10.10).
 *
 * osatt-regler (motorn gissar aldrig):
 *   grupp < 5 bolag              ⇒ osattOrsak "liten-grupp"
 *   bolaget saknar akm2           ⇒ osattOrsak "saknad-akm2"
 *   variabel osatt hos bolaget    ⇒ variabelraden hallning "osatt"
 *   (per-variabelmedian räknas över gruppens ICKKE-osatta värden)
 *
 * DETERMINISM (P1): ren funktion av (rader, poäng, referens) — inga klockor,
 * inget slump, midrank gör utfallet oberoende av namnsortering. Median enligt
 * typiskt kontrakt: jämnt n ⇒ medelvärde av de två mittersta. Urvals-
 * beroendet syns i `referens` (korstabellens skapad + universets storlek).
 *
 * Filen är MEDVETELT fs-fri (klientkomponenter importerar formaterarna);
 * cache-läsningen bor i korstabell-data.ts (server-side).
 *
 * Pedagogisk forskning — ALDRIG investeringsråd (lagen 2007:528).
 */

import type { Bransch, KorstabbellRad } from "./typer";

/** AKM1:s variabel-ID:n (kanonisk ordning — presentationen kan sortera om). */
export const PEER_VARIABLER: string[] = Array.from(
  { length: 20 },
  (_, i) => `V${String(i + 1).padStart(2, "0")}`,
);

/** Minsta gruppstorlek för meningsfull normalisering (r3 §2.3). */
export const PEER_MIN_GRUPP = 5;

/** Hållning mot branschmedianpoängen (trösklar ±0,5 — r3 §3.3). */
export type PeerHallning = "over" | "iNiva" | "under" | "osatt";

/** En variabelrads peer-jämförelse (poäng 0–5 mot branschmedianpoäng). */
export type PeerVariabelRad = {
  id: string;
  /** Bolagets poäng 0–5 — null när variabeln är osatt hos bolaget. */
  poang: number | null;
  /** Branschmedianpoäng över gruppens icke-osatta — null när ingen mätte. */
  branschmedian: number | null;
  hallning: PeerHallning;
};

/** Peer-profilen per bolag — serialiserbar, åäö-fria JSON-nycklar. */
export type PeerInfo = {
  ticker: string;
  bransch: Bransch;
  /** Antal bolag i branschgruppen (hela gruppen, även utan akm2). */
  antalIGruppen: number;
  /** Midrank-percentil 0–100 inom branschen — null när osatt. */
  peerPercentil: number | null;
  /** 1 + antal strikt bättre; delade värden delar rank — null när osatt. */
  rank: number | null;
  /** Median av gruppens AKM2-kompositer — null när osatt. */
  branschMedian: number | null;
  /** akm2 − branschmedian (1 decimal, tecknat) — null när osatt. */
  peerDrag: number | null;
  /** true när grupp < 5 eller bolagets akm2 saknas — ALDRIG gissning. */
  osatt: boolean;
  osattOrsak: "liten-grupp" | "saknad-akm2" | null;
  /** Urvalsberoendet syns: korstabellens skapad + universets storlek. */
  referens: string;
  /** Per-variabel räkning (endast mätta variabler räknas). */
  overMedian: number;
  iNiva: number;
  underMedian: number;
  /** Per-variabeljämförelsen i kanonisk V-ordning (V07 lyfts i visningen). */
  variabler: PeerVariabelRad[];
};

/** Optioner till raknaPeer — båda valfria (ren funktion, inga sidoeffekter). */
export type RaknaPeerOptioner = {
  /** Korstabellens `skapad` (faller tillbaka på senastKontrollerad). */
  referensDatum?: string;
  /** Per-bolag variabelpoäng 0–5 (ur akm1-cachen); null/ogiltigt = osatt. */
  poangPerBolag?: Readonly<Record<string, Readonly<Record<string, number | null>>>>;
};

// ── Småhjälpare (rena, deterministiska) ──────────────────────────────────────

function r1(x: number): number {
  return Math.round(x * 10) / 10;
}

function arTal(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Median enligt typiskt kontrakt: jämnt n ⇒ medel av de två mittersta. */
function median(varde: number[]): number | null {
  const tal = varde.filter(arTal).sort((a, b) => a - b);
  if (tal.length === 0) return null;
  const mitt = Math.floor(tal.length / 2);
  return tal.length % 2 === 1 ? tal[mitt] : (tal[mitt - 1] + tal[mitt]) / 2;
}

/** Hållning enligt trösklarna ±0,5 (r3 §3.3). */
function hallningFor(diff: number): PeerHallning {
  if (diff > 0.5) return "over";
  if (diff < -0.5) return "under";
  return "iNiva";
}

/**
 * Räkna peer-profilen för ALLA bolag i korstabellens rader, grupperat per
 * branschfamilj (de 10 kanoniska — aldrig underindustrier, r3 §2.3).
 * Ren funktion: samma rader + samma poäng ⇒ JSON-identiskt resultat.
 */
export function raknaPeer(
  rader: KorstabbellRad[],
  optioner: RaknaPeerOptioner = {},
): Map<string, PeerInfo> {
  const poangKalla = optioner.poangPerBolag ?? {};
  const referensDatum =
    (typeof optioner.referensDatum === "string" && optioner.referensDatum.trim() !== ""
      ? optioner.referensDatum.trim()
      : rader.find((r) => typeof r.senastKontrollerad === "string" && r.senastKontrollerad !== "")
          ?.senastKontrollerad) ?? "odaterat";
  const referens = `${referensDatum} · ${rader.length}-bolagsunivers`;

  const ut = new Map<string, PeerInfo>();

  // Gruppera per bransch (bevarar indataordningen inom varje grupp).
  const grupper = new Map<Bransch, KorstabbellRad[]>();
  for (const rad of rader) {
    const lista = grupper.get(rad.bransch) ?? [];
    lista.push(rad);
    grupper.set(rad.bransch, lista);
  }

  for (const [bransch, grupp] of grupper) {
    const medAkm2 = grupp.filter((r) => arTal(r.akm2));
    const n = medAkm2.length;
    const gruppMedian = median(medAkm2.map((r) => r.akm2 as number));

    // Per-variabel median över gruppens icke-osatta (beräknas en gång per grupp).
    const medianPerVariabel = new Map<string, number | null>();
    for (const v of PEER_VARIABLER) {
      const varde: number[] = [];
      for (const r of grupp) {
        const p = poangKalla[r.ticker]?.[v];
        if (arTal(p)) varde.push(p);
      }
      medianPerVariabel.set(v, median(varde));
    }

    for (const rad of grupp) {
      const egenPoang = poangKalla[rad.ticker] ?? {};
      const variabler: PeerVariabelRad[] = [];
      let over = 0;
      let iNiva = 0;
      let under = 0;
      for (const v of PEER_VARIABLER) {
        const p = egenPoang[v];
        const bm = medianPerVariabel.get(v) ?? null;
        if (!arTal(p)) {
          variabler.push({ id: v, poang: null, branschmedian: bm, hallning: "osatt" });
          continue;
        }
        if (bm === null) {
          variabler.push({ id: v, poang: p, branschmedian: null, hallning: "osatt" });
          continue;
        }
        const hallning = hallningFor(p - bm);
        if (hallning === "over") over += 1;
        else if (hallning === "under") under += 1;
        else iNiva += 1;
        variabler.push({ id: v, poang: p, branschmedian: bm, hallning });
      }

      const litenGrupp = grupp.length < PEER_MIN_GRUPP;
      const saknadAkm2 = !arTal(rad.akm2);
      const osatt = litenGrupp || saknadAkm2;

      let peerPercentil: number | null = null;
      let rank: number | null = null;
      let peerDrag: number | null = null;
      if (!osatt && n >= 2 && gruppMedian !== null) {
        const egen = rad.akm2 as number;
        let samre = 0;
        let lika = 0;
        let battre = 0;
        for (const g of medAkm2) {
          const ga = g.akm2 as number;
          if (ga < egen) samre += 1;
          else if (ga === egen) {
            if (g !== rad) lika += 1; // lika exkluderar sig själv (r3 §3.1)
          } else battre += 1;
        }
        // midrank: delade värden räknas som halva — namnbrytning ALDRIG.
        peerPercentil = r1((100 * (samre + 0.5 * lika)) / (n - 1));
        rank = 1 + battre;
        peerDrag = r1(egen - gruppMedian);
      }

      ut.set(rad.ticker, {
        ticker: rad.ticker,
        bransch,
        antalIGruppen: grupp.length,
        peerPercentil,
        rank,
        branschMedian: gruppMedian,
        peerDrag,
        osatt,
        osattOrsak: litenGrupp ? "liten-grupp" : saknadAkm2 ? "saknad-akm2" : null,
        referens,
        overMedian: over,
        iNiva,
        underMedian: under,
        variabler,
      });
    }
  }

  return ut;
}

// ── Visningsformat (deterministiska, svenska, klientvänliga — ingen fs) ──────

/** "4/10" — rank mot gruppen; osatt ⇒ "—/10". */
export function peerRankText(peer: PeerInfo | null | undefined): string {
  if (!peer || peer.rank === null) return `—/${peer?.antalIGruppen ?? 0}`;
  return `${peer.rank}/${peer.antalIGruppen}`;
}

/** "+14" / "−3,5" / "±0" / "—" — branschdraget (akm2 − branschmedian). */
export function peerDragText(drag: number | null | undefined): string {
  if (typeof drag !== "number" || !Number.isFinite(drag)) return "—";
  const t = r1(drag);
  if (t > 0) return `+${String(t).replace(".", ",")}`;
  if (t < 0) return `−${String(Math.abs(t)).replace(".", ",")}`;
  return "±0";
}

/** Hållningsetiketter — svenska i UI, aldrig signalverb (2007:528). */
export const PEER_HALLNING_TEXT: Record<PeerHallning, string> = {
  over: "ÖVER",
  iNiva: "I NIVÅ",
  under: "UNDER",
  osatt: "OSATT",
};
