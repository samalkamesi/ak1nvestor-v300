import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="font-serif text-6xl font-bold text-gold">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold">Sidan hittades inte</h1>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
        Sidan du letar efter finns inte.
      </p>
      <div className="mt-6 flex gap-3">
        <Button className="bg-gold text-background hover:bg-gold/90" onClick={() => window.location.href = "/"}>
          <Home className="mr-1 h-4 w-4" /> Till startsidan
        </Button>
      </div>
    </div>
  );
}
