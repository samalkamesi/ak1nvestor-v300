// Bygg B21 logistikaktier — data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json
// Rådata live-verifierad 2026-09-17: DSV 1164 (investor.dsv.com via GlobeNewswire),
// Maersk FY2025 (maersk.com 2026-02-05), Kuehne+Nagel FY2025 (newsroom.kuehne-nagel.com).
import { writeFileSync } from 'node:fs';

const body = `Logistikaktier är aktier i bolagen som flyttar världens varor — rederier, speditörer och kontraktslogistiker. Branschen är sin egen analysvärld av ett enda skäl: efterfrågan på frakt följer världshandeln, men utbudet av fartyg, flygplan och lastbilar kan inte stängas av och på i takt. När handeln växer snabbare än kapaciteten skjuter fraktpriserna — och lönsamheten — i höjden; när ny kapacitet anländer in i en avmattning faller de lika snabbt. Maersk, ett av världens största containerrederier, redovisade ett rörelseresultat (EBIT) på 31 miljarder dollar 2022 och 3,5 miljarder 2025 — samma bolag, samma fartyg, en cykel.

Den här guiden går igenom branschens tre affärsmodeller, fraktcykeln genomräknad, hur du läser en speditörs resultaträkning — och vad DSV:s Schenker-integration lär om justerade resultat.

## Tre affärsmodeller — vad logistikaktier tjänar pengar på

Den som analyserar logistikaktier börjar med att sortera bolaget i en av tre fack, eftersom de tre bär olika räkenskaper. **Rederiaget** äger sina fartyg (Maersk): intäkten är fraktpris gånger volym, kostnadsposten är en tung och fast apparat — hamnavgifter, besättning, finansiering — vilket ger en hög operativ hävstång: resultatet svänger våldsamt med fraktpriset. **Speditören** (DSV, Kuehne+Nagel) äger sällan fordonet; bolaget köper kapacitet hos rederier och flygbolag och säljer transporter, tullhantering och lösningar vidare — kapitaltätheten är lägre, marginalerna tunnare och cykeln dämpad. **Kontraktslogistiken** driver lager, packning och distribution åt andra på multiåriga avtal — de stabilaste intäkterna och de strängaste marginalerna.

Vikterna syns i DSV:s segmentrapport: av gruppens EBIT före jämförelsestörande poster på 19,6 miljarder DKK 2025 kom 13,0 miljarder från Air & Sea — två tredjedelar av resultatet från den division som köper och säljer kapacitet på hav och i luft — medan Road bidrog med 2,7 och Contract Logistics med 3,8 miljarder.

## Fraktcykeln — priset sätts på auktion över lastutrymme

Ett fraktpris är en auktion: sändare budar på ett begränsat antal lastutrymmen, och priset hamnar där den sista lasten precis går hem. Utbudet är kapaciteten — fartyg i drift, verkliga seglingsrutter — och efterfrågan är volymen: världshandeln, lagervaror, konsumentvaror. Maersks senaste fyra år visar hela mekaniken. 2022: intäkt 82 miljarder dollar och EBIT 31 miljarder — en rörelsemarginal på 31 ÷ 82 = 37,8 procent, drivet av pandemins eftersläpande efterfrågan och fulla fartyg. 2023: nytonnad kapacitet mötte avmattad handel, EBIT föll till omkring 4 miljarder — minus 87 procent på ett år. 2024: attackerna i Röda havet tvingade fram omvägar runt Afrika, som tog bort effektiv kapacitet och höjde fraktpriserna — EBIT 6,5 miljarder. 2025: normaliserade rutter och mjukare volym, EBIT 3,5 miljarder på nästan oförändrad intäkt 54 miljarder — marginalen 3,5 ÷ 54,0 = 6,5 procent.

Notera vad serien lär: intäkten var i princip flat 2024–2025 medan resultatet nästan halverades. I cykelbranscher är rörelsemarginalen barometern, och [cykelrisken](/kurser/rk-05-cykelrisk) börjar i just den insikten.

## Speditören — läs bruttovinsten, inte intäkten

En speditörs intäkt har en dubbelnatur: redovisas transporten som huvudman ligger den inköpta frakten i intäkten, och när fraktpriserna stiger sväller intäkten mekaniskt utan att bolaget sålt en enda transport mer. Därför är bruttovinsten — intäkt minus inköpsfrakt — speditörens egentliga intäktsrad. DSV 2025: intäkt 247,3 miljarder DKK (167,1 miljarder 2024, efter Schenker-förvärvet), bruttovinst 66,9 miljarder — bruttomarginalen 66 859 ÷ 247 331 = 27,0 procent mot 25,7 året innan — och EBIT före jämförelsestörande poster 19,6 miljarder, en förbättring med 19 611 ÷ 16 096 − 1 = 21,8 procent.

Kontrasten ger marknadsläget: Kuehne+Nagel, som växt organiskt, redovisade 2025 en nettoomsättning på 24,5 miljarder CHF, bruttovinst 8,8 miljarder (36,0 procent) och EBIT 1 242 miljoner CHF — ned 24,9 procent från 2024, med en rörelsemarginal på 1 242 ÷ 24 476 = 5,1 procent. DSV:s +21,8 procent är förvärv; Kuehne+Nagels −24,9 procent är marknaden. Skillnaden mellan organisk och förvärvad tillväxt är [en analys i sig](/kurser/tx-01-organisk-mot-forvarvad-tillvaxt).

## Förvärvsmaskinen — läs båda resultatrader

DSV är branschens mest konsekventa förvärvare, och Schenker-året 2025 är en lektion i att läsa två rader samtidigt. EBIT före jämförelsestörande poster steg 21,8 procent — men vinsten från fortsatt verksamheten föll från 10,2 till 8,5 miljarder DKK, minus 16,8 procent, för att integrationskostnaderna på 4,5 miljarder bokförts som jämförelsestörande poster. Den utspädda justerade vinsten per aktie blev 50,9 DKK mot 51,6 — i princip oförändrad trots att intäkten växte 48 procent: köpet betalades delvis med egna aktier, och utspädningen äter av tillväxten per aktie. Samtidigt ljusar spåret framåt: synergier om 0,8 miljarder DKK realiserade 2025, en sammanlagd EBIT-effekt omkring 5 miljarder väntas 2026 och det fulla målet 9 miljarder beräknas 2027, medan integrationen är 30 procent klar och slutdatumet flyttats fram till slutet av 2026.

Regeln för läsaren: ett justerat resultat är ett arbetsverktyg, inte en sanning — håll båda raderna synliga över kvartalen, exakt som [kvartalsrapportens](/kurser/km-006-kvartalsrapporten) genomgång av jämförelsestörande poster lär. Kassaflödet bekräftade 2025: justerat fritt kassaflöde 16,3 miljarder DKK mot 5,6 miljarder 2024, en påminnelse om att arbetskapital och integration sticker åt olika håll i resultaträkningen — [kassaflödesanalysen](/kurser/km-003-kassaflodesanalysen) och [kapitalbindningen](/kurser/ln-04-kapitalbindning-och-rorelsekapital) fördjupar just den mekaniken.

## Värdering genom cykeln — normalisera EBIT först

Att värdera logistikaktier med P/E på toppårets vinst är den klassiska fällan: när EBIT slår i topp ser multipeln billig ut precis för att nämnaren är som högst — en av [P/E-talets tre svikter](/kurser/km-009-pe). Hantverket är att normalisera: räkna fram en genomsnittlig EBIT över en hel cykel — för Maersk sträcker sig den över pandemi-boom, kollaps, Röda havet och normalisering — och sätt [EV/EBIT](/kurser/km-010-evebit) mot den normaliserade nivån, med nettoskuld och eget kapital synliga ([vad EV/EBITDA mäter](/blogg/vad-ar-ev-ebitda)). Bolagens egna utfällningar — DSV:s intervall på 23,0–25,5 miljarder DKK EBIT före jämförelsestörande poster för 2026 — är i cykelbranscher intervall, inte löften. Vallgraven i logistik är tunn men inte obefintlig: nätverksdensitet, kundkontrakt och integration i kundernas system — hur den mäts i siffror går igenom i [vallgraven i siffror](/kurser/mt-03-vallgraven-i-siffror).

## Rapportläsningens fem punkter

- **Volym kontra yield.** Dela tillväxten i enheter och pris — en intäktsökning enbart på fraktpriser är cykel, inte framgång.
- **Segment för segment.** Blanda inte vägmåttens marginaler med sjö- och flygfraktens — DSV:s tre divisioner bär tre olika ekonomier.
- **Justerat kontra rapporterat.** Följ de jämförelsestörande posterna över kvartalen (DSV: 0,9 → 4,5 miljarder DKK) och fråga när de planar ut.
- **Kassaflöde och kapitalbindning.** Kundfordringar och kredittider till underleverantörer svänger med fraktpriserna — läs [balansräkningen](/blogg/sa-laser-du-en-balansrakning-pa-15-minuter) vid sidan av resultatet.
- **Kapacitetsnyheterna utanför rapporten.** Nybyggnationsorder, omvägar och tullar är fraktprisernas ledande indikatorer — [sektoranalysens metod](/kurser/se-16-sektoranalysens-metod) strukturerar spåret.

## Sammanfattningen

- Tre affärsmodeller: rederiet (kapitaltungt, hög hävstång), speditören (bruttovinsten är den riktiga intäkten), kontraktslogistiken (stabil volym, sträng marginal).
- Fraktcykeln i en rad: Maersk EBIT 31 → 4 → 6,5 → 3,5 miljarder dollar 2022–2025; rörelsemarginalen 37,8 → 6,5 procent.
- DSV 2025: intäkt 247,3 miljarder DKK, bruttomarginal 27,0 procent, EBIT före jämförelsestörande poster +21,8 procent — men rapporterad vinst −16,8 procent och oförändrad EPS 50,9 DKK: förvärvets båda sidor i samma rapport.
- Kuehne+Nagel −24,9 procent visar marknaden under DSV:s förvärvsveva.
- Värdera normaliserat genom cykeln; läs volym och yield var för sig.

Fortsättningsspåret: [Logistiksektorn](/kurser/se-04-logistiksektorn) och [Logistik och kedjor](/kurser/se-15-logistik) tar branschen kursvis, [den kompletta guiden till svensk aktieanalys](/blogg/komplett-guide-svensk-aktieanalys-2026) sätter metoden i helheten.

_Detta är pedagogisk finansanalys, inte investeringsråd._`;

const post = {
  slug: 'logistikaktier-sa-analyserar-du-fraktbolag',
  title: 'Logistikaktier: så analyserar du fraktbolag',
  description: 'Logistikaktier lever på fraktcykeln — Maersk EBIT föll 31→3,5 mdr USD på tre år. Så läser du volym, yield och synergier, med DSV genomräknat.',
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-09-17',
  readingMinutes: 2,
  tags: ['logistikaktier', 'fraktbolag', 'speditör', 'fraktcykeln', 'nyckeltal'],
  body,
};

writeFileSync('data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json', JSON.stringify(post, null, 2) + '\n');
const ord = body.split(/\s+/).filter(Boolean).length;
console.log('SKRIVEN. Ord (raw):', ord, '| title tkn:', post.title.length, '| desc tkn:', post.description.length);
