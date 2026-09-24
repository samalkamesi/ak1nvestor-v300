"use client";

import { useState } from "react";
import { Share2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * DEL-RADEN — öppen, diskret delning (VÅG 3, m8 §3b).
 *
 * EN "Dela"-knapp (Web Share API) + "Kopiera länk" (clipboard + toast) +
 * subtil fråga "Hittade du detta värdefullt? Dela gärna."
 *
 * LAGAR (MARKNADS-BESLUT §0): ingen belöning, inget lås, ingen mejl-vägg,
 * inga tredjepartsskript — "tipsa, tvinga aldrig" (P1/P5). Share-texten
 * bär disclaimer-token när den bär analys-innehåll (AC1). Noll spårning
 * (P6): inga klick-event, ingen pixel — bara webbläsarens egna API:er.
 *
 * Monostras på blogg/[slug] och forskningsbiblioteket/[ticker] före
 * nästa-steg-blocket. m8:s design: ikonrad, inte banner.
 */

const LAB_URL = "https://lab.ak1nvestor.com";

export function DelRad({
  titel,
  text,
  path,
  disclaimer = false,
  className = "",
}: {
  /** Delningens rubrik (navigator.share.title). */
  titel: string;
  /** Kort beskrivning i delnings-texten — frivillig. */
  text?: string;
  /** Relativ sökväg, t.ex. "/blogg/min-post" → LAB_URL + path. */
  path: string;
  /** true = analys-innehåll: disclaimer-token läggs i share-texten (AC1). */
  disclaimer?: boolean;
  className?: string;
}) {
  const [delar, setDelar] = useState(false);
  const { toast } = useToast();

  const url = `${LAB_URL}${path}`;
  const shareText = [text, disclaimer ? "Pedagogisk analys — inte investeringsråd." : null]
    .filter(Boolean)
    .join("\n");

  async function dela() {
    if (delar) return;
    setDelar(true);
    try {
      if (navigator.share) {
        await navigator.share({ title: titel, text: shareText, url });
      } else {
        // Clipboard-fallback (AC1): samma innehåll, användaren klistrar själv.
        await navigator.clipboard.writeText(shareText ? `${titel}\n${shareText}\n${url}` : url);
        toast({
          title: "Kopierat till urklipp",
          description: "Klistra in där du vill — du bestämmer.",
        });
      }
    } catch {
      // Användaren avbröt delningsdialogen — inget att rapportera.
    } finally {
      setDelar(false);
    }
  }

  async function kopieraLank() {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Länken kopierad",
        description: "Klistra in där du vill — du bestämmer.",
      });
    } catch {
      toast({
        title: "Kunde inte kopiera",
        description: "Testa igen — eller kopiera adressfältets länk för hand.",
      });
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 border-t border-gold/15 pt-4 ${className}`}
      aria-label="Dela sidan"
    >
      <p className="text-xs italic text-muted-foreground">
        Hittade du detta värdefullt? Dela gärna.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={dela}
          disabled={delar}
          className="inline-flex min-h-[44px] max-md:min-h-[52px] items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-gold/60 hover:bg-gold/5 disabled:opacity-60"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          {delar ? "Förbereder…" : "Dela"}
        </button>
        <button
          onClick={kopieraLank}
          className="inline-flex min-h-[44px] max-md:min-h-[52px] items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-gold/60 hover:bg-gold/5"
        >
          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          Kopiera länk
        </button>
      </div>
    </div>
  );
}
