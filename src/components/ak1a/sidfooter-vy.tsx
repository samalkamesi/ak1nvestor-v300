import Link from "next/link";
import { TrafikStatusRad } from "@/components/ak1a/trafik-status-rad";
import {
  GAST_KONTEXT,
  registerFor,
} from "@/lib/meny-register";
import type { OrdlistaNyckel } from "@/lib/ordlista";
import type { SprakParametrar } from "@/lib/sprak";

/**
 * SIDFOOTER-VY (o105, spår 7) — hook-fri renderare av sitemap-footern.
 *
 * EN källa för layouten, två bindningar (o101 §4 Kur A / o19-sond-precedensen):
 *   · sidfooter.tsx          ("use client") — useSprak().t, MGTM som förut
 *     (sv-rötter: SSR svensk, hydrering svensk; UI-byte sker via spegel-
 *     navigation — oförändrat beteende, identisk DOM).
 *   · sidfooter-server.tsx   (server) — skapaT(lang) från spegelbyggarens
 *     lang-prop: etiketterna SSR:as RÄTT från början på /en|/ar och footerns
 *     81 element hydratiseras ALDRIG (o101 §3: speglarnas TBT-börda — sv 316
 *     → en 994 / ar 616 ms på identiskt träd).
 *
 * Vy-modulen har INGEN "use client"-direktiv och INGA hooks: den kan båda
 * konsumeras av klienten (blir del av klientbunten) och av servern (RSC).
 * t är ett rent lexikonuppslag — signaturen speglar skapaT/useSprak().t.
 */

export type SidfooterEtikett = (
  nyckel: OrdlistaNyckel,
  parametrar?: SprakParametrar,
) => string;

export function SidfooterVy({ t }: { t: SidfooterEtikett }) {
  const kolumner = registerFor(GAST_KONTEXT, "footer");

  return (
    // cv-sidfooter (o78): hela sitemap-footern (81 element, 2 145 px på mobil)
    // ligger under vecket på i princip alla sidor — content-visibility hoppar
    // style/layout/paint tills den närmar sig viewporten. Se globals.css.
    <footer className="cv-sidfooter border-t-2 border-gold/40 bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="hjarlinje mb-10" aria-hidden="true" />
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {kolumner.map((kolumn) => (
            <nav
              key={kolumn.id}
              aria-label={kolumn.nyckel ? t(kolumn.nyckel) : kolumn.titel}
              className="flex flex-col gap-3"
            >
              <h2 className="font-serif text-xs font-bold tracking-widest text-gold">
                {kolumn.ikon ? `${kolumn.ikon} ` : ""}
                {(kolumn.nyckel ? t(kolumn.nyckel) : kolumn.titel).toUpperCase()}
              </h2>
              <ul className="flex flex-col gap-2">
                {kolumn.punkter.map((punkt) => (
                  <li key={punkt.lank}>
                    {punkt.guldknapp ? (
                      <Link
                        href={punkt.lank}
                        prefetch={false}
                        className="inline-block rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 max-md:min-h-[52px]"
                      >
                        {punkt.nyckel ? t(punkt.nyckel) : punkt.text}
                      </Link>
                    ) : (
                      <Link
                        href={punkt.lank}
                        prefetch={false}
                        // prefetch={false} (o17-footer-precedensen, här på
                        // rika sitemap-footern som o17:s footer.tsx-kur missade):
                        // footerns kolumnlänkar ligger under vecket — inte
                        // tidskritiska navigationsmål, men prefetchar tunga
                        // flighter när läsaren scrollar fram dem (o52 §3).
                        className="text-sm text-muted-foreground hover:text-foreground max-md:flex max-md:min-h-[52px] max-md:items-center"
                      >
                        {punkt.nyckel ? t(punkt.nyckel) : punkt.text}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="marin-panel mt-10 rounded-xl border border-gold/25 px-5 py-5 text-xs text-[#EDE6D6]">
          <p>
            {t("footer.disclaimer")}{" "}
            <Link
              href="/privacy-policy"
              prefetch={false}
              className="underline hover:text-[#E8C766]"
            >
              {t("footer.integritetspolicy")}
            </Link>{" "}
            ·{" "}
            <Link
              href="/villkor"
              prefetch={false}
              className="underline hover:text-[#E8C766]"
            >
              {t("footer.villkor")}
            </Link>{" "}
            ·{" "}
            <Link
              href="/finansiell-policy"
              prefetch={false}
              className="underline hover:text-[#E8C766]"
            >
              {t("footer.finansiellPolicy")}
            </Link>
          </p>
          {/* Live-rad (valfri, diskret): skyddad + besökare idag — tyst vid motstånd */}
          <TrafikStatusRad />
          <p className="mt-2 font-serif italic text-[#E8C766]">{t("footer.byggtMed")}</p>
        </div>
      </div>
    </footer>
  );
}
