# senda-web — frontend

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui. Pantallas del estudiante (móvil) y panel del administrador (escritorio), y hace de **BFF**: guarda la sesión en cookies httpOnly y reenvía al backend. Ver [../CLAUDE.md](../CLAUDE.md) para la visión general (casos de uso, reglas RN/RS, roadmap).

El navegador **nunca** llama directo a `senda-api` ni al proveedor de LLM — solo al BFF propio (`/api/*` de este repo). La única excepción es el botón de **"Acceder con Google"** (`src/components/auth/google-sign-in-button.tsx`), que carga Google Identity Services solo si `NEXT_PUBLIC_GOOGLE_CLIENT_ID` está definido (la política de contenido de `next.config.ts` abre `accounts.google.com/gsi` solo entonces); el ID token que entrega Google va al BFF (`/api/auth/google`), nunca a senda-api directo. Ver `../senda-api/docs/google-sign-in.md`.

**App instalable (PWA):** `src/app/manifest.ts` (nombre, colores; abre en ventana propia en la pantalla de arranque `public/abrir.html`, degradado rojo con el logotipo blanco y "Senda" a la derecha, `public/icons/splash-lockup.svg`, quieto en el centro, que pasa sola a `/inicio` cuando el servidor responde; en iPhone/iPad el arranque del sistema usa la misma imagen, `public/splash/*.jpg`, enlazadas en `src/app/layout.tsx`; las barras del sistema no cambian), íconos en `public/icons/` (192, 512 y maskable) y `src/app/apple-icon.png` (iPhone). El botón "Instalar Senda" (`src/components/pwa/`) va en Perfil e Iniciar sesión: en Chrome, Edge y Android abre la ventana de instalación del sistema; en iPhone/iPad explica "Compartir → Añadir a pantalla de inicio"; no aparece si ya está instalada. El service worker (`public/sw.js`, registrado solo en producción por `ServiceWorkerRegister`) guarda únicamente la pantalla de arranque y los archivos con hash de `/_next/static/`, para que la app instalada abra al instante aunque el servidor esté despertando; ninguna página, respuesta de la API ni texto del estudiante pasa por la caché. El Dockerfile copia `public/` (el modo standalone no lo incluye).

## 1. Tecnologías

| Tecnología | Uso |
| --- | --- |
| Next.js 16 (App Router) | Framework + intermediario seguro con el backend |
| React 19 + TypeScript | Interfaz |
| Tailwind CSS 4 | Estilos |
| shadcn/ui (sobre Radix UI) | Componentes |
| lucide-react | Íconos |
| next-themes | Modo claro/oscuro |
| sonner | Notificaciones en pantalla |
| react-hook-form + zod | Formularios y validación |
| TanStack Query | Consultas a la API (ej. esperar el resultado del análisis cada 2 s) |
| Recharts | Gráficos de "Mis datos" |
| date-fns | Fechas en español, zona America/Lima |
| next-intl | Textos de interfaz (`messages/es.json`) |
| MSW | Mock del backend en desarrollo/tests |
| ESLint + Prettier | Calidad y formato |
| Husky + lint-staged + commitlint | Control de calidad pre-commit |
| Vitest + Testing Library | Pruebas unitarias |
| Playwright + axe | E2E y accesibilidad, vista móvil (estudiante) y escritorio (admin) |

Fuera de alcance a propósito: Storybook, Sentry, analizador de peso. Con Next.js no se usa Vite; Vitest sí, para pruebas.

## 2. Cómo se decidió la organización: por features

| Enfoque | Para quién conviene | Decisión |
| --- | --- | --- |
| Colocación pura (guía oficial Next.js: `_components/`, `_lib/`) | Pantallas independientes entre sí | Solo para piezas que una única ruta usa |
| **Por features** (Bulletproof React) | Equipos pequeños, dominio claro, piezas reutilizadas entre pantallas | ✅ Elegido |
| Feature-Sliced Design (6 capas) | Equipos grandes, muchos dominios | No — de sobra para 23 pantallas y 2 devs |

Por qué: las carpetas de `features/` tienen los mismos nombres que los módulos del backend (una historia se busca en el mismo lugar en los 2 repos); hay piezas compartidas entre pantallas (el selector de ánimo va en Diario y en el check-in de Inicio); si el proyecto crece, migrar a Feature-Sliced Design es directo porque las features ya están separadas.

## 3. Estructura

```
senda-web/
├── package.json · next.config.ts · tsconfig.json · components.json (shadcn/ui)
├── eslint.config.mjs · .prettierrc · commitlint.config.ts · vitest.config.mts · playwright.config.ts
├── Dockerfile · .env.example
├── .husky/                           pre-commit (lint-staged), commit-msg (commitlint)
├── .github/workflows/ci.yml
├── messages/es.json                  textos en español, claves en inglés (next-intl)
├── public/
├── e2e/                              Playwright + axe: vista móvil (estudiante) y escritorio (admin)
└── src/
    ├── app/                          SOLO rutas, layouts y route handlers
    │   ├── (auth)/                   sin barra inferior
    │   │   ├── (entrada)/            personajes de emociones + formulario (_components/auth-hero.tsx)
    │   │   │   └── activar/ · login/ · recuperar/
    │   │   └── (onboarding)/         consentimiento en tarjeta ancha; bienvenida en carrusel a pantalla completa
    │   │       └── consentimiento/ · bienvenida/
    │   ├── (student)/                con barra inferior
    │   │   ├── layout.tsx · _components/ (barra lateral, barra inferior, mensajes, tema)
    │   │   ├── inicio/ · diario/ · resumen/ · mensajes/ · perfil/
    │   │   ├── historial/ · historial/por-reescribir/ · historial/reescritos/
    │   │   ├── historial/[entryId]/ · historial/[entryId]/espejo/ · historial/[entryId]/reescribir/   rutas con parámetros en lib/routes.ts
    │   │   └── progreso/
    │   │       ├── layout.tsx
    │   │       ├── _components/progress-tabs.tsx    carpeta privada: solo esta ruta
    │   │       └── jardin/ · datos/ · frasco/
    │   ├── (admin)/                  panel de escritorio, barra lateral; metadata robots: noindex
    │   │   └── admin/
    │   │       ├── login/ · verificar/                  sin barra lateral (CU-23: password + TOTP)
    │   │       ├── layout.tsx                           admin-sidebar
    │   │       ├── cohortes/ · cohortes/[cohortId]/     CU-24
    │   │       ├── participantes/                       CU-24, CU-26
    │   │       ├── adherencia/                          CU-25
    │   │       └── auditoria/                           CU-27
    │   ├── api/                      BFF
    │   │   ├── auth/[action]/route.ts         activar (contraseña o Google), login, google, recuperar, logout; cookies httpOnly
    │   │   ├── admin-auth/[action]/route.ts   login, verify (TOTP), logout; cookie admin_access
    │   │   └── v1/[...path]/route.ts          reenvía a senda-api con el token que corresponda; renueva (solo estudiante)
    │   └── layout.tsx · globals.css · not-found.tsx · error.tsx
    ├── features/                     mismos nombres que los módulos del backend
    │   ├── access/            api/{activate,login,recover}.ts · components/{activate-form,login-form,recover-form,consent-view,logout-button}.tsx · schemas/access.schema.ts (RN-AC-01, RN-AC-04)
    │   ├── journal/           journal-form, entry-list, entry-detail · use-create-entry, use-entries, use-check-in
    │   ├── analysis/          mirror-view, finding-card, care-message · use-mirror (consulta cada 2 s si PENDING)
    │   ├── rewrite/           rewrite-form (registro completo, progreso con caritas) · use-rewrite-guide, use-submit-rewrite
    │   ├── home/              today-card, pending-phrase · use-home
    │   ├── progress/          garden, charts/, jar-list, weekly-summary · use-garden, use-stats, use-jar
    │   ├── guidance/          message-inbox, message-card · use-messages
    │   ├── profile/           profile-form, withdrawal-dialog · use-profile, use-withdraw
    │   └── admin/
    │       ├── api/           use-cohorts, use-generate-codes, use-participants, use-access-reset, use-adherence, use-audit-logs, use-current-config, download-export.ts
    │       ├── components/    admin-login-form, totp-form, cohort-form, cohort-table, code-batch-dialog, participant-table, access-reset-dialog, adherence-table, audit-log-table, config-view
    │       └── schemas/admin.schema.ts (RN-AD-01 a RN-AD-04)
    ├── components/
    │   ├── ui/                       shadcn/ui
    │   ├── layout/                   admin-sidebar.tsx, pill-tabs.tsx (el armazón del estudiante vive en app/(student)/_components)
    │   ├── forms/                    mood-picker, gender-picker, journal-sheet (la hoja manuscrita), field-error
    │   ├── illustrations/            emotion-characters.tsx (personajes de emociones)
    │   ├── tour/                     tutorial guiado por las emociones (app-tour.tsx, tour-steps.ts)
    │   └── feedback/                 care-message.tsx, finding-row.tsx (frase detectada, sin acceso propio: se reescribe el registro), mood-progress.tsx (una carita por intento), phrase-scene-card.tsx (frase como tarjeta de clima de su tipo; paleta en lib/pattern-style.ts y `--scene-*` de globals.css, también para resaltar en el texto)
    ├── hooks/                        hooks compartidos (use-media-query, use-mounted)
    ├── lib/
    │   ├── api/                      client.ts (fetch al BFF), errors.ts, query-keys.ts
    │   ├── server/                   server-only: backend.ts, session.ts, admin-session.ts
    │   ├── auth/logout.ts            cerrar sesión (borra los datos locales del estudiante)
    │   ├── format/dates.ts           todo formato de fecha (hora de Lima)
    │   ├── routes.ts · dimension-style.ts · journey.ts · findings.ts · local-student-data.ts
    │   └── utils.ts
    ├── i18n/request.ts               configuración next-intl
    ├── config/env.ts                 variables de entorno validadas con zod
    ├── types/                        api.ts, dimension.ts, role.ts
    ├── testing/                      setup.ts, test-utils.tsx, mocks/ (MSW)
    └── proxy.ts                      protección de rutas: (student) exige sesión de estudiante; /admin/** exige admin_access
```

Cada feature: `api/` (hooks TanStack Query + llamadas al BFF), `components/`, `schemas/` (zod), `types/` — solo las carpetas que realmente usa.

## 4. Reglas que hacen que escale

1. **`app/` solo enruta.** `page.tsx` importa de `features/`, sin lógica propia. Server Components por defecto; `"use client"` solo si hay interacción.
2. **Dirección única:** `app/` → `features/` → compartidos (`components/`, `hooks/`, `lib/`, `types/`, `config/`). Nunca al revés.
3. **Una feature no importa de otra.** Si 2 la necesitan, sube a compartidos o se compone en `app/`. Forzado por ESLint `import/no-restricted-paths` en `eslint.config.mjs` (también: lo compartido no importa de features ni de `app/`, y una feature no importa de `app/`).
4. **Carpetas privadas (`_components/`)** junto a la ruta que las usa — Next.js no las convierte en URL.
5. **Código de servidor en `lib/server/`** con `import "server-only"` — si un componente cliente lo importa, el build falla.
6. **El navegador solo habla con el BFF** (`/api/*`). Los tokens nunca llegan al JS del navegador.
7. **Sin archivos barril (`index.ts`):** se importa el archivo directo (no rompe tree-shaking).
8. **Nombres:** archivos kebab-case (`mirror-view.tsx`, `use-mirror.ts`); componentes PascalCase; hooks con prefijo `use`. Carpetas de ruta en español (forman la URL que ve el usuario); los grupos `(auth)`, `(student)`, `(admin)` no aparecen en la URL.
9. **Ningún texto en español dentro de componentes:** todo sale de `messages/es.json` con claves en inglés (`analysis.care`, `admin.cohort.created`).
10. **Pruebas junto al código** (`mirror-view.test.tsx`); E2E en `e2e/`.
11. **Sesiones separadas:** estudiante (`session.ts`) y administrador (`admin-session.ts`) con cookies distintas. Sesión de admin dura 15 min, no se renueva — al vencer, `proxy.ts` redirige a `/admin/login`. La feature `admin` no importa `journal`/`analysis`/`rewrite` (regla ESLint), igual que en el backend.

**Al agregar WebSocket** (no hace falta hoy): se crea `lib/realtime/` + un hook en la feature que lo use (`features/analysis/api/use-mirror-live.ts`); las pantallas no cambian.

## 5. Convenciones de nombres (específicas de este repo)

| Elemento | Convención | Ejemplo |
| --- | --- | --- |
| Archivos y carpetas | kebab-case | `mirror-view.tsx`, `use-mirror.ts` |
| Componentes | PascalCase | `MirrorView` |
| Hooks | camelCase, prefijo `use` | `useMirror` |
| Funciones y variables | camelCase | `createJournalEntry` |
| Tipos e interfaces | PascalCase, sin prefijo `I` | `JournalEntry`, `ApiError` |
| Constantes | UPPER_SNAKE_CASE | `POLL_INTERVAL_MS` |
| Esquemas zod | camelCase + `Schema` | `activateSchema` |
| Claves de TanStack Query | centralizadas en `lib/api/query-keys.ts` | `queryKeys.mirror(entryId)` |
| Pruebas | junto al archivo, `.test.tsx` | `mirror-view.test.tsx` |
| Carpetas de ruta | español (URL visible) | `app/(student)/inicio/`, `app/(admin)/admin/cohortes/` |
| Grupos de rutas | inglés, por rol | `(auth)`, `(student)`, `(admin)` |
| Claves i18n | `módulo.claveEnCamelCase` | `access.tooManyAttempts`, `admin.cohortCreated` |

**Campos JSON del backend → UI** (igual que en `senda-api`): `journalEntryId`, `analysisStatus`, `findingId`, `moodBefore`, `moodAfter`, `inJar`, `recoveryCode`.

**Errores comunes a manejar en UI** (código → clave i18n): `INVALID_CREDENTIALS`→`access.invalidCredentials` · `TOO_MANY_ATTEMPTS`→`access.tooManyAttempts` · `ACCOUNT_LOCKED`→`access.accountLocked` · `CONSENT_REQUIRED`→`access.consentRequired` · `READ_ONLY_PERIOD`→`common.readOnlyPeriod` · `JOURNAL_ENTRY_NOT_FOUND`→`common.notFound` · `ENTRY_TOO_SHORT`→`journal.entryTooShort` · `ENTRY_IN_RISK_STATE`→`common.notAllowed` (reescritura en registro con riesgo, CU-03) · `NLP_UNAVAILABLE`→`analysis.failed` · `DUPLICATE_REQUEST_IN_PROGRESS`→`common.duplicateRequest`.

## 6. Mapa de rutas del BFF hacia senda-api

Ver mapa completo de API en la Especificación v2 (toda petición del estudiante lleva JWT de 30 min + refresh; la de administrador usa su propia cookie de 15 min sin renovación). Endpoints clave para construir el BFF:

- Estudiante: `/auth/{activate,activate/google,login,google,logout,refresh,recover}`, `/consents/current`, `/consent-acceptances`, `/welcome`, `/profile/*`, `/home`, `/checkins`, `/journal-entries*`, `/progress/*`, `/jar*`, `/weekly-summaries*`, `/messages*`.
- Administrador (`/admin/**`): `/admin/auth/{login,verify,logout}`, `/admin/cohorts*`, `/admin/participants*`, `/admin/adherence`, `/admin/exports/adherence`, `/admin/audit-logs`, `/admin/config/current`.

## 7. DoD específica de este repo

Además de la DoD general: funciona en 360 px de ancho · contraste WCAG 2.1 AA, texto ≥ 16 px · pruebas de accesibilidad (axe) en verde · E2E Playwright de los flujos principales en vista móvil · ningún texto fijo en componentes (todo via `messages/es.json`) · CI: `npm ci && npm run lint && npm run test && npm run build`.

## 8. Historias del backlog con responsable B o A+B (ver plan completo en `../CLAUDE.md`)

Sprint 0: TS-04 (rutas, barra inferior, i18n, tema), TS-07 (bocetos). Luego: HU-01/02/03 (pantallas activación/consentimiento/login), HU-08 (Diario), HU-06 (perfil/preferencias), HU-09/10 (mensaje neutro, estado "analizando"), HU-12 (Espejo), HU-13 (Reescritura/Devolución), HU-14 (Inicio), HU-04 (recuperar contraseña), HU-20 (Historial/Detalle), HU-16/17 (jardín, 6 gráficos), HU-30 (accesibilidad/360px), HU-23 (bandeja de mensajes), HU-07 (retiro), HU-15 (check-in), HU-32/33/35 (login+TOTP admin, cohortes/códigos, reset access), HU-05/18/19/21 (bienvenida, frasco, resumen semanal, eliminar registro — si hay capacidad en S7).
