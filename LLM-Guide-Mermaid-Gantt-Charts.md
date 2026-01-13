# LLM Guide to Generating Mermaid Gantt Charts

A comprehensive reference for generating accurate, well-structured Mermaid Gantt charts compatible with this editor's parser.

## Basic Structure

Every Mermaid Gantt chart starts with the `gantt` declaration followed by configuration and tasks:

```mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD

    section Phase 1
    Task 1 :a1, 2024-01-01, 30d
    Task 2 :a2, after a1, 20d
```

## Configuration Options

### Date Formats

Always specify a `dateFormat`. Supported formats:

| Format | Example | Notes |
|--------|---------|-------|
| `YYYY-MM-DD` | 2024-01-15 | **Recommended** - ISO standard |
| `DD/MM/YYYY` | 15/01/2024 | European format |

**Important:** The parser matches format length exactly, so dates must have the same character count as the format string.

### Axis Format

Controls how dates display on the chart axis:

```mermaid
gantt
    title Project Plan
    dateFormat YYYY-MM-DD
    axisFormat %b %d
```

**Common `axisFormat` patterns:**
- `%Y-%m-%d` — Full date (2024-01-15)
- `%b %d` — Month abbrev + day (Jan 15)
- `%d %b` — Day + month abbrev (15 Jan)
- `%B %Y` — Full month + year (January 2024)

### Excluding Days

```mermaid
gantt
    excludes weekends
    excludes 2024-12-25, 2024-01-01
```

Multiple values are comma-separated.

## Task Syntax

### Complete Task Format

```
Task name :status, alias, start, duration
```

The order is fixed: **status** (optional), **alias** (optional), **start** (required), **duration** (required).

### Task Statuses

| Status | Keyword | Rendering |
|--------|---------|-----------|
| Default | (omit) | Normal bar |
| Active | `active` | Highlighted/bold |
| Done | `done` | Grayed out |
| Critical | `crit` | Red/highlighted |
| Milestone | `milestone` | Diamond marker |

**Note:** Unlike standard Mermaid, this parser does NOT support combined statuses (e.g., `done, crit`). Use only one status per task.

### Examples with Status

```mermaid
gantt
    dateFormat YYYY-MM-DD

    section Examples
    Completed task    :done, t1, 2024-01-01, 10d
    In progress       :active, t2, after t1, 5d
    Critical path     :crit, t3, after t2, 7d
    Key milestone     :milestone, m1, 2024-02-01, 0d
    Normal task       :t4, 2024-02-15, 14d
```

### Start Date Options

```mermaid
gantt
    dateFormat YYYY-MM-DD

    section Start Types
    Absolute date      :t1, 2024-01-01, 10d
    After another task :t2, after t1, 5d
```

**Important:** Only single dependencies are supported. `after t1 t2` (multiple dependencies) is NOT parsed correctly.

### Duration Units

| Unit | Suffix | Example |
|------|--------|---------|
| Days | `d` | `10d` |
| Weeks | `w` | `2w` (= 14 days) |
| Hours | `h` | `48h` (= 2 days) |

You can also specify an absolute end date instead of duration:

```mermaid
gantt
    dateFormat YYYY-MM-DD

    section Duration Examples
    Ten days    :2024-01-01, 10d
    Two weeks   :2024-01-15, 2w
    End date    :2024-02-01, 2024-02-15
```

**Note:** Minutes (`m`) are NOT supported by this parser.

## Sections

Sections group related tasks visually:

```mermaid
gantt
    title Software Development
    dateFormat YYYY-MM-DD

    section Planning
    Requirements    :done, req, 2024-01-01, 14d
    Design          :done, des, after req, 21d

    section Development
    Backend         :active, back, after des, 60d
    Frontend        :front, after des, 45d

    section Testing
    QA Testing      :qa, after back, 30d
```

Tasks without a preceding `section` declaration will be grouped under "Uncategorized" on export.

## Milestones

Milestones are zero-duration markers. Use either:

```mermaid
gantt
    dateFormat YYYY-MM-DD

    section Project
    Phase 1 Complete :milestone, m1, 2024-03-01, 0d
```

The `milestone` status with `0d` duration creates a diamond marker.

## Dependencies

### Single Dependency

```mermaid
gantt
    dateFormat YYYY-MM-DD

    Task A :a, 2024-01-01, 10d
    Task B :b, after a, 5d
    Task C :c, after b, 7d
```

Dependencies create a chain where each task starts after its predecessor ends (plus 1 day).

**Limitation:** Multiple dependencies (`after a b`) are NOT supported by this parser. Each task can only depend on one other task.

## Data Model Reference

The parser converts Mermaid syntax into this data structure:

```typescript
interface GanttData {
    config: {
        title: string;
        dateFormat: string;      // e.g., 'YYYY-MM-DD'
        axisFormat: string;      // e.g., '%Y-%m-%d'
        excludes: string[];      // e.g., ['weekends', '2024-01-15']
    };
    sections: Array<{
        id: string;
        name: string;
        order: number;
    }>;
    tasks: Array<{
        id: string;
        title: string;
        sectionId: string | null;
        startDate: Date;
        endDate: Date;
        status: 'active' | 'done' | 'crit' | 'milestone' | null;
        dependencies: string[];  // task IDs
        isMilestone: boolean;
        // ... additional fields for UI (color, tags, notes, etc.)
    }>;
}
```

## Common Patterns

### Project Timeline Template

```mermaid
gantt
    title Project Name
    dateFormat YYYY-MM-DD
    axisFormat %b %d
    excludes weekends

    section Initiation
    Project Charter     :done, charter, 2024-01-01, 5d
    Stakeholder Analysis:done, stake, after charter, 3d
    Kickoff Meeting     :milestone, kick, after stake, 0d

    section Planning
    Requirements        :active, req, after kick, 10d
    Technical Design    :design, after req, 15d
    Planning Complete   :milestone, plan, after design, 0d

    section Execution
    Sprint 1            :s1, after plan, 14d
    Sprint 2            :s2, after s1, 14d
    Sprint 3            :s3, after s2, 14d

    section Closure
    Testing             :test, after s3, 10d
    Deployment          :crit, deploy, after test, 5d
    Go Live             :milestone, golive, after deploy, 0d
```

### Sprint Planning Template

```mermaid
gantt
    title Sprint Planning
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Sprint 1
    Planning     :sp1p, 2024-01-01, 1d
    Development  :sp1d, after sp1p, 8d
    Review       :sp1r, after sp1d, 1d

    section Sprint 2
    Planning     :sp2p, after sp1r, 1d
    Development  :sp2d, after sp2p, 8d
    Review       :sp2r, after sp2d, 1d
```

### Parallel Workstreams

Since multiple dependencies aren't supported, model parallel work with explicit dates:

```mermaid
gantt
    title Parallel Development
    dateFormat YYYY-MM-DD

    section Backend
    API Design       :api, 2024-01-01, 10d
    Database Setup   :db, after api, 7d
    API Development  :apidev, after db, 20d

    section Frontend
    UI Design        :ui, 2024-01-01, 14d
    Components       :comp, after ui, 10d
    Pages            :pages, after comp, 20d

    section Integration
    Integration      :int, 2024-02-25, 10d
    Testing          :e2e, after int, 7d
```

## Critical Rules for Accurate Generation

### 1. Always Include Required Elements

```mermaid
gantt
    dateFormat YYYY-MM-DD

    Task Name :alias, 2024-01-01, 5d
```

Minimum required: `gantt`, `dateFormat`, and at least one task.

### 2. Task Aliases Must Be Unique

```mermaid
gantt
    dateFormat YYYY-MM-DD

    Task One :t1, 2024-01-01, 5d
    Task Two :t2, after t1, 5d
```

Each alias is used to reference tasks in dependencies.

### 3. No Circular Dependencies

The parser validates for circular dependencies and will error if detected.

**Invalid:**
```
Task A :a, after b, 5d
Task B :b, after a, 5d   ← Circular!
```

### 4. Status Comes Before Alias

```mermaid
gantt
    dateFormat YYYY-MM-DD

    Correct :done, t1, 2024-01-01, 5d
```

**Invalid:**
```
Wrong :t1, done, 2024-01-01, 5d   ← Status after alias
```

### 5. Dates Must Match Format Exactly

If `dateFormat YYYY-MM-DD` is set, dates must be exactly 10 characters: `2024-01-15`

**Invalid with `YYYY-MM-DD` format:**
```
Task :t1, 24-01-15, 5d        ← Wrong year format
Task :t2, 2024-1-15, 5d       ← Missing leading zero
Task :t3, January 15 2024, 5d ← Wrong format entirely
```

### 6. Sections Cannot Be Empty Names

```mermaid
gantt
    section Phase 1
    Task :t1, 2024-01-01, 5d
```

### 7. End Date Must Be After Start Date

The parser validates that `endDate >= startDate` for all tasks.

## Export Format

When exporting from this editor, the Mermaid output follows this structure:

```mermaid
gantt
    title [title if set]
    dateFormat YYYY-MM-DD
    axisFormat [if not default]
    excludes [if any]

    section [Section Name]
    [Task] :[status], [auto-alias], [start/after], [duration]d
```

Auto-generated aliases use the first 3 characters of the task name plus a counter (e.g., `tas1`, `dev2`).

## Error Prevention Checklist

Before outputting a Gantt chart, verify:

- [ ] `gantt` declaration is first line
- [ ] `dateFormat` is specified
- [ ] All task aliases are unique
- [ ] No circular dependencies exist
- [ ] Dependencies reference existing task aliases
- [ ] Durations use valid units (`d`, `w`, `h`)
- [ ] Only ONE dependency per task (no `after a b`)
- [ ] Only ONE status per task (no `done, crit`)
- [ ] Milestones have `0d` duration
- [ ] Sections have non-empty names
- [ ] Status comes before alias in task definition
- [ ] Dates match the specified `dateFormat` exactly

## Quick Reference Card

```
gantt
    title Chart Title
    dateFormat YYYY-MM-DD
    axisFormat %b %d
    excludes weekends
    excludes 2024-12-25

    section Section Name
    Task Name :status, alias, start, duration

    Statuses:   done | active | crit | milestone | (omit for default)
    Start:      YYYY-MM-DD | after alias
    Duration:   Nd | Nw | Nh | YYYY-MM-DD (end date)
```

## Complete Example

```mermaid
gantt
    title Website Redesign Project
    dateFormat YYYY-MM-DD
    axisFormat %b %d
    excludes weekends

    section Discovery
    Stakeholder Interviews  :done, si, 2024-01-08, 5d
    Competitive Analysis    :done, ca, 2024-01-08, 7d
    User Research           :done, ur, after si, 10d
    Discovery Complete      :milestone, disc, after ur, 0d

    section Design
    Information Architecture:done, ia, after disc, 5d
    Wireframes              :active, wire, after ia, 10d
    Visual Design           :vis, after wire, 15d
    Design System           :ds, after wire, 12d
    Prototype               :proto, after vis, 8d
    Design Approval         :milestone, dapp, after proto, 0d

    section Development
    Environment Setup       :env, after ia, 3d
    Frontend Development    :front, after dapp, 30d
    Backend Development     :back, after dapp, 25d
    CMS Integration         :cms, after back, 10d

    section Testing and Launch
    QA Testing              :qa, after front, 10d
    Performance Tuning      :perf, after qa, 5d
    Content Migration       :content, after cms, 15d
    UAT                     :uat, after perf, 5d
    Launch Prep             :crit, launch, after uat, 3d
    Go Live                 :milestone, golive, after launch, 0d

    section Post Launch
    Monitoring              :monitor, after golive, 14d
    Bug Fixes               :bugs, after golive, 14d
    Project Closure         :milestone, close, after monitor, 0d
```

---

*This guide is tailored for the Mermaid Gantt parser in this project. Some standard Mermaid features (combined statuses, multiple dependencies, minute durations, tickInterval) are not supported.*
