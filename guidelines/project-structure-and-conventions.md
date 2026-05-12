# React Web Application — Project Structure, Conventions & Best Practices

> **Purpose**: A comprehensive, reusable guide for building production-grade React web applications.
> This document covers architecture decisions, coding conventions, execution flows, design patterns,
> performance strategies, and advanced techniques. Use it as a blueprint for any new React web project.

**Stack**: React 19 · TypeScript · Vite · Redux Toolkit · TanStack React Query · React Router 7 · Tailwind CSS 4

**Backend**: NestJS + MongoDB — REST API at `/api/v1/`

---

## Table of Contents

1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [Folder Structure](#2-folder-structure)
3. [Naming Conventions](#3-naming-conventions)
4. [Import Rules & Module Resolution](#4-import-rules--module-resolution)
5. [TypeScript Conventions](#5-typescript-conventions)
6. [Code Style](#6-code-style)
7. [State Management Architecture](#7-state-management-architecture)
8. [API Layer & Services](#8-api-layer--services)
9. [Routing & Navigation](#9-routing--navigation)
10. [Component Architecture](#10-component-architecture)
11. [Styling System](#11-styling-system)
12. [Internationalization](#12-internationalization)
13. [Custom Hooks](#13-custom-hooks)
14. [Form Handling & Validation](#14-form-handling--validation)
15. [Error Handling Strategy](#15-error-handling-strategy)
16. [Code Execution Flows](#16-code-execution-flows)
17. [Design Patterns In Depth](#17-design-patterns-in-depth)
18. [Performance Optimization](#18-performance-optimization)
19. [Maintainability & Code Quality](#19-maintainability--code-quality)
20. [Advanced Coding Techniques](#20-advanced-coding-techniques)
21. [New Feature Checklist](#21-new-feature-checklist)

---

## 1. Project Overview & Philosophy

### Core Principles

| Principle                     | What It Means                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Separation of Concerns**    | UI renders state, hooks orchestrate, slices own state, services talk to APIs. Each layer has one job.                     |
| **Unidirectional Data Flow**  | Data flows: API → Service → Slice → Hook → Component. Events flow back the same path in reverse.                          |
| **Colocation**                | Keep related code close. Screen-specific components live inside that screen folder, not in global `components/`.          |
| **Progressive Disclosure**    | Simple things stay simple. Only add abstraction when you have 3+ concrete use cases (Rule of Three).                      |
| **Type Safety at Boundaries** | Strictly type all external boundaries (API responses, URL params, form inputs). Internal code can rely on inferred types. |

### Why This Architecture?

```
┌──────────────────────────────────────────────────────────────┐
│                        React Components                       │
│   (Pure UI — renders props, dispatches events, no logic)      │
├──────────────────────────────────────────────────────────────┤
│                        Custom Hooks                           │
│   (Orchestration — connects components to state & services)   │
├──────────────────────────────────────────────────────────────┤
│              Redux Slices          React Query Cache           │
│   (Client state — UI state,   (Server state — API data,       │
│    auth, preferences)          caching, background refetch)    │
├──────────────────────────────────────────────────────────────┤
│                        Service Layer                          │
│   (API abstraction — HTTP calls, request/response mapping)    │
├──────────────────────────────────────────────────────────────┤
│                        HTTP Client                            │
│   (Transport — fetch, auth headers, token refresh, retries)   │
└──────────────────────────────────────────────────────────────┘
```

**Why separate layers?**

- **Testability**: Each layer can be tested independently. Mock the service layer to test slices. Mock hooks to test components.
- **Replaceability**: Swap Axios for fetch, swap Redux for Zustand — only one layer changes.
- **Readability**: A new developer can understand the data flow by following the layers top-to-bottom.

---

## 2. Folder Structure

```text
src/
├── App.tsx                  # Root component: providers composition
├── main.tsx                 # Vite entry point: renders <App />
│
├── components/              # Shared, reusable UI components
│   ├── ui/                  # Primitive UI kit (Button, Input, Dialog, Card, etc.)
│   ├── shared/              # Business-aware reusable components
│   └── index.ts             # Barrel export
│
├── screens/                 # Page-level components (one folder per feature)
│   ├── Dashboard/
│   │   ├── DashboardScreen.tsx
│   │   └── components/      # Screen-scoped components
│   │       ├── StatsCard.tsx
│   │       └── RecentActivity.tsx
│   ├── Auth/
│   │   ├── LoginScreen.tsx
│   │   └── components/
│   └── ...
│
├── models/                  # Domain contracts and mapping layer
│   ├── common/              # Shared primitives (ISODateString, RoleRef, PaginationQuery)
│   │   ├── CommonInterface.ts
│   │   └── index.ts
│   ├── <domain>/            # Domain-specific contracts
│   │   ├── <Domain>Interface.ts  # Entity shapes (AdminUser, SessionItem)
│   │   ├── <Domain>DTO.ts        # Request payloads (LoginRequest, CreateUserRequest)
│   │   ├── <Domain>Response.ts   # API response shapes (LoginResponse, RefreshResponse)
│   │   ├── <Domain>Mapper.ts     # Transform API responses ↔ domain objects (when needed)
│   │   └── index.ts              # Barrel export
│   └── index.ts             # Root barrel export
│
├── services/                # API communication layer
│   ├── core/                # HTTP client, error handling, token storage
│   │   ├── httpClient.ts    # Custom fetch-based HTTP client
│   │   ├── apiClient.ts     # Configured singleton instance
│   │   ├── apiError.ts      # Typed error class
│   │   ├── queryClient.ts   # TanStack React Query configuration
│   │   ├── queryKeys.ts     # Centralized cache key registry
│   │   ├── tokenStorage.ts  # Auth token persistence
│   │   ├── types.ts         # Shared API types
│   │   └── index.ts         # Barrel export
│   ├── <domain>/            # Domain-specific service files
│   │   └── <domain>Service.ts
│   └── index.ts             # Service facade / barrel export
│
├── store/                   # Redux Toolkit state management
│   ├── store.ts             # Store configuration + persistence
│   ├── hooks.ts             # Typed useAppDispatch, useAppSelector
│   ├── thunkTypes.ts        # Typed createAsyncThunk factory
│   └── slices/              # Feature slices
│       ├── authSlice.ts
│       ├── appSlice.ts
│       ├── sliceUtils.ts    # Shared slice helpers
│       └── ...
│
├── contexts/                # React Context providers
│   ├── AuthContext.tsx       # Auth state (React Query-powered)
│   └── I18nContext.tsx       # Translation provider
│
├── hooks/                   # Shared custom hooks
│   ├── useTheme.tsx
│   ├── useMobile.ts
│   └── ...
│
├── navigators/              # Routing configuration & layouts
│   ├── AppNavigator.tsx     # Route definitions (createBrowserRouter)
│   ├── AppLayout.tsx        # Sidebar + header layout shell
│   └── ProtectedLayout.tsx  # Auth guard wrapper
│
├── config/                  # Environment & app configuration
│   └── env.ts
│
├── constants/               # Immutable values
│   └── api.ts               # API endpoint registry
│
├── i18n/                    # Translation engine
│   ├── translate.ts         # Dictionary & translation logic
│   └── runtime.ts           # Language state for formatters
│
├── styles/                  # Global styles
│   ├── index.css            # Tailwind imports
│   ├── theme.css            # CSS custom properties (design tokens)
│   ├── fonts.css            # Font-face declarations
│   └── tailwind.css         # Tailwind directives
│
├── types/                   # Shared TypeScript type definitions
│   └── ...
│
├── utils/                   # Pure utility functions
│   ├── format.ts            # Display formatting helpers
│   └── index.ts
│
├── validations/             # Form validation schemas & rules
│   ├── rules.ts
│   └── schemas.ts
│
└── docs/                    # Internal documentation
    └── ...
```

### Ideas Behind Each Folder

| Folder               | Purpose                                                                                                                                   | Why It Exists                                                                                                                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/ui/`     | Primitive, domain-agnostic UI components (Button, Input, Dialog, Card, Table)                                                             | These are the **atomic building blocks**. They know nothing about your business domain. You could copy this folder into a completely different project and it would still work. Keeping them domain-free ensures maximum reusability.                                                          |
| `components/shared/` | Business-aware reusable components (PageHeader, DataTable, StatusChip, ConfirmDialog)                                                     | These understand your app's patterns (e.g., "a page always has breadcrumbs + title + actions") but are reused across **multiple screens**. They bridge the gap between raw UI primitives and full screens.                                                                                     |
| `screens/`           | Feature pages with screen-scoped sub-components                                                                                           | Each screen folder is a **self-contained feature**. Screen-specific components live inside `screens/Feature/components/` — NOT in the global `components/` folder. This prevents the global components folder from becoming a dumping ground and makes it clear which components belong where. |
| `models/common/`     | Shared type primitives (`ISODateString`, `RoleRef`, `PaginationQuery`)                                                                    | Types used across multiple domains live here. Keeps domain models DRY without creating circular dependencies.                                                                                                                                                                                  |
| `models/<domain>/`   | Domain contracts: `Interface` (entity shapes), `DTO` (request payloads), `Response` (API response shapes), `Mapper` (transform functions) | Separating contracts from services means **types are importable without pulling in HTTP code**. Backend and frontend can compare contracts easily. Each file has a single responsibility: shape vs. payload vs. response vs. mapping.                                                          |
| `services/core/`     | HTTP transport infrastructure                                                                                                             | Isolates all HTTP concerns (auth headers, token refresh, timeouts, error normalization) into **one place**. When you need to change how HTTP works (add retry logic, switch from fetch to axios, add request deduplication), you change one folder.                                            |
| `services/<domain>/` | Domain-specific API calls                                                                                                                 | Each domain service file maps 1:1 to a backend controller. The service **hides the HTTP details** and exposes typed async functions. Types are imported from `models/<domain>/`, not defined here. Components never import `httpClient` directly.                                              |
| `store/slices/`      | Client-side state ownership                                                                                                               | Each slice owns a **specific domain of client state**. The slice defines initial state, reducers (sync mutations), and async thunks (API-calling actions). This is your single source of truth for client state.                                                                               |
| `contexts/`          | Cross-cutting concerns via React Context                                                                                                  | Auth status, theme, and language need to be accessible **everywhere** without prop drilling. Context is the right tool for values that change infrequently and are consumed by many components.                                                                                                |
| `hooks/`             | Shared custom hooks                                                                                                                       | Encapsulate **reusable stateful logic** that doesn't belong to a single screen. Only promote a hook here if 2+ screens use it. Screen-specific hooks stay inside their screen folder.                                                                                                          |
| `navigators/`        | Route definitions and layout wrappers                                                                                                     | Separating routes from screens means you can **see the entire app's URL structure** in one file. Layout wrappers (sidebar, auth guards) live here because they're routing concerns, not UI components.                                                                                         |
| `constants/`         | Immutable configuration values                                                                                                            | API endpoints, magic numbers, and enum-like values live here. Using a centralized endpoint registry means changing a URL updates it **everywhere** at once.                                                                                                                                    |
| `config/`            | Runtime environment configuration                                                                                                         | Reads from `import.meta.env` and provides typed, validated config. One import, no scattered `import.meta.env.VITE_*` calls throughout the codebase.                                                                                                                                            |
| `styles/`            | Global CSS and design tokens                                                                                                              | CSS custom properties (`--color-primary`, `--radius`) define the **design system**. Tailwind consumes these variables, ensuring your utility classes and custom CSS always agree.                                                                                                              |
| `utils/`             | Pure functions with no side effects                                                                                                       | Date formatting, string manipulation, number parsing. These functions take input, return output, and **never touch state or APIs**. Easy to test, easy to reuse.                                                                                                                               |
| `validations/`       | Form validation rules and schemas                                                                                                         | Centralized validation ensures the **same rules** apply whether used in a create form, edit form, or inline validation.                                                                                                                                                                        |

---

## 3. Naming Conventions

| Category                  | Convention                        | Example                                             | Why                                                       |
| ------------------------- | --------------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| **Screen Components**     | PascalCase + `Screen` suffix      | `DashboardScreen.tsx`                               | Distinguishes pages from reusable components at a glance  |
| **UI Components**         | PascalCase                        | `Button.tsx`, `DataTable.tsx`                       | React convention for components                           |
| **Hooks**                 | camelCase + `use` prefix          | `useTheme.tsx`, `useMobile.ts`                      | React convention; ESLint enforces this for Rules of Hooks |
| **Services**              | camelCase + `Service` suffix      | `authService.ts`, `contentService.ts`               | Clearly marks API-facing modules                          |
| **Redux Slices**          | camelCase + `Slice` suffix        | `authSlice.ts`, `appSlice.ts`                       | Identifies Redux state files                              |
| **Contexts**              | PascalCase + `Context` suffix     | `AuthContext.tsx`                                   | Follows React naming for createContext                    |
| **Types / Interfaces**    | PascalCase                        | `AdminUser`, `PaginatedResponse`                    | TypeScript convention                                     |
| **Model Interface files** | PascalCase `<Domain>Interface.ts` | `AccountInterface.ts`, `AuthenticationInterface.ts` | Entity shapes — the domain's core data structures         |
| **Model DTO files**       | PascalCase `<Domain>DTO.ts`       | `AccountDTO.ts`, `AuthenticationDTO.ts`             | Request payloads going TO the API                         |
| **Model Response files**  | PascalCase `<Domain>Response.ts`  | `AuthenticationResponse.ts`                         | Response shapes coming FROM the API                       |
| **Model Mapper files**    | PascalCase `<Domain>Mapper.ts`    | `AccountMapper.ts`                                  | Transform functions between API and domain shapes         |
| **Request DTOs**          | PascalCase + `Request` suffix     | `AuthLoginRequest`, `CreateUserRequest`             | Marks data going TO the API                               |
| **Response DTOs**         | PascalCase + `Response` suffix    | `AuthLoginResponse`, `DataResponse`                 | Marks data coming FROM the API                            |
| **Constants**             | UPPER_SNAKE_CASE                  | `API_ENDPOINTS`, `MAX_RETRIES`                      | Signals immutability                                      |
| **Utility functions**     | camelCase                         | `toDisplayDate()`, `parsePositiveInt()`             | Standard JS function naming                               |
| **CSS variables**         | kebab-case with `--` prefix       | `--color-primary`, `--radius`                       | CSS custom property convention                            |
| **Route paths**           | kebab-case                        | `/user-segments`, `/pregnancy-care`                 | URL convention                                            |
| **Barrel exports**        | `index.ts` with `export *`        | `services/core/index.ts`                            | Enables clean imports                                     |

### File Naming Examples

```text
# Good — consistent, predictable
src/screens/Users/UsersScreen.tsx
src/screens/Users/components/UserRow.tsx
src/models/authentication/AuthenticationDTO.ts
src/models/account/AccountInterface.ts
src/services/admin/accessService.ts
src/store/slices/authSlice.ts
src/hooks/useTheme.tsx

# Bad — inconsistent, ambiguous
src/screens/users.tsx              # lowercase, no suffix
src/services/admin/access.ts       # missing Service suffix
src/store/auth.ts                  # missing Slice suffix
src/hooks/theme.tsx                # missing use prefix
```

---

## 4. Import Rules & Module Resolution

### Path Alias

Configure the `@/` alias in both `tsconfig.json` and `vite.config.ts`:

```jsonc
// tsconfig.json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["./src/*"],
        },
    },
}
```

```ts
// vite.config.ts
import { resolve } from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
})
```

### Import Order (enforced by convention)

```ts
// 1. React (always first)
import React from 'react'

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

// 3. Internal modules via @/ alias
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/core'
import { API_ENDPOINTS } from '@/constants/api'

// 4. Relative imports (same feature only)
import { StatsCard } from './components/StatsCard'

// 5. Types (always last, using `import type`)
import type { AdminUser } from '@/models/account'
```

### Why This Order?

- **React first**: It's the framework — always visible at the top
- **Third-party grouped**: Easy to see external dependencies at a glance
- **Internal via `@/`**: Absolute paths prevent `../../../` nesting hell and make file moves painless
- **Relative only for siblings**: If you need `../../`, you probably need `@/` instead
- **Types last with `import type`**: Clearly separates runtime imports from type-only imports. `import type` is erased at build time, producing smaller bundles

---

## 5. TypeScript Conventions

### Strict Mode Always

```jsonc
// tsconfig.json
{
    "compilerOptions": {
        "strict": true,
        "noUncheckedIndexedAccess": true, // Arrays/objects might be undefined
        "forceConsistentCasingInImports": true,
    },
}
```

### Interface vs Type

```ts
// Use `interface` for object shapes — they're extendable and produce better error messages
interface AdminUser {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
}

// Use `type` for unions, intersections, mapped types, and primitives
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
type EntityId = string | number
type Nullable<T> = T | null
```

### Generic Patterns

```ts
// Reusable API response types
interface DataResponse<TData> {
  data: TData
}

interface PaginatedResponse<TData> {
  data: TData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Usage — the generic flows through the entire chain
function useUsers(): PaginatedResponse<AdminUser> { ... }
```

### Type Narrowing Over Type Casting

```ts
// Bad — `as` tells TypeScript to shut up, hides bugs
const user = response as AdminUser

// Good — runtime check that TypeScript understands
function isAdminUser(value: unknown): value is AdminUser {
    return typeof value === 'object' && value !== null && 'id' in value && 'email' in value
}

if (isAdminUser(response)) {
    // TypeScript knows `response` is AdminUser here
    console.log(response.email)
}
```

### `satisfies` for Config Objects

```ts
// `satisfies` validates the shape WITHOUT widening the type
// The const assertion preserves literal types for autocomplete
export const API_ENDPOINTS = {
    auth: {
        login: '/auth/email/login',
        refresh: '/auth/refresh',
        me: '/auth/me',
    },
    users: {
        root: '/users',
        byId: (id: EntityId): string => `/users/${id}`,
    },
} as const satisfies Record<string, Record<string, string | ((...args: any[]) => string)>>
```

---

## 6. Code Style

### Prettier Configuration

```jsonc
// .prettierrc
{
    "semi": false,
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2,
    "trailingComma": "all",
    "arrowParens": "always",
    "bracketSpacing": true,
    "endOfLine": "lf",
}
```

### ESLint Configuration

```ts
// eslint.config.ts (flat config for ESLint 9+)
export default [
    {
        rules: {
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/rules-of-hooks': 'error',
        },
    },
]
```

### Key Style Rules

- **No semicolons** — Prettier handles ASI edge cases
- **Single quotes** — Less visual noise than double quotes
- **Trailing commas everywhere** — Cleaner git diffs (adding a new line doesn't modify the previous line)
- **Prefix unused params with `_`** — Signals intentional non-use: `(_event, index) => ...`
- **Named exports over default exports** — Better refactoring support, explicit imports, tree-shakeable

```ts
// Good — named export
export function DashboardScreen() { ... }

// Avoid — default export (harder to refactor, inconsistent naming)
export default function DashboardScreen() { ... }
```

---

## 7. State Management Architecture

### The Two-Cache Strategy

This architecture uses **two complementary state systems**:

| System                   | Purpose                                               | Examples                                                            | When to Use                                                                                   |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Redux Toolkit**        | Client-owned state that the server doesn't know about | Auth state, UI preferences, theme, sidebar open/closed, form drafts | State that originates from user interaction and persists across navigations                   |
| **TanStack React Query** | Server-owned state that we're caching locally         | User lists, articles, analytics data                                | Data that comes from an API and needs caching, background refresh, and stale-while-revalidate |

**Why two systems?** Redux is great for **synchronous client state** but terrible at caching server data (no stale-while-revalidate, no background refetch, no request deduplication). React Query is great for **server state** but inappropriate for UI state (no reducers, no middleware, no persistence).

### Redux Store Configuration

```ts
// store/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // localStorage

const persistConfig = {
    key: 'app-root',
    storage,
    whitelist: ['auth', 'app'], // Only persist these slices
}

const rootReducer = combineReducers({
    app: appReducer,
    auth: authReducer,
    // ... more slices
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // redux-persist dispatches non-serializable actions — ignore them
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'persist/PAUSE',
                    'persist/PURGE',
                    'persist/REGISTER',
                    'persist/FLUSH',
                ],
            },
        }),
    devTools: import.meta.env.DEV, // Enable Redux DevTools only in development
})

export const persistor = persistStore(store)

// Infer types from the store itself — never define these manually
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Typed Hooks

```ts
// store/hooks.ts — ALWAYS use these instead of raw useDispatch/useSelector
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Why?
// Raw useSelector returns `unknown` — you'd need to cast everywhere.
// These typed versions give full autocomplete: state.auth.user, state.app.theme, etc.
```

### Typed Async Thunk Factory

```ts
// store/thunkTypes.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AppDispatch, RootState } from './store'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
    state: RootState
    dispatch: AppDispatch
    rejectValue: string // All thunk errors are strings for consistent error handling
}>()

// Why?
// Without this, every thunk needs manual type annotations for state, dispatch,
// and rejectValue. This factory bakes the types in once.
```

### Slice Pattern (Template)

```ts
// store/slices/featureSlice.ts
import { createSlice } from '@reduxjs/toolkit'
import { FeatureService } from '@/services/feature/featureService'
import { createAppAsyncThunk } from '@/store/thunkTypes'
import { toErrorMessage } from './sliceUtils'
import type { FeatureItem, FeatureFilters } from '@/models/feature'

// ── State Shape ──────────────────────────────────────────────
interface FeatureState {
    items: FeatureItem[]
    selectedItem: FeatureItem | null
    isLoading: boolean // For initial data fetch
    isSubmitting: boolean // For create/update/delete operations
    error: string | null
}

const initialState: FeatureState = {
    items: [],
    selectedItem: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
}

// ── Async Thunks ─────────────────────────────────────────────
export const fetchFeatureItems = createAppAsyncThunk(
    'feature/fetchItems',
    async (filters: FeatureFilters | undefined, { rejectWithValue }) => {
        try {
            return await FeatureService.list(filters)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Failed to load items'))
        }
    },
)

export const createFeatureItem = createAppAsyncThunk(
    'feature/create',
    async (payload: CreateFeatureRequest, { rejectWithValue }) => {
        try {
            return await FeatureService.create(payload)
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Failed to create item'))
        }
    },
)

// ── Slice ────────────────────────────────────────────────────
const featureSlice = createSlice({
    name: 'feature',
    initialState,
    reducers: {
        clearFeatureError(state) {
            state.error = null
        },
        setSelectedItem(state, action: { payload: FeatureItem | null }) {
            state.selectedItem = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // ── Fetch ──
            .addCase(fetchFeatureItems.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchFeatureItems.fulfilled, (state, action) => {
                state.isLoading = false
                state.items = action.payload.data
            })
            .addCase(fetchFeatureItems.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload ?? 'Unknown error'
            })
            // ── Create ──
            .addCase(createFeatureItem.pending, (state) => {
                state.isSubmitting = true
                state.error = null
            })
            .addCase(createFeatureItem.fulfilled, (state, action) => {
                state.isSubmitting = false
                state.items.unshift(action.payload.data)
            })
            .addCase(createFeatureItem.rejected, (state, action) => {
                state.isSubmitting = false
                state.error = action.payload ?? 'Unknown error'
            })
    },
})

export const { clearFeatureError, setSelectedItem } = featureSlice.actions
export default featureSlice.reducer
```

### React Query Configuration

```ts
// services/core/queryClient.ts
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from './apiError'

export const queryClient = new QueryClient({
    // Global error handler for all queries — no need to handle errors in every component
    queryCache: new QueryCache({
        onError: (error) => {
            if (error instanceof ApiError && error.status === 401) return // Auth errors handled by AuthContext
            toast.error(error instanceof Error ? error.message : 'Unexpected error')
        },
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            if (error instanceof ApiError && error.status === 401) return
            toast.error(error instanceof Error ? error.message : 'Unexpected error')
        },
    }),
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false, // Don't refetch when user tabs back
            retry: (failureCount, error) => {
                // Don't retry auth errors — they won't magically fix themselves
                if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                    return false
                }
                return failureCount < 1 // Retry once for network errors
            },
        },
        mutations: {
            retry: false, // Never retry mutations — they have side effects
        },
    },
})
```

### Centralized Query Keys

```ts
// services/core/queryKeys.ts
//
// Why centralize keys?
// 1. Prevents typo-based cache misses (key mismatch = stale data)
// 2. Enables targeted cache invalidation: queryClient.invalidateQueries({ queryKey: queryKeys.users.list })
// 3. Autocomplete shows all available cache keys
//
export const queryKeys = {
    auth: {
        me: ['auth', 'me'] as const,
    },
    users: {
        list: (filters?: Record<string, unknown>) => ['users', 'list', filters] as const,
        detail: (id: string) => ['users', 'detail', id] as const,
    },
    articles: {
        list: (filters?: Record<string, unknown>) => ['articles', 'list', filters] as const,
        detail: (id: string) => ['articles', 'detail', id] as const,
    },
}
```

---

## 8. API Layer & Services

### Architecture: Three-Layer HTTP Stack

```
┌───────────────────────────────────────┐
│         Domain Services               │  ← What: typed business methods
│  authService.login(payload)           │     (components call these)
├───────────────────────────────────────┤
│         API Client (singleton)        │  ← How: configured HttpClient instance
│  apiClient.post('/auth/login', body)  │     (services use this)
├───────────────────────────────────────┤
│         HTTP Client (class)           │  ← Transport: fetch + auth + retry
│  new HttpClient({ baseUrl, timeout }) │     (one implementation, many instances)
└───────────────────────────────────────┘
```

### HTTP Client

A custom, fetch-based HTTP client that handles cross-cutting concerns:

```ts
// services/core/httpClient.ts

export interface RequestOptions {
    body?: unknown
    headers?: HeadersInit
    query?: QueryParams
    requiresAuth?: boolean // Default: true — auto-attaches Bearer token
    signal?: AbortSignal // For React Query cancellation
    timeoutMs?: number // Override default timeout
    retryOnUnauthorized?: boolean // Default: true — auto-refresh on 401
}

export class HttpClient {
    private refreshPromise: Promise<string | null> | null = null // Deduplication!

    // Typed convenience methods
    async get<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T>
    async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>
    async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>
    async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>
    async delete<T>(path: string, options?: RequestOptions): Promise<T>

    // Core request method — all convenience methods delegate here
    async request<T>(method: HttpMethod, path: string, options?: RequestOptions): Promise<T> {
        // 1. Resolve URL (base + path + query params)
        // 2. Merge timeout + external AbortSignal
        // 3. Attach Authorization header if requiresAuth
        // 4. Serialize body (JSON for objects, raw for FormData/Blob)
        // 5. Execute fetch
        // 6. On 401: attempt token refresh, then retry ONCE
        // 7. Parse response (JSON or text)
        // 8. Throw ApiError for non-OK responses
        // 9. Return typed payload
    }

    // Token refresh with request deduplication
    private async tryRefreshToken(): Promise<string | null> {
        // If a refresh is already in flight, return the same promise
        // This prevents N concurrent 401s from triggering N refresh requests
        if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken(token).finally(() => {
                this.refreshPromise = null
            })
        }
        return this.refreshPromise
    }
}
```

**Why custom fetch instead of Axios?**

- **Zero dependencies** — fetch is built into every modern browser and Node 18+
- **Smaller bundle** — Axios adds ~13KB gzipped
- **Full control** — AbortController, streaming, custom retry logic without adapter abstractions
- **Same API surface** — GET/POST/PATCH/PUT/DELETE with typed generics

### API Client Singleton

```ts
// services/core/apiClient.ts
import { env } from '@/config/env'
import { HttpClient } from './httpClient'
import { tokenStorage } from './tokenStorage'

export const apiClient = new HttpClient({
    baseUrl: env.apiBaseUrl, // e.g., 'http://localhost:3000/api/v1'
    timeoutMs: env.apiTimeoutMs, // e.g., 30000
    tokenStorage, // BrowserTokenStorage instance
    refreshPath: '/auth/refresh',
})
```

### Token Storage (Strategy Pattern)

```ts
// services/core/tokenStorage.ts

// The interface allows swapping storage strategies
// (localStorage for web, MMKV for React Native, cookies for SSR)
export interface TokenStorage {
    getTokens(): AuthTokens | null
    setTokens(tokens: AuthTokens): void
    clearTokens(): void
}

export class BrowserTokenStorage implements TokenStorage {
    getTokens(): AuthTokens | null {
        // 1. Try localStorage
        // 2. Fall back to in-memory (for SSR or privacy mode)
        // 3. Validate structure before returning
    }

    setTokens(tokens: AuthTokens): void {
        // Write to both in-memory AND localStorage
    }

    clearTokens(): void {
        // Clear from both in-memory AND localStorage
    }
}

export const tokenStorage = new BrowserTokenStorage()
```

### API Endpoint Registry

```ts
// constants/api.ts
export type ApiEntityId = string | number

const withId = (prefix: string, id: ApiEntityId): string => `${prefix}/${id}`

export const API_ENDPOINTS = {
    auth: {
        loginEmail: '/auth/email/login',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
        me: '/auth/me',
    },
    users: {
        root: '/users',
        byId: (id: ApiEntityId): string => withId('/users', id),
    },
    articles: {
        root: '/articles',
        byId: (id: ApiEntityId): string => withId('/articles', id),
        bySlug: (slug: string): string => `/articles/slug/${slug}`,
    },
    // ... more domains
} as const

// Why function-based dynamic endpoints?
// API_ENDPOINTS.users.byId('abc123') → '/users/abc123'
// This prevents string interpolation typos scattered across services.
```

### Domain Service Pattern

```ts
// services/<domain>/<domain>Service.ts
import { API_ENDPOINTS } from '@/constants/api'
import { apiClient } from '@/services/core'
import type { AdminUser } from '@/models/account'
import type { AuthLoginRequest, AuthLoginResponse } from '@/models/authentication'
import type { PaginatedResponse, EntityId } from '@/services/core'

// Object literal (not class) — simpler, no `this` confusion, tree-shakeable
export const authService = {
    async login(payload: AuthLoginRequest): Promise<AuthLoginResponse> {
        const response = await apiClient.post<AuthLoginResponse>(
            API_ENDPOINTS.auth.loginEmail,
            payload,
            { requiresAuth: false }, // Login doesn't have a token yet!
        )

        // Side effect: store tokens immediately after login
        apiClient.setTokens({
            accessToken: response.token,
            refreshToken: response.refreshToken,
            tokenExpires: response.tokenExpires,
        })

        return response
    },

    async logout(): Promise<void> {
        await apiClient.post<void>(API_ENDPOINTS.auth.logout)
        apiClient.clearTokens()
    },

    getMe(): Promise<AdminUser> {
        return apiClient.get<AdminUser>(API_ENDPOINTS.auth.me)
    },

    // Token helpers — delegate to apiClient
    getStoredTokens: () => apiClient.tokens,
    clearStoredTokens: () => apiClient.clearTokens(),
}

export const usersService = {
    list(query?: UserFilters): Promise<PaginatedResponse<AdminUser>> {
        return apiClient.get(API_ENDPOINTS.users.root, { query })
    },

    create(payload: CreateUserRequest): Promise<DataResponse<AdminUser>> {
        return apiClient.post(API_ENDPOINTS.users.root, payload)
    },

    getById(id: EntityId): Promise<DataResponse<AdminUser>> {
        return apiClient.get(API_ENDPOINTS.users.byId(id))
    },

    update(id: EntityId, payload: UpdateUserRequest): Promise<DataResponse<AdminUser>> {
        return apiClient.patch(API_ENDPOINTS.users.byId(id), payload)
    },

    remove(id: EntityId): Promise<void> {
        return apiClient.delete(API_ENDPOINTS.users.byId(id))
    },
}
```

### Domain Models (`models/`)

Domain contracts live in `models/<domain>/` — **not** inside service files.

```text
models/
├── common/
│   ├── CommonInterface.ts      # Shared primitives (ISODateString, RoleRef, PaginationQuery)
│   └── index.ts
├── authentication/
│   ├── AuthenticationInterface.ts   # SessionItem
│   ├── AuthenticationDTO.ts         # AuthLoginRequest, AuthRefreshRequest, UpdateMyProfileRequest
│   ├── AuthenticationResponse.ts    # AuthLoginResponse, AuthRefreshResponse
│   └── index.ts
├── account/
│   ├── AccountInterface.ts          # AdminUser, PermissionItem, LoginAuditItem
│   ├── AccountDTO.ts                # CreateUserRequest, UserFilters, LoginAuditFilters
│   └── index.ts
└── index.ts
```

**Why separate from services?**

1. Services stay focused on HTTP logic — no type definitions mixed in
2. Types can be imported without importing the service itself (smaller bundles)
3. Backend and frontend can compare contracts easily
4. Each file has a single responsibility: entity shapes vs. request payloads vs. response shapes

```ts
// models/account/AccountInterface.ts
import type { ID, ISODateString, RoleRef, StatusRef } from '@/models/common'

export interface AdminUser {
    id: ID
    email: string
    firstName: string
    lastName: string
    role: RoleRef
    status: StatusRef
    createdAt?: ISODateString
    updatedAt?: ISODateString
}
```

```ts
// models/authentication/AuthenticationDTO.ts
export interface AuthLoginRequest {
    email: string
    password: string
}
```

```ts
// models/authentication/AuthenticationResponse.ts
import type { AdminUser } from '@/models/account'

export interface AuthLoginResponse {
    token: string
    refreshToken: string
    tokenExpires: number
    user: AdminUser
}
```

**When to add a Mapper file:**
Create `<Domain>Mapper.ts` when the API response shape differs from the domain interface your UI consumes. Keep the mapper as a set of pure functions:

```ts
// models/account/AccountMapper.ts
import type { AdminUser } from './AccountInterface'

export function toAdminUser(raw: Record<string, unknown>): AdminUser {
    return {
        id: String(raw.id),
        email: String(raw.email),
        firstName: String(raw.firstName ?? raw.first_name),
        lastName: String(raw.lastName ?? raw.last_name),
        // ...
    }
}
```

### Service Facade (Optional for Large Projects)

```ts
// services/index.ts
//
// When you have 10+ services, a facade organizes them by domain:
//
export const adminServices = {
    access: {
        auth: authService,
        users: usersService,
        permissions: permissionsService,
    },
    content: {
        articles: articlesService,
        categories: categoriesService,
        tags: tagsService,
    },
    platform: {
        featureFlags: featureFlagsService,
        analytics: apiAnalyticsService,
        logs: logsService,
    },
}

// Usage: adminServices.content.articles.list()
// Benefit: Discoverability — autocomplete shows all available services grouped by domain
```

---

## 9. Routing & Navigation

### Router Configuration

```tsx
// navigators/AppNavigator.tsx
import React from 'react'
import { createBrowserRouter } from 'react-router'
import { ProtectedLayout } from './ProtectedLayout'
import { ErrorBoundaryScreen } from '@/screens/ErrorBoundaryScreen'

// ── Static imports for critical paths (no lazy load delay) ───
import { LoginScreen } from '@/screens/Auth/LoginScreen'
import { NotFoundScreen } from '@/screens/NotFound/NotFoundScreen'

// ── Lazy imports for code splitting ──────────────────────────
const DashboardScreen = React.lazy(() =>
    import('@/screens/Dashboard/DashboardScreen').then((m) => ({ default: m.DashboardScreen })),
)
const UsersScreen = React.lazy(() =>
    import('@/screens/Users/UsersScreen').then((m) => ({ default: m.UsersScreen })),
)

// ── Suspense wrapper ─────────────────────────────────────────
function SuspenseRoute({ children }: { children: React.ReactNode }) {
    return (
        <React.Suspense
            fallback={
                <div className="flex items-center justify-center py-24">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                </div>
            }
        >
            {children}
        </React.Suspense>
    )
}

// Helper: wraps a lazy component for use in route config
function lazyRoute(Component: React.LazyExoticComponent<React.ComponentType>) {
    return function LazyRouteWrapper() {
        return (
            <SuspenseRoute>
                <Component />
            </SuspenseRoute>
        )
    }
}

// ── Route Tree ───────────────────────────────────────────────
export const router = createBrowserRouter([
    // Public routes — no auth required
    {
        path: '/auth/login',
        Component: LoginScreen,
        ErrorBoundary: ErrorBoundaryScreen,
    },

    // Protected routes — auth guard + layout shell
    {
        path: '/',
        Component: ProtectedLayout, // Auth check + sidebar + header
        ErrorBoundary: ErrorBoundaryScreen,
        children: [
            { index: true, Component: lazyRoute(DashboardScreen) },
            { path: 'users', Component: lazyRoute(UsersScreen) },
            // ... more routes
            { path: '*', Component: NotFoundScreen },
        ],
    },
])
```

### Why These Routing Decisions?

| Decision                                | Why                                                                  |
| --------------------------------------- | -------------------------------------------------------------------- |
| **Static import for LoginScreen**       | Login is the first screen users see — no loading spinner delay       |
| **Lazy import for everything else**     | Each screen becomes a separate JS chunk. Initial bundle stays small. |
| **`lazyRoute()` helper**                | Eliminates repetitive Suspense wrapping — one wrapper, many routes   |
| **ErrorBoundary on every route group**  | A crash in one screen doesn't take down the entire app               |
| **Nested routes under ProtectedLayout** | Auth guard runs once for all child routes, not once per route        |

### Protected Layout (Auth Guard)

```tsx
// navigators/ProtectedLayout.tsx
import { useAuth } from '@/contexts/AuthContext'
import { Navigate, useLocation, Outlet } from 'react-router'

export function ProtectedLayout() {
    const { status, user } = useAuth()
    const location = useLocation()

    // Still checking auth — show loading
    if (status === 'loading') {
        return <AuthCheckingScreen />
    }

    // Not authenticated — redirect to login with return URL
    if (status === 'unauthenticated') {
        const redirect = `${location.pathname}${location.search}`
        return <Navigate to={`/auth/login?redirect=${encodeURIComponent(redirect)}`} replace />
    }

    // Role check (optional — depends on your app)
    if (!isAuthorized(user)) {
        return <Navigate to="/auth/session-required?reason=forbidden" replace />
    }

    // Authenticated — render layout shell with child routes
    return <AppLayout /> // Contains sidebar, header, and <Outlet />
}
```

---

## 10. Component Architecture

### Component Hierarchy

```
ui/           → Atomic primitives (Button, Input, Card, Dialog)
                No business logic. Pure props in, JSX out.

shared/       → Composite business components (PageHeader, DataTable, ConfirmDialog)
                Compose ui/ primitives. May use hooks for logic.

screens/      → Page-level components that compose everything
                Use shared/, ui/, hooks, and Redux state.
```

### UI Component Template

```tsx
// components/ui/Button.tsx
import React from 'react'
import { cn } from '@/utils' // clsx + tailwind-merge

// ── Variant types ────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
}

// ── Style maps ───────────────────────────────────────────────
const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 rounded-md px-3 text-xs',
    md: 'h-9 rounded-md px-4 text-sm',
    lg: 'h-10 rounded-md px-6 text-base',
}

// ── Component ────────────────────────────────────────────────
export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50',
                variantStyles[variant],
                sizeStyles[size],
                className,
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            {children}
        </button>
    )
}
```

### Shared Component Template

```tsx
// components/shared/PageHeader.tsx
interface PageHeaderProps {
    title: string
    description?: string
    actions?: React.ReactNode // Slot pattern for action buttons
    breadcrumbs?: Array<{ label: string; href?: string }>
}

export function PageHeader({ title, description, actions, breadcrumbs }: PageHeaderProps) {
    return (
        <div className="mb-6">
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    )
}
```

### Screen Template

```tsx
// screens/Users/UsersScreen.tsx
export function UsersScreen() {
    const dispatch = useAppDispatch()
    const { items, isLoading, error } = useAppSelector((state) => state.users)

    React.useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    return (
        <div className="space-y-6">
            <PageHeader
                title="Users"
                description="Manage user accounts"
                actions={<Button onClick={() => setIsCreateOpen(true)}>Add User</Button>}
            />

            {isLoading && <TableSkeleton />}
            {error && <ErrorAlert message={error} />}
            {!isLoading && !error && <UsersTable data={items} />}
        </div>
    )
}
```

---

## 11. Styling System

### Design Token Architecture

```
CSS Custom Properties (theme.css)
        ↓
Tailwind @theme mapping (theme.css)
        ↓
Utility classes in components
```

### Theme CSS (Design Tokens)

```css
/* styles/theme.css */

/* ── Light theme tokens ─────────────────────────────────────── */
:root {
    --background: #ffffff;
    --foreground: oklch(0.145 0 0);
    --card: #ffffff;
    --card-foreground: oklch(0.145 0 0);
    --primary: #030213;
    --primary-foreground: oklch(1 0 0);
    --secondary: oklch(0.95 0.0058 264.53);
    --muted: #ececf0;
    --muted-foreground: #717182;
    --destructive: #d4183d;
    --border: rgba(0, 0, 0, 0.1);
    --radius: 0.625rem;
    /* ... more tokens */
}

/* ── Dark theme tokens ──────────────────────────────────────── */
.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --primary: oklch(0.985 0 0);
    --border: oklch(0.269 0 0);
    /* ... more tokens */
}

/* ── Bridge: CSS variables → Tailwind classes ───────────────── */
@theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-border: var(--border);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-destructive: var(--destructive);
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);
}

/* Now you can write: bg-primary, text-muted-foreground, rounded-lg
   and they all reference your CSS variables.
   Change --primary once → every bg-primary updates. */
```

### Why This Approach?

1. **Single source of truth**: Colors defined once in CSS variables, consumed everywhere via Tailwind
2. **Dark mode for free**: Toggle `.dark` class on `<html>` — all tokens swap instantly
3. **No JS-based theme objects**: CSS variables are resolved by the browser, not by React — zero re-renders on theme change
4. **Consistent with design tools**: Designers define tokens, developers map them once

### Utility: `cn()` for Class Merging

```ts
// utils/index.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs))
}

// Why twMerge?
// clsx('px-4 px-6') → 'px-4 px-6' (both applied — px-4 wins due to specificity race)
// cn('px-4 px-6')   → 'px-6'       (twMerge resolves conflicts — last wins)
```

### Theme Provider (Light/Dark/System)

```tsx
// hooks/useTheme.tsx
type Theme = 'dark' | 'light' | 'system'

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'app-theme' }) {
    const [theme, setTheme] = React.useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
    )

    React.useEffect(() => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }
    }, [theme])

    // ... context provider with value = { theme, setTheme }
}

export const useTheme = () => useContext(ThemeProviderContext)
```

---

## 12. Internationalization

### Translation Context

```tsx
// contexts/I18nContext.tsx
type AppLanguage = 'vi' | 'en'

interface I18nContextValue {
    language: AppLanguage
    setLanguage: (language: AppLanguage) => void
    t: (key: string, params?: Record<string, string | number>) => string
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = React.useState<AppLanguage>(() => {
        return (localStorage.getItem('app-language') as AppLanguage) || 'vi'
    })

    const setLanguage = React.useCallback((lang: AppLanguage) => {
        localStorage.setItem('app-language', lang)
        document.documentElement.lang = lang === 'vi' ? 'vi-VN' : 'en-US'
        setLanguageState(lang)
    }, [])

    const t = React.useCallback(
        (key: string, params?: Record<string, string | number>) => {
            return translateLiteral(key, language, params)
        },
        [language],
    )

    const value = React.useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
    const context = React.useContext(I18nContext)
    if (!context) throw new Error('useI18n must be used within I18nProvider')
    return context
}
```

### Locale-Aware Formatting

```ts
// i18n/runtime.ts
let currentLanguage: AppLanguage = 'vi'

export const setCurrentLanguage = (lang: AppLanguage): void => {
    currentLanguage = lang
}

export const getCurrentLocaleTag = (): string => (currentLanguage === 'vi' ? 'vi-VN' : 'en-US')

// Usage in formatters:
// new Intl.DateTimeFormat(getCurrentLocaleTag(), { dateStyle: 'medium' }).format(date)
```

---

## 13. Custom Hooks

### Hook Design Rules

1. **One responsibility** — A hook should do one thing well
2. **Composable** — Hooks should compose with each other, not replace each other
3. **Encapsulate complexity** — The component should read like a story, the hook hides the how

### Authentication Hook (Context-Based)

```tsx
// contexts/AuthContext.tsx
//
// This combines React Context + React Query for auth state.
// React Query handles the data fetching and caching.
// Context makes the result available app-wide.
//
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()
    const [hasSession, setHasSession] = React.useState(() => hasStoredSession())

    // Fetch /auth/me — only when we think we have tokens
    const meQuery = useQuery({
        queryKey: queryKeys.auth.me,
        queryFn: () => authService.getMe(),
        enabled: hasSession, // Don't fire if no tokens exist
    })

    // Listen for localStorage changes (cross-tab sync)
    React.useEffect(() => {
        const onStorageChange = (event: StorageEvent) => {
            if (event.key === env.tokenStorageKey) {
                setHasSession(hasStoredSession())
            }
        }
        window.addEventListener('storage', onStorageChange)
        return () => window.removeEventListener('storage', onStorageChange)
    }, [])

    // Auto-clear on 401/403
    React.useEffect(() => {
        if (
            meQuery.error instanceof ApiError &&
            (meQuery.error.status === 401 || meQuery.error.status === 403)
        ) {
            authService.clearStoredTokens()
            setHasSession(false)
            queryClient.setQueryData(queryKeys.auth.me, null)
        }
    }, [meQuery.error, queryClient])

    // Derived status
    const status: AuthStatus = React.useMemo(() => {
        if (!hasSession) return 'unauthenticated'
        if (meQuery.isPending) return 'loading'
        if (meQuery.data) return 'authenticated'
        return 'unauthenticated'
    }, [hasSession, meQuery.data, meQuery.isPending])

    // ... provide { user, status, isAuthenticated, refreshProfile, logout }
}

export const useAuth = () => {
    const context = React.useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
```

### Responsive Hook

```ts
// hooks/useMobile.ts
export function useIsMobile(breakpoint = 768): boolean {
    const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < breakpoint)

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
        const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)

        mql.addEventListener('change', onChange)
        return () => mql.removeEventListener('change', onChange)
    }, [breakpoint])

    return isMobile
}

// Why matchMedia instead of resize listener?
// 1. Fires only when the breakpoint is crossed, not on every pixel of resize
// 2. No debouncing needed
// 3. Matches CSS media query behavior exactly
```

---

## 14. Form Handling & Validation

### Stack: react-hook-form + Custom Validation Rules

```ts
// validations/rules.ts
export const rules = {
    required: (fieldName: string) => ({
        required: `${fieldName} is required`,
    }),

    email: () => ({
        pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email address',
        },
    }),

    minLength: (min: number, fieldName: string) => ({
        minLength: {
            value: min,
            message: `${fieldName} must be at least ${min} characters`,
        },
    }),

    maxLength: (max: number, fieldName: string) => ({
        maxLength: {
            value: max,
            message: `${fieldName} must be at most ${max} characters`,
        },
    }),

    password: () => ({
        minLength: { value: 8, message: 'Password must be at least 8 characters' },
        pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: 'Password must contain uppercase, lowercase, and a number',
        },
    }),
}
```

### Form Schema Composition

```ts
// validations/schemas.ts
import { rules } from './rules'

export const authSchemas = {
    login: {
        email: { ...rules.required('Email'), ...rules.email() },
        password: { ...rules.required('Password') },
    },

    register: {
        email: { ...rules.required('Email'), ...rules.email() },
        password: { ...rules.required('Password'), ...rules.password() },
        firstName: { ...rules.required('First name'), ...rules.maxLength(50, 'First name') },
        lastName: { ...rules.required('Last name'), ...rules.maxLength(50, 'Last name') },
    },
}
```

### Form Usage in Screen

```tsx
import { useForm, Controller } from 'react-hook-form'
import { authSchemas } from '@/validations/schemas'

export function LoginScreen() {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { email: '', password: '' },
    })

    const onSubmit = async (data: { email: string; password: string }) => {
        try {
            await authService.login(data)
            toast.success('Welcome back!')
            navigate(redirectUrl || '/')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Login failed')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
                name="email"
                control={control}
                rules={authSchemas.login.email}
                render={({ field }) => (
                    <Input
                        {...field}
                        type="email"
                        placeholder="Email"
                        error={errors.email?.message}
                    />
                )}
            />

            <Controller
                name="password"
                control={control}
                rules={authSchemas.login.password}
                render={({ field }) => (
                    <Input
                        {...field}
                        type="password"
                        placeholder="Password"
                        error={errors.password?.message}
                    />
                )}
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full">
                Sign in
            </Button>
        </form>
    )
}
```

---

## 15. Error Handling Strategy

### Error Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Error Boundary (React render crashes)             │
│  Catches: Component throws during render                     │
│  Action: Show fallback UI, offer reload                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: React Query / Redux (async operation failures)     │
│  Catches: Failed API calls from thunks or queries            │
│  Action: Store error in state → component shows error UI     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: QueryClient global handler (API error toasts)      │
│  Catches: All query/mutation errors globally                 │
│  Action: Show toast notification (except 401s)               │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: HttpClient (HTTP transport errors)                 │
│  Catches: Network failures, timeouts, non-OK responses       │
│  Action: Normalize to ApiError, attempt token refresh on 401 │
└─────────────────────────────────────────────────────────────┘
```

### Typed API Error

```ts
// services/core/apiError.ts
export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number, // HTTP status code (0 for network errors)
        public readonly url: string, // Request URL for debugging
        public readonly payload: unknown, // Raw response body
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

// Usage:
// catch (error) {
//   if (error instanceof ApiError && error.status === 404) { ... }
// }
```

### Slice Error Utility

```ts
// store/slices/sliceUtils.ts
export const toErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message.trim()) {
        return error.message
    }
    return fallback
}

// Used in every thunk:
// catch (error) { return rejectWithValue(toErrorMessage(error, 'Failed to load')) }
```

---

## 16. Code Execution Flows

This section traces **exactly how data flows** through the architecture for common operations.

### Flow 1: Page Load (Read Data)

```
User navigates to /users
        │
        ▼
┌─ Router ──────────────────────────────────────────────────────┐
│ React Router matches /users → renders ProtectedLayout         │
│ ProtectedLayout checks useAuth() → status === 'authenticated' │
│ Renders AppLayout → Outlet → UsersScreen                      │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Screen (UsersScreen.tsx) ────────────────────────────────────┐
│ useEffect(() => { dispatch(fetchUsers()) }, [dispatch])        │
│                                                                │
│ Component renders based on state:                              │
│   isLoading → <Skeleton />                                     │
│   error     → <ErrorAlert />                                   │
│   data      → <UsersTable data={items} />                      │
└───────────────────────────────────────────────────────────────┘
        │  dispatch(fetchUsers())
        ▼
┌─ Slice (usersSlice.ts) ──────────────────────────────────────┐
│ fetchUsers thunk:                                              │
│   1. pending  → state.isLoading = true                         │
│   2. Calls usersService.list(filters)                          │
│   3. fulfilled → state.items = response.data                   │
│      rejected  → state.error = error.message                   │
└───────────────────────────────────────────────────────────────┘
        │  usersService.list(filters)
        ▼
┌─ Service (accessService.ts) ─────────────────────────────────┐
│ return apiClient.get('/users', { query: filters })             │
│ (maps endpoint + passes typed query params)                    │
└───────────────────────────────────────────────────────────────┘
        │  apiClient.get(...)
        ▼
┌─ HttpClient (httpClient.ts) ─────────────────────────────────┐
│ 1. Resolve URL: baseUrl + path + serialized query params       │
│ 2. Attach Authorization: Bearer <accessToken>                  │
│ 3. Set timeout via AbortController                             │
│ 4. Execute fetch(url, { method: 'GET', headers })              │
│ 5. Parse JSON response                                         │
│ 6. If 401 → tryRefreshToken() → retry once                    │
│ 7. If !response.ok → throw new ApiError(...)                   │
│ 8. Return typed payload                                        │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Backend API ────────────────────────────────────────────────┐
│ GET /api/v1/users?page=1&limit=20                              │
│ Returns: { data: [...], total: 150, page: 1, totalPages: 8 }  │
└───────────────────────────────────────────────────────────────┘
```

### Flow 2: Form Submit (Write Data)

```
User fills form and clicks "Save"
        │
        ▼
┌─ Screen (CreateUserScreen.tsx) ───────────────────────────────┐
│ react-hook-form validates fields against schema                │
│ If valid → calls onSubmit(formData)                            │
│ onSubmit: dispatch(createUser(formData))                       │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Slice (usersSlice.ts) ──────────────────────────────────────┐
│ createUser thunk:                                              │
│   pending   → state.isSubmitting = true                        │
│   calls usersService.create(payload)                           │
│   fulfilled → state.isSubmitting = false                       │
│              state.items.unshift(newUser)                       │
│   rejected  → state.isSubmitting = false                       │
│              state.error = errorMessage                         │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Service → HttpClient → API (same as read flow) ────────────┐
│ POST /api/v1/users                                             │
│ Body: { email, firstName, lastName, role }                     │
│ Returns: { data: { id: '...', email: '...', ... } }           │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Back in Screen ─────────────────────────────────────────────┐
│ const result = await dispatch(createUser(payload))             │
│ if (createUser.fulfilled.match(result)) {                      │
│   toast.success('User created')                                │
│   navigate('/users')                                           │
│ }                                                              │
└───────────────────────────────────────────────────────────────┘
```

### Flow 3: Authentication

```
App loads (App.tsx)
        │
        ▼
┌─ Provider Chain ─────────────────────────────────────────────┐
│ <Provider store>           ← Redux store available             │
│   <PersistGate>            ← Rehydrates persisted slices       │
│     <I18nProvider>         ← Translation context               │
│       <ThemeProvider>      ← Dark/light mode                   │
│         <QueryClient>      ← React Query cache                 │
│           <AuthProvider>   ← Auth state (see below)            │
│             <RouterProvider> ← Routes render here              │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ AuthProvider mounts ────────────────────────────────────────┐
│ 1. Check localStorage for tokens → hasSession = true/false     │
│ 2. If hasSession → useQuery fetches GET /auth/me               │
│ 3. Status transitions: loading → authenticated/unauthenticated │
│ 4. Listens for StorageEvent (cross-tab token sync)             │
│ 5. On 401/403: clear tokens → status = unauthenticated         │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ ProtectedLayout renders ───────────────────────────────────┐
│ if (status === 'loading')         → spinner                    │
│ if (status === 'unauthenticated') → redirect to /auth/login    │
│ if (status === 'authenticated')   → render AppLayout           │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ Login Flow ─────────────────────────────────────────────────┐
│ 1. User submits email + password                               │
│ 2. authService.login(payload) → POST /auth/email/login         │
│ 3. Response: { token, refreshToken, tokenExpires, user }       │
│ 4. apiClient.setTokens({ accessToken, refreshToken })          │
│    → saved to localStorage                                     │
│ 5. AuthProvider.refreshProfile() → refetch /auth/me            │
│ 6. Status → 'authenticated' → ProtectedLayout renders app     │
│ 7. Router redirects to original URL or /                       │
└───────────────────────────────────────────────────────────────┘
```

### Flow 4: Token Refresh (Automatic)

```
Any API call returns HTTP 401
        │
        ▼
┌─ HttpClient.request() ──────────────────────────────────────┐
│ if (response.status === 401 && retryOnUnauthorized) {          │
│   const newToken = await this.tryRefreshToken()                │
│   if (newToken) {                                              │
│     return this.request(method, path, {                        │
│       ...options,                                              │
│       retryOnUnauthorized: false  // Prevent infinite loop     │
│     })                                                         │
│   }                                                            │
│ }                                                              │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─ tryRefreshToken() — with deduplication ─────────────────────┐
│ // Multiple concurrent 401s share the same refresh request     │
│ if (!this.refreshPromise) {                                    │
│   this.refreshPromise = this.refreshAccessToken(token)         │
│     .finally(() => { this.refreshPromise = null })             │
│ }                                                              │
│ return this.refreshPromise                                     │
│                                                                │
│ refreshAccessToken():                                          │
│   POST /auth/refresh { refreshToken }                          │
│   → Success: store new tokens → return new accessToken         │
│   → Failure: clearTokens() → return null → redirect to login  │
└───────────────────────────────────────────────────────────────┘
```

---

## 17. Design Patterns In Depth

### 1. Provider Composition Pattern

**What**: Nest React context providers in a specific order at the app root.

**Why**: Each provider adds a cross-cutting concern. Order matters — inner providers can consume outer ones.

```tsx
// App.tsx — order matters!
<Provider store={store}>
    {' '}
    {/* 1. Redux first — everything can use state */}
    <PersistGate persistor={persistor}>
        {' '}
        {/* 2. Wait for rehydration before rendering */}
        <I18nProvider>
            {' '}
            {/* 3. Translations available everywhere below */}
            <ThemeProvider>
                {' '}
                {/* 4. Theme context for dark/light mode */}
                <QueryClientProvider>
                    {' '}
                    {/* 5. React Query cache */}
                    <AuthProvider>
                        {' '}
                        {/* 6. Auth uses React Query (needs #5) */}
                        <RouterProvider /> {/* 7. Routes consume auth (needs #6) */}
                        <Toaster />
                    </AuthProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </I18nProvider>
    </PersistGate>
</Provider>
```

### 2. Repository Pattern (Service Layer)

**What**: Domain services abstract data access behind typed methods.

**Why**: Components don't know (or care) whether data comes from REST, GraphQL, localStorage, or a mock.

```ts
// The service IS the repository
export const usersService = {
    list: (query?) => apiClient.get('/users', { query }),
    create: (payload) => apiClient.post('/users', payload),
    getById: (id) => apiClient.get(`/users/${id}`),
    update: (id, payload) => apiClient.patch(`/users/${id}`, payload),
    remove: (id) => apiClient.delete(`/users/${id}`),
}

// To switch from REST to GraphQL, you change THIS file only.
// Every component, hook, and slice that uses usersService is unchanged.
```

### 3. Strategy Pattern (Token Storage)

**What**: Define an interface, provide different implementations.

**Why**: Web uses localStorage, React Native uses MMKV, tests use in-memory. Same interface, different backends.

```ts
interface TokenStorage {
    getTokens(): AuthTokens | null
    setTokens(tokens: AuthTokens): void
    clearTokens(): void
}

class BrowserTokenStorage implements TokenStorage {
    /* localStorage */
}
class NativeTokenStorage implements TokenStorage {
    /* MMKV */
}
class InMemoryTokenStorage implements TokenStorage {
    /* Map for tests */
}

// HttpClient accepts any TokenStorage — it doesn't know the implementation
new HttpClient({ tokenStorage: new BrowserTokenStorage() })
```

### 4. Facade Pattern (Service Aggregation)

**What**: A single entry point that organizes many services by domain.

**Why**: With 15+ services, `adminServices.content.articles.list()` is more discoverable than remembering individual imports.

```ts
export const adminServices = {
    access: { auth, users, permissions },
    content: { articles, categories, tags, badges },
    platform: { featureFlags, analytics, logs },
}
```

### 5. Observer Pattern (Cross-Tab Auth Sync)

**What**: Listen to `StorageEvent` to sync auth state across browser tabs.

**Why**: User logs out in Tab A → Tab B should also redirect to login.

```ts
window.addEventListener('storage', (event) => {
    if (event.key === tokenStorageKey) {
        setHasSession(hasStoredSession()) // Re-evaluate auth
    }
})
```

### 6. Singleton Pattern (API Client & Query Client)

**What**: One shared instance of HttpClient and QueryClient for the entire app.

**Why**: Shared token state, shared cache, request deduplication.

```ts
// Created once, exported, imported everywhere
export const apiClient = new HttpClient({ ... })
export const queryClient = new QueryClient({ ... })
```

### 7. Slot Pattern (Component Composition)

**What**: Pass React nodes as props to define "slots" in a component layout.

**Why**: More flexible than children alone. Avoids complex prop APIs.

```tsx
<PageHeader
    title="Users" // Data prop
    description="Manage accounts" // Data prop
    actions={<Button>Add User</Button>} // Slot: caller decides content
    breadcrumbs={[{ label: 'Home', href: '/' }]} // Data prop
/>
```

### 8. Guard Pattern (Protected Routes)

**What**: A wrapper component that checks conditions before rendering children.

**Why**: Centralizes auth/authorization logic. Routes don't need to check auth individually.

```tsx
// One guard wraps all protected routes
<Route path="/" Component={ProtectedLayout}>
    <Route path="users" Component={UsersScreen} /> {/* Auto-protected */}
    <Route path="content" Component={ContentScreen} /> {/* Auto-protected */}
</Route>
```

### 9. Request Deduplication Pattern (Token Refresh)

**What**: Store a pending Promise and return it for concurrent callers.

**Why**: 5 concurrent API calls fail with 401 → only ONE refresh request fires, not five.

```ts
private refreshPromise: Promise<string | null> | null = null

async tryRefreshToken(): Promise<string | null> {
  if (!this.refreshPromise) {
    this.refreshPromise = this.doRefresh().finally(() => {
      this.refreshPromise = null  // Allow future refreshes
    })
  }
  return this.refreshPromise  // All callers share the same promise
}
```

---

## 18. Performance Optimization

### Bundle Size

#### 1. Code Splitting with React.lazy

```tsx
// Each lazy() call creates a separate JS chunk downloaded on demand
const DashboardScreen = React.lazy(() =>
    import('@/screens/Dashboard/DashboardScreen').then((m) => ({ default: m.DashboardScreen })),
)

// Static imports for critical-path screens (login)
import { LoginScreen } from '@/screens/Auth/LoginScreen'
```

**Impact**: Initial bundle only includes the login screen + framework code. Each screen loads ~20-100KB on first navigation instead of shipping everything upfront.

#### 2. Tree Shaking via Named Exports

```ts
// Good — tree-shakeable (bundler can remove unused exports)
export function Button() { ... }
export function Input() { ... }

// Bad — barrel re-export of default makes it harder to tree-shake
export { default as Button } from './Button'
```

#### 3. Import Only What You Need

```ts
// Good — imports only the used icon (~1KB)
import { ChevronLeft } from 'lucide-react'

// Bad — imports entire icon library (~200KB)
import * as Icons from 'lucide-react'
```

### Rendering Performance

#### 4. React 19 Compiler (Automatic Memoization)

React 19 includes the React Compiler which **automatically memoizes** components and values. This means:

```tsx
// React 19: The compiler handles memoization automatically.
// You generally do NOT need manual React.memo, useMemo, or useCallback.

// Before React 19 (manual memoization required):
const ExpensiveComponent = React.memo(({ data }) => { ... })
const filtered = useMemo(() => data.filter(expensive), [data])
const handler = useCallback(() => doThing(), [dep])

// React 19 (compiler does it for you):
function ExpensiveComponent({ data }) { ... }  // Auto-memoized
const filtered = data.filter(expensive)         // Auto-memoized
const handler = () => doThing()                 // Auto-stable reference
```

**When you STILL need manual optimization in React 19**:

- `useMemo` for truly expensive computations (>10ms) that you want to be explicit about
- `React.memo` for components receiving very large prop objects where the compiler's heuristics may not be optimal
- `useTransition` for non-urgent state updates (see below)

#### 5. `useTransition` for Non-Urgent Updates

```tsx
function SearchScreen() {
    const [query, setQuery] = React.useState('')
    const [isPending, startTransition] = React.useTransition()

    const handleSearch = (value: string) => {
        setQuery(value) // Urgent: update input immediately

        startTransition(() => {
            dispatch(searchItems(value)) // Non-urgent: can be interrupted
        })
    }

    return (
        <>
            <Input value={query} onChange={(e) => handleSearch(e.target.value)} />
            {isPending && <Spinner />}
            <ResultsList />
        </>
    )
}
```

#### 6. Virtualization for Long Lists

```tsx
// Only render visible rows — critical for 1000+ items
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualList({ items }: { items: Item[] }) {
    const parentRef = React.useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48, // Estimated row height
    })

    return (
        <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
            <div style={{ height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map((virtual) => (
                    <div
                        key={virtual.key}
                        style={{
                            position: 'absolute',
                            top: virtual.start,
                            height: virtual.size,
                            width: '100%',
                        }}
                    >
                        <Row item={items[virtual.index]} />
                    </div>
                ))}
            </div>
        </div>
    )
}
```

### Network Performance

#### 7. React Query: Stale-While-Revalidate

```ts
const { data } = useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersService.list(filters),
    staleTime: 30_000, // Data is "fresh" for 30s — no refetch
    gcTime: 5 * 60_000, // Keep unused data in cache for 5 min
    placeholderData: keepPreviousData, // Show old data while fetching new (pagination)
})
```

#### 8. Prefetching on Hover

```tsx
function UserRow({ user }: { user: AdminUser }) {
    const queryClient = useQueryClient()

    const handleMouseEnter = () => {
        // Start loading user detail before they click
        queryClient.prefetchQuery({
            queryKey: queryKeys.users.detail(user.id),
            queryFn: () => usersService.getById(user.id),
            staleTime: 60_000,
        })
    }

    return (
        <Link to={`/users/${user.id}`} onMouseEnter={handleMouseEnter}>
            {user.firstName} {user.lastName}
        </Link>
    )
}
```

#### 9. Abort Stale Requests

```ts
// React Query automatically aborts stale requests via AbortSignal
const { data } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: ({ signal }) =>
        apiClient.get('/search', {
            query: { q: debouncedQuery },
            signal, // Pass to fetch — aborted when queryKey changes
        }),
})
```

### CSS Performance

#### 10. Tailwind: Utility-First = Smaller CSS

Tailwind generates only the classes you actually use. A typical app produces **~15KB gzipped CSS** compared to 50-200KB for component libraries.

```css
/* Tailwind scans your source files and generates only used utilities */
/* Unused: bg-pink-500, text-emerald-200, etc. → NOT in the bundle */
```

---

## 19. Maintainability & Code Quality

### File Organization Rules

1. **Feature-first, not type-first**

    ```
    # Good — find everything about users in one place
    screens/Users/
    ├── UsersScreen.tsx
    ├── components/UserRow.tsx
    └── components/UserFilters.tsx

    # Bad — hunting across multiple folders
    components/UserRow.tsx
    components/UserFilters.tsx
    screens/UsersScreen.tsx
    ```

2. **Promote only when shared**
    - Start: component lives in `screens/Users/components/`
    - When used by 2+ screens: move to `components/shared/`
    - When domain-agnostic: move to `components/ui/`

3. **One export per file** (for components and hooks)
    - Makes imports predictable and enables code splitting

4. **Barrel exports at boundaries only**
    - `components/ui/index.ts` — yes (public API)
    - `screens/Users/components/index.ts` — no (internal to the screen)

### Dependency Direction

```
screens/  →  hooks/  →  store/slices/  →  services/  →  services/core/
   ↓           ↓            ↓                ↓               ↓
components/ contexts/    constants/      constants/       config/
```

**Rules:**

- `services/core/` depends on NOTHING except `config/` and `constants/`
- `services/<domain>/` depends on `services/core/` and `constants/`
- `store/slices/` depends on `services/` (to call APIs in thunks)
- `hooks/` can depend on `store/`, `services/`, `contexts/`
- `screens/` can depend on everything
- **NEVER**: `services/` imports from `screens/` or `components/`

### Consistent Error Messages

```ts
// Always provide a human-readable fallback
return rejectWithValue(toErrorMessage(error, 'Failed to create user'))

// Not this — cryptic for users
return rejectWithValue(error.toString())
```

### State Shape Consistency

Every slice follows the same shape:

```ts
interface FeatureState {
    items: Item[] // List data
    selectedItem: Item | null // Currently viewed/editing
    isLoading: boolean // Initial fetch
    isSubmitting: boolean // Create/update/delete
    error: string | null // Human-readable error
}
```

**Why?** Components can use the same loading/error patterns everywhere. New developers learn one pattern and apply it to all features.

### Code Review Checklist

- [ ] Does the import use `@/` alias (not relative `../../`)?
- [ ] Are API types defined in `models/<domain>/` (not inline in services)?
- [ ] Does the thunk use `toErrorMessage()` for consistent error handling?
- [ ] Is the component using `cn()` for class merging?
- [ ] Are all user-facing strings going through the translation system?
- [ ] Does the screen handle loading, error, and empty states?
- [ ] Is the route lazy-loaded (unless it's a critical path)?

---

## 20. Advanced Coding Techniques

### 1. Discriminated Unions for State Machines

```ts
// Instead of multiple booleans (isLoading && !error && data !== null)
// use a discriminated union that makes impossible states impossible

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

// Usage:
function renderState(state: AsyncState<User[]>) {
  switch (state.status) {
    case 'idle':    return null
    case 'loading': return <Spinner />
    case 'success': return <UserList data={state.data} />  // TS knows `data` exists
    case 'error':   return <Alert message={state.error} /> // TS knows `error` exists
  }
}
```

### 2. Generic Data Table with Type Safety

```tsx
interface Column<T> {
    key: keyof T & string
    header: string
    render?: (value: T[keyof T], row: T) => React.ReactNode
    sortable?: boolean
}

interface DataTableProps<T extends { id: string | number }> {
    data: T[]
    columns: Column<T>[]
    onRowClick?: (row: T) => void
    isLoading?: boolean
}

function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    isLoading,
}: DataTableProps<T>) {
    // The generic T flows through:
    // - Column definitions are type-checked against the data shape
    // - render() receives correctly typed values
    // - onRowClick passes the full typed row
}

// Usage — TypeScript catches column key typos at compile time:
;<DataTable<AdminUser>
    data={users}
    columns={[
        { key: 'email', header: 'Email' },
        { key: 'firstName', header: 'Name' },
        { key: 'typo', header: 'Oops' }, // ← TS error! 'typo' not in AdminUser
    ]}
/>
```

### 3. `satisfies` for Exhaustive Config Maps

```ts
// This pattern ensures EVERY route has a config entry — if you add a new route and
// forget to add it here, TypeScript errors at compile time.

type AppRoute = 'dashboard' | 'users' | 'content' | 'settings'

const routeConfig = {
    dashboard: { icon: LayoutDashboard, label: 'Dashboard' },
    users: { icon: Users, label: 'Users' },
    content: { icon: FileText, label: 'Content' },
    settings: { icon: Settings, label: 'Settings' },
} as const satisfies Record<AppRoute, { icon: React.ComponentType; label: string }>
```

### 4. Custom Hook Composition

```ts
// Build complex hooks by composing simpler ones

function useUserManagement() {
    const dispatch = useAppDispatch()
    const { items, isLoading, isSubmitting, error } = useAppSelector((s) => s.users)
    const { t } = useI18n()

    const loadUsers = React.useCallback(
        (filters?: UserFilters) => dispatch(fetchUsers(filters)),
        [dispatch],
    )

    const removeUser = React.useCallback(
        async (id: string) => {
            const result = await dispatch(deleteUser(id))
            if (deleteUser.fulfilled.match(result)) {
                toast.success(t('User deleted'))
            }
        },
        [dispatch, t],
    )

    return { users: items, isLoading, isSubmitting, error, loadUsers, removeUser }
}

// Screen becomes trivially simple:
function UsersScreen() {
    const { users, isLoading, loadUsers, removeUser } = useUserManagement()
    React.useEffect(() => {
        loadUsers()
    }, [loadUsers])
    // ... render
}
```

### 5. Optimistic Updates with React Query

```ts
const mutation = useMutation({
    mutationFn: (payload: UpdateUserRequest) => usersService.update(userId, payload),

    // Optimistic update — instant UI feedback
    onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) })
        const previous = queryClient.getQueryData(queryKeys.users.detail(userId))
        queryClient.setQueryData(queryKeys.users.detail(userId), (old: AdminUser) => ({
            ...old,
            ...payload,
        }))
        return { previous }
    },

    // Rollback on error
    onError: (_error, _payload, context) => {
        queryClient.setQueryData(queryKeys.users.detail(userId), context?.previous)
    },

    // Refetch to ensure consistency
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
    },
})
```

### 6. Type-Safe Route Parameters

```ts
// Define route params in one place
interface RouteParams {
    '/users/:id': { id: string }
    '/articles/:articleId/edit': { articleId: string }
    '/content/articles/:slug': { slug: string }
}

// Custom hook that gives typed params
function useTypedParams<T extends keyof RouteParams>(): RouteParams[T] {
    return useParams() as RouteParams[T]
}

// Usage:
function UserDetailScreen() {
    const { id } = useTypedParams<'/users/:id'>()
    // id is typed as string, not string | undefined
}
```

### 7. Debounced Search with Cleanup

```ts
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

// Usage in search:
function SearchInput() {
  const [query, setQuery] = React.useState('')
  const debouncedQuery = useDebouncedValue(query, 300)

  // This query only fires 300ms after the user stops typing
  const { data } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  return <Input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

### 8. Error Boundary with Recovery

```tsx
class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    state = { hasError: false, error: null }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Send to error tracking service (Sentry, etc.)
        console.error('ErrorBoundary caught:', error, info.componentStack)
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <h2 className="text-lg font-semibold">Something went wrong</h2>
                        <p className="text-sm text-muted-foreground">{this.state.error?.message}</p>
                        <Button onClick={() => this.setState({ hasError: false, error: null })}>
                            Try again
                        </Button>
                    </div>
                )
            )
        }

        return this.props.children
    }
}
```

---

## 21. New Feature Checklist

When adding a new feature domain, follow these steps in order:

### Step 1: Define the Data Layer

- [ ] **Models**: Create `models/<domain>/` with `<Domain>Interface.ts`, `<Domain>DTO.ts`, `<Domain>Response.ts`, and `index.ts`
- [ ] **API endpoints**: Add routes to `constants/api.ts`
- [ ] **Service**: Create `services/<domain>/<domain>Service.ts` with CRUD methods
- [ ] **Export**: Add to service barrel export / facade

### Step 2: Define State Management

- [ ] **Slice**: Create `store/slices/<domain>Slice.ts` with state, thunks, reducers
- [ ] **Register**: Add reducer to `store/store.ts` rootReducer
- [ ] **Persist decision**: Add to whitelist (if needed) or leave as non-persisted
- [ ] **Query keys**: Add entries to `services/core/queryKeys.ts` (if using React Query)

### Step 3: Build the UI

- [ ] **Screen**: Create `screens/<Feature>/<Feature>Screen.tsx`
- [ ] **Screen components**: Add to `screens/<Feature>/components/`
- [ ] **Route**: Add lazy route to `navigators/AppNavigator.tsx`
- [ ] **Navigation**: Add sidebar link (if applicable)

### Step 4: Cross-Cutting Concerns

- [ ] **Validation**: Add form schemas to `validations/schemas.ts`
- [ ] **Translations**: Add to dictionaries in `i18n/translate.ts`
- [ ] **Hook** (optional): Create `hooks/use<Feature>.ts` if logic is reused across screens

### Step 5: Verify

- [ ] Run `npx tsc --noEmit` — zero type errors
- [ ] Test loading, error, and empty states
- [ ] Test dark mode appearance
- [ ] Check responsive layout (mobile breakpoint)
- [ ] Verify the feature is code-split (lazy-loaded)

---

## Quick Reference Card

| Need                     | Go To                            | Pattern                                            |
| ------------------------ | -------------------------------- | -------------------------------------------------- |
| Add an API endpoint      | `constants/api.ts`               | `domain: { root: '/path', byId: (id) => ... }`     |
| Add an API call          | `services/<domain>/`             | `apiClient.get/post/patch/delete`                  |
| Add client state         | `store/slices/`                  | `createSlice` + `createAppAsyncThunk`              |
| Add a page               | `screens/<Feature>/`             | Lazy-loaded via `AppNavigator.tsx`                 |
| Add a reusable component | `components/shared/` or `ui/`    | Named export + props interface                     |
| Add a form               | Screen + `validations/`          | `react-hook-form` + `Controller` + rules           |
| Add an auth check        | `navigators/ProtectedLayout.tsx` | Guard pattern with `useAuth()`                     |
| Add a theme token        | `styles/theme.css`               | CSS variable + `@theme inline` mapping             |
| Add a translation        | `i18n/translate.ts`              | Dictionary entry                                   |
| Debug an API error       | `services/core/apiError.ts`      | Check `error.status`, `error.url`, `error.payload` |
