"use client";

/**
 * Kursförslag på 404-sidan — "kursen kan ha bytt namn".
 *
 * Läser aktuellt pathname; om besökaren sökte /kurser/{slug} matchas den med
 * litet redigeringsavstånd (Levenshtein) mot alla kurs-slugs och de 3 närmaste
 * föreslås. Fungerar även för percent-encodade åäö-slugar (gamla länkar).
 *
 * VÅG 81 — SSR: pathname läses via usePathname() (NEXT-Router) i stället för
 * window.location + typeof-window-grinden. usePathname är tillgänglig i
 * serverrenderingen (request-scoped) och identisk vid hydreringen ⇒ exakt
 * samma förslag beräknas på båda sidor: länkarna syns I server-HTML/flight-
 * datan (våg 81:s no-JS-prodverifiering krävde det) och hydreringsmismatchen
 * som det gamla mönstret orsakade (SSR=null, klient=förslag) försvinner.
 * För 404:or utan /kurser/-prefix (statisk /_not-found) blir resultatet []
 * på båda sidor — oförändrat beteende.
 *
 * SPÅR 7 s7-u3 (FLIGHT-KUREN 2026-09-17) — props bär ENDAST slugs; titlarna
 * hämtas löst. Bakgrund: not-found-gränserna serialiseras av Next in i VARJE
 * sidas RSC-flight inom gruppen — med {slug,titel}-objekt för 393 kurser
 * skickades ~42 K onödig data på varje sidvisning (bevis: /om 48 K HTML varav
 * 393 objekt; /kurser flight 155 K med KURSREGISTER DUBBELT: 393 titel-objekt
 * + 396 register-objekt). Matchningen (Levenshtein) behöver bara slugs —
 * titlarna är rent visningspolering och hämtas från /api/kurs-titlar ENDAST
 * när ett förslag faktiskt visas (max 3 slugs, högst en gång per slug).
 * No-JS-kontraktet (våg 81) består: länkarna renderas i server-HTML med
 * läsbar slug-etikett; titeln är progressiv förbättring.
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Läsbar etikett ur en slug ("100-baggers" → "100 Baggers"). */
function lasbarSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => (w.length <= 1 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

function normalisera(s: string): string {
  try {
    return decodeURIComponent(s).toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

/** Klassiskt Levenshtein-avstånd, takat för korta strängar (slugs). */
function avstand(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let fore = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const nu = [i];
    for (let j = 1; j <= n; j++) {
      nu[j] = Math.min(
        fore[j] + 1,
        nu[j - 1] + 1,
        fore[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    fore = nu;
  }
  return fore[n];
}

export function KursForslag({ sluggar }: { sluggar: string[] }) {
  const pathname = usePathname();
  const forslag = React.useMemo(() => {
    if (!pathname) return [];
    const path = normalisera(pathname);
    // VÅG 85 (STYRELSE-VAG85-FLYTT §A5 + KARTA §5.3): valfritt spegelprefix
    // (en/|ar/) som fånggrupp — tidigare träffades endast ^/kurser/…, så
    // spegel-404:ar (/en|/ar/kurser/…) fick [] förslag. Svenskt beteende är
    // oförändrat (prefix = ""); på speglar behålls prefixet i länkarna.
    const match = path.match(/^\/(en\/|ar\/)?kurser\/(.+?)\/?$/);
    if (!match) return [];
    const prefix = match[1] ?? "";
    const sokt = match[2];
    return sluggar
      .map((slug) => ({ slug, d: avstand(sokt, slug) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .filter((k, i) => k.d <= Math.max(6, sokt.length / 2) || i === 0)
      .map((k) => ({ ...k, href: `/${prefix}kurser/${k.slug}` }));
  }, [sluggar, pathname]);

  // s7-u3: titelpolering — hämtas först när förslag visas (404 är den
  // enda ytan där komponenten renderar något). Deterministisk på servern
  // (effect körs ej) ⇒ server-HTML och första klientrendering är identiska.
  const nyckel = forslag.map((k) => k.slug).join(",");
  const [titlar, setTitlar] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    if (!nyckel) return;
    let aktiv = true;
    fetch(`/api/kurs-titlar?slugs=${encodeURIComponent(nyckel)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : {}))
      .then((hamtade) => {
        if (aktiv && Object.keys(hamtade).length > 0) {
          setTitlar((fore) => ({ ...fore, ...hamtade }));
        }
      })
      .catch(() => {
        /* nätverksfel: slug-etiketterna består — graciös degradering */
      });
    return () => {
      aktiv = false;
    };
  }, [nyckel]);

  if (forslag.length === 0) return null;

  return (
    <div className="mt-7 rounded-xl border border-[#E8C766]/35 bg-[#0E1B2E]/60 px-5 py-5 text-left">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8C766]/85">
        Hittade vi det du sökte?
      </p>
      <p className="mt-2 text-sm text-[#EDE6D6]/80">
        Kursen kan ha bytt namn eller flyttats. Här är de närmaste träffarna:
      </p>
      <ul className="mt-3 space-y-2">
        {forslag.map((k) => (
          <li key={k.slug}>
            <Link
              href={k.href}
              className="btn-marin group flex items-center justify-between gap-2 px-4 py-3"
            >
              <span className="font-serif text-sm font-bold text-[#EDE6D6]">{titlar[k.slug] ?? lasbarSlug(k.slug)}</span>
              <span
                aria-hidden
                className="text-[#E8C766] transition-transform duration-150 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
