"use client";

import React from "react";

/**
 * A styled, non-interactive mock of the real UnBind analysis UI — rendered from
 * live components (not a screenshot) in the Linear-marketing idiom: a surface-1
 * charcoal panel with a hairline border, a faux app chrome bar, and a
 * clause-analysis result laid out the way the product actually presents it.
 *
 * Colors are pulled from the Linear tokens in globals.css. The lavender accent
 * (--ln-primary) is used only for the brand mark and the active nav pill; risk
 * severity is the one place semantic color is allowed, matching the product.
 */

const RISK_STYLES: Record<string, { label: string; bg: string; fg: string; ring: string }> = {
  High: { label: "High risk", bg: "rgba(239,68,68,0.12)", fg: "#f87171", ring: "rgba(239,68,68,0.35)" },
  Medium: { label: "Medium risk", bg: "rgba(245,158,11,0.12)", fg: "#fbbf24", ring: "rgba(245,158,11,0.35)" },
  Low: { label: "Low risk", bg: "rgba(39,166,68,0.14)", fg: "#4ade80", ring: "rgba(39,166,68,0.35)" },
};

function RiskBadge({ level }: { level: keyof typeof RISK_STYLES }) {
  const s = RISK_STYLES[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{ background: s.bg, color: s.fg, boxShadow: `inset 0 0 0 1px ${s.ring}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
      {s.label}
    </span>
  );
}

const CLAUSES = [
  {
    n: 3,
    title: "Late Payment Penalty",
    level: "High" as const,
    quote:
      "Late payments shall incur a fee of $200 per day, compounding daily, with no cap.",
    plain:
      "You'd be charged $200 for every late day, and that fee grows on itself — with no ceiling.",
    active: true,
  },
  {
    n: 4,
    title: "Security Deposit",
    level: "Medium" as const,
    quote:
      "Landlord may retain the deposit at sole discretion, without itemization.",
    plain: "The landlord can keep your deposit without explaining why.",
    active: false,
  },
  {
    n: 8,
    title: "Governing Law",
    level: "Low" as const,
    quote: "This lease shall be governed by the laws of the state.",
    plain: "Standard clause. Nothing unusual here.",
    active: false,
  },
];

export default function HeroProductMockup() {
  return (
    <div
      className="shimmer w-full overflow-hidden rounded-[16px] text-left"
      style={{
        background: "var(--ln-surface-1)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 80px -24px rgba(0,0,0,0.75), 0 0 0 1px var(--ln-hairline)",
      }}
    >
      {/* ── App chrome bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--ln-hairline)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: "#3e3e44" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#3e3e44" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#3e3e44" }} />
        </div>
        <div
          className="ml-2 flex-1 truncate rounded-md px-3 py-1 text-[12px]"
          style={{ background: "var(--ln-canvas)", color: "var(--ln-ink-subtle)" }}
        >
          unbindai.app / analysis
        </div>
      </div>

      <div className="flex">
        {/* ── Left rail: document summary ── */}
        <aside
          className="hidden w-[220px] shrink-0 flex-col gap-4 p-4 sm:flex"
          style={{ borderRight: "1px solid var(--ln-hairline)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="grid h-6 w-6 place-items-center rounded-md text-[13px] font-bold"
              style={{ background: "var(--ln-primary)", color: "#fff" }}
            >
              U
            </span>
            <span className="text-[13px] font-semibold" style={{ color: "var(--ln-ink)" }}>
              lease-agreement.pdf
            </span>
          </div>

          {/* Overall risk score */}
          <div
            className="rounded-lg p-3"
            style={{ background: "var(--ln-surface-2)", border: "1px solid var(--ln-hairline)" }}
          >
            <div className="text-[11px]" style={{ color: "var(--ln-ink-subtle)" }}>
              Overall risk
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[26px] font-semibold leading-none" style={{ color: "#f87171" }}>
                7.2
              </span>
              <span className="text-[13px]" style={{ color: "var(--ln-ink-tertiary)" }}>
                / 10
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--ln-canvas)" }}>
              <div className="h-full rounded-full" style={{ width: "72%", background: "linear-gradient(90deg,#fbbf24,#f87171)" }} />
            </div>
          </div>

          {/* Meta rows */}
          <div className="flex flex-col gap-2 text-[12px]">
            {[
              ["Clauses", "12"],
              ["Flagged", "5"],
              ["Key dates", "3"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span style={{ color: "var(--ln-ink-subtle)" }}>{k}</span>
                <span style={{ color: "var(--ln-ink-muted)" }}>{v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main: clause list ── */}
        <main className="min-w-0 flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold" style={{ color: "var(--ln-ink)" }}>
              Clause analysis
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px]"
              style={{ background: "var(--ln-surface-2)", color: "var(--ln-ink-muted)" }}
            >
              Analysed as Tenant
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {CLAUSES.map((c) => (
              <div
                key={c.n}
                className="rounded-lg p-3"
                style={{
                  background: c.active ? "var(--ln-surface-2)" : "var(--ln-surface-1)",
                  border: `1px solid ${c.active ? "var(--ln-hairline-strong)" : "var(--ln-hairline)"}`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="grid h-5 w-5 shrink-0 place-items-center rounded text-[11px] font-semibold"
                      style={{ background: "var(--ln-canvas)", color: "var(--ln-ink-subtle)" }}
                    >
                      {c.n}
                    </span>
                    <span className="truncate text-[13px] font-medium" style={{ color: "var(--ln-ink)" }}>
                      {c.title}
                    </span>
                  </div>
                  <RiskBadge level={c.level} />
                </div>

                {c.active && (
                  <>
                    <p
                      className="mt-2.5 border-l-2 pl-2.5 text-[12px] italic leading-relaxed"
                      style={{ borderColor: "var(--ln-hairline-strong)", color: "var(--ln-ink-subtle)" }}
                    >
                      “{c.quote}”
                    </p>
                    <p className="mt-2.5 text-[12.5px] leading-relaxed" style={{ color: "var(--ln-ink-muted)" }}>
                      {c.plain}
                    </p>
                    <div
                      className="mt-2.5 rounded-md p-2.5"
                      style={{ background: "var(--ln-canvas)", border: "1px solid var(--ln-hairline)" }}
                    >
                      <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--ln-primary-hover)" }}>
                        Suggested rewrite
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: "var(--ln-ink-muted)" }}>
                        Late payments incur a one-time fee of $50, capped at one month&apos;s rent.
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
