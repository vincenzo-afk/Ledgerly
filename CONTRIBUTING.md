# Contributing to Ledgerly

Thank you for contributing to Ledgerly. This repository is a static React application, so every contribution should preserve local-first data handling, responsive behavior, and the existing visual language.

## Before you start

Open an issue before starting a large change so the scope can be discussed. For a security concern, follow [SECURITY.md](./SECURITY.md) instead of opening a public issue.

## Local setup

```bash
git clone https://github.com/vincenzo-afk/Ledgerly.git
cd Ledgerly
pnpm install
pnpm dev
```

## Branches and commits

Create a focused branch from `main`. Use a clear prefix such as `feature/`, `fix/`, `docs/`, or `chore/`, followed by a short description. Keep commit messages concise and imperative, for example: `Fix CSV export encoding`.

## Validation

Before opening a pull request, run:

```bash
pnpm run check
pnpm run build
```

The project has no separate automated test suite at present. Explain any manual validation performed in the pull request.

## Pull requests

Keep pull requests limited to one clear purpose. Include the problem being solved, the user-visible effect, validation performed, and any data or security impact. Do not commit generated build output, browser-local expense data, secrets, or access tokens.

## Documentation

Update `README.md`, `SECURITY.md`, or relevant interface copy when a change alters setup, usage, privacy behavior, exports, or discoverability.
