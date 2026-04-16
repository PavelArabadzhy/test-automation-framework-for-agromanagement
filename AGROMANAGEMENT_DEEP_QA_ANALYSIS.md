# AgroManagement: Deep QA/Architecture Analysis

Цей документ побудований на аналізі поточної реалізації у `AgroManagement` (Spring Boot + Thymeleaf + JPA + Spring Security) і орієнтований на підготовку production-рівня стратегії тест-автоматизації (UI + API), без написання тест-коду.

## 1. Архітектура

### 1.1 Структура пакетів

- `config`
  - `SecurityConfig` — 2 `SecurityFilterChain` (адмінська і дефолтна)
  - `ThymeleafConfig` — підключення `SpringSecurityDialect`
- `controller`
  - MVC-контролери для сторінок: `AuthController`, `HomeController`, `FarmController`, `FieldController`, `CropController`, `PlantingController`, `HarvestController`, `AdminController`
- `controller.rest`
  - REST API: `AuthRestController`, `FarmRestController`, `FieldRestController`, `CropRestController`, `PlantingRestController`, `HarvestRestController`
- `service`
  - Бізнес-логіка/оркестрація: `UserService`, `FarmService`, `FieldService`, `CropService`, `PlantingService`, `HarvestService`, `AdminService`, `CustomUserDetailsService`
- `repository`
  - `JpaRepository` + query methods/JPQL: `UserRepository`, `RoleRepository`, `FarmRepository`, `FieldRepository`, `CropRepository`, `PlantingRepository`, `HarvestRepository`
- `entity`
  - Модель домену: `User`, `Role`, `Farm`, `Field`, `Crop`, `Planting`, `Harvest`
- `resources/templates`
  - Thymeleaf UI + адмінські сторінки

### 1.2 Патерни

- `MVC` для server-rendered UI.
- `Service Layer` між контролерами і репозиторіями.
- `Repository pattern` через Spring Data JPA.
- `Entity-centric API` (REST приймає/віддає JPA-сутності напряму).
- `Role-based access control` (через Spring Security + `@PreAuthorize`).

### 1.3 End-to-end flow запиту

Типовий flow для UI:
1. Browser -> MVC Controller (`/farms`, `/fields`, ...).
2. Controller бере `Principal`, викликає Service.
3. Service викликає Repository (`findByOwnerUsername`, `save`, `findById`).
4. Repository -> DB (MySQL).
5. Результат повертається в Thymeleaf template.

Типовий flow для REST:
1. Client -> REST Controller (`/api/...`).
2. Controller робить базову owner-перевірку (часто вручну через `existing.getOwner().getUsername()`).
3. Service виконує save/delete/find.
4. Repository -> DB.
5. Controller повертає entity JSON або HTTP status.

### 1.4 Де відбувається бізнес-логіка

- Агрегати/метрики:
  - `HarvestService.getAverageYieldByMonth`
  - `AdminService.getAllUsersStats`, `mapToDto`
- Ownership/прив’язка:
  - `FarmService.saveFarm/deleteIfOwnedBy`
  - `FieldService.saveField/deleteIfOwnedBy`
  - `CropService.saveCrop/deleteIfOwnedBy`
  - `PlantingService.savePlanting/deleteIfOwnedBy`
  - `HarvestService.saveHarvest/deleteIfOwnedBy`

### 1.5 Потенційні точки тестування

- Розмежування доступу: рівень security-chain + owner checks.
- Коректність ланцюга сутностей: Farm -> Field -> Crop -> Planting -> Harvest.
- Data integrity при update/create з nested IDs.
- Поведінка редіректів і сторінок при неавторизованому/неправомірному доступі.

---

## 2. Аутентифікація та авторизація

### 2.1 Login/Register (UI)

- `GET /login` -> `AuthController.loginPage` -> `auth/login`.
- `POST /login` обробляється Spring Security form login.
- `GET /register` -> форма реєстрації.
- `POST /register`:
  - перевірка `existsByUsername`
  - `passwordEncoder.encode(...)`
  - додавання ролі `ROLE_USER` через `RoleRepository.findByName("ROLE_USER")`
  - save user
  - redirect: `redirect:/login?registered`

### 2.2 Login/Register (REST)

- `POST /api/auth/register` (`AuthRestController`):
  - перевіряє тільки username
  - створює `User` з username/password
  - викликає `userService.registerNewUser`
- `POST /api/auth/login`:
  - `AuthenticationManager.authenticate(...)`
  - `SecurityContextHolder.getContext().setAuthentication(authentication)`
  - повертає success message

### 2.3 Spring Security конфігурація

- `SecurityConfig.adminFilterChain`:
  - matcher `/admin/**`
  - `anyRequest().hasRole("ADMIN")`
  - form login defaults
- `SecurityConfig.defaultFilterChain`:
  - `permitAll`: `/`, `/login`, `/register`, `/css/**`, `/js/**`
  - інше: `authenticated`
  - custom successHandler:
    - admin -> redirect `/admin`
    - user -> redirect `/`
  - logout: `/logout`, success `/`

### 2.4 Ролі

- Задекларовано:
  - `ROLE_USER` (явно присвоюється при реєстрації)
  - `ROLE_ADMIN` (очікується в системі)
- Модель ролей: `User.roles` many-to-many `users_roles`.

### 2.5 Які endpoint-и захищені

- Публічні: `/`, `/login`, `/register`, статика.
- Потребують auth: всі інші URL включно з `/farms`, `/fields`, `/crops`, `/plantings`, `/harvests`, `/api/**`.
- Адмінські: `/admin/**` повинні вимагати admin.

### 2.6 Redirect/неавторизований доступ

- Неавторизований доступ до protected endpoint -> redirect на `/login` (form login).
- Logout -> redirect `/`.
- Після login:
  - admin -> `/admin`
  - user -> `/`

### 2.7 Потенційні дірки auth/access

1. `@PreAuthorize("hasRole('ADMIN')")` у `AdminController` без `@EnableMethodSecurity`.
   - У коді не знайдено ввімкнення method security.
   - Ризик: перевірка на рівні анотації може не працювати (покладаємось лише на `/admin/**` matcher).

2. У `index.html` використано `sec:authorize="hasRole('ROLE_ADMIN')"`.
   - Для `hasRole` очікується назва без префікса (`ADMIN`), інакше перевірка може бути некоректна.
   - Ризик: лінк на адмінку може не відображатися навіть admin.

3. REST login не видає JWT/token, лише кладe auth в `SecurityContextHolder`.
   - Для stateless API/зовнішніх клієнтів механіка неочевидна.

4. OAuth2/JWT залежності та OpenAPI bearer схема є, але фактична auth реалізація — form/session.
   - Архітектурна неузгодженість; високий ризик помилкових очікувань при API тестах.

---

## 3. Ownership (критично)

### 3.1 Як дані прив’язуються до користувача

- `Farm.owner` (many-to-one User)
- `Field.owner`
- `Crop.owner`
- `Harvest.owner`
- `Planting` не має прямого owner, ownership іде через `Planting.field.owner`.

### 3.2 Де перевіряється owner

- У REST контролерах перед update/delete/getById:
  - порівняння username з `Principal`.
- У MVC edit/delete:
  - аналогічні перевірки в controller (`if (entity.owner.username == principal.name)`).
- У service delete:
  - `deleteIfOwnedBy(...)` для всіх агрегатів.

### 3.3 Критичні вразливості/баги ownership

1. **Mass assignment owner при saveFarm/saveField/saveCrop**
   - `saveXxx` виставляє owner тільки якщо `owner == null`.
   - Якщо клієнт передасть `owner` в payload, сервіс залишає його.
   - Наслідок: можливе "перепризначення" власника (особливо в update flow).

2. **Field не перевіряє ownership farm**
   - `FieldService.saveField` не гарантує, що `field.farm` належить цьому ж user.
   - Можна створити field, прив’язавши його до чужої farm (через API payload із `farm.id`).

3. **PlantingService.savePlanting може змінити owner у Field**
   - Логіка:
     - якщо owner поля null або не дорівнює current user -> `planting.getField().setOwner(currentUser)`.
   - При передачі `field.id` чужого поля потенційно може відбутись небажане перепризначення owner через merge.
   - Це один з найбільш небезпечних сценаріїв для ізоляції даних.

4. **Harvest creation без перевірки principal ownership**
   - `HarvestController.saveHarvest` не приймає `Principal` і не робить owner check.
   - `HarvestRestController.createHarvest` теж не перевіряє, що `planting` належить current user.
   - `HarvestService.saveHarvest` ставить owner = owner поля з planting.
   - Можливий cross-tenant create/update за відомим `planting.id`.

5. **GET delete endpoints**
   - MVC delete (`/delete/{id}`) через `GET`.
   - З CSRF і небезпечними посиланнями ризик side-effect на GET (архітектурно погано).

---

## 4. Бізнес-сценарії (end-to-end)

### 4.1 Основний ланцюг Farm -> Field -> Crop -> Planting -> Harvest

#### Farm
- Створення:
  - UI: `GET /farms/add` -> `POST /farms/save`
  - API: `POST /api/farms`
- Залежності: owner (авто/або з payload).
- Що може піти не так:
  - owner spoofing через payload.
  - edit форми для не-owner повертають ту ж форму без явної помилки.

#### Field
- Створення:
  - UI: `GET /fields/add` (farm list користувача) -> `POST /fields/save`
  - API: `POST /api/fields`
- Залежності: `farm_id`, owner.
- Ризики:
  - відсутність валідації, що farm належить owner поля.
  - payload із чужою farm.

#### Crop
- Створення:
  - UI: `GET /crops/add` -> `POST /crops/save`
  - API: `POST /api/crops`
- Залежності: owner.
- Ризики:
  - `expectedYield` без server-side валідації (можливі від’ємні/екстремальні значення).

#### Planting
- Створення:
  - UI: `GET /plantings/add` (лише own fields/crops у селектах) -> `POST /plantings/save`
  - API: `POST /api/plantings`
- Залежності: `field_id`, `crop_id`, дати.
- Ризики:
  - немає перевірки, що crop належить користувачу поля.
  - можливе переприсвоєння owner поля в service.
  - немає валідації `expectedHarvestDate >= plantingDate`.

#### Harvest
- Створення:
  - UI: `GET /harvests/add` -> `POST /harvests/save`
  - API: `POST /api/harvests`
- Залежності: `planting_id`, `harvestDate`, `yieldAmount`.
- Ризики:
  - create/update без owner-check відносно current principal.
  - немає валідації `harvestDate >= plantingDate`, `yieldAmount > 0`.
  - можна створювати harvest по чужому planting ID.

### 4.2 Сценарій логіну

1. Користувач відкриває `/login`.
2. Вводить username/password.
3. Після успіху:
   - admin -> `/admin`
   - user -> `/`
4. На `/` авторизований користувач бачить навігаційні картки та графік.

### 4.3 Сценарій адміна

1. Admin login.
2. Redirect на `/admin` -> редиректиться на `/admin/users`.
3. Перегляд статистики users (`AdminService.getAllUsersStats`).
4. Редагування username/email через `/admin/users/{id}/edit`.

Ризики:
- метод-рівень `@PreAuthorize` може бути неактивним без method security.
- немає аудиту змін адміном.

### 4.4 Сценарій звітів

- Домашня сторінка для auth user будує лінійний графік урожайності по місяцях:
  - `HarvestRepository.findAvgYieldByMonth(username)`
  - `HomeController` готує labels/data
  - Chart.js відображає графік.

Ризики:
- при порожніх/аномальних даних треба перевірити рендер.
- можливі проблеми з форматом чисел/precision.

---

## 5. REST API: повна карта

Примітка: всі `/api/**` за конфігом потребують authenticated користувача (окрім явно permitAll, де `/api` не внесено).

### 5.1 Auth

1. `POST /api/auth/register`
- Auth: очікувано публічний, але за фактичним security може вимагати auth (бо не permitAll).
- Request:
  - `{ "username": "...", "password": "..." }`
- Response:
  - `201 { success: true, message: "User registered successfully" }`
  - `400 { success: false, message: "Username is already taken!" }`
- Edge case:
  - `User.email` обов’язковий (`nullable=false`), але в DTO register email відсутній -> можливий persistence error.

2. `POST /api/auth/login`
- Auth: очікувано публічний, але також може бути заблокований security.
- Request:
  - `{ "username": "...", "password": "..." }`
- Response:
  - `200 { success: true, message: "User authenticated successfully" }`
- Edge case:
  - не повертає token/session details для API-клієнта.

### 5.2 Farms (`FarmRestController`)

1. `GET /api/farms`
- Return: `List<Farm>` current user.

2. `GET /api/farms/{id}`
- Return: `Farm`.
- Ownership check: `farm.owner.username == principal.name`.
- Errors: `404`, `403`.

3. `POST /api/farms`
- Request body: `Farm` entity (`name`, `location`, optional nested owner).
- Return: created `Farm`.
- Ownership check: непрямий (через service assign only-if-null).

4. `PUT /api/farms/{id}`
- Request body: `Farm`.
- Ownership check: check existing owner до save.
- Ризик: overposting owner.

5. `DELETE /api/farms/{id}`
- Ownership check: є.
- Return: `204`.

### 5.3 Fields (`FieldRestController`)

1. `GET /api/fields`
- Return: `List<Field>` current user.

2. `GET /api/fields/{id}`
- Owner check: `field.owner.username`.

3. `POST /api/fields`
- Request: `Field` (`name`, `area`, `farm`).
- Ризик: farm ownership не валідується.

4. `PUT /api/fields/{id}`
- Owner check: existing field owner.
- Ризик: transfer owner/farm linkage issues.

5. `DELETE /api/fields/{id}`
- Owner check: є.

### 5.4 Crops (`CropRestController`)

1. `GET /api/crops`
2. `GET /api/crops/{id}` (owner check)
3. `POST /api/crops` (`name`, `expectedYield`)
4. `PUT /api/crops/{id}` (owner check)
5. `DELETE /api/crops/{id}` (owner check)

Edge cases:
- expectedYield від’ємний/нуль/дуже великий без валідації.

### 5.5 Plantings (`PlantingRestController`)

1. `GET /api/plantings`
2. `GET /api/plantings/{id}` (owner check через `field.owner`)
3. `POST /api/plantings`
4. `PUT /api/plantings/{id}` (owner check existing)
5. `DELETE /api/plantings/{id}` (owner check existing)

Edge cases:
- field і crop можуть бути різних owner.
- service змінює owner у field.

### 5.6 Harvests (`HarvestRestController`)

1. `GET /api/harvests`
2. `GET /api/harvests/{id}` (owner check через `planting.field.owner`)
3. `POST /api/harvests`
   - owner check на principal відсутній.
4. `PUT /api/harvests/{id}`
   - owner check по existing harvest є, але save з новим planting може змістити логіку.
5. `DELETE /api/harvests/{id}`
   - owner check є.

### 5.7 Де є owner check / де слабко

- Надійніші: `GET/PUT/DELETE /{id}` у REST для Farm/Field/Crop/Planting/Harvest (є explicit 403).
- Слабкі:
  - `POST` майже всіх ресурсів покладається на service assign і не захищений від overposting.
  - Harvest create/update — owner-прив’язка до planting, але без перевірки current user на create.

---

## 6. UI (Thymeleaf)

### 6.1 Сторінки

- Public/Auth:
  - `/` -> `index.html`
  - `/login` -> `auth/login.html`
  - `/register` -> `auth/register.html`
- Domain CRUD:
  - `farms/list`, `farms/form`
  - `fields/list`, `fields/form`
  - `crops/list`, `crops/form`
  - `plantings/list`, `plantings/form`
  - `harvests/list`, `harvests/form`
- Admin:
  - `admin/users`
  - `admin/edit-user`
  - `admin/dashboard` (схоже на legacy/непідключений шаблон)

### 6.2 Форми/таблиці/кнопки та що тестувати

1. `index.html`
- Кнопки Login/Register/Logout.
- Навігаційні картки на сутності.
- Графік Chart.js.
- Тести:
  - видимість елементів для anonymous/auth/admin.
  - перехід по картках.
  - коректність відображення графіка з/без даних.

2. `auth/login.html`
- username/password + submit.
- alerts по `param.error`, `param.logout`.
- Тести:
  - valid/invalid login.
  - redirect role-based.

3. `auth/register.html`
- username/email/password.
- Тести:
  - унікальність username.
  - email mandatory/format.
  - після успіху redirect на login.

4. CRUD list pages (farms/fields/crops/plantings/harvests)
- таблиці даних, edit/delete кнопки, add кнопка.
- Тести:
  - list only own data.
  - delete confirm + фактичне видалення.
  - переходи edit/add.

5. CRUD form pages
- required поля, select залежності (`farm`, `field`, `crop`, `planting`).
- Тести:
  - create/update happy-path.
  - required validation (мінімум HTML-level).
  - негативні сценарії з відсутніми/чужими залежностями (через API/маніпуляцію запиту).

6. `admin/users`, `admin/edit-user`
- таблиця статистики + редагування username/email.
- Тести:
  - access only admin.
  - update user даних.
  - відсутність доступу non-admin.

### 6.3 Де можуть бути баги в UI

- Відсутній явний обробник помилок для не-owner у частині edit форм (інколи просто повертається форма без model).
- Delete через `GET` links.
- Невідповідність `hasRole('ROLE_ADMIN')` у thymeleaf.
- Різнобій між `admin/users` і `admin/dashboard` (різні model attribute імена).

---

## 7. Тестові сценарії (детально)

## 7.1 Functional (UI)

Позитивні:
- Реєстрація нового користувача з валідними даними.
- Login user -> redirect `/`.
- Login admin -> redirect `/admin`.
- Повний бізнес-ланцюг:
  - create farm
  - create field (farm)
  - create crop
  - create planting (field + crop)
  - create harvest (planting)
  - перевірка на list pages + графік на `/`.
- Edit кожної сутності.
- Delete кожної сутності.

Негативні:
- Login з неправильним паролем.
- Register з існуючим username.
- Спроба відкрити protected page без auth -> redirect `/login`.
- Спроба non-admin перейти `/admin/users`.
- Редагування/видалення чужої сутності через прямий URL.

## 7.2 Functional (API)

Позитивні:
- CRUD для `/api/farms`, `/api/fields`, `/api/crops`, `/api/plantings`, `/api/harvests` в межах owner.
- `GET /api/.../{id}` повертає 200 для owner.
- `DELETE` повертає 204 і ресурс недоступний після видалення.

Негативні:
- GET/PUT/DELETE чужого `{id}` -> `403`.
- GET неіснуючого `{id}` -> `404`.
- Некоректні body (порожні поля, некоректні id зв’язків).
- Harvest create з чужим planting id (очікуваний дефект: система може дозволити).
- Field create з farm іншого owner (очікуваний дефект).

## 7.3 Edge cases

- Числові межі:
  - `field.area`: 0, від’ємне, дуже велике.
  - `crop.expectedYield`: 0, від’ємне, high precision.
  - `harvest.yieldAmount`: 0, від’ємне, > max precision.
- Дати:
  - `expectedHarvestDate < plantingDate`
  - `harvestDate < plantingDate`
  - leap day / timezone-related serialization.
- Відсутні залежності:
  - створення planting без field/crop.
  - створення harvest без planting.
  - посилання на неіснуючі FK id.

## 7.4 Security сценарії

- Горизонтальна ескалація:
  - user A намагається отримати/редагувати/видалити id user B.
- Overposting:
  - передача `owner` у body на create/update.
- Cross-entity mismatch:
  - planting: field of A + crop of B.
  - field: owner A + farm B.
- Auth bypass:
  - виклики `/api/auth/*` як anonymous (перевірити фактичну політику).
- CSRF behavior:
  - POST/PUT/DELETE через API без CSRF токена (якщо включено за замовчуванням).

---

## 8. Ризики і слабкі місця

### Найвищий пріоритет ризику

1. Ownership порушення на create/update (mass assignment, nested entity overposting).
2. `PlantingService.savePlanting` з потенційним переприсвоєнням owner у `Field`.
3. Harvest create без owner check щодо поточного користувача.
4. Конфіг security для `/api/auth/**` vs permitAll неочевидний/ймовірно помилковий.

### Де потрібна максимальна автоматизація

- Всі owner-sensitive сценарії (особливо write операції).
- Бізнес-ланцюг зі зв’язками між сутностями.
- Auth redirects + role-based routing.
- Admin access control + user edit.

### Де можливі flaky тести

- UI-графік на Chart.js (асинхронний рендер, таймінги).
- Tests, що залежать від порядку даних у таблицях без стабільного сортування.
- Тести з shared test-data без ізоляції користувачів.

---

## 9. Рекомендації для автоматизації

### 9.1 Що тестувати через UI

- Критичні user journeys:
  - register/login/logout,
  - повний Farm -> Field -> Crop -> Planting -> Harvest flow,
  - admin users management.
- Базові smoke на всі list/form сторінки.
- Рольові відмінності в інтерфейсі (видимість/редіректи).

### 9.2 Що тестувати через API

- Повний матрикс ownership (owner vs non-owner для кожного endpoint).
- Негативні/edge сценарії валідації payload.
- Referential integrity кейси (чужі/неіснуючі FK).
- Security кейси (403/404/401 behavior).

### 9.3 Що не варто автоматизувати (або нижчий пріоритет)

- Піксель-перфект візуальне тестування всіх Bootstrap сторінок.
- Деталі стилів/іконок, що не впливають на бізнес-цінність.
- Розширені performance сценарії UI на цьому етапі (краще після стабілізації access/ownership).

### 9.4 Архітектурні покращення (для стабільної автоматизації)

- Ввести DTO для REST input/output (не приймати JPA entities напряму).
- Централізувати ownership-перевірки (service-level policy / AOP / permission evaluator).
- Увімкнути method security (`@EnableMethodSecurity`) і уніфікувати role checks.
- Додати bean validation (`@NotBlank`, `@Email`, `@Positive`, custom date validators).
- Перейти delete дії в UI на `POST/DELETE` замість `GET`.
- Узгодити auth модель: або session/form для UI, або повноцінний JWT для API.

---

## Додаткові помітки для QA стратегії

- У конфігах присутні хардкод credentials DB у `application.yml`/`application.properties` — це окремий security risk і потенційний блокер для безпечних test environments.
- Є неузгоджені/legacy елементи (`admin/dashboard.html`, OAuth/JWT dependencies vs реальна auth flow), що треба врахувати при стабілізації вимог перед побудовою фреймворку.

