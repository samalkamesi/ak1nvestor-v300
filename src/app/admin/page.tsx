"use client";
import * as React from "react";
import { useAk1aStore } from "@/lib/ak1a-store";
import { Ak1aLogo } from "@/components/ak1a/primitives";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, FileText, Brain, Lock } from "lucide-react";

export default function AdminPage() {
  const { setSection } = useAk1aStore();
  const [authed, setAuthed] = React.useState(false);
  const [password, setPassword] = React.useState("");

  if (!authed) {
    return (
      <div className="paper-texture min-h-screen flex items-center justify-center px-4">
        <Card className="p-6 max-w-sm w-full border-gold/30">
          <Ak1aLogo size="md" onClick={() => setSection("hem")} />
          <div className="mt-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-gold" />
            <h1 className="font-serif text-xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Endast för AK1A-administratörer.</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Lösenord" className="mt-4 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
            onKeyDown={(e) => { if (e.key === "Enter" && password) setAuthed(true); }} />
          <Button className="mt-3 w-full bg-gold text-background hover:bg-gold/90" onClick={() => password && setAuthed(true)}>Logga in</Button>
          <Button variant="ghost" className="mt-2 w-full text-xs" onClick={() => setSection("hem")}>Tillbaka</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="paper-texture min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between">
          <Ak1aLogo size="md" onClick={() => setSection("hem")} />
          <Badge className="bg-gold text-background">ADMIN</Badge>
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold">Admin Dashboard</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4"><Database className="h-5 w-5 text-gold" /><p className="mt-2 font-serif text-2xl font-bold">225</p><p className="text-[10px] uppercase text-muted-foreground">Djupa kurser</p></Card>
          <Card className="p-4"><FileText className="h-5 w-5 text-gold" /><p className="mt-2 font-serif text-2xl font-bold">198+</p><p className="text-[10px] uppercase text-muted-foreground">Fallstudier</p></Card>
          <Card className="p-4"><Database className="h-5 w-5 text-gold" /><p className="mt-2 font-serif text-2xl font-bold">190+</p><p className="text-[10px] uppercase text-muted-foreground">Kombinationer</p></Card>
          <Card className="p-4"><Brain className="h-5 w-5 text-gold" /><p className="mt-2 font-serif text-2xl font-bold">22</p><p className="text-[10px] uppercase text-muted-foreground">Mötesprotokoll</p></Card>
        </div>
        <Button variant="outline" className="mt-6" onClick={() => setSection("hem")}>Till huvudsidan</Button>
      </div>
    </div>
  );
}
