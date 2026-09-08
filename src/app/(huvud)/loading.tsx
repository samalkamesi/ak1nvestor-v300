export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Laddar AK1A Research Lab…</p>
      </div>
    </div>
  );
}
