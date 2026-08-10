"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  React.useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h2 className="font-serif text-2xl font-bold">Något gick fel</h2>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
        Ett fel uppstod. Försök igen eller rensa cache.
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
