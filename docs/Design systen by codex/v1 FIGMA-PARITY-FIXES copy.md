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

- Compact controls: 6px where the live class is `rounded-md`.
- Standard controls and selected controls: 8px where the live component uses the larger control treatment.
- Cards and panels: 8–12px.
- Large feature surfaces: 16px.
- Avatars and status pills: full/pill radius.

Inspect each component instance at 1440px. Do not globally change all `md` or `lg` radii without checking the live component.

### 3. Match live shell geometry

- Sidebar: 240px expanded.
- Header: 56px.
- Do not add a 64px compact sidebar frame; it is not currently implemented in live code.

## Priority 1 — Component parity

### Buttons


Match the live button heights, padding, icon gap, text size, text weight, border, radius, and hover color. Several live buttons use 14px horizontal padding and others use 16px based on context; preserve those as explicit size/density variants rather than silently normalizing them.

### Inputs and textareas


Match the live 36px input height, 12px horizontal padding, 8px vertical padding, default border, dark focus border, soft focus ring, and live placeholder color.


### Navigation and header

- Match 240px sidebar width.
- Match the live 24px navigation icon size if reproducing the current sidebar implementation.
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

The current code also uses some slate/blue utilities in review-specific controls, including textarea borders/focus fields and supporting panels. These are not Figma errors: they are current live behavior and must be reproduced for parity. Keep those usages in the review flow. Do not extend them into the sidebar, header, settings shell, integrations shell, or generic workspace controls. Any later palette cleanup should be treated as a separate product decision, not mixed into this Figma parity pass.


## Final Figma acceptance checklist

- [ ] Figma primary action is `#191919`; hover is `#353535`.
- [ ] Warm neutral shell matches the live page, sidebar, header, cards, and controls.
- [ ] Status colors are scoped to badges, evidence, comparison, audit, connection, and result states.
- [ ] Slate/blue utilities are not used for generic controls or shell chrome.
- [ ] Sidebar is 240px expanded; no unimplemented compact state is shown as production-ready.
- [ ] Header is 56px.
- [ ] Input height is 36px and matches live padding/radius/focus behavior.
- [ ] Typography matches live size, weight, line-height, and tracking by role.
- [ ] Every Figma component maps to an existing live component or is marked as a future state.
- [ ] Final 1440px screenshots are compared against the running application.
