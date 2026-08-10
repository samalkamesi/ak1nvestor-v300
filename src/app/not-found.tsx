"use client";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Ak1aLogo } from "@/components/ak1a/primitives";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const { setSection } = useAk1aStore();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center paper-texture px-4">
      <Ak1aLogo size="lg" onClick={() => setSection("hem")} />
      <p className="mt-8 font-serif text-6xl font-bold text-gold">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold">Sidan hittades inte</h1>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
        Sidan du letar efter finns inte.
      </p>
      <Button className="mt-6 bg-gold text-background hover:bg-gold/90" onClick={() => setSection("hem")}>
        <Home className="mr-1 h-4 w-4" /> Till startsidan
      </Button>
    </div>
  );
}
