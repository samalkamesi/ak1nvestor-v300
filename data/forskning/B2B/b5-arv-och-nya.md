# B5 — ARV OCH NYA: privatsidans bästa system → B2B för rådgivare

Uppdrag: kundvisionen "ta de bästa från privatpersons-sidan och bygg vidare i
B2B + nya system". Underlag: data/motorregister.json (42 motorer, våg 49) +
kodläsning av de nyaste systemen (våg 48-60): akm2-dashboard, vagkurva-graf,
vagvalidering, forskningsbiblioteket/analysfabriken, AKM3 (ensemble/osäkerhet/
peer/regim/kalibrering), konverteringsvyn, MÖS, prediktionsloggen.
Datafakta som bär analysen: korstabellen 100 bolag · 10 branscher × 10 med
peer-fält · 100 akm2-cacher · 22 biblioteksanalyser · regime-logg (genesis
2026-09-03 MAGERT) · prediktionslogg-maskineriet byggt (0 rader ännu — inga
aktiva portföljer) · MÖS 70 558 källobjekt sv/en/ar.

B2B-kundens verklighet (rådgivare): klientmöten (underlag + presentation),
research, klientkommunikation (flerspråkigt!), dokumentation/compliance,
portföljövervakning, egen lead-generering. Rankningen nedan väger varje
system mot det arbetet.

## 1. ARVSKANSLISTA — privatsidans 10 bästa, rankade efter B2B-värde

| # | System (källa) | B2B-värde för rådgivaren | Krav för B2B-kontext |
|---|---|---|---|
| 1 | AKM2-dashboarden (akm2-dashboard.tsx: radar V01-V20 + modulring V21-V29, modulpåslag, profiljämförelse, ensemblevy) | Kundmötets visuella ryggrad: en radar säger på 10 s vad 20 variabler heter; dekompositionen "varför skiljer AKM2" besvarar klientens första motfråga | White-label (logga/färg — tokens finns i varumarke.json-mönstret); PNG/PDF-export (dela-kortets 1200×630-SVG+QR är färdigt mönster); multi-seat (org-nyckel); disclaimer per firma |
| 2 | Forskningsbiblioteket + analysfabriken (22 auto-analyser, falsifieringsvillkor, risker) | Research-delen: 20-variablers underlag på 1 sida per bolag — rådgivarens "second opinion"-maskin; falsifieringssektionen är säljande ärlighet | White-label; tenant-universum (klientens bevakningslista styr urvalet); ANSVARSBYTE: rådgivare med tillstånd bär ansvaret — disclaimern (2007:528) konfigureras per tenant |
| 3 | Elliott-vågkurvor (vagkurva-graf.tsx, 5 horisonter + enighetsscore 0-100) | Presentation: pedagogisk form (impuls/korrigering/basbygge/osatt) som klienter minns; källärlighets-texten bygger trovärdighet hos kräsna klienter | White-label; print/upplösning (SVG ren — skalas fritt); behåll ärlighetstexten — den är B2B-värdet |
| 4 | MÖS (oversattning/, sv/en/ar, termbank, kontrollrapport, 80 %-SEO-tröskel) | Flerspråkiga klientrapporter — arabiska är ett ARV få konkurrenter matchar (diaspora-klienter, Gulf-kapital); engelska för institutionella | Termbankens finanstermer på ar kontrolleras; kvalitetsgrinden (kontrollrapport) blir klientvänd; tenant-ordliste; volymtak 45 000 räkna om för B2B-volymer |
| 5 | Peer-läset + osäkerhetsintervall (akm3 steg 3-4, peer.ts midrank, spann [K, K+100(1-t)]) | "Bolaget mot sitt sällskap" (percentil, drag mot branschmedian, V07-rader först) + ärligt spann vid tunn data — professionell ton i varje möte | I princip inga — redan presentationslager som ALDRIG påverkar poängen; white-label på chips |
| 6 | Prediktionsloggen + vågvaliderings-kitet (sha256-kedja append-only, Träff ✓-kultur, protokoll v2) | Dokumenterad spårbarhet: varje mätning versionerad, manipuleringsdetekterad, rullande träff-% per horisont/klass — revisionsgrund | Per-tenant loggfil; export (CSV/PDF); retention 10 år (bokföringsliknande); UTC-tidsstämpel-kontraktet redan |
| 7 | Portföljforskningen (riskportfolj: risknivå × tillväxttakt → viktat förslag, poängbas AKM1\|AKM2) | Modellportföljer per riskprofil — rådgivarens interna jämförelsegrund och samtalsstart | Klientens riskklassificering (MiFID-pass) mappas till risknivå; white-label; ev. tenant-egen universum |
| 8 | Uppföljningen då-vs-nu (månatlig, max 3 beskrivande — aldrig dömande — notistexter) | Månatliga klientbrev automatiskt; tonen "beskrivande, aldrig dömande" är exakt vad kundrelation kräver | E-postutskick per klient (email-mallar finns); tenant-separation av snapshots; MÖS-spegling per klientspråk |
| 9 | Konverteringsvyn (6-stegstratt, MÄTT/SKATTAD/MANUELL-kvalitet, anonym intention-POST) | B2B-lead-mätning: rådgivarens EGEN tratt (besökare → rådgivningsärende) med ärliga mätluckor — samma kod, ny ägare | Per-tenant events + panel; CRM-export (postsafe endpoint); "betalande"-steget byts till "tecknade uppdrag" |
| 10 | Nyhetsmotorn (påverkanspoäng 0-100, portfölj+bevakning+RSS, dedupe) | Morgonspaning per klientuniversum: rankade nyheter kopplade till V-variabler = mötesöppning på riktiga händelser | Per-tenant bevakningslistor; white-label morgonmejl; fixa Min-Sida-gapet (orankad Yahoo) innan arv |

Ärvt men utanför topp-10 (nämnt för att inte glömmas): regimindikatorn +
forskningsläget (mötets öppningschip — går in i mötespaketet, se §2d),
rapportbyggaren/analysbank (samlar till paketet), vagkon-fan-chart (risk-
presentation), klientkontext/assistent (per-rådgivare-coaching — senare).

## 2. FEM NYA B2B-UNIKA SYSTEM

(a) KLINIKJÄMFÖRELSE — klient A vs klient B vs bransch-peer. Räknar varje
klients viktade AKM1/AKM2-profil + vågprofil ur innehaven och ställer dem
mot varandra och branschmediannerna (peer.ts midrank återanvänds rakt av).
Svarar rådgivarens fråga "varför har klient A och B olika resultat när de
bor i samma bransch?". Vigning: riskportfoljens Σvikt-mekanik.

(b) PORTFÖLJBLÅSBILD — koncentration/branschspridning ur korstabellen:
bubblor per bransch (x = median-AKM2, y = golvMarginal, storlek = vikt i
portföljen) + HHI-koncentrationstal ur vikterna. Ren SVG i husets mönster
(inga bibliotek — akm2-dashboard-precedensen). Grön/gul/röd-statusfördelning
per bubbla ur korstabellens egna fält.

(c) COMPLIANCE-SPÅR — varje analys-version hash-kedjad = revisionsväg.
PREDIKTIONSLOGGEN ÄR REDAN DETTA: append-only sha256-kedja, verifieras FÖRE
append, manipulering lämnar loggen orörd + ropar öppet. Utöka till: content-
hash per genererad klientrapport/analysversion + vem-såg-vad (multi-seat) +
export. Säljer till compliance-tunga kunder (banker, fondbolag, styrelser).

(d) MÖTESFÖRBEREDELSE-PAKET — auto-sammanställning per klient inför mötet:
regim-chip + forskningsläge + portföljens vågprofil (djupanalys) + senaste
då-vs-nu + topp-3 nyheter med påverkanspoäng + peer för de tre största
innehaven → EN landningssida/A4. Alla delmotorer byggda; vyn samlar bara.

(e) B2B-API — läsbart JSON-API för rådgivarens egna system: /korstabell,
/analys/{ticker}, /vagstatus, /regim, /validering (träff-%), /peer/{ticker}.
Datacache-mönstret (lasEllerHamta + modulmemo + Cache-Control) gör varje
endpoint billig. API-nyckel per tenant, rate-limit, versionerat (v1).

## 3. DAGENS DATA vs NY INSAMLING

| System | Möjligt med DAGENS data | Kräver ny insamling/infra |
|---|---|---|
| (a) Klientjämförelse | JA bolagsdelen: peer-medianer 100 bolag + riskportfoljens viktmekanik | Klienternas innehav (ny) — men pro/csv-import + Min Portfölj-manualinmatning är färdiga mönster |
| (b) Portföljblåsbild | JA för forskningsportföljer (vikter + status finns i korstabellen) | Klientens FAKTISKA portfölj kräver samma innehavsgrund som (a) |
| (c) Compliance-spår | JA — kedjemaskineriet byggt och testat i sviten (prediktions- + regime- + kalibrering-loggar) | Tenant-avgränsning + export + lång retention (infra, ej data) |
| (d) Mötespaket | JA v1: allt bolags-/marknadsstycke lever (api/forskningslage, regim, djupanalys, nyheter, peer) — demo per forskningsportfölj | Klientlista + mötesdatum + klientinnehav (tunn insamling) för skarpt läge |
| (e) B2B-API | JA — all data finns server-side (korstabell, 22 analyser, 100 cacher, regim) | Auth/tenant/API-nycklar/rate-limit (ren infrastruktur) |

Slutsats: FYRA av fem (a-d) är datamässigt mogna; endast klientinnehaven är
verklig nyinsamling — och den återanvänder redan byggd import. (e) är mest
infra, minst data.

## 4. PRIORITERAD BYGGORDNING

0. TENANT-GRUNDEN (först, liten): organisation-nyckel på members,
   white-label-tokens (varumarke.json-mönstret), konfigurerbar disclaimer.
   Allt annat hänger på den — bygg EN gång.
1. MÖTESFÖRBEREDELSE-PAKETET v1 (demo på forskningsportföljer — noll ny
   insamling): samlar åtta färdiga motorer; styrelsens princip "snabbast
   kundnytta per timme, ingen ny infrastruktur" (M3) — och blir säljdemo.
2. INNEHAVSGRUNDEN: klient-innehav via befintlig csv-import → låser upp
   Klientjämförelse + Portföljblåsbild + mötespaketets skarpa läge.
3. COMPLIANCE-SPÅRET: förläng prediktionsloggen till rapportversioner +
   export — billig (kedjan finns), differentierande.
4. MÖS-KLIENTRAPPORTER: white-label rapportvy per klientspråk (sv/en/ar) —
   arvet som konkurrenter saknar; kräver termbanks-koll på ar-finansord.
5. B2B-API SIST: nycklar/tenant/rate-limit är tyngst infra — ta det när
   första kunden frågar efter integration, inte innan.

Rättsnot: 2007:528-framställningen gäller privatpersonsytan; i B2B blir
AK1A underleverantör av underlag till tillståndshavare — disclaimern per
tenant, aldrig borttagen. OBS även: varumarke-vaktens "kunder"-VARNING (A8)
träffar B2B-ytor — lägg till en yta-regel (B2B/admin tillåtet) i vakten
innan första kundpanel byggs, annars drunknar manuella granskningar.

## 5. TRE REKOMMENDATIONER

1. BYGG TENANT-GRUNDEN FÖRST (org-nyckel + white-label + konfigurerbar
   disclaimer). Utan den blir alla fem systemen ombyggda vid kund nr 2 —
   med den är varje arvssystem ett par props ifrån white-label.
2. MÖTESFÖRBEREDELSE-PAKETET ÄR FÖRSTA B2B-PRODUKTEN. Det adderar åtta
   färdiga, testade motorer utan ny data (v1 på forskningsportföljer),
   demonstrerar hela huset i ett A4 — och skapar säljbar demo dag 1.
3. COMPLIANCE-SPÅRET ÄR DIFFERENTIERINGEN. Hash-kedjan är redan byggd,
   testad och manipuleringssäker — exportera revisionsvägen tidigt. Spårbar
   metodik (inte historik) är vad som öppnar dörrar hos banker och fondbolag;
   ingen svensk konkurrent i denna storlek kan visa det.
