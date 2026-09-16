"use client";

import * as React from "react";
import { Server } from "lucide-react";

import { useAk1aStore } from "@/lib/ak1a-store";
import {
  adminHeaders,
  loggaIn,
  sparaAdminLosenord,
} from "@/lib/admin-klient";
import { VarumarkesLogo } from "@/components/ak1a/varumarkes-logo";
import { StudioChat } from "@/components/ak1a/studio-chat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * /STUDIO — KLIKTHALVA (o16/v96-mönstret): allt "use client"-innehåll från
 * page.tsx, oförändrat. Lås-vyn exakt som admin-panelens — session-inloggning
 * först (POST /api/admin/login, cookien ak1a_admin bärs automatiskt), annars
 * ADMIN_PASSWORD-fallback (x-admin-password via adminHeaders på varje
 * studio-anrop). API-rutterna kräver requireAdmin oavsett — UI-låset är
 * första dörren, rutterna är den andra. INGA hemligheter renderas.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

export default function StudioKlient() {
  const { setSection, setIsAdmin } = useAk1aStore();
  const [authad, setAuthad] = React.useState(false);
  const [kollar, setKollar] = React.useState(true);
  const [losenord, setLosenord] = React.useState("");
  const [fel, setFel] = React.useState("");

  // Redan inloggad? Fråga bryggan (GET kräver admin → 200 = giltig session).
  React.useEffect(() => {
    let levande = true;
    (async () => {
      try {
        const res = await fetch("/api/studio/stream", { headers: adminHeaders() });
        if (levande) setAuthad(res.ok);
      } catch {
        // nätverksfel → lås-vy
      } finally {
        if (levande) setKollar(false);
      }
    })();
    return () => {
      levande = false;
    };
  }, []);

  const forsokLoggaIn = async () => {
    if (!losenord) return;
    setFel("");
    // 1) Session-vägen (våg 83 §A): cookien ak1a_admin, lösenordet skickas
    //    aldrig igen efteråt.
    const svar = await loggaIn(losenord);
    if (svar.roll) {
      setAuthad(true);
      setIsAdmin(true);
      return;
    }
    // 2) Fall-back: ADMIN_PASSWORD-läget — verifieras mot bryggans GET
    //    (kräver admin) och sparas för kommande rubrik-anrop.
    try {
      const res = await fetch("/api/studio/stream", {
        headers: { "x-admin-password": losenord },
      });
      if (res.ok) {
        sparaAdminLosenord(losenord);
        setAuthad(true);
        setIsAdmin(true);
        return;
      }
    } catch {
      // fall igenom till feltexten
    }
    setFel("Fel lösenord.");
  };

  if (kollar) {
    return (
      <div className="paper-texture flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Låser upp studion…</p>
      </div>
    );
  }

  if (!authad) {
    return (
      <div className="paper-texture flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm border-gold/30 p-6">
          <VarumarkesLogo storlek="md" onClick={() => setSection("hem")} />
          <div className="mt-6 flex items-center gap-2">
            <Server className="h-5 w-5 text-gold" />
            <h1 className="font-serif text-xl font-bold">AK1A Studio</h1>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Din privata webchat mot agenten — samma hjärna som bygger sajten.
            Endast för behörig administratör.
          </p>
          <Input
            type="password"
            value={losenord}
            onChange={(e) => setLosenord(e.target.value)}
            placeholder="Lösenord"
            className="mt-4"
            onKeyDown={async (e) => {
              if (e.key === "Enter" && losenord) await forsokLoggaIn();
            }}
          />
          <Button className="mt-3 w-full bg-gold text-background hover:bg-gold/90" onClick={() => void forsokLoggaIn()}>
            Logga in
          </Button>
          {fel && <p className="mt-2 text-center text-xs text-red-600">{fel}</p>}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            Samma lösenord som admin-panelen (ADMIN_PASSWORD).
          </p>
          <Button variant="ghost" className="mt-2 w-full text-xs" onClick={() => setSection("hem")}>
            Tillbaka till startsidan
          </Button>
        </Card>
      </div>
    );
  }

  // Logo-klick navigerar hem UTAN utloggning — sessionscookien består så
  // kunden återkommer rakt in i chatten (sessionsåterkomst, §2 i beslutet).
  return <StudioChat hem={() => setSection("hem")} />;
}
