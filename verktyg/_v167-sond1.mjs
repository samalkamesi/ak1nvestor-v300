// v167-sond 1: deep-courses.json struktur för V-kurser + TS-motpartens roll
import { readFileSync } from 'node:fs';
const j = JSON.parse(readFileSync('public/deep-courses.json', 'utf8'));
console.log('toppstruktur:', Array.isArray(j) ? `array (${j.length})` : typeof j, Array.isArray(j) ? '' : Object.keys(j).join(','));
const kurser = Array.isArray(j) ? j : (j.kurser || j.courses || []);
console.log('antal kurser:', kurser.length);
const v09 = kurser.find(k => (k.slug || '') === 'v09-roe');
if (v09) {
  console.log('\nV09-roe fält:', Object.keys(v09).join(', '));
  const kap = v09.chapters || v09.kapitel || [];
  console.log('kapitel:', kap.length, '· chapterCount-fält:', v09.chapterCount, '· totalMinutes:', v09.totalMinutes);
  const sist = kap.at(-1);
  console.log('sista kapitel fält:', Object.keys(sist).join(', '));
  console.log('sista kapitel num/titel/min:', JSON.stringify({ num: sist.num, title: sist.title || sist.titel, minutes: sist.minutes }));
  const blocks = sist.blocks || sist.rutor || [];
  console.log('sista kap blocktyper:', blocks.map(b => b.type || b.typ).join(','));
  console.log('quiz i sista kap:', Array.isArray(sist.quiz) ? sist.quiz.length : typeof sist.quiz);
  if (Array.isArray(sist.quiz) && sist.quiz[0]) {
    console.log('quiz[0] fält:', Object.keys(sist.quiz[0]).join(','));
  }
  // ett tidigare kapitels blocktyper + quiz
  const k0 = kap[0];
  console.log('\nkap[0] titel:', (k0.title || k0.titel || '').slice(0, 60), '· block:', (k0.blocks || k0.rutor || []).map(b => b.type || b.typ).join(','), '· quiz:', Array.isArray(k0.quiz) ? k0.quiz.length : (k0.quizFrage ? 'quizFrage' : typeof k0.quiz));
  // chapters_list?
  console.log('chapters_list finns:', 'chapters_list' in v09, Array.isArray(v09.chapters_list) ? `(${v09.chapters_list.length})` : '');
  if (Array.isArray(v09.chapters_list)) console.log('chapters_list[sista]:', JSON.stringify(v09.chapters_list.at(-1)).slice(0, 120));
}
// hur många av V01-V20 finns?
const vSlugs = ['v01-forsaljningstillvaxt','v02-arr-tillvaxt','v03-intaktsdiversifiering','v04-ps','v05-pb','v06-ev-ebitda','v07-bruttomarginal','v08-ebitda-marginal','v09-roe','v10-skuldsattningsgrad','v11-likviditet','v12-intaktsstabilitet','v13-patent-ip','v14-varumarke','v15-natverkseffekter','v16-produktlanseringar','v17-avtal-partnerskap','v18-regulatoriska','v19-kapitalforbranning','v20-aterekop-egna-aktier'];
const finns = vSlugs.filter(s => kurser.some(k => k.slug === s));
console.log(`\nV-kurser närvarande: ${finns.length}/20`);
// gemensam struktur för samtliga kurser: quiz per kapitel?
const quizKont = kurser.filter(k => (k.chapters || []).every(c => Array.isArray(c.quiz)));
console.log('kurser där VARJE kapitel har quiz-array:', quizKont.length, '/', kurser.length);
const quizFler = kurser.map(k => (k.chapters || []).map(c => Array.isArray(c.quiz) ? c.quiz.length : 0));
const unika = [...new Set(quizFler.flat())];
console.log('quiz-antal per kapitel (unika):', unika.join(','));
