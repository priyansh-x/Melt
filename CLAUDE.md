# Project: Untitled AI Browser

## What This Is
An Electron-based AI-first web browser that lets users persistently customize any website — inject UI, restyle pages, automate interactions — using natural language prompts or manual rules. Think of it as a browser where every website is a canvas you own.

## Tech Stack
- **Runtime**: Electron (Chromium-based)
- **Frontend**: React + TypeScript
- **Backend/Main Process**: Node.js + TypeScript
- **AI**: Claude API (Anthropic) for natural language → code generation
- **Storage**: SQLite (local-first) for user data, customizations, profiles
- **Styling**: Tailwind CSS for browser chrome UI
- **Build**: Vite for renderer, electron-builder for packaging

## Project Structure
```
src/
  main/           # Electron main process (window mgmt, IPC, webview control)
  renderer/       # Browser UI (React app — tabs, sidebar, toolbar, settings)
  preload/        # Preload scripts for webview security bridge
  shared/         # Shared types, constants, utils
  customization/  # Engine for injecting CSS/JS into pages (the core feature)
  ai/             # AI integration layer (prompt → customization pipeline)
docs/             # Feature specs, architecture docs, implementation plan
```

## Commands
- `npm run dev` — Start dev mode with hot reload
- `npm run build` — Build for production
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript type checking
- `npm test` — Run tests (Vitest)

## Key Conventions
- All IPC between main/renderer uses typed channels defined in `src/shared/ipc.ts`
- Customizations are stored as JSON "recipes" — portable, shareable, versionable
- Security: Never inject raw user scripts without sandboxing. Use CSP-aware injection.
- Keep the main process lean — heavy work goes to worker threads
- Explain code simply; this is a learning project too

## Current Phase
Phase 0 — Planning & Setup
