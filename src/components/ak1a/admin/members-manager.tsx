"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { adminHeaders, adminJsonHeaders } from "@/lib/admin-klient";

type Member = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  member_type: string;
  created_at: string;
  last_login_at: string | null;
  portfolioCount: number;
  pendingCount: number;
  completedCount: number;
};

const TIER_STYLE: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  premium: "bg-gold/20 text-gold",
  pro: "bg-gold text-primary-foreground",
};

/** Admin-flik: Medlemmar — lista, sök, filtrera, ändra nivå (free/premium/pro). */
export function MembersManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch("/api/admin/members", { headers: adminHeaders() });
      const data = await res.json();
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/members", { headers: adminHeaders() });
        const data = await res.json();
        if (!cancelled) setMembers(data.members || []);
      } catch {
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return members.filter((m) => {
      if (tierFilter !== "all" && m.member_type !== tierFilter) return false;
      if (!q) return true;
      return (
        m.email.toLowerCase().includes(q) ||
        (m.name || "").toLowerCase().includes(q)
      );
    });
  }, [members, query, tierFilter]);

  const setTier = async (id: string, memberType: string) => {
    setBusyId(id);
    try {
      await fetch("/api/admin/members", {
        method: "PATCH",
        headers: adminJsonHeaders(),
        body: JSON.stringify({ id, memberType }),
      });
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, member_type: memberType } : m))
      );
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => ({
    alla: members.length,
    free: members.filter((m) => m.member_type === "free").length,
    premium: members.filter((m) => m.member_type === "premium").length,
    pro: members.filter((m) => m.member_type === "pro").length,
  }), [members]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif text-lg font-bold">Medlemmar</h3>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök e-post eller namn…"
            className="h-8 w-52 text-xs"
          />
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla nivåer ({counts.alla})</SelectItem>
              <SelectItem value="free">Free ({counts.free})</SelectItem>
              <SelectItem value="premium">Premium ({counts.premium})</SelectItem>
              <SelectItem value="pro">Pro ({counts.pro})</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => load(true)}>
            <RefreshCw className="mr-1 h-3 w-3" /> Ladda om
          </Button>
        </div>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {loading ? "Hämtar medlemmar…" : `${filtered.length} av ${members.length} medlemmar`}
      </p>

      <ScrollArea className="mt-4 h-[460px]">
        <div className="space-y-1.5 pr-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-gold/20 bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TIER_STYLE[m.member_type] || TIER_STYLE.free}`}>
                    {m.member_type}
                  </span>
                  <span className="truncate text-sm font-medium">{m.name || m.email}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""} · sedan{" "}
                  {new Date(m.created_at).toLocaleDateString("sv-SE")}
                  {m.last_login_at
                    ? ` · senaste inloggning ${new Date(m.last_login_at).toLocaleDateString("sv-SE")}`
                    : ""}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {m.portfolioCount} portfölj{m.portfolioCount === 1 ? "" : "er"}
                {m.pendingCount > 0 ? ` (${m.pendingCount} väntar)` : ""}
              </div>
              <Select
                value={m.member_type}
                onValueChange={(v) => setTier(m.id, v)}
                disabled={busyId === m.id}
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Inga medlemmar matchar.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
