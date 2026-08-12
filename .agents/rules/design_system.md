# Rule: Design System & Visual Architecture Baseline (LicitApp v2 / CR24 V3)

## Overview
This codebase enforces a strictly unified Light Minimalist Design System. All future developments, component updates, and refactoring MUST strictly adhere to the rules, color tokens, typography rules, and fluid layout contracts outlined below.

---

## 🎨 1. Color Palette & Design Tokens
NEVER introduce dark theme background utility classes (e.g. `bg-zinc-950`, `bg-zinc-900`, `border-zinc-800`, `text-zinc-100`). All interfaces MUST use the official Light Minimalist token palette:

- **Global Page Background**: `#F5F6F8`
- **Cards & Surfaces**: `#FFFFFF`
- **Primary Accent / Brand**: `#2B3A67` (Dark Navy Blue)
- **Secondary Accent / Success / Gold**: `#C9A227` (Gold for profit/margins), `#2F7D5A` (Emerald green for won/active)
- **Primary Ink / Headings**: `#131A2C`
- **Subtext / Muted**: `#5B6478` (Body subtext), `#8A93A6` (Field labels), `#A6ADBB` (Muted timestamps)
- **Borders**: `#EDEFF3` (Primary subtle border), `#DDE1E8` (Input border)
- **Alert / Danger**: `#B3261E` (Red text), `#FBE7E6` (Red background)

---

## 🔤 2. Typography Triad
Always use the 3 Google Fonts defined in `src/index.css`:

1. **Space Grotesk** (`font-display` / `font-bold`):
   - Reserved for section headers, modal titles, brand names, and card titles (`style={{ fontFamily: "'Space Grotesk',sans-serif" }}`).
2. **Inter** (`font-sans`):
   - Standard font for all UI body text, buttons, form placeholders, and descriptions.
3. **IBM Plex Mono** (`font-mono`):
   - Mandatory for all numerical data, monetary amounts (`fmtMoney`), RUTs, record IDs, dates, quantities, and version numbers.

---

## 🧩 3. Atomic UI Components (Single Source of Truth)
Do NOT write ad-hoc styled `<button>`, `<input>`, or `<select>` tags in feature components. Always import and use the atomic UI components from `src/components/ui/Components.jsx`:

- `PrimaryBtn`: `#2B3A67` background with white text, minimum height 42px.
- `GhostBtn`: `#FFFFFF` background with `#DDE1E8` border, minimum height 38px.
- `IconBtn`: Padding 1.5, `#A6ADBB` text with hover effect.
- `TextInput`, `TextArea`, `Select`: `#DDE1E8` border, `#131A2C` text.
- `Badge`: Pill badges using HSL/tailored colors.
- `Field`: Standardized form field container with uppercase muted label.
- `Empty`: Dashed border empty state indicator.
- `SourcingBar`: Interactive multi-provider allocation progress bar.
- `ConfirmProvider` / `useConfirm`: Mandatory modal hook for all delete confirmation dialogs.

---

## 📐 4. Fluid Layout & Vertical Sidebar Rules
- **Full Screen Width**: The main container in `App.jsx` MUST span 100% of the screen width (`w-full`). NEVER add fixed container constraints like `max-w-[1400px]` or `mx-auto` to main section containers.
- **Left Vertical Sidebar**: Navigation is handled exclusively by the left vertical sidebar in `Header.jsx`:
  - Web Mode: Fixed to left. Unpinned = `w-16` (icons only). Pinned (`isPinned`) = `w-56` (expanded).
  - Dynamic Workspace Padding: `<main>` in `App.jsx` MUST dynamically adjust `md:pl-60` when `isPinned` is true, and `md:pl-20` when `isPinned` is false.
  - Mobile Mode (`< md`): Triggered via 3-line hamburger menu button in top bar.
- **Master-Detail Layout**: In `licitaciones`, the grid uses `grid-cols-1 md:grid-cols-[330px_1fr]`. The right detail panel `LicitacionMasterDetail` MUST fluidly flex to fill all available horizontal space.

---

## 🚫 5. Main Navigation Scope
The main navigation is strictly limited to 4 core sections:
1. `licitaciones` (Licitaciones)
2. `clientes` (Clientes)
3. `proveedores` (Proveedores)
4. `configuracion` (Configuración)

Price inquiries (*Consultas*), PDF estimates (*Cotizaciones*), and attachments (*Anexos*) MUST remain embedded contextually inside the Licitación & Ítem master-detail views and NEVER re-added as standalone navigation tabs.
