# DevBoard Frontend Design Brief

## 1. Project Overview

**Project name:** DevBoard  
**Product type:** Personal developer dashboard / project tracker  
**Main goal:** Help developers track their coding projects, progress, technologies, GitHub links, deployment links, and project status in one clean dashboard.

DevBoard should feel like a polished productivity dashboard built for developers. It should be practical, clean, modern, and slightly futuristic, with enough visual polish to feel impressive without becoming distracting or over-designed.

The app should not feel like a childish gamified app. It should feel like a serious but cool tool that a developer would actually use.

---

## 2. Visual Direction

The design should combine three main styles:

1. **Clean SaaS dashboard**  
   Clear layout, readable UI, professional spacing, useful cards, good hierarchy.

2. **Dark futuristic developer dashboard**  
   Subtle glow effects, technical feeling, developer-focused elements, sleek dark UI.

3. **Premium Apple-style polish**  
   Smooth transitions, soft shadows, rounded corners, refined typography, calm and elegant visuals.

The final result should feel like:

> A professional developer productivity dashboard with futuristic touches and premium polish.

---

## 3. Theme System

The app should support both:

- Dark mode
- Light mode

However, **dark mode should be the primary design direction**.

The dark mode should feel richer and more visually impressive. Light mode should be clean and usable, but it can be simpler.

### Theme toggle

Include a theme toggle in the top bar.

Recommended behavior:

- Default to dark mode.
- Save user preference in local storage.
- Smooth transition when switching themes.

---

## 4. Color Palette

### Primary color direction

Use a **blue / cyan / electric** color system.

The UI should use mostly neutral dark colors with electric blue/cyan accents.

### Dark mode colors

Recommended dark palette:

```txt
Background: #070B14 or #090D18
Surface: #101624
Surface elevated: #151C2E
Border: rgba(255, 255, 255, 0.08)
Primary accent: #38BDF8
Secondary accent: #22D3EE
Text primary: #F8FAFC
Text secondary: #94A3B8
Text muted: #64748B
Success: #22C55E
Warning: #F59E0B
Danger: #EF4444
```

### Light mode colors

Recommended light palette:

```txt
Background: #F8FAFC
Surface: #FFFFFF
Surface elevated: #F1F5F9
Border: #E2E8F0
Primary accent: #0284C7
Secondary accent: #0891B2
Text primary: #0F172A
Text secondary: #475569
Text muted: #64748B
Success: #16A34A
Warning: #D97706
Danger: #DC2626
```

### Accent usage

Use the electric blue/cyan accent for:

- Primary buttons
- Active navigation states
- Progress bars
- Chart highlights
- Important numbers
- Hover glows
- Focus states

Avoid making the entire UI blue. The accent should feel premium and intentional.

---

## 5. Shape Language

The UI should use a mix of:

- Rounded cards
- Soft shadows
- Glassmorphism
- Floating hover effects

### Recommended styling

Cards should have:

- Rounded corners: `16px` to `24px`
- Subtle border
- Soft shadow
- Slight background transparency in dark mode
- Optional blur/glass effect for important dashboard sections

Example card style:

```txt
border-radius: 20px;
background: rgba(15, 23, 42, 0.72);
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
backdrop-filter: blur(16px);
```

---

## 6. Layout Structure

Use a combination of:

- Left sidebar
- Top bar
- Bento-style dashboard grid

### Main app shell

```txt
-------------------------------------------------
| Sidebar | Top Bar                              |
|         |--------------------------------------|
|         | Main dashboard content               |
|         |                                      |
|         | Bento grid / cards / project views   |
-------------------------------------------------
```

### Sidebar

The sidebar should be clean, compact, and developer-focused.

Suggested navigation:

```txt
Dashboard
Projects
Tasks
Tech Stack
Learning Notes
Deployments
Settings
```

Sidebar behavior:

- Active item has blue/cyan accent.
- Hover effect on nav items.
- Icons next to labels.
- Collapsible sidebar is optional, not required for MVP.

### Top bar

Top bar should include:

- Page title
- Search input
- Theme toggle
- User profile/avatar area
- Optional quick action button: `+ New Project`

---

## 7. Dashboard Content

The dashboard should emphasize:

1. Project progress
2. GitHub/live deployment links
3. Technologies used

The dashboard should immediately answer:

- How many projects exist?
- Which projects are active?
- Which projects are deployed?
- What technologies are being used?
- What is the progress of each project?

### Dashboard sections

Recommended dashboard cards:

#### 1. Overview stat cards

Cards showing:

```txt
Total Projects
Active Projects
Deployed Projects
Average Progress
```

Each stat card should include:

- Large number
- Small label
- Small icon
- Subtle hover animation
- Optional mini progress indicator

#### 2. Project progress summary

A larger card showing overall progress across all projects.

Possible visual:

- Donut chart showing project statuses
- Progress breakdown by status

Example statuses:

```txt
Idea
In Progress
Testing
Deployed
Archived
```

#### 3. Featured projects

A grid of important project cards.

Each card should show:

```txt
Project title
Short description
Status badge
Progress bar
Tech stack tags
GitHub link
Live demo link
Last updated date
```

#### 4. Technologies used

A visual card showing tech stack tags.

Example:

```txt
React
TypeScript
FastAPI
PostgreSQL
Docker
JWT
```

Use pill-shaped tags with hover effects.

#### 5. Recent activity

Optional but useful.

Show recent actions like:

```txt
Updated DevBoard progress to 65%
Added PostgreSQL to Tech Stack
Marked Docker Compose setup as complete
Added live deployment link
```

This can be built later if needed.

---

## 8. Project Cards

Project cards are one of the most important parts of the UI.

The chosen style is:

- Big visual cards
- Status
- Progress
- Tasks summary
- Tech tags
- GitHub/deployment links

### Project card structure

Each project card should include:

```txt
[Status badge]
Project name
Short description

Progress: 72%
[linear progress bar]

Tech:
React  FastAPI  PostgreSQL  Docker

Links:
GitHub | Live Demo
```

### Project card hover behavior

On hover:

- Card lifts slightly upward
- Border becomes brighter
- Subtle blue/cyan glow appears
- Links become more visible
- Progress bar may slightly brighten

Do not overdo the animation. It should feel smooth and premium.

### Status badge colors

```txt
Idea: gray / slate
In Progress: cyan / blue
Testing: amber
Deployed: green
Archived: muted gray
```

---

## 9. Visual Elements

The user specifically wants cool visuals but not excessive fancy extras.

Include these visual elements:

### 1. Linear progress bars

Use progress bars for:

- Project completion
- Task completion
- Dashboard average progress

Progress bars should be smooth and visually satisfying.

Example:

```txt
Project progress: 64%
[====================------]
```

### 2. Donut chart

Use a donut chart for project status distribution.

Example:

```txt
45% In Progress
30% Deployed
15% Idea
10% Archived
```

The donut chart should sit inside a dashboard card.

### 3. Animated stat cards

Stats should have subtle animation:

- Hover lift
- Glow border
- Count-up animation is optional

### 4. Tech stack tags

Tech tags should look clean and developer-oriented.

Examples:

```txt
TypeScript
Python
FastAPI
PostgreSQL
Docker
JWT
React
Vite
```

Tags should be pill-shaped and clickable/filterable eventually.

---

## 10. Animation Style

Animation level should be **medium**.

The UI should feel alive, but not flashy.

Recommended animations:

- Smooth hover lift on cards
- Soft glowing borders on hover
- Smooth sidebar item hover
- Button press scale effect
- Progress bars animate when loaded
- Page transitions fade/slide subtly

Avoid:

- Too many bouncing effects
- Confetti
- Excessive parallax
- Heavy background animation
- Anything that makes the app feel childish

Recommended transition timing:

```txt
150ms to 250ms for hover interactions
250ms to 400ms for page transitions
```

---

## 11. Typography

The typography should feel:

- Developer/technical
- Modern
- Clean
- Readable

Recommended fonts:

```txt
Primary UI font: Inter, Geist, or SF Pro style font
Code/technical accent font: JetBrains Mono or Fira Code
```

Use the monospace font only for:

- Small labels
- Tech tags
- Version/status metadata
- Code-like values

Do not use monospace for all body text.

### Typography hierarchy

```txt
Page title: 28px–36px, bold
Section title: 18px–22px, semibold
Card title: 16px–18px, semibold
Body text: 14px–16px
Small metadata: 12px–13px
```

---

## 12. Authentication Pages

The login/register pages should use:

- Dark glass card
- Animated or gradient background
- Clean centered form
- Premium developer-dashboard feeling

### Login page layout

Recommended:

```txt
Full-screen dark background
Subtle blue/cyan gradient glow
Centered glassmorphism card
Logo/title at top
Email field
Password field
Primary login button
Secondary link to register
```

### Auth card style

The auth form should feel polished and calm.

Use:

- Rounded glass card
- Soft blue glow
- Clear input focus states
- Smooth hover on button

Example title:

```txt
Welcome back to DevBoard
Track your builds. Ship your projects.
```

Register page title:

```txt
Create your DevBoard account
Start tracking your developer journey.
```

---

## 13. App Personality

The app should feel like a mix of:

- Productivity dashboard
- Professional but fun developer tool

It should be practical first, visually cool second.

The app should not feel too corporate, and not too playful.

Best description:

> A polished developer productivity dashboard that makes tracking projects feel satisfying.

---

## 14. Responsiveness

The app should be **desktop-first but responsive**.

### Desktop

Desktop is the main priority.

The dashboard should use:

- Sidebar
- Top bar
- Bento grid
- Multi-column card layout

### Tablet

On medium screens:

- Sidebar may become narrower
- Cards move into two columns
- Top bar remains visible

### Mobile

On mobile:

- Sidebar becomes bottom nav or hamburger menu
- Cards stack vertically
- Search can collapse or move lower
- Project cards should remain readable

Mobile does not need to be perfect for MVP, but it should not break.

---

## 15. Inspiration Direction

The chosen inspiration style is:

- Gaming dashboard

However, this should be interpreted carefully.

Use gaming-dashboard inspiration for:

- Strong visual cards
- Progress indicators
- Status indicators
- Dark background
- Glow effects
- Cool hover states
- Dashboard energy

Do not make it look like a video game menu.

The app should still be professional and GitHub/interview friendly.

Think:

> Professional SaaS dashboard with gaming-style progress visuals.

Not:

> Neon arcade game UI.

---

## 16. Pages to Design

### MVP pages

The frontend should include these pages:

```txt
/login
/register
/dashboard
/projects
/projects/:id
/settings
```

Optional later pages:

```txt
/tasks
/tech-stack
/learning-notes
/deployments
```

---

## 17. Page Details

## Login Page

Purpose:
Allow existing users to log in.

Elements:

- App logo/name
- Email input
- Password input
- Login button
- Link to register
- Dark glassmorphism card
- Blue/cyan glow background

---

## Register Page

Purpose:
Allow new users to create an account.

Elements:

- Name input
- Email input
- Password input
- Confirm password input
- Register button
- Link to login
- Same visual style as login page

---

## Dashboard Page

Purpose:
Give the user a high-level view of all projects and progress.

Sections:

1. Stat cards
2. Project status donut chart
3. Featured/recent project cards
4. Tech stack summary
5. Quick links to GitHub/live demos

---

## Projects Page

Purpose:
Show all projects.

Elements:

- Page title: `Projects`
- Button: `+ New Project`
- Search/filter area
- Project cards grid
- Status filter
- Tech filter

Project card should include:

- Title
- Description
- Status
- Progress bar
- Tech tags
- GitHub link
- Live demo link

---

## Project Details Page

Purpose:
Show a single project in detail.

Sections:

```txt
Project header
Progress section
Tech stack section
Links section
Tasks section
Learning notes section
Deployment info section
```

Project header should include:

- Project title
- Status badge
- Description
- GitHub link
- Live demo link
- Edit button

Progress section:

- Large progress bar
- Completion percentage
- Task completion summary

Tasks section:

- Task list
- Checkbox for done/not done
- Priority badge

Tech stack section:

- Tags for technologies used

Learning notes section:

- Notes or cards describing what was learned

---

## Settings Page

Purpose:
Basic user/account preferences.

Elements:

- Profile info
- Theme toggle
- Account settings
- Logout button

---

## 18. Components to Build

Recommended component structure:

```txt
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── auth/
│   │   ├── AuthCard.tsx
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── ProjectStatusChart.tsx
│   │   ├── ProgressSummaryCard.tsx
│   │   └── TechStackSummary.tsx
│   │
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectHeader.tsx
│   │   └── ProjectProgress.tsx
│   │
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Input.tsx
│   │   └── ThemeToggle.tsx
│   │
│   └── charts/
│       └── DonutChart.tsx
│
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailsPage.tsx
│   └── SettingsPage.tsx
│
├── routes/
│   └── AppRoutes.tsx
│
├── services/
│   └── api.ts
│
├── types/
│   └── index.ts
│
├── styles/
│   └── globals.css
│
└── main.tsx
```

---

## 19. Data Models for Frontend Mocking

Before connecting to the backend, the frontend can use mock data.

### Project type

```ts
export type ProjectStatus = "idea" | "in_progress" | "testing" | "deployed" | "archived";

export type Project = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  githubUrl?: string;
  liveUrl?: string;
  techStack: string[];
  tasksCompleted: number;
  totalTasks: number;
  updatedAt: string;
};
```

### Task type

```ts
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  isDone: boolean;
  priority: TaskPriority;
  createdAt: string;
};
```

### Learning note type

```ts
export type LearningNote = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  topic: string;
  createdAt: string;
};
```

---

## 20. Example Mock Projects

```ts
export const mockProjects = [
  {
    id: "1",
    title: "DevBoard",
    description: "A personal developer dashboard for tracking projects, tasks, tech stacks, and deployments.",
    status: "in_progress",
    progress: 68,
    githubUrl: "https://github.com/example/devboard",
    liveUrl: "https://devboard.example.com",
    techStack: ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
    tasksCompleted: 17,
    totalTasks: 25,
    updatedAt: "2026-05-04"
  },
  {
    id: "2",
    title: "Portfolio Website",
    description: "A personal portfolio website for showcasing projects and experience.",
    status: "deployed",
    progress: 100,
    githubUrl: "https://github.com/example/portfolio",
    liveUrl: "https://portfolio.example.com",
    techStack: ["React", "Vite", "CSS"],
    tasksCompleted: 12,
    totalTasks: 12,
    updatedAt: "2026-04-20"
  },
  {
    id: "3",
    title: "Expense Tracker API",
    description: "A backend API for tracking personal income and expenses.",
    status: "idea",
    progress: 10,
    githubUrl: "https://github.com/example/expense-api",
    techStack: ["Python", "FastAPI", "PostgreSQL"],
    tasksCompleted: 1,
    totalTasks: 10,
    updatedAt: "2026-04-28"
  }
];
```

---

## 21. Interaction Details

### Buttons

Primary buttons:

- Blue/cyan background
- White text
- Rounded corners
- Hover glow
- Slight scale on press

Secondary buttons:

- Transparent or muted background
- Border
- Hover background

Danger buttons:

- Red accent
- Use only for delete/logout destructive actions

---

## 22. Hover Effects

The user likes hover effects, so they should be included throughout the UI.

### Cards

On hover:

```txt
translateY(-4px)
slightly stronger border
subtle cyan glow
shadow increase
```

### Buttons

On hover:

```txt
slightly brighter background
soft glow
cursor pointer
```

### Tech tags

On hover:

```txt
background becomes slightly brighter
border color changes to cyan
```

### Sidebar items

On hover:

```txt
background highlight
icon/text move 1-2px to the right
```

---

## 23. Empty States

The app should have useful empty states.

Example when no projects exist:

```txt
No projects yet
Start by creating your first project and tracking your progress from idea to deployment.
[Create Project]
```

Empty states should be visually nice, not plain text.

Use:

- Small icon
- Short title
- Helpful description
- Primary action button

---

## 24. Loading States

Use skeleton loading cards.

Examples:

- Skeleton stat cards
- Skeleton project cards
- Skeleton chart card

Avoid full-page spinners except on initial app load.

---

## 25. Error States

Error messages should be clear and calm.

Example:

```txt
Could not load projects.
Please try again.
[Retry]
```

Use red carefully. Do not make error states visually aggressive.

---

## 26. Accessibility Notes

The design should include:

- Good color contrast
- Visible focus states
- Keyboard-accessible buttons and links
- Labels for form inputs
- Semantic headings
- Meaningful button text

Do not rely only on color to show status. Use labels too.

---

## 27. Recommended Libraries

For frontend implementation:

```txt
React
Vite
TypeScript
React Router
Axios or fetch
Tailwind CSS
Lucide React for icons
Recharts for donut chart
```

Optional:

```txt
Framer Motion for smooth animations
```

Use Framer Motion only if it does not make the code too complex.

---

## 28. Design Priorities

Priority order:

1. Clean layout
2. Good dashboard structure
3. Strong project cards
4. Good dark mode
5. Useful progress visuals
6. Smooth hover effects
7. Responsive layout
8. Light mode support

Do not sacrifice readability for cool visuals.

---

## 29. MVP Design Scope

For the first version, focus on:

```txt
Login page
Register page
Dashboard page
Projects page
Project details page
Theme toggle
Project cards
Progress bars
Donut chart
Tech tags
```

Do not start with too many advanced views.

Avoid in MVP:

```txt
Calendar
Notifications
Real-time updates
Team collaboration
Comments
Chat
Complex analytics
```

---

## 30. Final Design Summary

DevBoard should look like a modern developer productivity dashboard.

It should use:

- Dark-first design
- Light mode support
- Blue/cyan electric accent
- Sidebar + topbar app shell
- Bento dashboard grid
- Big project cards
- Linear progress bars
- Donut chart
- Animated stat cards
- Tech stack tags
- Smooth medium-level animations
- Developer/technical typography
- Glassy dark authentication screens
- Desktop-first responsive layout

The final UI should feel:

```txt
Professional
Developer-focused
Clean
Practical
Cool
Slightly futuristic
Smooth
GitHub-worthy
```

The user does not need an over-the-top design. The goal is a clean, impressive full-stack portfolio project that looks good, works well, and demonstrates real engineering skills.

