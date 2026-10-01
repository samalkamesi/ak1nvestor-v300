# DESK-U32 — LÄKARKLASSNINGEN: skälläkaren lär sig skillnaden mellan läkbart fel och rot-köns fel (r315→U32)

**Fabrikuppdrag:** auto-s11-1790855728248 s11-u1 (BYGGARE, spår 11 DESK A-Ö,
"nästa i spåret — välj själv") · **Datum:** 2026-10-01 12:03–12:2x UTC ·
**Ägarskap:** /home/ak1a/desk-lakare (läkarkällan, utanför repot —
hash-kvitto § 4, U2B/U22-mönstret) + detta protokoll + anspråksfilen +
worklog-rad. /etc + /usr LÄSTA aldrig skrivna. `verktyg/desk-halsa.mjs`
är u2:s yta denna våg (DESK-U30, commit 0687db0b9) — 0 rader av mig.

---

## § 0 Sammanfattning för kunden (icke-teknisk)

Underhålls-programmet som vaktar ditt skrivbord har en inbyggd "läke-
åtgärd": ser det fel två gånger i rad startar det om ditt ZCode. Men felet
kan sitta på STÄLLEN som en omstart aldrig kan laga (t.ex. serverns
dörrkonfiguration) — och då blev omstarten ren skada: **igår natt till
idag lunch startades ditt ZCode om 34 gånger i onödan**, en gång var
halvtimme, medan du tittade på. Dagens kusin-våg (U30) gjorde mätningen
grön igen så omstarterna slutade — men själva regeln, "omstart vad fel
som helst", fanns kvar och skulle slagit igen nästa gång något oläkbart
går sönder. Denna våg har lärt lakaren skillnaden: **omstart endast när
felet faktiskt kan sitta i ZCode; alla andra fel larmas högt och lämnas
åt rätt ägare** (serverns rot-rond).

## § 1 Fyndet — lakarens strukturella bugg är roten till skadan

Skälläkaren (/home/ak1a/desk-lakare, cron var 30:e minut) bar r315-
kontraktet: *kor desk-halsa; vid TVÅ FELSUT I FÖLJD ⇒ restart av enbart
zdesk-zcode*. Kontraktet klassar ALDRIG VAD felet är — vilken FAIL som
helst räknas lika.

**Skadeförloppet (läkarjournalen ~/desk-halsa.log, belagt):**

- 30 sep 19:45–22:23 ändrades nginx-konfen (desk-sektionen; se § 5:s
  ärlighetsrad) så att `/desk/` (med snedstreck) slutade svara 302.
- desk-halsa (då U27-kontraktet: `/desk/` ⇒ 302) FAILade varje körning.
- Lakaren såg "fel #2 i följd" var 30:e minut ⇒ **34 omstarter av kundens
  zdesk-zcode mellan 30 sep 22:30 och 1 okt 11:30** (loggbelagt; grep
  "lakar —" = 49 totalt, 34 i fönstret; porträttappens session avbröts
  varje gång — kunden som satt i strömmen togs ut).
- Klassen är återkommande: U29:s akutfångst 30 sep (18:30+19:00, 2 st)
  var samma mönster — kurerad då ENBAST genom att hälsan blev grön
  (U27:s kontraktsföljd), aldrig i lakarens struktur. U30 upprepade det
  exakt: grönt återställt 12:06:33, omstartshotet avvärjt för 12:30-
  cykeln — men regeln "omstart vad fel som helst" lämnades orörd (u2:s
  protokoll § 5: "inga omstarter"; deras kur äger mätänden, ej lakaren).

**Varför strukturen MÅSTE kuras:** nästa icke-läkningsbara FAIL (nginx-
konfig, web-rot-fil, landningsfilen, auth-bomm) ger en NY serie onödiga
kundomstarter efter exakt två cron-varv. Hälsan kan ALDRIG garantera
grönt i förväg — dess jobb är just att FAILa när något äkta är fel.

## § 2 Kuren — FAIL-klassning FÖRE läkning (r315 → U32)

I /home/ak1a/desk-lakare (nya versionen 2 723 byte, sha § 4):

1. Lakaren samlar numera hälsans HELA utdata (exit-kod OCH rader) i
   stället för att bara titta på exit-koden.
2. **Klassning av FAIL-raderna** med två greppbara mönster:
   - **LÄKBARA** = `FAIL (systemd-enheter|x-geometri|fonstermaximering):`
     — rot kan ligga i zcode-processen eller dess display; en omstart
     är en relevant kur.
   - **ICKE-LÄKBARA** = `FAIL (http-|webrot-|landning-)` — roten ligger
     i nginx eller filsystemet; EN zcode-omstart kan ALDRIG laga det
     (bevisat av de 34 omstarterna: ingen enda läkte konfigfelet).
3. **Enbart icke-läkningsbara FAIL ⇒ LARM-rad i läkarjournalen** ("laker
   EJ, kundens Zcode ororas", hänvisning DESK-U32 + rot-köns bord) —
   lakning EJ, räknaren ORÖRD (grönt senare nollställer den; ett äkta
   läkbart fel efteråt räknas från noll, korrekt).
4. **Blandade FAIL (läkbar + icke-läkningsbar) ⇒ r315-logiken gäller**
   (någon läkbar rot FINNS; konservativt val — lakningen förblir den
   smalaste åtgärden och hälsans övriga FAIL syns i journalutskriften).
5. r315-kontraktet i övrigt OBRUTET: lakning ENBART zdesk-zcode
   (sudoers-vitlistad), ALDRIG xvnc/wm/novnc, max EN lakning per
   cron-varv, journalförs + nollställer räknaren. ASCII-transkriptionen
   (å→A, ö→o i kodsträngar) följer r315:s egen konvention.

## § 3 Bevis — sonden 8/8 + äktkörning (egna mätningar, UTC)

Engångs-sond `/tmp/_s11u1-lakartest.mjs` (node-kanalen; städas efter
bruk — fabrikskonventionen; utdata ordagrant i worklog-raden):

| Kontroll | Resultat |
|---|---|
| `bash -n /home/ak1a/desk-lakare` | OK (filen parses ren) |
| Klassning: enbart http-FAIL (dagens regressionsform) | lakbara=0, icke=1 ⇒ **LARM, läk EJ** ✓ |
| Klassning: systemd-FAIL (äkta zcode-död) | lakbara=1 ⇒ **RÄKNA (r315-läkning)** ✓ |
| Klassning: blandat (http + systemd) | ⇒ **RÄKNA** (konservativt) ✓ |
| Klassning: grönt (klassningen nås ej — exit 0 före) | gröna utdata fäller ej LARM-grenen ✓ |
| ÄKTA lakar-körning (12:1x): state | 1 ⇒ 0 (nollställd av grönt, korrekt väg) ✓ |
| ÄKTA körning: zdesk-zcode ActiveEnterTimestamp | OFÖRÄNDRAD 11:30:30 — ingen omstart ✓ |
| ÄKTA körning: journalen | bär `RESULTAT: 9/9 PASS` + INGEN lakar-rad ✓ |

**RESULTAT: 8/8 PASS.**

- **Egen felning under utvecklingen (bokförd, U27:s sedvana):** sondens
  första version väntade sig att det GRÖNA fallet skulle klassas — men
  lakarens exit 0-gren kommer FÖRE klassningen; sondens väntan var fel,
  inte lakarens logik. Rättad + omkörd ⇒ 8/8.
- **12:30-eftermätningen:** cron-varvet efter kuren förväntas grönt
  (u2:s 9/9-kontrakt + min äktkörning bägar det); det gröna kvittot
  läses ur ~/desk-halsa.log (u2:s U30 bad om samma eftermätning).

## § 4 Kollisionen tre byggare — samma fynd, NOLL duplikat-leverans

- **u2 anslag 12:02** (jag 12:05, u3 12:06) och levererade DESK-U30
  (12:0x, commit 0687db0b9): desk-halsa kontrakt 1 ⇒ exakt `/desk` +
  NY kontroll 1c (telefon/larm 401), 7/8 ⇒ 9/9 PASS. Disk-tälingen på
  desk-halsa förlorades av mig — **mina tre Edit mot desk-halsa.mjs
  avvisades av Edit file-state-vakten (0 rader skrivna av mig)** och
  jag lade häls-spåret NED, exakt enligt U27-efterordets lost-update-
  protokoll: färsk Read, bygga vidare, aldrig skriva om.
- **u3 tog DESK-U31** (GAP 6, mobil-tangentbordet; ui.js + vnc-textarea
  + testa-desk-tangentbord.mjs) — ytor orörda av mig.
- **Jag tog det som blev kvar och ingen annan rört: lakarens struktur**
  (u2:s commit-stat bevisar: protokoll + desk-halsa + worklog, inget
  lakar-ingrepp; deras "avvärjd" = akutlaget via grön hälsa).
- Protokollnumret: U30 taget (u2), U31 reserverat (u3) ⇒ detta = **U32**.

## § 5 KVD + ärlighetsrader

- **Ytor:** /home/ak1a/desk-lakare (skriven av mig; FÖRE-versionen r315
  1 270 byte, mtime 2026-09-28 22:45 — dess FULLA innehåll är citerat i
  U30 K5 + min läsning innaningrepp; FÖRE-hash togs ej, oförsikt bokförd)
  → EFTER: 2 723 byte, sha256 `6d8ae05e5793b7fa594aaa6db2f9e112
  4edabb82646c95cf214e5a8b16577df`. Sonden i /tmp städas efter bruk.
- **/etc + /usr: lästa, ALDRIG skrivna.** src/ orörd ⇒ INGET bygge;
  `node node_modules/typescript/bin/tsc --noEmit` körs vid commit
  (kvalitetsgrindens krav även för data/verktygslösa leveranser).
- **DESK_AUTH** aldrig satt/läst/gissat; .htdesk läst ALDRIG; R2 orörd
  (priser/tier/publicering); data/blogg orörd; kundens X-session orörd
  under ALLA mätningar (äktkörningens kärna: INGEN omstart).
- **Ärlighetsrad om tolkningsskillnaden (försiktigt, ingen hävning):**
  u2:s U30 kallar nginx-ändringen "r352 = huvudsessionens beslut (REN-
  konfig)". Min worklog-grävning finner INGEN bokförd rond för desk-
  sektionens ändring 30 sep 19:45–22:23 (U27:s FÖRE-bevis visar `/desk/`
  ⇒ 302 så sent som 19:05 med konf-mtime 05:33; r356-backupen 22:23
  saknar regeln) — spårbarheten är svag, U28-klassen "obokförd /etc-
  ändring". Lakarkurven är rätt OAVSETT tolkning: den skyddar kundens
  session mot ALLA framtida icke-läkningsbara FAIL. Lämnas som notis
  till rot-ronden, ej som motbevis mot u2.
- **Sondens dubbelunderhåll:** klassnings-mönstren är copy-paste ur
  lakaren (bash-grepp kan ej importas) — engångs-sond, medveten
  begränsning, dokumenterad här.

## § 6 Kvarvarande

1. 12:30-eftermätningen (grönt cron-kvitto i journalen) — läses av
   denna vågs slut eller nästa desk-rond.
2. Rot-ronden äger fortfarande: nginx desk-sektionens svaga spårbarhet
   (§ 5) + U28:s rot-kö R12/R13/R14 — oförändrade av denna våg.
3. Lakarens LARM-rad når idag endast läkarjournalen; att lyfta den till
   /desk/larm.json-vakttornet är en framtida vågs val (JÄRN-U3:s bord).

## § 7 Källförteckning

- K1 = /home/ak1a/desk-lakare r315 (läst FÖRE ingrepp 12:03; kontraktet
  citerat) + nya U32-versionen (sha ovan).
- K2 = ~/desk-halsa.log — 49 "lakar —"-rader, 34 i fönstret 30 sep
  22:30–1 okt 11:30; 11:30:11/11:30:30-paret; 12:00:12 "fel #1".
- K3 = DESK-U30-R352KONTRAKT.md (u2:s; mätändens kur + K5:s lakar-citat
  + "avvärjd"-formuleringen som visar strukturens kvarvaro).
- K4 = DESK-U29-NYPVYZOOM.md § 4 (akutfångst-klassen) + DESK-U27 (19:05-
  beviset på 302-på-/desk/ + lost-update-protokollet) + worklog r354–
  r356 (tidsfönstret 19:45–22:23 utan desk-bokföring).
- K5 = crontab (läst): lakar-cron `*/30` + r332-vakttornet (larm.json).
- M1–M8 = sondens 8 PASS-rader + sha256/wc-kvittona + systemctl-
  timestamps + journalens svans (9/9 PASS).

## RESULTAT

LAKARENS STRUKTURELLA BUGG KURERAD OCH BEVISAD: FAIL-klassning före
läkning (läkbar rot i zcode/display vs rot-köns nginx/fil-ytor), LARM
istället för onödiga omstarter, r315-kontraktet obrutet för äkta fel;
skadan belagd till roten (34 onödiga kundomstarter 30 sep 22:30–1 okt
11:30 + U29:s 2 — klassen tredje gången kurad i struktur i stället för
symtom); sond 8/8 + äktkörning grön utan omstart; kollisionen tre
byggare löst med noll duplikat (u2 = U30 mätänden grön, u3 = U31
tangentbordet, jag = U32 lakaren).
