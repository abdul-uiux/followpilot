# FollowPilot Design System

Status: final live-code reference

This document defines the FollowPilot system that Figma must reproduce. The live application is the source of truth for color, typography, component behavior, spacing, elevation, and responsive decisions. Figma should represent these decisions; it should not introduce a separate visual language.

The primary reference viewport is 1440px wide. Responsive behavior is defined separately where the live application changes layout at smaller widths.

## Source of truth

- Application source: `app/`
- Global styling: `app/globals.css`
- Shared shell: `app/components/app-sidebar.tsx`, `app/components/app-header.tsx`, `app/components/account-menu.tsx`
- Shared feedback: `app/components/toast-provider.tsx`
- Primary product surface: `app/followpilot-review.tsx`
- Supporting surfaces: `app/meetings/`, `app/settings/`, `app/integrations/`

The design system uses three tiers:

```text
live raw value → primitive token → semantic token → component token → screen
```

## Product visual principles

- Warm neutral workspace chrome.
- Monochrome primary actions.
- Status colors are reserved for meaning, not decoration.
- Evidence, review state, and CRM outcomes receive stronger visual distinction than navigation chrome.
- Compact controls use 32–36px heights; larger actions use 44px.
- Cards and panels use restrained borders and low elevation.
- Every interactive state must have a keyboard-focus treatment.
- Figma and code use the same token names and component variants.

## Primitive tokens

### Core neutrals

| Token | Value | Primary use |
|---|---:|---|
| `color.neutral.0` | `#FFFFFF` | Surface and inverse text |
| `color.neutral.50` | `#FBFBFA` | Raised surface and row hover |
| `color.neutral.100` | `#FAFAF9` | Quiet surface |
| `color.neutral.150` | `#F7F7F5` | Page canvas |
| `color.neutral.200` | `#ECECEA` | Subtle divider |
| `color.neutral.250` | `#E9E9E7` | Focus ring and selected/quiet state |
| `color.neutral.300` | `#E8E7E4` | Strong surface and active navigation |
| `color.neutral.400` | `#DEDDDA` | Default control border |
| `color.neutral.500` | `#C9C8C5` | Strong border and hover border |
| `color.neutral.600` | `#9B9995` | Placeholder text |
| `color.neutral.700` | `#787774` | Secondary text |
| `color.neutral.800` | `#625F5C` | Tertiary/body text |
| `color.neutral.850` | `#52504D` | Control text |
| `color.neutral.900` | `#191919` | Primary text and action |
| `color.neutral.1000` | `#000000` | Absolute black when required |
| `color.action.primary-hover` | `#353535` | Live primary-action hover |

### Status and product colors

These colors are semantic product feedback colors. They are allowed in badges, result states, before/after comparison cards, audit data, connection states, and warnings. They are not general page chrome.

| Family | Live values | Meaning |
|---|---|---|
| Success | `#EBF5ED`, `#2E6B43`, `#397950`, emerald utilities | Connected, approved, completed |
| Danger | `#FFFAFA`, `#FFF4F2`, `#FDE5E2`, `#A8342A`, `#F1C8C3` | Destructive action and errors |
| Warning | amber utilities, `#BB4D00` | Needs decision, caution, incomplete state |
| Information/compare | sky and blue utilities | Evidence, suggestion, comparison context |
| Neutral evidence | stone and slate utilities | Before/after data, audit details, supporting context |
| Synthetic/result accent | violet utilities | Result type or append/change marker |

### Typography primitives

| Token | Live value |
|---|---:|
| `font.family.ui` | Inter, system UI fallback |
| `font.family.code` | SF Mono, Consolas, Liberation Mono |
| `font.size.2xs` | 10px |
| `font.size.xs` | 11px |
| `font.size.sm` | 12px |
| `font.size.sm-plus` | 13px |
| `font.size.md` | 14px |
| `font.size.lg` | 16px |
| `font.size.xl` | 18px |
| `font.size.2xl` | 20px |
| `font.size.3xl` | 24px |
| `font.size.4xl` | 28px |
| `font.size.5xl` | 30px |
| `font.size.6xl` | 36px |
| `font.weight.regular` | 400 |
| `font.weight.medium` | 500 |
| `font.weight.semibold` | 600 |
| `font.weight.bold` | 700 |

Typography roles:

| Role | Size | Weight | Use |
|---|---:|---:|---|
| Display | 36px | 700 | Hero or major home state |
| Page title | 30px | 600 | Page-level heading |
| Section heading | 24px | 600 | Major section |
| Subsection heading | 20px | 600 | Subsection |
| Card/dialog title | 18px | 600 | Component title |
| Body large | 16px | 400 | Lead/supporting copy |
| Body | 14px | 400 | Default text |
| Label | 13–14px | 500 | Controls and form labels |
| Metadata | 12px | 400 | Tables, metadata, helper content |
| Overline | 10–11px | 600 | Uppercase category labels |
| Code | 12–13px | 400 | Transcript, IDs, code-like data |

## Spacing and layout

The live system uses a 4px base grid with intentional 2px half-steps:

```text
0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 56
```

At the 1440px reference viewport:

| Layout token | Live value |
|---|---:|
| `layout.sidebar.expanded` | 240px |
| `layout.header.height` | 56px |
| `layout.content.max-width` | 1200px |
| `layout.control.height.sm` | 32px |
| `layout.control.height.md` | 36px |
| `layout.control.height.lg` | 44px |

Spacing rules:

- Icon-to-label: 4–8px.
- Inline controls: 8–12px.
- Form field spacing: 12–16px.
- Card internal sections: 16–20px.
- Major section spacing: 24–40px.
- Hero/page spacing: 40–56px.
- Use responsive padding changes at smaller breakpoints; do not create new arbitrary values in Figma.

## Shape and elevation

| Role | Live target |
|---|---:|
| Small radius | 4–6px |
| Control radius | 6px |
| Card/panel radius | 8–12px |
| Large surface radius | 16px |
| Pill/avatar | 9999px |
| Default border | 1px solid `#DEDDDA` |
| Subtle divider | 1px solid `#ECECEA` |
| Strong border | 1px solid `#C9C8C5` |
| Focus ring | 3px soft neutral ring |
| Surface elevation | `0 1px 2px rgba(0,0,0,.03)` everywhere |
| Disabled opacity | 0.45 |

The live implementation takes priority where two surfaces use slightly different elevation values. Figma should match the actual component instance rather than normalize away visible differences.

## Semantic tokens

```text
color.background.page              → #F7F7F5
color.background.surface           → #FFFFFF
color.background.surface-raised    → #FBFBFA
color.background.surface-quiet     → #FAFAF9 / #F5F5F3
color.background.surface-selected  → #E9E9E7 / #E8E7E4
color.text.primary                 → #191919
color.text.secondary               → #787774
color.text.tertiary                → #625F5C / #4F4D4A
color.text.placeholder             → #9B9995
color.text.control                 → #52504D
color.border.default               → #DEDDDA
color.border.subtle                → #ECECEA
color.border.strong                → #C9C8C5
color.border.focus                 → #191919
color.interactive.primary          → #191919
color.interactive.primary-hover    → #353535
color.interactive.secondary        → #FFFFFF
color.interactive.secondary-hover  → #F1F1EF / #FBFBFA
color.status.success.*             → live success family
color.status.danger.*              → live danger family
color.status.warning.*             → live warning family
color.status.info.*                → live information family
```

## Applied component contract

### Button

Variants: primary, secondary, tertiary, ghost, danger.

Required states: default, hover, pressed, focus-visible, disabled, loading.

- Primary: dark background, white text, live dark hover.
- Secondary: white background, default border, primary text.
- Tertiary: quiet neutral background, secondary text.
- Ghost: transparent background, quiet hover.
- Danger: live danger background/text pairing.
- Standard height: 36px; compact: 32px; large: 44px.
- Horizontal padding: live component value, generally 14–16px.
- Radius: live button radius; Figma must match the actual code variant.

### Input, select, and textarea

- White surface, default border, 36px standard height.
- 12px horizontal and 8px vertical internal padding.
- Placeholder uses `#9B9995`.
- Focus uses dark border plus soft focus ring.
- Error uses the live danger border/text family.
- Disabled uses quiet background, reduced opacity, and non-editable cursor.

### Card and panel

- White surface.
- Default or subtle border depending on hierarchy.
- 8–12px radius.
- 16–24px padding depending on density.
- All surfaces use the shared surface elevation: `0 1px 2px rgba(0,0,0,.03)`.
- Title, body, and metadata use separate typography roles.

### Sidebar and header

- Expanded sidebar: 240px.
- Sidebar icons: 20px.
- Header: 56px.
- Warm neutral canvas and borders.
- Navigation active state uses a neutral selected surface.
- Account menu uses a compact avatar, menu surface, border, and menu elevation.
- Compact 64px sidebar is not currently implemented in live code and is not a required Figma state.

### Modal, menu, toast, badge, table, and review states

These components must use the live status/evidence colors only where they communicate product meaning. The general shell remains warm neutral.

## Figma construction rules

- Create variables using the semantic names above, not raw hex names.
- Use the naming bridge: Figma uses `/`, CSS uses `-`, and code documentation uses `.`.
- Example: `color/neutral/900` → `--fp-color-neutral-900` → `color.neutral.900`.
- Create component properties for every live variant and state.
- Use 1440px as the primary review frame.
- Reproduce the live responsive constraints instead of inventing desktop-only fixed widths.
- Use component instances for buttons, inputs, cards, badges, menus, toasts, and review states.
- Every Figma component must have a matching code component or an explicit documented exception.
- Keep color variables for status/evidence scoped to status/data surfaces.
- Do not use status colors for the sidebar, header, page background, primary controls, or generic cards.

## Definition of done

- Figma and code use the same semantic token names.
- Every visible 1440px component has a corresponding Figma component/variant.
- Every Figma state exists in live code: hover, focus, disabled, loading, empty, error, success, and selected where applicable.
- No undocumented raw color, spacing, radius, or shadow appears in either source.
- Status colors remain inside badges, evidence/data surfaces, before/after cards, connection states, and result feedback.
- Visual comparison at 1440px shows no intentional mismatch.
