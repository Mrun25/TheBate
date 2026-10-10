<div align="center">

# TheBate

**Ten AI minds debate. A judge picks a winner. You stake MON on the outcome.**

Live on Monad Testnet - built for Monad Blitz Pune V3

[**Live app**](https://the-bate.vercel.app) · [**Watch the demo**](https://the-bate.vercel.app/debate/demo?demo=1&topic=Has%20AI%20achieved%20AGI%3F) · [**Contract**](https://testnet.monadvision.com/address/0x6e06e99cc6f4bb56cc10927483d72667b5f0d20c) · [**Repo**](https://github.com/Mrun25/TheBate)

**Demo video (90s, narrated):** [docs/thebate-demo.mp4](docs/thebate-demo.mp4)

![lobby](docs/lobby.png)

</div>

## At a glance

| | |
|---|---|
| Live URL | https://the-bate.vercel.app |
| One-click demo (no wallet, no keys) | https://the-bate.vercel.app/debate/demo?demo=1&topic=Has%20AI%20achieved%20AGI%3F |
| Network | Monad Testnet, chain ID `10143` |
| Contract | `0x6e06e99cc6f4bb56cc10927483d72667b5f0d20c` |
| Source | Full Solidity source in `contracts/`; explorer: [MonadVision](https://testnet.monadvision.com/address/0x6e06e99cc6f4bb56cc10927483d72667b5f0d20c) (verification status: check the explorer) |
| Deploy tx | `0xb967e75befca9ef84f189787cd87b944b16042d284cad39e885d52da4bdea1c7` |
| Hosting | Vercel Hobby (free, no card). Backend = Next.js API routes |
| AI | Gemini 3.5 Flash primary, Groq `gpt-oss-120b`/`20b` fallback (all free), Tavily web research (free) |
| Rules | Fresh code written on event day. No pre-existing project code |

## The problem and the fix

Online arguments never end. There is no research, no structure, no stakes and no verdict, so nobody changes their mind and nobody is held to their claim.

TheBate turns any hot take into a structured, researched debate run by AI agents, then lets people put MON behind their call on Monad. A judge scores it, the pool settles on-chain, and winners claim their share. One loop, end to end, in a browser, with no install.

## What judges can verify in two minutes

| Criterion | Where to check it |
|---|---|
| **Works live** | [the-bate.vercel.app](https://the-bate.vercel.app): type any motion, get a real researched debate and verdict |
| **Real on-chain usage** | Contract `0x6e06e99cc6f4bb56cc10927483d72667b5f0d20c` on Monad Testnet with a full create, stake, stake, resolve, claim run (tx hashes in [Proof of a full on-chain run](#proof-of-a-full-on-chain-run-production-ui-pool-12)) |
| **Technical depth** | Solidity pool contract (pro-rata payouts, 5% fee, refund path), server-side judge oracle, multi-model AI chain with automatic fallback, web and arXiv research grounding, per-statement source links, Vercel Blob community store |
| **Completeness** | Landing, live debate, Think-Along room, viewer Q&A, verdict card, community feed with permalinks, mobile layout, error and 404 pages, demo mode |
| **Resilience** | Every layer has a fallback: see [Fallbacks](#fallbacks-nothing-dead-ends) |
| **Honesty** | See [What is real and what is not](#what-is-real-and-what-is-not) below |
| **Demo** | [90s narrated video](docs/thebate-demo.mp4) and a [one-click demo mode](https://the-bate.vercel.app/debate/demo?demo=1&topic=Has%20AI%20achieved%20AGI%3F) that needs no wallet |

## Features

| Feature | What it does |
|---|---|
| Arena debate | 10 personas in 2 teams argue a motion in 3 rounds, each answering the one before. Tone selectable: balanced, heated, academic, playful |
| Research grounding | Tavily web search plus arXiv papers feed the debate. Each statement shows a source link only when a real search result matches it. The model never writes URLs |
| AI judge | Scores both teams, names the strongest argument, explains the verdict |
| Prediction pools | One click opens a pool on Monad Testnet. Stake on Team A or B, settle, claim |
| Think-Along | Join the table as a seat, ask the panel questions, get answers grounded in live research |
| Community | Post a finished debate or think-along, share a permalink, like and comment |
| Demo mode | A scripted debate and simulated pool for anyone without a wallet |

![live debate](docs/live-debate.png)
![verdict](docs/verdict-live.png)
![community](docs/community.png)

## What is real and what is not

| Real | Not (yet) |
|---|---|
| Contract deployed on Monad Testnet, with the transactions listed below | Testnet MON only, no real money |
| Live AI debates from Gemini or Groq, grounded in live search | The offline script and Watch demo are scripted and labelled as such |
| Research links come from real search results | A link means the source is related by keywords, not that it proves the claim |
| Judge verdict is written on-chain by the owner key | The judge oracle is centralized, so you trust that key. A production version would use several judges or a dispute window |
| Free-tier AI keys can rate-limit under load | Fallbacks cover it, but a very busy moment can show the offline script (footer says which engine ran) |
| Source is in `contracts/` | Explorer source verification is not confirmed, so we do not claim it |

## How it works

1. **Pick a motion.** The server researches it on the web (Tavily), then an AI model (Gemini, with Groq as fallback) writes an 8-argument, 3-round debate between Team A (for) and Team B (against) and judges it: scores, reasoning, strongest argument. Research links show under the verdict.
2. **Open a pool.** One click creates an on-chain pool for that debate (0.1 MON creation fee).
3. **Stake.** Anyone with a wallet stakes MON on Team A or Team B.
4. **Settle.** When the verdict lands, the judge oracle writes the winner on-chain.
5. **Claim.** Winners split the pot pro rata. 5% goes to the protocol. If nobody backed the winner, everyone is refunded.

![arena](docs/verdict.png)

## Team

Built at Monad Blitz Pune V3.

| Member | Work |
|---|---|
| **Mrunmayee Daware** | Next.js app and UX design, AI debate engine (Gemini and Groq chain, Tavily and arXiv research, per-statement sources), community feed, demo mode, deployment |
| **Hassan Rehman** | Solidity prediction-pool contract, on-chain integration (staking, settlement, claims), Monad testnet deployment and transaction testing |
| **Tanishq** | Team member |

## Architecture

```mermaid
flowchart LR
  U[Browser<br/>Next.js 14 + Phaser 3 UI] -->|POST /api/debate| D[Vercel serverless<br/>debate route]
  D -->|1 research| T[Tavily search]
  D -->|2 primary| G[Groq gpt-oss-120b]
  D -->|3 fallback| M[Gemini]
  D -->|4 last resort| O[Labelled offline script]
  U -->|wallet txs: create, stake, claim| W[User wallet<br/>MetaMask / Rabby / Phantom]
  W --> C[(TheBate.sol<br/>Monad Testnet)]
  U -->|POST /api/resolve| R[Vercel serverless<br/>oracle route]
  R -->|resolve winner| C
  U -.->|reads rotate across 4 RPCs| C
```

### Request flow

```mermaid
sequenceDiagram
  participant B as Browser
  participant S as /api/debate
  participant L as Tavily + Groq
  participant X as /api/resolve
  participant K as TheBate.sol
  B->>S: motion
  S->>L: research, then debate + judge
  L-->>S: 8 arguments, scores, sources
  S-->>B: JSON (source label tells which engine ran)
  B->>K: createDebate (wallet signs)
  B->>K: stake A / B (wallet signs)
  B->>X: settle (judge winner)
  X->>K: resolve(id, winner) (owner key, server only)
  B->>K: claim (wallet signs)
```

## Fallbacks (nothing dead-ends)

| If this fails | The app does this |
|---|---|
| Tavily research fails | Debate runs without web sources; the verdict panel shows no research links |
| Gemini 3.5 Flash (primary) busy or error | Retries, then Gemini 3.1 Flash-Lite, then Groq `gpt-oss-120b`, then Groq `gpt-oss-20b` (all free tiers) |
| Every model fails | Clearly labelled offline script. The footer shows which engine ran |
| Viewer questions (`/api/ask`) | Tavily-grounded answer via Gemini, then Groq, then research snippets |
| Community feed (`/community`) | Vercel Blob store; if unreachable the page shows an empty state, debates still work |
| Watch demo (`/debate/demo?demo=1`) | Fully scripted, no API calls, so it works with every provider down |
| Tavily unavailable | Debate still runs, without research links |
| An RPC node is down | Reads rotate across 4 Monad Testnet RPCs with timeouts |
| No wallet in the browser | Pool stays readable, buttons explain what to do, MetaMask deep link and faucet link shown |
| Wallet rejects, low balance, slow network | Plain-language message, nothing breaks |
| Settlement service busy | Friendly retry message |
| Unexpected crash | App-level error page and 404 page |
| Visitor just wants to look | **Demo mode**: scripted sample debate, simulated pool, no wallet and no keys. Clearly labelled |

## Contract

`contracts/TheBate.sol`, about 120 lines, no dependencies.

| Function | Who | What |
|---|---|---|
| `createDebate(topic)` payable 0.1 MON | anyone | opens a pool, fee goes to the protocol |
| `stake(id, side)` payable | anyone | side 0 = Team A, 1 = Team B |
| `resolve(id, winner)` | owner (judge oracle) | closes staking, sets the winner |
| `claim(id)` | stakers | pays winners pro rata, refunds if voided |
| `withdrawFees()` | owner | pulls the 5% cut and creation fees |

**Honest limit:** the judge oracle is centralized. The contract owner writes the AI judge's winner on-chain, so you trust that key. A production version would use several judges or an optimistic dispute window.

### Proof of a full on-chain run (production UI, pool #12)

| Step | Tx |
|---|---|
| createDebate | [`0xd82f34ac...5064`](https://testnet.monadvision.com/tx/0xd82f34ac488e497326251c06958aeb81cf5b2930f0d12ed5e8fd9e2a22405064) |
| stake Team A | [`0x4e447d8b...8618`](https://testnet.monadvision.com/tx/0x4e447d8b571040045582cd1f2b97522183f4892e204db1fb6a41bf63c4b78618) |
| stake Team B | [`0xe1a90468...3961`](https://testnet.monadvision.com/tx/0xe1a9046860425c9c5cd9d893eb179ab52c4de799819de734caad1e84db843961) |
| resolve | [`0x3213be76...4f45`](https://testnet.monadvision.com/tx/0x3213be7652e7a091d3660552d50bf3cfabe73c44493e92ad460d4a9c88bd4f45) |
| claim | [`0x1e6691c5...321f`](https://testnet.monadvision.com/tx/0x1e6691c568fb4068f001c2e1b310600d8369a551dfd690414363a55cc1d1321f) |

## Project map

```
app/
  [[...slug]]/page.tsx     single-page shell for all routes
  api/debate/route.ts      Tavily research -> Gemini -> Groq -> offline fallback
  api/resolve/route.ts     server-side judge oracle (owner key from env)
  error.tsx, not-found.tsx graceful failure pages
  globals.css              all styling, mobile breakpoints
components/
  DebateApp.tsx            lobby, arena, verdict, vote, demo mode, sources
  World.tsx                Phaser pixel-art scenes
  ChainPanel.tsx           live pool (wallet) and simulated demo pool
lib/
  chain.ts                 viem clients, 4-RPC fallback, wallet connect
  abi.ts                   contract ABI (generated)
  bridge.ts, data.ts       UI event bus and sample data
contracts/TheBate.sol      the contract
scripts/                   compile, deploy, verify (Sourcify), e2e on-chain test
tests/                     UI and chain tests (Playwright)
deployment.json            deployed address and tx
```

## Run from a fresh clone

Needs Node 18.17+.

```sh
git clone https://github.com/Mrun25/TheBate && cd TheBate
npm ci
cp .env.example .env.local   # fill in the keys you have, all optional
npm run dev                  # http://localhost:3000
```

With no keys at all the app still works: debates use the labelled offline script and demo mode is fully functional.

| Env var | Use |
|---|---|
| `GROQ_API_KEY` | primary debate engine (Groq free tier) |
| `GEMINI_API_KEY` | optional second engine (Google AI Studio free key) |
| `TAVILY_API_KEY` | web research that grounds the debate (free tier) |
| `ORACLE_PRIVATE_KEY` | contract owner key, server only, used by `/api/resolve` |
| `NEXT_PUBLIC_THEBATE_ADDRESS` | contract address (defaults to the deployed one) |

To stake you need a browser wallet (MetaMask, Phantom, Rabby) with testnet MON from https://faucet.monad.xyz. The app adds and switches to Monad Testnet for you.

## Deploy

**Frontend + backend (free, no card):** import the repo on Vercel, framework Next.js, add the env vars above, deploy. The API routes are serverless functions, so there is no separate server to host.

**Contract (optional, already deployed and verified):**

```sh
npm run compile                          # solc -> artifacts/ and lib/abi.ts
DEPLOYER_PRIVATE_KEY=0x... npm run deploy
node scripts/verify.cjs                  # Sourcify verification
```

Use a fresh burner key funded from the faucet. Never commit keys: `.env*` and `.deployer.key` are gitignored.

Monad note: low-balance accounts hit a reserve-balance rule, so do not send two transactions from one account in the same block.

## Tests

```sh
node scripts/e2e.mjs                                                       # create, stake x2, resolve, claim on the live contract
DEPLOYER_KEY=0x... BASE=http://localhost:3000 node tests/chain-e2e.cjs     # drives the real UI with a signer
node tests/interactions.cjs                                                # UI interactions, routes, widths 320-1440
```

## Mobile

![mobile](docs/mobile.png)

## Privacy and security

No secrets in the repo or its history. Keys live in Vercel env vars. The oracle key is only read server side.
