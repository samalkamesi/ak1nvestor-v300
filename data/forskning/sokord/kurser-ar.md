# Våg 138 · S3 — Arabisk nyckelfrasinventering ur kurskorpusen (333 kurser)

**Uppdrag:** Extrahera arabiska nyckelfraser ur kurskorpusen (`data/seo/kurser/`, 333 JSON-filer) och bygga en strukturerad inventering av arabiska sökordsfrön mappade mot kurserna, för /ar-sidornas organiska tillväxt.
**Agent:** S3 (våg 138, 9 parallella agenter — denna fil är S3:s exklusiva utdata).
**Datum:** 2026-09-14. **Dokumentspråk:** svenska; fraserna på arabiska.
**Juridikgrind:** Allt nedan är utbildningsformulerat ("så fungerar metoden", "så beräknas nyckeltalet") — aldrig råd om att köpa eller sälja en viss aktie (lagen 2007:528, 2 kap 5 §: utbildning är tillåtet).

---

## 1. Sammanfattning

- **Korpusen:** 333 kurs-JSON-filer i `data/seo/kurser/` (fält: title/description/keywords — svenska/engelska SEO-metadata). De arabiska motsvarigheterna lever i översättningskorpusen `data/oversattning-import/` (95 filer, **70 891 poster varav 70 283 med arabiskt fält**), där varje posts `nyckel` börjar med kurs-slugen (`t.ex. the-intelligent-investor:kap1:titel`). Matchning via det prefixet ger **333 av 333 kurser med arabiskt material — 100 % täckning**.
- **Fröutbyte:** 3 298 kurs-/kapitel-/blocktitlar + 3 210 quizposter gick igenom filtret; efter gallring av generella strukturrubriker ("الأساسيات", "التطبيق العملي" …) kvarstår **2 934 titelfrön + 2 133 quizfrön = 5 067 arabiska sökfrön**, mappade till enskilda kursfiler.
- **Tre viktigaste fynden** (motivering i § 8–9): (1) Korpusen är redan mättad med de pedagogiska frågemönster som dominerar arabiskspråkig finansiell sökning — ما هو (1 501 träffar), كيف (3 702), الفرق بين (595), أساسيات (729), أخطاء (696) — dvs. /ar-sidorna kan indexeras mot redan befintligt innehåll. (2) Kodväxlingen latinsk nyckeltalsterm + arabisk förklaring ("ما هو EV/EBITDA …") är korpusens starkaste long-tail-mönster — arabisksökande skriver ofta ROE/EBITDA/P/E latinskt och resten av frågan arabiskt. (3) Mönstret "للمبتدئين" (för nybörjare) finns bara 7 gånger i korpusen men är ett av de högsta volymmönstren i arabisk finanssökning — en systematisk lucka att fylla på /ar-sidorna.

## 2. Metod

Sondskript i `.zcode/sond/` (v138-s3-*.mjs), körda enligt skal-kvoten (skriptfil + kort `bash <fil>`; svar till fil som lästs med Read — inga häng i studiodirektsändningen):

1. **v138-s3-sond1.mjs** — konstaterade att `data/seo/kurser/*.json` enbart innehåller title/description/keywords på svenska/engelska (0 arabiska tecken i samtliga 333 filer).
2. **v138-s3-sond2.mjs** — fann arabiskt innehåll i `data/oversattning-import/` (97 träffar i data-trädet).
3. **v138-s3-huvudsond2.mjs** — grupperade alla 70 891 poster per kurs-slug (nyckelprefix), matchade mot de 333 SEO-filnamnen, körde frekvensanalys (unigram/bigram på titlar) och mönsterverifiering i hela ar-texten.
4. **v138-s3-frodata2.mjs + v138-s3-grupport2.mjs** — extraherade titel-/block-/quizfrön (≤95 tecken), gallrade generella strukturrubriker, poängsatte long-tail-styrka och valde toppfrön per grupp.

**Long-tail-skala (använd i tabellerna):**

| Nivå | Definition | SEO-roll |
|---|---|---|
| **STARK** | 3+ ord och/eller latinsk fackterm i arabiskt sammanhang; hög specificitet | Låg konkurrens, köpfärdig kursintention — bäst som /ar-sidors H1/underrubriker |
| **MEDEL** | Tvåordsbegrepp med tydlig sökintention | Kategoribeskrivningar, intern länkankare |
| **BREDD** | Enkelt/generellt begrepp, hög volym, hård konkurrens | Bra för översikts- och navsidor, ej realistisk topplacering direkt |

## 3. Korpusens kärnbegrepp (frekvensbevisade)

Topbegrepp ur 3 298 titlar — Arabiska begrepp att återanvända konsekvent över /ar (translitteration och svensk motsvarighet). Antal = förekomster i titelkorpusen.

| Arabiska | Translitteration | Svenskt | Antal |
|---|---|---|---|
| دراسات الحالة | dirāsāt al-ḥāla | fallstudier | 208 |
| التطبيق العملي | at-taṭbīq al-ʿamalī | praktisk tillämpning | 205 |
| الفخاخ الشائعة | al-fikhākh ash-shāʾiʿa | vanliga fällor | 120 |
| القيمة | al-qīma | värdet | 67 |
| المخاطر | al-makhāṭir | riskerna | 55 |
| الأسهم | al-asḥum | aktierna | 54 |
| السوق | as-sūq | marknaden | 52 |
| المحفظة | al-maḥfaẓa | portföljen | 33 |
| الخندق التنافسي | al-khandaq at-tanāfusī | konkurrensvallen (moat) | 43 |
| رأس المال | raʾs al-māl | kapital | 37 |
| التوزيعات | at-tawzīʿāt | utdelningarna | 29 |
| النمو | an-numūw | tillväxt | 31 |
| تحليل | taḥlīl | analys | 26 |
| الأخطاء الشائعة | al-akhtāʾ ash-shāʾiʿa | vanliga fel | 32 |
| شراء الأسهم | shirāʾ al-asḥum | aktieköp | 19 |
| التدفق النقدي | at-tadaffuq an-naqdī | kassaflödet | 15 |
| العلامة التجارية | al-ʿalāma at-tijāriyya | varumärket | 14 |
| هكذا تحللها | hākadhā tuḥalliluhā | "så analyserar du den" | 11 |
| الميزانية العمومية | al-mīzāniyya al-ʿumūmiyya | balansräkningen | 11 |
| سعر الفائدة | siʿr al-fāʾida | räntesatsen | 11 |
| حقوق الملكية | ḥuqūq al-milkiyya | eget kapital | 10 |
| هامش الأمان | hāmish al-amān | säkerhetsmarginalen | 10 |
| إعادة شراء | iʿādat shirāʾ | återköp | 10 |
| براءات الاختراع | barāʾāt al-ikhtirāʿ | patenten | 8 |
| خطوة بخطوة | khuṭwa bi-khuṭwa | steg för steg | 8 |
| معامل بيتا | muʿāmil bītā | betakoefficienten | 8 |
| قائمة التحقق | qāʾimat at-taḥqīq | checklistan | 7 |
| نسبة الدين | nisbat ad-dayn | skuldkvoten | 7 |
| الدعم والمقاومة | ad-daʿm wa-l-muqāwama | stöd och motstånd | 6 |
| بناء المحفظة | bināʾ al-maḥfaẓa | portföljbyggande | 6 |
| أثر الشبكة | athar ash-shabaka | nätverkseffekten | 6 |
| الرافعة المالية | ar-rāfiʿa al-māliyya | finansiell hävstång | 6 |
| التقرير السنوي | at-taqrīr as-sanawī | årsredovisningen | 6 |
| المال العامل | al-māl al-ʿāmil | rörelsekapital | 6 |
| خطوط الاتجاه | khuṭūṭ al-ittijāh | trendlinjerna | 6 |

---

## 4. Grupperad fröinventering

Alla 333 kursfiler är fördelade på 13 grupper (20+11+70+14+15+15+5+11+8+25+20+11+108 = 333). Tabellerna visar de starkaste fröna per grupp; samtliga 5 067 frön finns maskinläsbart i `.zcode/sond/v138-s3-frodata2.json` (källa för framtida automatiserad meta-generering).

### Grupp A — V20 fundamentvariabler (20 kurser)

Kursfiler: `v01-forsaljningstillvaxt v02-arr-tillvaxt v03-intaktsdiversifiering v04-ps v05-pb v06-ev-ebitda v07-bruttomarginal v08-ebitda-marginal v09-roe v10-skuldsattningsgrad v11-likviditet v12-intaktsstabilitet v13-patent-ip v14-varumarke v15-natverkseffekter v16-produktlanseringar v17-avtal-partnerskap v18-regulatoriska v19-kapitalforbranning v20-aterekop-egna-aktier` (+ `vagfundament-variablerna-som-tidsserier` i bokgruppen).

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| العائد على حقوق الملكية — كم ربحًا تخلق الشركة لكل كرونة؟ | al-ʿāʾid ʿalā ḥuqūq al-milkiyya — avkastning på eget kapital per krona | v09-roe | STARK |
| ما هو EV/EBITDA ولماذا هو المفضل لدى المحلل | mā huwa EV/EBITDA — vad är EV/EBITDA och varför föredras det av analytiker | v06-ev-ebitda | STARK |
| دورة حياة SaaS — من الشركة الناشئة إلى شركات ARR الناضجة | SaaS-livscykeln — från startups till mogna ARR-bolag | v02-arr-tillvaxt | STARK |
| NRR وchurn — المحرك الأساسي الكامن خلف ARR | NRR och churn — motorn bakom ARR | v02-arr-tillvaxt | STARK |
| ما هو الخندق التنافسي — ولماذا تعد براءات الاختراع أحدث صوره | vad är konkurrensvallen — och varför är patent dess modernaste form | v13-patent-ip | STARK |
| الموافقة على الأدوية — FDA وEMA وPDUFA | läkemedelsgodkännanden — FDA, EMA, PDUFA | v18-regulatoriska | STARK |
| ROE المدفوع بالديون — خطورة الرافعة المالية المرتفعة | skuldammad ROE — faran med hög hävstång | v09-roe | STARK |
| الإهلاكات — تكلفة حقيقية أم وهم من أوهام المحاسبة؟ | avskrivningar — reell kostnad eller bokföringsillusion? | v08-ebitda-marginal | STARK |
| اقتصاديات براءات الاختراع — دورة الحياة والجودة والتحويل التجاري | patentekonomi — livscykel, kvalitet, kommersialisering | v13-patent-ip | STARK |
| قوة العلامة التجارية — فن الصبر في الخندق التنافسي | varumärkeskraften — tålens konst i vallen | v14-varumarke | STARK |
| القوة التسعيرية — الدليل الاقتصادي على قوة العلامة التجارية | prissättningskraften — ekonomiskt bevis på varumärkesstyrka | v14-varumarke | STARK |
| معدل الاحتراق والمدى الزمني والرياضيات الكامنة وراء البقاء | burn rate, runway och överlevnadsmatematiken | v19-kapitalforbranning | STARK |
| تمركز العملاء — الفخ الأكثر شيوعًا | kundkoncentration — den vanligaste fällan | v03-intaktsdiversifiering | STARK |
| ميكانيكا الاتفاقية — ما يحدد ما إذا كانت تخلق قيمة | avtalsmekanik — vad avgör om den skapar värde | v17-avtal-partnerskap | STARK |

### Grupp B — VM värderingsmodeller (11 kurser)

Kursfiler: `vm-01-grahams-formel vm-02-intrinsic-value vm-03-multipelval vm-04-cyklisk-justering vm-05-realoptioner vm-06-dividend-discount-model-ddm vm-07-free-cash-flow-yield vm-08-evsales vm-09-pricetocashflow vm-10-assetbased-valuation vm-11-waccfallor`.

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| التعديل الدوري — نسبة CAPE / Shiller P/E وأثره في صناعة القرار | cyklisk justering — CAPE/Shiller P/E och dess beslutspåverkan | vm-04-cyklisk-justering | STARK |
| اختيار مضاعف التقييم — متى تستخدم أيها | val av multipel — när används vilken | vm-03-multipelval | MEDEL |
| نموذج الخصم للتوزيعات (DDM) | utdelningsdiskonteringsmodellen (DDM) | vm-06-dividend-discount-model-ddm | MEDEL |
| عائد التدفق النقدي الحر | free cash flow-yield | vm-07-free-cash-flow-yield | MEDEL |
| السعر إلى التدفق النقدي | pris/kassaflöde (P/CF) | vm-09-pricetocashflow | MEDEL |
| التقييم القائم على الأصول | tillgångsbaserad värdering | vm-10-assetbased-valuation | MEDEL |
| معادلة غراهام | Grahams formel | vm-01-grahams-formel | BREDD |
| القيمة الحقيقية | inre värdet | vm-02-intrinsic-value | BREDD |
| الخيارات الحقيقية | reala optioner | vm-05-realoptioner | BREDD |
| مصائد WACC | WACC-fällor | vm-11-waccfallor | MEDEL |

### Grupp C — KM kunskapsmoduler: redovisning, nyckeltal, risk, sektorer, skatt, makro m.m. (70 kurser)

Kursfiler (blocket 70): `km-001-bokforingens-grunder` t.o.m. `km-070-natmaklare-i-sverige` — fullständig uppräkning: km-001-bokforingens-grunder, km-002-forvaltningsberattelsen, km-003-kassaflodesanalysen, km-004-noter, km-005-eget-kapital-utdelningar, km-006-kvartalsrapporten, km-007-dcf, km-008-wacc, km-009-pe, km-010-evebit, km-011-relativ-vardering, km-012-sum-of-the-parts-sotp, km-013-volatilitet-standardavvikelse, km-014-korrelation-diversifiering, km-015-beta-capm, km-016-sharpe-kvot, km-017-position-sizing-kelly-kriteriet, km-018-forlustaversion, km-019-bekraftelsefalla, km-020-ankareffekt, km-021-avskrivningsprinciper, km-022-goodwill-och-immateriella-tillgangar, km-023-leasing, km-024-segmentrapportering, km-025-pensionsataganden, km-026-relaterade-parter, km-027-pegratio, km-028-reverse-dcf, km-029-scenarioanalys, km-030-margin-of-safety, km-031-var, km-032-stresstesting-portfoljen, km-033-tailrisk-hedging, km-034-drawdownanalys, km-035-flockbeteende, km-036-overconfidence, km-037-disposition-effect, km-038-techsektorn, km-039-pharmasektorn, km-040-banksektorn, km-041-industrisektorn, km-042-fastighetsektorn, km-043-energisektorn, km-044-konsumentsektorn, km-045-materialsektorn, km-046-telekomsektorn, km-047-utilitysektorn, km-048-halsovardsektorn, km-049-bolagsskatt-206, km-050-utdelningsskatt-30, km-051-kapitalvinstskatt, km-052-isk, km-053-312reglerna, km-054-ranta, km-055-inflation, km-056-centralbanker, km-057-konjunkturcykler, km-058-valutor, km-059-optionsgrunder, km-060-covered-calls, km-061-protective-puts, km-062-blackscholes, km-063-direktavkastning, km-064-utdelningstillvaxt, km-065-dogs-of-the-dow, km-066-utdelning-vs-aterkop, km-067-investmentbolag, km-068-wallenbergsfaren, km-069-orderbok-och-prissattning, km-070-natmaklare-i-sverige. (Urval frön; övriga i frödata-json.)

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| الإيضاحات المتممة للقوائم المالية — المعلومات الخفية | noterna till rapporterna — den dolda informationen | km-004-noter | STARK |
| نسبة شارب = (عائد المحفظة − العائد الخالي من المخاطر) / الانحراف المعياري | Sharpe-kvoten = (portföljavkastning − riskfria räntan)/standardavvikelsen | km-016-sharpe-kvot | STARK |
| نسبة PEG = (سعر السهم / ربحية السهم) / نمو الأرباح السنوي | PEG = (P/E) / årlig vinsttillväxt i procent | km-027-pegratio | STARK |
| دفتر الأوامر أشبه بصورة أشعة لنبض السوق | orderboken som röntgen av marknadspulsen | km-069-orderbok-och-prissattning | STARK |
| مكون الإيجار — جزء من أصل أساسي يحق للشركة استخدامه | lease-komponenten — rätten att använda en tillgång mot betalning | km-023-leasing | STARK |
| WACC — تكلفة رأس المال المرجحة | WACC — vägd kapitalkostnad | km-008-wacc | MEDEL |
| P/E — تعمق في نسبة السعر إلى الأرباح | P/E — på djupet | km-009-pe | MEDEL |
| EV/EBIT — أنظف من P/E | EV/EBIT — renare än P/E | km-010-evebit | MEDEL |
| DCF — التدفقات النقدية المخصومة | DCF — diskonterade kassaflöden | km-007-dcf | MEDEL |
| معامل بيتا و CAPM | beta och CAPM | km-015-beta-capm | MEDEL |
| تحديد حجم المركز ومعيار كيلي | positionstorlek och Kelly-kriteriet | km-017-position-sizing-kelly-kriteriet | MEDEL |
| VaR — القيمة عند المخاطرة | VaR — value at risk | km-031-var | MEDEL |

### Grupp D — PF portföljbyggande (14 kurser)

Kursfiler: `pf-01-portfoljbyggande pf-02-position-sizing pf-03-diversifiering pf-04-rebalansering pf-05-utdelningsstrategi pf-06-aterinvestering pf-07-krishantering pf-08-isk-vs-aktiedepa pf-09-taxloss-harvesting pf-10-longshort pf-11-koncentrerad-portfolj pf-12-arsrapportering pf-13-esgportfolj pf-14-pensionssparande`.

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| المحفظة المركزة — امتلاك 5–10 شركات بعمق | koncentrerad portfölj — 5–10 bolag på djupet | pf-11-koncentrerad-portfolj | STARK |
| الادخار للتقاعد — الادخار طويل الأجل | pensionssparande — långsiktigt sparande | pf-14-pensionssparande | STARK |
| إعادة الاستثمار — سعر الفائدة المركب في المحفظة | återinvestering — ränta-på-ränta i portföljen | pf-06-aterinvestering | STARK |
| ISK مقابل حساب الأسهم | ISK mot aktiedepå | pf-08-isk-vs-aktiedepa | MEDEL |
| المحفظة وفق معايير ESG | portfölj enligt ESG-kriterier | pf-13-esgportfolj | MEDEL |
| المراكز الطويلة والقصيرة — التحوط | långa/korta positioner — hedging | pf-10-longshort | MEDEL |
| حصاد الخسائر الضريبية | tax loss harvesting | pf-09-taxloss-harvesting | MEDEL |
| بناء المحفظة | portföljbyggande | pf-01-portfoljbyggande | BREDD |
| إعادة الموازنة | ombalansering | pf-04-rebalansering | BREDD |

### Grupp E — RK riskkurser (15 kurser)

Kursfiler: `rk-01-kapitalforbranning rk-02-emissionrisk rk-03-skuldfalla rk-04-likviditetskris rk-05-cykelrisk rk-06-regulatorisk-risk rk-07-valutarisk rk-08-ranterisk rk-09-koncentrationsrisk rk-10-korrelationsrisk rk-11-bedrageririsk rk-12-black-swanrisk rk-13-gdpr-och-datarisk rk-14-esgrisk rk-15-cykelrisk`.

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| البجعة السوداء — حدث غير متوقع ذو أثر سلبي كبير | svarta svanen — oväntad händelse med stor negativ effekt | rk-12-black-swanrisk | STARK |
| اختبار الضغط — صمود المحفظة في ظروف قصوى مستبعدة | stresstest — portföljens motståndskraft under extrema förhållanden | rk-12-black-swanrisk | STARK |
| المخاطر المرتبطة بإصدار أسهم — تخفيف الملكية | emissionsrisk — utspädning av ägandet | rk-02-emissionrisk | STARK |
| المخاطر المتعلقة بمعايير ESG — البيئة والجوانب الاجتماعية | ESG-risker — miljö och sociala aspekter | rk-14-esgrisk | STARK |
| احتراق رأس المال — المدى النقدي | kapitalbränning — kassaräckvidd | rk-01-kapitalforbranning | MEDEL |
| GDPR والمخاطر المتعلقة بالبيانات | GDPR och datarisker | rk-13-gdpr-och-datarisk | MEDEL |
| مخاطر أسعار الفائدة — المدة | ränterisk — duration | rk-08-ranterisk | MEDEL |
| فخ الديون | skuldfällan | rk-03-skuldfalla | BREDD |
| أزمة السيولة | likviditetskrisen | rk-04-likviditetskris | BREDD |

### Grupp F — SE sektorsanalyser (15 kurser)

Kursfiler: `se-01-saassektorn se-02-halvledarsektorn se-03-forsvarssektorn se-04-logistiksektorn se-05-lyxsektorn se-06-finanssektorn se-07-detailhandel se-08-media se-09-bil se-10-flyg se-11-krypto se-12-spel se-13-utbildning se-14-livsmedel se-15-logistik`.

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| الإعلام — Spotify وMTG والاضطراب في البث | medier — Spotify, MTG och sändningsomvälvningen | se-08-media | STARK |
| تجارة التجزئة — الحجم والتجارة الإلكترونية | detaljhandel — skala och e-handel | se-07-detailhandel | MEDEL |
| الأغذية — السلع الأساسية والعلامة التجارية | livsmedel — basvaror och varumärke | se-14-livsmedel | MEDEL |
| العملات المشفرة — المخاطر القصوى | kryptovalutor — extremrisk | se-11-krypto | MEDEL |
| قطاع أشباه الموصلات | halvledarsektorn | se-02-halvledarsektorn | BREDD |
| قطاع السلع الفاخرة | lyxsektorn | se-05-lyxsektorn | BREDD |
| القطاع المالي — التأمين | finanssektorn — försäkring | se-06-finanssektorn | BREDD |

### Grupp G — SJ skatt & juridik nära (5 kurser)

Kursfiler: `sj-01-utlandsk-kallskatt sj-02-cryptobeskattning sj-03-bolagsstamma-och-rostratt sj-04-optionsbeskattning sj-05-kapitalforsakring-vs-isk`.

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| سعر الممارسة — السعر المتفق عليه للخيار (كول/بوت) | lösenpris (strike) — överenskommet pris för option (köp/sälj) | sj-04-optionsbeskattning | STARK |
| التأمين الرأسمالي مقابل ISK | kapitalförsäkring mot ISK | sj-05-kapitalforsakring-vs-isk | MEDEL |
| الضرائب على العملات المشفرة | beskattning av kryptovalutor | sj-02-cryptobeskattning | MEDEL |
| الجمعية العمومية وحق التصويت | bolagsstämma och rösträtt | sj-03-bolagsstamma-och-rostratt | MEDEL |
| ضريبة المصدر الأجنبية | utländsk källskatt | sj-01-utlandsk-kallskatt | BREDD |

### Grupp H — MK makro (11 kurser)

Kursfiler: `mk-01-bnp-och-tillvaxt mk-02-arbetsloshet mk-03-handelsbalans mk-04-statsobligationer mk-05-geopolitik mk-06-penningpolitik mk-07-fiscal-politik mk-08-omvand-yield-curve mk-09-deflation-vs-inflation mk-10-oljepris mk-11-kinaekonomin`.

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| السياسة النقدية — QE وQT | penningpolitik — QE och QT | mk-06-penningpolitik | STARK |
| سعر النفط — محرك اقتصادي كلي | oljepriset — makroekonomisk motor | mk-10-oljepris | MEDEL |
| الناتج المحلي الإجمالي والنمو | BNP och tillväxt | mk-01-bnp-och-tillvaxt | MEDEL |
| السياسة المالية — ميزانية الدولة | finanspolitik — statens budget | mk-07-fiscal-politik | MEDEL |
| منحنى العائد المقلوب | den inverterade avkastningskurvan | mk-08-omvand-yield-curve | BREDD |
| الانكماش مقابل التضخم | deflation mot inflation | mk-09-deflation-vs-inflation | BREDD |
| الاقتصاد الصيني | Kina-ekonomin | mk-11-kinaekonomin | BREDD |

### Grupp I — UD utdelning (8 kurser)

Kursfiler: `ud-01-payout-ratio ud-02-aterinvestering ud-03-dividend-aristocrats ud-04-utdelningsfallor ud-05-drip ud-06-svenska-utdelningsaktier ud-07-utdelningskalender ud-08-speciella-utdelningar`.

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| نسبة التوزيع — نسبة الربح التي يتم توزيعها | utdelningskvot — andel av vinsten som delas ut | ud-01-payout-ratio | STARK |
| تقويم التوزيعات — توزيعات ربع سنوية وسنوية | utdelningskalender — kvartals- och årsutdelningar | ud-07-utdelningskalender | STARK |
| DRIP — إعادة الاستثمار التلقائية | DRIP — automatisk återinvestering | ud-05-drip | MEDEL |
| الأسهم السويدية ذات التوزيعات | svenska utdelningsaktier | ud-06-svenska-utdelningsaktier | MEDEL |
| مصائد التوزيعات | utdelningsfällor | ud-04-utdelningsfallor | BREDD |
| أرستقراطيو التوزيعات | dividend aristocrats | ud-03-dividend-aristocrats | BREDD |

### Grupp J — TS teknisk analys AK1TS (25 kurser)

Kursfiler: `ts-01-elliott-wave` … `ts-25-market-profile` (ts-01, ts-02, ts-03-fibonacciretracements, ts-04-fibonacciextensions, ts-05-gannvinklar, ts-06-ganncyklar, ts-07-lucastalserie, ts-08-volymanalys, ts-09-volymprofiler, ts-10-ak1ts-25cellers-matris, ts-11-candlestickmonster, ts-12-moving-averages, ts-13-rsi, ts-14-macd, ts-15-bollinger-bands, ts-16-stod-och-motstand, ts-17-trendlinjer, ts-18-chartmonster, ts-19-fibonaccitidszoner, ts-20-harmoniska-monster, ts-21-fibonaccikluster, ts-22-elliott-wave, ts-23-volume-spread-analysis-vsa, ts-24-order-flow, ts-25-market-profile).

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| شمعة الزخم — نمط شموع يؤكد الاتجاه الجاري | momentum-candle — mönster som bekräfter trenden | ts-11-candlestickmonster | STARK |
| مصفوفة AK1TS ذات 25 خلية | AK1TS 25-cellsmatrisen | ts-10-ak1ts-25cellers-matris | MEDEL |
| Elliott Wave — الموجة الدافعة ذات 5 موجات | Elliott Wave — 5-vågors impuls | ts-01-elliott-wave | MEDEL |
| تحليل انتشار الحجم (VSA) | Volume Spread Analysis (VSA) | ts-23-volume-spread-analysis-vsa | MEDEL |
| تدفق الأوامر — عمق السوق | orderflöde — marknadsdjup | ts-24-order-flow | MEDEL |
| ملامح الحجم — VPOC | volymprofiler — VPOC | ts-09-volymprofiler | MEDEL |
| مستويات الارتداد لفيبوناتشي | fibonacci-retracementnivåer | ts-03-fibonacciretracements | BREDD |
| أنماط الشموع اليابانية | japanska candlestickmönster | ts-11-candlestickmonster | BREDD |
| الدعم والمقاومة | stöd och motstånd | ts-16-stod-och-motstand | BREDD |

### Grupp K — PC case-bolag (20 kurser)

Kursfiler: `pc-01-case-atlas-copco pc-02-case-astrazeneca pc-03-case-swedbank pc-04-case-investor-ab pc-05-case-volvo-ab pc-06-case-hm pc-07-case-sinch pc-08-case-precise-biometrics pc-09-case-novo-nordisk pc-10-case-ericsson pc-11-case-boliden pc-12-case-skf pc-13-case-ssab pc-14-case-electrolux pc-15-case-kambi pc-16-case-beijer-ref pc-17-case-sandvik pc-18-case-oresund pc-19-case-hoganas pc-20-case-essity`.

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| دراسة حالة: SKF — الخندق التنافسي الصناعي | fallstudie: SKF — den industriella vallen | pc-12-case-skf | STARK |
| دراسة حالة: Höganäs — احتكار في مسحوق الحديد | fallstudie: Höganäs — monopol på järnpulver | pc-19-case-hoganas | STARK |
| Oresund — شركة استثمار سويدية | Öresund — svenskt investmentbolag | pc-18-case-oresund | STARK |
| دراسة حالة: SSAB — الصلب الدوري | fallstudie: SSAB — cykliskt stål | pc-13-case-ssab | MEDEL |
| دراسة حالة: Electrolux — الابتكار التخريبي | fallstudie: Electrolux — disruptiv innovation | pc-14-case-electrolux | MEDEL |
| دراسة حالة: AstraZeneca | fallstudie: AstraZeneca | pc-02-case-astrazeneca | MEDEL |
| دراسة حالة: Beijer Ref — توزيع التبريد | fallstudie: Beijer Ref — kyl distribution | pc-16-case-beijer-ref | MEDEL |
| دراسة حالة: Boliden — المناجم | fallstudie: Boliden — gruvor | pc-11-case-boliden | BREDD |

### Grupp L — BF beteendefinans (11 kurser)

Kursfiler: `bf-01-tillganglighetsfalla bf-02-sunk-cost bf-03-mental-accounting bf-04-investera-som-en-robot bf-05-ankareffekt bf-06-tillganglighetsheuristik bf-07-framstegseffekt bf-08-priming bf-09-haloeffekt bf-10-dunningkruger bf-11-kognitiv-bias`.

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| تأثير الإرساء — التعلق بسعر الشراء | ankareffekten — fästet vid inköpspriset | bf-05-ankareffekt | STARK |
| التهيئة — التأثر بانطباعات غير ذات صلة | priming — påverkan av irrelevanta intryck | bf-08-priming | STARK |
| التحيز المعرفي — قائمة كاملة | kognitiva biaser — komplett lista | bf-11-kognitiv-bias | MEDEL |
| فخ الانحياز للإتاحة | tillgänglighetsfällan | bf-01-tillganglighetsfalla | MEDEL |
| التكلفة الغارقة | sunk cost | bf-02-sunk-cost | BREDD |
| المحاسبة الذهنية | mental accounting | bf-03-mental-accounting | BREDD |
| تأثير الهالة | haloeffekten | bf-09-haloeffekt | BREDD |

### Grupp M — Bokklassiker & fördjupningskurser (108 kurser)

Kursfiler (108): 100-baggers, a-random-walk-down-wall-street, against-the-gods, ak1ts-vaglarans-hierarki, akm1-den-kontroversiella-modellen, all-about-asset-allocation, analysis-for-financial-management, blue-ocean-strategy, bollinger-on-bollinger-bands, bull-a-history-of-boom-and-bust, charlie-munger-complete-investor, come-into-my-trading-room, common-sense-on-mutual-funds, common-stocks-uncommon-profits, competition-demystified, contrarian-investment-strategies, creative-cash-flow-reporting, devil-take-the-hindmost, distress-investing, elliott-wave-principle, encyclopedia-of-chart-patterns, expectations-investing, extraordinary-popular-delusions, fibonacci-applications, financial-shenanigans, financial-statement-analysis-and-security-valuation, flash-boys, fooled-by-randomness, fooling-some-of-the-people, foretagsvardering-med-fundamental-analys, good-to-great, how-to-make-money-in-stocks, intermarket-analysis, interpretation-of-financial-statements, investment-valuation, irrational-exuberance, japanese-candlestick-charting, konfluens-varde-moter-vagor, liars-poker, made-in-america, manias-panics-and-crashes, margin-of-safety, market-mind-games, market-wizards, martin-pring-on-market-momentum, mina-basta-investeringar, misbehaving, of-permanent-value, one-up-on-wall-street, origins-of-the-crash, poor-charlies-almanack, portfolj-ekosystemet, principles-of-corporate-finance, quality-of-earnings, quantitative-value, reminiscences-of-a-stock-operator, security-analysis, shoe-dog, stocks-for-the-long-run, tanka-snabbt-och-langsamt, technical-analysis-financial-markets, technical-analysis-of-stock-trends, teknisk-analys-med-johnny-torssell, the-acquirers-multiple, the-alchemy-of-finance, the-art-of-short-selling, the-big-short, the-black-swan, the-bogleheads-guide-to-investing, the-complete-turtletrader, the-dhandho-investor, the-essays-of-warren-buffett, the-everything-store, the-five-rules-for-successful-stock-investing, the-great-crash-1929, the-hour-between-dog-and-wolf, the-innovators-dilemma, the-intelligent-asset-allocator, the-intelligent-investor, the-little-book-of-value-investing, the-little-book-that-beats-the-market, the-master-swing-trader, the-money-game, the-most-important-thing, the-new-science-of-technical-analysis, the-outsiders, the-psychology-of-money, the-signal-and-the-noise, the-snowball, the-theory-of-investment-value, the-trend-following-bible, the-visual-investor, the-warren-buffett-portfolio, the-warren-buffett-way, this-time-is-different, trading-for-a-living, trading-in-the-zone, vagfundament-variablerna-som-tidsserier, valuation-measuring-managing, value-investing-from-graham-to-buffett, var-ekonomi, way-of-the-turtle, what-works-on-wall-street, when-genius-failed, winning-the-losers-game, you-can-be-a-stock-market-genius, your-money-and-your-brain, zero-to-one.

Denna grupp har korpusens rikaste unika fröskatt — kapitelrubriker som bär bokens kärnbudskap på arabiska. Urval i fyra teman:

**Värdeinvesteringens klassiker**

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| إذا كان ربحك يتطلب أن يشتري شخص آخر بسعر أعلى — فهذه مضاربة | om vinsten kräver att någon annan köper dyrare — då är det spekulation | the-intelligent-investor | STARK |
| القيمة نطاق لا نقطة — الهامش هو ما يتبقى عند الطرف المتشائم | värdet är ett intervall inte en punkt — marginalen är vad som återstår i pessimiständen | margin-of-safety | STARK |
| فئة أصول لم تُظهر خسارة قط لم تواجه اختبارها بعد | en tillgångsklass utan förluster har bara inte testats än | margin-of-safety | STARK |
| الفئة تحدد اللعبة كلها — الفئات الست | kategorin avgör hela spelet — de sex kategorierna | mina-basta-investeringar | STARK |
| See's Candies عام 1972 — الاختراق في الخندق التنافسي | See's Candies 1972 — genombrottet för konkurrensvallen | of-permanent-value | STARK |
| الميزانية العمومية أولًا — النقد والدين والمسافة عن الإفلاس | balansräkningen först — kassa, skuld, avstånd till konkurs | one-up-on-wall-street | STARK |
| الشركات الجيدة — ROIC، العائد على رأس المال المستثمر | bra bolag — ROIC, avkastning på investerat kapital | the-little-book-that-beats-the-market | STARK |

**Trading och teknik**

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| السعر هو مزاج الجمهرة والحجم هو شدة صوتها | priset är massans sinnesstämning, volymen dess röststyrka | trading-for-a-living | STARK |
| لا يمكنك تداول السوق — أنت تتداول صورتك عن السوق | du traderar inte marknaden — du traderar din bild av den | market-wizards | STARK |
| الوقف أولاً ثم الحجم — ترتيب إلدر | stoppen först, sedan storleken — Elders ordning | trading-for-a-living | STARK |
| الانفراج دليل إنهاك لا ساعة توقيت | divergens är utmattningens bevis, inte en klocka | trading-for-a-living | STARK |
| متابعة الاتجاه على الأسهم — IBD50 وEMA لأجل 200 يوم | trendföljning på aktier — IBD50 och 200-dagars EMA | the-trend-following-bible | STARK |

**Kriser, bubblor och finanshistoria**

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| البنوك لا تموت لأنها مخطئة — بل لأن التمويل يُسحب | banker dör inte för att de har fel — utan för att finansieringen dras | the-big-short | STARK |
| الارتباط ليس خاصية في الأصول — بل خاصية في الهلع | korrelation är inte en egenskap hos tillgångar — utan hos panik | when-genius-failed | STARK |
| القاعدة التي لم تُحدد قبل البيانات هي دعاية لا برهان | en regel som inte definierats före data är propaganda, inte bevis | a-random-walk-down-wall-street | STARK |
| محركات الجمهور الثلاثة — التقليد والسلطة والحكاية | massans tre motorer — imitation, auktoritet, berättelse | extraordinary-popular-delusions | STARK |

**Redovisningsdjup och företagsbyggande**

| Arabisk nyckelfras | Translitteration / svenska | Kursfil | Styrka |
|---|---|---|---|
| الحيلة: الإيرادات المختلقة — عملاء مخترعون | tricket: påhittade intäkter — fingerade kunder | financial-shenanigans | STARK |
| التشغيل مقابل التمويل — NOA وNFO وCSE | drift mot finansiering — NOA, NFO, CSE | financial-statement-analysis-and-security-valuation | STARK |
| RNOA — العائد على صافي الأصول التشغيلية | RNOA — avkastning på nettooperationella tillgångar | financial-statement-analysis-and-security-valuation | STARK |
| إن بنيته، فهل سيأتون؟ — CAC مقابل LTV | bygger du det, kommer de då? — CAC mot LTV | zero-to-one | STARK |
| المحيطات الحمراء والزرقاء — الصراع مقابل خلق الطلب | röda och blå oceaner — kamp om efterfrågan eller skapande av den | blue-ocean-strategy | MEDEL |
| سمات الاحتكار الأربع — التقنية والشبكة والحجم والعلامة | monopolins fyra drag — teknologi, nätverk, skala, varumärke | zero-to-one | STARK |

---

## 5. Pedagogiska sökmönster i arabiskspråkig finansiell sökning — bevisade i korpusen

Förekomst i hela ar-textkorpusen (70 283 poster), räknade maskinellt:

| Mönster | Arabiska | Antal i korpusen | Sökbeteende det speglar | Åtgärd för /ar-sidorna |
|---|---|---|---|---|
| Frågeformat | ما هو / ما هي ("vad är") | 1 501 | Den dominerande nybörjarfrågan | Använd som H1-mall: "ما هو P/E؟ — شرح مبسط" (utbildningsformulerat) |
| Instruktionsformat | كيف ("hur") | 3 702 | "how to"-intention, hög kursrelevans | "كيف تحسب ROE — خطوة بخطوة" som guideavsnitt i kurserna |
| Jämförelseformat | الفرق بين ("skillnaden mellan") | 595 | Jämförelseintention före beslut att lära | Bygg jämförelseblock: "الفرق بين ISK وحساب الأسهم", "الفرق بين الدفع والتوزيع" |
| Kursord | دورة ("kurs") | 5 724 | Explicit utbildningsintention | Ständigt i metadata: "دورة تحليل الأسهم", "دورة المحاسبة المالية" |
| Grundläggande | أساسيات ("grunderna") | 729 | Serieformat "grunderna i X" | Nav-sida: "أساسيات الاستثمار في الأسهم" som entrance till Fas 1 |
| Felfokus | أخطاء ("fel") + الشائعة ("vanliga") | 696 + 197 | Riskavståndsmotiverat lärande | "أخطاء شائعة في قراءة القوائم المالية" — fällorna som innehållsserie |
| Förklaring | شرح ("förklaring") | 351 | Handledningsformat | "شرح نموذج DCF" som videokurs-titel |
| Lärande | تعلم ("lär dig") | 434 | Kompetensbyggande | "تعلم قراءة الميزانية العمومية" |
| Stegformat | خطوة بخطوة ("steg för steg") | 8 (endast i titlar) | Processökning | Systematisera: varje nyckeltalskurs får ett steg-för-steg-block |
| Nybörjarmärke | للمبتدئين ("för nybörjare") | 7 | **Lucka!** Ett av de volymstarkaste mönstren i arabisk finanssökning | Lägg till i /ar-meta: "للمبتدئين" på alla grundläggande sidor och nybörjarnivåer |

**Kodväxling latinskt/arabiskt:** Korpusen skriver nyckeltalstermer latinskt (EV/EBITDA, ROE, P/E, WACC, DCF, V01–V20) mitt i arabisk text. Det speglar verkligt sökbeteende: arabisksökande använder ofta de engelska facktermerna latinskt och kontexten arabiskt. Rekommendation: behåll termerna latinska i /ar-titlar och metadata (inte translittererade), med arabisk förklaring efter — mönstret "ما هو EV/EBITDA" är korpusens enskilt starkaste long-tail-format.

**RTA/LTR-teknisk not:** I HTML-meta på arabiska bör `dir="rtl"` sättas och latenska termarkörer isoleras (`<bdi>`) för korrekt visning i sökresultat.

## 6. Juridikgrind — formuleringar

Alla frön och mallar ovan är redan utbildningsformulerade i korpusen (förklarande, metodbeskrivande). Vid implementering i /ar-meta gäller oförändrat: "så fungerar nyckeltalet", "så läser du rapporten" — aldrig "köp/sälj denna aktie". Case-bolagsfröna (grupp K) formulaterar bolagen som **fallstudier** ("دراسة حالة") vilket är den juridiskt säkra ramen: utbildning i metodik på verkliga exempel, inte råd om dem. Ingen blandning av lagrum; svenska kursers skattjuridik presenteras som utbildning om reglerna (km-049–053, sj-01–05), inte som rådgivning.

## 7. Statistik och täckningsredovisning

| Mått | Värde |
|---|---|
| Kurs-JSON i `data/seo/kurser/` | 333 (100 % lästa) |
| Kursfiler med arabiskt material (via översättningskorpusen) | **333 av 333** |
| Översättningsfiler | 95 |
| Poster totalt / med ar-fält | 70 891 / 70 283 |
| Titelfrön efter gallring | 2 934 |
| Quizfrön (frågeformatet "ما هو X؟" dominerar) | 2 133 |
| **Summa levererade frön** | **5 067** |
| Grupper i rapporten | 13 (A–M) |
| Maskinläsbart fröstöd | `.zcode/sond/v138-s3-frodata2.json` |

**Viktigt tekniskt fynd för vågen:** `data/seo/kurser/*.json` saknar själv arabiska fält — om SEO-json senare ska bära `ar`-metadata (titleAr/keywordsAr) krävs en kodändring i genereringsledet; idag är den arabiska sanningen endast i `data/oversattning-import/` (+ ev. i appens kompilerade lager). Följs upp av S1/S2:s sv/en-inventeringar.

## 8. Nästa steg (förslag till styrelseronden)

1. **Meta-pilot /ar:** välj 10 kurser med starkast frön (v06-ev-ebitda, v09-roe, km-009-pe, pf-08-isk-vs-aktiedepa, ud-06-svenska-utdelningsaktier, the-intelligent-investor, margin-of-safety, bf-05-ankareffekt, ts-15-bollinger-bands, pc-12-case-skf) och generera arabiska SEO-titlar enligt mallarna i § 5 med frön ur tabellerna.
2. **للمبتدئين-programmet:** systematisk nybörjarmärkning på /ar-grundsidor — korpusens enskilt större lucka.
3. **Frgåeformat-index:** quizfröna (2 133 st, formatet "ما هو X؟") är en färdig FAQ- och schema.org-Q&A-källa för rikare sökresultat.

*Upprättat av subagent S3, våg 138. Sondskript och rådata: `.zcode/sond/v138-s3-*.mjs` + `.zcode/sond/v138-s3-*.txt/json`.*
