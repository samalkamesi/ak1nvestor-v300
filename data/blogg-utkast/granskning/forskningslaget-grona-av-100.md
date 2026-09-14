# Granskning m9 — forskningslaget-grona-av-100 (v1)

**Objekt:** `data/blogg-utkast/m9-ko/forskningslaget-grona-av-100-v1.json` (version 1, status utkast, m9-fabrik-v2, seed `904e0fcc…`)
**Granskad:** 2026-09-14 av m9-granskningsagenten (agentfabrikens granskningskö)
**Off-gräns:** publicering = kundens beslut (R2) — filen har INTE flyttats till `data/blogg/`, databasen orörd. Observera: en post med slug `forskningslaget-grona-av-100` FINNS redan publicerad (utgåva 1, `data/blogg/`, publicerad 2026-09-03 på samma korstabell) — utkastet är seriens uppföljande utgåva och vid ev. export ersätter den befintliga slugen.

## BEDÖMNING: FLYTTKLAR EFTER RÄTTNING

**Fynd: 2 (1 hög · 1 medel · 0 låga) · Rättningar: 2** — båda rättningarna är verkställda i utkast-JSON:en (endast `bodyMarkdown`); inga siffror ändrades.

---

## 1. Källor — md5 mot aktuell fil

| Källa | md5 i utkast | md5 i arbetsytan | Utslag |
|---|---|---|---|
| `data/portfolj-system/korstabell-grund.json` | `33fe62a0…bd6a` | `33fe62a0…bd6a` | **MATCH** — oförändrad sedan urdrag |
| `data/rapporter/vagvalidering-SENASTE.md` | `b7194627…cff8` | `b7194627…cff8` | **MATCH** — oförändrad |
| `data/varumarke.json` | `9b906e42…2e18` | `9b906e42…2e18` | **MATCH** — oförändrad |

Alla tre källor existerar och är byte-identiska med urdragsunderlaget. Ingen härledning ur "källan ändrad sedan urdrag" behövdes.

## 2. Siffror — verifiering mot källfilen (krav ≥ 5; 8 punkter + särskild antalskontroll)

Oberoende omräkning med node ur `korstabell-grund.json` (skapad 2026-09-03, 100 rader):

| Påstående i utkastet | Källfilen | Utslag |
|---|---|---|
| 7 gröna · 76 gula · 17 röda · 0 osatta | gron=7, gul=76, rod=17, osatt=0 | ✓ |
| andel gröna 7 %, andel röda 17 % | 7/100 och 17/100 | ✓ |
| INDU-C.ST AKM1 58,1/67 (86,7 %), grönt toppbolag industri | 58.1/67 = 86,7 % · status gron · industri · högst AKM1 av alla gröna | ✓ |
| NEM AKM1 55,1/71,1 (77,5 %), grönt toppbolag material | 55.1/71.1 = 77,5 % · status gron · material · näst högst | ✓ |
| INVE-B.ST AKM1 54/62,9 (85,9 %), grönt toppbolag finans | 54/62.9 = 85,9 % · status gron · finans · tredje högst | ✓ |
| statusregler citerade "ordagrant" | `statusRegler` i filen är tecken för tecken identiska (grön ≥70 % + täckning ≥60 % + inget port-brott; gul 50–70 %; röd <50 % eller port-brott V19 <12 mån) | ✓ |
| trösklar rikt ≥10 %/≤30 %, magert <8 %/>35 % | `src/lib/forskningslaget.ts:23-29`: 0.1 / 0.3 / 0.08 / 0.35 | ✓ |
| lägetextcitet "Forskningsläget är magert — 7 av 100 bolag klarar de strikta kraven, selektion avgör." | `src/lib/forskningslaget.ts:157` — ordagrant, med grona=7, antal=100 innsatta | ✓ |

**Särskild antalskontroll ("7 gröna av 100"):** äkta mot aktuell data — 7 rader med `status:"gron"` av 100 rader i den md5-matchade källfilen (egendata omräkning, inte fabrikens ord).

**Medianer och n-mätta:** utkastet innehåller inga medianpåståenden (inte heller urdraget) — intet att verifiera, inget fynd. N-mätt för status: 100 av 100 rader bär status, 0 osatta — överensstämmer med textens "0 osatta".

**"Fördelningen oförändrad sedan den publicerade utgåvan":** sant — den publicerade utgåvan (2026-09-03) bygger på exakt samma korstabell (md5 `33fe62a0…bd6a` i dess `fabrik.kallor`) med samma fördelning 7/76/17.

## 3. Juristen — AKM2-lägesbilder (metodik, aldrig råd)

**FYND 1 — HÖG (rättat):** Avsnittet "De tre högt rankade gröna bolagen" ramade in tre namngivna bolag som en rankning. Skyddsfraser fanns ("en deskriptiv rankning ur data, inte en värdering") men rubrik + tre namn med poäng i grön (positiv) kategori bär enligt granskningsdirektivet för AKM2-lägesbilder för stor risk att läsas som en topplista över attraktiva aktier — direktivet kräver namngivna bolag ENDAST som illustrativa exempel med "så räknar metoden"-formulering.
**Rättning:** rubrik → "Så räknar metoden — exempel ur det gröna utfallet"; inledande mening förklarar beräkningen (AKM1 / akm1MaxMojligt → andel → färg, grön ≥ 70 %) och anger uttryckligen att bolagen är illustrativa exempel, ingen värdering, inget köp- eller säljbud; varje listrad börjar "så räknar metoden:" och visar divisionen explicit. Siffrorna oförändrade — enbart inramningen är metodikförstärkt.

**FYND 2 — MEDEL (rättat):** Kvalitetsregression mot publicerad utgåva — jämförbarhetsnoten om att Industrivärden och Investor är investmentbolag (AKM-poängen mäter portföljförvaltning, inte drift) fanns i utgåva 1 men hade tappats i utkastet. Noten är viktig kontext för just dessa exempel.
**Rättning:** noten återinförd (omformulerad: "Det är information om metoden, inte fel i den.").

Övrig juristkontroll: ingen uppmaning att köpa/sälja, inget målbolag för placering, regimen och färgerna presenteras som utbildningsinnehåll med fasta trösklar, disclaimer sist med lagrum (2007:528) korrekt — inga ytterligare fynd.

## 4. Kvalitet

| Moment | Utslag |
|---|---|
| Titel | ✓ "Forskningsläget september 2026 — 7 gröna av 100 (utkast)" — "(utkast)" är m9-köns standardmarkör (jämför alla syskonutkast), stryks vid export |
| Disposition | ✓ 6 "##"-rubriker efter rättning (5 i mall-body när maskinens kvitto tas bort före export); logisk ordning: läge → regler → regim → exempel → förändring → fördjupning → kvitto |
| Svenska | ✓ efter rättning (svengelska "högt rankade" i gamla rubriken borttagen); tydligt, jargonfritt |
| Internlänkar | ✓ 3/3 verifierade: `/forskningsbiblioteket` (page.tsx finns), `/kurser/v09-roe` (SEO-objekt + `data/llms-fragor.json` + använd i flera publicerade poster), `/blogg/komplett-guide-svensk-aktieanalys-2026` (slug finns i `data/blogg/`) |
| Disclaimer sist | ✓ sista raden i body — gäller även efter det att kvittoavsnittet tas bort före export |
| Ingress | ✓ innehåller inga bolagsnamn, bara fördelning + regim + datering |
| Maskinens kvitto | orört (fabrik-blocket speglar genereringstillfället; granskarens rättningar dokumenteras här) |

## Diff-rapport (rättat av granskaren)

Ändrat ENBAST i `bodyMarkdown`, avsnitt 3 i bodyn. Siffror, källor, ingress, titel, status orörda.

**Före:**
> `## De tre högt rankade gröna bolagen` — "Bland de gröna bolagen har dessa tre högst AKM1-poäng i underlaget (daterat 2026-09-03) — en deskriptiv rankning ur data, inte en värdering:" — listrader "AKM1 58,1 av 67 möjliga poäng (86,7 %)" osv. — (jämförbarhetsnot saknas)

**Efter:**
> `## Så räknar metoden — exempel ur det gröna utfallet` — inledning förklarar formeln AKM1/akm1MaxMojligt och att exemplen inte är värdering/köp- eller säljbud — listrader "så räknar metoden: 58,1 / 67 = 86,7 %, över gröntröskeln 70 %" osv. — jämförbarhetsnot om investmentbolagen återinförd — avslutande urvals- och dateringsparagraf oförändrad.

**Efterkontroll (node):** JSON giltig · 6 rubriker · disclaimer sista rad · ingress namnfri · inga stavfel.

## Utslag

**FLYTTKLAR EFTER RÄTTNING** — rättningarna är verkställda och efterkontrollerade; utkastet kan tas till manuell panelgranskning. Vid ev. godkännande och export: stryk "(utkast)" ur titeln och ta bort avsnittet "Granskningsunderlag — maskinens kvitto" (maskinens egen instruktion, speglad i kvittot). Publicering förblir kundens beslut (R2).
