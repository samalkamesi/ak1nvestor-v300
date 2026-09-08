import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { kr, ORG_NR_LANG, ORG_NR_KORT } from "@/lib/variabler";
import { lasPriserGallande } from "@/lib/variabler-lagring";
import { SeoPageShell } from "@/components/ak1a/seo-page-shell";

// VÅG 79 (admin-mega steg 1): pristalen i villkorstexten läses live via
// lasPriserGallande() (Supabase-override, filen = fallback) — villkoren ska
// alltid ange samma pris som köp-ytorna. ISR: ändring syns ≤ 300 s.
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  path: "/villkor",
  title: "Användarvillkor — avtal, rättigheter och ångerrätt | AK1A",
  description:
    "AK1A Research Labs användarvillkor: avtalsslut, konton, rättigheter per fas, betalning, 90 dagars nöjd-kund-garanti (betalning först efter 90 dagar om du förblir nöjd), 14 dagars ångerrätt vid digital leverans, hävningsrätt vid överträdelser, immaterialrätt, ansvarsbegränsning och tvistlösning enligt svensk rätt — samt en särskild PRO-sektion med B2B-villkor för AK1A PRO (verktygsleverantör till reglerade rådgivare, priser exkl. moms, svensk avtalsrätt, DPA enligt GDPR art 28).",
  keywords: [
    "användarvillkor",
    "köpvillkor",
    "ångerrätt",
    "nöjd-kund-garanti",
    "hävningsrätt",
    "medlemsvillkor",
    "AK1A Research Lab",
    "finansutbildning",
    "B2B-villkor",
    "AK1A PRO",
    "företagsvillkor",
    "personuppgiftsbiträdesavtal",
  ],
});

/** Blocktyper: stycke (p), punktlista (ul) eller framhävd ruta (box). */
type Block = { p: React.ReactNode } | { ul: React.ReactNode[] } | { box: React.ReactNode };

export default async function VillkorPage() {
  // Pris-talen live ur variabellagret (kastar aldrig — filen är fallback).
  const PRISER = await lasPriserGallande();
  const lank = (href: string, text: string) => (
    <Link href={href} className="underline hover:text-foreground">
      {text}
    </Link>
  );

  const sektion = (rubrik: string, blocks: Block[]) => (
    <section className="mt-8" id={`sektion-${rubrik.split(".")[0]}`}>
      <h2 className="font-serif text-2xl font-bold">{rubrik}</h2>
      {blocks.map((block, i) => {
        if ("p" in block) {
          return (
            <p key={i} className="mt-3 leading-relaxed text-muted-foreground">
              {block.p}
            </p>
          );
        }
        if ("ul" in block) {
          return (
            <ul key={i} className="mt-3 space-y-2 leading-relaxed text-muted-foreground">
              {block.ul.map((li, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-gold" aria-hidden="true">
                    ·
                  </span>
                  <span>{li}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <div key={i} className="mt-4 rounded-lg border border-gold/30 bg-card p-4">
            <div className="leading-relaxed text-muted-foreground">{block.box}</div>
          </div>
        );
      })}
    </section>
  );

  return (
    <SeoPageShell breadcrumb={[{ name: "Användarvillkor" }]}>
      <h1 className="font-serif text-4xl font-bold">Användarvillkor</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fastställda 2026-09-01 · gäller lab.ak1nvestor.com · AK1A Research Lab
      </p>

      <p className="mt-6 leading-relaxed text-muted-foreground">
        Dessa användarvillkor (&quot;Villkoren&quot;) reglerar din användning av AK1A
        Research Lab — utbildningsplattformen på lab.ak1nvestor.com
        (&quot;Plattformen&quot;) — som tillhandahålls av AK1A
        Research Lab{ORG_NR_LANG}, med kontakt via
        info@ak1nvestor.com (&quot;AK1A&quot;, &quot;vi&quot;). Villkoren utgör ett
        bindande avtal mellan dig (&quot;Kunden&quot;, &quot;du&quot;) och AK1A. Läs
        dem noga innan du registrerar konto eller genomför ett köp.
      </p>

      <div className="mt-4 rounded-lg border border-gold/30 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Snabbfakta.</strong> Utgivare: AK1A
        Research Lab{ORG_NR_KORT} · Kontakt:
        info@ak1nvestor.com · Fas 1: kostnadsfritt · Fas 2:{" "}
        {kr(PRISER.fas2EnGang)} kr inkl. moms
        (12 månader) · Fas 3: {kr(PRISER.fas3EnGang)} kr inkl. moms (12 månader) · 90 dagars
        nöjd-kund-garanti på Fas 2 och Fas 3: betalning sker först efter 90
        dagar — och endast om du förblir nöjd (se sektion 5 och 6) · Ångerrätt:
        14 dagar enligt lagen (2005:59) om distansavtal och avtal utanför
        affärslokaler, med undantag vid påbörjad digital leverans med
        uttryckligt samtycke (se sektion 6) · Tillämplig lag: svensk ·{" "}
        <strong className="text-foreground">AK1A PRO (företag):</strong> särskilda
        B2B-villkor i PRO-sektionen (P1–P9) längst ner på sidan — priser exkl.
        moms, svensk avtalsrätt; konsumentreglerna i denna ruta gäller inte
        avtal mellan näringsidkare.
      </div>

      {sektion("1. Inledning och avtalsslut", [
        {
          p: (
            <>
              Villkoren gäller alla som använder Plattformen: besökare utan konto,
              registrerade medlemmar i den kostnadsfria Fas 1 samt betalande kunder
              i Fas 2 och Fas 3. Villkoren gäller tillsammans med de dokument som
              uttryckligen hänvisas till i dem — främst {lank("/finansiell-policy", "Finansiell policy")},{" "}
              {lank("/upphovsratt", "AK1A:s upphovsrättspolicy")} och{" "}
              {lank("/privacy-policy", "Integritetspolicyn")} — vilka utgör delar av
              avtalet i respektive avseende. Vid motsägelse går tvingande
              lagstiftning först, därefter särskilda villkor som lämnats vid
              enskilt köp, och därefter dessa Villkor.
            </>
          ),
        },
        {
          p: (
            <>
              Avtal sluts enligt svensk avtalsrätt genom anbud och antagande, se
              avtalslagen (1915:218). För AK1A gäller i korthet: (i){" "}
              <strong className="text-foreground">Registrering av konto</strong> —
              ett avtal om kostnadsfritt medlemskap (Fas 1) sluts när du
              fullföljt registreringen och den bekräftats, normalt genom en
              verifiering eller välkomstbekräftelse till angiven e-postadress.
              (ii) <strong className="text-foreground">Köp av Fas 2 eller Fas 3</strong>{" "}
              — köpavtalet sluts när du antagit AK1A:s erbjudande och AK1A skickat
              en orderbekräftelse till din e-postadress. Orderbekräftelsen innehåller
              uppgifter om pris inklusive moms, åtkomstperiodens längd, sättet på
              vilket det digitala innehållet tillhandahålls, hur betalningen sker
              enligt den 90 dagars långa nöjd-kund-garantin (se sektion 5) och en
              hänvisning till dessa Villkor. Åtkomsten aktiveras därefter omgående;
              betalning erläggs först när garantiperioden löpt ut och du förblivit
              nöjd, om inte annat följer av sektion 5.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">Version och ändringar.</strong>{" "}
              Denna version av Villkoren är fastställd den 1 september 2026.
              AK1A har rätt att uppdatera Villkoren, exempelvis vid lagändringar,
              nya tjänster eller förändrade priser. Väsentliga ändringar meddelas
              medlemmar per e-post minst 30 dagar innan de träder i kraft, och
              gällande version publiceras alltid med datum på denna sida. Om du
              inte accepterar en väsentlig ändring har du rätt att avsluta
              avtalet med omedelbar verkan och att få återbetalning för den del
              av en köpt period som inte hunnit tillhandahållas. Fortsätter du
              att använda Plattformen efter att en ändring trätt i kraft anses
              du ha accepterat den nya versionen.
            </>
          ),
        },
      ])}

      {sektion("2. Tjänsten — vad AK1A är och inte är", [
        {
          p: (
            <>
              AK1A Research Lab är en{" "}
              <strong className="text-foreground">pedagogisk utbildningsplattform</strong>{" "}
              i finans. Plattformen innehåller kurser i fundamentalanalys och
              teknisk analys, quiz och övningar, nivåer och XP från 1 till 100,
              certifikat, kalkylatorer, deterministiska analysmotorer samt
              praktikcase från verkligheten. Syftet är ett enda: att lära ut
              metodik, disciplin och kritiskt tänkande — så att du själv kan
              analysera och granska.
            </>
          ),
        },
        {
          p: (
            <>
              AK1A är{" "}
              <strong className="text-foreground">inte investeringsrådgivare</strong>{" "}
              och är inte det i någon del av tjänsten. Vi lämnar aldrig
              personliga investeringsråd eller rekommendationer om köp eller
              försäljning av finansiella instrument, bedriver ingen
              kapitalförvaltning och mottar inga uppdrag av det slag som omfattas
              av lagen (2007:528) om värdepappersmarknaden eller
              marknadsmissbruksförordningen (EU) nr 596/2014 (MAR). Allt material
              — kurser, exempel, analyser och verktygsutdata — är undervisningsmaterial
              med pedagogiska syften, inte råd anpassade till dig eller någon annan.
              Detta beskrivs utförligt i {lank("/finansiell-policy", "Finansiell policy")}.
            </>
          ),
        },
        {
          p: (
            <>
              Ingenting i tjänsten utgör en uppmaning att investera eller en
              inbjudan att ingå något finansiellt avtal. Alla beslut om
              sparande, köp eller försäljning fattas av dig själv, på egen risk
              och på eget ansvar. Kursinnehåll som berör bolag, branscher eller
              historiska händelser används uteslutande för att belysa metodik.
            </>
          ),
        },
      ])}

      {sektion("3. Konto och medlemskap", [
        {
          p: (
            <>
              För att bli medlem och spara din studieprogress krävs endast en
              e-postadress. Genom att registrera dig lovar du att iaktta följande
              regler om kontot:
            </>
          ),
        },
        {
          ul: [
            <>
              <strong className="text-foreground">Sanningsenliga uppgifter.</strong>{" "}
              Du uppger korrekt och komplett information vid registreringen —
              framför allt en fungerande e-postadress som du har tillgång till —
              och håller uppgifterna uppdaterade. Orderbekräftelser, varsel om
              villkorsändringar och beslut enligt sektion 8 skickas till denna
              adress.
            </>,
            <>
              <strong className="text-foreground">Egen säkerhet.</strong> Du väljer
              ett starkt lösenord, håller det hemligt, loggar ut vid delad
              dator och meddelar info@ak1nvestor.com omedelbart om du misstänker
              att någon annan fått tillgång till ditt konto. Du ansvarar för all
              aktivitet som sker under ditt konto, om du inte själv vållat
              intrånget genom att försumma din aktsamhet.
            </>,
            <>
              <strong className="text-foreground">Ett konto per person.</strong>{" "}
              Kontot är personligt och får inte överlåtas, säljas, pantsättas
              eller användas av flera personer gemensamt. Delning av
              inloggning är ett avtalsbrott (se sektion 4 och 8).
            </>,
            <>
              <strong className="text-foreground">Ålder.</strong> Medlemskap förutsätter
              att du har fyllt 18 år. Har du inte fyllt 18 krävs ditt
              målsmans (vårdnadshavares) godkännande enligt föräldrabalken
              (1949:381); AK1A kan begära att målsman bekräftar godkännandet.
            </>,
          ],
        },
        {
          p: (
            <>
              AK1A kan begränsa eller stänga konton som sköts illojalt eller i
              strid med dessa Villkor — omfattningen och processen för detta
              framgår av sektion 8.
            </>
          ),
        },
      ])}

      {sektion("4. Kundens rättigheter — vad som ingår per fas", [
        {
          p: (
            <>
              Åtkomsten till Plattformen är uppdelad i faser. Vad som ingår i
              respektive fas beskrivs vid köptillfället och på{" "}
              {lank("/medlemskap", "medlemskapssidan")}; vid eventuell avvikelse
              mellan beskrivningar gäller det som angavs vid ditt köp. Din
              användningsrätt är i alla faser personlig och för eget lärande.
            </>
          ),
        },
        {
          ul: [
            <>
              <strong className="text-foreground">Fas 1 — kostnadsfritt, för alltid.</strong>{" "}
              Alla grundläggande kurser — AKM1-metodikens variabler (V01–V20) och
              de grundläggande BOKMASTER-böckerna, kapitel för kapitel — samt
              quiz, XP och nivåer 1–100, certifikat, grundläggande verktyg
              (bland annat AI-Mentorn, AKM1-kalkylatorn, portföljsystemet och
              flashcards) samt aktieanalyser och case studies i labbet.
            </>,
            <>
              <strong className="text-foreground">Fas 2 — {kr(PRISER.fas2EnGang)} kr.</strong> Den
              fundamentala vägen till oberoende analytiker: de 18 fundamentala
              mästarverks-kurserna (värdering, bokslutsanalys, redovisning,
              företagsfinans och värdeinvesteringens mästarverk) där de 20
              analytiska indikatorerna (V01–V20) lär ut att analyseras — och
              sammanvägas mot varandra — på rätt sätt, samt
              representantprogrammet — chansen att få representera AK1nvestor —
              enligt beskrivningen på {lank("/medlemskap", "medlemskapssidan")}.
              Ingen teknisk analys-utbildning och inga vågor i Fas 2 (endast
              grundläggande kunskap om teknisk analys som orientering); det
              dynamiska ekosystemet ingår i Fas 3. Fas 2 låses upp först vid
              nivå 25 och kräver godkänd ansökan.
            </>,
            <>
              <strong className="text-foreground">Fas 3 — {kr(PRISER.fas3EnGang)} kr.</strong> Allt i
              Fas 2 samt det dynamiska ekosystemet: de 24 ekosystem- och
              fördjupningskurserna (AKM1 × AK1TS-integrationen, Vågfundamentet,
              Konfluensradarn och Portföljens vågor), teknisk analys på
              mästarnivå och trading psykologi — samt dashboarden med AI-koppling
              och rapporter, och rätt till alla framtida utvecklingar enligt
              beskrivningen på {lank("/fas3", "Fas 3-sidan")}.
            </>,
          ],
        },
        {
          p: (
            <>
              <strong className="text-foreground">Vad kunden inte får.</strong>{" "}
              Oavsett fas gäller följande förbud. De skyddar innehållets
              upphovsrätt (se sektion 9 och {lank("/upphovsratt", "upphovsrättspolicyn")})
              samt övriga medlemmars och verksamhetens intressen:
            </>
          ),
        },
        {
          ul: [
            <>
              Systematiskt ladda ner, kopiera eller cachelagra innehåll i
              massutsträckning (massnedladdning) utöver den tekniska lagring
              som krävs för att använda Plattformen på normalt sätt.
            </>,
            <>
              Skrapa, indexera eller på annat sätt extrahera innehåll eller data
              med automatiserade verktyg, robotar, skript eller artificiell
              intelligens utan AK1A:s skriftliga tillstånd i förväg.
            </>,
            <>
              Dela inloggningsuppgifter eller på annat sätt låta någon annan
              använda ditt konto eller din köpta åtkomst.
            </>,
            <>
              Sälja, återförsälja, licensiera ut, hyra ut eller på annat sätt
              överlåta åtkomst mot betalning eller annat vederlag.
            </>,
            <>
              Publicera, sprida, visa upp eller på annat sätt göra kursinnehåll,
              quiz, analyser, rapporter eller andra verk tillgängliga för
              allmänheten eller en begränsad krets, i strid med
              upphovsrättslagen (1960:729).
            </>,
            <>
              Använda materialet som underlag för rådgivning till tredje man —
              kommersiellt eller i förening med framtida investeringsbeslut —
              eller framställa AK1A:s innehåll som din egen analys.
            </>,
          ],
        },
        {
          p: (
            <>
              Certifikat, XP och nivåer är pedagogiska belöningar och intyg på
              genomförd utbildning — Fas 3-certifieringen är en pedagogisk
              kompetensprövning, ingen yrkeslegitimation. Certifikat som
              erhållits genom fusk kan återkallas.
            </>
          ),
        },
      ])}

      {sektion("5. Betalning, priser och förnyelse", [
        {
          ul: [
            <>
              <strong className="text-foreground">Priser.</strong> Alla priser anges i
              svenska kronor och inkluderar moms (25 procent): Fas 2 omfattar{" "}
              {kr(PRISER.fas2EnGang)} kr och Fas 3 omfattar{" "}
              {kr(PRISER.fas3EnGang)} kr. Fas 1 är kostnadsfri.
              Priset för en påbörjad köpt period ändras aldrig under periodens
              löptid.
            </>,
            <>
              <strong className="text-foreground">90 dagars nöjd-kund-garanti —
              betalning först efter 90 dagar.</strong>{" "}
              För Fas 2 och Fas 3 gäller AK1A:s nöjd-kund-garanti: under de
              första 90 dagarna (garantiperioden) från den dag åtkomsten
              aktiveras erläggs ingen betalning. Betalning sker först i
              samband med att garantiperioden löper ut (dag 90) — och endast om
              du förblivit nöjd inom ramen för garantiperioden. Meddelar du
              info@ak1nvestor.com senast på dag 90 att du inte är nöjd, blir
              inget belopp att betala och åtkomsten upphör vid garantiperiodens
              slut utan kostnad; har ett belopp trots allt erlagts i förskott
              (till exempel vid frivillig tidig betalning) återbetalas det inom
              30 dagar. Garantin är en frivillig förmån utöver lagen — den
              inskränker aldrig dina tvingande rättigheter som konsument,
              däribland ångerrätten enligt lagen (2005:59) (se sektion 6).
              Garantins kundvänliga lydelse presenteras på{" "}
              {lank("/medlemskap", "medlemskapssidan")}.
            </>,
            <>
              <strong className="text-foreground">Betalsätt.</strong> Betalning sker
              med kort via extern betaltjänstleverantör (Stripe); vid köp med
              nöjd-kund-garanti begärs betalningen först i samband med att
              garantiperioden löper ut, enligt punkten ovan. Kortuppgifter
              hanteras uteslutande av betalpartnern; AK1A lagrar aldrig
              kortnummer eller inloggningsuppgifter till kort.
            </>,
            <>
              <strong className="text-foreground">Period.</strong> Priset avser{" "}
              <strong className="text-foreground">12 månaders åtkomst</strong> från
              den dag åtkomsten aktiveras (för köp med nöjd-kund-garanti räknas
              garantiperiodens 90 dagar inom perioden; betalning enligt garantin
              ovan). Under perioden tillkommer nya kurser och förbättringar inom
              köpt fas utan extra kostnad.
            </>,
            <>
              <strong className="text-foreground">Fortsatt ekosystemnyttjande.</strong>{" "}
              Efter avslutad Fas 3-utbildning kan det analytiska ekosystemet och
              dashboarden fortsättas via månadsplan (12 månader) — villkor
              meddelas vid anmälan.
            </>,
            <>
              <strong className="text-foreground">Förnyelse.</strong> En period förnyas
              endast om du aktivt har valt förnyelse (opt-in). Innan en
              förnyelse skickas en påminnelse till din registrerade e-postadress
              senast 30 dagar i förväg, med pris, hur du avslutar samt hur du
              kontaktar oss. Prisändringar mellan perioder anges i påminnelsen.
            </>,
            <>
              <strong className="text-foreground">Dröjsmål och fel.</strong> Uteblir
              en förnyelsebetalning pausas den köpta åtkomsten tills betalning
              sker; ditt konto och det kostnadsfria Fas 1-innehållet påverkas
              inte. Har ett belopp dragits utan att åtkomsten aktiverats,
              återbetalas beloppet — kontakta info@ak1nvestor.com.
            </>,
          ],
        },
      ])}

      {sektion("6. Ångerrätt och digital leverans", [
        {
          p: (
            <>
              Som konsument har du i princip rätt att ånga ett distansköp inom 14
              dagar från det att avtalet ingicks, enligt 2 kap. 10 § lagen
              (2005:59) om distansavtal och avtal utanför affärslokaler.
              Rätten gäller även digitalt innehåll — men med ett väsentligt
              undantag som just gäller tjänster som din.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">Undantaget — påbörjad digital
              leverans.</strong>{" "}
              Fas 2 och Fas 3 är digitalt innehåll som levereras omedelbart och
              som du kan börja använda direkt. Enligt 2 kap. 11 § första stycket
              11 p. lagen (2005:59) finns ingen ångerrätt för digitalt innehåll
              som inte levereras på ett fysiskt medium när tre villkor är
              uppfyllda: (i) tillhandahållandet har påbörjats, (ii) du har
              uttryckligen samtyckt till att leveransen påbörjas under
              ångerfristen och samtidigt gått med på att ångerrätten därmed
              upphör, och (iii) du har fått bekräftelsen på avtalet enligt
              lagen. Vid köp i AK1A lämnar du detta samtycke aktivt och
              explicit: du markerar en särskild kryssruta — i stil med &quot;Jag
              samtycker till omedelbar åtkomst och förstår att ångerrätten
              därmed går förlorad&quot; — innan åtkomsten aktiveras. Eftersom
              betalning enligt nöjd-kund-garantin sker först efter 90 dagar
              bekräftas samtycket även skriftligt i orderbekräftelsen.
              Samtycket och bekräftelsen sparas tillsammans med
              orderbekräftelsen, som skickas till din e-post direkt efter köpet.
              Så snart åtkomsten har aktiverats har leveransen påbörjats och
              ångerrätten har upphört.
            </>
          ),
        },
        {
          box: (
            <>
              <strong className="text-foreground">Sammanfattat.</strong> Samtycker du
              till omedelbar åtkomst och aktiveras din åtkomst, är tjänsten
              levererad och den 14 dagars långa ångerrätten har upphört. Ditt
              skydd vid fel i tjänsten och dina övriga rättigheter enligt lagen
              (2022:261) om avtal om digitalt innehåll och digitala tjänster
              m.m. påverkas inte av detta — de gäller alltid.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">Garantin och ångerrätten — två
              parallella skydd.</strong>{" "}
              Utöver de lagstadgade rättigheterna erbjuder AK1A den frivilliga
              nöjd-kund-garantin för Fas 2 och Fas 3 (90 dagar): betalning sker
              först när garantiperioden löper ut och endast om du förblivit
              nöjd — den fullständiga ordalydelsen med juridisk hemvist finns i
              sektion 5 och speglas på {lank("/medlemskap", "medlemskapssidan")}.
              Garantin ersätter inte ångerrätten enligt lagen (2005:59) — den
              gäller där den gäller enligt lag — och frivilliga förmåner och
              garantier inskränker aldrig dina tvingande rättigheter som
              konsument.
            </>
          ),
        },
      ])}

      {sektion("7. Acceptabelt användande", [
        {
          p: (
            <>
              Plattformen bygger på öppenhet, generositet och ärligt lärande. För
              att skydda detta gäller följande riktlinjer för all användning —
              särskilt i communityfunktioner, chat och kommentarsfält. Listan är
              exemplifierande, inte uttömmande.
            </>
          ),
        },
        {
          ul: [
            <>
              <strong className="text-foreground">Respekt och saklighet.</strong> Inga
              trakasserier, hot, hatpropaganda, personangrepp eller
              diskriminerande uttalanden — varken mot medlemmar, grundaren,
              medarbetare eller gäster. Criticera argument, aldrig personer.
            </>,
            <>
              <strong className="text-foreground">Inget olagligt.</strong> Plattformen
              får inte användas för olaglig verksamhet, och inget innehåll som
              bryter mot svensk eller annan tillämplig lag får publiceras,
              länkas eller delas.
            </>,
            <>
              <strong className="text-foreground">Ärligt lärande.</strong> Ingen
              manipulering av quiz, XP, nivåer eller topplista (fusk) — till
              exempel att skaffa facit i förväg, automatisera svarsinmatning,
              registrera flera konton för att samla XP eller på annat sätt skaffa
              sig otillbörlig fördel i progression eller certifiering.
            </>,
            <>
              <strong className="text-foreground">Systemsäkerhet.</strong> Inga
              intrångsförsök, portskanningar, överbelastningsattacker (DDoS),
              nyttjande av säkerhetsbrister eller omvänd utveckling av
              Plattformens motorer och algoritmer utan skriftligt tillstånd.
              Upptäcker du en säkerhetsbrist rapporterar du den ansvarfullt till
              info@ak1nvestor.com i stället för att utnyttja den.
            </>,
            <>
              <strong className="text-foreground">Inget obehörigt delande.</strong>{" "}
              Innehåll får inte delas, återpubliceras eller spridas i strid med
              sektion 4 och 9.
            </>,
            <>
              <strong className="text-foreground">Ingen obehörig kommersiell
              verksamhet.</strong>{" "}
              Reklam, affiliate-länkar, massutskick eller annan kommersiell
              verksamhet i communityn kräver AK1A:s skriftliga tillstånd i
              förväg.
            </>,
          ],
        },
        {
          p: (
            <>
              Överträdelser av dessa riktlinjer hanteras enligt sektion 8. Vid
              allvarliga fall — som attacker mot Plattformen eller olaglig
              verksamhet — kan åtgärder vidtas omedelbart.
            </>
          ),
        },
      ])}

      {sektion("8. Överträdelser och hävningsrätt", [
        {
          p: (
            <>
              Vid brott mot dessa Villkor — däribland riktlinjerna i sektion 7 och
              förbuden i sektion 4 — förbehåller sig AK1A rätten att vidta
              åtgärder. Åtgärden väljs med hänsyn till överträdelsens art,
              allvar och eventuell upprepning:
            </>
          ),
        },
        {
          ul: [
            <>
              <strong className="text-foreground">(a) Varning.</strong> Skriftlig
              varning per e-post med en beskrivning av överträdelsen och ett krav
              på rättelse inom angiven tid.
            </>,
            <>
              <strong className="text-foreground">(b) Tillfällig avstängning.</strong>{" "}
              Tillfällig avstängning av vissa funktioner (till exempel
              communityn) eller av hela kontot under en begränsad och angiven
              tid.
            </>,
            <>
              <strong className="text-foreground">(c) Omedelbar hävning.</strong> Vid
              allvarliga eller upprepade överträdelser häver AK1A avtalet
              omedelbart och stänger kontot. Rätten till hävning följer av 9 §
              avtalslagen (1915:218): en part får häva avtalet när motparten har
              åsidosatt en förpliktelse av väsentlig betydelse och
              åsidosättandet har vållats avsiktligen eller av oaktsamhet.
            </>,
          ],
        },
        {
          p: (
            <>
              <strong className="text-foreground">Hävningens verkningar.</strong>{" "}
              Hävning innebär att din rätt att använda Plattformen upphör
              omedelbart och att åtkomsten till köpt innehåll stängs. Certifikat
              som erhållits genom fusk kan återkallas. När hävningen har
              orsakats av din egen överträdelse lämnas ingen återbetalning för
              den pågående perioden — den del av tjänsten som du haft
              tillgång till anses då förverkad genom överträdelsen. Vid mindre
              allvarliga fall kan AK1A i stället erbjuda återbetalning för den
              del av perioden som inte hunnit tillhandahållas. För konsumenter
              gäller alltid tvingande lagstiftning framför dessa bestämmelser.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">Process och rätt att bemöta.</strong>{" "}
              Beslut om varning, avstängning eller hävning meddelas dig per
              e-post med en motivering och en hänvisning till den bestämmelse
              som har brutits. Du har rätt att bemöta anmärkningen skriftligt
              inom 14 dagar från beskedet. Kräver situationen inte omedelbar
              åtgärd — exempelvis en pågående attack mot Plattformen eller
              misstanke om olaglig verksamhet — fattas det slutliga beslutet
              först efter att ditt bemötande inkommit eller fristen löpt ut.
              Framkommer ny väsentlig information omprövas beslutet. Misstänkt
              olaglig verksamhet anmäls till behörig myndighet.
            </>
          ),
        },
      ])}

      {sektion("9. Immaterialrätt", [
        {
          p: (
            <>
              Allt innehåll på Plattformen — kurser, texter, quiz, övningar,
              strukturer, motorer och algoritmer, analysrapporter, grafik,
              logotyper och varumärken — omfattas av upphovsrätt och andra
              immateriella rättigheter och tillhör AK1A Research Lab, om inte
              annan upphovsman eller källa uttryckligen anges. Tredje parters
              namn, varumärken och verk tillhör respektive innehavare och
              används endast som referenser med källhänvisning.
            </>
          ),
        },
        {
          p: (
            <>
              Kursinnehållet bygger på fristående pedagogiska analyser av
              publicerade böcker — inte på återgivning av dem. Citat används
              sparsamt, i överensstämmelse med upphovsrättslagen (1960:729), och
              alltid med angivande av källa. Hur AK1A förhåller sig till
              bokkanonens upphovsrättsinnehavare — citatpraxis, källhänvisning
              och gränserna för vad som återges — beskrivs utförligt i{" "}
              {lank("/upphovsratt", "AK1A:s upphovsrättspolicy")}, som utgör en
              del av dessa Villkor i detta avseende.
            </>
          ),
        },
        {
          p: (
            <>
              Du beviljas en begränsad, personlig, icke-exklusiv och
              icke-överlåtbar licens att använda innehållet för ditt eget
              lärande under aktivt medlemskap. Utöver detta överlåts ingen
              rätt — vare sig kopiering utöver tillfälliga tekniska kopior som
              krävs för användningen, bearbetning, offentlig visning eller
              distribution — om inte annat följer av lag eller skriftligt avtal
              med AK1A.
            </>
          ),
        },
      ])}

      {sektion("10. Ansvarsbegränsning", [
        {
          p: (
            <>
              Plattformens innehåll är utbildning, inte rådgivning (se sektion
              2). AK1A lämnar ingen garanti för avkastning, investeringsresultat
              eller framtida marknadsutveckling, och historisk avkastning och
              historiska exempel är aldrig en garanti för framtida resultat. Du
              fattar dina egna beslut och gör det på din egen risk.
            </>
          ),
        },
        {
          p: (
            <>
              AK1A förbinder sig att tillhandahålla Plattformen med omsorg och
              god kvalitet, men ansvarar inte för tillfälliga driftstörningar,
              planerat underhåll, tredje parts tekniska fel eller händelser
              utanför AK1A:s rimliga kontroll (force majeure).
            </>
          ),
        },
        {
          p: (
            <>
              Så långt lagen tillåter är AK1A:s sammanlagda ansvar mot dig
              begränsat till den avgift du senast erlade för den aktuella
              perioden. För dig som konsument gäller alltid tvingande skydd
              enligt lagen (2022:260), lagen (2022:261) om avtal om digitalt
              innehåll och digitala tjänster m.m. och övrig tvingande
              lagstiftning: ansvar för personskada samt för skada som vållats
              av uppsåt eller grov oaktsamhet kan aldrig begränsas, och din
              rätt att reklamera fel och göra gällande full ersättning enligt
              tvingande rätt står över avtalsvida begränsningar.
            </>
          ),
        },
      ])}

      {sektion("11. Personuppgifter", [
        {
          p: (
            <>
              AK1A behandlar personuppgifter i enlighet med
              dataskyddsförordningen (EU) 2016/679 (GDPR) och
              dataskyddslagen (2018:218). I korthet: för medlemskap lagras
              endast din e-postadress; kursprogress lagras lokalt i din
              webbläsare; AK1A spårar aldrig dina investeringar och säljer
              aldrig data. Dina rättigheter — tillgång, rättelse, radering,
              begränsning, dataportabilitet och invändning — och hur de nyttjas
              beskrivs i {lank("/privacy-policy", "Integritetspolicyn")}, som utgör
              en del av dessa Villkor i detta avseende. Frågor om
              personuppgifter besvaras via info@ak1nvestor.com.
            </>
          ),
        },
      ])}

      {sektion("12. Tillämplig lag och tvistlösning", [
        {
          p: (
            <>
              Dessa Villkor och alla avtal som grundas på dem ska tolkas och
              tillämpas enligt svensk materiell rätt. Svensk lag tillämpas
              uteslutande, oavsett var du är bosatt, i den mån inte tvingande
              konsumentskyddsregler i ditt hemland föreskriver något annat.
            </>
          ),
        },
        {
          p: (
            <>
              Tvister ska avgöras av svensk allmän domstol. Som konsument får du
              dock alltid väcka talan vid domstolen på din egen hemvist, enligt
              10 kap. 10 § rättegångsbalken, och AK1A väcker aldrig talan mot
              dig som konsument i annat land än ditt hemland.
            </>
          ),
        },
        {
          p: (
            <>
              Innan en tvist drivs vidare uppmanas du att kontakta
              info@ak1nvestor.com — de allra flesta frågor löser vi direkt och i
              dialog. Som konsument kan du dessutom vända dig till kommunal
              konsumentvägledning eller Konsumentverket och låta tvisten prövas
              av Allmänna reklamationsnämnden (ARN); ARN:s yttranden är
              rekommendationer men återspeglar etablerad praxis och beaktas av
              AK1A. Konsumenter bosatta i annat EU- eller EES-land kan få
              kostnadsfri vägledning i gränsöverskridande tvister via
              Europaiska konsumentcentrum (ECC-Net) i hemlandet.
            </>
          ),
        },
        {
          box: (
            <>
              <strong className="text-foreground">Kontakt.</strong> Frågor om dessa
              Villkor besvaras via info@ak1nvestor.com · AK1A
              Research Lab{ORG_NR_KORT} · lab.ak1nvestor.com. Relaterade
              dokument: {lank("/finansiell-policy", "Finansiell policy")},{" "}
              {lank("/upphovsratt", "Upphovsrättspolicy")},{" "}
              {lank("/privacy-policy", "Integritetspolicy")} och{" "}
              {lank("/medlemskap", "medlemskap och priser")}.
            </>
          ),
        },
      ])}

      {/* ────────────────────────────────────────────────────────────────────
        AK1A PRO — VILLKOR FÖR FÖRETAG (B2B). G2-juridikpaketet (VÅG 66 G2,
        B2B-BESLUT steg 5 + b4-juridik-priser DEL 4). EN SANNINGSKÄLLA: B2B-
        villkoren är en PRO-sektion här — aldrig en kopia på egen sida.
        FORBUD 12: inga konsumentklausuler (ångerrätt, 90-dagars-garanti, ARN)
        blandas in — skilda avtalsvärldar; 2022:260/261 gäller inte B2B.
        Status: FULLSTÄNDIGT UTKAST till granskning av kundens jurist
        (K-B2B:1) — teckningsbara avtal öppnas först när granskningen är
        godkänd (G2-grinden).
        ──────────────────────────────────────────────────────────────────── */}
      <div className="mt-16 border-t-2 border-gold/40 pt-8" id="pro-villkor">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-gold">
          AK1A PRO · Villkor för företag (B2B)
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold">
          AK1A PRO — villkor för företag
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Utkast 2026-09-04 (G2-juridikpaketet) · gäller lab.ak1nvestor.com/pro ·
          granskas av kundens jurist före teckning (K-B2B:1)
        </p>
        <div className="mt-4 rounded-lg border border-gold/30 bg-card p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">
            En sanningskälla, två avtalsvärldar.
          </strong>{" "}
          Denna PRO-sektion reglerar AK1A PRO — forsknings- och
          analysverktygen på{" "}
          {lank("/pro", "/pro")} — när användaren är ett företag eller en annan
          näringsidkare: exempelvis ett värdepappersinstitut, en oberoende
          rådgivare, en kapitalförvaltare eller ett analysföretag. Sektion
          1–12 ovan gäller konsumentledet (utbildningsplattformen); för AK1A
          PRO gäller i stället punkterna P1–P9 nedan. Konsumentlagstiftningen
          — ångerrätten enligt lagen (2005:59), lagarna (2022:260) och
          (2022:261) om digitalt innehåll, nöjd-kund-garantin och
          konsumenttvistlösning via ARN — omfattar inte avtal mellan
          näringsidkare och förekommer därför aldrig i PRO-sektionen. Mellan
          parterna gäller i stället svensk avtalsrätt, med 36 § avtalslagen
          (1915:218) som spärr mot oskäliga villkor. Statusen är ett
          fullständigt utkast: det slutgiltiga versionsdatumet fastställs
          efter juristgranskning (K-B2B:1), och teckningsbara avtal öppnas
          först när den granskningen är godkänd (G2-grinden).
        </div>
      </div>

      {sektion("P1. Parter, omfattning och avtalsslut", [
        {
          p: (
            <>
              Parter är AK1A Research Lab{ORG_NR_LANG}, kontakt
              info@ak1nvestor.com
              (&quot;AK1A&quot;, i personuppgiftsfrågor &quot;Biträdet&quot;),
              och den näringsidkare som tecknar tjänsten
              (&quot;Kunden&quot;). Kunden kan vara ett värdepappersinstitut
              med tillstånd enligt lagen (2007:528) om värdepappersmarknaden,
              en oberoende rådgivare, en kapitalförvaltare eller ett
              analysföretag — i alla fall är Kunden den part som svarar
              gentemot sina egna slutklienter.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">Avtalsomfattning.</strong>{" "}
              Tjänsten AK1A PRO omfattar tillgång till PRO-cockpiten —
              morgonronden, screening, klientvy, mötespaket och Rapportverkstan
              — i den omfattning som motsvarar tecknad nivå (Pro Analytiker,
              Pro Studio eller Pro Institution). Uppgiften per nivå framgår av{" "}
              {lank("/pro/priser", "PRO:s prislista")}; vid avvikelse mellan
              beskrivningar gäller teckningsunderlaget.
            </>
          ),
        },
        {
          ul: [
            <>
              <strong className="text-foreground">Avtalsslut.</strong> Genom
              teckningsorder från Kunden och AK1A:s orderbekräftelse per
              e-post. Bekräftelsen anger nivå, antal seat (namngivna
              användare), bindningstid, pris exklusive moms och
              faktureringsuppgifter, och utgör tillsammans med denna
              PRO-sektion det fullständiga avtalet.
            </>,
            <>
              <strong className="text-foreground">Relaterade dokument.</strong>{" "}
              {lank("/finansiell-policy", "Finansiell policy")} och{" "}
              {lank("/upphovsratt", "upphovsrättspolicyn")} gäller även för
              AK1A PRO i tillämpliga delar; för behandling av klientuppgifter
              gäller punkten P7 och det personuppgiftsbiträdesavtal (DPA) som
              tecknas enligt den.
            </>,
            <>
              <strong className="text-foreground">Användare.</strong> Kunden
              ansvarar för att varje seat nyttjas av namngiven personal hos
              Kunden och för att inloggningsuppgifter inte sprids utanför
              verksamheten.
            </>,
          ],
        },
      ])}

      {sektion("P2. Uppdraget — forskningsverktyg, aldrig rådgivning", [
        {
          p: (
            <>
              AK1A är i AK1A PRO{" "}
              <strong className="text-foreground">
                verktygs- och forskningsleverantör, inte rådgivare
              </strong>
              . Materialet är pedagogisk analys och generiskt forskningsunderlag:
              deterministiska motorer där samma underlag alltid ger samma
              utdata — oavsett läsare, kundföretag eller tidpunkt. Ingen del
              av tjänsten är anpassad till en namngiven slutklients ekonomiska
              situation, och AK1A lämnar aldrig investeringsråd eller
              personliga rekommendationer om köp eller försäljning av
              finansiella instrument.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">
                Lämplighetsansvaret är Kundens.
              </strong>{" "}
              Kunden är — som tillståndshavare och rådgivare — ensam ansvarig
              för den rådgivning, lämplighetsprövning och dokumentation som
              lämnas Kundens slutklienter, oavsett hur AK1A:s verktyg används
              i processen. Enligt ESMA:s vägledning kan en rådgivare inte
              friskriva sig från lämplighetskraven genom en disclaimer eller
              genom att åberopa ett verktyg (substansen avgör, inte etiketten).
              Därför är AK1A:s skydd själva designen — den generiska utdata —
              och Kunden ska inte använda materialet på sätt som skjuter
              ansvaret på verktyget.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">Användningsgränser.</strong>{" "}
              Kunden får inte presentera AK1A:s utdata som egna analyser utan
              angiven källa och inte använda materialet i strid med den
              mal-låsta metod- och ansvarsdeklarationen (P6). Återförsäljning
              eller vidareuthyrning av åtkomst till tredje man kräver
              skriftligt avtal med AK1A.
            </>
          ),
        },
      ])}

      {sektion("P3. Priser och betalning (exklusive moms)", [
        {
          ul: [
            <>
              <strong className="text-foreground">Priser enligt alternativ A</strong>{" "}
              — transparent flat-fee per nivå och månad,{" "}
              <strong className="text-foreground">exklusive moms</strong>: Pro
              Analytiker {PRISER.b2bAnalytiker} kr/mån (1 seat), Pro Studio{" "}
              {kr(PRISER.b2bStudio)} kr/mån (upp till 5 seats), Pro Institution{" "}
              {kr(PRISER.b2bInstitution)} kr/mån (10 eller fler seats,
              årsbindning). Aktuella nivåbeskrivningar publiceras på{" "}
              {lank("/pro/priser", "PRO:s prislista")}; vid avvikelse gäller
              teckningsunderlaget. Priset för påbörjad bindningsperiod ändras
              aldrig retroaktivt.
            </>,
            <>
              <strong className="text-foreground">Onboarding.</strong>{" "}
              Engångsavgift {kr(PRISER.b2bOnboarding)} kr på Pro Institution
              för analysavdelningens upplärning i metodiken och
              white-label-setup — avklippt vid teckning med 24 månaders
              bindning (2-årsbindning).
            </>,
            <>
              <strong className="text-foreground">Fakturering.</strong> Mot
              faktura med 30 dagars betalningstid. Svensk moms tillkommer där
              sådan ska redovisas; omvänd skattskyldighet kan gälla för
              kundföretag utomlands och avgörs i teckningsunderlaget.
              Dröjsmålsränta utgår enligt räntelagen (1975:635).
            </>,
            <>
              <strong className="text-foreground">Aldrig rev-share.</strong>{" "}
              Priset följer aldrig förvaltat kapital (AUM) eller klientantal,
              och AK1A betalar aldrig referral- eller remunerationsersättning
              till rådgivare — oberoende rådgivares förbud mot
              tredjepartsersättningar enligt MiFID II gäller hela
              avtalsförhållandet.
            </>,
            <>
              <strong className="text-foreground">Fas 3-certifierade.</strong>{" "}
              Certifierad analytiker har introduktionspriset{" "}
              {kr(PRISER.fas3IntroManad)} kr/mån det
              första året på Pro Analytiker, dokumenterat i certifikatet.
            </>,
          ],
        },
      ])}

      {sektion("P4. Bindningstid och uppsägning", [
        {
          ul: [
            <>
              <strong className="text-foreground">
                Pro Analytiker och Pro Studio.
              </strong>{" "}
              Löpande avtal per kalendermånad. Uppsägning sker skriftligt
              (e-post räcker) med 30 dagars varsel till utgången av innevarande
              månad; återbetalning lämnas inte för påbörjad månad.
            </>,
            <>
              <strong className="text-foreground">Pro Institution.</strong>{" "}
              Initial bindningstid 12 månader, därefter förlängning om 12
              månader i taget om avtalet inte sägs upp skriftligt senast 30
              dagar före löpande periodens utgång. Tecknas 24 månaders
              bindning klipps onboarding-avgiften av (P3).
            </>,
            <>
              <strong className="text-foreground">Väsentlig avtalsbrist.</strong>{" "}
              Häver en part avtalet på grund av motpartens väsentliga
              avtalsbrott (9 § avtalslagen (1915:218)) återbetalas betald men
              otillhandahållen del av perioden.
            </>,
            <>
              <strong className="text-foreground">Åtkomst vid avtalets slut.</strong>{" "}
              Kundens konton stängs och eventuell klientdata hanteras enligt
              P7 (radering eller återlämning enligt DPA:n); rapportunderlag
              exporteras på begäran innan stängning.
            </>,
            <>
              <strong className="text-foreground">Åsidosättanden.</strong> Om
              Kunden bryter mot P2 eller P6 — exempelvis genom att försöka
              sudda metoddeklarationen eller lägga fram utdata som egna
              personliga rekommendationer i strid med avtalet — får AK1A
              stänga åtkomsten omedelbart efter skriftlig tillsägelse, med
              fråga om återbetalning prövad enligt allmänna avtalsrättsliga
              regler.
            </>,
          ],
        },
      ])}

      {sektion("P5. Ansvarsbegränsning — verktygslämnaren", [
        {
          p: (
            <>
              AK1A förbinder sig att tillhandahålla tjänsten med omsorg och god
              funktion, men lämnar inga löften om avkastning,
              investeringsresultat eller framtida marknadsutveckling, och
              historiska exempel är aldrig en garanti för framtida resultat.
              Data och underlag kan innehålla fel eller vara ofullständiga —
              redovisning av det osatta är del av metodiken — och Kunden ska
              granska utdata innan det används i Kundens processer.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">
                AK1A är inte part i Kundens klientförhållanden
              </strong>{" "}
              och svarar aldrig för Kundens rådgivning, lämplighetsbedömning
              eller andra beslut. Enligt ESMA:s lämplighetsriktlinjer
              (ESMA35-43-3172) bär institutet — alltså Kunden — ansvaret för
              lämplighetsprövningen även när processen är verktygsstödd; det
              ansvaret kan inte avtalas bort till AK1A.
            </>
          ),
        },
        {
          p: (
            <>
              Så långt lagen tillåter är AK1A:s sammanlagda ansvar mot Kunden
              begränsat till den avgift Kunden erlagt för de senaste tolv
              månaderna. AK1A svarar inte för indirekta skador, förlorad
              vinst eller uteblna uppdrag. Ansvar för personskada och för
              skada som vållats av uppsåt eller grov oaktsamhet kan aldrig
              begränsas, och alla ansvarsbegränsningar prövas mot 36 §
              avtalslagen (1915:218) — standard för B2B-avtal mellan
              näringsidkare.
            </>
          ),
        },
        {
          p: (
            <>
              AK1A ansvarar inte heller för tillfälliga driftstörningar,
              planerat underhåll (meddelas i förväg), tredje parts tekniska
              fel eller händelser utanför AK1A:s rimliga kontroll (force
              majeure).
            </>
          ),
        },
      ])}

      {sektion("P6. Den mal-låsta metod- och ansvarsdeklarationen", [
        {
          p: (
            <>
              Alla rapporter och utskrifter som skapas i AK1A PRO bär en{" "}
              <strong className="text-foreground">mal-låst deklaration</strong>{" "}
              i tre lager: metoddeklarationen (hur utdata räknas),
              ansvarsdeklarationen (pedagogisk forskning — inte
              investeringsrådgivning; rådgivaren svarar för sin rådgivning och
              lämplighetsbedömning, 2007:528) samt data-t.o.m.-raden med
              falsifierbarhetsrad (underlagets datum och vad som var osatt).
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">
                White-label lägger till — subtraherar aldrig.
              </strong>{" "}
              Kunden kan på Pro Studio och Pro Institution via white-label
              lägga till egen logotyp, färger, kolofon och egen juridik. Den
              mal-låsta kärnan kan inte ändras, kortas, mjukas upp eller
              suddas — inte ens på Institution-nivå, inte via white-label och
              inte genom tilläggstext. Mal-låsningen är en maskinell spärr i
              Rapportverkstans rendering och verifieras av negativa tester i
              verktygssviten (blocket kan tekniskt inte renderas bort).
            </>
          ),
        },
        {
          p: (
            <>
              Dokumentet tillför inget eget, senare datum: varje rapport
              dateras efter underlaget — aldrig efter utskriftstillfället.
            </>
          ),
        },
      ])}

      {sektion("P7. Personuppgifter — biträdesrollen och DPA", [
        {
          p: (
            <>
              För klientuppgifter i AK1A PRO är rollfördelningen fast:{" "}
              <strong className="text-foreground">
                Kunden är personuppgiftsansvarig och AK1A är
                personuppgiftsbiträde
              </strong>{" "}
              enligt dataskyddsförordningen (EU) 2016/679, artikel 28. AK1A
              behandlar uppgifterna enbart på Kundens dokumenterade
              instruktioner och för att leverera tjänsten.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">DPA före klientdata.</strong>{" "}
              Innan någon klientuppgift läses in — även pseudonymiserad —
              krävs ett signerat personuppgiftsbiträdesavtal. AK1A:s DPA-mall,
              som täcker artikel 28.3:s krav punkt för punkt samt
              underbiträdeslista och incidentflöde, publiceras som dokument
              och länkas från {lank("/pro/priser", "PRO:s prislista")}.
            </>
          ),
        },
        {
          p: (
            <>
              <strong className="text-foreground">
                Dataminimering som teknisk spärr.
              </strong>{" "}
              Import i AK1A PRO sker enbart som instrument och vikt eller
              antal — aldrig namn, personnummer eller skuldlistor — och
              klienten identifieras i verktyget genom en klientkod eller
              etikett som Kunden själv väljer. Det som aldrig passerar
              systemet kan aldrig läcka.
            </>
          ),
        },
        {
          p: (
            <>
              Sektion 11 och {lank("/privacy-policy", "Integritetspolicyn")}{" "}
              beskriver konsumentledet (AK1A:s egna medlemmar); för PRO-ledet
              gäller DPA:n, och biträdesrollen redovisas även i{" "}
              {lank("/transparens", "transparensregistret")}.
            </>
          ),
        },
      ])}

      {sektion("P8. Ändringar av PRO-villkoren", [
        {
          p: (
            <>
              AK1A får uppdatera denna PRO-sektion, exempelvis vid
              lagändringar, nya funktioner eller prisändringar. Väsentliga
              ändringar meddelas Kundens kontaktperson per e-post minst 30
              dagar innan de träder i kraft, och gällande version publiceras
              alltid med datum på denna sida. Kunden, som inte accepterar en
              väsentlig ändring, har rätt att säga upp avtalet med verkan från
              ikraftträdandet och får återbetalning för betald men
              otillhandahållen del av perioden. Fortsatt användning efter
              ikraftträdande innebär att den nya versionen accepterats.
            </>
          ),
        },
      ])}

      {sektion("P9. Tillämplig lag och tvist", [
        {
          p: (
            <>
              Denna PRO-sektion och avtal som grundas på den ska tolkas och
              tillämpas enligt svensk materiell rätt. Tvist ska avgöras av
              svensk allmän domstol, med Stockholms tingsrätt som utgångspunkt
              för behörig domstol — om inte parterna i det enskilda
              teckningsunderlaget skriftligen kommer överens om annan hemvist
              (valfri hemvist).
            </>
          ),
        },
        {
          p: (
            <>
              Innan en tvist drivs uppmanas Kunden att kontakta
              info@ak1nvestor.com — de allra flesta frågor löses direkt och i
              dialog. Konsumenttvistlösning (kommunal konsumentvägledning, ARN
              och ECC-Net) omfattar inte avtal mellan näringsidkare och
              ligger därför utanför PRO-sektionen.
            </>
          ),
        },
        {
          box: (
            <>
              <strong className="text-foreground">
                Kontakt och relaterade dokument (PRO).
              </strong>{" "}
              Frågor om AK1A PRO-villkoren besvaras via info@ak1nvestor.com ·
              AK1A Research Lab{ORG_NR_KORT} · Relaterat:{" "}
              {lank("/pro/priser", "PRO:s prislista och DPA-mallen")} ·{" "}
              {lank("/transparens", "Transparensregistret (inklusive biträdesrollen)")} ·{" "}
              {lank("/finansiell-policy", "Finansiell policy")} ·{" "}
              {lank("/upphovsratt", "Upphovsrättspolicy")}.
            </>
          ),
        },
      ])}
    </SeoPageShell>
  );
}
