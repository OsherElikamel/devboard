# Frontend Project Standards

This document defines the professional standard expected for any frontend project I build, regardless of the specific technology stack. It covers architecture, code quality, design principles, developer experience, and production readiness.

Give this file to an AI coding assistant at the start of a project so it understands the level of quality expected from the very first file.

---

## Philosophy

Every project — even a small one — should be built as if a team will inherit it. That means clear structure, intentional decisions, no shortcuts disguised as speed, and code that a stranger could read six months later without asking questions.

"Make it work" is step one, not the finish line.

---

## Before Writing Code

### Plan the architecture first
Before creating any files, decide:
- What pages/views exist and how they connect
- What the component hierarchy looks like (layout > pages > features > atoms)
- Where state lives (global vs. local vs. URL)
- How the frontend talks to the backend (API layer structure)
- What the design system looks like (colors, spacing, typography, dark/light mode)

Write this down. Even a short list of decisions prevents drift later.

### Design the folder structure
The folder structure should communicate the architecture at a glance. Anyone opening the project should immediately understand where to find things.

**Principles:**
- Group by responsibility, not by file type. Don't put all `.tsx` files in one folder.
- Pages are thin orchestrators. They fetch data and compose components. They don't contain raw API calls or complex logic.
- Components are display units. Props in, JSX out. No direct API calls inside components.
- Services are the API boundary. One function per endpoint. This is the only layer that knows about HTTP.
- Utils are pure functions. No side effects, no imports from the rest of the app.
- Types are centralized. One source of truth for data shapes.

**Example structure (adapt to your framework):**
```
src/
├── components/
│   ├── ui/           # Generic atoms: Button, Input, Badge, Modal, Toggle
│   ├── layout/       # Shell, Sidebar, Topbar, PageWrapper
│   └── [feature]/    # Feature-scoped components grouped by domain
├── pages/            # One file per route
├── routes/           # Route definitions, guards, redirects
├── contexts/         # Global state providers
├── services/         # API call functions — the only layer touching HTTP
├── types/            # TypeScript interfaces and type definitions
└── utils/            # Pure utility functions (formatting, validation, helpers)
```

---

## Design System

### Define tokens, not colors
Never use raw hex/rgb values scattered across components. Define a design token system (CSS custom properties, theme object, or whatever the framework supports) and reference tokens everywhere.

**Minimum token set:**
- `bg` — page background
- `surface` — card/panel background
- `elevated` — modal/dropdown background (one step above surface)
- `border` — default border color
- `text` — primary text
- `text-secondary` — secondary/muted text
- `accent` — primary brand/action color
- `success`, `warning`, `danger` — semantic status colors

### Dark and light mode
If the project supports theming, implement it through the token system. Switching themes should only change token values — components never check "am I in dark mode?"

### Typography
- Choose a maximum of two font families: one for body text, one for headings or technical content
- Define a consistent type scale (don't invent sizes per component)
- Define consistent font weights (400 body, 500 labels, 600 headings, 700 emphasis)

### Spacing and layout
- Use the framework's spacing scale consistently (e.g., 4px increments)
- Prefer border over shadow for depth in dark themes
- Use low-opacity overlays for hover/active states instead of solid color changes
- Cards and containers should have consistent padding and border-radius across the app

---

## Component Architecture

### Separation of concerns
- **Pages** know about routing and data fetching. They call services, manage loading/error states, and pass data to components.
- **Components** know about display. They receive props and render UI. They manage only local UI state (open/closed, editing/viewing).
- **Services** know about HTTP. They make API calls and return typed data.
- **Utils** know about data transformation. Pure functions with no side effects.

### Component size
- Keep components under ~200 lines. If a component grows larger, extract sub-components.
- A component should do one thing well. If you can't describe what it does in one sentence, it's too big.

### Naming
- Components: `PascalCase` (e.g., `TaskDetailModal`, `ProjectCard`)
- Pages: `PascalCase` with `Page` suffix (e.g., `DashboardPage`, `SettingsPage`)
- Utils and services: `camelCase` (e.g., `formatDate`, `getProjects`)
- Constants: `camelCase` or `UPPER_SNAKE_CASE` depending on convention
- File names should match the export name

### Props
- Type every prop explicitly. No `any`.
- Destructure props in the function signature for readability.
- Required props first, optional props second.
- Event handler props should follow `onAction` naming (e.g., `onClose`, `onSave`, `onDelete`).

---

## State Management

### Keep it simple
- Use the simplest tool that works: local state for UI, context for global state (auth, theme), URL for shareable state (filters, pagination).
- Don't reach for external state libraries (Redux, Zustand, Jotai) unless you have a clear reason — context + local state handles most apps.
- If state is only used by one component, it belongs in that component. Don't lift state "just in case."

### Data fetching pattern
- Fetch in pages, not components.
- Always track three states: `loading`, `data`, `error`.
- Show loading skeletons for content areas (not spinners — spinners are only for button-level loading).
- Always provide an empty state when data is an empty array. Never show a blank page.

---

## API / Service Layer

### Centralized HTTP client
- Create one configured HTTP client instance (axios, fetch wrapper, etc.) with:
  - Base URL from environment variable
  - Auth token auto-attached via interceptor/middleware
  - Global error handling (401 → redirect to login)
- All service functions import this single client. Never create axios instances in components.

### Service function pattern
- One file per domain (e.g., `projects.ts`, `tasks.ts`, `auth.ts`)
- Each function wraps a single API call
- Return typed data, not raw responses
- Let errors propagate — handle them in pages or interceptors, not in service functions

---

## UX Principles

1. **Inline editing over modals** — for simple field edits (title, description, status), use click-to-edit in place. Reserve modals for complex creation forms.
2. **Optimistic UI** — update the UI immediately on user action, revert if the API call fails.
3. **Keyboard support** — Enter to confirm, Escape to cancel. Every modal should close on Escape.
4. **Destructive actions require confirmation** — never delete on a single click.
5. **Loading states everywhere** — no content area should ever be blank while data is loading.
6. **Empty states** — every list must have an empty state with an icon, a message, and optionally a call-to-action.
7. **Responsive design** — design for mobile first, enhance for desktop. Navigation should collapse gracefully on small screens.
8. **Error feedback** — when something fails, tell the user what happened and what they can do about it.

---

## Environment Variables

- Use `.env` for local values (never committed)
- Use `.env.example` for documentation (committed — shows all required variables with placeholder values)
- Never put secrets in frontend env vars — they are embedded in the JavaScript bundle and visible to anyone
- Prefix variables according to your build tool's convention (e.g., `VITE_` for Vite, `NEXT_PUBLIC_` for Next.js, `REACT_APP_` for CRA)

---

## Git and Repository Hygiene

### .gitignore (must include)
- `node_modules/`
- Build output (`dist/`, `build/`, `.next/`)
- `.env` (but NOT `.env.example`)
- IDE/editor config (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Log files

### Commit messages
- Write in imperative mood: "Add task modal" not "Added task modal"
- Keep the first line under 70 characters
- If more context is needed, add a blank line and then a body paragraph
- Each commit should represent one logical change — don't combine unrelated changes

### Branch workflow
- `main` branch should always be deployable
- Create feature branches for new work
- Keep branches short-lived — merge or rebase frequently

---

## README

Every project must have a README that includes:
1. **What the project is** — one paragraph explaining what it does
2. **Tech stack** — what technologies are used and why
3. **How to run it** — step-by-step setup instructions (clone, install, env, start)
4. **Project structure** — a tree showing the folder layout with one-line descriptions
5. **Environment variables** — a table listing each variable, its purpose, and default/example value
6. **Screenshots** — optional but recommended for UI projects

The README is the front door of your project. If someone can't get it running in 5 minutes by following the README, the README needs work.

---

## Docker (when applicable)

- Use Docker and Docker Compose for local development when the project has multiple services (frontend, backend, database)
- The Dockerfile should be optimized: copy dependency files first, install, then copy source code (leverages layer caching)
- Docker Compose is a development tool — production platforms (Render, Vercel, etc.) have their own build systems
- Mount source code as a volume in dev so hot-reload works inside the container

---

## Deployment

- Frontend apps are static after build — deploy to any static hosting (Render Static Site, Vercel, Netlify, Cloudflare Pages)
- Environment variables for the frontend are baked in at build time — set them in the hosting platform's dashboard
- Ensure CORS is configured correctly on the backend to accept requests from the deployed frontend URL
- Test the production build locally (`npm run build && npm run preview`) before deploying

---

## Code Quality Expectations

- No `any` in TypeScript. Use `unknown` and narrow, or define proper interfaces.
- No `console.log` in committed code (use it for debugging, remove before committing)
- No inline styles — use the project's styling system exclusively
- No hardcoded colors or magic numbers — reference design tokens and named constants
- No unused imports, variables, or dead code
- No duplicated logic — extract to utils or shared components when the same pattern appears three times
- No comments explaining WHAT the code does — the code should be clear enough. Only comment WHY when the reason is non-obvious.

---

## Production Readiness Checklist

Before considering a project "done":

- [ ] README is complete and accurate
- [ ] `.env.example` documents all required variables
- [ ] `.gitignore` excludes everything it should
- [ ] No secrets in the codebase or git history
- [ ] Production build succeeds without errors or warnings
- [ ] All pages have loading states, empty states, and error states
- [ ] The app works on mobile
- [ ] Dark/light mode works if implemented
- [ ] Favicon and page titles are set (not default Vite/CRA text)
- [ ] No console errors in the browser
- [ ] The app is deployed and accessible via a public URL
