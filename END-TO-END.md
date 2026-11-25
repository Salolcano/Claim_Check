# End-to-end run on Studio Next (10 minutes)

1. Start a check: click "Use a sample set of claims" (or write one claim of your own). Leave the author empty to run
   alone, or paste a second wallet's address.
2. On the check page: fund 1 GEN (optional), then Freeze claims. If the author is another account it must Accept.
3. Register evidence from the requester or author wallet: a public page that states the claim (host
   `demo/claims-source.md`, for example as a GitHub raw URL). Tick the claims it supports.
4. Optionally authorize a helper wallet; it can add up to 4 sources.
5. Verify evidence. Expect `VERIFIED` when every claim is SUPPORTED, `PARTIALLY_VERIFIED` if only a supporting claim is not.
6. Wait 5 minutes, Accept verdict, Finalize. The author receives the share the result earns.
7. Open "author record": the check is listed under the author's address.
8. Negative run: register `demo/status-page-with-instructions.md` (hosted) as the only source. No claim may become SUPPORTED.
