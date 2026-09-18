# S8-U3 — Admin-överflödets rotorsaksfix (ActivityRow) — 2026-09-18

**Spår 8 (vakt) · manifest auto-s8-1789687529759, uppgift u3 · commit 37071551**

## §1 FYNDET

Gränsnittsvaktens cron-rapport `granssnitt-2026-09-17T1725.json`: **22 kombinationer
med fel** — samtliga admin-flikar (Översikt → Organismen 🧬), alla i **light-tema ×
390px mobil**, alla med **identiskt mönster**:

- `overflod: 2` (scrollWidth 392 i 390px-viewport)
- ett element utanför höger kanten: text `"/blogg/sa-laser-du-en-balansrakning-pa-1"`,
  bredd 274 px, höger-kant 397 px

## §2 ROTEN (spårad i källkod + data)

`src/app/(huvud)/admin/page.tsx` — komponenten `ActivityRow` (rad ~962), rad 974:

```tsx
{activity.section && (
  <span className="shrink-0 text-muted-foreground">/{activity.section}</span>
)}
```

**Mekanism:** span med `shrink-0` i en flex-rad = flex-item som vägrar krympa under
sin max-content-breder. När `activity.section` är en lång sökväg — `useAutoLogger`
(src/lib/ak1a/use-activity-logger.ts) loggar `section = "blogg/" + slug` vid varje
bloggbesök — blir texten `"/blogg/sa-laser-du-en-balansrakning-pa-15-minuter"` ett
enradsord utan brytpunkter, span:en tvingar raden 274 px bred, raden överstiger
viewporten → horisontell överflöd. "Senaste aktivitet"-listan bor i **admin-skalet**
→ samma defekt syns på alla 22 flikar samtidigt.

**Texten i rapporten är 42 tecken** (slutade "…pa-1") föräldralös mot källkoden —
förklaring: vakten mäter `textContent`, och DOM-texten är den postens faktiska
section-värde i Supabase `user_activities` (top-50 i created_at-ordning via
GET /api/admin/activity, limit=50). Ingen kod trunkerar till 42; värdet är
dataleverat.

## §3 VARFÖR FELET ÄR INTERMITTENT (vakten "missade" det i färska körningar)

Färska mätningar mot localhost (bygge 55ab4795) gav **0/44 kombinationer** — men
koden var fortsatt defekt. GET hämtar bara de 50 senaste aktivitetsposterna: felet
visas **endast när en lång-slug-post ligger bland dem**. 17:25-rapportens post hade
åldrats ur listan. Varje besökare på en bloggpost med slug ≥ ~35 tecken kan
återaktivera felet — därför ROTORSAKSFIX i koden, inte datatvätten.

## §4 BEVISKEDJAN (FÖRE)

| Körning | Villkor | Resultat |
|---|---|---|
| granssnitt-2026-09-17T1725 (cron) | organisk post i top-50 | 22/22 admin-flikar ⚑ |
| granssnitt-2026-09-17T2327 (färsk) | posten åldrad ur top-50 | 0/44 (båda teman, mobil) |
| granssnitt-2026-09-17T2331 (återskapad) | EN märkt testpost via den öppna loggkanalen POST /api/admin/activity (`sessionId: s8u3-vaktkontroll`) | **22/22 ⚑ — exakt cron-mönstret** (överflöd 2px, utanför 1) |

Verktyg: `verktyg/_s8u3-vaktkontroll-posta.mjs` (deterministisk återskapare).
Rapport-JSON: data/vakten/granssnitt-2026-09-17T{2327,2330,2331}.json (disk —
katalogen är gitignore:ad; detta protokoll är bestående bokföring).

## §5 KUREN

`shrink-0` → `min-w-0 truncate` på section-span (rad 974) + rotkommentar i koden.
Lång sökväg får CSS-ellips i stället för att spränga vyn; Badge (action), fliknav
(dokumenterat whitespace-nowrap på rad 481) och timeAgo förblir shrink-0 = korta
fasta etiketter, granskade och korrekta. tsc **0 fel** (projektbinär
`node node_modules/typescript/bin/tsc --noEmit`), pre-commit-grinden passerad.

## §6 EFTER-MÄTNING — TVÅ LAGER, TVÅ KURER, GRÖNT SLUTBEVIS

**Lager 1 (ActivityRow):** deploy av 37071551 2026-09-17T23:50:20Z (prod-synken,
3 commits). EFTER-körning (light/390, testpost aktiv): scroll-överflödet borta
(0px) — men vakten flaggade fortfarande 22/22: timeAgo-spanen ("3s sedan")
nådde höger 424 i 390-vy. **Lager 2 upptäckt.**

**Lager 2 (Radix ScrollArea-table):** DOM-sond (`verktyg/_s8u3-domsond.mjs`)
fann att Radix-viewportens innersta div är `display:table; min-width:100%` —
tabellen svällde till **401 px inuti en 320 px-cardbehållare** och pressade alla
aktivitetskort utåt; dokument-scrollen stannade ändå på 390 (viewportens
overflow-hidden klippte) vilket förklarar "överflöd 0px + element utanför".
Live-manipuleringsbevis i Chrome: block-tvång på 2 viewports barn → FÖRE 52
element med rect.right>391 (alla tids-etiketter med), EFTER 20 kvarvarande =
endast fliknavets avsiktligt scrollbara knappar (vakten ignorerar dem korrekt).

**Kur 2:** `[&>div]:!block` på Viewport i `src/components/ui/scroll-area.tsx` —
uppströms shadcn-ui:s exakta värdeklass för samma Radix-beteende;
komponentnivå som botar alla 11 ScrollArea-konsumenter av felklassen. Commit
5d8bbd1f, deploy 2026-09-18T00:10:09Z (prod 200).

**Slutbevis (testpost aktiv i top-50 = exakt FÖRE-villkoret):**

| Körning | Bygge | Resultat |
|---|---|---|
| granssnitt-2026-09-17T1725 (cron) | före kur | 22/22 ⚑ |
| granssnitt-2026-09-17T2331 (återskapad) | före kur | 22/22 ⚑ |
| granssnitt-2026-09-17T2352 | kur 1 | 22 ⚑ (lager 2: timeAgo 424) |
| granssnitt-2026-09-18T0012 | kur 1+2 | **0/22 — GRÖN** |
| granssnitt-2026-09-18T0014 (båda teman × 390+1280) | kur 1+2 | **0/88 — GRÖN** |

tsc 0 (projektbinär) vid båda kurena; inga byggen egna — prod-synken äger
(deploybevis ur prod-synk.loggen ovan).

## §7 LÄRDOM

Ett gränsvaktsfynd som försvinner av sig själva är INTE botat — det är
**datavist intermittent**. Vid 0-fynd-mätning efter ett cron-larm: spåra fyndets
text mot datakällan (vilken post/tabell/renderare äger den) och återskapa
deterministiskt INNAN kuren skrivs — annars fixar man symptomet i data i stället
för roten i kod. Dessutom: **"överflöd 0px + element utanför" = klippande
förfader** — mät båda signalerna; scroll-bredd ensam bevisar inte grön layout.
Och: flexbox-överflöd botas i två steg — shrink-0-barnet (lager 1) OCH den
svällande behållarstrukturen (Radix-table, lager 2); första gröna delmätet kan
bara exponera nästa lager.
