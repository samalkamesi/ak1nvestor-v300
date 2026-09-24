// Rond 158: bokar kundprioritet 2+3 som fabriksmanifest v159 (skrivs till prod-ko).
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const ko = '/home/ak1a/AK1/data/vakten/agentfabrik/ko';
if (!existsSync(ko)) mkdirSync(ko, { recursive: true });

const promptBas =
  'SAMMANHANG: AK1A Research Lab (lab.ak1nvestor.com) — svensk plattform för finansiell UTBILDNING. JURISTGRIND: ALDRIG investeringsråd (lag 2007:528) — formulera ALLT som utbildning ("så fungerar metoden"), aldrig "köp/sälj denna aktie". Kunden är icke-teknisk och talar svenska — allt material på svenska, pedagogisk och rak ton. KUNDDIREKTIV 2026-09-24: "kvalitet > kvantitet — ALDRIG nya kurser i massproduktion". ';

const manifest = {
  id: 'v159-kundprioritet-' + Date.now(),
  titel: 'VÅG 159: kundprioritet 2+3 — Fas 2-djup (20 indikatorer) + branding-audit',
  skapad: Date.now(),
  uppgifter: [
    {
      id: 'u1',
      titel: 'Fas 2-djup del 1: indikator 1-10',
      prompt:
        promptBas +
        'KUNDPRIORITET: "Fas 2-fördjupning: de 20 indikatorerna på DJUPET (årsredovisningar, kritiskt tänkande)". STEG: (1) Lär dig indikatorerna: kör "git show f86f8590 --stat" (kf3-committen skapade Fas 2-sidan med 20 indikatorer) och läs de berörda filerna (Fas 2-sidan i src/app + dess datakällor) för att lära dig exakta namn och ordning på de 20 indikatorerna. (2) Skriv filen data/kurser/fas2-djup/indikatorer-01-10.md — de första 10 indikatorerna fördjupade, MINST 400 ord per indikator med: (a) vad indikatorn mäter och varför den spelar roll, (b) var i årsredovisningen den hittas med konkreta poster/radnamn (resultaträkning, balansräkning, noter), (c) hur den beräknas steg för steg, (d) ett genomskinligt räkneexempel på ett påhittat bolag med siffror ur en låtsas-årsredovisning, (e) vanliga fallgropar och hur tal kan snedvridas (kritiskt tänkande), (f) 3 övningsfrågor med facit. (3) Du äger ENDAST filen data/kurser/fas2-djup/indikatorer-01-10.md (skapa katalogen vid behov) — rör INGA andra filer; ett syskon skriver indikator 11-20 parallellt. (4) Committa: git add data/kurser/fas2-djup/indikatorer-01-10.md && git commit -m "studio: fabrik v159-u1 — Fas 2-djup indikator 1-10". Pusha "git push prod develop" ENDAST om ytan i /home/ak1a/AK1 är ren (git status --porcelain tom) — annars låt pushen vänta. (5) Avsluta med exakt raden: LEVERANS: data/kurser/fas2-djup/indikatorer-01-10.md + <commit-hash>',
    },
    {
      id: 'u2',
      titel: 'Fas 2-djup del 2: indikator 11-20',
      prompt:
        promptBas +
        'KUNDPRIORITET: "Fas 2-fördjupning: de 20 indikatorerna på DJUPET (årsredovisningar, kritiskt tänkande)". STEG: (1) Lär dig indikatorerna: kör "git show f86f8590 --stat" (kf3-committen skapade Fas 2-sidan med 20 indikatorer) och läs de berörda filerna (Fas 2-sidan i src/app + dess datakällor) för att lära dig exakta namn och ordning på de 20 indikatorerna. (2) Skriv filen data/kurser/fas2-djup/indikatorer-11-20.md — indikator 11 till och med 20 fördjupade, MINST 400 ord per indikator med: (a) vad indikatorn mäter och varför den spelar roll, (b) var i årsredovisningen den hittas med konkreta poster/radnamn (resultaträkning, balansräkning, noter), (c) hur den beräknas steg för steg, (d) ett genomskinligt räkneexempel på ett påhittat bolag med siffror ur en låtsas-årsredovisning, (e) vanliga fallgropar och hur tal kan snedvridas (kritiskt tänkande), (f) 3 övningsfrågor med facit. (3) Du äger ENDAST filen data/kurser/fas2-djup/indikatorer-11-20.md (skapa katalogen vid behov) — rör INGA andra filer; ett syskon skriver indikator 1-10 parallellt. (4) Committa: git add data/kurser/fas2-djup/indikatorer-11-20.md && git commit -m "studio: fabrik v159-u2 — Fas 2-djup indikator 11-20". Pusha "git push prod develop" ENDAST om ytan i /home/ak1a/AK1 är ren (git status --porcelain tom) — annars låt pushen vänta. (5) Avsluta med exakt raden: LEVERANS: data/kurser/fas2-djup/indikatorer-11-20.md + <commit-hash>',
    },
    {
      id: 'u3',
      titel: 'Branding-audit: alla publika sidor (steg 1 — kartan)',
      prompt:
        promptBas +
        'KUNDPRIORITET: "branding-finslipning av ALLA publika sidor — konsekvent design, CTA-optimering, professionell känsla". Denna uppgift levererar KARTAN; den rör ALDRIG src/ (kodändringar kommer i nästa våg med kartan som underlag). STEG: (1) Inventera alla publika routes: lista src/app-katalogen och läs varje page.tsx plus dess huvudkomponenter. (2) Bedöm per sida: färganvändning (hexvärden), typografi (rubriknivåer och storlekar), knappspråk och CTA:er (text, placering, antal per sida), ton i rubriker, samt mobilperspektiv (responsiva klasser). (3) Skriv data/forskning/BRANDING-AUDIT-2026-09.md: först en tabell per sida (URL + filväg + nuvarande läge + avvikelse från den mest konsekventa sidan), därefter en PRIORITERAD åtgärdslista (max 15 poster) med exakta filvägar och konkreta förslag (förslag på enhetliga CTA-texter på svenska, vilka element som bör harmoniseras, var social proof saknas) — men INGA kodändringar i src/ i denna uppgift. (4) Du äger ENDAST filen data/forskning/BRANDING-AUDIT-2026-09.md. (5) Committa: git add data/forskning/BRANDING-AUDIT-2026-09.md && git commit -m "studio: fabrik v159-u3 — branding-audit alla publika sidor". Pusha "git push prod develop" ENDAST om ytan i /home/ak1a/AK1 är ren (git status --porcelain tom) — annars låt pushen vänta. (6) Avsluta med exakt raden: LEVERANS: data/forskning/BRANDING-AUDIT-2026-09.md + <commit-hash>',
    },
  ],
};

const sok = `${ko}/${manifest.id}.json`;
writeFileSync(sok, JSON.stringify(manifest, null, 2));
console.log('MANIFEST BOKAT:', sok);
console.log('id:', manifest.id, '| uppgifter:', manifest.uppgifter.length);
