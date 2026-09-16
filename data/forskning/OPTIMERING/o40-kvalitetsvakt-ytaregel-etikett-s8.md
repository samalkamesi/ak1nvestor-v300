# o40 — Kvalitetsvaktens 4 MANUELL-träffar stängda: yta-regelns döda glob (route-grupp) + A8-etikettundantag + FOMO-textkur (2026-09-16)

**Agent:** fabriksbarn s8-u3, manifest auto-s8-1789598726827 (3/3) · **Roll:** VAKT · **Spår:** 8 KVALITET & SÄKERHET
**Anspråk:** data/vakten/auto-s8-1789598726827-u3-ansprak.md (22:52Z, FÖRE arbetet)

## §0 Objektval + duplikatkontroll

Spårets levererade objekt granskade (o14–o38: full-scan-baslinjer, artefakt-/rsc-
verifiering, larm-eskalering v1/v2, statisk sond, pulsvaktens fjärde sinne,
deployklassning, döda länkar (o14 externa + omg1 interna), %-trunkering,
cron-kurer). Avstått med skäl: beroendehälsa (syskon u2 mätte 22:47:53Z),
cron-schemaläggningar (daemon-yta = huvudagenten), tsc-pump-bevis (syskon u1:s
o39). VAL: kvalitetsrapport-SENASTE.md (03:53:40Z) sektion 3 bar **4 MANUELL-
träffar** — vakten hittar, ingen åtgärdar = o22:s klass (journal bär signalen,
ingen översätter den till handling). Ingen tidigare våg behandlat dem.

## §1 Rotorsaker (tre, oberoende)

**R1 — YTA-REGLN:s glob var DÖD sedan födseln (fynd 1+2).** A8-varningen
"kunder" (\bkunder\b, VARNING) undantas på PRO-ytor enligt K8/B2B-BESLUT våg 61
bygg-2, implementerad som `PRO_YTA_RE = /^src\/app\/pro\//…` — men pro-rutterna
BOR i route-gruppen `src/app/(huvud)/pro/**`: "(huvud)" är osynlig i URL:en men
synlig i källvägen ⇒ globben matchade ALDRIG en enda app-sida. Följd:
`src/app/(huvud)/pro/admin/page.tsx` rad 77+135 ("AK1A PRO:s B2B-översikt —
kunder, rapportmallar…", "Översikt över B2B-kunder…") — exakt den B2B-
terminologi våg 61 avsåg undanta — hamnade i MANUELL-kön varje dag. Appens
runtime-spegel `src/lib/varumarke.ts` (kontrolleraText, `yta?.proYta`)
har INTE buggen — den använder deklarerad yta, inte filsökväg; felet var
enskilt vaktsverktygets.

**R2 — A8 saknar etikettskillnad (fynd 3).** `stock-analysis-view.tsx`
rad 263: objekt-label "Kunder" i sekvensen Bolaget · Affärsområden ·
Intäktsmix · **Kunder** · AKM1 · … — sektionsrubrik för BOLAGETS kunder
(fundamental analys-term: kundbas/kundkoncentration), inte AK1A:s användare.
A8 skyddar påståenden om relationen ("våra kunder"); en ett-ords-etikett har
ingen meningskontext. Rapporten dokumenterar själv att "skriptet kan inte läsa
svenska — varje träff kräver människogranskning" — men ingen gransknings-
instans fanns: falska positiva samlades dagligen i stället för att bedömas en
gång och regleras.

**R3 — FOMO-fras på kundsynlig yta (fynd 4, ÄKT träff).**
`superanalys.tsx` rad 470: "Sista chansen att justera innan resultatet." —
träffar varumärkesdatabasens VARNING-fras `sista[\s\-–]*chansen` ("FOMO/
knapphet — i CTA mot elev = FEL enligt praxis (A2)") och tonRegel 7:s
antiexempel ("SISTA CHANSEN!, countdown" = casino, inte gravör). Enda
förekomsten i src (grep 1 träff). Ingen kur hade gjorts — fyndet låg i
MANUELL-kön sedan rapporteringen.

## §2 Kur

1. **Yta-normalisering** (verktyg/kvalitetsvakt.mjs): `arProYta()` normaliserar
   bort route-gruppssegment — `kalla.replace(/\([^/)]+\)\/?/g, "")` — FÖRE
   PRO_YTA_RE-match: `src/app/(huvud)/pro/admin/page.tsx` → `src/app/pro/…`
   matchar. YTA-REGLN-raden i rapporten uppdaterad med normaliseringsnotisen.
   Kring-effekt verifierad: `(huvud)/kurser/…` → `src/app/kurser/…` ger ingen
   falsk pro-match; `(pro)/…`-grupp ger heller ingen.
2. **A8-ETIKETT-UNDANTAG** (verktyg/kvalitetsvakt.mjs): när A8-träffen är
   HELA strängvärdet (`text.trim() === m[0]`, dvs ensam objekt-label utan
   meningskontext) räknas den som etikett-undantag — räknare + egen
   transparent rapportrad (samma mönster som yta- och citerings-undantagen:
   dokumenterat, räknat, synligt varje dag — vakten döljer aldrig, o26:s
   designbeslut). Löptext-träffar på "kunder" varnar oförändrat; FEL-fraserna
   berörs ej (grenen ligger efter FEL-klassen i prioriteringsordning).
3. **FOMO-textkur** (src/components/ak1a/superanalys.tsx rad 470):
   "Sista chansen att justera innan resultatet." →
   "Efter detta steg låses dina val och resultatet visas." — samma
   informationsinnehåll (justering ej möjlig senare), gravör-ton, FOMO-mönstret
   borta. Ändring i src/ = Write/Edit-verktyget; leverans till prod sker vid
   prod-synkens nästa bygge (inget bygge i detta fönster — deployägandet).

## §3 Attribution — koden lever i syskonets commit (omvänd BASF)

Syskonet s8-u1 (o39, sektion 11 Typbaslinjen) commit:ade 1f43c167 kl
22:55:02Z med `git add` av den DELADE filen verktyg/kvalitetsvakt.mjs — mina
kurder (§2:1+2) och src-ändringen (§2:3) satt redan i working tree (mina
Edits 22:53–22:54Z, direkt staggade enligt clobber-läxan) och följde med:
commit-statistiken bär `superanalys.tsx | 2 +-` + `kvalitetsvakt.mjs | 146 ++`
(deras ~120 sektion-11-rader + mina ~26 kurder). Deras meddelande nämner bara
sektion 11. Attribuering rättad här (4f56baca-precedensen: "deras meddelande,
mina filer" — nu i omvänd riktning): kodändringarna i §2 är s8-u3:s analys
och kur; sektion 11 är s8-u1:s. Innehållet verifierat intakt i HEAD
(git show HEAD:… superanalys.tsx rad 470 = nya texten; grep-markerare 4
träffar i HEAD:s kvalitetsvakt.mjs). Denna våg committar protokoll + anspråk
+ worklog — kod-delen var redan i trädet.

## §4 Bevis

- **Vaktkörning EFTER alla kurder** (22:55:18Z): 11/11 sektioner PASS,
  SAMMANFATTNING **ANTAL FEL: 0 | MANUELLA: 0 | STATUS: GRÖN** — sektion 3
  "Förbjudna fraser" PASS med 0 manuella (före: 4). Undantagsräknare i
  rapporten: YTA-REGLN **4** träff(ar) (2 i components/ak1a/pro — förra
  rapportens 2, globben för de filerna levde alltid + 2 NYA från
  (huvud)/pro/admin/page.tsx via normaliseringen — siffrorna stämmer:
  2 gamla + 2 flyttade från MANUELL = 4) · A8-ETIKETT **1** (stock-analysis-
  view:s label) · MANUELL-kön tom.
- **Räknekoll R1**: rå \bkunder\b-träffar i (huvud)/pro: endast admin/page.tsx
  2 st (pro/page.tsx + priser/page.tsx = 0 — deras "kunder"-grep-träffar är
  "kunderna" som word-boundary-regexen korrekt ej träffar).
- **Mimosa-paritet återmät** (baslinjeregeln; verktyg/.mjs ändrad):
  standarddomän GRÖN — 0 fynd (86 träffar: 81 härdade + 5 externa literaler).
  METODFÅNGST dokumenterad: `--doman .` är en REGEX (punkten = valfritt
  tecken) som sveper ALLT inkl. mimosa-svitens egna farliga FIXTURER
  (testa-mimosa-paritet.mjs, 4 dokumenterade fixture-fynd — verktyget
  dokumenterar fällan själv i hjälptexten). o35:s bokningsformulering
  "kör mimosa-paritet --doman ." är FELAKTIG vägledning — korrekt
  full-scan-återmät = standarddomän (src/ + data/infra/) + vid behov
  '^verktyg/' separerat. Bokas som notis nedan.
- **tsc 0 fel**: vaktkörningens sektion 11 (o39) mätte "0 fel på 7.8 s" på
  detta trädskick (inkl. min src-ändring); oberoende fri körning fördröjd av
  pågående deploy (prod-synk byggde 1f43c167 fr.o.m. 22:57:26Z — node_modules
  mitt i npm ci gav MODULE_NOT_FOUND på tsc-binären; omkörning efter deployens
  klarsignal, se worklog).
- **Gränssnittsvakten**: berörd sida (superanalys, steg 23) är inloggad vy —
  ej i vaktens publika universum; textbytet 44→52 tkn i samma <p>-element,
  ingen layoutpåverkan. Vaktsenkast 17:33Z = 0 fel (publikt läge opåverkat).
- **node --check** verktyg/kvalitetsvakt.mjs: OK.

## §5 Bokningar / notiser

1. **o35 §5:1 formulering korrigeras**: "kör mimosa-paritet --doman ."
   → korrekt: standarddomän (ingen --doman-flagga) för full-scan-återmätet;
   --doman "." sveper allt inkl. sviternas fixturer (bevisat här).
2. MANUELL-kön tom ⇒ vaktkulturens instans saknas tills nästa träff dyker —
   larm-eskaleringen (källa 1, konfig-larm) bevakar inte kvalitetsrapportens
   MANUELLA-räknare; evolutionspost (huvudagenten): eskalera MANUELLA > 0
   som stående > 48 h om köns tomhet återkommer som problem.
3. Fynd 3:s etikettklass ("Kunder" som hela strängvärdet) är nu reglerad;
   framtida NAV-etiketter "Kunder" på säljytor syns i A8-ETIKETT-räknarens
   tillväxt — övervaka siffran i 07:02-rapporten.

— s8-u3 (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-16
