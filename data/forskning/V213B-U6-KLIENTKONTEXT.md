# V213B-U6 — Kontraktssvit: klientkontext (src/lib/klientkontext.ts)

**Fabriksvåg:** v213b-u6 (10 otestade motorer får minimala kontraktssviter)
**Datum:** 2026-09-20 · **Agent:** fabriksbyggare (BYGGARE)
**Ägarskap:** `verktyg/testa-motor-klientkontext.mjs` + detta protokoll — src/ orörd.
**Status: KLAR — 69/69 PASS, inga äkta fel funna.**

## Uppdraget

V212:s motorregister: 102 motorer, 92 testade. Klientkontexten — "den högra
handens förståelse av eleven", den enhetliga källan som assistenten och
framtida system läser elevens hela läget ifrån — var otestad. Denna våg ger
den en kontraktssvit som testar motorns FAKTISKA exporter, aldrig påhittat
beteende.

## Motor och metod

- **Motor:** `src/lib/klientkontext.ts` (v1). Exporter: `INTRESSE_KURS`
  (4 intressespårs flaggskepp), `toppIntresseUrProfil`, `paborjadKurs`,
  `detekteraLasTillstand`, `lasKlientkontext`, `predikteraNastaSteg`
  (+ typerna LasTillstand/KlientKontext/NastaSteg, kompileringsvägar).
- **Beroenden lästa före testskrivandet:** member-local, elevkarna, tracer,
  navigationsminne, kurstips — ALLA localStorage-baserade med window-guards/
  try-catch, vilket gör hela kedjan kraschfri i ren node (SSR-kontraktet).
- **Svit:** `verktyg/testa-motor-klientkontext.mjs` — ren node-ESM under tsx,
  kontroll()-mönster (PASS/FAIL), deterministisk: ingen server, inget nätverk,
  ingen prod, ingen disk. localStorage mockas i processen (samma mönster som
  u5) med `globalThis.localStorage` + `globalThis.window = { localStorage }`
  eftersom tracer/navigationsminne läser via window; varje butikskontroll
  installerar/avinstallerar i try/finally så SSR-läget återställs.

## Sektioner (69 kontroller)

| Sektion | Kontrakt |
|---|---|
| A (6) | Exporterad yta: konstanten + fem funktioner |
| B (4) | INTRESSE_KURS: exakt 4 spår, full form (slug/titel/omrade/ikon/text), unika slugs, täcker tracerns INTRESSE_NYCKLAR (korsmodul) |
| C (6) | toppIntresseUrProfil: högsta positiva vinner; tom/zero/negativ ⇒ null; oavgjort ⇒ första nyckeln; inget nyckelvaliderande |
| D (8) | paborjadKurs: null för icke-kurser/undervägar/tom slug/klarade; slug+titel+lank-form, versalisering, trailing slash, URL-avkodning |
| E (9) | detekteraLasTillstand-trappan: nivå ≥ 25 dominerar; > 10 kurser OCH strikt > 70 % ⇒ avancerad; ≥ 3 ⇒ växande; < 60 % ⇒ nybörjare; kantvärden 70/71, 10/11, 59/60 |
| F (7) | lasKlientkontext i ren node: kraschfri, exakt 13 fält, ny-elev-värden, härlett lasTillstand, larvag undefined (ALDRIG gissad lokalt), determinism + fälttyper |
| G (10) | Aggregeringen med mockad butik: namn/email-preferens, xp→nivå→fas2-redo-kedjan, streak, klara kurser, huvudmål, tracerns fält (7/3 ⇒ 70 %, 3660 s ⇒ 61 min, timmar sorteras, skräp-nycklar saneras), /min-sida hoppas i senasteSida, integration mot prediktera |
| H (18) | predikteraNastaSteg: returform (sakerhet heltal 0–100) i batteri + hela prioriteringskedjan med prioritetsbevis och kanter (streak ≤ 0, påbörjad kurs, 0 < träff < 50 med kant 50/0, toppintresse med klarad/okänd-topp-kant, fas2-redo, fallback V01, sista utvägen biblioteket vid 26 klara) |

## Fynd och observationer (ärligt rött — inget sänktes)

1. **Inga äkta fel.** Alla 69 kontroller PASSar mot motorfacit. src/ orörd.
2. **Kosmetisk egenhet (dokumenterad, inget kontraktsbrott):** i
   `paborjadKurs` hanteras eftersläpande slash för slug och lank men TITELN
   behåller den (`"/kurser/grundkursen/"` ⇒ titel `"Grundkursen/"`) —
   `titelFranSida` (navigationsminne.ts) kryper inte trailing slash. Länken
   och slugen är rena; i praktiken registrerar navigationsminnet riktiga
   sökvägar utan trailing slash. Ej åtgärdat: src/ är utanför detta
   uppdrags ägarskap och ingen funktion påverkas negativt.
3. **Dokumenterad asymmetri:** `predikteraNastaSteg` läser kontextFÄLTET
   `k.klaraKurser` i gren 4 (toppintressets flaggskepp), men fallbacken
   `raknaKurstips` läser klara kurser ur BUTIKEN via member-local. Med
   ren node (tom butik) är detta deterministiskt: fallbacken ger alltid
   V01 Försäljningstillväxt för en ny elev — sviten bevisar båda vägarna
   (H17 ny elev ⇒ V01; H18 full butik ⇒ biblioteket).
4. **Kant noterad:** `toppIntresseUrProfil` accepterar godtyckliga nycklar
   (C6) — klientsidan är trygg eftersom tracern sanerar intresseProfil till
   de fyra spåren och predikteras gren 4 har en vakthandling för okända
   toppnycklar (H14 bevisar: faller vidare utan krasch).

## Vägar utanför ren nodes räckvidd (dokumenterade)

- **Tracerns rapportfunktioner** (rapporteraBeteende/Scroll/Klick/Tid/Mus)
  kräver riktiga window-händelser — inte denna moduls kontrakt; lasBeteende-
  läsningen DÄREMOT testas via butiksmocken (G-sektionen).
- **berikaLarvag** (larvag-klient.ts): asynkron serverberikning av
  `larvag`-fältet via /api/larvag — annat modulägarskap, nätväg; sviten
  bevisar istället att lasKlientkontext ALDRIG gissar fältet lokalt (F6).
- **DOM-rendering** av komponenter som konsumerar kontexten — gränssnitts-
  vaktens territorium, inte motorns.

## KVD

- `node --check verktyg/testa-motor-klientkontext.mjs` ⇒ **SYNTAX OK**.
- Ren node: `ERR_MODULE_NOT_FOUND` på ändelselös import (`./member-local`
  inifrån klientkontext.ts) — **VÄNTAT** enligt vågbeskrivningen; markören
  lämnad för aggregatorns tsx-återfall. Kör under **tsx**.
- `npx --yes tsx verktyg/testa-motor-klientkontext.mjs` ⇒ **69/69 PASS,
  exit 0, 0,0 s** — körd TVÅ gånger, identiskt resultat (stabilitetsbevis).
- src/ orörd (`git status` på src/ tomt). R2-ytor orörda.

## Körlogg (full utdata, tsx, andra körningen)

```text
PASS  A1 INTRESSE_KURS exporterad som objekt
PASS  A2 toppIntresseUrProfil exporterad som funktion
PASS  A3 paborjadKurs exporterad som funktion
PASS  A4 detekteraLasTillstand exporterad som funktion
PASS  A5 lasKlientkontext exporterad som funktion
PASS  A6 predikteraNastaSteg exporterad som funktion
PASS  B1 exakt fyra spår: teknisk, fundamental, portfölj, beteende
PASS  B2 varje spår: slug/titel/omrade/ikon/text är icke-tomma strängar
PASS  B3 slugs unika över spåren (fyra distinkta kurser)
PASS  B4 spåren täcker tracerns INTRESSE_NYCKLAR (korsmodul: toppintresset kan alltid slås upp)  — intresseprofilens nycklar är sanerade till just dessa spår
PASS  C1 tom profil ⇒ null
PASS  C2 alla poäng noll ⇒ null (bara positiva räknas)
PASS  C3 högsta poängen vinner
PASS  C4 negativa poäng ⇒ null (aldrig ett toppintresse på minus)
PASS  C5 oavgjort ⇒ första nyckeln i insättningsordning
PASS  C6 godtyckliga nycklar utanför spåren fungerar (ingen nyckelvalidering)
PASS  D1 icke-kurssidor ⇒ null (startsidan, Min Sida, Superanalysen, utan ledande slash, tom)
PASS  D2 enkel kurslug ⇒ { slug, titel, lank } med lank = /kurser/ + slug  — {"slug":"v04-ps","titel":"V04 Ps","lank":"/kurser/v04-ps"}
PASS  D3 titeln versaliserings per ord (the-intelligent-investor ⇒ The Intelligent Investor)  — {"slug":"the-intelligent-investor","titel":"The Intelligent Investor","lank":"/kurser/the-intelligent-investor"}
PASS  D4 redan klarad kurs ⇒ null
PASS  D5 kursdjup underväg (innehåller '/') ⇒ null
PASS  D6 eftersläpande slash kryps bort ⇒ giltig slug  — {"slug":"grundkursen","titel":"Grundkursen/","lank":"/kurser/grundkursen"}
PASS  D7 bar /kurser/ (tom slug) och /kurser utan slash ⇒ null
PASS  D8 URL-kodad slug avkodas (caf%C3%A9-bolag ⇒ café-bolag, titel Café Bolag)  — {"slug":"café-bolag","titel":"Café Bolag","lank":"/kurser/café-bolag"}
PASS  E1 nivå 25 ⇒ fas2-redo även med 0 kurser och 0 % träff (nivån dominerar)
PASS  E2 nivå 24 + 11 kurser + 100 % ⇒ avancerad (nivåblocket gäller bara ≥ 25)
PASS  E3 11 kurser + 71 % ⇒ avancerad
PASS  E4 11 kurser + 70 % ⇒ växande (träffgränsen är strikt > 70)
PASS  E5 10 kurser + 100 % ⇒ växande (antalsgränsen är strikt > 10)
PASS  E6 exakt 3 kurser ⇒ växande (även med 0 % träff)
PASS  E7 2 kurser + 59 % ⇒ nybörjare (tunn träff)
PASS  E8 2 kurser + 60 % ⇒ växande (stark träff växer redan — aldrig bristperspektiv)
PASS  E9 nivå 100 + 0 kurser + 0 % ⇒ fas2-redo (nivån alltid först)
PASS  F1 SSR-läge utan fönster/butik ⇒ kraschfri och objekt (aldrig krasch, aldrig nät)
PASS  F2 exakt 13 namngivna fält — larvag frånvarande (berikas enbart asynkront)  — 13 nycklar
PASS  F3 ny elev: namn null, nivå 1, xp 0, streak 0, klara kurser [], mal null
PASS  F4 ny elev: tom tracer (intressen {}, 0 min, inga timmar, 0 %, inga verktyg) och senasteSida ""
PASS  F5 lasTillstand härledet till nybörjare (0 kurser + träff under 60)
PASS  F6 larvag === undefined — ALDRIG gissad lokalt (kärnan bor på servern)
PASS  F7 determinism + fälttyper: två SSR-anvod strukturellt identiska
PASS  G1 medlem med namn ⇒ namn vinner över email
PASS  G2 tomt namn ⇒ email-prefix före @
PASS  G3 xp 2500 ⇒ nivå 26 ⇒ lasTillstand fas2-redo (hela kedjan xp→nivå→tillstånd)
PASS  G4 streak ur butiken förs vidare (antal 7)
PASS  G5 klara kurser förs vidare — 3 st ⇒ dessutom lasTillstand växande
PASS  G6 huvudmålet ur elevkärnan förs vidare (elevens varför)
PASS  G7 tracern: 7/3 quiz ⇒ 70 %, 3660 s ⇒ 61 min, timmar sorteras, bara de fyra spåren läcker, verktyg vidare
PASS  G7b stark träff växer redan: 70 % + 0 kurser ⇒ lasTillstand växande
PASS  G8 senasteSida hoppar /min-sida (nyast-först-minne)
PASS  G9 minne med enbart /min-sida ⇒ senasteSida "" (fallback till tomt)
PASS  G10 integration: riktig kontext med streak 0 ⇒ Dagens Pass-grenen  — {"suggestion":"tända dagens pass — fem minuter räcker för att kedjan ska växa igen","lank":"/dagens-pass","ikon":"🔥","sakerhet":88}
PASS  H1 returform i hela batteriet: exakt { suggestion, lank, ikon, sakerhet }, icke-tomma strängar, sakerhet heltal 0–100
PASS  H2 gren 1: streak 0 ⇒ Dagens Pass (🔥, 88 %)  — {"suggestion":"tända dagens pass — fem minuter räcker för att kedjan ska växa igen","lank":"/dagens-pass","ikon":"🔥","sakerhet":88}
PASS  H3 gren 1: negativ streak räknas som bruten ⇒ Dagens Pass
PASS  H4 prioritet: streak 0 vinner över påbörjad kurs
PASS  H5 prioritet: streak 0 vinner över tunn quiz-träff
PASS  H6 gren 2: påbörjad kurs ⇒ nästa kapitel (📖, 82 %, titeln i förslaget)  — {"suggestion":"fortsätta i \"V04 Ps\" — du stod mitt i en påbörjad resa","lank":"/kurser/v04-ps","ikon":"📖","sakerhet":82}
PASS  H7 prioritet: påbörjad kurs vinner över tunn quiz-träff
PASS  H8 prioritet: påbörjad kurs vinner över toppintresset
PASS  H9 gren 3: 0 < träff 49 < 50 ⇒ repetition (🔁, 68 %)
PASS  H10 kant: träff exakt 50 ⇒ INTE gren 3 (fäller till fallback V01, 50 %)  — {"suggestion":"ta nästa steg i spåret — Försäljningstillväxt","lank":"/kurser/v01-forsaljningstillvaxt","ikon":"🌱","sakerhet":50}
PASS  H11 kant: träff exakt 0 ⇒ INTE gren 3 (fallback V01, 50 %)
PASS  H12 gren 4: topp teknisk ⇒ AK1TS-flaggskeppet (🌊, 62 %)  — {"suggestion":"öppna AK1TS — Våglärans Hierarki — din nyfikenhet lyser starkast i vågor och timing","lank":"/kurser/ak1ts-vaglarans-hierarki","ikon":"🌊","sakerhet":62}
PASS  H13 gren 4-kant: toppkursen redan klarad ⇒ faller igenom till fallback (V01, 50 %)
PASS  H14 gren 4-kant: topp utanför INTRESSE_KURS ⇒ vakthandlingen faller vidare utan krasch
PASS  H15 prioritet: toppintresset vinner över fas2-redo
PASS  H16 gren 5: fas2-redo utan intresse/påbörjad/träff ⇒ Fas 2-nudge (🏛️, 55 %)
PASS  H17 fallback: ny elev (streak 1, tomt) ⇒ kurstips V01 (50 %, titeln i förslaget)  — {"suggestion":"ta nästa steg i spåret — Försäljningstillväxt","lank":"/kurser/v01-forsaljningstillvaxt","ikon":"🌱","sakerhet":50}
PASS  H18 sista utvägen: ALLT klarat i butiken (spår + flaggskepp + förberedelser) ⇒ biblioteket (🧭, 45 %)  — 26 klara slugs; {"suggestion":"välja nästa kurs i biblioteket — resan är din","lank":"/kurser","ikon":"🧭","sakerhet":45}
Tid: 0.0 s (69 kontroller)
RESULTAT: 69/69 PASS
```

## Juridik

All text här är utbildning och kvalitetssäkring av utbildningsplattformens
kod — ALDRIG investeringsråd (lagen 2007:528). Motorernas formuleringar
("en gissning, eleven väljer alltid själv") testas JUST för att de håller
icke-rådgivande ton.

## Slutsats

Klientkontextens kontrakt är bevisade gröna: 69/69 PASS, deterministisk,
0,0 s, stabil över två körningar. Registret: 102 motorer, **93 testade**.
Inga äkta fel; src/ orörd; ägarskapet hållit (två filer).
