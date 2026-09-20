# ANSPRÅK s7-u3 o111 (manifest auto-s7-1789893903450, byggare 3/3) — 2026-09-20 ~10:4x lokal (epoch 1789894124924)

## OBJEKT: public/-städ — skulptur-råmaterial (o101 §6 köpost 2; uttryckligen lämnat öppet i s7-u2:s o110-anspråk "LÄMNAT (öppet för syskon)")

Källa: o101:s spårkontroll bokförde public/-hyllan som FYND:
- **skulptur-3.jpg 1 218 KiB OANVÄND** (1,2 MB död vikt i repo + deploy)
- **logo-transparent.png = JPEG-innehåll med .png-ändelse** (innehålls-/metadatalögner)

o105 §6-kön + o110-anspråkets lämna-lista bekräftar: ledigt objekt.

## VARFÖR

- Spårets prestandafamilj "bildoptimering/byte-vikt" (o101 stängde
  next/image-spåret; public/-hyllan är dess statiska syster).
- Icke blockerat NOW (o105:EFTER + NastaSteg = deploy/EFTER-gated).
- Noll ytöverlappning med syskon: u2 o110 = footer/bindning-familjen;
  u1 ej låst än (koll innan commit).

## YTA (exklusiv)

- `public/**` (statiska tillgångar — data-klassens bash-rättigheter, ALDRIG src-reglerna)
- `src/**` ENDAST om referensfix krävs (Write/Edit + tsc 0)
- `data/forskning/OPTIMERING/o111-*` + worklog = bevis

## METOD + SÄKERHETSKRAV

1. Full inventarie av public/ (storlek, deklarerad vs faktisk mimetype via
   file/magic-bytes — ALDRIG enbart ändelse).
2. Användningskoll PER tillgång: grep i src/ + nästa.config/manifest +
   data/ (blogg/kurser kan referera) + OG/sitemap/robots. OANVÄND med
   NOLL träffar i samtliga = raderbar; ENDA träffen räcker för kvar.
3. Radering: git rm på bevisat oanvända (arkivhistorik bärvitar innehållet).
4. Felmärkt fil: kureras ENDAST om samtliga referenser kan uppdateras
   säkert i samma commit (annars bokförs som fynd åt ägaren).
5. KVD: tsc 0 om src rörs · INGET bygge · R2 orörd · data/blogg/ orörd ·
   gränssnittsvaktens nästa cron-löp = verifiering (0 fynd-krav kvar).
