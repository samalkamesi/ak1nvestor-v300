// Rond 160: ärlig verifiering — finns sifferbandets verkliga tal live på startsidan?
const html = await (await fetch('https://lab.ak1nvestor.com/')).text();
const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

for (const [namn, ...mönster] of [
  ['kurser 495', '495'],
  ['quiz 8 223', '8 223', '8223'],
  ['böcker 103', '103'],
  ['verktyg 8', '8 verktyg', 'verktyg'],
  ['0 kr', '0 kr'],
  ['etikett "heltäckta böcker"', 'heltäckta böcker'],
  ['etikett "quiz-frågor"', 'quiz-frågor'],
]) {
  const traff = mönster.some((m) => text.includes(m));
  console.log(namn.padEnd(28), '=>', traff ? 'FINNS live' : 'SAKNAS');
}
// klipp ur kontexten kring första "495"
const i = text.indexOf('495');
if (i >= 0) console.log('\nkontext kring 495: …' + text.slice(Math.max(0, i - 60), i + 80) + '…');
