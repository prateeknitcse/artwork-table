# Art Institute of Chicago — Collection Table

A React/TypeScript/Vite app 
## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Key Technical Decisions

### Selection Strategy

The app uses an **`include` mode with `Set<number>` of selected IDs** — never storing full row objects.

- `selectedIds: Set<number>` — tracks only the IDs of selected rows
- On every page change, the current page's artworks are re-fetched from the API (server-side pagination)
- The current page's selected rows are derived by filtering: `artworks.filter(a => selectedIds.has(a.id))`
- This means selections persist across pages automatically with zero memory of full objects

### Custom Row Selection (N rows from top)

When the user inputs N in the overlay:

1. `selectedIds` is cleared
2. `pendingSelectCount = N` is set
3. App navigates to page 1
4. As each page loads, rows are auto-selected up to the remaining quota
5. **No prefetching** — rows are only selected when the user sees them (or when they'd naturally load)

This satisfies the requirement: **no multi-page prefetching, no storing other-page row objects**.

## Features

- ✅ Vite + React + TypeScript
- ✅ PrimeReact DataTable
- ✅ Server-side pagination
- ✅ Persistent cross-page row selection
- ✅ Custom N-row selection via overlay (no prefetching)
- ✅ Select/deselect all on current page
- ✅ Clean gold-on-dark museum aesthetic
