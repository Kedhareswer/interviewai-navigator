# Components & Layout Patterns

This document captures the **actual components and layouts** used in the InterviewOS marketing page and how to reuse them while staying on-brand.

Sections live in `src/components` and are composed in `src/pages/Index.tsx`.

---

## Global Page Layout

Defined in `src/pages/Index.tsx`:

```tsx
<div className="min-h-screen">
  <TopNav />
  <main className="relative flex">
    <SectionIndex />
    <div className="flex-1">
      <Hero />
      <ProcessStepper />
      <ImpactSection />
      <AgentsSection />
      <RagVoiceSection />
      <GetStartedSection />
    </div>
  </main>
</div>
```

**Principles**

- Top navigation is always visible at the top.
- On large screens, a fixed **SectionIndex** sits on the left; the right column scrolls.
- Every section uses:
  - Horizontal padding: `px-6`.
  - Vertical rhythm: `py-24` (or `py-32` for the final CTA).
  - Width: `max-w-[1200px] mx-auto`.

---

## Top Navigation (`TopNav.tsx`)

Purpose: simple wordmark + scroll-aware background.

- Scroll state:
  - `isScrolled === false` → `bg-transparent`.
  - `isScrolled === true` → `bg-page/85 backdrop-blur-nav shadow-sm`.
- Layout:
  - `nav` → `w-full z-40 transition-all duration-300`.
  - Inner container: `max-w-[1200px] mx-auto px-6 flex justify-center`.
  - Brand button: `text-lg font-semibold tracking-tight hover:text-primary transition-colors`.
- Behavior: clicking the brand scrolls to `#product` with an 80px offset.

**Use this pattern** for a clean, content-first nav with smooth scroll.

---

## Section Index (`SectionIndex.tsx`)

Purpose: show progression and allow quick jumps between sections.

- Placement:
  - `hidden lg:block fixed left-6 top-32 w-32 z-40` → only visible on large screens.
- Data:
  - `sections` array: `{ id, number, label }` for `product`, `how-it-works`, `agents`, `rag-voice`, `get-started`.
- Behavior:
  - `IntersectionObserver` tracks which section is in view and sets `activeSection`.
  - Clicking a section scrolls to that section with the same 80px offset.
- Visual pattern:
  - Each item is a column of number/label + optional underline.
  - Inactive state shows **number** only (`text-xs font-mono text-text-secondary`).
  - Active state fades number out and fades **label** in (`text-sm font-semibold text-primary`), plus underline `mt-1 h-0.5 bg-primary`.

**Rules**

- If you add a new content section, you must:
  - Give the `section` an `id`.
  - Add a matching entry to the `sections` array.

---

## Hero (`Hero.tsx`)

Purpose: primary value proposition.

- Section wrapper:
  - `min-h-screen flex items-center justify-end px-6 py-24 relative overflow-hidden`.
- Background orb:
  - Absolutely centered: `absolute inset-0 flex items-center justify-center`.
  - Orb: `w-[600px] h-[600px] rounded-full gradient-accent-subtle blur-3xl opacity-30`.
- Content:
  - Right-aligned stack: `max-w-3xl w-full relative z-10 space-y-8 text-right mr-10`.
  - **Pill badge**: `inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pill text-pill-foreground text-sm font-mono tracking-wide`.
  - **Headline**: `text-display font-serif tracking-tight leading-tight` with an italic span.
  - **Body**: `text-lg text-text-secondary max-w-2xl ml-auto leading-relaxed`.
  - **Buttons**: `Button` primitives with:
    - Primary: `bg-primary ... shadow-lg hover:shadow-xl hover:scale-105 px-6 py-6 text-base`.
    - Secondary (outline): `variant="outline"` with `border-border-strong` and `hover:bg-accent`.

**Use this pattern** whenever you need a hero: serif display, mono pill, right alignment, orb background.

---

## Process Stepper (`ProcessStepper.tsx`)

Purpose: show the structured pipeline in six steps.

- Section wrapper: `id="how-it-works"` and `py-24 px-6`.
- Layout: `grid lg:grid-cols-[1fr_2fr] gap-16`.

Left column:

- Pill: `inline-flex ... rounded-full bg-pill text-pill-foreground text-xs font-mono tracking-wide`.
- Heading: `text-h2 font-serif tracking-tight`.
- Body: `text-base text-text-secondary leading-relaxed`.

Right column (steps list):

- Steps are defined in a `steps` array and mapped.
- Each step card:
  - Wrapper: `group cursor-pointer`.
  - Card: `flex gap-6 p-6 rounded-2xl border border-border-subtle bg-background/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`.
  - Icon container: `w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:gradient-accent`.
  - Icon: `w-6 h-6 text-accent-foreground group-hover:text-white`.
  - Step number: `text-xs font-mono text-text-secondary tracking-widest`.
  - Title: `text-h3 font-semibold tracking-tight group-hover:text-accent-foreground`.
  - Body: `text-sm text-text-secondary leading-relaxed`.

**Pattern name**: process step card.

Reuse this layout whenever you need a vertically stacked set of 3–8 stages.

---

## Impact Section (`ImpactSection.tsx`)

Purpose: one strong narrative statement.

- Section: `py-24 px-6 bg-page`.
- Inner wrapper: `max-w-3xl ml-auto pr-4` (right-aligned block).
- Overline: `text-sm font-mono tracking-[0.2em] uppercase text-text-secondary mb-4`.
- Heading: `text-h2 font-serif tracking-tight leading-snug`.
  - Second line uses `text-text-secondary/80` for emphasis contrast.

Use this when you want a simple statement without cards or CTAs.

---

## Agents Section (`AgentsSection.tsx`) & Agent Cards (`AgentCard.tsx`)

### Section behavior

- Background: `.agents-section { background-color: hsl(var(--agents-bg)); }` → warm charcoal.
- Sticky intro: heading block is inside `sticky top-24`, so text stays while cards slide.
- Scroll-linked motion:
  - Component computes `progress` from scroll position within the section.
  - Horizontal offset: `translateX(-${translatePercent}%)` on the cards row.
  - `agents-fade-left` and `agents-fade-right` add left/right gradient masks.

### Agent card visual pattern

From `AgentCard.tsx`:

- Outer wrapper:
  - `group cursor-pointer h-full max-w-[720px] mx-auto agent-card`.
  - `agent-card` / `agent-card-inview` control reveal (opacity + `translateX`).
- Card body:
  - `h-full min-h-[320px] py-20 px-10 rounded-2xl border border-border-subtle bg-background shadow-lg hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300 space-y-4`.
- Icon block:
  - `w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:gradient-accent`.
  - Icon: `w-6 h-6 text-accent-foreground group-hover:text-white`.
- Title:
  - `text-h3 font-semibold tracking-tight group-hover:text-accent-foreground`.
- Description:
  - `text-sm text-text-secondary leading-relaxed`.
- Scope pill:
  - `inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-mono tracking-wide`.

**Use this card** when you want to spotlight a small set of “agents” or roles with rich copy and icon.

---

## RAG & Voice Section (`RagVoiceSection.tsx`)

Purpose: explain the RAG + voice workflow with three concise steps.

- Section: `id="rag-voice"` and `py-24 px-6`.
- Layout: `grid lg:grid-cols-2 gap-16 items-center`.

Left column:

- Pill: `4 RAG & Voice` (same style as other pills).
- Heading: `text-h2 font-serif` with italic emphasis.
- Bulleted points:
  - Flex row: `flex items-start gap-3`.
  - Bullet dot: `w-1.5 h-1.5 rounded-full bg-primary mt-2`.
  - Text: `text-base text-text-secondary leading-relaxed`.

Right column:

- Steps data array (`steps`) and map.
- Each step card:
  - Outer: `group`.
  - Card: `flex gap-4 p-6 rounded-2xl border border-border-subtle bg-background/50 hover:bg-accent hover:border-accent-foreground/20 transition-all duration-300`.
  - Icon: `w-10 h-10 rounded-lg bg-accent flex items-center justify-center group-hover:gradient-accent`.
  - Title: `text-base font-semibold tracking-tight group-hover:text-accent-foreground`.
  - Text: `text-sm text-text-secondary leading-relaxed`.

**Pattern name**: three-step explanatory cards.

---

## Get Started Section (`GetStartedSection.tsx`)

Purpose: final call-to-action + simple footer.

- Section: `id="get-started"` and `py-32 px-6`.
- Layout: `max-w-[800px] mx-auto text-center space-y-8`.

Elements:

- Pill: `5 Get started` (same pill style as other sections).
- Heading: `text-h2 font-serif tracking-tight` with italic brand name span.
- Body: `text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed`.
- CTA buttons:
  - Primary: same enriched `Button` styling as hero (`shadow-lg`, `hover:scale-105`).
  - Secondary: `variant="outline"` with `border-border-strong` and accent hover.
- Footer:
  - Link row: small text (`text-sm text-text-secondary`) with hover color shifts to `text-foreground`.
  - Metadata: `text-xs text-text-secondary` for copyright.

Use this pattern wherever you need a **central, one-column CTA** at the bottom of the page.

---

## Primitive UI Components

Key primitives live in `src/components/ui` and are wired to the same tokens from `foundations.md`:

- `button.tsx`
  - Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.
  - Sizes: `default`, `sm`, `lg`, `icon`.
  - All buttons use `focus-visible:ring-ring` and `ring-offset-background` for accessible focus.

- `card.tsx`
  - Standard card shell used by generic UI (not the custom marketing cards):
    - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
  - Colors source: `bg-card`, `text-card-foreground`, `border`.

- `navigation-menu.tsx`
  - Radix-based navigation menu with `navigationMenuTriggerStyle` using `bg-background`, `hover:bg-accent`, and `text-accent-foreground`.

These primitives should be used for any **application UI** you add later to keep it visually consistent with the marketing site.

---

## When Adding New UI

1. **Use existing section patterns**:
   - For new sections, start with `py-24 px-6` + `max-w-[1200px] mx-auto`.
2. **Reuse pills, headings, and body text classes**:
   - Pills: `inline-flex gap-2 px-3/4 py-1.5 rounded-full bg-pill text-pill-foreground text-xs font-mono tracking-wide`.
   - H2: `text-h2 font-serif tracking-tight`.
   - Body: `text-base or text-lg text-text-secondary leading-relaxed`.
3. **Stick to the established accent usage**:
   - Use `bg-primary` and `bg-accent` only for interactive states or emphasis, not as full-page backgrounds.
4. **Lean on the primitives** (`Button`, `Card`, `NavigationMenu`) before inventing new bespoke styles.

Following these rules will keep any new page or component aligned with the existing InterviewOS brand.
