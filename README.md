# SkillForge Academy

SkillForge Academy is a personalized learning platform that combines curated learning roadmaps, AI-assisted roadmap generation, interactive topic assessments, and persistent learning progress.

## Engineering focus

The project focuses on product engineering around an AI feature rather than novel model research.

Learner context (skill level + career goal + learning style)
→ Gemini roadmap generation
→ Structured roadmap validation
→ Interactive React Flow learning path
→ Topic assessment + completion
→ Supabase progress persistence

## Implemented features

- Curated learning roadmaps for frontend, backend, full-stack, DevOps, mobile, and web scraping.
- AI-assisted roadmap generation with Gemini.
- Zod validation for AI-generated roadmap structure.
- Interactive roadmap visualization using React Flow.
- Topic assessments connected to roadmap data.
- Assessment-based skill-level updates.
- Supabase email/password authentication.
- User-scoped learning progress persistence.
- Profile and learning-preference persistence through Supabase Auth user metadata.
- Curated learning resources with real documentation/course links.
- TanStack Query for server-state fetching and caching.
- Responsive UI built with Tailwind CSS and shadcn/Radix components.

## Technology stack

- Frontend: React 18, TypeScript, Vite
- Routing: React Router
- Server state: TanStack React Query
- Authentication and database: Supabase
- AI: Google Gemini API
- Validation: Zod
- Interactive graph: React Flow
- UI: Tailwind CSS, shadcn/Radix UI
- Icons: Lucide React

## Project structure

- src/components — reusable UI and roadmap components
- src/data — curated roadmap definitions
- src/hooks — auth, roadmap, progress and preference logic
- src/pages — route-level application screens
- src/schemas — Zod validation schemas
- src/types — shared TypeScript types
- src/utils — AI and learning-resource utilities
- src/integrations/supabase — Supabase client and generated database types

## Local development

    git clone https://github.com/laxmi-narayan-87/skillforge-academy-.git
    cd skillforge-academy-
    npm install
    cp .env.example .env
    npm run dev

Set these variables in .env:

- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_GEMINI_API_KEY

Only use a Supabase publishable/anon key in the browser. Never put a Supabase secret/service-role key in VITE_* variables.

## Database security

The repository includes:

supabase/migrations/20261006143000_harden_user_data_rls.sql

Apply this migration to the linked Supabase project before production use. It enables Row Level Security and restricts profiles, roadmaps, and progress records to their owning authenticated user.

## Verification

Run locally:

    npm run lint
    npm run build

GitHub Actions also runs lint and build verification for pushes to main and pull requests.

## Important implementation notes

- Static roadmaps use stable application IDs such as frontend and backend.
- Generated roadmaps use their Supabase UUID as the route and progress identifier.
- Topic progress is scoped by both user_id and roadmap_id.
- AI output is validated before it is accepted by the application.
- Learning links are curated resources, not a live course-ranking API.
