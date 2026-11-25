"use client";
import { useEffect, useState } from "react";

const CLAIMS: { text: string; verdict: "SUPPORTED" | "REFUTED" | "UNCLEAR"; tone: "ok" | "bad" | "warn" }[] = [
  { text: "The page says Studio Next uses chain ID 61997.", verdict: "SUPPORTED", tone: "ok" },
  { text: "The report says revenue doubled every quarter.", verdict: "REFUTED", tone: "bad" },
  { text: "The article says the study had 1,200 participants.", verdict: "UNCLEAR", tone: "warn" },
];

/**
 * The hero animation, and the whole product in ten seconds: a claim is typed, sources orbit it,
 * a beam reads it, and a verdict is stamped. Then the next claim.
 */
export function ClaimScanner() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<"typing" | "scanning" | "verdict">("typing");
  const claim = CLAIMS[index];

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setTyped(claim.text.length); setPhase("verdict"); return; }
    let timer: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      timer = setTimeout(() => (typed < claim.text.length ? setTyped(typed + 1) : setPhase("scanning")), typed < claim.text.length ? 32 : 250);
    } else if (phase === "scanning") {
      timer = setTimeout(() => setPhase("verdict"), 2600);
    } else {
      timer = setTimeout(() => { setIndex((index + 1) % CLAIMS.length); setTyped(0); setPhase("typing"); }, 2800);
    }
    return () => clearTimeout(timer);
  }, [phase, typed, index, claim.text.length]);

  const SOURCES = [
    { a: 0, name: "source A" }, { a: 120, name: "source B" }, { a: 240, name: "source C" },
  ];

  return (
    <div className="scanner" aria-label="A claim being read against sources and given a verdict">
      <div className="glow" />
      <svg className="rings" viewBox="0 0 400 400" fill="none" aria-hidden>
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b5cff" /><stop offset="1" stopColor="#3be3ff" />
          </linearGradient>
        </defs>
        <circle className="ring-a" cx="200" cy="200" r="190" stroke="url(#rg)" strokeOpacity=".5" strokeWidth="1" strokeDasharray="3 9" />
        <circle className="ring-b" cx="200" cy="200" r="150" stroke="url(#rg)" strokeOpacity=".7" strokeWidth="1.2" strokeDasharray="60 22 6 22" />
        <circle className="ring-c" cx="200" cy="200" r="112" stroke="#8b5cff" strokeOpacity=".35" strokeWidth="1" />
      </svg>

      <div className="orbit" style={{ inset: "5%" }}>
        {SOURCES.map((s) => (
          <div key={s.name} style={{ position: "absolute", inset: 0, transform: `rotate(${s.a}deg)` }}>
            <div className="src"><span><i className="dot" />{s.name}</span></div>
          </div>
        ))}
      </div>
      <div className="orbit slow" style={{ inset: "20%" }}>
        {[60, 240].map((a) => (
          <div key={a} style={{ position: "absolute", inset: 0, transform: `rotate(${a}deg)` }}>
            <div className="src" style={{ fontSize: 10 }}><span><i className="dot" style={{ background: "#8b5cff" }} />validator</span></div>
          </div>
        ))}
      </div>

      <div className="claim-card">
        {phase === "scanning" && <div className="beam" />}
        <div className="label" style={{ marginBottom: 10 }}>claim {index + 1} of {CLAIMS.length}</div>
        <div style={{ fontSize: 16, lineHeight: 1.45, minHeight: 70, fontWeight: 500 }}>
          {claim.text.slice(0, typed)}
          {phase !== "verdict" && <span className="cursor" />}
        </div>
        <div className="label" style={{ marginTop: 8 }}>
          {phase === "typing" ? "claim registered" : phase === "scanning" ? "validators reading the sources..." : "validators agree"}
        </div>
        {phase === "verdict" && <span key={claim.verdict} className={`verdict ${claim.tone}`}>{claim.verdict}</span>}
      </div>
    </div>
  );
}
