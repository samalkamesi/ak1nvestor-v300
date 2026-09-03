"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Ak1aLogo } from "@/components/ak1a/primitives";
import { RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  React.useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center paper-texture px-4">
      <Ak1aLogo size="lg" onClick={() => window.location.href = "/"} />
      <h2 className="mt-8 font-serif text-2xl font-bold">Något gick fel</h2>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
        Ett fel uppstod vid laddning av sidan. Försök igen eller rensa cache.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} className="bg-gold text-background hover:bg-gold/90">
          <RefreshCw className="mr-1 h-4 w-4" /> Försök igen
        </Button>
        <Button variant="outline" onClick={() => { if(typeof window!=="undefined"){ localStorage.clear(); window.location.href="/"; } }}>
          <Home className="mr-1 h-4 w-4" /> Rensa & hem
        </Button>
      </div>
    </div>
  );
}
