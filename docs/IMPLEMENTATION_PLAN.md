# Implementation Plan

## Overview
Build an Electron-based AI browser in 6 phases. Each phase produces a working, testable artifact.

---

## Phase 0 — Project Scaffolding (Week 1)
**Goal**: Empty Electron app that opens a window.

- [ ] Initialize npm project with TypeScript
- [ ] Set up Electron with electron-builder
- [ ] Configure Vite for renderer (React + Tailwind)
- [ ] Set up ESLint, Prettier, Vitest
- [ ] Create main process entry (`src/main/index.ts`)
- [ ] Create renderer entry (`src/renderer/App.tsx`)
- [ ] Create preload script (`src/preload/index.ts`)
- [ ] Verify: app launches, shows a blank window

**Deliverable**: `npm run dev` opens an Electron window with React rendering.

---

## Phase 1 — Basic Browser (Weeks 2-3)
**Goal**: A functional web browser you can actually use to browse.

### 1a. Core Navigation
- [ ] `<webview>` tag or `BrowserView` for rendering web pages
- [ ] URL bar with input, navigation (enter to go), display current URL
- [ ] Back / Forward / Refresh / Home buttons
- [ ] Loading indicator

### 1b. Tab Management
- [ ] Tab bar component (horizontal, top)
- [ ] New tab, close tab, switch tabs
- [ ] Each tab has its own webview instance
- [ ] Tab title from page title, favicon from page
- [ ] Drag to reorder tabs
- [ ] Cmd+T, Cmd+W, Cmd+L keyboard shortcuts

### 1c. Basic Browser Features
- [ ] Find in page (Cmd+F)
- [ ] Zoom in/out (Cmd+/-)
- [ ] Context menu (right-click → open in new tab, copy link, etc.)
- [ ] Window management (multiple windows, fullscreen)
- [ ] Basic bookmarks (save, list, click to open)

### 1d. IPC Architecture
- [ ] Define typed IPC channels in `src/shared/ipc.ts`
- [ ] Main ↔ Renderer communication for navigation commands
- [ ] Preload bridge for secure webview access

**Deliverable**: You can browse the web, manage tabs, bookmark pages.

---

## Phase 2 — Customization Engine (Weeks 4-6)
**Goal**: Users can create, save, and auto-apply CSS/JS modifications to websites.

### 2a. Recipe Data Model
- [ ] Define Recipe type: `{ id, name, urlPattern, css, js, domMods, enabled, createdAt }`
- [ ] SQLite database setup (better-sqlite3)
- [ ] CRUD operations for recipes
- [ ] URL pattern matching engine (glob → regex)

### 2b. Injection Engine
- [ ] Inject CSS into webview via `insertCSS()`
- [ ] Inject JS into webview via `executeJavaScript()` (sandboxed)
- [ ] Auto-apply matching recipes on page load (`did-finish-load` event)
- [ ] Handle SPA navigation (URL change without page reload)
- [ ] Recipe toggle (enable/disable without deleting)

### 2c. Recipe Editor UI
- [ ] Panel/modal for creating recipes manually
- [ ] CSS editor with syntax highlighting (CodeMirror or Monaco, keep it light)
- [ ] JS editor with same
- [ ] URL pattern input with test/preview
- [ ] Live preview: see changes as you type
- [ ] Undo/redo for recipe edits

### 2d. Recipe Management UI
- [ ] List all recipes in sidebar or settings page
- [ ] Show active recipes for current page (badge/indicator)
- [ ] Import/export recipes as JSON files
- [ ] Recipe categories/tags

**Deliverable**: User can write CSS/JS, attach it to a URL pattern, and it auto-applies every visit.

---

## Phase 3 — AI Integration (Weeks 7-9)
**Goal**: Natural language → recipe generation. The magic moment.

### 3a. AI Backend
- [ ] Claude API integration (`src/ai/claude.ts`)
- [ ] API key management (stored in OS keychain, not plaintext)
- [ ] System prompt that understands recipe format
- [ ] Page context extraction: send DOM structure, current CSS, URL to AI
- [ ] Rate limiting and error handling

### 3b. Prompt Bar
- [ ] Redesign URL bar to dual as prompt bar (toggle or detect intent)
- [ ] When user types a natural language prompt:
  1. Extract current page context (simplified DOM, styles, URL)
  2. Send to Claude with recipe-generation system prompt
  3. Receive CSS/JS back
  4. Preview changes live on page
  5. Show "Save as Recipe" / "Discard" buttons
- [ ] Prompt history (up arrow to cycle)
- [ ] Quick commands: `/dark`, `/minimal`, `/focus`, `/hide [selector]`

### 3c. AI Sidebar (Basic)
- [ ] Collapsible right sidebar panel
- [ ] Chat interface for page Q&A
- [ ] "Summarize this page" one-click action
- [ ] "Extract all links/images/headings" one-click action
- [ ] Conversation history per tab

### 3d. Smart Recipe Generation
- [ ] AI suggests resilient CSS selectors (not brittle nth-child)
- [ ] AI explains what the recipe does before applying
- [ ] Iterative refinement: "make it darker", "also hide the footer"
- [ ] Template recipes: "dark mode", "reading mode", "minimal" as starting points

**Deliverable**: Type "make this page dark and hide the sidebar" → it happens, and it persists.

---

## Phase 4 — Profiles & Polish (Weeks 10-12)
**Goal**: Daily-driver quality. Profiles, settings, performance.

### 4a. Profiles
- [ ] Profile data model (name, recipes, bookmarks, theme, history)
- [ ] Profile switcher in toolbar
- [ ] Default profiles: Work, Personal, Focus
- [ ] Each profile auto-enables/disables its recipe set

### 4b. Settings & Preferences
- [ ] Settings page: general, appearance, AI, privacy, shortcuts
- [ ] Default search engine selection
- [ ] Startup behavior (restore tabs, new tab page, specific URL)
- [ ] Custom keyboard shortcuts
- [ ] Downloads management

### 4c. New Tab Page
- [ ] Clean, useful new tab page
- [ ] Quick links / most visited
- [ ] Search bar
- [ ] Active recipe count, profile indicator

### 4d. Performance & Stability
- [ ] Memory management: suspend background tabs
- [ ] Crash recovery: restore tabs after crash
- [ ] Process-per-tab isolation
- [ ] Startup time optimization

### 4e. History & Search
- [ ] Full browsing history with search
- [ ] History grouped by date
- [ ] Clear history (all / time range / specific entries)

**Deliverable**: Browser is comfortable for daily use with profile switching.

---

## Phase 5 — Extended Features (Weeks 13-16)
**Goal**: Differentiating features that make it special.

### 5a. Mini-Tools
- [ ] Reading mode (strip to article content)
- [ ] Screenshot & markup tool
- [ ] Page annotation layer (highlight + notes)
- [ ] Inline translator (select text → translate)

### 5b. Recipe Sharing
- [ ] Export recipe as shareable URL/link
- [ ] Import recipe from URL
- [ ] Recipe preview before installing

### 5c. Privacy & Security
- [ ] Ad/tracker blocking (integrate EasyList/EasyPrivacy filter lists)
- [ ] Recipe sandboxing (restrict network access, cookie access)
- [ ] Per-site permission controls (camera, mic, notifications, location)
- [ ] HTTPS enforcement

### 5d. AI Upgrades
- [ ] AI can interact with pages (fill forms, click buttons) with user permission
- [ ] Scheduled recipes: "every morning, open these 5 tabs and apply focus mode"
- [ ] Cross-page recipes: "on all e-commerce sites, highlight the best price"

**Deliverable**: A genuinely useful, differentiated browser.

---

## Phase 6 — Community & Distribution (Weeks 17-20)
**Goal**: Other people can use it.

- [ ] Recipe store: browse, search, install community recipes
- [ ] User accounts (optional, for sync and sharing)
- [ ] Auto-updater (electron-updater)
- [ ] macOS code signing & notarization
- [ ] Windows signing
- [ ] Linux packaging (AppImage, deb)
- [ ] Landing page / website
- [ ] Bug reporting / feedback mechanism

---

## Architecture Decisions

### Why Electron `<webview>` over BrowserView
- `<webview>` runs in its own process (isolation)
- Easier to manage multiple instances (tabs)
- Built-in methods: `insertCSS`, `executeJavaScript`, `getURL`, events
- Trade-off: slightly more overhead than BrowserView, but better API for our use case

### Why SQLite over JSON files
- Recipes will grow in number; need fast querying by URL pattern
- Transactions for data integrity
- Full-text search for recipe discovery
- `better-sqlite3` is synchronous, fast, and Electron-compatible

### Why Claude API over local models
- Recipe generation needs strong code understanding — Claude excels at this
- Local models (Ollama, etc.) can be added later as fallback
- API key approach keeps initial complexity low

### Security Model
- Recipes run in webview's renderer process (isolated from main)
- Preload script exposes minimal API surface
- AI-generated code is reviewed/previewed before persistence
- No recipe can access Node.js APIs directly

---

## Development Workflow

1. Work in phases. Don't skip ahead.
2. Each phase ends with a usable artifact you can demo.
3. Write tests for core logic (recipe matching, injection, data layer). UI tests later.
4. Use feature branches, one per sub-task.
5. Claude Code agents handle implementation; human reviews and tests in browser.
