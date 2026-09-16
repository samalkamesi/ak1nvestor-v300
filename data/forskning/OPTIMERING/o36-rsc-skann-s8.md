# o36 — s8-u1 (försök 2): RSC-SKANNEN — artefaktkontraktet utökat till navigeringslagret (6519 .rsc / 0 saknade GRÖN) + kärnfix %-trunkering i lasRefs + syskonförlust-register efter rond 50-mergarna

Datum: 2026-09-16 kväll · Fabriksmanifest: auto-s8-1789577718944 (s8-u1, 1/3,
omstart — försök 1 underkänd: saknad LEVERANS-rad) · Roll: VAKT.
Anspråk: data/vakten/auto-s8-1789577718944-u1-ansprak-2.md (17:48:30Z, FÖRE arbetet).

## §0 Objektval + duplikatkontroll

Kartlagt FÖRE valet: o33 (artefakt-grinden), o34 (larm-eskalering v2),
o35 (fullscan-baslinje + ENOBUFS-revision + vaktkrasch-arkivering),
a96cf5c7 (prod-synk-Z-fixen) — samtliga levererade i föregående omgång.
**Valt: o33 §6 bokning 3 (evolutionsposten, helt olevererad): .rsc-skann.**
Avstått (dokumenterat): o34 §5:3 larm-källa v3 (rör syskonets yta); E34-kö 2
pulsvakt-tak (o30-ägaren/huvudagenten); next 16.3.2 (prod-synkens
installationsägande); cron-SCHEMALÄGGNING = daemon-yta (bokas, §6).

## §1 Rotorsaka — varför .rsc är E34:s kvarvarande blinda fläck

Artefakt-verifieringen (o33) mäter HTML:ernas kontrakt — men klientnavigeringar
(Varje länkklick i App Router) hämtar innehållet ur **RSC-payloader**:
`.next/server/app`-trädets `*.rsc`-filer (flight-data). Ett RAM-svält bygg som
emitterar HTML+flight-data men missar chunks ger: HTML 200 (httpsOk/varm
passerar), artefaktgrinden GRÖN (den läser bara HTML) — och första klicket på
en drabbad sida mister skript/stilar. Ytan är **5× HTML-ytan**: 6519 .rsc mot
1304 HTML (levande artefakt 54e4610c-bygget 16:40Z), **783 109 referenser —
100 % i /_next/static-familjen** (grep över hela korpusen: noll /_next-image-
eller andra runtime-familjer ⇒ kontraktet rent, inga undantag att vitlista).

## §2 Kur — verktyg/rsc-skann.mjs (NY) + kärnfix i artefakt-verifiering.mjs

1. **NYTT verktyg rsc-skann.mjs**: samma kontrakt (VARJE /_next/static-ref i
   VARJE *.rsc under .next/server/app MÅSTE finnas på disk under .next/static),
   KÄRNAN ÅTERANVÄNDS från artefakt-verifiering.mjs (import av lasRefs +
   refsokVag — samma regex, samma %-avkodning, samma semantik; verktyget äger
   bara .rsc-walken). Status enligt o24 §5: gron 0 / trasig 1 (E34-klassen i
   navigeringslagret) / okand 2 (saknad artefakt, 0 .rsc = tom artefakt aldrig
   grön, läsfel = okänd > gissning). maxRsc 10 000 (korpusen 6519 + 50 %
   tillväxtmarginal) med ärlig trunkeringsflagga. Ren fs-läsning, noll
   child-processer, noll nätverk; korpusen 55,8 MB à en fil i taget. CLI
   --json/--katalog/--max + SENASTE-lägesfil (data/vakten/rsc-skann-SENASTE.json).
   Integration i prod-synk/kraschvakt ÄR avsiktligt ej gjort — deploykedjan
   ägs av prod-synkens ägare (bokning §6).
2. **KÄRNFIX i artefakt-verifiering.mjs (mätblindhetsgren, hittad av eget
   test 7):** REF_MONSTER:s teckenklass saknade `%` ⇒ lasRefs TRUNKERADE
   %-kodade referenser mitt i (a%20b.woff2 → "a") ⇒ refsokVag:s %-avkodning
   kunde ALDRIG trigga från verkligheten (endast från direktanrop). Falsk
   trasig vid trunkat prefix som saknas; farligast: falsk GRÖN om trunkat
   prefix råkar finnas. Fix: `%` i teckenklassen (dokumenterad i källan).
   BEVIS: testa-rsc-skann.mjs fall 7 (a%20b.woff2 → fil "a b.woff2" på disk
   → GRÖN efter fixen; TRANSIG med trunkerad ref före); syskonets hela svit
   testa-artefakt-verifiering.mjs **12/12 PASS OFÖRÄNDRAD** efter fixen
   (deras test 6 berörs ej — /_next-image matchar aldrig static-prefixen;
   deras test 8 anropar refsokVag direkt); LEVANDE HTML-korpus efter fixen:
   GRÖN 1304 HTML / 80 unika refs / exit 0 (fixen har noll effekt på dagens
   rena korpus — 0 %-refs finns i prod idag; kur för morgondagens).

## §3 Levande bevis (rådata: data/vakten/rsc-skann-SENASTE.json)

`node verktyg/rsc-skann.mjs` → **GRÖN — 6519 .rsc-filer, 74 unika
referenser, samtliga på disk, 3 704 ms, exit 0.** test 10 (levande krav:
>6000 filer OCH status GRÖN — en trasig levande artefakt SKALL fallera
testet) PASS. Byggets interna kontrakt håller i navigeringslagret också:
HTML-lagret (1304/80) och .rsc-lagret (6519/74) delar chunk-uppsättning —
74 unika refs är delmängd-konsistent med HTML:ernas 80 (överlappande
chunks + font-familjen).

## §4 KVD

- testa-rsc-skann.mjs: **14/14 PASS** (grön/trasig/okänd×3/trunkering/%/
  kontraktsgräns /_next/image/determinism/levande×2).
- testa-artefakt-verifiering.mjs: **12/12 PASS** (syskonets svit orörd av
  kärnfixen — deras leverans håller).
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinär;
  src/ orörd).
- mimosa-paritet --doman . (o35 §5:1-regeln: nya .mjs utanför src/ ⇒ återmät):
  **957 filer / 0 fynd / GRÖN** — NY REFERENSBASLINJE 957/0 (o35:s 954 + detta
  vågs två verktyg + huvudagentens arbetsfil). Rådata:
  fullscan-efter-s8u1o2-rsc-2026-09-16.json. Klassträffar oförändrade
  (SSRF_INTERPOLERAD_FETCH 140 härdade m.m.) — de två nya verktygen föder
  noll nya träffar (ren fs, ingen fetch/shell/child-process).
- node --check ×2 GRÖN. INGET bygge, inget npm, inget lås (deployägandet
  respekteras). R2 orörd — inga priser/tier/publicering; data/blogg/ orörd;
  .env orörda.

## §5 VAKTFYND: rond 50-mergefamiljen displacerade syskonleveranserna (register)

Fakta (allt verifierat i fönstret 19:47–20:05 lokal): medan o34/o35-agenterna
skrev sina protokoll (19:20/19:29) låg deras verktygsändringar OCOMMITERADE i
arbetsytan (sessionsstartens git-status: M larm-eskalering.mjs, M pumpor-
daemon.mjs, M prod-synk.mjs, M skalfri-vakt.mjs, M testa-larm-eskalering.mjs,
staged D kvalitetsrapport-SENASTE.md). Huvudagentens mergekedja (7d01e671 →
1d6a5b02, "worklog förenad") + rond 51:s "städning av övergivet spår 8-skrap
... döda barn" (patch data/vakten/rond50-spår8-skrap-2026-09-16T17-46-30-118Z.patch,
131 KB) tömde ytan: **förlustregister:**
- **o34:s v2-kod (larm-eskalering.mjs tre-källor + tester + triggerarbete i
  pumpor-daemon/prod-synk): BEVARAD I PATCHEN** (diff-listan täcker samtliga
  fem filer) men ej i trädet — återleverans = patch-applicering + omkörning
  av deras svit. Protokollet (o34) + ådata överlevde otrackade.
- **o35:s cron-kur (vaktkrasch-arkivering i granssnittsvakt-cron.sh, §3):
  FÖRLORAD HELT** — varken på disk (grep vaktkrasch: bara gamla kommentarer,
  senaste commit 6ea6acda) eller i patchen (9 filer, ingen cron). Måste
  skrivas om ur o35 §3:s spec (två additiva radgrupper — liten insats).
- **o33 (09a5ec42) och a96cf5c7: OSKADADE** (commits är ancestors till HEAD;
  artefakt-verifiering.mjs lever — denna vågs kärnfix bygger på den).
Rotorsakan är känd familj: ocommittat arbete + aktiv merge/städning i samma
träd = clobber (våg 100, 8abb7000, o33:s stagna-immediately-läxa). Läxa till
fabriksbarnen (bokas §6): commit ÄR del av leveransen — protokoll utan commit
är ett fynd, inte en leverans.

## §6 Bokningar

1. **Återleverans o34 v2** (patch-applicering + testa-larm-eskalering-svitens
   omkörning) — patchen bär koden, o34 bär specen. Nästa s8-fabriksvåg.
2. **Återleverans o35 §3 cron-kur** (vaktkrasch-arkivering + retention ur
   o35 §3) — ingen källa finns, skrivas om; liten.
3. **rsc-skann i deploykedjan**: prod-synk/kraschvakt-ägaren väljer
   integration (kontraktet och CLI:n lever; ~4 s i deployfönstret).
4. **cron-roterad helträdsartefaktverifiering** (o33 §6:3:s andra halva):
   daemon/cron-yta = huvudagenten.
5. Baslinjen mimosa-paritet: **957/0** gäller nästa våg (o35 §5:1-regeln).
6. Fabriks-manifestprompten kan bära "commit är del av leveransen"-regeln
   (o34/o35-fallet: sviten GRÖN men koden displacerad innan commit).

— s8-u1 (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-16
