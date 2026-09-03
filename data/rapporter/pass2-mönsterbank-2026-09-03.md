# PASS 2 — Filomfattande mönsterbank-svepning av public/deep-courses.json

**Datum:** 2026-09-03 · **Pass:** 2 av 2 · **Verktyg:** `verktyg/pass2-mönster.mjs` (scan/fix/rescue/verify)
**Omfång:** ALLA 333 kurser · 2 916 kapitel · 8 211 quiz · samtliga textfält (title, summary, why, learn, chapters_list, history, chapters[intro/blocks/quiz], lynchSection, grahamSection, ak1Section).
**Metod:** Mönsterbank byggd från expertrapporterna A–E. Regler med åäö-säkra ordgränser (klass `[A-Za-z0-9_ÅÄÖåäö]`, REGEL 3 — JS `\w` räknar inte åäö). Varje mönster kontextgranskades FÖRE skrivning; tvetydiga fall lämnades orörda. Kirurgiska ersättningar i löptext — kurs-nycklar och slug-fält skyddas explicit av verktyget (identifierare får aldrig ändras).

**Resultat i siffror: 1 237 textersättningar (684 ändrade strängvärden i 192 kurser) + 8 platsmarkörer.**

---

## 1. Rättningar per mönstergrupp

### Grupp A — "-ör→-or"-släktet, "-är→-ar"-verb, åäö-degenerering (120 st)
| Fel | Rättning | Antal | Kurser |
|---|---|---|---|
| vågör/Vågör/VÅGÖR (inkl. alla sammansättningar: impulsvågör, förvärvsvågör m.fl.) | vågor | 60 | 16 |
| trädär | träder | 2 | 2 |
| städär | städar | 1 | 1 |
| förebådär | förebådar | 1 | 1 |
| därfär | därför | 1 | 1 |
| informationsöär | informationsöar | 1 | 1 |
| lönär | lönar | 11 | 9 |
| förvånär | förvånar | 1 | 1 |
| VD:är | VD:ar | 6 | 4 |
| ränter (fristående) | räntor | 2 | 2 |
| förmågör | förmågor | 3 | 2 |
| overdrivna / overvakningsrutinen / overmodig / overanalys ×3 / overdröjs* | över-… | 7 | 5 |
| FÖRBEREDELSEFRÅGÖR | FÖRBEREDELSEFRÅGOR | 1 | 1 |
| marknaktör | marknadsaktör | 1 | 1 |
| högmariginalaktör | högmarginalaktör | 1 | 1 |
| "ochför" | "och för" | 1 | 1 |
| "samma ända" | "samma ände" (ända-familjen; expert C:s precedent) | 6 | 6 |
| avmekanisiserar* | mekaniserar | 1* | 1 |
| mjuka bindestreck U+00AD | borttagna | 8 | 4 |
| langsamt→långsamt | **0 verkliga** — båda träffarna var kursidentifieraren `tanka-snabbt-och-langsamt` (skyddad, se §5) | 0 | — |

*overdröjs→överdröjs och avmekanisiserar→mekaniserar är rekonstruktioner — se §6.

### Grupp B — engelska läckor (175 st exkl. versal-tipsen)
| Fel | Rättning | Antal | Kurser |
|---|---|---|---|
| "varför detta matters" (kapiteltitlar m.m.) | "varför detta spelar roll" | 80 | 40 |
| "En systematisk approach till" | "Ett systematiskt angreppssätt för" | 60 | 10 |
| övriga "approach" (metodisk/datadriven/disciplinerad + bond-/ny-era-/obligations-approach) | "ansats" | 26 | 23 |
| "fiscal politik" | "finanspolitik" | 1 | 1 |
| "strategien" (dansk/norsk) | "strategin" (inkl. genitiv strategiens) | 6 | 5 |
| "Kina-USAs" | "Kina-USA:s" | 3 | 1 |
| sustained / opportunity / founded / spun off i svensk mening | — | **0 kvar** (experterna fixade samtliga) | — |

### Grupp C — "läg→lag"-systematiken (113 st · 53 kurser)
Filtäckande global reglering efter manuell granskning av ALLA 111+2 förekomster (varje kontext = lag-betydelse): Metcalfes läg ×2, "enligt läg" ×13, Newtons första läg, obligationslärans läg, de stora talens läg, de små talens läg, Greshams läg, Gutenberg–Richters läg, regressionens läg (Galton), Kassacykelns läg, Moore's läg, "läg om due diligence/brokers", "1697 års läg", "Kanadensisk läg", "överraskningens läg", tabellrubriken "Lag" m.fl. 0 fristående "läg" kvar; versaler ("Läg"→"Lag") hanterade.

### Grupp D — kinesiska/kyrilliska tecken (11 instanser, 24 CJK-tecken + 1 kyrilliskt ord — alla borta)
| Kurs | Fynd | Rättning |
|---|---|---|
| km-028-reverse-dcf | "kassaflöde och潜在的 för aktieåterköp" | "…och potentialen för aktieåterköp" (generell 潜在的=potentiella hade blivit fel här) |
| km-053-312reglerna | "identifiera潜在的 vinster" | "identifiera potentiella vinster" |
| km-038-techsektorn | "till供应链-efektivitet" (+ "nätverks effekter" ×3 i samma block) | "till leveranskedje-effektivitet" + "nätverkseffekter" |
| rk-10-korrelationsrisk | "händelse永久t ändra" | "händelse permanent ändra" (meningens inledande "kan" bekräftar tempus) |
| mk-01-bnp-och-tillvaxt | "resultat变动 samvarierar" (+ "beräknad med") | "resultatvariationer samvarierar" (+ "beräknat med") |
| sj-04-optionsbeskattning | "skapa额外的 vinster" | "skapa extra vinster" |
| blue-ocean ch1-quiz | "Att geografi avgår成功 eller misslyckande" | "Att geografi avgör framgång eller misslyckande" (även garble avgår→avgör) |
| blue-ocean ch4 | "Gridens fulla的应用" | "Gridens fulla tillämpning" |
| made-in-america ch0 | "sentimental瀚 retorik" | spåretecken bort — "sentimental retorik" |
| made-in-america ch1 | "så:刺激 att stimulera" | dubblett bort — "så: att stimulera" (kinesiskan = "stimulera") |
| mk-03-handelsbalans | "nегативt av kronnedgång" (blandat kyrilliskt/latinskt) | "negativt av kronnedgång" |

### Grupp E — mallfel (703 + 121 st)
| Fel | Rättning | Antal | Kurser |
|---|---|---|---|
| "av roa./roe./ebitda./p/e./arr./fcf." i quiz-tips | versaler | 703 | 198 |
| "kognitiva bias" (plural, gemen + versal K) | "kognitiva biaser" | 77 | 13 |
| "biaser särskilt relevant" | "…särskilt relevanta" (kongruens, expert D:s mall-precedent) | 7 | 1 |
| "Sann/Sanna mästerskap" | "Sant mästerskap" | 26 | 26 |
| AK1M1 → AKM1 | 4 | 4 kurser | |
| AK1M → AKM1 | 4 | 4 kurser | |
| "Esg-portfölj" | "ESG-portfölj" | 3 | 1 |
| gement "v07"/"v12" i löptext (endast 2 verkliga — övriga är kurs-identifierare) | V07/V12 | 2 | 1 |
| "från svenska börsen" / "undvita" | — | **0 kvar** (experterna fixade samtliga) | — |

### Grupp F — dubbelord (1 st) + viktiga falsklarm
- "ingenting om om" → "ingenting om" (km-028 ch2) — 1 st.
- att att / sig sig / i i / och och / eller eller: **0 kvar**.
- **Granskade och lämnade som KORREKT svenska** (viktigt för framtida pass): "det det är" ×7 (kleft-konstruktioner), "den den bästa/största" ×4, "är de de enda" ×1, "en en gång diversifierad / DCF:en en scenariomaskin / var och en en-raders tes" ×4, "var var din känsla/var stoppet" ×5, "till och med med en vikt" ×1, "rullas om om planen" (akm1, expert A:s legitima fall), "varnar Munger för för många beslut" (poor-charlies), "istället för för närvarande tillgångar" (km-030).

## 2. DATARÄDDNING — "sasongs"-block (8 st, platshållare insatta)

Expert A kände till 3; pass 2 hittade **5 ytterligare** filomfattande. Samtliga är `type="visuell"`-block vars innehåll degenererats till strängen "sasongs" (troligen en åäö-strippad diagrametikett "säsong(s)…" — etikettvokabulären i filen är annars skala/cykel/radar/bro/compound/donut/tidslinje/termometer/konvergens/bubbel/sankey). Originalexten kan inte återskapas. Ärlig platsmarkörstext insatt:

> "Detta stycke skadades i en tidigare databearbetning och ska återskapas — se data/rapporter/pass2-mönsterbank för spår."

| # | Kurs | Plats | Kapitel |
|---|---|---|---|
| 1 | blue-ocean-strategy | chapters[3].blocks[6] | Strategy canvas — att rita och läsa en värdekurva |
| 2 | blue-ocean-strategy | chapters[12].blocks[6] | Hållbarhet och förnyelse — när oceanen blir röd igen |
| 3 | origins-of-the-crash | chapters[12].blocks[6] | Svaret — Sarbanes-Oxley, Spitzer och det som verkligen ändrades |
| 4 | var-ekonomi | chapters[8].blocks[6] | Inflation — pengarnas tysta skatt och tvåprocentmålet (V07–V08) |
| 5 | bull-a-history-of-boom-and-bust | chapters[10].blocks[6] | Kollapsen 2000–2002 — dot-com-döden, Enron, WorldCom… |
| 6 | of-permanent-value | chapters[12].blocks[6] | Apple-hemligheten 2016 (V15, V20) |
| 7 | one-up-on-wall-street | chapters[11].blocks[6] | De kronologiska misstagen — från if only till break-even |
| 8 | principles-of-corporate-finance | chapters[10].blocks[5] | Leasing — att äga, hyra och skuldens förklädnader |

Övriga kortblock (1 222 st, etiketter som "skala"×202, "cykel"×177 osv.) verifierade som LEGITIMA diagrametiketter — inte skadade.

## 3. Identifierarskydd (kritiskt fynd under passet)

Kurs-nycklar och slug-värden innehåller medvetet åäö-fria identifierare (t.ex. `tanka-snabbt-och-langsamt`, `konfluens-varde-moter-vagor`). En tidig regelversion rörde slug + korsreferens för "langsamt"; skadan återställdes och verktyget skyddar nu `slug`-fältet hårt samt undantar identifieraren i A18. Nyckel=slug gäller för alla 333 kurser efter passet.

## 4. VERIFIERING (STEG 4) — allt grönt
- `JSON.parse` OK · **333 kurser · 2 916 kapitel · 8 211 quiz** (oförändrat mot baslinje och backup).
- 0 kvarvarande träffar på mönster A–F · **0 icke-latinska tecken** (CJK, kyrilliskt, fullwidth) · 0 "sasongs" · 0 mjuka bindestreck.
- Fullstrukturdiff mot backup: **0 avvikelser** i primitiva värden (ratt-kontrollsumma 7 380 = 7 380), **0 nyckelordningsavvikelser**, 0 extra/saknade nycklar; endast 684 strängvärden ändrade (avsiktliga pass-2-rättningar).
- Filformat bevarat: 2 indrag, LF, round-trip byteidentisk · 17 417 876 bytes (+1 560 netto = platsmarkörer + tillagd text).
- Backup: `tmp_parts/pass2/backup-deep-courses-före-pass2.json` · loggar: `tmp_parts/pass2/{scan-träffar,fix-statistik,rescue-logg}.json`.

## 5. Kvarvarande osäkra (markerade, ej gissade)
1. **svitgnågör** (elliott-wave-principle ch12, "flera svitgnågör i rad") — expert A:s osäker #9 kvarstår; troligen "svängningar".
2. **petrör** (technical-analysis-of-stock-trends, "priset petrör den intradag") — troligen "berör"; kvarlämnad.
3. **korskör** (mk-01, "matris som korskör branschproduktion med efterfrågan") — troligen "korsar"; kvarlämnad.
4. **omkör** (competition, "erosionsradarn — omkör nio-stegstestet årligen") — expert A:s osäker #12; kan vara medveten "om-kör".
5. **katalysör** (1 st) — troligen medveten -ör-agentmyntning i stil med aktör; lämnad.
6. **konstnadsför** (quantitative-value, Damodaran-EBIT-rensning) — otydig garble, okänt original.
7. **overdröjs→överdröjs** — endast diakritisk återställning; avsett ord kan vara "fördröjs"/"överdrivs". Bör faktagranskas.
8. **avmekanisiserar→mekaniserar** (DeMark-kursen) — rekonstruktion ur kontext (TD Wave = objektiv vågidentifiering); faktagranska.
9. **därör→"därför är"** (the-intelligent-asset-allocator, Bernstein-quiztips) — rekonstruktion; faktagranska.
10. **"compliance" ×11** (rk/sj-kurser) — bedömt som etablerat lånord med svenska sammansättningar (compliance-uppgift, compliance-strategi); lämnat medvetet. Engelskt citat i reminiscences ("boring from within") orört.
11. **Quiz-tips-termerna** ("definitionen av ROA./ROE.") — versalerna fixade, men termvalet i mallen kan missmatcha kursen (t.ex. "av ROA." i v09-roe-kursen) — innehållsfråga, ej språk.
12. **bf-11-mallens tomprosa** ("Grunderna i kognitiva biaser är centralt för att förstå…") — pluralen rättad men kongruensen "är centralt" och meningsinnehållet kräver omgenerering (expert B:s osäker #11-analog).
13. **Singular "den/denna kognitiva bias" ×14** — lämnad som o böjd lånordsform ("biasen" vore strikt korrekt); medveten avgränsning.
14. **kärnekvitet** (26 instanser, expert C:s kursintern term) — orörd.

## 6. Noteringar till coordinator
- Mönsterbanken är återanvändbar: `node verktyg/pass2-mönster.mjs scan|fix|rescue|verify` (från repo-rot). Verify läget ger grön/röd slutstatus och bör köras före varje publicering.
- Versal-garble-varianter (VÅGÖR, FÖRBEREDELSEFRÅGÖR) visar att åäö-skadorna även nått versalläge — framtiga svep bör inkludera versala former av hela -ör/-är-familjen.
- Inga commits har gjorts (enligt regler). tmp-filer ligger i `tmp_parts/pass2/`.
