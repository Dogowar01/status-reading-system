# STATUS — the Reading System

A reading companion for LitRPG / grimdark readers that is **itself a LitRPG**. Log the
books you read; each session and finished book grants XP and levels a character. Five
behavioural axes grow from *what* and *how* you read, and once your reading has a legible
shape the System reveals your **class** in a ceremonial box.

No accounts. No backend. No AI. No network dependency. Runs fully offline from first load.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire app — UI, game logic, rendering, persistence. Vanilla JS, no build step. |
| `sw.js` | Service worker. Network-first for the page (so deploys ship), cache-first for assets (offline). |
| `manifest.webmanifest` | PWA manifest — makes the app installable. |
| `icon.svg`, `icon-maskable.svg` | App icons (geometric sigil). |

## Run locally

It's a static site — serve the folder with anything:

```sh
npx serve .
# or
python -m http.server 5173
```

Then open the served URL. (Opening `index.html` via `file://` works for the app itself,
but the service worker / install prompt require `http(s)`.)

## Deploy to GitHub Pages

1. Push these files to the repo root (or a `/docs` folder).
2. Settings → Pages → deploy from branch → root.
3. Done. The app is installable from the browser's install prompt.

The service worker uses **network-first for the page**, so a new deploy is picked up on the
next load when online — no stale-cache trap. Bump `CACHE` in `sw.js` if you ever need to
force-evict cached assets.

## Persistence & backup

The save lives in `localStorage` only. The in-app menu (≡) offers **Export / Import JSON** —
a level-30 character survives a cleared cache by exporting the save file. The save stores only
*raw inputs* (books + sessions); level, XP, axes, class, titles and streak are all **derived
deterministically** on load, so imports and edits are always consistent.

## Tuning

All gameplay numbers live in the `CONFIG` object at the top of the `<script>` in `index.html`
(XP formulas, level curve, class threshold, streak grace, title requirements). The class
taxonomy (`CLASSES`), titles (`TITLES`), achievements (`ACHIEVEMENTS`), genre list (`GENRES`)
and worldbuilding weights (`LORE_WEIGHT`) are all data-driven and built to be extended.

### Titles vs. Achievements
- **Titles** are *identity* badges earned for behavioural patterns (e.g. The Unflinching,
  Loremaster). They show on the sheet and the shareable card.
- **Achievements** are countable *milestones* with progress bars, shown in the **Codex** tab.
  Each grants a one-time XP reward on unlock. Add one by appending to `ACHIEVEMENTS`: give it
  an `id`, `name`, `desc`, `xp`, and `p:(ctx) => [current, target]`. Unlocked when
  `current >= target`. XP is folded into the derived total, so it stays consistent on
  import/edit. To add a new metric, extend the object returned by `computeContext()`.

### The five axes
- **Depth** — notes left, rereads, loyalty to one author/series.
- **Range** — spread across distinct genres.
- **Momentum** — finish rate, streak, recent activity.
- **Tone** — running average of the Cosy↔Grimdark lean (identity, not a score).
- **Lore** — proportion of heavy-worldbuilding reads.

## Out of scope for v1 (Phase 2 backlog)

Open Library lookup (via a Cloudflare Worker proxy), seeded genre catalogue, generated book
sigils, daily quests, axis-history charts, tone-driven theming.
