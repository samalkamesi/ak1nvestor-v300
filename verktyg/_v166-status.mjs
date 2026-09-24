// v166-status: vilka Fas 3-kurser saknar djupkapitlet "Från boken till egen analys"?
import { readFileSync } from 'node:fs';
const slugs = ['intermarket-analysis','martin-pring-on-market-momentum','the-master-swing-trader','fibonacci-applications','come-into-my-trading-room','teknisk-analys-med-johnny-torssell','bollinger-on-bollinger-bands','the-new-science-of-technical-analysis','way-of-the-turtle','the-complete-turtletrader','the-trend-following-bible','trading-in-the-zone','the-hour-between-dog-and-wolf','market-mind-games','your-money-and-your-brain'];
for (const s of slugs) {
  try {
    const j = JSON.parse(readFileSync(`data/bokmaster/${s}.json`, 'utf8'));
    const sist = j.chapters.at(-1);
    const har = sist.title === 'Från boken till egen analys';
    console.log(`${har ? 'KLAR' : 'SAKNAS'} ${s} · kap ${j.chapters.length} · sist="${sist.title}" (${sist.minutes} min)`);
  } catch (e) {
    console.log(`FEL   ${s} · ${e.message.slice(0, 60)}`);
  }
}
