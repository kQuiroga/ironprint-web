# Sistema de Diseño — Ironprint Design

Este documento es el **contrato normativo de diseño** para el proyecto ironprint-web. Es la única fuente de verdad para todas las decisiones de estilo. Cuando exista un conflicto entre este documento y el código, el código debe corregirse para cumplir este contrato —no al revés—. Todo nuevo componente, página o revisión de código debe verificarse contra este documento antes de aprobarse.

---

## 1. Filosofía de diseño

El sistema se denomina **Ironprint Design**. Está construido sobre los principios de **Material You** (Material Design 3): color dinámico generado desde la paleta de marca, jerarquía tonal de superficies, y roles semánticos para cada token de color.

Los cuatro valores de diseño que guían cada decisión:

- **Ritmo** — la interfaz acompaña el ciclo de entrenamiento del usuario; cada pantalla tiene un propósito claro en el flujo.
- **Calidez** — la paleta lavanda-durazno transmite energía positiva sin agresividad.
- **Atención** — sin ruido visual. La jerarquía tipográfica y de superficie dirige la mirada.
- **Claridad** — cada elemento tiene un token que le corresponde. No hay decisiones de color ad hoc.

**Doctrina prescriptiva**: se usan tokens semánticos, nunca colores crudos de Tailwind. La violación de esta regla es una deuda técnica que debe migrarse.

---

## 2. Alcance del tema

El sistema es **exclusivamente light-mode**. No existe `ThemeProvider`, ni manejador de `prefers-color-scheme`, ni clase de tema en `<html>`.

- Las variantes `dark:` son **código muerto** — no tienen efecto y no deben añadirse.
- No hay planes activos de soporte dark mode. Si en el futuro se incorpora, esta sección debe actualizarse primero y definir la estrategia de tokens duales antes de escribir una sola clase `dark:`.

---

## 3. Color y tokens

### 3.1 Cómo funcionan los tokens

`globals.css` declara todos los colores mediante `@theme inline { --color-* }`. Tailwind 4 genera automáticamente utilidades `bg-{nombre}`, `text-{nombre}`, `border-{nombre}` y `ring-{nombre}` para cada variable. El modificador de opacidad funciona con barra: `bg-primary/10`, `ring-primary/20`, `border-outline-variant/10`.

Esto significa que `--color-on-tertiary-container` se usa como `text-on-tertiary-container` — nunca se escribe el valor hex directamente en un `className`.

### 3.2 Primary — lavanda

Color de marca. CTAs principales, estado activo de navegación, énfasis máximo.

| Token (clase Tailwind)        | Valor hex | Uso                                                    |
|-------------------------------|-----------|--------------------------------------------------------|
| `primary`                     | `#725991` | Fondo de CTA primario, color de ícono/texto activo     |
| `primary-dim`                 | `#664d84` | Variante oscurecida del primary (hover sutil)          |
| `primary-container`           | `#dbbdfd` | Fondo de botones secundarios, chips de badge           |
| `primary-fixed`               | `#dbbdfd` | Misma superficie fija, usada en contextos estáticos    |
| `primary-fixed-dim`           | `#cdafee` | Variante atenuada del fixed                            |
| `on-primary`                  | `#ffffff` | Texto/ícono sobre fondo `primary` o `signature-gradient` |
| `on-primary-container`        | `#4f376c` | Texto/ícono sobre `primary-container`                  |
| `on-primary-fixed`            | `#3a2257` | Texto sobre `primary-fixed`                            |
| `on-primary-fixed-variant`    | `#584076` | Texto alternativo sobre `primary-fixed`                |

### 3.3 Secondary — durazno

Acentos cálidos. Día de descanso, tarjetas de logro, celebración.

| Token (clase Tailwind)           | Valor hex | Uso                                                       |
|----------------------------------|-----------|-----------------------------------------------------------|
| `secondary`                      | `#8e5647` | Fondo de elemento secundario de alta prominencia          |
| `secondary-dim`                  | `#804a3c` | Variante oscurecida                                       |
| `secondary-container`            | `#ffdbd1` | Fondo del ícono "Día de descanso" (`RestDay`)             |
| `secondary-fixed`                | `#ffdbd1` | Superficie fija secondary                                 |
| `secondary-fixed-dim`            | `#ffc8ba` | Variante atenuada del fixed                               |
| `on-secondary`                   | `#ffffff` | Texto sobre fondo `secondary`                             |
| `on-secondary-container`         | `#784436` | Texto sobre `secondary-container`                         |
| `on-secondary-fixed`             | `#623225` | Texto sobre `secondary-fixed`                             |
| `on-secondary-fixed-variant`     | `#834d3f` | Texto alternativo sobre `secondary-fixed`                 |

### 3.4 Tertiary — verde azulado

Éxito, completado, días entrenados.

| Token (clase Tailwind)          | Valor hex | Uso                                                      |
|---------------------------------|-----------|----------------------------------------------------------|
| `tertiary`                      | `#3b6d61` | Indicador de día entrenado, estado de éxito              |
| `tertiary-dim`                  | `#2f6155` | Variante oscurecida                                      |
| `tertiary-container`            | `#b3e8d8` | Fondo de chip de ejercicio (posición 0 en `ICON_COLORS`) |
| `tertiary-fixed`                | `#b3e8d8` | Superficie fija tertiary                                 |
| `tertiary-fixed-dim`            | `#a5d9ca` | Variante atenuada del fixed                              |
| `on-tertiary`                   | `#ffffff` | Texto sobre fondo `tertiary`                             |
| `on-tertiary-container`         | `#24574b` | Texto sobre `tertiary-container`                         |
| `on-tertiary-fixed`             | `#0c4439` | Texto sobre `tertiary-fixed`                             |
| `on-tertiary-fixed-variant`     | `#2e6155` | Texto alternativo sobre `tertiary-fixed`                 |

### 3.5 Jerarquía de superficies

Las superficies se ordenan de claro a oscuro. Cada nivel tiene un uso semántico definido.

| Token (clase Tailwind)              | Valor hex | Uso semántico                                               |
|-------------------------------------|-----------|-------------------------------------------------------------|
| `background`                        | `#fffbff` | Fondo de página (`body`)                                    |
| `surface`                           | `#fffbff` | Superficie base, modales centrados                          |
| `surface-container-lowest`          | `#ffffff` | Pop blanco puro, tarjeta de máxima pureza                   |
| `surface-container-low`             | `#fdf9f1` | Cards de contenido principal (`bg-surface-container-low`)   |
| `surface-container`                 | `#f7f3ea` | Paneles anidados, contenedor genérico                       |
| `surface-container-high`            | `#f1eee2` | Inputs de formulario, skeletons, segmented control          |
| `surface-container-highest`         | `#ece8db` | Celdas vacías del calendario, mayor contraste de superficie |
| `on-surface`                        | `#39382f` | Texto principal, íconos primarios                           |
| `on-surface-variant`                | `#66655a` | Texto secundario, labels, íconos inactivos                  |
| `surface-dim`                       | `#e6e3d3` | Superficie atenuada (uso esporádico)                        |
| `surface-variant`                   | `#ece8db` | Hover de ítems de navegación inactiva                       |
| `surface-tint`                      | `#725991` | Tinte de superficie en Material You (equivale a primary)    |
| `on-background`                     | `#39382f` | Texto sobre `background`                                    |

**Escalera semántica observada:**
```
page background  →  background / surface
card             →  surface-container-low
nested panel     →  surface-container-high
calendar empty   →  surface-container-highest
pure white pop   →  surface-container-lowest
```

### 3.6 Error

Estados destructivos, ejercicios no completados, validaciones fallidas.

| Token (clase Tailwind)   | Valor hex | Uso                                                    |
|--------------------------|-----------|--------------------------------------------------------|
| `error`                  | `#b3374e` | Texto de error, ícono destructivo                      |
| `error-dim`              | `#770326` | Error oscurecido para contraste                        |
| `error-container`        | `#f76a80` | Fondo de botón o chip destructivo                      |
| `on-error`               | `#ffffff` | Texto sobre fondo `error`                              |
| `on-error-container`     | `#68001f` | Texto sobre `error-container`                          |

### 3.7 Outline

Bordes y divisores. Casi siempre se usan con modificador de opacidad.

| Token (clase Tailwind)  | Valor hex | Uso                                                         |
|-------------------------|-----------|-------------------------------------------------------------|
| `outline`               | `#838175` | Borde de separación media                                   |
| `outline-variant`       | `#bcb9ad` | Bordes sutiles con opacidad: `border-outline-variant/10`   |

Patrones de uso observados: `border-outline-variant/10` (borde de BottomNav), `border-outline-variant/20` (separador de panel), `bg-outline-variant/30` (drag-handle del bottom sheet).

### 3.8 Inverse

Tokens definidos en `globals.css` pero sin uso activo en el código actual. Reservados para futuras superficies invertidas (e.g., toasts, snackbars).

| Token (clase Tailwind)     | Valor hex | Uso                  |
|----------------------------|-----------|----------------------|
| `inverse-surface`          | `#0f0e0b` | Reservado, sin uso   |
| `inverse-on-surface`       | `#9f9d97` | Reservado, sin uso   |
| `inverse-primary`          | `#dbbdfd` | Reservado, sin uso   |

### 3.9 Gradiente de marca (.signature-gradient)

```css
background: linear-gradient(135deg, #725991 0%, #dbbdfd 100%);
```

Es el nivel máximo de énfasis visual. Va de `primary` a `primary-container`, creando un degradado lavanda suave.

- Clase CSS: `.signature-gradient`
- Tailwind equivalente aproximado: `bg-gradient-to-br from-primary to-primary-fixed`
- **Siempre** se usa con `text-white shadow-lg shadow-primary/20`
- Reservado para el CTA principal de cada pantalla. Nunca se usa en más de un elemento por vista.

---

## 4. Tipografía

### 4.1 Tipografías

| Tipografía                | Variable CSS         | Clase Tailwind   | Uso                                                                     |
|---------------------------|----------------------|------------------|-------------------------------------------------------------------------|
| **Manrope**               | `--font-headline`    | `font-headline`  | Wordmark de marca, títulos principales fuera de etiquetas h1/h2/h3      |
| **Inter**                 | `--font-body` / `--font-sans` | (por defecto) | Todo el cuerpo de texto; aplicado globalmente en `body`          |
| **Material Symbols Outlined** | (fuente de ícono) | `material-symbols-outlined` | Todos los íconos de la interfaz                       |

Nota sobre Manrope: `globals.css` aplica Manrope a `h1`, `h2`, `h3` mediante una regla base global. La clase `font-headline` sólo es necesaria en elementos que no sean etiquetas de encabezado (p.ej., el `<span>` del logo en `SideNav`).

Nota técnica sobre Material Symbols: el font se carga mediante una etiqueta `<link>` en el `<head>` de `layout.tsx`. Esto es deuda técnica — el cargado ideal es mediante `next/font` — pero está fuera del alcance de este cambio.

### 4.2 Escala observada (recomendada, no normativa)

| Rol                  | Clases Tailwind                                      | Color de texto              |
|----------------------|------------------------------------------------------|-----------------------------|
| Título de página     | `text-3xl font-extrabold tracking-tight`             | `text-on-surface`           |
| Título modal/sección | `text-2xl font-extrabold tracking-tight`             | `text-on-surface`           |
| Subtítulo sección    | `text-xl font-bold tracking-tight`                   | `text-on-surface`           |
| Encabezado de card   | `text-lg font-bold`                                  | `text-on-surface`           |
| Cuerpo               | `text-sm`                                            | `text-on-surface-variant`   |
| Micro-label          | `text-[11px] font-bold uppercase tracking-wider`     | `text-on-surface-variant`   |
| Meta diminuta        | `text-[9px] uppercase font-bold`                     | `text-on-surface-variant`   |

**Regla de color**: los títulos usan `text-on-surface`; el texto secundario usa `text-on-surface-variant`. Nunca `text-zinc-*` ni `text-gray-*`.

---

## 5. Vocabulario de forma

| Clase          | Semántica                   | Elementos                                                                                      | Nota                                          |
|----------------|-----------------------------|------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `rounded-full` | Píldora                     | CTAs primarios, botones toggle/segmented, badges/chips, botones-ícono circulares, barras de progreso, drag-handle | El nivel más alto de redondez                |
| `rounded-3xl`  | Superficies grandes         | Cards de contenido, contenedor del calendario, modal de escritorio, top del bottom sheet (`rounded-t-3xl`), top de BottomNav | Para contenedores que ocupan área significativa |
| `rounded-2xl`  | Elementos interactivos medianos | Ítems de navegación, botones secundarios dentro de modales (`h-14`), celdas de la vista semanal | Nivel intermedio                              |
| `rounded-xl`   | Elementos pequeños          | Celdas del calendario mensual, contenedores de ícono (`w-10 h-10`), skeletons de contenido    | El nivel más pequeño permitido                |
| `rounded-lg`   | **PROHIBIDO**               | Aparece sólo en páginas no conformes (`routines/`, `stats/`)                                   | Reemplazar según jerarquía de tamaño          |

---

## 6. Elevación y sombras

La elevación se expresa mediante dos mecanismos complementarios: **tokens de superficie** (la escala de `surface-container-*`) y **sombras CSS**. No existe una escala fija de `z-index` — los valores se asignan contextualmente.

| Patrón de sombra                                         | Uso                                                  |
|----------------------------------------------------------|------------------------------------------------------|
| `shadow-[0_-8px_32px_rgba(57,56,47,0.06)]`               | BottomNav — sombra proyectada hacia arriba            |
| `shadow-[0_8px_32px_rgba(57,56,47,0.04)]`                | Cards destacadas (insight, streak)                   |
| `shadow-lg shadow-primary/20`                            | CTA con `.signature-gradient` — sombra teñida        |
| `shadow-2xl`                                             | Modales y bottom sheets                              |
| `shadow-sm`                                              | Toggle activo en segmented control; header mobile    |

**Regla de tinte**: las sombras usan el tinte `on-surface` (`rgba(57,56,47,N)`) con opacidad muy baja, o el tinte `primary` para CTAs. Nunca negro puro (`rgba(0,0,0,N)`).

---

## 7. Iconografía

Todos los íconos son **Material Symbols Outlined**. No se usan emojis, flechas de texto, ni librerías de íconos SVG.

**Componente estándar:**

```tsx
<span
  className="material-symbols-outlined text-[24px]"
  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
>
  icon_name
</span>
```

> **Nota sobre inline styles**: `fontVariationSettings` es la excepción explícita a la regla "no inline styles" de `AGENTS.md`. No existe una utility de Tailwind para esta propiedad CSS — es el único caso aprobado de `style={{}}` estático en este codebase.

**Estados de relleno:**

| Estado          | `fontVariationSettings`                                  | Cuándo usarlo                          |
|-----------------|----------------------------------------------------------|----------------------------------------|
| Inactivo/outline | `"'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"`          | Navegación inactiva, acciones neutrales |
| Activo/relleno  | `"'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"`          | Ícono de navegación activo, éxito      |
| Hero (grande)   | `"'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48"`          | Íconos decorativos grandes (48px)      |

**Convenciones de tamaño:**

| Contexto           | Clase de tamaño     |
|--------------------|---------------------|
| Navegación (BottomNav / SideNav) | `text-[24px]` / `text-[22px]` |
| Botones            | `text-[20px]`       |
| Chips de ícono     | `text-[18px]`       |
| Hero / decorativo  | `style={{ fontSize: '48px' }}` con `opsz' 48` |

**Regla de FILL**: íconos activos o de estado positivo usan `FILL 1`; íconos de navegación inactiva o acciones neutrales usan `FILL 0`.

**Prohibido**: usar flechas de texto (`←`, `→`, `↑`) como sustitutos de íconos. Es una inconsistencia con Material Symbols (la navegación de mes en `calendar/page.tsx` es un desvío tolerado pendiente de corrección).

---

## 8. Movimiento

| Patrón                        | Clases / valores                                                      | Uso                                       |
|-------------------------------|-----------------------------------------------------------------------|-------------------------------------------|
| Transición estándar           | `transition-all duration-200`                                         | Elementos interactivos (botones, nav items) |
| Transición de color           | `transition-colors`                                                   | Cambios sólo de color                     |
| Transición ágil               | `transition-all duration-150`                                         | Celdas de calendario (más responsivo)     |
| Feedback de press             | `active:scale-[0.98]`                                                 | Botones grandes                           |
| Estado activo comprimido      | `scale-95`                                                            | Ítems de nav activos (BottomNav)          |
| Hover de celda                | `hover:scale-105`                                                     | Celdas clickeables del calendario         |
| Hover de CTA gradiente        | `hover:opacity-90`                                                    | Botón `.signature-gradient`               |
| Spinner de carga              | `animate-spin` + `border-2 border-white border-t-transparent`        | Indicadores de carga en botones           |
| Skeleton de carga             | `animate-pulse` sobre `bg-surface-container-high`                    | Placeholders de contenido                 |

**Regla de duración**: preferir 150–200 ms para micro-interacciones. No usar duraciones superiores a 300 ms para feedback de UI.

---

## 9. Patrones de componentes

### 9.1 Botones

**Botón primario — CTA de máximo énfasis** (`.signature-gradient`):

```tsx
<button className="w-full signature-gradient text-white font-bold py-5 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
  Comenzar entrenamiento
</button>
```

Cuándo usarlo: el único CTA de máxima prioridad por pantalla. No usar dos de estos en la misma vista.

---

**Botón secundario — énfasis medio** (`bg-primary-container`):

```tsx
<button className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all duration-200 bg-primary-container/40 text-on-primary-container hover:bg-primary-container/60">
  Registrar
</button>
```

Cuándo usarlo: acciones dentro de modales o bottom sheets, segunda prioridad en la jerarquía.

---

**Botón terciario / neutral** (`bg-surface-container-high`):

```tsx
<button className="bg-surface-container-high text-on-surface-variant hover:bg-surface-container rounded-2xl px-4 py-2 font-semibold transition-colors">
  Cancelar
</button>
```

Cuándo usarlo: acciones secundarias, cancelar, "ver más", opciones no destructivas de baja prioridad.

---

**Botón destructivo** (`bg-error-container`):

```tsx
{/* Inactivo */}
<button className="bg-error-container/20 text-error hover:bg-error-container/40 rounded-2xl px-4 py-2 font-semibold transition-all">
  No completado
</button>

{/* Seleccionado */}
<button className="bg-error-container text-on-error-container rounded-2xl px-4 py-2 font-semibold transition-all">
  No completado
</button>
```

Cuándo usarlo: eliminar, marcar como no completado, acciones irreversibles.

---

**Botón-ícono circular**:

```tsx
<button className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-variant transition-colors">
  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
    close
  </span>
</button>
```

Cuándo usarlo: cerrar modales, acciones de ícono sin etiqueta de texto.

---

### 9.2 Inputs de formulario

```tsx
<div className="space-y-1">
  <label className="text-sm font-semibold text-on-surface-variant">
    Nombre
  </label>
  <input
    className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
    placeholder="Tu nombre"
  />
  {error && (
    <p className="text-xs text-error">{error.message}</p>
  )}
</div>
```

Cuándo usarlo: todos los campos de formulario. Label arriba, error de Zod abajo. Nunca `rounded-lg` en inputs.

---

### 9.3 Cards / contenedores

**Card estándar:**

```tsx
<div className="bg-surface-container-low rounded-3xl p-5">
  {/* contenido */}
</div>
```

**Card destacada** (con sombra):

```tsx
<div className="bg-surface-container-lowest p-6 rounded-3xl shadow-[0_8px_32px_rgba(57,56,47,0.04)]">
  {/* contenido */}
</div>
```

**Chip de ícono** — rotación de color (`ICON_COLORS`):

```tsx
const ICON_COLORS = [
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
];

<div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', ICON_COLORS[index % ICON_COLORS.length])}>
  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
    fitness_center
  </span>
</div>
```

Cuándo usarlo: listas de ejercicios, colecciones de ítems donde el color diferencia visualmente cada elemento.

---

### 9.4 Modales y bottom sheets

**Bottom sheet (mobile, `md:hidden`)**:

```tsx
<div className="fixed inset-0 z-[60] flex items-end justify-center md:hidden">
  {/* Overlay de cierre */}
  <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={onClose} />
  {/* Panel */}
  <div className="relative bg-surface rounded-t-3xl shadow-2xl px-8 pt-4 pb-10 w-full max-w-lg">
    {/* Drag handle */}
    <div className="w-10 h-1.5 rounded-full bg-outline-variant/30 mx-auto mb-6" />
    {/* contenido */}
  </div>
</div>
```

**Modal centrado (desktop, `hidden md:flex`)**:

```tsx
<div className="fixed inset-0 z-[60] hidden md:flex items-center justify-center">
  <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={onClose} />
  <div className="relative bg-surface rounded-3xl shadow-2xl px-8 py-8 w-full max-w-sm">
    {/* contenido */}
  </div>
</div>
```

Cuándo usarlo: el mismo contenido se renderiza dos veces — como bottom sheet en mobile y como modal centrado en desktop. Ver `DayLogPopover.tsx` como referencia canónica. El overlay de cierre sigue el patrón de AGENTS.md: `fixed inset-0 z-40` con `onClick`, nunca `mousedown` en el panel.

---

### 9.5 Navegación

**Ítem de BottomNav (activo/inactivo):**

```tsx
<Link
  className={cn(
    "flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-200",
    isActive
      ? "bg-primary/10 text-primary scale-95"
      : "text-outline hover:text-on-surface"
  )}
>
  <span
    className="material-symbols-outlined text-[24px] mb-1"
    style={{ fontVariationSettings: isActive
      ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
      : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"
    }}
  >
    {icon}
  </span>
  <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
</Link>
```

**Segmented control / toggle:**

```tsx
<div className="inline-flex bg-surface-container-high p-1 rounded-full">
  {options.map((opt) => (
    <button
      key={opt.value}
      className={cn(
        "px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
        selected === opt.value
          ? "bg-surface-container-lowest text-on-surface shadow-sm"
          : "text-on-surface-variant hover:text-on-surface"
      )}
    >
      {opt.label}
    </button>
  ))}
</div>
```

Cuándo usarlo: filtros de vista (semana/mes), pestañas binarias. Nunca usar tabs de Material 3 — el segmented control es el patrón establecido.

---

### 9.6 Badges / chips

```tsx
<span className="inline-block px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-[11px] font-bold uppercase tracking-wider">
  Hoy toca entrenar
</span>
```

Variantes de color disponibles:
- Primary: `bg-primary-container text-on-primary-container`
- Secondary: `bg-secondary-container text-on-secondary-container`
- Tertiary: `bg-tertiary-container text-on-tertiary-container`
- Error: `bg-error-container/20 text-error`

Cuándo usarlo: etiquetas de estado, categorías, indicadores breves de contexto.

---

### 9.7 Skeletons de carga

```tsx
{/* Línea de texto */}
<div className="h-4 w-32 animate-pulse rounded-xl bg-surface-container-high" />

{/* Bloque de card */}
<div className="animate-pulse rounded-3xl bg-surface-container-high h-40 w-full" />

{/* Avatar / ícono circular */}
<div className="w-10 h-10 animate-pulse rounded-xl bg-surface-container-high shrink-0" />

{/* Botón skeleton */}
<div className="h-14 animate-pulse rounded-full bg-surface-container-high" />
```

Cuándo usarlo: la forma del skeleton debe coincidir con la forma del elemento que reemplaza — `rounded-full` para botones pill, `rounded-3xl` para cards, `rounded-xl` para chips e inputs. Siempre `bg-surface-container-high` como color base.

---

## 10. Clases prohibidas

| Prohibido                     | Por qué                                                              | Usar en su lugar                                                            |
|-------------------------------|----------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `zinc-*` (text/bg/border)     | Paleta cruda, ignora el sistema de tokens                            | `text-on-surface` / `text-on-surface-variant` / `bg-surface-container-*` / `border-outline-variant/N` |
| `blue-*` (cualquier variante) | Paleta cruda; el color de marca es lavanda, no azul                  | `bg-primary` / `text-primary` / `bg-primary-container` / `.signature-gradient` |
| `red-*` (cualquier variante)  | Paleta cruda para estados destructivos                               | `text-error` / `bg-error-container` / `text-on-error-container`             |
| `dark:*` (cualquier variante) | No existe ThemeProvider ni modo oscuro — es código muerto            | Eliminar; el tema es light-only (ver Sección 2)                             |
| `rounded-lg`                  | Fuera del vocabulario de forma definido                              | `rounded-xl` / `rounded-2xl` / `rounded-full` según jerarquía (ver Sección 5) |
| `bg-white` literal            | Bypassa el token de fondo semántico                                  | `bg-background` o `bg-surface-container-lowest`                             |
| Flechas de texto `←` `→`      | Inconsistente con Material Symbols; señal de código no revisado      | `<span className="material-symbols-outlined">arrow_back</span>` (o el ícono que corresponda) |

---

## 11. Archivos de referencia

Estos archivos son implementaciones canónicas. Ante cualquier duda sobre cómo aplicar un patrón, consúltarlos antes de inventar una solución nueva.

| Archivo                                            | Qué ilustra                                                         |
|----------------------------------------------------|---------------------------------------------------------------------|
| `src/app/globals.css`                              | Fuente de verdad de todos los tokens — leer antes de cualquier cosa |
| `src/components/ui/BottomNav.tsx`                  | Uso de tokens, estado activo de íconos (`FILL 1`), `rounded-t-3xl` |
| `src/components/ui/SideNav.tsx`                    | Patrón de ítem de navegación, segmented control                     |
| `src/components/ui/DayLogPopover.tsx`              | Patrón canónico de bottom sheet / modal dual (mobile + desktop)     |
| `src/app/login/page.tsx`                           | Fondo de blob ambiental, card pattern, CTA primario                 |
| `src/app/register/page.tsx`                        | Patrón canónico de inputs de formulario                             |
| `src/app/(auth)/calendar/page.tsx`                 | Implementación de página más completa; calendario, celdas, estados  |
| `src/app/(auth)/today/page.tsx`                    | Sub-componentes `RestDay` / `PlannedDay`, badge pattern, ICON_COLORS |
| `src/app/(auth)/workout/[date]/page.tsx`           | Mayormente conforme; chip de ícono con rotación de color            |

---

## 12. Estado de migración

**Definición de "Cumple"**: el archivo usa exclusivamente tokens semánticos de Material You (sin `zinc-*`, `blue-*`, `red-*` crudos), no tiene variantes `dark:`, utiliza CTAs en `rounded-full`, fondos de card en `bg-surface-container-*`, y los íconos son Material Symbols.

| Archivo                                              | Estado                   | Problema                                                      |
|------------------------------------------------------|--------------------------|---------------------------------------------------------------|
| `src/app/globals.css`                                | Cumple                   | —                                                             |
| `src/components/ui/BottomNav.tsx`                    | Cumple                   | —                                                             |
| `src/components/ui/SideNav.tsx`                      | Cumple                   | —                                                             |
| `src/components/ui/DayLogPopover.tsx`                | Cumple                   | —                                                             |
| `src/app/login/page.tsx`                             | Cumple                   | —                                                             |
| `src/app/register/page.tsx`                          | Cumple                   | —                                                             |
| `src/app/(auth)/calendar/page.tsx`                   | Cumple con desvío menor  | Flechas de texto `←`/`→` en navegación de mes (tolerado)     |
| `src/app/(auth)/today/page.tsx`                      | Cumple                   | —                                                             |
| `src/app/(auth)/workout/[date]/page.tsx`             | Cumple con desvío menor  | Mayormente conforme; revisar en próximo pass                  |
| `src/app/(auth)/layout.tsx`                          | Cumple con desvío menor  | Header mobile usa `bg-white/80` en vez de `bg-background/80` |
| `src/app/(auth)/routines/page.tsx`                   | No cumple — deuda técnica | `zinc-*`, `blue-*`, `red-*`, `dark:`, `rounded-lg`           |
| `src/app/(auth)/routines/[id]/page.tsx`              | No cumple — deuda técnica | `zinc-*`, `blue-*`, sin tokens semánticos                    |
| `src/app/(auth)/routines/new/page.tsx`               | No cumple — deuda técnica | `zinc-*`, `blue-*`, `red-*`, `dark:`, `focus:ring-blue-500`  |
| `src/app/(auth)/stats/page.tsx`                      | No cumple — deuda técnica | `zinc-*`, `blue-500` (barras Recharts), `dark:`              |

La migración de los archivos marcados como "No cumple" está diferida a un `sdd-apply` posterior enfocado exclusivamente en esa deuda técnica.
