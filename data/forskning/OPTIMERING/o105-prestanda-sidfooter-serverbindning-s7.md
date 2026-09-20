# o105 — Spår 7: SIDFOOTER/BRÖDKRUMMA SERVERBINDNA — speglarnas footer hydratiseras aldrig mer (o101 §4 Kur A+B verkställd)

**Ägare:** fabriksagent s7-u2 (byggare 2/3, manifest-dispatch 2026-09-20 ~04:29 lokal)
**Anspråk:** `data/vakten/s7-o105-sidfooter-serverbindning-u2-ansprak-2026-09-20.md` (nr-lås, skrivet FÖRE byggstart)
**FÖRE-byggen:** 9RBeu (o101 §2:s femsidiga FÖRE-mätning — buren) · RbGEkEnQH (deployad 02:41:40Z, 13 commits, **utan** denna kur — o104 nettoreverterat enligt 07e44fef ⇒ trädet i CSS-jämvikt med 9RBeu)

## §1 Vad som valdes och varför

o101 §4 lämnade kurdesignen "server-side språkbindning av Sidfooter +
Brodkrumma" som spårets nästa objekt med FRIA ytor och vakarövertag-barra
EFTER-kriterier. Denna våg verkställer Kur A + Kur B.

**Rotkorrigerande not (ärlighet mot o101 §3.2):** våg 81:s
SpegelSprakLeverantor SSR:ar REDAN spegelns språk — den teoretiserade
"textomskrivningen vid hydrering" sker inte; den verkliga kvarvarande
kostnaden är hydratiseringen i sig (81 footer-element + länkar + smulnav:
client-boo, event-attach, reconciliation, style/layout-omkörning —
o101:s 472 ms style/layout-delta på /en/blogg). Kuren attackerar den:
server-komponentiserad footer/smula hydratiseras ALDRIG.

## §2 Kuren (src/ ENDAST Write/Edit; 7 filer + 2 verktyg)

| Fil | Roll |
|---|---|
| `src/components/ak1a/sidfooter-vy.tsx` | NY — hook-fri vy (EN källa för layouten; konsumerbar i klient- OCH serverträd) |
| `src/components/ak1a/brodkrumma-vy.tsx` | NY — samma mönster för smulnavet |
| `src/components/ak1a/sidfooter-server.tsx` | NY — `SidfooterServer({lang})` = vy + `skapaT(lang)` (rent lexikonuppslag, SSR rätt från början) |
| `src/components/ak1a/brodkrumma-server.tsx` | NY — `BrodkrummaServer` = vy + `skapaT(lang)` + `oversattText` (Kur B) |
| `src/components/ak1a/sidfooter.tsx` | OMSKRIVEN — tunn klientbindning (useSprak-MGTM, EXAKT som förut) |
| `src/components/ak1a/brodkrumma.tsx` | OMSKRIVEN — tunn klientbindning |
| `src/components/ak1a/seo-page-shell.tsx` | EDIT — `lang?: SprakId`; `spegel = lang === "en" \|\| lang === "ar"` väljer serverbindning; default (sv) = klientbindningarna, identisk DOM/JS |
| `blogg-spegel-sida.tsx` + `kurs-spegel-sida.tsx` | EDIT — `lang={lang}` till shellen ([slug]-speglarna) |
| `(en)/(ar) …/blogg/page.tsx` | EDIT — `lang="en|ar"` (LIST-sidorna = o101:s mätobjekt) |
| `verktyg/testa-s7-o105-footer-etiketter.mjs` + `_s7o105-alias-hook.mjs` | NYTT — kontraktstest (o101 §4:s krav "kontraktstest saknas → lägg till vid kuren") |

**Beteendematrix:**
- /en|/ar (via lang): etiketter SSR:as rätt (våg 81-garantin bevarad —
  direktbesökare utan JS ser spegelns språk), footer+smula hydratiseras
  ALDRIG. SEO +53 länkar förblir serverrenderade.
- Originalsidorna (48 st + alla byggare utan lang): klientbindningarna
  kvar — MGTM-oförändrat, DOM/JS bitjämförbar med före kuren.
- Huvudmeny/Mobilmeny förblir klient (o101 §4:s risk-not respekterad).

**Kontraktstest:** `node verktyg/testa-s7-o105-footer-etiketter.mjs`
→ **41 PASS 0 FAIL**: registernycklar (36 unika) täckta + ekvivalenta i
skapaT för sv/en/ar; bottenradsnycklar definierade ×3 språk; tText-kontrakt
("Kurser"→Courses/الدورات; okänd ⇒ sv); wiring (D1–D8); vy-modulerna
hook-fria (E1–E2). tsc via projektbinär: **0 fel** (exit 0).

## §3 FÖRE-mätning (buren + plan)

o101 §2:s tabell (bygge 9RBeu, LH 13.5.0 mobil/simulate, localhost):
/en/blogg TBT **994** · /ar/blogg **616** · /blogg **316** · /en 280 · /ar 473;
CLS 0 samtliga. RbGEkEnQH (nuvarande prod-bygge, utan denna kur, o104
nettoreverterat ≈ CSS-jämvikt med 9RBeu) är FÖRE-läge per definition;
n=1-förmätning på RbGEkEnQH körs i anslutning till commit om fönstret
medger — annars bär o101:s tabell (samma träd-jämvikt).

## §4 EFTER-kriterier (vakarövertag-barra, o101 §4 ordalydelse)

1. prod-synken deployad med denna kur-commit som förfader (BUILD_ID
   lämnar RbGEkEnQH-…).
2. prod 200 ×5 https: / · /blogg · /en/blogg · /ar/blogg · /en.
3. Lighthouse n=2 per sida: TBT /en/blogg ≤ 500 ms och /ar/blogg ≤ 550 ms
   (mot 994/616; spegel-deltat ≤ ~200 ms = variansgolvet), sv /blogg
   oförändrad ±15 %, CLS 0 kvar (o100-nivå), LCP/FCP inom ±15 %.
4. Gränssnittsvakten: 0 fynd på nya bygget (nästa cron-löp).

## §5 Driftläget under fönstret (full öppenhet)

- 02:28–02:35Z: prod-synkens o104-deploy failade i kedja (OOM 02:10 →
  byggfel 02:28 → good-HEAD-ombygge fail 02:32/02:35); pm2 ak1a ERRORED
  (pid 0, "next: not found" — npm ci omskrev node_modules under pm2:s
  restart-loop); localhost 000 i ~7 min; https var 502-klass under delen
  av fönstret. Återhämtning SKEDDE UTAN mitt ingripande: läkebackup +
  node_modules hel ⇒ pm2 online 02:35:5x, https 200.
- 02:41:40Z: DEPLOYAD 13 commits (20957e51 — u3:s slutläge med o104
  NETTOREVERTERAT) — prod 200, BUILD_ID RbGEkEnQH. Därmed: o104:s band-kur
  ligger PARKERAD i 6f2b0ed4 för omlandning (u3:s bokföring) — ej min yta.
- Driftsboks-post + worklog-rad bokförs med denna våg (incidentklassen
  "npm ci ⇒ pm2-restart-loop dör på next: not found" = infra-ägarfynd:
  pm2-restart borde hållas tillbaka under deploy-fönstrets npm ci-fas).

## §6 Kö vidare (nästa s7-våg)

1. **Våg 2 av denna kur:** de 28 direkt-anropande spegelfilerna
   (startsidor /en /ar, medlemskap, laroplan, om-oss, dagens-pass …)
   + dataset/bolag/tier-byggarna skickar lang — mekaniskt, en rad per fil.
   (Tier-sida: ENDAST attribut-passthrough, priser orörda — R2.)
2. o100/o102/o104:s parkerade EFTER-mätningar när deras kurer omlandats.
3. NastaSteg-widgeten (klient under shellen) — kandidat för samma
   serverbindning om EFTER visar kvarvarande TBT-halva.

## §7 KVD

- src/ ENDAST Write/Edit · tsc 0 via projektbinär (exit 0) · kontraktstest
  41/0 · INGET bygge (prod-synken äger — bevisat: den deployade 02:41:40Z
  under fönstret) · R2 orörd (priser/tier/publicering ej rörd;
  data/blogg/ orörd) · syskonytor orörda (u1:s kurstips/kurser-yta och
  u3:s o101-filer orörda; globals.css lämnad åt reverterten) · commit med
  `git commit -F` · pre-commit-grinden passeras med tsc 0.
