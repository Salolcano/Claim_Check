/** What went wrong, in a sentence a person can act on. */
const TAGS = ["[EXPECTED]", "[EXTERNAL]", "[TRANSIENT]", "[LLM_ERROR]", "[REFUNDED]"];

export function refusalSentence(text: string): string {
  let out = (text ?? "").trim();
  for (const tag of TAGS) if (out.startsWith(tag)) out = out.slice(tag.length).trim();
  out = out.replace(/\b\d{10}\b/g, (d) => {
    const v = Number(d);
    return v > 1_600_000_000 && v < 4_000_000_000
      ? new Date(v * 1000).toISOString().replace("T", " ").replace(/:\d\d\.\d+Z$/, " UTC")
      : d;
  });
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/**
 * "Missing or invalid parameters ... execution failed" is what viem prints when the RPC cannot run the
 * contract. Since Studio Next moved to GenVM v0.4 that is what a contract deployed on v0.3 looks like:
 * it cannot be read or written, and its old state does not carry over. The fix is a redeploy.
 */
export const STALE_CONTRACT_HINT =
  "The contract could not be read or run (the RPC answered \"execution failed\"). Contracts deployed before Studio Next " +
  "moved to GenVM v0.4 stop working, even for reads. Redeploy contracts/claimcheck.py (its header must say # v0.4.0) " +
  "and set NEXT_PUBLIC_CLAIMCHECK_ADDRESS to the new address.";

export function staleContractHint(err: unknown): string {
  const call = (err as { failedCall?: string } | null)?.failedCall;
  return call ? `${STALE_CONTRACT_HINT} Failed call: ${call}.` : STALE_CONTRACT_HINT;
}

export function isStaleContractError(err: unknown): boolean {
  const e = err as { message?: string; shortMessage?: string; details?: string };
  const raw = [e?.message, e?.shortMessage, e?.details, typeof err === "string" ? err : ""].filter(Boolean).join(" ");
  return /missing or invalid parameters|execution failed|contract not found|invalid_contract/i.test(raw);
}

export function explain(err: unknown): string {
  const e = err as { code?: number; name?: string; message?: string; shortMessage?: string };
  const raw = String(e?.shortMessage ?? e?.message ?? err ?? "");
  if (e?.code === 4001 || /user rejected|user denied|rejected the request/i.test(raw)) {
    return "You rejected the request in your wallet. Nothing was sent.";
  }
  if (e?.name === "NoAccountError" || /no account set/i.test(raw)) {
    return "No wallet account is connected. Connect your wallet and try again.";
  }
  if (e?.name === "FeeError") return raw;
  if (isStaleContractError(err)) return staleContractHint(err);
  if (/BudgetTooLow/i.test(raw)) {
    return "The fee budget was below the network minimum. Try again; the console will request a larger quote.";
  }
  if (/insufficient funds|insufficient balance/i.test(raw)) {
    return "This account does not hold enough GEN to cover the amount plus the fee deposit.";
  }
  if (/chain|network/i.test(raw) && /mismatch|wrong|switch/i.test(raw)) {
    return "Your wallet is on a different network. Switch to GenLayer Studio Next and retry.";
  }
  const tagged = raw.match(/\[(EXPECTED|EXTERNAL|TRANSIENT|LLM_ERROR|REFUNDED)\][^\n]*/);
  if (tagged) return refusalSentence(tagged[0]);
  return raw.length > 280 ? raw.slice(0, 280) + "..." : raw || "The transaction failed.";
}
