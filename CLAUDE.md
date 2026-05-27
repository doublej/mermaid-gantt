# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start dev server (usually port 5173)
bun run build    # Production build (writes to build/)
bun run check    # TypeScript + Svelte type checking
just cf-deploy   # Build + deploy to Cloudflare Pages (production)
```

## Deployment

Hosted on **Cloudflare Pages**. Project: `mermaid-gantt`. Production domain: `mermaidgantt.xyz` (Cloudflare DNS, proxied CNAME → `mermaid-gantt.pages.dev`).

```bash
just cf-deploy                # Production deploy (branch: main)
just cf-deploy-preview foo    # Preview deploy on branch "foo"
just cf-tail                  # Live deployment logs
```

Static build via `@sveltejs/adapter-static` → `build/`. Wrangler config in `wrangler.toml`.

## Architecture

Keyboard-first Gantt chart editor with Mermaid syntax import/export. Built with SvelteKit, Svelte 5 runes, and Tailwind CSS v4.

### Route Structure

```
src/routes/
├── +layout.svelte      # Root layout (theme provider)
├── +layout.ts          # Prerender config (static build)
├── +page.svelte        # Homepage (marketing/landing)
├── brand/
│   └── +page.svelte    # Brand guidelines
└── editor/
    └── +page.svelte    # Editor (creates stores, main app)
```

### Store Pattern

Five context-based stores created in `editor/+page.svelte` and accessed via `getXContext()`:

- **GanttStore** (`gantt-store.svelte.ts`): Core data (tasks, sections, config), view state, undo/redo history, clipboard. Uses `$state` and `$derived` runes.
- **KeyboardStore** (`keyboard-store.svelte.ts`): Keyboard bindings, modal states (command palette, help, import/export).
- **OnboardingStore** (`onboarding-store.svelte.ts`): Tutorial state, contextual hints.
- **PersistenceStore** (`persistence-store.svelte.ts`): localStorage persistence, project management, version history, autosave.
- **ThemeStore** (`theme-store.svelte.ts`): Light/dark/system theme, created in root layout.

### Data Model

```
GanttData
├── config: { title, dateFormat, axisFormat, excludes }
├── sections: [{ id, name, order }]
└── tasks: [{ id, title, sectionId, startDate, endDate, status, dependencies }]

ViewState
├── zoomLevel (index 0-4 into ZOOM_LEVELS)
├── selectedTaskId, focusedTaskId, editingTaskId
└── dateRangeStart, dateRangeEnd (null = auto-calculate)
```

### Component Hierarchy

```
editor/+page.svelte (creates stores, provides context)
├── KeyboardHandler (global keydown listener)
├── GanttChart (includes sidebar)
│   ├── GanttGrid (SVG: grid lines, weekend shading, today marker)
│   ├── GanttHeader (SVG: month/day labels)
│   ├── GanttDependency (SVG: connector arrows)
│   └── GanttTask (SVG: draggable task bars)
└── Modals (CommandPalette, ShortcutsHelp, TaskEditor, ImportExport, Tutorial, VersionHistory, FileBrowser)
```

### Mermaid Integration (src/lib/utils/)

- `mermaid-parser.ts`: Parses Mermaid Gantt syntax → `GanttData`
- `mermaid-exporter.ts`: Exports `GanttData` → Mermaid syntax

### Layout Constants (GanttChart.svelte)

```
ROW_HEIGHT = 40px
HEADER_HEIGHT = 48px
SIDEBAR_WIDTH = 200px
MIN_DAYS = 90 (3-month minimum timeline)

ZOOM_LEVELS (gantt-store.svelte.ts):
  Day:     60px/day
  Week:    20px/day
  2 Week:  10px/day
  Month:    4px/day
  Quarter: 1.5px/day
```

### Task Positioning

Task x/y positions are calculated from dates in `taskPositions` derived state. Section headers count as rows when computing vertical positions.

### Drag Implementation (GanttTask.svelte)

Three drag modes via invisible hit zones:
- Center drag → `moveTask(id, days)`
- Left edge → `moveTaskStart(id, days)`
- Right edge → `moveTaskEnd(id, days)`

Snaps to `dayWidth` grid (derived from zoom level). Shows ghost at original position during drag.


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
