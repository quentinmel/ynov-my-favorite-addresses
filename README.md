# My Favorite Addresses (MFP)

A full-stack demo application built to explore software quality practices: unit tests, integration tests, end-to-end tests, and CI/CD automation.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm (examples below) or yarn

### Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### Run locally

```bash
# Start the API (port 3000)
cd server
npm run dev

# Start the client (port 5174 — required for Playwright)
cd client
npm run dev -- --port 5174
```

### Dashboard features

- Create places from the dashboard
- Verify/unverify places (badge)
- CSV import/export (template included)
- Open a place or all places in Google Maps

---

## Testing Strategy

This project covers all major testing levels:

| Level | Tool | Scope |
|---|---|---|
| Unit tests | Jest + ts-jest | Pure functions, mocks, spies |
| Integration tests | Jest + Supertest | REST API controllers |
| End-to-end tests | Playwright | Full user journeys |

### Run unit & integration tests

```bash
cd server
npm test
```

### Run tests with code coverage

```bash
cd server
npm test -- --coverage
```

### Run end-to-end tests

Make sure the server is running first. The client is started automatically by Playwright via `webServer` in `client/playwright.config.ts`.

```bash
cd client
npm run test:e2e

# Or with the interactive Playwright UI
npx playwright test --ui
```

### Run E2E with API coverage

```bash
# Terminal 1
cd server
npm run dev:coverage

# Terminal 2
cd client
npm run test:e2e:coverage
```
---

## End-to-End Tests (Playwright)

E2E tests are located in `client/e2e/`. They simulate real user interactions in a browser against the fully running application.

**Key principles applied:**
- Elements are selected using stable attributes (`data-testid`) rather than CSS classes or positions, to minimize breakage from design changes
- Tests focus on high-value user journeys (signup, login, core features)
- Playwright supports multiple browsers and viewport sizes

**Example test flow:**
1. Navigate to `http://localhost:5174`
2. Click the "Signup" button
3. Fill in the registration form and submit
4. Assert the success toast is displayed

---

## Continuous Integration (GitHub Actions)

A CI workflow is configured in `.github/workflows/` and runs automatically on every push to `master`.

**The pipeline:**
1. Checks out the repository
2. Installs dependencies
3. Runs tests
4. Fails the build if any test fails

This ensures no regression is merged without being caught first.

Note: The workflow currently runs `yarn install` and `yarn test` at the repository root. If you want CI to run server tests, you will need to update the workflow to `cd server` (or add a root workspace).

---

## Key Dependencies

### Server
| Package | Purpose |
|---|---|
| `jest` + `ts-jest` | Test runner for TypeScript |
| `supertest` | HTTP integration testing for Express |
| `@faker-js/faker` | Realistic random test data generation |

### Client
| Package | Purpose |
|---|---|
| `@playwright/test` | End-to-end browser automation |
