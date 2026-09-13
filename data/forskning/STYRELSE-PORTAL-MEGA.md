# STYRELSE-PORTAL-MEGA — medlemens portal som plattformens nav

Kunddirektiv 2026-09-11 (våg 101-pågående,/orders ovanpå "hand i hand"):

> "jag vill bygga klientens portal/konto så att kunden kan utbilda sig,
> se analyser, få poäng som finns, bygga allt därinne och vilja bygga sin
> aktieportfölj därinne och se analyser därinne dashboarden ska vara
> avgörande för honom därinne, så du ska bygga vidare integrationen och
> exceptionella systemet som kan ta dagar eller veckor, men du ska ha plan
> så du bygger och jobbar i den 24/7 online"

## MÅLBILD — kundens sex krav → leveranser

| # | Krav | Leverans | Våg |
|---|------|----------|-----|
| 1 | Utbilda sig i portalen | Mina kurser: påbörjade/klara, fortsätt-knappar, quiz-svaghet → nästa steg | 103 |
| 2 | Se analyser i portalen | Analysvy i portalen: senaste AKM2-analyser + bevakningslista | 104 |
| 3 | Få poängen som finns | XP/nivå/stjärnor-hero + poänghistorik på dashboarden | 102 |
| 4 | Bygga aktieportfölj därinne | Utbildningsportfölj (papper/virtuell): innehav, utveckling, koppling till analyser + kurser | 105 |
| 5 | Dashboarden avgörande | Min sida 2.0 = NAVET: läge, nästa steg, allt ett klick bort | 102 |
| 6 | 24/7-onlinebygge | Cron-automation per timme + vågplan + KVD per leverans | metanivå |

## JURIDIKRAMEN (juridikgrind — gäller ALLT i portalen)

- Portföljen är ett **utbildningsverktyg**: virtuellt/papper, "så fungerar
  metoden", ALDRIG "köp denna aktie" (lagen 2007:528 — utbildning är
  tillåtet, rådgivning kräver tillstånd).
- Portföljtiers 249/449/799 kr = R2: byggs bakom flagga (G2-mönstret),
  aktiveras ALDRIG autonomt — väntar kund.
- Analyser i portalen = utbildningsmaterial med ursprung i AKM2-modellen;
  formuleringar genom juridikgrinden.

## VÅGSTRUKTUR

### VÅG 102 — DASHBOARDEN (navet)
Min sida 2.0: server-session som sanningskälla (INTE localStorage-vy),
poänghero (XP/nivå/stjärnor + progress till nästa nivå), "fortsätt där
du var" (senaste kurs + direktlänk in i kapitel), lärväg-nästa-steg-kort,
snabbingångar: kurser/analyser/portfölj. Tre språk.

### VÅG 103 — UTBILDNINGEN I NAVET
Mina kurser-grid: påbörjade (progress per kurs), klara (stjärnor), nästa
rekommenderade (lärvägen), quiz-svagheter → övningstips. Allt ur befintlig
progress-data (system_events) — ingen ny tabell i första steget.

**SLUTBITEN LEVERERAD 2026-09-13 (hjärtslagsrond, commit adc95a33
[organ:P]):** "Mina kurser"-gridet (KursNavet) på Min Sida — läroplanen +
Fortsatt-panel + LarvagKort + quiz-svagheterna fanns sedan våg 88/99; det
som saknades var gridet. MedlemProgress utökat bakåtkompatibelt med
paborjadeKurser + quizRatta (härletts ur samma system_events-karta i
aggredereaProgress — ingen ny läsning; import-raden kan ärligt aldrig
markera påbörjad kurs). KursNavet: PÅBÖRJADE (quiz-räknare, flest rätt
först + Fortsätt-knapp) + KLARA (★ + repetera), tak 6 kort/sektion,
gäst ⇒ inloggningsrad; marin-familjens fasta palett, ≥ 44 px tryckytor.
kursKort props ur getCourseList() vid build — /min-sida förblir statisk.
KVD: tsc exakt 34 = baslinjen (0 nya, inga i de fem filerna).

### VÅG 104 — ANALYSERNA I NAVET
Senaste AKM2-analyser (ur analysbiblioteket) + "din bevakning" (watchlist
per konto). Koppling: bevakat bolag → aktuell analys → relaterad kurs.
Bevakning lagras per authId (system_events-mönstret eller egen tabell om
styrelsen beslutar det — beslut tas när faktakartan landat).

**LEVERERAD 2026-09-12 (commit c64914bc):** system_events-mönstret valt
(ingen ny tabell — faktakartan visade att medlem_progress-kontraktet
täcker allt: senaste-vinner, requestskopad läsning, GDPR-minimering).
Nyckel `bevaka:<ticker>` varde "1"/"0" serverfastställt; ticker MÅSTE
finnas i biblioteket; tak 20 aktiva; /api/medlem/bevakning (GET tyst för
gäst, POST med session-rotation + rate-limit 60/min). AnalysNavet på
Min Sida (senaste 3 ur disk i build-passet — ingen per-medlems-cache,
sidan förblir statisk; ☆ slår på/av utan att lämna dashboarden) +
BevakaKnapp på analysdetaljsidan (gäst ⇒ inloggningslänk). Kurskopplingen
bärs av fotraden: AKM1-modellen + våglärans hierarki — kurserna bakom
ALLA analyser, därför alltid sanna (sektor-mappning avförd: skör,
Kontra-intuitivt förändringsbenägen). tsc 36 = baslinjen, 0 nya.

### VÅG 105 — PORTFÖLJEN (utbildningsportfölj)
Virtuella innehav (bolag, antal, imaginär inköpskurs — kunden matar in),
utveckling + utfall i utbildningstermer, kopplade till analyserna och
kurserna ("denna holding övar kapitel X"). Legacy-gästportföljen
(/api/member/holding|portfolio) migreras in som import, mönstret från
migrera-progress (våg 87). Premium-tiers bakom flagga.

### VÅG 106 — INTEGRATION + POLISH
Korskopplingar alla ytor, tre språk fullt, hastighet (ISR där möjligt),
KVD full (tsc-baslinje · motorer · vakten · prod 200), systemkartan
uppdaterad med nya scores.

**TRE SPRÅK FULLT — LEVERERAT 2026-09-13 (portal-spårets våg 113,
huvudagenten):** sista trespråksgapet i portalen stängt — Certifikat,
Dagens Pass och Läroplan är nu sv/en/ar via useSprak + ordlistans 133 nya
nycklar (cert.*/pass.*/laro.*, typad SprakRad = tre språk per post,
tsc-verifierat). Sex nya spegelsidor: /en+/{certifikat,dagens-pass,
laroplan} enligt våg 51-mönstret (spegelMetadata + force-static + ISR 1 h;
Certifikat/Laroplan tar lankPrefix så interna länkar följer spegeln).
Datum/tal per locale (en-GB/ar-EG, sv-SE = originalet); latinska
varumärken (AK1A/AKM1/AK1TS/XP) förblir latinska även på arabiska enligt
ordlistans riktlinjer; API-texter (pass.namn m.m.) förblir svenska denna
våg — motorpipelinen översätts separat. Svenska originalsidor oförändrade
(default-props). KVD: tsc exakt 34 = baslinjen (0 nya, 0 i våg-filerna).

## DRIFTEN — 24/7 ONLINE

- Cron-automation varje timme: fortsätt nästa block per PIPELINE-KO +
  denna plan; sessionstart först; KVD före varje push; bygget enligt
  leverera-kod (eller via subagent om studions klient bromsar >30 s-
  kommandon — lärd våg 101).
- R4: max ~9 agenter; huvudagentens build-ensamrätt (OOM-våg 85) gäller
  även automationens körningar.
- Varje våg avslutas: worklog + STYRELSE-dokument + prod-verifiering.

## KVD-MÅTT PER VÅG

tsc = baslinjen (0 nya) · motorer 107/0/0 · vakten GRÖN · prod 200 ·
E2E manuella flöden i portalen (inloggad + gäst + tre språk).
