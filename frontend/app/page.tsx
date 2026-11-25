"use client";
import Link from "next/link";

import { ClaimScanner } from "@/components/claim-scanner";
import { Constellation } from "@/components/constellation";
import { Marquee, Notice, SectionHead } from "@/components/ui";
import { configured } from "@/lib/config";
import { reads } from "@/lib/genlayer/contract";
import { formatGen, formatTime } from "@/lib/genlayer/format";
import { useLoad } from "@/lib/hooks";

const STEPS = [
  ["list the claims", "Write down the factual claims in a published piece and name the author who stands behind them. Lock an optional accuracy reward and freeze the claims so nobody can move the goalposts."],
  ["put the sources on record", "The requester, the author and the helpers they authorize register public web pages as evidence. Nobody else can write to the set, and four of the twelve slots are always reserved for the two parties."],
  ["let validators rule", "Every validator fetches every page itself and rules on each claim: supported, refuted or unclear. The contract works out the result, pays the author by basis points and updates the author's public record."],
];

export default function Home() {
  const info = useLoad(() => (configured ? reads.info() : Promise.resolve(null)), []);
  const activity = useLoad(() => (configured ? reads.activity(0, 6) : Promise.resolve(null)), []);

  return (
    <>
      <section style={{ position: "relative", overflow: "hidden" }}>
        <Constellation />
        <div className="wrap" style={{ padding: "72px 24px 56px", display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,.95fr)", gap: 40, alignItems: "center" }} id="hero">
          <div>
            <div className="chip" style={{ marginBottom: 24 }}>live on GenLayer Studio Next</div>
            <h1 className="display" style={{ fontSize: "clamp(44px, 7.4vw, 104px)", margin: 0 }}>
              every claim,<br /><span className="accent">checked.</span>
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 19, lineHeight: 1.6, maxWidth: 520, margin: "28px 0 36px" }}>
              Claimcheck puts the claims in a published piece on the record. Sources go on chain, independent
              validators rule on every claim, and the author&rsquo;s public record follows the result.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/claimchecks/new" className="btn">start a check</Link>
              <Link href="/registry" className="btn ghost">author record</Link>
            </div>
          </div>
          <ClaimScanner />
        </div>
        <style>{`@media (max-width: 900px){ #hero{ grid-template-columns: 1fr !important } }`}</style>
      </section>

      <Marquee items={["list the claims", "lock the reward", "put the sources on record", "validators rule", "supported / refuted / unclear", "the author record"]} />

      <section className="wrap" style={{ paddingTop: 96 }}>
        {!configured && (
          <div style={{ marginBottom: 48 }}>
            <Notice>
              No contract is configured yet. Deploy <span className="mono">contracts/claimcheck.py</span> on Studio Next and set{" "}
              <span className="mono">NEXT_PUBLIC_CLAIMCHECK_ADDRESS</span> in Vercel. See DEPLOYMENT.md.
            </Notice>
          </div>
        )}
        <SectionHead n="how it works" title="three moves." accent="one verdict." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {STEPS.map(([name, text], i) => (
            <div key={name} className="card" style={{ padding: 32 }}>
              <div className="num">0{i + 1}</div>
              <h3 className="display" style={{ fontSize: 32, margin: "16px 0 14px" }}>{name}</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.65, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 120 }}>
        <SectionHead n="who owns what" title="the model reads." accent="the contract decides." />
        <div className="card" style={{ overflowX: "auto" }}>
          {[
            ["the contract", "Who may add evidence, the four slots reserved for the requester and the author, custody, the 5-minute pause, the result, every payment, the author record."],
            ["genlayer consensus", "Whether each claim is supported: a question several machines answer apart from each other and must answer alike."],
            ["the model", "One page, one claim, one answer, with words it can point at. A quote that is not on the page is thrown away."],
          ].map(([who, owns], i) => (
            <div key={who} className="row" style={{ gridTemplateColumns: "220px 1fr", padding: "24px 32px", borderTop: i ? undefined : 0 }}>
              <span className="display" style={{ fontSize: 24 }}>{who}</span>
              <span style={{ color: "var(--muted)", lineHeight: 1.6 }}>{owns}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 120 }}>
        <SectionHead n="live on chain" title="the record" accent="so far." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
          {[
            ["checks", info.data ? String(info.data.claimcheck_count) : "-"],
            ["on the record", info.data ? String(info.data.registry_count) : "-"],
            ["GEN in custody", info.data ? formatGen(info.data.custody) : "-"],
          ].map(([k, v]) => (
            <div key={k} className="card" style={{ padding: 28 }}>
              <div className="label">{k}</div>
              <div className="display" style={{ fontSize: 44, marginTop: 10 }}>{v}</div>
            </div>
          ))}
        </div>
        {activity.data && activity.data.items.length > 0 && (
          <div>
            <div className="label" style={{ marginBottom: 8 }}>recent activity</div>
            {activity.data.items.map((a, i) => (
              <Link key={i} href={`/claimchecks/${a.claimcheck_id}`} className="row" style={{ gridTemplateColumns: "56px 1fr auto", padding: "12px 0" }}>
                <span className="num">{a.claimcheck_id}</span>
                <span style={{ color: "var(--muted)" }}>{a.note}</span>
                <span className="num">{formatTime(a.at)}</span>
              </Link>
            ))}
          </div>
        )}
        {(info.error || activity.error) && <Notice tone="bad">{info.error || activity.error}</Notice>}
      </section>

      <section className="wrap" style={{ paddingTop: 120, textAlign: "center" }}>
        <h2 className="display" style={{ fontSize: "clamp(40px, 8vw, 104px)", margin: "0 0 32px" }}>
          don&rsquo;t trust it. <span className="accent">check it.</span>
        </h2>
        <Link href="/claimchecks/new" className="btn">start a check</Link>
      </section>
    </>
  );
}
