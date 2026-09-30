import * as React from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUp, ChevronDown, PanelLeft, Paperclip, Plus } from "lucide-react";

import {
  ZCODE_MATT,
  zcodeAllaCssVariabler,
} from "./zcode-tema";

/**
 * ZCODE-LAYOUT — komponentskal som matchar ZCode Desktop 3.14.3:s mörka
 * komposition, byggd på de exakta tokensen i zcode-tema.ts (källa:
 * app.asar → styles-C8Nayk5k.css `.theme-zai-dark`).
 *
 * Komposition (ZCode Desktop):
 *   ┌──────┬──────────────────────────────────┐
 *   │sidol.│ topprad (modell-indikator)       │  w-64 = 256 px
 *   │ 256px├──────────────────────────────────┤  topprad h-10 = 40 px
 *   │sess. │ chatt-yta (scroll, centrerad     │
 *   │lista │ kolonn ≤ 768 px, användarbubblor │
 *   │      │ bg-input, agent ren text)        │
 *   │      ├──────────────────────────────────┤
 *   │      │ input-rad: rundad bg-input +     │
 *   │      │ skicka-knapp (vit, upp-pil)      │
 *   └──────┴──────────────────────────────────┘
 *
 * Ren presentationskod — inga hämtningar, inget state (utom keyof-rena
 * detaljer): studio-chatten kan adoptera komponenterna stegvis och behålla
 * sin egen motor. Klasser följer ZCode:s egna mönster ur bunten:
 * composern = "rounded-xl border-input-border bg-input text-ui-base
 * leading-6 whitespace-pre-wrap", ghost-knappar = "hover:bg-[var(--zk-hover)]".
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── Rot ─────────────────────────────────────────────────────────────────────

/** Rotelement: sätter alla --zk-*-variabler + typsnitt och basfärger. */
export function ZcodeTemaRot({
  children,
  klass,
  stil,
}: {
  children: ReactNode;
  klass?: string;
  stil?: CSSProperties;
}) {
  return (
    <div
      className={klass}
      style={{
        ...zcodeAllaCssVariabler,
        fontFamily: "var(--zk-font-sans)",
        color: "var(--zk-foreground)",
        background: "var(--zk-background)",
        ...stil,
      }}
    >
      {children}
    </div>
  );
}

// ── Skal ────────────────────────────────────────────────────────────────────

/** Hela appytan: sidolist + huvudkolumn, 100 dvh, ZCode-gråskalan. */
export function ZcodeSkal({
  sidolist,
  children,
}: {
  sidolist?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[var(--zk-background)] text-[var(--zk-foreground)]">
      {sidolist}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

// ── Sidolist (sessioner) ────────────────────────────────────────────────────

export type ZcodeSessionPost = {
  id: string;
  titel: string;
  aktiv?: boolean;
};

/**
 * Smal vänster-sidolist (256 px) med sessionslista — ZCode:s w-64-mönster.
 * Mobil: dold (ZCode fäller ihop); visa via open=true.
 */
export function ZcodeSidolist({
  sessioner,
  aktivSessionId,
  onValj,
  onNySession,
  open = true,
  fotnot,
}: {
  sessioner: readonly ZcodeSessionPost[];
  aktivSessionId?: string;
  onValj?: (id: string) => void;
  onNySession?: () => void;
  open?: boolean;
  fotnot?: ReactNode;
}) {
  if (!open) return null;
  return (
    <aside
      className="hidden w-64 shrink-0 flex-col border-r border-[var(--zk-border)] bg-[var(--zk-sidebar)] md:flex"
      style={{ width: ZCODE_MATT.sidolistBreddPx }}
      aria-label="Sessioner"
    >
      <div
        className="flex items-center gap-1 border-b border-[var(--zk-border)] px-2"
        style={{ height: ZCODE_MATT.toppradHojdPx }}
      >
        <button
          type="button"
          onClick={onNySession}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--zk-foreground-subtle)] transition-colors hover:bg-[var(--zk-hover)] hover:text-[var(--zk-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zk-input-border-focused)]"
          aria-label="Ny session"
        >
          <Plus className="size-4" />
        </button>
        <span className="px-1 text-[length:var(--zk-text-ui-sm)] font-medium text-[var(--zk-foreground-subtle)]">
          Sessioner
        </span>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-color:var(--zk-border)_transparent]">
        <ul className="flex flex-col gap-0.5">
          {sessioner.map((s) => {
            const aktiv = s.id === aktivSessionId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onValj?.(s.id)}
                  className={`w-full truncate rounded-lg px-2 py-1.5 text-left text-[length:var(--zk-text-ui-sm)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zk-input-border-focused)] ${
                    aktiv
                      ? "bg-[var(--zk-selected)] text-[var(--zk-foreground)]"
                      : "text-[var(--zk-foreground)] hover:bg-[var(--zk-hover)]"
                  }`}
                  aria-current={aktiv ? "true" : undefined}
                >
                  {s.titel}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {fotnot ? (
        <div className="border-t border-[var(--zk-border)] p-2 text-[length:var(--zk-text-ui-xs)] text-[var(--zk-foreground-subtlest)]">
          {fotnot}
        </div>
      ) : null}
    </aside>
  );
}

// ── Topprad (modell-indikator) ──────────────────────────────────────────────

/** Modell-indikator — ZCode:s ghost-chip med chevron (composer-trigger). */
export function ZcodeModellIndikator({
  modell,
  onKlick,
  merker,
}: {
  modell: string;
  onKlick?: () => void;
  merker?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onKlick}
      className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[length:var(--zk-text-ui-sm)] font-medium text-[var(--zk-foreground-subtle)] transition-colors hover:bg-[var(--zk-hover)] hover:text-[var(--zk-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zk-input-border-focused)]"
      aria-haspopup="listbox"
    >
      <span className="max-w-64 truncate">{modell}</span>
      <ChevronDown className="size-3.5 shrink-0 text-[var(--zk-foreground-subtlest)]" />
      {merker}
    </button>
  );
}

/**
 * Topprad över chattytan (h-10, bg-header #202020): modell-indikator i
 * centrum-vänster, valfria höger-fläningar. `visaSidolistKnapp` för mobil.
 */
export function ZcodeTopprad({
  modell,
  onModellKlick,
  hoger,
  visaSidolistKnapp,
  onVisaSidolist,
}: {
  modell: string;
  onModellKlick?: () => void;
  hoger?: ReactNode;
  visaSidolistKnapp?: boolean;
  onVisaSidolist?: () => void;
}) {
  return (
    <header
      className="flex shrink-0 items-center gap-2 border-b border-[var(--zk-border)] bg-[var(--zk-header)] px-2"
      style={{ height: ZCODE_MATT.toppradHojdPx }}
    >
      {visaSidolistKnapp ? (
        <button
          type="button"
          onClick={onVisaSidolist}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--zk-foreground-subtle)] transition-colors hover:bg-[var(--zk-hover)] hover:text-[var(--zk-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zk-input-border-focused)] md:hidden"
          aria-label="Visa sessioner"
        >
          <PanelLeft className="size-4" />
        </button>
      ) : null}
      <ZcodeModellIndikator modell={modell} onKlick={onModellKlick} />
      <div className="ml-auto flex items-center gap-1">{hoger}</div>
    </header>
  );
}

// ── Chatt-yta ───────────────────────────────────────────────────────────────

/** Scrollbar Chatt-yta: centrerad kolonn ≤ 768 px (max-w-3xl-mönstret). */
export function ZcodeChattYta({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--zk-border)_transparent]">
      <div
        className="mx-auto flex w-full flex-col gap-6 px-4 py-6"
        style={{ maxWidth: ZCODE_MATT.chattKolumnMaxPx }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Meddelanden ─────────────────────────────────────────────────────────────

/**
 * Användarens bubbel — ZCode-transkriptets prompt-block: rundad bg-input
 * (#2b2b2b), border #ffffff1a, leading-6, whitespace-pre-wrap.
 */
export function ZcodeAnvandarBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="w-fit max-w-[85%] rounded-xl border border-[var(--zk-input-border)] bg-[var(--zk-input)] px-3 py-2 text-[length:var(--zk-text-ui-base)] leading-6 whitespace-pre-wrap break-words text-[var(--zk-foreground)]">
        {children}
      </div>
    </div>
  );
}

/** Agentens meddelande — ren text på bakgrunden, ingen bubbel (ZCode-stil). */
export function ZcodeAgentMeddelande({ children }: { children: ReactNode }) {
  return (
    <div className="text-[length:var(--zk-text-ui-base)] leading-6 whitespace-pre-wrap break-words text-[var(--zk-foreground)]">
      {children}
    </div>
  );
}

/**
 * Verktygskort — agentens verktygsanrop: panel-yta #202020, mono-titel med
 * trajektory-färg (tool-call #f59e0b), status-text i subtle.
 */
export function ZcodeVerktygskort({
  titel,
  status,
  barn,
}: {
  titel: string;
  status?: string;
  barn?: ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-[var(--zk-border)] bg-[var(--zk-panel)]">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zk-input-border-focused)]">
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: "var(--zk-trajectory-tool-call)" }}
          aria-hidden
        />
        <span className="min-w-0 truncate font-[family-name:var(--zk-font-mono)] text-[length:var(--zk-text-ui-xs)] text-[var(--zk-foreground)]">
          {titel}
        </span>
        {status ? (
          <span className="ml-auto shrink-0 text-[length:var(--zk-text-ui-xs)] text-[var(--zk-foreground-subtle)]">
            {status}
          </span>
        ) : null}
      </summary>
      {barn ? (
        <div className="border-t border-[var(--zk-border)] px-3 py-2 font-[family-name:var(--zk-font-mono)] text-[length:var(--zk-text-ui-xs)] leading-5 whitespace-pre-wrap text-[var(--zk-foreground-subtle)]">
          {barn}
        </div>
      ) : null}
    </details>
  );
}

/** Resonemangsrad (reasoning) — ZCode:s lila toning #a78bfa. */
export function ZcodeTankarad({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-[length:var(--zk-text-ui-sm)] leading-5 text-[var(--zk-foreground-subtle)]">
      <span
        className="mt-1.5 size-1.5 shrink-0 rounded-full"
        style={{ background: "var(--zk-trajectory-reasoning)" }}
        aria-hidden
      />
      <div className="min-w-0 whitespace-pre-wrap">{children}</div>
    </div>
  );
}

// ── Input-rad (composer) ────────────────────────────────────────────────────

/**
 * Fast input-rad i nederkant — ZCode:s composer: rundad xl-yta bg-input
 * #2b2b2b med border #ffffff1a, textarea i text-ui-base/leading-6, vänster
 * gem-knapp, skicka-knapp till höger (vit #fff med svart pil — ZCode:s
 * primär-knapp), avaktiverad = genomskinlig yta med subtle-pil.
 */
export function ZcodeInputRad({
  varde,
  onAndring,
  onSkicka,
  platshallare = "Skicka ett meddelande…",
  aktiv,
  upptagen,
  vänster,
  fotsrad,
}: {
  varde: string;
  onAndring?: (nyttVarde: string) => void;
  onSkicka?: () => void;
  platshallare?: string;
  /** Sändbart läge (icke-tom text) — styr den vita skicka-knappen. */
  aktiv?: boolean;
  /** Agenten arbetar — visa stopp-states via fotsrad istället för skicka. */
  upptagen?: boolean;
  vänster?: ReactNode;
  fotsrad?: ReactNode;
}) {
  return (
    <div className="shrink-0 bg-[var(--zk-background)] px-4 pb-4 pt-2">
      <div
        className="mx-auto w-full"
        style={{ maxWidth: ZCODE_MATT.chattKolumnMaxPx }}
      >
        <div className="flex items-end gap-1 rounded-xl border border-[var(--zk-input-border)] bg-[var(--zk-input)] px-2 py-1.5 transition-colors focus-within:border-[var(--zk-input-border-focused)]">
          {vänster ?? (
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--zk-foreground-subtle)] transition-colors hover:bg-[var(--zk-hover)] hover:text-[var(--zk-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zk-input-border-focused)]"
              aria-label="Bifoga fil"
            >
              <Paperclip className="size-4" />
            </button>
          )}
          <textarea
            value={varde}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onAndring?.(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (aktiv && !upptagen) onSkicka?.();
              }
            }}
            placeholder={platshallare}
            rows={1}
            className="max-h-60 min-h-6 w-full resize-none bg-transparent py-1 text-[length:var(--zk-text-ui-base)] leading-6 text-[var(--zk-foreground)] outline-none placeholder:text-[var(--zk-foreground-subtlest)]"
            style={{ maxHeight: ZCODE_MATT.inputMaxHojdPx }}
            aria-label="Meddelande"
          />
          <button
            type="button"
            onClick={() => {
              if (aktiv && !upptagen) onSkicka?.();
            }}
            disabled={!aktiv || upptagen}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zk-input-border-focused)] ${
              aktiv && !upptagen
                ? "bg-[var(--zk-primary)] text-[var(--zk-primary-foreground)] hover:bg-[var(--zk-brand)]"
                : "text-[var(--zk-foreground-subtlest)] hover:bg-[var(--zk-hover)]"
            }`}
            aria-label="Skicka"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
        {fotsrad ? (
          <div className="mt-1 flex items-center justify-between px-1 text-[length:var(--zk-text-ui-2xs)] text-[var(--zk-foreground-subtlest)]">
            {fotsrad}
          </div>
        ) : null}
      </div>
    </div>
  );
}
