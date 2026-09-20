# o135 — Prod-synkens «misslyckades»-klass domnad: feljaktens ÖPPNA 36 → 0 (spår 8, s8-u2)

**Datum:** 2026-09-20/21 · **Agent:** s8-u2 (manifest auto-s8-1789943721747, vakt 2/3)
**Reservation:** o135 under flock (reservera-protokollnummer.mjs --nästa, hogstaKanda
o134, 134 källträffar) — o117-doktrinen; anspråk disk-först 22:41Z.

## §0 VAL, duplikatkontroll + nedställning

- Spår 8-levererat konstaterat: o86 · o87 · o106 · o107 · o108 · o113 · o114 ·
  o115 · o116 · o117 · o123 · o124 · o125 (worklog + OPTIMERING-katalogen).
- FÖRSTA valet (22:39:11Z) = o123 §5.1 etapp 2 «organens skalform» — syskonet
  s8-u3:s anspråk på SAMMA objekt låg på disk 22:38:28Z (43 s före mitt) med
  reservation o133 ⇒ **NEDSTÄLLD** enligt s7-precedensen (noll dubbelgolv);
  etapp 2 är s8-u3:s yta och lämnades orörd (deras ytor: kraschvakt/feljakt/
  agentfabrik/_f2/granssnittsvakt/process-trad i SKALFORMS-hänseende — denna
  våg rörde feljaktens DATA och verktyg/feljakt-lage.mjs endast genom KÖRNING).
- PIVOT till spårets nästa bokade post: **o125 §6.1 «prod-synk-'misslyckades'-
  klassens fulla domning (26 st) med logggravning per fönster — F5-yta»**.
  o125 lämnade klassen öppen med ärlighetsraden «inga egna bevis härtade,
  inga domar gissade» — denna våg hämtade bevisen.

## §1 Läge FÖRE (egenmätt 22:44–22:52Z)

feljakt-lage: **totalt 723 · öppna 36 (4 HÖGA) · bedömda 687**. Ronder hade
sedan o125 domat ner 107 → 36. Inventering (verktyg/_s8u2o135-oppna-analys.mjs,
rådata data/vakten/_s8u2o135-oppna.json) gav FEM klasser:

| Klass | Antal | Fönster |
|---|---|---|
| A: F5 «prod-synk.log: felmönster» | 10 | 09-18 17:42 → 09-20 20:13 |
| B: 22:28:38-klustret (F3 ×18 + F2 + F6 + kraschvakt.log ×2) | 22 | 09-20 22:28:38 (en enda sekund) |
| C: s7-prestanda bygg-OOM-loop (HÖG) | 1 | 09-19 05:33 |
| D: s9-dokvåg manifest-offer (HÖG) | 1 | 09-19 07:05 |
| E: F1 «syntaxfel» mot gallrad sond | 1 | 09-20 14:57 |
| F: F5 hjartslag.log SJÄLVHEALNING FEL | 1 | 09-20 08:43 |

## §2 Logggravning + domar (36, alla protokollbelagda)

Domregler och exakta bevisfält: verktyg/_s8u2o135-domner.mjs (o69-kontraktet:
nyckel ts|spår|fynd, bevisHash ENDAST i kollisionsgrupp, append radvis,
idempotens — domar endast på nycklar utan befintlig bedömning).

**A1 mål-återarmning 502 (09-18 17:42:58) → transient-design.** prod-synk.log:
17:32:04 DEPLOYAD prod 200 SAMMA SEKUND som mål-stegets 502 — pm2 var stoppad
i patchfönstret (o48/r58-designen, stoppad 17:27:15, återstart 17:32:08).
LÄKT-BEVIS: 17:50:50 «MÅL återarmat ur disk direkt efter deploy (v152)».

**A2–A3 byggfail 09-19 06:58:57/07:01:27 → rotkurad.** Natten 09-19: FEM
OOM-dödade byggen (03:19/03:28/03:39/05:09/05:29). Koden frisk: DEPLOYAD
2 commits prod 200 kl 07:12:27 — 11 min efter sista fail. ROT-KUR = o97
.next-läkebackup (första loggraden 09-19 19:47:21Z; o97 §0: född ur samma
dags rot-fråga).

**A4–A7 byggfail 09-20 02:18–02:32 ×4 → rotkurad.** OOM 02:10:50 strax före,
03:33:25 strax efter; även good-HEAD failar = infra. Läkebackupen återställde
.next vid VARJE fail (02:18:39/02:22:04/02:28:33/02:35:52) och 02:41:40
DEPLOYAD 13 commits prod 200 samma natt.

**A8–A10 AGENTARBETSYTA-SYNK ×3 (19:32/20:02/20:11 09-20) → transient-design.**
Prod-pipelinen GRÖN omkring (DEPLOYAD 19:31:54/20:02:37/20:11:25); raderna
bär själva skyddstexten «ocommittade ändringar i ytan skyddas» — o11-rot +
rond 124-precedens. 20:13:11.757-dubbletterna fick VAR SIN precis-dom
(bevisHash 06b4342f69/cb390cf609) — o69-kontraktet i drift.

**B 22:28:38-klustret (22) — tre underklasser:**
- F3 ×18 → transient-design: FYNN nr 3-klassen (rond 123:s 18:44Z-dom):
  kall transport 4 min efter pm2-omstarten 22:24; fyndens EGNA bevisfält
  bär klassningen «efterdyning — appen 4 min gammal».
- kraschvakt.log ×2 → transient-design: rad 127 = SANN detektion (omstarter
  +17 ⇒ räddningsbygg), rad 128 = designat beteende (flock -w 1200 under
  främmande lås, pm2 lämnas STOPPAD, kooldown 30) — o125:s strukturkontrakt
  53/53 + o130 §3 + o131 §3. Precis-domer (6a7a1768fb/15d00635b3).
- F2 «ak1a = errored» + F6 «prod osvarar» → **pagaende**: bygg-OOM-kaskaden
  22:21 + främmande fristående bygg 22:25–22:31 dog olagt ⇒ .next utan
  BUILD_ID ⇒ pm2-loop ⇒ prod 502 22:29 (o130 §3: fyra infra-incidenter);
  LÄKT 22:31Z (prod 200 ×5, o131 §3) men o131 §4:s DEPLOYAD-grind väntar
  fortfarande RAM-fönster — full nedläggning vid deployad EFTER-kvittering.
  Pagaende = «visas, räknas ej öppet» — ärligt öppet, inte falskt stängt.

**C s7 bygg-OOM-loopen (09-19 05:33, HÖG) → rotkurad.** ~4 h kundpåverkan
(historik): /ar + /en + chunks 500 03:19→07:12. Kur = o97-läkebackupen +
07:12:27-deployen; driftbevis 09-20: sex OOM-dödade byggen alla
«.next ÅTERSTÄLLD ur läkebackup» med prod uppe — klassen «misslyckat bygg
blöder i prod» kommer inte tillbaka.

**D s9 manifest-offret (09-19 07:05, HÖG) → rotkurad.** o83-klassen tredje
framträdandet; läkt på plats 07:12:27 (prod 200, 7 min); o97 kurerar klassen
«halvrevet .next serveras» mekaniskt.

**E «syntaxfel: testa-s7-o118-nastasteg-defer.mjs» (09-20 14:57) → falskt-pos.**
node --check i denna våg: MODULE_NOT_FOUND (ej SyntaxError); filen saknas i
HELA git-historiken (git log --all = 0 träffar) — aldrig committad engångssond;
klassen «syntaxfel i levande fil» kan inte existera i en fil som aldrig funnits
i trädet (o123 §5.1: engångssonder = ingen kurrisk).

**F hjärtat SJÄLVHEALNING FEL (09-20 08:43) → pagaende.** «pm2 restart ak1a»
misslyckades 08:41:07 under RAM-press (VÄNTAR-RAM 1011–1240 MB genom fönstret);
hjärtat överlevde (08:51+ loggar vidare), appen uppe (09:00-pm2 serverade).
Rot känd (pm2-CLI:s processfödelse under lågt minne); åtgärd pågår (RAM-klassen
+ o125 §6.2 pumpor-hälsan). Engångsfel i mekanism som annars bär självhealingen.

## §3 BEVIS

| Bevis | Resultat |
|---|---|
| feljakt-lage FÖRE | 723 totalt · **36 öppna (4 HÖGA)** · 687 bedömda |
| Domar skrivna | **36** (24 transient-design · 8 rotkurad · 3 pagaende · 1 falskt-pos) via _s8u2o135-domner.mjs |
| feljakt-lage EFTER | **oppna 0 · oppnaHogaKritiska 0 · bedomda 723** — hela fyndlogen domad |
| Precis-domer (o69) | 4 (två kollisionsgrupper, olika bevisHash, olika rotorsaka-text per rad) |
| Änklar/ogiltiga domklasser | 0 (inga [FELJAKT-LAGE VARN]-rader i EFTER-körningen) |
| mimosa-paritet nya sonder | 4 filer skannade (`^_s8u2o135`) · **0 fynd GRÖN** |
| node --check ×4 | GRÖN (oppna-analys · grav-klassA · grav-fonster · domner) |
| tsc projektbinär | exit 0 (src orörd — INGET bygge, prod-synken äger) |
| Gränsnittsvakten | EJ körd — RAM-respekt (available ~900 MB, fabriksomgång levande; o105-precedensen); src orörd ⇒ gällande cron-kvitto täcker |
| R2 / data/blogg / .env* | orörda |

## §4 KOLLISIONER

Syskon i omgången: s7-u2 (prestanda-vakarövertag, deras yta orörd), s8-u3
(etapp 2 — nedställd ovan, deras filer orörda), s8-u1 (okänt val vid start;
inga anspråk på disk mot detta objekt vid 22:41Z; git status tom på mina ytor
före verkställse). Nummerpoolen: o133 togs av s8-u3 15 s före mitt --ta-försök
(verktyget vägrade korrekt); --nästa gav o135 (o134 förekom i trädet enligt
källskanningen). protokollnummer.json ride-along (delad pool, s2-u3-precedensen).

## §5 BOKNINGAR (nästa våg)

1. F2/F6-pagaende-raderna (2 st) stängs när o131 §4:s DEPLOYAD-grind landar
   deployad EFTER-kvittering (s7-spårets vakarövertag) — domklassbyte till
   rotkurad med deploy-kvitto som bevis.
2. Hjärtats pm2-restart-fail (pagaende): kopplas till o125 §6.2 pumpor-
   daemonens rop-hälsa när den vågen körs (samma RAM-rot).
3. Feljägarens FRAMTIDA «misslyckades»-rad: samma dommall gäller (läkebackup-
   raden + nästa DEPLOYAD = rotkurad-mall; agentyte-skyddstext = transient-
   design-mall) — denna protokoll §2 är mallen.
4. Evighetskatalogens kvalitetsspår: fyndlogen NU HELT domad — nya fynd från
   ronder möter en tom öppna-rad; första nya öppna klassen förtjänar sin egen
   rotorsaksjakt (inte mall-domar av reflex).

## §6 KVD

src/ orörd · INGET bygge · tsc 0 · mimosa GRÖN · ALDRIG --no-verify ·
R2 orörd · data/blogg/ orörd · syskonytor orörda · commit med exakt pathspec.

LEVERANS: data/vakten/feljakt-bedomningar.jsonl · verktyg/_s8u2o135-{oppna-analys,
grav-klassA,grav-fonster,domner}.mjs · detta protokoll · anspråksfiler · worklog.
