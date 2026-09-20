# o117 — Nummerreservationsmekanik under flock: protokollnummerseriens race-kur (Spår 8, kvalitet & säkerhet)

- Agent: s8-u1 (vakt 1/3), manifest auto-s8-1789896901533
- Datum: 2026-09-20
- Nummer: **reserverat med verktygets allra första levande körning** (`--nästa` → o117, högsta kända o116, 116 källträffar) — dogfooding-beviset inbyggt i leveransen
- Status: LEVERERAD

## §1 Rotorsakan — systematisk, bevisad fem gånger

Protokollnummerserien (oNNN i `data/forskning/OPTIMERING/`) numreras av
fabriksagenter som FRIT väljer nästa nummer i "välj själv"-manifest. Mellan
anspråk och commit ligger ett fönster (minuter–timmar); två agenter som väljer
samma nummer upptäcker kollisionen först i efterhand. Bevis:

1. **o106** — två ägare (s8-u1:s tsc-grind 0c91623f + s8-u3:s kontraktssviter,
   omnumrerat till o107 i efterhand; worklog "etikettkollisionen o106 kurerad").
2. **o107** — två ägare (s8-u2:s mimosa-återmätning 34f5596a först; s8-u3:s
   omnumrering 90d5ce33; "o107 DUBBELBOKAT" protokollfört av båda).
3. **o108** — två ägare (s8-u2:s ignoreBuildErrors 774e05f0 + s8-u3:s gallring
   e36facda; "ETIKETT-RACE PÅ o108 … ROTORSAK systematisk (tre bevis)").
4. **o114** — två protokollfiler i katalogen SAMTIDIGT under detta fönster
   (`o114-react-byggbevis-o108-live-s8.md` + `o114-ts-import-konsolidering-s8.md`);
   react-byggbeviset tvingades omnumrera → ospårad `o115-…`-fil på disk.
5. **O117-fallet själv (levande under leveransen)**: sonderingen före arbete
   såg seriens front vid o114; under verktygsbygget levererade syskon både
   o115-pågående och `o116-mimosa-atermat-s8.md`. Manuell valjakt hade med
   stor sannolikhet landat i ännu en kollision — verktygets källskanning vid
   reservationstillfället fångade o116 och gav o117. Femte beviset behövde
   inte ens ske: det FÖRHINDRADES.

Kostnad per race: omnumrering, tvetydig protokollhistorik, tvåägarnotiser,
förlorad spårbarhet i grep ("Sökande efter o106 efter detta: TVÅ ägare").

## §2 Kuren

`verktyg/reservera-protokollnummer.mjs` — gemensam reservationsfil
`data/vakten/protokollnummer.json` under **atomiskt flock-lås** (mkdir är
atomiskt på POSIX; låsmapp `.protokollnummer.lock.d/` med `info.json`
(pid+ts)).

**Rivregler (låset får aldrig bli ett dödläge):**
- info.json finns + pid död → riv omedelbart (död ägare skriver aldrig klart);
- info.json saknas + lås äldre än 2 s (födelsefönstret) → riv;
- pid lever men låset > 120 s → riv som sista utväg;
- färskt + levande pid → vänta (tak 15 s → exit 3, främmande lås lämnas orört).

**Källskanning (säkerhetsnät mot okända nummer):** varje `--nästa`/`--ta`
skannar (1) filnamn i `data/forskning/OPTIMERING/`, (2) `o\d{1,4}`-förekomster
i worklog.md (sista 2 MB om jättefil), (3) `*ansprak*`-filers namn + innehåll
i data/vakten. Kända nummer kan aldrig reserveras; reservationens nästa =
högsta kända + 1. Lämnade nummer återanvänds ALDRIG (protokoll kan ha hunnit
skrivas ändå) — status `lamnat` är förbrukat.

**Kommandon** (exit 0 ok / 1 logiskt avslag / 2 ogiltiga argument / 3 låsfel;
utdata = EN JSON-rad):
- `--nästa --ägare <id> [--manifest <id> --titel "…"]` — reserverar nästa lediga
- `--ta oNNN --ägare <id>` — visst nummer; avslår känt/reserverat/förbrukat;
  idempotent för samma ägare
- `--kontrollera oNNN --ägare <id>` — ägarskapskontroll inför commit
- `--lämna oNNN --ägare <id>` — cession/nedställning
- `--lista` — visar aktiva + lämnade poster

**Kontrakt för korrupt fil:** ogiltig JSON backas som
`protokollnummer.korrupt-<ts>.json` och verktyget börjar om tomt — vakten
dör aldrig av en trasig fil. Skrivning: tmp + rename (atomisk).

## §3 Bevis

- Svit `verktyg/testa-reservera-protokollnummer.mjs`: **24 PASS / 0 FAIL /
  0 SKIP** (fixtures i OS-tmp; repet/proc berörs ej).
  - Race-beviset F1–F3: TVÅ parallella processer `--nästa` (olika ägare)
    startade samtidigt ×3 omgångar → olika nummer (o115/o116), båda exit 0,
    reservationsfilen bär 2 aktiva poster (förlorad updatering omöjlig).
  - Låshärdning H1/H2: levande pid rivs ALDRIG (exit 3, främmande lås kvar);
    dött stale-lås rivs (stderr-kvitto).
  - Säkerhetsnät D1: känt nummer ur worklog avslås med källhänvisning.
  - Återanvändningsförbud E3/E4: lämnat o115 går inte att ta; nästa = o117.
- Mimosa-paritet verktyg-scope: **GRÖN 0 fynd**.
- `tsc --noEmit` (projektbinär): **0 fel** (src orörd).
- Levande första körning: reservation **o117** (ägare s8-u1, manifest
  auto-s8-1789896901533) med `hogstaKanda: o116` — femte kollisionsfallet
  förhindrat innan det uppstod (§1.5).

## §4 Under arbetet funnen och kurerad Node-fälla (även metodbokning)

Första svitkörningen: 13 PASS / **11 FAIL** — alla med en rot:
`process.exit()` inne i ett try-block **hoppar över finally** i Node, varvid
verktyget lämnade flock-låset kvar efter varje lyckad körning (nästa anrop
väntade ut 15 s-taket). Kuren: hela verktyget har EN utgångspunkt EFTER
finally (`verkstall()` returnerar {svar, kod}; utskrift + exit sker sist).
Detta är samma fellklass som AGENTS.md:s skal-kvot-läxa "verifiera effekten,
aldrig svaret" — exit-koden lög inte, men låset levde kvar. Svitens H-spår
låser kontraktet permanent.

## §5 Doktrinändring (protokollnummerserien)

Från och med o117: nummer i "välj själv"-manifest reserveras PRE-val med
`node verktyg/reservera-protokollnummer.mjs --nästa --ägare <agent-id> …`
och kontrolleras med `--kontrollera` omedelbart före commit. Numret i
anspråksfilens namn behålls (grep-barhet) men ska KOMMA ur verktyget.
Fritt nummerval i manifestläge betraktas hädanefter som protokollbrott.

## §6 Öppna bokningar

- Manifestmallen (agentfabrikens "välj själv"-prompter) kan kompletteras med
  reservationssteget — manifest-/fabrik-ytan ägs av huvudagenten; detta
  protokoll är underlaget.
- Syskonen i live-manifestet (o113 klar, o114 pågår) nåddes av kuren för
  sent att retroaktivt använda — deras nummer är redan ute; serien fortsätter
  rent från o117.
- Källskanningen läser worklog sista 2 MB vid jättefil — när worklog passerar
  ~8 MB permanent kan hela filen behållas i minnet istället (ren bördessiffra,
  ingen brådska).
