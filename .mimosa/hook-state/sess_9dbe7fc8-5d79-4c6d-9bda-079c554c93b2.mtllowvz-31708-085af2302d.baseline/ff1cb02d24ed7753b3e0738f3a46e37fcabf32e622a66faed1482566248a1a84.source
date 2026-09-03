import "server-only";

/**
 * Z.AI-CLIENT — delad LLM-klient för AI-Mentor + Short-Seller (GLM).
 *
 * Aktiveras automatiskt när ZAI_API_KEY finns i miljön (Vercel env eller .env).
 * Utan nyckel returneras null och anroparen faller tillbaka på det
 * deterministiska läget — sajten fungerar ALLTID.
 *
 * Säkerhet: fast host allow-list (api.z.ai + api.bigmodel.cn), endast https,
 * timeout + retries utan att läcka nyckeln i felmeddelanden.
 */

const ZAI_HOSTS = new Set(["api.z.ai", "api.bigmodel.cn"]);
const ZAI_TIMEOUT_MS = 25_000;

export function zaiAktiv(): boolean {
  return Boolean(process.env.ZAI_API_KEY);
}

type ZaiMeddelande = { role: "system" | "user" | "assistant"; content: string };

function zaiEndpoint(): string {
  const bas = process.env.ZAI_BASE_URL || "https://api.z.ai/api/paas/v4/chat/completions";
  return bas;
}

/** Validera endpoint enligt säkerhetspolicy: endast https + allow-listad host. */
function valideraEndpoint(url: string): URL {
  const u = new URL(url);
  if (u.protocol !== "https:") throw new Error("Ogiltigt protokoll");
  if (!ZAI_HOSTS.has(u.hostname)) throw new Error("Host ej tillåten");
  return u;
}

/**
 * Anropa Z.ai chat completions. Returnerar textinnehållet, eller null vid
 * avsaknad av nyckel / timeout / API-fel (anroparen avgör fallback).
 */
export async function zaiChat(
  meddelanden: ZaiMeddelande[],
  opts?: { temperatur?: number; maxTokens?: number }
): Promise<string | null> {
  const nyckel = process.env.ZAI_API_KEY;
  if (!nyckel) return null;

  let url: URL;
  try {
    url = valideraEndpoint(zaiEndpoint());
  } catch {
    console.error("[zai] endpoint underkänd av säkerhetsvalidering");
    return null;
  }

  const kontroll = new AbortController();
  const timer = setTimeout(() => kontroll.abort(), ZAI_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${nyckel}`,
      },
      body: JSON.stringify({
        model: process.env.ZAI_MODEL || "glm-4.6",
        messages: meddelanden,
        temperature: opts?.temperatur ?? 0.7,
        max_tokens: opts?.maxTokens ?? 800,
      }),
      signal: kontroll.signal,
    });

    if (!res.ok) {
      console.error(`[zai] API svarade ${res.status}`);
      return null;
    }

    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content;
    return text?.trim() || null;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      console.error("[zai] timeout");
    } else {
      console.error("[zai] anrop misslyckades");
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
