# Taskflow frontend

A Nuxt 3 and Vue 3 task manager dashboard. The browser calls same-origin Nuxt routes under `/api/tasks`; Nitro proxies those requests to the NestJS task service using the server-only `NUXT_BACKEND_URL` runtime setting.

## Commands

- `pnpm install --frozen-lockfile` — install the locked dependencies.
- `pnpm dev` — start the development server on `0.0.0.0:3000`.
- `pnpm build` — create the production build in `.output/`.
- `PORT=8080 pnpm start` — run the production server on `0.0.0.0:8080` (defaults to port `3000`).
- `PORT=8080 pnpm preview` — preview the build on `0.0.0.0:8080`.

Set `NUXT_BACKEND_URL=http://backend:3000` when the frontend and backend run on the same Docker network. For local development with the NestJS server on the host, set `NUXT_BACKEND_URL=http://localhost:3000` before `pnpm dev`. This value is read by the Nuxt server at runtime and is not included in browser-side code.

The NestJS API does not define task priority. Priority remains a presentation-only value in the browser session; title, description, status, ID, and timestamps come from the API.
