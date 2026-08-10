"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAk1aStore } from "@/lib/ak1a-store";

/**
 * Hook för att logga klientaktivitet till admin.
 * Genererar ett anonymt session-id och loggar section_visits,
 * course_opens, etc. via /api/admin/activity.
 */

const SESSION_KEY = "ak1a-session-id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export function useActivityLogger() {
  const sessionIdRef = useRef<string>("");
  const lastLoggedSection = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  const log = useCallback(
    async (
      action: string,
      data: {
        section?: string;
        targetType?: string;
        targetId?: string;
        metadata?: Record<string, unknown>;
      } = {}
    ) => {
      if (!sessionIdRef.current) return;
      try {
        await fetch("/api/admin/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            action,
            ...data,
          }),
          keepalive: true,
        });
      } catch {
        // fail silently — logging is best-effort
      }
    },
    []
  );

  return { log, sessionId: sessionIdRef };
}

/**
 * Auto-logger: loggar section_visits automatiskt när användaren byter section.
 */
export function useAutoLogger() {
  const { section, kurserDeepSlug } = useAk1aStore();
  const { log } = useActivityLogger();
  const lastLogged = useRef<string>("");

  useEffect(() => {
    const sectionKey = kurserDeepSlug ? `${section}:${kurserDeepSlug}` : section;
    if (sectionKey !== lastLogged.current) {
      lastLogged.current = sectionKey;
      log("section_visit", { section, targetType: kurserDeepSlug ? "course" : undefined, targetId: kurserDeepSlug || undefined });
    }
  }, [section, kurserDeepSlug, log]);
}
