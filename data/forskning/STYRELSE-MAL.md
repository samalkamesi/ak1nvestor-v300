# STYRELSE-MÅLEN 2026 — MEGA-UTVECKLINGAR PÅ RIKTIGT

> **Kundens beslut 2026-09-15 (ordagrant):** "Skapa ai styrelse mål som ska
> leda till Mega stora utvecklingar speciellt när det gäller att du arbeta
> på riktigt och bygger att du kan jobba även om du uppdatera dig med samma
> arbetsuppgifter tills du blir klar, detta brister du stort just nu, vill
> se verkligt arbete inte påhitt."
>
> Denna handling är styrelsens ÖVERSTA målchafter under
> STYRELSE-REGELVERKET. Ronden läser den FÖRST i varje sammanträde —
> före PIPELINE-KO och före gap-registret. Nummerordning = prioritet:
> så länge ett lägre nummer är öppet vinner det över högre.

## MÅL 1 — ORDENS FULLBORDANDE (kundens största brist, högst prioritet)

**Målformulering:** Varje kundorder jobbas till 100 % klart — SAMMA
arbetsuppgift, över sessioner och uppdateringar, tills definition-of-done
är uppfylld och bevisad. En order är aldrig "en turn".

**Ärlig diagnos (rotfelet, dokumenterat):** Order blev historiskt EN
svarsturn, inte maskinens mål — v156-protokollets eget konstaterande.
Beviset upprepades 2026-09-15: kunduppdrag.json saknades helt trots att
protokollet kräver registrering. Maskineriet fanns; det ANVÄNDES inte.
Detta mål gör användningen obligatorisk och verifierbar.

**Mekanik (byggd och bevisad — ska nu köras varje gång):**
1. Order in ⇒ `data/vakten/kunduppdrag.json` skrivs SAMMA turn, med
   tydlig definition-of-done i `mal`-fältet.
2. Målhjärtat (:x1) låser ordern som sessionens mål inom 10 min.
3. Trådens minne (v148: tradHistorik ur db.sqlite) garanterar att nästa
   session — även efter uppdatering — ser exakt var arbetet står.
4. Varje rond läsare: kunduppdrag.json FÖRST. Pågående order avslutas
   FÖRE nya vågor väljs.
5. Klart = `data/vakten/uppdrag-klart.json` + raden "UPPDRAG KLART" i
   svaret. Hjärtat bokför och återställer stående mål.

**DoD (mätbart):** 0 oregistrerade ordrar · 0 ordrar >24 h utan
progress · varje order avslutas med bevis-commit i uppdragsloggen.

**Bevis för att målet lever:** kundens egen order 2026-09-15 (denna
chafter) körs genom hela cykeln — registrering → leverans →
uppdrag-klart-markering — mönstergiltigt, i samma veva som chafter
skapas. Se uppdragsloggen.

## MÅL 2 — VERKLIGT ARBETE, ALDRIG PÅHITT (beviskulturen)

**Målformulering:** Varje påstående om "klart/levererat/fixat" bärs av
bevis: commit-hash, prod-svar 200, KVD-rad eller utdata-logg. Utan
bevis är det inte sagt.

**Regler (mekaniska, inte disciplinära):**
- Ingen våg bokförs LEVERERAD utan live-bevis — gap-registrets regel 2
  gäller ALLA vågor, inte bara evolutionen.
- Worklog-rad utan bevis-kolumn är ogiltig; granskare ska kunna klicka
  sig till beviset (commit-hash eller filväg).
- Ett svar FÅR aldrig sluta med ett löfte: antingen utförs arbetet i
  samma turn, eller står exakt VARFÖR det inte kan göras nu och vad
  som krävs — och nästa turn fortsätter (mål 1).
- Pre-commit-grinden (tsc 0 + nyckelfiler) är kundens lag — ALDRIG
  --no-verify.

**DoD:** Varje rondcommit bär bevisrad · 0 "löfte utan verkställ" i
trådens svansar · skillnaden mellan "pågår" (◐) och "klart" (✓) är
alltid beviset — aldrig optimism.

## MÅL 3 — MEGA-UTVECKLING A: STUDION = Z-CODE (evolutionära motorn)

**Kundvision:** exakt samma som z code. Registret
(ZCODE-GAP-REGISTER.md, 15 poster) är motorn: varje rond stänger det
högsta V/A-gapet, ENDAST med live-bevis (regel 2).

**Läge 2026-09-15:** 15 poster · STÄNGDA: #8 (copy-on-select), #15
(designbeslut mörkt tema) · KODLEVERERADE, väntar live-bevis: #1
helskärm, #2 nummerval, #3 esc-rens (e1, commit 732c870e), #5
modellkatalogsynk (e3, d81bacfe) · KONTROLL pågår (arbetsstationen):
#6, #7, #9, #12 · ÖPPNA: #4 notiser (V4 — högst värde kvar), #10
mermaid, #11 agentträd, #13 scenariotest, #14 historiksök.

**DoD:** 15/15 STÄNGDA eller STÄNGDA-som-beslut · varje stängning har
live-bevisrad i registret · närmaste åtgärd: verifiera e1/e3 live och
sänk posterna, sedan gap #4.

## MÅL 4 — MEGA-UTVECKLING B: GODKÄNNANDEYTA (g1, fabriken bygger)

**Innehåll:** "Väntar på dig"-yta i studion: 14 FLYTTKLAR-dokument
(månadsutkast + SEO-guider) med förhandsgranskning och publicerings-
knapp som KUNDEN trycker — R2-vetorätten intakt, mekaniska juridik-
grinden (g2, GRÖN 14/14) kör FÖRE varje publicering.

**Läge:** fabrikens g1-barn bygger (mega-manifestet 4/7 klart:
g2+g3+g4+g5 levererade och bevisade).

**DoD:** ytan live i prod (200) · kunden kan själv publicera ett
dokument på <1 minut · publiceringslogg · juridikgrind GRÖN som
mekanisk spärr · kundens tryckning = enda vägen till publik (R2).

## MÅL 5 — MEGA-UTVECKLING C: KVARTALSSERIEN (v152 fas 2, i fabrikskön)

**Innehåll:** 100 bolags rappFÖNSTER-kalender (10 branscher × 10,
maskinverifierad täckning) → fas 3: läsårt-paket per rapportdag.
Juridik: rappFÖNSTER endast — aldrig siffror, aldrig råd.

**Läge:** manifestet v152-fas2-kalender ligger i prod ko/ och kedjas
automatiskt efter mega.

**DoD:** kalendern levererad med 100/100 täckning · serien synlig på
sajten via mål 4:s godkännandeyta · fas 3-paket bokade i PIPELINE-KO.

## MÅL 6 — KVALITETS-GOLVET (mekaniskt, daemonernas ansvar)

**Golv:** tsc 0 · gränssnittsvakten 0 fynd · prod 200 · motorer
107/0/0 · juridikgrind GRÖN · integritetsvakten GRÖN.

**Läge:** v157 (mätjournal) kodlevererad — journalen född men
aspektsidornas täckning väntar nästa cron-svep (~05:26) för
självkorrigerande urval; vågen stängs först med journalbevis.

**DoD:** 7 sammanhängande dagar grönt golv i journal-historiken ·
0 fynd som nått kundens ögon (gränssnittsvaktens lag).

## MÅL 7 — SYNLIGHET: KUNDEN SKA SE KLARA UPPGIFTER

**Smärta (kundens egna ord 2026-09-15):** "jag ser inte klara
uppgifter". En leverans kunden inte kan SE är inte levererad.

**Mekanik:** varje avslutad våg/leverans visas på ETT ställe kunden
naturally tittar: godkännandeytans KLART-lista (mål 4) + en kort
rondrapport i sessionen (vad landade / bevis / nästa steg) — redan
regel i AGENTS.md (v132); chaftern gör den till mål med DoD.

**DoD:** kunden kan räkna upp veckans leveranser utan att fråga ·
KLART-listan i studion visar leveranser med datum och bevislänk.

## ROND-PROTOKOLLET (chafterns slagordning — varje sammanträde)

1. **Läs kunduppdrag.json** — pågående kundorder avslutas FÖRST (mål 1).
2. **Läs chaftern** (denna fil) + gap-registret + PIPELINE-KO — välj
   det lägsta nummer-öppna målet som har en möjlig nästa åtgärd.
3. **Verkställ** — 4+ deluppgifter = agentfabriksmanifest; ≤3 = Agent-
   direkt; exklusivt filägarskap; R2-ytor rörs aldrig.
4. **Bevisa** — KVD + commit + prod-verifiering (mål 2:s regler).
5. **Bokför** — worklog (med bevis-kolumn) + beslutsminne + PIPELINE-KO.
6. **Rapportera KORT** i sessionen: vad / bevis / nästa steg (mål 7).

## NÄSTA TRE ÅTGÄRDER (bokade, verkställs i ordning)

1. Verifiera e1/e3 live i prod och stäng gap 1-3+5 i registret (mål 3).
2. Verifiera g1-leveransen när fabrikens barn är klart + KVD (mål 4).
3. V157-driftbeviset: journal-svepet ~05:26 måste visa aspektsidor
   mätta; stäng vågen först då (mål 6).

---
*Chaftern fastställd av AI-styrelsen (organ Ω) på kundens direktiv
2026-09-15 · ändras endast av styrelsebeslut eller kundens R2-röst ·
leveransbevis: commit + push prod samma dag.*
