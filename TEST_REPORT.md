# Restaurant App — QA Test Report

Date: 2026-10-14
Scope: frontend (React + Vite), backend (Django + DRF), database, REST APIs,
full ordering flow, and the menu background image.

All tests were generated from the existing source and executed locally. Tests
target the **isolated test database / mocked network** only — no production
configuration was modified and no secrets are printed in this report.

---

## 1. Summary

| Area | Tooling | Result |
| --- | --- | --- |
| Backend unit + API tests | Django `manage.py test` | **58 / 58 passed** |
| Database checks | `manage.py check`, `makemigrations --check`, `showmigrations` | **Pass** (0 issues, no missing migrations, 13/13 applied) |
| Frontend tests | Vitest + React Testing Library | **52 / 52 passed** (13 files) |
| Frontend lint | `oxlint` | **Pass** (no findings) |
| Frontend production build | `vite build` | **Pass** (built successfully) |
| Background image | file + CSS + HTTP probe | **Pass** (served HTTP 200, 73,971 bytes) |
| Cross-project endpoint check | Vitest (derives endpoints from URLconf) | **Pass** (every frontend call maps to a real backend route) |
| Live service probe (read-only) | `GET /api/foods/`, `/api/active-users/` | **Reachable**; 81 foods, 2 active users; unauthenticated admin endpoints return 401 |

Total automated tests: **110** (58 backend + 52 frontend).

> ℹ️ **Corrected tally.** An earlier pass reported "51 / 51 backend passed".
> That run used `manage.py test restaurant.test_qa`, which hid a problem: the
> stray script `RestaurantBackend/test_order_auth.py` matched the `test*.py`
> discovery pattern, was imported by the runner, tried to hit a live
> `127.0.0.1:8000`, and produced `FAILED (errors=1)` on a plain
> `manage.py test`. That script (and `check_post.py`) has been deleted, so the
> documented `manage.py test` command is now genuinely clean (58/58).


> 🔴 **CRITICAL — customer data is publicly exposed.** The GitHub repo is
> **public** and `RestaurantBackend/db.sqlite3` (deployed to Render) contains
> **6 users** (emails + password hashes) and **35 orders**. The hardcoded
> `SECRET_KEY` is also public, allowing JWT forgery. Make the repo private and
> rotate `SECRET_KEY` first.
>
> ⚠️ **DO NOT sync the Render Blueprint or deploy yet.** Production runs on an
> **ephemeral SQLite** file (proven in [section 9](#9-production-database-findings-backup-and-migration-runbook));
> any deploy/restart wipes it. A safe backup already exists in
> `backups/` — see section 9 for the migration runbook and exact manual steps.

---

## 2. Environment

- OS: Windows (win32), PowerShell 5.1
- Node: v24.17.0, npm: 11.13.0
- Python: 3.14.4, Django 6.0.8, DRF 3.17.1, SimpleJWT 5.5.1
- Frontend API base URL is read from `VITE_API_URL` (not hardcoded in tests)
- `DATABASE_URL` was explicitly forced to a local SQLite URL for the test run,
  and Django used its automatic in-memory test database.

---

## 3. Backend tests — `RestaurantBackend/restaurant/test_qa.py`

Command:

```powershell
$env:DATABASE_URL = "sqlite:///:memory:"
& ".\venv\Scripts\python.exe" manage.py test
```

The full runner (no label filter) is used now that the stray live-HTTP script
is gone; it discovers and passes all 58 tests.

| Test class | Tests | Covers |
| --- | --- | --- |
| `ModelTests` | 7 | Food/Order defaults, `__str__`, Profile phone uniqueness, OTP, UserSession, Review/Contact |
| `SerializerTests` | 4 | Food price/name validation, user creation with Profile, duplicate phone rejection |
| `FoodAPITests` | 5 | Public list/create, category filter, search, invalid price |
| `AuthFlowTests` | 3 | Register → token → refresh, invalid login, duplicate phone |
| `OrderAPITests` | 10 | Auth required, user auto-assignment, per-user isolation, cross-user 404, pay/cancel PATCH, non-positive quantity rejected, unavailable food rejected, food immutable on PATCH, quantity PATCH re-prices |
| `OrderingFlowTests` | 1 | Full lifecycle: register → token → list foods → create order → pay → list → cancel |
| `ReviewAPITests` | 3 | Auth required, user assignment + isolation, out-of-range rating rejected |
| `ContactAPITests` | 2 | Auth required, user assignment |
| `ProfileAndDashboardTests` | 6 | profile / user-info / dashboard-stats + auth guards + staff flag |
| `SessionTrackingTests` | 5 | track-login/logout, public active-users, user-logins staff gating |
| `OtpResetTests` | 5 | Unknown phone 404, no OTP leak, reset-requires-token, bad token, send → verify → reset → re-login |
| `EmailConfigurationTests` | 2 | `send-otp` returns 503 when email is unconfigured; returns OTP in DEBUG |
| `DatabaseTests` | 2 | Connection (`SELECT 1`), expected tables exist |
| `ForeignKeyIntegrityTests` | 1 | Invalid `food_id` FK raises `IntegrityError` (TransactionTestCase) |
| `FieldValidationTests` | 2 | Model validators: `Order.quantity >= 1`, `Review.rating` in 1..5 |

Endpoints were resolved with Django's `reverse()` (names taken from
`restaurant/urls.py` and `RestaurantBackend/urls.py`), not hardcoded guesses.

### Database checks

```
manage.py check                      -> System check identified no issues (0 silenced)
manage.py makemigrations --check     -> No changes detected (exit 0)
manage.py showmigrations restaurant  -> 0001..0013 all applied [X]
```

---

## 4. Frontend tests — `Restaurant/src/__tests__/`

Command: `npm test` (Vitest, jsdom)

| File | Tests | Covers |
| --- | --- | --- |
| `static-structure.test.js` | 23 | All 16 page files exist; all routes present in `App.jsx`; `App.css` import guard; **endpoint consistency vs backend URLconf**; background image file + CSS reference + `.menu-page` wiring; `.food-img` sizing guard |
| `Home.test.jsx` | 1 | Hero heading and menu links |
| `FoodCard.test.jsx` | 2 | Render + add-to-cart (append behavior) |
| `Cart.test.jsx` | 2 | Empty state; list/total/remove |
| `Checkout.test.jsx` | 3 | Empty-cart guard; login-required guard; one POST per item without `total_price` |
| `Login.test.jsx` | 3 | Form render; token storage on success; no-token response handling |
| `Register.test.jsx` | 2 | Fields render; submit payload |
| `Menu.test.jsx` | 4 | Load from API; category filter; search filter; loading state |
| `Orders.test.jsx` | 2 | Empty state; row + action buttons |
| `Contact.test.jsx` | 4 | Info render; validation; login-required; successful send |
| `ForgotPassword.test.jsx` | 2 | OTP request flow; reset-token submission |
| `ProtectedRoute.test.jsx` | 2 | Redirect without token; render with token |
| `AdminRoute.test.jsx` | 2 | Redirect non-staff; render staff |

The endpoint-consistency test parses the backend `urls.py` files, builds the
set of real routes, scans every `API.<verb>(...)` call in `src/`, and fails if
any call targets a route that does not exist.

---

## 5. Background image verification

| Check | Result |
| --- | --- |
| `Restaurant/public/restaurant-bg.jpg` exists and > 1 KB | Pass (73,971 bytes) |
| `App.css` references `url("/restaurant-bg.jpg")` | Pass |
| `Menu.jsx` renders `className="menu-page"` and `.menu-page` is defined | Pass |
| Dev server HTTP probe `GET /restaurant-bg.jpg` | Pass (HTTP 200) |
| Production build contains `restaurant-bg` rule | Pass (verified in bundled CSS) |

Background URL: <http://localhost:5173/menu>

### Food image sizing (fixed)

Food thumbnails previously rendered as a fixed **120×120** square centered
inside a full-width card, leaving grey bars on both sides and an image much
smaller than its card. `FoodCard.jsx` sources images from
`src/Data/FoodImages.js` — a static Unsplash map keyed by dish name with a
per-category fallback; all 84 URLs request `w=400`. The backend `Food.image`
`ImageField` is **not used by the frontend** (see finding 18).

`.food-img-wrapper` / `.food-img` in `src/App.css` now use a `180px`-tall
container with `width:100%; height:100%; object-fit:cover`, so thumbnails fill
the card uniformly without distortion. A static test guards the rule.

---

## 6. Findings

### Fixed during this work
1. **`App.css` was never imported** — the entire custom stylesheet (menu
   background, food cards, buttons, tables, etc.) was dead code, so the app
   fell back to Bootstrap defaults. Fixed by adding `import "./App.css";` in
   `src/App.jsx`.

### High-severity issues — FIXED (follow-up pass)
2. **`reset-password/` did not require a verified OTP** (account takeover).
   `verify-otp/` now returns a short-lived signed `reset_token`
   (10-minute expiry), and `reset-password/` rejects any request without a
   valid token. See `restaurant/views.py`.
3. **`send-otp/` leaked the OTP in the response.** It is now included only when
   `DEBUG` is on (and logged to the console for local dev). In production the
   OTP is emailed via the configured SMTP settings.
4. **`user-logins/` and `dashboard-stats/` were open to any authenticated
   user.** Both now require staff (`IsAdminUser`).
5. **Order `total_price` was trusted from the client.** It is now read-only in
   the serializer and always computed server-side as `food.price * quantity`.
6. **`/orders` and `/order-history` routes were unprotected.** Both are now
   wrapped in `ProtectedRoute` in `src/App.jsx`.
7. **Hardcoded `SECRET_KEY` and placeholder email credentials.** `settings.py`
   now reads `DJANGO_SECRET_KEY`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`,
   and `EMAIL_HOST_PASSWORD` from the environment (with dev fallbacks).
8. **Ephemeral SQLite on Render (data loss on redeploy).** `render.yaml` now
   provisions a managed PostgreSQL database and injects `DATABASE_URL` plus a
   generated `DJANGO_SECRET_KEY` into the web service.

### Additional fixes (verification pass)
9. **`send-otp/` reported false success when email was unconfigured.** It now
   returns `503` with a clear message instead of a misleading "OTP sent"
   (only when `DEBUG` is off). Covered by `EmailConfigurationTests`.
10. **`render.yaml` had no email variables.** Added `EMAIL_HOST`, `EMAIL_PORT`,
    `EMAIL_HOST_USER` (`sync: false`), and `EMAIL_HOST_PASSWORD` (`sync: false`)
    so a future Blueprint sync prompts for credentials in the dashboard.
11. **Local SQLite could be committed** (`.gitignore` only covered `.vercel` and
    `.env*`). Added `*.sqlite3`, `__pycache__/`, `*.py[cod]`, `venv/`, and
    `staticfiles/` to `.gitignore`.

### Hardening & cleanup pass (this pass) — DONE
12. **Tracked `__pycache__/*.pyc` files** (including migration caches). Removed
    from the index with `git rm -r --cached`; now covered by `.gitignore`.
13. **Stray helper scripts** `RestaurantBackend/check_post.py` and
    `test_order_auth.py`. Deleted. `test_order_auth.py` matched the `test*.py`
    pattern and made a plain `manage.py test` fail with `errors=1`.
14. **Dead nested Django project** `RestaurantBackend/backend/` (tracked but
    unreferenced; `manage.py`/`Procfile`/`render.yaml` all use
    `RestaurantBackend.wsgi`). It contained its own hardcoded
    `django-insecure-…` `SECRET_KEY`. Deleted.
15. **Stray `restaurant/models.py.new`** (tracked editor backup). Deleted.
16. **`Checkout` sent `total_price`** and logged payloads to the console. Fixed:
    payload is now `{food, quantity}` only, `console.log` calls removed, and an
    empty-cart guard was added. `/checkout` is now also wrapped in
    `ProtectedRoute`.
17. **`STORAGES` / media config.** `STATICFILES_STORAGE` is ignored on Django 6;
    replaced with `STORAGES` (WhiteNoise manifest). Added `MEDIA_URL` /
    `MEDIA_ROOT` and DEBUG media serving so `Food.image` uploads are actually
    servable.
18. **The backend `Food.image` field is orphaned** — the frontend always uses
    the static Unsplash map, and uploads had no `MEDIA_*` config or size
    validation. Media is now wired up; wiring the UI to `Food.image` (with a
    resize/limit validator) remains a product decision.
19. **Unhardened production settings.** When `DEBUG=False` (and not testing),
    `settings.py` now enables `SECURE_PROXY_SSL_HEADER`, `SECURE_SSL_REDIRECT`
    (env-overridable via `DJANGO_SECURE_SSL_REDIRECT`), secure session/CSRF
    cookies, HSTS, `SECURE_CONTENT_TYPE_NOSNIFF`, and `X_FRAME_OPTIONS`.
    `ALLOWED_HOSTS` (`DJANGO_ALLOWED_HOSTS`) and CORS (`CORS_ALLOWED_ORIGINS`,
    falls back to permissive) are now env-driven.
20. **Model-level validation gaps.** `Order.quantity` now requires `>= 1` and
    `Review.rating` must be 1..5 (migration `0013`). `OrderSerializer` rejects
    orders for unavailable food, forbids changing `food` after creation, and
    re-prices when `quantity` is patched.
21. **No dependency automation.** Added `.github/dependabot.yml` (pip, npm,
    github-actions, weekly).

### Owner-only steps (still open)
- **`RestaurantBackend/db.sqlite3` is tracked in git** (contains the deployed
  base DB). Untrack only as part of the section 9 migration:
  `git rm --cached RestaurantBackend/db.sqlite3`. Purging it from public history
  requires a history rewrite (e.g. `git filter-repo`).
- Repo visibility, `SECRET_KEY` rotation, email credentials, and the Postgres
  migration — see section 9.
- Optionally lock CORS by setting `CORS_ALLOWED_ORIGINS` and tighten
  `DJANGO_ALLOWED_HOSTS` in the Render environment.

### Notes on the fixes
- Existing JWTs and reset tokens signed with the old key are invalidated if
  `DJANGO_SECRET_KEY` is set; users simply log in again.
- Password reset now requires outbound email to be functional in production
  (`EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD`). Until those are configured, the
  flow works only where `DEBUG` is on; in production `send-otp/` returns 503.

### Secrets
- No secret values are reproduced in this report.
- Note: `.env.local` files on disk contain a Vercel OIDC token. They are
  git-ignored (`git ls-files` does not track them), but consider rotating and
  removing tokens you are not actively using. `Restaurant/.env` (tracked)
  contains only the public API URL.

---

## 7. How to reproduce

Backend:

```powershell
cd RestaurantBackend
$env:DATABASE_URL = "sqlite:///$(Join-Path (Get-Location) 'test_qa_db.sqlite3')"
& ".\venv\Scripts\python.exe" manage.py test restaurant.test_qa
```

Frontend:

```powershell
cd Restaurant
npm install
npm test        # vitest run
npm run lint    # oxlint
npm run build   # vite build
```

---

## 8. Compliance notes

- **No assumed endpoints:** backend tests use `reverse()`; the frontend
  endpoint check derives routes from the Django URLconf.
- **No exposed secrets:** only file paths/booleans are asserted; values are
  never read into the report.
- **No production configuration modified during testing.** The initial test
  pass left `settings.py`, `render.yaml`, and `vercel.json` untouched. The
  follow-up remediation pass intentionally changed `settings.py` and
  `render.yaml` to fix the high-severity security/reliability findings above
  (env-driven secrets, managed Postgres). No secret values were written to any
  tracked file.
- A live smoke test against the public Render API was performed earlier
  (register → token → create order → list), which created one synthetic test
  user/order in that database.

---

## 9. Production database: findings, backup, and migration runbook

**Status:** Blueprint NOT synced; nothing deployed. No production writes were
made this pass (read-only GETs only). All local changes remain uncommitted.

### 9.1 Which database production actually uses (evidence)

| Evidence | Conclusion |
| --- | --- |
| Committed `render.yaml` (HEAD) has **no** `databases:` block / `DATABASE_URL` | Production has no DB env var (unless set manually in the dashboard) |
| `settings.py` falls back to `sqlite:///<BASE_DIR>/db.sqlite3` | If `DATABASE_URL` is unset, production uses SQLite |
| `buildCommand` only runs `migrate` — no seed/fixture step, no `RunPython` data migrations | A fresh Postgres would start with **0 foods** |
| Live `GET /api/foods/` returns **81** items | Production is reading the committed `db.sqlite3` (81 foods), **not** an empty Postgres |
| `RestaurantBackend/db.sqlite3` is committed at `ad040a2` (= `origin/main`) | The deployed base database lives in this repo |

**Conclusion:** production runs **SQLite inside the Render container**. Render's
free tier filesystem is **ephemeral** (confirmed in Render docs): every
deploy, restart, or spin-down wipes it. This also corrects the previous pass's
claim that the committed DB had 0 users — that looked at the working copy, not
the committed blob.

### 9.2 🔴 CRITICAL exposure findings (fix first, no deploy needed)
1. **The GitHub repo is PUBLIC** (`adepuganesh236-bit/Restaurant`, verified via
   the GitHub API). It contains `RestaurantBackend/db.sqlite3` holding
   **6 user accounts** (usernames, emails, PBKDF2 password hashes) and
   **35 orders** — customer PII is publicly downloadable.
2. **`SECRET_KEY` is public.** The hardcoded key in `settings.py` (still the
   fallback) sits in public git history. SimpleJWT signs access/refresh tokens
   with `SECRET_KEY`, so the exposed key allows **forging a valid token for any
   user, including a superuser** → full account takeover.
3. **Runtime deltas are ephemeral.** Data written since the last deploy (e.g.
   the synthetic order id 36 from the earlier smoke test) exists only in the
   container and is not in git; it is unrecoverable without shell access.

### 9.3 Backup performed (local, outside git)
Extracted from the exact deployed commit `ad040a2`:

| File | Contents | Size |
| --- | --- | --- |
| `backups/db_deployed_base_ad040a2.sqlite3` | exact deployed SQLite base | 200,704 B |
| `backups/db_deployed_base_ad040a2.json` | portable `dumpdata` (for Postgres) | 30,551 B |

SHA256 (sqlite):
`CD64436E0EAB7CE5D89BA8251025DF018965740C13BE85EF08E55982FD471633`

JSON object counts: 6 `auth.user`, 81 `restaurant.food`, 35 `restaurant.order`,
1 `restaurant.contactmessage`, 1 `restaurant.profile`, 4
`restaurant.usersession` (128 total).

`backups/` and `*.sqlite3` are now git-ignored (they contain PII).

**Restore verified (round-trip).** The JSON backup was loaded into a fresh,
throwaway SQLite database in a temp directory using the current migrations:
`migrate` → `loaddata backups/db_deployed_base_ad040a2.json` → `Installed 128
object(s)`, and row counts matched the source exactly — **6 users, 81 foods,
35 orders, 1 contact**. This proves the backup is complete and directly
loadable into a fresh Postgres during the migration.

> ⚠️ **Backup safety:** the workspace is under
> `C:\Users\ADEPU\OneDrive\Desktop\...`, so `backups/` (which contains customer
> PII) is **synced to OneDrive**. Move it to an encrypted location outside
> OneDrive, or delete it once the migration is confirmed, and never commit it.


### 9.4 Migration strategy (SQLite → Postgres)
Password hashes are DB-independent (PBKDF2), so customers keep their passwords
after migration. Sequence:

1. Provision a **durable** Postgres. ⚠️ Render **free Postgres expires 30 days
   after creation** — for real durability use a paid Render Postgres
   (e.g. `basic-256mb`) or an external Postgres (Neon/Supabase).
2. Point the service at it via `DATABASE_URL` (leave the repo `databases:`
   block unsynced for now — do not let the Blueprint create a parallel DB).
3. Apply the schema, then load the data:
   - `python manage.py migrate`
   - `python manage.py loaddata backups/db_deployed_base_ad040a2.json`
4. Deploy the hardened code.
5. Verify against 9.6.

Afterward, remove `db.sqlite3` from the repo (and ideally from history) so the
PII is no longer distributed with the code.

### 9.5 Exact manual steps (owner — not doable from this workspace)
P0 — immediate, no deploy needed:
- [ ] **Make the repo private:** GitHub → repo → Settings → General → Danger
      Zone → Change visibility → Private.
- [ ] **Rotate `SECRET_KEY`:** generate a new 50+ char value; set
      `DJANGO_SECRET_KEY` in Render → Environment. Treat the old key as
      compromised (this invalidates all current logins).
- [ ] (Optional) rotate the Vercel OIDC token in the two `.env.local` files.

Migration:
- [ ] In the Render dashboard, confirm the web service has **no**
      `DATABASE_URL` (expected) and note its **region**.
- [ ] Create a durable Postgres in the **same region**; copy its **internal**
      connection string.
- [ ] Set `DATABASE_URL` on the web service; also set `EMAIL_HOST_USER` /
      `EMAIL_HOST_PASSWORD`.
- [ ] From a machine with the repo:
      `cd RestaurantBackend`
      `$env:DATABASE_URL="postgresql://..."; python manage.py migrate`
      `python manage.py loaddata ../backups/db_deployed_base_ad040a2.json`
- [ ] Confirm Postgres row counts match 9.3.
- [ ] `git rm --cached RestaurantBackend/db.sqlite3`
- [ ] Commit + push the hardened code; let Render redeploy.
- [ ] Run the verification in 9.6.

> Do **not** sync the Blueprint before this. Syncing creates a second, empty
> `restaurant-db`, rotates `SECRET_KEY`, and leaves the current container data
> to be wiped.

### 9.6 Post-migration verification checklist
- [ ] `GET /api/foods/` returns 81 items
- [ ] `active-users` still reports sessions
- [ ] A known customer logs in with their old password (rows + hashes intact)
- [ ] `reset-password/` without a token → 400
- [ ] `user-logins/` with a non-staff token → 403
- [ ] Place and pay for a full order
- [ ] Restart the service; confirm data survives (proves persistence)

### 9.7 Local changes made this pass (uncommitted)
- `backups/db_deployed_base_ad040a2.{sqlite3,json}` — deployed DB backup
  (git-ignored)
- `.gitignore` — ignore `backups/`
- (prior passes) `views.py` `send-otp` 503 guard; `test_qa.py` +2 tests;
  `render.yaml` email vars; `settings.py` env-driven secrets; `App.jsx` route
  guards; `ForgotPassword.jsx` reset-token flow
