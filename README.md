# TheBate

Ten AI minds debate a question in a pixel-art clubhouse. A judge picks a winner. The audience stakes MON on a side, and the winners split the pot - on Monad Testnet.

Built for Monad Blitz Pune. Fresh code, started on the day of the event.

- Live app: LIVE_URL_PLACEHOLDER
- Contract (Monad Testnet, chain ID 10143): `0x6e06e99cc6f4bb56cc10927483d72667b5f0d20c`
  - Explorer: https://testnet.monadvision.com/address/0x6e06e99cc6f4bb56cc10927483d72667b5f0d20c
  - Deploy tx: `0xb967e75befca9ef84f189787cd87b944b16042d284cad39e885d52da4bdea1c7`
- Repo: https://github.com/Mrun25/TheBate

## What it does

1. Pick a topic. Gemini writes an 8-argument, 3-round debate between Team A (for) and Team B (against) and acts as the judge (scores, reasoning, strongest argument). If no API key is set, it falls back to a clearly labelled offline script.
2. Open an on-chain pool for the debate (0.1 MON creation fee).
3. Anyone with a wallet stakes MON on Team A or Team B.
4. When the verdict lands, the judge oracle settles the pool on-chain. Winners claim their share of the pot. 5% goes to the protocol owner. If nobody backed the winner, everyone is refunded.

This is a prediction market for an outcome with no existing venue.

## Contract

`contracts/TheBate.sol`, about 120 lines, no dependencies.

| Function | Who | What |
|---|---|---|
| `createDebate(topic)` payable 0.1 MON | anyone | opens pool, fee goes to protocol |
| `stake(id, side)` payable | anyone | side 0 = Team A, 1 = Team B |
| `resolve(id, winner)` | owner (judge oracle) | closes staking, sets winner |
| `claim(id)` | stakers | pays winners pro rata, refunds if voided |
| `withdrawFees()` | owner | pulls the 5% cut + creation fees |

Known limit: the owner is a trusted oracle for the winner. A production version would use a multi-judge or optimistic dispute flow.

## Run from a fresh clone

Needs Node 18.17+.

```sh
git clone https://github.com/Mrun25/TheBate && cd TheBate
npm ci
cp .env.example .env.local   # then fill in the keys you have
npm run dev                  # http://localhost:3000
```

Env vars (all optional for a demo run):

| Var | Use |
|---|---|
| `GEMINI_API_KEY` | primary debate engine (Google AI Studio free key) |
| `GROQ_API_KEY` | fallback engine |
| `TAVILY_API_KEY` | web research that grounds the debate (free tier) |
| `ORACLE_PRIVATE_KEY` | contract owner key, used server-side only by `/api/resolve` to settle pools |
| `NEXT_PUBLIC_THEBATE_ADDRESS` | contract address (defaults to the deployed one) |

To stake you need a browser wallet (MetaMask, Phantom, Rabby) with a little testnet MON from https://faucet.monad.xyz. The app adds and switches to Monad Testnet for you.

## Deploy

Vercel: import the repo, framework Next.js, add the env vars above, deploy. No other setup.

Contract (optional, already deployed):

```sh
npm run compile                       # solc -> artifacts/ and lib/abi.ts
DEPLOYER_PRIVATE_KEY=0x... npm run deploy
```

Use a fresh burner key funded from the faucet. Never commit keys. `.deployer.key` and `.env*` are gitignored.

Note on Monad: accounts with low balances hit a reserve-balance rule, so avoid sending several transactions in the same block from one account.

## Tests

```sh
npm run compile && node scripts/e2e.mjs        # create, stake x2, resolve, claim against the live contract
DEPLOYER_KEY=0x... BASE=http://localhost:3000 node tests/chain-e2e.cjs   # drives the real UI with a signer
```

## Stack

Next.js 14, React, TypeScript, Phaser 3 (pixel rooms), Tailwind, Framer Motion, viem, Solidity 0.8.26.

## Status

Real: debate generation (with API key), judge verdict, on-chain create/stake/settle/claim.
Mocked: Live, Trophy and Community galleries, audience pulse numbers, spectator counts. Think-Along is a UI preview. Sound is a visual toggle.
