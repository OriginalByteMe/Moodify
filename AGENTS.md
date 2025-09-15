# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages and UI. Routes include `/`, `/play/[id]`, `/share/[id]`, `/verify`. Components live in `app/components/` and primitives in `app/components/ui/`. Global styles: `app/styles/globals.css`.
- `lib/`: State and data layer: Redux slices (`lib/features/*Slice.ts`), RTK Query services, Spotify helpers (`lib/spotify.ts`), store (`lib/store.ts`).
- `hooks/`: Reusable React hooks.
- `public/`: Static assets (icons, logo).
- `types/` and `app/utils/*`: Shared types and small utilities.

## Build, Test, and Development Commands
- `npm run dev`: Start the dev server at `http://localhost:3000`.
- `npm run build`: Create an optimized production build.
- `npm start`: Serve the production build.
- `npm run lint`: Run ESLint with auto-fix. Run before committing.

## Coding Style & Naming Conventions
- **Language**: TypeScript (strict), ESNext modules.
- **Formatting**: 2-space indentation; prefer `const`; avoid unused exports.
- **Components**: PascalCase filenames and exports (e.g., `Header.tsx`, `PreviewPlayer.tsx`). UI primitives in `app/components/ui/` are lowercase (e.g., `button.tsx`, `input.tsx`).
- **Hooks/Utils**: Hooks as `useThing.tsx`; utilities in kebab/lowercase (e.g., `search-form.tsx`, `utils.ts`).
- **Imports**: Use TS path aliases (e.g., `@/lib/...`, `@/app/components/...`).
- **Styling**: TailwindCSS; extract reusable UI when classlists repeat.

## Testing Guidelines
- No formal test harness yet. If adding tests:
  - Prefer Vitest + React Testing Library.
  - Name tests `*.test.ts(x)` near the source or under `__tests__/`.
  - Unit test `lib/*` logic and reducers; mock network calls.

## Commit & Pull Request Guidelines
- **Commits**: Imperative, concise (e.g., "Add preview player", "Refactor layout header"). Reference issues in the body (e.g., `Closes #12`).
- **PRs**: Include summary, linked issues, screenshots for UI changes, verification steps, and any env/config changes. Ensure `npm run lint` and `npm run build` pass.

## Security & Configuration Tips
- Put secrets in `.env.local` (never commit):
```
NEXT_PUBLIC_MOODIFY_BACKEND_URL=https://api.example.com
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```
- Remote images are allowed from `i.scdn.co` (see `next.config.mjs`).

