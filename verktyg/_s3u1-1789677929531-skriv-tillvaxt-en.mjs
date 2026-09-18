#!/usr/bin/env node
// s3-u1 (auto-s3-1789677929531): bygger Ö8 = B8-EN tillväxtaktier (engelsk översättning av B8)
// Kanal 1 (node) enligt skal-kvoten; JSON skriven med exakt BlogPost-form.
import { writeFileSync } from 'node:fs';

const post = {
  slug: 'tillvaxtaktier-sa-analyserar-du-tillvaxtbolag-en',
  title: 'Growth stocks: how to analyze growth companies',
  description: "Growth stocks: capital burn, the multiple's price and the width of scenarios. How to analyze growth companies — worked examples, medians and sources.",
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-09-17',
  readingMinutes: 2,
  tags: ['growth stocks', 'growth companies', 'capital burn', 'PEG ratio', 'scenario analysis'],
  body: `Growth stocks are shares in companies growing much faster than the market — priced on the future, not on yesterday. In AK1A's universe they are a sector of eleven companies: Tesla, Nvidia, Palantir, Shopify and MercadoLibre at the global top; Truecaller, PowerCell and Polestar on the Swedish floor — plus investment company Kinnevik, here for historical reasons. The sector's two defining numbers (raw data September 2026): the median forecast earnings growth is about 37 percent (n=10) against the universe's 9.9 — and the median P/E is 72.2 (n=8) against the universe's 20.5. Three and a half times the market's price, for almost four times the market's growth. This guide works through the premium, the cash and the uncertainty — education in method, never advice about individual stocks.

## What are growth stocks — three kinds of growth stories

The label covers three kinds of companies, and the sorting decides the analysis.

- **Profitable platform winners.** Nvidia, Tesla, MercadoLibre and Shopify have proven the business model: fast revenue growth and profitable operations. The question is how long the growth lasts — and what is already priced in.
- **Expansion companies with losses.** PowerCell and Polestar buy growth with cash: money drains away while factories and markets are built out. The question is whether the capital lasts until profit arrives — and how much ownership gets diluted.
- **Investment companies in the wrong box.** Kinnevik owns growth-company assets and should be analyzed on net asset value, not growth rate — Industrivärden's lesson in the industrial box. The method lives in [Investment companies](/kurser/km-067-investmentbolag).

The difference between the groups is the key sorting step: one risk is about valuation, the other about survival.

## Capital burn — cash is the clock

A growth company not yet making money lives on its cash; the clock measuring its life span is capital burn: cash burned per year. Worked example: a company with 1,000 million in cash and an annual operating cash flow of minus 250 million has a runway of 1,000 ÷ 250 = 4 years. Four years sounds long — but leaves no margin for late payers, and dilutive issues wait by the door long before zero. That is the mechanics of [share issues and dilution](/kurser/rk-02-emissionrisk); the arithmetic stands in [Capital burn](/kurser/v19-kapitalforbranning).

The data nuances the picture: the median free cash flow margin in the sector is actually 13.8 percent (n=11) — the group as a whole does not lose money. But the median cash flow yield (free cash flow over market capitalization) is 0.8 percent (n=11): the market pays 72 kronor for every krona of annual profit. The profitability exists — it is just extremely expensive for what is delivered today.

## The multiple — the price of the future is 3.5× the market's

A median P/E of 72.2 against the universe's 20.5 does not mean growth companies are irrationally priced — it means the multiple buys future profits that do not exist yet. Worked example: a company trades at P/E 70 and grows profit by 30 percent per year. If the price stands still for a year the P/E falls to 70 ÷ 1.30 ≈ 54 — growth pays down the multiple without a rising price. If profit instead stands still for two years, the same company remains at P/E 70 while the market trades at 20: the price must then fall about 70 percent to reach the market's multiple. That is why [the PEG ratio](/kurser/km-027-pegratio), P/E divided by the growth rate, is the sector's most used rough gauge. The universe's median PEG is 2.2 (n=8): roughly P/E 72 divided by forecast growth of 37. PEG works as an alarm clock but has known weaknesses — covered in [the PEG multiple's weaknesses](/blogg/peg-multipeln-svagheter-2026); where a multiple is meaningless, [EV/EBITDA](/blogg/vad-ar-ev-ebitda) or a [discounted cash flow analysis](/kurser/km-007-dcf) is used instead.

The most demanding question is what the price assumes. With [reverse DCF](/kurser/km-028-reverse-dcf) the calculation is turned around: what growth, for how many years, justifies today's price? If the answer is 30 percent per year for ten years — which few companies in history have delivered — the market has already paid for the best outcome. That is not an argument against the sector; it is the definition of the [margin of safety](/kurser/km-030-margin-of-safety).

## Profitability — on par with the market despite the multiple

The sector's most counterintuitive finding in the data: median return on equity is 15.1 percent (n=10) — in practice exactly the universe's 15.3. The gross margin of 47.8 percent (n=11) sits across the universe's median, and the median ROIC is 14.5 percent (n=10). Today's profitability is normal — while the price is 3.5 times normal. The premium does not buy better numbers today; it buys tomorrow's growth — the whole difference from owning the market lives in the assumptions about the future, not in today's report.

One detail deserves light: the median net margin is 5.9 percent (n=11) while the free cash flow margin is 13.8 — cash flow beats the accounting profit by almost eight percentage points. The reported result is often weighed down by depreciation, stock-based compensation and one-off items; the cash flow shows real cash strength. Read both — the difference is information, not noise.

## Scenarios instead of forecasts — the width of growth

The median forecast growth of 37 percent (n=10) carries a range from 15 to over 100 percent, and consensus numbers lean optimistic. Growth stocks are therefore best handled with scenarios rather than a single forecast. Worked example: a profit that grows 37 percent per year for five years becomes 1.37 to the power of 5 ≈ 4.8 times larger — nearly fivefold. Halve the growth to 18.5 percent and the outcome is 1.185 to the power of 5 ≈ 2.3. At 10 percent the result is 1.61. Same company, same sector, five years — a span from fivefold increase to 61 percent. When the outcome is unknown, [scenario analysis](/kurser/km-029-scenarioanalys) keeps hope and fear apart; price swings are handled with [volatility and standard deviation](/kurser/km-013-volatilitet-standardavvikelse) and return per unit of risk in [the Sharpe ratio](/kurser/km-016-sharpe-kvot).

## How to read a growth company's report

Five details deserve attention. First, growth quality: organic or acquisition-driven — covered in [organic versus acquired growth](/kurser/tx-01-organisk-mot-forvarvad-tillvaxt) — and recurring revenues (ARR) in [ARR growth](/kurser/v02-arr-tillvaxt). Second, the gross margin trend: a rising gross margin on growing volume is a strong sign of [pricing power and brand](/kurser/v14-varumarke). Third, the cash: balance, change per quarter and runway in years. Fourth, dilution: stock-based compensation is a salary cost paid with new shares — 2 percent per year becomes 1.02 to the power of 5 ≈ 1.10, more than 10 percent more shares over five years. Fifth, revenue stability — the share of revenues returning without new sales, measured in [Revenue stability](/blogg/v12-intaktsstabilitet-analys). The report-meeting framework stands in [The quarterly report](/kurser/km-006-kvartalsrapporten), the reading order in [How to read a Swedish annual report](/blogg/sa-laser-du-en-svensk-arsredovisning).

## The summary

- Sort the story first: platform winner, loss-making expansion company or investment company in the wrong box — three risk pictures behind the same label.
- Cash is the clock: 1,000 million with an annual burn of 250 million lasts four years — count the runway before you admire the growth.
- The multiple of 72.2 against the universe's 20.5 buys the future: the median PEG of 2.2 is the rough gauge, reverse DCF asks what the price has already paid.
- Today's profitability is normal (ROE 15.1 against 15.3) — the premium lives entirely in the growth assumptions, and 37 versus 18.5 versus 10 percent growth is the difference between a fivefold increase and 61 percent over five years.
- Read the report on growth's own terms: ARR, gross margin, cash runway, dilution and revenue stability.

Next in the education track: [Capital burn](/kurser/v19-kapitalforbranning) deepens the cash clock and [Reverse DCF](/kurser/km-028-reverse-dcf) the price; beginner mistakes are collected in [five beginner mistakes on the Swedish stock market](/blogg/5-vanliga-nyborjarmisstag-svenska-aktier). The sector's AKM2 medians and full range: [the sector medians page](/blogg/branschmedianer-akm2) (underlying data 2026-09-03).

## Sources

- Tesla, Inc. — Form 10-K: revenue growth, margins, capex ([sec.gov](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=TSLA&type=10-K))
- NVIDIA — Annual Report: data center revenue and gross margin ([nvidia.com](https://www.nvidia.com))
- Truecaller AB — reports: ARR and Swedish growth listing ([truecaller.com](https://www.truecaller.com))
- Nasdaq — Stockholm: company list and sector classification ([nasdaq.com](https://www.nasdaq.com))
- AK1A's company universe — key ratios per company, September 2026; medians with measured companies (n) on [the dataset page](/dataset)

_This is educational financial analysis, not investment advice._`,
};

const UTFIL = '/home/ak1a/AK1/data/blogg-utkast/tillvaxtaktier-sa-analyserar-du-tillvaxtbolag-en.json';
writeFileSync(UTFIL, JSON.stringify(post, null, 2) + '\n', 'utf8');
const ord = post.body.split(/\s+/).filter(Boolean).length;
console.log('SKRIVEN:', UTFIL);
console.log('ord (raw):', ord, '| title:', post.title.length, 'tkn | OG:', post.description.length, 'tkn');
