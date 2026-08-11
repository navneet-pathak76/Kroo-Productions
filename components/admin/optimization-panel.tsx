"use client";

import { useState } from "react";
import type { OptimizationAnalysis } from "@/lib/ai-optimization/types";

export function OptimizationPanel() {
  const [analysis, setAnalysis] = useState<OptimizationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/optimize", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Analysis failed.");
        return;
      }
      setAnalysis(data.analysis);
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
          AI Optimization
        </h2>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm hover:bg-primary/20 disabled:opacity-60"
        >
          {loading ? "Analyzing…" : "Run Analysis"}
        </button>
      </div>

      <p className="text-xs text-white/45">
        Recommendations require admin review before any production changes. AI analysis runs only when OPENAI_API_KEY is configured.
      </p>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {analysis ? (
        <div className="space-y-4">
          <div className="cinema-panel rounded-xl p-4 text-sm">
            <p className="text-xs uppercase tracking-wider text-white/45">Summary</p>
            <p className="mt-2">{analysis.summary}</p>
            <p className="mt-2 text-xs text-white/45">
              AI available: {analysis.aiAvailable ? "Yes" : "No (rule-based only)"}
            </p>
          </div>

          {analysis.recommendations.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/50">
              No recommendations — either no issues detected or no telemetry data yet.
            </p>
          ) : (
            analysis.recommendations.map((rec) => (
              <div key={rec.id} className="cinema-panel rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase">{rec.severity}</span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs uppercase text-primary">{rec.category}</span>
                  {rec.aiGenerated ? (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/45">AI</span>
                  ) : null}
                </div>
                <h3 className="mt-2 font-semibold">{rec.title}</h3>
                <p className="mt-1 text-sm text-white/70">{rec.description}</p>
                {rec.suggestedActions.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/60">
                    {rec.suggestedActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
