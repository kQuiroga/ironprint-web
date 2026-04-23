# IronPrint Web — Frontend Next.js 16

> **This is NOT the Next.js you know.** This version has breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.

## Dev Workflow

- Con Docker: `docker compose up -d --build web` (desde `ironprint/`)
- Local: `npm run dev` (puerto 3000)
- API base URL: variable de entorno `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080`)

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS 4, TanStack Query 5, React Hook Form 7 + Zod 4
- date-fns 4, Recharts 3, Axios
- Server Components por defecto, `"use client"` solo cuando es necesario

## Rutas

```
/                          → Redirect a /calendar
/login                     → Login (email + password)
/register                  → Registro
/(auth)/today              → Hub del día — descanso / planeado / sesión activa
/(auth)/calendar           → Calendario con dias entrenados, planeados, day logs
/(auth)/routines           → Lista de rutinas (activar, desactivar, eliminar)
/(auth)/routines/new       → Crear rutina con dias y ejercicios
/(auth)/routines/[id]      → Detalle de rutina
/(auth)/routines/[id]/edit → Editar rutina
/(auth)/workout/[date]     → Sesion de entrenamiento (registrar series)
/(auth)/stats              → Estadisticas mensuales
```

## Arquitectura de Datos

```
Service (Axios) → Hook (TanStack Query) → Component
```

- **Services** (`services/*.service.ts`): wrappean llamadas Axios. Un service por recurso.
- **Hooks** (`hooks/use*.ts`): wrappean TanStack Query alrededor de services. Un hook file por recurso.
- **Providers**: `AuthProvider` (JWT en memoria, refresh en httpOnly cookie, auto-retry 401), `QueryProvider` (staleTime 5min, retry 1)

## Patrones Establecidos

- **Popover close**: usar `fixed inset-0 z-40` overlay div en el padre, NO mousedown handlers en el popover
- **`cn()`** (`lib/cn.ts`): clsx + tailwind-merge para clases Tailwind condicionales
- **Auth flow**: JWT access token en memoria (nunca localStorage), refresh token en httpOnly cookie via route handler (`/api/auth/*`), interceptor Axios para retry automático en 401
- **Middleware**: archivo `proxy.ts` (no `middleware.ts`) — renombrado por convención de Next.js 16

## Estructura de Archivos

```
src/
  app/            — Routes (App Router), route groups: (auth) para protegidas
  components/ui/  — Primitivos UI reutilizables
  hooks/          — Custom hooks (TanStack Query wrappers)
  services/       — API service functions (Axios)
  types/          — TypeScript types e interfaces
  providers/      — React Context providers (Auth, Query)
  lib/            — Utilidades (cn, axios instance)
```

## Convenciones

- Código, commits y variables en inglés
- Commits en conventional commit format

## Secrets

- Variables de entorno en `.env.local` (gitignoreado)
- Solo variables prefijadas con `NEXT_PUBLIC_` son accesibles en el cliente

---

# Code Review Rules

## General
- No hardcoded secrets or connection strings — use environment variables (`NEXT_PUBLIC_*` for client, server-only vars for API routes/server components)
- No commented-out code
- No unused imports or variables
- No `any` types — use `unknown` and narrow, or define a proper type

## TypeScript
- Strict mode enabled — never weaken `tsconfig.json` strictness
- Prefer `interface` for object shapes (extensible, better error messages)
- Use `type` for unions, intersections, and mapped/conditional types
- Explicit return types on all exported functions and hooks
- No type assertions (`as` casts) unless absolutely necessary — add a comment explaining why
- Prefer `satisfies` over `as` when validating a value matches a type without widening

## React / Next.js
- Prefer Server Components by default — use `"use client"` only when the component needs state, effects, event handlers, or browser APIs
- No prop drilling — use composition (children, render props) or React Context
- Colocate related files (component, types, hooks, tests) in the same directory
- Follow App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- Use `loading.tsx` and `Suspense` boundaries for async data — no manual loading state in Server Components
- Route handlers go in `app/api/` — never call your own API routes from Server Components (call the logic directly)
- Metadata must use the `metadata` export or `generateMetadata` — no manual `<head>` tags

## State Management
- Server state via TanStack Query — never use `useState`/`useEffect` for fetching API data
- Form state via React Hook Form — no manual `onChange` handlers for form fields
- App state via React Context — keep it minimal (auth, theme, locale)
- No global state libraries (Redux, Zustand) unless explicitly justified
- Custom hooks must encapsulate query logic: one hook per resource (e.g., `useExercises`, `useRoutine`)

## Forms
- Always validate with Zod schemas — no manual validation logic
- Use `@hookform/resolvers/zod` to connect schemas to React Hook Form
- Define Zod schemas alongside their inferred TypeScript types (`z.infer<typeof schema>`)
- Share validation schemas between client and server when possible
- Form components must show field-level errors, not just toast notifications

## Styling
- Tailwind utility classes only — no custom CSS unless absolutely unavoidable
- Extract repeated patterns to components, not to `@apply` directives
- Responsive-first: design mobile-first, then add `sm:`, `md:`, `lg:` breakpoints
- Use `cn()` utility (clsx + tailwind-merge) for conditional class composition
- No inline `style` attributes unless dynamically computed values require it

## Security
- Never expose secrets in client code — only variables prefixed with `NEXT_PUBLIC_` are available client-side
- Access tokens stored in memory only (variable/context) — never in `localStorage` or `sessionStorage`
- Refresh tokens must be `httpOnly`, `secure`, and `sameSite: strict` cookies
- Never log tokens, passwords, or sensitive user data — not even in development
- Sanitize user-generated content before rendering — use safe defaults against XSS

## Naming
- Components: `PascalCase` (`ExerciseCard.tsx`)
- Hooks: `use*` prefix (`useExercises.ts`)
- Services: `*.service.ts` (`auth.service.ts`)
- Types: `*.types.ts` (`exercise.types.ts`)
- Pages: `page.tsx` (Next.js App Router convention)
- Layouts: `layout.tsx`
- Custom hooks live in `hooks/` directory
- Utility functions: `camelCase` in `lib/` or `utils/`

## File Structure
- Maintain the existing structure — do not reorganize without discussion:
  - `types/` — shared TypeScript types and interfaces
  - `services/` — API service functions (Axios calls)
  - `hooks/` — custom React hooks (TanStack Query wrappers)
  - `providers/` — React Context providers
  - `components/ui/` — reusable UI primitives
  - `app/` — Next.js App Router pages and layouts (route groups allowed)
