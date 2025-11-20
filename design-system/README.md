# InterviewOS Design System

This folder documents the **actual** design system implemented in the InterviewOS marketing site (this repo). It is based on Tailwind CSS, custom CSS variables in `src/index.css`, and a set of reusable UI components in `src/components` and `src/components/ui`.

Use this as the **single source of truth** for:

- **Brand feel**: tone, color usage, typography, and density
- **Foundations**: tokens for colors, typography, radius, and gradients
- **Layout**: section structure, spacing, max widths
- **Components**: hero, navigation, section index, cards, steps, and CTAs

---

## Brand Overview

- **Brand name**: `InterviewOS`
- **Vibe**: serious B2B SaaS, technical but not cold
- **Primary accent**: warm orange with a multi-color gradient for “AI energy”
- **Base canvas**: very light neutral gray, with dark elevated panels
- **Type**:
  - Display / headings: `Besley` (serif)
  - Body: `Inter` (sans)
  - Pills / labels / meta: monospaced (`JetBrains Mono` etc.)

The site is intentionally **text-forward** with generous whitespace and subtle motion (scroll-linked sections, gentle hover states, and card reveals).

---

## Files That Define the Design System

- **Theme & tokens**
  - `src/index.css`
    - Defines all CSS custom properties (`--page-bg`, `--primary`, `--text-secondary`, etc.)
    - Defines gradients and agents-specific styles
  - `tailwind.config.ts`
    - Maps CSS variables into Tailwind colors like `bg-page`, `text-secondary`, `bg-elevated`, `bg-card`, etc.
    - Sets font families (`font-sans`, `font-serif`, `font-mono`) and custom font sizes (`text-display`, `text-h2`, `text-h3`).

- **Core layout & composition**
  - `src/pages/Index.tsx`
    - Composes the main sections in order: `TopNav`, `SectionIndex`, `Hero`, `ProcessStepper`, `ImpactSection`, `AgentsSection`, `RagVoiceSection`, `GetStartedSection`.
  - `src/index.css` (base layer)
    - Sets `body` background, default text color, smoothing, and heading font-family.

- **Key components (marketing page)**
  - Navigation: `TopNav.tsx`, `SectionIndex.tsx`
  - Hero: `Hero.tsx`
  - Process / pipeline: `ProcessStepper.tsx`
  - Narrative: `ImpactSection.tsx`
  - Agents rail: `AgentsSection.tsx`, `AgentCard.tsx`
  - RAG & Voice: `RagVoiceSection.tsx`
  - CTA & footer: `GetStartedSection.tsx`

- **Primitive UI components (shadcn-style)**
  - `src/components/ui/button.tsx`
  - `src/components/ui/card.tsx`
  - `src/components/ui/navigation-menu.tsx`
  - Plus many others (`alert-dialog`, `tabs`, `select`, etc.) that inherit the same tokens.

---

## How to Read the Other Docs

- **`foundations.md`**
  - Colors (light & dark), gradients, typography, radii, and base layout tokens.
  - Explains how CSS variables map into Tailwind classes.

- **`components-and-layout.md`**
  - Documents real patterns used on the page: hero, pills, cards, stepper, RAG steps, agents carousel, CTA.
  - Shows which utility classes to reuse to stay on-brand.

If you change tokens in `src/index.css` or mappings in `tailwind.config.ts`, **update these docs** so they stay the canonical description of the system.
