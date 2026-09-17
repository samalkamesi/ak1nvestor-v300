# O52 — Prestanda spår 7, våg: blogginläggssidans prefetch-spill (2026-09-17)

**Ägare:** fabriksagent s7-u1 (omtagning, manifest auto-s7-1789661728938) ·
**Status:** KUR LEVERERAD — EFTER väntar prod-synkens bygge (§5)

## §1 Val + duplikatkontroll

Anspråk `data/vakten/s7-bloggpost-o52-u1-ansprak-1905.md` FÖRE kirurgi.
Spårets öppna kö efter o50 §7: kurskorts-posten (o51) togs av pågående u3
18:59 (disk-först) + deras "Plus"-post (o49/o50-EFTER-bokföring); kvar =
/är-mätning (data redan på disk hos u1-förra, obokat), /kurser-solo
(bättre efter o51). **Nya ytan:** blogginläggssidan /blogg/[slug] —
FÖRSTA mätningen någonsin av post-sidorna (alla tidigare vågar = listvyer:
o17 footer.tsx/cookie, o41 listkort ×3 språk, o49 header-CTA, o50 logo).
Ingen post-fil i lighthouse/-katalogen, ingen post-sond i OPTIMERING/*.md.
Protokollnummer o52 (o49=u1-förra, o50=u2-förra, o51=u3-pågående).

## §2 FÖRE (Lighthouse mobil, localhost=prod, BUILD_ID 6qghn83I3yt--H0fK8g0A = 089ded18, 19:0x lokal)

Sida: `/blogg/sa-laser-du-en-balansrakning-pa-15-minuter`
**P56 · LCP 5121 ms · TBT 802 ms · CLS 0 · 40 requests · 556,2 KiB transfer.**

Nätverksbeviset (sond `verktyg/_s7u2-sond-prefetch.mjs`): **5 RSC-hämtningar
à 28,8 KiB mitt i LCP-fönstret**:

| Rutt | Omgångar | KiB | Mönster |
|---|---|---|---|
| `/blogg?_rsc` | **3** (0,8 + 8,5 + 10,9) | 20,2 | o50:s multiomångs-prefetch på EN länk |
| `/blogg/sa-laser-du-en-svensk-arsredovisning?_rsc` | **2** (0,9 + 7,8) | 8,7 | o41:s partial+full på brödtextslänk |

Rådata: `lighthouse/blogg_sa-laser-du-en-balansrakning-pa-15-minuter-o52post-fore.json`
+ `lighthouse/o52post-fore-sammanfattning.json`.

## §3 Källanalys (empirisk — SSR-HTML + RSC-flight + källkod)

- **Brodkrumman** (`brodkrumma.tsx:32`): "Blogg"-smulan = `<Link>` utan
  prefetch-styrning, synlig i viewport ⇒ 3 omgångar à 20,2 KiB. Äger ALLA
  SeoPageShell-sidors smulor ("Kurser", "Analys" …) — curad generellt.
- **Brödtextens korsreferenser** (`(huvud)/blogg/[slug]/page.tsx`
  renderInline): markdown `[text](href)` ⇒ `$L29`-Link ⇒ 2 omgångar à
  8,7 KiB för EN länk högt i texten. Spegelparitet i
  `blogg-spegel-sida.tsx` (en/ar) — samma renderare.
- **Under vecket** (realanvändar-spill vid scroll, ej i kallmät-fönstret):
  "Fortsätt i kurserna" (`/kurser/[slug]` — kurs-flighter = tyngst, o50 §6),
  fallback `/kurser` + `/laroplan`, "Läs också" ×3 relaterade inlägg,
  **sidfootern** (`sidfooter.tsx` — rika sitemap-footern via SeoPageShell:
  4 kolumnlänkar × flera + 3 policy-länkar; o17 kurade `footer.tsx`, som
  bara spa-hem använder — sidfootern var den missade tvillingen).

## §4 KUR (levererad, tsc 0 via projektbinär, INGET bygge — prod-synken äger)

`prefetch={false}` enligt o17/o41/o49/o50-precedensen (hover-prefetch lever
kvar i Next 16; force-static/ISR-mål ⇒ klick ≈ 100–300 ms; läsrighets-
klasser `max-md:min-h-[52px]` orörda):

1. `src/components/ak1a/brodkrumma.tsx` — smul-Linken (SAJTBREDD: alla
   SeoPageShell-konsumenter).
2. `src/components/ak1a/sidfooter.tsx` — kolumnlänkar (båda varianterna,
   guldknapp + vanlig) + 3 policy-länkar (o17-footer-pariteten).
3. `src/app/(huvud)/blogg/[slug]/page.tsx` — brödtext-renderInline +
   kurs-länkarna + `/kurser` + `/laroplan` + "Läs också".
4. `src/components/ak1a/blogg-spegel-sida.tsx` — speglarnas renderInline +
   "Läs också" (en/ar-paritet).

Syskonens ytor orörda (kurs-sok.tsx = u3-pågående, inloggad-knapp.tsx,
varumarkes-logo.tsx, lasy-global.tsx). seo-page-shell.tsx orörd (brodkrumma
+ sidfooter kirurgerades i egna filer). Ingen DOM/klass-förändring — bara
attributet + kommentarer.

## §5 EFTER (väntar prod-synkens deploy av denna commit)

Förväntan på `/blogg/sa-laser-du-en-balansrakning-pa-15-minuter`
(kallmät): `?_rsc` **5 → 0**, requests **40 → 35**, transfer **−28,8 KiB**;
poäng/LCP/TBT bär last-/driftbrus (o28-mätplanet) — strukturen är beviset.
Under-vecket-kurerna (kurser/relaterade/sidfooter) syns EJ i kallmätet —
bokförs som realanvändar-notis. Sond + Lighthouse i egna namnrymder
`lighthouse/blogg_sa-…-o52post-efter*.json` när BUILD_ID bytts.

## §6 Kö/fynd till nästa omgång

1. EFTER-bokföring o52 (denna §5) + u3:s o51-EFTER när prod-synken byggt.
2. Sidfooter-kurens sajtbredda räckvidd: verifikation på ENICKE-blogg-sida
   (t.ex. /kurser: "Kurser"-smulan + sidfootern) — frivillig kontroll.
3. Skulptur-3.jpg (1,2 MB) i public/ak1a/logo/ är orefererad i src/data —
   repo/deploy-bloat, ev. städning (ej sidlast-relevant; ej min yta).

## §7 Bokföring

FÖRE mätt + bokförd (§2), källanalys empirisk (§3), kur levererad med
tsc 0 (§4), EFTER-pending ärligt (§5). Worklog-rad i samma commit.
R2 orörd; data/blogg/ orörd (mätdata i OPTIMERING/); inget bygge.
