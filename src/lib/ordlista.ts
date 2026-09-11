/**
 * ORDLISTAN — gränssnittets ord på svenska | english | العربية (fas 1).
 *
 * OMFATTNING: meny-, navigations-, kurs-UI-, notis-, CTA-, footer- och
 * inloggningsord — INTE sidinnehåll (rubriker i page.tsx) och INTE
 * kursinnehåll. Se data/forskning/SPRAK-PLAN.md: fas 2 = nyckelsidor,
 * fas 3 = 333 kurser via professionell pipeline.
 *
 * RIKTLINJER ARABISKA: korrekt, formell men tillgänglig finansiell svenska→
 * arabiska. Latinska förkortningar och varumärken behålls latinska (AKM1,
 * AK1TS, ROE, NCAV, net-net, XP, Fas 2 ⇢ المرحلة 2 men "Fas 2-porten"
 * ⇢ بوابة المرحلة 2). Termer: fundamental analys = التحليل الأساسي,
 * portfölj = المحفظة, värdering = التقييم, kassaflöde = التدفق النقدي,
 * avkastning = العائد, risk = المخاطر, kunskap = المعرفة.
 */

export type SprakRad = { sv: string; en: string; ar: string };

export const ORDLISTA = {
  // ── Huvudmeny / navigation (paneler + punkter) ────────────────────────────
  "nav.lar": { sv: "Lär", en: "Learn", ar: "تعلَّم" },
  "nav.analysera": { sv: "Analysera", en: "Analyze", ar: "حلِّل" },
  "nav.trana": { sv: "Träna", en: "Practice", ar: "تدرَّب" },
  "nav.hem": { sv: "Hem", en: "Home", ar: "الرئيسية" },
  "nav.kurser": { sv: "Kurser", en: "Courses", ar: "الدورات" },
  "nav.allaKurser": { sv: "Alla kurser", en: "All courses", ar: "جميع الدورات" },
  "nav.kursbiblioteket": { sv: "Kursbiblioteket", en: "Course library", ar: "مكتبة الدورات" },
  "nav.laroplanen": { sv: "Läroplanen", en: "The Curriculum", ar: "المنهج" },
  "nav.biblioteket": { sv: "Biblioteket", en: "The Library", ar: "المكتبة" },
  "nav.verktyg": { sv: "Verktyg", en: "Tools", ar: "الأدوات" },
  "nav.manifestet": { sv: "Manifestet", en: "The Manifesto", ar: "البيان" },
  "nav.certifikat": { sv: "Certifikat", en: "Certificates", ar: "الشهادات" },
  "nav.nyhetscentralen": { sv: "Nyhetscentralen", en: "The News Center", ar: "مركز الأخبار" },
  "nav.nyheter": { sv: "Nyheter", en: "News", ar: "الأخبار" },
  "nav.akm1Kalkylatorn": {
    sv: "AKM1-kalkylatorn",
    en: "The AKM1 Calculator",
    ar: "حاسبة AKM1",
  },
  "nav.vagfundamentet": { sv: "Vågfundamentet", en: "The Wave Foundation", ar: "أساس الموجات" },
  "nav.portfoljbyggaren": { sv: "Portföljbyggaren", en: "The Portfolio Builder", ar: "باني المحفظة" },
  "nav.konfluensradarn": { sv: "Konfluensradarn", en: "The Confluence Radar", ar: "رادار التقارب" },
  "nav.netnetskannern": { sv: "Net-net-skannern", en: "The Net-net Scanner", ar: "ماسح Net-net" },
  "nav.superanalysen": { sv: "Superanalysen", en: "The Super Analysis", ar: "التحليل الفائق" },
  "nav.minPortfolj": { sv: "Min portfölj", en: "My Portfolio", ar: "محفظتي" },
  "nav.portfoljforskning": { sv: "Portföljforskning", en: "Portfolio Research", ar: "أبحاث المحفظة" },
  "nav.kognitivProfil": { sv: "Kognitiv profil", en: "Cognitive Profile", ar: "الملف المعرفي" },
  "nav.dagensPass": { sv: "Dagens pass", en: "Today's Session", ar: "جلسة اليوم" },
  "nav.minSida": { sv: "Min Sida", en: "My Page", ar: "صفحتي" },
  "nav.topplistan": { sv: "Topplistan", en: "The Leaderboard", ar: "لوحة الصدارة" },
  "nav.badges": { sv: "Badges", en: "Badges", ar: "الشارات" },
  "nav.fas2Ansokan": { sv: "Fas 2-ansökan", en: "Phase 2 Application", ar: "طلب الالتحاق بالمرحلة 2" },
  "nav.ansokFas2": { sv: "Ansök Fas 2", en: "Apply for Phase 2", ar: "التقدَّم للمرحلة 2" },
  "nav.omOss": { sv: "Om oss", en: "About Us", ar: "من نحن" },
  "nav.blogg": { sv: "Blogg", en: "Blog", ar: "المدونة" },
  "nav.medlemskap": { sv: "Medlemskap", en: "Membership", ar: "العضوية" },
  "nav.prenumeration": { sv: "Prenumeration", en: "Subscription", ar: "الاشتراك" },
  "nav.labb": { sv: "Labb", en: "Lab", ar: "المختبر" },
  "nav.analyser": { sv: "Analyser", en: "Analyses", ar: "التحليلات" },
  "nav.forskningsbiblioteket": {
    sv: "Forskningsbiblioteket",
    en: "The Research Library",
    ar: "مكتبة الأبحاث",
  },
  "nav.aktier": { sv: "Aktier", en: "Stocks", ar: "الأسهم" },
  "nav.portal": { sv: "Min portal", en: "My Portal", ar: "بوابتي" },

  // ── Inloggning / konto ───────────────────────────────────────────────────
  "auth.loggaIn": { sv: "Logga in", en: "Sign in", ar: "تسجيل الدخول" },
  "auth.loggaUt": { sv: "Logga ut", en: "Sign out", ar: "تسجيل الخروج" },
  "auth.namnMinSida": { sv: "{namn} · Min Sida", en: "{namn} · My Page", ar: "{namn} · صفحتي" },
  "auth.du": { sv: "du", en: "you", ar: "أنت" },
  "auth.loggaInEllerGratis": {
    sv: "Logga in — eller skapa gratis konto",
    en: "Sign in — or create a free account",
    ar: "سجِّل الدخول — أو أنشئ حسابًا مجانيًا",
  },
  "auth.skapaGratisKonto": {
    sv: "Skapa gratis konto",
    en: "Create a free account",
    ar: "أنشئ حسابًا مجانيًا",
  },
  "auth.gratisKonto": { sv: "Gratis konto", en: "Free account", ar: "حساب مجاني" },
  "auth.bliMedlem": { sv: "Bli medlem", en: "Become a member", ar: "كن عضوًا" },
  "auth.redanMedlem": { sv: "Redan medlem?", en: "Already a member?", ar: "عضو بالفعل؟" },
  "auth.ejInloggad": { sv: "Ej inloggad", en: "Not signed in", ar: "لم تسجِّل الدخول" },
  "auth.mittKonto": { sv: "Mitt konto", en: "My account", ar: "حسابي" },

  // ── Kurs-UI (KursSteg) ───────────────────────────────────────────────────
  "kurs.kapitel": { sv: "Kapitel", en: "Chapter", ar: "الفصل" },
  "kurs.kapitelAv": {
    sv: "Kapitel {num} av {total} · {min} min",
    en: "Chapter {num} of {total} · {min} min",
    ar: "الفصل {num} من {total} · {min} د",
  },
  "kurs.minuter": { sv: "min", en: "min", ar: "د" },
  "kurs.nastaKapitel": { sv: "Nästa kapitel", en: "Next chapter", ar: "الفصل التالي" },
  "kurs.foregaende": { sv: "Föregående", en: "Previous", ar: "السابق" },
  "kurs.testaDigSjalv": {
    sv: "Testa dig själv — bevisa din kunskap (+10 XP per rätt)",
    en: "Test yourself — prove your knowledge (+10 XP per correct answer)",
    ar: "اختبر نفسك — أثبت معرفتك (+10 XP لكل إجابة صحيحة)",
  },
  "kurs.masterquiz": { sv: "Masterquiz", en: "Master Quiz", ar: "اختبار الإتقان" },
  "kurs.ratt": { sv: "Rätt! +10 XP", en: "Correct! +10 XP", ar: "إجابة صحيحة! +10 XP" },
  "kurs.kapitelBeharskat": {
    sv: "Kapitel {num} behärskat!",
    en: "Chapter {num} mastered!",
    ar: "أتقنت الفصل {num}!",
  },
  "kurs.kursenKlar": { sv: "Kursen klar!", en: "Course completed!", ar: "أكملت الدورة!" },
  "kurs.grattis": { sv: "Grattis!", en: "Congratulations!", ar: "تهانينا!" },
  "kurs.insikt": { sv: "10x-insikt", en: "10x Insight", ar: "رؤية 10x" },
  "kurs.utmaning": {
    sv: "Utmaning — klicka när du är redo",
    en: "Challenge — click when you are ready",
    ar: "التحدّي — انقر عندما تكون مستعدًا",
  },
  "kurs.nivaUpp": { sv: "Nivå {n}!", en: "Level {n}!", ar: "المستوى {n}!" },
  "kurs.fas2Porten": {
    sv: "Fas 2-porten står öppen — ansök när du är redo.",
    en: "The Phase 2 gate is open — apply when you are ready.",
    ar: "بوابة المرحلة 2 مفتوحة — تقدَّم عندما تكون مستعدًا.",
  },
  "kurs.xpPerNiva": {
    sv: "100 XP per nivå — poängen förtjänas.",
    en: "100 XP per level — points are earned.",
    ar: "100 XP لكل مستوى — النقاط تُكتسب بالجهد.",
  },
  "kurs.allaKlara": {
    sv: "Du har klarat alla {total} kapitel i \"{titel}\" — kunskapen är nu din.",
    en: "You have completed all {total} chapters of \"{titel}\" — the knowledge is now yours.",
    ar: "أنجزت جميع فصول \"{titel}\" البالغة {total} — أصبحت المعرفة الآن ملكك.",
  },
  "kurs.tipsFallback": {
    sv: "Gå tillbaka till texten — svaret finns där.",
    en: "Go back to the text — the answer is there.",
    ar: "عُد إلى النص — الإجابة موجودة هناك.",
  },
  "kurs.niva": { sv: "Nivå", en: "Level", ar: "المستوى" },
  "kurs.startaKurs": { sv: "Starta kursen", en: "Start the course", ar: "ابدأ الدورة" },
  "kurs.fortsattKursen": { sv: "Fortsätt kursen", en: "Continue the course", ar: "تابع الدورة" },
  "kurs.kapitelTitel": { sv: "Kapitel {num}", en: "Chapter {num}", ar: "الفصل {num}" },

  // ── VÅG 52 (2026-09-01): kurs-UI för de dynamiska kursspegel-rutterna
  // (/en|ar/kurser/[slug]) — sidorna server-renderar med skapaT(lang) ur
  // sprak.ts; svenska kurssidan berörs ej (orden används endast av speglarna).
  "kurs.kapitelEnhet": { sv: "kapitel", en: "chapters", ar: "فصول" },
  "kurs.minLasning": { sv: "min läsning", en: "min read", ar: "دقيقة قراءة" },
  "kurs.nasta": { sv: "Nästa: {titel}", en: "Next: {titel}", ar: "التالي: {titel}" },
  "kurs.kursenSlut": { sv: "Kursen klar", en: "Course complete", ar: "اكتملت الدورة" },
  "kurs.kursoversikt": { sv: "Kursöversikt", en: "Course overview", ar: "نظرة عامة على الدورة" },
  "kurs.fokus": { sv: "Fokus", en: "Focus", ar: "التركيز" },
  "kurs.tid": { sv: "Tid", en: "Time", ar: "الوقت" },
  "kurs.totalt": { sv: "Totalt", en: "Total", ar: "الإجمالي" },
  "kurs.kursinnehall": { sv: "Kursinnehåll", en: "Course content", ar: "محتوى الدورة" },
  "kurs.vikt": { sv: "Vikt", en: "Weight", ar: "الوزن" },
  // Viktnivåetiketter (V86, agent V86-SPEGLAR2): kurs.weight i deep-courses
  // bär AKM1:s exakta etiketter — sv ordagrant. Procentnivåerna ("8%/7%/
  // 6%/5%") och "—" (ej satt) är språkneutralt och passerar oöversatta;
  // konsumeras av viktEtikett i kurs-speglar.ts — svenska /kurser visar
  // etiketten rå som förr (samma filosofi som kategori.*).
  "vikt.kritisk": { sv: "KRITISK", en: "CRITICAL", ar: "الحرِجة" },
  // Kursöversiktens låsta rader (kap 3+ på fas-kurser) — speglarna + originalet.
  "kurs.kapLas": {
    sv: "🔒 kapitel {num} — låses med Fas {fas}",
    en: "🔒 chapter {num} — unlocked with Phase {fas}",
    ar: "🔒 الفصل {num} — يُفتح مع المرحلة {fas}",
  },

  // ── VÅG 80A (2026-09-07): Fas2Gate:s låsvy + smakprov + laddar/fel —
  // tidigare hårdkodad svenska på /en|/ar-speglarna ("Ansök till Fas 2" osv.
  // syntes oöversatt). Alla strängar i låsvyn kommer härifrån via skapaT(lang).
  "fas.smakprovRubrik": {
    sv: "Smakprov — de två första kapitlen",
    en: "Sample — the first two chapters",
    ar: "مقتطف — الفصلان الأولان",
  },
  "fas2.rubrik": {
    sv: "Fas 2 — den fundamentala vägen",
    en: "Phase 2 — the fundamental path",
    ar: "المرحلة 2 — المسار الأساسي",
  },
  "fas3.rubrik": {
    sv: "Fas 3 — det dynamiska ekosystemet",
    en: "Phase 3 — the dynamic ecosystem",
    ar: "المرحلة 3 — المنظومة الديناميكية",
  },
  "fas2.beskrivning": {
    sv: "Välkommen vidare när du är redo. Fas 2 är den snabba fundamentala vägen till oberoende analytiker — och chansen att få representera AK1nvestor med kvalitet. Du har just läst smakprovet; nedan ser du exakt vad som väntar bakom låset — innehållet stänger vi aldrig in, vi bjuder in till det.",
    en: "Welcome onward when you are ready. Phase 2 is the fast fundamental path to becoming an independent analyst — and the chance to represent AK1nvestor with quality. You have just read the sample; below you see exactly what awaits behind the lock — we never wall content in, we invite you to it.",
    ar: "مرحباً بك في التقدّم متى كنت مستعدًا. المرحلة 2 هي المسار الأساسي السريع نحو محلل مستقل — وفرصة تمثيل AK1nvestor بجودة. لقد قرأت للتو المقتطف؛ أدناه ترى بالضبط ما ينتظرك خلف القفل — نحن لا نحتجز المحتوى أبدًا، بل ندعوك إليه.",
  },
  "fas3.beskrivning": {
    sv: "Välkommen vidare när du är redo. I Fas 3 börjar fundamentalanalysen röra sig — värde möter vågor, kapitel för kapitel. Du har just läst smakprovet; nedan ser du exakt vad som väntar bakom låset — innehållet stänger vi aldrig in, vi bjuder in till det.",
    en: "Welcome onward when you are ready. In Phase 3 fundamental analysis begins to move — value meets waves, chapter by chapter. You have just read the sample; below you see exactly what awaits behind the lock — we never wall content in, we invite you to it.",
    ar: "مرحباً بك في التقدّم متى كنت مستعدًا. في المرحلة 3 يبدأ التحليل الأساسي بالحركة — القيمة تلتقي بالموجات، فصلًا بعد فصل. لقد قرأت للتو المقتطف؛ أدناه ترى بالضبط ما ينتظرك خلف القفل — نحن لا نحتجز المحتوى أبدًا، بل ندعوك إليه.",
  },
  "fas.kurskortRubrik": {
    sv: "Kurskortet — en blick på resan",
    en: "The course card — a glimpse of the journey",
    ar: "بطاقة الدورة — لمحة عن الرحلة",
  },
  "fas.fasKurs": {
    sv: "Fas {fas}-kurs",
    en: "Phase {fas} course",
    ar: "دورة المرحلة {fas}",
  },
  "fas.varfor": {
    sv: "Varför Fas {fas}?",
    en: "Why Phase {fas}?",
    ar: "لماذا المرحلة {fas}؟",
  },
  // Låstext per kursgrupp (samma uppdelning som fas2LockeradText/fas3LockeradText
  // i kurs-access.ts — grupperna exporteras där som fas2LockeradGrupp/fas3LockeradGrupp).
  "fas2.lasText.vardering": {
    sv: "Värderingsbiblorna — Graham & Dodd, Damodaran, McKinsey, Williams. Fas 2 är den snabba fundamentala vägen till oberoende analytiker: här lär du dig väga ett bolag i handen, från bokslut till värde, tills siffrorna blir ett omdöme du kan försvara.",
    en: "The valuation bibles — Graham & Dodd, Damodaran, McKinsey, Williams. Phase 2 is the fast fundamental path to becoming an independent analyst: here you learn to weigh a company in your hand, from financial statements to value, until the numbers become a judgment you can defend.",
    ar: "أناجيل التقييم — غراهام ودود، داموداران، ماكنزي، ويليامز. المرحلة 2 هي المسار الأساسي السريع نحو محلل مستقل: هنا تتعلّم أن تزن الشركة بيدك، من القوائم المالية إلى القيمة، حتى تصبح الأرقام حكمًا تستطيع الدفاع عنه.",
  },
  "fas2.lasText.bokslut": {
    sv: "Bokslutets hantverk — Penman, O'Glove, Schilit. Fas 2 handlar om att läsa redovisningen som en analytiker: hitta kvaliteten i vinsten, genomskåda kreativ kassaflödesredovisning, och veta skillnaden på en rapport och en berättelse.",
    en: "The craft of the financial statements — Penman, O'Glove, Schilit. Phase 2 is about reading the accounts like an analyst: finding the quality in earnings, seeing through creative cash-flow reporting, and knowing the difference between a report and a story.",
    ar: "صناعة القوائم المالية — بينمان، أوغليف، شيليت. المرحلة 2 هي أن تقرأ التقارير المالية كما يقرؤها المحلل: أن تجد جودة الأرباح، أن تخترق المحاسبة الإبداعية للتدفقات النقدية، وأن تعرف الفرق بين تقرير وحكاية.",
  },
  "fas2.lasText.finans": {
    sv: "Företagsfinansen på MBA-nivå — Higgins, Brealey, Whitman. Fas 2 ger dig ränta-på-ränta, kapitalstruktur och kassaflödesmatematiken som gör att du räknar som en analytiker — inte som en gissare.",
    en: "Corporate finance at MBA level — Higgins, Brealey, Whitman. Phase 2 gives you compound interest, capital structure and the cash-flow mathematics that make you calculate like an analyst — not a guesser.",
    ar: "تمويل الشركات بمستوى ماجستير إدارة الأعمال — هيغينز، بريلي، ويتمان. المرحلة 2 تمنحك الفائدة المركّبة وهيكل رأس المال ورياضيات التدفق النقدي التي تجعلك تحسب كمحلل — لا كمن يخمّن.",
  },
  "fas2.lasText.standard": {
    sv: "Fas 2 är den snabba fundamentala vägen till oberoende analytiker — och chansen att få representera AK1nvestor med kvalitet. Här läses mästarverken kapitel för kapitel, med grundaren vid din sida, tills ditt omdöme är ditt eget.",
    en: "Phase 2 is the fast fundamental path to becoming an independent analyst — and the chance to represent AK1nvestor with quality. Here the masterworks are read chapter by chapter, with the founder at your side, until your judgment is your own.",
    ar: "المرحلة 2 هي المسار الأساسي السريع نحو محلل مستقل — وفرصة تمثيل AK1nvestor بجودة. هنا تُقرأ الأعمال الفنية فصلًا بعد فصل، والمؤسس بجانبك، حتى يصبح حكمك ملكك أنت.",
  },
  "fas3.lasText.ekosystem": {
    sv: "Fas 3 är stunden då fundamentalanalysen slutar vara statisk: varje AKM1-variabel rör sig, blir tidsserie och våg. Här förenas AKM1 med AK1TS — värde möter vågor — och konfluens blir ditt analytiska språk. Du får också rätt till alla framtida utvecklingar: analys av aktier och portföljer, dashboarden och AI-kopplingen.",
    en: "Phase 3 is the moment fundamental analysis stops being static: every AKM1 variable moves, becomes a time series and a wave. Here AKM1 joins AK1TS — value meets waves — and confluence becomes your analytical language. You also gain the right to all future developments: stock and portfolio analysis, the dashboard and the AI connection.",
    ar: "المرحلة 3 هي اللحظة التي يتوقف فيها التحليل الأساسي عن الجمود: كل متغير من متغيرات AKM1 يتحرك ويصبح سلسلة زمنية وموجة. هنا يلتقي AKM1 بـ AK1TS — القيمة تلتقي بالموجات — ويصبح التقارب لغتك التحليلية. تحصل أيضًا على حق جميع التطورات المستقبلية: تحليل الأسهم والمحافظ، ولوحة المعلومات، والربط بالذكاء الاصطناعي.",
  },
  "fas3.lasText.psykologi": {
    sv: "Fasenet smids i Fas 3: marknaden utkämpas i sinnet, och dessa mästarverk om trader-psykologi och neuroekonomi hör hemma där ekosystemet lever — daglig mätning, dagligt beteende, tålamod när vågorna kräver det.",
    en: "Patience is forged in Phase 3: the market is fought in the mind, and these masterworks on trading psychology and neuroeconomics belong where the ecosystem lives — daily measurement, daily behaviour, patience when the waves demand it.",
    ar: "تُصقل الأعصاب في المرحلة 3: السوق تُخاض معركتها في العقل، وهذه الأعمال الفنية عن سيكولوجية التداول والاقتصاد العصبي تنتمي إلى حيث تعيش المنظومة — قياس يومي، وسلوك يومي، وصبر حين تقتضيه الموجات.",
  },
  "fas3.lasText.standard": {
    sv: "Teknisk analys på mästarnivå — Elliott, Murphy, Nison, Bollinger och de stora trendföljarna. I Fas 3 läses de inte som historia utan som instrument i det dynamiska ekosystemet: vågor som möter fundamentalt värde, kapitel för kapitel.",
    en: "Technical analysis at master level — Elliott, Murphy, Nison, Bollinger and the great trend followers. In Phase 3 they are read not as history but as instruments in the dynamic ecosystem: waves meeting fundamental value, chapter by chapter.",
    ar: "التحليل الفني بمستوى الأساتذة — إليوت، ميرفي، نيسون، بولينجر، وكبار متبعي الاتجاه. في المرحلة 3 لا تُقرأ كتاريخ بل كأدوات في المنظومة الديناميكية: موجات تلتقي بالقيمة الأساسية، فصلًا بعد فصل.",
  },
  "fas2.cta": {
    sv: "Ansök till Fas 2 →",
    en: "Apply for Phase 2 →",
    ar: "التقدَّم للمرحلة 2 ←",
  },
  "fas3.cta": {
    sv: "Till Fas 3 — ekosystemet →",
    en: "To Phase 3 — the ecosystem →",
    ar: "إلى المرحلة 3 — المنظومة ←",
  },
  "fas.redanMedlem": {
    sv: "Redan Fas {fas}-medlem?",
    en: "Already a Phase {fas} member?",
    ar: "هل أنت عضو بالمرحلة {fas}؟",
  },
  "fas.loggaInEfter": {
    sv: "för att läsa vidare.",
    en: "to keep reading.",
    ar: "لمتابعة القراءة.",
  },
  "fas3.inkluderat": {
    sv: "Fas 3 innehåller alla framtida utvecklingar — dashboard, AI-koppling och rapporter. Efter utbildningen kan ekosystemet fortsätta nyttjas via månadsplan.",
    en: "Phase 3 includes all future developments — the dashboard, the AI connection and reports. After the training the ecosystem can continue to be used via a monthly plan.",
    ar: "تشمل المرحلة 3 جميع التطورات المستقبلية — لوحة المعلومات والربط بالذكاء الاصطناعي والتقارير. بعد إتمام التدريب يمكن الاستمرار في استخدام المنظومة عبر خطة شهرية.",
  },
  "fas.fas1Gratis": {
    sv: "Fas 1 förblir gratis — alltid.",
    en: "Phase 1 stays free — always.",
    ar: "تبقى المرحلة 1 مجانية — دائمًا.",
  },
  "fas.bibliotekLank": {
    sv: "Hela gratis-biblioteket",
    en: "The entire free library",
    ar: "كامل المكتبة المجانية",
  },
  "fas.bibliotekEfter": {
    sv: "väntar tills vidare, och det förblir så.",
    en: "awaits you in the meantime — and it always will.",
    ar: "في انتظارك في هذه الأثناء — وسيبقى الأمر كذلك.",
  },
  "fas.hamtaFel": {
    sv: "Kursen kunde inte hämtas just nu — kontrollera anslutningen.",
    en: "The course could not be fetched right now — check your connection.",
    ar: "تعذَّر جلب الدورة الآن — تحقَّق من الاتصال.",
  },
  "fas.forsokIgen": { sv: "Försök igen", en: "Try again", ar: "حاول مجددًا" },
  "fas.laserUpp": {
    sv: "Låser upp kursen — hämtar kapitlen …",
    en: "Unlocking the course — fetching the chapters …",
    ar: "جارٍ فتح الدورة — يتم جلب الفصول …",
  },
  "fas.aria2": {
    sv: "Fas 2-kurs — inbjudan vidare",
    en: "Phase 2 course — an invitation onward",
    ar: "دورة المرحلة 2 — دعوة للتقدّم",
  },
  "fas.aria3": {
    sv: "Fas 3-kurs — inbjudan vidare",
    en: "Phase 3 course — an invitation onward",
    ar: "دورة المرحلة 3 — دعوة للتقدّم",
  },
  "fas.adminLasUpp": {
    sv: "Lås upp (admin)",
    en: "Unlock (admin)",
    ar: "فتح (مشرف)",
  },

  // ── VÅG 80A: KursQuiz (renderas i smakprovet kap 1–2 på speglarna) —
  // samma P0: quiz-chromet var hårdkodad svenska på /en|/ar.
  "kurs.quizRubrik": {
    sv: "Masterquiz — kapitel {num}",
    en: "Master Quiz — chapter {num}",
    ar: "اختبار الإتقان — الفصل {num}",
  },
  "kurs.quizRaknare": {
    sv: "{klarade}/{total} klarade · +10 XP per rätt",
    en: "{klarade}/{total} completed · +10 XP per correct",
    ar: "{klarade}/{total} مكتملة · +10 XP لكل إجابة صحيحة",
  },
  "kurs.lararenTipsar": {
    sv: "Läraren tipsar:",
    en: "The teacher hints:",
    ar: "المعلّم يلمّح:",
  },
  "kurs.quizTipsFallback": {
    sv: "Gå tillbaka till kapitlet och leta ledtråden — svaret finns där.",
    en: "Go back to the chapter and look for the clue — the answer is there.",
    ar: "عُد إلى الفصل وابحث عن القرينة — الإجابة موجودة هناك.",
  },
  "kurs.rattFortjanat": {
    sv: "Rätt! +10 XP förtjänat.",
    en: "Correct! +10 XP earned.",
    ar: "إجابة صحيحة! +10 XP مُكتسبة.",
  },
  "kurs.totaltXp": {
    sv: "Totalt {xp} XP.",
    en: "Total {xp} XP.",
    ar: "الإجمالي {xp} XP.",
  },
  "kurs.gaVidareNasta": {
    sv: "Gå vidare till nästa kapitel.",
    en: "Move on to the next chapter.",
    ar: "انتقل إلى الفصل التالي.",
  },
  "kurs.forsokIgenQuiz": {
    sv: "Försök igen — fel svar kostar inget, men rätt svar måste förtjänas.",
    en: "Try again — a wrong answer costs nothing, but a correct one must be earned.",
    ar: "حاول مجددًا — الإجابة الخاطئة لا تكلّف شيئًا، لكن الصحيحة يجب أن تُكتسب.",
  },

  // ── Notiser (NotisCenter) ────────────────────────────────────────────────
  "notis.notiser": { sv: "Notiser", en: "Notifications", ar: "الإشعارات" },
  "notis.nya": { sv: "nya", en: "new", ar: "جديدة" },
  "notis.olasta": { sv: "olästa", en: "unread", ar: "غير مقروءة" },
  "notis.olast": { sv: "Oläst", en: "Unread", ar: "غير مقروء" },
  "notis.allaLasta": { sv: "Alla lästa", en: "Mark all read", ar: "تعليم الكل كمقروء" },
  "notis.rensa": { sv: "Rensa", en: "Clear", ar: "مسح" },
  "notis.markeraLast": { sv: "Markera läst", en: "Mark as read", ar: "تعليم كمقروء" },
  "notis.gatDit": { sv: "Gå dit", en: "Go there", ar: "انتقل" },
  "notis.franSignalbussen": { sv: "Från signalbussen", en: "From the signal bus", ar: "من ناقل الإشارات" },
  "notis.alltLugnt": {
    sv: "Allt lugnt — vi höjer flaggan när något nytt väntar dig.",
    en: "All quiet — we raise the flag when something new awaits you.",
    ar: "كل شيء هادئ — سنرفع الراية عندما ينتظرك جديد.",
  },
  "notis.justNu": { sv: "just nu", en: "just now", ar: "الآن" },
  "notis.nyaNotiserTitel": {
    sv: "{n} nya notiser",
    en: "{n} new notifications",
    ar: "{n} إشعارات جديدة",
  },
  "notis.min": { sv: "min", en: "min", ar: "د" },
  "notis.timme": { sv: "h", en: "h", ar: "س" },
  "notis.dag": { sv: "d", en: "d", ar: "ي" },
  "notis.varning": { sv: "Varning", en: "Warning", ar: "تحذير" },
  "notis.mojlighet": { sv: "Möjlighet", en: "Opportunity", ar: "فرصة" },
  "notis.beslut": { sv: "Beslut", en: "Decision", ar: "قرار" },

  // ── CTA:er / generella knappar ───────────────────────────────────────────
  "cta.lasMer": { sv: "Läs mer", en: "Learn more", ar: "اقرأ المزيد" },
  "cta.komIgang": { sv: "Kom igång", en: "Get started", ar: "ابدأ الآن" },
  "cta.fortsatt": { sv: "Fortsätt", en: "Continue", ar: "متابعة" },
  "cta.fortsattLas": { sv: "Fortsätt läsa", en: "Keep reading", ar: "تابع القراءة" },
  "cta.visaAlla": { sv: "Visa alla", en: "Show all", ar: "عرض الكل" },
  "cta.tillbaka": { sv: "Tillbaka", en: "Back", ar: "رجوع" },
  "cta.stang": { sv: "Stäng", en: "Close", ar: "إغلاق" },
  "cta.oppna": { sv: "Öppna", en: "Open", ar: "فتح" },
  "cta.sok": { sv: "Sök", en: "Search", ar: "بحث" },
  "cta.spara": { sv: "Spara", en: "Save", ar: "حفظ" },
  "cta.avbryt": { sv: "Avbryt", en: "Cancel", ar: "إلغاء" },
  "cta.ja": { sv: "Ja", en: "Yes", ar: "نعم" },
  "cta.nej": { sv: "Nej", en: "No", ar: "لا" },
  "cta.eller": { sv: "eller", en: "or", ar: "أو" },
  "cta.ladda": { sv: "Laddar…", en: "Loading…", ar: "جارٍ التحميل…" },
  "cta.nastaSteg": { sv: "Nästa steg", en: "Next step", ar: "الخطوة التالية" },

  // ── Footer / juridik ─────────────────────────────────────────────────────
  "footer.disclaimer": {
    sv: "AK1A Research Lab — pedagogisk finansanalys, inte investeringsråd.",
    en: "AK1A Research Lab — educational financial analysis, not investment advice.",
    ar: "AK1A Research Lab — تحليل مالي تعليمي، وليس نصيحة استثمارية.",
  },
  "footer.integritetspolicy": { sv: "Integritetspolicy", en: "Privacy Policy", ar: "سياسة الخصوصية" },
  "footer.villkor": { sv: "Villkor", en: "Terms", ar: "الشروط" },
  "footer.finansiellPolicy": { sv: "Finansiell policy", en: "Financial Policy", ar: "السياسة المالية" },
  "footer.byggtMed": { sv: "Byggt med AKM1 + AK1TS", en: "Built with AKM1 + AK1TS", ar: "مبنيّ بمنهجيتي AKM1 + AK1TS" },
  "footer.lar": { sv: "LÄR", en: "LEARN", ar: "تعلَّم" },
  "footer.analysera": { sv: "ANALYSERA", en: "ANALYZE", ar: "حلِّل" },
  "footer.trana": { sv: "TRÄNA", en: "PRACTICE", ar: "تدرَّب" },

  // ── Gemensamma UI-ord ────────────────────────────────────────────────────
  "ui.dagensPass": { sv: "Dagens pass", en: "Today's session", ar: "جلسة اليوم" },
  "ui.nastaKapitel": { sv: "Nästa kapitel", en: "Next chapter", ar: "الفصل التالي" },
  "ui.testaDigSjalv": { sv: "Testa dig själv", en: "Test yourself", ar: "اختبر نفسك" },
  "ui.kunskap": { sv: "Kunskap", en: "Knowledge", ar: "المعرفة" },
  "ui.progress": { sv: "Framsteg", en: "Progress", ar: "التقدُّم" },
  "ui.sprakVaxla": { sv: "Byt språk", en: "Change language", ar: "تغيير اللغة" },
  "ui.sprakNamn": { sv: "Språk", en: "Language", ar: "اللغة" },
  "ui.brodsmulor": { sv: "Brödsmulor", en: "Breadcrumb", ar: "مسار التنقُّل" },
  "ui.nivaKort": { sv: "Nivå {n}", en: "Level {n}", ar: "المستوى {n}" },
  "ui.xp": { sv: "XP", en: "XP", ar: "XP" },
  "ui.stjarnor": { sv: "Stjärnor", en: "Stars", ar: "النجوم" },
  "ui.kurserKlara": { sv: "Kurser klara", en: "Courses completed", ar: "الدورات المكتملة" },
  "ui.streak": { sv: "Streak", en: "Streak", ar: "سلسلة الأيام" },
  "ui.medlem": { sv: "Medlem", en: "Member", ar: "عضو" },
  "ui.gast": { sv: "Gäst", en: "Guest", ar: "زائر" },
  "ui.fas2": { sv: "Fas 2", en: "Phase 2", ar: "المرحلة 2" },
  "ui.fas3": { sv: "Fas 3", en: "Phase 3", ar: "المرحلة 3" },
  "ui.gratis": { sv: "Gratis", en: "Free", ar: "مجاني" },
  "ui.provperiod": { sv: "Provperiod", en: "Trial period", ar: "فترة تجريبية" },
  "ui.inloggadSom": { sv: "Inloggad som {namn}", en: "Signed in as {namn}", ar: "مسجَّل الدخول باسم {namn}" },
  "ui.registrera": { sv: "Registrera", en: "Register", ar: "التسجيل" },
  "ui.epost": { sv: "E-post", en: "Email", ar: "البريد الإلكتروني" },
  "ui.losenord": { sv: "Lösenord", en: "Password", ar: "كلمة المرور" },
  "ui.namn": { sv: "Namn", en: "Name", ar: "الاسم" },
  "ui.skicka": { sv: "Skicka", en: "Send", ar: "إرسال" },
  "ui.ok": { sv: "OK", en: "OK", ar: "حسنًا" },
  "ui.pagaende": { sv: "Pågående", en: "In progress", ar: "قيد التنفيذ" },
  "ui.klar": { sv: "Klar", en: "Done", ar: "مكتمل" },
  "ui.kvar": { sv: "kvar", en: "remaining", ar: "متبقٍ" },
  "ui.visaMer": { sv: "Visa mer", en: "Show more", ar: "عرض المزيد" },
  "ui.visaMindre": { sv: "Visa mindre", en: "Show less", ar: "عرض أقل" },

  // ── VÅG 51 (2026-09-01): menyregistrets etiketter på tre språk ────────────
  // Varje MenyPunkt i src/lib/meny-register.ts har en `nyckel` som pekar
  // hit — klientkomponenterna översätter vid render (SSG förblir svensk).
  // Svenska värdet ska VARA registrets text så svenska aldrig ändras.

  // Sektioner (panelernas rubriker)
  "nav.lara": { sv: "Lära", en: "Learn", ar: "تعلَّم" },
  "nav.praktik": { sv: "Praktik", en: "Practice", ar: "تدرَّب" },
  "nav.omAk1a": { sv: "Om AK1A", en: "About AK1A", ar: "عن AK1A" },

  // Punkter som saknades i fas 1
  "nav.labbar": { sv: "Labbar", en: "Labs", ar: "المختبرات" },
  "nav.badgesMeriter": { sv: "Badges & meriter", en: "Badges & Merits", ar: "الشارات والإنجازات" },
  "nav.dagensPassMeny": { sv: "Dagens Pass", en: "Today's Session", ar: "جلسة اليوم" },
  "nav.fas3": { sv: "Fas 3 — Certifiering", en: "Phase 3 — Certification", ar: "المرحلة 3 — الشهادة" },
  "nav.pro": { sv: "AK1A PRO", en: "AK1A PRO", ar: "AK1A PRO" },
  // VÅG 61 (2026-09-04): toppväxeln "Privatperson | Företag" — B2B-BESLUT §3.1.
  // Etiketterna i växeln på ALLA sidor (privat utility-rad + mobil-drawer +
  // PRO-skalets spegel). URL:n är läget — aldrig någon cookie (FORBUD 4).
  "nav.privatperson": { sv: "Privatperson", en: "Personal", ar: "الأفراد" },
  "nav.foretag": { sv: "Företag", en: "Business", ar: "الشركات" },
  "nav.bloggen": { sv: "Bloggen", en: "The Blog", ar: "المدونة" },
  "nav.rapporter": { sv: "Dina rapporter", en: "Your Reports", ar: "تقاريرك" },
  "nav.admin": { sv: "Admin", en: "Admin", ar: "الإدارة" },
  "nav.transparens": { sv: "Transparens & GDPR", en: "Transparency & GDPR", ar: "الشفافية و GDPR" },

  // Avdelare i Analysera-panelen (översätts via tText-exaktmatch)
  "nav.avdGrundanalys": { sv: "Grundanalys", en: "Fundamental Analysis", ar: "التحليل الأساسي" },
  "nav.avdSkannar": { sv: "Skannar", en: "Scanners", ar: "الماسحات" },
  "nav.avdFordjupning": { sv: "Fördjupning", en: "Deep Dives", ar: "التعمُّق" },
  "nav.avdPortfolj": { sv: "Portfölj & profil", en: "Portfolio & Profile", ar: "المحفظة والملف" },

  // SPA-sektioner i startsidans fullmeny (header.tsx)
  "nav.precAnalys": { sv: "PREC-analysen", en: "The PREC Analysis", ar: "تحليل PREC" },
  "nav.aktierBevakning": { sv: "Aktier & bevakning", en: "Stocks & Watchlist", ar: "الأسهم والمتابعة" },
  "nav.hemBeskrivning": {
    sv: "Startsidan — allt på ett ställe",
    en: "The home page — everything in one place",
    ar: "الصفحة الرئيسية — كل شيء في مكان واحد",
  },
  "nav.precBeskrivning": {
    sv: "PREC-analysen, sektion för sektion",
    en: "The PREC analysis, section by section",
    ar: "تحليل PREC، قسمًا بقسم",
  },
  "nav.aktierBeskrivning": {
    sv: "Bevakning & aktieuniversum",
    en: "Watchlist & stock universe",
    ar: "المتابعة وعالم الأسهم",
  },

  // Meny-beskrivningar (underrader i panelerna — översätts via tText med
  // exakt matchning mot svenska värdet = registrets beskrivning)
  "meny.descLaroplan": {
    sv: "5 nivåer → oberoende analytiker",
    en: "5 levels → independent analyst",
    ar: "5 مستويات ← محلل مستقل",
  },
  "meny.descAllaKurser": {
    sv: "Hela biblioteket med quiz — även Bokmaster & Short-Seller",
    en: "The whole library with quizzes — including Bokmaster & Short-Seller",
    ar: "المكتبة كاملة مع اختبارات — بما فيها Bokmaster و Short-Seller",
  },
  "meny.descBiblioteket": {
    sv: "Bokkanon — böcker mappade mot AKM1/AK1TS",
    en: "The book canon — books mapped to AKM1/AK1TS",
    ar: "قانون الكتب — كتب مربوطة بـ AKM1/AK1TS",
  },
  "meny.descLabbar": {
    sv: "Forskningsärenden & case",
    en: "Research cases & studies",
    ar: "قضايا بحثية ودراسات حالة",
  },
  "meny.descCertifikat": {
    sv: "Ditt intyg på kompetens",
    en: "Your proof of competence",
    ar: "شهادتك على الكفاءة",
  },
  "meny.descKalkylatorn": {
    sv: "20 fundamentalvariabler · V01–V20",
    en: "20 fundamental variables · V01–V20",
    ar: "20 متغيرًا أساسيًا · V01–V20",
  },
  "meny.descVagfundamentet": {
    sv: "Fundamentalvågor · 20×5-matris per aktie & portfölj",
    en: "Fundamental waves · 20×5 matrix per stock & portfolio",
    ar: "موجات أساسية · مصفوفة 20×5 لكل سهم ومحفظة",
  },
  "meny.descKonfluens": {
    sv: "Där värde möter vågor — fem källor måste tala samman",
    en: "Where value meets waves — five sources must speak together",
    ar: "حيث تلتقي القيمة بالموجات — خمسة مصادر يجب أن تتحدث بصوت واحد",
  },
  "meny.descNetnet": {
    sv: "Grahams cigar-butts — NCAV-screening live",
    en: "Graham's cigar butts — live NCAV screening",
    ar: "سيجار غراهام — فرز NCAV مباشر",
  },
  "meny.descNyheter": {
    sv: "Ditt nyhetsrum — nyheter rangordnade efter påverkan",
    en: "Your newsroom — news ranked by impact",
    ar: "غرفة أخبارك — الأخبار مرتبة حسب التأثير",
  },
  "meny.descSuperanalys": {
    sv: "Guidad analys i 24 steg · AKM1 + AK1TS",
    en: "Guided analysis in 24 steps · AKM1 + AK1TS",
    ar: "تحليل موجَّه في 24 خطوة · AKM1 + AK1TS",
  },
  "meny.descAnalyser": {
    sv: "Rapportbanken — fullständiga bolagsanalyser",
    en: "The report bank — complete company analyses",
    ar: "بنك التقارير — تحليلات كاملة للشركات",
  },
  "meny.descPortfoljbyggaren": {
    sv: "Bygg visuellt — se risk & spridning live",
    en: "Build visually — see risk & diversification live",
    ar: "ابنِ بصريًا — شاهد المخاطر والتوزيع مباشرة",
  },
  "meny.descMinPortfolj": {
    sv: "Innehav + djupanalys (5×5×4)",
    en: "Holdings + deep analysis (5×5×4)",
    ar: "الحيازات + تحليل عميق (5×5×4)",
  },
  "meny.descPortfoljforskning": {
    sv: "Välj risknivå — motorn forskar fram en portfölj",
    en: "Choose a risk level — the engine researches a portfolio for you",
    ar: "اختر مستوى المخاطر — يبحث المحرك عن محفظة لك",
  },
  "meny.descKognitiv": {
    sv: "AI-diagnos — din kognitiva profil i 3 minuter",
    en: "AI diagnosis — your cognitive profile in 3 minutes",
    ar: "تشخيص بالذكاء الاصطناعي — ملفك المعرفي في 3 دقائق",
  },
  "meny.descMinSida": {
    sv: "Din dashboard — XP, streak & repetition",
    en: "Your dashboard — XP, streak & review",
    ar: "لوحتك — XP وسلسلة الأيام والمراجعة",
  },
  "meny.descDagensPass": {
    sv: "5 minuters daglig marknadsträning",
    en: "5 minutes of daily market training",
    ar: "5 دقائق من التدريب اليومي على السوق",
  },
  "meny.descTopplistan": {
    sv: "Eleverna rankade på XP",
    en: "Students ranked by XP",
    ar: "الطلاب مرتبون حسب XP",
  },
  "meny.descBadges": {
    sv: "29 troféer att förtjäna",
    en: "29 trophies to earn",
    ar: "29 كأسًا يمكنك كسبها",
  },
  "meny.descFas3": {
    sv: "Certifierad AK1A-analytiker — praktikportfölj + etik",
    en: "Certified AK1A analyst — practice portfolio + ethics",
    ar: "محلل AK1A معتمد — محفظة تطبيقية وأخلاقيات",
  },
  "meny.descManifest": {
    sv: "Vår vision: världens bästa finansutbildning",
    en: "Our vision: the world's best finance education",
    ar: "رؤيتنا: أفضل تعليم مالي في العالم",
  },
  "meny.descMedlemskap": {
    sv: "Fas 1 gratis · Fas 2 · Fas 3",
    en: "Phase 1 free · Phase 2 · Phase 3",
    ar: "المرحلة 1 مجانية · المرحلة 2 · المرحلة 3",
  },
  "meny.descPrenumeration": {
    sv: "Portföljforskning i 3 nivåer — Fas 2/3-elev: rabatt för alltid",
    en: "Portfolio research in 3 tiers — Phase 2/3 students: discount forever",
    ar: "أبحاث محفظة في 3 مستويات — طلاب المرحلة 2/3: خصم دائم",
  },
  "meny.descPro": {
    sv: "Analytikerplattformen — bygg institutionella rapporter",
    en: "The analyst platform — build institutional reports",
    ar: "منصة المحللين — ابنِ تقارير مؤسسية",
  },
  "meny.descBloggen": {
    sv: "Guider + marknadskommentarer",
    en: "Guides + market commentary",
    ar: "أدلة وتعليقات على السوق",
  },
  "meny.descFas2Ansokan": {
    sv: "Utbildning med grundaren — ansök kostnadsfritt",
    en: "Education with the founder — apply free of charge",
    ar: "تعليم مع المؤسس — قدِّم طلبك مجانًا",
  },
  "meny.descLoggaIn": {
    sv: "Medlemsinloggning",
    en: "Member sign-in",
    ar: "تسجيل دخول الأعضاء",
  },
  "meny.descRapporter": {
    sv: "Redovisningsverkstan — dina utskriftsklara rapporter",
    en: "The reporting workshop — your print-ready reports",
    ar: "ورشة التقارير — تقاريرك الجاهزة للطباعة",
  },
  "meny.descAdmin": {
    sv: "Driftpanel",
    en: "Operations panel",
    ar: "لوحة التشغيل",
  },
  "meny.descTransparens": {
    sv: "Din data, dina rättigheter — enligt lagen",
    en: "Your data, your rights — by law",
    ar: "بياناتك، حقوقك — وفق القانون",
  },

  // ── Meny-chrome (sökfält, knappar, aria-etiketter i meny-ytorna) ──────────
  "ui.sokPlats": {
    sv: "Sök kurser, verktyg, sidor…",
    en: "Search courses, tools, pages…",
    ar: "ابحث في الدورات والأدوات والصفحات…",
  },
  "ui.sokGenvag": {
    sv: "Sök — Ctrl+K / ⌘K",
    en: "Search — Ctrl+K / ⌘K",
    ar: "بحث — Ctrl+K / ⌘K",
  },
  "ui.oppnaMenyn": { sv: "Öppna menyn", en: "Open the menu", ar: "افتح القائمة" },
  "ui.stangMenyn": { sv: "Stäng menyn", en: "Close the menu", ar: "أغلق القائمة" },
  "ui.huvudmeny": { sv: "Huvudmeny", en: "Main menu", ar: "القائمة الرئيسية" },
  "ui.mobilnavigation": { sv: "Mobilnavigation", en: "Mobile navigation", ar: "تنقُّل الجوال" },
  "ui.startsidan": { sv: "Startsidan", en: "Home page", ar: "الصفحة الرئيسية" },
  "ui.fortsattTitel": {
    sv: "Fortsätt: {titel}",
    en: "Continue: {titel}",
    ar: "تابع: {titel}",
  },
  "auth.loggaInPortal": {
    sv: "Logga in / Portal",
    en: "Sign in / Portal",
    ar: "تسجيل الدخول / البوابة",
  },
  "auth.namnPortal": {
    sv: "{namn} · Portal",
    en: "{namn} · Portal",
    ar: "{namn} · البوابة",
  },

  // Kommandopaletten (⌘K)
  "ui.kommandocentralen": {
    sv: "KOMMANDOCENTRALEN",
    en: "COMMAND CENTER",
    ar: "مركز الأوامر",
  },
  "ui.palettTips": {
    sv: "↑↓ bläddra · ↵ öppna · esc stäng",
    en: "↑↓ browse · ↵ open · esc close",
    ar: "↑↓ تصفح · ↵ افتح · esc أغلق",
  },
  "ui.senastBesokta": {
    sv: "Mönsterigenkänning — senast besökta",
    en: "Pattern recognition — recently visited",
    ar: "التعرُّف على الأنماط — الزيارات الأخيرة",
  },
  "ui.ingaTraffar": {
    sv: "Inga träffar på “{fraga}”. Prova t.ex. V01, portfölj eller Graham.",
    en: "No results for “{fraga}”. Try e.g. V01, portfolio or Graham.",
    ar: "لا نتائج لـ “{fraga}”. جرِّب مثلًا V01 أو المحفظة أو غراهام.",
  },
  "ui.kurserIndexerade": {
    sv: "AK1A Research Lab · {antal} kurser indexerade",
    en: "AK1A Research Lab · {antal} courses indexed",
    ar: "AK1A Research Lab · {antal} دورة مفهرسة",
  },
  "ui.katSida": { sv: "Sida", en: "Page", ar: "صفحة" },
  "ui.katVerktyg": { sv: "Verktyg", en: "Tool", ar: "أداة" },
  "ui.katKurs": { sv: "Kurs", en: "Course", ar: "دورة" },
  "ui.katTraning": { sv: "Träning", en: "Training", ar: "تدريب" },

  // Footer-ytorna (SPA-footern + sidfootern)
  "footer.navigation": { sv: "Navigation", en: "Navigation", ar: "التنقُّل" },
  "footer.juridikAnsvar": {
    sv: "Juridik & ansvar",
    en: "Legal & Responsibility",
    ar: "القانونية والمسؤولية",
  },
  "footer.anvandarvillkor": { sv: "Användarvillkor", en: "Terms of Use", ar: "شروط الاستخدام" },
  "footer.cookiepolicy": { sv: "Cookiepolicy", en: "Cookie Policy", ar: "سياسة الكوكيز" },
  "footer.ansvarFriskrivning": {
    sv: "Ansvar & friskrivning",
    en: "Responsibility & Disclaimer",
    ar: "المسؤولية وإخلاء المسؤولية",
  },
  "footer.upphovsratt": {
    sv: "Upphovsrätt & källor",
    en: "Copyright & Sources",
    ar: "حقوق النشر والمصادر",
  },
  "footer.allaKallor": { sv: "Alla 101 källor", en: "All 101 sources", ar: "جميع المصادر الـ101" },
  "footer.cookieInstallningar": {
    sv: "Cookie-inställningar",
    en: "Cookie settings",
    ar: "إعدادات الكوكيز",
  },
  "footer.tillToppen": { sv: "Till toppen", en: "To the top", ar: "إلى الأعلى" },

  // ── Startsidan (sections/home-section.tsx) ────────────────────────────────
  "home.heroRubrik": {
    sv: "Bli analytikern som ser vad andra missar.",
    en: "Become the analyst who sees what others miss.",
    ar: "كن المحلل الذي يرى ما يفوّته الآخرون.",
  },
  "home.heroUnderrubrik": {
    sv: "Lär dig läsa bolag som en analytiker — från första årsredovisningen till certifikatet. {kurser} kurser, {quiz} quiz-frågor och verktygen som hör till, från dag ett.",
    en: "Learn to read companies like an analyst — from your first annual report to the certificate. {kurser} courses, {quiz} quiz questions and the tools that go with them, from day one.",
    ar: "تعلَّم قراءة الشركات كمُحلِّل — من أول تقرير سنوي حتى الشهادة. {kurser} دورة و{quiz} سؤال اختبار والأدوات المرافقة، من اليوم الأول.",
  },
  "home.bliMedlemGratis": {
    sv: "Bli medlem — gratis",
    en: "Become a member — free",
    ar: "انضم كعضو — مجانًا",
  },
  "home.utforskaKurserna": {
    sv: "Utforska kurserna",
    en: "Explore the courses",
    ar: "استكشف الدورات",
  },
  "home.heroMikro1": {
    sv: "Fas 1 för alltid 0 kr",
    en: "Phase 1 free forever",
    ar: "المرحلة 1 مجانية للأبد",
  },
  "home.heroMikro2": {
    sv: "Alla kurser upplåsta direkt",
    en: "All courses unlocked instantly",
    ar: "جميع الدورات مفتوحة فورًا",
  },
  "home.heroMikro3": {
    sv: "Inget kort krävs",
    en: "No card required",
    ar: "لا حاجة إلى بطاقة",
  },
  "home.siffrorEyebrow": {
    sv: "AK1A i siffror",
    en: "AK1A in numbers",
    ar: "AK1A في أرقام",
  },
  "home.siffraKurser": { sv: "kurser", en: "courses", ar: "دورة" },
  "home.siffraKurserUt": {
    sv: "Från bokföringens grunder till AK1TS våglära.",
    en: "From the foundations of accounting to AK1TS wave theory.",
    ar: "من أساسيات المحاسبة إلى نظرية الأمواج AK1TS.",
  },
  "home.siffraQuiz": { sv: "quiz-frågor", en: "quiz questions", ar: "سؤال اختبار" },
  "home.siffraQuizUt": {
    sv: "Varje kurs avslutas med quiz som prickar kunskapsluckorna.",
    en: "Every course ends with a quiz that pinpoints your knowledge gaps.",
    ar: "تنتهي كل دورة باختبار يحدد فجوات معرفتك.",
  },
  "home.siffraBoker": { sv: "heltäckta böcker", en: "complete books", ar: "كتب شاملة" },
  "home.siffraBokerUt": {
    sv: "Från Security Analysis till Poor Charlie's Almanack.",
    en: "From Security Analysis to Poor Charlie's Almanack.",
    ar: "من Security Analysis إلى Poor Charlie's Almanack.",
  },
  "home.siffraVerktyg": { sv: "verktyg", en: "tools", ar: "أداة" },
  "home.siffraVerktygUt": {
    sv: "Kalkylatorn, Vågfundamentet, Konfluensradarn med flera.",
    en: "The Calculator, the Wave Foundation, the Confluence Radar and more.",
    ar: "الحاسبة وأساس الموجات ورادار التقارب وغيرها.",
  },
  "home.siffraStart": { sv: "att börja", en: "to start", ar: "للبدء" },
  "home.siffraStartUt": {
    sv: "Fas 1 är gratis — för alltid. Inget kort, ingen bindningstid.",
    en: "Phase 1 is free — forever. No card, no lock-in.",
    ar: "المرحلة 1 مجانية — للأبد. بلا بطاقة وبلا التزام.",
  },
  "home.varforEyebrow": { sv: "Varför AK1A?", en: "Why AK1A?", ar: "لماذا AK1A؟" },
  "home.varforRubrik": {
    sv: "En komplett utbildning i aktieanalys — inte en ström av tips.",
    en: "A complete education in stock analysis — not a stream of tips.",
    ar: "تعليم متكامل في تحليل الأسهم — لا سيلًا من النصائح.",
  },
  "home.skal1Rubrik": {
    sv: "Fundamental analys från grunden",
    en: "Fundamental analysis from the ground up",
    ar: "التحليل الأساسي من الأساس",
  },
  "home.skal1Mening1": {
    sv: "Från Grahams marginal of safety till modern räkenskapsanalys — AKM1:s 20 variabler ger dig en struktur i stället för gissningar.",
    en: "From Graham's margin of safety to modern financial-statement analysis — AKM1's 20 variables give you structure instead of guesswork.",
    ar: "من هامش أمان غراهام إلى التحليل المالي الحديث — متغيرات AKM1 العشرون تمنحك منهجًا بدل التخمين.",
  },
  "home.skal1Mening2": {
    sv: "Varje steg förklaras på svenska, med quiz som tvingar dig att tänka själv.",
    en: "Every step is explained in Swedish, with quizzes that force you to think for yourself.",
    ar: "كل خطوة مشروحة بالسويدية، مع اختبارات تجبرك على التفكير بنفسك.",
  },
  "home.skal1Lank": { sv: "Öppna kurserna", en: "Open the courses", ar: "افتح الدورات" },
  "home.skal2Rubrik": {
    sv: "Byggd på mästarnas böcker",
    en: "Built on the masters' books",
    ar: "مبنيّ على كتب الأساتذة",
  },
  "home.skal2Mening1": {
    sv: "{bocker} böcker — var och en en egen kurs med källkort som pekar på originalkapitlen.",
    en: "{bocker} books — each one a course of its own, with source cards pointing to the original chapters.",
    ar: "{bocker} كتابًا — كلٌّ منها دورة قائمة بذاتها مع بطاقات مصادر تشير إلى الفصول الأصلية.",
  },
  "home.skal2Mening2": {
    sv: "Du lär dig mästarnas metoder i original, inte andrahandsreferat.",
    en: "You learn the masters' methods in the original — not second-hand summaries.",
    ar: "تتعلم مناهج الأساتذة من الأصل — لا ملخصات منقولة.",
  },
  "home.skal2Lank": {
    sv: "Utforska bokkurserna",
    en: "Explore the book courses",
    ar: "استكشف دورات الكتب",
  },
  "home.skal3Rubrik": {
    sv: "Verktygen ingår",
    en: "The tools are included",
    ar: "الأدوات مشمولة",
  },
  "home.skal3Mening1": {
    sv: "AKM1-kalkylatorn väger 20 fundamentalvariabler, Vågfundamentet visar dem som tidsserier och Konfluensradarn (Fas 3) låter värde möta vågor.",
    en: "The AKM1 calculator weighs 20 fundamental variables, the Wave Foundation shows them as time series, and the Confluence Radar (Phase 3) lets value meet waves.",
    ar: "حاسبة AKM1 توازن 20 متغيرًا أساسيًا، وأساس الموجات يعرضها كسلاسل زمنية، ورادار التقارب (المرحلة 3) يجعل القيمة تلتقي بالموجات.",
  },
  "home.skal3Mening2": {
    sv: "Samma system som kurserna lär ut — ingen extra kostnad.",
    en: "The same system the courses teach — at no extra cost.",
    ar: "النظام ذاته الذي تعلِّمه الدورات — دون أي تكلفة إضافية.",
  },
  "home.skal3Lank": {
    sv: "Öppna kalkylatorn",
    en: "Open the calculator",
    ar: "افتح الحاسبة",
  },
  "home.skal4Rubrik": {
    sv: "Certifikat — och vägen vidare",
    en: "Certificates — and the road ahead",
    ar: "الشهادات — والطريق إلى الأمام",
  },
  "home.skal4Mening1": {
    sv: "Klara kurser, samla XP och tjäna ditt certifikat på nivå A–D.",
    en: "Complete courses, collect XP and earn your certificate at level A–D.",
    ar: "أنجز الدورات واجمع XP واحصل على شهادتك في المستوى A–D.",
  },
  "home.skal4Mening2": {
    sv: "I Fas 2 öppnas personlig utbildning och chansen att bli certifierad representant för AK1nvestor.",
    en: "In Phase 2, personal education opens up — along with the chance to become a certified representative of AK1nvestor.",
    ar: "في المرحلة 2 يفتح التعليم الشخصي أبوابه — مع فرصة أن تصبح ممثلًا معتمدًا لـ AK1nvestor.",
  },
  "home.skal4Lank": {
    sv: "Se certifikatet",
    en: "See the certificate",
    ar: "اطلع على الشهادة",
  },
  "home.verktygIdag": {
    sv: "Verktygen på plats idag:",
    en: "Tools in place today:",
    ar: "الأدوات المتوفرة اليوم:",
  },
  "home.fas2Etikett": { sv: "Fas 2:", en: "Phase 2:", ar: "المرحلة 2:" },
  "home.bliCertifierad": {
    sv: "bli certifierad representant",
    en: "become a certified representative",
    ar: "كن ممثلًا معتمدًا",
  },
  "home.seMedlemskapen": {
    sv: "se medlemskapen",
    en: "see the memberships",
    ar: "اطلع على العضويات",
  },
  "home.stigEyebrow": {
    sv: "Fas 1 — vägen in",
    en: "Phase 1 — the way in",
    ar: "المرحلة 1 — طريق الدخول",
  },
  "home.stigRubrik": {
    sv: "Från gratis konto till certifikat.",
    en: "From free account to certificate.",
    ar: "من حساب مجاني إلى الشهادة.",
  },
  "home.stigUnderrubrik": {
    sv: "Fas 1 → alla kurser upplåsta · XP & badges · Certifikat A–D. Kontot kostar inget och kurserna låses upp i samma ögonblick du skapar det.",
    en: "Phase 1 → all courses unlocked · XP & badges · Certificate A–D. The account costs nothing, and the courses unlock the moment you create it.",
    ar: "المرحلة 1 ← جميع الدورات مفتوحة · XP والشارات · شهادة A–D. الحساب بلا تكلفة، وتُفتح الدورات لحظة إنشائه.",
  },
  "home.stig1Rubrik": { sv: "Skapa kontot", en: "Create your account", ar: "أنشئ حسابك" },
  "home.stig1Undertext": {
    sv: "0 kr · en minut",
    en: "0 SEK · one minute",
    ar: "0 كرونة · دقيقة واحدة",
  },
  "home.stig2Rubrik": {
    sv: "Alla kurser upplåsta",
    en: "All courses unlocked",
    ar: "جميع الدورات مفتوحة",
  },
  "home.stig2Undertext": {
    sv: "{kurser} kurser, direkt",
    en: "{kurser} courses, instantly",
    ar: "{kurser} دورة، فورًا",
  },
  "home.stig3Rubrik": { sv: "XP & badges", en: "XP & badges", ar: "XP والشارات" },
  "home.stig3Undertext": {
    sv: "Poäng, nivåer, troféer",
    en: "Points, levels, trophies",
    ar: "نقاط ومستويات وكؤوس",
  },
  "home.stig4Rubrik": { sv: "Certifikat A–D", en: "Certificate A–D", ar: "شهادة A–D" },
  "home.stig4Undertext": {
    sv: "Bevis på kunskapen",
    en: "Proof of the knowledge",
    ar: "دليل على المعرفة",
  },
  "home.slutOvan": {
    sv: "AK1A Research Lab · Fas 1",
    en: "AK1A Research Lab · Phase 1",
    ar: "AK1A Research Lab · المرحلة 1",
  },
  "home.slutRubrik": {
    sv: "Din första kurs börjar om 30 sekunder.",
    en: "Your first course starts in 30 seconds.",
    ar: "دورتك الأولى تبدأ خلال 30 ثانية.",
  },
  "home.slutUnderrubrik": {
    sv: "Skapa gratis konto — alla {kurser} kurser låses upp direkt.",
    en: "Create a free account — all {kurser} courses unlock instantly.",
    ar: "أنشئ حسابًا مجانيًا — تُفتح جميع دورات {kurser} فورًا.",
  },
  "home.slutMikro1": {
    sv: "0 kr för alltid",
    en: "0 SEK forever",
    ar: "0 كرونة للأبد",
  },
  "home.slutOsaker": { sv: "Osäker?", en: "Unsure?", ar: "متردد؟" },
  "home.slutTitta": {
    sv: "Titta bland kurserna först",
    en: "Browse the courses first",
    ar: "تصفَّح الدورات أولًا",
  },

  // ── Prenumerations-CTA (VÅG 63 O2 #2 — kurs-slutet + Min Sida) ────────────
  "prenum.ctaTitel": {
    sv: "Ta nästa steg: portföljforskningen",
    en: "Take the next step: the portfolio research",
    ar: "الخطوة التالية: أبحاث المحفظة",
  },
  "prenum.ctaText": {
    sv: "Kurserna bygger kunskapen — forskningen håller den vid liv. Från {pris}/mån.",
    en: "The courses build the knowledge — the research keeps it alive. From {pris}/month.",
    ar: "الدورات تبني المعرفة — والأبحاث تبقيها حيّة. ابتداءً من {pris}/شهريًا.",
  },
  "prenum.ctaKnapp": {
    sv: "Utforska prenumerationen →",
    en: "Explore the subscription →",
    ar: "استكشف الاشتراك ←",
  },

  // ── VÅG 82 D (2026-09-07): kurskategorier på speglarna ─────────────────────
  // Kategori-värdena är FRIA STRÄNGAR ur public/deep-courses.json (versala,
  // 27 unika). Nyckelstämman är normaliserad ur datavärdet (versal → Å/Ä→A,
  // Ö→O → kvarvarande icke A–Z/0–9 stryks → gemener) — funktionen bor i
  // kurs-speglar.ts (kategoriNyckel/kategoriEtikett). SV-raden ÄR datavärdet
  // ordagrant: svenska /kurser visar kategorin rå som förr, och en framtida
  // okänd kategori faller tillbaka på sitt eget värde (aldrig tomt).
  // Bedömning per etikett: vanliga substantiv översätts; varumärkeskategorierna
  // BOKMASTER förblir latinska på alla tre språken (ordlistans varumärkes-
  // regel); AK1TS är varumärke men FÖRDJUPNING översätts runt det; MOAT är
  // vardaglig finansiell term (EN oförändrad, AR standardtermen الخندق
  // الاقتصادي ur Buffett-litteraturen).
  "kategori.bokmaster": { sv: "BOKMASTER", en: "BOKMASTER", ar: "BOKMASTER" },
  "kategori.sektoranalys": { sv: "SEKTORANALYS", en: "Sector Analysis", ar: "تحليل القطاعات" },
  "kategori.ak1tsfordjupning": { sv: "AK1TS FÖRDJUPNING", en: "AK1TS Deep Dives", ar: "تعمُّق AK1TS" },
  "kategori.varderingsmetoder": { sv: "VÄRDERINGSMETODER", en: "Valuation Methods", ar: "طرق التقييم" },
  "kategori.praktiskacase": { sv: "PRAKTISKA CASE", en: "Practical Cases", ar: "حالات عملية" },
  "kategori.beteendefinans": { sv: "BETEENDEFINANS", en: "Behavioral Finance", ar: "التمويل السلوكي" },
  "kategori.riskhantering": { sv: "RISKHANTERING", en: "Risk Management", ar: "إدارة المخاطر" },
  "kategori.portfoljhantering": { sv: "PORTFÖLJHANTERING", en: "Portfolio Management", ar: "إدارة المحفظة" },
  "kategori.bokforingarsredovisning": {
    sv: "BOKFÖRING & ÅRSREDOVISNING",
    en: "Accounting & Annual Reports",
    ar: "المحاسبة والتقارير السنوية",
  },
  "kategori.utdelningsstrategi": { sv: "UTDELNINGSSTRATEGI", en: "Dividend Strategy", ar: "استراتيجية توزيعات الأرباح" },
  "kategori.makroekonomi": { sv: "MAKROEKONOMI", en: "Macroeconomics", ar: "الاقتصاد الكلي" },
  "kategori.riskhanteringportfoljteori": {
    sv: "RISKHANTERING & PORTFÖLJTEORI",
    en: "Risk Management & Portfolio Theory",
    ar: "إدارة المخاطر ونظرية المحفظة",
  },
  "kategori.svenskbolagsskattjuridik": {
    sv: "SVENSK BOLAGSSKATT & JURIDIK",
    en: "Swedish Corporate Tax & Law",
    ar: "ضرائب الشركات السويدية والقانون",
  },
  "kategori.makroekonomiranta": {
    sv: "MAKROEKONOMI & RÄNTA",
    en: "Macroeconomics & Interest Rates",
    ar: "الاقتصاد الكلي وأسعار الفائدة",
  },
  "kategori.skattjuridik": { sv: "SKATT & JURIDIK", en: "Tax & Law", ar: "الضرائب والقانون" },
  "kategori.optionsderivat": { sv: "OPTIONS & DERIVAT", en: "Options & Derivatives", ar: "الخيارات والمشتقات" },
  "kategori.ekosystem": { sv: "EKOSYSTEM", en: "Ecosystem", ar: "المنظومة" },
  "kategori.tillvaxt": { sv: "TILLVÄXT", en: "Growth", ar: "النمو" },
  "kategori.vardering": { sv: "VÄRDERING", en: "Valuation", ar: "التقييم" },
  "kategori.lonsamhet": { sv: "LÖNSAMHET", en: "Profitability", ar: "الربحية" },
  "kategori.stabilitet": { sv: "STABILITET", en: "Stability", ar: "الاستقرار" },
  "kategori.moat": { sv: "MOAT", en: "Moat", ar: "الخندق الاقتصادي" },
  "kategori.katalysator": { sv: "KATALYSATOR", en: "Catalyst", ar: "المُحفِّز" },
  "kategori.privateequityinvestmentbolag": {
    sv: "PRIVATE EQUITY & INVESTMENTBOLAG",
    en: "Private Equity & Investment Companies",
    ar: "الأسهم الخاصة وشركات الاستثمار",
  },
  "kategori.aktiemarknadenipraktiken": {
    sv: "AKTIEMARKNADEN I PRAKTIKEN",
    en: "The Stock Market in Practice",
    ar: "سوق الأسهم عمليًا",
  },
  "kategori.risk": { sv: "RISK", en: "Risk", ar: "المخاطر" },
  "kategori.kapitalstruktur": { sv: "KAPITALSTRUKTUR", en: "Capital Structure", ar: "هيكل رأس المال" },

  // ── V86 (2026-09-07): totalrensning av svensk krom-läcka på speglarna ────
  // P0-kundrapporten: kurs-sökets register/kort/paginering, prenumerationens
  // nivå-kort/rabattband/aktiveringspanel och Fas3Cert renderade hårdkodad
  // svenska på /en|/ar. Alla dessa är DELADE klientkomponenter (även svenska
  // originalet) — sv-raden ÄR den tidigare hårdkodade texten ordagrant, så
  // (huvud)-sidorna är oförändrade. Språket löses med useSprak() — på
  // speglarna ger SpegelSprakLeverantor (våg 81) spegelns språk från SSR.
  // AR: modern standardarabiska, korrekt finansiell terminologi, bestämda
  // former; pilar speglade (→ blir ←); inga translitterationer.

  // Kurs-söket (kurs-sok.tsx) — registret, korten, pagineringen, väggen
  "ksok.ariaRegister": { sv: "Kursregistret", en: "The course register", ar: "سجل الدورات" },
  "ksok.register": { sv: "Registret", en: "The Register", ar: "السجل" },
  "ksok.helaBiblioteket": { sv: "hela biblioteket", en: "the entire library", ar: "المكتبة كاملة" },
  "ksok.traffar": { sv: "{antal} träffar", en: "{antal} matches", ar: "النتائج: {antal}" },
  "ksok.rensaFilter": { sv: "Rensa filter ✕", en: "Clear filters ✕", ar: "مسح عوامل التصفية ✕" },
  "ksok.sortera": { sv: "Sortera", en: "Sort", ar: "ترتيب" },
  "ksok.sorteraAria": { sv: "Sortera kurserna", en: "Sort the courses", ar: "ترتيب الدورات" },
  "ksok.sortRekommenderad": { sv: "Rekommenderad", en: "Recommended", ar: "الموصى به" },
  "ksok.sortAo": { sv: "Titel A–Ö", en: "Title A–Z", ar: "العنوان أ–ي" },
  "ksok.sortKapitel": { sv: "Fler kapitel först", en: "Most chapters first", ar: "الأكثر فصولًا أولًا" },
  "ksok.visarAv": {
    sv: "Visar {fran}–{till} av {total} kurser",
    en: "Showing {fran}–{till} of {total} courses",
    ar: "عرض {fran}–{till} من {total} دورة",
  },
  "ksok.ingaAttVisa": { sv: "Inga kurser att visa", en: "No courses to show", ar: "لا دورات لعرضها" },
  "ksok.sidaAv": { sv: "sida {sida} av {sidor}", en: "page {sida} of {sidor}", ar: "صفحة {sida} من {sidor}" },
  "ksok.fasFraga": {
    sv: "Vad är Fas 2 och Fas 3?",
    en: "What are Phase 2 and Phase 3?",
    ar: "ما المرحلتان 2 و3؟",
  },
  "ksok.fasInfo": {
    sv: "Fas 2 — sammanvägningen av de 20 indikatorerna till ett eget omdöme (18 mästarverks-kurser; ingen teknisk analys-utbildning). Fas 3 — det dynamiska ekosystemet: vågor, teknisk analys på mästarnivå och psykologi (24 kurser). Öppnas med medlemskap.",
    en: "Phase 2 — weighing the 20 indicators together into a judgment of your own (18 masterwork courses; no technical-analysis training). Phase 3 — the dynamic ecosystem: waves, technical analysis at master level and psychology (24 courses). Opened with membership.",
    ar: "المرحلة 2 — الجمع بين المؤشرات العشرين في حكمك الخاص (18 دورة في الأعمال الفنية؛ بلا تدريب على التحليل الفني). المرحلة 3 — المنظومة الديناميكية: الموجات والتحليل الفني بمستوى الأساتذة وعلم النفس (24 دورة). تُفتح مع العضوية.",
  },
  "ksok.fas2Lank": { sv: "Fas 2 →", en: "Phase 2 →", ar: "المرحلة 2 ←" },
  "ksok.fas3Lank": { sv: "Fas 3 →", en: "Phase 3 →", ar: "المرحلة 3 ←" },
  "ksok.ingaMatchade": {
    sv: "Inga kurser matchade — prova ett annat sökord.",
    en: "No courses matched — try another search term.",
    ar: "لا دورات مطابقة — جرِّب كلمة بحث أخرى.",
  },
  "ksok.foregaendeKnapp": { sv: "← Föregående", en: "← Previous", ar: "→ السابق" },
  "ksok.nastaKnapp": { sv: "Nästa →", en: "Next →", ar: "التالي ←" },
  "ksok.sidnavigering": { sv: "Sidnavigering", en: "Page navigation", ar: "تنقُّل الصفحات" },
  "ksok.heroAria": {
    sv: "Sök i kursbiblioteket",
    en: "Search the course library",
    ar: "ابحث في مكتبة الدورات",
  },
  "ksok.sokPlats": {
    sv: "Sök bland {antal} kurser — titel eller ämne…",
    en: "Search {antal} courses — title or topic…",
    ar: "ابحث بين {antal} دورة — العنوان أو الموضوع…",
  },
  "ksok.sokAria": { sv: "Sök kurser", en: "Search courses", ar: "ابحث في الدورات" },
  "ksok.sokStat": {
    sv: "{kurser} kurser · {kategorier} kategorier — hela biblioteket, sökt på sekunder",
    en: "{kurser} courses · {kategorier} categories — the entire library, searched in seconds",
    ar: "{kurser} دورة · {kategorier} فئة — المكتبة كاملة، ونتائج فورية",
  },
  "ksok.alla": { sv: "Alla ({antal})", en: "All ({antal})", ar: "الكل ({antal})" },
  "ksok.kategorivagg": { sv: "Kategoriväggen", en: "The Category Wall", ar: "جدار الفئات" },
  "ksok.kategorivaggStat": {
    sv: "{kategorier} kategorier · {kurser} kurser",
    en: "{kategorier} categories · {kurser} courses",
    ar: "{kategorier} فئة · {kurser} دورة",
  },
  "ksok.kategorivaggText": {
    sv: "Hela biblioteket på en vägg — välj en kategori så filtreras registret ovan.",
    en: "The entire library on one wall — choose a category to filter the register above.",
    ar: "المكتبة كاملة على جدار واحد — اختر فئة لتصفية السجل أعلاه.",
  },
  "ksok.allaKategorierAria": { sv: "Alla kategorier", en: "All categories", ar: "جميع الفئات" },
  "ksok.fasKursTitel": {
    sv: "Fas {fas}-kurs — öppnas med Fas {fas}-medlemskap",
    en: "Phase {fas} course — opened with Phase {fas} membership",
    ar: "دورة المرحلة {fas} — تُفتح مع عضوية المرحلة {fas}",
  },
  "ksok.fasLas": { sv: "🔒 Fas {fas}", en: "🔒 Phase {fas}", ar: "🔒 المرحلة {fas}" },
  "ksok.fasKort": { sv: "Fas {fas}", en: "Phase {fas}", ar: "المرحلة {fas}" },
  "ksok.kortMeta": {
    sv: "{kapitel} kapitel · {minuter} min · ",
    en: "{kapitel} chapters · {minuter} min · ",
    ar: "{kapitel} فصول · {minuter} د · ",
  },
  "ksok.kortQuiz": { sv: "{quiz} quiz · ", en: "{quiz} quiz · ", ar: "{quiz} اختبار · " },
  "ksok.kortXp": { sv: "{xp} XP", en: "{xp} XP", ar: "{xp} XP" },
  "ksok.radMeta": {
    sv: "{kapitel} kap · {minuter} min · {xp} XP",
    en: "{kapitel} ch · {minuter} min · {xp} XP",
    ar: "{kapitel} فصول · {minuter} د · {xp} XP",
  },
  "ksok.lasNotice": {
    sv: "Öppnas i Fas {fas} — ansök för att komma vidare →",
    en: "Opens in Phase {fas} — apply to move on →",
    ar: "تُفتح في المرحلة {fas} — قدِّم طلبك للمتابعة ←",
  },

  // Prenumerationen (niva-kort.tsx, rabatt-band.tsx, aktivera-panel.tsx)
  "prenum.mestValda": { sv: "Mest valda", en: "Most chosen", ar: "الأكثر اختيارًا" },
  "prenum.perManad": { sv: "/mån", en: "/mo", ar: "/شهر" },
  "prenum.perAr": { sv: "/år", en: "/yr", ar: "/سنة" },
  "prenum.fasRabattChip": {
    sv: "Fas {fas}-rabatt −{procent} % — känns igen automatiskt",
    en: "Phase {fas} discount −{procent} % — recognised automatically",
    ar: "خصم المرحلة {fas} −{procent}٪ — يُتعرَّف عليه تلقائيًا",
  },
  "prenum.manader1": { sv: "1 månad gratis", en: "1 month free", ar: "شهر واحد مجانًا" },
  "prenum.manader2": { sv: "2 månader gratis", en: "2 months free", ar: "شهران مجانًا" },
  "prenum.manaderFlera": {
    sv: "{n} månader gratis",
    en: "{n} months free",
    ar: "{n} أشهر مجانية",
  },
  "prenum.aktiveraNiva": {
    sv: "Aktivera den här nivån →",
    en: "Activate this tier →",
    ar: "فعِّل هذا المستوى ←",
  },
  // Nivå-beskrivningarna ur priser.json (data) — tText-exaktmatch i NivaKort;
  // sv-raden ÄR datavärdet ordagrant, framtida nivåer faller tillbaka på sitt
  // eget värde (samma fallback-form som kategorierna, våg 82 D).
  "prenum.beskrivning.forskning": {
    sv: "Kunden väljer risknivå (konservativ, balanserad eller tillväxt) och tillväxttakt (lugn, stadig eller aggressiv) — 9 profiler sammanlagt. Månadsvis forskningsportfölj med AKM1-poäng, fundamental och teknisk vågstatus per horisont, golvmarginal samt kravkontroller per innehav. Pedagogiskt underlag utan köp- eller säljuppmaningar.",
    en: "You choose risk level (conservative, balanced or growth) and growth pace (calm, steady or aggressive) — 9 profiles in total. A monthly research portfolio with AKM1 scores, fundamental and technical wave status per horizon, floor margin and requirement checks per holding. Educational material — no prompts to buy or sell.",
    ar: "تختار مستوى المخاطر (متحفظًا أو متوازنًا أو نمو) ووتيرة النمو (هادئة أو ثابتة أو عدوانية) — 9 ملفات إجمالًا. محفظة بحثية شهرية بدرجات AKM1، وحالة موجات أساسية وفنية لكل أفق زمني، وهامش أرضي واختبارات متطلبات لكل حيازة. مادة تعليمية — بلا أي دعوات للشراء أو البيع.",
  },
  "prenum.beskrivning.forskningPlus": {
    sv: "Grundnivån plus löpande ersättningsförslag när ett innehav brutit mot profilens strikta krav (upp till tre alternativ i samma bransch med jämförelsetext), kvartalsvis uppföljning då-vs-nu samt portföljens samlade vågmatris per horisont.",
    en: "The Basic tier plus ongoing replacement suggestions when a holding has broken the profile's strict requirements (up to three alternatives in the same sector with comparison text), quarterly then-vs-now follow-up and the portfolio's combined wave matrix per horizon.",
    ar: "المستوى الأساسي مع مقترحات بديلة مستمرة عندما تخرق إحدى الحيازات متطلبات الملف الصارمة (حتى ثلاثة بدائل في القطاع نفسه مع نص مقارن)، ومتابعة ربع سنوية «آنذاك مقابل الآن»، ومصفوفة الأمواج الموحدة للمحفظة لكل أفق زمني.",
  },
  "prenum.beskrivning.portfoljHyra": {
    sv: "Kunden hyr den forskningsportfölj som speglar vald riskprofil: AK1A sköter omvikningar, kravkontroller och ersättningsanalys vid varje uppdatering. Forskning och utbildning — aldrig förvaltning eller investeringsrådgivning enligt lagen (2007:528).",
    en: "You rent the research portfolio that mirrors your chosen risk profile: AK1A manages rebalancing, requirement checks and replacement analysis at every update. Research and education — never management or investment advice under the Swedish Securities Market Act (2007:528).",
    ar: "تستأجر المحفظة البحثية التي تعكس ملف المخاطر الذي اخترته: تتولى AK1A إعادة الموازنة واختبارات المتطلبات وتحليل البدائل عند كل تحديث. بحث وتعليم — وليست أبدًا إدارة أو تقديم نصائح استثمارية وفق القانون السويدي (2007:528).",
  },
  "prenum.rabattElev": {
    sv: "Din Fas {fas}-status är kännd — {procent} % rabatt för alltid",
    en: "Your Phase {fas} status is recognised — {procent} % off forever",
    ar: "حالتك في المرحلة {fas} مُعرَّفة — خصم {procent}٪ إلى الأبد",
  },
  "prenum.rabattFraga": {
    sv: "Fas 2- eller Fas 3-elev? {procent} % rabatt för alltid",
    en: "Phase 2 or Phase 3 student? {procent} % off forever",
    ar: "طالب في المرحلة 2 أو 3؟ خصم {procent}٪ إلى الأبد",
  },
  "prenum.rabattElevTextA": {
    sv: "Din status känns igen automatiskt — du behöver aldrig bevis eller kupongkoder. Exempel: ",
    en: "Your status is recognised automatically — you never need proof or coupon codes. Example: ",
    ar: "يُتعرَّف على حالتك تلقائيًا — لن تحتاج أبدًا إلى إثباتات أو أكواد خصم. مثال: ",
  },
  "prenum.rabattElevTextB": {
    sv: "/mån, alla nivåer, både månads- och årspris.",
    en: "/mo, all tiers, both monthly and annual prices.",
    ar: "/شهر، جميع المستويات، بالسعرين الشهري والسنوي معًا.",
  },
  "prenum.rabattEjTextA": {
    sv: "Din status känns igen automatiskt — inga kupongkoder. Exempel: ",
    en: "Your status is recognised automatically — no coupon codes. Example: ",
    ar: "يُتعرَّف على حالتك تلقائيًا — بلا أكواد خصم. مثال: ",
  },
  "prenum.rabattEjTextB": {
    sv: "/mån. Prenumerationen är öppen för alla — utbildningseleverna får den bara lite billigare, för alltid.",
    en: "/mo. The subscription is open to everyone — students of the educations simply get it a little cheaper, forever.",
    ar: "/شهر. الاشتراك متاح للجميع — طلاب المراحل التعليمية يحصلون عليه بسعر أقل قليلًا فقط، وإلى الأبد.",
  },
  "prenum.ansokFas2": {
    sv: "Ansök om Fas 2 →",
    en: "Apply for Phase 2 →",
    ar: "التقدُّم بطلب للمرحلة 2 ←",
  },
  "prenum.aktiveringSteg": {
    sv: "AKTIVERING · STEG 1 AV 2",
    en: "ACTIVATION · STEP 1 OF 2",
    ar: "التفعيل · الخطوة 1 من 2",
  },
  "prenum.begarAktivering": { sv: "Begär aktivering", en: "Request activation", ar: "اطلب التفعيل" },
  "prenum.begarIntro": {
    sv: "Välj nivå och period — sedan skickar du begäran. Ingen betalning sker här: vi återkommer per e-post med aktivering och betalningsuppgifter.",
    en: "Choose a tier and period — then send your request. No payment takes place here: we return by email with activation and payment details.",
    ar: "اختر المستوى والمدة — ثم أرسل طلبك. لا تتم أي عملية دفع هنا: نعود إليك عبر البريد الإلكتروني بالتفعيل وبيانات الدفع.",
  },
  "prenum.sparadHittad": { sv: "Sparad begäran hittad.", en: "Saved request found.", ar: "عُثر على طلب محفوظ." },
  "prenum.sparadText": {
    sv: "Vi har en tidigare aktiveringsbegäran i den här webbläsaren ({niva}, {period}, sparat {datum}) — du kan skriva över den nedan.",
    en: "We have an earlier activation request in this browser ({niva}, {period}, saved {datum}) — you can overwrite it below.",
    ar: "لدينا طلب تفعيل سابق في هذا المتصفح ({niva}، {period}، حُفظ في {datum}) — يمكنك الكتابة فوقه أدناه.",
  },
  "prenum.valjNiva": { sv: "Välj nivå", en: "Choose a tier", ar: "اختر المستوى" },
  "prenum.periodRubrik": { sv: "Betalningsperiod", en: "Payment period", ar: "مدة الدفع" },
  "prenum.manadsvis": { sv: "Månadsvis", en: "Monthly", ar: "شهري" },
  "prenum.arsvis": { sv: "Årsvis", en: "Yearly", ar: "سنوي" },
  "prenum.manadsvisLank": { sv: "månadsvis", en: "monthly", ar: "شهري" },
  "prenum.arsvisLank": { sv: "årsvis", en: "yearly", ar: "سنوي" },
  "prenum.perManadLang": { sv: "per månad", en: "per month", ar: "شهريًا" },
  "prenum.perArLang": { sv: "per år", en: "per year", ar: "سنويًا" },
  "prenum.arPrisManader": {
    sv: "Årspriset motsvarar {betalda} månader — {gratis} gratis. ",
    en: "The annual price equals {betalda} months — {gratis} free. ",
    ar: "السعر السنوي يعادل {betalda} أشهر — منها {gratis} مجانًا. ",
  },
  "prenum.arPrisRabatterat": {
    sv: "Årspriset är rabatterat mot månadspriset. ",
    en: "The annual price is discounted against the monthly price. ",
    ar: "السعر السنوي مخفَّض عن السعر الشهري. ",
  },
  "prenum.arIngenBindningA": {
    sv: "Du binder dig inte: förnyelse sker bara efter ditt aktiva val (",
    en: "You are not locked in: renewal happens only after your active choice (",
    ar: "أنت غير ملتزم بأي قيد: لا يحدث التجديد إلا بعد اختيارك الفعلي (",
  },
  "prenum.villkorSektion5": {
    sv: "villkoren, sektion 5",
    en: "the terms, section 5",
    ar: "الشروط، القسم 5",
  },
  "prenum.dittNamn": { sv: "Ditt namn", en: "Your name", ar: "اسمك" },
  "prenum.epostExempel": { sv: "din@epost.se", en: "you@email.com", ar: "you@email.com" },
  "prenum.nyhetRubrik": {
    sv: "Få morgon-briefingen + forskningsuppdateringar per mejl",
    en: "Get the morning briefing + research updates by email",
    ar: "احصل على موجز الصباح + تحديثات الأبحاث عبر البريد الإلكتروني",
  },
  "prenum.nyhetText": {
    sv: "Frivilligt och kostnadsfritt — en kort, saklig morgonhälsning (vågkartan, dagens aktie, ett femminuterspass) och större forskningsuppdateringar. Avsluta när du vill genom att svara på ett brev. Pedagogisk analys — aldrig investeringsråd.",
    en: "Voluntary and free of charge — a short, factual morning greeting (the wave map, today's stock, a five-minute session) and larger research updates. End it whenever you like by replying to a letter. Educational analysis — never investment advice.",
    ar: "اختياري ومجاني — تحية صباحية قصيرة وموضوعية (خريطة الموجات، وسهم اليوم، وجلسة من خمس دقائق) وتحديثات بحثية أكبر. أنهِ الاشتراك متى شئت بالرد على رسالة. تحليل تعليمي — وليس أبدًا نصيحة استثمارية.",
  },
  "prenum.fasMinus": {
    sv: "Fas {fas} −{procent} %",
    en: "Phase {fas} −{procent} %",
    ar: "المرحلة {fas} −{procent}٪",
  },
  "prenum.fasStatusRabatt": {
    sv: "Din Fas-status känns igen automatiskt — rabatten gäller för alltid, på alla nivåer.",
    en: "Your Phase status is recognised automatically — the discount applies forever, on every tier.",
    ar: "يُتعرَّف على حالتك في المراحل تلقائيًا — والخصم قائم إلى الأبد على جميع المستويات.",
  },
  "prenum.ingenFasStatus": {
    sv: "Ingen Fas-status hittades i den här webbläsaren. Är du Fas 2- eller Fas 3-elev? Rabatten ({procent} %) syns automatiskt när du är inloggad med din elevstatus.",
    en: "No Phase status was found in this browser. Are you a Phase 2 or Phase 3 student? The discount ({procent} %) appears automatically when you are signed in with your student status.",
    ar: "لم يُعثر على حالة مراحل في هذا المتصفح. هل أنت طالب في المرحلة 2 أو 3؟ يظهر الخصم ({procent}٪) تلقائيًا عند تسجيل الدخول بحالة الطالب.",
  },
  "prenum.felValjNiva": { sv: "Välj en nivå först.", en: "Choose a tier first.", ar: "اختر المستوى أولًا." },
  "prenum.felEpost": {
    sv: "E-postadressen ser inte giltig ut — kontrollera den.",
    en: "The email address does not look valid — please check it.",
    ar: "يبدو عنوان البريد الإلكتروني غير صالح — تحقَّق منه.",
  },
  "prenum.felNyhetEpost": {
    sv: "Nyhetsbrevet behöver en e-postadress — fyll i raden ovan.",
    en: "The newsletter needs an email address — fill in the line above.",
    ar: "تحتاج النشرة البريدية إلى عنوان بريد إلكتروني — املأ الحقل أعلاه.",
  },
  "prenum.felSpara": {
    sv: "Kunde inte spara begäran i din webbläsare (privat läge?). Skicka ett mejl till {epost} i stället.",
    en: "Could not save the request in your browser (private mode?). Send an email to {epost} instead.",
    ar: "تعذَّر حفظ الطلب في متصفحك (وضع التصفح الخاص؟). أرسل بريدًا إلكترونيًا إلى {epost} بدلًا من ذلك.",
  },
  "prenum.bekraftRubrik": {
    sv: "Aktiveringsbegäran sparad",
    en: "Activation request saved",
    ar: "حُفظ طلب التفعيل",
  },
  "prenum.tack": { sv: "Tack", en: "Thank you", ar: "شكرًا" },
  "prenum.bekraftText": {
    sv: "Din begäran på {niva} ({period}) är sparad i din webbläsare{faspris}. Betalflödet är inte öppet ännu — aktivering sker via e-post.",
    en: "Your request for {niva} ({period}) is saved in your browser{faspris}. The payment flow is not open yet — activation takes place by email.",
    ar: "طلبك بخصوص {niva} ({period}) محفوظ في متصفحك{faspris}. لم يُفتح تدفق الدفع بعد — يتم التفعيل عبر البريد الإلكتروني.",
  },
  "prenum.bekraftFaspris": {
    sv: " med ditt Fas {fas}-pris ({pris} kr {period})",
    en: " with your Phase {fas} price ({pris} SEK {period})",
    ar: " بسعر المرحلة {fas} الخاص بك ({pris} كرونة {period})",
  },
  "prenum.nyhetRubrikBekraft": { sv: "Nyhetsbrevet:", en: "The newsletter:", ar: "النشرة البريدية:" },
  "prenum.nyhetSkickad": {
    sv: "Din plats i morgon-briefingen är registrerad och en bekräftelse är på väg till din inkorg.",
    en: "Your place in the morning briefing is registered and a confirmation is on its way to your inbox.",
    ar: "تم تسجيل مكانك في موجز الصباح ورسالة تأكيد في طريقها إلى صندوق بريدك.",
  },
  "prenum.nyhetFel": {
    sv: "Din nyhetsbrevsönskan kunde inte registreras just nu — mejla oss så lägger vi till dig manuellt.",
    en: "Your newsletter request could not be registered right now — email us and we will add you manually.",
    ar: "تعذَّر تسجيل طلب النشرة البريدية الآن — راسلنا عبر البريد الإلكتروني وسنضيفك يدويًا.",
  },
  "prenum.nyhetKoad": {
    sv: "Din plats i morgon-briefingen är sparad i utskickskön — första brevet kommer så snart utskicken är igång (ingen leverantör är kopplad ännu).",
    en: "Your place in the morning briefing is saved in the send queue — the first letter arrives as soon as the sends are running (no provider is connected yet).",
    ar: "مكانك في موجز الصباح محفوظ في قائمة الإرسال — سيصل أول بريد فور بدء عمليات الإرسال (لم يُربط أي مزوِّد بعد).",
  },
  "prenum.steg1": {
    sv: "Mejla oss — knappen nedan öppnar ditt e-postprogram med allt ifyllt.",
    en: "Email us — the button below opens your email program with everything filled in.",
    ar: "راسلنا — الزر أدناه يفتح برنامج بريدك الإلكتروني وكل شيء معبَّأ مسبقًا.",
  },
  "prenum.steg2": {
    sv: "Vi återkommer med aktivering, aktuella betalningsuppgifter och start.",
    en: "We return with activation, current payment details and start.",
    ar: "نعود إليك بالتفعيل وبيانات الدفع الحالية وموعد البدء.",
  },
  "prenum.steg3A": { sv: "Läs gärna ", en: "Please read ", ar: "ننصحك بقراءة " },
  "prenum.villkorAngerratt": {
    sv: "villkorens ångerrätts-sektion",
    en: "the terms' right-of-withdrawal section",
    ar: "قسم حق الانسحاب في الشروط",
  },
  "prenum.steg3B": {
    sv: " innan du börjar — digitalt innehåll levereras direkt.",
    en: " before you start — digital content is delivered immediately.",
    ar: " قبل أن تبدأ — المحتوى الرقمي يُسلَّم فورًا.",
  },
  "prenum.mejlaKnapp": {
    sv: "Mejla {epost} med begäran",
    en: "Email {epost} with the request",
    ar: "أرسل إلى {epost} بريدًا بالطلب",
  },
  "prenum.andraBegaran": { sv: "Ändra min begäran", en: "Change my request", ar: "تعديل طلبي" },
  "prenum.mailtoAmne": {
    sv: "Aktiveringsbegäran — {niva}",
    en: "Activation request — {niva}",
    ar: "طلب تفعيل — {niva}",
  },
  "prenum.mailtoHej": { sv: "Hej AK1A,", en: "Hello AK1A,", ar: "مرحبًا AK1A،" },
  "prenum.mailtoVill": {
    sv: "Jag vill aktivera: {niva} ({period})",
    en: "I want to activate: {niva} ({period})",
    ar: "أريد تفعيل: {niva} ({period})",
  },
  "prenum.mailtoPris": { sv: "Pris: {pris}", en: "Price: {pris}", ar: "السعر: {pris}" },
  "prenum.mailtoPrisRad": {
    sv: "{pris} kr {period} (ordinarie {ord} kr, Fas {fas}-rabatt)",
    en: "{pris} SEK {period} (regular {ord} SEK, Phase {fas} discount)",
    ar: "{pris} كرونة {period} (السعر العادي {ord} كرونة، خصم المرحلة {fas})",
  },
  "prenum.mailtoPrisRadEnkel": {
    sv: "{pris} kr {period}",
    en: "{pris} SEK {period}",
    ar: "{pris} كرونة {period}",
  },
  "prenum.mailtoNamn": { sv: "Namn: {namn}", en: "Name: {namn}", ar: "الاسم: {namn}" },
  "prenum.mailtoEpost": {
    sv: "E-post: {epost}",
    en: "Email: {epost}",
    ar: "البريد الإلكتروني: {epost}",
  },
  "prenum.mailtoSparad": {
    sv: "(Begäran sparad i min webbläsare {datum}.)",
    en: "(Request saved in my browser {datum}.)",
    ar: "(الطلب محفوظ في متصفحي بتاريخ {datum}.)",
  },
  "prenum.fotA": {
    sv: "Begäran sparas lokalt i din webbläsare och blir ett färdigifyllt mejl till ",
    en: "The request is saved locally in your browser and becomes a pre-filled email to ",
    ar: "يُحفظ الطلب محليًا في متصفحك ويتحول إلى بريد إلكتروني معبَّأ مسبقًا إلى ",
  },
  "prenum.fotB": {
    sv: " — inga kortuppgifter efterfrågas här. Samtidigt räknas en anonymiserad intention (endast nivå, period och pris — inget om dig) för vår konverteringsstatistik, se ",
    en: " — no card details are requested here. At the same time an anonymised intention (only tier, period and price — nothing about you) is counted for our conversion statistics, see ",
    ar: " — لا تُطلب بيانات بطاقة هنا. وفي الوقت نفسه تُحتسب نيّة مجهولة الهوية (المستوى والمدة والسعر فقط — لا شيء عنك) لإحصاءات التحويل لدينا، انظر ",
  },
  "prenum.fotTransparens": {
    sv: "transparensregistret",
    en: "the transparency register",
    ar: "سجل الشفافية",
  },
  "prenum.fotC": {
    sv: ". Aktivering, pris och eventuellt samtycke till omedelbar digital leverans (ångerrätten, se ",
    en: ". Activation, price and any consent to immediate digital delivery (the right of withdrawal, see ",
    ar: ". يتم تأكيد التفعيل والسعر وأي موافقة على التسليم الرقمي الفوري (حق الانسحاب، انظر ",
  },
  "prenum.fotVillkor6": { sv: "villkoren sektion 6", en: "the terms, section 6", ar: "الشروط القسم 6" },
  "prenum.fotD": {
    sv: ") bekräftas i mejlväxlingen. AK1A lämnar aldrig investeringsråd — se ",
    en: ") in the email exchange. AK1A never gives investment advice — see ",
    ar: ") في مراسلات البريد الإلكتروني. لا تقدِّم AK1A أبدًا نصائح استثمارية — انظر ",
  },
  "prenum.fotFinPolicy": { sv: "finansiell policy", en: "financial policy", ar: "السياسة المالية" },

  // Fas 3-cert-panelen (fas3-cert.tsx) — progress mot certifieringen
  "fas3cert.ringAria": {
    sv: "{procent} procent av steget",
    en: "{procent} percent of the step",
    ar: "{procent} بالمئة من الخطوة",
  },
  "fas3cert.pagar": { sv: "Pågår", en: "In progress", ar: "قيد التنفيذ" },
  "fas3cert.vantar": { sv: "Väntar", en: "Waiting", ar: "في الانتظار" },
  "fas3cert.last": { sv: "Låst", en: "Locked", ar: "مقفل" },
  "fas3cert.stegGrund": { sv: "Grund", en: "Foundation", ar: "الأساس" },
  "fas3cert.stegPraktik": { sv: "Praktik", en: "Practice", ar: "التطبيق" },
  "fas3cert.stegEtik": { sv: "Etik", en: "Ethics", ar: "الأخلاق" },
  "fas3cert.stegCert": { sv: "Certifiering", en: "Certification", ar: "الشهادة" },
  "fas3cert.av": { sv: "av {n}", en: "of {n}", ar: "من {n}" },
  "fas3cert.grundKlar": {
    sv: "Grunden är lagd — nivå {krav} är nått och Fas 3:s dörr står öppen för dig. Allt du byggt i Fas 1 bär du med dig in i praktiken.",
    en: "The foundation is laid — level {krav} is reached and Phase 3's door stands open for you. Everything you built in Phase 1 you carry with you into practice.",
    ar: "أُرسي الأساس — بلغتَ المستوى {krav} وباب المرحلة 3 مفتوح أمامك. كل ما بنيته في المرحلة 1 تحمله معك إلى التطبيق.",
  },
  "fas3cert.grundPagar": {
    sv: "Du är på nivå {niva} av {krav}. Varje kurs du klarar är en stapel närmare — och Fas 1:s hela bibliotek är gratis, för alltid.",
    en: "You are at level {niva} of {krav}. Every course you complete is one bar closer — and Phase 1's entire library is free, forever.",
    ar: "أنت في المستوى {niva} من {krav}. كل دورة تكملها تقرِّبك خطوة — ومكتبة المرحلة 1 كاملة مجانية، إلى الأبد.",
  },
  "fas3cert.fortsattGrund": {
    sv: "Fortsätt bygga grunden — gratis",
    en: "Keep building the foundation — free",
    ar: "واصل بناء الأساس — مجانًا",
  },
  "fas3cert.praktikKlar": {
    sv: "Tio kompletta analyser — praktikportföljen är full. Tack för att du bygger hantverket på riktiga bolag, steg för steg.",
    en: "Ten complete analyses — the practice portfolio is full. Thank you for building the craft on real companies, step by step.",
    ar: "عشرة تحليلات كاملة — محفظة التطبيق اكتملت. شكرًا لأنك تبني الحرفة على شركات حقيقية، خطوة بخطوة.",
  },
  "fas3cert.praktikPagarA": {
    sv: "Varje komplett Superanalys du sparar räknas automatiskt i din portfölj — {n} av {krav} staplar står redan.",
    en: "Every complete Superanalysis you save is counted automatically in your portfolio — {n} of {krav} bars already stand.",
    ar: "كل تحليل فائق كامل تحفظه يُحتسب تلقائيًا في محفظتك — {n} من أصل {krav} أعمدة قائمة بالفعل.",
  },
  "fas3cert.praktikUtkast1": {
    sv: "{n} pågående utkast väntar tålmodigt på sina sista poäng.",
    en: "One ongoing draft waits patiently for its final points.",
    ar: "مسودة واحدة جارية تنتظر بصبر نقاطها الأخيرة.",
  },
  "fas3cert.praktikUtkastFlera": {
    sv: "{n} pågående utkast väntar tålmodigt på sina sista poäng.",
    en: "{n} ongoing drafts wait patiently for their final points.",
    ar: "{n} مسودات جارية تنتظر بصبر نقاطها الأخيرة.",
  },
  "fas3cert.praktikPagarB": {
    sv: "Nästa analys du bygger är nästa steg.",
    en: "The next analysis you build is the next step.",
    ar: "التحليل التالي الذي تبنيه هو الخطوة التالية.",
  },
  "fas3cert.oppnaSuper": {
    sv: "Öppna Superanalysen",
    en: "Open the Superanalysis",
    ar: "افتح التحليل الفائق",
  },
  "fas3cert.etikText": {
    sv: "Etik-modulen öppnas tillsammans med din Fas 3-ansökan — tre löften som blir din analytikerkod. Löftena står redan här på sidan, så du kan börja leva efter dem idag.",
    en: "The ethics module opens together with your Phase 3 application — three promises that become your analyst code. The promises already stand here on the page, so you can begin living by them today.",
    ar: "تُفتح وحدة الأخلاق مع طلبك للمرحلة 3 — ثلاثة وعود تصبح مدونة المحلل الخاصة بك. الوعود معروضة هنا في الصفحة بالفعل، فيمكنك البدء بالعيش وفقها اليوم.",
  },
  "fas3cert.certText": {
    sv: "När grunden, portföljen och etiken är klara lämnar du in portföljen för granskning — AI-förgranskning och grundarens mänskliga slutbedömning, betyg A–F. Sedan är beviset ditt, för alltid.",
    en: "When the foundation, the portfolio and the ethics are complete you submit the portfolio for review — AI pre-review and the founder's human final judgement, grades A–F. Then the proof is yours, forever.",
    ar: "عندما يكتمل الأساس والمحفظة والأخلاق تُسلِّم المحفظة للمراجعة — مراجعة أولية بالذكاء الاصطناعي وحكم نهائي إنساني من المؤسس، بتقييم A–F. عندها يصبح الدليل ملكك، إلى الأبد.",
  },
  "fas3cert.aria": {
    sv: "Din progress mot Fas 3-certifieringen",
    en: "Your progress toward Phase 3 certification",
    ar: "تقدُّمك نحو شهادة المرحلة 3",
  },
  "fas3cert.eyebrow": {
    sv: "Din väg till certifieringen",
    en: "Your path to certification",
    ar: "طريقك إلى الشهادة",
  },
  "fas3cert.velkommenNu": {
    sv: "Välkommen{namn} — så här ser din resa ut just nu",
    en: "Welcome{namn} — this is what your journey looks like right now",
    ar: "مرحبًا{namn} — هكذا تبدو رحلتك الآن",
  },
  "fas3cert.velkommenResa": {
    sv: "Välkommen — så här ser resan mot certifieringen ut",
    en: "Welcome — this is what the journey toward certification looks like",
    ar: "مرحبًا — هكذا تبدو الرحلة نحو الشهادة",
  },
  "fas3cert.elevstatus": { sv: "Din elevstatus: ", en: "Your student status: ", ar: "حالتك كطالب: " },
  "fas3cert.statKursSing": {
    sv: "{n} klar kurs",
    en: "{n} course completed",
    ar: "دورة واحدة مكتملة",
  },
  "fas3cert.statKursFler": {
    sv: "{n} klara kurser",
    en: "{n} courses completed",
    ar: "{n} دورات مكتملة",
  },
  "fas3cert.statAnalysSing": {
    sv: "{n} sparad analys",
    en: "{n} saved analysis",
    ar: "تحليل واحد محفوظ",
  },
  "fas3cert.statAnalysFler": {
    sv: "{n} sparade analyser",
    en: "{n} saved analyses",
    ar: "{n} تحليلات محفوظة",
  },
  "fas3cert.laserStatus": {
    sv: "Läser din elevstatus…",
    en: "Reading your student status…",
    ar: "يتم الآن قراءة حالتك كطالب…",
  },
  "fas3cert.avVagen": { sv: "av vägen", en: "of the way", ar: "من الطريق" },
  "fas3cert.ringText": {
    sv: "Ringen visar hela vägen — alla fyra steg. Den växer med dig, i din takt. Kunskapen är din, och ingen kan ta den ifrån dig.",
    en: "The ring shows the whole way — all four steps. It grows with you, at your pace. The knowledge is yours, and no one can take it from you.",
    ar: "تُظهر الحلقة كامل الطريق — الخطوات الأربع كلها. تنمو معك، وبوتيرتك أنت. المعرفة ملكك، ولا أحد يستطيع انتزاعها منك.",
  },
  "fas3cert.steg": { sv: "Steg {nr}", en: "Step {nr}", ar: "الخطوة {nr}" },
  "fas3cert.nastaStegRubrik": {
    sv: "Nästa steg på din resa:",
    en: "The next step on your journey:",
    ar: "الخطوة التالية في رحلتك:",
  },
  "fas3cert.nastaFallback": {
    sv: "Välkommen — börja där du är, så går vi bredvid dig hela vägen.",
    en: "Welcome — begin where you are, and we will walk beside you the whole way.",
    ar: "مرحبًا — ابدأ من حيث أنت، وسنسير بجانبك الطريق كله.",
  },
  "fas3cert.fot": {
    sv: "Allt spåras lokalt i din egen webbläsare — integritetsvänligt och utan kontokrav. Din portfölj växer fram successivt, precis som lärandet.",
    en: "Everything is tracked locally in your own browser — privacy-friendly and with no account required. Your portfolio emerges gradually, just like the learning.",
    ar: "كل شيء يُتتبع محليًا في متصفحك أنت — بما يحفظ الخصوصية ودون أي اشتراط لحساب. تنشأ محفظتك تدريجيًا، تمامًا كالتعلم.",
  },

  // Fortsatt-panelen + kurstips-kortet (små krom-ytor på speglarna)
  "fortsatt.darDuSlutade": {
    sv: "Fortsätt där du slutade",
    en: "Continue where you left off",
    ar: "تابع من حيث توقفت",
  },
  "tips.oppna": { sv: "→ Öppna", en: "→ Open", ar: "افتح ←" },

  // Kursporten + nivåbaren (kurs-gate.tsx) — syns post-hydration på
  // speglarnas kurssidor (utloggad: porten; inloggad: nivåbaren), dold för
  // no-JS-crawlers men fullt synlig för riktiga besökare (V86-tillägget).
  "gate.fortsattGratis": {
    sv: "Fortsätt läsa — helt gratis",
    en: "Keep reading — completely free",
    ar: "تابع القراءة — مجانًا بالكامل",
  },
  "gate.skapaA": {
    sv: "Skapa ett kostnadsfritt konto så låser du upp ",
    en: "Create a free account and you unlock ",
    ar: "أنشئ حسابًا مجانيًا لتفتح ",
  },
  "gate.helaTitel": {
    sv: "hela \"{titel}\"",
    en: "all of \"{titel}\"",
    ar: "كامل دورة \"{titel}\"",
  },
  "gate.skapaB": {
    sv: " — och alla övriga {kurser} kurserna, för alltid. Fundamentalanalys är en rättighet.",
    en: " — and all the other {kurser} courses, forever. Fundamental analysis is a right.",
    ar: " — وجميع الدورات الأخرى البالغة {kurser}، إلى الأبد. التحليل الأساسي حق للجميع.",
  },
  "gate.lasUppGratis": {
    sv: "Lås upp gratis →",
    en: "Unlock for free →",
    ar: "افتح مجانًا ←",
  },
  "gate.sekunder": {
    sv: "20 sekunder. Ingen betalning. Ingen kortinformation.",
    en: "20 seconds. No payment. No card details.",
    ar: "20 ثانية. بلا دفع. وبلا بيانات بطاقة.",
  },
  "nivabar.stjarnor": { sv: "stjärnor", en: "stars", ar: "نجمة" },
  "nivabar.redoFas2": {
    sv: "Nivå {niv} — du är redo för Fas 2: utbildning medgrundaren →",
    en: "Level {niv} — you are ready for Phase 2: education with the founder →",
    ar: "المستوى {niv} — أنت مستعد للمرحلة 2: التعليم مع المؤسس ←",
  },
  "nivabar.ansok": { sv: "ansök", en: "apply", ar: "قدِّم طلبك" },
  "nivabar.klarRedan": {
    sv: "✓ Kurs klar — belöningen är utdelad",
    en: "✓ Course completed — the reward is given",
    ar: "✓ الدورة مكتملة — المكافأة مُمنوحة",
  },
  "nivabar.markeraKlar": {
    sv: "Markera kursen klar (+50 XP, +1 ★)",
    en: "Mark the course as completed (+50 XP, +1 ★)",
    ar: "علِّم الدورة كمكتملة (+50 XP، +1 ★)",
  },
  "nivabar.grattisNiva": {
    sv: "Grattis — du nådde nivå {niv}! 🎉",
    en: "Congratulations — you reached level {niv}! 🎉",
    ar: "تهانينا — بلغت المستوى {niv}! 🎉",
  },

  // ── VÅG 87 (FAS L2): KursGate-egis (serverstyrt kurslås) + XP/progress-
  // synket. Låsvyn är SSR-default för GRATIS-kursernas kapitel 3+ — medlemmen
  // låser upp på klienten mot server-verifierad session (en tunn GET-runda);
  // gästar-läget renderas klart utan fler nätverksanrop.
  "gate.lasUppMedlem": {
    sv: "Lås upp (medlem)",
    en: "Unlock (member)",
    ar: "افتح (للأعضاء)",
  },
  "gate.laserUpp": {
    sv: "Låser upp…",
    en: "Unlocking…",
    ar: "جارٍ الفتح…",
  },
  "gate.inteInloggad": {
    sv: "Ingen aktiv inloggning hittades — skapa ett gratis konto eller logga in så låses hela kursen upp.",
    en: "No active session found — create a free account or sign in and the whole course unlocks.",
    ar: "لا توجد جلسة نشطة — أنشئ حسابًا مجانيًا أو سجّل الدخول لتُفتح الدورة كاملة.",
  },
  "gate.lokalProgress": {
    sv: "Du har framsteg sparat på denna enhet — registrera dig gratis för att behålla det.",
    en: "You have progress saved on this device — register for free to keep it.",
    ar: "لديك تقدّم محفوظ على هذا الجهاز — سجّل مجانًا للاحتفاظ به.",
  },

  // Migreringsbannern (våg 87 §A.3): lokal progress → molnkonto + import.
  "migrer.rubrik": {
    sv: "Spara dina framsteg i molnet",
    en: "Save your progress in the cloud",
    ar: "احفظ تقدّمك في السحابة",
  },
  "migrer.textGast": {
    sv: "Registrera dig för att spara framsteg i molnet + importera lokal progress — dina XP, stjärnor och klara kurser följer med till kontot.",
    en: "Register to save your progress in the cloud and import your local progress — your XP, stars and completed courses follow you to the account.",
    ar: "سجّل لحفظ تقدّمك في السحابة واستيراد تقدّمك المحلي — نقاطك ونجومك ودوراتك المكتملة تنتقل إلى حسابك.",
  },
  "migrer.textMedlem": {
    sv: "Du har framsteg sparat på denna enhet. Importera dem till ditt konto — så följer de med mellan enheter.",
    en: "You have progress saved on this device. Import it to your account and it follows you across devices.",
    ar: "لديك تقدّم محفوظ على هذا الجهاز. استورده إلى حسابك ليلتزم بك بين الأجهزة.",
  },
  "migrer.importera": {
    sv: "Importera lokal progress",
    en: "Import local progress",
    ar: "استورد التقدّم المحلي",
  },
  "migrer.importerad": {
    sv: "✓ Importerad — din progress finns nu i kontot",
    en: "✓ Imported — your progress now lives in your account",
    ar: "✓ تم الاستيراد — تقدّمك الآن في حسابك",
  },
  "migrer.importFel": {
    sv: "Importen misslyckades — försök igen.",
    en: "The import failed — try again.",
    ar: "فشل الاستيراد — حاول مجددًا.",
  },
  "migrer.loggaInLank": {
    sv: "Logga in / skapa konto →",
    en: "Sign in / create an account →",
    ar: "سجّل الدخول / أنشئ حسابًا ←",
  },

  // ── Dataset-sidorna (VÅG 97 E1 — /dataset + speglar): ALL sidtext lever
  // här, svenska först, så att MÖS-källregistret (kalla.ts lasUiKallor)
  // täcker domänen "dataset" automatiskt och cron-ronden håller översätt-
  // ningarna aktuella när en sv-källa ändras. {param}-interpolering via
  // oversatt() i sprak.ts — talen matas in formaterade per språk.
  "dataset.brodsmula": { sv: "Dataset", en: "Dataset", ar: "مجموعة البيانات" },
  "dataset.titel": {
    sv: "Dataset — branschmedianer för nyckeltal",
    en: "Dataset — industry medians for key ratios",
    ar: "مجموعة البيانات — وسيطات القطاع للمؤشرات المالية",
  },
  "dataset.ingress": {
    sv: "AK1A:s publika referensdataset: medianvärden för nyckeltal per bransch, räknade ur vårt fasta universum av {nBolag} noterade bolag — 10 branscher × 10 bolag. Aggregat av offentliga marknadsdata, redovisade med observationsantal och hämtdatum. Pedagogisk analys — aldrig investeringsråd.",
    en: "AK1A's public reference dataset: median values for key ratios per industry, computed from our fixed universe of {nBolag} listed companies — 10 industries × 10 companies. Aggregates of public market data, reported with observation counts and a retrieval date. Educational analysis — never investment advice.",
    ar: "مجموعة البيانات المرجعية العامة من AK1A: وسيطات المؤشرات المالية لكل قطاع، محسوبة من عالمنا الثابت المكوَّن من {nBolag} شركة مدرجة — 10 قطاعات × 10 شركات. تجميعات لبيانات سوق عامة، تُعرض مع أعداد المشاهدات وتاريخ الاسترجاع. تحليل تعليمي — وليس أبدًا نصيحة استثمارية.",
  },
  "dataset.datering": {
    sv: "Rådata hämtad {hamtat} · medianerna räknas om när universumet underhålls · sidan uppdateras dagligen",
    en: "Raw data retrieved {hamtat} · medians are recomputed when the universe is maintained · page refreshes daily",
    ar: "استُرجعت البيانات الخام {hamtat} · يُعاد حساب الوسيطات عند صيانة العالم · تتحدث الصفحة يوميًا",
  },
  "dataset.tabell.rubrik": {
    sv: "Medianer per bransch",
    en: "Medians per industry",
    ar: "الوسيطات لكل قطاع",
  },
  "dataset.tabell.bransch": { sv: "Bransch", en: "Industry", ar: "القطاع" },
  "dataset.tabell.medianPe": {
    sv: "Median P/E",
    en: "Median P/E",
    ar: "وسيط P/E",
  },
  "dataset.tabell.antal": {
    sv: "Antal bolag",
    en: "Companies",
    ar: "عدد الشركات",
  },
  "dataset.tabell.detaljer": {
    sv: "Alla medianer →",
    en: "All medians →",
    ar: "جميع الوسيطات ←",
  },
  "dataset.tabell.totalt": {
    sv: "Totalt — alla branscher",
    en: "Total — all industries",
    ar: "الإجمالي — جميع القطاعات",
  },
  "dataset.tabell.kalla": {
    sv: "Universum och aggregering: AK1A Research Lab · rådata: offentliga marknadskällor ({kallor})",
    en: "Universe and aggregation: AK1A Research Lab · raw data: public market sources ({kallor})",
    ar: "العالم والتجميع: AK1A Research Lab · البيانات الخام: مصادر سوق عامة ({kallor})",
  },
  "dataset.metod.rubrik": {
    sv: "Hur medianen räknas",
    en: "How the median is computed",
    ar: "كيف يُحسب الوسيط",
  },
  "dataset.metod.text": {
    sv: "För varje bransch sorteras bolagens värden för nyckeltalet; medianen är det mittersta värdet (vid jämnt antal: medelvärdet av de två mittersta). Medianen väljs i stället för snittet eftersom enstaka extrembolag inte drar iväg talet. Saknad data räknas aldrig som noll — därför redovisar varje nyckeltal sitt eget observationsantal (n), och en median utan enda observation redovisas som saknad. P/E och P/B är multipler; EBIT-marginal, FCF-marginal och omsättningstillväxt är andelar av omsättningen, redovisade i procent. Rådatan hämtas från offentliga marknadskällor och dateras per hämtdatum.",
    en: "For each industry, the companies' values for the ratio are sorted; the median is the middle value (with an even count: the average of the two middle values). The median is chosen over the mean because single outlier companies cannot drag the number away. Missing data is never counted as zero — each ratio therefore reports its own observation count (n), and a median without a single observation is reported as missing. P/E and P/B are multiples; EBIT margin, FCF margin and revenue growth are shares of revenue, reported in percent. Raw data is retrieved from public market sources and dated by retrieval date.",
    ar: "لكل قطاع تُرتَّب قيم الشركات للمؤشر؛ الوسيط هو القيمة الوسطى (وعند عدد زوجي: متوسط القيمتين الوسطيين). اختير الوسيط بدل المتوسط لأن الشركة الشاذة الواحدة لا تستطيع سحب الرقم بعيدًا. البيانات المفقودة لا تُحسب أبدًا صفرًا — لذلك يعرض كل مؤشر عدد مشاهداته الخاص (n)، والوسيط بلا أي مشاهدة يُعرض كمفقود. P/E وP/B مضاعفات؛ أما هامش EBIT وهامش التدفق النقدي الحر ونمو الإيرادات فهي حصص من الإيرادات تُعرض بالنسبة المئوية. تُسترجع البيانات الخام من مصادر سوق عامة وتُؤرَّخ بتاريخ الاسترجاع.",
  },
  "dataset.disclaimer.rubrik": {
    sv: "Vad detta är — och inte är",
    en: "What this is — and is not",
    ar: "ما هذا — وما ليس هو",
  },
  "dataset.disclaimer.text": {
    sv: "Detta dataset är pedagogisk referens och analysunderlag: aggregat av offentliga marknadsdata ur ett fast, redovisat universum. Det är inte investeringsrådgivning (lagen 2007:528), ingen uppmaning att köpa eller sälja någon aktie, och inget mått på framtida avkastning. Kontrollera alltid primärkällorna — bolagens egna rapporter — innan du drar slutsatser.",
    en: "This dataset is an educational reference and analysis aid: aggregates of public market data from a fixed, documented universe. It is not investment advice, not an invitation to buy or sell any stock, and not a measure of future returns. Always check the primary sources — the companies' own reports — before drawing conclusions.",
    ar: "هذه المجموعة مرجع تعليمي ووسيلة تحليلية: تجميعات لبيانات سوق عامة من عالم ثابت وموثَّق. ليست نصيحة استثمارية، وليست دعوة لشراء أو بيع أي سهم، وليست مقياسًا للعوائد المستقبلية. تحقق دائمًا من المصادر الأولية — تقارير الشركات نفسها — قبل استخلاص النتائج.",
  },
  "dataset.detalj.titel": {
    sv: "Branschmedianer — {bransch}",
    en: "Industry medians — {bransch}",
    ar: "وسيطات القطاع — {bransch}",
  },
  "dataset.detalj.ingress": {
    sv: "Medianer för branschen {bransch} i AK1A:s {nBolag}-bolagsuniversum (data hämtad {hamtat}). {nBransch} bolag i branschen — varje nyckeltal redovisar sitt observationsantal. Pedagogisk analys — aldrig investeringsråd.",
    en: "Medians for the {bransch} industry in AK1A's {nBolag}-company universe (data retrieved {hamtat}). {nBransch} companies in the industry — each ratio reports its observation count. Educational analysis — never investment advice.",
    ar: "وسيطات قطاع {bransch} في عالم AK1A المكوَّن من {nBolag} شركة (استُرجعت البيانات {hamtat}). {nBransch} شركة في القطاع — كل مؤشر يعرض عدد مشاهداته. تحليل تعليمي — وليس أبدًا نصيحة استثمارية.",
  },
  "dataset.detalj.tabell.rubrik": {
    sv: "Alla medianer för {bransch}",
    en: "All medians for {bransch}",
    ar: "جميع الوسيطات لقطاع {bransch}",
  },
  "dataset.detalj.tabell.nyckeltal": {
    sv: "Nyckeltal",
    en: "Key ratio",
    ar: "المؤشر المالي",
  },
  "dataset.detalj.tabell.median": { sv: "Median", en: "Median", ar: "الوسيط" },
  "dataset.detalj.tabell.antal": {
    sv: "Observationer (n)",
    en: "Observations (n)",
    ar: "المشاهدات (n)",
  },
  "dataset.detalj.tillbaka": {
    sv: "← Alla branscher",
    en: "← All industries",
    ar: "→ جميع القطاعات",
  },
  "dataset.detalj.andra.rubrik": {
    sv: "Andra branscher",
    en: "Other industries",
    ar: "قطاعات أخرى",
  },
  "dataset.mat.pe": {
    sv: "P/E — pris per vinst",
    en: "P/E — price to earnings",
    ar: "P/E — السعر إلى الأرباح",
  },
  "dataset.mat.pe.beskrivning": {
    sv: "Aktiekurs delat med vinst per aktie. Medianen visar branschens typiska värderingsnivå.",
    en: "Share price divided by earnings per share. The median shows the industry's typical valuation level.",
    ar: "سعر السهم مقسومًا على ربحية السهم. يُظهر الوسيط مستوى التقييم النمطي للقطاع.",
  },
  "dataset.mat.pb": {
    sv: "P/B — pris per bokfört värde",
    en: "P/B — price to book",
    ar: "P/B — السعر إلى القيمة الدفترية",
  },
  "dataset.mat.pb.beskrivning": {
    sv: "Aktiekurs delat med bokfört eget kapital per aktie. Medianen visar hur marknaden prissätter branschens nettoförmögenhet.",
    en: "Share price divided by book equity per share. The median shows how the market prices the industry's net assets.",
    ar: "سعر السهم مقسومًا على حقوق الملكية الدفترية للسهم. يُظهر الوسيط كيف يسعّر السوق صافي أصول القطاع.",
  },
  "dataset.mat.ebit": {
    sv: "EBIT-marginal",
    en: "EBIT margin",
    ar: "هامش EBIT",
  },
  "dataset.mat.ebit.beskrivning": {
    sv: "Rörelseresultatet (EBIT) som andel av omsättningen, i procent.",
    en: "Operating profit (EBIT) as a share of revenue, in percent.",
    ar: "ربح التشغيل (EBIT) كحصة من الإيرادات، بالنسبة المئوية.",
  },
  "dataset.mat.fcf": {
    sv: "FCF-marginal",
    en: "FCF margin",
    ar: "هامش التدفق النقدي الحر",
  },
  "dataset.mat.fcf.beskrivning": {
    sv: "Fritt kassaflöde som andel av omsättningen, i procent.",
    en: "Free cash flow as a share of revenue, in percent.",
    ar: "التدفق النقدي الحر كحصة من الإيرادات، بالنسبة المئوية.",
  },
  "dataset.mat.tillvaxt": {
    sv: "Omsättningstillväxt (TTM)",
    en: "Revenue growth (TTM)",
    ar: "نمو الإيرادات (آخر 12 شهرًا)",
  },
  "dataset.mat.tillvaxt.beskrivning": {
    sv: "Senaste tolvmånadersperiodens omsättningstillväxt, i procent.",
    en: "Revenue growth over the latest twelve months, in percent.",
    ar: "نمو الإيرادات خلال آخر اثني عشر شهرًا، بالنسبة المئوية.",
  },
  "dataset.bransch.teknik": {
    sv: "Teknik",
    en: "Technology",
    ar: "التكنولوجيا",
  },
  "dataset.bransch.industri": {
    sv: "Industri",
    en: "Industry",
    ar: "الصناعة",
  },
  "dataset.bransch.halso": {
    sv: "Hälsa",
    en: "Health care",
    ar: "الرعاية الصحية",
  },
  "dataset.bransch.konsument": {
    sv: "Konsument",
    en: "Consumer",
    ar: "الاستهلاك",
  },
  "dataset.bransch.fastighet": {
    sv: "Fastighet",
    en: "Real estate",
    ar: "العقارات",
  },
  "dataset.bransch.finans": {
    sv: "Finans",
    en: "Financials",
    ar: "الخدمات المالية",
  },
  "dataset.bransch.material": {
    sv: "Material",
    en: "Materials",
    ar: "المواد",
  },
  "dataset.bransch.energi": {
    sv: "Energi",
    en: "Energy",
    ar: "الطاقة",
  },
  "dataset.bransch.kommunikation": {
    sv: "Kommunikation",
    en: "Communication",
    ar: "الاتصالات",
  },
  "dataset.bransch.tillvaxt": {
    sv: "Tillväxt",
    en: "Growth",
    ar: "النمو",
  },
  "dataset.meta.titel": {
    sv: "Branschmedianer — median P/E, P/B och marginaler per bransch | AK1A",
    en: "Industry medians — median P/E, P/B and margins per industry | AK1A",
    ar: "وسيطات القطاع — وسيط P/E وP/B والهوامش لكل قطاع | AK1A",
  },
  "dataset.meta.beskrivning": {
    sv: "Median P/E per bransch i AK1A:s {nBolag}-bolagsuniversum (10 branscher × 10 bolag, rådata {hamtat}). Med P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt — observationsantal redovisas per nyckeltal. Pedagogisk referens, inte investeringsrådgivning.",
    en: "Median P/E per industry in AK1A's {nBolag}-company universe (10 industries × 10 companies, raw data {hamtat}). With P/B, EBIT margin, FCF margin and revenue growth — observation counts reported per ratio. Educational reference, not investment advice.",
    ar: "وسيط P/E لكل قطاع في عالم AK1A المكوَّن من {nBolag} شركة (10 قطاعات × 10 شركات، البيانات الخام {hamtat}). مع P/B وهامش EBIT وهامش التدفق النقدي الحر ونمو الإيرادات — تُعرض أعداد المشاهدات لكل مؤشر. مرجع تعليمي، وليس نصيحة استثمارية.",
  },
  "dataset.meta.detalj.titel": {
    sv: "{bransch} — median P/E {pe} (n={n}) | AK1A",
    en: "{bransch} — median P/E {pe} (n={n}) | AK1A",
    ar: "{bransch} — وسيط P/E {pe} (n={n}) | AK1A",
  },
  "dataset.meta.detalj.beskrivning": {
    sv: "Medianer för {bransch} i AK1A:s {nBolag}-bolagsuniversum (rådata {hamtat}): P/E {pe} · P/B {pb} · EBIT-marginal {ebit} % · FCF-marginal {fcf} % · tillväxt {tillvaxt} %. Observationsantal redovisas. Pedagogisk referens, inte investeringsrådgivning.",
    en: "Medians for {bransch} in AK1A's {nBolag}-company universe (raw data {hamtat}): P/E {pe} · P/B {pb} · EBIT margin {ebit}% · FCF margin {fcf}% · growth {tillvaxt}%. Observation counts reported. Educational reference, not investment advice.",
    ar: "وسيطات {bransch} في عالم AK1A المكوَّن من {nBolag} شركة (البيانات الخام {hamtat}): P/E {pe} · P/B {pb} · هامش EBIT {ebit}% · هامش التدفق النقدي الحر {fcf}% · النمو {tillvaxt}%. تُعرض أعداد المشاهدات. مرجع تعليمي، وليس نصيحة استثمارية.",
  },
  "dataset.jsonld.namn": {
    sv: "AK1A branschmedianer — nyckeltalsaggregat för 100-bolagsuniversumet",
    en: "AK1A industry medians — key ratio aggregates for the 100-company universe",
    ar: "وسيطات القطاع من AK1A — تجميعات المؤشرات المالية لعالم المئة شركة",
  },
  "dataset.jsonld.beskrivning": {
    sv: "Median P/E, P/B, EBIT-marginal, FCF-marginal och omsättningstillväxt per bransch, räknat ur AK1A:s fasta universum av {nBolag} noterade bolag (10 branscher × 10 bolag). Rådata hämtad {hamtat} från offentliga marknadskällor; observationsantal (n) redovisas per nyckeltal. Pedagogiskt aggregat — inte investeringsrådgivning.",
    en: "Median P/E, P/B, EBIT margin, FCF margin and revenue growth per industry, computed from AK1A's fixed universe of {nBolag} listed companies (10 industries × 10 companies). Raw data retrieved {hamtat} from public market sources; observation counts (n) reported per ratio. Educational aggregate — not investment advice.",
    ar: "وسيط P/E وP/B وهامش EBIT وهامش التدفق النقدي الحر ونمو الإيرادات لكل قطاع، محسوبة من عالم AK1A الثابت المكوَّن من {nBolag} شركة مدرجة (10 قطاعات × 10 شركات). استُرجعت البيانات الخام {hamtat} من مصادر سوق عامة؛ ويُعرض عدد المشاهدات (n) لكل مؤشر. تجميع تعليمي — ليس نصيحة استثمارية.",
  },
  "dataset.jsonld.licens": {
    sv: "CC BY 4.0 — citera fritt med källangivelse \"AK1A Research Lab\" och hämtdatum.",
    en: "CC BY 4.0 — cite freely with attribution to \"AK1A Research Lab\" and the retrieval date.",
    ar: "CC BY 4.0 — اقتبس بحرية مع الإشارة إلى \"AK1A Research Lab\" وتاريخ الاسترجاع.",
  },
} as const satisfies Record<string, SprakRad>;

export type OrdlistaNyckel = keyof typeof ORDLISTA;
