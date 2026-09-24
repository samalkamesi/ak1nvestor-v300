# KONTROLL-GRANSKNING 2026-09-20 — Kryptoaktier: så analyserar du kryptobolag (B22)

**Objekt:** `data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag.json` (SEO-branschguide B22, byggd 2026-09-18 10:11 av s3-u1; status utkast)
**Granskad av:** fabrik auto-s1-1789880830190-s1-u3 (agentfabrik spår 1, 3/3), 2026-09-20 — anspråk `data/vakten/auto-s1-1789880830190-s1-u3-ansprak.md` FÖRE arbetet (klaim-protokollet; 0 syskonanspråk på objektet vid klagetidpunkten)
**Bedömning: FLYTTKLAR EFTER RÄTTNING** (B1: Clarity Act-menings faktafel i RIKTNING — "röstade ner kryptolagstiftningen Clarity Act föll Coinbase med cirka 9 procent på en dag" är **motbevisad av källbilden**: senaten blockerade lagförslaget med rösterna 49–50 vid cloture-omröstningen 15 september 2026, Coinbase **steg cirka 9 procent sessionen FÖRE** omröstningen och **föll 4,5 procent i förhandeln** efter beskedet — utkastet har vänt på riktningen av nioprocentsrörelsen; B2: DAC8-datum — "Från och med 2027 ska leverantörer … rapportera" mot Skatteverkets verkliga regler: **rapporteringsskyldighet från och med skatteåret 2026** (DAC8 införlivat i svensk rätt 1 januari 2026), de första uppgifterna lämnas 2027 — utkastet förväxlar första lämnandeåret med skyldighetens startår; B3: readingMinutes 2 → 6, 1 171 ord — sjätte dokumenterade fallet i underskättningsklassen) **+ 2 C-poster** (C1: "mer än 3 procent" → "mer än 4 procent" — andelen är 4,02 %; C2: Clarity Act-påståendet saknar källrad i Källor-blocket). I övrigt grönt hela väga: **samtliga Coinbase-tal källverifierade EXAKTA** mot StockAnalysis (kursen 173,97 = källans previous close 18 sep, aritmetiskt återvunnen som 194,25 − 20,28; beta 3,39; TTM 6,04 mdr/−9,2 %/−987,8 M; FY2025 6,88 mdr/+9,4 %/1,26 mdr; 4 951 anställda; forward P/E ~165 och börsvärde 45,9 mdr konsistenta med 17 sep-läget via källans 18 sep-tal ÷ 1,1166), **Strategy källverifierad exakt** (845 050 BTC per 30–31 augusti 2026, snittkostnad ~75 412 dollar ≈ "omkring 75 400"), **Skatteverket källverifierad ordagrant** (30 % vinst, 70 % förlustavdrag, K4, avyttring vid betalning med vara), **Finansinspektionens nyhet verifierad med exakt titel och datum** (9 oktober 2025), **MiCA:s tre tokentyper + auktorisering + riskvarningar + lämplighetsbedömning verifierade** ur förordningstexten (recital 18/74–79/89), aritmetiken 16/16 motorräknad grön, juridiken ren (varumärkesgrind 26 regexer **0 FEL**, 1 A8-"kunder" = myndighetscitat med branschprecedent; 0 rådglossor; disclaimer negerad sist; juridikgrind-vakt: grund ✓ 0 fynd), 911 ren (0/6 mönster), **7/7 unika interna länkar registerfiler + HTTP 200**, universumet 0 kryptobolag i 219 poster (byggarens premiss håller). Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragsrubrikens "m9-utkast #3" = auto-platshållare — forskningslaget-grona-av-100 granskat med KONTROLL 09-16 (syskon s1-u2) OCH korskonfirmerande sond (dåvarande s1-u3); hela m9-serien 6/6 granskningsklar sedan `8448ef77`. Sjätte dokumenterade pivoten i släktet. FIFO bland ogranskade svenska rotguider enligt s1-u1:s könotis (worklog 15222): "Kö: krypto (09-18 10:11) + utbildningsaktier kvar" ⇒ **krypto = äldst, detta objekt**.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Rättningarna levereras som diff-poster (`kryptoaktier-sa-analyserar-du-kryptobolag-diff.json`, samtliga söksträngar maskinverifierade unika = exakt 1 träff i filen) för byggaragenten/kunden att verkställa.

---

## 1. Källor — sex talbärare: fyra källverifierade exakt, en motbevisad, en preciserad

| Påstående i utkastet | Granskning | Dom |
|---|---|---|
| Coinbase "stängdkurs 17 september 2026: aktiekurs 173,97 dollar, börsvärde 45,9 miljarder" | StockAnalysis (sida avläst 2026-09-19, data per close 18 sep): close **194,25** med dagsändring **+20,28** ⇒ previous close = 194,25 − 20,28 = **173,97 EXAKT**; börsvärde 18 sep 51,25 mdr ÷ 1,1166 = **45,90 mdr** — textens 17 sep-tal aritmetiskt konsistenta med källans 18 sep-tal | ✓ EXAKT |
| "beta på 3,39", "mellan 139 och 402 dollar under 52 veckor", "omkring 4 950 anställda" | Källan: beta **3,39**, 52-veckorsspann **139,11–402,16** (avrundat 139–402), anställda **4 951** | ✓ EXAKT |
| TTM sept 2026: "intäkten 6,04 miljarder dollar, ned 9,2 procent, nettoresultatet minus 987,8 miljoner"; FY2025: "6,88 miljarder, upp 9,4 procent, positivt resultat på 1,26 miljarder" | Källan: revenue TTM **$6,04B (−9,2 %)**, net income **−$987,77M** (→ −987,8 ✓), FY2025 **$6,88B (+9,38 % → "9,4" ✓)**, vinst **$1,26B** | ✓ EXAKT samtliga |
| "framåtblickande P/E omkring 165 … historisk P/E inte kan beräknas alls — resultatet är negativt" | Källan 18 sep: forward P/E **184,02** ÷ 1,1166 (dagens +11,66 %-steg) = **164,8 ≈ "omkring 165"** för 17 sep; trailing P/E "**n/a**" — negativt resultat bekräftat | ✓ konsistent + logiskt |
| Strategy: "över 845 000 BTC vid utgången av augusti 2026 … till en sammanlagd snittkostnad omkring 75 400 dollar per mynt", "mer än 3 procent av de maximalt 21 miljoner" | Bitcoin Ledger (via sökindex; strategy.com blockerskyddad) + Altcoin Buzz 31 aug 2026 + CoinDesk: **845 050 BTC, snitt ~$75 412** ≈ "omkring 75 400" ✓; andel = 845 050/21 000 000 = **4,02 %** — "mer än 3 procent" är sant men konservativt (→ C1) | ✓ exakt; C1 förstärkning |
| Halveringen "april 2024 … föll den till 3,125 bitcoin per block"; Coinbase "sedan noteringen i april 2021" | Fjärde halveringen 2024-04-20: 6,25 → 3,125 BTC/block ✓; COIN direct listing 2021-04-14 ✓ | ✓ |
| "senaten i september 2026 röstade ner kryptolagstiftningen Clarity Act föll Coinbase med cirka 9 procent på en dag" | **MOTBEVISAD I RIKTNINGEN**: senaten blockerade Clarity Act vid cloture-omröstningen 15 september 2026 med **49–50** (Amina Group-analys); Coinbase **steg ~9 % sessionen FÖRE** omröstningen och **föll 4,5 % i förhandeln** efter beskedet (Quartz: "fell 4.5% in premarket after gaining 9% the prior session"). Utkastet har flyttat nioprocentsrörelsen till fel sida av omröstningen; "röstade ner" är dessutom starkare än verkligheten (blockerad cloture — lagförslaget kan återkomma, IBD/Seeking Alpha) | ✗ → **B1** |
| "Från och med 2027 ska … leverantörer … rapportera … enligt DAC8-reglerna" | Skatteverket + EU:s DAC8-direktiv (2023/2226, baserat på OECD:s CARF): införlivat i svensk rätt **från 1 januari 2026** — rapporteringsskyldiga leverantörer ska registrera sig hos Skatteverket och rapportera uppgifter om kunder, transaktioner och innehav **från skatteåret 2026**; de första uppgifterna lämnas 2027. Utkastet sätter skyldighetens start vid första lämnandeåret | ✗ precisering → **B2** |
| MiCA: "Sedan 30 december 2024 tillämpas EU:s kryptoförordning MiCA (förordning (EU) 2023/1114). Delar in … e-pengatoken, tillgångsanknutna token och andra kryptotillgångar, kräver auktorisering, varnar kunder för risker och gör lämplighetsbedömningar när rådgivning ges. Finansinspektionen är svensk tillsynsmyndighet" | Eur-Lex (svensk text): tre kategorierna ✓ (recital 18: e-pengatoken / tillgångsanknutna token / andra kryptotillgångar), auktorisation ✓ (recital 74–76), skyldighet att "**varna dem när det gäller de risker som är förknippade med kryptotillgångar**" ✓ (recital 79), lämplighetsbedömning vid rådgivning/portföljförvaltning ✓ (recital 89). Tillämpningsdatum 30 dec 2024 är förordningens tillämpningsdatum enligt artikel 143 (stabilcoinsdelarna 30 juni 2024) — kunde ej återges ur det trunkerade hämtningsutdraget men är väl etablerat; FI som tillsynsmyndighet ✓ | ✓ (datum via förordningens artikelförteckning) |
| Finansinspektionen "har tillsammans med EU-kollegor upprepade gånger påmint att regelverket inte tar bort riskerna — inte heller alla tillgångar omfattas" | fi.se-nyhet **9 oktober 2025** med exakt titel "Trots reglering fortsätter EU-myndigheter att varna för kryptotillgångar" (EBA+Eiopa+Esma:s gemensamma varning; "Du kan förlora alla dina pengar") — utkastets källrad stämmer ordagrant inklusive månaden | ✓ EXAKT |
| Skatteverket: "vinst beskattas med 30 procent och förlust är avdragsgill till 70 procent … en avyttring uppstår även när krypto byts mot en vara — händelserna redovisas i blanketten K4" | Skatteverkets sida ordagrant: "**Du betalar 30 procent i skatt på din vinst**", "**förlust är den avdragsgill till 70 procent**", K4 avsnitt D, "betalat med krypto för vara eller tjänst" = avyttring till varans marknadsvärde | ✓ EXAKT |
| "Coinbase redovisar nästa kvartal den 29 oktober 2026" | Byggarpåstående; stämmer med COIN:s Q3-kalenderform (rapporter publiceras ~3 veckor efter kvartalsslut, tordagsform). Ej oberoende motbevisat — ofarligt framtidsdatum | ✓ rimligt (notis) |

**Universumet:** byggarens premiss "0 kryptobolag i universumet" (LVMH-precedensen) håller **än** — maskinell genomgång av dagens 219-posters träd: 0 träffar på Coinbase/Strategy/MicroStrategy/MARA/Marathon/Riot/Block/PayPal. Guidens påståenden omfattar inte universumet ⇒ ingen felaktighet.

## 2. Siffror — 16/16 oberoende omräkningar gröna

| Påstående | Omräkning | Dom |
|---|---|---|
| Nettoresultatmarginal TTM "minus 16,4 procent (minus 987,8 delat med 6 040)" | −987,8/6 040 = **−16,35 %** → −16,4 | ✓ EXAKT |
| FY2025-marginal "plus 18,3 procent" | 1 260/6 880 = **18,31 %** | ✓ EXAKT |
| "svängning på närmare 35 procentenheter inom ett år" | 18,31 + 16,35 = **34,66 pp** | ✓ |
| "cirka 57 procent under toppnoteringen" (kurs 173,97 mot topp 402) | 1 − 173,97/402 = **56,72 %** | ✓ |
| Beta "tre och en halv gång bredare" + "mer än tre gånger" | 3,39: "mer än tre" exakt; "tre och en halv" fri avrundning (3,39 < 3,5) | ✓ (gränsfall, grönt) |
| Strategy "mer än 3 procent av 21 miljoner" | 845 050/21 M = **4,02 %** | ✓ sant — C1 föreslår "mer än 4" |
| Halveringen "till 3,125 bitcoin per block" | 6,25/2 = **3,125** | ✓ EXAKT |
| Forward P/E "omkring 165" & börsvärde "45,9 miljarder" (17 sep) | Källans 18 sep-värden ÷ 1,1166: 184,02 → **164,8**; 51,25 → **45,90** | ✓ kursexakt konsistens |

Sond: `verktyg/_s1u3-krypto-verify.mjs` — **56 OK · 1 VARN (readingMinutes-seriekonvention) · 0 FEL**. En sondbugg (tolerans 0,01 på avrundningssteget 0,05) rättades och bokfördes före dom — logistik-precedensens mönster.

## 3. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN

- **Rådgivningsglossor** (köp/sälj-imperativ, rekommendera, bör du, råd-till-läsare, maskinellt med kontextklassning): **0 träffar**. Textens enda rå-ord är "rådgivning" i MiCA-beskrivningen ("lämplighetsbedömningar när rådgivning ges" — myndighetskrav på marknadsaktörer, inte vår röst).
- **Utbildningsdeklarationer**: disclaimer-sista-rad "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓ (enda "investeringsråd"-förekomsten, negerad).
- **Varumärkesgrind** (exakt replik av `kontrolleraText`, 26 regexer × 3 ytor): **0 FEL**, 1 VARNING — `\bkunder\b` (A8). Dom: **legitimitet via citerande** — träffen sitter i meningen om MiCA:s krav ("varnar kunder för risker"): det är EU-förordningens egna termer om leverantörernas kunder, samma A8-bedömning som försvarsaktier-"staten som kund" och 7+ levererade guiders precedent. Ingen rättning.
- **Lagrum:** inga svenska lagrum åberopas (MiCA citeras som EU-förordning 2023/1114, Skatteverkets regler som myndighetsföreskrifter) ⇒ **ingen lagrumsblandningsrisk** — korrekt hantering av en text som berör både värdepapperslagen och skatterätten.
- **Juridikgrind-vakten** (verktyg/juridikgrind-vakt.mjs): krypto-sv-raden = grund ✓, flyttklar-etikett saknas (utkaststatus, väntat), **0 fynd**.

## 4. 911-referenser — REN

0 träffar på seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i HELA filen (title + description + body + metadata).

## 5. Länkar — 7/7 unika interna levande, verifierade mot sajten

| Länk | Registerfil | HTTP |
|---|---|---|
| /kurser/v15-natverkseffekter · /kurser/km-003-kassaflodesanalysen · /kurser/km-006-kvartalsrapporten · /kurser/km-013-volatilitet-standardavvikelse · /kurser/rk-06-regulatorisk-risk · /kurser/se-11-krypto | 6 × `data/seo/kurser/` ✓ | 6 × 200 ✓ |
| /blogg/komplett-guide-svensk-aktieanalys-2026 | LEVE-fil i `data/blogg/` ✓ | 200 ✓ |

7 förekomster = 7 unika. Kursankaret **se-11-krypto levande** — guiden länkar hem till sitt kursankare som den ska.

## 6. Struktur och metadata

- Body **1 171 ord textrensat** · **8 H2-rubriker** (mallen: 8 inkl Källor) · disclaimer sist ✓.
- **readingMinutes 2 → 6 (B3):** 1 171 ord på 2 minuter = 585,5 ord/min. Bloggfamiljens kontrakt ~ord/200 (substansrabatt-domen 09-17; försvarsaktier-B2): round(1 171/200) = **6**. Sjätte dokumenterade fallet i klassen (halvledar-B1, hälsa-B4, konsumentaktier-B4, försvarsaktier-B2, logistik-K4). Notera: byggarens KVD använde /600 — konventionskonflikten är serieövergripande och bokförs som seriebeslut åt fabriksägaren (samma flagga i försvarsaktier- och logistik-rapporterna).
- Sökordsdisciplin: "kryptoaktier" i H1 ✓ + ingress ✓ + 2 H2 ("Tre affärsmodeller i kryptoaktier", "Kryptoaktier i siffror — ett räkneexempel") ✓.
- Title 42 tkn ≤ 60 ✓. Description 155 tkn = taket exakt (≤ 155 ✓, på gränsen — ofarligt). 5 tags ✓.
- Superlativskanning: 1 kandidat — "världens största börsnoterade företagshållare av bitcoin" (Strategy). **Sann och källbelagd** (845 050 BTC; ingen annan börsnoterad närmar sig). Ordningstal "första/frågan", "andra" = deskriptiva. Gröna.
- **D1 (notis):** publishedAt 2026-09-18 = skapandedatum — exportvägen stämplar vid flytt; publicering förblir kundens (R2).

## 7. Flaggor

1. **Till -en-ägaren:** spegeln `kryptoaktier-sa-analyserar-du-kryptobolag-en.json` (09-19 11:15, ogranskad) bär **identiska B1+B2+B3-fel**, maskinellt konstaterat: "voted down the crypto legislation Clarity Act, Coinbase fell around 9 percent in one day" + "From 2027, crypto service providers must also report … under the DAC8 rules" + readingMinutes 2. Rättningarna speglas vid verkställning.
2. **Till byggaren:** B1-rättningen GÖR MENINGEN MER LÄRORIK — det verkliga mönstret (uppgång på förväntan, fall på besked) är regleringsavsnittets poäng i renare form än det feltänkta "föll 9 % på en dag". C2 ger källraden som fattas. Verifiera Quartz/Amina-citationerna vid verkställning (sök: "Clarity Act" + "cloture" 49–50, september 2026).
3. **Till fabriksägaren (seriebeslut):** readingMinutes-konventionen /200 vs /600 späder sig (sjätte fallet i granskningsköens fyndlista mot byggarnas KVD-mall) — en serieföljetong som bör få ETT beslut: antingen ändras byggarmallen till /200 eller granskningsfyndklassen B3 dras in. Nu lever båda sanningarna parallellt och varje guide får samma fynd.
4. **Notis:** "nästa kvartal den 29 oktober 2026" är byggarpåstående utan källrad — ofarligt (framtidsdatum), men C2-posten kan vid verkställning även bära den raden om man vill sluta cirkeln.

## 8. Könotis åt nästa omgång

Ogranskade svenska rotguider efter denna (FIFO): **utbildningsaktier (09-18 22:29) = nästa**, därefter -en-speglarna som väntar på sina rötter (krypto-en bär denna rapports fynd; utbildning-en 09-19 11:15) + kvartalspaket utan granskningsfil (35+ st; rappdagsordning enligt s1-u3:s JPM-precedens). Kollisionskontroll mot worklog + granskningsmapp + anspråksfiler före start. **Systemmönster:** readingMinutes 2 vid 935–1 400 ord = SJÄTTE fallet — sonda det FÖRST; Clarity Act-koll: verifiera riktningen på kursrörelsen mot källcitat ("after gaining X% the prior session"), inte bara storleken.
