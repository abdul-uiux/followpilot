# FollowPilot Three-Tier Design Token Blueprint

## Purpose

This document defines a proposed three-tier design-token system for FollowPilot:

1. **Primitive tokens** — normalized global values with no UI intent.
2. **Semantic tokens** — values mapped to roles such as page background, border, text, focus, success, and danger.
3. **Applied/component tokens** — strict bindings for buttons, inputs, cards, navigation, modals, status badges, and review surfaces.

The blueprint defines FollowPilot's own visual language, token names, and component contracts.

## Evidence basis and confidence

| Evidence | Confidence | Use |
|---|---|---|
| Provided FollowPilot screens and rendered UI references | Observed from rendered screens | Layout qualities, color roles, spacing, radii, shadows, interaction patterns |
| FollowPilot source in `app/` | Observed from implementation | Existing colors, typography, component boundaries, states, accessibility hooks |
| Proposed normalized values below | Proposed | Consolidation and future implementation targets |

The available source exposes rendered values and application code. A value marked **observed** is evidence from the screens or current code. A value marked **proposed** is a normalized FollowPilot decision.

---

## 1. Value extraction inventory

### 1.1 Color inventory

#### Observed FollowPilot source values

| Role family | Values found | Consolidation target |
|---|---|---|
| Canvas/background | `#F7F7F5`, `#FBFBFA`, `#FAFAF9`, `#FFFFFF` | `surface.canvas`, `surface.primary`, `surface.subtle` |
| Ink/text | `#191919`, `#625F5C`, `#52504D`, `#4F4D4A`, `#787774`, `#9B9995` | `ink.950`, `ink.700`, `ink.500`, `ink.300` |
| Borders | `#DEDDDA`, `#ECECEA`, `#E8E7E4`, `#C9C8C5` | `border.subtle`, `border.default`, `border.strong` |
| Primary action | `#191919`, hover `#353535` | Default theme action role |
| Destructive | `#A8342A`, hover `#8F2C23`, soft `#FFFAFA` | `danger.600`, `danger.700`, `danger.50` |
| Status | emerald, amber, rose, sky, stone Tailwind roles | Explicit success, warning, danger, info, neutral scales |

> The source currently uses `#DEDDDA` as the default control border; normalize it once and stop repeating the raw value in page-level classes.

### 1.2 Typography inventory

| Property | Observed/current value | Normalization target |
|---|---|---|
| UI family | Inter variable font | `font.family.ui` |
| Code family | SF Mono / Consolas / Liberation Mono | `font.family.code` |
| Metadata | 10–11px | `font.size.xs` |
| Controls/table cells | 12–13px | `font.size.sm` |
| Default UI text | 14px | `font.size.md` |
| Section titles | 16px | `font.size.lg` |
| Page titles | 20–24px | `font.size.xl` / `font.size.2xl` |
| High-level headings | 30px | `font.size.3xl` |
| Body weight | 400 | `font.weight.regular` |
| Control weight | 500 | `font.weight.medium` |
| Heading weight | 600 | `font.weight.semibold` |
| Body line-height | approximately 1.4–1.6 | `font.lineHeight.relaxed` |
| Heading line-height | approximately 1.1–1.3 | `font.lineHeight.tight` |
| Tracking | compact negative tracking for large headings; positive tracking for uppercase labels | `font.tracking.heading`, `font.tracking.overline` |

### 1.3 Spacing and layout inventory

Observed values include 2, 4, 6, 8, 9, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, and 128px. Current source also uses Tailwind values such as `px-3`, `p-4`, `gap-3`, `py-5`, and `py-6`.

The normalized system uses a 4px base and keeps 8px/12px/16px as the most common compact-UI values.

| Use | Observed examples | Normalized target |
|---|---|---|
| Icon-to-label gap | 4–8px | `space.1`, `space.2` |
| Control internal padding | 8–12px | `space.2`, `space.3` |
| Related field gap | 12–16px | `space.3`, `space.4` |
| Toolbar group gap | 16–20px | `space.4`, `space.5` |
| Card section gap | 20–24px | `space.5`, `space.6` |
| Major section spacing | 32–48px | `space.8`, `space.12` |
| Desktop sidebar | 240px current | `layout.sidebar.expanded` |
| Compact sidebar | 64px proposed compact pattern | `layout.sidebar.compact` |

### 1.4 Elevation, borders, and shape inventory

| Property | Observed/current value | Normalization target |
|---|---|---|
| Control shadow | `0 1px 3px rgba(28,40,64,.04)` | `shadow.control` |
| Panel shadow | `0 4px 12px -2px rgba(24,41,75,.08)` | `shadow.panel` |
| Modal shadow | approximately `0 20px 60px rgba(0,0,0,.18)` | `shadow.modal` |
| Control border | 1px | `border.width.default` |
| Focus ring | 3–4px soft ring | `focus.ring.width`, `focus.ring.color` |
| Compact radius | 6px | `radius.sm` |
| Control radius | 8px | `radius.md` |
| Panel radius | 10–12px | `radius.lg` |
| Large surface radius | 16px | `radius.xl` |
| Pill/avatar radius | 9999px | `radius.full` |

---

## 2. Tier 1 — Primitive tokens

Primitive tokens describe reusable options only. They do not say whether a value is for a button, card, or sidebar.

### 2.1 Primitive token structure

```json
{
  "color": {
    "blue": {
      "50": "#EEF4FF",
      "100": "#DCE7FF",
      "500": "#266DF0",
      "600": "#215BC4",
      "700": "#19489B"
    },
    "neutral": {
      "0": "#FFFFFF",
      "25": "#FBFBFB",
      "50": "#F6F7F7",
      "100": "#EEEFF1",
      "200": "#E6E7EA",
      "300": "#D5D7DA",
      "500": "#898A8D",
      "700": "#505155",
      "950": "#101112"
    },
    "green": { "50": "#E9FFF5", "500": "#00A86B", "700": "#08734D" },
    "amber": { "50": "#FFF8E7", "500": "#CF8300", "700": "#8B5A00" },
    "red": { "50": "#FFF1F0", "500": "#EB3B3B", "700": "#A82B2B" }
  },
  "font": {
    "family": {
      "ui": "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      "code": "SFMono-Regular, Consolas, Liberation Mono, monospace"
    },
    "size": {
      "xs": "11px",
      "sm": "13px",
      "md": "14px",
      "lg": "16px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "30px"
    },
    "weight": { "regular": 400, "medium": 500, "semibold": 600 },
    "lineHeight": { "tight": 1.25, "normal": 1.45, "relaxed": 1.6 }
  },
  "spacing": {
    "0": "0px", "1": "4px", "2": "8px", "3": "12px", "4": "16px",
    "5": "20px", "6": "24px", "8": "32px", "10": "40px",
    "12": "48px", "16": "64px", "24": "96px", "32": "128px"
  },
  "radius": { "none": "0px", "sm": "6px", "md": "8px", "lg": "12px", "xl": "16px", "full": "9999px" },
  "border": { "width": { "default": "1px", "focus": "2px" }, "style": "solid" },
  "shadow": {
    "none": "none",
    "control": "0 1px 3px rgba(28, 40, 64, 0.04)",
    "panel": "0 4px 12px -2px rgba(24, 41, 75, 0.08)",
    "modal": "0 20px 60px rgba(0, 0, 0, 0.18)"
  },
  "motion": {
    "fast": "140ms",
    "standard": "200ms",
    "ease": "cubic-bezier(.4, .2, .2, 1)"
  }
}
```

### 2.2 Primitive normalization rules

- Use the nearest 4px spacing value; do not create a token for every one-off gap.
- Use `xs` only for metadata and helper text; normal UI text should be at least `sm` on desktop.
- Keep brand blue separate from semantic success/info blue so future brand changes do not recolor status feedback.
- Use the neutral scale for structure, not arbitrary grayscale values in components.
- Use radius by component class: `sm` for compact controls, `md` for inputs/buttons, `lg` for cards and panels, `full` for avatars/pills.
- Keep motion under 200ms for dense interactions and honor reduced-motion preferences.

---

## 3. Tier 2 — Semantic tokens

Semantic tokens express intent. Components should consume these tokens instead of primitives or raw hex values.

### 3.1 Light theme semantic map

```json
{
  "color": {
    "background": {
      "canvas": "{color.neutral.0}",
      "primary": "{color.neutral.0}",
      "subtle": "{color.neutral.25}",
      "muted": "{color.neutral.50}",
      "selected": "{color.blue.50}",
      "danger": "{color.red.50}"
    },
    "text": {
      "primary": "{color.neutral.950}",
      "secondary": "{color.neutral.700}",
      "muted": "{color.neutral.500}",
      "placeholder": "{color.neutral.500}",
      "on-brand": "{color.neutral.0}",
      "success": "{color.green.700}",
      "warning": "{color.amber.700}",
      "danger": "{color.red.700}"
    },
    "border": {
      "subtle": "{color.neutral.100}",
      "default": "{color.neutral.200}",
      "strong": "{color.neutral.300}",
      "focus": "{color.blue.500}",
      "danger": "{color.red.500}"
    },
    "interactive": {
      "primary": "{color.blue.500}",
      "primary-hover": "{color.blue.600}",
      "primary-pressed": "{color.blue.700}",
      "secondary-hover": "{color.neutral.50}",
      "selected": "{color.blue.50}",
      "focus-ring": "{color.blue.100}"
    },
    "status": {
      "success-bg": "{color.green.50}",
      "success-text": "{color.green.700}",
      "warning-bg": "{color.amber.50}",
      "warning-text": "{color.amber.700}",
      "danger-bg": "{color.red.50}",
      "danger-text": "{color.red.700}"
    }
  },
  "layout": {
    "sidebar-compact": "64px",
    "sidebar-expanded": "274px",
    "content-max": "1200px",
    "control-height": "32px"
  }
}
```

### 3.2 Dark-theme readiness

The semantic names must remain stable when dark mode is introduced. Only their primitive mappings change:

```json
{
  "color.background.canvas": "{color.neutral.950}",
  "color.background.primary": "#181A1B",
  "color.background.subtle": "#202326",
  "color.text.primary": "#F6F7F7",
  "color.text.secondary": "#D5D7DA",
  "color.border.default": "#3A3E43",
  "color.interactive.focus-ring": "{color.blue.100}"
}
```

Do not encode `light` or `dark` into component names. A `button.primary.bg` token should resolve differently by theme, while its component contract remains unchanged.

---

## 4. Tier 3 — Applied/component tokens

These tokens bind semantic intent to concrete component properties. A component may use only its component tokens in implementation code.

### 4.1 App shell and navigation

```json
{
  "shell.sidebar": {
    "width.compact": "{layout.sidebar-compact}",
    "width.expanded": "{layout.sidebar-expanded}",
    "bg": "{color.background.subtle}",
    "border": "{color.border.subtle}",
    "padding": "{spacing.2}",
    "item.height": "32px",
    "item.radius": "{radius.sm}",
    "item.text": "{color.text.secondary}",
    "item.text-active": "{color.text.primary}",
    "item.bg-active": "{color.interactive.selected}",
    "item.icon-size": "20px"
  },
  "shell.header": {
    "height": "56px",
    "bg": "{color.background.subtle}",
    "border": "{color.border.subtle}",
    "search.bg": "{color.background.primary}",
    "search.border": "{color.border.default}",
    "search.focus-border": "{color.border.focus}"
  }
}
```

### 4.2 Buttons

```json
{
  "button": {
    "height.sm": "32px",
    "height.md": "36px",
    "radius": "{radius.md}",
    "font": "{font.size.sm}",
    "font-weight": "{font.weight.medium}",
    "primary.bg": "{color.interactive.primary}",
    "primary.bg-hover": "{color.interactive.primary-hover}",
    "primary.text": "{color.text.on-brand}",
    "secondary.bg": "{color.background.primary}",
    "secondary.border": "{color.border.default}",
    "secondary.text": "{color.text.secondary}",
    "secondary.bg-hover": "{color.interactive.secondary-hover}",
    "ghost.text": "{color.text.secondary}",
    "ghost.bg-hover": "{color.interactive.secondary-hover}",
    "danger.bg": "{color.red.700}",
    "danger.text": "{color.text.on-brand}",
    "focus-ring": "{color.interactive.focus-ring}",
    "disabled.opacity": "0.45"
  }
}
```

Required state matrix: default, hover, pressed, focus-visible, disabled, loading, and icon-only. Icon-only buttons must expose an accessible name and tooltip.

### 4.3 Inputs, selects, and textareas

```json
{
  "input": {
    "height": "{layout.control-height}",
    "radius": "{radius.md}",
    "bg": "{color.background.primary}",
    "border": "{color.border.default}",
    "border-hover": "{color.border.strong}",
    "border-focus": "{color.border.focus}",
    "focus-ring": "{color.interactive.focus-ring}",
    "text": "{color.text.primary}",
    "placeholder": "{color.text.placeholder}",
    "label": "{color.text.primary}",
    "helper": "{color.text.muted}",
    "error-border": "{color.border.danger}",
    "error-text": "{color.text.danger}"
  }
}
```

### 4.4 Cards and panels

```json
{
  "card": {
    "bg": "{color.background.primary}",
    "border": "{color.border.default}",
    "radius": "{radius.lg}",
    "padding": "{spacing.5}",
    "shadow": "{shadow.panel}",
    "title": "{color.text.primary}",
    "description": "{color.text.secondary}"
  },
  "panel.subtle": {
    "bg": "{color.background.muted}",
    "border": "{color.border.subtle}",
    "radius": "{radius.md}",
    "padding": "{spacing.4}"
  }
}
```

### 4.5 Modals, menus, and popovers

```json
{
  "modal": {
    "backdrop": "rgba(16, 17, 18, 0.20)",
    "bg": "{color.background.primary}",
    "border": "{color.border.default}",
    "radius": "{radius.lg}",
    "shadow": "{shadow.modal}",
    "header-border": "{color.border.subtle}",
    "padding": "{spacing.6}"
  },
  "menu": {
    "bg": "{color.background.primary}",
    "border": "{color.border.default}",
    "radius": "{radius.md}",
    "shadow": "{shadow.panel}",
    "item-height": "32px",
    "item-hover": "{color.interactive.secondary-hover}",
    "item-selected": "{color.interactive.selected}"
  }
}
```

### 4.6 Status, badges, and review states

```json
{
  "badge.status": {
    "radius": "{radius.full}",
    "font": "{font.size.xs}",
    "font-weight": "{font.weight.semibold}",
    "success.bg": "{color.status.success-bg}",
    "success.text": "{color.status.success-text}",
    "warning.bg": "{color.status.warning-bg}",
    "warning.text": "{color.status.warning-text}",
    "danger.bg": "{color.status.danger-bg}",
    "danger.text": "{color.status.danger-text}"
  },
  "review.progress": {
    "step.size": "28px",
    "step.current-bg": "{color.interactive.primary}",
    "step.current-text": "{color.text.on-brand}",
    "step.complete-border": "{color.interactive.primary}",
    "connector": "{color.border.default}",
    "connector-complete": "{color.interactive.primary}"
  }
}
```

### 4.7 Tables and toolbars

```json
{
  "toolbar": {
    "height": "40px",
    "gap": "{spacing.2}",
    "control-height": "32px",
    "border": "{color.border.subtle}"
  },
  "table": {
    "header-bg": "{color.background.muted}",
    "row-bg": "{color.background.primary}",
    "row-hover": "{color.interactive.secondary-hover}",
    "row-selected": "{color.interactive.selected}",
    "divider": "{color.border.subtle}",
    "cell-padding-x": "{spacing.3}",
    "cell-padding-y": "{spacing.2}",
    "text": "{color.text.secondary}"
  }
}
```

---

## 5. Mapping examples: raw → primitive → semantic → applied

| Raw value/pattern | Primitive | Semantic | Applied token |
|---|---|---|---|
| `#266DF0` | `color.blue.500` | `color.interactive.primary` | `button.primary.bg`, `review.progress.step.current-bg` |
| `#215BC4` | `color.blue.600` | `color.interactive.primary-hover` | `button.primary.bg-hover` |
| `#FFFFFF` | `color.neutral.0` | `color.background.primary` | `card.bg`, `input.bg`, `modal.bg` |
| `#F6F7F7` | `color.neutral.50` | `color.background.muted` | `panel.subtle.bg`, `table.header-bg`, `sidebar.bg` |
| `#101112` | `color.neutral.950` | `color.text.primary` | `input.text`, `card.title`, `shell.header.title` |
| `#898A8D` | `color.neutral.500` | `color.text.muted` | `input.placeholder`, `shell.sidebar.helper` |
| `#E6E7EA` | `color.neutral.200` | `color.border.default` | `input.border`, `card.border`, `menu.border` |
| `6px` | `radius.sm` | — | `shell.sidebar.item.radius` |
| `8px` | `radius.md` | — | `button.radius`, `input.radius`, `menu.radius` |
| `12px` | `radius.lg` | — | `card.radius`, `modal.radius` |
| `0 4px 12px -2px rgba(...)` | `shadow.panel` | — | `card.shadow`, `menu.shadow` |
| `32px` control height | `layout.control-height` | — | `button.height.sm`, `input.height`, `toolbar.control-height` |

---

## 6. Typography scale logic

FollowPilot is a dense desktop product, so the scale should use a compact minor-third rhythm rather than large marketing jumps:

```text
11px  xs   metadata, keyboard hints, badges
13px  sm   controls, table cells, secondary UI
14px  md   default UI copy
16px  lg   section titles and emphasized content
20px  xl   page-level titles
24px  2xl  onboarding and major workspace headings
30px  3xl  only for high-level home/onboarding emphasis
```

Use weight before size for hierarchy inside dense screens. Use 400 for reading, 500 for controls, and 600 for headings. Use negative tracking only on large headings; use positive tracking for uppercase overlines and status labels.

## 7. Spacing scale rules

- Base unit: 4px.
- Related controls: 8px gap.
- Related fields: 12–16px gap.
- Unrelated sections: 24–32px gap.
- Page section rhythm: 40–48px.
- Compact toolbar controls: 32px high.
- Standard buttons: 32px compact, 36px comfortable.
- Keep page content centered within a maximum readable width; let data tables use the available surface width.

## 8. Recommended implementation architecture

```text
app/
  tokens/
    primitives.css          # raw scales only
    semantic.css             # light/dark role mappings
    components.css           # applied component bindings
  components/
    ui/
      Button/
      Input/
      Select/
      Card/
      Modal/
      Badge/
      Sidebar/
      Toolbar/
    meta.types.ts            # machine-readable component contract
    metadata/index.json      # component discovery index
```

Migration rules:

1. Introduce tokens before changing visual output.
2. Build `Button`, `Input`, and `Card` first because they appear across nearly every screen.
3. Replace raw hex values page by page with applied component tokens.
4. Keep semantic tokens stable across themes; only primitive mappings change.
5. Add component metadata for variants, relationships, accessibility, tokens, and anti-patterns.
6. Remove duplicated arbitrary Tailwind values only after the replacement component reaches visual parity.

## 9. Current implementation gap assessment

| Area | Current state | Priority |
|---|---|---|
| Base font and a few CSS variables | Exists in `app/globals.css` | Keep and expand |
| Reusable shell components | Partial: sidebar, header, account menu, providers | Medium |
| Primitive token scales | Not established | P0 |
| Semantic theme layer | Not established | P0 |
| Applied component tokens | Not established | P0 |
| Shared Button/Input/Card primitives | Not established | P0 |
| Component metadata for AI-readable usage | Not established | P1 |
| Visual regression/story surface | Not established | P1 |

The primary engineering risk is not missing colors; it is allowing each page to invent its own spacing, border, state, and component treatment. The token system should therefore be implemented as a dependency path:

```text
primitive → semantic → component → page
```

Pages should not skip directly from raw hex values to UI classes.

## 10. Verification checklist

- [ ] Every raw color in `app/` is either a primitive declaration or intentionally product-specific status color.
- [ ] Every shared component consumes applied/component tokens.
- [ ] FollowPilot themes resolve the same semantic token names if additional themes are added later.
- [ ] Buttons, inputs, cards, menus, modals, badges, and navigation expose all required states.
- [ ] Focus-visible contrast is at least 3:1 for controls and 4.5:1 for normal text.
- [ ] Compact sidebar preserves accessible labels and keyboard navigation.
- [ ] Reduced-motion behavior remains enabled.
- [ ] `npm run lint`, `npm run build`, and visual regression checks pass after migration.
