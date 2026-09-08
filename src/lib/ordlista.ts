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
} as const satisfies Record<string, SprakRad>;

export type OrdlistaNyckel = keyof typeof ORDLISTA;
