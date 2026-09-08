"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lasMedlem, sparaMedlem, loggaUt, niva, lasXP, lasStjarnor } from "@/lib/member-local";
import { SIFFROR } from "@/lib/siffror";

/** أرقام عربية شرقية مع فاصل الآلاف العربي. */
const num = (n: number) => n.toLocaleString("ar-EG");

/** مفتاح localStorage لسجل الموافقة على الشروط وسياسة الخصوصية.
 *  يجب أن يطابق المكوّن السويدي — فالموافقة مشتركة لكل متصفح. */
const SAMTYCKE_NYCKEL = "ak1a-villkors-samtycke";

/** يحفظ الموافقة عند أول تسجيل دخول ناجح — ولا يستبدل موافقة قائمة أبدًا. */
function sparaSamtycke() {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(SAMTYCKE_NYCKEL)) return; // موجودة — لا تعطل الزيارات القادمة
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : String(Date.now());
    window.localStorage.setItem(
      SAMTYCKE_NYCKEL,
      JSON.stringify({ godkant: true, datum: new Date().toISOString(), id })
    );
  } catch {
    /* localStorage غير متاح — لا تعطل تسجيل الدخول */
  }
}

/**
 * نموذج تسجيل الدخول العربي (الموجة 51 — الوكيل S2) — ترجمة مستقلة
 * لـ src/components/ak1a/logga-in.tsx. التدفق نفسه، والواجهة البرمجية
 * نفسها، ومخزن العضوية نفسه؛ النصوص وحدها عربية. المكوّن السويدي
 * متروك دون مساس لموجة التعريب.
 */
export function LoggaInAr() {
  const [email, setEmail] = useState("");
  const [namn, setNamn] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [redan, setRedan] = useState(false);
  const [samtycke, setSamtycke] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && lasMedlem()) setRedan(true);
  }, []);

  // هل حُفظت الموافقة سابقًا؟ محدَّدة مسبقًا حتى لا يُحجب الزائرون العائدون.
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(SAMTYCKE_NYCKEL)) {
        setSamtycke(true);
      }
    } catch {
      /* يمكن تجاهله */
    }
  }, []);

  const loggaIn = async () => {
    if (!email.trim()) return;
    if (!samtycke) {
      setStatus("يجب أن توافق على الشروط للمتابعة.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      // إيجاد العضو أو إنشاؤه
      const res = await fetch("/api/member/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: namn.trim() || null }),
      });
      const data = await res.json();
      if (res.ok && data.member) {
        sparaMedlem({ id: data.member.id, email: data.member.email, namn: data.member.name || namn || undefined });
        sparaSamtycke();
        setStatus(
          data.isNew
            ? `مرحبًا بك في AK1A يا ${data.member.name || email}! أُنشئ حسابك المجاني — وجميع الدورات البالغة ${num(SIFFROR.kurser)} دورة مفتوحة الآن.`
            : `مرحبًا بعودتك يا ${data.member.name || email}!`
        );
        setRedan(true);
      } else {
        setStatus(data.error || "حدث خطأ ما — حاول مرة أخرى.");
      }
    } catch {
      setStatus("خطأ في الشبكة — حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  const m = typeof window !== "undefined" ? lasMedlem() : null;

  return (
    <div dir="rtl" className="mx-auto max-w-md">
      {redan && m ? (
        <div className="rounded-2xl border-2 border-gold bg-card p-8 text-center">
          <p className="text-4xl">✅</p>
          <h2 className="mt-3 font-serif text-2xl font-bold">أنت مسجّل الدخول</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {m.namn || m.email} · المستوى {typeof window !== "undefined" ? niva() : 1}/100 ·{" "}
            {typeof window !== "undefined" ? lasXP() : 0} XP · {typeof window !== "undefined" ? lasStjarnor() : 0} ★
          </p>
          <div className="mt-5 space-y-2">
            <Link
              href="/kurser"
              className="block rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              ← إلى جميع الدورات
            </Link>
            <Link href="/min-portfolj" className="block text-sm underline hover:text-gold">
              محفظتي
            </Link>
            <button
              onClick={() => {
                loggaUt();
                setRedan(false);
                setStatus("لقد سجّلت الخروج. نراك قريبًا!");
              }}
              className="text-xs text-muted-foreground underline"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-gold bg-card p-8">
          <h2 className="font-serif text-2xl font-bold">
            سجّل الدخول — أو أنشئ حسابًا مجانيًا
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            يكفي بريد إلكتروني واحد. التحليل الأساسي حق: جميع الدورات
            البالغة {num(SIFFROR.kurser)} دورة، والحاسبة، ونظام المحافظ{" "}
            <strong>مجانية تمامًا</strong> — إلى الأبد.
          </p>
          <div className="mt-5 space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              onKeyDown={(e) => e.key === "Enter" && loggaIn()}
            />
            <Input
              value={namn}
              onChange={(e) => setNamn(e.target.value)}
              placeholder="اسمك (اختياري)"
            />
            <label
              htmlFor="ak1a-villkors-samtycke-ar"
              className="flex cursor-pointer select-none items-start gap-2.5"
            >
              <input
                id="ak1a-villkors-samtycke-ar"
                type="checkbox"
                checked={samtycke}
                onChange={(e) => setSamtycke(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                أوافق على{" "}
                <Link href="/villkor" className="underline hover:text-gold">
                  شروط الاستخدام
                </Link>{" "}
                و{" "}
                <Link href="/privacy-policy" className="underline hover:text-gold">
                  سياسة الخصوصية
                </Link>
                .
              </span>
            </label>
            <Button
              className="w-full bg-gold text-background hover:bg-gold/90"
              onClick={loggaIn}
              disabled={busy || !samtycke}
            >
              {busy ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول / إنشاء حساب"}
            </Button>
            {!samtycke && (
              <p className="text-center text-[11px] text-muted-foreground">
                وافق على الشروط للمتابعة
              </p>
            )}
          </div>
          {status && <p className="mt-3 text-sm text-gold">{status}</p>}
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            لا دفع، ولا بطاقة، ويمكنك الإنهاء متى شئت.
          </p>
        </div>
      )}
    </div>
  );
}
