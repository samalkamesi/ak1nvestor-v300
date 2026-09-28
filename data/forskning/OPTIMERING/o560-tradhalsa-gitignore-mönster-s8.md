# O560 — SPÅR 8 KVALITET: TRÄDHÄLSA — .gitignore-MÖNSTERKUR + OGILTIG-ARKIV + TESTBUNTSSTÄD (s8-u3, 2026-09-28)

Fabriksagent s8-u3 (manifest auto-s8-1790625928515, vakt 3/3). Uppdragstext:
"Kvalitetsvåg: nästa i spåret (välj själv) — rotorsaksfix + bevis (tsc 0,
vakten grön, bygge grönt)." Anspråk disk-först
(`data/vakten/auto-s8-1790625928515-s8-u3-ansprak.md`); nummerreservation
**o560** via kanoniska `verktyg/reservera-protokollnummer.mjs` (--nästa under
flock; högsta kända ur 169 källor = o559, syskon s8-u1:s färska reservation).

## §0 Val (duplikatkontroll)

Senaste s8-leveranser grantagna: o156 (upptäckbarhet), o157 (språkkontrakt),
o161 (vakt-utdatakontrakt), o162 (ledger-rustning), o164 (beroendevakt).
Gränssnittsvakten GRÖN 0 fynd (2026-09-28T19:17-rapporten) ⇒ ingen
fyndjakt. Beroende-patch = prod-synkens/yttre ägare (fabriksbarn förbjudet
npm-install). **Kvar på bordet: AGENTS.md:s trädhälseslag** — "Håll trädet
COMMITTAT — en smutsig yta larmar i prod-synk.loggen och du lever i gammal
kod" — brutet sedan morgonen av TWO rotorsaker (§1), ingen tidigare s8-våg
tog dem.

## §1 Rotorsakerna (bevisade)

1. **.gitignore:s uppräkning var inte ett mönster.** Raderna
   `/.next-laeke/ /.next-ny/ /.next-forra/ /.next-ny-kass/` täckte bara
   KÄNDA kataloger. Nattens forskning (04:30) byggde `NEXT_DIST_DIR=.next-test3`
   (hela appen, alla route-grupper; BUILD_ID bjdGrMcMJZQ-v_TZeGjML) — noll
   referenser i verktyg/src/infra (grep bevis) — och katalogen (1,5 GB)
   smutsade `git status` i 16 timmar. Klassen är systemisk: nästa
   testbuntsvariant läcker igen.
2. **o556:s ogiltiga mätrester aldrig arkiverade.** o556 §2 bokförde
   start-P31-försöket (LCP 16,3 s/TBT 39 723 ms, fetchTime 17:56:22Z) och
   kurser-laststämpeln (LCP 6,8 s/TBT 20 910 ms, fetchTime 18:46:34Z) som
   OGILTIGA/kastade — men filerna lämnades ospårade på disk
   (`lighthouse/{start,kurser}-o556-efter.json` + fel-sammanfattning med
   spawnSync ETIMEDOUT). Trädet smutsigt; beviskedjan halv (bokförd men
   ej arkiverad — s7-u3:o558-precedenten kräver "ogiltiga mätfiler bevaras
   ärligt" i git).

## §2 Kuren

1. **Mönsterkuren**: `/.next-*/` ersätter uppräkningen (täcker läke, ny,
   förra, ny-kass, test3 + ALLA framtida varianter — byggkataloger är
   runtime, aldrig leverans). Bevis: `git check-ignore -v` → rad 13 fångar
   både .next-test3 och .next-ny; `git ls-files '.next-*'` = 0 (inget
   trackat förloras); `git status` ren på den ytan.
2. **Vaccinet**: verktyg/testa-prod-synk-nolldowntime.mjs kontroll 25 kräver
   nu mönstret OCH förbjuder uppräkningsregression
   (`includes("/.next-*/") && !includes("/.next-ny/")`). Baseline före:
   25/25 PASS (uppräkning godkändes då — det var luckan); efter: 25/25 PASS
   med det starkare kravet.
3. **OGILTIG-arkivet** (s7-u3-precedenten): namnbyten i
   data/forskning/OPTIMERING/lighthouse/ —
   `start-o556-efter-OGILTIG-smutsfonster.json`,
   `kurser-o556-efter-OGILTIG-laststampad.json`,
   `o556-efter-OGILTIG-smutsfonster-sammanfattning.json` — committade.
   Kooperativ notis i o556 §6.1 (kön orörd: eftervaktens dom-fil väntar
   fortsatt på nästa s7-våg/ROND; vakten lever i fas vantar-fonster).
4. **Städ**: .next-test3 (1,5 GB) raderad via node-kanalen efter trippel
   bevisning: noll kod-referenser (grep), noll öppna filer (lsof +D tomt),
   BUILD_ID 04:30 äldre än deploys sedan dess (prod .next oskadd efteråt,
   BUILD_ID verifierad). Disk var 2 % — inte akut, men maskinhälsa.
   ALDRIG node_modules (förbudet respekteras — detta var en byggartefakt).

## §3 Bevis (KVD)

- `node node_modules/typescript/bin/tsc --noEmit` → **0 fel** (src orörd —
  baslinjens överlevnad bevisad, inget bygge krävt/krävts: endast .gitignore
  + verktyg-test + data berörda).
- `node verktyg/testa-prod-synk-nolldowntime.mjs` → **25 PASS, 0 FAIL**
  (före: 25/0 med svag kontroll; efter: 25/0 med mönsterkrav).
- Prod: **https 200** (0,87 s) + **loopback 200**.
- `git status` → **ren** utöver vågens egna leveransfiler.
- R2 orörd (priser/tier/publicering) · data/blogg/ orörd ·
  src/ orörd · syskonytor orörda (s8-u1:s o559, s8-u2:s val lästa som
  reservationer, ytor disjunkta) · eftervakten (o556) och dess filer RÖRS
  EJ (endast läst + arkiveringsnotis i protokoll §6.1).

## §4 Kö vidare

1. o556 §6.1-kön består (eftervaktens dom + giltiga mätfiler) — nästa
   s7-våg/ROND adopterar; OGILTIG-arkivet är förberett, inte dom.
2. Nästa trädhälseskav: `git status` skall vara tomt VID VARJE vågs slut —
   om ny smuts uppstår, mönsterkolla .gitignore först (denna klass är nu
   vaccinerad för .next-*; motsvarande uppräkningar i andra mappar
   granskas vid fynd).
3. .next-test3:s producent (manuell NEXT_DISTORD-build i nattforskning)
   har inget spårbart verktyg — vid nästa nattfönster: bygg testbuntar
   till /.next-*/-matchande namn (nu säkra) eller /tmp.
