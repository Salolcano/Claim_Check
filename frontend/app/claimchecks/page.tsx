"use client";
import Link from "next/link";

import { Notice, ClaimcheckRow, SectionHead } from "@/components/ui";
import { configured } from "@/lib/config";
import { reads } from "@/lib/genlayer/contract";
import { useLoad } from "@/lib/hooks";

export default function Claimchecks() {
  const { data, error, loading } = useLoad(() => (configured ? reads.claimchecks(0, 30) : Promise.resolve(null)), []);
  return (
    <div className="wrap" style={{ paddingTop: 72 }}>
      <SectionHead n="all checks" title="claims," accent="in review." />
      <div style={{ marginBottom: 28 }}><Link href="/claimchecks/new" className="btn">Start a check</Link></div>
      {!configured && <Notice>No contract is configured yet. See DEPLOYMENT.md.</Notice>}
      {error && <Notice tone="bad">{error}</Notice>}
      {loading && <div className="label">Reading the chain...</div>}
      {data && data.items.length === 0 && <div className="label">No claimchecks yet. Create the first one.</div>}
      {data?.items.map((p) => <ClaimcheckRow key={p.id} p={p} />)}
    </div>
  );
}
