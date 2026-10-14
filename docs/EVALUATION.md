# Evaluation

Results from running 20 debate motions against the live production engine
(`POST https://the-bate.vercel.app/api/debate`) on Oct 15, 2026, 00:01-00:08 IST.

## Method

- 20 motions, submitted one at a time, no code changes between runs.
- Each completed debate was checked for the expected shape: 8 statements
  (opening, rebuttal, closing for both sides), cited sources, and a declared
  winner.
- 5 of the 20 motions were repeats that the engine served from its in-memory
  cache (~0.2s each). Those are excluded from the generation latency figures.

## Results

- 19 of 20 motions returned a complete, valid debate.
- The one failure was `Has AI achieved AGI?`: HTTP 504 at ~60s on both
  attempts. That motion pulls in heavy research and runs into the hosting
  platform's 60s function limit. Everything else completed in time.

### Latency (fresh generations, n=14)

| mean | median | min | max | p90 |
|------|--------|-----|-----|-----|
| 8.7s | 6.0s | 4.1s | 25.8s | 17.9s |

The slow tail is research-heavy motions (e.g. organic food at 25.8s, animals
in research at 17.9s). Cached repeats come back in ~0.2s.

### Engines

The API reports which model tier served the request in its `source` field.
During this run every debate landed on a fallback tier - the primary
gemini-3.5-flash tier served none of them:

| engine tier | debates |
|-------------|---------|
| gemini-gemini-3.5-flash-lite | 12 |
| gemini-lite | 7 |

### Quality signals

- 8 statements in every completed debate (both sides, all three rounds).
- Sources cited per debate: 7-10, average 9.3.
- Winners: side A 15, side B 4.

## Raw data

`ts` is the request time (IST), `source` is the engine tier the API reported.

| ts | motion | http | source | latency_s | statements | sources | winner |
|----|--------|------|--------|-----------|------------|---------|--------|
| 00:01 | Should social media be banned for under-16s? | 200 | gemini-gemini-3.5-flash-lite | 9.1 | 8 | 10 | A |
| 00:01 | Is space exploration worth the cost? | 200 | gemini-gemini-3.5-flash-lite | 6.4 | 8 | 10 | A |
| 00:02 | Should voting be mandatory? | 200 | gemini-gemini-3.5-flash-lite | 5.2 | 8 | 9 | B |
| 00:02 | Are smartphones making us lonelier? | 200 | gemini-lite | 5.0 | 8 | 7 | A |
| 00:02 | Should animals be used in research? | 200 | gemini-gemini-3.5-flash-lite | 17.9 | 8 | 10 | A |
| 00:02 | Is nuclear energy the answer to climate change? | 200 | gemini-lite | 9.9 | 8 | 10 | A |
| 00:02 | Should cities be car-free? (cached) | 200 | gemini-gemini-3.5-flash-lite | 0.2 | 8 | 10 | A |
| 00:02 | Is remote work better than office work? (cached) | 200 | gemini-gemini-3.5-flash-lite | 0.2 | 8 | 8 | A |
| 00:03 | Should college be free? (cached) | 200 | gemini-gemini-3.5-flash-lite | 0.2 | 8 | 10 | A |
| 00:03 | Are electric vehicles actually green? (cached) | 200 | gemini-gemini-3.5-flash-lite | 0.2 | 8 | 8 | A |
| 00:03 | Should homework be abolished? (cached) | 200 | gemini-gemini-3.5-flash-lite | 0.2 | 8 | 10 | B |
| 00:03 | Are video games good for kids? | 200 | gemini-lite | 4.4 | 8 | 10 | A |
| 00:03 | Should gig workers get employee benefits? | 200 | gemini-gemini-3.5-flash-lite | 4.1 | 8 | 10 | A |
| 00:03 | Is organic food worth the price? | 200 | gemini-lite | 25.8 | 8 | 8 | A |
| 00:04 | Should public transport be free? | 200 | gemini-gemini-3.5-flash-lite | 4.8 | 8 | 10 | A |
| 00:04 | Has AI achieved AGI? | 504 | - | 60.2 | - | - | - |
| 00:05 | Should AI-generated art be copyrighted? | 200 | gemini-gemini-3.5-flash-lite | 6.1 | 8 | 10 | B |
| 00:05 | Are electric scooters a menace? | 200 | gemini-lite | 6.0 | 8 | 9 | B |
| 00:05 | Should cricket be in the Olympics? | 200 | gemini-lite | 12.0 | 8 | 10 | A |
| 00:08 | Is breakfast the most important meal? | 200 | gemini-lite | 5.6 | 8 | 7 | A |

## Caveats

- Single client location (IST timezone), single session, small sample.
- The dev API keys behind the live site share quota, so which engine tier
  serves a request varies with load and rate limits at the time.
