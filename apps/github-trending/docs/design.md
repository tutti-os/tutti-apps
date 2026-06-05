# TrendReader Design Guidance

## Context and Goals

TrendReader is a category-first GitHub Trending README reader for developers and technical teams. The interface must feel like a dense, calm command center: left navigation for categories, center grouped repository board, and a README-only reading panel on the right.

The design intent is to make trend discovery scannable, keyboard-friendly, and implementation-ready without drifting into marketing-page composition.

Non-negotiable goals:

- The app must use semantic Tailwind/shadcn tokens, not raw color utilities inside components.
- The app must preserve the three-pane command-center mental model on desktop.
- The right panel must stay README-only in MVP.
- The category board must aggregate by product category before ranking repositories.
- Every interactive component must define default, hover, focus-visible, active, disabled, loading, and error behavior.
- Every accessibility rule must be testable during implementation.

Known page component density:

- links: 62
- cards or card-like repeated surfaces: 44
- buttons: 10
- inputs: 3
- navigation groups: 2
- lists: 1

## Design Tokens and Foundations

### Token Strategy

Use Tailwind CSS v4 semantic theme tokens as the only place where fixed color values are defined.

Component code must consume tokens with classes such as:

- `bg-background`
- `text-foreground`
- `bg-card`
- `text-card-foreground`
- `border-border`
- `bg-muted`
- `text-muted-foreground`
- `bg-primary`
- `text-primary`
- `ring-ring`
- `text-destructive`

Component code must not use raw arbitrary color classes such as `bg-[#061114]`, `text-[#e9f7f4]`, `border-[#264247]`, or one-off palette shortcuts for core surfaces.

### Tailwind Theme Tokens

Define the fixed visual palette in `src/styles.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: #061114;
  --color-foreground: #e9f7f4;
  --color-card: #0b1b20;
  --color-card-foreground: #e9f7f4;
  --color-popover: #0b1b20;
  --color-popover-foreground: #e9f7f4;
  --color-primary: #2dd4bf;
  --color-primary-foreground: #031414;
  --color-secondary: #10272d;
  --color-secondary-foreground: #d7ece8;
  --color-muted: #10272d;
  --color-muted-foreground: #8fa8a6;
  --color-accent: #45f08a;
  --color-accent-foreground: #031414;
  --color-destructive: #fb7185;
  --color-destructive-foreground: #fff1f2;
  --color-border: #264247;
  --color-input: #1b343a;
  --color-ring: #2dd4bf;
  --color-chart-1: #45f08a;
  --color-chart-2: #2dd4bf;
  --color-chart-3: #60a5fa;
  --color-chart-4: #facc15;
  --color-chart-5: #fb923c;
}
```

### Typography

Use a technical sans-serif stack optimized for dashboard scanning:

- `font.family.primary`: Geist, DM Sans, Roboto, -apple-system, system-ui, Segoe UI, Helvetica, Arial, sans-serif
- `font.family.mono`: JetBrains Mono, SFMono-Regular, ui-monospace, Menlo, Consolas, monospace
- `font.size.xs`: `text-xs`
- `font.size.sm`: `text-sm`
- `font.size.base`: `text-base`
- `font.size.md`: `text-lg`
- `font.size.lg`: `text-xl`
- `font.size.xl`: `text-2xl`

Rules:

- Dashboard text must avoid oversized hero typography.
- Repository names should use `text-sm` or `text-base` with medium weight.
- Numeric ranking, stars, and deltas should use `font-mono` where compact comparison matters.
- Long names must use `truncate` with accessible full labels via `title` or tooltip.
- Letter spacing must remain normal unless a native shadcn component already requires otherwise.

### Spacing

Use Tailwind spacing tokens only:

- compact row gaps: `gap-1`, `gap-1.5`, `gap-2`
- section gaps: `gap-3`, `gap-4`
- pane padding: `p-3`, `p-4`, `px-4`, `py-3`
- top bar height: `h-14` minimum
- icon buttons: `size-9`
- repo rows: stable `min-h-20`

Rules:

- Layout must use `gap-*`, not `space-x-*` or `space-y-*`.
- Equal width and height controls must use `size-*`.
- Repeated rows must use stable min heights so hover, tags, badges, and loading states do not shift the board.
- Page sections must not use nested cards. Use panes, rows, separators, and section headers.

### Radius, Border, Shadow, and Motion

Tokens:

- small control radius: `rounded-md`
- pane radius: `rounded-lg`
- tag radius: `rounded`
- border: `border-border`
- focus ring: `ring-ring`
- transition: `transition-colors`, `transition-transform`, or `transition-opacity`

Rules:

- Cards and panes must stay at `rounded-lg` or below.
- Shadows should be minimal. Prefer borders and subtle background contrast.
- Active press feedback should use `active:scale-[0.98]` or `active:translate-y-px`.
- Motion must use transform and opacity only.
- Infinite decoration or large background animation must not be used in the dashboard MVP.

## Component-Level Rules

### App Shell

Anatomy:

- top command bar
- left category sidebar
- center category board
- right README panel

Desktop behavior:

- The shell must use a stable grid.
- The sidebar must stay narrow and scannable.
- The board must own the primary scroll area.
- The README panel must scroll internally.

Responsive behavior:

- At narrow widths, panes should stack as command bar, category selector, board, README.
- Horizontal overflow must not appear on mobile.
- The README panel should collapse below the board unless a dedicated detail route is introduced.

States:

- default: all panes visible with cached data status.
- loading: panes keep dimensions and show skeleton rows.
- error: command bar shows a retry action and affected panes show inline error copy.
- empty: center board shows an empty state with refresh action.

### Command Bar

Anatomy:

- product identity
- search input
- range toggle
- language select
- refresh button
- open GitHub button
- cache status
- settings button

States:

- default: controls are enabled and visually quiet.
- hover: buttons should use `hover:bg-muted/70` and keep contrast.
- focus-visible: controls must show `ring-2 ring-ring ring-offset-2 ring-offset-background`.
- active: buttons must provide tactile transform feedback.
- disabled: controls must use `disabled:opacity-50 disabled:pointer-events-none`.
- loading: refresh button must show a text or icon state with `aria-busy="true"`.
- error: refresh area must expose a retryable error message.

Keyboard behavior:

- Tab must move through controls in visual order.
- Enter must activate buttons.
- Escape should clear search focus when the search input is active.
- Range selection should use arrow keys if implemented with ToggleGroup.

Pointer and touch behavior:

- Hit targets must be at least `size-9`.
- Touch controls must not rely on hover-only affordances.
- Tooltips must not be the only way to understand core actions.

### Search Input

Anatomy:

- leading search icon
- input text
- optional keyboard hint
- clear action when non-empty

States:

- default: `bg-card border-border text-foreground`.
- hover: border should move toward `border-primary/50`.
- focus-visible: input must show tokenized ring.
- active: cursor placement only; no layout shift.
- disabled: muted background and no pointer events.
- loading: optional inline spinner or shimmer, not a layout-changing state.
- error: border and helper text must use `destructive`.

Behavior:

- Search should debounce client-side filtering.
- Long queries must scroll inside the input, not resize it.
- Empty search must show all categories.

### Category Sidebar Item

Anatomy:

- icon
- category label
- repo count
- momentum delta

States:

- default: transparent background with muted metadata.
- hover: `bg-muted/70`.
- focus-visible: visible ring.
- active: selected item uses `bg-primary/15 border-primary/50 text-foreground`.
- disabled: opacity reduction and no pointer events.
- loading: skeleton label and count.
- error: inline error item with retry if category data is unavailable.

Behavior:

- Enter and Space must select the category.
- The active category must expose `aria-current="true"` or equivalent state.
- Counts must remain aligned for scanability.

### Category Section

Anatomy:

- category title
- repo count
- momentum value
- tone badge
- sparkline
- repo row list

States:

- default: bordered section with stable header.
- hover: section itself should not be clickable unless the whole section has a defined action.
- focus-visible: only interactive children receive focus.
- loading: skeleton header plus skeleton rows.
- error: inline category-level error with retry.
- empty: show no-repos state inside the section.

Responsive behavior:

- Sparkline may hide on mobile.
- Repo metadata columns should collapse into two lines before truncating important names.

### Repo Row

Anatomy:

- rank
- owner/repo name
- description
- stars gained
- language
- license
- topics
- structured README preview

States:

- default: `border-border` row with readable metadata.
- hover: row background should use `bg-muted/50`.
- focus-visible: row must show a visible ring or outline.
- active: selected row must use a primary border or inset marker.
- disabled: only for unavailable repos; metadata should explain why.
- loading: skeleton row with fixed height.
- error: row-level README or metadata error must not break row layout.

Behavior:

- Enter and Space must select the row.
- Opening GitHub must be a separate button or link, not the entire row.
- Long repo names must truncate in the middle container and keep owner visible when possible.
- README preview must be structured text, not an iframe and not a remote screenshot in MVP.

### README Panel

Anatomy:

- selected repo header
- minimal metadata
- Open on GitHub action
- README markdown content

Rules:

- The panel must not include issue, PR, discussion, release, related repo, or AI summary modules in MVP.
- README content must be sanitized before render.
- Long README content must scroll inside the panel.
- Empty selection must show a quiet prompt to select a repo.

States:

- default: selected README rendered.
- hover: only links and buttons change state.
- focus-visible: links and code-copy actions must show visible focus.
- active: action buttons use tactile feedback.
- disabled: unavailable README actions must explain why.
- loading: skeleton heading and paragraph blocks.
- error: show README error with Open on GitHub fallback.

### Markdown Renderer

Rules:

- Styling must use `react-markdown` `components` mappings with Tailwind semantic tokens.
- The implementation must not depend on `.markdown-body` global CSS.
- Headings must be compact enough for a side panel.
- Code blocks must scroll horizontally without widening the panel.
- Links must be descriptive, underlined on focus or hover, and open external targets safely.

States:

- default: rendered sanitized markdown.
- loading: skeleton blocks matching expected content density.
- error: readable fallback message.
- empty: "README not available" state with Open on GitHub action.

### Button

Variants:

- default: primary action
- outline: secondary action
- ghost: low-emphasis action
- icon: compact tool action

States:

- default: semantic token background, border, and text.
- hover: background or border contrast increases.
- focus-visible: visible token ring.
- active: tactile transform.
- disabled: opacity and pointer lock.
- loading: `aria-busy="true"` and stable width.
- error: destructive variant only when the button action is destructive or retry-failed.

Behavior:

- Buttons with icons must include accessible labels.
- Icon-only buttons must have `aria-label`.
- Loading buttons must not duplicate submissions.

### Badge

Variants:

- neutral metadata
- primary category match
- accent momentum
- destructive error

States:

- default: compact, readable metadata.
- hover: only interactive badges may change state.
- focus-visible: only focusable badges receive ring.
- active: only interactive badges use press feedback.
- disabled: muted badge.
- loading: skeleton pill.
- error: destructive token.

Rules:

- Badges must not be used as buttons unless implemented as buttons.
- Text inside badges must truncate if the badge is constrained.

## Accessibility Requirements and Testable Acceptance Criteria

Target: WCAG 2.2 AA.

Keyboard:

- All interactive controls must be reachable with Tab.
- Focus order must match visual order: command bar, sidebar, board, README panel.
- Enter or Space must activate row selection and buttons.
- Escape should dismiss open popovers or menu overlays.

Focus:

- Every interactive element must have a visible `focus-visible` style.
- Focus indicators must not rely on color alone.
- Focus rings must have at least 2px visual thickness or equivalent contrast.

Contrast:

- Body text must meet 4.5:1 contrast against its background.
- Large text and icon labels must meet 3:1 contrast.
- Disabled controls must remain understandable but do not need to meet active contrast.

Semantics:

- The app must expose landmarks for main content and navigation.
- Category navigation must use list or navigation semantics.
- Repo rows must use button or link semantics when clickable.
- Loading regions must expose `aria-busy` where appropriate.
- Error messages must be associated with the failed control or region.

Pass/fail checks:

- Pass if the full app can be operated without a mouse.
- Pass if selected category and selected repo are announced by assistive tech.
- Pass if browser zoom at 200% does not hide controls or create horizontal page scrolling.
- Pass if reduced-motion settings do not remove essential feedback.
- Fail if any interactive element lacks a visible focus state.
- Fail if README content can inject unsanitized HTML.
- Fail if external links omit safe external-link attributes.

## Content and Tone Standards

Tone: concise, confident, implementation-focused.

Labels:

- Use "Refresh", not "Go".
- Use "Open on GitHub", not "Open".
- Use "Showing cached data", not "Cache issue".
- Use "README unavailable", not "Something went wrong".

Repository descriptions:

- Keep descriptions to one sentence when shown in rows.
- Truncate long text visually but preserve accessible full text.
- Do not invent metrics in production data; show cached or unavailable state instead.

Error copy examples:

- "README unavailable. Open the repository on GitHub to read it there."
- "Trending source unavailable. Showing cached data from the last successful refresh."
- "GitHub rate limit reached. Try refreshing later."

## Anti-Patterns and Prohibited Implementations

- Do not use iframe embeds for GitHub repositories or README content.
- Do not add issue, PR, discussion, release, related repo, or AI summary widgets to the README panel in MVP.
- Do not use raw color utilities in component code for core UI surfaces.
- Do not create CSS Modules for component styling.
- Do not add `.app-*` global business classes.
- Do not make the first screen a landing page.
- Do not wrap every section in Card components.
- Do not rely on hover-only controls.
- Do not hide focus outlines.
- Do not use ambiguous icon-only buttons without labels.
- Do not allow repo rows to resize when loading, selected, or hovered.
- Do not fetch GitHub data from the browser with a token.
- Do not render unsanitized README HTML.

## Migration Notes

- Start with seed data but keep the service boundaries identical to the real data path.
- Map visual colors into Tailwind semantic tokens before writing UI components.
- Prefer shadcn primitives where available; customize through tokens and variants.
- Keep README rendering local and sanitized.
- Keep package-specific runtime details outside UI components.

## Edge-Case Handling

- No categories: show an empty state with refresh.
- Category has no repos: show category-level empty copy.
- Repo missing README: show README unavailable state and Open on GitHub.
- Rate limit: show cached or stale data status.
- Parser failure: show fallback or cached data status.
- Very long repo names: truncate and preserve full accessible label.
- Very long README lines: code blocks scroll horizontally.
- Mobile viewport: panes stack without page-level horizontal overflow.

## QA Checklist

- [ ] Semantic tokens are defined in `src/styles.css`.
- [ ] Component code uses semantic Tailwind classes instead of raw color values.
- [ ] No CSS Modules or `.app-*` global classes are introduced.
- [ ] Command bar controls have default, hover, focus-visible, active, disabled, loading, and error states.
- [ ] Repo rows have default, hover, focus-visible, active, disabled, loading, and error states.
- [ ] README panel is README-only.
- [ ] README markdown is sanitized.
- [ ] Keyboard-only navigation works across command bar, sidebar, board, and README panel.
- [ ] Browser zoom at 200% is usable.
- [ ] Mobile layout has no horizontal overflow.
- [ ] Loading states preserve layout dimensions.
- [ ] Error states include retry or Open on GitHub fallback where appropriate.
- [ ] External links use safe attributes.
- [ ] The implementation matches the dark command-center visual direction without copying the screenshot pixel-for-pixel.
