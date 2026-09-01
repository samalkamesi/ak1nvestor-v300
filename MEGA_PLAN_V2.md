# MEGA PLAN V2 — "Bygg vidare allt" (2026-09-01 →)

> USER-DIREKTIV: Full autonomi, minst 15 timmars arbete, 50–100 böcker forskade
> fram + byggda in, AI-styrelsen tar styret, UX/UI 100x men samma DNA,
> parallella agenter, INGA FRÅGOR — arbeta tills användaren är tillbaka.
> Tasks 111–115 (SR/LLM/dark/PWA/topplista) = REDAN KLARA & deployade.

## Arbetsregel per våg
- Main-agent (jag) är integratör + commit/deploy-portvakt. AGENTER RÖR ALDRIG
  public/deep-courses.json — de skriver egna filer i data/bokmaster/ som main
  slår samman med ett verifierande node-skript.
- Max ~5–6 agenter parallellt per våg; nya vågar startas så fort platser frigörs
  (kontinuerlig drift = "100–1000 agenter" i praktiken, våg för våg).
- Efter varje integrerad våg: commit → push (checkout på develop → ff-merge
  main → push båda) → deploy-hook → verifiera prod.

## HÅRDA REGLER FÖR AGENTER (alltid samma)
1. Skriv ENDAST egna nya filer: data/bokmaster/<slug>.json + ev.
   data/rapporter/<namn>.md. RÖR ALDRIG deep-courses.json, src/, git, deploy.
2. INGA python-skript (heredoc manglar å/ä/ö — bevisat: "varde", "Atterbalansering"
   i Graham-tabeller). Skriv JSON direkt med Write-verktyget, UTF-8.
3. BOKMASTER = citera boken öppet, komplett täckning av bokens alla delar/kapitel
   (konsolidera korta kapitel, utelämna inget väsentligt), ägd svensk prosa —
   INGA kopierade stycken, egna formuleringar.
4. AKM1/AK1TS-DNA: koppla varje kapitel till V01–V20 eller 5×5×4-dimensioner.
5. Level-etiketter (Nybörjare/Intermediär/Avancerad) FÖRBJUDNA i all text.
6. Kurs-JSON-schema (EXAKT):
   { slug, category:"BOKMASTER", weight:"KRITISK", chapterCount, totalMinutes,
     title, summary, minutes, xp:2000, level:"", learn, why, chapters_list:[],
     chapters:[{ num, minutes, title, intro,
       blocks:[{type:"text"|"insikt"|"utmaning"|"tabell"|"visuell", content}],
       quiz:[{q, alternativ:[4], ratt:<index 0-3>, tips?}] }] }
   - tabell-content = JSON-STRÄNG: {"rubrik":"…","rader":[["h","h2"],["c1","c2"]]}
   - visuell-content = "skala"|"compound"|"cykel"|"donut"|"bro"|"radar" (VIL-komponenter)
   - insikt = 1 menings STARK kärninsikt (◆), utmaning = praktisk övning (🎯)
   - quiz: 3 per kapitel, ratt = index i alternativ, tips = coachning utan spoiler
   - kapitelintro: 2–4 meningar fängslande svensk prosa
   - block: 3–6 text + 1 insikt + 1 utmaning + gärna 1 tabell + ev. 1 visuell per kap

## WORKSTREAMS

### WS-A: BOKKANON (50–100 böcker, djup forskning)
- data/bokkanon.json: [{id, titel, author, year, kat:"fundamental"|"teknisk"|"beteende"|"makro"|"strategi"|"risk", niva:1-5, why, ak:[akm1-vars], ts:[dimensioner], lessons:[3], svårighet, tier:1|2|3, status:"kanon"|"kurs"}]
- Tier 1 (→ full BOKMASTER-kurs), Tier 2 (→ essens-kapitel i biblioteket), Tier 3 (referens).
- Sidan /bibliotek: sökbar, filtrerbar per kategori/nivå/AKM1-variabel, kopplad
  till läroplanen + befintliga kurser. Nav-länk "Bibliotek".

### WS-B: BOKMASTER-expansion (pågående, kurs per agent)
Kö (prioritetsordning, AKM1/AK1TS-anknytning):
1. ✅ Graham Intelligent Investor (live)
2. ✅ Lynch Mina bästa investeringar (live)
3. ✅ Thiel Zero to One (live)
4. ✅ Kim & Mauborgne Blue Ocean (live)
5. ⏳ Graham & Dodd — Security Analysis (fundamentalbibeln, AKM1)
6. ⏳ Murphy — Technical Analysis of Financial Markets (teknikbibeln, AK1TS)
7. Malkiel — A Random Walk Down Wall Street (debatten fundamental vs teknisk)
8. Fisher — Common Stocks and Uncommon Profits (AKM1 V13 moat/scuttlebutt)
9. Nison — Japanese Candlestick Charting (AK1TS pris-dimension)
10. Schwager — Market Wizards (process/beteende)
11. Soros — The Alchemy of Finance (reflexivitet, AK1TS våg)
12. O'Neil — How to Make Money in Stocks (CANSLIM, hybrid AKM1+AK1TS)
13. Damodaran — The Little Book of Valuation / Investment Valuation (V14 värdering)
14. Dreman — Contrarian Investment Strategies (V19 margin of safety)
15. Montier — Value Investing (behavioral + quant)
…fortsätt ner i kanon-listan tills 15+ nya kurser levererade.

### WS-C: FULL GRANSKNING AV SAJTEN
- Sitemap-URL:er → statuskoder, saknade titles, duplicate titles, trasiga
  interna länkar, tunna sidor, manglade å/ä/ö (deep-courses.json!), a11y-luckor.
- Rapport per sektion → fixas av main/agent våg för våg.
- data/rapporter/auditrappport-<datum>.md

### WS-D: UX/UI 100x (samma DNA: paper/guld/serif)
- Megamenu i SeoPageShell (kurser per kategori, bibliotek, läroplan, verktyg).
- Kursindex: filtrering + sök + progress.
- /bibliotek-upplevelse med kanon-kort.
- Förbättrad mobilnav.
- INGA nya designmönster — förstärk befintliga.

### WS-E: AI-STYRELSE
- Runda via /api/organ/runda → beslutslogg → kö till workstreams.
- Styrelsen "äger" prioriteringen mellan vågorna (dokumenterat i worklog).

### WS-F: KVALITET & DATAHYGIEN
- Återställ manglade å/ä/ö i befintliga kurser (node-skript, ordlista).
- Quiz-kvalitetskontroll (ratt-index utanför 0–3, dubbla alternativ).
- XP-konsistens (summa quiz×10 + kurser×50 vs angivet xp-fält).

## STATUSLOGG (uppdateras av main efter varje våg)
- VÅG 0 (klar): Tasks 111–115 deployade (be04e17, 8c936b0), 713 sidor.
- VÅG 1 (klar, deployad + verifierad): audit 704/704 OK (P1+P2 fixade),
  megamenu, /bibliotek, åäö-sanering (32+19+33 fix), policy-sidor, 404,
  canonical, dubblettitlar (089fd6b).
- VÅG 2 (klar, deployad + verifierad): BOKMASTER #5-13 levererade och LIVE
  (SA 20/60, Random Walk 18/54, Murphy 20/60, Fisher 15/45, Nison 16/48,
  Marks 15/45, Damodaran 18/54, O'Neil 16/48, Schilit 14/42) + bokkanon-100
  (data/bokkanon.json, 13/100 status=kurs) + fundamentdata via Yahoo-crumb
  (P/E,P/B,ROE,marginal,tillväxt,skuld/EK per innehav i djupanalysen) +
  vågskattning per innehav + 4 blogginlägg + KursSok på /kurser + läroplan
  Nivå 3: 16 kurser (7739d23, a4a9adc, 223261e). Skala: 239 kurser · 4176
  quiz · 727 sidor.
- PÅGÅR (agenter): V-nummer-sanering i 6 kursfiler (felaktig mappning i
  äldre briefs — auktoritativ mappning nu i memory + worklog), BOKMASTER
  #14-16: Klarman Margin of Safety, Munger Poor Charlie's Almanack, Graham
  Interpretation of Financial Statements (läroplanen länkar dem REDAN —
  integrera snabbt när de landar!). Integration: node verktyg/integrera-
  bokmaster.mjs + kanon-status + build + commit + push (UTAN extra hook —
  kö-latens, vänta 20 min).
- VÅG 4 (kö): The Outsiders (V20 kapitalallokering), The Dhandho Investor,
  The Little Book That Beats the Market (Greenblatt, kortast), 100 Baggers
  (Mayer), Expectations Investing (reverse-DCF), Quality of Earnings,
  Market Wizards, The Alchemy of Finance — briefs med AUKTORITATIV V-mapp-
  ning (se worklog Task 119). OBS regler: Write-tool (ej python), egna filer
  i data/bokmaster/, citera öppet, inga level-etiketter.
- DEPLOY-NOTIS: hooks stackade → kö-latens på Hobby (upp till 20-25 min).
  Pusha + EN hook + tålamod. Verifiera med KursSok-test ("Sök bland" på
  /kurser) vilken build som är live.
