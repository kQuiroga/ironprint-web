@AGENTS.md

# IronPrint Web — Frontend Next.js 16

## Dev Workflow

- Con Docker: `docker compose up -d --build web` (desde la raiz `ironprint/`)
- Local: `npm run dev` (puerto 3000)
- API base URL: variable de entorno `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080`)

## Stack

- Next.js 16 (App Router), React 19, TypeScript strict
- Tailwind CSS 4, TanStack Query 5, React Hook Form 7 + Zod 4
- date-fns 4, Recharts 3, Axios
- Server Components por defecto, `"use client"` solo cuando es necesario

## Rutas

```
/                         → Redirect a /calendar
/login                    → Login (email + password)
/register                 → Registro
/(auth)/calendar          → Calendario con dias entrenados, planeados, day logs
/(auth)/exercises         → Catalogo de ejercicios (CRUD)
/(auth)/routines          → Lista de rutinas (activar, desactivar, eliminar)
/(auth)/routines/new      → Crear rutina con dias y ejercicios
/(auth)/routines/[id]     → Detalle de rutina
/(auth)/routines/[id]/edit → Editar rutina
/(auth)/workout/[date]    → Sesion de entrenamiento (registrar series)
/(auth)/stats             → Estadisticas mensuales
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
- **Auth flow**: JWT access token en memoria (nunca localStorage), refresh token en httpOnly cookie via route handler (`/api/auth/*`), interceptor Axios para retry automatico en 401

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
