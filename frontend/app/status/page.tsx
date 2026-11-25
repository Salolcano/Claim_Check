"use client";
import { useCallback, useEffect, useState } from "react";

import { Notice, SectionHead } from "@/components/ui";
import { useWallet } from "@/components/wallet-provider";
import { CHAIN_ID, CONTRACT_ADDRESS, EXPLORER_URL, RPC_URL, addressLink, configured } from "@/lib/config";
import { reads } from "@/lib/genlayer/contract";
import { isStaleContractError, staleContractHint } from "@/lib/genlayer/errors";

type Check = { name: string; state: "run" | "ok" | "fail"; detail: string };

const short = (m: unknown) => String((m as { message?: string })?.message ?? m).replace(/\s+/g, " ").slice(0, 320);

/**
 * Runs each read the console makes, one by one, so a failure names the exact call. This is the page to
 * open (and screenshot) when a read fails with "Missing or invalid parameters ... execution failed".
 */
export default function Status() {
  const { address, wrongChain } = useWallet();
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);
  const [stale, setStale] = useState("");

  const run = useCallback(async () => {
    setRunning(true); setStale(""); setChecks([]);
    const out: Check[] = [];
    const push = (c: Check) => { out.push(c); setChecks([...out]); };

    push(configured
      ? { name: "Contract address set", state: "ok", detail: CONTRACT_ADDRESS }
      : { name: "Contract address set", state: "fail", detail: "NEXT_PUBLIC_CLAIMCHECK_ADDRESS is empty. Set it in Vercel and redeploy the console." });

    try {
      const res = await fetch(RPC_URL, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }) });
      const chain = Number.parseInt((await res.json()).result, 16);
      push({ name: "RPC reachable", state: chain === CHAIN_ID ? "ok" : "fail", detail: `${RPC_URL} answered chain id ${chain} (expected ${CHAIN_ID})` });
    } catch (e) {
      push({ name: "RPC reachable", state: "fail", detail: `${RPC_URL}: ${short(e)}` });
    }

    if (configured) {
      const steps: [string, () => Promise<unknown>, (d: unknown) => string][] = [
        ["get_info", () => reads.info(), (d) => { const i = d as { version: string; claimcheck_count: number; registry_count: number }; return `version ${i.version}, ${i.claimcheck_count} checks, ${i.registry_count} on record`; }],
        ["list_claimchecks", () => reads.claimchecks(0, 5), (d) => `${(d as { total: number }).total} checks`],
        ["list_registry", () => reads.registry("", 0, 5), (d) => `${(d as { total: number }).total} on record`],
        ["list_activity", () => reads.activity(0, 5), (d) => `${(d as { total: number }).total} events`],
        ["get_party_record", () => reads.party("0x" + "1".repeat(40)), (d) => `${(d as { total: number }).total} finalized for a blank address`],
      ];
      for (const [name, fn, describe] of steps) {
        try { push({ name, state: "ok", detail: describe(await fn()) }); }
        catch (e) {
          push({ name, state: "fail", detail: short(e) });
          if (name === "get_info" && isStaleContractError(e)) setStale(staleContractHint(e));
        }
      }
    }
    setRunning(false);
  }, []);

  useEffect(() => { void run(); }, [run]);

  return (
    <div className="wrap" style={{ paddingTop: 72, maxWidth: 860 }}>
      <SectionHead n="status" title="is the contract" accent="reachable?" />
      <div className="card card-pad" style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        <div className="label">network</div>
        <div className="mono" style={{ fontSize: 13, wordBreak: "break-all" }}>RPC {RPC_URL} / chain {CHAIN_ID}</div>
        <div className="mono" style={{ fontSize: 13, wordBreak: "break-all" }}>
          contract {configured ? <a href={addressLink(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>{CONTRACT_ADDRESS}</a> : "not set"}
        </div>
        <div className="mono" style={{ fontSize: 13 }}>explorer {EXPLORER_URL}</div>
        <div className="mono" style={{ fontSize: 13 }}>wallet {address ?? "not connected"}{address && wrongChain ? " (on the wrong network)" : ""}</div>
      </div>
      {stale && <div style={{ marginBottom: 24 }}><Notice tone="bad">{stale}</Notice></div>}
      <div className="card">
        {checks.map((c) => (
          <div key={c.name} className="row" style={{ gridTemplateColumns: "28px 190px 1fr", padding: "14px 22px", borderTop: 0, borderBottom: "1px solid var(--line)" }}>
            <span style={{ color: c.state === "ok" ? "var(--ok)" : "var(--bad)", fontWeight: 700 }}>{c.state === "ok" ? "OK" : "X"}</span>
            <span className="mono" style={{ fontSize: 13 }}>{c.name}</span>
            <span style={{ color: c.state === "ok" ? "var(--muted)" : "var(--bad)", fontSize: 13, wordBreak: "break-word" }}>{c.detail}</span>
          </div>
        ))}
        {running && <div className="label" style={{ padding: 18 }}>checking...</div>}
      </div>
      <div style={{ marginTop: 24 }}><button className="btn ghost" onClick={run} disabled={running}>Run again</button></div>
    </div>
  );
}
