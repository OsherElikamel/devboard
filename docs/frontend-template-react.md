# Frontend Project Template

A reusable reference for building React + TypeScript + Tailwind frontends. Captures stack choices, architecture conventions, design principles, and component patterns that have worked well in practice.

---

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React 19 | Concurrent features, modern hooks |
| Language | TypeScript (strict) | No `any`, interfaces over types |
| Build | Vite (latest) | HMR, fast builds, ESM-native |
| Styling | Tailwind CSS v4 | `@theme` block, no config file needed |
| Animation | Framer Motion | AnimatePresence, layout animations |
| Routing | React Router v7 | File-based or code-based routes |
| HTTP | Axios | Interceptors, centralized error handling |
| Charts | Recharts | Composable, TypeScript-friendly |
| Fonts | Google Fonts via `@import` | Inter (body) + Space Grotesk (headings) |

---

## Project Structure

```
src/
├── components/
│   ├── ui/           # Atoms: Button, Badge, Input, ProgressBar, Toggle, Modal
│   ├── layout/       # AppShell, Sidebar, Topbar, PageWrapper
│   ├── [feature]/    # Feature-scoped components (projects/, tasks/, dashboard/)
│   └── charts/       # Chart wrapper components
├── contexts/         # React context providers (Auth, Theme, Layout)
├── pages/            # One file per route — thin orchestrators, no raw API calls
├── routes/           # Route definitions, protected route guards
├── services/         # Axios API calls — one file per domain (projects.ts, tasks.ts)
├── types/            # TypeScript interfaces — one central index.ts
└── utils/            # Pure, side-effect-free utility functions (format.ts)
```

### Key rules
- **Pages are orchestrators.** They fetch data, pass it to components, and handle top-level state. No raw `axios` calls in pages — always go through `services/`.
- **Components are display units.** Props in, JSX out. Side effects only for local UI (modals, dropdowns). No API calls inside components.
- **Services are the API boundary.** One function per endpoint. Return typed data. Handle Axios errors at the interceptor level.
- **Utils are pure.** No imports from the rest of the app. Utility functions like `timeAgo`, `dueLabel`, `formatDate` live here.

---

## Design System (index.css)

### Theme setup (Tailwind v4 `@theme` block)

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600&display=swap');

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Semantic color tokens — use these everywhere, not raw hex */
  --color-app-bg:             #0F1523;   /* page background */
  --color-app-surface:        #1A2035;   /* cards, panels */
  --color-app-elevated:       #212842;   /* dropdowns, modals */
  --color-app-border:         rgba(255, 255, 255, 0.08);
  --color-app-text:           #F1F5F9;
  --color-app-text-secondary: #94A3B8;
  --color-app-text-muted:     #64748B;
  --color-app-hover:          rgba(255, 255, 255, 0.06);
  --color-app-input:          rgba(255, 255, 255, 0.07);

  /* Accent — cyan/sky family */
  --color-accent:             #38BDF8;
  --color-accent-hover:       #22D3EE;
  --color-accent-dark:        #0284C7;

  /* Semantic status colors */
  --color-success:            #22C55E;
  --color-warning:            #F59E0B;
  --color-danger:             #EF4444;

  /* Fonts */
  --font-sans:  'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-tech:  'Space Grotesk', ui-monospace, monospace;
}
```

### Light mode override

```css
:root:not(.dark) {
  --color-app-bg:             #F8FAFC;
  --color-app-surface:        #FFFFFF;
  --color-app-elevated:       #F1F5F9;
  --color-app-border:         #E2E8F0;
  --color-app-text:           #0F172A;
  --color-app-text-secondary: #475569;
  --color-app-hover:          rgba(0, 0, 0, 0.04);
  --color-app-input:          #F1F5F9;
}
```

### Color philosophy
- **Three-layer depth**: `bg` → `surface` → `elevated`. Cards sit on surface. Modals/dropdowns use elevated.
- **Border instead of shadow**: Use `border border-[var(--color-app-border)]` instead of box-shadow for depth. Cleaner in dark mode.
- **Low-opacity backgrounds**: `bg-white/5`, `bg-black/10` for hover states, overlays, and inputs. Avoids harsh color changes.
- **Accent sparingly**: Cyan accent only for primary actions, active states, and highlights. Not decoration.

### Typography
- **Body**: Inter — clear, neutral, professional
- **Headings/Technical**: Space Grotesk — modern, slightly geometric, great for numbers and tech labels
- **Scale**: Use Tailwind's default type scale (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`)
- **Weight**: 400 (body), 500 (ui labels), 600 (headings), 700 (stat numbers / emphasis)

---

## Component Patterns

### Inline editing (click-to-edit)
```tsx
const [editing, setEditing] = useState(false);
const [draft, setDraft] = useState(value);
const ref = useRef<HTMLInputElement>(null);

// Click on text → show input
// Enter or blur → save (call onSave)
// Escape → cancel (restore draft to value)
// Always stopPropagation on the input to avoid triggering parent handlers
```

### Click-outside detection
```tsx
useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      onClose();
    }
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, [onClose]);
```

### Demo mode pattern
```tsx
const { isDemo } = useAuth();
// In event handlers:
if (isDemo) {
  setLocalState(updated);  // Optimistic local update only
  return;
}
await api.update(id, data);  // Real API call for authenticated users
```

### Loading skeletons over spinners
```tsx
// Use animated skeleton divs instead of spinner for content areas
// Spinner is acceptable only for button-level loading
<div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
```

### Empty states
```tsx
// Always provide an empty state with icon + message + optional CTA
// Don't show blank space when data is empty
```

---

## State Management

- **Global auth state**: React Context (`AuthContext`) — user, token, isDemo, login, logout
- **Global layout state**: React Context (`LayoutContext`) — sidebar open, theme
- **Page-level data**: `useState` + `useEffect` for fetching, loading, error
- **UI state**: Local `useState` (modals open, editing states, form drafts)
- **No Redux/Zustand**: Context + local state is sufficient for apps of this scale

### Pattern for data fetching in pages
```tsx
const [data, setData] = useState<T[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  (async () => {
    try {
      const result = await api.getData();
      setData(result);
    } finally {
      setLoading(false);
    }
  })();
}, []);
```

---

## API / Service Layer

```typescript
// services/projects.ts — thin wrappers around axios
import api from './api';  // configured axios instance with interceptors

export const getProjects = () => api.get<Project[]>('/projects').then(r => r.data);
export const createProject = (data: CreateProjectInput) => api.post<Project>('/projects', data).then(r => r.data);
export const updateProject = (id: string, data: Partial<Project>) => api.patch<Project>(`/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id: string) => api.delete(`/projects/${id}`);
```

```typescript
// services/api.ts — axios instance
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## TypeScript Conventions

```typescript
// types/index.ts — all interfaces centralized
export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  // ...
}

export type ProjectStatus = 'idea' | 'in_progress' | 'testing' | 'deployed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';

// Never use 'any'. Use 'unknown' and narrow, or define proper interfaces.
// Use discriminated unions for status fields.
// Interfaces for objects. Type aliases for unions/primitives.
```

---

## Routing

```tsx
// routes/index.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route element={<ProtectedRoute />}>
    <Route element={<AppShell />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailsPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Route>
  </Route>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
</Routes>
```

---

## Animation

```tsx
// Page transitions
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
  {children}
</motion.div>

// Modal entrance
initial={{ opacity: 0, scale: 0.96 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.96 }}
```

---

## UX Principles

1. **Inline editing over modals** — prefer click-to-edit in place. Modals only for complex forms (create, configure).
2. **Optimistic UI** — update local state immediately, revert on error.
3. **Skeletons not spinners** — skeleton loading states for content areas.
4. **Empty states** — every list/table must have an empty state with icon, message, and CTA.
5. **Keyboard support** — Enter to confirm, Escape to cancel for inline edits and modals.
6. **Destructive actions** — always require confirmation before delete.
7. **Mobile-first** — design for mobile, enhance for desktop. Sidebar collapses to drawer on mobile.
8. **No disabled states without explanation** — if a button is disabled, explain why.

---

## Environment Variables

```bash
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:8000/api
```

Always prefix with `VITE_` for Vite to expose them to the browser. Never put secrets here — they're public.

---

## Docker (Development)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

---

## Deployment (Render / Vercel)

- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_BASE_URL` to the production backend URL in the hosting platform's environment variables
- No server needed — output is purely static HTML/JS/CSS

---

## File Naming

- Components: `PascalCase.tsx` (e.g., `TaskDetailModal.tsx`)
- Pages: `PascalCase.tsx` (e.g., `ProjectDetailsPage.tsx`)
- Utilities / services: `camelCase.ts` (e.g., `format.ts`, `projects.ts`)
- Constants: `kebab-case.ts` (e.g., `priority-constants.ts`)

---

## Code Quality

- No `console.log` in committed code
- No `any` in TypeScript
- No inline styles — Tailwind classes only
- No hardcoded colors outside of `index.css` design tokens
- No unused imports or variables
- Keep components under ~200 lines; extract if larger
- Shared logic lives in `utils/`, not duplicated across components
