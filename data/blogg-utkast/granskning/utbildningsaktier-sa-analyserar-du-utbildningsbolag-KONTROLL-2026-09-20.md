# KONTROLL 2026-09-20 — utbildningsaktier-sa-analyserar-du-utbildningsbolag (B23)

**Granskare:** agentfabrik auto-s1-1789880702768 s1-u2 (roll: granskare).
**Objekt:** `data/blogg-utkast/utbildningsaktier-sa-analyserar-du-utbildningsbolag.json`
(B23, byggd 2026-09-18 04:40 av s3-u1; sektoromgång 4:s sista kursankare
se-13-utbildning). **Uppdragets fyra punkter:** källor, siffror,
juridik-språk (2007:528), 911-referenser.
**Anspråk:** `data/vakten/auto-s1-1789880702768-s1-u2-ansprak.md` (disk-först;
FIFO-val — äldsta kvarvarande ogranskade rotutkast; m9-serien 6/6 sedan
2026-09-16/19 ⇒ titelns "m9-utkast #2" är malltext, sjätte dokumenterade
pivoten i släktet).
**Sond:** `verktyg/_s1u2-utbildning-verify.mjs` — **62 PASS · 0 VARNING ·
0 FEL** efter 3 ärligt bokförda sondbuggar rättade FÖRE dom (1: `(?i)` i
redan skiftlägesokänslig JS-regex är ogiltig grupp; 2: disclaimer-radens
avslutande kursiv-markering `_…_.` Stop suffixen i kontrollen; 3:
C7-referenskonstant 176 769 → korrekt 176 629 = 20 360 Mkr ÷ 115 270).

## Dom

**FLYTTKLAR EFTER RÄTTNING (F1)** — juridik, siffror, aritmetik, källor och
911 alla GRÖNA; EN mening (AcadeMedias utlandsgeografi) motsägs av samma
bokslutskommuniké som texten annars bygger på och rättas med en exakt
byt-post. Verkställs av paketets ägare (spår 3) eller nästa våg; -en-spegeln
speglas vid verkställning (den engelska meningen är omformulerad men bär
sannolikt samma tvåländsfel — NOT i diffen).

## 1. Källor — 6/6 LEVANDE OCH SJÄLVKONSISTENTA

| Källa | Utkastets påstående | Verifikat |
|---|---|---|
| AcadeMedia bokslutskommuniké 2025/26, MFN-PDF 2026-08-31 | 20 360 Mkr +7,0 % · EBIT 1 947 (+11,1 %) · marginal 9,2→9,6 % · 111 290→115 270 elever · Q4 5 658 Mkr (+10,6 %) EBIT-marginal 11,8 % · Q4-elever 119 430 (+5,2 %) | PDF nedladdad (1,46 MB, 35 sidor, "BOKSLUTSKOMMUNIKÉ juli 2025–juni 2026"); text extraherad; **samtliga 16 tal påträffade ordagrant** i källan |
| Pearson "preliminära helårsresultat 2025" | £3 577 m (+4 % underliggande), justerad rörelsemarginal 17,2 % (från 16,9) | Bekräftad mot Pearsons egna FY25-dokument 2026-02-26/27: 3 552→3 577 (+1 % headline, +4 % underl.), adj. op profit £614 M ⇒ 17,2 %; 2024: £600 M/3 552 = 16,9 % — **implikationen aritmetiskt sluten** |
| Laureate FY2025 + Q1-2026 | $1,702 mdr +8,6 %; Q1-26 $272,6 M +15 % | IR 2026-04-30: "$272.6 million, an increase of $36.4 million, or 15%"; FY25 1 566,6→1 702 (+8,6 % enligt flera oberoende sammanställningar) |
| Grand Canyon Education 2025 | OPM ~60 % av intäkterna; tjänsteintäkter ~1,1 mdr $ | SEC/GCE: service revenue FY2025 $1 106 M; GCU-avtalet = 60 % av tuition-and-fee — **båda talen bekräftade** |
| Skolverket "Bidrag till enskilda huvudmän" | ersättning per elev i nivå med kommunens egen kostnad, lokalkostnader inräknade, månadsvis | Sidan LIVE och innehåller exakt: likabehandlingsprincipen, grundbelopp inkl. lokalkostnader, "en tolftedel per månad" — se dock NOT F2 om täckningsvidd |
| Skolinspektionen (tillstånd/tillsyn/förbud) + SOU 2025:37 + hemvistkrav 2022-08-01 | regleringsblocket | SOU 2025:37 "Skärpta villkor för friskolesektorn" bekräftad äkta (Utredningen om vinst i skolan U 2022:08, delbetänkande 2025); hemvistkravets ikraftträdande 1 augusti 2022 korrekt |

**Not om källstyrka:** AcadeMedia-PDF:n är primärkällan och grön på ALLA
tal — inklusive förra årets jämförelsetal (19 021/1 752/111 290) som
byggnotisen inte redovisade explicit. URL:en till Skolverket ser oväntad ut
(sökvägen "stod-for-gymnasieantagning") men är KORREKT — sidan lever där
med exakt det påstådda innehållet (verifierad 2026-09-20).

## 2. Siffror och aritmetik — 10/10 GRÖNA (motorräknade i sonden)

C1 20 360/19 021 = +7,04 % ✓ · C2 1 947/1 752 = +11,13 % ✓ ·
C3 1 752/19 021 = 9,21 % ✓ · C4 1 947/20 360 = 9,56 % ✓ ·
C5 115 270/111 290 = +3,58 % ✓ · C6 1,070/1,036 = +3,28 % ≈ "omkring
3,3 %" ✓ · C7 20 360 Mkr ÷ 115 270 = 176 629 kr ≈ "cirka 177 000" ✓ ·
C8 5/40 = +12,5 % beläggning ✓ · C9 Laureate Q1-25 ≈ 272,6/1,15 =
237,0 M$ (baklänges sluten) ✓ · C10 siffersymmetri ingress ↔ mekanik ↔
sammanfattning ✓. Struktur: title 52/60 · OG 147/155 · 8 H2 · sökord i
title+ingress+2 H2 · 1 185 ord (mål ~1 200) · disclaimer negerad sista
rad · pillar/author korrekta. Korslänkar 8/8 mot lever ytor (2 poster i
data/blogg/ + 6 kurser i public/deep-courses.json — maskinverifierat i
sonden). Sifferparitet mot byggnotisens tal: 22/22.

## 3. Juridik-språk (2007:528) — REN

Sonden kör **exakt samma 26 förbjudna-fras-regexer** (data/varumarke.json,
flaggor "giu") som kontrolleraText (src/lib/varumarke.ts) på
title+description+body: **0 FEL, 0 VARNING**. "investeringsråd" förekommer
endast onegerat (disclaimern "_Detta är pedagogisk finansanalys, inte
investeringsråd._" = sista raden). Rådverb-scan: de två "säljer"-träffarna
är Pearson-fakta ("Pearson … säljer examination") — beskrivningar av
bolagets affärsmodell, inte riktade råd till läsaren; inga
köp/sälj/rekommendera/undvik/bör-du-riktade formuleringar. Formuleringarna
håller utbildningsstilen ("så analyserar du", "så läser du", "hur du
räknar"). Lagrumsdisciplin: skollagskonstruktioner (tillstånd, tillsyn,
förbud mot nya elever, hemvistkrav, vinstutdelningstillstånd) beskrivs
utan lagrumsnummer — ingen risk för lagrummsblandning (2022:260/2022:261/
1985:716 oberörda); SOU-beteckningen är officiellt dokument-id, inte
lagrum (samma klass som MiCA 2023/1114 i krypto-guiden enligt presedens).

## 4. 911-referenser — NOLLMÖNSTER

Fyra mönster maskinsökta (\\b911\\b, "11 september", "september 2001",
"nine-eleven"): **0 träffar**. Utkastet nämner inga
terrorattentatshänvisningar — klassen ren.

## 5. Fynd

**F1 (RÄTTNING — faktaföråldring i utlandsgeografin).** Utkastet: "med
verksamhet utanför Sverige **främst i Norge och Tyskland**." Bokslutskommunikén
texten själv bygger på säger: verksamhet i "Sverige, Norge, Finland,
Tyskland, Nederländerna och Storbritannien" (sex länder), nyetablering på
"den brittiska och polska förskolemarknaden", Chestnut
Nursery-förvärvet (Storbritannien, juni) och Florencius-förvärvet
(Nederländerna, efter periodens slut); bland 62 nyöppnade enheter är
Storbritannien störst (21). Finland och Nederländerna saknas helt i
utkastet. Kur (byt-post i diffen): "med verksamhet utanför Sverige i
Norge, Finland, Tyskland, Nederländerna och Storbritannien — och
pågående etablering i Polen." Söksträngen är maskinverifierad unik
(×1 i filen).

**NOT F2 (källans täckningsvidd — ingen rättning krävd).** Den länkade
Skolverket-sidan reglerar bidrag till enskilda huvudmän för
**gymnasieskolan/anpassade gymnasieskolan**; utkastet beskriver
ersättningsmekaniken som bärande för förskola–grundskola–gymnasium.
Likabehandlingsprincipen gäller systemet i stort och innehållet är
sakligt rätt, men källan täcker en smalare del än textens anspråk —
godkänt som pedagogisk generalisering, noterat för ägaren.

**NOT F3 (formuleringens precision).** "i nivå med kommunens egen
genomsnittliga kostnad per elev": källans ord är "samma grunder som
kommunen använder vid fördelning av resurser till den egna verksamheten",
med "genomsnittlig lokalkostnad per elev" som lokaldel. Försvarbar
förenkling av likabehandlingsprincipen — ingen tvingande ändring.

**F4 (förslag — serieärende, fabriksägarens beslut).** readingMinutes 2
(= round(1 185/600), exportvägens konvention). Släktets senare
granskningar driver /200-konventionen (bilaktier B2 → 7; logistik K4 → 5;
≥10 fall i klassen): round(1 185/200) = **6**. Lämnas som forslag-post;
ändra endast vid seriebeslut.

**Bekräftelser värd att minnas:** "AcadeMedia är indelat i fyra segment —
förskolor, grundskolor, gymnasieskolor och vuxenutbildningar" står explicit
i källan ("AcadeMedias fyra segment … de tre skolsegmenten"). Säsongtionen
(vårterminen högre) bär Q4-marginalen 11,8 % — konsistent med källans
säsongsavsnitt. "Tre modeller, tre betalare: kommunen, institutionen,
hushållet" håller även med OPM-mellanformen (betalaren = universitetet).

## 6. KVD-spår

Endast NYA filer + worklog-rad: INGET bygge, src/ orörd (tsc-baslinjen
bärs av pre-commit-grinden), R2 orörd (publicering/publishedAt = kundens;
data/blogg/ orörd), utkast-JSON:en orörd (granskaren skriver inte om andras
filer — rättningen verkställs av ägaren), syskonens ytor orörda. Commit
med `git commit -F` och explicit pathspec.
