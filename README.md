# Claimcheck

**Claims, checked on chain, with a public author record, on GenLayer Studio Next.**

A requester lists the factual claims made in a published piece (an article, a report, a product page)
and names the author who stands behind them. The requester can lock an accuracy reward and freezes the
claims. Both sides, and helpers they authorize, register public web pages as evidence. GenLayer validators
each fetch every source and rule on every claim on their own: **SUPPORTED**, **REFUTED** or **UNCLEAR**. A
round only counts if they agree. The contract derives the result in plain code, pays the author by basis
points of that result, and writes the finalized check to the author's public record.

| | |
|---|---|
| Network | Studio Next, chain `61997`, RPC `https://studio-next.genlayer.com/api` |
| Contract | `contracts/claimcheck.py` (`# v0.4.0`, `py-genlayer:kzybg9...`) |
| Console | `frontend/` (Next.js, `genlayer-js 2.0.0`), host on Vercel |
| Deploy | see `DEPLOYMENT.md` (browser only, no local tooling) |

## Roles

* **Requester** lists the claims, funds the optional accuracy reward, freezes the claims.
* **Author** accepts the claims (when a different account) and receives the reward. One account may play both
  roles so a demo can run alone.
* **Helpers** are accounts either party authorizes to add evidence.

## Lifecycle

`DRAFT -> (AWAITING_ACCEPTANCE) -> ACTIVE -> EVIDENCE_SUBMITTED -> VERDICT_PROPOSED -> ACCEPTED -> FINALIZED`
with `CANCELLED` and a one-day-after-deadline `recover_claimcheck` so no GEN is ever stuck.

Results: `VERIFIED` (full reward to the author), `PARTIALLY_VERIFIED` (the frozen share, the rest back to the
requester), `NOT_VERIFIED`, `INCONCLUSIVE`, `CHECK_DEVIATION` (all back to the requester). "Core" claims must all
be SUPPORTED for the author to earn anything; "supporting" claims decide between full and partial.

## Who may write evidence (steward request)

The evidence set is permissioned, so unrelated accounts can never fill its twelve slots:

* Only the **requester**, the **author** and **helpers either of them authorizes**
  (`authorize_submitter` / `revoke_submitter`, up to 5) can call `submit_evidence`.
* A helper holds at most **4** sources, and **4 of the 12 slots are reserved** for the two parties.
* Either party can `withdraw_evidence` or `replace_evidence` any row (a helper only their own); a withdrawn or
  replaced row frees its slot. Lifetime registrations are capped at 36.
* `request_verification` is limited to the same people, and an `INCONCLUSIVE` or `CHECK_DEVIATION` verdict can be
  accepted early only by a party (by anyone after the deadline).
* Proof: `tests/direct/test_evidence_protection.py` walks the workflow through the twelve-source limit.

## GenVM v0.4 (Studio Next, Studio v0.123)

Studio Next replaced GenVM v0.3 with v0.4. A contract deployed on v0.3 **stops working, even for reads**, and its
state does not carry over; the console then shows the RPC error `Missing or invalid parameters ... execution failed`.
This repo is on v0.4:

* Header: `# v0.4.0` and `py-genlayer:kzybg95x1gn21dw72m7hyg0maaap04n4nx55j9yt6fkdqxtz6bz0`. **Check it against the first
  two lines of any built-in example in your Studio before deploying**; if they differ, copy Studio's. GenVM reads the
  whole run of leading `#` lines as the runner JSON, so keep the blank line after them.
* Value is sent with `gl.chain.Account(address).emit_transfer(...)` (the v0.3 EVM-interface spelling is gone; it is kept
  only as a fallback for older runners). No `__receive__`, no decorators on special methods, no salted deploys.
* After a redeploy, set the new address in `NEXT_PUBLIC_CLAIMCHECK_ADDRESS` and redeploy the console.

## Fee system (Consensus v0.6)

Every write carries a `FeesDistribution` + `feeValue` taken unchanged from the SDK's own estimate
(`frontend/lib/genlayer/fees.ts`). Fixed and tested in `frontend/tests/fees.test.ts`:

* **`No account set`** - the signing client now receives the connected wallet address (`lib/genlayer/client.ts`).
* **`BudgetTooLow`** - pinned `genlayer-js 2.0.0`, a 0-GEN quote is refused before the wallet opens, fees are
  shown with enough digits never to read "0", and a rejected quote is retried with doubled time units (3 times).
* **"the transaction carries no time"** - the clock is read from `gl.message.datetime`, falling back to the older
  `gl.message_raw["datetime"]`.

## Tests

```
python -m pytest -q            # 45 contract-logic tests (in-process stub of the SDK)
cd frontend && npm test        # fee and formatting tests
genvm-lint check contracts/claimcheck.py
```

The stub proves permissions, custody, derived results, payouts and the record. It does not replace GenVM: the
authoritative run is Studio Next itself (`END-TO-END.md`).
