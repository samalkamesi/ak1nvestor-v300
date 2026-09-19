# FINSLIPNING — våg 193 (2026-09-19 03:05–03:20): brutna-länk-svep + textfelklasser

**Metod:** maskinellt svep (verktyg/_r193-svep.mjs) mot LIVE localhost:3000.
10 stamvägar hämtade; 159 unika interna länkmål testade; 4 textfelklasser
svepna per stamväg. Bygg vid svepet: 9BTNDxkKoXDkFxafV13dv (02:39-förbygget).
Granskning därefter mot live-HTML och källkod (verktyg/_r193-sok.mjs,
_r193-verif.mjs) — varje träff klassificerad nedan med bevis.

## Resultat i en rad

**159 interna länkmål: 0 brutna, 0 omdirigeringar — samtliga gröna.**
Noll äkta textfel: samtliga 18 klasssträffar var artefakter av svepets egen
textextraktion (se metodnot).

## Brutna länkar (0)

INGA — alla interna länkmål svarar grönt. Stamvägarnas (~340 länkar,
159 unika mål inkl. kurser, bloggposter, datasetdetaljer, juridiksidor)
nät är helt.

## Länkar som styrs om (0)

INGA — alla länkar träffar rakt (våg 194:s redirects /pris + /kontakt
träffas inte av någon stamvägslänk; de finns för direktbesök och externa
bokmärken).

## Textfelsträffar (18) — samtliga vitlistade efter granskning

**Metodnot (viktig för framtida svep):** sweepens textextraktion ersatte
varje HTML-tagg med ett mellanslag. Inline-element direkt före skiljetecken
(`…</strong>,`, `…</span>,`, `…</a>.`) gav därmed falska "mellanslag-före-
skiljetecken". Bevis ur live-HTML:n:

- /medlemskap: `stora visioner</strong>, och` → artefakt (källan ren)
- /medlemskap: `kostnadsfritt för alltid. Fas 2:` → ren i HTML:n
- /kalkylator: `raknaAKM2</span>, men` → artefakt
- /logga-in: `integritetspolicyn</a>.</span>` → artefakt
- /om-oss: `certifikat</a>. Medlemskapet` → artefakt
- /manifest, /blogg: samma klass (elementgräns före skiljetecken)
- Trippel-mellanslag-träffarna (9 st): alla i titelspåret
  `…| Ak1 Apex Nexus</title><meta…` — flera taggar i följd = flera
  mellanslag i extraktionen. Artefakt.

**Källkodsvalidering:** sökning efter alla mönstren i src/** gav noll
träffar (endast denna rapport själv). Kur för framtida svep: läs
textContent via webblasare-DOM i stället för regex-strip på HTML.

## Övriga konstateranden

1. **Fas 2-vägen heter `/fas2-ansok`** (sv/en/ar) + `/fas3` — inte /fas2
   (svepets liste-gissning; ingen länk pekar på /fas2, ingen skada).
2. **Titelmallen är konsekvent** `… | Ak1 Apex Nexus` på sv/ar/en
   (företagsnamnet bakom plattformen); og:site_name = "AK1A Research Lab".
   Brandnot: svenska startsidans title är 79 tecken — sökresultatklippet
   (≈60 tecken) hamnar strax före "Ak1 Apex Nexus"; omändring är
   SEO-avvägning för brandspåret, ej fel.
3. Blogg-pelarna ("Pedagogisk finansanalys .") — artefakt av samma klass;
   våg 195:s nya ingress renderar pelarlistan i ren JSX-text utan
   mellanliggande element.

## Uppföljning

- [x] Granska träffarna — klart: 0 äkta fel, 18 vitlistade med bevis.
- [ ] Gränssnittsvakten körs efter våg 195-deploy (egna gränssnittsändringar
      — AGENTS.md-mellanalarmregeln); bevakare _r73-bevaka löper.

*Källor: verktyg/_r193-svep.mjs (svep), _r193-sok.mjs (källkodssök),
_r193-verif.mjs (live-HTML-verifiering). Skrapverktygen städas efter rondens
landning.*
