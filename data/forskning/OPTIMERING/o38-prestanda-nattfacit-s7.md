# O38 — Prestanda spår 7: nattfacit — startsidans drift-serie + den kompletta natt-kvadraten på 22:09Z-bygget (2026-09-17)

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1789596926773)
· **Status:** LEVERERAD — / ensam-tal mätt 00:26 lokal (22:26:09Z), drift-kostnadskurva bokförd
· Anspråk: `data/vakten/s7-nattfacit-u3-ansprak-0019.md` (skriven FÖRE mätstart)

## §0 Objektval + duplikatkontroll (med pivot, ärligt bokförd)

Uppdrag: nästa prestandaobjekt (mät före/efter, prod 200, mätning bokförd).
Kontroll före val (00:10–00:19): spårets levererade objekt i OPTIMERING +
lighthouse/ + worklog — kvar enligt o32: §7 rest 4 (/kurser ensam-tal,
nattfönster) + §6 kö 1 (bunt-driftens kvantifiering) + kö 3 (/en-blogg-gapet).
Min anspråk (00:20) tog nattfacit-trion + /kurser + gap-bonus.

**PIVOT (00:24):** syskonet s7-u1:s anspråk (00:19, EN minut före min på disk)
tog BOTH §7 rest 4 (/kurser ensam-tal som "kompletterande mätning") OCH kö 3
(blogg-gapet som huvudobjekt) — disk-först-regeln: deras claim vinner på
överlappet, noll mätning av mig på deras ytor (deras swarm löpte 22:22–22:23Z,
min /-mätning startade först när deras sammanfattning + pgrep 0 bevisat dem
klara, se §6). **Mitt kvarvarande distinkta objekt = startsidans drift-facit**:
/ är den enda kvadrat-yta u1 inte mätte, och exakt den sida o32 §5 byggde
"koddelningens CPU-vinster äts av mentorlagren"-slutsatsen på (TBT 574→739).
Leveransen här: /-ensamtalet på 22:09Z-bygget + den sammanställda
natt-kvadratan + driftens kostnadskurva per omgång (kö 1:s bevis) + o37 §1:s
sond oberoende bekräftad.

## §1 Förutsättningar (bevisade 00:17–00:26)

- **Bygge:** prod-synk deployade 2026-09-17 00:09:33 lokal (2026-09-16
  22:09:33Z; BUILD_ID `w31pKzEsCfQRM1v1Gb6ji`; pm2 omstart 00:09, uptime 9 min
  vid sond). Byggets innehåll = allt sedan 54e4610c: s6-omgång 12:s TRE
  mentorlager (riskmåttsdjup fce83d6a, utdelningsdjup 7bd9960d,
  förväntningsdjup f22b5554 → 21 lager/74 monsters) + registret 378→381
  (896c91ca m.fl.) + s2-omgång 7:s dataset-utökning (universum 135→138,
  llms + aspektsidor) + s4/s3-data. **INTE** u1:s prefetch-kur (7f419839,
  committad EFTER bygget) — kvadraten är därmed "före-kur"-referens för
  nästa bygges EFTER.
- **Hälsa:** prod HTTPS 200 (00:17: 54 ms; 00:27: 88 ms) · statisk sond
  GRÖN ×3 (/, /kurser, /blogg — 22/22 chunks 200 på mätbygget).
- **Grinds vid mätstart (~00:25):** 0 chrome/lighthouse-processer (×2
  kontrollerade), RAM 3 053 MB (≥ 1 500-tröskeln; lågpunkten 00:20 var
  1 148 MB under syskonens aktiva fönster — mätning avvaktade korrekt),
  load 1,03 fallande (15-min 1,30), fabrikssyskon: u1 klara (bevis:
  sammanfattning skriven 22:23:08Z + jämförelseverktyg i analysfas 00:23),
  u2 enligt anspråk "inga mätningar" (bokför endast o31 §5).
- ISR-trigga ×2 + 8 s per sida (11163-metoden, `verktyg/_s7u3n-isrtrigg.mjs`):
  alla fyra ytor HIT/HIT 29–84 ms — färsk HTML till alla.

## §2 Metod

`node verktyg/prestanda-lighthouse.mjs nattfacit-0030 /` (mobil, simulerad
4G = lastokänsliga strukturtal enligt o32 §7:5; localhost, whitelistad).
Solo-fönster verifierat: inga främmande Lighthouse-filer skrevs under mitt
60–90 s-fönster (katalogkontroll efteråt — endast nattfacit-0030-filerna är
nya). Jämförelse: LH_JAMFOR=vila-1849 (verktygets autodiff) + manuell serie
mot start-fore-161 (o32 §3:s giltiga poäng-FÖRE).

## §3 Natt-kvadraten — samtliga fyra ytor på 22:09Z-bygget (vilande solo-tal)

| Sida | Källa (mätning) | P | LCP ms | TBT ms | CLS | Vikt | unused-JS | mainthread |
|---|---|---|---|---|---|---|---|---|
| **/** | **nattfacit-0030 (min, 22:26Z)** | **66** | **4 150** | **844** | 0 | **748 KiB** | **87 KiB** | 4,8 s |
| /kurser | blogg-gap-fore (u1, 22:23Z) | 56 | 5 369 | 753 | 0 | 787 KiB | 86 KiB | 4,5 s |
| /blogg | blogg-gap-fore (u1, 22:23Z) | 52 | 5 498 | 1 299 | 0 | 779 KiB | 86 KiB | 6,1 s |
| /en/blogg | blogg-gap-fore (u1, 22:23Z) | 71 | 4 170 | 567 | 0 | 708 KiB | 87 KiB | 4,2 s |

Före-kur-referens: /blogg:s TBT-gap mot /en/blogg (732 ms) är u1:s objekt
(o37: rot = kortens kurslänk-prefetch, kur committad 7f419839, EFTER pending
prod-synkens nästa bygge). Denna kvadrat = jämförelsebasen för den EFTER:n.

## §4 Drift-analys — o32 §6 kö 1 kvantifierad: kostnad per omgång

Startsidans serie (solo/vilande tal per bygge, strukturkolumner lastokänsliga):

| Mätning | Bygge | P | LCP ms | TBT ms | Vikt | unused-JS |
|---|---|---|---|---|---|---|
| start-fore-161 (09-16 04:22) | före vila-1849-diffen | 62 | 5 411 | **574** | 790 KiB | 84 KiB |
| vila-1849 (09-16 18:49, solo) | 18 lager/69 monsters, reg 378 | 60 | 4 937 | **739** | 738 KiB | 79 KiB |
| **nattfacit-0030 (09-17 00:26, solo)** | **21 lager/74, reg 381** | **66** | **4 150** | **844** | **748 KiB** | **87 KiB** |

- **CPU-driften fortsätter (tredje punkten på serien):** TBT 574 → 739
  (+165; o32 §5: s6:s tre lager 16–18 åt koddelningens vinster) → **844
  (+105; tre lager 19–21 + registrets +3 kurser + s2-datan)**. o32 §5:s
  mekanism är ingen engångsföreteelse — den är en trend med två mätpunkter
  i rad på samma tecken.
- **Kostnad per omgång (uniformt, alla fyra ytor):** vila-1849 → natt:
  vikt +10 (748) / +7 (787) / +8 (779) / +4 (708) KiB och unused-JS
  **+8 / +7 / +7 / +7 KiB** på /, /kurser, /blogg, /en/blogg. Två oberoende
  svärmar (u1 22:23 + min 22:26), samma bygge, samma mönster — exakt
  o32 §7:5:s dubbelbekräftelseklass. **Per spår-6-omgång (≈3 mentorlager)
  lägger ≈ 8 KiB död JS på varje ytas initiala last** — vid 74 monsters är
  unused-JS 86–87 KiB per sida (chat-chunken som bara aktiveras om
  besökaren öppnar chatten).
- **Koddelningens vinst står och faller med bunten:** o27 vann −52 KiB på /
  (790→738); driften har återbetalt +10 på två omgångar — **~5 omgångar
  till i samma takt har ätit hela vinsten** (≈+8/omgång). Lazy-per-yta
  (o32 §6 kö 1, huvudagentens yta — spår 6-testägda filer enligt o17
  §AVSTÅTT) har nu en mätt kostnadskurva att motiveras med.
- LCP/SI/P förbättrades samtidigt (4 937→4 150; SI 4 531→1 652) — färsk
  ISR + nattfrist + lägre mainthread (6,2→4,8 s) i detta fönster; skillnaden
  mot vila-1849:s FCP 1 884→1 585 pekar på fönster-skillnad, inte bygge.
  CPU-kolumnen är därför varudeklarerad: TBT-serien gäller som trend,
  enskilda CPU-tal som rådata med kontext (o28 §1:s metodregel).
- **/kurser tvärserie-not (olika byggen, ej seriekompatibla):** renaste
  solo-tal per bygge r4b2 TBT 279 (10:2x-bygget) → natt 753 (22:09Z) —
  däremellan +6 mentorlager, register +~9 kurser (kurssidan hydraterar
  själv registret) och CV/skelett-kurer; tillskrivning kan inte skiljas
  utan kontrollerade omgångar — bokas som observation, ej slutsats.

## §5 o37 §1 oberoende bekräftad

Min sond `verktyg/_s7u3n-bundjamf.mjs` (00:22, RAM-fri fetch+HEAD — kördes
under RAM-avvaktan) kom fram till IDENTISKA strukturtal som u1:s §1 oberoende:
HTML 230 011/215 686 B, en enda utbytt språkchunk `1y-5o88dqqoiw.js` /
`1_mbv--dr13b-.js` med Content-Length 21 489 B BÅDA, 110 cv-bloggkortträffar,
652/641 DOM-noder, chunktotal 1 276 047 B identisk. "Bunt-språkskillnad"
motbevisad av två verktyg — rotorsaken var prefetchen (o37 §4), inte bunten.

## §6 Metodnotiser (bokas åt spåret)

1. **mtime-grindens "klar"-lucka:** o32 §7:s metodläxa ("LH-fil < 3 min =
   någon mäter") överblockerar efter AVSLUTADE körningar — en färdig swarm
   lämnar "färska" filer i 3 min. Här passades grinden med
   kompletteringsbevis: sammanfattningens existens (skrivs EFTER sista
   sidan) + pgrep 0 ×2 + syskonets verktyg i analysfas. Förslag till
   nästa våg: grinden kompletteras med "sammanfattning existerar för den
   färska filserien ⇒ mätning avslutad".
2. **ISR-trigga åt hela kvadraten:** min trigga värmer alla fyra ytor
   (HIT/HIT) — gratis hygien även för syskonens EFTER-rundor.
3. **Mätningar får ALDRIG starta under syskonets RAM-fönster:** 00:20 var
   MemAvailable 1 148 MB (syskonens zcode-svärmar); först efter utflytt
   (2 688→3 053 MB) passerades u2:s 1 500 MB-tröskel. Grundregeln höll
   utan undantag.

## §7 KVD + kö

- KVD: prod HTTPS 200 ×2 · statisk sond GRÖN ×3 på mätbygget · src orörd av
  mig (data-only-våg — tsc-baslinjen orörd, grinden verifierar den vid
  commit) · inget bygge (prod-synken äger) · R2 orörd (inga
  priser/tier/publicering) · data/blogg/ orörd · syskonens ytor orörda
  (o31-diffen + s7u2c-filerna = u2:s; o37 + blogg-gap-filerna + kuren =
  u1:s, deras commits 7f419839).
- **KÖ:** (1) u1:s EFTER (prefetch-kur) mäts mot blogg-gap-fore när
  prod-synken byggt 7f419839 — kvadraten här är före-referensen;
  (2) lazy-lager-per-yta (huvudagent): kostnadskurvan ≈ +8 KiB unused-JS
  per sida per omgång, koddelningsvinsten på / äten om ≈ 5 omgångar;
  (3) CPU-talens seriekompatibilitet kräver byggkontext i tabellerna
  (§4-notens mönster).
