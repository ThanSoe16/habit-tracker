# Project Overview

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**:
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Shadcn UI](https://ui.shadcn.com/)
  - [Lucide React](https://lucide.dev/) (Icons)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms & Validation**:
  - [React Hook Form](https://react-hook-form.com/)
  - [Zod](https://zod.dev/)
- **PWA / Service Worker**: [Serwist](https://serwist.pages.dev/)
- **Utilities**:
  - `date-fns`: Date manipulation
  - `@dnd-kit`: Drag & Drop
  - `nuqs`: URL Query State

## Folder Structure

```
src/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home/Splash page
│   └── sw.ts             # Service Worker entry point
│
├── components/           # React Components
│   ├── ui/               # Reusable UI components (Buttons, Inputs, etc.)
│   ├── layouts/          # Layout wrappers (e.g., MainLayout, AuthLayout)
│   ├── pages/            # Page-specific components (e.g., habits, home)
│   └── providers/        # Context providers (Theme, Auth, etc.)
│
├── features/             # Feature-based modules (e.g., 'habits')
│   └── habits/           # Specific logic/components for habits
│
├── hooks/                # Custom React Hooks (e.g., useDailyReminder)
├── lib/                  # Library configurations (currently empty, typically for Utils/DB)
├── store/                # Zustand state stores (e.g., useUserStore)
├── styles/               # Global styles (globals.css)
└── utils/                # Helper functions (dateUtils, colorUtils, cn)
```
