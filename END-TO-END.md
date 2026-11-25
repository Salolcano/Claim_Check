# End to end

A record of one claim check walked through the deployed Claimcheck contract on GenLayer Studio Next (chain 61997). Every transaction below is a link to the explorer so each step can be reviewed.

## Deployment

| Item | Value |
|---|---|
| Network | GenLayer Studio Next, chain 61997 |
| Contract | [0x22649D872d4494482d2f334b36485C7941190e13](https://explorer-studio-next.genlayer.com/address/0x22649D872d4494482d2f334b36485C7941190e13) |

## Evidence page

One public page was registered as evidence:

1. [example.com](https://example.com)

## Claims

1. The page says the domain is for use in illustrative examples. (core)

## Transactions

All eight were sent to the contract, listed oldest first. The explorer does not decode method names, so the function column follows the lifecycle order in the README and ARCHITECTURE.md.

| # | Step | Function | Evidence page | Transaction |
|---|---|---|---|---|
| 1 | Write the check | `create_claimcheck` | none | [0x8065ec7098edd97e730d987d44c4dc8aef3c3803d9d387423236803537460b5c](https://explorer-studio-next.genlayer.com/tx/0x8065ec7098edd97e730d987d44c4dc8aef3c3803d9d387423236803537460b5c) |
| 2 | Freeze the claims | `freeze_claimcheck` | none | [0x49bcc592c7fc3501e885c49c090a836e30c8d3cfcc9ccded754ee1c8251c0ece](https://explorer-studio-next.genlayer.com/tx/0x49bcc592c7fc3501e885c49c090a836e30c8d3cfcc9ccded754ee1c8251c0ece) |
| 3 | Register evidence | `submit_evidence` | [example.com](https://example.com) | [0x32acf640d6aa3a4365aef8bf7b862a007f5788837f365d2302a6028f23250b23](https://explorer-studio-next.genlayer.com/tx/0x32acf640d6aa3a4365aef8bf7b862a007f5788837f365d2302a6028f23250b23) |
| 4 | Request verification | `request_verification` | [example.com](https://example.com) | [0x3dabf7a68ebf38ebc3f112fc832f88e006d767dcc616f0aa684915fc7d62c97e](https://explorer-studio-next.genlayer.com/tx/0x3dabf7a68ebf38ebc3f112fc832f88e006d767dcc616f0aa684915fc7d62c97e) |
| 5 | Accept the verdict | `accept_verification` | n/a | [0x3cdae57b03638913d7583705ed386d231209a2b85212b6c42857be40aadbaad1](https://explorer-studio-next.genlayer.com/tx/0x3cdae57b03638913d7583705ed386d231209a2b85212b6c42857be40aadbaad1) |
| 6 | Finalize and release | `finalize_claimcheck` | n/a | [0x0968d0ad7cc55e2eaaf578b10bc9a36a07b2abea0a3896c16e57c0b9306cd8e0](https://explorer-studio-next.genlayer.com/tx/0x0968d0ad7cc55e2eaaf578b10bc9a36a07b2abea0a3896c16e57c0b9306cd8e0) |
| 7 | Additional call | see note below | n/a | [0xdcd8b3ff5cc0656cfc4de646ced8a314b04d7545764034e7616d5506949666a2](https://explorer-studio-next.genlayer.com/tx/0xdcd8b3ff5cc0656cfc4de646ced8a314b04d7545764034e7616d5506949666a2) |
| 8 | Additional call | see note below | n/a | [0xbfe7be0fbb46f1406336b700885c5fa29e4b4a9bb41f20905e9bef1e8d575b45](https://explorer-studio-next.genlayer.com/tx/0xbfe7be0fbb46f1406336b700885c5fa29e4b4a9bb41f20905e9bef1e8d575b45) |

### Note on calls 7 and 8

The lifecycle has six calls after deployment: `create_claimcheck`, `freeze_claimcheck`, `submit_evidence`, `request_verification`, `accept_verification` and `finalize_claimcheck`. Eight calls were sent, so two are additional calls, such as a funding call, a helper authorization or a repeated step. Open each link to read its call data and confirm.

## Reproduce

Follow the steps in `END-TO-END.md` of the repository, using one claim.

Raw page address for the evidence, as the contract fetches it:

- https://example.com
