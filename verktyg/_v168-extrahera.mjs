// extrahera V-kursernas faktiska värden ur deep-courses.json för register-harmonisering
import { readFileSync, writeFileSync } from 'node:fs';
const dc = JSON.parse(readFileSync('/home/ak1a/agent/ak1/public/deep-courses.json', 'utf8'));
const reg = readFileSync('/home/ak1a/agent/ak1/src/lib/ai-mentor-register.ts', 'utf8');
const rader = [];
for (const [slug, kurs] of Object.entries(dc)) {
  if (!/^v(0[1-9]|1[0-9]|20)-/.test(slug)) continue;
  const k = kurs;
  const kap = (k.chapters || []).length;
  const min = (k.chapters || []).reduce((s, c) => s + (c.minutes || 0), 0);
  const quiz = (k.chapters || []).reduce((s, c) => s + ((c.quiz || []).length), 0);
  // registrets rad för samma slug
  const m = reg.match(new RegExp('\\{ slug: "' + slug + '".*?\\}'));
  const regKap = m ? (m[0].match(/kapitel: (\d+)/) || [])[1] : '?';
  const regQuiz = m ? (m[0].match(/quiz: (\d+)/) || [])[1] : '?';
  const regMin = m ? (m[0].match(/minuter: (\d+)/) || [])[1] : '?';
  const avvik = (String(kap) !== regKap) || (String(min) !== regMin) || (String(quiz) !== regQuiz);
  rader.push(slug + ' · register kap/quiz/min ' + regKap + '/' + regQuiz + '/' + regMin + ' · deep-courses ' + kap + '/' + quiz + '/' + min + (avvik ? ' · AVVIKAR' : ' · OK'));
}
writeFileSync('/tmp/v168-extrakt.txt', rader.join('\n') + '\nAVVIKANDE: ' + rader.filter(r => r.includes('AVVIKAR')).length + '/20\n');
