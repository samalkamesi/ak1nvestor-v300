#!/usr/bin/env node
// Generator för s3-u3 (auto-s3-1789653328370): Ö7 = B7 konsumentaktier på engelska
// Skriver data/blogg-utkast/konsumentaktier-sa-analyserar-du-konsumentbolag-en.json
// (översättning av B7 — samma tal, räkneexempel och korslänkar som originalet).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const body = [
  "Consumer stocks are shares in companies selling to households: food, clothing, hygiene, appliances, cars, restaurant visits — everything paid with the private wallet. In AK1A's analysis universe 13 companies belong to the sector: H&M, Inditex and Nike in fashion, LVMH in luxury, Nestlé, Procter & Gamble and Essity in staples, Axfood in Swedish food retail, Electrolux and Volvo Cars in cyclical durables, McDonald's in franchised restaurants, Carlsberg in brewing and Evolution in digital gaming. The common denominator: a private buyer — demand follows household purchasing power, tastes and trust in brands.",

  "The sector's numerical profile is a paradox: median ROE 24 percent — second highest of the universe's ten sectors, after technology — despite an EBIT margin below the universe median (14.6 versus 21.1 percent). The explanation is the DuPont identity, the key to the sector's analysis. This guide walks through the two worlds of margins, the return math, cycle sensitivity and the multiple — with worked examples and sources. As always: education in method, never advice about individual stocks.",

  "## What are consumer stocks — six kinds of businesses",

  "The label houses very different economics; sorting decides which measures matter.",

  "- **Consumer staples and retail.** Axfood, Procter & Gamble, Essity and Nestlé sell what is bought weekly regardless of the economy. Volumes stable, margins thin — and capital turns fast.",
  "- **Clothing and fashion.** H&M, Inditex and Nike deliver seasonal collections. The brand carries pricing power, inventory the big risk, speed in the goods flow a craft of its own.",
  "- **Luxury.** LVMH's 66 percent gross margin is the universe's highest: the customer pays for the brand, not the manufacturing cost. Luxury's special economics get [their own course](/kurser/se-05-lyxsektorn).",
  "- **Cyclical durables.** Electrolux appliances and Volvo Cars cars are postponed when households tighten. Volvo Cars' P/E of 6.0 is the market's way of pricing that risk.",
  "- **Restaurants and franchise.** McDonald's 46 percent EBIT margin comes not from hamburgers but from the model: franchisees pay rent and license fees and carry operating cost, while McDonald's owns properties and brand.",
  "- **Gaming and entertainment.** Evolution runs online casino — digital, capital-light, counted as consumption, economically similar to software.",

  "## The two worlds of margins — the brand as moat",

  "The sector's widest span sits in the gross margin: LVMH 66, Inditex 56 and H&M 54 percent — against Axfood 15, Electrolux 14 and Volvo Cars 16 (universe raw data, retrieved 2026-09-15). The difference is pricing power: a strong brand can raise its price without buyers disappearing, and the increase falls almost straight through to profit — the cost of goods does not follow.",

  "The gross margin is therefore the brand company's most important measure. A brand is built over decades of advertising, consistency and repetition — a copy cannot be ordered at quarter-end. Weakness shows in the gross margin first, quarters before the net profit moves; a rising gross margin is the clearest receipt that pricing power holds. The method is systematized in [brand analysis](/blogg/v14-varumarke-analys) and the [Brand](/kurser/v14-varumarke) course; the moat is tested in [What is a moat](/kurser/mt-01-vad-ar-en-moat) and [Moat erosion](/kurser/mt-02-moat-erosion-och-vallgravstest). The open threat to branded goods: retailers' own labels — private label — same function cheaper, squeezing the gross margin from above.",

  "## The DuPont breakdown — how a thin margin becomes a high return",

  "The DuPont identity takes return on equity apart into three factors:",

  "**ROE = net margin × capital turnover × leverage**",

  "A retailer with a 3 percent net margin, capital turnover four and leverage two gets ROE = 3 × 4 × 2 = 24 percent. A brand company with ten times the margin — 30 percent — but turnover 0.5 and leverage 1.2 lands at 30 × 0.5 × 1.2 = 18 percent: the retailer wins with a tenth of the margin, and the split shows where return lives — margin, turnover or leverage. One warning: ROE built on debt is not ROE built on margin; the interest cost remains in the downturn. The craft is in [DuPont analysis](/kurser/ln-01-dupont-analysen), the calculation in [how to calculate ROE](/blogg/hur-raknar-man-roe), the interpretation in [ROE analysis](/blogg/v09-roe-analys).",

  "Read the medians the same way: ROE 24 against the universe's 15 on a below-average EBIT margin — the return is built on capital turnover and brand margins, not heavy assets.",

  "## The leverage of volume — why thin margins swing violently",

  "Thin margins amplify small movements — retail's numbers: revenue 100, cost of goods 75, other costs 21 — operating profit 4. Volume falls 5 percent; the cost of goods follows down to 71.25 while other costs, essentially fixed, stay at 21. Profit becomes 95 − 71.25 − 21 = 2.75: a 5 percent volume decline has knocked 31 percent out of the profit.",

  "That is why grocery retail watches basket, customer counts and comparable sales — volume is the profit's lever when margins are thin. Revenue stability over time is measured as in [revenue stability analysis](/blogg/v12-intaktsstabilitet-analys).",

  "## Cycle sensitivity — bread does not cycle, cars do",

  "The consumer label contains both ends of cycle sensitivity. Staples are bought in downturns too — food and hygiene barely notice a recession, apart from the basket trading down. Big-ticket purchases react immediately: the car, the appliance, the vacation — postponed when rates rise or job security wobbles. Households' purchasing-power expectations are followed closely — see the National Institute of Economic Research's consumer barometer.",

  "The universe's multiples carry the proof: Volvo Cars trades at a P/E of 6.0, Inditex stands at 28 — same label, two worlds, the difference being cycle risk and growth. Cycle trough with leverage is the hardest combination: Electrolux shows a negative EBIT margin (−3.2 percent) with debt-to-equity 2.6 — volume and interest squeezing simultaneously, the double strain [the debt-to-equity ratio](/blogg/vad-ar-skuldsattningsgrad) measures.",

  "## The multiple and the balance sheet",

  "The sector's median P/E is 20.4 against the universe's 20.5 — level with the market, narrow quartile span (18.1–22.3). EV/EBIT at 15.7 against 19.0, P/B at 3.9 against 2.8. The P/B gap has an accounting explanation: brands and store networks built internally stand at book value zero — the balance sheet misses the sector's most important asset, one reason P/B is read cautiously for brand companies.",

  "The balance-sheet side otherwise: median debt-to-equity 0.69, wide span — Nestlé 2.1, H&M 2.3, Carlsberg 1.3 against Evolution 0.02. Mature brand companies willingly carry debt: cash flow is stable (sector FCF margin 9.3 percent), volumes swing little. The same leverage in a cyclical consumer company tolerates only a fraction of the volume swing.",

  "## How to read a consumer company's report",

  "Five details deserve extra attention: comparable sales (same stores and channels — strips out expansion effects); the gross margin's movement (the pricing-power test); inventory and turnover (fashion's red thread — a growing inventory ahead of the season is an early warning); the marketing cost (advertising is capital formation booked as a cost — savings there lift this year's profit at the brand's expense); and currencies (global consumer companies report in several — moves can hide growth or decline). The reading order in [the quarterly report](/kurser/km-006-kvartalsrapporten) and [How to read a Swedish annual report](/blogg/sa-laser-du-en-svensk-arsredovisning) applies as framework — a worked example in [our Volvo Cars analysis](/blogg/hur-vi-analyserade-volvo-cars).",

  "## The summary",

  "- Six subgroups with different economics — sort before you measure.",
  "- The gross margin is the brand measure: universe span 14–66 percent; pricing power shows there first.",
  "- DuPont solves the paradox: ROE 24 percent — second highest — on a below-average EBIT margin; example 3 × 4 × 2 = 24 percent.",
  "- Thin margins amplify: volume −5 percent knocked 31 percent out of the profit.",
  "- Cycle sensitivity runs from bread to cars: P/E 6.0 for Volvo Cars against 28 for Inditex.",
  "- Median P/E 20.4 level with the universe; P/B 3.9 — the balance sheet does not see the brands.",

  "Next in the education track: [the Consumer Sector course](/kurser/km-044-konsumentsektorn) deepens the sector, [DuPont analysis](/kurser/ln-01-dupont-analysen) the return math, and [the complete Swedish stock analysis guide](/blogg/komplett-guide-svensk-aktieanalys-2026) the whole method.",

  "## Sources",

  "- H&M Group — Annual Report: gross margin, inventory and channel mix ([hmgroup.com](https://www.hmgroup.com))",
  "- LVMH — Annual Results: segments and margins ([lvmh.com](https://www.lvmh.com))",
  "- McDonald's Corporation — Annual Report: franchise model and rental income ([corporate.mcdonalds.com](https://corporate.mcdonalds.com/corpmcd/investors.html))",
  "- Axfood — Annual Report: comparable sales and capital turnover ([axfood.se](https://www.axfood.se))",
  "- National Institute of Economic Research — the consumer barometer: households' purchasing-power expectations ([konj.se](https://www.konj.se))",

  "_This is educational financial analysis, not investment advice._",
].join('\n\n');

const post = {
  slug: 'konsumentaktier-sa-analyserar-du-konsumentbolag-en',
  title: 'Consumer stocks: how to analyze consumer companies',
  description: "Consumer stocks: the brand as moat, the two worlds of margins and the DuPont math behind the sector's high ROE — with numbers and sources.",
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-09-17',
  readingMinutes: Math.round(body.split(/\s+/).filter(Boolean).length / 600),
  tags: ['consumer stocks', 'consumer companies', 'brand moat', 'DuPont analysis', 'consumer staples'],
  body,
};

const fil = join('/home/ak1a/AK1', 'data/blogg-utkast/konsumentaktier-sa-analyserar-du-konsumentbolag-en.json');
writeFileSync(fil, JSON.stringify(post, null, 2) + '\n');
console.log('SKRIVEN:', fil);
console.log('ord:', body.split(/\s+/).filter(Boolean).length, '· readingMinutes:', post.readingMinutes,
  '· title:', post.title.length, 'tkn · OG:', post.description.length, 'tkn');
