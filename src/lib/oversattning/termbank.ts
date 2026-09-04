/**
 * MÖS TERMBANK — rätt-översättningsgarantin (Våg 52, MEGA ÖVERSÄTTNINGSSYSTEMET).
 *
 * Kunddirektiv: "vi måste garantera att översättningen har också rätt
 * översättning". Termbanken är den kanoniska sv→en→ar-ordlistan för all
 * finansiell terminologi på sajten. Varje rad är ett LÖFTE: förekommer den
 * svenska termen i en källa SKALL måltermen finnas i översättningen
 * (kontrolleras deterministiskt av ./kontroller.ts — termKonsistens).
 *
 * KÄLLOR TILL VALDA ÖVERSÄTTNINGAR:
 *   - src/lib/ordlista.ts (fas 1-gränssnittet) och
 *     data/forskning/SPRAK-PLAN.md (kundgodkända val, t.ex.
 *     fundamental analys = التحليل الأساسي, portfölj = المحفظة,
 *     värdering = التقييم, vågfundament = أساس الموجات)
 *   - Kundens egna direktiv i våg 52: ROE, EV/EBITDA, NCAV, kassatäckning,
 *     nyemission, återköp, sammanvägningen = "the Synthesis"/الموازنة الشاملة,
 *     moat/vallgrav = الخندق التنافسي, impulsvåg, korrigering, basbygge,
 *     bruttomarginal, skuldsättningsgrad, intäktsdiversifiering m.fl.
 *
 * REGLER (SPRAK-PLAN §4.1.2 + ordlistans riktlinjer):
 *   - Latinska förkortningar/varumärken behålls latinska i AR (kat "latinsk"):
 *     ROE, NCAV, EV/EBITDA, P/E, EBIT, EBITDA, DCF, NAV, AKM1, AK1TS, XP,
 *     net-net. Siffror på finanssajter förväntas västerländska (0–9).
 *   - Arabiskan: formell men tillgänglig finansiell stil (samma röst som
 *     ordlistan).
 *
 * UTÖKNING: nya rader i TERMBANK-arrayen = nya termer. Inga andra filer ska
 * behöva ändras — kontroller, motorpromt och vitlista härleds ur datan.
 *
 * Obs: modulen är avsiktligt fri från nätverk/fs/server-only så att BOTH Next
 * (cron-rutten) och verktyg/validera-motorer.mjs (tsx) kan importera den.
 */

/** Kategori — endast fasta värden (organisation + motorpromt). */
export type TermKategori =
  | "nyckeltal"
  | "vardering"
  | "rakenskaper"
  | "kassaflode"
  | "vaglara"
  | "strategi"
  | "risk"
  | "marknad"
  | "bolagsstyrning"
  | "pedagogik"
  | "latinsk";

/** En kanonisk term på tre språk. sv är nyckeln (källspråket = svenska). */
export type TermRad = {
  /** Svensk term exakt som den förekommer i källtexter (oböjd grundform). */
  sv: string;
  /** Engelsk kanonisk term. */
  en: string;
  /** Arabisk kanonisk term — eller den latinska strängen om termen behålls. */
  ar: string;
  kat: TermKategori;
  /** Kort notering om valet (spårbarhet, visas i motorpromten). */
  notering?: string;
};

export const TERMBANK: readonly TermRad[] = [
  // ── NYCKELTAL ─────────────────────────────────────────────────────────────
  { sv: "räntabilitet på eget kapital", en: "return on equity (ROE)", ar: "العائد على حقوق الملكية (ROE)", kat: "nyckeltal" },
  { sv: "räntabilitet på totalt kapital", en: "return on total capital", ar: "العائد على إجمالي رأس المال", kat: "nyckeltal" },
  { sv: "avkastning på investerat kapital", en: "return on invested capital (ROIC)", ar: "العائد على رأس المال المستثمر (ROIC)", kat: "nyckeltal" },
  { sv: "vinstmarginal", en: "profit margin", ar: "هامش الربح", kat: "nyckeltal" },
  { sv: "rörelsemarginal", en: "operating margin", ar: "هامش الربح التشغيلي", kat: "nyckeltal" },
  { sv: "bruttomarginal", en: "gross margin", ar: "الهامش الإجمالي", kat: "nyckeltal", notering: "kunddirektiv våg 52" },
  { sv: "vinst per aktie", en: "earnings per share", ar: "ربحية السهم", kat: "nyckeltal" },
  { sv: "eget kapital per aktie", en: "book value per share", ar: "القيمة الدفترية للسهم", kat: "nyckeltal" },
  { sv: "direktavkastning", en: "dividend yield", ar: "مردود التوزيعات", kat: "nyckeltal" },
  { sv: "substansrabatt", en: "discount to book value", ar: "خصم القيمة الدفترية", kat: "nyckeltal" },
  { sv: "substanspremie", en: "premium to book value", ar: "علاوة القيمة الدفترية", kat: "nyckeltal" },
  { sv: "skuldsättningsgrad", en: "debt-to-equity ratio", ar: "نسبة الدين إلى حقوق الملكية", kat: "nyckeltal", notering: "kunddirektiv våg 52" },
  { sv: "soliditet", en: "equity ratio", ar: "نسبة الملاءة", kat: "nyckeltal" },
  { sv: "räntetäckningsgrad", en: "interest coverage ratio", ar: "درجة تغطية الفوائد", kat: "nyckeltal" },
  { sv: "kassatäckningsgrad", en: "cash coverage ratio", ar: "درجة التغطية النقدية", kat: "nyckeltal" },
  { sv: "kassatäckning", en: "cash coverage", ar: "التغطية النقدية", kat: "nyckeltal", notering: "kunddirektiv våg 52" },
  { sv: "omsättningshastighet", en: "turnover ratio", ar: "معدل الدوران", kat: "nyckeltal" },
  { sv: "lageromsättningshastighet", en: "inventory turnover", ar: "معدل دوران المخزون", kat: "nyckeltal" },
  { sv: "kapitalomsättning", en: "capital turnover", ar: "دوران رأس المال", kat: "nyckeltal" },
  { sv: "bruttoresultat", en: "gross profit", ar: "إجمالي الربح", kat: "nyckeltal" },
  { sv: "rörelseresultat", en: "operating profit", ar: "الربح التشغيلي", kat: "nyckeltal" },
  { sv: "räntenetto", en: "net financial items", ar: "صافي البنود المالية", kat: "nyckeltal" },
  { sv: "totalavkastning", en: "total return", ar: "العائد الإجمالي", kat: "nyckeltal" },
  { sv: "riskjusterad avkastning", en: "risk-adjusted return", ar: "العائد المعدل حسب المخاطر", kat: "nyckeltal" },
  { sv: "avkastning", en: "return", ar: "العائد", kat: "nyckeltal", notering: "SPRAK-PLAN-godkänt val" },
  { sv: "avkastningskrav", en: "required rate of return", ar: "معدل العائد المطلوب", kat: "nyckeltal" },
  { sv: "tröskelavkastning", en: "hurdle rate", ar: "معدل العائد الحدي", kat: "nyckeltal" },
  { sv: "nyckeltal", en: "financial ratio", ar: "النسبة المالية", kat: "nyckeltal" },

  // ── VÄRDERING ─────────────────────────────────────────────────────────────
  { sv: "värdering", en: "valuation", ar: "التقييم", kat: "vardering", notering: "SPRAK-PLAN-godkänt val" },
  { sv: "verkligt värde", en: "intrinsic value", ar: "القيمة الحقيقية", kat: "vardering", notering: "värdeinvesteringsbetydelse (inte fair value)" },
  { sv: "motiverat värde", en: "fair value", ar: "القيمة العادلة", kat: "vardering" },
  { sv: "börsvärde", en: "market capitalization", ar: "القيمة السوقية", kat: "vardering" },
  { sv: "bokfört värde", en: "book value", ar: "القيمة الدفترية", kat: "vardering" },
  { sv: "substansvärde", en: "net asset value", ar: "صافي قيمة الأصول", kat: "vardering" },
  { sv: "aktiekurs", en: "share price", ar: "سعر السهم", kat: "vardering" },
  { sv: "kursmål", en: "price target", ar: "السعر المستهدف", kat: "vardering" },
  { sv: "inner value", en: "intrinsic value", ar: "القيمة الحقيقية", kat: "vardering", notering: "äldre svensk värdeinvesterarterm" },
  { sv: "kassabaserad värdering", en: "cash-based valuation", ar: "تقييم قائم على النقد", kat: "vardering" },
  { sv: "diskonterat kassaflöde", en: "discounted cash flow", ar: "التدفق النقدي المخصوم", kat: "vardering" },
  { sv: "diskonteringsränta", en: "discount rate", ar: "معدل الخصم", kat: "vardering" },
  { sv: "kvarstående värde", en: "terminal value", ar: "القيمة النهائية", kat: "vardering" },
  { sv: "säkerhetsmarginal", en: "margin of safety", ar: "هامش الأمان", kat: "vardering", notering: "Grahams kärnbegrepp" },
  { sv: "marginal of safety", en: "margin of safety", ar: "هامش الأمان", kat: "vardering", notering: "Grahams originalengelska används i svensk text" },
  { sv: "värdeinvestering", en: "value investing", ar: "الاستثمار القيمي", kat: "vardering" },
  { sv: "värdeinvesterare", en: "value investor", ar: "المستثمر القيمي", kat: "vardering" },
  { sv: "värdeinvesteringsstrategi", en: "value investing strategy", ar: "استراتيجية الاستثمار القيمي", kat: "vardering" },
  { sv: "tillväxtinvestering", en: "growth investing", ar: "الاستثمار في النمو", kat: "vardering" },
  { sv: "undervärdering", en: "undervaluation", ar: "التقييم الأقل من الحقيقة", kat: "vardering" },
  { sv: "övervärdering", en: "overvaluation", ar: "التقييم الأعلى من الحقيقة", kat: "vardering" },
  { sv: "prislapp", en: "price tag", ar: "بطاقة السعر", kat: "vardering" },
  { sv: "multipel", en: "valuation multiple", ar: "مضاعف التقييم", kat: "vardering" },
  { sv: "omsättningsmultipel", en: "revenue multiple", ar: "مضاعف الإيرادات", kat: "vardering" },

  // ── RÄKENSKAPER ───────────────────────────────────────────────────────────
  { sv: "räkenskapsanalys", en: "financial statement analysis", ar: "تحليل القوائم المالية", kat: "rakenskaper" },
  { sv: "fundamental analys", en: "fundamental analysis", ar: "التحليل الأساسي", kat: "rakenskaper", notering: "SPRAK-PLAN-godkänt val" },
  { sv: "teknisk analys", en: "technical analysis", ar: "التحليل الفني", kat: "rakenskaper" },
  { sv: "årsredovisning", en: "annual report", ar: "التقرير السنوي", kat: "rakenskaper" },
  { sv: "delårsrapport", en: "interim report", ar: "التقرير المرحلي", kat: "rakenskaper" },
  { sv: "balansräkning", en: "balance sheet", ar: "الميزانية العمومية", kat: "rakenskaper" },
  { sv: "resultaträkning", en: "income statement", ar: "قائمة الدخل", kat: "rakenskaper" },
  { sv: "kassaflödesanalys", en: "cash flow statement", ar: "قائمة التدفقات النقدية", kat: "rakenskaper" },
  { sv: "noter", en: "notes to the accounts", ar: "الإيضاحات المتممة للقوائم المالية", kat: "rakenskaper" },
  { sv: "intäkter", en: "revenue", ar: "الإيرادات", kat: "rakenskaper" },
  { sv: "omsättning", en: "revenue", ar: "الإيرادات", kat: "rakenskaper", notering: "avser försäljningsintäkter i AK1A-sammanhang" },
  { sv: "tillväxt", en: "growth", ar: "النمو", kat: "rakenskaper" },
  { sv: "försäljningstillväxt", en: "revenue growth", ar: "نمو الإيرادات", kat: "rakenskaper" },
  { sv: "kostnader", en: "costs", ar: "التكاليف", kat: "rakenskaper" },
  { sv: "rörelsekostnader", en: "operating expenses", ar: "المصروفات التشغيلية", kat: "rakenskaper" },
  { sv: "avskrivningar", en: "depreciation", ar: "الإهلاكات", kat: "rakenskaper" },
  { sv: "nedskrivningar", en: "impairments", ar: "خسائر انخفاض القيمة", kat: "rakenskaper" },
  { sv: "goodwill", en: "goodwill", ar: "الشهرة", kat: "rakenskaper", notering: "branschtermen behålls ofta latinsk i AR-text; الشهرة är den redovisningsräta översättningen" },
  { sv: "tillgångar", en: "assets", ar: "الأصول", kat: "rakenskaper" },
  { sv: "omsättningstillgångar", en: "current assets", ar: "الأصول المتداولة", kat: "rakenskaper" },
  { sv: "anläggningstillgångar", en: "non-current assets", ar: "الأصول الثابتة", kat: "rakenskaper" },
  { sv: "skulder", en: "liabilities", ar: "الالتزامات", kat: "rakenskaper" },
  { sv: "räntebärande skulder", en: "interest-bearing debt", ar: "الديون بفوائد", kat: "rakenskaper" },
  { sv: "kortfristiga skulder", en: "short-term liabilities", ar: "الالتزامات قصيرة الأجل", kat: "rakenskaper" },
  { sv: "långfristiga skulder", en: "long-term liabilities", ar: "الالتزامات طويلة الأجل", kat: "rakenskaper" },
  { sv: "eget kapital", en: "equity", ar: "حقوق الملكية", kat: "rakenskaper" },
  { sv: "aktiekapital", en: "share capital", ar: "رأس مال الأسهم", kat: "rakenskaper" },
  { sv: "aktiemajoritet", en: "shareholder majority", ar: "أغلبية المساهمين", kat: "rakenskaper" },
  { sv: "avsättningar", en: "provisions", ar: "المخصصات", kat: "rakenskaper" },
  { sv: "obeskattade reserver", en: "untaxed reserves", ar: "الاحتياطيات غير الخاضعة للضريبة", kat: "rakenskaper", notering: "nordisk särart — behåll förklarande ton" },
  { sv: "latent skatt", en: "deferred tax", ar: "الضريبة المؤجلة", kat: "rakenskaper" },
  { sv: "kundfordringar", en: "accounts receivable", ar: "الذمم المدينة", kat: "rakenskaper" },
  { sv: "leverantörsskulder", en: "accounts payable", ar: "الذمم الدائنة", kat: "rakenskaper" },
  { sv: "lager", en: "inventory", ar: "المخزون", kat: "rakenskaper" },
  { sv: "rörelsekapital", en: "working capital", ar: "رأس المال العامل", kat: "rakenskaper" },
  { sv: "kapitalbindning", en: "capital tied up", ar: "رأس المال المقيد", kat: "rakenskaper" },
  { sv: "kapitalintensitet", en: "capital intensity", ar: "كثافة رأس المال", kat: "rakenskaper" },
  { sv: "bokföring", en: "accounting", ar: "المحاسبة", kat: "rakenskaper" },
  { sv: "dubbel bokföring", en: "double-entry bookkeeping", ar: "القيد المزدوج", kat: "rakenskaper" },
  { sv: "redovisning", en: "financial reporting", ar: "التقارير المالية", kat: "rakenskaper" },
  { sv: "bolagsbildning", en: "incorporation", ar: "تأسيس الشركة", kat: "rakenskaper" },
  { sv: "koncernredovisning", en: "consolidated accounts", ar: "القوائم المالية الموحدة", kat: "rakenskaper" },
  { sv: "internpris", en: "transfer price", ar: "سعر التحويل", kat: "rakenskaper" },

  // ── KASSAFLÖDE ────────────────────────────────────────────────────────────
  { sv: "kassaflöde", en: "cash flow", ar: "التدفق النقدي", kat: "kassaflode", notering: "SPRAK-PLAN-godkänt val" },
  { sv: "fritt kassaflöde", en: "free cash flow", ar: "التدفق النقدي الحر", kat: "kassaflode" },
  { sv: "operativt kassaflöde", en: "operating cash flow", ar: "التدفق النقدي التشغيلي", kat: "kassaflode" },
  { sv: "kassaflöde från drift", en: "cash flow from operations", ar: "التدفق النقدي من الأنشطة التشغيلية", kat: "kassaflode" },
  { sv: "kapitalutgifter", en: "capital expenditures", ar: "النفقات الرأسمالية", kat: "kassaflode" },
  { sv: "kassabehållning", en: "cash balance", ar: "الأرصدة النقدية", kat: "kassaflode" },
  { sv: "kassa", en: "cash", ar: "النقد", kat: "kassaflode" },
  { sv: "likviditet", en: "liquidity", ar: "السيولة", kat: "kassaflode" },
  { sv: "likviditetsreserv", en: "liquidity reserve", ar: "احتياطي السيولة", kat: "kassaflode" },
  { sv: "utdelning", en: "dividend", ar: "التوزيعات", kat: "kassaflode" },
  { sv: "utdelningspolicy", en: "dividend policy", ar: "سياسة التوزيعات", kat: "kassaflode" },
  { sv: "utdelningsandel", en: "payout ratio", ar: "نسبة التوزيع", kat: "kassaflode" },
  { sv: "återköp", en: "share buyback", ar: "إعادة شراء الأسهم", kat: "kassaflode", notering: "kunddirektiv våg 52" },
  { sv: "nyemission", en: "new share issue", ar: "إصدار أسهم جديدة", kat: "kassaflode", notering: "kunddirektiv våg 52" },
  { sv: "emission", en: "share issue", ar: "إصدار أسهم", kat: "kassaflode" },
  { sv: "riktemission", en: "directed share issue", ar: "إصدار موجه", kat: "kassaflode" },
  { sv: "teckningsrätt", en: "subscription right", ar: "حق الاكتتاب", kat: "kassaflode" },
  { sv: "teckningskurs", en: "subscription price", ar: "سعر الاكتتاب", kat: "kassaflode" },
  { sv: "utspädning", en: "dilution", ar: "تخفيف الملكية", kat: "kassaflode" },
  { sv: "kapitalåterföring", en: "capital return", ar: "إعادة رأس المال", kat: "kassaflode" },

  // ── VÅGLÄRA (AK1TS) ───────────────────────────────────────────────────────
  { sv: "vågfundament", en: "wave foundation", ar: "أساس الموجات", kat: "vaglara", notering: "SPRAK-PLAN-godkänt val" },
  { sv: "våglära", en: "wave theory", ar: "نظرية الموجات", kat: "vaglara" },
  { sv: "impulsvåg", en: "impulse wave", ar: "الموجة الدافعة", kat: "vaglara", notering: "kunddirektiv våg 52" },
  { sv: "korrigering", en: "correction", ar: "تصحيح", kat: "vaglara", notering: "kunddirektiv våg 52 — våglärebetydelse" },
  { sv: "basbygge", en: "base building", ar: "بناء القاعدة", kat: "vaglara", notering: "kunddirektiv våg 52" },
  { sv: "våg", en: "wave", ar: "موجة", kat: "vaglara" },
  { sv: "vågcount", en: "wave count", ar: "عدّ الموجات", kat: "vaglara" },
  { sv: "vågbild", en: "wave pattern", ar: "نمط الموجة", kat: "vaglara" },
  { sv: "vågcykel", en: "wave cycle", ar: "دورة الموجات", kat: "vaglara" },
  { sv: "trend", en: "trend", ar: "الاتجاه", kat: "vaglara" },
  { sv: "primärtrend", en: "primary trend", ar: "الاتجاه الأساسي", kat: "vaglara" },
  { sv: "motrend", en: "counter-trend", ar: "الاتجاه المعاكس", kat: "vaglara" },
  { sv: "stöd", en: "support", ar: "الدعم", kat: "vaglara" },
  { sv: "motstånd", en: "resistance", ar: "المقاومة", kat: "vaglara" },
  { sv: "genombrott", en: "breakout", ar: "الاختراق", kat: "vaglara" },
  { sv: "genombrott uppåt", en: "upward breakout", ar: "الاختراق الصاعد", kat: "vaglara" },
  { sv: "fallande kniv", en: "falling knife", ar: "السكين الهابطة", kat: "vaglara" },
  { sv: "retracement", en: "retracement", ar: "الارتداد", kat: "vaglara" },
  { sv: "fibonacci", en: "Fibonacci", ar: "فيبوناتشي", kat: "vaglara" },
  { sv: "glidande medelvärde", en: "moving average", ar: "المتوسط المتحرك", kat: "vaglara" },
  { sv: "momentum", en: "momentum", ar: "الزخم", kat: "vaglara" },
  { sv: "volatilitet", en: "volatility", ar: "التقلب", kat: "vaglara" },
  { sv: "överköpt", en: "overbought", ar: "التشبع الشرائي", kat: "vaglara" },
  { sv: "översålt", en: "oversold", ar: "التشبع البيعي", kat: "vaglara" },
  { sv: "relativ styrka", en: "relative strength", ar: "القوة النسبية", kat: "vaglara" },
  { sv: "hög-låg-spann", en: "high-low range", ar: "النطاق بين الأعلى والأدنى", kat: "vaglara" },
  { sv: "priskanal", en: "price channel", ar: "قناة السعر", kat: "vaglara" },
  { sv: "trendlinje", en: "trendline", ar: "خط الاتجاه", kat: "vaglara" },
  { sv: "chart", en: "chart", ar: "الرسم البياني", kat: "vaglara" },
  { sv: "börsgraf", en: "stock chart", ar: "الرسم البياني للسهم", kat: "vaglara" },

  // ── STRATEGI / AKM1 / MOAT ────────────────────────────────────────────────
  { sv: "sammanvägningen", en: "the Synthesis", ar: "الموازنة الشاملة", kat: "strategi", notering: "AKM1:s samlingsbegrepp — kundens egna val (våg 52)" },
  { sv: "sammanvägning", en: "the Synthesis", ar: "الموازنة الشاملة", kat: "strategi", notering: "obestämd form av samma begrepp" },
  { sv: "fundamental variabel", en: "fundamental variable", ar: "المتغير الأساسي", kat: "strategi" },
  { sv: "moat", en: "moat", ar: "الخندق التنافسي", kat: "strategi", notering: "kunddirektiv våg 52 — Buffetttermen behålls i EN" },
  { sv: "vallgrav", en: "moat", ar: "الخندق التنافسي", kat: "strategi", notering: "svensk metafor för moat" },
  { sv: "ekonomisk vallgrav", en: "economic moat", ar: "الخندق الاقتصادي", kat: "strategi" },
  { sv: "konkurrensfördel", en: "competitive advantage", ar: "الميزة التنافسية", kat: "strategi" },
  { sv: "beständig konkurrensfördel", en: "durable competitive advantage", ar: "ميزة تنافسية مستدامة", kat: "strategi" },
  { sv: "byteskostnad", en: "switching cost", ar: "تكلفة التحويل", kat: "strategi" },
  { sv: "nätverkseffekt", en: "network effect", ar: "أثر الشبكة", kat: "strategi" },
  { sv: "skalbarhet", en: "scalability", ar: "قابلية التوسع", kat: "strategi" },
  { sv: "skalfördel", en: "economies of scale", ar: "وفورات الحجم", kat: "strategi" },
  { sv: "prissättningsmakt", en: "pricing power", ar: "القوة التسعيرية", kat: "strategi" },
  { sv: "varumärke", en: "brand", ar: "العلامة التجارية", kat: "strategi" },
  { sv: "marknadsandel", en: "market share", ar: "الحصة السوقية", kat: "strategi" },
  { sv: "intäktsdiversifiering", en: "revenue diversification", ar: "تنويع الإيرادات", kat: "strategi", notering: "kunddirektiv våg 52" },
  { sv: "diversifiering", en: "diversification", ar: "التنويع", kat: "strategi" },
  { sv: "kundkoncentration", en: "customer concentration", ar: "تمركز العملاء", kat: "strategi" },
  { sv: "kassakossa", en: "cash cow", ar: "البقرة الحلوب", kat: "strategi" },
  { sv: "kapitaltät", en: "capital intensive", ar: "كثيف رأس المال", kat: "strategi" },
  { sv: "förnyelsekraft", en: "innovative strength", ar: "قوة الابتكار", kat: "strategi" },
  { sv: "kvalitetsincitament", en: "quality incentive", ar: "حافز الجودة", kat: "strategi" },
  { sv: "slutmålsbild", en: "end-state vision", ar: "رؤية الحالة النهائية", kat: "strategi" },

  // ── RISK ──────────────────────────────────────────────────────────────────
  { sv: "risk", en: "risk", ar: "المخاطر", kat: "risk", notering: "SPRAK-PLAN-godkänt val" },
  { sv: "risknivå", en: "risk level", ar: "مستوى المخاطر", kat: "risk" },
  { sv: "riskprofil", en: "risk profile", ar: "ملف المخاطر", kat: "risk" },
  { sv: "riskmatris", en: "risk matrix", ar: "مصفوفة المخاطر", kat: "risk" },
  { sv: "kreditrisk", en: "credit risk", ar: "مخاطر الائتمان", kat: "risk" },
  { sv: "likviditetsrisk", en: "liquidity risk", ar: "مخاطر السيولة", kat: "risk" },
  { sv: "valutarisk", en: "currency risk", ar: "مخاطر العملة", kat: "risk" },
  { sv: "ränterisk", en: "interest rate risk", ar: "مخاطر أسعار الفائدة", kat: "risk" },
  { sv: "bolagsrisk", en: "company-specific risk", ar: "المخاطر الخاصة بالشركة", kat: "risk" },
  { sv: "koncentrationsrisk", en: "concentration risk", ar: "مخاطر التركز", kat: "risk" },
  { sv: "hävstång", en: "leverage", ar: "الرافعة المالية", kat: "risk" },
  { sv: "marginalhandel", en: "margin trading", ar: "الشراء بالهامش", kat: "risk" },
  { sv: "blankning", en: "short selling", ar: "البيع على المكشوف", kat: "risk" },
  { sv: "kort position", en: "short position", ar: "مركز بيع على المكشوف", kat: "risk" },
  { sv: "beta", en: "beta", ar: "معامل بيتا", kat: "risk" },
  { sv: "korrelation", en: "correlation", ar: "الارتباط", kat: "risk" },
  { sv: "maxliv", en: "maximum drawdown", ar: "أقصى تراجع", kat: "risk" },
  { sv: "stressscenario", en: "stress scenario", ar: "سيناريو الضغط", kat: "risk" },
  { sv: "sömnertest", en: "the sleep-at-night test", ar: "اختبار النوم الهادئ", kat: "risk", notering: "AK1A-pedagogik" },
  { sv: "positionstorlek", en: "position size", ar: "حجم المركز", kat: "risk" },
  { sv: "riskbelopp", en: "amount at risk", ar: "المبلغ المعرض للمخاطر", kat: "risk" },

  // ── MARKNAD ───────────────────────────────────────────────────────────────
  { sv: "aktie", en: "stock", ar: "السهم", kat: "marknad" },
  { sv: "aktier", en: "stocks", ar: "الأسهم", kat: "marknad" },
  { sv: "portfölj", en: "portfolio", ar: "المحفظة", kat: "marknad", notering: "SPRAK-PLAN-godkänt val" },
  { sv: "aktieportfölj", en: "stock portfolio", ar: "محفظة الأسهم", kat: "marknad" },
  { sv: "bevakningslista", en: "watchlist", ar: "قائمة المتابعة", kat: "marknad" },
  { sv: "index", en: "index", ar: "المؤشر", kat: "marknad" },
  { sv: "börs", en: "stock exchange", ar: "البورصة", kat: "marknad" },
  { sv: "börsnotering", en: "stock listing", ar: "الإدراج في البورصة", kat: "marknad" },
  { sv: "avnotering", en: "delisting", ar: "شطب السهم", kat: "marknad" },
  { sv: "obligation", en: "bond", ar: "السند", kat: "marknad" },
  { sv: "ränta", en: "interest rate", ar: "سعر الفائدة", kat: "marknad" },
  { sv: "styrränta", en: "policy rate", ar: "سعر الفائدة الأساسي", kat: "marknad" },
  { sv: "inflation", en: "inflation", ar: "التضخم", kat: "marknad" },
  { sv: "deflation", en: "deflation", ar: "الانكماش", kat: "marknad" },
  { sv: "köpkraft", en: "purchasing power", ar: "القوة الشرائية", kat: "marknad" },
  { sv: "valuta", en: "currency", ar: "العملة", kat: "marknad" },
  { sv: "valutakurs", en: "exchange rate", ar: "سعر الصرف", kat: "marknad" },
  { sv: "bruttonationalprodukt", en: "gross domestic product", ar: "الناتج المحلي الإجمالي", kat: "marknad" },
  { sv: "prisspann", en: "price range", ar: "نطاق السعر", kat: "marknad" },
  { sv: "52 veckors spann", en: "52-week range", ar: "نطاق 52 أسبوعًا", kat: "marknad" },
  { sv: "konjunktur", en: "business cycle", ar: "الدورة الاقتصادية", kat: "marknad" },
  { sv: "lågkonjunktur", en: "recession", ar: "الركود", kat: "marknad" },
  { sv: "högkonjunktur", en: "economic boom", ar: "الازدهار الاقتصادي", kat: "marknad" },
  { sv: "bubbla", en: "bubble", ar: "الفقاعة", kat: "marknad" },
  { sv: "börskrasch", en: "stock market crash", ar: "انهيار سوق الأسهم", kat: "marknad" },
  { sv: "panik", en: "panic", ar: "الهلع", kat: "marknad" },
  { sv: "eufori", en: "euphoria", ar: "النشوة", kat: "marknad" },
  { sv: "marknadspsykologi", en: "market psychology", ar: "علم نفس السوق", kat: "marknad" },
  { sv: "sentiment", en: "sentiment", ar: "المعنويات", kat: "marknad" },
  { sv: "irrationell exuberans", en: "irrational exuberance", ar: "الحماس غير العقلاني", kat: "marknad" },
  { sv: "effektiv marknad", en: "efficient market", ar: "السوق الفعالة", kat: "marknad" },
  { sv: "random walk", en: "random walk", ar: "المسيرة العشوائية", kat: "marknad" },
  { sv: "marknadslikviditet", en: "market liquidity", ar: "سيولة السوق", kat: "marknad" },
  { sv: "orderdjup", en: "order book depth", ar: "عمق السوق", kat: "marknad" },
  { sv: "ticker", en: "ticker", ar: "الرمز", kat: "marknad" },
  { sv: "fond", en: "fund", ar: "الصندوق", kat: "marknad" },
  { sv: "indexfond", en: "index fund", ar: "صندوق المؤشرات", kat: "marknad" },
  { sv: "förvaltningsavgift", en: "management fee", ar: "رسوم الإدارة", kat: "marknad" },
  { sv: "prospekt", en: "prospectus", ar: "نشرة الإصدار", kat: "marknad" },
  { sv: "analytiker", en: "analyst", ar: "المحلل", kat: "marknad" },
  { sv: "konsensus", en: "consensus", ar: "الإجماع", kat: "marknad" },
  { sv: "marknadskapitalisering", en: "market capitalization", ar: "القيمة السوقية", kat: "marknad" },

  // ── BOLAGSSTYRNING ────────────────────────────────────────────────────────
  { sv: "bolagsstämma", en: "annual general meeting", ar: "الجمعية العمومية", kat: "bolagsstyrning" },
  { sv: "aktieägare", en: "shareholder", ar: "المساهم", kat: "bolagsstyrning" },
  { sv: "minoritetsägare", en: "minority shareholder", ar: "المساهم الأقلية", kat: "bolagsstyrning" },
  { sv: "majoritetsägare", en: "majority shareholder", ar: "المساهم الأغلبية", kat: "bolagsstyrning" },
  { sv: "styrelse", en: "board of directors", ar: "مجلس الإدارة", kat: "bolagsstyrning" },
  { sv: "verkställande direktör", en: "chief executive officer", ar: "الرئيس التنفيذي", kat: "bolagsstyrning" },
  { sv: "bolagsstyrning", en: "corporate governance", ar: "حوكمة الشركات", kat: "bolagsstyrning" },
  { sv: "insynsägande", en: "insider ownership", ar: "ملكية المطلعين الداخليين", kat: "bolagsstyrning" },
  { sv: "insider", en: "insider", ar: "المطلع الداخلي", kat: "bolagsstyrning" },
  { sv: "institutionsägare", en: "institutional owners", ar: "الملاك المؤسسيون", kat: "bolagsstyrning" },
  { sv: "ägarstruktur", en: "ownership structure", ar: "هيكل الملكية", kat: "bolagsstyrning" },
  { sv: "incitamentsprogram", en: "incentive program", ar: "برنامج الحوافز", kat: "bolagsstyrning" },
  { sv: "aktieägarvärde", en: "shareholder value", ar: "قيمة المساهمين", kat: "bolagsstyrning" },
  { sv: "kvartalsrapport", en: "quarterly report", ar: "التقرير الربع سنوي", kat: "bolagsstyrning" },
  { sv: "vägledande rapport", en: "guidance", ar: "التوجيهات", kat: "bolagsstyrning" },
  { sv: "revision", en: "audit", ar: "التدقيق", kat: "bolagsstyrning" },
  { sv: "revisor", en: "auditor", ar: "المدقق", kat: "bolagsstyrning" },
  { sv: "konkurs", en: "bankruptcy", ar: "الإفلاس", kat: "bolagsstyrning" },
  { sv: "rekonstruktion", en: "reconstruction", ar: "إعادة الهيكلة", kat: "bolagsstyrning" },
  { sv: "fusion", en: "merger", ar: "الاندماج", kat: "bolagsstyrning" },
  { sv: "förvärv", en: "acquisition", ar: "الاستحواذ", kat: "bolagsstyrning" },
  { sv: "due diligence", en: "due diligence", ar: "العناية الواجبة", kat: "bolagsstyrning", notering: "latinsk term dominerar i branschen" },
  { sv: "split", en: "share split", ar: "تجزئة السهم", kat: "bolagsstyrning" },
  { sv: "omvänd split", en: "reverse share split", ar: "توحيد الأسهم", kat: "bolagsstyrning" },

  // ── PEDAGOGIK (AK1A:s röst) ───────────────────────────────────────────────
  { sv: "kunskap", en: "knowledge", ar: "المعرفة", kat: "pedagogik", notering: "SPRAK-PLAN-godkänt val" },
  { sv: "kurs", en: "course", ar: "الدورة", kat: "pedagogik" },
  { sv: "kapitel", en: "chapter", ar: "الفصل", kat: "pedagogik" },
  { sv: "quiz", en: "quiz", ar: "الاختبار", kat: "pedagogik" },
  { sv: "certifikat", en: "certificate", ar: "الشهادة", kat: "pedagogik" },
  { sv: "elev", en: "student", ar: "الطالب", kat: "pedagogik" },
  { sv: "utbildning", en: "education", ar: "التعليم", kat: "pedagogik" },
  { sv: "läroplanen", en: "the Curriculum", ar: "المنهج", kat: "pedagogik", notering: "AK1A:s egennamn med bestämd artikel" },
  { sv: "insikt", en: "insight", ar: "رؤية", kat: "pedagogik" },
  { sv: "utmaning", en: "challenge", ar: "التحدي", kat: "pedagogik" },
  { sv: "repetition", en: "review", ar: "المراجعة", kat: "pedagogik" },
  { sv: "nivå", en: "level", ar: "المستوى", kat: "pedagogik" },
  { sv: "färdighet", en: "skill", ar: "المهارة", kat: "pedagogik" },
  { sv: "reflektion", en: "reflection", ar: "التأمل", kat: "pedagogik" },
  { sv: "pedagogisk finansanalys", en: "educational financial analysis", ar: "التحليل المالي التعليمي", kat: "pedagogik", notering: "sajtens disclaimer-kärna" },
  { sv: "investeringsråd", en: "investment advice", ar: "نصيحة استثمارية", kat: "pedagogik", notering: "disclaimern: INTE investeringsråd" },

  // ── LATINSKA TERMER (behålls latinska i alla språk) ───────────────────────
  { sv: "ROE", en: "ROE", ar: "ROE", kat: "latinsk", notering: "SPRAK-PLAN: ROE behålls ROE" },
  { sv: "ROA", en: "ROA", ar: "ROA", kat: "latinsk" },
  { sv: "ROIC", en: "ROIC", ar: "ROIC", kat: "latinsk" },
  { sv: "EBIT", en: "EBIT", ar: "EBIT", kat: "latinsk" },
  { sv: "EBITDA", en: "EBITDA", ar: "EBITDA", kat: "latinsk" },
  { sv: "EV/EBITDA", en: "EV/EBITDA", ar: "EV/EBITDA", kat: "latinsk", notering: "kunddirektiv våg 52" },
  { sv: "NCAV", en: "NCAV", ar: "NCAV", kat: "latinsk", notering: "kunddirektiv våg 52 — Grahams net current asset value" },
  { sv: "net-net", en: "net-net", ar: "net-net", kat: "latinsk", notering: "Grahams cigarrettfimpar" },
  { sv: "DCF", en: "DCF", ar: "DCF", kat: "latinsk" },
  { sv: "NAV", en: "NAV", ar: "NAV", kat: "latinsk" },
  { sv: "P/E", en: "P/E", ar: "P/E", kat: "latinsk" },
  { sv: "P/B", en: "P/B", ar: "P/B", kat: "latinsk" },
  { sv: "P/S", en: "P/S", ar: "P/S", kat: "latinsk" },
  { sv: "AKM1", en: "AKM1", ar: "AKM1", kat: "latinsk", notering: "varumärke" },
  { sv: "AK1TS", en: "AK1TS", ar: "AK1TS", kat: "latinsk", notering: "varumärke" },
  { sv: "AK1A", en: "AK1A", ar: "AK1A", kat: "latinsk", notering: "varumärke" },
  { sv: "XP", en: "XP", ar: "XP", kat: "latinsk", notering: "spelifieringsterm" },
  { sv: "ARR", en: "ARR", ar: "ARR", kat: "latinsk" },
  { sv: "MRR", en: "MRR", ar: "MRR", kat: "latinsk" },
  { sv: "SaaS", en: "SaaS", ar: "SaaS", kat: "latinsk" },
  { sv: "CEO", en: "CEO", ar: "CEO", kat: "latinsk" },
  { sv: "CFO", en: "CFO", ar: "CFO", kat: "latinsk" },
] as const;

/** Termbankens storlek — garanti ≥ 200 rader (kontroll i validera-motorer). */
export const TERMBANK_STORLEK: number = TERMBANK.length;

// ── Härledda uppslag (byggs en gång, deterministiskt) ────────────────────────

const SV_TILL_RAD: ReadonlyMap<string, TermRad> = new Map(TERMBANK.map((r) => [r.sv, r]));

/** Returnerar den kanoniska raden för en svensk term, eller undefined. */
export function termForSv(sv: string): TermRad | undefined {
  return SV_TILL_RAD.get(sv);
}

/** Alla svenska termer (källsidan av garantin). */
export function allaSvTermer(): readonly string[] {
  return TERMBANK.map((r) => r.sv);
}

/**
 * Svenska böjningssuffix som termmatcharen tillåter EFTER termen (se
 * kontroller.ts): bestämdhet, plural, genitiv — t.ex. "bruttomarginalen",
 * "nyckeltal", "återköpens". Ordets stam måste fortfarande sluta vid termen.
 */
const SV_SUFFIX = "(?:en|et|er|na|arna|orna|erna|s|ns|nas)?";

/** Escape för regex — termerna innehåller "/", "+", "(" etc. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Bygg termens svenska matchnings-regex (ordgränser + tillåtna suffix). */
function svRegex(sv: string): RegExp {
  // "i" — svensk text inleder ofta med versal ("Bruttomarginalen steg …")
  return new RegExp("(?<![\\p{L}])" + escapeRegExp(sv) + SV_SUFFIX + "(?![\\p{L}])", "giu");
}

/**
 * Hitta alla termbankstermer som förekommer i en källtext.
 * Används av (1) kontroller.ts termKonsistens och (2) motor.ts promptbygge —
 * samma detektering garanterar att prompten innehåller precis de termer som
 * efteråt kontrolleras.
 */
export function hittaTermerIKalla(kalltext: string): readonly TermRad[] {
  const traffade: TermRad[] = [];
  for (const rad of TERMBANK) {
    if (svRegex(rad.sv).test(kalltext)) traffade.push(rad);
  }
  return traffade;
}

/** Intern export för testbarhet: suffixmatcharen som egen funktion. */
export function svTermMatchar(sv: string, text: string): boolean {
  // ny RegExp per anrop — regex-objekt med g-flagga har lastIndex-state
  return svRegex(sv).test(text);
}

/**
 * VITLISTA för AR:s åäö-kontroll (lateralKolla): termbanksrader vars arabiska
 * MEDELÅTERTAR ett svenskt ord med å/ä/ö (medvetna behåll, t.ex. citerade
 * svenska boktitlar) vitlistas automatiskt — nya rader i banken utökar
 * vitlistan utan kodändring. Från början tom: korrekt arabiska innehåller
 * inga svenska tecken.
 */
export function arVitlista(): readonly string[] {
  const vit: string[] = [];
  for (const rad of TERMBANK) {
    if (/[åäöÅÄÖ]/.test(rad.ar)) vit.push(rad.ar);
  }
  return vit;
}

/**
 * Latinska termer som SKA finnas kvar i arabisk text (kat "latinsk").
 * Används av motorpromten ("behåll dessa exakt") och dokumentation.
 */
export function latinskaTermer(): readonly TermRad[] {
  return TERMBANK.filter((r) => r.kat === "latinsk");
}
