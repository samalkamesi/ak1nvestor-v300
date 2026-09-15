# Komplementgranskning: kvartalskalendrar Q3 2026 — oberoende andra läsningen

**Granskat objekt:** `data/blogg-utkast/kvartal/2026-q3/kalender-*.json` (samma
objekt som s1-u3 granskade — vi valde oberoende samma nästa kö-objekt i
parallella omgången och levererade inom minuter av varandra)
**Granskare:** fabriksagent auto-s1 uppgift s1-u2 (roll: granskare)
**Datum:** 2026-09-15 · **Relation:** KOMPLEMENT till
`kvartal-2026-q3-kalendrar.md` (s1-u3, 06:05) — ingenting där upphävs här.
**Diff-tillägg:** `kvartal-2026-q3-kalendrar-diff-komplement.json` (samma
postformat som s1-u3:s diff-fil).

**Bedömning: oförändrad EFTER RÄTTNING** — s1-u3:s fyndlista kompletteras med
ett nytt källfynd (SEB) och en missad andra HTML-escape; fyra ytterligare
datum verifierades exakt mot bolagens egna sidor, vilket stärker paketet.

## Nya fynd (finns ej i s1-u3:s rapport/diff)

### K1 — andra HTML-escapen i kalender-hälso.json (bör rightas med A1)

s1-u3:s A1 fixar JNJ:s `namn`-fält ("Johnson &amp; Johnson"). Samma escape
finns OCKSÅ i källnamnet "Johnson &amp; Johnson Investor Relations" — diff-
post A1b i komplementfilen. (Båda förekomsterna mekaniskt funna.)

### K2 — SEB: påstått officiellt datum styrks inte av citerad källa

Kalendern (kalender-finans.json, SEB-A.ST) anger 2026-10-22 med notern
"Datumet står i bolagets officiella finansiella kalender". Oberoende
hämtning 2026-09-15 av exakt den citerade sidan (sebgroup.com …/financial-
calendar) visar dock kalenderposter endast t.o.m. juli 2026 — inget Q3-datum
alls maskinläsbart. Datumet är plausible (torsdag; SEB:s Q3 2025 kom 23
okt) men OBEVISAT i filen, och noterns påstående är alltså starkare än
källan. Två rättningar föreslås (diff-post SEB1): (a) lägg till en
bekräftande källa i Electrolux-modellen (Q2-2026-rapportens kalenderavsnitt),
eller (b) justera notern till "enligt historiskt mönster — kontrollera mot
SEB:s kalender vid fas 3-tillverkningen". Noterns "eller analyser" rättas
samtidigt till "eller analytiker".

### K3 — Carlsberg-källan landar på geo-väljarsida (förslag)

Maskinhämtning av den citerade Carlsberg-kalendern visar en landnings-sida
för landsval, inte kalendern (människa hittar vidare; maskin ser väljaren).
Förslag: djuplänk till själva kalendervyn vid fas 3. Icke blockerande.

### K4 — Getinge: dokumenterad datumdivergens 20 vs 21 okt (uppföljning)

Bolagets reports-sida säger 2026-10-20, pre-close-briefens finanskalender
(och MarketScreener) 2026-10-21 — divergensen är redan ärligt redovisad i
filen. Förslag: kontrollera datumet igen vid fas 3-tillverkningen av
Getinges "läsårt-paket". Icke blockerande.

## Nya live-verifieringar (2026-09-15 — utöver s1-u3:s fem)

| Bolag | Kalenderns datum | Bolagets egen sida visade | Dom |
|---|---|---|---|
| Swedbank | 2026-10-22 | "Interim report January–September 2026: 22 October 2026" | **Exakt — NY** |
| ABB | 2026-10-20 | "October 20 … Q3 2026 results" | **Exakt — NY** |
| H&M | 2026-09-24 | niomånadersrapporten 24 Sep 2026 | **Exakt — NY** (bevisar det "tidiga" datumet) |
| Inditex | 2026-12-02 | "02 December — Interim Nine Months" | **Exakt — NY** (bevisar det "sena" datumet) |
| Ericsson, Nokia, Kambi | 15/10 07:00 · 22/10 · 4/11 07:45 | exakt enligt s1-u3 | **Oberoende om-verifierade** |

Sammanlagt är därmed **8 av 100 datum exakt verifierade** mot bolagens egna
källor — inklusive seriens två mest "misstänkta" (H&M i september, Inditex i
december), som båda beror på brutet räkenskapsår och som båda höll. Ej
maskinverifierbara (bot-skydd/JS/PDF), utan motsägelse: Electrolux-PDF:en,
LVMH, Equinor, Polestar, AstraZeneca, Carlsberg (se K3).

## Oberoende bekräftelser av s1-u3:s fynd

- **A1** (JNJ-escape): bekräftad mekaniskt — 2 förekomster (se K1).
- **A2** (Sandvik-URL utan .com): bekräftad — `home.sandvik/` går ej att slå upp.
- **A3** (tre hämtdatum-konventioner): bekräftad med samma fördelning
  (hamtat: teknik/hälso/tillväxt · hamtdatum: fastighet/finans/industri/
  kommunikation/material · inget fält: energi/konsument; AMD-källan saknar
  fält helt).
- **B1/B2** (Shell land USA · "ExxonMobil Holdings Corporation"): bekräftade
  uppströms i `bolagsuniversum.json` (SHEL land="USA", XOM namn="ExxonMobil
  Holdings Corporation") — koordinerad rättning universum först står sig.
- **C-serien** ("väntas" osv.): bekräftad — juridiskt rent i substansen
  (lagen 2007:528: information/utbildning, inga råd); stilrättningarna är
  kvalitet. PSNY-"sälj" är ordledet i "försäljningsvolymer" — falsklarm,
  rent (prövat oberoende).
- **911-referenser**: 0 träffar i samtliga 10 filer (även denna läsning).

## Precision kring C9 (CET/CEST) — bekräftelse med förtydligande

s1-u3:s C9-rättning (ERIC-B "kl 07:00 CET" → "ca 07:00 CEST") är korrekt:
sommartiden 2026 slutar söndagen 25 oktober, så den 15 oktober gäller CEST.
För tydlighet åt framtida rättare: från och med 26 oktober 2026 gäller CET —
därför är Swedbank (22 okt, CEST) och Kambi (4 nov, CET) redan korrekta i
filerna; ingen ytterligare tidszonsrättning behövs i serien.

## Juridik (lagen 2007:528) — oförändrad dom: RENT

Kalendrarna innehåller endast rappfönsterfakta med källor: information och
utbildning, inte rådgivning. Mekanisk ordsökning (köp/sälj/rekommendera/
målkurs/undvik/väntas stiga m.fl.) gav noll äkta träffar; noll finansiella
siffror förekommer i paketet. Formuleringsstilen följer "så läser du"-linjen.

## Nästa steg

1. Verkställ s1-u3:s diff + detta komplement (A1b, SEB1) i ett steg hos
   kalenderägaren — därefter är paketet FLYTTKLART.
2. K3/K4 bärs med till fas 3 (djuplänk Carlsberg; Getingedatumet kontrolleras
   igen nära publicering).
3. Publicering av kundsynliga ytor förblir kundens beslut (R2).

*Kvitto: andra oberoende genomläsningen av samma 10 filer / 100 bolag —
mekanisk kontroll + 8 live-verifieringar + juridikgrind; endast nya filer
skrivna, inga originalfiler ändrade av granskaren.*
