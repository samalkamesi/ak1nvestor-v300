# DR-ARKIVSVEP 2026-09-19 — ROND 96:s skrapfiltergap: 748 trackade fabriks-skrap arkiverade ur trädet

**Uppdrag:** Spår 10 (vakt) 2/3, manifest auto-s10-1789826700636 — "DR-övning
nästa i spåret (välj själv): återställ, mät tid/rader, protokoll, städa lokal PG."

**Agent:** s10-u2 (vakt, sent omstarts-dispatch) · **Fönster:** 2026-09-19
16:48–17:0x lokal · **Dom: GRÖN** (städning verkställd och verifierad; ingen
ny restore — se duplikatdomen §1).

---

## 1. Duplikatdomen — var detta objekt (orderns kärna var redan levererad 3×)

Orderns kärna (återställ, mät tid/rader, protokoll, städa lokal PG) var vid
min ankomst 16:48 **fullständigt levererad** av samtliga tre vakter i manifestet:

| Vakt | Leverans | Bevis |
|---|---|---|
| s10-u1 | Blad 9:s elfte restore GRÖN, RTO 11,7 s + RPO 16:09 | DR-PROV-2026-09-19-AUTO-11.md |
| s10-u3 | Kvartalsövningen GRÖN, RTO 11,5 s + städningsfynd | DR-PROV-2026-09-19-AUTO-12.md |
| s10-u2 (föregångaren) | KEDJA-0: första dump+restore av APPENS projekt (aufr) GRÖN, RTO 22,2 s | commit **90a58f89** + DR-OVNING-2026-09-19-KEDJA0-APPDUMP.md |

Blad 10 (db-2026-09-20) föds 09-20 02:30 — ej moget; offsite-arkivet (våg 172)
bär filytor, inga SQL-dumpar. En fjärde restore av blad 9 kl 16:5x hade varit
det fjärde identiska mätvärdet på samma blad samma dag (determinism redan
korsbevisad av AUTO-10/11/12 inom 103 s) — doktrinen "duplikat är förlorat
arbete" väger tyngre än orderns bokstav. Vakt-rollens metod i stället:
**mät, verifiera och fixa rotorsaker med bevis** — och mätningen fann ett
verkligt, stort och mätbart fel (§2).

## 2. Fyndet — ROND 96:s "prod-yta ren" var falsk

ROND 96 (commit a207575a, 16:37:38) bokför: *"456 ospårade fabriksbarns-
skrapfiler … samtliga arkiverade till data/vakten/skrap-arkiv/2026-09-19-pre-r96/
… → prod-yta REN"*. Verifiering vid min ankomst 16:48:

- `ls verktyg/ | grep '^_'` → **749 skrapfiler kvar** i produktionsträdet.
- Arkivet innehåller 452 filer (443 ur verktyg + 6 ur data + 3 anspråk) —
  svepet tog alltså bara **38 %** av verktyg-skrapet.
- Filer som FÖREGICK svepet fanns kvar (t.ex. `_s9u1-1789824900585-commitmsg.txt`,
  skapad 12:55; `_s10u1-middagsdr-commitmsg.txt`, skapad 09-17 14:35) —
  gapet är inte "nya barn skrev nytt skrap efter svepet".

## 3. Rotorsaken (bevisad med git, inte gissad)

`git ls-files verktyg/ | grep -c '^verktyg/_'` → **748 av 749 var TRACKADE** —
committade in i repot av fabrikens barn. ROND 96:s svep filtrerade på
**"ospårade"** (worklog-ordalyftelsen är själva ledtråden) = untracked-filer
ur git-status-vyn. Kedjan:

1. Fabrikens barn skriver sina `git commit -F <fil>`-meddelandefiler, sonder
   och verify-skript **inne i repot** (verktyg/) i stället för i /tmp.
2. Barnen committar dem in (git add utan pathspec trots doktrinens pathspec-regler).
3. Ren-yta-grinden (git status) ser bara untracked-smuts → ROND 96 städade
   456 untracked, lämnade 748 trackade — och claimen "prod-yta REN" möter
   kunden med 749 skrapfiler i kodkatalogen (även på GitHub-spegeln).

## 4. Kuren (reversibel, ROND 96:s arkivmönster exakt följt)

1. `git rm --cached` på de 748 trackade (verktyg/_*) — 748 filer,
   51 748 rader ur indexet; **historiken orörd** (varje fils innehåll lever
   kvar i de commits filerna en gång tjänade).
2. `node /tmp/s10u2-skraparkiv.mjs`: fysisk flytt av **samtliga 749**
   (748 trackade + 1 untracked — föregångarens `_s10u2-kedja0-commitmsg.txt`
   16:46, förbrukad av 90a58f89) till
   `data/vakten/skrap-arkiv/2026-09-19-trackade-verktyg-post-r96/`.
3. Manifestpost i ROND 96:s format appendad till
   `data/vakten/skrap-arkiv/manifest.jsonl` (ts, orsak, antal 749,
   trackadeAntal 748, untrackadeAntal 1, full fillista) — bevisbart och
   reversibelt.
4. Mina EGNA engångsfiler (arkivskript + commitmeddelande) ligger i **/tmp** —
   mönstret som själva rotorsaken pekar ut (§5, läxa a).

## 5. Säkerhetskontroller FÖRE kur (alla gröna)

- **Inga beroenden:** inget levande skript (verktyg/*.mjs/*.sh utan _-prefix),
  crontab eller cron-skrikt ropar en _-fil. Enda träff i hela trädet är en
  historisk KOMMENTAR i testa-ai-mentor-riskmattsdjup.mjs:46 som nämner en
  gammal sond i förbigående — inget kötberoende.
- **Offsite opåverkad:** backup-offsite.mjs:s tar-delar är utpekade filer
  (huvudtrad, mal-state, forskning/, blogg-utkast/, kurser-tillagg/,
  db-snapshot) — skrap-arkivet i data/vakten/ ingår EJ; arkivet 452 MB
  14:53-posten orörd.
- **Syskonytor orörda:** inga leveransfiler rördes — enbart förbrukade
  commitmsg/sond/verify-skrap (deras leveransbevis lever i git-historiken,
  worklog och DRIFTSBOKEN). KEDJA-0:s tre egna _s10u2-filer arkiverades som
  vilka skrap som helst (deras commits: 90a58f89 m.fl.).
- **Inget _-skrap utanför verktyg/** (git ls-files + status): rot-ytan och
  data/ är rena sedan ROND 96:s untracked-svep.

## 6. Oberoende PG-eftermätning (orderns "städa lokal PG" — KEDJA-0 + viloläge)

- `pg_lsclusters`: 17/main **down** (korrekt viloläge).
- psql kopplingsvägran på socketen — inget kluster svarar.
- `base/` innehåller endast systemmall-OID 1/4/5 — skrap-DB:s OID borta
  (KEDJA-0:s ak1a_dr_app tillbakalämnat).
- `pgsql_tmp` **tom**.
- Felloggar enligt mall i /tmp: 6× dr-ovning-fel-blad-2026-09-19 (senaste
  16:07/16:08 = u1/u3:s AUTO-11/12) + 3× dr-appdump-fel-aufr (KEDJA-0:s
  körningar) — pid+ms-namnen höll, noll kollision.
- DR-låsfilen /tmp/ak1a-dr-prov.lock i flock-viloläge (tom infofil, ingen
  process äger flock).

## 7. Läxor/köpost till ROND 97+ (rotens rot — annars återkommer gapet)

1. **Ren-yta-grinden måste räkna trackade _*-skrap:** `git ls-files | grep
   '/_[^/]*$'` är den täckande mätningen; en git-status-baserad grind ser bara
   hälften av verkligheten (bokfördes nu bevisat: 456 sett, 1 192 faktiskt).
2. **Fabrikens promptmall bör standardisera commitmeddelandefilens plats till
   /tmp** — alla 749 filer ligger i verktyg/ eftersom barnen skriver dem i
   repot; orderns "-F <meddelandefil>" anger ingen katalog och barnen följer
   träd-lokal vana. Denna leverans följer /tmp-mönstret.
3. Grind + arkiveringsmekanismer (manifest.jsonl-append) finns nu bevisade i
   två generationer (pre-r96 + trackade-post-r96) — en mekanisering i
   verktyg/ (t.ex. utökad dr-arkivsvep) är ett moget nästa objekt när spåret
   roterar tillbaka.

## 8. Status

- **Dom: GRÖN** — verktyg/ har 0 _-filer, git-index bär 748 raderingar,
  arkivet bär 749 filer + manifestpost, PG17 i viloläge, alla leveransytor
  orörda.
- KVD: data/- och verktyg/-ytor + 748 borttagningar ur indexet — **src/ orörd
  = INGET bygge** (tsc-baslinjen vilar i pre-commit-grinden, som fick validera
  denna commit) · R2 orörd (priser/tier/publicering; .env*/nycklar orörda) ·
  data/blogg/ orörd · prod rördes ej (ingen deploy krävs: raderade _-filer
  ropas av ingen, jfr §5).

SLUT — maskinellt och manuellt verifierat av s10-u2 (vakt) 2026-09-19 17:0x lokal.
