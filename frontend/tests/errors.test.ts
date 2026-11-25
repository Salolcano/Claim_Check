import { describe, expect, it } from "vitest";

import { STALE_CONTRACT_HINT, explain, isStaleContractError, staleContractHint } from "@/lib/genlayer/errors";

const viemError = Object.assign(
  new Error("Missing or invalid parameters. Double check you have provided the correct parameters. Details: execution failed Version: viem@2.57.19"),
  { name: "InvalidParamsRpcError" },
);

describe("a contract the RPC cannot run", () => {
  it("is recognised from the viem error the steward saw", () => {
    expect(isStaleContractError(viemError)).toBe(true);
    expect(isStaleContractError({ shortMessage: "execution failed" })).toBe(true);
  });
  it("is explained as a redeploy, with the header to use", () => {
    const text = explain(viemError);
    expect(text.startsWith(STALE_CONTRACT_HINT)).toBe(true);
    expect(text).toMatch(/Redeploy/);
    expect(text).toMatch(/v0\.4\.0/);
  });
  it("names the call that failed, so the failure can be located", () => {
    const err = Object.assign(new Error("execution failed"), { failedCall: "list_registry(, 0, 30)" });
    expect(staleContractHint(err)).toMatch(/Failed call: list_registry/);
    expect(explain(err)).toMatch(/Failed call: list_registry/);
  });
  it("does not swallow unrelated errors", () => {
    expect(isStaleContractError(new Error("User rejected the request"))).toBe(false);
    expect(explain(Object.assign(new Error("User rejected"), { code: 4001 }))).toMatch(/rejected/i);
    expect(explain(new Error("insufficient funds for gas"))).toMatch(/enough GEN/);
  });
});
