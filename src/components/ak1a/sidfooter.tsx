"use client";

import Link from "next/link";
import { TrafikStatusRad } from "@/components/ak1a/trafik-status-rad";
import {
  GAST_KONTEXT,
  registerFor,
} from "@/lib/meny-register";
import { useSprak } from "@/components/ak1a/sprak-leverantor";

/**
 * SIDFOOTER — rik sitemap-footer i AK1A-DNA (paper, guld, serif).
 * Fyra kolumner läses UR meny-registret (src/lib/meny-register.ts — EN källa
 * för all navigation) + bottenrad med disclaimer och policylänkar.
 *
 * 2026-09-03: kolumnerna = registrets sektioner (LÄRA/ANALYSERA/PRAKTIK/
 * OM AK1A) i samma ordning som huvudmenyn — ingen meny-yta kan motstrida
 * registret.
 *
 * VÅG 51 (2026-09-01): KLIENTKOMPONENT — etiketterna översätts via registrets
 * `nyckel` + useSprak().t. SSR/SSG renderar svenska (sv-raden = registrets
 * text); hydreringen byter till en/ar direkt vid språkval (samma mönster som
 * huvudmenyn/mobilmenyn). Gast-utbudet gäller fortfarande (publik-filter).
 */

export function Sidfooter() {
  const kolumner = registerFor(GAST_KONTEXT, "footer");
  const { t } = useSprak();

  return (
    <footer className="border-t-2 border-gold/40 bg-card">
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
                        className="inline-block rounded-md bg-gold px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 max-md:min-h-[52px]"
                      >
                        {punkt.nyckel ? t(punkt.nyckel) : punkt.text}
                      </Link>
                    ) : (
                      <Link
                        href={punkt.lank}
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
            <Link href="/privacy-policy" className="underline hover:text-[#E8C766]">
              {t("footer.integritetspolicy")}
            </Link>{" "}
            ·{" "}
            <Link href="/villkor" className="underline hover:text-[#E8C766]">
              {t("footer.villkor")}
            </Link>{" "}
            ·{" "}
            <Link href="/finansiell-policy" className="underline hover:text-[#E8C766]">
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
