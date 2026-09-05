# Roger Raker — build conventions

Read this before writing any component. Everything here is already implemented in
`src/app/globals.css`, `src/lib/*`, and `src/components/ui/*` — reuse it, don't reinvent it.

## The concept: a grading suite

Roger Raker is a Filipino filmmaker and YouTuber (1.52M subscribers, uploading
since November 2010) who sells the editing and colour tools he uses. The visual
system borrows the vernacular of an edit suite — hairline panels, LUT ramp
strips, before/after frame references — because that is literally the subject
matter. It is not decoration: a device earns its place only if it encodes
information, and only if it means something to a creator, not to a colourist.

## Tokens (Tailwind v4 `@theme`, use as normal classes)

| Token | Value | Use |
|---|---|---|
| `void` | `#08080a` | page ground |
| `panel` / `panel-2` | `#0e0f12` / `#131419` | raised surfaces |
| `stroke` / `stroke-strong` | `#1f1f23` / `#2c2c33` | hairlines, borders |
| `ink` / `muted` / `faint` | `#f5f5f7` / `#a1a1aa` / `#6b6b75` | text hierarchy |
| `cyan` | `#22d3ee` | the single accent — CTAs, active states, focus |
| `ember` | `#ff6a3d` | scopes and "before" states ONLY. Never a second brand color. |

Classes: `bg-void text-ink border-stroke text-muted text-cyan` etc.

## Utility classes already defined

- `.display` — Archivo, wdth 112, wght 700, tracking -0.035em, line-height .92. Headlines.
- `.display-tight` — Archivo wdth 88, wght 600. Sub-headings, nav, buttons, table headers.
- `.label` — small Archivo label, `text-faint`. **Sentence case, never ALL CAPS.**
- `.tnum` — tabular numerals. Use on any number: prices, counts, metrics, timecode.
- `.panel` — panel background + hairline border.
- `.glass` — glassmorphic surface (the secondary CTA style).
- `.glow-cyan` — cyan ring + drop glow.
- `.grain` — attaches a film-grain layer via `::before` (parent needs `relative`).
- `.hairline` — 1px top rule.
- `.shell` — page container: max-w 1360, responsive gutters. Use on every section.
- `.no-scrollbar` — hides scrollbars on horizontal rails.

## Rules

1. **One accent.** Cyan carries emphasis. Ember appears only inside grading
   instruments (scope meters, the "before" half of a comparison).
2. **No emoji anywhere.** Icons come from `lucide-react` only, `size={16}`-ish,
   `strokeWidth={1.5}`.
3. **No ALL-CAPS eyebrows**, no `A · B · C` middot strings, no `→` glued onto
   button labels, no numbered `01 / 02 / 03` markers unless the content is a
   genuine sequence (only the About process list is).
4. **Motion is earned.** The hero has one orchestrated moment. Everything else
   responds to input (hover, drag, filter, open). No fade-up-on-scroll on every
   section. `prefers-reduced-motion` is already handled globally in CSS; if you
   add JS motion, gate it on `useReducedMotion()` from `motion/react`.
5. **Radius is 2px** (`rounded-[2px]`) on interactive surfaces. Images are square.
   Nothing is a pill except a switch.
6. Borders do the work that shadows would. Only `.glow-cyan` casts light.
7. Line length under ~72ch for body copy (`max-w-[62ch]`).
8. Copy is sentence case, active voice, and specific. Never "Lorem", never
   "Discover our amazing solutions".
9. **One spacing scale.** Sections are `py-20 md:py-28`. A heading is followed
   by its content at `mt-8 md:mt-10`. Blocks inside a section separate at
   `mt-14 md:mt-16`. No ad-hoc `mt-32`, no empty hero-sized gaps.
10. **One display scale.** Only the hero `h1` gets the big clamp. Section
   headings are `.display text-[clamp(1.75rem,3.2vw,2.75rem)]`; block headings
   are `.display-tight` at 19-21px. Body copy is 15px at `leading-[1.75]`, and
   copy that carries meaning uses `text-ink/80`, not `text-muted`.
11. **Grids always fill.** Choose counts that divide by the column counts you
   ship (six items across 1/2/3 columns). Never leave an orphan card.

## Imports

- Motion: `import { motion, AnimatePresence, useReducedMotion } from "motion/react"`
- Icons: `import { Play, ArrowUpRight } from "lucide-react"`
- UI: `@/components/ui/button` (`Button`, `ButtonLink` — variants
  `primary | glass | outline | ghost | danger`, sizes `sm | md | lg | icon`),
  `@/components/ui/field` (`Input`, `Textarea`, `Select`, `Label`, `Field`),
  `@/components/ui/badge` (`Badge`, tones `default | cyan | ember | muted | success`),
  `@/components/ui/panel` (`Panel`, `PanelHeader`), `@/components/ui/switch` (`Switch`)
- Data: `@/lib/queries` (server only), types from `@/lib/types`,
  helpers `cn`, `formatPrice`, `formatDate`, `slugify` from `@/lib/utils`
- Server actions live in `@/lib/actions/*`. Form actions use
  `useActionState(action, idleState)` from React with the `ActionState` shape
  `{ ok, error?, message?, fieldErrors? }` exported from `@/lib/actions/shared`.

## Data

Postgres, accessed through `src/lib/queries.ts`. Server Components fetch; client
components receive props. Never import `@/lib/db` or `@/lib/queries` from a
`"use client"` file. Images are Roger's own YouTube thumbnails and channel
avatar — always `next/image` with `sizes`, and the hosts are already allowed in
`next.config.ts`. A few older uploads only exist at `mqdefault` (320x180); every
image box is 16:9 so those fill the frame rather than letterboxing.

## Shared components (exact signatures — do not redefine)

```ts
// src/components/site/product-card.tsx
export function ProductCard(props: { product: Product; className?: string }): JSX.Element
// src/components/site/project-card.tsx
export function ProjectCard(props: { project: Project; priority?: boolean; className?: string }): JSX.Element
// src/components/site/section-head.tsx
export function SectionHead(props: { index: string; title: string; intro?: string; action?: React.ReactNode }): JSX.Element
// src/components/site/lut-ramp.tsx — the colour signature of a look
export function LutRamp(props: { stops?: string[] | null; className?: string; label?: string }): JSX.Element
```
