# AgroManagement Test Automation Framework

Production-oriented Playwright + TypeScript framework for UI and API testing.

## Quick Start

1. Copy env template:
   - `.env.example` -> `.env`
2. Install dependencies:
   - `npm install`
3. Install browser:
   - `npx playwright install chromium`
4. Run tests:
   - `npm run test:smoke`

## Scripts

- `npm test` - run all tests
- `npm run test:clean` - run all tests + cleanup test data
- `npm run test:ui` - UI tests only
- `npm run test:api` - API tests only
- `npm run test:smoke` - smoke tests
- `npm run test:security` - security/ownership tests
- `npm run cleanup:data` - best-effort cleanup by test prefix
- `npm run report:open` - open Playwright HTML report

## Test Layers

- `tests/` - specs by domain and priority
- `pages/` - UI Page Objects
- `api/` - API clients and services
- `fixtures/` - auth/domain fixtures
- `data/` - factories for deterministic test data
- `config/` - environment and framework configuration
- `utils/` - shared utilities

## Environments

- `TEST_ENV=dev` uses defaults from `config/env/dev.env.ts`
- `TEST_ENV=stage` uses defaults from `config/env/stage.env.ts`
- `TEST_DATA_PREFIX` controls generated entity prefix (default `qaauto`)
- `BASE_URL` and `API_BASE_URL` always override profile defaults

