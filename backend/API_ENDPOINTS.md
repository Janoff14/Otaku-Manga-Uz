# Otaku Manga API — Frontend Integration Guide

This document is a complete, frontend-focused API reference for the Otaku Manga backend. It lists all available endpoints, required headers, request/response shapes, examples, and instructions for wiring the frontend to the API.

Base URL and config
- The frontend stores the API base URL in `src/config.js` (look for `API_BASE`). Use that as the `BASE_URL` when constructing requests.
- When running locally the backend typically serves at `http://localhost:8000` (when using `uvicorn backend.app.main:app --reload` or equivalent).
- OpenAPI docs are available at `BASE_URL/docs` when the server is running — useful for live schema inspection.

Common headers
- X-User-Token: string (optional for some endpoints but required for progress endpoints). Frontend should store a stable token in localStorage and send this header on progress-related requests.
- X-Admin-Key: string (required for admin seed endpoint). Keep this secret and only use in secure admin workflows.
- Content-Type: application/json for JSON request bodies.

Status codes — frontend behavior
- 200 / 201: success. Expect JSON. 201 for created resources (e.g., saving progress).
- 204: no content (e.g., empty results). Treat as `null` where appropriate.
- 400: bad request — show validation feedback.
- 401 / 403: auth/permission errors — prompt user or block action.
- 404: not found — show friendly 'not found' UI.
- 500: server error — show generic error UI and optionally retry.

----

Table of contents
- Health & utility
- Public catalog
- Manga endpoints
- Chapter endpoints
- Comments
- Reading progress
- Admin endpoints
- Schemas (expected shapes)
- Examples (fetch + curl)
- Frontend wiring checklist

----

Health & utility

- GET /health
  - Purpose: Basic liveness check. Returns 200 and a small JSON or text payload (implementation may vary).
  - Use: frontend health checks, uptime dashboards.

- GET /db-health
  - Purpose: Checks database connectivity.
  - Use: admin dashboards / server monitoring.

- GET /manga/catalog.json
  - Purpose: Returns a flattened JSON catalog of all manga with basic chapter lists. Intended for fast static use on the frontend (used by launch-week compatibility).
  - Use: Static catalog generation, client-side preloads.
  - Response: `{ items: [ { slug, title, description, cover_url, status, chapters: [{id, number, title}, ...] }, ... ] }`

----

Manga (collection and detail)

- GET /api/v1/manga/
  - Query params: `page` (int, optional), `page_size` (int, optional), `search` (string, optional)
  - Purpose: List paginated manga. Use `search` to filter by title/slug/description.
  - Response: list pagination envelope (implementation may include `items`, `total`, `page`, `page_size`). Check live `/docs` for exact envelope.

- GET /api/v1/manga/{slug}
  - Path param: `slug` (string)
  - Purpose: Get manga details and its chapters.
  - Response: Manga object with nested chapters (order and shape may vary). If not found, 404.

- POST /api/v1/manga/{slug}/like
  - Purpose: Like a manga (increments likes). Implementation detail: may or may not require user token — check `/docs` or test endpoint.
  - Response: likely returns updated like count or 200.

- GET /api/v1/manga/{slug}/comments
  - Purpose: Get public comments for a manga.
  - Response: list of comments (see Comments section for schema).

- POST /api/v1/manga/{slug}/comments
  - Body: `{ user_name: string, text: string }` (example)
  - Purpose: Add a comment to a manga.
  - Response: created comment object or 201 status.

Notes about pagination and search
- The list endpoint supports `page` and `page_size`. If unset, frontend should default to sane values (e.g., page=1, page_size=20).
- `search` should be URL-encoded. Use debounce on search input to avoid rapid queries.

----

Chapters

- GET /api/v1/chapters/{id}
  - Path param: `id` (int)
  - Purpose: Retrieve a chapter with its pages. Response includes page image URLs in ordered form.
  - Use: The reader UI should request this before rendering pages.

- POST /api/v1/chapters/{id}/like
  - Purpose: Like a chapter. Behavior similar to manga likes.

- GET /api/v1/chapters/{id}/next
  - Purpose: Get metadata for the next chapter (if exists) — useful for 'next' button prefetch.

- GET /api/v1/chapters/{id}/prev
  - Purpose: Get metadata for the previous chapter.

- GET /api/v1/chapters/{id}/comments
- POST /api/v1/chapters/{id}/comments
  - Purpose: Manage comments tied to a specific chapter. Bodies and responses mirror manga comment endpoints.

Reader UX notes
- Prefetching next/prev chapter metadata can improve transitions.
- The chapter GET response should include page image URLs in order. Respect `index` ordering.
- For long page lists, consider lazy-loading image elements and using placeholders.

----

Comments (manga and chapter)

Common comment shape (approx):
- id: int
- user_name: string
- text: string
- created_at: datetime

Usage
- POST payload: `{ user_name: "Reader", text: "Nice chapter!" }`
- Validate length on client side (e.g., non-empty, reasonable max length).

----

Reading progress

- GET /api/v1/progress/{manga_id}
  - Headers: `X-User-Token: <token>` (frontend must send user token; backend defaults to `anonymous` if missing for non-protected flows)
  - Purpose: Get the saved reading progress for the current user & manga.
  - Response: `ProgressOut` or 204 / 404 when none exists. `ProgressOut` includes `{ manga_id, chapter_id, page_index, updated_at }`.

- POST /api/v1/progress/
  - Headers: `X-User-Token: <token>`
  - Body: `{ manga_id: int, chapter_id: int, page_index: int }`
  - Purpose: Create or update (upsert) reading progress for the user. Returns saved progress object and 201.

Frontend best-practices for progress
- Store a stable `userToken` in localStorage (generated on first-run). Use it as `X-User-Token` header.
- Call the GET progress endpoint on manga/chapter load. If a saved progress exists, offer to resume.
- Save progress periodically (e.g., when user flips chapters/pages, or on a timer). Debounce writes to avoid excessive requests.
- Handle race conditions: backend does upsert; include optimistic UI but refresh on success.

----

Admin (protected)

- POST /admin/seed
  - Headers: `X-Admin-Key: <admin_seed_key>` (server reads `admin_seed_key` from config or env)
  - Body example:
    {
      "manga": { "slug": "parasyte", "title": "Parasyte", "description": "...", "cover_url": "https://...", "status": "ongoing" },
      "chapter": { "number": 1, "title": "Chapter 1" },
      "pages": ["https://.../page1.jpg", "https://.../page2.jpg"]
    }
  - Purpose: Create a manga, a chapter, and its pages in one operation.
  - Response: `{ "manga_id": <int>, "chapter_id": <int>, "pages": <count> }`
  - Security: Only use in trusted admin workflows. Do not expose `X-Admin-Key` in public frontend code.

----

Schemas (approximate)

Manga (fields frontend may use):
- id: int
- slug: string
- title: string
- description: string
- cover_url: string
- status: string (e.g., "ongoing", "completed")
- created_at / updated_at: datetime (optional)

Chapter:
- id: int
- manga_id: int
- number: int
- title: string
- created_at: datetime

Page:
- id: int
- chapter_id: int
- index: int (1-based)
- image_url: string

ReadingProgress (ProgressOut):
- manga_id: int
- chapter_id: int
- page_index: int
- updated_at: datetime

Comment (approx):
- id: int
- user_name: string
- text: string
- created_at: datetime

Note: For exact request/response models, consult the live `/docs` (OpenAPI) or the Pydantic models in `backend/app/routers/*.py`.

----

Examples

Fetch (browser JS) examples — adapt `BASE_URL` from `src/config.js`:

- Get manga list

```js
const url = `${BASE_URL}/api/v1/manga/?page=1&page_size=20`;
const res = await fetch(url);
const data = await res.json();
```

- Get manga detail

```js
const res = await fetch(`${BASE_URL}/api/v1/manga/parasyte`);
const manga = await res.json();
```

- Get chapter and pages

```js
const res = await fetch(`${BASE_URL}/api/v1/chapters/123`);
const chapter = await res.json();
// chapter.pages -> array of page objects with image_url
```

- Save progress

```js
await fetch(`${BASE_URL}/api/v1/progress/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Token': userToken,
  },
  body: JSON.stringify({ manga_id: 1, chapter_id: 2, page_index: 5 }),
});
```

- Admin seed (server-side only — do not call from public client)

```js
await fetch(`${BASE_URL}/admin/seed`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Key': ADMIN_KEY, // server-side secret
  },
  body: JSON.stringify(payload),
});
```

Curl example (progress GET):

```bash
curl -H "X-User-Token: test-user-123" "${BASE_URL}/api/v1/progress/1"
```

----

Frontend wiring checklist (actionable)

1. Confirm `API_BASE` in `frontend/src/config.js` points to the correct base URL.
2. Ensure all requests use `Content-Type: application/json` for JSON payloads.
3. Implement a stable `userToken` stored in localStorage and send it as the `X-User-Token` header for progress-related endpoints.
4. Do not embed `X-Admin-Key` in public code. Keep it on the server or in secure admin tooling.
5. Use the `/manga/catalog.json` for fast catalog loads if you want a single-file catalog instead of paginated queries.
6. Use the OpenAPI docs at `/docs` to verify exact response envelopes when developing — server may add wrapper fields.
7. Add graceful handling for 204/404 (no progress) by returning `null` from progress GET and showing an empty state.
8. Debounce search and progress-save calls to avoid excessive API traffic.

----

Debugging tips

- If an endpoint returns 404: verify the `slug` or `id` is correct and that the database has seeded data.
- If 403 on `/admin/seed`: confirm `X-Admin-Key` matches backend `admin_seed_key` env value.
- For DB or server issues: check `/db-health` and backend logs.

----

Where to look in the repo
- Router definitions: `backend/app/routers/*.py` (manga_routes.py, chapter_routes.py, progress_routes.py, admin_routes.py)
- Config/environment: `backend/app/core/config.py` (look for `admin_seed_key`, `db_url`, etc.)
- Frontend wiring: `frontend/src/config.js`, `frontend/src/services/*` (e.g., `progress.js`)
- OpenAPI: run the server and visit `/docs`.

----

If you want, I can also:
- Generate example TypeScript interfaces for these schemas for the frontend.
- Add short Postman/Insomnia collection JSON for the team.
