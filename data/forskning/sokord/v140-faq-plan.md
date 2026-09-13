# VÅG 140 — MAX-PARALLELL BEVISVÅG: FAQ-genomgång + FAQ-översättning (dispatch-underlag)

Kundens direktiv 2026-09-14 punkt 2: "dispatcher nästa mega-uppdrag med 12
parallella subagenter (exklusiva filägarskap, strikt regel AGENTS.md §
MAXIMAL PARALLELLISM), mät och rapportera commits/timme + tid per leverans
i worklog". Detta dokument är dispatch-underlaget — PIPELINE-KO.md:s våg
140-sektion speglar det när vågen startar.

## BAKGRUND (fynd ur våg 138)

- S5 (bloggkorpusen): våg 137:s FAQ-tillägg slog UT en/ar-indexeringen för
  de 10 FAQ-posterna — FAQ-blocken saknar översättningar ⇒ speglarna under
  INDEX_TRASKEL 80 % ⇒ noindex + canonical mot svenskan. ~74–79 enheter
  saknas. Småstegets högst-ROI-åtgärd: översätt FAQ-enheterna.
- 42 ytterligare poster saknar FAQ och är FAQ-mogna (45 minus 3
  auto-genererade med granskat:false — branschmedianer-akm2,
  forskningslaget-grona-av-100, vagkartan-traffprocent — som är FAQ-NEJ).
- Parserkontrakt (src/lib/blogg-faq.ts): sektionen "## FAQ" SIST i body,
  par som "**Fråga?**" + svar-block, separerade med blankrader.
- Översättningskontrakt (src/lib/blogg-speglar.ts + verktyg/
  importera-oversattning.mjs): enhetsnycklar {slug}:titel|ingress|p{n},
  blocknumrering 1-baserad på /\n\n+/-delning (tomma block bort) av den
  UPPDATERADE bodyn — FAQ-rubriken och frågeblocken ÄR egna block.

## SPÅR A — FAQ-innehåll på 42 poster (9 agenter, exklusiva postfiler)

Varje agent: skriver "## FAQ" (3–4 par) sist i VARJE tilldelad posts
body i data/blogg/<slug>.json (ENDAST dessa filer) + levererar
data/oversattning-import/v140-a<N>-faq.json med FAQ-enheternas en/ar
(så sjunker ALDRIG spegeln under tröskeln — våg 137:s regression upprepas
inte). Juridikgrind: utbildningsformuleringar, aldrig råd. Svar ≥ 20
tecken (FAQPage-kontraktet). Kommittera utan push.

| Agent | Poster (slugar) | Antal |
|---|---|---|
| A1 | analys-h-och-m-hennes-och-mauritz-2026, analys-industrivarden-2026, analys-investor-2026, analys-np3-fastigheter-2026, analys-truecaller-2026 | 5 |
| A2 | arr-tillvaxt-vad-atkommande-intakter-sager, hur-vi-analyserade-volvo-cars, intaktsdiversifiering-risken-som-inte-syns-i-pe, roic-den-glomda-nyckeltalen-v11, sa-laser-du-din-portfoljrapport | 5 |
| A3 | sa-laser-du-en-balansrakning-pa-15-minuter, sa-laser-du-en-svensk-arsredovisning, sa-raknar-du-ev-ebitda, skuldsattningsgrad-vilken-niva-ar-farlig, skuldsattningsgraden-som-vag | 5 |
| A4 | v01-forsaljningstillvaxt-analys, v02-arr-tillvaxt-analys, v03-intaktsdiversifiering-analys, v04-ps-analys, v05-pb-analys | 5 |
| A5 | v06-ev-ebitda-analys, v07-bruttomarginal-analys, v08-ebitda-marginal-analys, v09-roe-analys, v09-roe-avkastning-eget-kapital | 5 |
| A6 | v10-skuldsattningsgrad-analys, v11-likviditet-analys, v12-intaktsstabilitet-analys, v13-patent-ip-analys, v14-varumarke-analys | 5 |
| A7 | v15-natverkseffekter-analys, v16-produktlanseringar-analys, v17-avtal-partnerskap-analys, v18-regulatoriska-analys | 4 |
| A8 | v19-kapitalforbranning-analys, v20-aterekop-egna-aktier-analys, vad-ar-ev-ebitda, vad-ar-institutionell-aktieanalys | 4 |
| A9 | vad-ar-roe, vad-ar-skuldsattningsgrad, vagfundament-indikatorer-ar-tidsserier, veckans-marknad-2026-w34 | 4 |

## SPÅR B — FAQ-översättning för de 10 befintliga FAQ-posterna (3 agenter)

Varje agent: levererar data/oversattning-import/v140-b<N>-gamlafaq.json
med SAKNADE en/ar för FAQ-enheterna (de sista blocken i postens body) för
sina poster. Rör INTE blogg-JSON:erna — endast importfilen. Format:
{ "kurs": "v140-b<N>-gamlafaq", "poster": [{ "nyckel": "<slug>:p<N>", "en": …, "ar": … }] }.

| Agent | Poster (slugar, har redan FAQ) | Antal |
|---|---|---|
| B1 | 5-vanliga-nyborjarmisstag-svenska-aktier, divergens-fundament-ot-pris, hur-gor-man-en-snabb-fundamental-aktieanalys, hur-raknar-man-roe | 4 |
| B2 | komplett-guide-svensk-aktieanalys-2026, kvickrakningsformeln-sa-mater-du-likviditet, mr-market-psykologi-svenska-borsen | 3 |
| B3 | pb-tal-nar-jamfor-man-bokvarde-ratt, peg-multipeln-svagheter-2026, ps-tal-nar-ar-det-anvandbart | 3 |

## MÄTNING (huvudagenten)

- Notera dispatch-tid (klockslag) vid start.
- Efter vågen: git log-tidsstämplar för v140-commits → tid per leverans
  (min) + commits/timme → worklog.
- KVD: blogg-faq.ts parsar 3–4 par per ny post; nyckelnummers-paritet
  (blockräkning) kontrolleras innan import; import via verktyg/
  importera-oversattning.mjs; speglar ≥ 80 % verifieras i prod.

## STRUKTUR med bevarade ord

42 poster får FAQ = 52 totalt med FAQ (42 + 10 befintliga). V09-dubletten
och kannibaliseringen (S5-fynd 2) hanteras i SEO-A-O:n senare — INTE i
denna våg (små steg).
