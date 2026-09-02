"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { klassifiera, rapporteraBeteende } from "@/lib/tracer";

/**
 * TRACER-MOUNT — beteendetracerns tysta öra i organismen.
 *
 * En passiv lyssnare: renderas EN gång i layout.tsx och följer med på
 * varje sidnavigering (usePathname). Varje ny sökväg rapporteras till
 * den lokala profilen — med ett intressespår om sökvägen kan klassas
 * (teknisk | fundamental | portfölj | beteende).
 *
 * INTEGRITET: inget lämnar webbläsaren här — allt stannar i
 * localStorage (ak1a-tracer-v1). Delning sker endast via en frivillig
 * knapp på Min Sida (ej byggd ännu) som anropar /api/tracer.
 */
export function TracerMount() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    rapporteraBeteende({
      typ: "sidvisning",
      namn: pathname,
      intresse: klassifiera(pathname),
    });
  }, [pathname]);

  return null;
}
