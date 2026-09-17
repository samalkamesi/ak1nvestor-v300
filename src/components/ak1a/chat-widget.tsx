"use client";

import { useState, useEffect, useRef, useCallback, type TouchEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { lasMedlem, niva, lasXP, lasKlaraKurser, lasStjarnor, addXP, lasStreak } from "@/lib/member-local";
import { b2bAktiv } from "@/lib/b2b-status";
import { geBadge } from "@/lib/badges";
import { SIFFROR } from "@/lib/siffror";
import {
  forfallnaKort,
  bedomKort,
  forjanaXP,
  srStatistik,
  ALLA_KORT,
  type SRKort,
} from "@/lib/spaced-repetition";
import {
  sparaChatTur,
  rensaChatMinne,
  senasteHistorik,
  raknaElevFragor,
  HISTORIK_FONSTER,
} from "@/lib/chat-minne";
// AI-MENTORN 2.0 (våg 106 H2): regel+datamotor — svarar lokalt före nätanrop
import { KURSREGISTER } from "@/lib/ai-mentor-register";
import { svaraLokalt, fallbackSvar } from "@/lib/ai-mentor-svar";
// Spår 6 (s6-u3): +3 förhandsfrågor (kassaflöde, utdelning, kvartalsrapport) —
// extra-mönstren prövas FÖRE basen, samma matchning och källmärkning
import { svaraLokaltExtra } from "@/lib/ai-mentor-extra-fragor";
// Spår 6 omgång 2 (s6-u1): +2 makroförhandsfrågor (ränta, inflation) —
// makro-mönstren prövas först; kärnorden disjunkta mot båda underliggande lager
import { svaraLokaltMakro } from "@/lib/ai-mentor-makro-fragor";
// Spår 6 omgång 3 (s6-u3 nästa): +3 förhandsfrågor (värdering/DCF,
// investmentbolag/NAV, options) — prövas SIST och kan därför aldrig stjäla
// en fråga från tidigare lager; källmärkta ur kursregistret
import { svaraLokaltNasta } from "@/lib/ai-mentor-nasta-fragor";
// Spår 6 omgång 4 (s6-u2): +2 förhandsfrågor (emission/utspädning,
// goodwill/immateriella) — kapitalmekanik-lagret prövas SIST och kan
// därför aldrig stjäla en fråga från tidigare lager; källmärkt ur
// kursregistret med flerkällsrad (rk-02/v19/ks-01, km-022/bk-01/bokmaster)
import { svaraLokaltKapitalmekanik } from "@/lib/ai-mentor-kapitalmekanik-fragor";
// Spår 6 omgång 3 (s6-u1 sektor): +3 förhandsfrågor (sektorsanalys, bank,
// fastighet) — sektor-lagret prövas SIST och kan därför aldrig stjäla en
// fråga från tidigare lager. KURATION s6-u1 omgång 5: lagret levererades
// i c363ec8b men kopplades ALDRIG in här (commiten trodde widgeten "redan
// i HEAD" — den var den inte; frågorna var död kod) — wiring enligt
// lagrets egen dokumentation (kapitalmekanik före sektor).
import { svaraLokaltSektor } from "@/lib/ai-mentor-sektor-fragor";
// Spår 6 omgång 5 (s6-u1): +1 förhandsfråga (praktiska case/verkliga bolag
// — pc-familjen, kategorins 21 kurser) — case-lagret ligger SIST i kedjan
import { svaraLokaltCase } from "@/lib/ai-mentor-case-fragor";
// Spår 6 omgång 6 (s6-u3): +3 förhandsfrågor (index/passivt ägande,
// blankning/short, marginalanalys) — praktik-lagret ligger SIST och kan
// därför aldrig stjäla en fråga från tidigare lager; källmärkt med
// flerkällsrad (bogleheads/common-sense/pf-03/am-02, pf-10/staley/lewis,
// v07/v08/ln-01). Ansvarsfördelning: marginalens V-ord ägs av basens
// V-uppslag (s6-u2:s emission-precedens) — praktik äger familjeorden.
import { svaraLokaltPraktik } from "@/lib/ai-mentor-praktik-fragor";
// Spår 6 omgång 7 (s6-u2): +2 förhandsfrågor (diversifiering/korrelation,
// valutarisk) — portfoljgrund-lagret ligger SIST och kan därför aldrig
// stjäla en fråga från tidigare lager; källmärkt med flerkällsrad
// (pf-03/km-014/pf-11, rk-07/km-058/sj-01). Ansvarsfördelning: basens
// V20-titelord "aktier" och portfölj-monstrets "sprida/riskspridning"
// äger sina formuleringar — detta lager äger korrelations- och
// valuta-familjeorden (duplikatskydd mot praktik-lagrets index-ämne
// dokumenterat i modulens huvud).
import { svaraLokaltPortfoljgrund } from "@/lib/ai-mentor-portfoljgrund-fragor";
// Spår 6 omgång 8 (s6-u2): +2 förhandsfrågor (bolagsstämma/rösträtt,
// styrelse/bolagsstyrning) — ägande-lagret ligger SIST och kan därför
// aldrig stjäla en fråga från tidigare lager; källmärkt med flerkällsrad
// (sj-03/km-002/km-067, km-002/km-026/sj-03). Ansvarsfördelning: basens
// utdelnings-monster äger "utdelning", nästa-lagret "investmentbolag",
// sektorns fastighets-monster "stamaktionär/stamaktieägare" — detta lager
// äger stämm-, rösträtts- och styrelsefamiljeorden (kollisionskontroll
// mot 513 tidigare kärnord dokumenterad i modulens huvud).
import { svaraLokaltAgande } from "@/lib/ai-mentor-agande-fragor";
// Spår 6 omgång 8 (s6-u1): +2 förhandsfrågor (avskrivningar/EBITDA,
// leasing/IFRS 16) — redovisningsdjup-lagret ligger SIST och kan därför
// aldrig stjäla en fråga från tidigare lager; källmärkt med flerkällsrad
// (km-021/km-022/higgins, km-023/bk-01/km-004). Ansvarsfördelning:
// basens rapport-monster äger rapportformens namn (resultaträkning/
// balansräkning), extra-lagret kassaflödet — detta lager äger posterna:
// avskrivnings- och leasing-familjeorden (kärnordsdisjunktion mot 511
// ord LIVE-testat, inkl syskonets agande-familj: 0 krockar).
import { svaraLokaltRedovisningsdjup } from "@/lib/ai-mentor-redovisningsdjup-fragor";
// Spår 6 omgång 8 (s6-u3): +3 förhandsfrågor (värderingsmultiplar/multipel-val,
// FOMO/förlustaversion, mästarna Buffett/Lynch/Fisher) — djup-lagret ligger
// SIST och kan därför aldrig stjäla en fråga från tidigare lager; källmärkt
// med flerkällsrad (vm-03/km-011/km-010/vm-04, km-018/bf-12/km-035/tanka-
// snabbt, buffett-way/lynch/fisher/greenwald). Ansvarsfördelning: basen äger
// värderings-, beteende- och bok-GRUNDORDEN (värdering/dcf/pe-tal,
// psykologi/bias, böcker/graham) — detta lager äger familjeorden basen saknar
// (multipel/jämförelsebolag, fomo/prospektteori/kahneman, buffett/lynch/
// fisher; kärnordsdisjunktion mot 559 ord LIVE-testat, inkl syskonens
// agande- och redovisningsdjup-familjer: 0 krockar). Omstartsbokföring:
// föregångarens avskrivnings-fråga är utbytt — syskonet s6-u1:s
// redovisningsdjup-lager (FÖRE detta i kedjan) äger den familjen.
import { svaraLokaltDjup } from "@/lib/ai-mentor-djup-fragor";
// Spår 6 omgång 9 (s6-u3): +3 förhandsfrågor (tulpanmanin, börsbubblans
// anatomi, aktiekraschen 1929) — historia-lagret ligger SIST och kan därför
// aldrig stjäla en fråga från tidigare lager; källmärkt med flerkällsrad
// (mackay/kindleberger/galbraith/km-057/rk-15 — samtliga KOMPLETT-kurser ur
// bokmästar-kategorin). Ansvarsfördelning: basen äger börs-GRUNDORDEN
// ("vad är börsens historia?" förblir basens aktiemarknads-monster) och
// beteende-orden (panik/psykologi), djup-lagret äger fomo-familjen — detta
// lager äger händelse-, bok- och bubbelorden (tulpan/bubbla/krasch/1929/
// mackay/kindleberger/galbraith; kärnordsdisjunktion mot 598 ord
// LIVE-testat, inkl syskonets djup-familj: 0 krockar).
import { svaraLokaltHistoria } from "@/lib/ai-mentor-historia-fragor";
// Spår 6 omgång 10 (s6-u2): +2 förhandsfrågor (DuPont-analysen, ROIC) —
// lönsamhetsdjup-lagret ligger SIST och kan därför aldrig stjäla en fråga
// från tidigare lager; källmärkt med flerkällsrad (ln-/v-/roic-kurserna).
// Basen äger VARIABELUPPSLAGET, praktik-lagret marginal-familjen — detta
// lager äger dupont-/roic-/nopat-/wacc-orden (LÖNSAMHET-kategorin hade
// inget eget lager).
import { svaraLokaltLonsamhetsdjup } from "@/lib/ai-mentor-lonsamhetsdjup-fragor";
// Spår 6 omgång 10 (s6-u1): +4 förhandsfrågor ur AK1TS-familjen — ts-djup-
// lagret (fibonacci-retracements/extensions/kluster/tidszoner, gann-vinklar/
// cyklar, volymdjup: profil/VPOC + order flow + market profile) ligger SIST
// och kan därför aldrig stjäla en fråga från tidigare lager; källmärkt med
// flerkällsrad (ts-familjens 25 kurser, 15 källmärkta). Basens teknisk-
// monster äger indikator-familjen, impulsvag-monstret elliott-familjen —
// detta lager äger fibonacci-/gann-/volymdjup-orden.
import { svaraLokaltTsdjup } from "@/lib/ai-mentor-tsdjup-fragor";
// Spår 6 omgång 10 (s6-u3): +3 förhandsfrågor ur svensk skattemekanik —
// skattedjup-lagret (kapitalförsäkring/schablonmekanik/äganderätten,
// bolagsskatt 20,6 %/dubbelbeskattningens kedja, optionsbeskattning/
// personal- vs marknadsoptioner) ligger SIST och kan därför aldrig stjäla
// en fråga från tidigare lager; källmärkt med flerkällsrad (sj-05 + km-052
// + km-051 + km-050 / km-049 + km-050 + km-051 + km-053 / sj-04 + km-051
// + km-050 + km-049 — skattekategoriernas tio kurser). Ansvarsfördelning:
// BASens skatt-monster äger SKATT-GRUNDORDEN (skatt/beskattning/
// kapitalvinstskatt/källskatt/schablonskatt/utdelningsskatt/3:12 — "hur
// fungerar ISK och skatt?" förblir basens), basen äger utdelnings-orden,
// nästa-lagret options-GRUNDORDEN — detta lager äger endast familjeorden
// basen saknar (kapitalförsäkring/bolagsskatt/optionsbeskattning/
// personaloptioner/dubbelbeskattning; sond mot hela kedjan: 626+ kärnord,
// 0 fångster i båda riktningarna). Juridikgrind: ren mekanikutbildning
// med Skatteverket-hänvisning — aldrig kontoval eller skatteråd.
import { svaraLokaltSkattedjup } from "@/lib/ai-mentor-skattedjup-fragor";
// Spår 6 omgång 11 (s6-u3): +3 förhandsfrågor ur beteendefinans —
// beteendedjup-lagret (bekräftelsefällan/bekräftelsebias, ankareffekten/
// förankring, mental accounting/mentala konton/thaler) ligger SIST och kan
// därför aldrig stjäla en fråga från tidigare lager; källmärkt med
// flerkällsrad (km-019 + bf-11 + km-035 + bf-04 / bf-05 + km-020 + bf-06 +
// bf-12 / bf-03 + bf-02 + km-037 + pf-06 — BETEENDEFINANS-kategorins 18
// kurser). Ansvarsfördelning: BASens beteende-monster äger PSYKOLOGI-
// GRUNDORDEN (psykologi/beteende/bias/kognitiv bias/sunk cost/halo —
// "vad är kognitiv bias?" förblir basens), djup-lagret fomo-familjen
// (fomo/prospektteori/förlustaversion/disposition) — detta lager äger
// endast familjeorden de saknar (bekräftelsefälla/ankareffekt/mental
// accounting; sond mot hela kedjan: 718 kärnord, 0 fångster i båda
// riktningarna). Juridikgrind: generell beslutspsykologi-mekanik, ingen
// diagnos, inga handelsrekommendationer.
import { svaraLokaltBeteendedjup } from "@/lib/ai-mentor-beteendedjup-fragor";
// Spår 6 omgång 11 (s6-u1): +2 förhandsfrågor ur riskdjupet — riskdjup-
// lagret (skuldfällan/löptider/bindningstid/covenants/räntetäckningsgrad/
// refinansiering + svarta svanar/taleb-kriterierna/svansrisk) ligger SIST
// och kan därför aldrig stjäla en fråga från tidigare lager; källmärkt med
// flerkällsrad (rk-03 + ks-03 + rk-04 + st-01 / rk-12 + the-black-swan +
// fooled-by-randomness + km-033 — RISKHANTERING-kategorins 15 kurser,
// registrets största familj utan eget lager). Ansvarsfördelning: BASens
// risk-monster äger RISK-GRUNDORDEN (risk/tail risk/regulatorisk risk),
// makro ränte-orden inkl. "räntetäckning" — detta lager äger endast
// familjeorden de saknar (skuldfälla/räntetäckningsgrad/covenants/löptid/
// svart svan/svansrisk; sond mot hela kedjan: 720 kärnord, 0 fångster i
// båda riktningarna; "taleb" medvetet strunet som kärnord — ett fel från
// "talen", tsdjup-precedensen). Juridikgrind: ren mekanikutbildning —
// inga prognoser, inga placeringstips.
import { svaraLokaltRiskdjup } from "@/lib/ai-mentor-riskdjup-fragor";
// Spår 6 omgång 12 (s6-u1): +1 förhandsfråga ur portföljteorins riskmått —
// riskmåttsdjup-lagret (sharpe-kvoten/riskjusterad avkastning, med beta/
// capm/standardavvikelse som familjeord) ligger SIST och kan därför aldrig
// stjäla en fråga från tidigare lager; källmärkt med flerkällsrad (km-016 +
// km-013 + km-015 + km-034 — kategorin RISKHANTERING & PORTFÖLJTEORIs nio
// kurser). Ansvarsfördelning: BASens risk-monster äger RISK-GRUNDORDEN
// (volatilitet/drawdown/kelly/value at risk — "vad är volatilitet?" förblir
// basens), riskdjup-lagret skuldstruktur- och svansrisk-familjerna — detta
// lager äger endast riskmåtten de saknar (sharpe/beta/capm/standardavvikelse/
// riskjusterad; sond mot hela kedjan: 754 kärnord, 0 fångster i båda
// riktningarna; "beta"↔basens "betala" och "capm"↔"call"/"case" ligger på
// avstånd 2 — toleransen är 1, ömsesidigt säkert, dokumenterat i modulen).
// Juridikgrind: ren mått-utbildning — inga placeringstips.
import { svaraLokaltRiskmattsdjup } from "@/lib/ai-mentor-riskmattsdjup-fragor";
// Spår 6 omgång 12 (s6-u2): +2 förhandsfrågor ur utdelningsstrategin —
// utdelningsdjup-lagret (utdelningsfällor/yield trap/utdelningsgrad +
// aktieåterköp/återköpsprogram) ligger näst sist (syskonet förväntningsdjup
// efter — samma omgångs fönster) och kan därför aldrig stjäla
// en fråga från tidigare lager; källmärkt med flerkällsrad (ud-04 +
// km-063 + ud-01 + ud-08 / km-066 + v20 + ks-02 + ud-02 — kategorin
// UTDELNINGSSTRATEGIs 12 kurser, registrets näst största familj utan
// eget lager). Ansvarsfördelning: BASens utdelnings-monster äger
// utdelnings-GRUNDORDEN (utdelning/direktavkastning/dividend/payout
// ratio/återinvestering), basens V20-uppslag äger det NAKNA ordet
// "återköp" (titelorden ur v20-kursen) — detta lager äger endast
// familjeorden de saknar (utdelningsfälla/yield trap/avkastningsfälla/
// utdelningsgrad/aktieåterköp/återköpsprogram; sond mot hela kedjan:
// 766 kärnord i 19 lager, 0 fångster i båda riktningarna; "drip"
// medvetet strunet som kärnord — kortordskuren, tsdjup-precedensen).
// Juridikgrind: ren mått- och mekanikutbildning — inga placeringstips.
import { svaraLokaltUtdelningsdjup } from "@/lib/ai-mentor-utdelningsdjup-fragor";
// Spår 6 omgång 12 (s6-u3): +3 förhandsfrågor ur förväntningsspelet —
// förväntningsdjup-lagret (förväntningsanalys/vad står redan i priset +
// förväntningsgap/förväntningsklyfta/earnings drift/expectations game +
// kalibrering) ligger SIST och kan därför aldrig stjäla en fråga från
// tidigare lager; källmärkt med flerkällsrad (kt-02 + expectations-
// investing + the-alchemy-of-finance + kt-01 / + contrarian-investment-
// strategies + irrational-exuberance / + against-the-gods + fooled-by-
// randomness — kategorin KATALYSATORs kurser + bokmasterns
// förväntningskanon). Ansvarsfördelning: BASens katalysator-monster äger
// KATALYSATOR-GRUNDORDEN (katalysator/katalysatorjakt/"prisad"), basens
// variabeluppslag äger V-kursernas titelord (produktlanseringar/avtal/
// regulatoriska V16–V18) — detta lager äger endast familjeorden de saknar
// (förväntningsanalys/gap/klyfta/kalibrering/earnings drift/expectations
// game/inprisat; sond mot hela kedjan: 754 kärnord i 18 lager vid valet,
// 0 fångster i båda riktningarna; "inprisad" medvetet strunet — basens
// "prisad" ligger 2 ifrån, "katalysatorjakt" ägs av basen; tsdjup-fällan
// "förväntningar"↔"förlängningar" d=2 dokumenterad i modulen och vakas
// av testfall J). Juridikgrind: ren metodutbildning — inga prognoser,
// inga placeringstips.
import { svaraLokaltForvantningsdjup } from "@/lib/ai-mentor-forvantningsdjup-fragor";
// Spår 6 omgång 13 (s6-u1): +1 förhandsfråga — rebalansering —
// portfoljbalans-lagret (rebalansering/ombalansering/återbalansering/
// kärna och satellit/riskparitet/taktisk allokering/portföljvikter/
// equal weight/rebalanseringspremie/bandbreddsmetoden) ligger SIST och
// kan därför aldrig stjäla en fråga från tidigare lager; källmärkt med
// flerkällsrad (pf-04-rebalansering primär + the-intelligent-asset-
// allocator + all-about-asset-allocation + the-bogleheads-guide-to-
// investing — kategorin PORTFÖLJHANTERINGs 14 kurser + bokmasterns
// allokeringsskolning). Ansvarsfördelning: BASens portfölj-monster äger
// portfölj-GRUNDORDEN (sondbevis: "hur rebalanserar man en portfölj?" +
// "vad är 60 40 portföljen?" fångas av basen) — detta lager äger endast
// SAMMANSÄTTNINGARNA (utdelningsdjup-precedensen); portfoljgrund äger
// diversifiering (endast KÄLLA + fragor:-knapp här), skattedjup äger
// ISK/depå-djupet (endast kurslänk). Sond mot hela kedjan: 771 kärnord
// i 21 lager, 0 fångster i båda riktningarna. Juridikgrind: ren
// mekanikutbildning — inga placeringstips.
import { svaraLokaltPortfoljbalans } from "@/lib/ai-mentor-portfoljbalans-fragor";
// Spår 6 omgång 13 (s6-u2): +2 förhandsfrågor — känslighetsanalys/
// stresstest + soliditetsgrad/balansstyrka — stabilitetsdjup-lagret
// (känslighetsanalys · känslighetstest · stresstest · stresstesta ·
// stresstestning · stresstestar · soliditetsgrad · soliditetsläget ·
// balansstyrka) ligger SIST och kan därför aldrig stjäla en fråga från
// tidigare lager; källmärkt med flerkällsrad (st-02 primär + the-
// intelligent-investor + st-01 + margin-of-safety; st-01 primär +
// security-analysis + v10-skuldsattningsgrad + interpretation-of-
// financial-statements — kategorin STABILITETs 5 kurser, dess första
// egna lager). Ansvarsfördelning: basen äger GRUNDORDEN (soliditet +
// hävstång via kapitalstruktur-monstret, likviditet via aktiemarknads-
// monstret, V-titelorden skuldsättningsgrad/kvick/intäktsstabilitet via
// variabeluppslaget) — detta lager äger endast FAMILJEORDEN (sondbevis:
// "vad är soliditet?" fångas av basen, "vad är räntetäckningsgrad?" av
// riskdjupet); riskdjup äger skuldfällan (räntetäckningen endast
// grannmått + räkneexempel här). Sond mot hela kedjan: 810 kärnord i
// 22 lager (inkl syskon u1:s portfoljbalans på disk i samma fönster),
// 0 fångster i båda riktningarna. Juridikgrind: ren metodutbildning —
// inga placeringstips.
import { svaraLokaltStabilitetsdjup } from "@/lib/ai-mentor-stabilitetsdjup-fragor";
// Spår 6 omgång 13 (s6-u3): +3 förhandsfrågor — Grahams värdegolv —
// grahamgolv-lagret (net net · netnet · ncav · nettotillgångsvärde ·
// värdegolv + cigar butts · cigarettfimp + mr market · herr marknad)
// ligger SIST och kan därför aldrig stjäla en fråga från tidigare lager;
// källmärkt med flerkällsrad (value-investing-from-graham-to-buffett +
// the-intelligent-investor + security-analysis + the-snowball /
// the-essays-of-warren-buffett + the-warren-buffett-way — bokmasterns
// värderingskanon, 103 kurser i BOKMASTER-kategorin). WIDGET-KOPPLING
// (praktik-lagrets fall K): förslagsknapparna "Vad är en net-net?" och
// "Förklara NCAV & cigar-butts" ställer exakt frågan "vad är en net-net
// och NCAV?" — som före detta lager gick till API-flödet vid varje
// klick; kedjan svarar nu lokalt utan API-kostnad. Ansvarsfördelning:
// basens böcker-monster äger GRAHAM-ORDEN (kärnorden "graham"/"intelligent
// investor" fångar alla "grahams …"-frågor — sondbevis; här endast KÄLLOR
// + STARKORD, starkord kan aldrig stjäla), nästa-lagret äger substansvärde/
// NAV-rabatt (fragor:-knapp länkar dit), djup-lagrets mästare äger Buffett-
// frågorna (knapp länkar dit). Sond mot hela kedjan: 810 kärnord i 22
// lager (inkl syskonens portfoljbalans + stabilitetsdjup på disk i samma
// fönster), 0 fångster i båda riktningarna; "ncav"↔nästa-lagrets "nav"
// d=1 dokumenterad i modulen (stöld omöjlig: nav fångas FÖRE, testfall
// J3). Juridikgrind: ren metodutbildning — inga placeringstips.
import { svaraLokaltGrahamgolv } from "@/lib/ai-mentor-grahamgolv-fragor";

// Spår 6 omgång 14 (s6-u2): värderingsjusteringar — normalisering/CAPE +
// WACC, SIST i kedjan. Kärnorden sonderade mot samtliga 24 tidigare lager
// (0 fångster i båda riktningarna — verktyg/testa-ai-mentor-varderjustering.mjs
// fall G2/J vakar mekaniskt LIVE ur modulerna). vm-04 är redan SIDOKÄLLA i
// djup-lagrets multipel-monster — här ägs ämnet normalisering; källor får
// delas mellan lager, kärnord aldrig. Juridikgrind: metodutbildning.
import { svaraLokaltVarderjustering } from "@/lib/ai-mentor-varderjustering-fragor";

// Spår 6 omgång 14 (s6-u1): +1 förhandsfråga (köpoption med säljoptionen
// som inbyggd spegel) — optionsdjup-lagret ligger SIST och kan därför
// aldrig stjäla en fråga från tidigare lager; källmärkt med flerkällsrad
// (km-059/od-01/od-02/km-062). Ansvarsfördelning: nästa-lagret äger
// options-ÖVERSIKTSORDEN (option/call/put/covered call/protective put/
// black scholes — sondbevis), detta lager äger de svenska komponentorden
// (köpoption/säljoption/lösenpris/strikepris/optionspremie/tidsvärde/
// underliggande/optionsgreker); kurserna od-01 + od-02 nås av ingen annan
// mentorväg (kärnordsdisjunktion mot 815 ord LIVE-testat, 0 krockar —
// verktyg/_s6u1-sond-omg14.mjs).
import { svaraLokaltOptionsdjup } from "@/lib/ai-mentor-optionsdjup-fragor";
// Spår 6 omgång 14 (s6-u3): +3 förhandsfrågor — riskläsningsdjup-lagret
// (kundkoncentration/koncentrationsrisk/kundberoende · riskmatris ·
// riskavsnitt/riskbeskrivning/riskredovisning) ligger SIST och kan därför
// aldrig stjäla en fråga från tidigare lager; källmärkt med flerkällsrad
// (rs-02-kundkoncentration + rk-09-koncentrationsrisk + rs-03-dold-
// samvariation + rs-04-riskmatrisen + rs-05-riskavsnittet-mellan-raderna
// + rk-11-bedrageririsk + km-032 — RISK-kategorins tre läsningskurser
// rs-02/rs-04/rs-05 som primärer). RISK var registrets näst största helt
// otäckta kategori: volatilitet ägs av basens risk-monster, dold
// samvariation av portföljgrundens korrelationsfamilj, kapitalförbränning
// av basens V19 — detta lager bär ENDAST sammansatta familjeord basen
// saknar (V19-precedensen; sond verktyg/_s6u3-sond-omg14.mjs: 843 kärnord
// LIVE, 0 fångster i båda riktningarna; syskonen u2:s varderjustering +
// u1:s optionsdjup på disk i samma fönster — disk-läge-presedensen,
// kärnorden mekaniskt disjunkta mot detta lager i båda riktningarna).
// Juridikgrind: ren metodutbildning — inga placeringstips.
import { svaraLokaltRisklasningsdjup } from "@/lib/ai-mentor-risklasningsdjup-fragor";
// Spår 6 omgång 15 (s6-u1): +1 förhandsfråga — avkastningskurve-lagret
// (den omvända avkastningskurvan/inverterad yield curve/räntekurvan) ligger
// SIST och kan därför aldrig stjäla en fråga från tidigare lager; källmärkt
// med flerkällsrad (mk-08-omvand-yield-curve primär + mk-06-penningpolitik
// + ma-01-transmissionsmekaniken + mk-01-bnp-och-tillvaxt — aktiverar tre
// kurser ingen mentorväg nådde: sonden räknade mk-08/mk-06/mk-01 olänkade).
// Ansvarsfördelning (V19-precedensen): makro-lagret äger ränteorden
// (styrränta/ränta/penningpolitik/obligation — sondbevis), detta lager
// bär ENDAST sammansatta kurvord + fraser; nakna inverter-ord är bara
// starkord (cape/case-klassen: "inverterad" ligger tavstånd 1–2 från
// "investerad"/"investering"); basen äger naket "spread", riskdjupet
// "löptid". Sond verktyg/_s6u1-sond-omg15.mjs: kedjeprober NULL genom
// samtliga 27 lager före leveransen. Juridikgrind: ren metodutbildning —
// inga placeringstips, inga prognoser, historiken bokförd med sina
// osäkerheter. I samma fönster: ai-mentor-register rebakat 401→402
// (basotestets E01 var rött — vr-04-rebaken i spår 5 nådde aldrig
// mentorsregistret; nu 26/26 grönt).
import { svaraLokaltAvkastningskurva } from "@/lib/ai-mentor-avkastningskurva-fragor";
// Spår 6 omgång 15 (s6-u2): +2 förhandsfrågor — avkastningsdjup-lagret
// (avkastningens tre källor: vr-04 primär + vr-03 + kt-02 + ud-09 ·
// tvärsnittet mellan bolag: vr-01 primär + vr-02 + km-027-pegratio + v06)
// ligger SIST och kan därför aldrig stjäla en fråga från tidigare lager;
// källmärkt med flerkällsrader — aktiverar VÄRDERING-familjens två kurser
// ingen mentorväg nådde (sondens NULL-familj: "vad är avkastning?" ·
// "var kommer avkastningen ifrån?" · "vad är totalavkastning?" ·
// "prisavkastning" · "vad är tvärsnittsanalys?" · "hur jämför jag bolag?").
// Ansvarsfördelning (emission/V19-precedensen): djup-lagret äger i praktiken
// multipel-orden ("multipelgapet"/"multipelns resa" fångas av dem, sondbevis
// d=2 till "multipelvalet") — detta lager når vr-01/vr-04 via tvärsnitts-
// och avkastningsformuleringar; singularen "avkastningskälla" (tavstånd 2
// till utdelningsdjupets "avkastningsfälla") bärs medvetet EJ här; syskonet
// s6-u1:s avkastningskurva-lager (samma fönster, disk-läge-presedensen) är
// kärnordsdisjunkt i båda riktningarna (deras kurvfamilj: avkastningskurva/
// räntekurva/kurvinvertering — mina käll-/tvärsnittsfamiljer, tavstånd ≥ 4).
// Sond verktyg/_s6u2-sond-omg15.mjs: 27 motorer / 86 monsters / 897 kärnord
// LIVE + tre ronder. Juridikgrind: ren metodutbildning — inga placeringstips.
import { svaraLokaltAvkastningsdjup } from "@/lib/ai-mentor-avrakningsdjup-fragor";
// Spår 6 omgång 15 (s6-u3): +3 förhandsfrågor — värderingsverktyg-lagret
// (scenarioanalys/scenarier · utdelningsdiskonteringsmodellen/gordons
// tillväxtmodell/ddm/gordon growth · peg ratio/peg/peg-kvoten) ligger SIST
// och kan därför aldrig stjäla en fråga från tidigare lager; källmärkt med
// flerkällsrader (km-029-scenarioanalys + km-032-stresstesting + rs-04-
// riskmatrisen + vm-04-cyklisk-justering · vm-06-dividend-discount-model-ddm
// + ud-09-utdelningens-hallbarhet + km-064-utdelningstillvaxt + vm-01-
// grahams-formel · km-027-pegratio + km-009-pe + km-007-dcf + tx-03) —
// VÄRDERINGSMETODER-kategorins tre ännu otäckta verktyg: scenarioanalys,
// DDM och PEG gick ALLA NULL genom hela kedjan före detta lagret.
// Ansvarsfördelning (emission/V19-precedensen): basens utdelning-monster
// äger grundorden ("utdelning", "dividend", "dividender", "direktavkastning",
// "payout ratio" — sondbevis), lönsamhetsdjupet äger wacc/kapitalkostnad,
// värderingsjusteringen normalisering/CAPE/SOTP, riskläsningsdjupet
// riskmatris/riskavsnitt — detta lager bär ENDAST sammansatta familjeord
// ingen tidigare äger; syskonen i samma fönster (u1:s avkastningskurva +
// u2:s avrakningsdjup med "vinsttillväxten"/tvärsnitt-familjen — disk-läge-
// presedensen) är kärnordsdisjunkta i båda riktningarna; u2:s tvärsnitts-
// text nämner PEG-logiken som KÄLLA (km-027 delas som källa, aldrig som
// kärnord). Sond verktyg/_s6u3-sond-omg15.mjs: 29 motorer / 89 monsters /
// 945 kärnord LIVE, 10/10 kanoniska NULL. Juridikgrind: ren metodutbildning
// med påhittade tal — inga placeringstips.
import { svaraLokaltVarderingsverktyg } from "@/lib/ai-mentor-varderingsverktyg-fragor";

/**
 * AI-MENTOR PRO — Superintelligent guide som:
 *
 * 1. KÄNNER ELEVEN: nivå, XP, klarade kurser, senaste aktivitet
 * 2. KÄNNER PLATSEN 100%: ALLA sidtyper på sajten detekteras (kurser, konfluens,
 *    netnet, rapporter, vagfundament, portföljbyggaren, dagens pass …) och varje
 *    sidtyp genererar en proaktiv kontext-mening ("Jag ser att du använder
 *    Konfluensradarn — vill du förstå de fem dimensionerna?")
 * 3. REDIGERAR BEHOVET: vid tvetydiga frågor ("är Volvo bra?") ställer mentorn
 *    EN klarliggande motfråga om tidshorisont och mål — svaret är klickbart och
 *    skickas som ny fråga ("fragor:"-konventionen nedan)
 * 4. GER HANDLINGAR: klickbara knappar som tar eleven exakt dit den behöver
 * 5. ANTICIPERAR: föreslår nästa steg INNAN eleven frågar
 * 6. FÖLJER AKM1/AK1TS: alla svar strukturerade efter ekosystemet
 * 7. ÄR RESPONSIV: tre pulserande guldprickar medan svaret laddas, Enter skickar
 *    (Shift+Enter gör inget), smooth auto-scroll till senaste, swipe-ner-stäng på mobil
 * 8. MINNS I DJUPET: konversationen sparas lokalt (ak1a-chat-minne-v1, max 60
 *    turer) och de senaste 12 turerna skickas som `historik` — mentorn refererar
 *    bakåt, korrigerar tveksamma antaganden ("Snäv men viktig korrigering") och
 *    roterar skarpa motfrågor (klickbara chips: värdering, risk, tidshorisont,
 *    källkritik, applikation) plus en "fördjupa"-knapp per svar
 *
 * LÄNK-KONVENTIONER i handlings-knappar:
 *   "fragor:<text>" → texten skickas som en NY fråga till mentorn (redigering)
 *   "sr:alla"       → starta spaced repetition med samtliga kort (blandat)
 *   "#"             → starta spaced repetition i chatten
 *   "#<sektion>"    → mjukscroll till sektion på samma sida
 *   annars          → router.push(lank)
 */

type Handling = { text: string; lank: string; ikon: string; beskrivning?: string };

/** Mentorns motfråga (från /api/chatbot) — renderas som klickbart chip. */
type MotfragaChip = { text: string; kategori: string };

/** "Fördjupa"-länk — öppnar mest relevant kurs/verktyg för svaret. */
type Fordjupa = { text: string; lank: string };

type Meddelande = {
  fran: "du" | "ai";
  text: string;
  handlings?: Handling[];
  ikon?: string;
  motfraga?: MotfragaChip;
  fordjupa?: Fordjupa;
  /** Källmärke (mentor 2.1): "AI-Mentorn modell" på modellsvar — renderas
   *  som tydlig etikett + pedagogisk disclaimer under bubblan. */
  kalla?: string;
  /** Kvarvarande modellfrågor idag (visas i etiketten — ärlig kostnadssyn). */
  kvarvarande?: number;
};

/** Alla sidtyper på sajten — detekteras från pathname. */
type SidTyp =
  | "start"
  | "kurs"
  | "kurslista"
  | "analys"
  | "analyslista"
  | "kalkylator"
  | "portfölj"
  | "portföljbyggare"
  | "blogg"
  | "labb"
  | "läroplan"
  | "vagfundament"
  | "konfluens"
  | "netnet"
  | "rapporter"
  | "fas3"
  | "fas2"
  | "pro"
  | "medlemskap"
  | "profil"
  | "dagens-pass"
  | "topplistan"
  | "badges"
  | "manifest"
  | "bibliotek"
  | "certifikat"
  | "superanalys"
  | "min-sida"
  | "logga-in"
  | "om-oss"
  | "admin"
  | "annan";

type elevContext = {
  niva: number;
  xp: number;
  klaraKurser: number;
  stjarnor: number;
  inloggad: boolean;
  aktuellSida: string;
  sidTyp: SidTyp;
  kursSlug?: string;
  kursTitel?: string;
};

/** Sidtyps-detektern — känner igen ALLA routes på sajten. */
function analyseraSida(pathname: string): SidTyp {
  if (!pathname) return "start";
  if (pathname.startsWith("/kurser/")) return "kurs";
  if (pathname === "/kurser") return "kurslista";
  if (pathname.startsWith("/analyser/")) return "analys";
  if (pathname === "/analyser") return "analyslista";
  if (pathname.startsWith("/kalkylator")) return "kalkylator";
  if (pathname.startsWith("/min-portfolj")) return "portfölj";
  if (pathname.startsWith("/portfoljbyggare")) return "portföljbyggare";
  if (pathname.startsWith("/blogg")) return "blogg";
  if (pathname.startsWith("/labb")) return "labb";
  if (pathname.startsWith("/laroplan")) return "läroplan";
  if (pathname.startsWith("/vagfundament")) return "vagfundament";
  if (pathname.startsWith("/konfluens")) return "konfluens";
  if (pathname.startsWith("/netnet")) return "netnet";
  if (pathname.startsWith("/rapporter")) return "rapporter";
  if (pathname.startsWith("/fas3")) return "fas3";
  if (pathname.startsWith("/fas2")) return "fas2";
  if (pathname.startsWith("/pro")) return "pro";
  if (pathname.startsWith("/medlemskap")) return "medlemskap";
  if (pathname.startsWith("/profil")) return "profil";
  if (pathname.startsWith("/dagens-pass")) return "dagens-pass";
  if (pathname.startsWith("/topplista")) return "topplistan";
  if (pathname.startsWith("/badges")) return "badges";
  if (pathname.startsWith("/manifest")) return "manifest";
  if (pathname.startsWith("/bibliotek")) return "bibliotek";
  if (pathname.startsWith("/certifikat")) return "certifikat";
  if (pathname.startsWith("/superanalys")) return "superanalys";
  if (pathname.startsWith("/min-sida")) return "min-sida";
  if (pathname.startsWith("/logga-in")) return "logga-in";
  if (pathname.startsWith("/om-oss")) return "om-oss";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname === "/") return "start";
  return "annan";
}

/** Läsbart kursnamn ur slug ("v09-roe" → "V09 Roe") — content.ts är server-only. */
function kursTitelFranSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => {
      const v = w.match(/^v(\d{2})$/);
      if (v) return `V${v[1]}`;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/** Kort visningsnamn per sidtyp (chatt-panelens kontext-chip). */
const SID_NAMN: Record<SidTyp, string> = {
  start: "start",
  kurs: "kurs",
  kurslista: "kurser",
  analys: "analys",
  analyslista: "analyser",
  kalkylator: "kalkylatorn",
  portfölj: "portföljen",
  portföljbyggare: "portföljbyggaren",
  blogg: "bloggen",
  labb: "labbet",
  läroplan: "läroplanen",
  vagfundament: "vågfundamentet",
  konfluens: "konfluensradarn",
  netnet: "net-net-skannern",
  rapporter: "redovisningsverkstan",
  fas3: "fas 3",
  fas2: "fas 2-ansökan",
  pro: "pro",
  medlemskap: "medlemskap",
  profil: "profilen",
  "dagens-pass": "dagens pass",
  topplistan: "topplistan",
  badges: "badges",
  manifest: "manifestet",
  bibliotek: "biblioteket",
  certifikat: "certifikatet",
  superanalys: "superanalysen",
  "min-sida": "min sida",
  "logga-in": "inloggning",
  "om-oss": "om oss",
  admin: "admin",
  annan: "sidan",
};

/**
 * Proaktiv kontext-meningsbyggnad per sidtyp — mentorn "ser" sidan eleven
 * befinner sig på och bjuder in till nästa steg med en fråga (pedagogik-ton:
 * vi tipsar, vi dömer aldrig).
 */
function sidKontextMening(ctx: elevContext): string {
  const klaraProcent = Math.round((ctx.klaraKurser / SIFFROR.kurser) * 100); // ur guldkällan
  switch (ctx.sidTyp) {
    case "kurs":
      return `Jag ser att du läser kursen ${ctx.kursTitel ? `"${ctx.kursTitel}"` : ""} kapitel för kapitel — vill du testa dig med quiz:et (+10 XP per rätt svar) eller gå vidare till nästa steg?`;
    case "kurslista":
      return `Jag ser att du står i kursbiblioteket (${SIFFROR.kurser} kurser) — vill du ha ett personligt tips på rätt kurs för just dig?`;
    case "analys":
      return `Jag ser att du läser en analys — vill du lära dig verifiera siffrorna själv i kalkylatorn (AKM1: 20 variabler)?`;
    case "analyslista":
      return `Jag ser att du står i analysbanken — vill du lära dig läsa en analys som en institutionell analytiker?`;
    case "kalkylator":
      return `Redan i kalkylatorn — bra! Behöver du årsredovisningsguiden för att hitta siffrorna, eller ska jag förklara en variabel (V01–V20)?`;
    case "portfölj":
      return `Jag ser din portfölj — har du testat djupanalysen? Python-motorn hämtar live-data och ger dig en 25-cellers-matris.`;
    case "portföljbyggare":
      return `Jag ser att du bygger portfölj rad för rad — vill du förstå riskspridning, sektorskoncentration och vad 40%-varningen betyder?`;
    case "blogg":
      return `Jag ser att du läser bloggen — vill du ha den strukturerade vägen genom samma ämne via läroplanen?`;
    case "labb":
      return `Jag ser att du är i Labbet (201 case studies) — vill du öva på att resonera kring ett riktigt bolag?`;
    case "läroplan":
      return `Du har klarat ${ctx.klaraKurser} kurser (${klaraProcent}%) — din nästa utmaning väntar. Vill du se var du är på resan?`;
    case "vagfundament":
      return `Jag ser att du studerar Vågfundamentet — vill du förstå vågklasserna ▲ impulsvåg, ▼ korrigering, ◼ basbygge och 20×5-matrisen?`;
    case "konfluens":
      return `Jag ser att du använder Konfluensradarn — vill du förstå de fem dimensionerna som måste tala samman?`;
    case "netnet":
      return `Jag ser att du använder Net-net-skannern — vill du förstå Grahams NCAV-golv och varför cigar-butts är så sällsynta idag?`;
    case "rapporter":
      return `Jag ser att du är i redovisningsverkstan — vill du veta hur rapporten vävs samman (AKM1, AK1TS och Konfluens) och hur du delar den?`;
    case "fas3":
      return `Jag ser att du tittar på Fas 3 — representeras snart; Fas 2-medlemmar får tillgång först. Vill du se vad varje fas innehåller?`;
    case "fas2":
      return `Jag ser att du tittar på Fas 2-ansökan — coaching, gemenskap och representant-vägen (nivå 25+ är en bra signal). Vill du förstå kraven?`;
    case "pro":
      return `Jag ser att du tittar på Pro — vägen för skolor, företag och institutioner. Vill du se vad som ingår?`;
    case "medlemskap":
      return `Jag ser att du jämför faserna — kom ihåg: Fas 1 är hela biblioteket, gratis för alltid. Vill du se vad varje fas innehåller?`;
    case "profil":
      return `Jag ser att du utforskar analytikerprofilen — vill du förstå vad din kognitiva profil betyder för din analysstil?`;
    case "dagens-pass":
      return `Jag ser att du är på dagens pass — redo att förlänga streaken? Ett femminuterspass räcker.`;
    case "topplistan":
      return `Jag ser att du tittar på topplistan — varje quiz (+10 XP) och flashcard (+5 XP) flyttar dig uppåt. Vill du förtjäna XP nu?`;
    case "badges":
      return `Jag ser att du besökar meritväggen — vill du se vilken badge som är närmast att låsa upp?`;
    case "manifest":
      return `Jag ser att du läser manifestet — labbets löften om ärlighet, gratis kunskap och välfärd. Vill du se löftena i praktiken?`;
    case "bibliotek":
      return `Jag ser att du står i biblioteket — bokkanonen + ${SIFFROR.bokmaster} BOKMASTER-böcker kapitel för kapitel. Vill du ha en läsväg?`;
    case "certifikat":
      return `Jag ser att du tittar på ditt certifikat — betyget (A–D) styrs av nivå, XP och klarade kurser, och uppdateras live. Vill du höja det?`;
    case "superanalys":
      return `Jag ser att du förbereder Superanalysen — vill du repetera 25-cellers-matrisen och ekosystemet först?`;
    case "min-sida":
      return `Jag ser att du är på Min sida — din dashboard med streak, vågkarta och veckoplan. Vill du veta vad som är nästa steg?`;
    case "logga-in":
      return `Jag ser att du loggar in — 20 sekunder, ingen betalning, så låser du upp XP, progress och certifikatet.`;
    case "om-oss":
      return `Jag ser att du läser om oss — vill du förstå ekosystemet bakom AK1A (AKM1 + AK1TS)?`;
    case "start":
      return `Jag ser att du är på startsidan — vill du börja med läroplanen, testa din nivå eller räkna på en aktie?`;
    default:
      return `Här är nästa steg baserat på var du är:`;
  }
}

/** Generera proaktiva förslag baserat på KONTEXT — alla sidtyper täckta. */
function proaktivaForslag(ctx: elevContext): Handling[] {
  const forslag: Handling[] = [];

  switch (ctx.sidTyp) {
    case "kurs":
      forslag.push(
        { text: "Testa dig (quiz)", lank: "#quiz", ikon: "🧠", beskrivning: "Visa quiz i denna kurs" },
        { text: "Räkna på en aktie", lank: "/kalkylator", ikon: "🧮", beskrivning: "Öppna kalkylatorn" },
        { text: "Nästa kurs i läroplanen", lank: "/laroplan", ikon: "🗺️", beskrivning: "Se var du är" },
      );
      break;
    case "kurslista":
      forslag.push(
        { text: "Läroplanen (5 nivåer)", lank: "/laroplan", ikon: "🗺️", beskrivning: "Din väg genom spåret" },
        { text: `BOKMASTER (${SIFFROR.bokmaster} böcker)`, lank: "/kurser/the-intelligent-investor", ikon: "🏛️", beskrivning: "Klassikerna kapitel för kapitel" },
        { text: "Repetera flashcards", lank: "#", ikon: "🃏", beskrivning: "Spaced repetition" },
      );
      break;
    case "kalkylator":
      forslag.push(
        { text: "Var hittar jag siffrorna?", lank: "#guide", ikon: "📖", beskrivning: "Årsredovisningsguide" },
        { text: "Läs en årsredovisning", lank: "/blogg/sa-laser-du-en-svensk-arsredovisning", ikon: "📚", beskrivning: "Steg-för-steg" },
        { text: "Bygg portfölj med dina siffror", lank: "/min-portfolj", ikon: "💼", beskrivning: "Lägg in aktier" },
      );
      break;
    case "portfölj":
      forslag.push(
        { text: "Kör djupanalys", lank: "#djup", ikon: "🔬", beskrivning: "Python-motor med live-data" },
        { text: "Lär dig ekosystemet", lank: "/kurser/portfolj-ekosystemet", ikon: "📊", beskrivning: "5×5×4-kursen" },
        { text: "Läs din portföljrapport", lank: "/blogg/sa-laser-du-din-portfoljrapport", ikon: "📖", beskrivning: "Guiden" },
      );
      break;
    case "portföljbyggare":
      forslag.push(
        { text: "Kursen om portfölj-ekosystemet", lank: "/kurser/portfolj-ekosystemet", ikon: "📊", beskrivning: "5×5×4 — riskspridning på riktigt" },
        { text: "Min portfölj (riktiga innehav)", lank: "/min-portfolj", ikon: "💼", beskrivning: "Spåra aktierna" },
        { text: "5 nybörjarmisstag", lank: "/blogg/5-vanliga-nyborjarmisstag-svenska-aktier", ikon: "⚠️", beskrivning: "Koncentration är vanligast" },
      );
      break;
    case "analys":
      forslag.push(
        { text: "Räkna själv i kalkylatorn", lank: "/kalkylator", ikon: "🧮", beskrivning: "Verifiera siffrorna" },
        { text: "Graham: Marginal of Safety", lank: "/kurser/the-intelligent-investor", ikon: "🌉", beskrivning: "Lär dig marginalen" },
        { text: "Lägg bolaget i din portfölj", lank: "/min-portfolj", ikon: "💼", beskrivning: "Spåra det" },
      );
      break;
    case "analyslista":
      forslag.push(
        { text: "Institutionell aktieanalys", lank: "/blogg/vad-ar-institutionell-aktieanalys", ikon: "🏛️", beskrivning: "Så arbetar proffs" },
        { text: "Räkna på ett bolag", lank: "/kalkylator", ikon: "🧮", beskrivning: "20 variabler" },
        { text: "Bygg portfölj", lank: "/min-portfolj", ikon: "💼", beskrivning: "Lägg in innehav" },
      );
      break;
    case "läroplan":
      forslag.push(
        { text: "Fortsätt där du slutade", lank: "/kurser", ikon: "▶️", beskrivning: "Din nästa kurs" },
        { text: "Testa din nivå", lank: "/profil", ikon: "🧠", beskrivning: "Kognitiv profil" },
      );
      break;
    case "vagfundament":
      forslag.push(
        { text: "Fråga om en våg (t.ex. V09)", lank: "fragor:" + encodeURIComponent("vad är vågfundamentet för V09 på medellång horisont?"), ikon: "🌊", beskrivning: "Mentorn förklarar vågklassen" },
        { text: "Vad säger vågkartan?", lank: "fragor:" + encodeURIComponent("vad säger vågkartan just nu?"), ikon: "🗺️", beskrivning: "Senaste autonoma mätningen" },
        { text: "Ekosystem-kursen", lank: "/kurser/portfolj-ekosystemet", ikon: "📊", beskrivning: "20×5 i praktiken" },
      );
      break;
    case "konfluens":
      forslag.push(
        { text: "Förklara de fem dimensionerna", lank: "fragor:" + encodeURIComponent("förklara konfluensradarns fem dimensioner"), ikon: "🧭", beskrivning: "Värde före vågor" },
        { text: "Vad är en net-net?", lank: "fragor:" + encodeURIComponent("vad är en net-net och NCAV?"), ikon: "🎣", beskrivning: "Grahams värdegolv" },
        { text: "Vågfundamentet (20×5)", lank: "/vagfundament", ikon: "🌊", beskrivning: "Variablerna som tidsserier" },
      );
      break;
    case "netnet":
      forslag.push(
        { text: "Förklara NCAV & cigar-butts", lank: "fragor:" + encodeURIComponent("vad är en net-net och NCAV?"), ikon: "🎣", beskrivning: "Grahams extrema värdegolv" },
        { text: "Konfluensradarn", lank: "/konfluens", ikon: "🧭", beskrivning: "Värde möter vågor" },
        { text: "Graham: The Intelligent Investor", lank: "/kurser/the-intelligent-investor", ikon: "🏛️", beskrivning: "Boken bakom metoden" },
      );
      break;
    case "rapporter":
      forslag.push(
        { text: "Välj analyser i analysbanken", lank: "/analyser", ikon: "📊", beskrivning: "Råmaterial till rapporten" },
        { text: "Se ditt certifikat", lank: "/certifikat", ikon: "🎓", beskrivning: "Betyg A–D, delbart" },
        { text: "Så läser du din portföljrapport", lank: "/blogg/sa-laser-du-din-portfoljrapport", ikon: "📖", beskrivning: "Guiden" },
      );
      break;
    case "fas3":
    case "fas2":
    case "medlemskap":
      forslag.push(
        { text: "Se hela medlemskapet", lank: "/medlemskap", ikon: "💛", beskrivning: "Fas 1 gratis · Fas 2 coaching · Fas 3 snart" },
        { text: "Ansök om Fas 2 (kostnadsfritt)", lank: "/fas2-ansok", ikon: "🎓", beskrivning: "2 minuter" },
        { text: "Se ditt certifikat", lank: "/certifikat", ikon: "📜", beskrivning: "Betyg A–D" },
      );
      break;
    case "pro":
      forslag.push(
        { text: "Medlemskap & faser", lank: "/medlemskap", ikon: "💛", beskrivning: "Privata medlemskapen" },
      );
      // VÅG 77 (B1-grinden): AK1A Pro-länken syns bara när B2B är aktiverat.
      if (b2bAktiv()) {
        forslag.push(
          { text: "AK1A Pro", lank: "/pro", ikon: "🏢", beskrivning: "För skolor, företag och institutioner" },
        );
      }
      break;
    case "profil":
      forslag.push(
        { text: "V09: ROE — viktigaste variabeln", lank: "/kurser/v09-roe", ikon: "📊", beskrivning: "Passar alla profiler" },
        { text: "Testa dig (quiz)", lank: "/kurser", ikon: "🧠", beskrivning: "+10 XP per rätt svar" },
      );
      break;
    case "dagens-pass":
      forslag.push(
        { text: "Repetera flashcards", lank: "#", ikon: "🃏", beskrivning: "+5 XP per bra svar" },
        { text: "Veckoplanen", lank: "/min-sida", ikon: "🗓️", beskrivning: "Se veckans steg" },
        { text: "Vad säger vågkartan?", lank: "fragor:" + encodeURIComponent("vad säger vågkartan just nu?"), ikon: "🌊", beskrivning: "Senaste mätningen" },
      );
      break;
    case "topplistan":
      forslag.push(
        { text: "Förtjäna XP: läs en kurs", lank: "/kurser", ikon: "📚", beskrivning: "Quiz: +10 XP per rätt" },
        { text: "Testa dig (quiz)", lank: "/kurser/the-intelligent-investor", ikon: "🧠", beskrivning: "Snabbast vägen upp" },
        { text: "Logga in gratis", lank: "/logga-in", ikon: "🔑", beskrivning: "Lås upp ställningen" },
      );
      break;
    case "badges":
      forslag.push(
        { text: "Närmaste badge: gör ett pass", lank: "/dagens-pass", ikon: "🔥", beskrivning: "Streak-badges väntar" },
        { text: "Förtjäna XP", lank: "/kurser", ikon: "📚", beskrivning: "Varje kurs räknas" },
        { text: "Repetera flashcards", lank: "#", ikon: "🃏", beskrivning: "Första flashcard-badgen" },
      );
      break;
    case "manifest":
      forslag.push(
        { text: "Läroplanen — löftena i praktiken", lank: "/laroplan", ikon: "🗺️", beskrivning: "5 nivåer till självständighet" },
        { text: "Om oss", lank: "/om-oss", ikon: "🏛️", beskrivning: "Historien bakom" },
      );
      break;
    case "bibliotek":
      forslag.push(
        { text: "BOKMASTER-kurser", lank: "/kurser/the-intelligent-investor", ikon: "🏛️", beskrivning: `${SIFFROR.bokmaster} böcker kapitel för kapitel` },
        { text: "Läroplanen", lank: "/laroplan", ikon: "🗺️", beskrivning: "Börja med grunden" },
      );
      break;
    case "certifikat":
      forslag.push(
        { text: "Höj betyget: nästa kurs", lank: "/laroplan", ikon: "📚", beskrivning: "Nivå + XP + kurser styr betyget" },
        { text: "Testa dig (quiz)", lank: "/kurser", ikon: "🧠", beskrivning: "+10 XP per rätt svar" },
      );
      break;
    case "superanalys":
      forslag.push(
        { text: "Repetera 25-cellers-matrisen", lank: "/kurser/ts-10-ak1ts-25cellers-matris", ikon: "🔢", beskrivning: "AK1TS-kärnan" },
        { text: "Portfölj-ekosystemet", lank: "/kurser/portfolj-ekosystemet", ikon: "📊", beskrivning: "5×5×4 i praktiken" },
        { text: "Repetera flashcards", lank: "#", ikon: "🃏", beskrivning: "Färska inför analysen" },
      );
      break;
    case "min-sida":
      forslag.push(
        { text: "Vad är nästa kurs?", lank: "fragor:" + encodeURIComponent("vad är nästa kurs för mig?"), ikon: "🗺️", beskrivning: "Personligt kurstips" },
        { text: "Vad säger vågkartan?", lank: "fragor:" + encodeURIComponent("vad säger vågkartan just nu?"), ikon: "🌊", beskrivning: "Senaste mätningen" },
        { text: "Förläng streaken", lank: "/dagens-pass", ikon: "🔥", beskrivning: "Ett pass idag räcker" },
      );
      break;
    case "logga-in":
      forslag.push(
        { text: "Skapa gratis konto", lank: "/logga-in", ikon: "🔑", beskrivning: "20 sek, ingen betalning" },
        { text: "Vad får jag som medlem?", lank: "fragor:" + encodeURIComponent("vad ingår i medlemskapet?"), ikon: "💛", beskrivning: "Fas 1 är gratis" },
      );
      break;
    case "om-oss":
      forslag.push(
        { text: "Ekosystem-kursen", lank: "/kurser/portfolj-ekosystemet", ikon: "📊", beskrivning: "AKM1 + AK1TS förklarat" },
        { text: "Börja läroplanen", lank: "/laroplan", ikon: "🌱", beskrivning: "5 nivåer till självständighet" },
      );
      break;
    case "start":
      forslag.push(
        { text: "Börja här: Läroplanen", lank: "/laroplan", ikon: "🌱", beskrivning: "5 nivåer till självständighet" },
        { text: "Testa din personlighet", lank: "/profil", ikon: "🧠", beskrivning: "3-min scenario-test" },
        { text: "Räkna på en aktie", lank: "/kalkylator", ikon: "🧮", beskrivning: "20 variabler" },
      );
      break;
    case "blogg":
      forslag.push(
        { text: "Fortsätt lära", lank: "/laroplan", ikon: "🌱", beskrivning: "Strukturerad utbildning" },
        { text: "Alla artiklar", lank: "/blogg", ikon: "✍️", beskrivning: "Hela bloggarkivet" },
      );
      break;
    case "labb":
      forslag.push(
        { text: "Välj ett case", lank: "/labb", ikon: "🧪", beskrivning: "201 case studies" },
        { text: "Räkna på bolaget", lank: "/kalkylator", ikon: "🧮", beskrivning: "Verifiera med AKM1" },
      );
      break;
    default:
      forslag.push(
        { text: "Läroplanen", lank: "/laroplan", ikon: "🗺️" },
        { text: "Kalkylatorn", lank: "/kalkylator", ikon: "🧮" },
        { text: "Min portfölj", lank: "/min-portfolj", ikon: "💼" },
      );
  }

  // Baserat på elevens nivå
  if (ctx.niva >= 25 && ctx.sidTyp !== "portfölj" && ctx.sidTyp !== "portföljbyggare") {
    forslag.push({ text: "🎓redo för Fas 2 — ansök", lank: "/fas2-ansok", ikon: "🎓", beskrivning: "Nivå 25+ uppnådd!" });
  }

  if (!ctx.inloggad) {
    forslag.unshift({ text: "Logga in gratis — lås upp allt", lank: "/logga-in", ikon: "🔑", beskrivning: "20 sek, ingen betalning" });
  }

  return forslag.slice(0, 4);
}

/** Blanda samtliga kort (övning även när inget är förfallet) */
function blandaKort(): SRKort[] {
  const ko = [...ALLA_KORT];
  for (let i = ko.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ko[i], ko[j]] = [ko[j], ko[i]];
  }
  return ko.slice(0, 10);
}

/** Kontextmedveten hälsning — proaktiv meningsbyggnad per sidtyp. */
function halsning(ctx: elevContext, minneAntal = 0): string {
  const timme = new Date().getHours();
  const tid = timme < 10 ? "God morgon" : timme < 13 ? "God dag" : timme < 18 ? "God eftermiddag" : "God kväll";
  const minnesRad =
    minneAntal > 0
      ? `\n\n🧠 Jag minns ${minneAntal} av dina tidigare frågor — vårt samtal fortsätter där vi var.`
      : "";

  if (!ctx.inloggad) {
    return `${tid}! 👋 Jag är din AI-mentor. Jag ser att du är på ${SID_NAMN[ctx.sidTyp]} — ${sidKontextMening(ctx)} Du kan också logga in gratis (20 sek) så följer jag din progress.${minnesRad}`;
  }

  const nivaRad = `${tid}, Nivå ${ctx.niva}! ⭐ ${ctx.xp} XP · ${ctx.klaraKurser} kurser klarade.`;
  return `${nivaRad}${minnesRad}\n\n${sidKontextMening(ctx)}`;
}

export function ChatWidget() {
  const [oppnad, setOppnad] = useState(false);
  // VÅG 108: /studio döljer den flytande 💬-knappen — där ÄR chatten.
  const widgetPathname = usePathname() ?? "";
  const [meddelanden, setMeddelanden] = useState<Meddelande[]>([]);
  const [fragor, setFraga] = useState("");
  const [busy, setBusy] = useState(false);
  const [hydrerad, setHydrerad] = useState(false);

  // ── KONVERSATIONSMINNET "I DJUPET" (ak1a-chat-minne-v1) ──
  // Antal elevfrågor i minnet — visas i panelen + skickas som historik
  const [minneAntal, setMinneAntal] = useState(0);

  // ── SAMMANHANGSKONTEXT — senaste ämnet (t.ex. "v09") skickas som `kontext`
  //    så att mentorn förstår följdfrågor ("och P/E?" efter ett samtal om ROE).
  //    Backwards-kompatibelt: serversidan klarar sig utan (faller tillbaka på
  //    historiken). Bakåtkompatibelt även för äldre svar utan `amne`.
  const [senasteAmne, setSenasteAmne] = useState<string | null>(null);

  // ── SPACED REPETITION-session i chatten ──
  const [srAktiv, setSrAktiv] = useState(false);
  const [srKo, setSrKo] = useState<SRKort[]>([]);
  const [srIndex, setSrIndex] = useState(0);
  const [srVisaSvar, setSrVisaSvar] = useState(false);
  const [srResultat, setSrResultat] = useState({ svara: 0, bra: 0, latta: 0, xp: 0 });
  const [srForfallna, setSrForfallna] = useState(0);

  const pathname = usePathname();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Swipe-ner-stäng (mobil): start-Y för beröring på paneltoppen
  const tryckY = useRef<number | null>(null);

  // Bygg elev-kontext — ENDAST på klienten (localStorage kräver browser)
  const [ctx, setCtx] = useState<elevContext>({
    niva: 1, xp: 0, klaraKurser: 0, stjarnor: 0,
    inloggad: false, aktuellSida: "/", sidTyp: "start",
  });

  useEffect(() => {
    const sidTyp = analyseraSida(pathname || "/");
    const kursSlug = sidTyp === "kurs" ? (pathname || "").split("/")[2] : undefined;
    setCtx({
      niva: niva(),
      xp: lasXP(),
      klaraKurser: lasKlaraKurser().length,
      stjarnor: lasStjarnor(),
      inloggad: Boolean(lasMedlem()),
      aktuellSida: pathname || "/",
      sidTyp,
      kursSlug,
      kursTitel: kursSlug ? kursTitelFranSlug(kursSlug) : undefined,
    });
    setSrForfallna(forfallnaKort(1000).length);
    setMinneAntal(raknaElevFragor());
    setHydrerad(true);
  }, [pathname]);

  // ── SR: starta repetitionssession ──
  const startaSR = useCallback((alla: boolean = false) => {
    const ko = alla ? blandaKort() : forfallnaKort(10);
    if (ko.length === 0) {
      const st = srStatistik();
      const text = `Inga kort förfallna idag — perfekt discipl! 🌟\n\nDin statistik: ${st.beharskade}/${st.totalt} behärskade (sitter i långt minne) · ${st.repetitionerTotalt} repetitioner totalt.\nNästa kort förfaller ${st.nastaNasta || "snart"}. Glömskekurvan jobbar för dig — kom tillbaka imorgon.`;
      setMeddelanden((p) => [...p, {
        fran: "ai",
        ikon: "🃏",
        text,
        handlings: [
          { text: `Blanda samtliga ${ALLA_KORT.length} kort`, lank: "sr:alla", ikon: "🎴", beskrivning: "Övning trots inga förfallna" },
          { text: "Tillbaka till lärandet", lank: "/laroplan", ikon: "🗺️", beskrivning: "Nästa steg" },
        ],
      }]);
      sparaChatTur("mentor", text);
      return;
    }
    setSrKo(ko);
    setSrIndex(0);
    setSrVisaSvar(false);
    setSrResultat({ svara: 0, bra: 0, latta: 0, xp: 0 });
    setSrAktiv(true);
  }, []);

  // ── SR: betygsätt kort (SM-2: Svår=2, Bra=4, Lätt=5) ──
  const bedom = useCallback((kvalitet: 2 | 4 | 5) => {
    const kort = srKo[srIndex];
    if (!kort) return;
    bedomKort(kort.id, kvalitet);
    geBadge("forsta-flashcard");

    let xpFortjanat = 0;
    if (kvalitet >= 4 && forjanaXP(kort.id)) {
      addXP(5);
      xpFortjanat = 5;
    }
    const ny = {
      svara: srResultat.svara + (kvalitet === 2 ? 1 : 0),
      bra: srResultat.bra + (kvalitet === 4 ? 1 : 0),
      latta: srResultat.latta + (kvalitet === 5 ? 1 : 0),
      xp: srResultat.xp + xpFortjanat,
    };
    setSrResultat(ny);

    if (srIndex + 1 >= srKo.length) {
      // Session klar → sammanfattning
      setSrAktiv(false);
      setSrKo([]);
      const total = ny.svara + ny.bra + ny.latta;
      const st = srStatistik();
      const text = `Repetitionssession klar! 🏆\n\n${total} kort repeterade: ${ny.latta} ⚡ lätta · ${ny.bra} ✅ bra · ${ny.svara} 🔁 svåra (kommer igen imorgon).\n+${ny.xp} XP förtjänade.\n\nTotalt: ${st.beharskade}/${st.totalt} kort i långt minne. Glömskekurvan bestämmer när nästa kort dyker upp — jag påminner dig här.`;
      setMeddelanden((p) => [...p, {
        fran: "ai",
        ikon: "🏆",
        text,
        handlings: [
          { text: "Fortsätt lära", lank: "/laroplan", ikon: "🗺️", beskrivning: "Nästa steg i utbildningen" },
          { text: "Testa mig på en kurs", lank: "/kurser", ikon: "🧠", beskrivning: "Quiz: +10 XP per rätt svar" },
        ],
      }]);
      sparaChatTur("mentor", text);
    } else {
      setSrIndex((i) => i + 1);
      setSrVisaSvar(false);
    }
  }, [srKo, srIndex, srResultat]);

  // Nollställ ev. SR-läge när chatten stängs
  useEffect(() => {
    if (!oppnad && srAktiv) {
      setSrAktiv(false);
      setSrKo([]);
    }
  }, [oppnad, srAktiv]);

  // VÅG 78 B7: öppna mentorn utifrån — samma CustomEvent-mönster som
  // kommandopalettens "ak1a:oppna-sok". Detail { fraga? } förhandsfyller
  // frågefältet (t.ex. "Fråga"-knappen i Min portfölj).
  useEffect(() => {
    const oppna = (e: Event) => {
      const f = (e as CustomEvent<{ fraga?: string }>).detail?.fraga;
      setOppnad(true);
      if (typeof f === "string" && f.trim().length > 0) setFraga(f.trim());
    };
    window.addEventListener("ak1a:oppna-mentor", oppna);
    return () => window.removeEventListener("ak1a:oppna-mentor", oppna);
  }, []);

  // Initiera med proaktiv hälsning när chatt öppnas (hälsningen minns minnet)
  useEffect(() => {
    if (oppnad && meddelanden.length === 0) {
      setMeddelanden([
        { fran: "ai", text: halsning(ctx, minneAntal), handlings: proaktivaForslag(ctx) }
      ]);
    }
  }, [oppnad, ctx, minneAntal]);

  // Auto-scroll till senaste meddelandet (även medan mentorn "tänker")
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [meddelanden, srIndex, srVisaSvar, srAktiv, busy]);

  // Uppdatera vid sidbyte — mentorn följer med och "ser" nya sidan
  useEffect(() => {
    if (hydrerad && oppnad && meddelanden.length > 0) {
      setMeddelanden((p) => [...p.slice(-4), {
        fran: "ai",
        text: `Jag följer med dig — vi är nu på ${SID_NAMN[ctx.sidTyp]}. ${sidKontextMening(ctx)}`,
        handlings: proaktivaForslag(ctx),
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const skicka = async (text?: string) => {
    const q = (text ?? fragor).trim();
    if (!q || busy) return;
    setFraga("");

    // Minnet "i djupet": varje elevfråga sparas lokalt (max 60 turer, äldsta
    // rensas) och de senaste turerna skickas som historik till API:et
    sparaChatTur("du", q);
    setMinneAntal(raknaElevFragor());

    // Intercept: repetition startas lokalt (SM-2 går via localStorage, ej API)
    if (/repeter|flashcard|minnesträning|flashkort/i.test(q)) {
      setMeddelanden((p) => [...p, { fran: "du", text: q }]);
      startaSR(/alla|blanda/i.test(q));
      return;
    }

    setMeddelanden((p) => [...p, { fran: "du", text: q }]);

    // ── AI-MENTORN 2.0 (våg 106 H2): LOKALT SVAR FÖRE NÄTANROP ──────────────
    // Regel+datamotorn (tjugoett lager: bas + tjugo syskonfiler) svarar på de
    // vanligaste nybörjarfrågorna deterministiskt utan API-kostnad: 74 för-
    // handsfrågors monsters + generiskt V01–V20-uppslag, alla källmärkta
    // (våg 176: siffran vakas av verktyg/testa-ai-mentor-kedja.mjs fall H —
    // uppdatera den medvetet när ett lager växer). Matchar den inte (null)
    // fortsätter flödet nedan till /api/chatbot precis som förr.
    const lokalt = svaraLokaltMakro(q, KURSREGISTER) ?? svaraLokaltExtra(q, KURSREGISTER) ?? svaraLokalt(q, KURSREGISTER) ?? svaraLokaltNasta(q, KURSREGISTER) ?? svaraLokaltKapitalmekanik(q, KURSREGISTER) ?? svaraLokaltSektor(q, KURSREGISTER) ?? svaraLokaltCase(q, KURSREGISTER) ?? svaraLokaltPraktik(q, KURSREGISTER) ?? svaraLokaltPortfoljgrund(q, KURSREGISTER) ?? svaraLokaltAgande(q, KURSREGISTER) ?? svaraLokaltRedovisningsdjup(q, KURSREGISTER) ?? svaraLokaltDjup(q, KURSREGISTER) ?? svaraLokaltHistoria(q, KURSREGISTER) ?? svaraLokaltLonsamhetsdjup(q, KURSREGISTER) ?? svaraLokaltTsdjup(q, KURSREGISTER) ?? svaraLokaltSkattedjup(q, KURSREGISTER) ?? svaraLokaltBeteendedjup(q, KURSREGISTER) ?? svaraLokaltRiskdjup(q, KURSREGISTER) ?? svaraLokaltRiskmattsdjup(q, KURSREGISTER) ?? svaraLokaltUtdelningsdjup(q, KURSREGISTER) ?? svaraLokaltForvantningsdjup(q, KURSREGISTER) ?? svaraLokaltPortfoljbalans(q, KURSREGISTER) ?? svaraLokaltStabilitetsdjup(q, KURSREGISTER) ?? svaraLokaltGrahamgolv(q, KURSREGISTER) ?? svaraLokaltVarderjustering(q, KURSREGISTER) ?? svaraLokaltOptionsdjup(q, KURSREGISTER) ?? svaraLokaltRisklasningsdjup(q, KURSREGISTER) ?? svaraLokaltAvkastningskurva(q, KURSREGISTER) ?? svaraLokaltAvkastningsdjup(q, KURSREGISTER) ?? svaraLokaltVarderingsverktyg(q, KURSREGISTER);
    if (lokalt) {
      setSenasteAmne(lokalt.amne); // ämnet följer med som kontext för följdfrågor
      sparaChatTur(
        "mentor",
        lokalt.motfraga
          ? `${lokalt.text}\n\n💬 Motfråga (${lokalt.motfraga.kategori}): ${lokalt.motfraga.text}`
          : lokalt.text
      );
      setMeddelanden((p) => [...p, {
        fran: "ai",
        text: lokalt.text,
        handlings: lokalt.handlings,
        motfraga: lokalt.motfraga,
        fordjupa: lokalt.fordjupa,
      }]);
      return; // 0 API-kostnad — nådde aldrig nätverket
    }

    setBusy(true);

    // ── MENTOR 2.1 (våg 159): modellsvar för INLOGGADE medlemmar ─────────────
    // Kostnadssäker väg: rutten vaktar medlemskap (httpOnly-kakan verifieras
    // server-side), 10 frågor/dag och token-tak — widgeten anropar den bara
    // när eleven är inloggad OCH regel-motorn inte kunde svara. Alla fel ⇒
    // fall igenom till regel-motorn (/api/chatbot): eleven får alltid svar.
    if (ctx.inloggad) {
      try {
        const mRes = await fetch("/api/mentor/fraga", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fraga: q, kontext: senasteAmne ?? undefined }),
        });
        if (mRes.ok) {
          const mData = await mRes.json();
          const modellSvar = mData.svar as
            | {
                text: string;
                amne?: string;
                handlings?: Handling[];
                motfraga?: MotfragaChip;
                fordjupa?: Fordjupa;
              }
            | undefined;
          if (modellSvar && typeof modellSvar.text === "string" && modellSvar.text.trim()) {
            if (typeof modellSvar.amne === "string" && modellSvar.amne) setSenasteAmne(modellSvar.amne);
            sparaChatTur(
              "mentor",
              modellSvar.motfraga
                ? `${modellSvar.text}\n\n💬 Motfråga (${modellSvar.motfraga.kategori}): ${modellSvar.motfraga.text}`
                : modellSvar.text
            );
            setMeddelanden((p) => [...p, {
              fran: "ai",
              text: modellSvar.text,
              handlings: modellSvar.handlings,
              motfraga: modellSvar.motfraga,
              fordjupa: modellSvar.fordjupa,
              kalla: typeof mData.kalla === "string" ? mData.kalla : "AI-Mentorn modell",
              kvarvarande: typeof mData.kvarvarande === "number" ? mData.kvarvarande : undefined,
            }]);
            setBusy(false); // chattbot-flödets finally nås aldrig vid tidigt return
            return; // modellsvar levererat — etiketterat i bubblan nedan
          }
        } else if (mRes.status === 429) {
          // Dagens 10 modellfrågor är använda — ärlig info, sedan svarar
          // regel-motorn nedan (källmärkt, 0 kr) precis som vanligt.
          setMeddelanden((p) => [...p, {
            fran: "ai",
            ikon: "🎫",
            text: "Dagens 10 modellfrågor är använda. Mentorn svarar fortsatt ur det pedagogiska biblioteket nedan — och imorgon fylls modellkvoten på nytt.",
          }]);
        }
        // 401 (sessionen utgått), 503 (modellen otillgänglig) eller oväntad
        // form: tyst fall igenom — regel-motorn tar frågan.
      } catch {
        // Nätverksfel mot modellrutterna ⇒ regel-motorn nedan
      }
    }

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fraga: q,
          sokvag: pathname,
          historik: senasteHistorik(HISTORIK_FONSTER),
          kontext: senasteAmne ?? undefined, // senaste ämnet → följdfrågor
          niva: ctx.niva || undefined,       // nivå → "nästa steg" blir personligt
        }),
      });
      const data = await res.json();

      const mentorText: string = data.svar || "…";
      const motfraga = data.motfraga as MotfragaChip | undefined;
      const fordjupa = data.fordjupa as Fordjupa | undefined;

      // Ämnet i svaret blir nästa frågas kontext ("och P/E?" förstås rätt)
      if (typeof data.amne === "string" && data.amne) setSenasteAmne(data.amne);

      // Mentorns svar sparas i djupet — med motfråge-markören ("💬 Motfråga (…)")
      // som serversidan läser för bakåtreferenser och rotationslogiken
      sparaChatTur(
        "mentor",
        motfraga ? `${mentorText}\n\n💬 Motfråga (${motfraga.kategori}): ${motfraga.text}` : mentorText
      );

      // Klarande motfråga (redigering) → visa alltid som dialog, navigera aldrig
      const arKlarande = data.typ === "klarande";
      const endaLank = data.handlings?.length === 1 ? data.handlings[0].lank : null;
      const farNavigera =
        !arKlarande &&
        endaLank !== null &&
        !endaLank.startsWith("#") &&
        !endaLank.startsWith("fragor:");

      if (farNavigera && endaLank) {
        // Ett enda alternativ = navigera automatiskt
        setMeddelanden((p) => [...p, {
          fran: "ai",
          text: mentorText,
          handlings: data.handlings,
          motfraga,
          fordjupa,
        }]);
        setTimeout(() => router.push(endaLank), 800);
      } else {
        setMeddelanden((p) => [...p, {
          fran: "ai",
          text: mentorText,
          handlings: data.handlings,
          ikon: arKlarande ? "🧭" : undefined,
          motfraga,
          fordjupa,
        }]);
      }
    } catch {
      // AI-MENTORN 2.0 (våg 106 H2): nätverksfel → ärlig lokal fallback i
      // stället för en död feltext — "det vet mentorn inte än" + de tre
      // närmaste kurserna ur registret (deterministiskt, fortfarande 0 API)
      const fb = fallbackSvar(q, KURSREGISTER);
      sparaChatTur("mentor", fb.text);
      setMeddelanden((p) => [...p, {
        fran: "ai",
        ikon: "🛟",
        text: fb.text,
        handlings: fb.handlings,
        motfraga: fb.motfraga,
        fordjupa: fb.fordjupa,
      }]);
    } finally {
      setBusy(false);
    }
  };

  // Snabbkommandon
  const snabbKommandon = [
    { text: "Börja lära", ikon: "🌱", fraga: "jag vill börja lära mig aktieanalys" },
    { text: "Räkna", ikon: "🧮", fraga: "kalkylator" },
    { text: "Portfölj", ikon: "💼", fraga: "portfölj" },
    { text: "Testa mig", ikon: "🧠", fraga: "testa min nivå" },
    { text: "Repetera", ikon: "🃏", fraga: "repetera" },
    { text: "Vågkarta", ikon: "🌊", fraga: "vad säger vågkartan?" },
    { text: "Nästa steg", ikon: "➡️", fraga: "vad är nästa steg för mig" },
  ];

  if (pathname?.startsWith("/admin")) return null;

  // Swipe-ner-stäng (mobil): >80 px nedåt på paneltoppen stänger panelen
  const tryckStart = (e: TouchEvent<HTMLElement>) => {
    tryckY.current = e.touches[0].clientY;
  };
  const tryckSlut = (e: TouchEvent<HTMLElement>) => {
    if (tryckY.current !== null) {
      const dy = e.changedTouches[0].clientY - tryckY.current;
      if (dy > 80) setOppnad(false);
    }
    tryckY.current = null;
  };

  /**
   * Mjukscroll till sektion — med smarta fallbacks när ankaret saknas på den
   * aktuella sidan: #quiz → första kapitelquiz:et (data-chat-anker), #guide →
   * kalkylatorns rapportguide-flik (klickas fram och scrollas till), #djup →
   * portföljens djupanalys. Finns målet inte på sidan alls navigeras eleven
   * till rätt sida — en handlingsknapp ska aldrig vara död.
   */
  const gaTillAnkare = (lank: string) => {
    const sektion = document.querySelector(lank);
    if (sektion) {
      sektion.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (lank === "#quiz") {
      const quiz = document.querySelector('[data-chat-anker="quiz"]');
      if (quiz) {
        quiz.scrollIntoView({ behavior: "smooth" });
        return;
      }
      router.push("/kurser"); // quiz:et lever i kurserna
      return;
    }
    if (lank === "#guide") {
      const flik = document.querySelector('[data-chat-anker="guide"]') as HTMLElement | null;
      if (flik) {
        flik.click(); // aktiverar rapportguide-fliken (Radix-tab)
        flik.scrollIntoView({ behavior: "smooth" });
        return;
      }
      router.push("/kalkylator");
      return;
    }
    if (lank === "#djup") {
      router.push("/min-portfolj");
      return;
    }
    // Okänt ankare utan mål på sidan: stanna kvar (aldrig död navigation)
  };

  return (
    <>
      {/* Chatt-panel — mobil: fullbredd bottom-sheet över safe-area; desktop: oförändrad hög låda */}
      {oppnad && (
        <div className="fixed inset-x-2 bottom-[calc(0.5rem_+_env(safe-area-inset-bottom))] z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border-2 border-gold bg-paper shadow-2xl sm:bottom-20 sm:left-auto sm:right-4 sm:h-[520px] sm:max-h-none sm:w-[380px] sm:max-w-[calc(100vw-2rem)]">
          {/* Paneltopp — marin med serif-rubrik, guldchips och guld-divider (swipe-ner stänger på mobil) */}
          <div
            className="bg-[#0E1B2E] px-4 py-3"
            onTouchStart={tryckStart}
            onTouchEnd={tryckSlut}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-gold">AI-Mentor</span>
                <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                  Nivå {ctx.niva} · {ctx.xp} XP
                </span>
                {hydrerad && lasStreak().antal > 0 && (
                  <span
                    className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold"
                    title={`Daglig kedja: ${lasStreak().antal} dag${lasStreak().antal > 1 ? "ar" : ""} (bästa: ${lasStreak().basta})`}
                  >
                    🔥 {lasStreak().antal}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gold/70">{SID_NAMN[ctx.sidTyp]}</span>
                {hydrerad && srForfallna > 0 && (
                  <button
                    onClick={() => startaSR()}
                    className="rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold hover:bg-gold/25"
                    title={`${srForfallna} flashcards förfallna — repetera nu`}
                  >
                    🃏 {srForfallna} förfallna
                  </button>
                )}
                <button
                  onClick={() => setOppnad(false)}
                  aria-label="Stäng AI-mentorn"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-lg font-bold leading-none text-gold transition-colors hover:bg-gold/20"
                >
                  ×
                </button>
              </div>
            </div>
            {/* Guld-divider under paneltoppen */}
            <div className="mt-2.5 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden="true" />

            {/* Minnesindikator — mentorn minns tidigare frågor (i djupet) + rensa-knapp */}
            {hydrerad && minneAntal > 0 && (
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] text-gold/70" title="Konversationsminnet sparas lokalt i din webbläsare — de senaste turerna styr mentorns bakåtreferenser och motfrågor">
                  🧠 Mentorn minns {minneAntal} av dina frågor
                </span>
                <button
                  onClick={() => {
                    if (window.confirm(`Radera mentorns minne (${minneAntal} frågor)? Kan inte ångras.`)) {
                      rensaChatMinne();
                      setMinneAntal(0);
                      setSenasteAmne(null); // sammanhanget rensas med minnet
                      setMeddelanden((p) => [...p, {
                        fran: "ai",
                        ikon: "🧠",
                        text: "Minnet är rensat — vi börjar från ett rent blad. Vad vill du utforska nu?",
                      }]);
                    }
                  }}
                  className="shrink-0 text-[10px] font-bold text-gold/80 underline underline-offset-2 transition-colors hover:text-gold"
                >
                  Rensa
                </button>
              </div>
            )}
          </div>

          {/* Snabbkommandon — horisontellt skjutbara på mobil */}
          <div className="flex gap-1 overflow-x-auto border-b border-gold/20 bg-gold/5 px-2 py-2">
            {snabbKommandon.map((k) => (
              <button
                key={k.text}
                onClick={() => skicka(k.fraga)}
                className="shrink-0 rounded-lg border border-gold/20 bg-paper px-2 py-1.5 text-[10px] font-medium hover:border-gold/50 hover:bg-gold/10"
              >
                {k.ikon} {k.text}
              </button>
            ))}
          </div>

          {/* Meddelanden */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">

            {/* ── SPACED REPETITION-session ── */}
            {srAktiv && srKo[srIndex] && (
              <div className="rounded-xl border-2 border-gold/40 bg-card p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                    🃏 {srKo[srIndex].kategori}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Kort {srIndex + 1}/{srKo.length} · +5 XP per bra svar
                  </span>
                </div>
                <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-gold/10">
                  <div
                    className="h-full bg-gold transition-all"
                    style={{ width: `${((srIndex) / srKo.length) * 100}%` }}
                  />
                </div>

                {/* Framsidan — alltid synlig */}
                <div className="rounded-lg border border-gold/20 bg-paper/60 px-3 py-3 text-center">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">FRÅGA</div>
                  <div className="mt-1 text-sm font-semibold leading-snug text-foreground">
                    {srKo[srIndex].framsida}
                  </div>
                </div>

                {/* Baksidan — visas efter vändning */}
                {srVisaSvar ? (
                  <div className="mt-2 rounded-lg border border-bull/30 bg-bull/5 px-3 py-3 text-center">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">SVAR</div>
                    <div className="mt-1 text-xs leading-relaxed text-foreground/90">
                      {srKo[srIndex].baksida}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSrVisaSvar(true)}
                    className="mt-2 w-full rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 text-xs font-bold text-gold hover:bg-gold/20"
                  >
                    🔄 Vänd kortet — tänk först, kolla sen
                  </button>
                )}

                {/* Betygsättning — först när svaret är vant */}
                {srVisaSvar && (
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => bedom(2)}
                      className="rounded-lg border border-bear/40 bg-bear/5 px-1 py-2 text-[11px] font-semibold text-bear hover:bg-bear/15"
                      title="Kommer igen imorgon (SM-2 nollställer intervallet)"
                    >
                      🔁 Svår
                    </button>
                    <button
                      onClick={() => bedom(4)}
                      className="rounded-lg border border-gold/40 bg-gold/10 px-1 py-2 text-[11px] font-semibold text-gold hover:bg-gold/20"
                      title="Rätt — intervallet växer"
                    >
                      ✅ Bra
                    </button>
                    <button
                      onClick={() => bedom(5)}
                      className="rounded-lg border border-bull/40 bg-bull/5 px-1 py-2 text-[11px] font-semibold text-bull hover:bg-bull/15"
                      title="Satt direkt — långt intervall"
                    >
                      ⚡ Lätt
                    </button>
                  </div>
                )}

                <button
                  onClick={() => { setSrAktiv(false); setSrKo([]); }}
                  className="mt-2 w-full text-[10px] text-muted-foreground underline-offset-2 hover:underline"
                >
                  Avsluta repetitionen
                </button>
              </div>
            )}

            {meddelanden.map((m, i) => (
              <div key={i}>
                {m.ikon && <div className="mb-1 text-sm">{m.ikon}</div>}
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                    m.fran === "du"
                      ? "ml-auto bg-gold text-primary-foreground"
                      : "bg-card text-foreground/90 border border-gold/20"
                  }`}
                >
                  {m.text}
                </div>
                {/* Källmärke (mentor 2.1) — modellsvar ska vara TYDLIGT
                    etiketterade + pedagogisk disclaimer (lagen 2007:528). */}
                {m.kalla && (
                  <div className="mt-1.5 flex max-w-[85%] flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
                      🤖 {m.kalla}
                      {typeof m.kvarvarande === "number" ? ` · ${m.kvarvarande} frågor kvar idag` : ""}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      pedagogisk utbildning — inte investeringsråd
                    </span>
                  </div>
                )}
                {/* Mentorns motfråga — klickbart snabbföljd-chip (skickas som ny fråga) */}
                {m.motfraga && (
                  <button
                    onClick={() => skicka(m.motfraga!.text)}
                    title={`Motfråga (${m.motfraga.kategori}) — klicka för att svara mentorn`}
                    className="mt-1.5 flex max-w-[85%] items-start gap-2 rounded-xl border border-dashed border-gold/50 bg-gold/10 px-3 py-2 text-left text-xs text-gold transition-colors hover:bg-gold/20"
                  >
                    <span className="shrink-0">💬</span>
                    <span className="min-w-0 flex-1">{m.motfraga.text}</span>
                    <span className="shrink-0 text-gold/40" aria-hidden="true">↺</span>
                  </button>
                )}
                {/* Fördjupa-knapp — öppnar mest relevant kurs/verktyg för svaret */}
                {m.fordjupa && (
                  <button
                    onClick={() => router.push(m.fordjupa!.lank)}
                    className="mt-1.5 flex max-w-[85%] items-center gap-2 rounded-xl border border-gold/30 bg-paper px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:border-gold/60"
                  >
                    <span aria-hidden="true">🔎</span>
                    <span className="min-w-0 flex-1 truncate">Fördjupa: {m.fordjupa.text}</span>
                    <span className="text-gold/40" aria-hidden="true">→</span>
                  </button>
                )}
                {/* Handlingsknappar — svarsalternativ (fragor:) skickas som ny fråga */}
                {m.handlings && m.handlings.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {m.handlings.map((h, j) => (
                      <button
                        key={j}
                        onClick={() => {
                          if (h.lank.startsWith("fragor:")) {
                            // Redigering: alternativet skickas som ny fråga till mentorn
                            skicka(decodeURIComponent(h.lank.slice("fragor:".length)));
                          } else if (h.lank === "sr:alla") {
                            startaSR(true);
                          } else if (h.lank === "#") {
                            // Konvention: "#" = starta spaced repetition i chatten
                            startaSR();
                          } else if (h.lank.startsWith("#")) {
                            // Scroll till sektion på samma sida (med fallbacks)
                            gaTillAnkare(h.lank);
                          } else {
                            router.push(h.lank);
                          }
                        }}
                        className="flex w-full items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2.5 text-left text-xs font-semibold text-gold transition-all hover:border-gold/60 hover:bg-gold/15"
                      >
                        <span className="text-base">{h.ikon}</span>
                        <div className="min-w-0 flex-1">
                          <div>{h.text}</div>
                          {h.beskrivning && (
                            <div className="text-[10px] font-normal text-muted-foreground">{h.beskrivning}</div>
                          )}
                        </div>
                        <span className="text-gold/40">{h.lank.startsWith("fragor:") ? "↺" : "→"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing-indicator — tre pulserande guldprickar medan svaret laddas */}
            {busy && (
              <div className="flex w-fit items-center gap-1.5 rounded-xl border border-gold/20 bg-card px-3 py-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-gold [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-gold [animation-delay:300ms]" />
                <span className="ml-1 text-[10px] text-muted-foreground">Mentorn analyserar…</span>
              </div>
            )}
          </div>

          {/* Input — Enter skickar (Shift+Enter gör inget) */}
          <div className="flex gap-2 border-t border-gold/20 p-2">
            <input
              value={fragor}
              onChange={(e) => setFraga(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  skicka();
                }
              }}
              placeholder="Fråga mig vad som helst…"
              className="flex-1 rounded-lg border border-gold/30 bg-card px-3 py-2.5 text-xs outline-none focus:border-gold"
            />
            <button
              onClick={() => skicka()}
              disabled={busy}
              className="rounded-lg bg-gold px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50"
            >
              Skicka
            </button>
          </div>
        </div>
      )}

      {/* Trigger-knapp — nedre hörnet med safe-area (Short-Seller staplas ovanpå med gap-3), marin-guldidentitet.
          Mobil: h-10 w-10 (mindre fotavtryck — täcker ej kortens →-pilar); desktop: h-14 w-14.
          VÅG 108: DÖLJS på /studio — där ÄR chatten (kundens "bubblor stör mig"). */}
      {!widgetPathname.startsWith("/studio") && (
        <button
          onClick={() => setOppnad(!oppnad)}
          className="fixed bottom-[calc(1rem_+_env(safe-area-inset-bottom))] right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gold bg-[#0E1B2E] text-xl text-gold shadow-xl transition-transform hover:scale-105 max-md:h-[52px] max-md:w-[52px] sm:h-14 sm:w-14 sm:text-2xl"
          aria-label="AI-Mentor"
          title="AI-Mentor — din personliga guide"
        >
          {oppnad ? "×" : "💬"}
        </button>
      )}
    </>
  );
}
