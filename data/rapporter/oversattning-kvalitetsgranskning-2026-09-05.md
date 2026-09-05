# MÖS — manuell kvalitetsgranskning av publicerade kursblocköversättningar

- **Datum:** 2026-09-05 (våg 62, uppdrag "status + kvalitet")
- **Granskare:** översättningsagent våg 62 (manuell genomgång — svenska/engelska/arabiska)
- **Underlag:** 30 SLUMPVIS utvalda (seed 62, Mulberry32 — deterministiskt, reviderbart) publicerade
  `kursblock`-rader ur lagret: 15 engelska + 15 arabiska, ur populationen 629 en + 621 ar
  (1 250 publicerade kursblock totalt, system_events-backend, dedupe senaste-vinner).
  Alla 30 raderna är skapade 2026-09-04 13:45 (importörens våg 54-import) med poäng 100.
- **Metod:** svensk källtext jämförds rad för rad med översättningen: termer mot termbankens
  intention, sifferparitet, meningsbarhet/idiomatik, tillagda/utelämnade innehåll.
  Domskala: **bra** (publicerbar profesional nivå) · **ok** (fullt korrekt innehåll, stil-/
  terminologinotering) · **behöver-förbättring** (faktiskt fel: termfel, sifferskevhet,
  påhittat/utelämnat innehåll, obegriplig mening).

## Sammanfattning

| Dom | Antal | Andel |
|---|---:|---:|
| bra | 25 | 83 % |
| ok | 4 | 13 % |
| behöver-förbättring | 1 | 3,3 % |

**Slutsats: kvaliteten på de publicerade kursblocken är HÖG.** Andelen
behöver-förbättring (3,3 %) ligger långt under tröskeln för åtgärd (> 20 %) —
**någon höjning av granskningströskeln (90 → 95) krävs INTE av detta underlag**,
och trösklarna lämnas orörda (styrelsens bord). Observera dock att urvalet
speglar IMPORTÖRENS handöversättningar (100 p, autopublicerade) — de nya
MyMemory-batchutkasten (mål ~60 p, status utkast i granskningskön) har inte
nått publicering ännu och bör granskas separält när kön växer (se not nedan).

## Engelska — 15 rader

| # | Scope | Dom | Notering |
|---|---|---|---|
| 1 | `the-intelligent-investor:kap4:block1` | bra | Alla tal bevarade (25/75, 0 %, 100 %, 65/35, 35/65); trogen och idiomatisk ("Ytterligheterna är prognoser" → "The extremes are forecasts") |
| 2 | `mina-basta-investeringar:kap9:quiz2:a0` | bra | "Det har ett tak…" korrekt återgivet med tankestreck och paralellism intakt |
| 3 | `mina-basta-investeringar:kap2:quiz3:a0` | bra | "buys back its own stocks" — korrekt ("shares" vanligare i finanssammanhang, ingen fel) |
| 4 | `mina-basta-investeringar:kap9:titel` | bra | "Vinst-tillväxtens kraft" → "The power of earnings growth" — exakt |
| 5 | `mina-basta-investeringar:kap13:quiz1:a0` | bra | Rak meningsfras, korrekt |
| 6 | `the-intelligent-investor:kap8:block1` | bra | Mr Market-blocket: 1973/25 %/1987/2008 bevarade; "humor" → "mood" rätt val; flytande engelska |
| 7 | `mina-basta-investeringar:kap1:quiz3:a2` | bra | Korrekt |
| 8 | `zero-to-one:kap9:block5` | bra | "tjugofyra månader" → "twenty-four months" (utskrivet, som källan); "dubbla eller avveckla" → "double or wind down" korrekt |
| 9 | `mina-basta-investeringar:kap11:quiz3:tips` | bra | Korrekt |
| 10 | `mina-basta-investeringar:kap4:quiz3:a3` | bra | Cyklisk vinstlogik korrekt återgiven |
| 11 | `zero-to-one:kap9:block1` | bra | Lång hemlighets-block: alla fyra trender (inkrementalism/riskaversion/självgodhet/platta världen) troget återgivna; källans stavfel "sakna infrastrukturen" rätt tolkat som "missing infrastructure" |
| 12 | `the-intelligent-investor:kap21:block1` | ok | Innehållet korrekt (2003, kap 8/20 bevarade), men slutraden "one mood at a time not to share" är knagglig engelska (källans avsiktliga rytm går förlorad) — publicerbar, stilnotering |
| 13 | `mina-basta-investeringar:kap3:quiz1:a0` | bra | P/E-cykel-logiken exakt |
| 14 | `mina-basta-investeringar:kap17:quiz2:q` | bra | PEG-frågan korrekt |
| 15 | `mina-basta-investeringar:kap2:quiz3:a2` | bra | "A newly started company without revenue" — korrekt ("startup" hade varit stramare) |

## Arabiska — 15 rader

| # | Scope | Dom | Notering |
|---|---|---|---|
| 16 | `mina-basta-investeringar:kap8:block1` | ok | Mycket stark helhet (nettokassa → صافي نقد, pappersvinster → أرباح دفترية). TERMINOLOGINOTERING: "belåningen" → "الرفعة المالية" — korrekt term är "الرفع المالي" (financial leverage); avviker från standardterminologin |
| 17 | `the-intelligent-investor:kap7:block2` | ok | "undervärderade" översatt ordagrant "يُقدَّر بأقل من قيمته" — begripligt men klumpigt; "أكثر إجابة مُهمَلة" hade varit naturligare. Innehållet korrekt |
| 18 | `mina-basta-investeringar:kap14:quiz1:a0` | bra | "Konkurrenterna" → "المنافسون" — exakt |
| 19 | `zero-to-one:kap9:block6` | bra* | "bro" → "جسر" (bro) är en KORREKT översättning — men se anomality nedan: källan är en diagramtypsnyckel, inte prosa |
| 20 | `mina-basta-investeringar:kap14:quiz2:q` | bra | Fråga om ledningens utsagor korrekt |
| 21 | `mina-basta-investeringar:kap6:quiz1:q` | bra | Citatfrågan "den kan inte falla mer" troget återgiven med arabiska citattecken |
| 22 | `mina-basta-investeringar:kap14:quiz3:a1` | **behöver-förbättring** | Källan: "Vilken är den största risken för verksamheten?" — översättningen LÄGGER TILL "خلال الدورة" ("under cykeln") som inte finns i källan, och använder pluralis ("المخاطر الكبرى") mot källans singularis. Tillagt innehåll i ett quiz-svarsalternativ ändrar betydelsen i förhållande till frågan. Fyra deterministiska kontroller fångar inte detta (inga tal, struktur identisk, längd normal) — EXAKT den typ av fel MÖS mänskliga granskning finns för |
| 23 | `zero-to-one:kap11:block1` | ok | Kultur-blocket starkt och troget ("designad samhörighet" → "انتماء مُهندَس"); grammatisk hakning i "يملك مجالًا واحدًا ملكية تامة" (borde "بملكية تامة") — begripligt |
| 24 | `mina-basta-investeringar:kap5:quiz3:q` | bra | "drillen" → "التمرين" korrekt |
| 25 | `mina-basta-investeringar:kap5:quiz1:q` | bra | "tvåminutars-drillen" → "تمرين الدقيقتين" — elegant |
| 26 | `mina-basta-investeringar:kap13:quiz3:q` | bra | "täckta köpoptioner" → "خيارات الشراء المغطاة" — korrekt finanskterm |
| 27 | `zero-to-one:kap10:block6` | bra | Grundvall-blocket: "tioårstes" → "أطروحة عشر سنوات", V01 behållen, "löptid" → "أجل البرنامج" acceptabelt; små stilnoteringar |
| 28 | `mina-basta-investeringar:kap3:quiz2:a2` | bra | Förvärv av konkurrent korrekt |
| 29 | `mina-basta-investeringar:kap6:quiz2:tips` | bra | "noll analys" → "صفر تحليل" — ordagrant men fungerar |
| 30 | `mina-basta-investeringar:kap14:block1` | bra | Lynch-blocket helt genomarbetat: bolagsstämma → الجمعيات العمومية, investerarrelationer → علاقات المستثمرين; "glädjeändor" → "التشجيع" är en lätt meningsglidning (bättre: "النهايات السعيدة") men budskapet bevarat |

## Anomali-fynd under granskningen (viktigt för systemet)

1. **VISUELL-BLOCK ÄR DIAGRAMTYP SNYCKLAR, INTE PROSA.** 870 av 69 501
   kursblockskällor är block av typ `visuell` vars content är en diagramtyp
   ("skala", "cykel", "donut", "bro", "radar", "sankey", "bubbel" …) som
   `KursSteg` switchar på: `<VisuellBlock typ={String(content)}/>`. **42 av dessa
   är redan publicerade som översättningar** (21 en + 21 ar, t.ex. "radar" →
   "الرادار", "cykel" → "الدورة" OCH "الحلقة" — inkonsekvent). En översatt
   nyckel faller i VisuellBlocks "saknar renderer"-fall och diagrammet försvinner
   TYST ur spegeln. **Åtgärdat denna våg:** kurs-speglar.ts räknar visuell-block
   i progressandelen (kalla.ts-paritet bevaras) men översätter ALDRIG nyckeln.
   **Rekommendation (styrelsens bord):** exkludera `type:"visuell"` ur käll-
   registret (kalla.ts) i en framtida våg — det ändrar källuniversumet (69 501 →
   68 271) och måste samordnas med kurs-speglarnas räkneverk; dessutom bör de 42
   publicerade nycklarna sättas "inaktuell" via panelen.
2. **KÖNS UTKAST (MyMemory) HAR LÄGRE KVALITET — SOM DESIGNAT.** Granskningskön
   innehåller vid rapporttillfället 58 ui-utkast (poäng ~60) från batchen/cronden,
   t.ex. "Net-net-skannern" → "الماسح الضوئي على شبكة الإنترنت" ("internets-
   skannern" — termbanksfel: Net-net är ett värdeinvesteringsbegrepp). De är
   korrekt låsta i granskningskön och publiceras aldrig automatiskt. När kön
   växer bör en motsvarande manuell granskning göras på PUBLISERADE MyMemory-
   rader (denna rapport täcker importörens 100-p-rader).

## Appendix — fångar kontrollerna de typiska MyMemory-felen? (5 syntetexempel + ren kontroll)

Körda genom `korKontroller` (src/lib/oversattning/kontroller.ts) via tsx 2026-09-05
(våg 62). Syntetexempel konstruerade efter MyMemory:s kända felmönster:

| # | Felmönster | Fångad av | Poäng | Kontrollens detaljutdrag |
|---|---|---|---:|---|
| 1 | Termbanksterm felöversatt ("vinstmarginal" → "profit level", "skuldsättningsgrad" → "debt ratio") | termKonsistens | 60 | "MISSAR (2): vinstmarginal → profit margin; skuldsättningsgrad → debt-to-equity ratio" |
| 2 | Tal ändrat (25 % → "35 percent") | sifferIntegritet | 75 | "saknas: [25 …] extra: [35 …]" |
| 3 | Avkapning (halva texten borta, AR) | ALLA FYRA | 0 | termer + siffror (75, 1988) + stycken (2≠1) + längd (0,293 < 0,5) |
| 4 | Svensk text läckt in i arabiska ("procent", "Direktavkastning") | lateralKolla | 85 | "åäö-läckage i arabisk text: å" |
| 5 | Markdown-lista slagits samman till löptext | strukturIntegritet | 80 | "rader: 4 ≠ 1; markdown-*-listor: 3 ≠ 0" |
| 6 | REN kontroll — allt rätt | — | 100 | alla fyra gröna |

**Bonusfynd:** MyMemory konverterar nativt svensk decimal komma → engelsk punkt
("12,5" → "12.5"). Kontraktet (kontroller.ts §sifferIntegritet) kräver EXAKT
strängform — "en decimalteckenbyte är en ändring som syns" — så alla
decimaltalskällor hamnar på 75 p och Tvingas in i mänsklig granskning. Det är
AVSIKTLIG strikthet, inte ett fel: motorn (motor.ts prompt) föreskriver
bevarad strängform; kontrollen garanterar att ingen tyst siffertextändring
passerar. Kördes kontrollen med bevarat komma ("12,5 percent") → 100 p.

**Slutsats: kontrollerna fångar samtliga fem typfel** och ingen av felens
poäng (60/75/0/85/80) når autopubliceringskravet 100 — respektive
granskningströskeln 90.

## Rekommendationer sammanfattade

- Tröskeln 90 behålls (3,3 % allvarliga fel på 100-p-material; inget underlag
  för höjning). Trösklar ändras ej — styrelsens bord.
- Termbanken: lägg till "Net-net" → "Net-net" (en) / "نت-نت" (ar) samt
  "belåning" → "leverage" / "الرفع المالي" för att täcka de två terminologiska
  noteringarna (16, kö-exemplet) — termbanken är justerbar via panelen utan kod.
- Källa-anomali: visuell-block (punkt 1 ovan) — bordspunkt.
- Rad 22 (`mina-basta-investeringar:kap14:quiz3:a1`, ar) bör korrigeras i
  panelen (ta bort "خلال الدورة") vid nästa granskningsrond.

*Pedagogisk plattform — inte investeringsråd.*
