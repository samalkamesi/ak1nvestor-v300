# o123 — SKALFORMSVAKTEN: mimosa v1.6 synliggör array-doktrinens osynliga glidning (spår 8, s8-u3)

**Våg:** Kvalitetsvåg o123 — manifest auto-s8-1789920306682 (vakt 3/3), fönster 2026-09-20 16:07–16:2xZ.
**Protokollnummer:** reserverat under flock med verktyg/reservera-protokollnummer.mjs --nästa (hogstaKanda o122, 122 källträffar) — o117-doktrinen följd PRE-val; kontroll före commit: "reserverat, din: true".

## §0 — VAL (duplikatkontroll)

Anspråk disk-först 16:07:30Z (data/vakten/auto-s8-1789920306682-s8-u3-ansprak.md, manifest startat
16:05:06Z = tre syskon parallellt). Spårets 20+ levererade objekt granskade mot worklog (senaste:
o113 patch-kö omg 4 · o114 ts-import · o115 react-byggbevis · o116 mimosa v1.5 · o117 nummerreserv):
**mimosa full-scan-återmätning** (o116 §Kö / o29-kontraktet "återmät efter vågor som tillför filer")
var olevererad — baslinjen 1 888/0 sattes ~10:1xZ och spår 5/6/7:s vågor tillförde därefter 100+
filer. Under mätningen öppnades ett DJUPARE objekt (o110-mönstret, öppet redovisat): glidningen
som FÖRE-mätningen inte kunde se. Patch-kö omgång 4b/5-lastning lämnades uttryckligen åt syskonen
(anspråksfilen §Avstår).

## §1 — FYND OCH ROTORSAKA

**FÖRE-mätning (v1.5):** 2 024 filer, **0 fynd GRÖN** — baslinjen glidit 1 888 → 2 024 (+136 filer
på ~6 h) utan enda ny ohärdad interpolation. GRÖN men med ett instrumentblindhets-fönster:

**Rotorsakan (doktrin/motor-gap):** skal-kvotens doktrin (våg 137/148: sammansatta skal-kommandon
hänger) + o15/o59:s K2-mall kräver **execFileSync-ARRAYFORM för ALLA shell-anrop** — men mimosa-paritetens
CHILD_PROC_INTERP mäter endast **INTERPOLATION** (regex: `${`-mall, citerad `${`, `+`-konkat). En ren
författarskriven literal som `execSync("git push prod develop")` är utan runtime-injektion men ÄNDÅ
skal-form (/bin/sh tolkar metatecken; formen är det förebyggbara riskläget). **Form-glidningen var
totalt osynlig för vakten.**

**Bevisfilen som öppnade klassen:** `verktyg/_r113-push.mjs` — rondskript fött 2026-09-20 i strängform
med TRE execSync-literaler, TROTS o116:s uttryckliga bokning "rondskript föds direkt i arrayform
(K2-mall)". Bokningen var dokumentation, inte mekanism — glidningen systematisk, inte engångs.

**Inventering (v1.6, hela trädet):** 72 skalforms-anrop i 33 filer, fördelning:
- **Levande organverktyg (31):** feljagaren 8 · kraschvakt 6 · agentfabrik 4 · _f2-kur 4 ·
  _f2-status 3 · styrelse-rond 2 · _f2-slutverifiering 2 · granssnittsvakt 1 · process-trad 1
- **Rond-/vågskrap i verktyg/ (~20):** _r113-push 3 · _r107-sond/motorregen · _s1*/_s5*-sonder ·
  testa-studio-tabbar m.fl.
- **Dött arkiv + .zcode-speglar (~21):** data/vakten/skrap-arkiv/2026-09-19-trackade (r96) · .zcode/*

Alla 72 är literaler utan interpolation (annars vore de CHILD_PROC_INTERP-high redan) — klassen är
doktrinbrott, inte akut sårbarhet. Därför: INFO-nivå, inte fynd (SSRF_EXTERN_LITERAL-mönstret;
"vakten sänker ALDRIG nivå för att bli grön" — info är inte sänkning, klassen var aldrig high).

## §2 — KURER

**K1 — instrumentet (huvudleverans): mimosa-paritet v1.6**
Ny info-klass `CHILD_PROC_STRANG_LITERAL`: exec/execSync vars FÖRSTA argument är en ren strängliteral
(`"`/`'`, utan `${`, ej `+`-sluten — dessa täcks av INTERP-grenen). Regex
`/\b(?:exec|execSync)\s*\(\s*(["'])[^"']*\1\s*[,)]/` — ordgräns + `(?:`-ickefångande alternation
skiljer exec/execSync från execFileSync (doktrinens härdade form; backreferens \1 = citatet).
Rapporteras med kontext "skalform — doktrin: execFileSync-array", blockerar aldrig GRÖN. Känd gräns
dokumenterad i källan: radbaserad motor — literal på egen rad under anropet ses inte (samma gräns
som alla klasser sedan v1.0). Version + FYNDKLASSER-lista + v1.6-motivering i rubriken uppdaterade.

**FELFUNNET OCH KURERAT UNDER LEVERANSEN (svitens värde bevisad):** första implementationen bar
backreferensen `\1` mot fånggrupp 1 = `(exec|execSync)` — citattecknet skulle matcha texten
"execSync" → klassen tyst. Svitens 2 nya FAIL fångade felet DIRECT (falskt negativt = exakt den
dödstyp vakter finns för); kuren `(?:exec|execSync)` + `\1`-citat. Debuggad med isolerad
regex-körning + tmp-katalog innan grönt.

**K2 — kurbatch 1 (aktiva organ, smalt och bevisat):**
- `verktyg/styrelse-rond.mjs` (HUVUDCRONEN, var 3:e timme): import + 2 anrop →
  execFileSync("node", ["verktyg/…"], …). **Levande ekvivalensbevis:** organism-halsa körd via exakt
  den nya arrayformen = HELSPROV 0 RAD/0 GUL/12 GRÖN, identisk utdataform som rundens egen journalrad
  bär. (organ-fabrik --evolvera har sidoeffekter — ekvivalens bärs av mönsteridentiteten + syntax.)
- `verktyg/_r113-push.mjs` (bokningens bevisfil): import + 3 git-anrop → execFileSync("git", […], …)
  med dokumentationsrad som pekar på o123/K2-mallen.

**Medvetet EJ kurerat (etapp 2-bokning, §5):** feljagaren/kraschvakt/agentfabrik/_f2-familjen/
granssnittsvakt/process-trad (26 anrop) — maskinens organ-system som förtjänar egna vågor med
driftbevis per system (kraschvakten är självläkarens hand; en formbugg där = tyst död). Engångs-
sonder och dött arkiv = ingen kurrisk (de körs aldrig igen).

## §3 — BEVIS

| Bevis | Resultat |
|---|---|
| Svit FÖRE (v1.5) | ALLA PASS (26) |
| Svit EFTER (v1.6) | **ALLA PASS 30** (26 oförändrade + 4 nya: dubbelcitat-literal → info · enkelt citat → info · execFileSync-array triggar ALDRIG · interpolerade förblir INTERP-high utan STRANG-dublett) |
| Full-scan v1.5 FÖRE (återmätningen) | 2 024 filer / 0 fynd GRÖN — glidningen +136 filer mätt, 0 ohärdade |
| Full-scan v1.6 FÖRE kur | 2 025 filer / **72 STRANG_LITERAL-info** / 0 fynd GRÖN — klassen öppnad, trädet inventerat |
| Full-scan EFTER kur | 2 025 / **67 info (−5 exakt)** / 0 fynd GRÖN; SSRF-klasserna 96/147/23/1/2/1 IDENTISKA — kurerna noll sidoeffekt |
| node --check | GRÖN ×4 (mimosa · svit · styrelse-rond · _r113-push) |
| tsc projektbinär | exit 0 (src/ orörd) |
| Bygge | INGET (prod-synken äger) |
| Rådata | data/vakten/_s8u3o123-mimosa-{fore,v16-fore-kur,efter}.json (gitignorerad körningsdata) |

## §4 — KOLLISIONER

Syskonen s8-u1/s8-u2 (samma manifest, parallella fönster): inga anspråksfiler på disk vid start;
mina ytor = mimosa-paritet + sviten + styrelse-rond + _r113-push — styrelse-rond.mjs är rundens
fil men ingen rond-process körde under fönstret (ps-verifierat; senaste rond 14:43:46, nästa ~17:43
kör den arrayform som nu är commit-tidigare + ekvivalensbevisad). o116:s skrapskyddsläxa tillämpad:
OOMEDELBART git add efter edits (prod-synkens rent-träd varning i hälsoprovet 16:1xZ var MIN
pågående yta — commit stänger den). Protokollnummer o123 reserverat under flock (femte
kollisionsklassen som verktyget nu mekaniskt förebygger).

## §5 — BOKNINGAR (nästa våg)

1. **Etapp 2 — organens skalform (26 anrop, 6 filer):** feljagaren 8 · kraschvakt 6 · agentfabrik 4 ·
   _f2-kur 4 · _f2-status 3 · _f2-slutverifiering 2 · granssnittsvakt 1 · process-trad 1. Kur per
   system med driftbevis (kraschvakt: lägessond; agentfabrik: ko-torrkörning; gränsnittsvakt:
   --bas=localhost-läge). Mål: STRANG_LITERAL 67 → < 30 (rest = engångssonder/speglingar som kan
   lämnas eller städas vid skrap-arkiveringsronder).
2. **Referensbas förnyad:** 2 025/0 fynd + 67 STRANG-info (v1.6) — återmät efter vågor som tillför
   verktygsfiler; STRANG-räknaren får inte STIGA i levande filer (den är nu mätbar doktrinometer).
3. **Fabriksmanifestmallen** kan få raden "nya verktyg föds i execFileSync-arrayform" (o117 §6 +
   o116 §Kö, fortfarande huvudagent-yta).

R2 orörd — inga priser/tier/publicering; data/blogg/ orörd; .env* orörda; src/ orörd.
