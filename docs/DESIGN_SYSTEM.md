# Design System

## Philosophy
Surfaces built from opacity, not hex. One accent color. Elevation via luminance, not shadows. If it doesn't need to be there, it isn't.

---

## Color

### Surfaces (opacity-based, not hard hex)
```css
--canvas:          #101010;
--surface-1:       rgba(255,255,255, 0.02);   /* panels, sidebar */
--surface-2:       rgba(255,255,255, 0.04);   /* inputs, cards */
--surface-3:       rgba(255,255,255, 0.06);   /* hover, active states */
--surface-4:       rgba(255,255,255, 0.08);   /* elevated hover */
```

### Borders
```css
--border:          rgba(255,255,255, 0.04);   /* default dividers */
--border-hover:    rgba(255,255,255, 0.08);   /* hover emphasis */
--border-focus:    rgba(255,255,255, 0.12);   /* focus rings */
```

### Text
```css
--text-primary:    #e0e0e0;                   /* main content */
--text-secondary:  rgba(240,240,240, 0.50);   /* labels, metadata */
--text-muted:      rgba(240,240,240, 0.30);   /* placeholders, disabled */
--text-ghost:      #333;                      /* barely visible hints */
```

### Accent — purple (single hue, two usages)
```css
--accent:          #a855f7;                   /* interactive: focus, CTA, active indicator */
--accent-subtle:   rgba(168, 85, 247, 0.08);  /* tint backgrounds */
--accent-text:     #c084fc;                   /* text on dark surfaces */
```

### Semantic (used sparingly)
```css
--green:           #22c55e;                   /* recipe active, success */
--red:             #ef4444;                   /* error, destructive */
--amber:           #f59e0b;                   /* warning */
```

---

## Typography

```css
font-family: 'Inter', -apple-system, 'SF Pro Text', system-ui, sans-serif;
-webkit-font-smoothing: antialiased;
```

| Element | Size | Weight | Letter-spacing | Color |
|---------|------|--------|---------------|-------|
| Tab title, nav label | 12px | 400 | -0.01em | --text-secondary |
| Active tab | 12px | 500 | -0.01em | --text-primary |
| Prompt bar placeholder | 13px | 400 | -0.01em | --text-muted |
| Sidebar chat | 12.5px | 400 | -0.01em | --text-secondary |
| AI label (MELT) | 11px | 500 | 0.02em | --accent-text |
| Status bar | 11px | 400 | 0.01em | --text-muted |
| Section header (rare) | 10px | 500 | 0.06em | --text-muted, uppercase |

Two weights only: 400 (regular), 500 (emphasis). Never 600+.

---

## Spacing & Radius

```css
--radius-sm:  6px;    /* buttons, small inputs */
--radius-md:  8px;    /* rail icons, recipe chips */
--radius-lg:  10px;   /* prompt bar, chat bubbles */
--radius-xl:  12px;   /* cards, panels, window corners */
```

Spacing: 4px grid. Common values: 4, 8, 12, 16, 24, 32.

---

## Glassmorphism (floating elements only)

```css
/* Selection bar, command palette, toasts */
background: rgba(16, 16, 16, 0.85);
backdrop-filter: blur(16px) saturate(150%);
-webkit-backdrop-filter: blur(16px) saturate(150%);
border: 1px solid rgba(255,255,255, 0.08);
```

Only used on elements that float over content. Never on permanent chrome.

---

## Motion

```css
/* Hover — instant feel */
transition: background 120ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 120ms cubic-bezier(0.16, 1, 0.3, 1);

/* Panel open/close */
transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 200ms ease;

/* Button press */
transition: transform 80ms ease;
transform: scale(0.97);

/* Focus ring */
transition: box-shadow 100ms ease;
box-shadow: 0 0 0 2px #101010, 0 0 0 4px var(--accent);

/* Tooltip / popover */
transition: opacity 150ms ease,
            transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
```

The curve `cubic-bezier(0.16, 1, 0.3, 1)` is the spring-like ease used by Linear and Vercel. Use it everywhere except fade-only transitions (use `ease` for those).

---

## Shadows

Almost none. Elevation is communicated via surface luminance.

```css
/* The only shadow — for command palette and modals */
box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
```

---

## Component Patterns

### Rail icon (default → hover → active)
```
default:  bg transparent, color #444
hover:    bg rgba(255,255,255,0.06), color #888
active:   bg rgba(255,255,255,0.06), color #ccc
accent:   bg transparent, color var(--accent)
```

### Tab (inactive → active)
```
inactive: bg transparent, color #555
active:   bg rgba(255,255,255,0.03), color #ddd, top-border-radius, no bottom border
```

### Recipe chip (on → off)
```
on:  bg rgba(255,255,255,0.04), green dot, color #888
off: bg transparent, gray dot, color #444
```

### Chat bubble
```
user:  bg rgba(255,255,255,0.06), radius 12 12 4 12, align right
AI:    bg rgba(168,85,247,0.06), radius 12 12 12 4, align left
```

---

## What NOT to do

- No gradients on surfaces (the avatar gradient is the one exception — it's identity, not decoration)
- No box-shadows for elevation (use surface luminance)
- No borders heavier than 1px
- No opacity below 0.04 for borders (invisible = pointless)
- No pure #000 or #fff anywhere
- No more than one accent color in view at a time
- No animations longer than 300ms for UI chrome
- No font-weight above 500
