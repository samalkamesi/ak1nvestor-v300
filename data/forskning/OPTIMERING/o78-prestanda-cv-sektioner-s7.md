# o78 — PRESTANDA: content-visibility på under-vecks-SEKTIONER (Style & Layout-köposten på /kurser) — spår 7, s7-u3 3/3 [fabrik]

Datum: 2026-09-19 (00:1x–01:5x lokal). Anspråk disk-först:
`data/vakten/s7-o78-stylelayout-u3-ansprak-2026-09-19.md`.

## §0 Val + duplikatkontroll

- KOPOST (o76 §5): "Style & Layout 1 215 ms på /kurser (mainthread) —
  sonderingsvärd köpost." Ingen ägare i worklog (enda nämningen = själva
  bokningen). ÖPPET → detta objekt.
- LÄMNAT (andras ytor): 0el5nt6 error-overlay (o76 bokade den till drift/
  huvudagent); 2feezv-bootstrap (o45 §1-klassen); meny-register-kirurgi
  (kräver först o76:s EFTER-koll); prefetch/cache/läsbarhet/bild (stängda).
- Prod-läge vid mätning: prod-synken VÄNTAR-RAM för o76+o77 (prod kör
  0e7b116e-bygget 22:31Z) → FÖRE-mätningen mäter prod UTAN syskonens kurer.
  Även: huvudagenten landade våg 194 (8eb47de1) under sessionen — EFTER-
  mätningen kommer mäta HELA paketet. Den ISOLERADE kureffekten bevisas
  därför med proxy-A/B (§3), inte med prod FÖRE/EFTER.
- Font-ytan redan kurerad tidigare (koll innan hypoteser): display:
  "optional" alla fyra (våg s7-u3 09-15), mono preload:false (våg 96 D1),
  kursiv-serif preload (o54). De 3 preloadade woff2 på /kurser = inter +
  serif-normal + serif-kursiv. INGEN font-åtgärd i denna våg.

## §1 FÖRE-mätning (Lighthouse, kanonverktyget)

`node verktyg/prestanda-lighthouse.mjs s7u3o78-fore /kurser` (mobil-emulering,
localhost:3000):

- P54 · LCP 5 389 ms · TBT 902 ms · CLS 0
- mainthread-work-breakdown: scriptEvaluation 1 838 · **styleLayout 783** ·
  other 1 007 · scriptParseCompile 692 · parseHTML 177 · paintComposite 74
- 18 long tasks. (o76:s 1 215-ms-siffra bekräftad i klass: 783–1 215 ms
  lastberoende.)

## §2 Rotanalys — tre bevislinjer

**(a) Trace** (Lighthouse `--save-assets`, /tmp/o78fore2-0.trace.json):
UpdateLayoutTree 24 st/288 ms + Layout 71 st/348 ms. Tyngst: UpdateLayoutTree
156 ms @1 534 + Layout 158 ms @1 692 (dirty 643/643 = hela trädet) FÖRE
FCP 2 636. Andra bukten: UpdateLayoutTree 74 ms + Layout 36 ms + ~40 små
@6 675–8 000 (~4 s efter paint) — PalettVaktens 8 s-montering (o61/o76:s
område, lämnas).

**(b) DOM-karta** (`_s7u3o78-sond-dom.mjs`, mobil 412×844, CPU 4x, Slow 4G):
dokhöjd 16 452 px; 962 element; cv-klasser på KORTEN (24 register + 18
utvalda — o19:s leverans) men **284 element under vecket UTAN cv-skydd**:
kategoriväggen (1 223 px, 58 el), SocialProof-panelen (1 474 px, 55 el),
kurstips (364 px, 24 el), NastaSteg (230 px, 16 el), Sidfooter = hela
sitemap (2 145 px, 81 el). Höjderna = grund för reservationerna.

**(c) LoAF** (`_s7u3o78-sond-loaf-ab.mjs`): långa frames är JS-drivna
(blocking 626–964 ms); tyngsta skript: 2feezv-bootstrap 731 ms (o45 §1),
0el5nt6 error-overlay 215 ms, 0goqx1t1 156 ms. Chrome headless fyller inte
renderDuration/styleAndLayoutDuration (0:or) → LoAF otjänlig som A/B-mätare;
proxy-metodiken (§3) togs i stället.

## §3 A/B-bevis — proxy-metodik (isolera kuren utan bygge)

`_s7u3o78-proxy.mjs` (localhost:9999 → :3000; läge INJICERA=0/1; kandidat-
CSS injiceras FÖRSTA i `<head>` = hydrat-neutral plats). Lighthouse genom
IDENTISK kanal mot /kurser:

| Mått | Kontroll (proxy, utan CSS) | Kurprov (proxy, med CSS) | Delta |
|---|---|---|---|
| styleLayout | **1 014 ms** | **726 ms** | **−288 ms (−28 %)** |
| scriptEvaluation | 1 252 ms | 1 253 ms | ±0 (ren kontroll) |
| CLS | 0 | 0 | bevarat |

(Metodisk not: proxyn fördubblar LCP (~10,8 s) jämfört med direkt kanal —
absolutvärdena jämförs bara INOM kanalen; det är deltat som är beviset.)

## §4 Kur (5 filer, Write/Edit)

`content-visibility: auto` + mätt höjdreservation på fem sektioner —
samma garanti som kort-cv-familjen (DOM/SEO/hydrering orörda):

1. `src/app/globals.css` — nya klasser .cv-kategorivagg (76rem),
   .cv-socialproof (92rem), .cv-kurstips (23rem), .cv-nasta-steg (14rem),
   .cv-sidfooter (134rem) med dokumentation.
2. `src/components/ak1a/kurs-sok.tsx` — kategoriväggen får cv-kategorivagg
   (träffar även /en- och /ar-speglarna — samma komponent).
3. `src/app/(huvud)/kurser/page.tsx` — kurstips-wrapper + SocialProof.
4. `src/components/ak1a/seo-page-shell.tsx` — NastaSteg-wrappern (alla
   ~20 shell-sidor).
5. `src/components/ak1a/sidfooter.tsx` — footer-roten (alla sidor med
   Sidfooter).

CLS-säkerhet: reservation = sonderad mobilhöjd (≈ mätt värde) + "auto"-
nyckeln minns verklig höjd efter första rendering ⇒ inga stavhopp vid
scroll; Lighthouse-mobil (ingen scroll) mäter platshållarhöjden från start.

`tsc --noEmit` = **0** (ett transient .next/types-race med huvudagentens
våg 194-landning under sessionen gav falska fel i en körning; ny körning
med och utan mina ändringar: 0/0 — mina filer typar grönt).

## §5 Deploy + EFTER (pending prod-synk)

Commit i trädet (o63/o76-precedensen: prod-synken pullar --ff-only när
RAM-grinden öppnar — o76+o77+våg194+o78 landar tillsammans). EFTER-kriterier
(vakarövertag-barra):

1. prod 200 ×{/, /kurser, /blogg} https.
2. Lighthouse /kurser direkt mot prod-lokal: styleLayout väsentligt under
   FÖRE:s 783 ms (förväntan −250–300 ms från denna kur + o76/o77:s
   scriptEvaluation-bidrag), CLS fortfarande 0, poäng ≥ FÖRE:s P54.
3. Scroll-sond: kategoriväggen/socialproof/sidfooter renderar korrekt vid
   scroll (inga fastbrända platshållare), gränsnittsvakten GRÖN.

## §5b EFTER-DOM (2026-09-19, förd av s7-u3 i rond o83 — ur syskonrådata)

Käll-attribution: s7-u2:s fn2-fönster mätte /kurser 05:0xZ mot
pm2-minnets 139b24c1-träd (CV-kuren 10081b9a verifierad förfader —
`git merge-base --is-ancestor` 05:49Z); deras fulla rapport
`lighthouse/kurser-s7u2-o75o76o77-efter.json` lästes för
mainthread-work-breakdown. Domen förs i o83 §3 (rond-filen);
siffrorna här:

| §5-kriterium | FÖRE (§1) | EFTER (u2:s rådata) | Dom |
|---|---|---|---|
| 1. prod 200 ×3 https | — | 200 ×3 vid mättillfället | GRÖNT (då; se notis) |
| 2. styleLayout väsentligt < 783 ms | 783 ms | **463 ms (−320 ms / −41 %)** | **GRÖNT** (proxy-A/B:s −288 ms bekräftat på riktigt träd) |
| 2. CLS 0 | 0 | 0 | GRÖNT |
| 2. poäng ≥ P54 | P54 | **P95** (LCP 1839 · TBT 187) | GRÖNT |
| 3. scroll-sond + vakten | — | EJ MÄTT | REST (se nedan) |

Notis till kriterium 1: efter 05:42:55Z-deployen (475b62f4) svarar
/blogg + /ar + /en 500 (client-reference-manifest saknas — bygg-OOM-
seriens förgiftade .next/cache, dokumenterat i o83 §4); /kurser och /
lever 200. Scroll-sonden (kriterium 3) kan inte köras meningsfullt mot
trasiga speglar → BOKAS som rest i första vilofönstret efter prod-
läkningen (o83 §5); gränsnittsvaktens nästa cron-löp mäter själv.

Delad kredit ärligt: trädet bar även o75+o76+o77-kurerna vid
mättillfället, men styleLayout är CV-kurens eget mått (§0: A/B höll
scriptEvaluation ±1 ms isolerat) och mätfönstret var jämförbart rent
(1 zcode-barn enligt prod-synkens räkning). **Kuren döms LEVERERAD med
rest-scroll-sond.**

## §6 Rest + läxor

- Palettbuketten @6,7–8 s (UpdateLayoutTree 74 + Layout 36 + småbuskage)
  = o61/o61-EFTER-territorium; om o76:s EFTER inte äter den → ny köpost.
- 0el5nt6 (215 ms i LoAF) + 2feezv-bootstrap — huvudagentens poster.
- (en)/(ar)-kursernas KurstipsKort saknar wrapper-klass (komponentroten
  delas med min-sida/laroplan → lämnad orörd; deras kategorivägg är
  täckt via kurs-sok.tsx).
- Reservationerna är mobilmätnigar; desktop-läge lär sig "auto"-nyckeln
  vid första rendering — ev. desktop-förfinning som läxa om vakten ser
  skift.

## §7 Metod och ärlighet

- Lighthouse kördes via projektets kanonverktyg (prestanda-lighthouse.mjs);
  A/B:n via egen proxy med kontrollvariant — skillnaden kan inte förklaras
  av kanalen (scriptEvaluation ±1 ms).
- CDP-tracing via page-session levererade tomma events (Chrome-versionens
  beteende) → trace togs ur Lighthouse --save-assets i stället; LoAF-
  durations fungerade men style/render-fälten var 0:or i headless — båda
  gränserna dokumenterade i sond-skripten.
- En B-körning dog av style-injektion direkt i documentElement (bröt
  hydrat → tom body) — lärd läxa: injektion i head, aldrig html-roten.
