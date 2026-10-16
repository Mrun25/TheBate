# Contributing to TheBate

TheBate is a Next.js app where ten AI personas debate any hot take in three
researched rounds.

## Setup

```bash
npm install
cp .env.example .env.local   # add your own AI provider keys
npm run dev
```

You need at least one AI provider key (Gemini or Groq) in `.env.local` for
the live debate path. Never commit `.env.local` or any key.

## Tests

```bash
npm test            # unit suite (no keys needed)
npm run typecheck
npm run test:e2e    # Playwright UI suite; needs AI keys in .env.local
```

Run unit tests and typecheck before opening a PR; run the e2e suite when your
change touches the debate flow.

## Pull requests

Keep PRs focused on one change. Describe the behavior before and after, and
how you verified it. The README's testing and abuse-notes sections explain
the invariants the engine relies on - if your change bends one, call it out
explicitly.
