# o573 — Byggartefakten .bygg-kopia: tre kurerade Mimosa-fynd överlevde r359 på disk, och vakten falskt-positive:de på /zcode (spår 8, v180)

**Ägare:** s8-u1, manifest auto-s8-1790822119281 (försök 2). **Filer:**
verktyg/mimosa-paritet.mjs (v1.7) · verktyg/testa-mimosa-paritet.mjs (v1.7-tester) ·
verktyg/kvalitetsvakt.mjs (SITEMAP_EXKLUDERA-raden) · detta protokoll ·
data/vakten/hygien-audit-v180.json. **src/ orörd** — ingen tsc/deploy behövs.

## 1. LARMET — tre fynd som "inte fannns"

r359 (1a6208794, 2026-09-30 23:5xZ) härdade fyra CHILD_PROC_INTERP/SSRF-fynd
i live-trädet och bevisade mimosa-paritet `--doman .` = **1741 filer, 0 fynd**.
Men natten efter (2026-10-01 02:5xZ) mätte samma kommando **3449 filer,
3 fynd** — samtliga i `.bygg-kopia/`:

| Fil i kopian | Rad | Klass |
|---|---|---|
| .bygg-kopia/verktyg/_s1u2-varenergi-q3-kontroll.mjs | 27 | CHILD_PROC_INTERP (`git show ${VINT_HASH}`) |
| .bygg-kopia/verktyg/_s1u3-att-q3-kontroll.mjs | 287 | CHILD_PROC_INTERP (`md5sum ${ROT}…`) |
| .bygg-kopia/verktyg/_s2u1-glen-append.mjs | 243 | CHILD_PROC_INTERP (`git hash-object ${FIL}`) |

Exakt de tre fabrikskontroller r359 kurerade — men i FÖR-kur-versionerna.

## 2. DIAGNOS — stallningsartefakten bar arkivtidens synder

`.bygg-kopia/` är prod-synkens arkivkopia (v183B/r280): varje stallningsfönster
börjar `rm -rf .bygg-kopia && git archive HEAD | tar -x` och bygger i kopian;
gröna fönster städar den, fallna lämnar kvar ("dokumenterad diskkostnad",
prod-synk.mjs r1074-1076). Kedjan som bevisades:

1. Kopian på disk arkiverades **2026-09-30 23:32:48** (filstat i kopian) —
   från det HEAD som **ännu inte bar** r359:s mimosa-kur (23:5xZ).
2. Fönstret föll/avslutades; kopian blev kvar och **fick inte det kurade
   innehållet** (diff live↔kopia: skiljer).
3. Kvalitetsvakten (pumpor-daemonen ropar den **07:02** varje dag,
   pumpor-daemon.mjs r108) kör mimosa `--doman .` = **disken**, inte git —
   artefakten hade dömt nästa rapport GUL trots kurat träd.
4. Parallellt: prod-synkens 02:57:20-rad "VAKTRAPPORT GUL (3 fel)" läste den
   STALE rapporten från 29/9 (dess _r312-sond-fynd var borta från disk sedan
   dagarna före) — två GUL-källor med olika "rot", samma symptom.

**Rotorsak:** mimosa-paritetens exkluderingslista (r124) täckte byggprodukter
(.git/.next/node_modules/.mimosa/dist/.vercel) men inte prod-synkens artefakt-
katalog — hon är samma klass (aldrig leveranskod, körs aldrig i drift,
gitignorerad) men var onämnd. Fönsterdesignens "dokumenterad diskkostnad"
kalkylerade disk men inte vakt-dommen.

## 3. KUR — tre kirurgiska grepp

**K1 — v1.7 BYGGARTEFAKT-EXKLUDERING** (verktyg/mimosa-paritet.mjs):
`.bygg-kopia` in i lsRekursivts exkluderingslista + v1.7-block i filhuvudet
med beviskedjan. Levande kod undantas fortfarande ALDRIG (o15/o23-filosofin).

**K2 — regressionstest** (verktyg/testa-mimosa-paritet.mjs): fixture med
samma farliga exec-mönster i `.bygg-kopia/verktyg-test/` som i `verktyg-test/`
— kopian SKALL ignoreras (0 rader, 1 skannad), verktygskoden SKALL fortfarande
flaggas (exkluderingen öppnar ingen lucka). Båda gröna.

**K3 — engångsstädning** (03:1xZ): `rm -rf .bygg-kopia` (2,5 GB; df 1,1 T
ledigt). Säkerhetsgrunden: prod-synken stod i VÄNTAR-FABRIK (inget fönster
igång — 02:57:21-rad) och ALLA kopianvändare (stallningsKommando r1091,
byggPatchInstallStallningsKommando r899) börjar med egen rm+git archive —
nästa fönster återskapar henne färsk från kurat HEAD. Kurerna K1+K3 tillsamman:
nästa fallna fönster kan lämna kopian i fred utan att vakten dömer GUL.

**Bonus-K4 — /zcode falskt positiv i sektion 7** (verktyg/kvalitetsvakt.mjs):
färska rapportens enda kvarvarande fel var "/zcode viktig route saknas i
sitemap". Diagnos: /zcode = EN-TRYCKS-INGÅNGEN (v216, kunddirektivet
2026-09-30) och layouten bär `robots { index: false, follow: false }` — en
noindex-sida får ALDRIG listas i sitemap (Search Console-felklassen "Submitted
URL marked 'noindex'", samma princip som /pro-blocket i sitemap.ts r87-89).
Vakten krävde täckning för en route som medvetet inte får täckas → `/zcode`
in i SITEMAP_EXKLUDERA med motivering (r611-616). Sitemap.ts orörd.

## 4. BEVIS

- `node --check` gröna × 3 (mimosa, svit, kvalitetsvakt).
- **testa-mimosa-paritet.mjs: 31/31 PASS** (varav 2 nya v1.7-tester).
- **testa-kvalitetsvakt-mimosa.mjs: 12/12 PASS** — kontraktet "vakten ropar
  mimosa med hela trädet" lever med kuren; sviten genererade färsk rapport
  03:10:06 med **mimosa-sektionen PASS — 2041 filer skannade, 0 fynd**
  (före kur: 3449 filer med 3 fynd; differensen ≈ kopian).
- **Full kvalitetsvaktskörning efter K4 (03:16:47Z): ANTAL FEL 0 | MANUELLA 0
  | STATUS GRÖN** — alla sektioner PASS, däribland Typbaslinjen (vakten körde
  tsc --noEmit internt: 0 fel) och Mimosa-paritet full-scan (0 fynd).
- Prod-synken 03:07:21 verifierades stå i VÄNTAR-FABRIK före K3.

## 5. LÄRDOM (doktrin)

En härdning är inte levererad förrän ALLA speglar av koden är friska: git-
trädet, prod-disken OCH byggartefakterna. Artefaktklassens exkludering bor I
instrumentet (där .next/node_modules redan bor) — annars återkommer fyndet
varje fallna byggfönster och ETER att kallas "ny rot". Kostnadskalkyler för
kvarlämnade artefakter skall räkna vakt-dommar, inte bara disk.

**Status: LEVERERAD** (se worklog + commit).
