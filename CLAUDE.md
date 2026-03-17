# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AquaHub is a Vue 3 + Vite frontend for an aquarist e-commerce platform with real-time auctions, community features, and seller/buyer workflows.

## Commands

```bash
npm run dev       # Start dev server (proxies /api to localhost:8080)
npm run build     # Production build
npm run preview   # Preview production build
```

No test or lint scripts are configured.

## Architecture

### Stack
- **Vue 3** with Composition API + TypeScript (strict)
- **Vite** as build tool; `@/*` aliases to `./src/*`
- **Vue Router 4** with navigation guards
- **Pinia** for state (with persisted state plugin)
- **Axios** for HTTP; all calls proxied via `/api` → `http://localhost:8080`
- **Tailwind CSS** + custom Pretendard font + Shadcn UI components (in root `components/`)
- **TipTap** for rich text editing in community posts

### Directory Layout
```
src/
  api/          # API clients (one file per domain)
  components/   # Reusable UI components (organized by feature)
  composables/  # Vue composables (useDebounce, useSellerMode, useSellerApplication)
  lib/          # Axios instance + interceptors (axios.ts)
  pages/        # Route-level page components
  router/       # Vue Router config with auth guards
  stores/       # Pinia stores (auth, cart)
components/     # Shadcn UI component library (root level)
```

### API Layer Pattern
All API modules in `src/api/` follow this pattern:
```typescript
export const someApi = {
  fetchData: (params) =>
    api.get('/endpoint', { params }).then(unwrap)
}
```
`unwrap()` extracts `response.data.data` from the standard backend envelope `{ success, data, message }`.

The Axios instance in `src/lib/axios.ts` handles:
- 401/403 → clears auth store + redirects to `/login`
- 500 → redirects to `/error`
- Auth-check endpoints (`/members/me`, `/auth/refresh`, etc.) are excluded from auto-redirect

### Auth & Routing
- Auth state lives in `src/stores/auth.ts`; initialized at app bootstrap via `fetchMe()`
- Token lifetime: 15 min; auto-refresh triggered 2 min before expiry
- User roles: `BUYER`, `SELLER`, `BREEDER`, `ADMIN`
- Route meta flags: `requiresAuth`, `requiresAdmin`, `requiresGuest` — enforced in router guards

### State Management
- **auth store**: user info, token refresh, login/logout
- **cart store**: items grouped by seller, selection state, server sync

### Key Conventions
- API modules export named namespace objects (e.g., `productApi`, `sellerApi`)
- Types/interfaces are co-located and exported from their respective API files
- Components in `src/components/` are organized by feature subdirectory
