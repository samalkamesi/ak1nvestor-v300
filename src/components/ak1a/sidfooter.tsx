import Link from "next/link";

/**
 * SIDFOOTER — rik sitemap-footer i AK1A-DNA (paper, guld, serif).
 * Server-komponent: fyra kolumner (LÄR/ANALYSERA/TRÄNA/AK1A) + bottenrad
 * med disclaimer och policylänkar. Ska ersätta den enkla footern i skalet.
 */

type FooterPunkt = { text: string; lank: string; guldknapp?: boolean };
type FooterKolumn = { titel: string; ikon?: string; punkter: FooterPunkt[] };

const KOLUMNER: FooterKolumn[] = [
  {
    titel: "LÄR",
    ikon: "🎓",
    punkter: [
      { text: "Manifestet", lank: "/manifest" },
      { text: "Läroplanen", lank: "/laroplan" },
      { text: "Alla kurser", lank: "/kurser" },
      { text: "Biblioteket", lank: "/bibliotek" },
      { text: "Certifikat", lank: "/certifikat" },
    ],
  },
  {
    titel: "ANALYSERA",
    ikon: "🔬",
    punkter: [
      { text: "AKM1-kalkylatorn", lank: "/kalkylator" },
      { text: "Superanalysen", lank: "/superanalys" },
      { text: "Min portfölj", lank: "/min-portfolj" },
      { text: "Analyser", lank: "/analyser" },
      { text: "AI-Diagnos", lank: "/diagnos" },
    ],
  },
  {
    titel: "TRÄNA",
    ikon: "🎯",
    punkter: [
      { text: "Dagens Pass", lank: "/dagens-pass" },
      { text: "Min Sida", lank: "/min-sida" },
      { text: "Topplistan", lank: "/topplista" },
      { text: "Badges", lank: "/badges" },
      { text: "Fas 2-ansökan", lank: "/fas2-ansok" },
    ],
  },
  {
    titel: "AK1A",
    punkter: [
      { text: "Om oss", lank: "/om-oss" },
      { text: "Blogg", lank: "/blogg" },
      { text: "Medlemskap", lank: "/medlemskap" },
      { text: "Logga in", lank: "/logga-in" },
      { text: "Ansök Fas 2", lank: "/fas2-ansok", guldknapp: true },
    ],
  },
];

export function Sidfooter() {
  return (
    <footer className="border-t-2 border-gold/40 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {KOLUMNER.map((kolumn) => (
            <nav key={kolumn.titel} aria-label={kolumn.titel} className="flex flex-col gap-3">
              <h2 className="font-serif text-xs font-bold tracking-widest text-gold">
                {kolumn.ikon ? `${kolumn.ikon} ` : ""}
                {kolumn.titel}
              </h2>
              <ul className="flex flex-col gap-2">
                {kolumn.punkter.map((punkt) => (
                  <li key={punkt.lank + punkt.text}>
                    {punkt.guldknapp ? (
                      <Link
                        href={punkt.lank}
                        className="inline-block rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                      >
                        {punkt.text}
                      </Link>
                    ) : (
                      <Link
                        href={punkt.lank}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {punkt.text}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-gold/20 pt-6 text-xs text-muted-foreground">
          <p>
            AK1A Research Lab — pedagogisk finansanalys, inte investeringsråd.{" "}
            <Link href="/privacy-policy" className="underline hover:text-foreground">
              Integritetspolicy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Villkor
            </Link>{" "}
            ·{" "}
            <Link href="/finansiell-policy" className="underline hover:text-foreground">
              Finansiell policy
            </Link>
          </p>
          <p className="mt-2 font-serif italic">Byggt med AKM1 + AK1TS</p>
        </div>
      </div>
    </footer>
  );
}
