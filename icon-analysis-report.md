# Icon Analysis Report: Mermaid Gantt Project

## Current Icon Usage Summary

Your codebase currently uses a **custom-built icon system** with no external icon libraries. All icons are implemented using Unicode characters and inline SVGs.

---

## 1. Unicode Characters Used as Icons

| Icon | Unicode | Name | Usage Location | Purpose |
|------|---------|------|----------------|---------|
| ✎ | U+270E | Pencil | `GanttTask.svelte:148` | Edit action in context menu |
| ⋰ | U+22F0 | Rising Dots | `GanttTask.svelte:153` | Duplicate/copy action |
| ● | U+25CF | Black Circle | `GanttTask.svelte:159,167` | Color picker bullet |
| 🗑 | U+1F5D1 | Wastebasket | `GanttTask.svelte:176` | Delete action |
| ✓ | U+2713 | Check Mark | `+page.svelte:280,289,304`, `KeyDetector.svelte:149` | Feature checkmark, success indicator |
| ✗ | U+2717 | Ballot X | `+page.svelte:292,295,298,307,310,313` | Feature unavailable indicator |
| → | U+2192 | Right Arrow | `+page.svelte:400-420`, `ContextMenu.svelte:146` | Navigation, submenu indicator |
| ← | U+2190 | Left Arrow | `tutorial/+page.svelte:128`, `templates/+page.svelte:129` | Back navigation |
| ↑ | U+2191 | Up Arrow | `+page.svelte:111`, `keyboard-store.svelte.ts:210` | Navigation, sorting |
| ↓ | U+2193 | Down Arrow | `+page.svelte:111`, `keyboard-store.svelte.ts:211` | Navigation, sorting |

---

## 2. Inline SVG Icons

All SVG icons follow a consistent style: `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"`, `stroke-width="2"`.

### Editor Toolbar Icons (`/src/routes/editor/+page.svelte`)
- **Layout Grid** - Toggle grid view
- **Moon** - Dark theme toggle
- **Sun** - Light theme toggle
- **Undo Arrow** - Undo operation
- **Redo Arrow** - Redo operation
- **Clock** - Version history
- **Question Mark** - Help/shortcuts

### Feature Icons (`/src/routes/+page.svelte`)
- **Keyboard** - Keyboard shortcuts feature
- **Code Brackets** - Syntax highlighting feature
- **Bar Chart** - Data visualization feature
- **Lock** - Security/privacy feature

### UI Component Icons
| Component | Icon | Purpose |
|-----------|------|---------|
| `ClipboardToast.svelte` | Clipboard | Copy confirmation |
| `ColorPicker.svelte` | Checkmark | Color selection |
| `TagInput.svelte` | X, Plus | Remove/add tags |
| `GanttChart.svelte` | Chevron | Collapse/expand sections |
| `FileBrowser.svelte` | Folder | Project folders |
| `FileDropZone.svelte` | Upload Cloud | Drag & drop area |
| `ImportExport.svelte` | Lightning Bolt | Smart import feature |
| `SmartImport.svelte` | Calendar, Warning Triangle | Date range, warnings |

---

## 3. Brand/Logo SVG Components

Located in `/src/lib/components/brand/`:

| Component | Description | ViewBox |
|-----------|-------------|---------|
| `Logo.svelte` | Main logo | 24x24 |
| `Logo-V2.svelte` | Version 2 | 24x24 |
| `Logo-V3.svelte` | Version 3 | 24x24 |
| `Logo-Pro.svelte` | Premium variant | 24x24 |
| `Logo1-Bars.svelte` | Bar chart style | 32x32 |
| `Logo2-Flow.svelte` | Flow/connection style | - |
| `Logo3-Wave.svelte` | Wave style | 32x32 |
| `Logo4-Bracket.svelte` | Code bracket style | - |
| `Logo5-Grid.svelte` | Grid pattern | 32x32 |

---

## 4. Icon-Related CSS Classes

```css
.feature-icon    /* Feature section containers */
.check-icon      /* Checkmark styling */
.x-icon          /* X mark styling */
.menu-icon       /* Context menu icons (1rem × 1rem) */
.menu-arrow      /* Submenu arrow indicator */
.toast-icon      /* Toast notification icons */
.drop-icon       /* Drag & drop zone icon (4rem × 4rem) */
.banner-icon     /* Import banner icons */
.stat-icon       /* Statistics display icons */
.project-icon    /* Project folder icons */
.chevron-icon    /* Collapse/expand chevrons */
```

---

## 5. Icon Type Definition

From `/src/lib/types.ts`:

```typescript
export interface MenuItem {
  label?: string;
  icon?: string;        // Icon character/emoji string
  iconColor?: string;   // Hex color for icon
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
  submenu?: MenuItem[];
}
```

---

# Optimal Icon Set Recommendation for Svelte

## 🏆 Top Recommendation: Lucide Icons

**Why Lucide is the best choice for your project:**

### Perfect Match for Your Current Icons

Your inline SVGs already follow the same design principles as Lucide:
- 24x24 viewBox ✓
- 2px stroke width ✓
- `stroke="currentColor"` ✓
- `fill="none"` ✓
- Round stroke caps and joins ✓

This means **zero visual disruption** when migrating.

### Native Svelte 5 Support

```bash
npm install @lucide/svelte
```

Lucide is the **only major icon library** with a dedicated Svelte 5 package (`@lucide/svelte`).

### Tree-Shaking & Performance

- Only imported icons are bundled
- Each icon is a native Svelte component
- Smaller bundle size than your current inline SVGs
- TypeScript support included

### Usage Example

```svelte
<script>
  import { Pencil, Copy, Trash2, Check, X, ChevronDown } from '@lucide/svelte';
</script>

<Pencil size={16} />
<Copy size={16} />
<Trash2 size={16} class="text-red-500" />
```

### Direct Mapping of Your Current Icons

| Current Icon | Lucide Equivalent | Import |
|--------------|-------------------|--------|
| ✎ (edit) | `Pencil` | `import { Pencil } from '@lucide/svelte'` |
| ⋰ (duplicate) | `Copy` | `import { Copy } from '@lucide/svelte'` |
| 🗑 (delete) | `Trash2` | `import { Trash2 } from '@lucide/svelte'` |
| ✓ (check) | `Check` | `import { Check } from '@lucide/svelte'` |
| ✗ (x mark) | `X` | `import { X } from '@lucide/svelte'` |
| → (arrow right) | `ArrowRight` or `ChevronRight` | `import { ArrowRight } from '@lucide/svelte'` |
| ← (arrow left) | `ArrowLeft` or `ChevronLeft` | `import { ArrowLeft } from '@lucide/svelte'` |
| ↑ (arrow up) | `ArrowUp` or `ChevronUp` | `import { ArrowUp } from '@lucide/svelte'` |
| ↓ (arrow down) | `ArrowDown` or `ChevronDown` | `import { ArrowDown } from '@lucide/svelte'` |
| ● (color dot) | `Circle` | `import { Circle } from '@lucide/svelte'` |
| Grid layout | `LayoutGrid` | `import { LayoutGrid } from '@lucide/svelte'` |
| Moon | `Moon` | `import { Moon } from '@lucide/svelte'` |
| Sun | `Sun` | `import { Sun } from '@lucide/svelte'` |
| Undo | `Undo2` | `import { Undo2 } from '@lucide/svelte'` |
| Redo | `Redo2` | `import { Redo2 } from '@lucide/svelte'` |
| Clock/History | `Clock` or `History` | `import { Clock } from '@lucide/svelte'` |
| Help | `HelpCircle` | `import { HelpCircle } from '@lucide/svelte'` |
| Keyboard | `Keyboard` | `import { Keyboard } from '@lucide/svelte'` |
| Code | `Code` | `import { Code } from '@lucide/svelte'` |
| Chart | `BarChart3` | `import { BarChart3 } from '@lucide/svelte'` |
| Lock | `Lock` | `import { Lock } from '@lucide/svelte'` |
| Clipboard | `Clipboard` | `import { Clipboard } from '@lucide/svelte'` |
| Folder | `Folder` | `import { Folder } from '@lucide/svelte'` |
| Upload | `Upload` or `CloudUpload` | `import { Upload } from '@lucide/svelte'` |
| Lightning | `Zap` | `import { Zap } from '@lucide/svelte'` |
| Calendar | `Calendar` | `import { Calendar } from '@lucide/svelte'` |
| Warning | `AlertTriangle` | `import { AlertTriangle } from '@lucide/svelte'` |
| Plus | `Plus` | `import { Plus } from '@lucide/svelte'` |

---

## Alternative Options

### Phosphor Icons
- **9,000+ icons** with 6 weight variants (thin, light, regular, bold, fill, duotone)
- Best for projects needing style flexibility
- Install: `npm install phosphor-svelte`
- ⚠️ Svelte 5 support via wrapper (not native)

### Heroicons
- **450+ icons** in outline, solid, mini, micro styles
- Perfect if you're heavily using Tailwind CSS
- Install: `npm install @heroicons/svelte`
- ⚠️ Svelte 5 support via wrapper (not native)

---

## Comparison Table

| Criteria | Lucide | Phosphor | Heroicons |
|----------|--------|----------|-----------|
| Icon Count | 1,500+ | 9,000+ | 450+ |
| Svelte 5 Native | ✅ Yes | ❌ Wrapper | ❌ Wrapper |
| Style Variants | Stroke only | 6 weights | 4 styles |
| Tree-Shaking | ✅ Excellent | ✅ Good | ✅ Good |
| TypeScript | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| Design Match | ✅ Perfect | ⚠️ Different | ⚠️ Different |
| Bundle Size | Smallest | Medium | Small |
| MIT License | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Installation & Migration Guide

### Step 1: Install Lucide

```bash
npm install @lucide/svelte
```

### Step 2: Create an Icon Wrapper Component (Optional)

```svelte
<!-- src/lib/components/ui/Icon.svelte -->
<script lang="ts">
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
  export let size: number = 16;
  export let color: string = 'currentColor';
  export let strokeWidth: number = 2;
</script>

<svelte:component
  this={icon}
  {size}
  {color}
  stroke-width={strokeWidth}
  class="inline-block"
/>
```

### Step 3: Update Context Menu Items

```typescript
// Before (using Unicode)
const menuItems = [
  { label: 'Edit', icon: '✎' },
  { label: 'Delete', icon: '🗑' }
];

// After (using Lucide)
import { Pencil, Trash2 } from '@lucide/svelte';

const menuItems = [
  { label: 'Edit', icon: Pencil },
  { label: 'Delete', icon: Trash2 }
];
```

### Step 4: Replace Inline SVGs

```svelte
<!-- Before -->
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
</svg>

<!-- After -->
<script>
  import { Sun } from '@lucide/svelte';
</script>

<Sun size={20} />
```

---

## Summary

**Lucide Icons** is the optimal choice for your Mermaid Gantt project because:

1. **Native Svelte 5 support** - The only major library with a dedicated `@lucide/svelte` package
2. **Design consistency** - Matches your existing inline SVG style (24x24, 2px stroke, round joins)
3. **Performance** - True tree-shaking, smaller bundle than inline SVGs
4. **1,500+ icons** - Covers all your current needs with room to grow
5. **TypeScript support** - Built-in type definitions
6. **Active development** - Regular updates and community support
7. **MIT License** - Free for commercial use

---

## Sources

- [Best Svelte Icon Libraries for 2025 - Lineicons](https://lineicons.com/blog/svelte-icon-libraries)
- [Lucide Svelte Documentation](https://lucide.dev/guide/packages/lucide-svelte)
- [lucide-svelte on npm](https://www.npmjs.com/package/lucide-svelte)
- [Lucide Icon Comparison Guide](https://lucide.dev/guide/comparison)
- [Best Svelte Icon Libraries - DEV Community](https://dev.to/masumparvej/best-svelte-icon-libraries-in-2025-co9)
