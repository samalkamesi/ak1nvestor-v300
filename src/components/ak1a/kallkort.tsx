import Link from "next/link";

/**
 * Källkort — upphovsrättslig transparens per kurs.
 * Visar källverket (bok) som kursen bygger på: titel, författare, år,
 * principen (fristående pedagogiskt verk, ersätter inte boken) samt
 * köplänkar som hedrar författarna. Se /upphovsratt och /kallor.
 */

export type Kalla = {
  titel: string;
  forfattare: string;
  ar: number;
  bk?: string;
};

export function Kallkort({ kurs }: { kurs: { category?: string; kalla?: Kalla; title?: string } }) {
  if (kurs.category !== "BOKMASTER") return null;

  // Skyddsnät: bokmaster utan kallfält får generisk transparensbild
  if (!kurs.kalla) {
    return (
      <aside className="mt-10 rounded-xl border border-gold/25 bg-card p-5">
        <p className="font-serif text-sm font-bold text-gold">◈ Källverk</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Denna kurs är ett fristående pedagogiskt verk av AK1A Research Lab, inspirerad av
          publicerad litteratur inom ämnet. Vi redovisar alla källor öppet — se den kompletta
          listan med 101 böcker.
        </p>
        <Link
          href="/kallor"
          className="mt-3 inline-block text-xs font-semibold text-gold hover:underline max-md:inline-flex max-md:min-h-[52px] max-md:items-center"
        >
          Se alla källor →
        </Link>
      </aside>
    );
  }

  const { titel, forfattare, ar } = kurs.kalla;
  const bokus = `https://www.bokus.com/sok/${encodeURIComponent(titel)}`;
  const adlibris = `https://www.adlibris.com/sok?q=${encodeURIComponent(titel)}`;

  return (
    <aside className="mt-10 rounded-xl border border-gold/30 bg-card p-5">
      <p className="font-serif text-sm font-bold text-gold">◈ Källverk</p>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        Denna kurs är ett fristående pedagogiskt verk av AK1A Research Lab, inspirerat av och med
        källhänvisning till{" "}
        <strong className="text-foreground">
          {titel}
        </strong>{" "}
        av <strong className="text-foreground">{forfattare}</strong> ({ar}). Vi citerar endast kort
        med källangivelse — kursen ersätter inte boken, den visar vägen till den.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={bokus}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-marin px-3 py-1.5 text-xs"
        >
          Köp boken — Bokus ↗
        </a>
        <a
          href={adlibris}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-marin px-3 py-1.5 text-xs"
        >
          Adlibris ↗
        </a>
        <Link href="/upphovsratt" className="text-xs font-semibold text-gold hover:underline">
          Vår upphovsrättspolicy
        </Link>
        <Link href="/kallor" className="text-xs font-semibold text-gold hover:underline">
          Alla 101 källor →
        </Link>
      </div>
    </aside>
  );
}
