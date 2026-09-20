# o101 — Spår 7: o97-flaggens SLUTVERIFIKATION (30.75rem) + spegel-popin-tvärsnitt + o100-EFTER-läge

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1789867506896, omgång 26-fönstret 2026-09-20)
**Fönster:** 2026-09-20 01:25Z–pågående. **Anspråk:** `data/vakten/s7-o98-spegel-popin-u3-ansprak-2026-09-20.md` (gitignorad disk-bevis; original 01:29:52Z, omriterat vid nedställningen ~02:1xZ).

## §0 Nummer + tresyskonkollisionen (öppet bokförd)

Originalanspråket tog spegel-pop-in (o89 §5 / o97 §6.2) + o97-flaggens slutverifikation.
Diskordning i racet: **u1 01:29:08Z** (o99) → **u3 detta fönster 01:29:52Z** (44 s senare) →
**u2 01:32:00Z**. u1:s sondar fastnade i RAM-låst fönster (367–412 MB); u2 blev först till
commit med färdigbevisad kur (9da2912c, nr o100 — trefönster-precedensen; deras meddelande
bokför kollisionen öppet). **Jag står ned från kur-leveransen:** mina två markörklass-editer
i (en)/(ar)-sidorna är ÅTERSTÄLLDA till originalmarkup (git-status ren på båda — verifierat).
Mina FÖRE-mätningar (gjorda FÖRE nedställningen) lever vidare som tvärsnitt §2.
Protokollnr: **o101** (o98 ägs av spår 8:s skalfri-våg; o99 = u1:s anspråksnr; o100 = u2:s leverans).

## §1 o97-flaggen 30.75rem — SLUTVERIFIKATION GRÖN (posten stängd)

**Bakgrund:** o97 §5.2: mobil flagg rad2 +183 px över 150-taket (platshållare 27rem=432 mot
renderat 739/427/313) ⇒ justering 27→30.75rem (f8d1d847; rad2:s sonderade verkliga medel
493 px), EFTER-verifikation bokad "vid nästa deploy" med kriteriet **flagg rad2 Σ|Δ| ≤ 50**.

**Deploy-läge:** 30.75rem I PROD sedan deploy 01:03:06Z (4 commits till 65f9963d, BUILD_ID
9RBeu) — bevis: byggd CSS `.next/static/chunks/1xseipgqmlg-3.css` innehåller
`cv-utvalt-flagg .cv-utvalt{contain-intrinsic-size:auto 30.75rem}` (grep-verifierad).

**Mätning** (o97 DOMSLUTENS egna bokningskommando, ordagrant):
`node verktyg/_s7u3o96-sond.mjs flagg3075-efter-kurser-mobil http://localhost:3000/kurser mobil`
— rådata `o96sond-flagg3075-efter-kurser-mobil.json` (lighthouse-katalogen).

**Resultat — kriteriet UPPFYLLT med marginal:**

| flagg rad2 | platshållare (FÖRE) | renderat (EFTER) | Δ |
|---|---|---|---|
| kort 4 | 492 (30.75rem aktivt ✓) | 739 | +247 |
| kort 5 | 492 | 427 | −65 |
| kort 6 | 492 | 313 | −179 |
| **Σ** | | | **+3 px ≤ 50 ✓** |

(mot +183 före justeringen; 492 ≈ 493 sonderat medel = kalibreringens fullträff).
Tvärsnitt samma körning: borja-sektionen ±0 (Σ 1104→1104 — kirurgisk) · nya 628×6 →
586–703 (Σ +101 — inom o97 §5.2:s dokumenterade inom-sektionsspridning 547–703) ·
textLen + font identiska FÖRE/EFTER på samtliga kort (o97 §1a:s rotbevis gäller vidare:
platshållar-flex, ej text/font-byte). **o97:s sista öppna rad är STÄNGD.**

## §2 Spegel-popin-tvärsnitt — o100:s rot OBEROENDE DUBBELBEVISAD (min FÖRE-baslinje)

Instrument: `verktyg/_s7u3o98-popin-sond.mjs` (o98 = arbetsnamn, skrivet FÖRE nr-flytten —
o96:s `_s7u3o96-*`-precedensen): CDP + PerformanceObserver layout-shift MED
källnods-attribution + höjdtidslinje (50 ms) + nodtopps-tidslinje (100 ms: h1/notis/wrapper/
grid/docH/scrollY) + LH-lik trottling (CPU 4× + 150 ms RTT/1,6 Mbit — LH-mobilprofilen).

| sida | ΣCLS | skift A (layout-etablering) | skift B (tipsfyllning) | wrapper 0→fylld |
|---|---|---|---|---|
| /en/kurser mobil | 0,2045 | 0,1028 @1446 ms (kolonn h0→materialiserad; @709 ms ALLA noder h0) | 0,1017 @2777 ms (grid y620→984>823 under vikten) | 0→364 px @2817 ms |
| /ar/kurser mobil | 0,2701 | 0,1396 @3184 ms | 0,1305 @4757 ms (grid →892>823) | 0→344 px @4789 ms |
| /kurser sv mobil | **0,0000** | — | — (fyllning 0→368 px @2787 ms sker dock) | wrapper y9053 under vecket |

**Kontrollens poäng:** svenska sidan har SAMMA komponentfyllning men wrappern under
vecket ⇒ noll skift — immunmekanismen är LÄGET (toppvy vs under vecket), inte komponenten;
oberoende bevis för o100:s kurprincip (golv = konstgjord under-vecket-position från första
layouten). Skift A:s mekanik (hela kolonnen h0 vid @709 ms → materialiserad) förklarar varför
golvet enligt o100:s A/B dödar ÄVEN A: gridden landar under vecket redan vid första layouten.
Desktop-kalibrering (1280×800): wrapper fylld **248 px på BÅDA speglarna** (o92-paritet —
o100:s md+ 15,5rem bekräftad av mitt tvärsnitt).

**Lighthouse FÖRE** (kanonverktyget, vilofönster 02:0x–02:1xZ, rådata
`{en,ar}_kurser-s7u3o98-fore.json` + `s7u3o98-fore-sammanfattning.json`):
/en **P66 · LCP 4 413 · TBT 513 · CLS 0,1028** · /ar **P49 · LCP 4 049 · TBT 1 221 ·
CLS 0,2701**. Två instrumentfynd av kvalitet: (1) CLS-värdena BITIDENTISKA med sondens
(en 0,1027964683724063; ar 0,2701323088217716) — sonden är LH-trogen, samma motor;
(2) fönsterkänsligheten kvantifierad: en-LH-fönstret fångade bara skift A, ar båda —
u2:s FÖRE-fönster (o100) fångade 0,1028/0,1396. Baslinjen för o100:s EFTER-jämförelser
är därmed fönsterdokumenterad.

## §3 Deploy-läge + vakarövertag

- Prod (9RBeu, bär 30.75rem): **200 ×5 https ✓** (/, /kurser, /blogg, /en/kurser,
  /ar/kurser — 02:2xZ; flagg-domens prod-bevis).
- Prod-synkkön 01:47Z: NY KOD → 2d357315 (senare: 9da2912c o100-golvet +) — VÄNTAR-RAM
  (930 MB < 3 524; chrome-cron +1 024). **Om deployen landar efter u2:s fönster:**
  o100 §5:s kriterier är vakarövertag-barra med detta fönsters instrument —
  `node verktyg/_s7u3o98-popin-sond.mjs efter-{en,ar}-mobil http://localhost:3000/{en,ar}/kurser mobil js`
  (kriterier: 0 layout-shifts, wrapper min-height aktiv = fylld höjd, gridTop > viewport
  från första layouten) + `node verktyg/prestanda-lighthouse.mjs efter-o100 /en/kurser /ar/kurser`
  (kriterium CLS ≤ 0,01) + /kurser CLS 0 kvar + vakten 0 fynd. FÖRE-paren: §2 + u2:s rådata.

## §4 Kö vidare

1. **o100-golvets prod-EFTER** (vakarövertag-bar, §3 — första kommande deploy som lämnar
   BUILD_ID 9RBeu med 9da2912c som förfader).
2. o97 §6.1 registerkortens individuella stavhopp / SSR-registret (o19 §3.1) —
   huvudagentens produktfråga, kvarstår oförändrad.
3. o97 §6.3 tablet-gapet 768–1 024 (utvalt-kortens md+-nivåer extrapolerar från 1 280) —
   osonderat.
4. Skift A-klassen (layout-etablering h0→materialiserad vid trottling): dött av o100:s
   golv enligt deras A/B; om framtida vilofönster visar kvarvarande A-artefakter på andra
   sidor än speglarna = ny separat post (inte kurstips-specifik).

## §5 KVD

- src/ slutligt ORÖRT av detta fönster (kollisionsnedställningen §0; de två markörklass-
  editerarna återställda; git-status ren) · `node node_modules/typescript/bin/tsc --noEmit`
  = 0 (hela trädet, commit-grindens kanal).
- R2 orörd (priser/tier/publicering) · data/blogg/ orörd · INGET bygge (prod-synken äger
  deploy) · syskonens ytor orörda (u1:s o99-anspråk + u2:s o100-leverans deras).
- Egna filer: protokollet + sondverktyget + rådata ×10 (6 popin-sonder + 2 LH-sidor +
  sammanfattning + flagg-sonden) + worklog-rad.
