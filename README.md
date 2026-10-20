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
- src/pages — route-level screens
- src/schemas — shared validation schemas
- src/types — shared types
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

Only use a Supabase publishable/anon key in the browser. Never put a Supabase secret/service-role key or Gemini API key in VITE_* variables. Roadmap generation runs through the authenticated Supabase Edge Function `generate-roadmap`; configure `GEMINI_API_KEY` as an Edge Function secret, not a frontend variable.

## Database and Edge Function setup

The repository migrations in `supabase/migrations` enable row-level security for user-owned data and add a per-user hourly quota for AI roadmap generation.

Confirm that the Supabase URL and publishable key used by the frontend point to the project referenced in `supabase/config.toml`. Then apply migrations and deploy the function:

    supabase db push
    supabase functions deploy generate-roadmap

Set `GEMINI_API_KEY` as a Supabase Edge Function secret through the Dashboard or with the Supabase CLI. Do not commit the secret or put it in a `VITE_*` variable. If using a local secrets file, keep it out of source control.

Run the Edge Function checks with:

    deno check supabase/functions/generate-roadmap/index.ts
    deno test supabase/functions/_shared/roadmap_test.ts

## Verification

Run locally:

    npm run lint
    npm run build

GitHub Actions runs the Edge Function type check and validation tests, plus frontend lint and build checks, on pull requests and pushes to main.

## Important implementation notes

- Static roadmaps use stable application IDs such as frontend and backend.
- Generated roadmaps use their Supabase UUID as the route and progress identifier.
- Topic progress is scoped by both user_id and roadmap_id.
- AI output is validated before it is accepted by the application.
- Learning links are curated resources, not a live course-ranking API.

## GitHub Pages deployment

The Pages workflow requires these repository Actions secrets, both targeting the same active Supabase project referenced by `supabase/config.toml`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The workflow now stops before building if either value is missing so it cannot publish a blank/broken app. Initialize Pages once in **Repository Settings → Pages → Build and deployment → Source → GitHub Actions**. The connected workflow token cannot enable an uninitialized Pages site by itself. Vercel deployment is separate from GitHub Pages.
