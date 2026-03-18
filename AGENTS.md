<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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
