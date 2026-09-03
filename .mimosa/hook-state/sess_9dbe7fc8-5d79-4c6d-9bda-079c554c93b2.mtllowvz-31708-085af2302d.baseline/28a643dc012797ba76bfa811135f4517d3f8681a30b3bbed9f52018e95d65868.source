/**
 * CHAT-MINNE — AI-Mentorns konversationsminne "i djupet" (helt lokalt).
 *
 * Varje tur (elevfråga + mentorsvar) sparas i localStorage under nyckeln
 * `ak1a-chat-minne-v1` som en kronologisk array (äldst först):
 *
 *   ChatTur[] = { roll: "du" | "mentor", text: string, ts: number }[]
 *
 * - Max 60 turer (MAX_TURER) — de äldsta rensas automatiskt.
 * - Vid varje POST till /api/chatbot skickas de senaste 12 turerna
 *   (HISTORIK_FONSTER) som `historik` i body:n — serversidan använder dem
 *   för bakåtreferenser, antagandekorrektioner och motfråge-rotation.
 * - SSR-säkert: allt localStorage-beroende är vaktat mot `window` och
 *   try/catch:at (privat läge/kvot fullt är aldrig fatalt).
 */

export type ChatRoll = "du" | "mentor";

/** En tur i samtalet. ts = Date.now() när turen sparades. */
export type ChatTur = { roll: ChatRoll; text: string; ts: number };

const NYCKEL = "ak1a-chat-minne-v1";

/** Max antal turer i minnet — äldsta rensas först. */
export const MAX_TURER = 60;

/** Antal turer som skickas som `historik` till /api/chatbot. */
export const HISTORIK_FONSTER = 12;

/** Typvakt: en lagrad tur måste ha giltig roll, icke-tom text och ett tal-ts. */
function giltig(t: unknown): t is ChatTur {
  if (!t || typeof t !== "object") return false;
  const roll = (t as { roll?: unknown }).roll;
  const text = (t as { text?: unknown }).text;
  const ts = (t as { ts?: unknown }).ts;
  return (
    (roll === "du" || roll === "mentor") &&
    typeof text === "string" &&
    text.trim().length > 0 &&
    typeof ts === "number" &&
    Number.isFinite(ts)
  );
}

/** Hela minnet, kronologiskt (äldst först). Tom lista på servern/vid fel. */
export function lasChatMinne(): ChatTur[] {
  if (typeof window === "undefined") return [];
  try {
    const rå = window.localStorage.getItem(NYCKEL);
    if (!rå) return [];
    const lista = JSON.parse(rå) as unknown[];
    if (!Array.isArray(lista)) return [];
    return lista.filter(giltig).slice(0, MAX_TURER);
  } catch {
    return [];
  }
}

/**
 * Spara en tur sist i minnet (kronologiskt). Texten klipps till 600 tecken
 * och minnet hålls maximalt MAX_TURER långt — de äldsta turerna rensas.
 * Returnerar det nya minnet.
 */
export function sparaChatTur(roll: ChatRoll, text: string): ChatTur[] {
  if (typeof window === "undefined") return [];
  const ren = text.trim().slice(0, 600);
  if (!ren) return lasChatMinne();
  const lista = [...lasChatMinne(), { roll, text: ren, ts: Date.now() }];
  const trimmad = lista.length > MAX_TURER ? lista.slice(lista.length - MAX_TURER) : lista;
  try {
    window.localStorage.setItem(NYCKEL, JSON.stringify(trimmad));
  } catch {
    /* privat läge / kvot fullt — inte fatalt */
  }
  return trimmad;
}

/** Radera hela minnet (widgetens "Rensa"-knapp). */
export function rensaChatMinne(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(NYCKEL);
  } catch {
    /* ignoreras */
  }
}

/** De senaste n turerna, kronologiskt — det som skickas som `historik`. */
export function senasteHistorik(n: number = HISTORIK_FONSTER): ChatTur[] {
  return lasChatMinne().slice(-Math.max(1, n));
}

/** Antal elevfrågor i minnet — "Mentorn minns {n} av dina frågor". */
export function raknaElevFragor(): number {
  return lasChatMinne().filter((t) => t.roll === "du").length;
}
