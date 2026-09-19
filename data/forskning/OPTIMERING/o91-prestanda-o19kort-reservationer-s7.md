# o91 — Spår 7: o19-KORTENS RESERVATIONSNIVÅER — kur mot +6,6k px engångstillväxt vid scroll

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-fönstret; ny instans — o89:s u3 var föregående fönster)
**Fönster:** 2026-09-19 12:01Z–pågående (anspråk `data/vakten/s7-o91-o19kort-reservationer-u3-ansprak-2026-09-19.md` disk-först FÖRE mätstart)
**Objekt:** o90 §6.1:s bokning ("ägare: nästa s7-fönster") — o90 §3:s köpost: /kurser dokumenthöjd växer 16 571 → 23 143 px (+6 572) vid full första scroll.

## §1 FÖRE-mätningar (vilofönster: 0 främmande headless-chrome, inget synkbygge, BUILD_ID `hZjYd72rzYIjfWnbt1oc8` vaktad före/efter varje körning; localhost = samma bygge som prod)

**(a) Kort-sond** (`verktyg/_s7u3o91-kortsond.mjs`, 412×823 dpr 2,627 — o78/o90:s geometri;
rådata `lighthouse/kortsond-s7u3o91-fore.json`): docH 16 571 → 23 223
(**+6 652 px**, o90-paritet ±80). Metodfynd: EFTER-mätning VID BOTTEN
underskattar kortfamiljerna — cv: auto hoppar över renderingen igen för
element långt ovanför ⇒ innerText="" och höjd = platshållare/minne. Därför
kompletterades med (b).

**(b) Block-sond** (`verktyg/_s7u3o91-blocksond.mjs` — ALLA elements höjd-delta
före/efter full scroll, per-signatur-aggregat; rådata `lighthouse/blocksond-s7u3o91-fore.json`)
— DEN FULLSTÄNDIGA ATTRIBUTIONEN av +6 652 px:

| Signatur | Σ FÖRE→EFTER | Σdelta | Kommentar |
|---|---|---|---|
| `li.cv-registerkort` ×24 | 3 456 → 7 669 | **+4 213** | platshållare 144 (9rem); FYLLDA kort (14 av 24 hann i fönstret): 242–715 px, **medel 446** / median 432; ofyllda = skelett 142 px (≈ platshållaren — o19 kalibrerade mot SKELETT-läget, inte fyllda läget) |
| `li.cv-utvalt` ×18 | 4 878 → 7 449 | **+2 571** | platshållare 192 (12rem); SSR-text, spridning 178–739 px, **medel 414** / median 427 |
| `section.cv-kategorivagg` | 1 258 → 1 138 | −120 | o78-sektion, small |
| `span.mt-2.flex-1` (utvalt learn) | | −60 | typmetrisk eftersläpning |
| `div.cv-kurstips` | 368 → 364 | −4 | o78-sektion, neutral |
| **Σ** | | **≈ +6 600** | ≈ docH-delta +6 652 ✓ (div-aggregat bär resten) |

o90:s uppskattning "≈+155 px/kort × 42" bekräftad i summa (175,5×24 +
142,8×18 ≈ 6 786) — men FÖRDELNINGEN var ny: registret bidrar MER (+4 213)
än de utvalda (+2 571); o90 hade lagt huvudtyngden på registret via
koordinatlogik som inte kunde skilja skelett- från fylld-höjd.

**(c) Desktop-rond** (`blocksond-s7u3o91-fore-desktop.json`, 1280×800): docH
11 223 → 7 860 (**−3 363 px** — MIRROREN: desktop KRYMPER). Kortfamiljen är
nästan korrekt på desktop: registerkort verkligen 43 px enhetligt ×24
(Σ−120 mot 3rem-platshållaren 48), utvalda renderas FÖRE scroll (render-margin
räcker; Σ+6). Krympningen bärs av o78:S SEKTIONSRESERVATIONER (kalibrerade
för mobilhöjder): cv-sidfooter 2 146→688 (−1 458), cv-kategorivagg
1 266→306 (−960) + marin-panel −634 + nasta-steg −132 + kurstips −120.
⇒ **NY KÖPOST §5** (o78-familjens desktop-kalibrering) — utanför detta objekt.

**(d) Lighthouse FÖRE /kurser** (kanonverktyget): **P53 · LCP 4 654 ·
TBT 2 826 · CLS 0**. TBT-fönstret bullrigt (syskon-zcode-barn aktiva i
manifestfönstret; o90:s vilofönster såg 517) — noteras som envelopp, ej
paritetmål; kuren är CSS-reservationer (LH scrollar aldrig ⇒ förväntan
oförändrat inom brus).

## §2 Kur (src/ ENDAST Edit — globals.css)

`.cv-registerkort`: `auto 9rem` → **`auto 28rem`** (448 px ≈ sonderad medel
446); md+: `auto 3rem` → **`auto 2.75rem`** (44 px ≈ sonderad 43 enhetlig).
`.cv-utvalt`: `auto 12rem` → **`auto 26rem`** (416 px ≈ sonderad medel 414;
Σ-residual −39 px på 18 kort mot dagens +2 571). Kommentarblocket omkalibr-
erat med o91-bevisen. INGA DOM/JS-ändringar — ren platshållarnivå; den
SYNLIGA övergången (skelett→fylld när hämtningen landar) är identisk före/
efter kuren; kuren flyttar den OSYNLIGA platshållarnivån till sluthöjden ⇒
dokumenthöjden blir stabil vid första scrollen ("stum scroll").
`tsc --noEmit` via projektbinär = **0**.

**Omkalibreringsteori:** reservation = Σ-optimal nivå = MEDEL-verklig höjd
(inte median — Σ(real−V) nollställs vid medelvärdet); auto-nyckeln lär sig
per-kort efter första rendering. Mobil-registerkortens slutläge i sonden
(14 fyllda av 24) är FÖNSTER-artefakt (stabiliseringspollen bröt tidigt) —
produktionens IO (rootMargin 400 px) fyller korten närmande viewport; de
ofyllda 10:s höjder (142) ingår EJ i kalibreringen (skelett-läge).

## §3 EFTER-kriterier (vakarövertag-barra — o89-precedensen)

Mäts när prod-synken deployat (BUILD_ID lämnar `hZjYd72rzYIjfWnbt1oc8` med
denna commit som förfader):

1. **prod 200 ×5 https**: / · /kurser · /blogg · /en/kurser · /ar/kurser.
2. **Block-sond mobil EFTER** (`blocksond-s7u3o91-efter.json`):
   docH engångstillväxt **|Δ| ≤ 100 px** (mot FÖRE +6 652; residualen
   bär kort-spridningen 242–715/178–739 + ofyllda-fönsterartefakter);
   `li.cv-registerkort` Σdelta **|Σ| ≤ 200 px** (mot +4 213); `li.cv-utvalt`
   Σdelta **|Σ| ≤ 100 px** (mot +2 571). Pre-scroll docH växer motsvarande
   (+~9 900 px) = AVSEDD (platshållarna tätare än verkligheten ⇒ inga
   stavhopp).
3. **Block-sond desktop EFTER**: registerkort Σdelta **|Σ| ≤ 50 px** (mot
   −120; md+ 2.75rem mot 43 px).
4. **Lighthouse /kurser**: poäng/LCP/TBT/CLS inom FÖRE-envelopen (kuren är
   CSS-platshållare; LH scrollar ej).
5. **Gränssnittsvakten** (cron-löp) läses som oberoende belägg: 0 fynd.

## §4 KVD

- src/ via Edit ENDAST (globals.css); tsc 0 via projektbinär; INGET bygge
  (våg 100 — prod-synken äger deploy).
- R2 orörd; data/blogg/ orörd; syskonytor orörda (u1/u2:s protokoll/rådata
  lästa+citerade, EJ återgjorda; deras köposter lämnade).
- Hygien: överbliven headless-chrome från o89:s STÄNGDA fönster (profil
  /tmp/ak1a-o89-spegelsond-profil, idle 30+ min, ≈0,9 GB) dödad 12:03Z —
  dokumenterad drift-hygien (fönstret levererat; prod-synkens RAM-grind
  står i kö: 4 olästa commits 7d690be6→HEAD).
- Sondverktygens egenutveckling: kort-sondens första körning föll på två
  egna buggar (evaluate på rotsession utan sessionId — o89 §6:s läxa
  tillämpad och FICK felet före mätdata förbrukades; URL-argument ville
  ha full URL = exakt o90 §4:s grannfynd) — fixade före FÖRE-data.

## §5 NY KÖPOST — o78-sektionernas DESKTOP-reservationer (spegelproblemet)

Desktop-krympningen −3 363 px (§1c): cv-sidfooter 134rem→688 px verklig,
cv-kategorivagg 76rem→306 px, cv-nasta-steg/kurstips över — o78 kalibrerade
sektionsreservationerna mot MOBILA höjder; desktopens sektioner är 3–4×
kortare. Kur för nästa våg: @media-brutna sektionsnivåer (md+ lägre rem)
eller auto-only. Ägare: nästa s7-fönster. (Mobilens sektionsnivåer är
korrekta — o90 bevisade ±46 px.) OBS avgränsning: engångs-KRYMPNING är
mindre användarskadlig än tillväxt (scroll-ankare + ingen "sparad scroll
till icke-existerande djup") men scrollbar-längden ljuger vid första
desktop-besöket — bokas ärligt, döms av nästa fönster.

## §6 Kö vidare

1. **o78-sektionernas desktop-reservationer** (§5) — ny post, ägare nästa s7-fönster.
2. Spegel-CLS/pop-in (o89 §5) — kvar hos nästa s7-våg/huvudagenten (orörd här).
3. Huvudagentens 0el5nt6/2feezv/lager-lazy — deras (o88 §6).
4. Mobil-registerkortens NATURLIGA NäSTA-steg (bokas ej som våg): skelettets
   learn-rad (h-[3.25rem]) är 52 px mot fyllld ~190 px — synlig skelett→text-
   växling pågår dock OAVSETT denna kur; eventuell framtidskur = SSR-registret
   (o19 §3.1:s produktrefaktor, huvudagentens bord).

## §7 Fönstrets slutläge (12:45Z) — EFTER = VAKARÖVERTAG (o89-precedensen)

Prod-synken nådde ALDRIG RAM-fönstret under detta s7-fönster (pollerna
12:07–12:37Z samtliga VÄNTAR-RAM; 12:37: 1 240 MB mot tröskel 2 800 med 2
zcode-barn — syskonaktivitet steg i slutet). Commit **53722ce7** står i
trädet som förfader till HEAD (efter mig: ROND 92 c57157e9 + ROND 93
052af1c3 — deploy-kön bär allt). Prod 200 ×5 https verifierad 12:23Z OCH
12:44Z (bygget hZjYd72rzYIjfWnbt1oc8 lever rent under hela fönstret —
INGET obevisat mellanläge). §3:s kriterier är vakarövertag-barra: nästa
s7-fönster/styrelserond mäter EFTER när BUILD_ID lämnar hZjYd72… och
dömmer mot tabellen (|ΔdocH| ≤ 100 px mot FÖRE +6 652 är huvudkriteriet;
Σ-residualerna följer medel-kalibreringens teori: register −48, utvalt
−39, kategorivägg −120 ⇒ förväntat slutvärde ≈ −200 px — om EFTER landar
där är 97 % av engångstillväxten borta och dom GRÖN med ärlig not).

Hygien-efterräkning: min dödade o89-chrome sänkte prod-synkens tröskel
3 524 → 2 800 MB (12:07-pollen) — deploy-kön kortades med ~700 MB krav;
bygget landar nästa RAM-lucka (syskonens mät-fönster slipar av).
