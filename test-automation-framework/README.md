# AgroManagement Test Automation Framework

Production-oriented Playwright + TypeScript framework for UI, API, security, and business E2E testing.

## Quick Start

1. Copy environment template:
   - `.env.example` -> `.env`
2. Install dependencies:
   - `npm ci`
3. Install browser:
   - `npx playwright install chromium`
4. Run smoke suite:
   - `npm run test:smoke`
5. Open report:
   - `npm run report:open`

## NPM Scripts

- `npm test` - run all tests
- `npm run test:clean` - run all tests + cleanup test data
- `npm run test:ui` - UI-only tests (`ui` project)
- `npm run test:api` - API-only tests (`api` project)
- `npm run test:smoke` - smoke-tagged tests
- `npm run test:security` - security/ownership tests
- `npm run cleanup:data` - best-effort cleanup by test prefix
- `npm run report:open` - open Playwright HTML report
- `npm run typecheck` - TypeScript type validation

## Project Structure

- `tests/` - test specifications grouped by layer and domain (`ui`, `api`, `security`, `e2e`)
- `pages/` - Page Object Model classes for UI flows
- `api/controllers/` - API controller layer for HTTP interactions
- `api/types/contracts.ts` - shared API/domain contracts used by controllers and factories
- `fixtures/` - Playwright fixtures (`base`, `auth`, `domain`) and setup helpers
- `data/factories/` - deterministic test data builders
- `utils/auth/` - auth-related reusable helpers
- `utils/api/` - API assertion/parsing helpers
- `utils/data/` - shared data helpers and registries
- `scripts/data/` - executable maintenance scripts (cleanup, etc.)
- `config/` - environment and framework configuration

## Environments

- `TEST_ENV=dev` uses defaults from `config/env/dev.env.ts`
- `TEST_ENV=stage` uses defaults from `config/env/stage.env.ts`
- `BASE_URL` and `API_BASE_URL` override profile defaults when provided
- `TEST_DATA_PREFIX` controls generated entity prefix (default: `qaauto`)
- Required credentials:
  - `USER_USERNAME`, `USER_PASSWORD`
  - `ADMIN_USERNAME`, `ADMIN_PASSWORD`

## CI Security and Quality Gate

- Workflow uses GitHub Secrets for credentials:
  - `USER_USERNAME`, `USER_PASSWORD`
  - `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- Workflow fails fast if any required secret is missing.
- Quality gate runs before suites in CI:
  - `npm run typecheck`

