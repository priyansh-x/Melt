# Browser Feature Specification

## The Premise
Every website is a canvas you own. This browser lets you persistently modify, restyle, and augment any webpage using natural language or manual rules — and share those customizations with anyone.

**What makes this different from Arc/Brave/Vivaldi/Opera**: Those browsers reorganize browser chrome (tabs, sidebars, workspaces). We go deeper — we modify the actual web content. No existing browser does AI-driven persistent page customization as a first-class native feature.

**What makes this different from extensions (Stylus, Tampermonkey, Dark Reader)**: Extensions are fragile, siloed, manually coded, and can't talk to each other. Our customizations are natural-language-driven, composable, shareable as links, and integrated into the browser itself.

---

## Core Features (MVP — Phase 1-3)

### 1. Customization Engine ("Recipes")
The heart of the browser. A recipe is a portable JSON object that describes modifications to a webpage.

**What a recipe can do:**
- Inject CSS (restyle any element — colors, layout, visibility)
- Inject JS (add buttons, modify behavior, extract data)
- Modify DOM (hide elements, rearrange content, add new UI)
- Run conditionally (only on specific URLs, times, devices)

**Recipe types:**
- **Site-specific**: Applies to a URL pattern (e.g., `reddit.com/*`)
- **Global**: Applies everywhere (e.g., "make all fonts 16px minimum")
- **Conditional**: Time-based, device-based, or context-based triggers

**How recipes are created:**
- Natural language prompt → AI generates CSS/JS → user previews → saves
- Manual code editor for power users
- Forking/remixing existing recipes

### 2. Prompt Bar
The main interaction point. Lives in the toolbar (replaces/extends the URL bar).

**Capabilities:**
- "Make this page dark mode" → generates and applies CSS
- "Hide the sidebar on this site" → DOM manipulation recipe
- "Add a save-to-clipboard button next to every code block" → JS injection
- "Summarize this article in 3 bullets" → AI reads page, shows result in sidebar
- "Every time I visit this site, auto-expand all collapsed sections" → persistent recipe
- Quick commands: `/dark`, `/minimal`, `/focus`, `/translate`

**How it works:**
1. User types prompt
2. AI receives prompt + current page context (DOM snapshot, URL, metadata)
3. AI generates a recipe (CSS/JS/DOM changes)
4. Browser previews changes live (with undo)
5. User saves → recipe persists for that URL pattern

### 3. AI Sidebar
Always-available panel on the right side. Context-aware — knows what page you're on.

**Modes:**
- **Chat**: Ask questions about the page, get summaries, explanations
- **Actions**: Fill forms, click sequences, extract data (with permission prompts)
- **Recipes**: Browse/edit/toggle active recipes for current page
- **Tools**: Quick access to mini-tools (below)

### 4. Tab & Navigation
Standard browser functionality, done well.

- Tab bar with favicons, close, drag-reorder
- Back/forward/refresh/home
- URL bar with autocomplete
- Bookmarks bar
- History with search
- Multiple windows
- Find in page (Cmd+F)

### 5. Profiles
Switch contexts instantly. Each profile has its own:
- Set of active recipes
- Bookmarks
- History
- AI conversation history
- Visual theme

**Default profiles**: Work, Personal, Focus (distraction-free)

---

## Extended Features (Phase 4-5)

### 6. Mini-Tools Palette
Drag-and-drop or prompt-activated tools that inject into pages:

- **Fact Checker**: Highlights claims, shows verification status
- **Translator**: Inline translation of selected text or full page
- **Price Tracker**: Tracks price history on e-commerce pages
- **Reading Mode**: Strips everything except article content
- **Annotation Layer**: Highlight, comment, and save annotations on any page
- **Screenshot & Markup**: Capture and annotate page regions

### 7. Recipe Store (Community)
- Browse recipes others have shared
- One-click install
- Ratings, categories, featured picks
- Fork and remix

### 8. Share & Export
- Share a recipe as a URL: recipient opens it, sees the customized view
- Export as JSON for backup
- Import from Stylus/Tampermonkey user scripts (migration path)

### 9. Privacy & Security
- Built-in ad/tracker blocking (integrate uBlock Origin lists)
- Recipe sandboxing (recipes can't access cookies, localStorage, or make network requests without permission)
- Per-site permission controls
- Local-first data storage (no cloud required)
- Optional encrypted cloud sync

---

## UI/UX Design Principles

1. **Clean by default**: Chrome UI is minimal. Content takes center stage.
2. **Power on demand**: Advanced features are always one prompt away but never in your face.
3. **Instant feedback**: Every customization previews live before committing.
4. **Reversible**: Everything can be undone. Nothing is permanent unless you save it.
5. **Fast**: Browser chrome renders instantly. AI operations show progress but never block navigation.

---

## What We Are NOT Building (Scope Control)

- Not a Chromium fork — we use Electron's built-in Chromium
- Not a VPN/proxy service
- Not a password manager (integrate with existing ones)
- Not a full IDE — recipe editor is focused, not VS Code
- Not a social network — sharing is lightweight, not a feed

---

## Competitive Landscape Summary

| Browser | AI Features | Page Customization | Shareable Mods |
|---------|------------|-------------------|----------------|
| Arc | Tidy/Summary (basic) | Boosts (CSS only) | No |
| Brave | Leo AI chat | None | No |
| Vivaldi | None | Some UI tweaks | No |
| Opera GX | Aria AI chat | Gaming themes | No |
| **This Browser** | **Full AI pipeline** | **CSS + JS + DOM + AI** | **Yes, as links** |

---

## Success Metrics (for ourselves)

- Can we make a page dark in under 5 seconds from prompt to applied?
- Can a non-technical user create a useful recipe without writing code?
- Can recipes survive site updates (resilient selectors)?
- Does the browser feel fast for daily use?
