# FollowPilot Figma Parity Fixes

Status: actionable Figma checklist

The live FollowPilot application is the source of truth. These are the changes required in Figma so it matches the current implementation. This is not a request to redesign the live product.

## Priority 0 — Resolve in Figma first

### 1. Use live values, not the earlier proposed values

Update Figma variables and component styles to the live values:

| Token | Correct live value |
|---|---:|
| Primary action | `#191919` |
| Primary hover | `#353535` |
| Page background | `#F7F7F5` |
| Surface | `#FFFFFF` |
| Raised surface | `#FBFBFA` |
| Quiet surface | `#FAFAF9`, `#F5F5F3`, or `#F2F2F0` by live component |
| Default border | `#DEDDDA` |
| Subtle border | `#ECECEA` |
| Strong border | `#C9C8C5` |
| Primary text | `#191919` |
| Secondary text | `#787774` |
| Tertiary text | `#625F5C` / `#4F4D4A` |
| Placeholder | `#9B9995` |

Do not use `#52504D` as the primary hover value; it is live control text.

### 2. Match live radius usage

Figma must follow the actual visible code components rather than applying one radius to every component:

- All current standard controls: 6px.
- Cards and panels: 8–12px.
- Large feature surfaces: 16px.
- Avatars and status pills: full/pill radius.

Inspect each component instance at 1440px. Do not globally change all `md` or `lg` radii without checking the live component.

### 3. Match live shell geometry

- Sidebar: 240px expanded.
- Sidebar icons: 20px.
- Header: 56px.
- Do not add a 64px compact sidebar frame; it is not currently implemented in live code.
- Preserve the live desktop content offset and 1200px content maximum.
- Match header/search padding at the 1440px breakpoint.

## Priority 1 — Component parity

### Buttons

Create Figma variants for:

- Primary
- Secondary
- Tertiary
- Ghost
- Danger

Create states for:

- Default
- Hover
- Pressed
- Focus-visible
- Disabled
- Loading

Match the live button heights, padding, icon gap, text size, text weight, border, 6px radius, and hover color. Several live buttons use 14px horizontal padding and others use 16px based on context; preserve those as explicit size/density variants rather than silently normalizing them.

### Inputs and textareas

Add Figma states for:

- Empty
- Filled
- Placeholder
- Hover
- Focus
- Error
- Disabled
- Read-only where applicable

Match the live 36px input height, 12px horizontal padding, 8px vertical padding, default border, dark focus border, soft focus ring, and live placeholder color.

### Cards and panels

Represent the actual live density variants:

- Compact card
- Standard card
- Review/evidence card
- Before/after comparison card
- Empty state card
- Loading state card
- Error state card

Do not apply the same padding or shadow to every card. The live code uses different card densities intentionally.

### Navigation and header

- Match 240px sidebar width.
- Match the live 20px navigation icon size.
- Match the live 12px icon-label gap if reproducing the current sidebar implementation.
- Match active, hover, focus, and disabled navigation states.
- Match 56px header height and live search field geometry.
- Match account avatar and dropdown menu states.

## Priority 1 — Status and evidence colors

The guide’s restriction means these colors should not become general workspace chrome. The live app already uses them in review-specific content, and Figma must reproduce those live usages exactly:

| Color family | Keep in Figma for | Do not use for |
|---|---|---|
| Emerald/green | Connected, approved, completed, success badges | Sidebar, generic buttons, page background |
| Amber/orange | Needs decision, caution, warning states | Generic borders or navigation |
| Red | Errors, destructive actions, invalid fields | Generic card decoration |
| Sky/blue | Evidence, suggestions, comparison context | Primary action or shell chrome |
| Stone | Before/after context and neutral evidence | Primary text or generic controls |
| Slate | Audit/table data and supporting review information; current review controls that already use slate utilities | Sidebar, header, or general workspace chrome |
| Violet | Explicit result/append/change marker | Generic navigation or buttons |

The current code also uses some slate/blue utilities in review-specific controls, including textarea borders/focus fields and supporting panels. These are current live behavior and must be reproduced for parity. Keep those usages in the review flow. Do not extend them into the sidebar, header, settings shell, integrations shell, or generic workspace controls.

## Priority 1 — Global interaction and surface decisions

- All focus rings are 3px using the live soft neutral ring color.
- All disabled states use 0.45 opacity.
- All elevated surfaces use `0 1px 2px rgba(0,0,0,.03)`.
- The 6px control radius is canonical.
- Figma naming uses `/`, CSS uses `-`, and code documentation uses `.`.

```text
Figma: color/neutral/900
CSS:   --fp-color-neutral-900
Code:  color.neutral.900
```

## Priority 1 — Missing Figma component states

Add these states before calling the Figma file complete:

- Toast: success, error, entering, exiting.
- Toggle: on, off, focus, disabled.
- Menu: default, hover, selected, focus, disabled, destructive.
- Modal: open, closing, destructive confirmation, validation error.
- Upload zone: default, drag-over, uploading, error, complete.
- Review stepper: upcoming, active, completed, blocked, error.
- Audit table: default row, hover row, selected row, empty, loading, error.
- Connection card: checking, connected, not configured, disconnecting, error.

## Priority 2 — Responsive behavior

Use 1440px as the primary Figma frame. Also document the live responsive transitions:

- Sidebar content offset changes at the large-screen breakpoint.
- Header search hides or changes layout on smaller screens.
- Cards switch from multi-column to stacked layouts.
- Buttons and filter controls wrap at narrow widths.
- Tables preserve readable minimum widths and may scroll horizontally.
- Modal and review surfaces reduce horizontal padding on smaller screens.

Do not create arbitrary Figma breakpoints that are not represented in the live layout.

## Final Figma acceptance checklist

- [ ] Figma primary action is `#191919`; hover is `#353535`.
- [ ] Warm neutral shell matches the live page, sidebar, header, cards, and controls.
- [ ] Status colors are scoped to badges, evidence, comparison, audit, connection, and result states.
- [ ] Slate/blue utilities are not used for generic controls or shell chrome.
- [ ] Sidebar is 240px expanded; no unimplemented compact state is shown as production-ready.
- [ ] Header is 56px.
- [ ] Input height is 36px and matches live padding/radius/focus behavior.
- [ ] All button variants and interactive states exist.
- [ ] All major empty/loading/error/success states exist.
- [ ] Typography matches live size, weight, line-height, and tracking by role.
- [ ] Cards use the correct live density and elevation per instance.
- [ ] Every Figma component maps to an existing live component or is marked as a future state.
- [ ] Final 1440px screenshots are compared against the running application.
