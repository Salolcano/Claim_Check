"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Notice, SectionHead } from "@/components/ui";
import { TxButton } from "@/components/tx-button";
import { useWallet } from "@/components/wallet-provider";
import { calls, reads, type Call, type Definition } from "@/lib/genlayer/contract";

type Req = { text: string; rule: string; mandatory: boolean };
const blank = (): Req => ({ text: "", rule: "", mandatory: true });

export default function NewClaimcheck() {
  const router = useRouter();
  const { address } = useWallet();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [author, setAuthor] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reqs, setReqs] = useState<Req[]>([{ text: "", rule: "", mandatory: true }]);
  const [minSources, setMinSources] = useState(1);
  const [minPublishers, setMinPublishers] = useState(1);
  const [partialPct, setPartialPct] = useState(0);
  const [problem, setProblem] = useState("");

  const patch = (i: number, p: Partial<Req>) => setReqs(reqs.map((r, j) => (j === i ? { ...r, ...p } : r)));

  const build = (): Call | null => {
    const addr = /^0x[0-9a-fA-F]{40}$/;
    const fail = (m: string) => { setProblem(m); return null; };
    if (!title.trim() || !subject.trim()) return fail("Give the claimcheck a title and a subject.");
    if (!reqs.every((r) => r.text.trim())) return fail("Every requirement needs text.");
    if (!reqs.some((r) => r.mandatory)) return fail("At least one claim must be a core claim.");
    const ts = Math.floor(new Date(deadline).getTime() / 1000);
    if (!deadline || !Number.isFinite(ts) || ts <= Date.now() / 1000 + 120) return fail("Pick a deadline in the future.");
    if (author.trim() && !addr.test(author.trim())) return fail("The author is not a valid address.");
    if (minPublishers > minSources) return fail("Independent publishers cannot exceed required sources.");
    setProblem("");
    const definition: Definition = {
      requirements: reqs.map((r, i) => ({ id: `R${i + 1}`, text: r.text.trim(), rule: r.rule.trim(), mandatory: r.mandatory })),
      evidence_policy: { min_sources: minSources, min_publishers: minPublishers },
      payout: { partial_bps: Math.round(partialPct * 100) },
    };
    return calls.create(title.trim(), subject.trim(), author.trim(), ts, definition);
  };

  const onDone = async () => {
    const page = await reads.claimchecks(0, 10);
    const mine = page.items.find((p) => p.requester.toLowerCase() === (address ?? "").toLowerCase());
    router.push(mine ? `/claimchecks/${mine.id}` : "/claimchecks");
  };

  return (
    <div className="wrap" style={{ paddingTop: 72, maxWidth: 860 }}>
      <SectionHead n="new claimcheck" title="list the" accent="claims." />
      <div style={{ display: "grid", gap: 20 }}>
        <label><div className="label">Title</div><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Acme website claimcheck" maxLength={120} /></label>
        <label><div className="label">Subject</div><input className="field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Acme Research, Q3 2026 market report" maxLength={400} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          <label><div className="label">author (optional, defaults to you)</div><input className="field mono" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="0x..." /></label>
          <label><div className="label">Evidence deadline</div><input className="field" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></label>
        </div>

        <div className="label" style={{ marginTop: 16 }}>Claims (1 to 6)</div>
        {reqs.map((r, i) => (
          <div key={i} className="card card-pad" style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="num">R{i + 1}</span>
              <label className="label" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={r.mandatory} onChange={(e) => patch(i, { mandatory: e.target.checked })} /> core claim
              </label>
            </div>
            <input className="field" placeholder="The report says the market grew 12% year on year" value={r.text} onChange={(e) => patch(i, { text: e.target.value })} maxLength={400} />
            <input className="field" placeholder="How to decide it (optional)" value={r.rule} onChange={(e) => patch(i, { rule: e.target.value })} maxLength={400} />
            {reqs.length > 1 && <button className="btn ghost sm" style={{ justifySelf: "start" }} onClick={() => setReqs(reqs.filter((_, j) => j !== i))}>Remove</button>}
          </div>
        ))}
        {reqs.length < 6 && <button className="btn ghost sm" style={{ justifySelf: "start" }} onClick={() => setReqs([...reqs, blank()])}>Add claim</button>}

        <button className="btn ghost sm" style={{ justifySelf: "start" }} onClick={() => setReqs([
          { text: "The report says the market grew 12% year on year", rule: "Look for a growth figure for the full year and its comparison period", mandatory: true },
          { text: "The report names its data source", rule: "Look for a named dataset, survey or provider", mandatory: true },
          { text: "The report states its sample size", rule: "", mandatory: false },
        ])}>Use a sample set of claims</button>

        <div className="label" style={{ marginTop: 16 }}>Evidence policy</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          <label><div className="label">Sources per core claim</div>
            <select className="field" value={minSources} onChange={(e) => setMinSources(Number(e.target.value))}>{[1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></label>
          <label><div className="label">Independent publishers needed</div>
            <select className="field" value={minPublishers} onChange={(e) => setMinPublishers(Number(e.target.value))}>{[1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select></label>
        </div>

        <div className="label" style={{ marginTop: 16 }}>Accuracy reward (optional; the requester funds it after creating)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          <label><div className="label">Share paid to the author if only the core claims check out (%)</div><input className="field" type="number" min={0} max={100} value={partialPct} onChange={(e) => setPartialPct(Number(e.target.value))} /></label>
        </div>

        {problem && <Notice tone="bad">{problem}</Notice>}
        <div><TxButton call={build} onDone={onDone}>Create draft</TxButton></div>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Creating a draft changes nothing yet. You fund the reward, then freeze the claims, on the next page.</p>
      </div>
    </div>
  );
}
