"use client";

import { useEffect } from "react";

const AGENT_DEBUG = process.env.NEXT_PUBLIC_AGENT_DEBUG === "1";
const INGEST = "http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373";

function log(p: { location: string; message: string; data?: Record<string, unknown>; hypothesisId?: string }) {
  if (!AGENT_DEBUG) return;
  fetch(INGEST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...p,
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
    }),
  }).catch(() => {});
}

export function ClientCSSCheck() {
  useEffect(() => {
    if (!AGENT_DEBUG) return;
    // #region agent log
    const sheets = typeof document !== "undefined" ? document.styleSheets : [];
    const hrefs: string[] = [];
    try {
      for (let i = 0; i < sheets.length; i++) {
        const h = (sheets[i] as CSSStyleSheet).href;
        if (h) hrefs.push(h);
      }
    } catch (_) {}
    const layoutCSSFound = hrefs.some((h) => h.includes("layout.css"));
    const body = typeof document !== "undefined" ? document.body : null;
    const bodyStyle = body ? getComputedStyle(body) : null;
    const main = typeof document !== "undefined" ? document.querySelector("main") : null;
    const mainStyle = main ? getComputedStyle(main) : null;
    const firstA = typeof document !== "undefined" ? document.querySelector("a") : null;
    const aColor = firstA ? getComputedStyle(firstA).color : "n/a";
    log({
      location: "AgentDebug.tsx:ClientCSSCheck",
      message: "CSS and Tailwind check",
      data: {
        stylesheetCount: sheets.length,
        layoutCSSFound,
        bodyBg: bodyStyle?.backgroundColor ?? "n/a",
        bodyColor: bodyStyle?.color ?? "n/a",
        bodyDisplay: bodyStyle?.display ?? "n/a",
        bodyVisibility: bodyStyle?.visibility ?? "n/a",
        mainMaxWidth: mainStyle?.maxWidth ?? "no-main",
        mainDisplay: mainStyle?.display ?? "n/a",
        hasInclusionsText: typeof document !== "undefined" && !!document.body?.innerText?.includes("INCLUSIONS"),
        firstLinkColor: aColor,
      },
      hypothesisId: "H1,H2,H5",
    });
    // #endregion
  }, []);
  return null;
}

export function ClientHeroLog() {
  useEffect(() => {
    if (!AGENT_DEBUG) return;
    // #region agent log
    log({
      location: "AgentDebug.tsx:ClientHeroLog",
      message: "Hero overlay mounted",
      data: {},
      hypothesisId: "H3",
    });
    // #endregion
  }, []);
  return null;
}
