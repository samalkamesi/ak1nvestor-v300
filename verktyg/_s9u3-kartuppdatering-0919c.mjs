// s9-u3 (manifest auto-s9-1789824900585) — SYSTEMKARTAN-dokvåg E29+C15+E36.
// Clobber-kur: färsk läsning vid skrivtillfället, en-träff-ankare, abort vid
// avvikelse, EN atomär skrivning. Inga syskon-ytor röras (u1:s E27-sektion orörd).
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/forskning/SYSTEMKARTAN.md";
let t = readFileSync(FIL, "utf8");

function bytEnTraff(fran, till) {
  const n = t.split(fran).length - 1;
  if (n !== 1) {
    console.error(`ABORT: ankaretträffar ${n} (krav 1): ${fran.slice(0, 60)}…`);
    process.exit(1);
  }
  t = t.replace(fran, till);
}

// (1) ny UPPDATERING-sektion före ÖVERSIKT-blocket
const sektion = `## UPPDATERING 2026-09-19 (dokvåg s9-u3, manifest auto-s9-1789824900585 — E29 + C15 + E36 diffade mot verkligheten; FYND: 113 kursers OG-bilder 404 live i prod)

Val mot duplikat via disk-anspråk (u1 = E27, läst ur deras anspråkfil; D22/D23
= R2-ytor orörda; u2:s val lämnades öppet). Varje rad MÄTT i arbetsytan
15:37–15:45 lokal 2026-09-19 — inte läst ur worklog.

| Mått | Kartan 09-18 | Verkligheten 09-19 (mätning) |
|---|---|---|
| Fabriksmanifest (E29) | 146 klara av 147 · 475 utdataloggar | **187 klara av 188** (det pågående = detta manifest) · **600 utdataloggar** — +41 klara/dygn, TAKTEN ÖKAR (+30 föregående dygn) |
| Leveranskontraktet (E29) | "leveransbevis per uppgift" (aldrig korpusmätt) | **FÖRSTA HEL-KORPUSMÄTNINGEN: 599 klara uppgifter, 599/599 med LEVERANS-kvitto, 0 tyst döda** (koden räknar alla statusfiler); 123 avslutade med exit≠0 MEN samtliga 123 med leveransrad — process-exit är inte leverans, kvittot är |
| Beslutsminnet (E29) | 68 poster (rond 51) | **77 poster** (rond 59 @ 11:43:01Z, 4 idag, serien 55→59 sekventiell i filen) |
| Evighetsmotorn (E29) | 614 kontroller (11:48:03Z 09-18) | **762 kontroller** + FÅNGAD LEVANDE i mätfönstret igen (13:38:02Z: "iteration 2 · ålder 27 min · turn pågår") — andra levandefångsten, driftbeviset förstärks |
| Pumpor-daemonen (E29) | 42 h ↺19 | **uppe sedan 09-18 20:09 lokal** (pid 2320133, ~19,5 h, 5:01 CPU-min) — en omstart sedan förra mätningen |
| Kunduppdrag + CRON_SECRET (E29) | filer frånvarande · 0 env | **oförändrat båda** (mätt utan värden, endast närvaro) |
| Bloggkön (C15) | 199 filer (rot 54 · m9-ko 7 · granskning 89 · kvartal 49) | **265 filer** (rot 67 · m9-ko 7 · granskning 124 · kvartal 65) — **+66/dygn, TAKTEN TREDUBLAD** (+24 föregående dygn); sammanställningen själv­förnyande TREDJE dagen (206 104 B, 09-19 11:59) |
| Publicerat + B2 (C15) | 55 publicerade · B2 GET 405 | **55 ORÖRDA (R2)** · B2 GET **405 på både localhost och HTTPS** (metodbevakad, egen sond) · /blogg 200 · morgonens manifest-500:or (/kurser m.m., B13-radens driftbrott) **LÄKTA** — prod-synkens ombygge grönt |
| Mediesviten (E36) | 18/18 | **18/18 GRÖN EGEN körning** (oförändrat; kontrakt A7 SSRF/2 MB/magic-byte/hermetik) |
| media_fil-event (E36) | export antal=0 ×6 | **antal=0 ×7** (09-19 02:40) + **NY LIVE-SOND: 0 media_fil-rader i tabellen NU** — två grenar: biblioteket vantarkund (troligast) ELLER raderarklassen: min vagscan-sond visar EXAKT 1 rad = dagens 05:05 = gårdagens B9-storfynd PÅGÅR DAG 2 (korsvalidering B9/E33) |
| OG-bilderna (E36) | "OG manuellt kvar" + "public/og 404 i git" (beståndet antaget komplett) | **FYND: beståndet fruset på 333 kursbilder** (generatorn orörd sedan 09-05, sista OG-commit 023e9f95) **medan registret nått 446 kurser = 113 kurser utan egen OG-bild**; korsning deep-courses × public/og/kurser: 113 saknade, 0 överblivna; LIVE-BEVIS: pc-21-ditt-forsta-case bär og:image → /og/kurser/pc-21-….png = **404 i prod** (originalkurs 200) — delningsbilderna trasiga för en fjärdedel av katalogen |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E29 | LEVER 8 → **LEVER 8** | E33/B14-precedensen: svitgapet (fabrik/evighet/uppdrag 0 sviter) + CRON_SECRET oförändrade — men leveranskvittot 599/599 + fabriken +41 manifest/dygn är organisationens starkaste driftbevis hittills; kollisionsklassen lugn i detta fönster (disk-anspråk skrivna och lästa, u1:s E27-yta respekterad). Ingen poängrörelse |
| C15 | LEVER 8 → **LEVER 8** | Gapet "kön växer" skärps TREDJE gången (199→265, takten +66/dygn) men inget gap stängs och inget nytt öppnas (B13-precedensen); B2-knappen metodbevakad 405, 55 publicerade frysta (R2), sammanställningen lever — läget stabilt |
| E36 | LEVER 9 → **LEVER 8** | B7-precedensen: OG-gapet var kartat som "manuellt kvar" men verkligheten mäter **113 trasiga og:image-URL:er LIVE** (nya kursernas delningsyta 404:ar) — dokumenterat bestånd föll ifrån i roten och nådde konsumentytan = inte 9-läge. Svit 18/18 + exportkadansen orörda |

Snittscore **7,5** (285 → 284 poäng / 38 system; E36 −1 vid denna dokvåg).

Kö/sidofynd: (a) **OG-generatorns rerun = BYGGKÖ** — 113 kursbilder + analys-ytan
(11 bilder mot analysbeståndet) återställs av en generatoromkörning + commit +
deploy; avstått här (binära filer + deployklassning utanför dokvågens data-only
mandat); (b) media_fil-grenen avgörs av E33/B9:s raderarutredning (samma
rot-ID, Supabase-dashboard); (c) kursregistret 432→446 under MÄTFÖNSTRET
(siffror.json) — s5-vågorna levererar fortfarande, A1/E32-talen åldras dagligen.

`;
bytEnTraff("## ÖVERSIKT — 38 system", sektion + "## ÖVERSIKT — 38 system");

// (2) översiktsraderna
bytEnTraff(
  t.match(/^\| E29 \| Autonoma organet \+ cron-pipeline \| Styrning \| LEVER \| 8 \|.*$/m)[0],
  "| E29 | Autonoma organet + cron-pipeline | Styrning | LEVER | 8 | Fabrik 187 klara/188 manifest (mätt 09-19 15:37; +41/dygn, takten ökande) · 600 utdataloggar · LEVERANSKONTRAKTET korpusmätt första gången: 599/599 klara uppgifter med kvitto, 0 tyst döda (123 exit≠0 men samtliga med leveransrad) · beslutsminne 77 poster (rond 59, 4 idag) · evighetsmotorn 762 kontroller FÅNGAD LEVANDE 13:38Z · pumpor uppe sedan 09-18 20:09 · kunduppdragsfiler fortsatt frånvarande · CRON_SECRET 0 env · svitgapet oförändrat (fabrik/evighet/uppdrag 0) |"
);
bytEnTraff(
  t.match(/^\| C15 \| Bloggen \+ publiceringsflödet \| Innehåll \| LEVER \| 8 \|.*$/m)[0],
  "| C15 | Bloggen + publiceringsflödet | Innehåll | LEVER | 8 | Läge B STÄNGT (09-07); B2-knappen metodbevakad (GET 405 localhost+HTTPS, egen sond 09-19); kön 265 filer (+66/dygn, TAKTEN TREDUBLAD: rot 54→67 · granskning 89→124 · kvartal 49→65; mätt 09-19) med sammanställningen självförnyande tredje dagen (206 kB 11:59); 55 publicerade orörda (R2); morgonens manifest-500:or läkta (/blogg 200); kvar: B2-E2E (kundens knapp) |"
);
bytEnTraff(
  t.match(/^\| E36 \| Mediebiblioteket \| Grund \| LEVER \| 9 \|.*$/m)[0],
  "| E36 | Mediebiblioteket | Grund | LEVER | 8 | FYND 09-19 (9→8, B7-precedensen): OG-beståndet fruset på 333 kursbilder sedan 09-05 medan registret nått 446 kurser ⇒ 113 kurser pekar på og:image-URL:er som 404:ar LIVE (pc-21 bevis, originalkurs 200) — delningsytan trasig för en fjärdedel av katalogen; OG-rerun = BYGGKÖ; svit 18/18 grön EGEN igen; media_fil-exporten antal=0 ×7 + 0 rader live (vantarkund ELLER raderarklassen — avgörs av E33/B9:s rotutredning); bucket-förteckningen backas fortfarande av ingen |"
);

// (3) snitt-raden
bytEnTraff(
  "Snittscore: **7,5/10** (285 poäng / 38 system; B9 −1",
  "Snittscore: **7,5/10** (284 poäng / 38 system; E36 −1 vid dokvåg s9-u3 09-19 — 113 kursers OG-bilder 404 live i prod (B7-precedensen); B9 −1"
);

writeFileSync(FIL, t);
console.log("KARTA UPPDATERAD: 1 sektion + 3 översiktsrader + snitt-rad (285→284).");
