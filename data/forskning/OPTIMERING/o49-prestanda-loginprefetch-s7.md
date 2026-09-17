# o49 — Spår 7 prestandavåg: /logga-in-prefetchen kurerad (s7-u1, 2026-09-17)

Fabriksagent s7-u1 (byggare 1/3). Uppdrag: "mät före/efter
(Lighthouse), deploy, prod 200, mätning bokförd".

## §0 Nummerkontroll

Före skrivning: OPTIMERING-katalogen höll o48 som högsta nummer
(o48-akm2-snapshot-test-hermetik-s8.md) ⇒ detta protokoll tar
o49. Inget aktivt syskon äger namnet (anspråksfil
data/vakten/s7-1789662061676-u1-ansprak.md, gitignorad, före kur).

## §1 Val + duplikatkontroll

Spårets levererade objekt granskade mot worklog + git log:
läsbarhet STÄNGT (s7-u2 omg 2-tillägg), cache 2 ronder (o10/o13),
koddelning o5+o27+o31, fonter s7-u3/v96-D1, prefetch-kurer
o17+o37+o41, CV o18+o20+o28, skelett o19, /kurser-flight o45
(EFTER levererad samma dag). Kvar i spårets öppna kö (o41 §5 +
o41-EFTER-raden): **`/logga-in` ×2** (barnägd) samt
`/`-prefetch ×3 (SeoPageShell — BOKAD TILL HUVUDAGENTEN på två
poster, rörs ej här), brotli (huvudagent/infra),
språkresolvens-CLS a/b/c (produktbeslut), dölj-undantaget
(kundens estetikval). Valet föll på /logga-in ×2 — spårets sista
barnägda kur-objekt.

## §2 FÖRE-mätning (färsk, deployat bygge)

Kontext: prod-synkens logg — deployad kod 408f9e20 (15:01:47Z,
innehåller o41+o45-kurerna; d2fd7209 väntar RAM men rör ENDAST
data/, ingen länkbeteendepåverkan ⇒ FÖRE-representativt för
prefetch-måttet). Vilofönster verifierat (load 0,53; inga
lighthouse/chrome-processer; solo-rond). ISR-triggar ×2 + 8 s
före mätning (11163-metoden — /blogg revalidate=3600).

Lighthouse (verktyg/prestanda-lighthouse.mjs, mobil, localhost):
/blogg **P49 · LCP 5323 ms · TBT 3986 ms · CLS 0** (CPU-tal med
all reserverad tolkningsförsikt — o28-mätplanet; strukturtalen
nedan är lastokänsliga och är kurbeviset).

Nätverksbevis (audits.network-requests, initial load):

| Begäran | Storlek | Start |
|---|---|---|
| `/logga-in?_rsc=m8nkP…` (partial, omgång 1) | 0,60 KiB | 1188 ms |
| `/logga-in?_rsc=blAwe…` (full flight, omgång 2) | 1,87 KiB | 1749 ms |
| **Summa /logga-in** | **2,47 KiB** | mitt i LCP-fönstret |

Requests totalt 44, transfer 704,0 KiB. Rot: headerns
`InloggadKnapp`-CTA (seo-page-shell.tsx:43) — synlig i viewport ⇒
auto-prefetch; Next 16.1.1 kör två omgångar per länk (o41:s
mönster, samma hash-familj för partial-vågen). Mobildrawerns
`InloggadKnapp stor` (mobilmeny.tsx:294) monteras ENBART när
drawern är öppen (`{oppad && createPortal}`) — ingen källa vid
last. **Förstärkande fynd: /logga-in är `force-dynamic` (sidfilen
deklarerar det) ⇒ varje full flight kostar inte bara 1,9 KiB
nätverk utan även en serverrendering av inloggningssidan — per
sidvisning, för en CTA som en minoritet klickar.**

## §3 Kur — o17/o37/o41-precedensen

`prefetch={false}` på utloggnings-CTA:ns `<Link href="/logga-in">`
i inloggad-knapp.tsx (ENDAST denna prop + förklaringskommentar;
inga klassändringar — läsbarhetsvågens max-md:min-h-[52px] orörd).
Täcker båda renderingsvarianterna (headerns kompakta + drawerns
`stor` — samma Link). Beteendeavvägning enligt precedenslagen:
hover-prefetch lever kvar i Next 16 (musanvändare förlorar
inget), klick kostar en RSC-hämtning ~100–300 ms endast för den
som faktiskt loggar in, och /api/medlem-sessionskontrollen i
samma komponent berörs inte. tsc 0 via projektbinär.

## §4 Förväntad EFTER (mätplan)

- `/logga-in`-hämtningar i initial load: **2 → 0** (prefetch={false}
  styr BÅDA omgångarna — o41-EFTER bevisade mekanismen).
- Requests 44 → 42; transfer −2,47 KiB per /blogg-visning (samma
  mönster väntar på alla SeoPageShell-sidor: /kurser, /om-oss,
  speglarna osv. — CTA:n sitter i skalet).
- Serverlast: −1 serverrender av force-dynamic-rutten per
  sidvisning (okvantifierat i Lighthouse, bokförs som strukturfynd).
- CPU-tal (P/LCP/TBT) redovisas med lastkontext; noll-resultat på
  strukturtalen ⇒ ny rot söks (o41-disiplinen).

## §5 Kollisionsbokföring

inloggad-knapp.tsx rördes senast av s7-u2:s AVSLUTADE
läsbarhetsvåg (44f977d1) och v86 (891345fe) — inget aktivt
ägarskap. Syskon i omgången (u2/u3) verifieras mot anspråksfiler
före commit. Mina ytor: inloggad-knapp.tsx + detta protokoll +
lighthouse-rådata (blogg-loginprefetch-fore.json,
loginprefetch-fore-sammanfattning.json) + worklog-rad. Huvud-
agentens `/`-prefetch-yta (SeoPageShell nav/breadcrumb, 12,1 KiB
i FÖRE-mätningen) lämnad orörd enligt spårets dubbla bokning.

## §6 Öppna ytor efter denna våg (spårets kö-läge)

1. `/`-prefetch ×3 (SeoPageShell nav/breadcrumb — huvudagenten).
2. brotli (huvudagent/infra) · språkresolvens-CLS a/b/c (produkt)
   · dölj-undantagets framtid (kundens estetikval).
3. Mätningsrester: /kurser definitiv solo-rond i vilofönster
   (o45 §6-EFTERSKRIFT) · /ar egen mätning av slug-kuren
   (frivillig rest, o41-EFTER).
   — Med dem tilllagda är spårets barnägda kur-kö TOM; nästa
   prestandavåg är huvudagentens eller kräver ny sond.

## §7 EFTER-bokföring

(fylls när prod-synken byggt commit:n — pending-precedens om
RAM-fönstret inte öppnas i agentfönstret)
