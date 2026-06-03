# Catawiki Test Automation

End-to-end and API test suite for [Catawiki](https://www.catawiki.com), built with [Playwright](https://playwright.dev) and TypeScript.

> All test scenarios documented in BDD format: [TEST_CASES.md](./TEST_CASES.md)

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Playwright](https://playwright.dev) | ^1.49 | Browser automation & API testing |
| TypeScript | ^5.7 | Language |
| Node.js | 20+ | Runtime |
| GitHub Actions | — | CI/CD |

---

## Prerequisites

- Node.js 20+
- npm 9+

---

## Local Setup

**1. Install dependencies**
```bash
npm install
```

**2. Install Playwright browsers**
```bash
npx playwright install
```

**3. Environment files**

Copy `.env.example` to create the environment file you need:

```bash
cp .env.example .env.dev
cp .env.example .env.staging
cp .env.example .env.prod
```

Then fill in the `BASE_URL` for each environment:

| File | Environment | Base URL |
|------|-------------|----------|
| `.env.dev` | Development | https://dev.catawiki.com |
| `.env.staging` | Staging | https://staging.catawiki.com |
| `.env.prod` | Production | https://www.catawiki.com |

> `.env.dev`, `.env.staging` and `.env.prod` are gitignored — never commit them.

The default environment is **prod**. To override, prefix commands with `TEST_ENV=<env>`.

---

## Running Tests Locally

### By tag (recommended)

```bash
# Smoke tests — fast critical path
npm run test:smoke

# Full regression suite
npm run test:regression
```

### By layer

```bash
# All UI/E2E tests (Chromium)
npm run test:e2e

# All API tests
npm run test:api
```

### By environment

```bash
npm run test:dev        # Run against dev
npm run test:staging    # Run against staging
npm run test:prod       # Run against prod (default)
```

### By spec file

```bash
# Run a single spec directly
npx playwright test tests/e2e/search.spec.ts
npx playwright test tests/api/collections-api.spec.ts

# Filter by tag within a single layer
npx playwright test --project=chromium --grep @smoke
npx playwright test --project=api-web --grep @smoke
```

### View HTML report

```bash
npm run report
```

---

## Test Tags

Every test carries two tags — one for layer, one for scope:

| Tag | Meaning |
|-----|---------|
| `@ui` | Browser/E2E test |
| `@api` | API test (no browser) |
| `@smoke` | Critical path — run on every commit |
| `@regression` | Full coverage — run pre-release |

Run any combination with `--grep`:
```bash
npx playwright test --grep "@smoke and @api"
npx playwright test --grep "@regression and @ui"
```

---

## Test Coverage

### E2E (6 tests — Firefox in CI, Chromium locally)

| File | Tests | Tags |
|------|-------|------|
| `search.spec.ts` | Search for "train", verify 2nd lot details | `@smoke` |
| | Search results contain multiple lots with titles | `@regression` |
| | Different keywords return relevant results | `@regression` |
| `lot-page.spec.ts` | Clicking first lot opens a valid lot page | `@smoke` |
| | Lot page title matches the card title | `@regression` |
| `navigation.spec.ts` | Browser back button returns to search results | `@regression` |

### API (60 tests, no browser)

| File | Tests | Covers |
|------|-------|--------|
| `collections-api.spec.ts` | 17 | Response shape, field types, image URLs, localisation |
| `lot-navigation-api.spec.ts` | 16 | Navigation chain, boundary conditions, bidirectional consistency |
| `lot-bids-api.spec.ts` | 27 | Bid ordering, bidder fields, pagination, currency |

---

## CI / GitHub Actions

The pipeline runs on every push/PR to `main`, and can be triggered manually via **Actions → Run workflow** with an environment and tag choice.

### Pipeline

Both jobs run in **parallel** — a failure in one does not block the other.

```
API Tests (api-web)  ──┐
                       ├── run independently
E2E Tests (Firefox)  ──┘
```

Tag-based job skipping:

| Tag selected | API Tests | E2E Tests |
|---|---|---|
| `@smoke` | ✅ runs | ✅ runs |
| `@regression` | ✅ runs | ✅ runs |
| `@api` | ✅ runs | ⏭ skipped |
| `@ui` | ⏭ skipped | ✅ runs |

### Required secrets

| Secret | Description |
|--------|-------------|
| `BASE_URL` | Target environment URL |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for test result notifications |

### Reports & Notifications

- **HTML reports** are uploaded as artifacts after each run and retained for 30 days. Download from the **Actions** tab of the relevant workflow run.
- **Slack notifications** are sent after every job (pass or fail) with status, environment, tag, branch and test counts.

---

## Configuration

Key settings in `playwright.config.ts`:

| Setting | Value | Notes |
|---------|-------|-------|
| `retries` | 1 (CI), 0 (local) | One retry on CI to handle transient failures |
| `trace` | `on-first-retry` | Traces captured on retry for debugging |
| `screenshot` | `only-on-failure` | Screenshots captured on test failure |
| `fullyParallel` | `true` | Tests within a file run in parallel |
| `reporter` | html + json | HTML for browsing; JSON powers Slack test counts |
