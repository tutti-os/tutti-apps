# TrendReader Steep-Style Design Guidance

## Context and Goals

TrendReader must keep its category-first GitHub Trending README reader workflow while adopting the Steep-inspired design intent: AI-analytics clarity, fast insight scanning, and zero visual chaos.

The supplied Steep extraction targets a marketing surface with low-confidence audience inference. For TrendReader, the implementation must adapt the visual language to an authenticated developer/operator app: dense enough for repeated use, calm enough for long README reading, and clear enough for fast repository comparison.

Non-negotiable goals:

- The app must use semantic Tailwind/shadcn tokens, not raw color utilities inside components.
- Fixed palette, typography, radius, and motion values must live in `src/styles.css`.
- The desktop app must preserve the command bar, category sidebar, grouped board, and README panel.
- The right panel must stay README-only for MVP.
- Repositories must be grouped by product category before ranking.
- Interactive controls must expose default, hover, focus-visible, active, disabled, loading, and error states.
- Accessibility requirements must be testable in implementation.

## Design Tokens and Foundations

### Token Strategy

Components must consume semantic classes such as `bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `border-border`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `bg-accent`, and `text-accent-foreground`.

Component code must not use raw arbitrary color classes such as `bg-[#04172b]`, `text-[#17191c]`, or `bg-[#ffffff]/5`.

### Brand Mapping

Source brand:

- Product/brand: Steep: AI analytics for faster insights and zero chaos
- URL: `https://steep.app/`
- Audience: authenticated users and operators
- Product surface: marketing site

TrendReader mapping:

- Product type: developer/operator research app.
- Primary task: find trending repositories, understand category momentum, and read the selected README.
- Visual intent: clean, functional, implementation-oriented, and insight-first.

### Core Palette

The Steep-derived palette maps to TrendReader tokens as a light-first system:

- `color.text.primary=#17191c`: `--foreground`, `--card-foreground`, primary labels, and key metrics
- `color.text.secondary=#777b86`: `--muted-foreground`, secondary labels, helper copy, metadata
- `color.surface.base=#000000`: reference for dark CTA/mark treatment; implemented as `--primary` with a softened `#17191c` app value
- `color.text.inverse=#ffffff`: `--primary-foreground`, text on dark pills and selected controls
- `color.surface.raised=#04172b`: reference for deep analytical accents and code blocks, not the page background
- `color.surface.strong=oklab(0.999994 0.0000455678 0.0000200868 / 0.05)`: subtle tint, hover state, and low-noise panel separation

Rules:

- The app background and command chrome must stay light, clean, and low-noise.
- Content panels must use dark text on light cards.
- Primary actions and selected navigation must use a dark pill treatment, matching Steep's `Get started` CTA pattern.
- Major app regions should feel like floating work surfaces on a warm white wash, using light borders and soft shadows instead of hard full-height dividers.
- Selected repository rows should read as pale blue analytical cards, not as heavy bordered table rows.
- Data emphasis should use neutral blue, violet, or amber chart tokens instead of green as a theme color.
- Components must use token utilities, not one-off palette shortcuts.

### Typography

Use the Steep stack:

- `font.family.primary`: Sohne
- `font.family.stack`: Sohne, ui-sans-serif, system-ui, -apple-system, system-ui, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji
- `font.size.xs`: `15px`
- `font.size.sm`: `16px`
- `font.size.md`: `17px`
- `font.size.lg`: `18px`
- `font.size.xl`: `20px`
- `font.size.2xl`: `44px`
- `font.size.3xl`: `64px`
- `font.size.4xl`: `90px`

Rules:

- Product chrome must use compact 15px to 16px text.
- Category headings should stay around 20px.
- README h1 may use the 44px step on wide screens but must scale down on mobile.
- Repository names must use semibold weight.
- Numeric ranking, stars, deltas, and cache timestamps should use `font-mono` where comparison matters.
- Long repository names must truncate with enough surrounding context to remain understandable.
- Letter spacing must remain normal.

### Spacing, Radius, Motion

Spacing tokens:

- `space.1=2px`
- `space.2=4px`
- `space.3=6px`
- `space.4=8px`
- `space.5=12px`
- `space.6=14px`
- `space.7=20px`
- `space.8=290.89px`

Rules:

- Compact controls should use `gap-1`, `gap-1.5`, `gap-2`, and `px-3`.
- Pane padding should use `p-4`, `px-5`, `py-4`, or `p-5`.
- The large `space.8` value is a marketing extraction artifact and must not be used for app layout spacing.

Radius:

- `radius.xs=16777200px`
- Compact controls, chips, badges, and search fields must use pill geometry.
- Large content panes should cap visual radius to avoid unusable capsule panels.

Motion:

- `motion.duration.instant=150ms`
- `motion.duration.fast=200ms`
- `motion.duration.normal=300ms`
- `motion.duration.slow=500ms`

Rules:

- Controls must use quick color and transform feedback.
- Active controls should use tactile press feedback.
- No decorative animation, glow fields, or background blobs.
- Motion must respect `prefers-reduced-motion`.

## Component-Level Rules

### App Shell

Anatomy:

- light top command bar
- light category sidebar
- light grouped category board
- light README reader panel

States:

- Default must show all panes on desktop.
- Loading must preserve dimensions and use `aria-busy`.
- Error must expose retryable inline copy.
- Empty must show a clear refresh action.

Responsive behavior:

- Desktop must preserve the four-region model.
- Narrow widths must stack command bar, categories, board, and README.
- Mobile must not create horizontal overflow.

### Command Bar

Anatomy:

- brand mark and product name
- repository search
- time range toggle
- language selector
- refresh action
- GitHub action
- cache status
- settings icon button

States:

- Default must use a light surface with dark primary text.
- Primary command actions should use dark pill treatment with inverse text.
- Hover should use subtle strong-surface tint.
- Focus-visible must show a visible ring token.
- Active must provide tactile press feedback.
- Disabled must lower opacity and block pointer interaction.
- Loading must set `aria-busy="true"` and visible refresh copy.
- Error must expose retryable status copy near the affected action.

Behavior:

- Search must filter repositories, owners, topics, and language text.
- Toggle choices must remain mutually exclusive.
- External links must open safely with `rel="noreferrer noopener"`.

### Category Sidebar

Rules:

- Sidebar must use a light navigation surface.
- Active category must use dark inverse pill treatment with high contrast.
- Deltas must use a chart emphasis token, not green theme color.
- Saved collections and pinned topics must remain compact and keyboard reachable.
- Long labels must truncate.

### Category Board

Rules:

- Categories must be grouped before repositories are ranked.
- Category headers must show label, repo count, momentum, tone, and delta.
- Hot/trending badges must use semantic badge variants.
- Deltas must use chart emphasis tokens.
- Rows must have stable height, visible focus, hover, active, and selected states.
- README preview strips inside rows must read as lightweight document previews.

### README Panel

Rules:

- The right panel must contain README content only plus minimal repo header actions.
- Markdown headings must use dark card text on light reader surface.
- Inline code and code blocks must use raised dark surfaces with inverse text where helpful.
- Links must be descriptive, keyboard focusable, and safe for external targets.
- Long code lines must scroll horizontally instead of overflowing the page.

## Accessibility Requirements and Acceptance Criteria

- Every interactive control must be reachable with Tab.
- Every control must have an accessible name.
- Focus-visible styles must be visible against light chrome and light cards.
- Text contrast must pass WCAG 2.2 AA.
- Form controls must have `id` or `name` where browser validation expects it.
- External links must include safe `rel` attributes.
- Mobile layout must report no horizontal overflow.
- Disabled controls must be programmatically disabled, not only visually muted.
- Loading controls must expose busy state to assistive technology.

Pass/fail checks:

- Keyboard can move through command bar, category buttons, repo rows, README links, and external actions.
- A selected repo row remains visually distinct without relying on color alone.
- README code blocks do not clip content.
- 320px mobile viewport has no horizontal page scroll.

## Content and Tone Standards

Tone must be concise, confident, and implementation-focused.

Good:

- `Cache updated`
- `Showing fallback data`
- `Search repositories, owners, topics`
- `Open GitHub`
- `Momentum`

Avoid:

- ambiguous actions such as `Go`, `More`, or `Click here`
- marketing explanations inside the app surface
- decorative copy that does not help trend reading

## Anti-Patterns and Prohibited Implementations

- Do not embed GitHub pages in iframes.
- Do not add a marketing hero or landing page before the app surface.
- Do not put unrelated repository metadata panels beside the README in MVP.
- Do not use raw hex colors inside components.
- Do not use green as the primary theme color.
- Do not use low-contrast gray text on light surfaces.
- Do not hide focus indicators.
- Do not introduce one-off spacing or typography exceptions.

## QA Checklist

- Desktop shows top command bar, left categories, center grouped board, and right README panel.
- Mobile stacks without horizontal overflow.
- Search filters repositories without layout shift.
- Range, language, refresh, category, and repo controls are keyboard reachable.
- Clicking a repo updates URL and README content.
- GitHub Trending/API fallback states display accurate cache copy.
- Steep token mapping is present in `src/styles.css`.
- Components use semantic Tailwind/shadcn tokens instead of raw hex classes.
- Chrome console has no errors.
- `pnpm lint`, `pnpm --filter @nextop-apps/github-trending typecheck`, and app build pass.
