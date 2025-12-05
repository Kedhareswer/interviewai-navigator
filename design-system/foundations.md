# Foundations

This document captures the **foundational tokens** of the InterviewOS design system: colors, typography, radii, and key utilities. All concrete values below are taken from `src/index.css` and `tailwind.config.ts`.

---

## Color System

All colors are defined as **HSL custom properties** in `src/index.css` and surfaced in Tailwind via `tailwind.config.ts`.

### Core Surface Tokens (`:root`)

Defined in `src/index.css` under `@layer base`:

- **Page & surfaces**
  - `--page-bg`: `220 14% 96%` – light canvas (`bg-[hsl(var(--page-bg))]`, mapped as `bg-page` in Tailwind).
  - `--background`: `0 0% 100%` – white, used for cards and main surfaces (`bg-background`).
  - `--bg-elevated`: `222 47% 6%` – very dark elevated panels (`bg-bg-elevated`).
  - `--agents-bg`: `30 10% 8%` – deep warm charcoal background for the Agents section (`.agents-section`).

- **Text**
  - `--foreground`: `220 26% 9%` – main body text (`text-foreground`).
  - `--text-secondary`: `220 13% 35%` – muted secondary text (`text-text-secondary`).
  - `--text-inverted`: `210 20% 98%` – light text used on dark backgrounds (`text-text-inverted`).

- **Cards & popovers**
  - `--card`: `0 0% 100%`, `--card-foreground`: `220 26% 9%` → `bg-card`, `text-card-foreground`.
  - `--popover`: `0 0% 100%`, `--popover-foreground`: `220 26% 9%` → `bg-popover`, `text-popover-foreground`.

- **Primary accent (orange)**
  - `--primary`: `22 90% 55%` – warm orange.
  - `--primary-foreground`: `0 0% 100%` – text/icon on primary.
  - Used via `bg-primary`, `text-primary-foreground`, `text-primary`.

- **Secondary / muted**
  - `--secondary`: `220 14% 96%`, `--secondary-foreground`: `220 26% 9%`.
  - `--muted`: `220 14% 96%`, `--muted-foreground`: `220 13% 35%`.

- **Accent (soft orange)**
  - `--accent`: `22 100% 95%` – pale orange, used for pills, card hovers, bullets.
  - `--accent-foreground`: `22 90% 55%` – text/icon over accent.

- **Borders & ring**
  - `--border-subtle`: `220 13% 91%` – very light borders.
  - `--border-strong`: `220 9% 82%` – stronger separators / dots.
  - `--border`: `220 13% 91%`, `--input`: `220 13% 91%`.
  - `--ring`: `22 90% 55%` – focus ring accent.

- **Pills & labels**
  - `--pill-bg`: `220 26% 9%` – dark pill background.
  - `--pill-text`: `210 20% 98%` – pill text.

- **Nav blur**
  - `--nav-bg-blur`: `220 14% 96%` – used in `bg-page/85 backdrop-blur-nav` for scrolled nav.

- **Destructive**
  - `--destructive`: `0 84% 60%`.
  - `--destructive-foreground`: `210 20% 98%`.

- **Radius**
  - `--radius`: `0.75rem` – base for Tailwind `rounded-lg`, `rounded-md`, `rounded-sm` overrides.

- **Sidebar tokens** (for generic UI)
  - `--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, etc. used by `sidebar` component, consistent with rest of palette.

### Dark Mode Overrides

Under `.dark { ... }` in `src/index.css`, all the above tokens are flipped for dark surfaces while **keeping the same primary orange**. This allows a class-based dark mode (`darkMode: ["class"]` in Tailwind) without changing component code.

Key differences:

- Surfaces are darkened (`--page-bg: 222 47% 3%`, `--background: 222 47% 4%`, etc.).
- Foreground becomes light (`--foreground: 210 20% 98%`).
- Secondary and muted shades are adjusted for contrast on dark.
- `--pill-bg` and `--pill-text` are inverted vs light mode.

Components use semantic classes (`bg-background`, `bg-accent`, `text-text-secondary`), so they automatically adapt when the `dark` class is toggled on `html` or `body`.

---

## Gradients

Defined in `src/index.css` under `@layer components`:

- `.gradient-accent`
  - A strong multi-stop gradient: orange → pink → violet → cyan.
  - Used for high-impact visuals (e.g., hero orb hover states, icons).

- `.gradient-accent-subtle`
  - Same stops but with low alpha (`/ 0.1`).
  - Used for large blurred background orb in the hero (`Hero.tsx`: `rounded-full gradient-accent-subtle blur-3xl opacity-30`).

These gradients **always sit behind** the content and should not be used for body backgrounds.

---

## Typography

Fonts are imported in `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Besley:ital,wght@0,400;1,400&display=swap');
```

Mapped in `tailwind.config.ts`:

- `fontFamily.sans`: `Inter, sans-serif`
- `fontFamily.serif`: `Besley, serif`
- `fontFamily.mono`: `JetBrains Mono`, `SF Mono`, `ui-monospace`, `Menlo`, `monospace`

Base rules:

- `body`: `@apply bg-[hsl(var(--page-bg))] text-foreground font-sans antialiased;`
- `h1, h2, h3`: `@apply font-serif;`

Custom font sizes (Tailwind):

- `text-display`
  - `3.5rem`, `line-height: 1.05`, `letter-spacing: -0.02em`
  - Used for the hero main headline.
- `text-h2`
  - `2rem`, `line-height: 1.2`, `letter-spacing: -0.01em`
  - Used for section headings (e.g., "How it works", "RAG & Voice").
- `text-h3`
  - `1.375rem`, `line-height: 1.3`
  - Used for card and step titles.

Usage conventions:

- **Display**: hero only (`Hero.tsx`: `text-display font-serif tracking-tight leading-tight`).
- **Section headings**: `text-h2 font-serif tracking-tight`.
- **Card / step titles**: `text-h3 font-semibold tracking-tight`.
- **Body text**: `text-base` or `text-lg` with `text-text-secondary` and `leading-relaxed`.
- **Meta labels/pills**: small mono (`text-xs font-mono tracking-wide` or `tracking-[0.2em]` for overlines).

---

## Radius and Elevation

From `tailwind.config.ts`:

- `borderRadius.lg`: `var(--radius)` → base card radius.
- `borderRadius.md`: `calc(var(--radius) - 2px)`.
- `borderRadius.sm`: `calc(var(--radius) - 4px)`.

Patterns:

- Cards & major surfaces: `rounded-2xl` or `rounded-lg`.
- Icons / pills: `rounded-full` or `rounded-xl`.

Elevation is done via:

- `shadow-lg`, `shadow-xl` on hero/button CTAs and agent cards.
- Subtle borders: `border border-border-subtle` on neutral cards.

---

## Layout & Spacing Tokens

### Containers

- Global page sections use:
  - `py-24 px-6` or `py-32 px-6` for vertical rhythm.
  - `max-w-[1200px] mx-auto` for main content width.
- `tailwind.config.ts` `container`:
  - `padding: "2rem"`, `screens.2xl = 1400px` (for generic container usage).

### Structure

- Main page (`Index.tsx`):
  - `TopNav` at top.
  - `SectionIndex` fixed left (`SectionIndex.tsx`: `fixed left-6 top-32 w-32`), only on `lg`.
  - Sections stacked in the main column.

- Sections usually follow this pattern:
  - `<section className="py-24 px-6 ...">`
  - Inside: `max-w-[1200px] mx-auto` then grid/flex for layout.

### Scroll Behavior

- `html { scroll-behavior: smooth; }` in `index.css`.
- Scroll offsets are manually corrected with `offset = 80` in `scrollToSection` functions (`Hero`, `TopNav`, `SectionIndex`).
- `AgentsSection` uses a **scroll-linked horizontal translate** based on how far the section has been scrolled.

---

## Utility Classes Added in CSS

In `src/index.css` `@layer components`:

- `.agents-section`
  - `background-color: hsl(var(--agents-bg));` – unique dark, warm section.
- `.agents-gallery`, `.agents-fade-left`, `.agents-fade-right`
  - Handle the horizontally-scrolling Agent cards with fade masks at edges.
- `.agent-card` / `.agent-card-inview`
  - Custom animation for Agent cards when they enter viewport (opacity + `translateX`).

These are **part of the design system** and should be reused for any future horizontally-scrolling/spotlight sections.
