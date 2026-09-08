import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";
import { getBokkanon, getCourseList, type Bok } from "@/lib/content";

export const dynamic = "force-static";

export const metadata: Metadata = pageMetadata({
  path: "/kallor",
  title: "Källor & litteratur — 101 böcker | AK1A",
  description:
    "Transparant källredovisning: alla 101 böcker i AK1A:s bokkanon — från Graham och Lynch till Kahneman och Taleb. Se nivå, kurskoppling (AKM1, AK1TS) och var boken köps.",
  keywords: [
    "bokkanon",
    "källor",
    "litteratur",
    "böcker aktieanalys",
    "värdeinvestering",
    "teknisk analys",
    "AK1A",
  ],
});

// ── Kategoridata: svensk rubrik + kort beskrivning (ur data/bokkanon.json: kat) ─
const KATEGORIER: Array<{ kat: string; rubrik: string; beskrivning: string }> = [
  {
    kat: "fundamental",
    rubrik: "Fundamental analys",
    beskrivning: "Värdering, bokföring och kapitalallokering — kanons ryggrad.",
  },
  {
    kat: "teknisk",
    rubrik: "Teknisk analys",
    beskrivning: "Pris, trend, momentum och systemhandel.",
  },
  {
    kat: "strategi",
    rubrik: "Strategi & portfölj",
    beskrivning: "Moat, disruption och portföljbyggande.",
  },
  {
    kat: "beteende",
    rubrik: "Beteende & psykologi",
    beskrivning: "Psyket bakom varje beslut — bias, disciplin, tålamod.",
  },
  {
    kat: "makro",
    rubrik: "Makro & marknadshistoria",
    beskrivning: "Cykler, kriser och spekulationens återkommande mönster.",
  },
  {
    kat: "risk",
    rubrik: "Risk & osäkerhet",
    beskrivning: "Svansrisk, hävstång och konsten att överleva.",
  },
];

/** Delar "Huvudtitel: Undertitel" på första ": " — undertitel renderas serif italic. */
function delaTitel(titel: string): [string, string | null] {
  const i = titel.indexOf(": ");
  if (i === -1) return [titel, null];
  return [titel.slice(0, i), titel.slice(i + 2)];
}

/** Kortar why-texten till max 2 meningar (redan korta texter lämnas orörda). */
function kortaWhy(why: string): string {
  const meningar = why.split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ0-9])/);
  return meningar.slice(0, 2).join(" ");
}

const KOP_LANK_STIL =
  "inline-flex items-center justify-center gap-1 rounded-lg border border-gold/30 px-2 py-1.5 text-xs font-semibold text-foreground transition hover:border-gold hover:bg-gold/10";

function BokKort({ bok }: { bok: Bok }) {
  const [huvudtitel, undertitel] = delaTitel(bok.titel);
  const arKurs = bok.status === "kurs";
  const sokBokus = `https://www.bokus.com/sok/${encodeURIComponent(bok.titel)}`;
  const sokAdlibris = `https://www.adlibris.com/sok?q=${encodeURIComponent(bok.titel)}`;
  const sokAmazon = `https://www.amazon.com/s?k=${encodeURIComponent(`${bok.titel} ${bok.author}`)}`;

  return (
    <article className="flex h-full flex-col rounded-xl border border-gold/25 bg-card p-5 transition hover:border-gold/50 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
          Nivå {bok.niva}/5
        </span>
        {arKurs ? (
          <span className="rounded-full border border-green-600/25 bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 dark:text-green-400">
            Kurs finns
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Kurs kommer
          </span>
        )}
      </div>

      <h3 className="mt-3 font-serif text-lg font-bold leading-snug">{huvudtitel}</h3>
      {undertitel && (
        <p className="mt-0.5 font-serif text-sm italic leading-snug text-muted-foreground">
          {undertitel}
        </p>
      )}
      <p className="mt-1.5 text-xs font-medium text-muted-foreground">
        {bok.author} · {bok.year}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{kortaWhy(bok.why)}</p>

      {(bok.ak.length > 0 || bok.ts.length > 0) && (
        <div className="mt-4 space-y-2">
          {bok.ak.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">AKM1</span>
              {bok.ak.map((v) => (
                <span
                  key={v}
                  className="rounded border border-gold/30 bg-gold/5 px-1.5 py-0.5 text-[11px] font-semibold text-gold"
                >
                  {v}
                </span>
              ))}
            </div>
          )}
          {bok.ts.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                AK1TS
              </span>
              {bok.ts.map((d) => (
                <span
                  key={d}
                  className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gold/15 pt-4">
        <a href={sokBokus} target="_blank" rel="noopener noreferrer" className={KOP_LANK_STIL}>
          Bokus <span aria-hidden>↗</span>
        </a>
        <a href={sokAdlibris} target="_blank" rel="noopener noreferrer" className={KOP_LANK_STIL}>
          Adlibris <span aria-hidden>↗</span>
        </a>
        <a href={sokAmazon} target="_blank" rel="noopener noreferrer" className={KOP_LANK_STIL}>
          Amazon <span aria-hidden>↗</span>
        </a>
      </div>
    </article>
  );
}

export default function KallorPage() {
  const bocker = getBokkanon();
  const antalKurser = getCourseList().length;

  // Gruppera böckerna per kategori (alla böcker täcks — inget filtreras bort)
  const grupper = new Map<string, Bok[]>();
  for (const bok of bocker) {
    const list = grupper.get(bok.kat) ?? [];
    list.push(bok);
    grupper.set(bok.kat, list);
  }
  // Kända kategorier först i definierad ordning; okända kategorier (framtid) sorteras in sist
  const sektioner = [
    ...KATEGORIER.filter((k) => grupper.has(k.kat)),
    ...[...grupper.keys()]
      .filter((kat) => !KATEGORIER.some((k) => k.kat === kat))
      .sort()
      .map((kat) => ({ kat, rubrik: kat, beskrivning: "" })),
  ];
  const antalKurserStatus = bocker.filter((b) => b.status === "kurs").length;

  return (
    <SeoPageShell breadcrumb={[{ name: "Källor" }]} wide>
      {/* 1. HERO */}
      <h1 className="font-serif text-4xl font-bold">
        Våra källor — {bocker.length} böcker som byggde AK1A
      </h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Kurserna på AK1A är fristående pedagogiska verk, inspirerade av de klassiska
        böckerna i aktieanalysens kanon. På varje kurs citerar vi källhänvisning
        till de verk som ligger bakom innehållet — här redovisas hela underlaget,
        bok för bok. Läs mer om hur vi hanterar{" "}
        <Link
          href="/upphovsratt"
          className="font-semibold text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
        >
          upphovsrätt och hänvisningar
        </Link>
        .
      </p>

      {/* 2. ÄRA FÖRFATTARNA */}
      <section className="mt-8 rounded-xl border border-gold/30 bg-gold/5 p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-bold">Ära författarna</h2>
        <p className="mt-3 font-serif text-xl italic leading-relaxed">
          ”Kurserna ersätter inte böckerna — de visar vägen till dem. Köp böckerna,
          läs dem, äg dem.”
        </p>
        <Link
          href="/kurser"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          Se vad böckerna blev — gå till kurserna →
        </Link>
      </section>

      {/* 3. Kategorinavigering */}
      <nav aria-label="Kategorier" className="mt-8 flex flex-wrap gap-2">
        {sektioner.map(({ kat, rubrik }) => (
          <a
            key={kat}
            href={`#kat-${kat}`}
            className="rounded-full border border-gold/25 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-gold hover:bg-gold/10"
          >
            {rubrik} <span className="text-gold">{grupper.get(kat)?.length ?? 0}</span>
          </a>
        ))}
      </nav>

      {/* 4. BOKKORT — grupperade per kategori */}
      {sektioner.map(({ kat, rubrik, beskrivning }) => {
        const lista = grupper.get(kat) ?? [];
        return (
          <section key={kat} id={`kat-${kat}`} className="mt-12 scroll-mt-24">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-serif text-2xl font-bold">{rubrik}</h2>
              <span className="rounded-full border border-gold/30 bg-gold/5 px-2.5 py-0.5 text-xs font-bold text-gold">
                {lista.length} {lista.length === 1 ? "bok" : "böcker"}
              </span>
            </div>
            {beskrivning && (
              <p className="mt-1 text-sm text-muted-foreground">{beskrivning}</p>
            )}
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((bok) => (
                <BokKort key={bok.id} bok={bok} />
              ))}
            </div>
          </section>
        );
      })}

      {/* 5. BOTTEN — sammanställning */}
      <section className="mt-14 rounded-xl border border-gold/25 bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">Sammanställning</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          {bocker.length} böcker → {antalKurser} kurser. Av kanonens {bocker.length} böcker
          ligger {antalKurserStatus} bakom publicerade kurser — resten väntar på sin.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Listan underhålls löpande: böcker tillkommer när kanon växer och status
          uppdateras när nya kurser publiceras.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Uppdaterad 2026-09-01 · AK1A Research Lab
        </p>
      </section>
    </SeoPageShell>
  );
}
