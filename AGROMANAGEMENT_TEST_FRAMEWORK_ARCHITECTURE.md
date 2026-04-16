# AgroManagement Test Framework Architecture (Playwright + TypeScript)

Цей документ описує production-рівневий дизайн тестового фреймворку для `AgroManagement` (Spring Boot + Thymeleaf + REST API), з фокусом на:
- UI автоматизацію,
- API автоматизацію,
- перевірку бізнес-логіки,
- перевірку ownership/security.

Без реалізаційного коду — тільки архітектура, підхід і структура.

---

## 1) Загальна архітектура фреймворку

### 1.1 Принципи дизайну

- **Single test runner**: Playwright як єдина точка запуску UI + API.
- **Dual testing model**:
  - UI сценарії через POM + fixtures.
  - API сценарії через service clients + contract/ownership checks.
- **Risk-based coverage**: окремі пакети для критичних зон (ownership, auth, business chain).
- **Deterministic isolation**: кожен тест автономний, керує власними test data.
- **Traceability**: кожен тест прив’язаний до бізнес-ризику та шару системи.

### 1.2 Логічні шари

1. **Tests Layer**
   - бізнес-сценарії, smoke/regression/critical suites.
2. **Abstraction Layer**
   - UI: Page Objects, Components, Flows.
   - API: Clients, Domain services, API flows.
3. **Infrastructure Layer**
   - fixtures, config, env management, data factory, cleanup orchestration.
4. **Observability Layer**
   - reporting, artifacts, logs, debug context.

### 1.3 Розділення UI та API

- **UI tests**: перевіряють те, що бачить користувач (Thymeleaf, форми, редіректи, role-based UI).
- **API tests**: перевіряють поведінку endpoint-ів, статуси, ownership, security.
- **Hybrid tests**: API setup + UI verification (найефективніші для стабільності та швидкості).

### 1.4 Взаємодія частин

- `tests/*` викликають:
  - `fixtures/*` для сесій/даних,
  - `pages/*` для UI кроків,
  - `api/*` для setup/assert/cleanup.
- `fixtures` використовують:
  - `api/clients` для створення/видалення тестових сутностей,
  - `data/factories` для побудови payload.
- `utils` дає спільні інструменти:
  - retry, polling, assertion helpers, id tracking.

---

## 2) Структура проєкту

Нижче рекомендована структура для фреймворку.

- `tests/`
- `pages/`
- `api/`
- `fixtures/`
- `utils/`
- `config/`
- `data/`

### 2.1 `tests/`

**Що лежить:**
- усі тест-спеки, структуровані по доменах і пріоритетах.

**Приклади файлів:**
- `tests/smoke/auth.smoke.spec.ts`
- `tests/smoke/business-chain.smoke.spec.ts`
- `tests/regression/ui/farms.regression.spec.ts`
- `tests/regression/api/farms.api.regression.spec.ts`
- `tests/security/ownership/field-ownership.security.spec.ts`
- `tests/critical/harvest-cross-owner.critical.spec.ts`

**Відповідальність:**
- тільки сценарій і перевірки високого рівня;
- без низькорівневої логіки запитів/селекторів.

### 2.2 `pages/`

**Що лежить:**
- Page Object Model для доменних сторінок і форм.

**Приклади файлів:**
- `pages/auth/LoginPage.ts`
- `pages/auth/RegisterPage.ts`
- `pages/home/HomePage.ts`
- `pages/farm/FarmListPage.ts`
- `pages/farm/FarmFormPage.ts`
- `pages/field/FieldListPage.ts`
- `pages/planting/PlantingFormPage.ts`
- `pages/harvest/HarvestFormPage.ts`
- `pages/admin/AdminUsersPage.ts`

**Відповідальність:**
- інкапсуляція селекторів і UI-взаємодій;
- стабільні дії над сторінками;
- читабельні бізнес-операції (createFarm, createField, etc.).

### 2.3 `api/`

**Що лежить:**
- API-клієнти, типи запитів/відповідей і domain services.

**Приклади файлів:**
- `api/clients/AuthClient.ts`
- `api/clients/FarmClient.ts`
- `api/clients/FieldClient.ts`
- `api/clients/CropClient.ts`
- `api/clients/PlantingClient.ts`
- `api/clients/HarvestClient.ts`
- `api/services/OwnershipService.ts`
- `api/contracts/*.schema.ts` (або json schema metadata)

**Відповідальність:**
- централізований доступ до REST API;
- ownership/security API checks;
- швидкий setup/teardown через API.

### 2.4 `fixtures/`

**Що лежить:**
- кастомні Playwright fixtures (auth context, domain entities, cleanup context).

**Приклади файлів:**
- `fixtures/base.fixture.ts`
- `fixtures/auth.fixture.ts`
- `fixtures/domain.fixture.ts`
- `fixtures/cleanup.fixture.ts`
- `fixtures/roles.fixture.ts` (admin/user contexts)

**Відповідальність:**
- lifecycle тесту (`beforeEach/afterEach`) без дублювання;
- видача тесту готових інструментів: `loggedInUser`, `apiClients`, `entityFactory`, `cleanup`.

### 2.5 `utils/`

**Що лежить:**
- загальні утиліти, незалежні від конкретних тестів.

**Приклади файлів:**
- `utils/idGenerator.ts`
- `utils/dateUtils.ts`
- `utils/retry.ts`
- `utils/polling.ts`
- `utils/assertions.ts`
- `utils/ownershipMatrix.ts`
- `utils/logger.ts`

**Відповідальність:**
- усунення дублювання;
- стабілізація flaky-зон через стандартизовані helper-и.

### 2.6 `config/`

**Що лежить:**
- Playwright project config, env profiles, test matrix config.

**Приклади файлів:**
- `config/playwright.base.config.ts`
- `config/playwright.ci.config.ts`
- `config/projects.config.ts` (ui/api/chromium/firefox)
- `config/env/dev.env.ts`
- `config/env/stage.env.ts`

**Відповідальність:**
- централізоване керування середовищами;
- паралелізація, retries, artifacts policy.

### 2.7 `data/`

**Що лежить:**
- test data templates, factories, role accounts metadata.

**Приклади файлів:**
- `data/factories/UserFactory.ts`
- `data/factories/FarmFactory.ts`
- `data/factories/BusinessChainFactory.ts`
- `data/mappings/roleCapabilities.ts`

**Відповідальність:**
- контрольована генерація валідних/невалідних наборів;
- підтримка повторюваності тестів.

---

## 3) Підхід до UI тестування

### 3.1 POM стратегія

- **Один page class = один екран**.
- **No raw selectors in tests**: тести звертаються тільки до methods POM.

### 3.2 Організація сторінок AgroManagement

- Auth:
  - `LoginPage`, `RegisterPage`
- Core:
  - `HomePage`
  - `FarmListPage`, `FarmFormPage`
  - `FieldListPage`, `FieldFormPage`
  - `CropListPage`, `CropFormPage`
  - `PlantingListPage`, `PlantingFormPage`
  - `HarvestListPage`, `HarvestFormPage`
- Admin:
  - `AdminUsersPage`, `AdminEditUserPage`

### 3.3 Селектори (best practices під Thymeleaf)

- Пріоритет:
  1. `data-testid` (рекомендовано додати в app, якщо можливо),
  2. role/accessible name,
  3. stable text for domain labels,
  4. CSS лише як fallback.
- Не використовувати:
  - глибокі CSS chain-и,
  - індекси в таблицях без domain anchors.
- Для таблиць CRUD:
  - пошук рядка по унікальному бізнес-ідентифікатору (name + generated suffix).

### 3.4 Anti-flaky підхід

- Explicit waits тільки на бізнес-стан (видимість форми, навігація, toast/alert/row presence).
- Жодних `hard sleep`.
- API-first setup для важких UI підготовок.
- Ізольовані data namespaces (унікальні суфікси).
- Controlled retries:
  - retry дозволено лише на інфраструктурні помилки, не на assertion logic defects.

---

## 4) Підхід до API тестування

### 4.1 API clients дизайн

- Кожен ресурс має свій client:
  - `AuthClient`, `FarmClient`, `FieldClient`, `CropClient`, `PlantingClient`, `HarvestClient`.
- Clients мають:
  - strongly-typed request builders,
  - response normalization,
  - стандартні перевірки status + error envelope.

### 4.2 Робота з REST endpoints

- Три рівні перевірок:
  1. **Protocol-level**: статуси, заголовки, формат.
  2. **Contract-level**: структура payload/response.
  3. **Business-level**: ownership, consistency ланцюга сутностей.

### 4.3 Ownership і security тестування

- Ввести **ownership matrix** для кожного endpoint:
  - owner access expected,
  - non-owner access expected,
  - anonymous expected.
- Окремо фокус:
  - overposting owner у body,
  - cross-entity linking (чужі farm/field/planting),
  - auth bypass для `/api/auth/*`,
  - статус-коди `401/403/404` у правильних випадках.

### 4.4 API для setup/teardown

- Setup через API:
  - швидке створення users + chain entities.
- Teardown через API:
  - видалення сутностей у правильному порядку.
- Якщо API cleanup недостатній:
  - fallback cleanup strategy через DB maintenance job (контрольований, не у кожному тесті).

---

## 5) Тестові сценарії і структура тестів

### 5.1 Функціональні блоки

1. `auth`
   - register/login/logout, redirects, role behavior.
2. `crud`
   - UI + API CRUD по Farm/Field/Crop/Planting/Harvest.
3. `business-flow`
   - повний ланцюг Farm -> Field -> Crop -> Planting -> Harvest.
4. `security`
   - ownership, access control, overposting, forbidden paths.

### 5.2 Розбиття за наборами

- **Smoke**
  - мінімальний критичний шлях:
    - login,
    - базовий create/read по ключових сутностях,
    - health-check API.
- **Critical**
  - ownership/security + бізнес-ланцюг + admin access.
- **Regression**
  - повний набір позитивних/негативних/edge сценаріїв.

### 5.3 Маркування і запуск

- Tags/annotations:
  - `@smoke`, `@critical`, `@regression`, `@security`, `@ownership`, `@api`, `@ui`.
- Запуск:
  - PR: smoke + critical.
  - nightly: full regression.

---

## 6) Fixtures і test setup

### 6.1 Login fixture

Ролі:
- `anonymousContext`
- `userContext`
- `adminContext`

Підхід:
- Session reuse через storage state (для UI).
- API auth context окремо для API clients.
- Multi-user fixture для ownership tests (owner vs foreign user).

### 6.2 Створення тестових даних

- Domain fixture видає:
  - `createFarm`, `createField`, `createCrop`, `createPlanting`, `createHarvest`.
- Data factory генерує унікальні значення + контрольовані edge payload.
- Ведеться реєстр створених ID для cleanup.

### 6.3 Ізоляція тестів

- One-test-one-dataset policy.
- Заборона залежності на дані від попередніх тестів.
- Імена сутностей з префіксом run-id/test-id.

### 6.4 Уникнення міжтестових залежностей

- Заборонити global mutable state.
- Ніяких shared entities між воркерами.
- Cleanup навіть при падінні теста (best-effort + deferred cleanup job).

---

## 7) Робота з даними

### 7.1 Test data management

- Типи даних:
  - `baseline valid`,
  - `negative invalid`,
  - `security payloads`,
  - `boundary values`.
- Джерела:
  - factories (динаміка).

### 7.2 Генерація даних

- Унікалізація через timestamp + random suffix.
- Для edge cases — deterministic seeds.
- Для chain:
  - генерація повного graph metadata з посиланнями між id.

### 7.3 Cleanup стратегія

Primary:
- API-based cleanup у зворотному порядку залежностей:
  - Harvest -> Planting -> Field/Crop -> Farm.

Fallback:
- Плановий DB cleanup для тестового environment.
- TTL-очистка orphaned test entities за префіксом.

---

## 8) Логування і звіти

### 8.1 Playwright artifacts policy

- Зберігати:
  - html report,
  - trace on failure,
  - screenshot on failure,
  - video on retry/failure.
- Для critical/security suites:
  - зберігати trace завжди в CI nightly.

### 8.2 Логування помилок

- Structured logs:
  - suite/test id,
  - user role,
  - endpoint/page,
  - request/response summary (без секретів),
  - created entity ids.

### 8.3 Debug контекст

- На падінні тесту автоматично додавати:
  - останній URL,
  - auth role/state,
  - relevant entity graph snapshot,
  - останні API interactions.

---

## 9) CI/CD інтеграція

### 9.1 GitHub Actions pipeline дизайн

Рекомендовані jobs:
1. `lint-and-check` (TS checks, config validation).
2. `smoke-ui-api` (PR gate).
3. `critical-security` (PR gate або protected branch).
4. `nightly-regression` (cron).
5. `report-publish` (artifacts + summary comment).

### 9.2 Стратегія запусків

- PR:
  - швидкий набір (smoke + critical ownership/security).
- Merge to main:
  - розширений critical + selected regression.
- Nightly:
  - full regression matrix.

### 9.3 Потрібні конфігурації

- Secrets:
  - `BASE_URL`, test users creds, API auth params.
- Environment profiles:
  - dev/stage with isolated test data.
- Concurrency controls:
  - уникати паралельних запусків у спільному середовищі без namespace isolation.

---

## 10) Execution Strategy

### 10.1 Локальний запуск

- Базовий принцип:
  - локально запускаються ті самі suites і теги, що і в CI (щоб уникати "works on my machine").
- Рекомендований baseline-процес:
  1. Перевірити активне середовище (`dev` або `stage`).
  2. Запустити короткий smoke перед великими наборами.
  3. Далі запускати тільки потрібний slice (`api`, `ui`, `security`).

Приклади команд:
- smoke весь фреймворк:
  - `npx playwright test --grep @smoke`
- тільки API:
  - `npx playwright test --project=api --grep @api`
- тільки UI:
  - `npx playwright test --project=ui --grep @ui`
- critical security:
  - `npx playwright test --grep "@critical|@security"`
- конкретний домен:
  - `npx playwright test tests/regression/api/plantings.api.regression.spec.ts`

### 10.2 Запуск у CI

- PR pipeline:
  - запускати `@smoke` + `@critical` + `@security` (мінімальний gate).
- Main pipeline:
  - запускати розширений regression subset.
- Nightly:
  - full matrix (`ui` + `api`, за потреби multi-browser).
- Для стабільності:
  - обмежений `workers` у shared environment,
  - retry тільки у CI і тільки на рівні інфраструктурної нестабільності.

### 10.3 Перемикання середовищ (`dev`/`stage`)

- Конфігурація середовища повинна бути зовнішньою:
  - через env variables + `config/env/*.env.ts`.
- Мінімальний набір перемикачів:
  - `TEST_ENV=dev|stage`
  - `BASE_URL`
  - `API_BASE_URL`
  - credentials/secret refs.
- Важливо:
  - жодних hardcoded URL/credentials у тестах або POM.

Приклади команд:
- smoke на `dev`:
  - `TEST_ENV=dev npx playwright test --grep @smoke`
- api regression на `stage`:
  - `TEST_ENV=stage npx playwright test --project=api --grep @regression`
- ui critical на `stage`:
  - `TEST_ENV=stage npx playwright test --project=ui --grep @critical`

### 10.4 Стратегія вибору набору запуску

- Перед merge request:
  - `smoke + critical ownership/security`.
- Перед релізом:
  - повний `regression` + targeted re-run на ризикові домени (`plantings`, `harvests`, `admin`).
- Після виправлення security/ownership багів:
  - обов’язковий запуск `@security` + `@ownership` suite.

---

## 11) Naming Conventions

### 11.1 Test files

- Шаблон:
  - доменний стиль: `<domain>/<domain>.spec.ts`
- Приклади:
  - `tests/api/farm/farm.spec.ts`
  - `tests/ui/planting/planting.spec.ts`
  - `tests/security/harvest/harvest.security.spec.ts`
- Правила:
  - назва відображає домен і тип перевірки;
  - пріоритет/набір керується тегами (`@smoke`, `@critical`, `@regression`, `@security`, `@ownership`).

### 11.2 Page Objects

- Шаблон:
  - `<Domain><Screen>Page.ts`
- Приклади:
  - `LoginPage.ts`, `FarmListPage.ts`, `HarvestFormPage.ts`, `AdminUsersPage.ts`

### 11.3 API clients

- Шаблон:
  - `<Domain>Client.ts`
- Приклади:
  - `FarmClient.ts`, `PlantingClient.ts`, `AuthClient.ts`
- Правило:
  - один client = один ресурс API/aggregate boundary.

### 11.4 Factories

- Шаблон:
  - `<Domain>Factory.ts`
- Приклади:
  - `FarmFactory.ts`, `BusinessChainFactory.ts`, `UserFactory.ts`
- Правило:
  - factory повертає payload/data-object, але не виконує HTTP або UI-дій.

### 11.5 Fixtures

- Шаблон:
  - `<context>.fixture.ts`
- Приклади:
  - `auth.fixture.ts`, `domain.fixture.ts`, `cleanup.fixture.ts`
- Правило:
  - fixture name відповідає lifecycle responsibility, не доменній бізнес-логіці.

---

## 12) Anti-Patterns (What to avoid)

### 12.1 Hardcoded waits

Що не можна:
- `waitForTimeout(5000)` як основний механізм синхронізації.

Що робити замість:
- чекати бізнес-стан:
  - navigation completed,
  - таблиця містить новий рядок,
  - API повернув очікуваний статус/стан.

### 12.2 Дублювання селекторів

Що не можна:
- копіювати ті самі локатори у багато test files.

Що робити замість:
- один локатор живе в одному Page/Component object.
- зміна DOM -> правка в одному місці.

### 12.3 Змішування UI/API логіки

Що не можна:
- робити HTTP-запити напряму всередині page object,
- клікати UI елементи всередині API clients.

Що робити замість:
- чітка межа:
  - `pages/*` тільки UI,
  - `api/*` тільки HTTP/контракти,
  - orchestration у tests/fixtures.

### 12.4 Залежності між тестами

Що не можна:
- тест B очікує, що тест A вже створив дані.

Що робити замість:
- кожен тест створює свої дані через fixtures/factories.
- cleanup виконується незалежно від статусу інших тестів.

### 12.5 Непрозорі імена та теги

Що не можна:
- назви на кшталт `test1.spec.ts`, `misc.spec.ts`.
- теги без стандарту або випадковий набір тегів.

Що робити замість:
- суворий naming standard + узгоджений набір тегів (`@smoke`, `@critical`, `@regression`, `@api`, `@ui`, `@security`, `@ownership`).

---

## 13) Best Practices

### 13.1 Стабільні тести

- Тест = одна відповідальність.
- Assertions на бізнес-результат, а не проміжні UI-ефекти.
- API setup + UI assert для швидкості та стабільності.

### 13.2 Anti-flaky

- Використовувати deterministic test data.
- Мінімізувати залежність від порядку в таблицях.
- Не покладатися на локалізовані тексти без fallback locator strategy.

### 13.3 Масштабування

- Нова сутність = новий page + client + factory + test slices.
- Центральний ownership/security rulebook.
- Версіонований підхід до factories при зміні контрактів API.

---

## 14) Як дизайн враховує особливості AgroManagement

### 14.1 Ownership логіка

Framework explicitly включає:
- multi-user fixtures (owner/non-owner/admin),
- ownership matrix для кожного REST endpoint,
- UI direct-link abuse scenarios (`/edit/{id}`, `/delete/{id}`),
- cross-entity consistency checks (farm-field-crop-planting-harvest).

### 14.2 Security ризики з попереднього аналізу

Покриття ризиків:
- overposting `owner` в create/update payload,
- потенційні прогалини в `POST /api/*` ownership checks,
- перевірка доступності `/api/auth/*` для anonymous (фактична поведінка),
- role-based redirects (`/admin` vs `/`),
- non-owner доступ до чужих даних (`403/404` контракт).

### 14.3 Бізнес-ланцюг Farm -> Harvest

Дизайн додає окремий **Business Chain Test Module**:
- happy path chain validation,
- негативні кейси по пропущених/чужих залежностях,
- data integrity перевірки після CRUD операцій,
- синхронна перевірка UI + API стану одного й того ж graph.

---

## Рекомендований порядок реалізації (без коду)

1. Базовий каркас проєкту + config/env.
2. API clients + data factories + cleanup engine.
3. Auth fixtures + multi-role contexts.
4. POM для auth/home/farm/field/crop.
5. Бізнес-ланцюг (planting/harvest) + critical ownership tests.
6. Smoke suite у CI.
7. Розширення до regression + nightly.

---

## Definition of Ready для старту реалізації

- Узгоджені test environments (dev/stage).
- Виділені тестові акаунти ролей.
- Підтверджені правила cleanup.
- Узгоджений мінімальний критичний набір (`smoke + critical`).
- Зафіксований ownership/security expected behavior по endpoint-ам.

