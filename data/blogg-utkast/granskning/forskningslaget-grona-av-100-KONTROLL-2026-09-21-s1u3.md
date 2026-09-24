# KONTROLL 2026-09-21 — forskningslaget-grona-av-100: OBEROENDE KORSKONFIRMATION av s1-u1:s FLYTTKLART PAKET (s1-u3, omgång auto-s1-1789980325227)

**Objekt:** `data/blogg-utkast/granskning/forskningslaget-grona-av-100-FLYTTKLART-PAKET-2026-09-21.json` (u1:s leverans 10:52 denna omgång) med underlag `data/blogg-utkast/m9-ko/forskningslaget-grona-av-100-v1.json`
**Granskare:** s1-u3 — se slot-historiken nedan. Sond: `verktyg/_s1u3-m9forsk-paket-kontroll.mjs` — **51 OK · 0 FEL · 1 NOT** — plus omkörning av 09-16-sonden `.zcode/granskning-m9-forskningslaget-verify.mjs` — **47 OK · 0 FEL** mot dagens träd.

## Slot- och race-historik (dokumenterad för protokollet)

Uppdragstiteln "m9-utkast #3" var en slotdubbel (kassaflodesanalys-101-paketet levererat av förra omgångens s1-u3, commit ae3b8205). Pivot enligt köregeln: paketgapet i m9-familjen = forskningslaget + vagkartan. Anspråk disk-först 10:50 med forskningslaget exklusivt namngivet — men syskonet s1-u1 (som pivoterat från sin egen paketlevererade titel) skrev sitt anspråk och LEVERERADE sitt paket 10:52–10:53, fyra minuter efter mitt anspråk; race-fönstret mellan "kollisionskontroll körd" och "Write landat" är det dokumenterade protokollgapet (09-16-fallet, 4,3 s; här ~2 min eftersom båda satt i samma omgångsdispatch). u2 tog parallellt vagkartan (10:52–10:54) — **m9-familjen är därmed 6/6 paketlevererad.**

**Konsekvenshantering:** min påbörjade paketbyggare (som skrev samma filnamn som u1:s leverans och därmed överlappade den i racet) är RADERAD — en kvarvarande byggare skulle vid ovarsam omkörning skriva över u1:s granskade paket. Kvar som min bestående artefakt: kontrollsonden, denna konfirmation och diff-kvittot.

## Dom

**u1:s paket KORSKONFIRMERAT GRÖNT — 51/51 egna kontroller + 47/47 omkörda.** FLYTTKLART PAKET står; 0 ändringar från min sida.

## Kontrollblock

**Aktualitet och determinism (dagens träd 2026-09-21):** samtliga tre källor fortfarande md5-exakta (korstabell 33fe62a0… · vågvalidering b7194627… · varumarke 9b906e42…) · utkastfilen git-bevisat orörd sedan rättningscommiten b0ad7faa (diff HEAD tom) · fabrikens TORRKÖRNING (`--visa`, 0 rader skrivna): **"OFÖRÄNDRAT (skip vid --skriv)"** med kandidat-md5 60d18ca6… identisk med kvittot — evergreen-regeln håller, ingen ny version landar vid nästa --skriv · seed 904e0fcc reproducerad ur dagens filer. 09-16-sondens hela determinismkedja (statistik-objekt, mall-body byte-identisk 2 370 tkn, mallMd5 f095edf7, kandidatMd5, F1+F2-transformationen) omkörd GRÖN mot dagens träd.

**Siffror (oberoende omräkning):** fördelning 7/76/17/0 med summakontroll 100 · andelar 7 %/17 % · regim magert (0,07 < 0,08) · lägestextcitatinnehåll ordagrant · topp-3 (INDU-C 58,1/67 industri · NEM 55,1/71,1 material · INVE-B 54/62,9 finans) med tredjeplatsens entydighet (54 > NHY.OL 53,4) och aritmetiken 86,7/77,5/85,9 % · statusRegler-citat ×3 ordagrant · 10 branscher × 10 bolag · "oförändrad"-raden korsbelagd mot den publicerade utgåvan (samma korstabell-md5).

**Juridik — 2007:528 REN:** kontrolleraText-spegel (26 fraser, "giu") 0 FEL/0 VARN på både utkastets hela body och paketets hela yta (title+description+tags+body) · rådglossor 0 · "köp"/"sälj" endast negerat ("inget köp- eller säljbud") · "investeringsrådgivning" endast negerad (disclaimern) · endast lagrummet 2007:528 · utbildningsgrunden bärande · disclaimer exakt sista raden.

**911:** 0 träffar på sex mönster (både hela utkastfilen inkl. metadata och hela paket-ytan).

**Länkar:** /forskningsbiblioteket · /kurser/v09-roe · /blogg/komplett-guide-svensk-aktieanalys-2026 — statiskt belagda och **3/3 HTTP 200** mot localhost:3000.

**Paketkontraktet:** JSON giltig med exportnycklar · titel utan "(utkast)" · publishedAt null (R2: kundens klick) · kvittot fullständigt struket (0 av 8 kvitto-ord; mallens "kandidatregeln" i Fördjupa dig-länken är legitim och förväxlingsbart endast för en sökmaskin — dokumenterad i sonden) · paket-body == exakt kvittostrypning av utkastet (reprodukt, NFC-okänslig) · description bär nyckeltal + datering + icke-värdering · pillar/author/tags konforma · readingMinutes 2 = floor(439/200).

**Två egna sondbuggar rättade med motiv FÖRE dom** (ärligt bokförda): punkt/komma i aritmetik-jämförelsevärdena; route-grupp-sökvägen src/app/(huvud)/forskningsbiblioteket/. Dessutom två förväntan-kontroller skrivna om när paketet på disk visade sig vara u1:s variant, inte min byggares (tags-uppsättning och radbrytningskonvention) — själva race-indikatorerna.

## Drift-notiser (D-klassen, vidarebefordrade)

- D1 lever: kassaflodesanalys-101 bär ny okänd kandidat (9d79162b, underlag 09-21, 243 bolag) — paketet från 03:07 bygger på git-fast 100-bolagsunderlag och är obehörligt, men nästa --skriv landar en ny version som kräver granskning FÖRE publicering.
- D2 lever: branschmedianer bär kandidat 0431dd6c — samma klass.

## KVD

Endast nya filer (denna KONTROLL + tom diff + sond + anspråk + worklog). u1:s paket- och kontrollfiler orörda (lästa). Utkastet orörd. src/ orörd = INGET bygge. R2 orörd. data/blogg/ orörd.
