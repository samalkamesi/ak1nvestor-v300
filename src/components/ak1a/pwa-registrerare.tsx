"use client";

import { useEffect } from "react";

/**
 * Registrerar service workern (PWA) i produktion — aldrig i dev,
 * där SW bara ställer till med caching av hot-reload.
 *
 * VÅG 78 (telefon-buggen) — INVARIANT: en SW-uppdatering får ALDRIG tvinga
 * sidladdning. Denna komponent lyssnar därför ALDRIG på updatefound/
 * controllerchange (och gör det aldrig med reload); sw.js saknar i sin tur
 * skipWaiting/clients.claim, så en ny version börjar gälla först vid nästa
 * naturliga navigering. updateViaCache: "none" gör dessutom sw.js-kontrollen
 * okänslig för HTTP-cachen — en inaktuell SW-fil kan aldrig hålla sig själv
 * vid liv i en uppdateringsloop.
 */
export function PwaRegistrerare() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch(() => {
        /* installation misslyckades — sajten fungerar ändå */
      });
  }, []);
  return null;
}
