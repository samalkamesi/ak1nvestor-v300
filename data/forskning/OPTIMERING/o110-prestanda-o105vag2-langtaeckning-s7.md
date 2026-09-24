# o110 — Spår 7: O105 VÅG 2 — lang-bindningen ut till ALLA spegelsidor (26 list-sidor + dataset-byggare)

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest auto-s7-1789893903450, fönster 2026-09-20)
**Anspråk:** `data/vakten/s7-o110-sidfooter-serverbindning-u2-ansprak-2026-09-20.md` (disk-först, FÖRE val — omatch mot slutobjekt noteras i §0)
**Kur-commit:** `785f3753` (28 filer: 26 sidfiler + dataset-sidor.tsx + kontraktstest)
**FÖRE-tabell:** bärs av o101 §2 (bygge 9RBeu, Lighthouse mobil 4G): /en/blogg TBT **994** · /ar/blogg **616** · /blogg **316** · /en 280 · /ar 473; CLS 0 samtliga.

## §0 Val och objektförskjutning (ärlighet)

Anspråket skrevs för "o101-kuren (sidfooter/brodkrumma server-bindning)" — under
kartläggningen konstaterades att **o105 redan levererat själva kuren** (Kur A+B,
commit d83c73ec, deployad i adfa846e-bygget 07:51:53Z). Objektet försköts enligt
o105 §6:s egen köpost 1 till dess **våg 2**: lang-attributet ut till de 26
spegel-listsidor + dataset-byggare som fortfarande hydratiserade footer+smula.
Köpost 2 (public/-städ) tos av syskonet s7-u3 som o111 (f72a8312) — ingen
duplikation, öppen bokföring.

## §1 Kuren (mekanisk, en rad per fil)

- **26 list-sidor** (13 en + 13 ar): `lang="en|ar"` i `<SeoPageShell>`-anropet —
  start, kurser, medlemskap, fas3, prenumeration (2 anrop/fil: fallback + huvud),
  certifikat, laroplan, om-oss, manifest, dagens-pass, transparens, logga-in,
  fas2-ansok. Prenumeration = prisyta (R2): ENDAST attributet, noll prisröring
  (o105 §6:s "tier: ENDAST attribut-passthrough"-not tillämpad).
- **dataset-sidor.tsx** (2 anrop: index + bransch): `lang={lang}` — sv faller
  automatiskt tillbaka på klientbindningen (shellen: spegel = en||ar), så
  /{en,ar}/dataset + /{en,ar}/dataset/[bransch] får serverbindningen utan
  nya sidfiler.
- **Orörta av empty-handling:** aspekt/bolag/tier = sv-only utan speglar
  (attribut-passthrough blir no-op; R2-ytor orörda).

Effekt: samma som o105 men på hela speglarfamiljen — footerns 81 element +
smulnav hydratiseras ALDRIG på någon spegelsida; sidetiketterna SSR:as rätt
(våg 81-garantin), DOM identisk, sv-rötter helt oförändrade (klient-MGTM).

## §2 Kontraktstest (F-sektion, verktyg/testa-s7-o105-footer-etiketter.mjs)

F0 exakt 14 shell-anropande spegelfiler per språk (13 våg-2 + blogg från o105;
[slug]-speglar + dataset nås via byggarkomponenter = D7/D8/F2) · F1 ALLA bär
lang · F2 dataset-sidor `lang={lang}`. **46 PASS 0 FAIL** (A–E orörda gröna).

## §3 Processfynd: deployfönstret röjer ocommittat src-arbete (öppet bokförd)

Första edit-omgången (26 filer + dataset + test, ~10:4x–10:5x lokal) RÖJDES av
prod-synkens byggförberedelse 08:57:29Z (NY KOD → c999adde; tracked-filer
återställda mot HEAD; upptäckt via testfilens tillbakagång och git status).
Arbetet gjordes OM och committades DIRECT. Doktrinen "håll trädet committat"
(AGENTS.md trådens permanentens) är även en arbetsmetod-försäkring: under
pågående fabriksfönster ska varje edit-batch committras innan nästa :x7-poll.

## §4 EFTER-mätning (o105 §4:s kriterier) — DEPLOYAD 09:22:36Z, BUILD_ID W2XS0EyY3HCKQWqLOYIAg

Deploy: 10 commits (04ae492e, merge), kur-commit 785f3753 verifierad förfader
(git merge-base). Två OOM-dödade byggförsök (09:00, 09:10 — infra, känd
tsc-fas-RAM-peek-post) före landningen. Verktyg: prestanda-lighthouse.mjs
(mobil 4G, localhost, n=2 pass A/B + riktat C på /en/blogg), rådata i
`lighthouse/*-s7u2o110-efter{A,B,C}*.json` (15 rapporter).

| Sida | FÖRE (o101 §2, bygge 9RBeu) | EFTER n=2 (W2XS0) | Kriterium | Utfall |
|---|---|---|---|---|
| /blogg (sv) | TBT 316 · CLS 0 | **329,5** (368/291) · CLS 0 | ±15 % | ✓ (+4,3 %) |
| /ar/blogg | TBT 616 · CLS 0 | **344** (441/247) · CLS 0 | ≤ 550 | ✓ (−44 %) |
| /en | TBT 280 | **230** (234/226) | (obs) | ✓ (−18 %) |
| /en/blogg | TBT 994 · CLS 0 | **1129** (1125/1133; C-pass 1091) · CLS 0 | ≤ 500 | ✗ |
| / (sv SPA) | — | 415/932 (instabil, känd) | (obs) | obs |

**prod 200 ×5 https** (/ · /blogg · /en/blogg · /ar/blogg · /en) ✓ ·
**CLS 0 i ALLA 15 mätningar** (o100-nivån hållen) ✓ · LCP/FCP inom ±15 % på
mätobjekten ✓ · Gränssnittsvakten: nästa cron-löp = bevakning (o92-precedensen).

### §4.1 /en/blogg-anomalin (öppen, med dataunderlag)

Kurens mekanism BEVISAS av /ar/blogg (−44 %) och /en (−18 %) på samma träd —
men /en/blogg ligger stabilt ~1 100 ms (n=3: 1125/1133/1091 — ej brus).
Fördjupning i rapporterna: script-lasten är IDENTISK FÖRE/EFTER (15 script,
254 KiB, samma topp-chunkar 2feezv/02vzzrg/095w8h) — ej payload. Mainthread:
scriptEval 997→960 (oförändrad), styleLayout 472→490 (oförändrad),
"other" 1381→1480 (+7 %). Fönstret bär 20+ commits utöver kuren (bl.a.
54e7a59e AI-Mentorn +2 motorer, s6-fönstrets 57 motorer) — attribution kan
ej isoleras utan A/B på samma träd. o101 §3.4 dokumenterade en↔ar-ordnings-
instabiliteten (994/616) redan FÖRE kuren; deltat har STORRATS (nu 786 ms).
**Köpost till spåret:** riktad /en/blogg-sond på vilofönster (longtask-
snapshot per chunk, CDP) + ev. A/B med AI-Mentors-widgeten avstängd —
hypotes: widgetens motorregister-hämtning i hydratiseringsfasen.

## §5 KVD-slutläge

src ENDAST Write/Edit · tsc 0 via pre-commit-grinden (785f3753 passerad) ·
kontraktstest 46/0 · INGET eget bygge (prod-synken äger; 08:57-bygget OOM-
dödades 09:00 av infra — läke serverad, ombygge nästa poll bär denna commit) ·
R2 orörd · data/blogg/ orörd · syskonytor orörda (u3:s o111 public/-städ deras).
