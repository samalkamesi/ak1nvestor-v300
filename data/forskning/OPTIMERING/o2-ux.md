# O2 — UX/Konverteringsgranskning: nybörjarresan, Fas 2-tratten, prenumeration (VÅG 63)

Datum: 2026-09-04 · Granskare: UX/KV-agent (kodgranskning, ingen browserkörning) · Inget committat.

---

## 1. NYBÖRJARRESAN — stegräkning ur koden

Väg: `/` → `/logga-in` → första kurs → första quiz → Min Sida.

**Räknat: 8 interaktioner + 1 onödig omväg innan första quiz-svaret:**
1. `/` hero → klick «Bli medlem gratis» (home-section.tsx:304)
2. `/logga-in`: fyll e-post (label = enbart placeholder)
3. Ikryssa samtycke (knappen är disabled utan den — dubbel bekräftelse)
4. Klick «Logga in / Skapa konto»
5. **Ingen redirect efter framgång** — statuskort «Du är inloggad» (logga-in.tsx:94-123)
6. Klick «Till alla kurser →» → `/kurser`
7. Klick kurskort («Börja här»-sektionen är bra urvalshjälp, kurser/page.tsx:296-315)
8. `/kurser/[slug]`: scrolla förbi header + NivaBar + «Varför» + Kursöversikt (~2 000 px) till kapiteltexten
9. Klick «🧠 Testa dig själv» (extra avslöjandeklick, kurs-steg.tsx:287-292) → klick svarsalternativ → +10 XP

**Vad som förvirrar (kodfynd):**
- **Kontextförlust i KursGate**: lås-upp-knappen länkar `/logga-in` utan kurs-slug (kurs-gate.tsx:49-54). Efter inloggning är eleven på «Du är inloggad»-kortet och måste själv hitta tillbaka till kursen = 3 extra steg.
- **Döda ankare**: Kursöversiktens kapitellänkar pekar på `#kap-N` (kurser/[slug]/page.tsx:100, 139) — men i KursSteg-läget (alla kurser med quiz, dvs. de flesta) existerar inga `id="kap-N"`. Klicken gör ingenting.
- **Dubbel progress-UI på samma sida**: NivaBar-kortet (kurs-gate.tsx:65-120: nivå + XP + «Markera kursen klar»-knapp) OCH KursStegs sticky marin bar (kurs-steg.tsx:171-212: XP + stjärnor + kapitel-dots). Två XP-räknare, två sätt att markera kurs klar (manuellt vs. automatiskt via quiz) — oklar mental modell. Bonus-bugg: har eleven redan tryckt NivaBars manuella knapp ges aldrig «första-kurs-klar»-badges (kurs-steg.tsx:111-119 kollar `nysynkad`).
- **Ingen onboarding**: första kapitlet förklarar aldrig quiz/XP-systemet; ingen «börja här»-markering inuti kursen.
- `useState(() => { … setRedan(true) })` (logga-in.tsx:40-42) — render-fas-updatering, antipattern som fungerar idag men är skör.
- Min Sida nås via headerns namn-chip (inloggad-knapp.tsx:70-73) — fungerar, men döljs på mobil (`hidden sm:inline-block`); mobilvägen kräver menyn.

## 2. KONVERTINGSYTOR — beröringspunktsinventering

### Fas 2-tratten (nivå 25 → ansökan)
| Beröringspunkt | Fil | Bedömning |
|---|---|---|
| NivaBar «redo för Fas 2 → ansök» (nivå ≥ 25) | kurs-gate.tsx:92-99 | **Vimsig** — liten textlänk, går till `/medlemskap#fas2` (inte formuläret) |
| Nivå-upp-banner med fas2-länk | kurs-steg.tsx:150-164 | **Svag** — syns i 4 sekunder, textlänknivå |
| Certifikat «kvalificerad → Ansök» | certifikat.tsx:177-185 | **Tydlig** men på lågtrafiksida |
| Hem «bliCertifierad» | home-section.tsx:413-415 | **Svag** — textlänk i bisats |
| Medlemskap Fas 2-kort CTA | medlemskap/page.tsx:326-330 | **Halv** — sekundär border-stil trots trattens mål; pris-chipen är tydlig |
| Läroplanens låsta kurser → `/fas2-ansok` | laroplan.tsx:288 | **Tydlig** («en inbjudan, aldrig stopp») |
| KursSok 🔒-chip → `/fas2-ansok` | kurs-sok.tsx:232, 253 | **Bra** |
| Min Sida fas-badge | min-sida.tsx (fasEtikett) | **SAKNAS** — info-chip, ingen ansöknings-CTA på dashboarden alls |
- **Två olika vägar**: NivaBar + certifikat → `/medlemskap#fas2` (extra klick), laroplan/kurs-sok → `/fas2-ansok` direkt. Standardisera.
- **Felinformativ räknare**: certifikat.tsx:174 «Klara {(25-niv)*2} kurser till» antar 50 XP/kurs och ignorerar quiz-XP (10 XP/svar). Verkligheten ≈ 12-15 kurser med quiz; räknaren säger 48 från nivå 1 = 4x avskräckande.
- Tratt-matematik: nivå 25 = 2 500 XP ≈ 8-15 h studier — rimligt som filter, men inga mellanmilstenar kommuniceras (nivå 15 = D-certifikat nämns sällan).

### Prenumeration
| Beröringspunkt | Fil | Bedömning |
|---|---|---|
| Footer-länk | footer.tsx:38 | **Enda länken på hela sajten** — största luckan |
| NivaKort «Aktivera den här nivån» | prenumeration/niva-kort.tsx:125-135 | Tydlig, ~40 px knapp |
| RabattBand | prenumeration/rabatt-band.tsx:74-81 | **Tydlig** — auto-igenkänning av fas-status är bra |
| AktiveraPanel → mailto | prenumeration/aktivera-panel.tsx | **Vimsig** — «betalflödet är inte öppet ännu»; tre steg till aktivering |
- Ingen CTA i header, hem, Min Sida, kurs-slut eller SocialProof. `/prenumeration` är i praktiken osynlig.

### SocialProof (social-proof.tsx)
- Finns på `/kurser` + `/medlemskap`. CTA «Gå med gratis — 30 sekunder» är tydlig (44 px, guld).
- **Saknas** på `/certifikat`, kurs-sidor och Min Sidas utloggade läge.
- Elevröster (Kalle/Maria/Erik) är statiskt startläge — ärligt kommenterat, men svagt socialt bevis; inga röster än.

### Certifikatets lockande (certifikat.tsx)
- Utloggad visning (rad 41-51): «Logga in och klara kurser» är **ren text utan länk/knapp** — död avslutning på en motiverad besökare.
- Betyg A-D från nivå 15 — bra progressionshake; dela/print-funktion finns.
- «Nästa steg»-ruta bra i struktur, fel i matematik (se ovan).

## 3. A11Y-SNABBSVEP

- **Kontrast**: `--gold` är korrigerad till #a8862a på ljus botten (globals.css: 5.58:1 AA ✓). `#E8C766` på marin = 7.6:1 ✓. **Risk**: 25+ hårdkodade `text-[#E8C766]` (not-found.tsx, ar/en-speglar) bypassar tokensystemet; rå `#E8C766` mot paper #f5f1e8 = **1.46:1** (beräknat) — en framtida placering på ljus botten blir oläslig. Regel: aldrig `text-[#E8C766]` utanför marin-panel.
- **logga-in.tsx: 0 aria-attribut**. Placeholder-labels (WCAG 3.3.2-brott), ingen `<form>` (ingen Enter-submit native), ingen `autoComplete="email"/"name"`, status utan `aria-live` (skärmläsare hör inte «Välkommen»).
- **kurs-steg.tsx**: nivå-upp-banner saknar `role="status"`; quiz-alternativ saknar `aria-pressed`; kapitel-dots har aria-label men utan kapiteltitel.
- **alert()**: kurs-gate.tsx:108 + certifikat.tsx:151 — blockerande, dostor; useToast finns redan i kodbasen.
- **Taptargets**: NivaBar «Markera kursen klar» ≈ 32 px (< 44); Huvudmeny-knappar ≈ 28 px; kurs-stegs nav/quiz `min-h-[44px]` ✓; SocialProof-knappar 44 px ✓.

---

## 4. TOPP-10-FÖRBÄTTRINGAR (rankade)

Estimerad effekt skala: (a) nybörjaraktivisering, (b) Fas 2-ansökningar, (c) prenumerationsintentioner.

**1. Return-URL efter inloggning** — (a) HÖG, +15-25 % aktivisering (varje borttaget steg ≈ +10-20 %).
`kurs-gate.tsx`: länka `/logga-in?next=/kurser/${slug}`. `logga-in.tsx`: läs `useSearchParams().get("next")` (fallback `/kurser`), `router.push(next)` efter lyckat `sparaMedlem`. Tar bort 3 steg + hela kontextförlusten.

**2. Prenumerations-CTA:er på nyckelytorna** — (c) HÖG: idag footer-only; ytan är i praktiken osynlig.
`min-sida.tsx` (inloggad, efter fas-badgen): diskret RabattBand-liknande kort. `kurs-steg.tsx` (kursKlar-läge 373-383): engångs-rad under DelaKort. `home-section.tsx`: fjärde stig-noden eller verktygschips-raden får `/prenumeration`-länk.

**3. Fas 2-CTA på Min Sida + en enda väg** — (b) HÖG.
`min-sida.tsx`: när `elevNiva >= 20` rendera ett guld-CTA-kort: nivå ≥ 25 «Du är redo — ansök om Fas 2 →» / 20-24 «N nivåer kvar» med progress-bar (xp/2500). Standardisera samtliga nivå ≥ 25-ytor (`kurs-gate.tsx:92-99`, `certifikat.tsx:182`) till direktlänk `/fas2-ansok` med primär knappstil.

**4. Fixa döda kapitelankare** — (a) MEDEL: aktiv användning av översikten.
`kurser/[slug]/page.tsx`: när KursSteg används, byt `#kap-N`-länkar mot dispatch `new CustomEvent("ak1a:hoppa-kapitel", { detail: { num } })` som KursSteg lyssnar på (samma mönster som `ak1a:valj-prenumeration`), alternativt rendera `id="kap-N"` på respektive steg.

**5. Rätta certifikatets Fas 2-räknare** — (b) MEDEL: bort från 4x överdriven avskräckning.
`certifikat.tsx:168-175`: ersätt kurs-räkningen med XP-procent: «{Math.round(xp/2500*100)} % mot Fas 2-kvalificering — {2500-xp} XP kvar» (+ nivå 15/D-certifikat som mellanmilstenare).

**6. Avdubbla progress-UI på kurssidan** — (a) MEDEL + en bugg bort.
`kurser/[slug]/page.tsx:80`: rendera NivaBar endast när kursen saknar quiz (fallback-läget). KursSteg äger progressen när quiz finns; «Markera kursen klar» behålls bara i fallback-läget → badge-buggen (kurs-steg.tsx:111) försvinner.

**7. logga-in.tsx till riktigt formulär + aria-live** — (a)/(a11y) MEDEL.
Wrappa i `<form onSubmit>`; synliga `<label htmlFor>`; `autoComplete="email"/"name"` + `required` på e-post; status-meddelandet får `role="status" aria-live="polite"`. Byt samtidigt `useState(()=>…)`-initieraren (rad 40) till `useEffect`.

**8. First-run-onboarding i KursSteg** — (a) MEDEL.
`kurs-steg.tsx`: localStorage-flagga `ak1a-sett-onboarding`; engångs-bar över första kapitlet: «Så funkar det: läs kapitlet → svara på quiz → +10 XP per rätt svar → nivå 25 låser upp Fas 2.» Dismiss-knapp.

**9. alert() → toast + banner-aria** — (a11y) LÅG-MEDEL.
`kurs-gate.tsx:108` och `certifikat.tsx:151`: använd befintliga `useToast`; nivå-upp-bannern i kurs-steg.tsx får `role="status"`.

**10. Certifikat-utloggad: CTA-knapp + SocialProof-placering** — (b)/(c) LÅG-MEDEL.
`certifikat.tsx:41-51`: lägg guld-knapp «Skapa gratis konto →» till `/logga-in?next=/certifikat`. `app/certifikat/page.tsx`: `<SocialProof>` under certifikatet (komponenten är återanvändbar).

### Prioriteringsmatris
| # | (a) aktivisering | (b) Fas 2 | (c) prenumeration | Insats |
|---|---|---|---|---|
| 1 | +++ | + | + | Låg |
| 2 | + | + | +++ | Låg |
| 3 | + | +++ | + | Medel |
| 4 | ++ | 0 | 0 | Låg |
| 5 | + | ++ | 0 | Låg |
| 6 | ++ | + | 0 | Låg |
| 7 | ++ | 0 | 0 | Låg |
| 8 | ++ | + | 0 | Låg |
| 9 | + | 0 | 0 | Låg |
| 10 | + | + | ++ | Låg |

Källa: ren kodgranskning (filer nämnda ovan); inga användningstestdata eller analytics har funnits att tillgå — effektestimat är expertbedömningar med branschheuristik (steg-förlust, CTA-synlighet), att valideras mot `/api/admin/konvertering`-tratten efter implementering.
