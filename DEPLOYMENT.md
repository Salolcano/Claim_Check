# Deployment (browser only)

## 1. Deploy the contract on Studio Next
1. Open Studio Next and connect your wallet (RPC `https://studio-next.genlayer.com/api`, chain id `61997`).
2. New file, paste all of `contracts/claimcheck.py`. Keep the first two lines (`# v0.4.0` and the `Depends` runner line) and the blank line after them. Compare them with the first two lines of any built-in Studio example; if Studio's differ, use Studio's.
3. Deploy with no constructor arguments. Accept the fee quote Studio shows.
4. Wait for `FINALIZED` with a success result, then copy the contract address.
5. Check `get_info` returns `{"version": "claimcheck-1", ...}`.

## 2. Host the console on Vercel
1. Push this repo to GitHub.
2. Vercel -> Add New Project -> import it. **Root Directory: `frontend`**. Framework: Next.js.
3. Environment variables (see `frontend/.env.example`): `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_CHAIN_ID=61997`,
   `NEXT_PUBLIC_EXPLORER_URL`, `NEXT_PUBLIC_CLAIMCHECK_ADDRESS=<address from step 1>`.
4. Deploy. After changing a variable, redeploy (NEXT_PUBLIC values are baked in at build time).

## 3. Wallet
Rabby / MetaMask: the console offers to add and switch to Studio Next. You need GEN for the reward you lock plus the
fee deposit (unused fee is refunded at finalization).

## Check it
Open `/status` on the deployed console. It runs every read the console makes (`get_info`, `list_claimchecks`, `list_registry`, `list_activity`, `get_party_record`), one by one, and names the exact call that fails. Send a screenshot of it with any bug report.

## If a read fails: "Missing or invalid parameters ... execution failed"
The RPC cannot run the contract. On Studio Next that means it was deployed on GenVM v0.3, which Studio Next no longer
runs (reads fail too, and old state is gone). Redeploy `contracts/claimcheck.py` (header `# v0.4.0`), put the new
address in `NEXT_PUBLIC_CLAIMCHECK_ADDRESS`, and redeploy the console.

## If a write fails
* `No account set` - connect a wallet first.
* `BudgetTooLow` - the console re-quotes automatically; if it still fails after 3 attempts open the transaction in the
  explorer and check the fee panel.
* Payout writes (`finalize_claimcheck`, `cancel_claimcheck`, `recover_claimcheck`) emit GEN transfers. If their quote is
  rejected, estimate them with the CLI using `messageAllocations`.
