# KONTROLL-GRANSKNING 2026-09-18 — Försvarsaktier: så analyserar du försvarsbolagens kontrakt (B15)

**Objekt:** `data/blogg-utkast/forsvarsaktier-sa-analyserar-du-forsvarsbolag.json` (SEO-branschguide B15, commit `1351f472` 2026-09-16 15:34, byggare s3-u1; status utkast)
**Granskad av:** fabrik auto-s1-1789758924831-s1-u3 (agentfabrik spår 1, 3/3), 2026-09-18 — anspråk `data/vakten/auto-s1-1789758924831-u3-ansprak.md` FÖRE arbetet (klaim-protokollet; 0 syskonanspråk på objektet vid klagetidpunkten)
**Bedömning: FLYTTKLAR EFTER RÄTTNING** (B1: räkneexempelns källkoppling — "orderstock kring 190 miljarder kronor … nivåer i linje med Saabs delårsrapportering 2026" är **motbevisad av Saabs egen rapportering**: orderstocken var 275 mdr SEK per Q4 2025 och **318 mdr per Q2 2026** (efter det polska ubåtsavtalet); verkliga täckningsgraden är ≈ 4,5 år, inte 2,9 — 2 ställen: kärnmening + sammanfattning; B2: readingMinutes 2 → 6, samma underskattningsklass som halvledar-B1, hälsa-B4 och konsumentaktier-B4) **+ 1 C-post** (SIPRI:s 2025-slutsiffra publicerad: 2 887 mdr USD +2,9 % — kompletteringsförslag) **+ 1 notis** (D1 publishedAt). I övrigt grönt hela vägen: **SIPRI 2024 källverifierad ordagrant** (2 718 mdr USD, +9,4 %, största årliga ökningen sedan kalla krigets slut — källans egna formuleringar), **Nato Haag källverifierad exakt** (5 %/3,5 %+1,5 % till 2035, skärpning av Wales 2014), Sveriges Nato-medlemskap mars 2024 ✓, aritmetiken 190 ÷ 65 = 2,92 och 6,5 ÷ 65 = 10,0 ✓ (exemplet räknar rätt — det är koppningen till verkligheten som snedrider), juridiken ren (0 av 8 rådglossor; varumärkesgrind 26 regexer, **0 FEL**, 3 A8-VARNING "kunder" med 7-guiders branschprecedent), 911 ren (0/6 mönster), **11/11 unika interna länkar HTTP 200**, struktur grön (byggarens ordtal 1 199 = textrensat exakt). Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragsrubrikens "m9-utkast #3" = auto-platshållare — forskningslaget-grona-av-100 granskat med KONTROLL 09-16 14:29 (syskon s1-u2) OCH korskonfirmerande 153-kontrollssond (dåvarande s1-u3); hela m9-serien 6/6 granskningsklar sedan `8448ef77`. Nionde omgången i raden som duplikatregeln tvingar pivot (syskonbokfört mönster, senast halvledar-omgångens u1 15:2x). FIFO bland ogranskade svenska rotguider: bil (09-16 08:57) och spel (09-16 08:57) lämnades åt syskon u1/u2 vid klaim-tidpunkten (inga syskonanspråk låg då) ⇒ **försvar (09-16 15:34, `1351f472`) = tredje i kön, detta objekt**.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Rättningarna levereras som diff-poster (`forsvarsaktier-sa-analyserar-du-forsvarsbolag-diff.json`, samtliga söksträngar maskinverifierade unika = exakt 1 träff i filen) för byggaragenten/kunden att verkställa.

---

## 1. Källor — fyra talbärare, tre källverifierade, en motbevisad

| Påstående i utkastet | Granskning | Dom |
|---|---|---|
| SIPRI: "omkring 2 700 miljarder dollar 2024, +9,4 procent — den största årliga ökningen sedan åtminstone kalla krigets slut … snabbaste ökningarna i Europa" | **Webbverifierad mot SIPRI:s egna publiceringar** (faktablad 2025-04-28 + pressreleas): "rose by 9.4 per cent in real terms to $2718 billion in 2024 … the steepest year-on-year increase since at least the end of the Cold War", drivet av Europa OCH Mellanöstern | ✓ källans egna tal ordagrant; "Europa" ensamt är sant men smalare än källan (se C1) |
| "stigit år för år sedan 2015" | SIPRI: "increased every year for a full decade" (10:e raka året 2024 = sedan 2015) | ✓ |
| Nato Haag juni 2025: "fem procent av BNP … till 2035 — varav tre och en halv procent till kärnförsvaret", skärpning av Wales 2014:s tvåprocentmål | **Webbverifierad** (Nato:s egen sida + värdnationen Nederländerna + CSIS/IISS): toppmötet 24–25 juni 2025, 5 % = 3,5 % kärnförsvar + 1,5 % relaterat, till 2035 | ✓ exakt |
| "Sverige blev Nato-medlem i mars 2024" | Medlemskap trädde i kraft 7 mars 2024 | ✓ |
| Saab: "orderstock kring 190 miljarder kronor och årsintäkter omkring 65 miljarder … nivåer i linje med Saabs delårsrapportering 2026" | **Motbevisad**: Saabs orderstock per Q4 2025 ≈ **275 mdr SEK** (rekordkvartal 100 111 MSEK order intake, Morningstar feb 2026) och per Q2 2026 **318 mdr SEK** (order bookings 68 393 MSEK, varav det polska ubåtsavtalet ~47 mdr; Saab pressrelease + Q2-transkript). Årsintäktsnivån ~65 mdr är rimlig (Q4 2025 sales 27 697 MSEK ⇒ årsnivå 2025/2026 ~63–70 mdr) — det är ORDERSTOCKEN som är fel | ✗ → **B1** |
| "Saab har redovisat kring 9–11 procent under 2020-talet" (rörelsemarginal) | Stämmer med Saabs redovisade spann 2020–2024 (8,2 → ~11 %); Q2 2026 fortsatt ~11–12 % | ✓ välgrundat |
| Gripen "levererades på 1990-talet, underhålls fortfarande" | Serieleveranser till Flygvapnet från 1996; kontinuerlig underhålls- och uppgraderingsverksamhet | ✓ |

**Universumet:** byggarens premiss "universumet saknar försvarsbolag" håller **vid bygget** — 0 poster med försvarsbransch-etikett då och nu (183-bolagsträdet idag; "saab"-träffen i filen är **SSAB**-stålanteckningen "JÄMFÖRELSERADEN SSAAB: SSAB-B.ST", falsk positiv). Däremot tillkom **Lockheed Martin (LMT) 09-17** — dagen efter bygget — klassad `bransch: "industri"` (CAT-noteringen i universumet: "öppnar USA/industri matta 3→5 tillsammans med LMT"). Guiden själv påstår INGENTING om universumet, så ingen felaktighet — men två notiser följer (flagga 2). Guiden saknar universumtal helt ⇒ superlativ-fyndklassen B1–B3 (finans/hälsa/konsument-serien) kan inte uppstå; textens "största" = SIPRI-citat, "en enda part" = inte rang.

## 2. Siffror — oberoende omräkning

| Påstående | Omräkning | Dom |
|---|---|---|
| Täckningsgrad "190 ÷ 65 ≈ 2,9" | 190/65 = **2,92** | ✓ aritmetiken — men KÄLLKOPPLINGEN fel (→ B1) |
| Marginal "6,5 ÷ 65 = 10,0 procent — mittpunkt i spannet" | 6,5/65 = **10,0 %**, spannet 8–12 mittpunkt = 10 | ✓ EXAKT |
| "Natos 5 % … varav 3,5 %" | 3,5 + 1,5 = 5 | ✓ källverifierad |
| Rekommenderad B1-rättning "315 ÷ 70 ≈ 4,5" | 315/70 = **4,50** | ✓ EXAKT (och 318/70 = 4,54 — källans egna tal ger samma slutsats) |

## 3. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN

- **Rådgivningsglossor** (8 mönster: köp/sälj-imperativ, rekommendera, bör du, aktietips, garanterad avkastning, köpa/sälja aktien — på title + description + body, maskinellt): **0 träffar**. Råverb-skanningens två träffar är deskriptiva och gröna: "köpare" (Staten är en kreditvärdig **köpare** — branschbeskrivning) och "sälja" (leverantören kan bara **sälja** till stater — affärsmodell, subjekt är bolaget, inte läsaren).
- **Utbildningsdeklarationer**: ingressen "Som alltid här: utbildning i metod, aldrig råd om enskilda aktier" ✓ · integratörsmeningen "Bolagsnamnen här är illustrationer av branschens struktur, inte värderingar av enskilda aktier" ✓ · disclaimer-sista-rad "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓.
- **Varumärkesgrind** (exakt replik av `kontrolleraText`, 26 regexer × 3 ytor): **0 FEL**, 3 VARNING — alla `\bkunder\b` (A8, föreslås "elever"). Dom: **legitim branschterminologi** — hela guidens kärna är "staten som kund"; samma A8-bedömning som byggarens KVD och 7 levererade guiders precedent. Ingen rättning.
- **Lagrum:** inga åberopas (SIPRI/Nato/Saab är källor) ⇒ ingen lagrumsblandning möjlig.

## 4. 911-referenser — REN

0 träffar på seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i title + description + body.

## 5. Länkar — 11/11 unika interna levande, verifierade mot sajten

| Länk | HTTP |
|---|---|
| /blogg/v12-intaktsstabilitet-analys · /kurser/km-069-orderbok-och-prissattning · /blogg/hur-raknar-man-roe · /blogg/skuldsattningsgrad-vilken-niva-ar-farlig · /kurser/km-010-evebit · /kurser/km-011-relativ-vardering · /blogg/v18-regulatoriska-analys · /blogg/peg-multipeln-svagheter-2026 · /kurser/se-03-forsvarssektorn · /blogg/sa-laser-du-en-svensk-arsredovisning · /blogg/komplett-guide-svensk-aktieanalys-2026 | **11 × 200 ✓** |

11 förekomster = 11 unika (byggarens KVD-anspråk "11 korslänkar verifierade" = exakt). Kursankaret se-03-forsvarssektorn levande — guidingen länkar hem till sitt kursankare som den ska.

## 6. Struktur och metadata

- Body **1 199 ord textrensat / 1 206 rå** · 7 `##`-rubriker · disclaimer sist ✓. Byggarens KVD-ordtal "1199 ord" = textrensat **exakt** (bättre än mallfelet i konsumentaktier-F1).
- **readingMinutes 2 → 6 (B2):** 1 199 ord på 2 minuter = **599,5 ord/min** — snabbare än samtliga 55 publicerade (max 240, konsumentaktier-mätningen 09-18). Bloggfamiljens kontrakt ~ord/200 (substansrabatt-domen 09-17; 0/55 följer ord/600): round(1 199/200) = **6**. Fjärde bekräftade fallet i klassen (halvledar-B1, hälsa-B4, konsumentaktier-B4).
- Sökordsdisciplin: "försvarsaktier" i title ✓ + ingress ✓ + H2 ("Vad är försvarsaktier — staten som kund") ✓.
- Title 58 tkn ≤ 60 ✓. Description 141 tkn ≤ 155 ✓. 5 tags ✓.
- **D1 (notis):** publishedAt 2026-09-16 = skapandedatum — exportvägen stämplar vid flytt; publicering förblir kundens (R2).

## 7. Flaggor

1. **Till -en-ägaren:** spegeln `forsvarsaktier-sa-analyserar-du-forsvarsbolag-en.json` (09-18 16:11, ogranskad) bär **identiska B1+B2-fel**: "190 billion kronor … in line with Saab's interim reporting 2026 … 190 ÷ 65 ≈ 2.9" (två ställen) och readingMinutes 2. Rättningarna speglas vid verkställning.
2. **Till dataägaren (spår 2):** Lockheed Martin tillkom i universumet 09-17 under `bransch: "industri"` — försvarssektors-sökningar på etiketten hittar den inte. Valfritt: överväg ett "försvarsindustri"-etikettämne för LMT (och framtida BAE/Rheinmetall/Saab AB) när sektorguider byggs vidare; guiden B15 påverkas inte.
3. **Till byggaren:** B1-rättningen GÖR EXEMPELET STARKARE — verkliga ~4,5 års täckningsgrad (mot 2,9) är upprustningens kvintessens och knyter an direkt till orderstocksavsnittets poäng. Verifiera slutliga exakta tal mot Saabs Q2 2026-delårsrapport (PDF på saab.com/ir) vid verkställning; källor för denna granskning: Saab Q2 2026-pressträff (orderstock 318 mdr; order intake 68 393 MSEK; Polens ubåtsorder ~47 mdr), Morningstar feb 2026 (275 mdr per Q4 2025, rekordorder 100 111 MSEK).
4. **Notis:** C1 är frivilligt styrkande — utkastets 2024-påstående är korrekt och historiskt avgränsat; ingen tvingande rättning.

## 8. Könotis åt nästa omgång

Ogranskade svenska rotguider efter denna (FIFO): detaljhandel (09-16 15:36), flyg (15:38), försäkring (22:16), media (22:16), livsmedel (22:17), lyx (09-17 03:26), e-handel (03:28), logistik (22:58), krypto (09-18 10:11) + 15 -en-speglar + kvartalspaket utan granskningsfil. Kollisionskontroll mot worklog + granskningsmapp + anspråksfiler före start. **Systemmönster att vänta:** readingMinutes 2 vid 935–1 400 ord förefaller seriegbrett (femte fallet) — sonda det FÖRST i varje ny granskning; Saab-koll: verifiera "i linje med rapportering"-kopplingar mot källans egna publicerade tal, inte mot byggarens minne.
