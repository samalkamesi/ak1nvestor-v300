// Bygger data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag.json
// Spår 3, s3-u2 (auto-s3-1789607727072) — B19 e-handelsaktier/plattformsbolag.
import fs from 'node:fs';

const body = `E-handelsaktier är aktier i bolag som tjänar sina pengar på digitala transaktioner: marknadsplatser som förmedlar varuköp (Mercado Libre, Sea Limited), plattformar som förmedlar boenden och transporter (Airbnb, Uber) och bolag som säljer verktygen e-handeln byggs med (Shopify). Det gemensamma är avgörande för analysen — bolaget äger i regel inte varan som säljs. Intäkten är en avgift på transaktionen, och det förändrar allt från marginalen till värderingen. Den här guiden går igenom mekaniken steg för steg: GMV och take rate, nätverkseffekten som vallgrav, hävstången som vänder förluster till vinster — och varför fem bolag med samma etikett handlas från P/E 15,6 till 94,6.

Exemplen är fem bolag ur AK1A:s analysuniversum — Shopify, Mercado Libre, Airbnb, Uber och Sea Limited — med data hämtad ur offentliga marknadskällor (2026-09-03–16). Guiden avgränsas mot butikshandeln, där varan ägs och varukostnaden syns i resultaträkningen, och mot prenumerationsmjukvaran: här står transaktionsavgiften i centrum.

## Vad e-handelsaktier säljer — transaktionen, inte varan

Plattformsbolagets intäktsmekanik börjar två steg före resultatrutan. Det första talet är GMV — bruttovolymen, värdet av allt som handlas på plattformen. Det andra är take rate — andelen av den volymen bolaget tar betalt för. Ett räkneexempel: förmedlar en marknadsplats varor för 10 miljarder dollar på ett år och tar 8 procent i avgift, blir intäkten 0,8 miljarder dollar. En detaljist med samma försäljningsvolym redovisar i stället 10 miljarder i intäkt — med varukostnaden kvar att betala. Därigenom blir bruttomarginalen ett annat djur i den här branschen: universumets modekedjor i detaljhandeln redovisar bruttomarginaler kring 54–56 procent, medan de fem plattformarna spänner från Ubers 40,8 via Shopifys 47,8 till Airbnbs 82,9 procent. Skillnaden säger mindre om skicklighet än om vad bolaget redovisar som sin intäkt. Jämför därför plattformar på resultat, kassaflöde och tillväxt — inte på bruttomarginalens höjd. Hur måttet byggs och läses går vi igenom i [Bruttomarginal](/kurser/v07-bruttomarginal) och [Försäljningstillväxt](/kurser/v01-forsaljningstillvaxt).

## Nätverkseffekten — vallgraven som växer av sig själv

Det som ska förklara varför en plattform får behålla sin take rate är nätverkseffekten: flera säljare lockar fler köpare, fler köpare lockar fler säljare — och varje ny deltagare gör nätet mer värt för alla övriga. Det är en vallgrav som växer av sig själv, till skillnad från varumärket som byggs genom års marknadsföring. Mekanismen och dess matematik går vi igenom i [Nätverkseffekter](/kurser/v15-natverkseffekter), och hur den poängsätts i en analys visas i [analysen av nätverkseffekter](/blogg/v15-natverkseffekter-analys). Notera symmetrin: fungerar effekten framåt fungerar den även bakåt — lämnar säljarna plattformen lämnar köparna med dem, och tvärtom. Churn på endera sidan är därför rapportens viktigaste tidiga varning. Och vallgraven har ett pris från start: Ubers nät var 2022 djupt förlustbringande — minus 9,1 miljarder dollar för året — innan volymen växte in i de fasta kostnaderna.

## Hävstången — när plattformen vänder

Plattformens kostnadsbild är förhållandevis fast: i princip samma infrastruktur betjänar tio som femton miljarder dollar i volym. Det är mekaniken bakom branschens vändningar, och universumet bär tre av dem. Uber: från minus 9 141 miljoner dollar 2022 till plus 10 053 miljoner 2025. Sea Limited: från minus 1 651 till plus 1 578 miljoner. Shopify: från minus 3 460 miljoner 2022 till vinst alla tre följande år. Gemensamt för vändningarna är att intäkterna växte sig in i en kostnadsbas som redan stod färdigbyggd — hävstången som verkar i båda riktningarna. Baksidan syns i Shopifys 2025-siffra: intäkten växte från 8,9 till 11,6 miljarder dollar, alltså 30 procent, men resultatet föll från 2 019 till 1 231 miljoner. Tillväxt garanterar inte resultat — varje kostnadspost är en fråga till rapporten, och läsordningen tränas i [Kvartalsrapporten](/kurser/km-006-kvartalsrapporten).

## Fem affärsmodeller bakom samma etikett

Etiketten e-handelsaktier döljer att de fem bolagen tjänar pengar på olika sätt. **Shopify** säljer verktygen: mjukvara och betalningsflöden till andras butiker, med bruttomarginal 47,8 procent och en balansräkning nästan utan skuld — 0,01 krona skuld per krona eget kapital. **Mercado Libre** är marknadsplatsen som blev bank: intäkten växde från 10,8 till 28,9 miljarder dollar 2022–2025, 38,9 procent per år, men skuldsättningsgraden 1,69 bär en kreditverksamhet — den sidan av bolaget analyseras som ett finansbolag, se [Skuldsättningsgrad](/kurser/v10-skuldsattningsgrad). **Airbnb** är den renaste marknadsplatsen: bruttomarginal 82,9 procent, ROE 34,5 procent och ett fritt kassaflöde som 2025 var 1,85 gånger resultatet — 4 646 mot 2 511 miljoner dollar. **Uber** är transportnätet: 52,0 miljarder dollar i intäkt, 9,8 miljarder i fritt kassaflöde — och lägst multipel av de fem. **Sea Limited** bär tre ben — e-handel, underhållning, finanstjänster — med universumets högsta tillväxttakt: 48,1 procent senaste tolvmånadersperioden, men en FCF-marginal på bara 0,2 procent. Som kontrast: Amazon, e-handelns kapitaltungaste jätte i universumets teknikgren med 2 680 miljarder dollar i börsvärde, redovisar just därför en FCF-marginal på minus 1,5 procent — lager och logistik binder kapital som de lättare plattformarna slipper. Skillnaden mellan affärsmodellerna är alltså inte en fotnot utan själva analysen, och segmentredovisningens hantverk tränas i [Intäktsdiversifiering](/kurser/v03-intaktsdiversifiering).

## Värderingen — från 15,6 till 94,6 i samma bransch

P/E-talen för de fem: Uber 15,6, Airbnb 38,1, Sea 43,6, Mercado Libre 49,8, Shopify 94,6 — mer än sexfalt mellan ytterligheterna. Vad marknaden prissätter är med ens tydligt: tillväxttakten. Sea och Mercado Libre växer snabbast (48,1 respektive 46,0 procent), Shopify bär 33,7 procent, Uber 16,7. Den som vill fånga multipel och tillväxt i ett enda tal når PEG — Sea 1,15, Airbnb 1,42, Shopify 2,61, Mercado Libre 3,4 — men talet har dokumenterade svagheter när det blir en sorteringslista, se [PEG-multiplens svagheter](/blogg/peg-multipeln-svagheter-2026) och [PEG-kursen](/kurser/km-027-pegratio). Två reservationer till: FCF-yielden spänner från 13,4 procent (Mercado Libre) till 0,9 (Shopify), men i det första fallet blandar finanstjänsternas flöden in sig — kundmedel är inte utdelningsbar kassa. Och när vinstnämnaren svajar är det komplement som finns [P/S-talet](/blogg/ps-tal-nar-ar-det-anvandbart) med kursen [P/S](/kurser/v04-ps); själva P/E-måttet fördjupas i [P/E-djupdykningen](/kurser/km-009-pe). Branschernas medianvärden för sammanställningen i [branschmedianerna](/blogg/branschmedianer-akm2).

## Rapportläsningens fem punkter

- **GMV, aktiva användare och take rate** — intäkten delad med volymen visar om plattformen höjer avgiften, växer på volym eller båda; utvecklingen är affärsmodellens puls.
- **Segmenten var för sig** — Sea och Mercado Libre bär finansben, Uber delar upp transporter och leveranser; koncernaggregatet döljer mer än det avslöjar, se [analysen av intäktsdiversifiering](/blogg/intaktsdiversifiering-risken-som-inte-syns-i-pe).
- **Kassaflöde mot resultat** — Airbnbs 1,85 gånger och Seas 0,2 procent i FCF-marginal är samma övning från var sin ände: följer kassaflödet resultatrutan? Hantverket bor i [Kassaflödesanalysen](/kurser/km-003-kassaflodesanalysen).
- **Kreditförluster där fintech finns** — skuldsättningsgraden 1,69 hos Mercado Libre är affärsmodell, inte olycka; kreditkostnadens andel av intäkten är den posten att följa.
- **Engångsposter och noter** — Airbnbs resultat föll från 4 792 miljoner dollar 2023 till 2 648 miljoner 2024 medan intäkten växte; sådana brott förklaras i noterna, och rutinen tränas i [Noter — den dolda informationen](/kurser/km-004-noter).

## Sammanfattningen

- Intäkten är transaktionsavgiften: 10 miljarder dollar i volym vid take rate 8 procent ger 0,8 miljarder i intäkt — utan varukostnad.
- Bruttomarginalen spänner 40,8–82,9 procent bland de fem; nivån speglar redovisningen, inte skickligheten.
- Hävstången vänder: Uber från minus 9 141 miljoner dollar 2022 till plus 10 053 miljoner 2025; Sea och Shopify vände samma år.
- Multipelspannet P/E 15,6–94,6 prissätter tillväxttakten 16,7–48,1 procent; PEG jämför — med kända svagheter.
- FCF-yielden jämförs inte rakt av: finanstjänstgrenar och kundmedel gör 13,4 och 0,9 procent till olika saker.

Fortsättningsspåret: kursen [Nätverkseffekter](/kurser/v15-natverkseffekter) fördjupar vallgraven, [analysen av nätverkseffekter](/blogg/v15-natverkseffekter-analys) visar poängsättningen i praktiken, och [den kompletta guiden till svensk aktieanalys](/blogg/komplett-guide-svensk-aktieanalys-2026) sätter metoden i helheten.

_Detta är pedagogisk finansanalys, inte investeringsråd._`;

const post = {
  slug: "ehandelsaktier-sa-analyserar-du-plattformsbolag",
  title: "E-handelsaktier: så analyserar du plattformsbolag",
  description: "E-handelsaktier tjänar på transaktionen, inte varan. Så fungerar GMV, take rate och nätverkseffekter — med Shopify, Mercado Libre och Airbnb i siffror.",
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: "2026-09-17",
  readingMinutes: 2,
  tags: ["e-handelsaktier", "plattformsbolag", "nätverkseffekter", "take rate", "aktieanalys"],
  body
};

const ord = post.body.trim().split(/\s+/).length;
console.log("ord i body:", ord);
console.log("title tkn:", post.title.length);
console.log("desc tkn:", post.description.length);
fs.writeFileSync("/home/ak1a/AK1/data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag.json", JSON.stringify(post, null, 2) + "\n");
console.log("skrev data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag.json");
