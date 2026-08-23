"use client";

import { StockAnalysisView } from "@/components/ak1a/stock-analysis-view";
import { useAk1aStore } from "@/lib/ak1a-store";

/**
 * PREC-ANALYS — the flagship deep analysis for Precise Biometrics (PREC.ST).
 *
 * Now uses the unified StockAnalysisView component — the SAME data-driven,
 * sectioned view that ALL analyses use. This creates harmony: every analysis
 * looks and reads the same way, regardless of company.
 *
 * The data lives in data/analyses/PREC-ST.json and is served via
 * /api/analysis/PREC.ST.
 */
export function PrecSection() {
  const { setSection } = useAk1aStore();

  return (
    <StockAnalysisView
      ticker="PREC.ST"
      onBack={() => setSection("analyser")}
    />
  );
}
