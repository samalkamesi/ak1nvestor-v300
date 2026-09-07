"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lasMedlem, niva, lasXP, lasKlaraKurser } from "@/lib/member-local";
import { PRISER } from "@/lib/variabler";

/**
 * تقديم طلب المرحلة 2 (AR) — arabisk spegelkopia av
 * src/components/ak1a/fas2-ansok.tsx (våg 51 agent S3). Samma logik, samma
 * API-post till /api/fas2-ansok — endast texterna är översatta (modern
 * standardarabiska, finansiella termer) och roten bär dir="rtl".
 * Latinska förkortningar (AKM1, XP, SEK) behålls enligt språkplanen.
 * Den svenska komponenten är orörd.
 *
 * VÅG 80A (språk-agent 2): pris-talet kommer som prop (prisFas2) från
 * server-sidan, som läser lasPriserGallande() — samma kontrakt som svenska
 * Fas2Ansok. Statisk PRISER-importen är endast robust fallback om
 * komponenten renderas utan prop. Latinska siffror behålls.
 */

const MAX_VARFOR = 800;

export function Fas2AnsokAr({ prisFas2 }: { prisFas2?: number }) {
  const [hydrerad, setHydrerad] = useState(false);
  const [inloggad, setInloggad] = useState(false);
  const [elevNiva, setElevNiva] = useState(1);
  const [elevXp, setElevXp] = useState(0);
  const [klaraKurser, setKlaraKurser] = useState<string[]>([]);

  const [namn, setNamn] = useState("");
  const [email, setEmail] = useState("");
  const [varfor, setVarfor] = useState("");
  const [busy, setBusy] = useState(false);
  const [fel, setFel] = useState("");
  const [skickad, setSkickad] = useState(false);

  useEffect(() => {
    const m = lasMedlem();
    if (m) {
      setInloggad(true);
      setNamn(m.namn || "");
      setEmail(m.email);
    }
    setElevXp(lasXP());
    setElevNiva(niva());
    setKlaraKurser(lasKlaraKurser());
    setHydrerad(true);
  }, []);

  const niv = hydrerad ? elevNiva : 1;
  const redo = niv >= 25;

  const skicka = async () => {
    setFel("");
    if (!namn.trim()) {
      setFel("يرجى كتابة اسمك.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFel("يرجى كتابة بريد إلكتروني صحيح.");
      return;
    }
    if (varfor.trim().length > MAX_VARFOR) {
      setFel(`يجب ألا يتجاوز نص «لماذا أنت؟» ${MAX_VARFOR} حرفًا.`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/fas2-ansok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namn: namn.trim(),
          email: email.trim(),
          niva: niv,
          xp: elevXp,
          kurserKlara: klaraKurser,
          varfor: varfor.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSkickad(true);
      } else {
        setFel(data.error || "حدث خطأ ما — حاول مرة أخرى بعد قليل.");
      }
    } catch {
      setFel("خطأ في الشبكة — تحقق من اتصالك وحاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  // ── حالة التأكيد: تم استلام الطلب ────────────────────────────────────────
  if (skickad) {
    return (
      <div
        dir="rtl"
        className="relative overflow-hidden rounded-3xl border-2 border-gold bg-card p-10 text-center shadow-2xl"
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <span className="font-serif text-[160px] font-black">AK1A</span>
        </div>
        <div className="absolute inset-2 rounded-2xl border-2 border-gold/30" />
        <div className="relative">
          <p className="text-4xl">✉️</p>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight">
            تم استلام طلبك
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-24 bg-gold/40" />
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            شكرًا لك {namn.trim() || "صديقنا"}. سنعود إليك بموعد اجتماع — نقرأ
            طلبك بعناية وسنتواصل معك قريبًا. حتى ذلك الحين:{" "}
            <strong>المرحلة 1 لا تخفي شيئًا</strong> — نرحب بأن تواصل بناء عمقك
            هناك.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/ar/kurser"
              className="rounded-md bg-gold px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              واصل في المرحلة 1 — مجانًا
            </Link>
            <Link
              href="/ar/medlemskap"
              className="text-sm underline text-muted-foreground hover:text-foreground"
            >
              اقرأ عن المرحلتين 1 و2 من جديد
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── نموذج الطلب ──────────────────────────────────────────────────────────
  return (
    <div dir="rtl" className="space-y-6">
      {/* حالة الطالب — تُقرأ محليًا وتُقدَّم بشكل محايد دون تصنيفات */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/30 bg-card p-4">
        <div className="text-sm text-muted-foreground">
          {hydrerad ? (
            inloggad ? (
              <span>
                حالة الطالب لديك:{" "}
                <strong className="text-foreground">
                  المستوى {niv} · {elevXp.toLocaleString("en-US")} XP · إكمال{" "}
                  {klaraKurser.length} دورة{klaraKurser.length === 1 ? "" : "ات"}
                </strong>
              </span>
            ) : (
              <span>
                لست مسجل الدخول — اكتب الاسم والبريد الإلكتروني يدويًا.{" "}
                <Link href="/ar/logga-in" className="underline hover:text-foreground">
                  سجّل الدخول
                </Link>{" "}
                إذا أردت جلب حالتك تلقائيًا.
              </span>
            )
          ) : (
            <span className="text-muted-foreground/60">جارٍ قراءة حالة الطالب…</span>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            redo
              ? "border-gold bg-gold/10 text-gold"
              : "border-gold/30 bg-paper text-muted-foreground"
          }`}
          title="المرحلة 2 موجهة لمن غاص بعمق في المرحلة 1"
        >
          المستوى 25{hydrerad && redo ? " — جاهز!" : ""}
        </span>
      </div>

      {/* بطاقة النموذج */}
      <div className="rounded-2xl border-2 border-gold/60 bg-card p-7 shadow-lg sm:p-9">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">المرحلة 2 · الطلب</p>
        <h2 className="mt-3 font-serif text-2xl font-bold">أخبرنا من أنت</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ثلاثة حقول تكفي. نقرأ كل طلب شخصيًا — لا استعجال ولا إجابة «صحيحة»
          واحدة. المستوى 25 إشارة لا شرط.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="fas2-namn-ar" className="mb-1.5 block text-xs font-semibold text-foreground">
              الاسم
            </label>
            <Input
              id="fas2-namn-ar"
              value={namn}
              onChange={(e) => setNamn(e.target.value)}
              placeholder="اسمك"
              maxLength={80}
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="fas2-email-ar" className="mb-1.5 block text-xs font-semibold text-foreground">
              البريد الإلكتروني
            </label>
            <Input
              id="fas2-email-ar"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              maxLength={160}
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="fas2-varfor-ar" className="mb-1.5 block text-xs font-semibold text-foreground">
              لماذا أنت؟ ({varfor.length}/{MAX_VARFOR} حرفًا)
            </label>
            <textarea
              id="fas2-varfor-ar"
              value={varfor}
              onChange={(e) => setVarfor(e.target.value.slice(0, MAX_VARFOR))}
              placeholder="ما الذي تريد تعلمه بعمق أكبر؟ ماذا أعطتك المرحلة 1 حتى الآن؟"
              rows={6}
              maxLength={MAX_VARFOR}
              className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              اختياري، لكنه يساعدنا على فهم موقعك في مسار تطورك.
            </p>
          </div>

          <Button
            className="w-full bg-gold font-bold text-primary-foreground hover:bg-gold/90"
            onClick={skicka}
            disabled={busy}
          >
            {busy ? "جارٍ إرسال الطلب…" : "أرسل الطلب"}
          </Button>

          {fel && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {fel}
            </p>
          )}
        </div>
      </div>

      {/* نبرة كريمة + الشروط */}
      <div className="rounded-lg border border-gold/30 bg-paper p-5 text-xs leading-relaxed text-muted-foreground">
        <p>
          <strong className="text-foreground">لا دفع الآن.</strong> الطلب مجاني
          وغير مُلزِم. تكلفة المرحلة 2 هي{" "}
          {(prisFas2 ?? PRISER.fas2EnGang).toLocaleString("en-US")} SEK — لكنك لا تدفع شيئًا خلال
          الأيام التسعين الأولى: يُدفع المبلغ بعد 90 يومًا فقط، وفقط إن بقيت
          راضيًا (ضمان الرضا 90 يومًا، بأساس قانوني في{" "}
          <Link href="/villkor" className="underline hover:text-foreground">
            الشروط
          </Link>{" "}
          القسمين 5–6).{" "}
          <strong className="text-foreground">المرحلة 1 لا تخفي شيئًا</strong>:
          المنهجية بأكملها تبقى مجانية، للأبد. نعالج بياناتك وفق{" "}
          <Link href="/privacy-policy" className="underline hover:text-foreground">
            سياسة الخصوصية
          </Link>{" "}
          ولا نبيع بياناتك أبدًا.
        </p>
        <p className="mt-2">
          يقدّم AK1A Research Lab تعليمًا ماليًا قائمًا على البحث — لا تُشكِّل
          أي خدمة هنا نصيحة استثمارية. انظر أيضًا{" "}
          <Link href="/finansiell-policy" className="underline hover:text-foreground">
            سياستنا المالية
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
