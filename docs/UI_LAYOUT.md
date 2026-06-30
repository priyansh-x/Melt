# UI Layout & Spatial Design

## Design Philosophy
Steal what works: Arc's vertical tabs, Raycast's command palette, Cursor's inline AI, Vivaldi's collapsible panels. But our unique twist: **the page itself is the primary interaction surface**, not the browser chrome. Chrome should fade away; the content (and your modifications to it) is the star.

---

## Top-Level Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Traffic Lights │  ◂ ▸ ↻  │  [═══ Prompt / URL Bar ═══] │ ⊕ 👤 ≡ │  ← Title Bar (36px)
├────────┬─────────────────────────────────────────────┬───────────┤
│        │  Tab Strip (horizontal, minimal)            │           │
│  Side  ├─────────────────────────────────────────────┤  AI       │
│  Rail  │                                             │  Panel    │
│  (48px)│                                             │  (360px)  │
│        │              Web Content                    │           │
│  Icons │              (webview)                      │  Chat     │
│  only  │                                             │  Recipes  │
│        │                                             │  Tools    │
│        │                                             │           │
│        │                                             │           │
│        ├─────────────────────────────────────────────┤           │
│        │  [Recipe Bar — shows active recipes]  (32px)│           │
├────────┴─────────────────────────────────────────────┴───────────┤
│  Status Bar (optional, 24px) — recipe count, profile, privacy   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Title Bar (36px, top)
Custom frameless window with integrated controls.

- **Left**: Traffic lights (macOS) or window controls (Win/Linux)
- **Center-left**: Navigation buttons (back, forward, reload) — small, icon-only
- **Center**: **Prompt/URL Bar** (the main element — ~60% of title bar width)
  - Default mode: shows current URL (editable, click to focus)
  - Prompt mode: activated by `Cmd+K` or clicking a ✨ icon, or just typing natural language
  - The bar detects intent: URL-like input → navigate; natural language → AI prompt
  - Shows loading progress as a thin colored line under the bar
- **Right**: New tab (+), Profile avatar, Menu (hamburger or ⋯)

**Why one bar, not two**: Two bars (URL + prompt) waste vertical space. One smart bar that detects intent is cleaner. Arc proved this with their combined URL/command bar.

### 2. Side Rail (48px, left, collapsible)
Inspired by VS Code's activity bar. Icon-only vertical strip.

**Icons (top to bottom):**
- 🏠 Home / New Tab page
- 📑 Tab overview (expands to show tab list as a flyout, not a permanent sidebar)
- 🔖 Bookmarks (flyout panel)
- 🕐 History (flyout panel)
- 🧩 Recipes (flyout: list all recipes, toggle, edit)
- 🛠 Mini-Tools (flyout: available tools for current page)

**Bottom of rail:**
- ⚙️ Settings
- 👤 Profile switcher

**Behavior**:
- Hover an icon → tooltip with label
- Click → flyout panel slides out (280px wide) over the content, not pushing it
- Click again or click away → flyout closes
- `Cmd+B` toggles rail visibility entirely (for maximum content space)

**Why a rail instead of Arc's full sidebar**: Arc's sidebar is always visible and eats 250px+. A rail is 48px — almost nothing. Flyouts give you the same access without permanent space cost. Content is king.

### 3. Tab Strip (horizontal, below title bar, 36px)
We go horizontal, not vertical. Here's why:
- Our side rail already uses the left edge
- Vertical tabs are great for 20+ tabs but most users have 5-10
- Horizontal tabs are universally understood
- We save vertical space by making them compact

**Tab design**:
- Compact: favicon + truncated title (no full URL)
- Active tab slightly taller/highlighted
- Close button appears on hover only
- Drag to reorder
- Scroll arrows if tabs overflow (or scroll with trackpad)
- `+` button at the end for new tab
- Right-click → context menu (duplicate, pin, close others, move to profile)

**Tab groups** (later): Color-coded groups, collapsible. Similar to Chrome's but lighter.

### 4. Web Content Area (center, fills remaining space)
The webview. This is where 90% of the user's attention is.

**Overlays on the content area** (not separate panels):
- **Recipe preview toast**: When AI generates a recipe, a small floating card appears bottom-right showing "Preview active — Save / Discard / Refine"
- **Quick command results**: Inline floating panel near the prompt bar
- **Selection actions**: When user selects text, a small floating toolbar appears (like Notion's selection menu): Summarize | Translate | Annotate | Ask AI
- **Recipe indicators**: Small colored dots in the top-right corner of content area showing how many recipes are active (click to see list)

### 5. AI Panel (right side, 360px, toggleable)
The AI companion. Not always visible — toggled by `Cmd+J` or clicking a button.

**Panel sections (tabbed internally)**:
- **Chat**: Conversation with AI about the current page. Persistent per-tab.
- **Recipes**: Active recipes for this page. Toggle on/off, edit, delete.
- **Tools**: Active mini-tools and their outputs.

**Behavior**:
- Slides in from right, pushes content (not overlay) — so the page reflows
- Can be resized by dragging the left edge
- Can be popped out into its own window
- `Escape` closes it
- Remembers open/closed state per profile

### 6. Recipe Bar (bottom of content, 32px, contextual)
Only appears when recipes are active on the current page.

```
┌─────────────────────────────────────────────────────────────┐
│ 🟢 Dark Mode  │ 🟢 Hide Sidebar  │ 🔴 Focus Mode (off) │ + │
└─────────────────────────────────────────────────────────────┘
```

- Shows active recipes as small toggleable chips
- Green dot = active, red = disabled but saved for this site
- Click chip → toggle on/off instantly
- `+` button → opens prompt bar in recipe mode
- Can be collapsed to just a small "3 recipes active" indicator

### 7. Status Bar (bottom edge, 24px, optional)
Minimal info bar. Hidden by default, shown in Settings.

- Current profile name + colored dot
- Recipe count for current page
- Privacy indicator (tracker count blocked)
- Zoom level

---

## Interaction Patterns

### Command Palette (`Cmd+K`)
Opens a centered floating search/command box (like Raycast/Spotlight).

**Can do**:
- Search tabs, bookmarks, history
- Run quick commands: `/dark`, `/focus`, `/reading-mode`
- Switch profiles
- Open settings pages
- Search recipes

This is separate from the URL/prompt bar. The prompt bar is for page-level actions; the command palette is for browser-level actions.

### Keyboard-First Navigation
| Shortcut | Action |
|----------|--------|
| `Cmd+L` | Focus URL/prompt bar |
| `Cmd+K` | Command palette |
| `Cmd+J` | Toggle AI panel |
| `Cmd+B` | Toggle side rail |
| `Cmd+T` | New tab |
| `Cmd+W` | Close tab |
| `Cmd+Shift+]` / `[` | Next/prev tab |
| `Cmd+1-9` | Switch to tab N |
| `Cmd+Enter` | In prompt bar: force AI mode |
| `Escape` | Close any panel/overlay |

### Responsive Behavior
- **Narrow window (<900px)**: Hide side rail, tab strip becomes scrollable, AI panel overlays instead of pushing
- **Wide window (>1400px)**: Everything fits, AI panel can stay open comfortably
- **Fullscreen**: Hide title bar (show on hover), maximize content

---

## Visual Style (Initial Direction)

- **Dark by default** (with light mode toggle)
- **Background**: `#0f0f0f` (near-black, not pure black)
- **Surface**: `#1a1a1a` (panels, bars)
- **Border**: `#2a2a2a` (subtle dividers)
- **Text**: `#e0e0e0` (primary), `#888` (secondary)
- **Accent**: A warm color TBD — coral, amber, or electric blue
- **Font**: System font stack (SF Pro on Mac, Segoe on Win, Inter fallback)
- **Radius**: 8px for panels, 6px for buttons, 4px for inputs
- **Shadows**: Minimal, only for floating elements (flyouts, toasts)
- **Animations**: 150ms ease for panel open/close, 100ms for hover states. Never block, never bounce.

---

## What We're NOT Doing

- **No vertical tab sidebar** — the rail + flyout pattern is better for us
- **No permanent bookmarks bar** — bookmarks live in the rail flyout
- **No bottom toolbar** — recipe bar is contextual, not permanent
- **No tabs-in-sidebar** like Arc — horizontal tabs are fine for our scope
- **No split view in v1** — complexity we don't need yet

---

## Layout States Summary

| State | Side Rail | Tab Strip | AI Panel | Recipe Bar |
|-------|-----------|-----------|----------|------------|
| Default | Visible (48px) | Visible | Hidden | Hidden (no recipes) |
| Browsing with recipes | Visible | Visible | Hidden | Visible (32px) |
| AI active | Visible | Visible | Open (360px) | Visible |
| Focus mode | Hidden | Hidden | Hidden | Hidden |
| Full minimal | Hidden | Hidden | Hidden | Hidden |
