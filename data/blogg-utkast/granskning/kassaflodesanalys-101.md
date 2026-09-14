# Granskning m9: kassaflodesanalys-101

- **Utkast:** `data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json` (m9-fabriken, m9-fabrik-v2, status=utkast)
- **Granskare:** fabriksagent (m9-granskningsomgång), 2026-09-14
- **Bedömning: FLYTTKLAR EFTER RÄTTNING** (1 lätt rättning utförd — utkastet är rent efter denna)

Publicering är kundens beslut (R2): filen är INTE flyttad till `data/blogg/` och databasen är orörd.

## 1. Källor — md5-kontroll

| Källfil | md5 i utkast | md5 aktuell | Utfall |
|---|---|---|---|
| data/portfolj-system/bolagsunivers.json | f4cee65860922e53ded546aefaf7ca02 | f4cee65860922e53ded546aefaf7ca02 | MATCHAR |
| data/varumarke.json | 9b906e4204a759db24c2c78b4b332e18 | 9b906e4204a759db24c2c78b4b332e18 | MATCHAR |

Båda källor oförändrade sedan urdraget — nyckeltalen har härletits direkt ur aktuell fil. Ingen omräkning krävd.

## 2. Siffror — 14 av 14 urdrag verifierade mot bolagsunivers.json

Oberoenende härledning med node-skript (median = sorterad lista, mittenvärde/medel av två mitten):

| Urdrag | Utkastets värde | Återhärledning | Utfall |
|---|---|---|---|
| FCF-marginal median | 10,8 % | 0,10785 → 10,8 %, n=92/100 | ✓ |
| FCF-avkastning median | 3 % | 0,0301 → 3,0 %, n=87 | ✓ |
| Konverteringsgrad median | 0,78 | 0,7750, n=84, 29 st >1,0 | ✓ |
| Fördelning fcfYield | 26 / 28 / 33 / 9 | 26 / 28 / 33 (inkl. neg.) / 9 — summa 26+28+33=87=n | ✓ tal; notation tvetydig → fynd F1 |
| KINV-B.ST | 65,6 % | 0,6564 | ✓ |
| ORES.ST | 63,9 % | 0,6386 | ✓ |
| INDU-C.ST | 62,4 % | 0,6235 | ✓ |
| PLD | 56 % | 0,5599 | ✓ |
| NFLX | 52,5 % | 0,5249 | ✓ |
| AKRBP.OL | -3 % | -0,0297 | ✓ |
| VOLCAR-B.ST | -4,5 % | -0,0454 | ✓ |
| PSNY | -30,8 % | -0,3084 | ✓ |
| RWE.DE | -69,6 % | -0,6958 | ✓ |
| CAST.ST | -72,9 % | -0,729 | ✓ |

**Konverteringsgradens härledning kontrollerad i djup** (uppdragets särskilda krav):
- Aritmetiken håller: (FCF/omsättning) ÷ (nettoresultat/omsättning) = FCF ÷ nettoresultat när båda marginalerna delar omsättningen som nämnare. Brödtexten redovisar härledningen öppet och korrekt.
- Urvalsregeln reproduce­ras exakt: **båda fälten mätta OCH nettoMarginal > 0** → n=84, median 0,7750 (avrundat 0,78), 29 bolag över 1,0 — alla tre värden matchar. (Alternativregler testades: båda-mätta utan nettofilter ger n=91/median 0,72; positiv-kvot ger n=81/0,81 — ingen annan rimlig regel ger utkastets kombination, och brödtexten dokumenterar just den korrekta regeln.)
- Brödtextens topp-trio konverteringsgrad verifierad: TELIA.ST 4,26 ✓ · FABG.ST 4,09 ✓ · VAR.OL 3,57 ✓ (se dock fynd F4).
- Global topp-5 och botten-5 i FCF-marginal matchar brödtextens listor exakt (65,6 / 63,9 / 62,4 / 56,0 / 52,5 respektive -3,0 / -4,5 / -30,8 / -69,6 / -72,9).

## 3. Juridik — REN

- Ingen rådgivning: texten rings in som "en deskriptiv översikt, inte en värdering", listorna markeras "sortering av data, inte omdömen", och enskilda bolag hänvisas till "den manuella analysen". Inga rekommendationsverb (köp/sälj/undvik) förekommer.
- Endast ett lagrum nominellt: 2007:528 — inga blandade lagrum.
- Disclaimer sist i bodyn och förblir sist när kvitto-sektionen tas bort före export: "Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)."

## 4. Kvalitet

- Titel informativ med seriemönster; bär "(utkast)" som ska bort vid export (se F3).
- Disposition: 6 publicerande "##"-rubriker + 1 kvitto-rubrik som uttryckligen ska tas bort före export; ingress och body samstämmiga; svensk decimalform konsekvent (10,8 %).
- Internlänkar verifierade mot data och routes: `/kurser/km-003-kassaflodesanalysen` (slug bekräftad i llms-fragor.json + sokord/kurser-sv.md; route `src/app/(huvud)/kurser/[slug]`) ✓ · `/forskningsbiblioteket` (route finns) ✓ · `/blogg/v19-kapitalforbranning-analys` (data/blogg/v19-kapitalforbranning-analys.json) ✓.
- Disclaimer sist ✓. Fabrikens strukturkontroll (rubriker 7, strukturFel 0, disclaimerSist true) bekräftas av manuell läsning.

## Fyndlista

| # | Allvarlighet | Fynd | Åtgärd |
|---|---|---|---|
| F1 | LÄTT | Fördelningsmeningen "33 under 2 % — och 9 är negativa" är tvetydig: de 9 negativa är en DELMÄNGD av de 33 under 2 % (26+28+33=87=n), men fyrtalslistan kan läsas som disjunkta grupper med felaktig summa 96. | RÄTTAD i utkast-JSON:en — se diff nedan. |
| F2 | KOSMETISK | Urdragsnotering "AKRBP.OL … lägst rankade (energi)" är missvisande: RWE.DE (-69,6 %) är också energi och lägre. AKRBP är botten-5 globalt, inte lägst i sin bransch. Syns endast i kvitto-sektionen som ändå ska tas bort före export; inget talfel i brödtexten (den gör inget branschanspråk). | Ingen rättning — dokumenterad. |
| F3 | KOSMETISK | Titeln bär "(utkast)" som statusmarkering. | Bortses automatiskt vid export via panelen — exportnotis. |
| F4 | INFO | Tredjeplatsen i konverteringsgrad är oavgjord: VAR.OL och SINCH.ST båda 3,57. Texten listar tre högsta och utesluter ingen — korrekt men ofullständig. | Ingen rättning — dokumenterad. |

## Diff-rapport (rättning F1)

Ändrad ENBART i `data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json`, fält `bodyMarkdown` (1 rad):

```diff
- Bland 87 mätta bolag har 26 FCF-avkastning över 5 %, 28 mellan 2 och 5 %, 33 under 2 % — och 9 är negativa, det vill säga bolag som för närvarande förbrukar kassa i förhållande till sitt marknadsvärde.
+ Bland 87 mätta bolag har 26 FCF-avkastning över 5 %, 28 mellan 2 och 5 % och 33 under 2 % — varav 9 negativa, det vill säga bolag som för närvarande förbrukar kassa i förhållande till sitt marknadsvärde.
```

Effekt: summan blir entydigt 26+28+33=87 (= n mätta) med de 9 negativa uttryckligen som delmängd. Inga övriga fält rörda; `status` kvarstår "utkast"; JSON verifierad giltig efter rättning.

Notering om determinism-kvittot: `fabrik.kandidatMd5` (3331bfa49edcc2dc7a9a0fab64f22fe6) avspeglar mall-bodyn vid genereringstillfället och matchar inte längre efter granskningsrättningen — det är förväntat och rätt: kvittot är maskinens utsaga om vad som genererades, granskaren äger texten efteråt (kvitto-sektionens egen regel). Kvittot har medvetet INTE skrivits om.

## Slutsats

**FLYTTKLAR EFTER RÄTTNING** — rättningen (F1) är utförd; kvarvarande fynd är kosmetiska/informativa och blockerar inte. Utkastet kan tas till manuell panel-granskning enligt våg 66-regeln; publicering väntar kund (R2).
