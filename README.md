# Test Automation Framework for AgroManagement

Test automation framework for **AgroManagement** with a dedicated Playwright + TypeScript and CI/CD pipeline.

[![Autotests Pipeline](https://github.com/PavelArabadzhy/test-automation-framework-for-agromanagement/actions/workflows/test-automation-pr-gate.yml/badge.svg)](https://github.com/PavelArabadzhy/test-automation-framework-for-agromanagement/actions/workflows/test-automation-pr-gate.yml)
[![Playwright Report (Pages)](https://img.shields.io/badge/Playwright%20Report-GitHub%20Pages-2ea44f)](https://pavelarabadzhy.github.io/test-automation-framework-for-agromanagement/)

## Project Goal

Build a production-style automation solution for a web system with:
- UI testing
- API testing
- security/ownership checks
- business E2E scenarios
- GitHub Actions execution
- auto-published Playwright reports

## Repository Structure

This repository contains **two projects**:

- `agro-management/` - Spring Boot application under test (backend + Thymeleaf UI)
- `test-automation-framework/` - Playwright + TypeScript test framework

## Test Framework Architecture

Inside `test-automation-framework/`:

- `tests/` - UI, API, security, validation, e2e suites
- `pages/` - Page Object Model (UI layer)
- `api/controllers` - API controller layer
- `fixtures/` - auth/domain fixtures
- `data/factories` - deterministic test data generators
- `utils/` - shared helpers, parsers, security assertions
- `scripts/data/cleanupTestData.ts` - cleanup strategy

## Quick Start (Local)

### 1) Run application stack

```bash
cd agro-management
docker compose up -d --build
```

### 2) Run autotests

```bash
cd ../test-automation-framework
cp .env.example .env
npm ci
npx playwright install chromium
npm run test:smoke
```

Before running tests, set valid credentials in `.env`:
- `USER_USERNAME`, `USER_PASSWORD`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`

### 3) Open report

```bash
npm run report:open
```

### 4) Stop application stack (optional)

```bash
cd ../agro-management
docker compose down -v
```

## Available Test Suites

From `test-automation-framework/`:

- `npm run test:smoke` - smoke coverage
- `npm run test:ui` - UI-only tests
- `npm run test:api` - API-only tests
- `npm run test:security` - security/ownership checks
- `npx playwright test --grep @regression` - regression-tagged tests
- `npm test` - full run

## CI/CD (GitHub Actions)

Workflow: `test-automation-pr-gate.yml`

What CI does:
1. Installs Node + Playwright dependencies
2. Starts `agro-management` stack with Docker Compose
3. Waits for readiness (MySQL, Keycloak, app)
4. Seeds required roles/users for test execution
5. Runs selected suite
6. Uploads artifacts (`test-results`, `playwright-report`)
7. Deploys Playwright HTML report to GitHub Pages

Manual run supports suite selection:
- `smoke`
- `ui`
- `api`
- `regression`
- `security`
- `smoke+security`
- `full`

## Quality Gate Policy

- **Smoke**: strict gate (used for fast confidence checks)
- **Extended suites** (`security`, `full`, etc.): can be run as informational diagnostics

This allows showing real product defects without blocking all manual analytical runs.

## Tech Stack

- Playwright
- TypeScript
- Node.js
- Spring Boot (app under test)
- Docker / Docker Compose
- GitHub Actions
- GitHub Pages (report hosting)

## Report Link

Latest published Playwright report:

https://pavelarabadzhy.github.io/test-automation-framework-for-agromanagement/

